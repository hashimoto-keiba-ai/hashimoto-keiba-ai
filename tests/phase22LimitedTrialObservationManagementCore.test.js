const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-15-limited-trial-observation-management-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }
  };
}

function samplePlanStore() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T16:00:00.000Z",
    sourceRaceKey: "2026-07-12東京11R",
    finalized: true,
    plans: [
      {
        planId: "plan-ready",
        name: "限定試験元計画",
        targetApprovalId: "approval-ready",
        targetReviewId: "review-ready",
        targetValidationPlanId: "validation-ready",
        targetImprovementRuleId: "rule-ready",
        planStatus: "ready",
        planDecision: "ready_for_manual_execution",
        executionStatus: "not_started",
        operator: "Operator",
        checker: "Observer",
        sourceApprovalStatus: "approved",
        sourceApplicationStatus: "not_applied",
        safety: engine.buildSafety()
      },
      { planId: "plan-draft", targetApprovalId: "approval-draft", targetImprovementRuleId: "rule-draft", planStatus: "planning", planDecision: "pending", executionStatus: "not_started", safety: engine.buildSafety() },
      { planId: "plan-running", targetApprovalId: "approval-running", targetImprovementRuleId: "rule-running", planStatus: "ready", planDecision: "ready_for_manual_execution", executionStatus: "blocked", safety: engine.buildSafety() }
    ]
  };
}

function scopedTrial(trial) {
  return {
    ...trial,
    targetRaceKeys: ["2026-07-12-TOKYO-11", "2026-07-13-TOKYO-11", "2026-07-14-TOKYO-11"],
    observationStartDate: "2026-07-12",
    observationEndDate: "2026-07-20",
    maximumRaceCount: 3,
    trialStatus: "observing",
    trialDecision: "observation_continue"
  };
}

