const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-preconnection-simulation-planner.js");

assert.equal(engine.PHASE, "Phase19-3");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "04f3d98");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.SIMULATION_MODES, ["simulation_only", "validation_only", "audit_only", "report_only", "protected_only"]);
assert.deepEqual(engine.STOP_CONDITIONS, ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const root = path.resolve(__dirname, "..");
const blueprint = JSON.parse(fs.readFileSync(path.join(root, "phase19-integration-blueprint-db.json"), "utf8"));
const safetyContract = JSON.parse(fs.readFileSync(path.join(root, "phase19-safety-contract-db.json"), "utf8"));
const priorityDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-node-priority-db.json"), "utf8"));
const validationDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-validation-sequence-db.json"), "utf8"));
const plan = engine.buildSimulationPlanner({ blueprint, safetyContract, priorityDatabase, validationDatabase, availableSources: engine.SOURCE_ASSETS }, () => new Date("2026-06-22T00:00:00.000Z"));

assert.equal(plan.planner_status, "simulation_plan_ready");
assert.equal(plan.source_blueprint_status, "plan_only_blueprint");
assert.equal(plan.source_priority_status, "priority_plan_ready");
assert.equal(plan.official_release_protected, true);
assert.equal(plan.plans.length, 6);
assert.deepEqual(plan.plans.map((item) => item.simulation_order), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(plan.plans.map((item) => item.simulation_mode), ["simulation_only", "protected_only", "simulation_only", "validation_only", "audit_only", "report_only"]);
for (const item of plan.plans) {
  for (const field of ["simulation_plan_id", "node_name", "category", "priority_id", "simulation_order", "simulation_mode", "required_checks", "stop_conditions", "audit_requirements", "expected_output", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(item, field), `${field} required`);
  assert.ok(engine.SIMULATION_MODES.includes(item.simulation_mode));
  assert.deepEqual(item.stop_conditions, engine.STOP_CONDITIONS);
  assert.deepEqual(item.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(item.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(item.execution_allowed, false);
  assert.equal(item.external_connection_allowed, false);
}
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(plan[field], false, `${field} must remain false`);
assert.equal(plan.plans.find((item) => item.category === "race_course_os").simulation_mode, "protected_only");

const warning = engine.buildSimulationPlanner({ blueprint, safetyContract, priorityDatabase, validationDatabase, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(warning.planner_status, "simulation_plan_warning");
const blocked = engine.buildSimulationPlanner({ blueprint, safetyContract: { ...safetyContract, executionAllowed: true }, priorityDatabase, validationDatabase, availableSources: engine.SOURCE_ASSETS });
assert.equal(blocked.planner_status, "simulation_plan_blocked");
assert.ok(blocked.plans.filter((item) => item.simulation_mode !== "protected_only").every((item) => item.simulation_mode === "validation_only"));

for (const source of engine.SOURCE_ASSETS) assert.ok(fs.existsSync(path.join(root, source)), `${source} source exists`);
const planDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-preconnection-simulation-plan-db.json"), "utf8"));
const stopDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-preconnection-stop-condition-db.json"), "utf8"));
assert.equal(planDatabase.records.length, 6);
assert.deepEqual(planDatabase.records.map((item) => item.simulation_mode), plan.plans.map((item) => item.simulation_mode));
assert.deepEqual(stopDatabase.stop_conditions.map((item) => item.condition), engine.STOP_CONDITIONS);
for (const database of [planDatabase, stopDatabase]) {
  assert.equal(database.phase, "Phase19-3");
  assert.equal(database.official_release_protected, true);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(index.includes('id="phase19-preconnection-simulation-planner"'));
assert.ok(index.includes('<script src="phase19-preconnection-simulation-planner.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-preconnection-simulation-planner"'));
assert.ok(readme.includes("Phase19-3 Global Intelligence Network Pre-Connection Simulation Planner"));

console.log("phase19 pre-connection simulation planner tests passed");
