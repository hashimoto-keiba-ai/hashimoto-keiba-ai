const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-7-actual-result-input-reconciliation-core.js");
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
  return [
    { id: "win-1", type: "win", typeLabel: "単勝", combination: "1", horseNumbers: ["1"], plannedStake: 500, finalConfirmationState: "confirmed" },
    { id: "place-3", type: "place", typeLabel: "複勝", combination: "3", horseNumbers: ["3"], plannedStake: 300, longshot: true, finalConfirmationState: "confirmed" },
    { id: "quinella-1-2", type: "quinella", typeLabel: "馬連", combination: "1-2", horseNumbers: ["1", "2"], plannedStake: 200, dangerousPopular: true, finalConfirmationState: "confirmed" },
    { id: "wide-1-3", type: "wide", typeLabel: "ワイド", combination: "1-3", horseNumbers: ["1", "3"], plannedStake: 200, finalConfirmationState: "confirmed" },
    { id: "exacta-1-2", type: "exacta", typeLabel: "馬単", combination: "1-2", horseNumbers: ["1", "2"], plannedStake: 200, finalConfirmationState: "confirmed" },
    { id: "trio-1-2-3", type: "trio", typeLabel: "三連複", combination: "1-2-3", horseNumbers: ["1", "2", "3"], plannedStake: 200, finalConfirmationState: "confirmed" },
    { id: "trifecta-1-2-3", type: "trifecta", typeLabel: "三連単", combination: "1-2-3", horseNumbers: ["1", "2", "3"], plannedStake: 200, divineLongshot: true, finalConfirmationState: "confirmed" },
    { id: "bracket", type: "bracketQuinella", typeLabel: "枠連", combination: "1-2", horseNumbers: ["1", "2"], plannedStake: 100, finalConfirmationState: "confirmed" }
  ];
}

function sampleFinalPlan() {
  const tickets = sampleTickets();
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T09:00:00.000Z",
    sourceRaceKey: "2026-07-12|東京|11R",
    finalized: true,
    confirmedAt: "2026-07-12T09:05:00.000Z",
    confirmerName: "Owner",
    confirmationStates: Object.fromEntries(tickets.map((ticket) => [ticket.id, "confirmed"])),
    phase225Snapshot: { savedAt: "2026-07-12T08:00:00.000Z", sourceRaceKey: "2026-07-12|東京|11R", finalized: true, tickets, results: tickets }
  };
}

function saveRace(storage, raceId = "2026-07-12|東京|11R") {
  storage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    race: { raceDate: "2026-07-12", racecourse: "東京", raceNumber: "11R", raceName: "テストS", distance: "芝1600", course: "芝", startTime: "15:45", raceId },
    horses: [{ horseNumber: "1", horseName: "ホースA" }, { horseNumber: "2", horseName: "ホースB" }, { horseNumber: "3", horseName: "ホースC" }]
  }));
}

function saveFinalPlan(storage, payload = sampleFinalPlan()) {
  storage.setItem(engine.FINAL_PURCHASE_PLAN_STORAGE_KEY, JSON.stringify(payload));
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.actualResultReconciliation.v1");
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.RACE_INPUT_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.FINAL_PURCHASE_PLAN_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.STORAGE_KEY));

const storage = createStorage();
saveRace(storage);
saveFinalPlan(storage);
const raceLoad = engine.loadRaceInput(storage);
assert.strictEqual(raceLoad.race.racecourse, "東京", "Phase22-1レース情報読込");
const finalLoad = engine.loadFinalPurchasePlan(storage);
assert.strictEqual(finalLoad.plan.tickets.length, 8, "Phase22-6データ読込");

const raceResult = engine.normalizeRaceResult({ first: "1", second: "2", third: "3", fourth: "4", fifth: "5", official: true, placeTargetCount: 3, wideTargetCount: 3 });
assert.deepStrictEqual(engine.validateRaceResult(engine.normalizeRaceResult({ first: "1", second: "1", third: "3" })), ["着順重複があります。同着の場合は同着情報を有効にしてください。"], "着順重複防止");
assert.deepStrictEqual(engine.validateRaceResult(engine.normalizeRaceResult({ first: "1", second: "1", third: "3", deadHeat: true })), [], "同着対応");

const purchases = engine.createPurchasesFromPlan(finalLoad.plan);
assert.strictEqual(engine.judgeTicket(purchases[0], raceResult).status, "hit", "単勝的中判定");
assert.strictEqual(engine.judgeTicket(purchases[1], raceResult).status, "hit", "複勝的中判定");
assert.strictEqual(engine.judgeTicket(purchases[2], raceResult).status, "hit", "馬連的中判定");
assert.strictEqual(engine.judgeTicket(purchases[3], raceResult).status, "hit", "ワイド的中判定");
assert.strictEqual(engine.judgeTicket(purchases[4], raceResult).status, "hit", "馬単的中判定");
assert.strictEqual(engine.judgeTicket(purchases[5], raceResult).status, "hit", "三連複的中判定");
assert.strictEqual(engine.judgeTicket(purchases[6], raceResult).status, "hit", "三連単的中判定");
assert.strictEqual(engine.judgeTicket({ ...purchases[4], horseNumbers: ["2", "1"] }, raceResult).status, "miss", "順不同と順序指定の違い");
assert.strictEqual(engine.judgeTicket(purchases[7], raceResult).status, "unknown", "判定不能処理");

