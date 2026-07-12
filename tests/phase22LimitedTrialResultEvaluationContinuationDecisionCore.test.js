const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-16-limited-trial-result-evaluation-continuation-decision-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }
  };
}

function obs(raceKey, anomalyLevel = "none", judgement = "equivalent", observedAt = "2026-07-12T10:00:00") {
  return { raceKey, observedAt, anomalyLevel, judgement, baselinePrediction: "base", trialPrediction: "trial", differenceSummary: judgement, expectedBehavior: "stable", actualBehavior: "stable", resultSummary: judgement };
}

function planStore() {
  return {
    savedAt: "2026-07-12T18:00:00.000Z",
    plans: [
      { planId: "plan-completed", targetApprovalId: "approval-a", targetImprovementRuleId: "rule-a", planStatus: "ready", planDecision: "ready_for_manual_execution", executionStatus: "not_started" },
      { planId: "plan-stopped", targetApprovalId: "approval-b", targetImprovementRuleId: "rule-b", planStatus: "ready", planDecision: "ready_for_manual_execution", executionStatus: "not_started" }
    ]
  };
}

function trialStore() {
  return {
    savedAt: "2026-07-12T18:10:00.000Z",
    trials: [
      { trialId: "trial-completed", sourcePlanId: "plan-completed", targetApprovalId: "approval-a", targetImprovementRuleId: "rule-a", trialName: "completed", trialStatus: "completed", maximumRaceCount: 2, targetRaceKeys: ["R1", "R2"], observationStartDate: "2026-07-12", observationEndDate: "2026-07-20", observations: [obs("R1", "none", "trial_better"), obs("R2", "none", "equivalent")], safety: engine.buildSafety() },
      { trialId: "trial-stopped", sourcePlanId: "plan-stopped", targetApprovalId: "approval-b", targetImprovementRuleId: "rule-b", trialName: "stopped", trialStatus: "stopped", stopReason: "critical", maximumRaceCount: 1, targetRaceKeys: ["S1"], observations: [obs("S1", "critical", "baseline_better")], safety: engine.buildSafety() },
      { trialId: "trial-observing", sourcePlanId: "plan-completed", targetApprovalId: "approval-a", targetImprovementRuleId: "rule-a", trialName: "observing", trialStatus: "observing", observations: [obs("O1")], safety: engine.buildSafety() },
      { trialId: "trial-empty", sourcePlanId: "plan-completed", targetApprovalId: "approval-a", targetImprovementRuleId: "rule-a", trialName: "empty", trialStatus: "completed", observations: [], safety: engine.buildSafety() }
    ]
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.limitedTrialResultEvaluationContinuationDecision.v1");
assert.strictEqual(engine.escapeHtml("<b>&"), "&lt;b&gt;&amp;");

const storage = memoryStorage({
  [engine.PLAN_STORAGE_KEY]: JSON.stringify(planStore()),
  [engine.TRIAL_STORAGE_KEY]: JSON.stringify(trialStore())
});
const plans = engine.loadPlanStore(storage).planStore;
const trials = engine.loadTrialStore(storage).trialStore;
assert.strictEqual(engine.eligibleTrials(trials).length, 2, "completed/stoppedだけ評価対象");

const store = engine.normalizeEvaluationStore({}, trials, plans);
assert.strictEqual(store.evaluations.length, 2, "評価候補生成");
assert.deepStrictEqual(engine.normalizeEvaluationStore({}, trials, plans).evaluations.map((e) => e.evaluationId), store.evaluations.map((e) => e.evaluationId), "決定的ID");
assert.strictEqual(engine.normalizeEvaluationStore({ evaluations: [{ sourceTrialId: "trial-completed" }, { sourceTrialId: "trial-completed" }] }, trials, plans).evaluations.length, 2, "同一試験の重複評価を防止");

const completedEval = store.evaluations.find((e) => e.sourceTrialId === "trial-completed");
const stoppedEval = store.evaluations.find((e) => e.sourceTrialId === "trial-stopped");
assert.ok(completedEval, "completed試験から生成");
assert.ok(stoppedEval, "stopped試験から生成");
assert.strictEqual(engine.buildRecommendedDecision(trials.trials[1], { minimumValidObservationCount: 1 }).recommendedDecision, "stop_required", "critical異常でstop_required");
assert.strictEqual(engine.buildRecommendedDecision({ ...trials.trials[0], observations: [obs("R1", "warning"), obs("R2", "warning")] }).recommendedDecision, "pause_required", "warning上限超過");
assert.strictEqual(engine.buildRecommendedDecision({ ...trials.trials[0], observations: [obs("R1")] }, { minimumValidObservationCount: 2 }).recommendedDecision, "additional_observation_required", "有効観測不足");
assert.strictEqual(engine.buildRecommendedDecision(trials.trials[0]).recommendedDecision, "continue_limited_trial", "正常かつbaseline同等以上");
assert.strictEqual(engine.buildRecommendedDecision({ ...trials.trials[0], observations: [obs("R1", "none", "baseline_better"), obs("R2", "none", "baseline_better")] }).recommendedDecision, "revision_required", "改善効果なし");
assert.strictEqual(completedEval.continuationDecision, "pending", "推奨だけでは最終確定しない");

assert.ok(!engine.validateEvaluationSource({ ...completedEval, sourceTrialId: "trial-observing" }, trials, plans).ok, "未終了試験を拒否");
assert.ok(!engine.validateEvaluationSource({ ...completedEval, sourcePlanId: "missing" }, trials, plans).ok, "元計画なし拒否");
assert.ok(!engine.validateEvaluationSource({ ...completedEval, sourcePlanId: "plan-stopped" }, trials, plans).ok, "sourcePlanId不整合拒否");
assert.ok(!engine.validateEvaluationSource({ ...completedEval, sourceTrialId: "trial-empty" }, trials, plans).ok, "観測記録なし拒否");
assert.ok(!engine.validateEvaluation({ ...completedEval, continuationDecision: "continue_limited_trial" }, trials, plans).ok, "最終判定必須項目なし拒否");
const setResult = engine.setFinalContinuationDecision(completedEval, "continue_limited_trial", "Owner", "継続可", "2026-07-12T19:00:00");
assert.strictEqual(setResult.set, true, "最終判定設定");
assert.ok(engine.validateEvaluation(setResult.evaluation, trials, plans).ok, "最終判定必須項目あり");
const finalized = engine.finalizeEvaluation(setResult.evaluation).evaluation;
assert.strictEqual(finalized.evaluationStatus, "finalized", "finalized");
assert.strictEqual(engine.addEvaluationCheck(finalized, { content: "x" }).added, false, "finalized後の変更拒否");
assert.strictEqual(engine.updateEvaluationCheck(finalized, "check-1", { judgement: "pass" }).updated, false, "finalized後のチェック変更拒否");
assert.strictEqual(engine.transitionEvaluationStatus(finalized, "evaluating").transitioned, false, "終端状態から再開拒否");

const beforePlan = storage.getItem(engine.PLAN_STORAGE_KEY);
const beforeTrial = storage.getItem(engine.TRIAL_STORAGE_KEY);
assert.strictEqual(engine.saveEvaluationStore(storage, { ...store, evaluations: [finalized] }, new Date("2026-07-12T20:00:00.000Z")).saved, true, "保存");
assert.strictEqual(storage.getItem(engine.PLAN_STORAGE_KEY), beforePlan, "元計画非破壊");
assert.strictEqual(storage.getItem(engine.TRIAL_STORAGE_KEY), beforeTrial, "元試験非破壊");
assert.strictEqual(engine.loadEvaluationStore(storage, trials, plans).store.evaluations.length, 2, "復元");
assert.strictEqual(engine.loadEvaluationStore(memoryStorage({ [engine.STORAGE_KEY]: "{broken" }), trials, plans).rejected, true, "破損JSON安全側");
assert.ok(engine.generatePlainText(store).includes("評価専用"), "テキスト安全表示");

const safety = engine.buildSafety();
["planOnly", "protectedMode", "privateLocal", "observationOnly", "shadowMode", "evaluationOnly"].forEach((key) => assert.strictEqual(safety[key], true, key));
["automaticApply", "automaticLearning", "automaticUpdate", "autoExecution", "autoRollback", "autoContinuation", "publicUrl", "githubPages", "externalApi", "predictionMutation", "bettingMutation", "applicationStatusMutation", "ruleActivation", "trialStatusMutation"].forEach((key) => assert.strictEqual(safety[key], false, key));

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-trial-evaluation-decision-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-15-limited-trial-observation-management-core.js") < index.indexOf("phase22-16-limited-trial-result-evaluation-continuation-decision-core.js"), "HTML読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-trial-evaluation-decision-core"'), "private-local導線");
assert.ok(css.includes(".phase22-evaluation-decision-core"), "CSS");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.limitedTrialResultEvaluationContinuationDecision.v1"), "README保存キー");
assert.ok(readme.includes("Phase22-16 is evaluation-only"), "README安全仕様");

function makeNode() {
  return { dataset: {}, children: [], value: "", textContent: "", appendChild(child) { this.children.push(child); return child; }, replaceChildren(...children) { this.children = children; }, addEventListener() {}, set className(value) { this._className = value; }, get className() { return this._className || ""; } };
}
const nodes = new Map();
["#phase22-trial-evaluation-decision-core", "#phase22-evaluation-summary", "#phase22-evaluation-list", "#phase22-evaluation-text-output", "#phase22-evaluation-message", "#phase22-evaluation-reload", "#phase22-evaluation-save", "#phase22-evaluation-text"].forEach((id) => nodes.set(id, makeNode()));
const fakeDocument = { querySelector(selector) { return nodes.get(selector) || null; }, createElement(tag) { const node = makeNode(); node.tagName = tag.toUpperCase(); return node; } };
const panel = engine.bindEvaluationPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "ブラウザ非依存初期化");
panel.actions["#phase22-evaluation-reload"]();
panel.actions["#phase22-evaluation-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-16"), "出力欄");

const sandbox = { window: { document: { readyState: "loading", addEventListener() {} } }, document: { readyState: "loading", addEventListener() {} }, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-16-limited-trial-result-evaluation-continuation-decision-core.js"), sandbox, { filename: "phase22-16-limited-trial-result-evaluation-continuation-decision-core.js" });
assert.ok(sandbox.window.HashimotoPhase2216LimitedTrialEvaluationDecisionCore, "browser global export");

console.log("Phase22-16 limited trial result evaluation continuation decision core test passed");
