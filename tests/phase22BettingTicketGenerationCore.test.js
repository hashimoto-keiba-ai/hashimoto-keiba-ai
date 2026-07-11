const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-4-betting-ticket-generation-core.js");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

function createStorage() {
  const data = new Map();
  return {
    get length() {
      return data.size;
    },
    key(index) {
      return Array.from(data.keys())[index] || null;
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    }
  };
}

function raceInput() {
  return {
    schemaVersion: 1,
    race: { raceDate: "2026-07-12", racecourse: "東京", raceNumber: "11R", raceName: "Phase22買い目S", surface: "芝", distance: "1600m", trackCondition: "良", fieldSize: 12 },
    horses: [
      { horseNumber: "1", horseName: "ホースA", jockey: "騎手A", odds: "2.4", popularity: "1" },
      { horseNumber: "2", horseName: "ホースB", jockey: "騎手B", odds: "4.1", popularity: "2" },
      { horseNumber: "3", horseName: "ホースC", jockey: "騎手C", odds: "7.2", popularity: "3" },
      { horseNumber: "4", horseName: "ホースD", jockey: "騎手D", odds: "13.3", popularity: "5" },
      { horseNumber: "5", horseName: "ホースE", jockey: "騎手E", odds: "22.8", popularity: "7" },
      { horseNumber: "6", horseName: "ホースF", jockey: "騎手F", odds: "48.8", popularity: "10" }
    ]
  };
}

function predictionEvaluation(input) {
  return {
    schemaVersion: 1,
    sourceRaceKey: "2026-07-12|東京|11R",
    raceSummary: input.race,
    evaluations: [
      { ...input.horses[0], aiScore: "96", mark: "◎", keyCandidate: true, opponentCandidate: false, dangerousPopular: false, longshot: false },
      { ...input.horses[1], aiScore: "90", mark: "○", keyCandidate: false, opponentCandidate: true, dangerousPopular: true, longshot: false },
      { ...input.horses[2], aiScore: "86", mark: "▲", keyCandidate: false, opponentCandidate: true, dangerousPopular: false, longshot: false },
      { ...input.horses[3], aiScore: "80", mark: "△", keyCandidate: false, opponentCandidate: false, dangerousPopular: false, longshot: false },
      { ...input.horses[4], aiScore: "84", mark: "☆", keyCandidate: false, opponentCandidate: true, dangerousPopular: false, longshot: true },
      { ...input.horses[5], aiScore: "77", mark: "注", keyCandidate: false, opponentCandidate: false, dangerousPopular: false, longshot: true }
    ]
  };
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.bettingTicketGeneration.v1");
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.RACE_INPUT_STORAGE_KEY));
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.PREDICTION_EVALUATION_STORAGE_KEY));
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.FINAL_SUMMARY_STORAGE_KEY));
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.STORAGE_KEY));
assert.strictEqual(engine.trifectaRecommendedLimit(10), 8);
assert.strictEqual(engine.trifectaRecommendedLimit(14), 12);
assert.strictEqual(engine.trifectaRecommendedLimit(18), 16);

const storage = createStorage();
const race = raceInput();
const prediction = predictionEvaluation(race);
storage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(race));
storage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, JSON.stringify(prediction));

const aggregate = engine.loadAggregate(storage);
const settings = engine.normalizeSettings({ budget: 1000, baseStake: 100, maxTickets: 120, includeDangerousPopular: true, allowBox: true, applyTrifectaLimit: true });
const tickets = engine.generateTickets(aggregate, settings);
const byType = (type) => tickets.filter((ticket) => ticket.type === type);
assert.ok(byType("win").length > 0, "単勝生成");
assert.ok(byType("place").length > 0, "複勝生成");
assert.ok(byType("quinella").length > 0, "馬連生成");
assert.ok(byType("wide").length > 0, "ワイド生成");
assert.ok(byType("exacta").length > 0, "馬単生成");
assert.ok(byType("trio").length > 0, "三連複生成");
assert.ok(byType("trifecta").length > 0, "三連単生成");
assert.ok(tickets.some((ticket) => ticket.reason.includes("BOX")), "BOX生成");
assert.ok(tickets.some((ticket) => ticket.reason.includes("流し")), "流し生成");
assert.ok(tickets.some((ticket) => ticket.reason.includes("フォーメーション")), "フォーメーション生成");
assert.ok(tickets.some((ticket) => ticket.warnings.some((warning) => warning.includes("危険人気馬"))), "危険人気馬警告");
assert.ok(byType("trifecta").some((ticket) => ticket.warnings.some((warning) => warning.includes("三連単推奨上限"))), "三連単推奨点数警告");

