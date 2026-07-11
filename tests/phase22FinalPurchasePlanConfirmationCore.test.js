const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-6-final-purchase-plan-confirmation-core.js");
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

function samplePhase225() {
  const horses = [
    { horseNumber: "1", horseName: "ホースA", mark: "◎", aiScore: "96", dangerousPopular: false, longshot: false },
    { horseNumber: "2", horseName: "ホースB", mark: "○", aiScore: "90", dangerousPopular: true, longshot: false },
    { horseNumber: "3", horseName: "ホースC", mark: "☆", aiScore: "84", dangerousPopular: false, longshot: true },
    { horseNumber: "4", horseName: "ホースD", mark: "注", aiScore: "81", dangerousPopular: false, longshot: true }
  ];
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T08:00:00.000Z",
    sourceRaceKey: "2026-07-12|東京|11R",
    summary: { budget: 3000, allocatedAmount: 1200, unusedBudget: 1800 },
    results: [
      { id: "t1", rank: 1, type: "win", typeLabel: "単勝", combination: "1", horseNumbers: ["1"], horses: [horses[0]], priorityScore: 95, recommendedStake: 500, allocationReason: "優先度比例配分", adopted: true, warnings: [], constraintWarnings: [] },
      { id: "t2", rank: 2, type: "wide", typeLabel: "ワイド", combination: "1-2", horseNumbers: ["1", "2"], horses: [horses[0], horses[1]], priorityScore: 88, recommendedStake: 300, allocationReason: "危険人気馬警告付き", adopted: true, warnings: ["危険人気馬を含む"], constraintWarnings: [] },
      { id: "t3", rank: 3, type: "trio", typeLabel: "三連複", combination: "1-3-4", horseNumbers: ["1", "3", "4"], horses: [horses[0], horses[2], horses[3]], priorityScore: 82, recommendedStake: 400, allocationReason: "神穴候補を含む", adopted: true, warnings: [], constraintWarnings: ["三連複の券種別上限を確認"] },
      { id: "t4", rank: 4, type: "place", typeLabel: "複勝", combination: "3", horseNumbers: ["3"], horses: [horses[2]], priorityScore: 77, recommendedStake: 0, allocationReason: "除外", adopted: false, warnings: [], constraintWarnings: [] }
    ]
  };
}

function saveRace(storage, raceId = "2026-07-12|東京|11R") {
  storage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    race: {
      raceDate: "2026-07-12",
      racecourse: "東京",
      raceNumber: "11R",
      raceName: "テストステークス",
      distance: "芝1600",
      course: "芝",
      startTime: "15:45",
      trackCondition: "良",
      horseCount: "4",
      raceId
    }
  }));
}

function savePhase225(storage, payload = samplePhase225()) {
  storage.setItem(engine.BUDGET_OPTIMIZATION_STORAGE_KEY, JSON.stringify(payload));
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.finalPurchasePlanConfirmation.v1");
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.RACE_INPUT_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.BUDGET_OPTIMIZATION_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.STORAGE_KEY));

const storage = createStorage();
saveRace(storage);
savePhase225(storage);
const raceLoad = engine.loadRaceInput(storage);
assert.strictEqual(raceLoad.race.racecourse, "東京", "Phase22-1レース情報読込");
const phase225Load = engine.loadPhase225Optimization(storage);
assert.strictEqual(phase225Load.payload.results.length, 4, "Phase22-5データ読込");
const adopted = phase225Load.payload.results.filter((ticket) => ticket.adopted);
assert.strictEqual(adopted.length, 3, "採用買い目読込");

const plan = engine.normalizePlan({}, adopted);
const aggregates = engine.buildAggregates(adopted, plan.confirmationStates, 3000);
assert.strictEqual(aggregates.totalPoints, 3, "総点数計算");
assert.strictEqual(aggregates.totalAmount, 1200, "総額計算");
assert.strictEqual(aggregates.byType.win.count, 1, "券種別集計");
assert.strictEqual(aggregates.dangerousCount, 1, "危険人気馬集計");
assert.strictEqual(aggregates.longshotCount, 1, "穴馬集計");
assert.strictEqual(aggregates.divineLongshotCount, 1, "神穴集計");
assert.ok(aggregates.maxPriority >= aggregates.averagePriority, "優先度集計");

const excludedPlan = engine.normalizePlan({ confirmationStates: { "t1": "excludePlanned" }, excludePlannedFromTotals: true }, adopted);
assert.strictEqual(engine.buildAggregates(adopted, excludedPlan.confirmationStates, 3000, true).totalAmount, 700, "除外予定の集計除外");
assert.strictEqual(engine.buildAggregates(adopted, excludedPlan.confirmationStates, 3000, false).totalAmount, 1200, "除外予定を含める設定");

