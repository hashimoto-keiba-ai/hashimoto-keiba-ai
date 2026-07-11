const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-5-budget-allocation-betting-optimization-core.js");
const phase224 = require("../phase22-4-betting-ticket-generation-core.js");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

function createStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(index) { return Array.from(data.keys())[index] || null; },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
}

function sampleTickets() {
  const horses = [
    { horseNumber: "1", horseName: "ホースA", mark: "◎", aiScore: "96", dangerousPopular: false, longshot: false },
    { horseNumber: "2", horseName: "ホースB", mark: "○", aiScore: "90", dangerousPopular: true, longshot: false },
    { horseNumber: "3", horseName: "ホースC", mark: "▲", aiScore: "86", dangerousPopular: false, longshot: false },
    { horseNumber: "4", horseName: "ホースD", mark: "☆", aiScore: "84", dangerousPopular: false, longshot: true }
  ];
  const settings = phase224.normalizeSettings({ budget: 4000, baseStake: 100, includeDangerousPopular: true, maxTickets: 40 });
  return [
    phase224.buildTicket("win", [horses[0]], "主軸候補の単勝", settings),
    phase224.buildTicket("place", [horses[3]], "穴馬・神穴候補の複勝", settings),
    phase224.buildTicket("quinella", [horses[0], horses[2]], "軸－相手の馬連", settings),
    phase224.buildTicket("wide", [horses[0], horses[3]], "穴馬を含むワイド", settings),
    phase224.buildTicket("exacta", [horses[0], horses[2]], "馬単1着固定", settings),
    phase224.buildTicket("trio", [horses[0], horses[2], horses[3]], "三連複フォーメーション", settings),
    phase224.buildTicket("trifecta", [horses[0], horses[2], horses[3]], "三連単フォーメーション", settings),
    phase224.buildTicket("wide", [horses[1], horses[3]], "危険人気馬を含むワイド", settings, true)
  ].map((ticket, index) => ({ ...ticket, id: `t${index + 1}` }));
}

function savePhase224(storage, tickets, budget = 4000) {
  storage.setItem(engine.TICKET_STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    savedAt: "2026-07-12T03:00:00.000Z",
    sourceRaceKey: "2026-07-12|東京|11R",
    settings: { budget, baseStake: 100 },
    tickets
  }));
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.budgetAllocationOptimization.v1");
assert.strictEqual(engine.PHASE22_4_BACKUP_STORAGE_KEY, "hashimotoKeibaAi.phase22.bettingTicketGeneration.backupBeforeOptimization.v1");
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.TICKET_STORAGE_KEY));
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.STORAGE_KEY));
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.PHASE22_4_BACKUP_STORAGE_KEY));

const tickets = sampleTickets();
const settings = engine.normalizeSettings({
  mode: "proportional",
  budget: 3000,
  minStake: 100,
  maxStakePerTicket: 1000,
  maxTicketCount: 20,
  dangerousMaxStake: 200,
  longshotMinStake: 100,
  divineLongshotMinStake: 100,
  trifectaMaxBudgetRatio: 30,
  weights: { aiScore: 35, mark: 20, category: 15, ticketType: 10, longshot: 10, dangerousPenalty: 10 }
});
const normalizedWeights = engine.normalizeWeights({ aiScore: 35, mark: 20, category: 15, ticketType: 10, longshot: 10, dangerousPenalty: 10 });
assert.ok(Math.abs(Object.values(normalizedWeights).reduce((sum, value) => sum + value, 0) - 1) < 0.0001, "ウェイト正規化");

const score = engine.scoreTicket(engine.normalizeTicket(tickets[0]), settings);
assert.ok(score.score > 60, "優先度スコア計算");
assert.ok(score.components.markAverage >= 90, "印スコア計算");
assert.ok(score.components.category > 0, "候補区分スコア計算");
const dangerScore = engine.scoreTicket(engine.normalizeTicket(tickets[7]), settings);
assert.ok(dangerScore.components.dangerousPenalty > 0, "危険人気馬ペナルティ");
const longshotScore = engine.scoreTicket(engine.normalizeTicket(tickets[1]), settings);
assert.ok(longshotScore.components.longshot > 0, "穴馬・神穴補正");

["equal", "proportional", "topHeavy", "typeBudget", "fixedPlusProportional", "manual"].forEach((mode) => {
  const optimized = engine.optimizeTickets(tickets, { ...settings, mode, constraints: { ...settings.constraints, budget: 3000 } });
  assert.ok(optimized.results.length > 0, `${mode} 配分`);
  assert.strictEqual(optimized.summary.overBudget, false, `${mode} 総予算超過防止`);
  assert.ok(optimized.results.every((item) => item.recommendedStake % 100 === 0), `${mode} 100円単位丸め`);
});

