const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-node-priority-planner.js");

assert.equal(engine.PHASE, "Phase19-2");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "47ddfbd");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.CATEGORIES, ["local_ai_modules", "race_course_os", "prediction_engines", "result_learning_engines", "governance_engines", "dashboard_engines"]);
assert.deepEqual(engine.DEPENDENCY_LEVELS, ["low", "medium", "high", "protected"]);
assert.deepEqual(engine.SAFETY_LEVELS, ["safe_plan_only", "caution", "blocked", "protected_only"]);
assert.deepEqual(engine.CONNECTION_READINESS, ["ready_for_simulation", "needs_validation", "blocked", "protected_only", "plan_only"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const blueprint = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "phase19-integration-blueprint-db.json"), "utf8"));
const safetyContract = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "phase19-safety-contract-db.json"), "utf8"));
const plan = engine.buildPriorityPlan({ blueprint, safetyContract, availableSources: engine.SOURCE_ASSETS }, () => new Date("2026-06-22T00:00:00.000Z"));
assert.equal(plan.planner_status, "priority_plan_ready");
assert.equal(plan.source_blueprint_status, "plan_only_blueprint");
assert.equal(plan.candidates.length, 6);
assert.deepEqual(plan.candidates.map((candidate) => candidate.category), engine.CATEGORIES);
assert.deepEqual(plan.candidates.map((candidate) => candidate.recommended_order), [1, 2, 3, 4, 5, 6]);
for (const candidate of plan.candidates) {
  for (const field of ["priority_id", "node_name", "category", "source_file", "dependency_level", "safety_level", "connection_readiness", "recommended_order", "required_validation", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"]) assert.ok(Object.hasOwn(candidate, field), `${field} required`);
  assert.ok(engine.DEPENDENCY_LEVELS.includes(candidate.dependency_level));
  assert.ok(engine.SAFETY_LEVELS.includes(candidate.safety_level));
  assert.ok(engine.CONNECTION_READINESS.includes(candidate.connection_readiness));
  assert.deepEqual(candidate.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(candidate.allowed_actions, engine.ALLOWED_ACTIONS);
  assert.equal(candidate.execution_allowed, false);
  assert.equal(candidate.external_connection_allowed, false);
}
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(plan[field], false, `${field} must remain false`);
assert.equal(plan.candidates.find((candidate) => candidate.category === "race_course_os").safety_level, "protected_only");
assert.equal(plan.candidates.find((candidate) => candidate.category === "race_course_os").connection_readiness, "protected_only");

const warning = engine.buildPriorityPlan({ blueprint: { ...blueprint, integration_status: "blueprint_warning" }, safetyContract, availableSources: engine.SOURCE_ASSETS.slice(1) });
assert.equal(warning.planner_status, "priority_warning");
const blocked = engine.buildPriorityPlan({ blueprint: { ...blueprint, integration_status: "blueprint_blocked" }, safetyContract, availableSources: engine.SOURCE_ASSETS });
assert.equal(blocked.planner_status, "priority_blocked");
assert.ok(blocked.candidates.filter((candidate) => candidate.safety_level !== "protected_only").every((candidate) => candidate.connection_readiness === "blocked"));

const root = path.resolve(__dirname, "..");
for (const source of engine.SOURCE_ASSETS) assert.ok(fs.existsSync(path.join(root, source)), `${source} source exists`);
for (const candidate of plan.candidates) assert.ok(fs.existsSync(path.join(root, candidate.source_file)), `${candidate.source_file} candidate source exists`);
const priorityDb = JSON.parse(fs.readFileSync(path.join(root, "phase19-node-priority-db.json"), "utf8"));
const sequenceDb = JSON.parse(fs.readFileSync(path.join(root, "phase19-validation-sequence-db.json"), "utf8"));
assert.equal(priorityDb.records.length, 6);
assert.equal(sequenceDb.sequence.length, 6);
for (const db of [priorityDb, sequenceDb]) {
  assert.equal(db.phase, "Phase19-2");
  assert.equal(db.external_connection_allowed, false);
  assert.deepEqual(db.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(db.allowed_actions, engine.ALLOWED_ACTIONS);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(index.includes('id="phase19-node-priority-planner"'));
assert.ok(index.includes('<script src="phase19-node-priority-planner.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-node-priority-planner"'));
assert.ok(readme.includes("Phase19-2 Global Intelligence Network Node Priority Planner"));

console.log("phase19 node priority planner tests passed");