const incompleteChecklist = engine.normalizeChecklist({ raceInfo: true });
assert.strictEqual(engine.checklistStatus(incompleteChecklist).complete, false, "チェックリスト未完了判定");
const completeChecklist = engine.normalizeChecklist(Object.fromEntries(engine.CHECKLIST_ITEMS.map(([id]) => [id, true])));
assert.strictEqual(engine.checklistStatus(completeChecklist).complete, true, "チェックリスト完了判定");

const warnings = engine.buildWarnings({ race: raceLoad.race, tickets: adopted, aggregates, checklist: incompleteChecklist, phase225: phase225Load.payload, savedPlan: plan });
assert.ok(warnings.some((warning) => warning.message.includes("危険人気馬")), "警告集約");
assert.ok(warnings.some((warning) => warning.message.includes("チェックリスト未完了")), "チェックリスト警告");
const overBudget = engine.buildWarnings({ race: raceLoad.race, tickets: adopted, aggregates: engine.buildAggregates(adopted, plan.confirmationStates, 500), checklist: completeChecklist, phase225: phase225Load.payload, savedPlan: plan });
assert.ok(overBudget.some((warning) => warning.message.includes("総予算")), "予算超過警告");
const badUnit = [{ ...adopted[0], recommendedStake: 150 }];
assert.ok(engine.buildWarnings({ race: raceLoad.race, tickets: badUnit, aggregates: engine.buildAggregates(badUnit, {}, 3000), checklist: completeChecklist, phase225: phase225Load.payload, savedPlan: plan }).some((warning) => warning.message.includes("100円単位")), "100円単位警告");
assert.ok(engine.buildWarnings({ race: raceLoad.race, tickets: [], aggregates: engine.buildAggregates([], {}, 3000), checklist: completeChecklist, phase225: phase225Load.payload, savedPlan: plan }).some((warning) => warning.message.includes("買い目0件")), "買い目0件警告");
assert.ok(engine.buildWarnings({ race: raceLoad.race, tickets: [{ ...adopted[0], recommendedStake: 0 }], aggregates: engine.buildAggregates([{ ...adopted[0], recommendedStake: 0 }], {}, 3000), checklist: completeChecklist, phase225: phase225Load.payload, savedPlan: plan }).some((warning) => warning.message.includes("金額0円")), "金額0円警告");

const readyWarnings = engine.buildWarnings({ race: raceLoad.race, tickets: adopted, aggregates, checklist: completeChecklist, phase225: phase225Load.payload, savedPlan: { ...plan, confirmationStates: Object.fromEntries(adopted.map((ticket) => [ticket.id, "confirmed"])) } });
const ready = engine.canFinalize({ tickets: adopted, aggregates, checklist: completeChecklist, warnings: readyWarnings });
assert.strictEqual(ready.ok, true, "最終確定成功条件");
const finalized = engine.finalizePlan({ ...plan, checklist: completeChecklist }, { tickets: adopted, aggregates, checklist: completeChecklist, warnings: readyWarnings }, "Owner", () => true);
assert.strictEqual(finalized.finalized, true, "最終確定成功");
const failFinalize = engine.finalizePlan(plan, { tickets: adopted, aggregates, checklist: incompleteChecklist, warnings }, "Owner", () => true);
assert.strictEqual(failFinalize.finalized, false, "最終確定失敗");
const unlocked = engine.unfinalizePlan(finalized.plan, () => true);
assert.strictEqual(unlocked.unlocked, true, "確定解除");

const payload = engine.buildPayload({ plan: finalized.plan, phase225: phase225Load.payload, aggregates });
const saved = engine.saveFinalPlan(payload, storage);
assert.strictEqual(saved.saved, true, "保存");
assert.strictEqual(engine.loadSavedFinalPlan(storage, adopted).plan.finalized, true, "復元");
assert.strictEqual(engine.deleteSavedFinalPlan(storage, () => false).deleted, false, "Phase22-6のみ初期化は確認必須");
assert.strictEqual(engine.deleteSavedFinalPlan(storage, () => true).deleted, true, "Phase22-6のみ初期化");
assert.ok(storage.getItem(engine.RACE_INPUT_STORAGE_KEY), "Phase22-1は削除しない");
assert.ok(storage.getItem(engine.BUDGET_OPTIMIZATION_STORAGE_KEY), "Phase22-5は削除しない");

const brokenStorage = createStorage();
brokenStorage.setItem(engine.BUDGET_OPTIMIZATION_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadPhase225Optimization(brokenStorage).parseError, true, "破損JSON");
assert.doesNotThrow(() => engine.buildAggregates([], {}, 0), "データ未登録状態");