const keys = tickets.map((ticket) => engine.ticketKey(ticket.type, ticket.horses));
assert.strictEqual(new Set(keys).size, keys.length, "重複買い目を除外");
assert.strictEqual(engine.normalizeCombination("quinella", [aggregate.evaluations[1], aggregate.evaluations[0]]).map((horse) => horse.horseNumber).join("-"), "1-2", "馬番順違いを正規化");
assert.strictEqual(engine.normalizeCombination("trio", [aggregate.evaluations[0], aggregate.evaluations[0], aggregate.evaluations[1]]), null, "同一馬重複を防止");

const totals = engine.calculateTotals(tickets.slice(0, 20), { ...settings, budget: 1000 });
assert.strictEqual(totals.totalPoints, 20, "点数計算");
assert.strictEqual(totals.totalAmount, 2000, "金額計算");
assert.strictEqual(totals.overBudget, true, "予算超過警告");
assert.strictEqual(Number.isNaN(totals.totalAmount), false, "NaNを表示しない");

const manualAdded = engine.addManualTicket([], "trio", [aggregate.evaluations[0], aggregate.evaluations[2], aggregate.evaluations[4]], settings);
assert.strictEqual(manualAdded.added, true, "手動追加");
const duplicateManual = engine.addManualTicket(manualAdded.tickets, "trio", [aggregate.evaluations[4], aggregate.evaluations[0], aggregate.evaluations[2]], settings);
assert.strictEqual(duplicateManual.added, false, "同一買い目の重複追加を防止");
assert.strictEqual(engine.addManualTicket([], "trio", [aggregate.evaluations[0], aggregate.evaluations[1]], settings).added, false, "必要頭数不足を拒否");

const saved = engine.saveTickets({ sourceRaceKey: aggregate.sourceRaceKey, settings, tickets: tickets.slice(0, 10) }, storage);
assert.strictEqual(saved.saved, true, "保存");
const restored = engine.loadSavedTickets(storage);
assert.strictEqual(restored.tickets.length, 10, "復元");
assert.strictEqual(restored.settings.baseStake, 100);
const deleteBlocked = engine.deleteSavedTickets(storage, () => false);
assert.deepStrictEqual(deleteBlocked, { deleted: false, reason: "confirmation_required" }, "Phase22-4初期化は確認必須");
assert.ok(storage.getItem(engine.STORAGE_KEY));
const deleteDone = engine.deleteSavedTickets(storage, () => true);
assert.deepStrictEqual(deleteDone, { deleted: true }, "Phase22-4のみ初期化");
assert.strictEqual(storage.getItem(engine.STORAGE_KEY), null);
assert.ok(storage.getItem(engine.RACE_INPUT_STORAGE_KEY), "Phase22-1は削除しない");
assert.ok(storage.getItem(engine.PREDICTION_EVALUATION_STORAGE_KEY), "Phase22-2は削除しない");

const brokenStorage = createStorage();
brokenStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, "{broken");
brokenStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, "{broken");
assert.doesNotThrow(() => engine.loadAggregate(brokenStorage), "破損JSONでも例外なし");
assert.doesNotThrow(() => engine.generateTickets(engine.loadAggregate(createStorage()), engine.defaultSettings()), "データ未登録状態でも例外なし");

const quotaStorage = createStorage();
quotaStorage.setItem = (key) => {
  if (key === engine.STORAGE_KEY) {
    const error = new Error("quota");
    error.name = "QuotaExceededError";
    throw error;
  }
};
const quota = engine.saveTickets({ settings, tickets: tickets.slice(0, 1) }, quotaStorage);
assert.strictEqual(quota.saved, false, "localStorage例外処理");
assert.strictEqual(quota.quotaExceeded, true);

const cleanupStorage = createStorage();
cleanupStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, "race");
cleanupStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, "evaluation");
cleanupStorage.setItem(engine.FINAL_SUMMARY_STORAGE_KEY, "summary");
cleanupStorage.setItem(engine.STORAGE_KEY, "tickets");
cleanupStorage.setItem("phase21-latest-checklist", "x");
cleanupStorage.setItem("phase20-other", "x");
assert.strictEqual(engine.summarizePhase21Cleanup(cleanupStorage).count, 1);
engine.cleanupPhase21LocalData(cleanupStorage, () => true);
assert.strictEqual(cleanupStorage.getItem("phase21-latest-checklist"), null);
assert.ok(cleanupStorage.getItem(engine.RACE_INPUT_STORAGE_KEY));
assert.ok(cleanupStorage.getItem(engine.PREDICTION_EVALUATION_STORAGE_KEY));
assert.ok(cleanupStorage.getItem(engine.FINAL_SUMMARY_STORAGE_KEY));
assert.ok(cleanupStorage.getItem(engine.STORAGE_KEY));
assert.ok(cleanupStorage.getItem("phase20-other"));

