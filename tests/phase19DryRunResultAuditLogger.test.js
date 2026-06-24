const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-dry-run-result-audit-logger.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-12");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "e4c0f87");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.AUDIT_RESULT_STATUSES, ["audit_passed", "audit_warning", "audit_hold", "audit_blocked", "protected_only", "plan_only_audit"]);
assert.deepEqual(engine.SAFETY_RESULTS, ["safety_ok", "safety_warning", "safety_hold", "safety_blocked", "protected_only"]);
assert.deepEqual(engine.STOP_CONDITION_RESULTS, ["no_stop_condition", "stop_condition_warning", "stop_condition_hold", "stop_condition_triggered", "protected_stop"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);
for (const asset of ["phase19-validation-dry-run-db.json", "phase19-validation-dry-run-summary-db.json", "phase19-validation-scenario-db.json", "phase19-validation-readiness-checklist-db.json", "phase19-connection-readiness-matrix-db.json"]) assert.ok(engine.SOURCE_ASSETS.includes(asset));

const sources = {
  dryRunDatabase: readJson("phase19-validation-dry-run-db.json"),
  dryRunSummary: readJson("phase19-validation-dry-run-summary-db.json"),
  scenarioDatabase: readJson("phase19-validation-scenario-db.json"),
  scenarioSummary: readJson("phase19-validation-scenario-summary-db.json"),
  checklistDatabase: readJson("phase19-validation-readiness-checklist-db.json"),
  checklistSummary: readJson("phase19-validation-readiness-summary-db.json"),
  matrixDatabase: readJson("phase19-connection-readiness-matrix-db.json"),
  matrixSummary: readJson("phase19-connection-readiness-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const audit = engine.buildDryRunResultAuditLogs(sources, () => new Date("2026-06-23T00:00:00.000Z"));
assert.equal(audit.audit_logger_status, "audit_logger_plan_only");
assert.equal(audit.source_dry_run_planner_status, "dry_run_planner_plan_only");
assert.equal(audit.source_scenario_status, "scenario_builder_plan_only");
assert.equal(audit.source_checklist_status, "checklist_builder_plan_only");
assert.equal(audit.source_matrix_status, "readiness_matrix_plan_only");
assert.equal(audit.official_release_protected, true);
assert.equal(audit.plan_only_enforced, true);
assert.equal(audit.connection_authority_issued, false);
assert.equal(audit.records.length, 6);
assert.deepEqual(audit.records.map((item) => item.audit_result_status), ["audit_passed", "protected_only", "audit_passed", "audit_passed", "plan_only_audit", "plan_only_audit"]);
assert.deepEqual(audit.records.map((item) => item.safety_result), ["safety_ok", "protected_only", "safety_ok", "safety_ok", "safety_ok", "safety_ok"]);
assert.deepEqual(audit.records.map((item) => item.stop_condition_result), ["no_stop_condition", "protected_stop", "no_stop_condition", "no_stop_condition", "no_stop_condition", "no_stop_condition"]);
assert.deepEqual(audit.audit_summary, {
  total: 6,
  audit_results: {
    audit_passed: 3,
    audit_warning: 0,
    audit_hold: 0,
    audit_blocked: 0,
    protected_only: 1,
    plan_only_audit: 2
  },
  safety_results: {
    safety_ok: 5,
    safety_warning: 0,
    safety_hold: 0,
    safety_blocked: 0,
    protected_only: 1
  },
  stop_condition_results: {
    no_stop_condition: 5,
    stop_condition_warning: 0,
    stop_condition_hold: 0,
    stop_condition_triggered: 0,
    protected_stop: 1
  },
  unsafe_flags_count: 0,
  missing_source_count: 0,
  pseudo_observation_only: true
});
for (const row of audit.records) {
  for (const field of ["audit_log_id", "dry_run_id", "checklist_id", "scenario_id", "node_name", "category", "priority_id", "dry_run_status", "audit_result_status", "observed_result", "safety_result", "stop_condition_result", "log_summary", "audit_notes", "recommended_next_action", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.AUDIT_RESULT_STATUSES.includes(row.audit_result_status));
  assert.ok(engine.SAFETY_RESULTS.includes(row.safety_result));
  assert.ok(engine.STOP_CONDITION_RESULTS.includes(row.stop_condition_result));
  assert.match(row.observed_result, /^pseudo_observed:/);
  assert.equal(row.log_summary.pseudo_log_only, true);
  assert.equal(row.log_summary.execution_allowed, false);
  assert.equal(row.log_summary.external_connection_allowed, false);
  assert.ok(row.audit_notes.includes("pseudo_observation_only"));
  assert.ok(row.audit_notes.includes("no_real_execution"));
  assert.ok(row.audit_notes.includes("no_external_connection"));
  assert.match(row.recommended_next_action, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
assert.equal(audit.records.find((item) => item.category === "race_course_os").audit_result_status, "protected_only");
assert.equal(audit.records.find((item) => item.category === "race_course_os").stop_condition_result, "protected_stop");
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(audit[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.dryRunSummary.connection_authority_issued = true;
const unsafeAudit = engine.buildDryRunResultAuditLogs(unsafeSources);
assert.equal(unsafeAudit.audit_logger_status, "audit_logger_blocked");
assert.ok(unsafeAudit.audit_summary.unsafe_flags_count > 0);
assert.equal(unsafeAudit.records.filter((item) => item.audit_result_status === "audit_blocked").length, 5);

const missingSourceAudit = engine.buildDryRunResultAuditLogs({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSourceAudit.audit_logger_status, "audit_logger_blocked");
assert.equal(missingSourceAudit.audit_summary.missing_source_count, 1);

const auditLogDb = readJson("phase19-dry-run-result-audit-log-db.json");
const summaryDb = readJson("phase19-dry-run-result-audit-summary-db.json");
assert.equal(auditLogDb.phase, "Phase19-12");
assert.deepEqual(auditLogDb.records, audit.records);
assert.deepEqual(summaryDb.audit_summary, audit.audit_summary);
assert.equal(summaryDb.audit_logger_status, "audit_logger_plan_only");
for (const database of [auditLogDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-dry-run-result-audit-logger"'));
assert.ok(index.includes('<script src="phase19-dry-run-result-audit-logger.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-dry-run-result-audit-logger"'));
assert.ok(readme.includes("Phase19-12 Global Network Dry Run Result Audit Logger"));
assert.ok(readme.includes("Phase19-11 Validation Dry Run Planner"));
assert.ok(readme.includes("Phase19 Dry Run結果監査ログ"));
assert.equal(summaryDb.next_validation_step, "Phase19-13 Global Network PreConnection Risk Reassessment");

console.log("phase19 dry run result audit logger tests passed");
