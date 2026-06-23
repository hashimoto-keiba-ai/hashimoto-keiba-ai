const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-validation-dry-run-planner.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-11");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "7657d17");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.DRY_RUN_STATUSES, ["dry_run_ready", "dry_run_plan_only", "dry_run_needs_review", "dry_run_hold", "dry_run_blocked", "protected_only"]);
assert.deepEqual(engine.DRY_RUN_MODES, ["plan_only_dry_run", "simulation_dry_run", "validation_dry_run", "audit_dry_run", "report_dry_run", "protected_only"]);
assert.deepEqual(engine.STOP_CONDITIONS, ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  scenarioDatabase: readJson("phase19-validation-scenario-db.json"),
  scenarioSummary: readJson("phase19-validation-scenario-summary-db.json"),
  checklistDatabase: readJson("phase19-validation-readiness-checklist-db.json"),
  checklistSummary: readJson("phase19-validation-readiness-summary-db.json"),
  matrixDatabase: readJson("phase19-connection-readiness-matrix-db.json"),
  matrixSummary: readJson("phase19-connection-readiness-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const dryRun = engine.buildValidationDryRunPlans(sources, () => new Date("2026-06-23T00:00:00.000Z"));
assert.equal(dryRun.dry_run_planner_status, "dry_run_planner_plan_only");
assert.equal(dryRun.source_scenario_status, "scenario_builder_plan_only");
assert.equal(dryRun.source_checklist_status, "checklist_builder_plan_only");
assert.equal(dryRun.source_matrix_status, "readiness_matrix_plan_only");
assert.equal(dryRun.official_release_protected, true);
assert.equal(dryRun.plan_only_enforced, true);
assert.equal(dryRun.connection_authority_issued, false);
assert.equal(dryRun.records.length, 6);
assert.deepEqual(dryRun.records.map((item) => item.dry_run_status), ["dry_run_ready", "protected_only", "dry_run_ready", "dry_run_ready", "dry_run_plan_only", "dry_run_plan_only"]);
assert.deepEqual(dryRun.records.map((item) => item.dry_run_mode), ["simulation_dry_run", "protected_only", "simulation_dry_run", "validation_dry_run", "audit_dry_run", "report_dry_run"]);
assert.deepEqual(dryRun.dry_run_summary, {
  total: 6,
  dry_run_ready: 3,
  dry_run_plan_only: 2,
  dry_run_needs_review: 0,
  dry_run_hold: 0,
  dry_run_blocked: 0,
  protected_only: 1,
  dry_run_modes: {
    plan_only_dry_run: 0,
    simulation_dry_run: 2,
    validation_dry_run: 1,
    audit_dry_run: 1,
    report_dry_run: 1,
    protected_only: 1
  },
  unsafe_flags_count: 0,
  missing_source_count: 0
});
for (const row of dryRun.records) {
  for (const field of ["dry_run_id", "checklist_id", "scenario_id", "node_name", "category", "priority_id", "dry_run_status", "dry_run_mode", "dry_run_steps", "observation_points", "expected_logs", "stop_conditions", "audit_requirements", "recommended_next_action", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.DRY_RUN_STATUSES.includes(row.dry_run_status));
  assert.ok(engine.DRY_RUN_MODES.includes(row.dry_run_mode));
  for (const condition of engine.STOP_CONDITIONS) assert.ok(row.stop_conditions.includes(condition), `${condition} required`);
  assert.ok(row.expected_logs.includes("execution_allowed=false"));
  assert.ok(row.expected_logs.includes("external_connection_allowed=false"));
  assert.match(row.recommended_next_action, /^Recommended:/);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
assert.equal(dryRun.records.find((item) => item.category === "race_course_os").dry_run_status, "protected_only");
assert.equal(dryRun.records.find((item) => item.category === "result_learning_engines").dry_run_mode, "validation_dry_run");
assert.equal(dryRun.records.find((item) => item.category === "governance_engines").dry_run_mode, "audit_dry_run");
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(dryRun[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.checklistSummary.connection_authority_issued = true;
const unsafeDryRun = engine.buildValidationDryRunPlans(unsafeSources);
assert.equal(unsafeDryRun.dry_run_planner_status, "dry_run_planner_blocked");
assert.ok(unsafeDryRun.dry_run_summary.unsafe_flags_count > 0);
assert.equal(unsafeDryRun.records.filter((item) => item.dry_run_status === "dry_run_blocked").length, 5);

const missingSourceDryRun = engine.buildValidationDryRunPlans({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSourceDryRun.dry_run_planner_status, "dry_run_planner_blocked");
assert.equal(missingSourceDryRun.dry_run_summary.missing_source_count, 1);

const dryRunDb = readJson("phase19-validation-dry-run-db.json");
const summaryDb = readJson("phase19-validation-dry-run-summary-db.json");
assert.equal(dryRunDb.phase, "Phase19-11");
assert.deepEqual(dryRunDb.records, dryRun.records);
assert.deepEqual(summaryDb.dry_run_summary, dryRun.dry_run_summary);
assert.equal(summaryDb.dry_run_planner_status, "dry_run_planner_plan_only");
for (const database of [dryRunDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-validation-dry-run-planner"'));
assert.ok(index.includes('<script src="phase19-validation-dry-run-planner.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-validation-dry-run-planner"'));
assert.ok(readme.includes("Phase19-11 Global Network Validation Dry Run Planner"));
assert.ok(readme.includes("Phase19-10 Validation Readiness Checklist"));
assert.equal(summaryDb.next_validation_step, "Phase19-12 Global Network Dry Run Result Audit Logger");

console.log("phase19 validation dry run planner tests passed");
