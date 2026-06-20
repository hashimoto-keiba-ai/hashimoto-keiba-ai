const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-network-readiness-simulator.js");

assert.equal(engine.PHASE, "Phase18-12");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.CONNECTION_MODES, ["readiness_only", "simulation_only"]);
assert.deepEqual(engine.READINESS_STATUSES, ["network_ready_simulation", "network_warning", "network_blocked", "protected_only", "plan_only_ready"]);

const safeSources = {
  diagnosis: { status: "HEALTHY" }, repair: { executionPolicy: "PLAN_ONLY", immediateExecution: false },
  approval: { executionPolicy: "PLAN_ONLY", actualRepairEnabled: false, records: [] },
  audit: { executionPolicy: "PLAN_ONLY", executionAllowed: false, records: [] },
  governance: { executionPolicy: "PLAN_ONLY", executionAllowed: false, finalStatus: "healthy" },
  alerts: { executionPolicy: "PLAN_ONLY", executionAllowed: false, alerts: [] },
  finalSafety: { executionPolicy: "PLAN_ONLY", executionAllowed: false, autoExecutionAllowed: false, finalStatus: "release_ready" },
  controlCenter: { executionPolicy: "PLAN_ONLY", executionAllowed: false, autoExecutionAllowed: false, auto_execution_allowed: false, globalIntelligenceNetworkConnectionAllowed: false, globalIntelligenceNetworkStatus: "readiness_only", control_center_status: "control_ready" },
  databases: {}
};
const ready = engine.buildSimulation(safeSources, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(ready.readiness_status, "network_ready_simulation");
assert.equal(ready.executionAllowed, false);
assert.equal(ready.autoExecutionAllowed, false);
assert.equal(ready.auto_execution_allowed, false);
assert.equal(ready.simulation.connection_mode, "simulation_only");
assert.equal(ready.simulation.external_connection_allowed, false);
for (const field of ["simulation_id", "target_network", "connection_mode", "readiness_status", "blocked_reason", "safety_notes", "recommended_next_action", "external_connection_allowed"]) assert.ok(Object.hasOwn(ready.simulation, field), `${field} required`);
for (const field of ["control_center_ready", "final_safety_ready", "governance_ready", "alert_priority_ready", "diagnosis_ready", "repair_ready", "approval_ready", "audit_ready", "official_release_protected", "execution_blocked", "plan_only_enforced", "network_simulation_only"]) assert.ok(Object.hasOwn(ready.checks, field), `${field} required`);

const warning = engine.buildSimulation({ ...safeSources, diagnosis: { status: "BLOCKED" } });
assert.equal(warning.readiness_status, "network_warning");
const blocked = engine.buildSimulation({ ...safeSources, controlCenter: { ...safeSources.controlCenter, executionAllowed: true } });
assert.equal(blocked.readiness_status, "network_blocked");
assert.equal(blocked.simulation.external_connection_allowed, false);
const protectedOnly = engine.buildSimulation({ ...safeSources, controlCenter: { ...safeSources.controlCenter, control_center_status: "protected_only" } });
assert.equal(protectedOnly.readiness_status, "protected_only");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistResult(ready, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEYS.simulation)).external_connection_allowed, false);

const root = path.resolve(__dirname, "..");
for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-12");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.externalConnectionAllowed, false);
}
for (const file of engine.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-network-readiness-simulator"'));
assert.ok(index.includes('<script src="global-network-readiness-simulator.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-network-readiness-simulator"'));
assert.ok(readme.includes("Phase18-12 Global Intelligence Network Readiness Simulator"));
assert.ok(diagnosis.includes('"global-network-readiness-db.json"'));
assert.ok(diagnosis.includes('"tests/globalNetworkReadinessSimulator.test.js"'));

console.log("global network readiness simulator tests passed");
