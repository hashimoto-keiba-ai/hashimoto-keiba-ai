const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-validation-scenario-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.equal(engine.PHASE, "Phase19-9");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "2901f85");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.SCENARIO_STATUSES, ["scenario_ready", "scenario_plan_only", "scenario_needs_validation", "scenario_hold", "scenario_blocked", "protected_only"]);
assert.deepEqual(engine.VALIDATION_MODES, ["dry_run_only", "simulation_only", "validation_only", "audit_only", "report_only", "protected_only"]);
assert.deepEqual(engine.STOP_CONDITIONS, ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const sources = {
  matrixDatabase: readJson("phase19-connection-readiness-matrix-db.json"),
  matrixSummary: readJson("phase19-connection-readiness-summary-db.json"),
  safetyContract: readJson("phase19-safety-contract-db.json"),
  midphaseSummary: readJson("phase19-midphase-integrity-summary-db.json"),
  availableSources: engine.SOURCE_ASSETS
};

const scenarioSet = engine.buildValidationScenarios(sources, () => new Date("2026-06-23T00:00:00.000Z"));
assert.equal(scenarioSet.scenario_builder_status, "scenario_builder_plan_only");
assert.equal(scenarioSet.source_matrix_status, "readiness_matrix_plan_only");
assert.equal(scenarioSet.source_midphase_status, "plan_only_midphase");
assert.equal(scenarioSet.official_release_protected, true);
assert.equal(scenarioSet.plan_only_enforced, true);
assert.equal(scenarioSet.connection_authority_issued, false);
assert.equal(scenarioSet.records.length, 6);
assert.deepEqual(scenarioSet.records.map((item) => item.scenario_status), ["scenario_ready", "protected_only", "scenario_ready", "scenario_ready", "scenario_plan_only", "scenario_plan_only"]);
assert.deepEqual(scenarioSet.records.map((item) => item.validation_mode), ["simulation_only", "protected_only", "simulation_only", "validation_only", "audit_only", "report_only"]);
assert.deepEqual(scenarioSet.scenario_summary, {
  total: 6,
  scenario_ready: 3,
  scenario_plan_only: 2,
  scenario_needs_validation: 0,
  scenario_hold: 0,
  scenario_blocked: 0,
  protected_only: 1,
  validation_modes: {
    dry_run_only: 0,
    simulation_only: 2,
    validation_only: 1,
    audit_only: 1,
    report_only: 1,
    protected_only: 1
  },
  unsafe_flags_count: 0,
  missing_source_count: 0
});
for (const row of scenarioSet.records) {
  for (const field of ["scenario_id", "node_name", "category", "priority_id", "readiness_status", "scenario_status", "validation_mode", "validation_steps", "required_checks", "stop_conditions", "expected_outputs", "audit_focus", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(row, field), `${field} required`);
  assert.ok(engine.SCENARIO_STATUSES.includes(row.scenario_status));
  assert.ok(engine.VALIDATION_MODES.includes(row.validation_mode));
  for (const condition of engine.STOP_CONDITIONS) assert.ok(row.stop_conditions.includes(condition), `${condition} required`);
  assert.deepEqual(row.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(row.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(row.execution_allowed, false);
  assert.equal(row.external_connection_allowed, false);
}
assert.equal(scenarioSet.records.find((item) => item.category === "race_course_os").scenario_status, "protected_only");
assert.equal(scenarioSet.records.find((item) => item.category === "result_learning_engines").validation_mode, "validation_only");
assert.ok(scenarioSet.records.find((item) => item.category === "result_learning_engines").validation_steps.includes("confirm_repeat_isolated_validation_review"));
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(scenarioSet[field], false, `${field} must remain false`);

const unsafeSources = JSON.parse(JSON.stringify(sources));
unsafeSources.matrixSummary.connection_authority_issued = true;
const unsafeScenarioSet = engine.buildValidationScenarios(unsafeSources);
assert.equal(unsafeScenarioSet.scenario_builder_status, "scenario_builder_blocked");
assert.ok(unsafeScenarioSet.scenario_summary.unsafe_flags_count > 0);
assert.equal(unsafeScenarioSet.records.filter((item) => item.scenario_status === "scenario_blocked").length, 5);

const missingSourceSet = engine.buildValidationScenarios({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSourceSet.scenario_builder_status, "scenario_builder_blocked");
assert.equal(missingSourceSet.scenario_summary.missing_source_count, 1);

const scenarioDb = readJson("phase19-validation-scenario-db.json");
const summaryDb = readJson("phase19-validation-scenario-summary-db.json");
assert.equal(scenarioDb.phase, "Phase19-9");
assert.deepEqual(scenarioDb.records, scenarioSet.records);
assert.deepEqual(summaryDb.scenario_summary, scenarioSet.scenario_summary);
assert.equal(summaryDb.scenario_builder_status, "scenario_builder_plan_only");
assert.equal(summaryDb.next_validation_step, "Phase19-10 Global Network Validation Readiness Checklist");
for (const database of [scenarioDb, summaryDb]) {
  assert.equal(database.official_release_protected, true);
  assert.equal(database.connection_authority_issued, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-validation-scenario-builder"'));
assert.ok(index.includes('<script src="phase19-validation-scenario-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-validation-scenario-builder"'));
assert.ok(readme.includes("Phase19-9 Global Network Validation Scenario Builder"));
assert.ok(readme.includes("Phase19-8 Connection Readiness Matrix"));

console.log("phase19 validation scenario builder tests passed");
