const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-8-learning-candidate-review-summary-core.js");
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

function saveRace(storage, raceId = "2026-07-12|東京|11R") {
  storage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify({
    race: { raceDate: "2026-07-12", racecourse: "東京", raceNumber: "11R", raceName: "テストS", distance: "芝1600", course: "芝", raceId }
  }));
}

function sampleActual(finalized = true) {
  const reconciliation = [
    { id: "win-1", type: "win", typeLabel: "単勝", combination: "1", horseNumbers: ["1"], horseNames: ["ホースA"], marks: ["◎"], aiScores: [96], priorityScore: 95, plannedStake: 500, actualStake: 500, payoutTotal: 1250, refundTotal: 0, totalReceived: 1250, profit: 750, roi: 250, judgement: "hit" },
    { id: "wide-1-3", type: "wide", typeLabel: "ワイド", combination: "1-3", horseNumbers: ["1", "3"], horseNames: ["ホースA", "ホースC"], marks: ["◎", "☆"], aiScores: [96, 84], priorityScore: 82, plannedStake: 300, actualStake: 300, payoutTotal: 0, refundTotal: 0, totalReceived: 0, profit: -300, roi: 0, judgement: "miss", longshot: true, divineLongshot: true },
    { id: "quinella-1-2", type: "quinella", typeLabel: "馬連", combination: "1-2", horseNumbers: ["1", "2"], horseNames: ["ホースA", "ホースB"], marks: ["◎", "○"], aiScores: [96, 90], priorityScore: 88, plannedStake: 200, actualStake: 300, payoutTotal: 0, refundTotal: 0, totalReceived: 0, profit: -300, roi: 0, judgement: "miss", dangerousPopular: true, difference: 100, differenceType: "金額変更", manualChanged: true }
  ];
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T10:00:00.000Z",
    sourceRaceKey: "2026-07-12|東京|11R",
    finalized,
    finalizedAt: finalized ? "2026-07-12T10:05:00.000Z" : "",
    raceResult: { first: "1", second: "4", third: "5", official: true },
    reconciliation,
    finalSummary: {
      plannedPoints: 3,
      actualPoints: 3,
      plannedAmount: 1000,
      actualAmount: 1100,
      hitPoints: 1,
      missPoints: 2,
      unknownPoints: 0,
      payoutTotal: 1250,
      refundTotal: 0,
      totalReceived: 1250,
      profit: 150,
      roi: 113.636,
      hitRate: 33.333,
      plannedActualDifference: 100
    },
    memos: { learningCandidate: "穴馬の扱いを確認" }
  };
}

function saveActual(storage, actual = sampleActual()) {
  storage.setItem(engine.ACTUAL_RESULT_STORAGE_KEY, JSON.stringify(actual));
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.learningCandidateReviewSummary.v1");
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.ACTUAL_RESULT_STORAGE_KEY));
assert.ok(engine.PROTECTED_STORAGE_KEYS.includes(engine.STORAGE_KEY));

const storage = createStorage();
saveRace(storage);
saveActual(storage);
const sources = engine.loadAllSources(storage);
assert.strictEqual(sources.actualResult.finalized, true, "Phase22-7データ読込");
const summary = engine.buildReviewSummary(sources);
assert.strictEqual(summary.hitTickets.length, 1, "的中買い目集約");
assert.strictEqual(summary.missedTickets.length, 2, "不的中買い目集約");
assert.strictEqual(summary.profit, 150, "振り返りサマリー集約");

