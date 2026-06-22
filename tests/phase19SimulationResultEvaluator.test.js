const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-simulation-result-evaluator.js");

assert.equal(engine.PHASE, "Phase19-4");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "2035376");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.EVALUATION_STATUSES, ["simulation_passed", "simulation_warning", "simulation_blocked", "protected_only", "plan_only_result"]);
assert.deepEqual(engine.SAFETY_CHECK_RESULTS, ["safety_ok", "safety_warning", "safety_blocked", "protected_only"]);
assert.deepEqual(engine.DEPENDENCY_CHECK_RESULTS, ["dependency_ok", "dependency_warning", "dependency_blocked", "dependency_missing"]);
assert.deepEqual(engine.STOP_CONDITION_RESULTS, ["no_stop_condition", "stop_condition_warning", "stop_condition_triggered", "protected_stop"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const root = path.resolve(__dirname, "..");
const blueprint = JSON.parse(fs.readFileSync(path.join(root, "phase19-integration-blueprint-db.json"), "utf8"));
const safetyContract = JSON.parse(fs.readFileSync(path.join(root, "phase19-safety-contract-db.json"), "utf8"));
const priorityDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-node-priority-db.json"), "utf8"));
const validationDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-validation-sequence-db.json"), "utf8"));
const simulationDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-preconnection-simulation-plan-db.json"), "utf8"));
const stopDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-preconnection-stop-condition-db.json"), "utf8"));
const sources = { blueprint, safetyContract, priorityDatabase, validationDatabase, simulationDatabase, stopDatabase, availableSources: engine.SOURCE_ASSETS };
const evaluation = engine.buildSimulationEvaluation(sources, () => new Date("2026-06-22T00:00:00.000Z"));

assert.equal(evaluation.evaluator_status, "evaluation_ready");
assert.equal(evaluation.official_release_protected, true);
assert.equal(evaluation.results.length, 6);
assert.deepEqual(evaluation.results.map((item) => item.simulation_order), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(evaluation.results.map((item) => item.evaluation_status), ["simulation_passed", "protected_only", "simulation_passed", "simulation_passed", "plan_only_result", "plan_only_result"]);
assert.deepEqual(evaluation.evaluation_summary, { total: 6, passed: 3, warnings: 0, blocked: 0, protected: 1, plan_only: 2 });
assert.equal(evaluation.results.find((item) => item.simulation_plan_id === "P19-SIM-004").safety_check_result, "safety_ok");
const explicitWarning = engine.buildSimulationEvaluation({ ...sources, warningPlans: ["P19-SIM-004"] });
assert.equal(explicitWarning.results.find((item) => item.simulation_plan_id === "P19-SIM-004").evaluation_status, "simulation_warning");
for (const result of evaluation.results) {
  for (const field of ["result_id", "simulation_plan_id", "node_name", "category", "simulation_order", "evaluation_status", "safety_check_result", "dependency_check_result", "stop_condition_result", "audit_result", "recommended_next_action", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(result, field), `${field} required`);
  assert.ok(engine.EVALUATION_STATUSES.includes(result.evaluation_status));
  assert.ok(engine.SAFETY_CHECK_RESULTS.includes(result.safety_check_result));
  assert.ok(engine.DEPENDENCY_CHECK_RESULTS.includes(result.dependency_check_result));
  assert.ok(engine.STOP_CONDITION_RESULTS.includes(result.stop_condition_result));
  assert.match(result.recommended_next_action, /^Recommended:/);
  assert.deepEqual(result.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(result.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(result.execution_allowed, false);
  assert.equal(result.external_connection_allowed, false);
}
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(evaluation[field], false, `${field} must remain false`);
const protectedResult = evaluation.results.find((item) => item.category === "race_course_os");
assert.equal(protectedResult.safety_check_result, "protected_only");
assert.equal(protectedResult.stop_condition_result, "protected_stop");

const blocked = engine.buildSimulationEvaluation({ ...sources, safetyContract: { ...safetyContract, executionAllowed: true } });
assert.equal(blocked.evaluator_status, "evaluation_blocked");
assert.equal(blocked.evaluation_summary.blocked, 5);
const missingDependency = engine.buildSimulationEvaluation({ ...sources, missingDependencies: ["P19-SIM-003"] });
assert.equal(missingDependency.evaluator_status, "evaluation_blocked");
assert.equal(missingDependency.results.find((item) => item.simulation_plan_id === "P19-SIM-003").dependency_check_result, "dependency_missing");
const missingSource = engine.buildSimulationEvaluation({ ...sources, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(missingSource.evaluator_status, "evaluation_warning");

for (const source of engine.SOURCE_ASSETS) assert.ok(fs.existsSync(path.join(root, source)), `${source} source exists`);
const resultDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-simulation-result-db.json"), "utf8"));
const summaryDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-simulation-evaluation-summary-db.json"), "utf8"));
assert.equal(resultDatabase.records.length, 6);
assert.deepEqual(resultDatabase.records, evaluation.results);
assert.equal(summaryDatabase.audit_summary.total, 6);
assert.equal(summaryDatabase.audit_summary.blocked, 0);
for (const database of [resultDatabase, summaryDatabase]) {
  assert.equal(database.phase, "Phase19-4");
  assert.equal(database.official_release_protected, true);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
  for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(database[field], false, `${field} DB must remain false`);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(index.includes('id="phase19-simulation-result-evaluator"'));
assert.ok(index.includes('<script src="phase19-simulation-result-evaluator.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-simulation-result-evaluator"'));
assert.ok(readme.includes("Phase19-4 Global Network Simulation Result Evaluator"));

console.log("phase19 simulation result evaluator tests passed");
