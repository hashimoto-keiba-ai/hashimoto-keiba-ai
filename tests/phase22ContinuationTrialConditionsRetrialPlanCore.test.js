const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-17-continuation-trial-conditions-retrial-plan-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    dump() { return { ...store }; }
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

function evaluation(id, decision, overrides = {}) {
  return {
    evaluationId: id,
    sourceTrialId: `trial-${id}`,
    sourcePlanId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    evaluationName: `Evaluation ${id}`,
    evaluationStatus: "finalized",
    continuationDecision: decision,
    decisionReason: "human final decision",
    continuationConditions: decision === "continue_with_conditions" ? "condition required" : "",
    requiredCorrections: decision === "revision_required" ? "fix required" : "",
    unresolvedIssues: decision === "pause_required" ? "unresolved issue" : "",
    notes: "note",
    ...overrides
  };
}

function trialFor(id, overrides = {}) {
  return {
    trialId: `trial-${id}`,
    sourcePlanId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    targetRaceKeys: [`race-${id}`],
    targetCourses: ["Tokyo"],
    targetRaceClasses: ["G3"],
    targetDistances: ["1600"],
    targetSurfaceTypes: ["turf"],
    observationStartDate: "2026-07-20",
    observationEndDate: "2026-08-20",
    maximumRaceCount: 3,
    ...overrides
  };
}

function sourcePlanFor(id, overrides = {}) {
  return {
    planId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    ...overrides
  };
}

function sourceData() {
  const ids = ["continue", "condition", "revision", "additional", "pause", "stop", "rejected", "cancelled", "draft"];
  const decisions = {
    continue: "continue_limited_trial",
    condition: "continue_with_conditions",
    revision: "revision_required",
    additional: "additional_observation_required",
    pause: "pause_required",
    stop: "stop_required",
    rejected: "rejected",
    cancelled: "cancelled",
    draft: "continue_limited_trial"
  };
  return {
    evaluationStore: {
      schemaVersion: 1,
      savedAt: "2026-07-13T00:00:00.000Z",
      evaluations: ids.map((id) => evaluation(id, decisions[id], id === "draft" ? { evaluationStatus: "reviewed" } : {}))
    },
    trialStore: {
      schemaVersion: 1,
      savedAt: "2026-07-13T00:10:00.000Z",
      trials: ids.map((id) => trialFor(id))
    },
    planStore: {
      schemaVersion: 1,
      savedAt: "2026-07-13T00:20:00.000Z",
      plans: ids.map((id) => sourcePlanFor(id))
    }
  };
}

function storageFrom(data = sourceData()) {
  return memoryStorage({
    [engine.EVALUATION_STORAGE_KEY]: JSON.stringify(data.evaluationStore),
    [engine.TRIAL_STORAGE_KEY]: JSON.stringify(data.trialStore),
    [engine.PLAN_STORAGE_KEY]: JSON.stringify(data.planStore)
  });
}

function loadSources(storage) {
  return {
    evaluations: engine.loadEvaluationStore(storage).evaluationStore,
    trials: engine.loadTrialStore(storage).trialStore,
    plans: engine.loadPlanStore(storage).planStore
  };
}

