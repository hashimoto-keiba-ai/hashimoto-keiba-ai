const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-connection-readiness-matrix.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-8");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "4c030d1");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.READINESS_STATUSES, ["readiness_plan_only", "readiness_ready_for_simulation", "readiness_needs_validation", "readiness_hold", "readiness_blocked", "protected_only"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  priorityDatabase: readJson("phase19-node-priority-db.json"),
  resultDatabase: readJson("phase19-simulation-result-db.json"),
  approvalDatabase: readJson("phase19-preconnection-approval-db.json"),
  finalReviewDatabase: readJson("phase19-final-preconnection-safety-review-db.json"),
  finalRiskSummary: readJson("phase19-final-risk-summary-db.json"),
  midphaseAudit: readJson("phase19-midphase-integrity-audit-db.json"),
  midphaseSummary: readJson("phase19-midphase-integrity-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const matrix = engine.buildConnectionReadinessMatrix(sources, () => new Date("2026-06-23T00:00:00.000Z"));
assert.equal(matrix.matrix_status, "readiness_matrix_plan_only");
assert.equal(matrix.source_midphase_status, "plan_only_midphase");
assert.equal(matrix.source_remaining_risk_summary, "no_remaining_risk");
assert.equal(matrix.source_recommended_next_phase, "Phase19-8");
assert.equal(matrix.official_release_protected, true);
assert.equal(matrix.plan_only_enforced, true);
assert.equal(matrix.connection_authority_issued, false);
assert.equal(matrix.records.length, 6);
assert.deepEqual(matrix.records.map((item) => item.readiness_status), ["readiness_ready_for_simulation", "protected_only", "readiness_ready_for_simulation", "readiness_ready_for_simulation", "readiness_plan_only", "readiness_plan_only"]);
assert.deepEqual(matrix.readiness_summary, {
  total: 6,
  readiness_plan_only: 2,
  readiness_ready_for_simulation: 3,
  readiness_needs_validation: 0,
  readiness_hold: 0,
  readiness_blocked: 0,
  protected_only: 1,
  unsafe_flags_count: 0,
  missing_source_count: 0
});
for (const row of matrix.records) {
  for (const field of ["matrix_id", "node_name", "category", "priority_id", "readiness_status", "simulation_status", "approval_status", "final_review_status", "remaining_conditions", "safety_constraints", "next_validation_step", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.READINESS_STATUSES.includes(row.readiness_status));
  assert.match(row.next_validation_step, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
assert.equal(matrix.records.find((item) => item.category === "race_course_os").readiness_status, "protected_only");
assert.ok(matrix.records.find((item) => item.priority_id === "P19-PRI-004").remaining_conditions.includes("repeat_isolated_validation_review"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(matrix[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.finalRiskSummary.connection_authority_issued = true;
const unsafeMatrix = engine.buildConnectionReadinessMatrix(unsafeSources);
assert.equal(unsafeMatrix.matrix_status, "readiness_matrix_blocked");
assert.ok(unsafeMatrix.readiness_summary.unsafe_flags_count > 0);
assert.equal(unsafeMatrix.records.filter((item) => item.readiness_status === "readiness_blocked").length, 5);

const blockedMidphaseSources = JSON.parse(JSON.stringify(sources));
blockedMidphaseSources.midphaseAudit.phase19_midphase_status = "midphase_warning";
const blockedMidphase = engine.buildConnectionReadinessMatrix(blockedMidphaseSources);
assert.equal(blockedMidphase.records.filter((item) => item.readiness_status === "readiness_blocked").length, 5);

const matrixDb = readJson("phase19-connection-readiness-matrix-db.json");
const summaryDb = readJson("phase19-connection-readiness-summary-db.json");
assert.equal(matrixDb.phase, "Phase19-8");
assert.deepEqual(matrixDb.records, matrix.records);
assert.deepEqual(summaryDb.readiness_summary, matrix.readiness_summary);
assert.equal(summaryDb.matrix_status, "readiness_matrix_plan_only");
for (const database of [matrixDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-connection-readiness-matrix"'));
assert.ok(index.includes('<script src="phase19-connection-readiness-matrix.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-connection-readiness-matrix"'));
assert.ok(readme.includes("Phase19-8 Global Network Connection Readiness Matrix"));

console.log("phase19 connection readiness matrix tests passed");
