const assert = require("assert");
const fs = require("fs");
const path = require("path");
const engine = require("../phase22-21-retrial-result-comparison-final-evaluation-core.js");
function memoryStorage(initial = {}) { const data = { ...initial }; return { getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; }, setItem(key, value) { data[key] = String(value); } }; }
function read(file) { return fs.readFileSync(path.join(__dirname, "..", file), "utf8"); }
function initial(overrides = {}) { return { evaluationId: "phase22-16-evaluation-trial-1", sourceTrialId: "trial-1", evaluationName: "Initial", evaluationStatus: "finalized", continuationDecision: "continue_with_conditions", summary: { plannedRaceCount: 4, validObservationCount: 3, anomalyNoticeCount: 1, anomalyWarningCount: 0, anomalyCriticalCount: 0 }, stopReason: "initial limit", finalizedAt: "2026-07-01T12:00:00", ...overrides }; }
function execution(overrides = {}) { return { executionRecordId: "execution-1", registeredTrialId: "retry-1", registeredTrialName: "Retry", sourceRetrialPlanId: engine.expectedRetrialPlanId("phase22-16-evaluation-trial-1"), status: "completed", startedAt: "2026-07-10T10:00:00", history: [{ fromStatus: "observing", toStatus: "completed", operator: "Owner", changedAt: "2026-07-12T10:00:00", reason: "manual completion", notes: "done" }], ...overrides }; }
const initialStore = { savedAt: "2026-07-01T12:00:00Z", evaluations: [initial()] };
const executionStore = { savedAt: "2026-07-12T10:00:00Z", executionRecords: [execution(), execution({ executionRecordId: "running", registeredTrialId: "retry-2", status: "observing" })] };

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.retrialResultComparisonFinalEvaluation.v1");
assert.deepStrictEqual(engine.COMPARISON_RESULTS, ["improved", "equivalent", "worsened", "insufficient_data", "stop_required"]);
assert.strictEqual(engine.eligibleExecutions(executionStore).length, 1, "completed/stopped only");
assert.strictEqual(engine.linkInitialEvaluation(execution(), initialStore).evaluationId, initial().evaluationId, "Phase22-16 linkage");
let comparison = engine.buildComparison(execution(), initial());
assert.strictEqual(comparison.finalResult, "pending", "human final result is separate and initially pending");
assert.strictEqual(comparison.initialStopReason, "initial limit"); assert.strictEqual(comparison.retrialSummary.completionReason, "manual completion");
assert.strictEqual(comparison.metrics.length, 3); assert.ok(comparison.metrics.every((metric) => ["initialValue", "retrialValue", "difference", "judgement", "comment"].every((field) => Object.prototype.hasOwnProperty.call(metric, field))));
let updated = engine.setRetrialSummary(comparison, { targetRaceCount: 4, validObservationCount: 4, abnormalityCount: 0 }); assert.ok(updated.updated); comparison = updated.comparison;
assert.strictEqual(comparison.recommendedResult, "improved"); assert.strictEqual(comparison.metrics.find((item) => item.metricId === "valid_observation_count").difference, 1);
updated = engine.updateMetric(comparison, "valid_observation_count", { retrialValue: 4, comment: "human checked" }); comparison = updated.comparison; assert.strictEqual(comparison.metrics[1].comment, "human checked"); assert.strictEqual(comparison.metrics[1].judgement, "improved");
const stopped = engine.setRetrialSummary(engine.buildComparison(execution({ status: "stopped", history: [{ fromStatus: "observing", toStatus: "stopped", operator: "Owner", changedAt: "x", reason: "safety stop" }] }), initial()), { targetRaceCount: 4, validObservationCount: 2, abnormalityCount: 1 }).comparison; assert.strictEqual(stopped.recommendedResult, "stop_required"); assert.strictEqual(stopped.retrialSummary.stopReason, "safety stop");
assert.strictEqual(engine.setRetrialSummary({ ...comparison, evaluationStatus: "finalized" }, {}).reason, "terminal_locked");