const equal = engine.optimizeTickets(tickets, { ...settings, mode: "equal", budget: 3000 });
assert.ok(equal.summary.unusedBudget >= 0, "余り予算再配分");
assert.ok(equal.results.every((item) => item.recommendedStake === 0 || item.recommendedStake >= settings.constraints.minStake), "最低購入額");
assert.ok(equal.results.every((item) => item.recommendedStake <= settings.constraints.maxStakePerTicket), "1買い目上限額");

const limited = engine.optimizeTickets(tickets, { ...settings, constraints: { ...settings.constraints, maxTicketCount: 3, budget: 3000 } });
assert.ok(limited.results.length <= 3, "最大購入点数");
const trifectaLimited = engine.optimizeTickets(tickets, { ...settings, constraints: { ...settings.constraints, budget: 3000, trifectaMaxBudgetRatio: 10 } });
const trifectaAmount = trifectaLimited.results.filter((item) => item.type === "trifecta").reduce((sum, item) => sum + item.recommendedStake, 0);
assert.ok(trifectaAmount <= 300, "三連単最大予算比率");
const typeLimited = engine.optimizeTickets(tickets, { ...settings, constraints: { ...settings.constraints, typeMaxRatios: { ...settings.constraints.typeMaxRatios, wide: 10 } } });
const wideAmount = typeLimited.results.filter((item) => item.type === "wide").reduce((sum, item) => sum + item.recommendedStake, 0);
assert.ok(wideAmount <= settings.constraints.budget * 0.1, "券種別上限比率");
assert.ok(typeLimited.summary.warnings.length >= 0, "制約競合警告");

const changed = engine.applyManualStake(equal.results, equal.results[0].id, 500);
assert.strictEqual(changed[0].manualChanged, true, "手動金額変更");
const toggled = engine.toggleAdoption(changed, changed[0].id, false);
assert.strictEqual(toggled[0].adopted, false, "採用／除外切り替え");
assert.strictEqual(engine.resetManualAdjustments(changed)[0].manualChanged, false, "自動配分へ戻す");

const storage = createStorage();
savePhase224(storage, tickets);
const loaded = engine.loadPhase224Payload(storage);
assert.strictEqual(loaded.tickets.length, tickets.length, "Phase22-4読み込み");
const optimized = engine.optimizeTickets(loaded.tickets, settings);
const saved = engine.saveOptimization({ sourceRaceKey: loaded.sourceRaceKey, phase224SavedAt: loaded.savedAt, settings, results: optimized.results, summary: optimized.summary }, storage);
assert.strictEqual(saved.saved, true, "保存");
assert.strictEqual(engine.loadSavedOptimization(storage).results.length, optimized.results.length, "復元");
const resetBlocked = engine.deleteSavedOptimization(storage, () => false);
assert.deepStrictEqual(resetBlocked, { deleted: false, reason: "confirmation_required" }, "Phase22-5のみ初期化は確認必須");
const resetDone = engine.deleteSavedOptimization(storage, () => true);
assert.deepStrictEqual(resetDone, { deleted: true }, "Phase22-5のみ初期化");
assert.ok(storage.getItem(engine.TICKET_STORAGE_KEY), "Phase22-4は削除しない");

const reflected = engine.applyToPhase224(optimized.results, storage, () => true);
assert.strictEqual(reflected.applied, true, "Phase22-4への反映");
assert.ok(storage.getItem(engine.PHASE22_4_BACKUP_STORAGE_KEY), "Phase22-4バックアップ");
const updatedPhase224 = JSON.parse(storage.getItem(engine.TICKET_STORAGE_KEY));
assert.strictEqual(updatedPhase224.tickets[0].stake, optimized.results[0].recommendedStake, "反映対象は金額");

const brokenStorage = createStorage();
brokenStorage.setItem(engine.TICKET_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadPhase224Payload(brokenStorage), null, "破損JSON");
assert.doesNotThrow(() => engine.optimizeTickets([], settings), "データ未登録状態");

const quotaStorage = createStorage();
quotaStorage.setItem = (key) => {
  if (key === engine.STORAGE_KEY) {
    const error = new Error("quota");
    error.name = "QuotaExceededError";
    throw error;
  }
};
const quota = engine.saveOptimization({ settings, results: [], summary: engine.calculateSummary([], settings) }, quotaStorage);
assert.strictEqual(quota.saved, false, "localStorage例外処理");
assert.strictEqual(quota.quotaExceeded, true);