const payouts = [
  { type: "win", combination: "1", amountPer100: 250, unit: 100 },
  { type: "place", combination: "3", amountPer100: 180, unit: 100 },
  { type: "quinella", combination: "2-1", amountPer100: 700, unit: 100 },
  { type: "wide", combination: "3-1", amountPer100: 320, unit: 100 },
  { type: "exacta", combination: "1-2", amountPer100: 1000, unit: 100 },
  { type: "trio", combination: "3-2-1", amountPer100: 1500, unit: 100 },
  { type: "trifecta", combination: "1-2-3", amountPer100: 5000, unit: 100 }
].map(engine.normalizePayout);
const refunds = [engine.normalizeRefund({ type: "bracketQuinella", combination: "1-2", amount: 100, reason: "枠連判定不能の返還記録" })];
const reconciled = engine.reconcilePurchases(purchases, raceResult, payouts, refunds);
assert.strictEqual(reconciled[0].payoutTotal, 1250, "払戻計算");
assert.strictEqual(reconciled[7].refundTotal, 100, "返還計算");
const summary = engine.buildSummary(reconciled);
assert.strictEqual(summary.actualAmount, 1900, "実購入額集計");
assert.ok(summary.payoutTotal > 0, "払戻総額");
assert.strictEqual(summary.totalReceived, summary.payoutTotal + summary.refundTotal, "総受取額");
assert.strictEqual(summary.profit, summary.totalReceived - summary.actualAmount, "収支");
assert.ok(summary.roi > 0, "回収率");
assert.ok(summary.hitRate > 0, "的中率");
assert.ok(summary.byType.win.purchaseAmount > 0, "券種別集計");
assert.strictEqual(summary.plannedActualDifference, 0, "予定と実績の差異");
assert.ok(summary.dangerous.count > 0, "危険人気馬成績");
assert.ok(summary.longshot.count > 0, "穴馬・神穴候補成績");

const checklistIncomplete = engine.normalizeChecklist({ raceInfo: true });
assert.strictEqual(engine.checklistStatus(checklistIncomplete).complete, false, "チェックリスト判定");
const checklistComplete = engine.normalizeChecklist(Object.fromEntries(engine.CHECKLIST_ITEMS.map(([id]) => [id, true])));
assert.strictEqual(engine.checklistStatus(checklistComplete).complete, true, "チェックリスト完了");

const plan = engine.normalizePlan({ raceResult, payouts, refunds, purchases, checklist: checklistComplete, resultStatus: "reconciled", confirmerName: "Owner" }, finalLoad.plan);
const warnings = engine.buildWarnings({ race: raceLoad.race, finalPlan: finalLoad.plan, plan, reconciled, summary });
assert.ok(warnings.some((warning) => warning.message.includes("危険人気馬")), "警告集約");
const resolved = reconciled.filter((item) => item.type !== "bracketQuinella");
const resolvedSummary = engine.buildSummary(resolved);
const finalPlanNoBracket = { ...finalLoad.plan, tickets: finalLoad.plan.tickets.filter((item) => item.type !== "bracketQuinella") };
const resolvedPlan = engine.normalizePlan({ raceResult, payouts, refunds: [], purchases: purchases.filter((item) => item.type !== "bracketQuinella"), checklist: checklistComplete, resultStatus: "reconciled", confirmerName: "Owner" }, finalPlanNoBracket);
const resolvedWarnings = engine.buildWarnings({ race: raceLoad.race, finalPlan: finalPlanNoBracket, plan: resolvedPlan, reconciled: resolved, summary: resolvedSummary });
assert.strictEqual(engine.canFinalize({ plan: resolvedPlan, reconciled: resolved, warnings: resolvedWarnings }).ok, true, "実績確定成功条件");
const finalized = engine.finalizeActualResult(resolvedPlan, { plan: resolvedPlan, reconciled: resolved, warnings: resolvedWarnings }, "Owner", () => true);
assert.strictEqual(finalized.finalized, true, "実績確定成功");
const failedPlan = engine.normalizePlan({ raceResult, payouts, refunds, purchases, checklist: checklistIncomplete, resultStatus: "reconciled", confirmerName: "Owner" }, finalLoad.plan);
const failed = engine.finalizeActualResult(failedPlan, { plan: failedPlan, reconciled, warnings }, "Owner", () => true);
assert.strictEqual(failed.finalized, false, "実績確定失敗");
assert.strictEqual(engine.unfinalizeActualResult(finalized.plan, () => true).unlocked, true, "確定解除");