const mismatchPlan = engine.normalizePlan({ sourceRaceKey: "old-race", phase225Snapshot: { savedAt: "old", results: [{ id: "old", type: "win", combination: "9", recommendedStake: 100 }] } }, adopted);
const changes = engine.detectPhase225Changes(phase225Load.payload, mismatchPlan);
assert.ok(changes.length > 0, "Phase22-5更新検知");
assert.ok(engine.buildWarnings({ race: raceLoad.race, tickets: adopted, aggregates, checklist: completeChecklist, phase225: phase225Load.payload, savedPlan: mismatchPlan }).some((warning) => warning.message.includes("raceId")), "raceId不一致警告");

const textOutput = engine.generatePlainText({ race: raceLoad.race, tickets: adopted, aggregates, warnings: readyWarnings, checklist: completeChecklist, memos: engine.normalizeMemos({ policy: "本命中心" }), plan: finalized.plan });
assert.ok(textOutput.includes("Phase22-6 最終購入計画"), "プレーンテキスト生成");
assert.ok(textOutput.includes("自動購入・自動投票"), "自動投票なし明記");

const quotaStorage = createStorage();
quotaStorage.setItem = () => {
  const error = new Error("quota");
  error.name = "QuotaExceededError";
  throw error;
};
assert.strictEqual(engine.saveFinalPlan(payload, quotaStorage).quotaExceeded, true, "localStorage例外処理");

function createPanelDocument() {
  const nodes = new Map();
  function makeNode() {
    return {
      textContent: "",
      value: "",
      checked: false,
      type: "text",
      dataset: {},
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      addEventListener() {},
      querySelector() { return null; }
    };
  }
  [
    "phase22-final-purchase-plan-confirmation-core",
    "phase22-final-purchase-message",
    "phase22-final-purchase-finalized-status",
    "phase22-final-purchase-race-summary",
    "phase22-final-purchase-summary",
    "phase22-final-purchase-warning-list",
    "phase22-final-purchase-checklist",
    "phase22-final-purchase-checklist-status",
    "phase22-final-purchase-list",
    "phase22-final-purchase-text-output",
    "phase22-final-purchase-confirmer"
  ].forEach((id) => nodes.set(`#${id}`, makeNode()));
  const sort = makeNode();
  sort.value = "priority";
  nodes.set("#phase22-final-purchase-sort", sort);
  const exclude = makeNode();
  exclude.type = "checkbox";
  exclude.checked = true;
  nodes.set("#phase22-final-purchase-exclude-planned", exclude);
  ["reload", "save", "restore", "reset", "finalize", "unlock", "print", "text", "copy"].forEach((id) => nodes.set(`#phase22-final-purchase-${id}`, makeNode()));
  engine.MEMO_KEYS.forEach((key) => {
    const node = makeNode();
    nodes.set(`[data-phase22-final-purchase-memo="${key}"]`, node);
  });
  return {
    document: {
      readyState: "complete",
      querySelector(selector) { return nodes.get(selector) || null; },
      querySelectorAll() { return []; },
      createElement() { return makeNode(); },
      addEventListener() {}
    },
    nodes
  };
}

const panelStorage = createStorage();
saveRace(panelStorage);
savePhase225(panelStorage);
const panel = createPanelDocument();
const binding = engine.bindFinalPurchasePlanPanel({ document: panel.document, storage: panelStorage, confirmReset: () => true, confirmFinalize: () => true, confirmUnlock: () => true });
assert.strictEqual(typeof binding.save, "function", "file://相当DOMで初期化");
assert.ok(panel.nodes.get("#phase22-final-purchase-list").children.length > 0, "最終購入計画一覧を描画");
binding.outputText(false);
assert.ok(panel.nodes.get("#phase22-final-purchase-text-output").value.includes("最終購入計画"), "テキスト出力欄");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-final-purchase-plan-confirmation-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-5-budget-allocation-betting-optimization-core.js") < index.indexOf("phase22-6-final-purchase-plan-confirmation-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-final-purchase-plan-confirmation-core"'), "private-local導線");
assert.ok(css.includes("@media print"), "印刷用CSS");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes("Phase22-1 through Phase22-6 flow"), "README連携関係");
assert.ok(readme.includes("自動購入・自動投票機能ではありません"), "README安全条件");

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
for (const file of changedFiles) assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
const changedText = changedFiles.filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file)).map((file) => readText(file)).join("\n");
assert.strictEqual(/githubPages\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/publicUrl\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/externalApi\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoExecution\s*:\s*true/i.test(changedText), false);

const sandboxPanel = createPanelDocument();
const sandbox = {
  window: { document: sandboxPanel.document, localStorage: createStorage(), confirm: () => true, print() {} },
  document: sandboxPanel.document,
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
assert.doesNotThrow(() => {
  vm.runInContext(readText("phase22-6-final-purchase-plan-confirmation-core.js"), sandbox, { filename: "phase22-6-final-purchase-plan-confirmation-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-6 final purchase plan confirmation core test passed");