function readyBase(plan, extra = {}) {
  return {
    ...plan,
    planStatus: "approved",
    planDecision: "ready_for_manual_trial_creation",
    finalApprover: "Owner",
    approvedAt: "2026-07-13T09:00:00",
    decisionReason: "manual approval",
    stopConditions: [{ severity: "critical", condition: "critical anomaly", action: "manual stop", decisionMaker: "Owner" }],
    evaluationCriteria: [{ metric: "ROI", baseline: "baseline", target: "candidate safe", minimumSampleSize: "1", judgementMethod: "manual review" }],
    ...extra
  };
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.continuationTrialConditionsRetrialPlan.v1");
assert.strictEqual(engine.escapeHtml("<b>&"), "&lt;b&gt;&amp;");
assert.strictEqual(engine.mapDecisionToPlanType("continue_limited_trial"), "continuation");
assert.strictEqual(engine.mapDecisionToPlanType("continue_with_conditions"), "conditional_continuation");
assert.strictEqual(engine.mapDecisionToPlanType("revision_required"), "revised_retrial");
assert.strictEqual(engine.mapDecisionToPlanType("additional_observation_required"), "additional_observation");
assert.strictEqual(engine.mapDecisionToPlanType("pause_required"), "paused_retrial");

const storage = storageFrom();
const sources = loadSources(storage);
const store = engine.loadRetrialPlanStore(storage, sources.evaluations, sources.trials, sources.plans).store;

assert.deepStrictEqual(
  store.retrialPlans.map((plan) => plan.planType).sort(),
  ["additional_observation", "conditional_continuation", "continuation", "paused_retrial", "revised_retrial"].sort(),
  "eligible finalized decisions create the five retrial plan types"
);
assert.strictEqual(store.retrialPlans.length, 5, "stop/rejected/cancelled/non-finalized evaluations are excluded");
assert.deepStrictEqual(
  engine.loadRetrialPlanStore(storage, sources.evaluations, sources.trials, sources.plans).store.retrialPlans.map((plan) => plan.retrialPlanId),
  store.retrialPlans.map((plan) => plan.retrialPlanId),
  "deterministic IDs and order"
);

const duplicateSaved = engine.loadRetrialPlanStore(
  memoryStorage({
    [engine.STORAGE_KEY]: JSON.stringify({ retrialPlans: [{ sourceEvaluationId: "continue", planName: "old" }, { sourceEvaluationId: "continue", planName: "new" }] })
  }),
  sources.evaluations,
  sources.trials,
  sources.plans
).store;
assert.strictEqual(duplicateSaved.retrialPlans.filter((plan) => plan.sourceEvaluationId === "continue").length, 1, "duplicate saved source evaluations are collapsed");

const continuePlan = store.retrialPlans.find((plan) => plan.planType === "continuation");
const conditionPlan = store.retrialPlans.find((plan) => plan.planType === "conditional_continuation");
const revisionPlan = store.retrialPlans.find((plan) => plan.planType === "revised_retrial");
const additionalPlan = store.retrialPlans.find((plan) => plan.planType === "additional_observation");
const pausePlan = store.retrialPlans.find((plan) => plan.planType === "paused_retrial");

assert.ok(!engine.validateRetrialPlan({ ...continuePlan, targetRaceKeys: [], targetCourses: [], targetRaceClasses: [], targetDistances: [], targetSurfaceTypes: [] }, sources.evaluations, sources.trials, sources.plans).ok, "target scope is required");
assert.ok(!engine.validateRetrialPlan({ ...continuePlan, observationStartDate: "2026-08-20", observationEndDate: "2026-07-20" }, sources.evaluations, sources.trials, sources.plans).ok, "invalid observation date range is rejected");
assert.ok(!engine.validateRetrialPlan({ ...continuePlan, minimumRaceCount: 4, maximumRaceCount: 3 }, sources.evaluations, sources.trials, sources.plans).ok, "minimum race count cannot exceed maximum");
assert.ok(!engine.validateRetrialPlan({ ...conditionPlan, continuationConditions: [] }, sources.evaluations, sources.trials, sources.plans).ok, "conditional continuation requires continuation conditions");
assert.ok(!engine.validateRetrialPlan({ ...revisionPlan, correctionItems: [] }, sources.evaluations, sources.trials, sources.plans).ok, "revised retrial requires correction items");
assert.ok(!engine.validateRetrialPlan({ ...pausePlan, unresolvedIssues: "" }, sources.evaluations, sources.trials, sources.plans).ok, "paused retrial requires unresolved issues");

const missingTrialStore = { ...sources.trials, trials: sources.trials.trials.filter((trial) => trial.trialId !== continuePlan.sourceTrialId) };
assert.ok(!engine.validatePlanSource(continuePlan, sources.evaluations, missingTrialStore, sources.plans).ok, "missing source trial is rejected");
const mismatchedPlan = { ...continuePlan, targetApprovalId: "other" };
assert.ok(!engine.validatePlanSource(mismatchedPlan, sources.evaluations, sources.trials, sources.plans).ok, "source reference mismatch is rejected");

assert.ok(!engine.markPlanReady(readyBase(continuePlan, { stopConditions: [] }), sources.evaluations, sources.trials, sources.plans).ready, "critical stop condition is required for ready");
assert.ok(!engine.markPlanReady(readyBase(continuePlan, { evaluationCriteria: [] }), sources.evaluations, sources.trials, sources.plans).ready, "evaluation criteria are required for ready");
assert.ok(!engine.markPlanReady(readyBase(conditionPlan, { continuationConditions: [{ content: "condition", mandatory: true, status: "pending" }] }), sources.evaluations, sources.trials, sources.plans).ready, "mandatory pending continuation conditions block ready");
assert.ok(!engine.markPlanReady(readyBase(revisionPlan, { correctionItems: [{ issue: "fix", status: "pending" }] }), sources.evaluations, sources.trials, sources.plans).ready, "pending correction items block ready");
assert.ok(!engine.markPlanReady(readyBase(pausePlan), sources.evaluations, sources.trials, sources.plans).ready, "unresolved issues require approved exception");
assert.ok(!engine.markPlanReady(readyBase(additionalPlan, { decisionReason: "" }), sources.evaluations, sources.trials, sources.plans).ready, "additional observation requires a manual reason");

const approved = engine.approveRetrialPlan(continuePlan, "Owner", "2026-07-13T09:00:00", "manual approval");
assert.strictEqual(approved.approved, true, "human approval can be recorded");
const ready = engine.markPlanReady(readyBase(approved.plan), sources.evaluations, sources.trials, sources.plans);
assert.strictEqual(ready.ready, true, "complete approved plan can become ready");
assert.strictEqual(ready.plan.planStatus, "ready");
assert.strictEqual(ready.plan.planDecision, "ready_for_manual_trial_creation");
assert.strictEqual(engine.addCorrectionItem(ready.plan, { issue: "late edit" }).added, false, "ready plan is locked against edits");
assert.strictEqual(engine.transitionPlanStatus(ready.plan, "planning").transitioned, false, "terminal ready status cannot reopen directly");

const setDecision = engine.setFinalPlanDecision(continuePlan, "ready_for_manual_trial_creation", "", "reason", "2026-07-13T09:00:00");
assert.strictEqual(setDecision.set, false, "final plan decision requires human fields");
assert.strictEqual(continuePlan.planDecision, "pending", "recommended decision is not the final decision");
assert.notStrictEqual(continuePlan.recommendedPlanDecision, continuePlan.planDecision, "recommended decision stays separate from final decision");

const before = storage.dump();
assert.strictEqual(engine.saveRetrialPlanStore(storage, { ...store, retrialPlans: [ready.plan] }, new Date("2026-07-13T10:00:00.000Z")).saved, true, "save succeeds");
assert.strictEqual(storage.getItem(engine.EVALUATION_STORAGE_KEY), before[engine.EVALUATION_STORAGE_KEY], "Phase22-16 data is not mutated");
assert.strictEqual(storage.getItem(engine.TRIAL_STORAGE_KEY), before[engine.TRIAL_STORAGE_KEY], "Phase22-15 data is not mutated");
assert.strictEqual(storage.getItem(engine.PLAN_STORAGE_KEY), before[engine.PLAN_STORAGE_KEY], "Phase22-14 data is not mutated");
assert.ok(storage.getItem(engine.STORAGE_KEY), "Phase22-17 data is saved under its own key");

const broken = engine.loadRetrialPlanStore(memoryStorage({ [engine.STORAGE_KEY]: "{broken" }), sources.evaluations, sources.trials, sources.plans);
assert.strictEqual(broken.rejected, true, "broken localStorage JSON is rejected safely");
assert.ok(engine.generatePlainText(store).includes("Phase22-17"), "plain text export includes phase name");

const safety = engine.buildSafety();
["planOnly", "protectedMode", "privateLocal", "observationOnly", "shadowMode", "evaluationOnly", "retrialPlanningOnly"].forEach((key) => assert.strictEqual(safety[key], true, key));
["automaticApply", "automaticLearning", "automaticUpdate", "autoExecution", "autoRollback", "autoContinuation", "autoTrialCreation", "publicUrl", "githubPages", "externalApi", "predictionMutation", "bettingMutation", "applicationStatusMutation", "ruleActivation", "trialStatusMutation", "evaluationStatusMutation"].forEach((key) => assert.strictEqual(safety[key], false, key));

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-retrial-plan-core"'), "index panel exists");
assert.ok(index.indexOf("phase22-16-limited-trial-result-evaluation-continuation-decision-core.js") < index.indexOf("phase22-17-continuation-trial-conditions-retrial-plan-core.js"), "script load order");
assert.ok(privateLocal.includes('href="index.html#phase22-retrial-plan-core"'), "private-local route exists");
assert.ok(css.includes(".phase22-retrial-plan-core"), "CSS exists");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.continuationTrialConditionsRetrialPlan.v1"), "README storage key");
assert.ok(readme.includes("`ready_for_manual_trial_creation` is only a human-readable planning decision"), "README safety note");

function makeNode() {
  return {
    dataset: {},
    children: [],
    value: "",
    textContent: "",
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) { this.children = children; },
    addEventListener() {},
    set className(value) { this._className = value; },
    get className() { return this._className || ""; }
  };
}
const nodes = new Map();
["#phase22-retrial-plan-core", "#phase22-retrial-summary", "#phase22-retrial-list", "#phase22-retrial-text-output", "#phase22-retrial-message", "#phase22-retrial-reload", "#phase22-retrial-save", "#phase22-retrial-text"].forEach((id) => nodes.set(id, makeNode()));
const fakeDocument = {
  querySelector(selector) { return nodes.get(selector) || null; },
  createElement(tag) { const node = makeNode(); node.tagName = tag.toUpperCase(); return node; }
};
const panel = engine.bindRetrialPlanPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "browser-independent panel initializes");
panel.actions["#phase22-retrial-reload"]();
panel.actions["#phase22-retrial-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-17"), "panel text output works");

const sandbox = { window: { document: { readyState: "loading", addEventListener() {} } }, document: { readyState: "loading", addEventListener() {} }, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-17-continuation-trial-conditions-retrial-plan-core.js"), sandbox, { filename: "phase22-17-continuation-trial-conditions-retrial-plan-core.js" });
assert.ok(sandbox.window.HashimotoPhase2217ContinuationRetrialPlanCore, "browser global export");

console.log("Phase22-17 continuation trial conditions retrial plan core test passed");