function createPanelDocument() {
  const listeners = {};
  const nodes = new Map();
  const makeNode = () => ({
    textContent: "",
    value: "",
    checked: false,
    type: "text",
    dataset: {},
    children: [],
    open: false,
    appendChild(child) { this.children.push(child); },
    addEventListener(event, handler) { this.listener = handler; listeners[this.id || Math.random()] = handler; }
  });
  [
    "phase22-betting-ticket-generation-core", "phase22-ticket-message", "phase22-ticket-total-summary",
    "phase22-ticket-list", "phase22-ticket-phase21-cleanup-summary", "phase22-ticket-bulk-type",
    "phase22-ticket-bulk-stake", "phase22-manual-ticket-type", "phase22-manual-ticket-horses"
  ].forEach((id) => {
    const node = makeNode();
    node.id = id;
    if (id.includes("bulk-type")) node.value = "all";
    if (id.includes("manual-ticket-type")) node.value = "win";
    if (id.includes("bulk-stake")) node.value = "100";
    nodes.set(`#${id}`, node);
  });
  ["budget", "baseStake", "maxTickets"].forEach((key) => {
    const node = makeNode();
    node.type = "number";
    node.value = key === "budget" ? "3000" : key === "maxTickets" ? "80" : "100";
    nodes.set(`[data-phase22-ticket-setting="${key}"]`, node);
  });
  ["includeDangerousPopular", "prioritizeLongshots", "includeDivineLongshots", "allowBox", "applyTrifectaLimit", ...engine.TICKET_TYPES.map((type) => `enabled-${type}`)].forEach((key) => {
    const node = makeNode();
    node.type = "checkbox";
    node.checked = key !== "includeDangerousPopular";
    nodes.set(`[data-phase22-ticket-setting="${key}"]`, node);
  });
  [
    "phase22-refresh-ticket-source", "phase22-generate-tickets", "phase22-save-tickets", "phase22-restore-tickets",
    "phase22-reset-tickets", "phase22-cleanup-phase21-storage-for-tickets", "phase22-apply-bulk-stake", "phase22-add-manual-ticket"
  ].forEach((id) => nodes.set(`#${id}`, makeNode()));
  const document = {
    readyState: "complete",
    querySelector(selector) { return nodes.get(selector) || null; },
    createElement(tag) {
      const node = makeNode();
      node.tag = tag;
      return node;
    },
    addEventListener() {}
  };
  return { document, nodes, listeners };
}

const panelStorage = createStorage();
panelStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(race));
panelStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, JSON.stringify(prediction));
const panel = createPanelDocument();
const binding = engine.bindBettingTicketPanel({ document: panel.document, storage: panelStorage, confirmRegenerate: () => true, confirmReset: () => true });
assert.strictEqual(typeof binding.regenerate, "function", "file://相当DOMで初期化");
binding.regenerate();
assert.ok(panel.nodes.get("#phase22-ticket-list").children.length > 0, "買い目一覧を描画");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-betting-ticket-generation-core"'), "HTML panel exists");
assert.ok(index.indexOf("phase22-3-final-prediction-summary-core.js") < index.indexOf("phase22-4-betting-ticket-generation-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-betting-ticket-generation-core"'), "private-local導線");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes("自動投票"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}
const changedText = changedFiles.filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file)).map((file) => readText(file)).join("\n");
assert.strictEqual(/githubPages\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/publicUrl\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/externalApi\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoExecution\s*:\s*true/i.test(changedText), false);

const sandboxPanel = createPanelDocument();
const sandbox = {
  window: { document: sandboxPanel.document, localStorage: createStorage(), confirm: () => true },
  document: sandboxPanel.document,
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
assert.doesNotThrow(() => {
  vm.runInContext(readText("phase22-local-storage-cleanup.js"), sandbox, { filename: "phase22-local-storage-cleanup.js" });
  vm.runInContext(readText("phase22-3-final-prediction-summary-core.js"), sandbox, { filename: "phase22-3-final-prediction-summary-core.js" });
  vm.runInContext(readText("phase22-4-betting-ticket-generation-core.js"), sandbox, { filename: "phase22-4-betting-ticket-generation-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-4 betting ticket generation core test passed");
