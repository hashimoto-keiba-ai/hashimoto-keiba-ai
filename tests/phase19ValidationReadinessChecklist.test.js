const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-validation-readiness-checklist.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-10");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "1b78711");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.CHECKLIST_STATUSES, ["checklist_ready", "checklist_plan_only", "checklist_needs_review", "checklist_hold", "checklist_blocked", "protected_only"]);
assert.deepEqual(engine.STOP_CONDITIONS, ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  matrixDatabase: readJson("phase19-connection-readiness-matrix-db.json"),
  matrixSummary: readJson("phase19-connection-readiness-summary-db.json"),
  scenarioDatabase: readJson("phase19-validation-scenario-db.json"),
  scenarioSummary: readJson("phase19-validation-scenario-summary-db.json"),
  safetyContract: readJson("phase19-safety-contract-db.json"),
  midphaseSummary: readJson("phase19-midphase-integrity-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const checklist = engine.buildValidationReadinessChecklist(sources, () => new Date("2026-06-23T00:00:00.000Z"));
assert.equal(checklist.checklist_builder_status, "checklist_builder_plan_only");
assert.equal(checklist.source_matrix_status, "readiness_matrix_plan_only");
assert.equal(checklist.source_scenario_status, "scenario_builder_plan_only");
assert.equal(checklist.source_midphase_status, "plan_only_midphase");
assert.equal(checklist.official_release_protected, true);
assert.equal(checklist.plan_only_enforced, true);
assert.equal(checklist.connection_authority_issued, false);
assert.equal(checklist.records.length, 6);
assert.deepEqual(checklist.records.map((item) => item.checklist_status), ["checklist_ready", "protected_only", "checklist_ready", "checklist_ready", "checklist_plan_only", "checklist_plan_only"]);
assert.deepEqual(checklist.checklist_summary, {
  total: 6,
  checklist_ready: 3,
  checklist_plan_only: 2,
  checklist_needs_review: 0,
  checklist_hold: 0,
  checklist_blocked: 0,
  protected_only: 1,
  unsafe_flags_count: 0,
  missing_source_count: 0
});
for (const row of checklist.records) {
  for (const field of ["checklist_id", "scenario_id", "node_name", "category", "priority_id", "readiness_status", "scenario_status", "checklist_status", "required_prechecks", "unresolved_items", "safety_constraints", "stop_conditions", "audit_requirements", "recommended_next_action", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.CHECKLIST_STATUSES.includes(row.checklist_status));
  for (const condition of engine.STOP_CONDITIONS) assert.ok(row.stop_conditions.includes(condition), `${condition} required`);
  assert.ok(row.required_prechecks.includes("confirm_execution_allowed_false"));
  assert.ok(row.required_prechecks.includes("confirm_external_connection_allowed_false"));
  assert.match(row.recommended_next_action, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
assert.deepEqual(checklist.records.find((item) => item.category === "race_course_os").unresolved_items, ["permanent_release_protection"]);
assert.ok(checklist.records.find((item) => item.category === "race_course_os").safety_constraints.includes("Official Release v2.8 protected_only"));
assert.ok(checklist.records.find((item) => item.category === "result_learning_engines").required_prechecks.includes("confirm_repeat_isolated_validation_review"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(checklist[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.scenarioSummary.connection_authority_issued = true;
const unsafeChecklist = engine.buildValidationReadinessChecklist(unsafeSources);
assert.equal(unsafeChecklist.checklist_builder_status, "checklist_builder_blocked");
assert.ok(unsafeChecklist.checklist_summary.unsafe_flags_count > 0);
assert.equal(unsafeChecklist.records.filter((item) => item.checklist_status === "checklist_blocked").length, 5);

const missingSourceChecklist = engine.buildValidationReadinessChecklist({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSourceChecklist.checklist_builder_status, "checklist_builder_blocked");
assert.equal(missingSourceChecklist.checklist_summary.missing_source_count, 1);

const checklistDb = readJson("phase19-validation-readiness-checklist-db.json");
const summaryDb = readJson("phase19-validation-readiness-summary-db.json");
assert.equal(checklistDb.phase, "Phase19-10");
assert.deepEqual(checklistDb.records, checklist.records);
assert.deepEqual(summaryDb.checklist_summary, checklist.checklist_summary);
assert.equal(summaryDb.checklist_builder_status, "checklist_builder_plan_only");
assert.equal(summaryDb.next_validation_step, "Phase19-11 Global Network Validation Dry Run Planner");
for (const database of [checklistDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-validation-readiness-checklist"'));
assert.ok(index.includes('<script src="phase19-validation-readiness-checklist.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-validation-readiness-checklist"'));
assert.ok(readme.includes("Phase19-10 Global Network Validation Readiness Checklist"));
assert.ok(readme.includes("Phase19-9 Validation Scenario Builder"));

console.log("phase19 validation readiness checklist tests passed");