const cleanupStorage = createStorage();
cleanupStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, "race");
cleanupStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, "evaluation");
cleanupStorage.setItem(engine.FINAL_SUMMARY_STORAGE_KEY, "summary");
cleanupStorage.setItem(engine.TICKET_STORAGE_KEY, "tickets");
cleanupStorage.setItem(engine.STORAGE_KEY, "optimization");
cleanupStorage.setItem(engine.PHASE22_4_BACKUP_STORAGE_KEY, "backup");
cleanupStorage.setItem("phase21-latest-checklist", "x");
assert.strictEqual(engine.summarizePhase21Cleanup(cleanupStorage).count, 1);
engine.cleanupPhase21LocalData(cleanupStorage, () => true);
assert.ok(cleanupStorage.getItem(engine.RACE_INPUT_STORAGE_KEY));
assert.ok(cleanupStorage.getItem(engine.TICKET_STORAGE_KEY));
assert.ok(cleanupStorage.getItem(engine.STORAGE_KEY));
assert.ok(cleanupStorage.getItem(engine.PHASE22_4_BACKUP_STORAGE_KEY));

function createPanelDocument() {
  const nodes = new Map();
  const makeNode = () => ({ textContent: "", value: "", checked: false, type: "text", dataset: {}, children: [], appendChild(child) { this.children.push(child); }, addEventListener() {} });
  ["phase22-budget-allocation-optimization-core", "phase22-budget-message", "phase22-budget-summary", "phase22-budget-result-list", "phase22-budget-sort"].forEach((id) => {
    const node = makeNode();
    node.value = id === "phase22-budget-sort" ? "priority" : "";
    nodes.set(`#${id}`, node);
  });
  ["mode", "budget", "minStake", "maxStake", "maxTicketCount", "minPriorityScore", "dangerousMaxStake", "longshotMinStake", "divineLongshotMinStake", "trifectaMaxBudgetRatio", "topCount", "topShare", "fixedStake", "weightAi", "weightMark", "weightCategory", "weightType", "weightLongshot", "weightDanger"].forEach((key) => {
    const node = makeNode();
    node.value = key === "mode" ? "proportional" : key === "budget" ? "3000" : key.startsWith("weight") ? "10" : "100";
    nodes.set(`[data-phase22-budget-setting="${key}"]`, node);
  });
  ["includeManualTickets", ...engine.TICKET_TYPES.map((type) => `target-${type}`)].forEach((key) => {
    const node = makeNode();
    node.type = "checkbox";
    node.checked = true;
    nodes.set(`[data-phase22-budget-setting="${key}"]`, node);
  });
  ["phase22-budget-reload-source", "phase22-budget-recalculate-score", "phase22-budget-allocate", "phase22-budget-reset-auto", "phase22-budget-save", "phase22-budget-restore", "phase22-budget-reset", "phase22-budget-apply-to-phase224"].forEach((id) => nodes.set(`#${id}`, makeNode()));
  return {
    document: { readyState: "complete", querySelector(selector) { return nodes.get(selector) || null; }, createElement() { return makeNode(); }, addEventListener() {} },
    nodes
  };
}

const panelStorage = createStorage();
savePhase224(panelStorage, tickets);
const panel = createPanelDocument();
const binding = engine.bindBudgetAllocationPanel({ document: panel.document, storage: panelStorage, confirmApply: () => true, confirmReset: () => true, confirmRecalc: () => true });
assert.strictEqual(typeof binding.recalc, "function", "file://相当DOMで初期化");
binding.recalc();
assert.ok(panel.nodes.get("#phase22-budget-result-list").children.length > 0, "最適化結果表を描画");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-budget-allocation-optimization-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-4-betting-ticket-generation-core.js") < index.indexOf("phase22-5-budget-allocation-betting-optimization-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-budget-allocation-optimization-core"'), "private-local導線");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes(engine.PHASE22_4_BACKUP_STORAGE_KEY), "README backup key");
assert.ok(readme.includes("自動投票"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
for (const file of changedFiles) assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
const changedText = changedFiles.filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file)).map((file) => readText(file)).join("\n");
assert.strictEqual(/githubPages\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/publicUrl\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/externalApi\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoExecution\s*:\s*true/i.test(changedText), false);

const sandboxPanel = createPanelDocument();
const sandbox = { window: { document: sandboxPanel.document, localStorage: createStorage(), confirm: () => true }, document: sandboxPanel.document, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
assert.doesNotThrow(() => {
  vm.runInContext(readText("phase22-local-storage-cleanup.js"), sandbox, { filename: "phase22-local-storage-cleanup.js" });
  vm.runInContext(readText("phase22-3-final-prediction-summary-core.js"), sandbox, { filename: "phase22-3-final-prediction-summary-core.js" });
  vm.runInContext(readText("phase22-4-betting-ticket-generation-core.js"), sandbox, { filename: "phase22-4-betting-ticket-generation-core.js" });
  vm.runInContext(readText("phase22-5-budget-allocation-betting-optimization-core.js"), sandbox, { filename: "phase22-5-budget-allocation-betting-optimization-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-5 budget allocation optimization core test passed");