const metrics = engine.buildComparisonMetrics(sources);
assert.ok(metrics.aiRankDiff.length >= 3, "AI評価順位と着順差");
assert.ok(metrics.markStats.length > 0, "印別集計");
assert.ok(metrics.categoryStats.dangerousPopular.count > 0, "候補区分別集計");
assert.strictEqual(metrics.dangerousSuccessRate, 100, "危険人気馬判定評価");
assert.strictEqual(metrics.longshotSuccessRate, 0, "穴馬判定評価");
assert.strictEqual(metrics.divineLongshotSuccessRate, 0, "神穴候補判定評価");
assert.ok(metrics.typeRoi.some((row) => row.label === "単勝" && row.roi > 0), "券種別回収率");
assert.ok(metrics.priorityBandRoi.length > 0, "優先度帯別回収率");
assert.ok(metrics.stakeBandRoi.length > 0, "金額帯別回収率");
assert.strictEqual(metrics.plannedActualImpact, 100, "予定購入と実購入の差額影響");

const candidates = engine.generateLearningCandidates(sources, metrics);
assert.ok(candidates.length >= 4, "自動抽出候補生成");
assert.strictEqual(new Set(candidates.map((candidate) => candidate.id)).size, candidates.length, "候補重複防止");
const approved = engine.setCandidateApproval(candidates, candidates[0].id, "candidate", "採用方向");
assert.strictEqual(approved[0].approvalStatus, "candidate", "承認状態変更");

const categoryReviews = engine.normalizeCategoryReviews({
  aiScore: { rating: "good", importance: "high", good: "本命的中", improvement: "相手評価", evidence: "単勝的中", nextAction: "相手精度を確認", learningCandidate: true }
});
assert.strictEqual(categoryReviews.aiScore.good, "本命的中", "カテゴリ別振り返り保存");
const actions = engine.normalizeActions([{ body: "相手候補の条件を見直す", category: "相手馬選定", priority: "high", dueMemo: "次回", nextCheck: "相手抜け確認", done: false, note: "手動確認" }]);
assert.strictEqual(actions[0].priority, "high", "改善アクション保存");

const plan = engine.normalizePlan({
  categoryReviews,
  candidates: candidates.map((candidate) => ({ ...candidate, approvalStatus: "candidate" })),
  overallReview: { overallRating: "4", biggestSuccess: "本命評価", biggestFailure: "相手抜け", topImprovement: "相手候補精度" },
  actions
}, candidates);
const warnings = engine.buildWarnings({ sources, plan, metrics });
assert.ok(warnings.some((warning) => warning.message.includes("予定と実購入")), "警告集約");
assert.strictEqual(engine.canFinalize({ sources, plan, warnings }).ok, true, "学習候補確定成功条件");
const finalized = engine.finalizeReview(plan, { sources, plan, warnings }, "Owner", () => true);
assert.strictEqual(finalized.finalized, true, "学習候補確定成功");

const failedSources = { ...sources, actualResult: { ...sources.actualResult, finalized: false } };
const failed = engine.finalizeReview(plan, { sources: failedSources, plan, warnings: engine.buildWarnings({ sources: failedSources, plan, metrics }) }, "Owner", () => true);
assert.strictEqual(failed.finalized, false, "学習候補確定失敗");
assert.strictEqual(engine.unfinalizeReview(finalized.plan, () => true).unlocked, true, "確定解除");

const payload = engine.buildPayload({ sources, plan: finalized.plan, summary, metrics, warnings });
assert.strictEqual(engine.saveReview(payload, storage).saved, true, "保存");
assert.strictEqual(engine.loadSavedReview(storage, candidates).plan.finalized, true, "復元");
assert.strictEqual(engine.deleteSavedReview(storage, () => false).deleted, false, "Phase22-8のみ初期化は確認必須");
assert.strictEqual(engine.deleteSavedReview(storage, () => true).deleted, true, "Phase22-8のみ初期化");
assert.ok(storage.getItem(engine.ACTUAL_RESULT_STORAGE_KEY), "Phase22-7は削除しない");

const brokenStorage = createStorage();
brokenStorage.setItem(engine.ACTUAL_RESULT_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadAllSources(brokenStorage).parseErrors.actualResult, true, "破損JSON");
assert.doesNotThrow(() => engine.buildReviewSummary(engine.loadAllSources(createStorage())), "データ未登録状態");

