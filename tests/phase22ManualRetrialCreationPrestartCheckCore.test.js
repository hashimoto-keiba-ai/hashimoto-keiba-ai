const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-18-manual-retrial-creation-prestart-check-core.js");

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

function evaluation(id, overrides = {}) {
  return {
    evaluationId: `eval-${id}`,
    sourceTrialId: `trial-${id}`,
    sourcePlanId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    evaluationStatus: "finalized",
    continuationDecision: "continue_limited_trial",
    ...overrides
  };
}

function trial(id, overrides = {}) {
  return {
    trialId: `trial-${id}`,
    sourcePlanId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    targetRaceKeys: [`race-${id}`],
    ...overrides
  };
}

function sourcePlan(id, overrides = {}) {
  return {
    planId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    ...overrides
  };
}

function retrialPlan(id, overrides = {}) {
  return {
    retrialPlanId: `retrial-${id}`,
    sourceEvaluationId: `eval-${id}`,
    sourceTrialId: `trial-${id}`,
    sourcePlanId: `plan-${id}`,
    targetApprovalId: `approval-${id}`,
    targetImprovementRuleId: `rule-${id}`,
    planName: `Retrial ${id}`,
    planType: "continuation",
    planStatus: "ready",
    planDecision: "ready_for_manual_trial_creation",
    finalApprover: "Owner",
    approvedAt: "2026-07-14T09:00:00",
    decisionReason: "manual ready",
    targetRaceKeys: [`race-${id}`],
    targetCourses: ["Tokyo"],
    targetRaceClasses: ["G3"],
    targetDistances: ["1600"],
    targetSurfaceTypes: ["turf"],
    excludedRaceKeys: ["exclude-1"],
    excludedConditions: "excluded condition checked",
    observationStartDate: "2026-07-20",
    observationEndDate: "2026-08-20",
    minimumRaceCount: 1,
    maximumRaceCount: 3,
    minimumValidObservationCount: 1,
    warningThreshold: 2,
    criticalThreshold: 1,
    maximumStopRequestCount: 0,
    baselineComparisonRequirement: "baseline retained",
    reproducibilityRequirement: "manual check",
    dataIntegrityRequirement: "source match",
    correctionItems: [{ correctionId: "correction-1", issue: "fix", status: "verified" }],
    continuationConditions: [{ conditionId: "condition-1", content: "continue", mandatory: true, status: "satisfied" }],
    stopConditions: [{ stopConditionId: "stop-1", condition: "critical anomaly", severity: "critical", action: "stop" }],
    evaluationCriteria: [{ criterionId: "criterion-1", metric: "ROI", target: "safe" }],
    safety: engine.buildSafety(),
    ...overrides
  };
}

function sourceData() {
  return {
    planStore: { schemaVersion: 1, savedAt: "2026-07-14T00:00:00.000Z", plans: [sourcePlan("ready"), sourcePlan("notready"), sourcePlan("wrongdecision")] },
    trialStore: { schemaVersion: 1, savedAt: "2026-07-14T00:01:00.000Z", trials: [trial("ready"), trial("notready"), trial("wrongdecision")] },
    evaluationStore: { schemaVersion: 1, savedAt: "2026-07-14T00:02:00.000Z", evaluations: [evaluation("ready"), evaluation("notready"), evaluation("wrongdecision")] },
    retrialPlanStore: {
      schemaVersion: 1,
      savedAt: "2026-07-14T00:03:00.000Z",
      retrialPlans: [
        retrialPlan("ready"),
        retrialPlan("notready", { planStatus: "approved" }),
        retrialPlan("wrongdecision", { planDecision: "approval_required" })
      ]
    }
  };
}

function storageFrom(data = sourceData()) {
  return memoryStorage({
    [engine.PLAN_STORAGE_KEY]: JSON.stringify(data.planStore),
    [engine.TRIAL_STORAGE_KEY]: JSON.stringify(data.trialStore),
    [engine.EVALUATION_STORAGE_KEY]: JSON.stringify(data.evaluationStore),
    [engine.RETRIAL_PLAN_STORAGE_KEY]: JSON.stringify(data.retrialPlanStore)
  });
}