for (const status of ["awaiting_comparison", "compared", "awaiting_review", "reviewed", "awaiting_final_evaluation"]) { const result = engine.transitionStatus(comparison, status, "Owner", "2026-07-19T10:00:00", status); assert.ok(result.transitioned, status); comparison = result.comparison; }
assert.strictEqual(engine.transitionStatus(comparison, "draft", "Owner", "2026-07-19T10:01:00", "bad").reason, "invalid_transition");
assert.strictEqual(engine.finalizeComparison(comparison, "improved", "", "2026-07-19T11:00:00", "final").finalized, false);
let final = engine.finalizeComparison(comparison, "improved", "Evaluator", "2026-07-19T11:00:00", "human final", "reviewed"); assert.ok(final.finalized); comparison = final.comparison;
assert.strictEqual(comparison.recommendedResult, "improved"); assert.strictEqual(comparison.finalResult, "improved"); assert.strictEqual(comparison.finalEvaluator, "Evaluator");
assert.strictEqual(engine.transitionStatus(comparison, "awaiting_comparison", "Owner", "2026-07-19T12:00:00", "resume").reason, "terminal_locked");
assert.ok(engine.validateComparison(comparison, initialStore, executionStore).ok); assert.ok(!engine.validateComparison({ ...comparison, safety: { ...comparison.safety, autoAdopt: true } }, initialStore, executionStore).ok);

const storage = memoryStorage({ [engine.INITIAL_EVALUATION_STORAGE_KEY]: JSON.stringify(initialStore), [engine.RETRIAL_EXECUTION_STORAGE_KEY]: JSON.stringify(executionStore) }); const before16 = storage.getItem(engine.INITIAL_EVALUATION_STORAGE_KEY), before20 = storage.getItem(engine.RETRIAL_EXECUTION_STORAGE_KEY); const store = engine.normalizeStore({}, initialStore, executionStore); store.comparisons[0] = comparison; assert.ok(engine.saveStore(storage, store, new Date("2026-07-19T12:00:00Z")).saved); assert.strictEqual(storage.getItem(engine.INITIAL_EVALUATION_STORAGE_KEY), before16); assert.strictEqual(storage.getItem(engine.RETRIAL_EXECUTION_STORAGE_KEY), before20); assert.ok(engine.loadStore(memoryStorage({ [engine.STORAGE_KEY]: "{bad" }), initialStore, executionStore).rejected); assert.ok(engine.generatePlainText(store).includes("human final evaluation only"));
const index = read("index.html"), local = read("private-local.html"), css = read("dashboard.css"), readme = read("README.md"); assert.ok(index.includes('id="phase22-retrial-result-comparison-core"')); assert.ok(index.indexOf("phase22-20-retrial-start-execution-status-management-core.js") < index.indexOf("phase22-21-retrial-result-comparison-final-evaluation-core.js")); assert.ok(local.includes('href="index.html#phase22-retrial-result-comparison-core"')); assert.ok(local.includes("phase22-21-retrial-result-comparison-final-evaluation-core.js")); assert.ok(css.includes(".phase22-retrial-comparison-core")); assert.ok(readme.includes(engine.STORAGE_KEY));
const safety = engine.buildSafety(); ["planOnly", "protectedMode", "privateLocal", "comparisonOnly", "humanFinalEvaluationOnly"].forEach((key) => assert.strictEqual(safety[key], true)); ["automaticPurchase", "automaticApply", "automaticLearning", "automaticUpdate", "autoStart", "autoAdopt", "autoStop", "autoContinue", "autoProductionApply", "predictionMutation", "bettingMutation", "ruleApplicationMutation", "learningMutation", "sourceMutation", "publicUrl", "githubPages", "externalApi"].forEach((key) => assert.strictEqual(safety[key], false));
console.log("phase22RetrialResultComparisonFinalEvaluationCore tests passed");
