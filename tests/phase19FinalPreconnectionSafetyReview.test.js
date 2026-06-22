const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-final-preconnection-safety-review.js");

assert.equal(engine.PHASE, "Phase19-6");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "a2297d0");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.FINAL_REVIEW_STATUSES, ["final_review_ready", "final_review_warning", "final_review_blocked", "protected_only", "plan_only_review"]);
assert.deepEqual(engine.REMAINING_RISK_LEVELS, ["none", "low", "medium", "high", "protected", "blocked"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const root = path.resolve(__dirname, "..");
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const sourceNames = {
  blueprint: "phase19-integration-blueprint-db.json",
  safetyContract: "phase19-safety-contract-db.json",
  priorityDatabase: "phase19-node-priority-db.json",
  validationDatabase: "phase19-validation-sequence-db.json",
  simulationDatabase: "phase19-preconnection-simulation-plan-db.json",
  stopDatabase: "phase19-preconnection-stop-condition-db.json",
  resultDatabase: "phase19-simulation-result-db.json",
  evaluationSummary: "phase19-simulation-evaluation-summary-db.json",
  approvalDatabase: "phase19-preconnection-approval-db.json",
  approvalSummary: "phase19-preconnection-approval-summary-db.json"
};
const sources = Object.fromEntries(Object.entries(sourceNames).map(([key, name]) => [key, load(name)]));
sources.availableSources = engine.SOURCE_ASSETS;
const review = engine.buildFinalSafetyReview(sources, () => new Date("2026-06-22T00:00:00.000Z"));

assert.equal(review.overall_status, "final_review_warning");
assert.equal(review.connection_authority_issued, false);
assert.equal(review.official_release_protected, true);
assert.equal(review.reviews.length, 6);
assert.deepEqual(review.reviews.map((item) => item.final_review_status), ["final_review_ready", "protected_only", "final_review_ready", "final_review_warning", "plan_only_review", "plan_only_review"]);
assert.deepEqual(review.reviews.map((item) => item.remaining_risk_level), ["none", "protected", "none", "medium", "low", "low"]);
assert.deepEqual(review.review_summary, { total: 6, ready: 2, warning: 1, blocked: 0, protected: 1, plan_only: 2 });
assert.deepEqual(review.remaining_risk_summary, { none: 2, low: 2, medium: 1, high: 0, protected: 1, blocked: 0 });
for (const item of review.reviews) {
  for (const field of ["review_id", "node_name", "category", "priority_id", "approval_id", "final_review_status", "safety_contract_status", "approval_gate_status", "simulation_result_status", "remaining_risk_level", "unresolved_items", "final_blocked_reason", "recommended_next_validation", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(item, field), `${field} required`);
  assert.ok(engine.FINAL_REVIEW_STATUSES.includes(item.final_review_status));
  assert.ok(engine.REMAINING_RISK_LEVELS.includes(item.remaining_risk_level));
  assert.match(item.recommended_next_validation, /^Recommended:/);
  assert.deepEqual(item.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(item.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(item.execution_allowed, false);
  assert.equal(item.external_connection_allowed, false);
}
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(review[field], false, `${field} must remain false`);
assert.equal(review.reviews.find((item) => item.category === "race_course_os").remaining_risk_level, "protected");
assert.ok(review.reviews.filter((item) => item.final_review_status === "final_review_ready").every((item) => item.external_connection_allowed === false));

const blocked = engine.buildFinalSafetyReview({ ...sources, safetyContract: { ...sources.safetyContract, executionAllowed: true } });
assert.equal(blocked.overall_status, "final_review_blocked");
assert.equal(blocked.review_summary.blocked, 5);
const resultMissingDatabase = { ...sources.resultDatabase, records: sources.resultDatabase.records.filter((item) => item.result_id !== "P19-RESULT-003") };
const missingResult = engine.buildFinalSafetyReview({ ...sources, resultDatabase: resultMissingDatabase });
const missingResultReview = missingResult.reviews.find((item) => item.approval_id === "P19-APPROVAL-003");
assert.equal(missingResultReview.final_review_status, "final_review_blocked");
assert.equal(missingResultReview.remaining_risk_level, "high");
const missingSource = engine.buildFinalSafetyReview({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSource.overall_status, "final_review_warning");
assert.equal(missingSource.review_summary.warning, 5);

for (const source of engine.SOURCE_ASSETS) assert.ok(fs.existsSync(path.join(root, source)), `${source} source exists`);
const reviewDatabase = load("phase19-final-preconnection-safety-review-db.json");
const riskDatabase = load("phase19-final-risk-summary-db.json");
assert.equal(reviewDatabase.records.length, 6);
assert.deepEqual(reviewDatabase.records.map((item) => item.final_review_status), review.reviews.map((item) => item.final_review_status));
assert.deepEqual(riskDatabase.review_summary, review.review_summary);
assert.deepEqual(riskDatabase.remaining_risk_summary, review.remaining_risk_summary);
for (const database of [reviewDatabase, riskDatabase]) {
  assert.equal(database.phase, "Phase19-6");
  assert.equal(database.connection_authority_issued, false);
  assert.equal(database.official_release_protected, true);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(index.includes('id="phase19-final-preconnection-safety-review"'));
assert.ok(index.includes('<script src="phase19-final-preconnection-safety-review.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-final-preconnection-safety-review"'));
assert.ok(readme.includes("Phase19-6 Global Network Final Pre-Connection Safety Review"));

console.log("phase19 final pre-connection safety review tests passed");