function observation(raceKey, anomalyLevel = "none", observedAt = "2026-07-12T10:00:00") {
  return {
    raceKey,
    observedAt,
    baselinePrediction: "baseline",
    trialPrediction: "trial",
    differenceSummary: "差分なし",
    expectedBehavior: "安定",
    actualBehavior: "安定",
    resultSummary: "観測",
    anomalyLevel,
    observer: "Observer",
    judgement: "continue",
    notes: "node test"
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1");
const storage = memoryStorage({ [engine.PLAN_STORAGE_KEY]: JSON.stringify(samplePlanStore()) });
const planLoad = engine.loadPlanStore(storage);
assert.strictEqual(planLoad.parseError, false, "Phase22-14読込");
assert.strictEqual(engine.readyPlans(planLoad.planStore).length, 1, "ready_for_manual_executionかつreadyだけ候補");

const store = engine.normalizeTrialStore({}, planLoad.planStore);
assert.strictEqual(store.trials.length, 1, "試験候補生成");
assert.deepStrictEqual(engine.normalizeTrialStore({}, planLoad.planStore).trials.map((trial) => trial.trialId), store.trials.map((trial) => trial.trialId), "決定的ID");
const trial = store.trials[0];
assert.strictEqual(trial.sourcePlanId, "plan-ready");
assert.ok(!engine.validateTrial(trial).ok, "対象範囲なしを拒否");
assert.ok(!engine.validateTrial({ ...scopedTrial(trial), observationStartDate: "2026-07-20", observationEndDate: "2026-07-12" }).ok, "不正な観測期間を拒否");
assert.ok(!engine.validateTrial({ ...scopedTrial(trial), maximumRaceCount: 0 }).ok, "maximumRaceCount正整数必須");
assert.ok(engine.validateTrial(scopedTrial(trial)).ok, "スコープあり正常");
assert.strictEqual(engine.sourcePlanReady({ ...planLoad.planStore.plans[0], planStatus: "planning" }), false, "ready以外拒否");
assert.strictEqual(engine.sourcePlanReady({ ...planLoad.planStore.plans[0], planDecision: "pending" }), false, "未承認計画拒否");

const scoped = scopedTrial(trial);
assert.strictEqual(engine.addObservation(scoped, observation("OUT-OF-SCOPE"), planLoad.planStore).reason, "out_of_scope", "対象外レース拒否");
const first = engine.addObservation(scoped, observation("2026-07-12-TOKYO-11"), planLoad.planStore);
assert.strictEqual(first.added, true, "観測追加");
assert.strictEqual(engine.addObservation(first.trial, observation("2026-07-12-TOKYO-11"), planLoad.planStore).reason, "duplicate_race", "同一レース重複拒否");
const limited = { ...scoped, maximumRaceCount: 1 };
const limitedFirst = engine.addObservation(limited, observation("2026-07-12-TOKYO-11"), planLoad.planStore);
assert.strictEqual(engine.addObservation(limitedFirst.trial, observation("2026-07-13-TOKYO-11"), planLoad.planStore).reason, "maximum_exceeded", "maximumRaceCount超過");

assert.strictEqual(engine.addObservation(scoped, observation("2026-07-12-TOKYO-11", "notice"), planLoad.planStore).trial.stopRequests.length, 0, "noticeでは継続可能");
let warningTrial = { ...scoped, warningLimit: 2 };
warningTrial = engine.addObservation(warningTrial, observation("2026-07-12-TOKYO-11", "warning"), planLoad.planStore).trial;
warningTrial = engine.addObservation(warningTrial, observation("2026-07-13-TOKYO-11", "warning"), planLoad.planStore).trial;
assert.ok(warningTrial.stopRequests.some((reason) => reason.includes("warning")), "warning上限で停止要求");
assert.ok(engine.addObservation(scoped, observation("2026-07-12-TOKYO-11", "critical"), planLoad.planStore).trial.stopRequests.some((reason) => reason.includes("critical")), "criticalで停止要求");
assert.ok(engine.addObservation(scoped, observation("2026-07-12-TOKYO-11", "none", "2026-07-30T10:00:00"), planLoad.planStore).trial.stopRequests.some((reason) => reason.includes("観測期間外")), "観測期間外で停止要求");

assert.strictEqual(engine.canTransition("paused", "observing"), true, "pausedから再開可能");
assert.strictEqual(engine.canTransition("stopped", "observing"), false, "stoppedから再開不可");
assert.strictEqual(engine.canTransition("completed", "observing"), false, "completedから再開不可");
assert.strictEqual(engine.transitionTrial({ ...scoped, trialStatus: "paused" }, "observing").transitioned, true, "paused遷移");

const safety = engine.buildSafety();
["planOnly", "protectedMode", "privateLocal", "observationOnly", "shadowMode"].forEach((key) => assert.strictEqual(safety[key], true, `safety ${key}`));
["automaticApply", "automaticLearning", "automaticUpdate", "autoExecution", "autoRollback", "publicUrl", "githubPages", "externalApi", "predictionMutation", "bettingMutation", "applicationStatusMutation", "ruleActivation"].forEach((key) => assert.strictEqual(safety[key], false, `safety ${key}`));
assert.strictEqual(engine.evaluateStopRequests({ ...scoped, safety: { ...safety, automaticApply: true } }, planLoad.planStore).some((reason) => reason.includes("安全フラグ")), true, "安全フラグ無効で停止要求");

const beforePlan = storage.getItem(engine.PLAN_STORAGE_KEY);
const saveStore = { ...store, trials: [scoped] };
assert.strictEqual(engine.saveTrialStore(storage, saveStore, new Date("2026-07-12T17:00:00.000Z")).saved, true, "保存");
assert.strictEqual(storage.getItem(engine.PLAN_STORAGE_KEY), beforePlan, "本番予想・買い目・ルール状態を変更しない");
assert.strictEqual(engine.loadSavedTrialStore(storage, planLoad.planStore).store.trials.length, 1, "復元");
assert.strictEqual(engine.deleteSavedTrialStore(storage, () => false).deleted, false, "初期化確認必須");
assert.strictEqual(engine.deleteSavedTrialStore(storage, () => true).deleted, true, "Phase22-15のみ初期化");
assert.strictEqual(storage.getItem(engine.PLAN_STORAGE_KEY), beforePlan, "初期化でも元計画非破壊");
assert.strictEqual(engine.loadSavedTrialStore(memoryStorage({ [engine.STORAGE_KEY]: "{broken" }), planLoad.planStore).rejected, true, "破損JSON安全側");
assert.ok(engine.generatePlainText(saveStore).includes("観測専用・シャドーモード"), "テキスト安全表示");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-limited-trial-observation-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-14-manual-application-plan-rollback-plan-core.js") < index.indexOf("phase22-15-limited-trial-observation-management-core.js"), "HTML読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-limited-trial-observation-core"'), "private-local導線");
assert.ok(css.includes(".phase22-trial-observation-core"), "CSS");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1"), "README保存キー");
assert.ok(readme.includes("Observation is `observationOnly` and `shadowMode`"), "README安全仕様");

function makeNode() {
  return { dataset: {}, children: [], value: "", textContent: "", disabled: false, appendChild(child) { this.children.push(child); return child; }, replaceChildren(...children) { this.children = children; }, addEventListener() {}, set className(value) { this._className = value; }, get className() { return this._className || ""; } };
}
const nodes = new Map();
["#phase22-limited-trial-observation-core", "#phase22-trial-message", "#phase22-trial-finalized-status", "#phase22-trial-summary", "#phase22-trial-warning-list", "#phase22-trial-list", "#phase22-trial-confirmer", "#phase22-trial-text-output", "#phase22-trial-reload", "#phase22-trial-save", "#phase22-trial-restore", "#phase22-trial-reset", "#phase22-trial-text"].forEach((id) => nodes.set(id, makeNode()));
const fakeDocument = { querySelector(selector) { return nodes.get(selector) || null; }, createElement(tag) { const node = makeNode(); node.tagName = tag.toUpperCase(); return node; } };
const panel = engine.bindLimitedTrialPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "ブラウザ非依存初期化");
panel.actions["#phase22-trial-reload"]();
panel.actions["#phase22-trial-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-15"), "出力欄");

const sandbox = { window: { document: { readyState: "loading", addEventListener() {} } }, document: { readyState: "loading", addEventListener() {} }, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-15-limited-trial-observation-management-core.js"), sandbox, { filename: "phase22-15-limited-trial-observation-management-core.js" });
assert.ok(sandbox.window.HashimotoPhase2215LimitedTrialObservationManagementCore, "browser global export");

console.log("Phase22-15 limited trial observation management core test passed");