const payload = engine.buildPayload({ plan: finalized.plan, finalPlan: finalPlanNoBracket, reconciled: resolved, summary: resolvedSummary });
assert.strictEqual(engine.saveActualResult(payload, storage).saved, true, "保存");
assert.strictEqual(engine.loadSavedActualResult(storage, finalLoad.plan).plan.finalized, true, "復元");
assert.strictEqual(engine.deleteSavedActualResult(storage, () => false).deleted, false, "Phase22-7のみ初期化は確認必須");
assert.strictEqual(engine.deleteSavedActualResult(storage, () => true).deleted, true, "Phase22-7のみ初期化");
assert.ok(storage.getItem(engine.RACE_INPUT_STORAGE_KEY), "Phase22-1は削除しない");
assert.ok(storage.getItem(engine.FINAL_PURCHASE_PLAN_STORAGE_KEY), "Phase22-6は削除しない");

const brokenStorage = createStorage();
brokenStorage.setItem(engine.FINAL_PURCHASE_PLAN_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadFinalPurchasePlan(brokenStorage).parseError, true, "破損JSON");
assert.doesNotThrow(() => engine.reconcilePurchases([], engine.normalizeRaceResult(), [], []), "データ未登録状態");

const mismatchRace = engine.loadRaceInput((() => {
  const s = createStorage();
  saveRace(s, "other-race");
  return s;
})()).race;
assert.ok(engine.buildWarnings({ race: mismatchRace, finalPlan: finalLoad.plan, plan, reconciled, summary }).some((warning) => warning.message.includes("raceId")), "raceId不一致");
const changedPlan = engine.normalizePlan({ phase226Snapshot: { savedAt: "old", finalized: false, tickets: [{ id: "old", type: "win", combination: "9", plannedStake: 100 }] } }, finalLoad.plan);
assert.ok(engine.detectPhase226Changes(finalLoad.plan, changedPlan).length > 0, "Phase22-6更新検知");

const plain = engine.generatePlainText({ race: raceLoad.race, plan: finalized.plan, reconciled: resolved, summary: resolvedSummary, warnings: resolvedWarnings });
assert.ok(plain.includes("Phase22-7 実績結果入力・照合"), "プレーンテキスト生成");
assert.ok(plain.includes("公式結果と必ず照合"), "公式照合明記");

const quotaStorage = createStorage();
quotaStorage.setItem = () => {
  const error = new Error("quota");
  error.name = "QuotaExceededError";
  throw error;
};
assert.strictEqual(engine.saveActualResult(payload, quotaStorage).quotaExceeded, true, "localStorage例外処理");

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
    "phase22-actual-result-reconciliation-core",
    "phase22-actual-message",
    "phase22-actual-finalized-status",
    "phase22-actual-race-summary",
    "phase22-actual-summary",
    "phase22-actual-warning-list",
    "phase22-actual-checklist",
    "phase22-actual-checklist-status",
    "phase22-actual-payout-list",
    "phase22-actual-reconciliation-list",
    "phase22-actual-text-output",
    "phase22-actual-confirmer",
    "phase22-actual-result-status"
  ].forEach((id) => nodes.set(`#${id}`, makeNode()));
  ["reload", "save", "restore", "reset", "finalize", "unlock", "print", "text", "copy"].forEach((id) => nodes.set(`#phase22-actual-${id}`, makeNode()));
  engine.MEMO_KEYS.forEach((key) => nodes.set(`[data-phase22-actual-memo="${key}"]`, makeNode()));
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
saveFinalPlan(panelStorage);
const panel = createPanelDocument();
const binding = engine.bindActualResultPanel({ document: panel.document, storage: panelStorage, confirmReset: () => true, confirmFinalize: () => true, confirmUnlock: () => true });
assert.strictEqual(typeof binding.save, "function", "file://相当DOMで初期化");
assert.ok(panel.nodes.get("#phase22-actual-reconciliation-list").children.length > 0, "照合結果を描画");
binding.outputText(false);
assert.ok(panel.nodes.get("#phase22-actual-text-output").value.includes("実績結果入力"), "テキスト出力欄");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-actual-result-reconciliation-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-6-final-purchase-plan-confirmation-core.js") < index.indexOf("phase22-7-actual-result-input-reconciliation-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-actual-result-reconciliation-core"'), "private-local導線");
assert.ok(css.includes(".phase22-actual-result-reconciliation-core"), "Phase22-7 CSS");
assert.ok(css.includes("@media print"), "印刷用CSS");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes("Phase22-1 through Phase22-7 flow"), "README連携関係");
assert.ok(readme.includes("自動結果取得ではありません"), "README安全条件");

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
  vm.runInContext(readText("phase22-7-actual-result-input-reconciliation-core.js"), sandbox, { filename: "phase22-7-actual-result-input-reconciliation-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-7 actual result input reconciliation core test passed");
