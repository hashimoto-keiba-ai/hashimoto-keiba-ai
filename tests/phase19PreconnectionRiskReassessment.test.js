const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-preconnection-risk-reassessment.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-13");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "e6b228f");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.REASSESSMENT_STATUSES, ["reassessment_ready", "reassessment_warning", "reassessment_hold", "reassessment_blocked", "protected_only", "plan_only_reassessment"]);
assert.deepEqual(engine.RISK_LEVELS, ["none", "low", "medium", "high", "protected", "blocked"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);
for (const asset of ["phase19-dry-run-result-audit-log-db.json", "phase19-dry-run-result-audit-summary-db.json", "phase19-validation-dry-run-db.json", "phase19-connection-readiness-matrix-db.json"]) assert.ok(engine.SOURCE_ASSETS.includes(asset));

const sources = {
  auditDatabase: readJson("phase19-dry-run-result-audit-log-db.json"),
  auditSummary: readJson("phase19-dry-run-result-audit-summary-db.json"),
  matrixDatabase: readJson("phase19-connection-readiness-matrix-db.json"),
  matrixSummary: readJson("phase19-connection-readiness-summary-db.json"),
  scenarioDatabase: readJson("phase19-validation-scenario-db.json"),
  scenarioSummary: readJson("phase19-validation-scenario-summary-db.json"),
  checklistDatabase: readJson("phase19-validation-readiness-checklist-db.json"),
  checklistSummary: readJson("phase19-validation-readiness-summary-db.json"),
  dryRunDatabase: readJson("phase19-validation-dry-run-db.json"),
  dryRunSummary: readJson("phase19-validation-dry-run-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const reassessment = engine.buildPreconnectionRiskReassessment(sources, () => new Date("2026-06-24T00:00:00.000Z"));
assert.equal(reassessment.reassessment_engine_status, "risk_reassessment_plan_only");
assert.equal(reassessment.source_audit_logger_status, "audit_logger_plan_only");
assert.equal(reassessment.source_dry_run_planner_status, "dry_run_planner_plan_only");
assert.equal(reassessment.official_release_protected, true);
assert.equal(reassessment.plan_only_enforced, true);
assert.equal(reassessment.connection_authority_issued, false);
assert.equal(reassessment.records.length, 6);
assert.deepEqual(reassessment.records.map((item) => item.reassessment_status), ["reassessment_ready", "protected_only", "reassessment_ready", "reassessment_ready", "plan_only_reassessment", "plan_only_reassessment"]);
assert.deepEqual(reassessment.records.map((item) => item.risk_level), ["none", "protected", "none", "none", "low", "low"]);
assert.deepEqual(reassessment.risk_reassessment_summary, {
  total: 6,
  reassessment_statuses: {
    reassessment_ready: 3,
    reassessment_warning: 0,
    reassessment_hold: 0,
    reassessment_blocked: 0,
    protected_only: 1,
    plan_only_reassessment: 2
  },
  risk_levels: {
    none: 3,
    low: 2,
    medium: 0,
    high: 0,
    protected: 1,
    blocked: 0
  },
  unsafe_flags_count: 0,
  missing_source_count: 0,
  external_connection_blocked: true,
  auto_execution_blocked: true
});
for (const row of reassessment.records) {
  for (const field of ["reassessment_id", "audit_log_id", "dry_run_id", "node_name", "category", "priority_id", "reassessment_status", "risk_level", "audit_result_status", "safety_result", "stop_condition_result", "remaining_risks", "hold_reasons", "blocked_reasons", "recommended_next_validation", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.REASSESSMENT_STATUSES.includes(row.reassessment_status));
  assert.ok(engine.RISK_LEVELS.includes(row.risk_level));
  assert.ok(Array.isArray(row.remaining_risks));
  assert.ok(Array.isArray(row.hold_reasons));
  assert.ok(Array.isArray(row.blocked_reasons));
  assert.match(row.recommended_next_validation, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
const protectedNode = reassessment.records.find((item) => item.category === "race_course_os");
assert.equal(protectedNode.reassessment_status, "protected_only");
assert.equal(protectedNode.risk_level, "protected");
assert.ok(protectedNode.blocked_reasons.includes("protected_release_risk_blocks_connection_authority"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(reassessment[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.auditSummary.connection_authority_issued = true;
const unsafeReassessment = engine.buildPreconnectionRiskReassessment(unsafeSources);
assert.equal(unsafeReassessment.reassessment_engine_status, "risk_reassessment_blocked");
assert.ok(unsafeReassessment.risk_reassessment_summary.unsafe_flags_count > 0);
assert.equal(unsafeReassessment.records.filter((item) => item.reassessment_status === "reassessment_blocked").length, 5);

const missingSourceReassessment = engine.buildPreconnectionRiskReassessment({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSourceReassessment.reassessment_engine_status, "risk_reassessment_blocked");
assert.equal(missingSourceReassessment.risk_reassessment_summary.missing_source_count, 1);

const reassessmentDb = readJson("phase19-preconnection-risk-reassessment-db.json");
const summaryDb = readJson("phase19-preconnection-risk-reassessment-summary-db.json");
assert.equal(reassessmentDb.phase, "Phase19-13");
assert.deepEqual(reassessmentDb.records, reassessment.records);
assert.deepEqual(summaryDb.risk_reassessment_summary, reassessment.risk_reassessment_summary);
assert.equal(summaryDb.reassessment_engine_status, "risk_reassessment_plan_only");
for (const database of [reassessmentDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-preconnection-risk-reassessment"'));
assert.ok(index.includes('<script src="phase19-preconnection-risk-reassessment.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-preconnection-risk-reassessment"'));
assert.ok(readme.includes("Phase19-13 Global Network Pre-Connection Risk Reassessment"));
assert.ok(readme.includes("Phase19-12 Dry Run Result Audit Logger"));
assert.ok(readme.includes("Phase19 接続前リスク再評価"));

console.log("phase19 preconnection risk reassessment tests passed");