function loadSources(storage) {
  return {
    plans: engine.loadPlanStore(storage).planStore,
    trials: engine.loadTrialStore(storage).trialStore,
    evaluations: engine.loadEvaluationStore(storage).evaluationStore,
    retrialPlans: engine.loadRetrialPlanStore(storage).retrialPlanStore
  };
}

function passingItems(check) {
  return check.checkItems.map((item) => ({ ...item, judgement: "pass", severity: item.severity === "critical" ? "critical" : item.severity, actualResult: "ok", checker: "Owner", checkedAt: "2026-07-14T10:00:00" }));
}

function readyCheck(check, extra = {}) {
  return {
    ...check,
    creationStatus: "approved",
    creationDecision: "ready_for_manual_trial_entry",
    finalApprover: "Owner",
    approvedAt: "2026-07-14T11:00:00",
    decisionReason: "manual approval",
    checkItems: passingItems(check),
    ...extra
  };
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.manualRetrialCreationPrestartCheck.v1");
assert.strictEqual(engine.escapeHtml("<x>&"), "&lt;x&gt;&amp;");

const storage = storageFrom();
const sources = loadSources(storage);
const store = engine.loadCreationCheckStore(storage, sources.retrialPlans).store;
assert.strictEqual(store.creationChecks.length, 1, "only ready_for_manual_trial_creation + ready retrial plans create checks");
const check = store.creationChecks[0];
assert.strictEqual(check.sourceRetrialPlanId, "retrial-ready");
assert.strictEqual(check.candidateTrialId, engine.generateCandidateTrialId(retrialPlan("ready")), "stable candidate trial ID");
assert.deepStrictEqual(
  engine.loadCreationCheckStore(storage, sources.retrialPlans).store.creationChecks.map((item) => item.creationCheckId),
  store.creationChecks.map((item) => item.creationCheckId),
  "deterministic ID and order"
);
assert.strictEqual(check.creationDecision, "pending", "recommended decision does not become final decision");
assert.notStrictEqual(check.recommendedCreationDecision, check.creationDecision, "recommended and final decisions are separate");
assert.strictEqual(check.candidateTrial.sourceRetrialPlanId, "retrial-ready", "candidate snapshot keeps source retrial plan");
assert.strictEqual(check.candidateTrial.targetRaceKeys[0], "race-ready", "target scope copied into candidate snapshot");

assert.ok(!engine.validateCreationSource({ ...check, sourceRetrialPlanId: "missing" }, sources.retrialPlans, sources.evaluations, sources.trials, sources.plans).ok, "missing Phase22-17 plan is rejected");
assert.ok(!engine.validateCreationSource(engine.buildCreationCheckFromRetrialPlan(retrialPlan("notready", { planStatus: "approved" })), { ...sources.retrialPlans, retrialPlans: [retrialPlan("notready", { planStatus: "approved" })] }, sources.evaluations, sources.trials, sources.plans).ok, "non-ready plan is rejected");
assert.ok(!engine.validateCreationSource(engine.buildCreationCheckFromRetrialPlan(retrialPlan("wrongdecision", { planDecision: "approval_required" })), { ...sources.retrialPlans, retrialPlans: [retrialPlan("wrongdecision", { planDecision: "approval_required" })] }, sources.evaluations, sources.trials, sources.plans).ok, "wrong source plan decision is rejected");
assert.ok(!engine.validateCreationSource(check, sources.retrialPlans, { ...sources.evaluations, evaluations: [] }, sources.trials, sources.plans).ok, "missing evaluation is rejected");
assert.ok(!engine.validateCreationSource(check, sources.retrialPlans, sources.evaluations, { ...sources.trials, trials: [] }, sources.plans).ok, "missing trial is rejected");
assert.ok(!engine.validateCreationSource(check, sources.retrialPlans, sources.evaluations, sources.trials, { ...sources.plans, plans: [] }).ok, "missing source plan is rejected");
assert.ok(!engine.validateCreationSource({ ...check, targetApprovalId: "other" }, sources.retrialPlans, sources.evaluations, sources.trials, sources.plans).ok, "reference ID mismatch is rejected");

assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, targetRaceKeys: [], targetCourses: [], targetRaceClasses: [], targetDistances: [], targetSurfaceTypes: [] } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "missing target scope is rejected");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, observationStartDate: "2026-08-20", observationEndDate: "2026-07-20" } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "invalid observation period is rejected");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, minimumRaceCount: 4, maximumRaceCount: 3 } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "minimumRaceCount > maximumRaceCount is rejected");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, correctionItems: [{ id: "c", status: "pending" }] } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "unverified required correction blocks start_ready");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, continuationConditions: [{ id: "condition", mandatory: true, status: "pending" }] } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "unsatisfied mandatory continuation condition blocks start_ready");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, stopConditions: [] } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "critical stop condition is required");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrial: { ...check.candidateTrial, evaluationCriteria: [] } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "evaluation criteria are required");
assert.ok(!engine.validateCreationCheck(readyCheck(check, { checkItems: [{ ...passingItems(check)[0], judgement: "fail", severity: "critical" }] }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "critical failed check item blocks start_ready");
assert.ok(!engine.validateCreationCheck(readyCheck(check, { finalApprover: "" }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "final approver is required");
assert.ok(!engine.validateCreationCheck(readyCheck(check, { approvedAt: "" }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "approval datetime is required");
assert.ok(!engine.validateCreationCheck(readyCheck(check, { decisionReason: "" }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "decision reason is required");
assert.ok(!engine.validateCreationCheck(readyCheck({ ...check, candidateTrialId: "trial-ready", candidateTrial: { ...check.candidateTrial, candidateTrialId: "trial-ready" } }), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] }).ok, "candidateTrialId duplicate with Phase22-15 is rejected");
assert.ok(!engine.validateCreationCheck(readyCheck(check), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check, { ...check, creationCheckId: "other", sourceRetrialPlanId: check.sourceRetrialPlanId }] }).ok, "duplicate source retrial plan is rejected");
assert.ok(!engine.validateCreationCheck(readyCheck(check), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check, { ...check, creationCheckId: "other", sourceRetrialPlanId: "other", candidateTrialId: check.candidateTrialId }] }).ok, "duplicate candidate trial ID is rejected");

const ready = engine.markStartReady(readyCheck(check), sources.retrialPlans, sources.evaluations, sources.trials, sources.plans, { creationChecks: [check] });
assert.strictEqual(ready.ready, true, "all conditions allow ready_for_manual_trial_entry");
assert.strictEqual(ready.check.creationStatus, "start_ready");
assert.strictEqual(engine.addCheckItem(ready.check, { content: "late" }).added, false, "start_ready is locked against edits");
assert.strictEqual(engine.transitionCreationStatus(ready.check, "preparing").transitioned, false, "terminal start_ready cannot reopen directly");
assert.strictEqual(engine.transitionCreationStatus({ ...check, creationStatus: "draft" }, "preparing").transitioned, true, "valid transition works");
assert.strictEqual(engine.transitionCreationStatus({ ...check, creationStatus: "cancelled" }, "preparing").transitioned, false, "terminal cancelled cannot reopen");
assert.strictEqual(engine.setFinalCreationDecision(check, "ready_for_manual_trial_entry", "", "reason", "2026-07-14T11:00:00").set, false, "final decision requires human fields");

const before = storage.dump();
assert.strictEqual(engine.saveCreationCheckStore(storage, { ...store, creationChecks: [ready.check] }, new Date("2026-07-14T12:00:00.000Z")).saved, true, "save succeeds");
assert.strictEqual(storage.getItem(engine.PLAN_STORAGE_KEY), before[engine.PLAN_STORAGE_KEY], "Phase22-14 data is not mutated");
assert.strictEqual(storage.getItem(engine.TRIAL_STORAGE_KEY), before[engine.TRIAL_STORAGE_KEY], "Phase22-15 data is not mutated and no trial is created");
assert.strictEqual(storage.getItem(engine.EVALUATION_STORAGE_KEY), before[engine.EVALUATION_STORAGE_KEY], "Phase22-16 data is not mutated");
assert.strictEqual(storage.getItem(engine.RETRIAL_PLAN_STORAGE_KEY), before[engine.RETRIAL_PLAN_STORAGE_KEY], "Phase22-17 data is not mutated");
assert.ok(storage.getItem(engine.STORAGE_KEY), "Phase22-18 data is saved under its own key");

const broken = engine.loadCreationCheckStore(memoryStorage({ [engine.STORAGE_KEY]: "{broken" }), sources.retrialPlans);
assert.strictEqual(broken.rejected, true, "broken localStorage JSON is rejected safely");
assert.ok(engine.generatePlainText(store).includes("Phase22-18"), "plain text includes phase name");

const safety = engine.buildSafety();
["planOnly", "protectedMode", "privateLocal", "observationOnly", "shadowMode", "evaluationOnly", "retrialPlanningOnly", "manualCreationOnly", "prestartCheckOnly"].forEach((key) => assert.strictEqual(safety[key], true, key));
["automaticApply", "automaticLearning", "automaticUpdate", "autoExecution", "autoRollback", "autoContinuation", "autoTrialCreation", "autoTrialStart", "publicUrl", "githubPages", "externalApi", "predictionMutation", "bettingMutation", "applicationStatusMutation", "ruleActivation", "trialStatusMutation", "evaluationStatusMutation", "retrialPlanStatusMutation"].forEach((key) => assert.strictEqual(safety[key], false, key));

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-manual-retrial-creation-check-core"'), "index panel exists");
assert.ok(index.indexOf("phase22-17-continuation-trial-conditions-retrial-plan-core.js") < index.indexOf("phase22-18-manual-retrial-creation-prestart-check-core.js"), "script load order");
assert.ok(privateLocal.includes('href="index.html#phase22-manual-retrial-creation-check-core"'), "private-local route exists");
assert.ok(css.includes(".phase22-creation-check-core"), "CSS exists");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.manualRetrialCreationPrestartCheck.v1"), "README storage key");
assert.ok(readme.includes("`start_ready` does not create a Phase22-15 trial"), "README safety note");

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
["#phase22-manual-retrial-creation-check-core", "#phase22-creation-check-summary", "#phase22-creation-check-list", "#phase22-creation-check-text-output", "#phase22-creation-check-message", "#phase22-creation-check-reload", "#phase22-creation-check-save", "#phase22-creation-check-text"].forEach((id) => nodes.set(id, makeNode()));
const fakeDocument = {
  querySelector(selector) { return nodes.get(selector) || null; },
  createElement(tag) { const node = makeNode(); node.tagName = tag.toUpperCase(); return node; }
};
const panel = engine.bindCreationCheckPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "browser-independent panel initializes");
panel.actions["#phase22-creation-check-reload"]();
panel.actions["#phase22-creation-check-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-18"), "panel text output works");

const sandbox = { window: { document: { readyState: "loading", addEventListener() {} } }, document: { readyState: "loading", addEventListener() {} }, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-18-manual-retrial-creation-prestart-check-core.js"), sandbox, { filename: "phase22-18-manual-retrial-creation-prestart-check-core.js" });
assert.ok(sandbox.window.HashimotoPhase2218ManualRetrialCreationPrestartCheckCore, "browser global export");

console.log("Phase22-18 manual retrial creation prestart check core test passed");