const mismatch = createStorage();
saveRace(mismatch, "other-race");
saveActual(mismatch);
const mismatchSources = engine.loadAllSources(mismatch);
assert.ok(engine.buildWarnings({ sources: mismatchSources, plan, metrics }).some((warning) => warning.message.includes("raceId")), "raceId不一致");
const changedPlan = engine.normalizePlan({ phase227Snapshot: { savedAt: "old", sourceRaceKey: "old", finalized: false, finalSummary: { profit: 0, roi: 0, hitRate: 0 } } }, candidates);
assert.ok(engine.detectPhase227Changes(sources.actualResult, changedPlan).length > 0, "Phase22-7更新検知");

const plain = engine.generatePlainText({ sources, summary, metrics, plan: finalized.plan, warnings });
assert.ok(plain.includes("Phase22-8 学習候補・振り返り集約"), "プレーンテキスト生成");
assert.ok(plain.includes("自動学習・自動モデル更新・外部送信は行いません"), "自動学習処理が存在しないこと");

const quotaStorage = createStorage();
quotaStorage.setItem = () => {
  const error = new Error("quota");
  error.name = "QuotaExceededError";
  throw error;
};
assert.strictEqual(engine.saveReview(payload, quotaStorage).quotaExceeded, true, "localStorage例外処理");

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
    "phase22-learning-candidate-review-summary-core",
    "phase22-learning-message",
    "phase22-learning-finalized-status",
    "phase22-learning-summary",
    "phase22-learning-metrics",
    "phase22-learning-warning-list",
    "phase22-learning-category-list",
    "phase22-learning-candidate-list",
    "phase22-learning-text-output",
    "phase22-learning-confirmer"
  ].forEach((id) => nodes.set(`#${id}`, makeNode()));
  ["reload", "save", "restore", "reset", "finalize", "unlock", "print", "text", "copy"].forEach((id) => nodes.set(`#phase22-learning-${id}`, makeNode()));
  Object.keys(engine.normalizeOverallReview()).forEach((key) => nodes.set(`[data-phase22-learning-overall="${key}"]`, makeNode()));
  engine.FINAL_MEMO_KEYS.forEach((key) => nodes.set(`[data-phase22-learning-memo="${key}"]`, makeNode()));
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
saveActual(panelStorage);
const panel = createPanelDocument();
const binding = engine.bindLearningReviewPanel({ document: panel.document, storage: panelStorage, confirmReset: () => true, confirmFinalize: () => true, confirmUnlock: () => true });
assert.strictEqual(typeof binding.save, "function", "file://相当DOMで初期化");
assert.ok(panel.nodes.get("#phase22-learning-candidate-list").children.length > 0, "学習候補一覧を描画");
binding.outputText(false);
assert.ok(panel.nodes.get("#phase22-learning-text-output").value.includes("学習候補"), "テキスト出力欄");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-learning-candidate-review-summary-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-7-actual-result-input-reconciliation-core.js") < index.indexOf("phase22-8-learning-candidate-review-summary-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-learning-candidate-review-summary-core"'), "private-local導線");
assert.ok(css.includes(".phase22-learning-candidate-review-summary-core"), "Phase22-8 CSS");
assert.ok(css.includes("@media print"), "印刷用CSS");
assert.ok(readme.includes(engine.STORAGE_KEY), "README save key");
assert.ok(readme.includes("Phase22-1 through Phase22-8 flow"), "README連携関係");
assert.ok(readme.includes("自動学習ではありません"), "README安全条件");

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
for (const file of changedFiles) assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
const changedText = changedFiles.filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file)).map((file) => readText(file)).join("\n");
assert.strictEqual(/githubPages\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/publicUrl\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/externalApi\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoExecution\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/automaticLearning\s*:\s*true/i.test(changedText), false);

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
  vm.runInContext(readText("phase22-8-learning-candidate-review-summary-core.js"), sandbox, { filename: "phase22-8-learning-candidate-review-summary-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-8 learning candidate review summary core test passed");
