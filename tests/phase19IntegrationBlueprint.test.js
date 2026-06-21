const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase19-integration-blueprint.js");

assert.equal(engine.PHASE, "Phase19-1");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "a240e52");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.INTEGRATION_STATUSES, ["blueprint_ready", "blueprint_warning", "blueprint_blocked", "plan_only_blueprint", "protected_only"]);
assert.deepEqual(engine.TARGET_NETWORK_SCOPE, ["local_ai_modules", "race_course_os", "prediction_engines", "result_learning_engines", "governance_engines", "dashboard_engines"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const blueprint = engine.buildIntegrationBlueprint({ phase18Status: { phase18_final_status: "phase18_complete", phase19_readiness_status: "phase19_ready", remaining_risks: [] }, availableSources: engine.SOURCE_ASSETS }, () => new Date("2026-06-22T00:00:00.000Z"));
for (const field of ["blueprint_id", "phase", "integration_status", "source_phase18_status", "target_network_scope", "planned_nodes", "dependency_map", "safety_contract", "blocked_actions", "allowed_actions", "recommended_sequence", "next_validation_step"]) assert.ok(Object.hasOwn(blueprint, field), `${field} is required`);
assert.equal(blueprint.integration_status, "plan_only_blueprint");
assert.equal(blueprint.source_phase18_status.phase18_final_status, "phase18_complete");
assert.equal(blueprint.source_phase18_status.phase19_readiness_status, "phase19_ready");
assert.equal(blueprint.source_phase18_status.remaining_risks, 0);
assert.equal(blueprint.planned_nodes.length, 9);
assert.equal(blueprint.target_network_scope.length, 6);
assert.equal(blueprint.recommended_sequence.length, 6);
assert.deepEqual(blueprint.blocked_actions, engine.BLOCKED_ACTIONS);
assert.deepEqual(blueprint.allowed_actions, engine.ALLOWED_ACTIONS);
assert.equal(blueprint.next_validation_step, "Phase19-2 Local Integration Simulation Validator");
for (const field of ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed"]) assert.equal(blueprint[field], false, `${field} must remain false`);
assert.equal(blueprint.safety_contract.official_release_protected, true);
assert.equal(blueprint.safety_contract.enforcement, "deny_by_default");

const warning = engine.buildIntegrationBlueprint({ phase18Status: { phase18_final_status: "phase18_complete", phase19_readiness_status: "phase19_ready", remaining_risks: 1 }, availableSources: engine.SOURCE_ASSETS });
assert.equal(warning.integration_status, "blueprint_warning");
const blocked = engine.buildIntegrationBlueprint({ phase18Status: { phase18_final_status: "phase18_blocked", phase19_readiness_status: "phase19_blocked", remaining_risks: 2 }, availableSources: engine.SOURCE_ASSETS });
assert.equal(blocked.integration_status, "blueprint_blocked");
const protectedOnly = engine.buildIntegrationBlueprint({ protectedOnlyMode: true, availableSources: engine.SOURCE_ASSETS });
assert.equal(protectedOnly.integration_status, "protected_only");

const store = new Map();
const storage = { setItem: (key, value) => store.set(key, String(value)), getItem: (key) => store.get(key) || null };
engine.persistBlueprint(blueprint, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEY)).external_connection_allowed, false);

const root = path.resolve(__dirname, "..");
for (const file of engine.DATABASES) {
  const database = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(database.phase, "Phase19-1");
  assert.equal(database.external_connection_allowed, false);
  assert.deepEqual(database.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(database.allowed_actions, engine.ALLOWED_ACTIONS);
}
const blueprintDatabase = JSON.parse(fs.readFileSync(path.join(root, "phase19-integration-blueprint-db.json"), "utf8"));
for (const field of ["blueprint_id", "phase", "integration_status", "source_phase18_status", "target_network_scope", "planned_nodes", "dependency_map", "safety_contract", "blocked_actions", "allowed_actions", "recommended_sequence", "next_validation_step"]) assert.ok(Object.hasOwn(blueprintDatabase, field), `${field} is required in blueprint DB`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(index.includes('id="phase19-integration-blueprint"'));
assert.ok(index.includes('<script src="phase19-integration-blueprint.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase19-integration-blueprint"'));
assert.ok(readme.includes("Phase19-1 Global Intelligence Network Integration Blueprint"));

console.log("phase19 integration blueprint tests passed");
