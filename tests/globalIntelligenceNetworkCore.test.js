const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-intelligence-network-core.js");

assert.equal(engine.PHASE, "Phase18-13");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.NETWORK_MODES, ["skeleton_only", "readiness_only"]);
assert.deepEqual(engine.NODE_STATUSES, ["node_ready", "node_warning", "node_blocked", "protected_only", "skeleton_only"]);

const checks = {
  diagnosis_ready: true, repair_ready: true, approval_ready: true, audit_ready: true,
  governance_ready: true, alert_priority_ready: true, official_release_protected: true,
  control_center_ready: true, network_simulation_only: true
};
const core = engine.buildNetworkCore({ readiness: { readiness_status: "network_ready_simulation", checks } }, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(core.core_status, "skeleton_only");
assert.equal(core.network_mode, "skeleton_only");
assert.equal(core.readiness_mode, "readiness_only");
assert.equal(core.executionAllowed, false);
assert.equal(core.autoExecutionAllowed, false);
assert.equal(core.auto_execution_allowed, false);
assert.equal(core.external_connection_allowed, false);
assert.equal(core.node_count, 9);

const requiredNodes = ["diagnosis_node", "repair_node", "approval_node", "audit_node", "governance_node", "alert_node", "safety_lock_node", "control_center_node", "readiness_simulator_node"];
assert.deepEqual(core.nodes.map((node) => node.node_id), requiredNodes);
for (const node of core.nodes) {
  for (const field of ["node_id", "node_name", "source_phase", "source_file", "status", "protected", "execution_allowed", "external_connection_allowed", "dependencies", "safety_notes"]) assert.ok(Object.hasOwn(node, field), `${field} required`);
  assert.equal(node.execution_allowed, false);
  assert.equal(node.external_connection_allowed, false);
  assert.ok(engine.NODE_STATUSES.includes(node.status));
}
assert.equal(core.nodes.find((node) => node.node_id === "safety_lock_node").status, "protected_only");
assert.equal(core.nodes.find((node) => node.node_id === "readiness_simulator_node").status, "skeleton_only");

const warning = engine.buildNetworkCore({ readiness: { readiness_status: "network_warning", checks: { ...checks, diagnosis_ready: false } } });
assert.equal(warning.nodes.find((node) => node.node_id === "diagnosis_node").status, "node_warning");
const blocked = engine.buildNetworkCore({ readiness: { readiness_status: "network_blocked", checks: { ...checks, control_center_ready: false } } });
assert.equal(blocked.core_status, "node_blocked");
assert.equal(blocked.nodes.find((node) => node.node_id === "control_center_node").status, "node_blocked");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistCore(core, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEYS.latest)).external_connection_allowed, false);

const root = path.resolve(__dirname, "..");
for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-13");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.external_connection_allowed, false);
}
const nodeDb = JSON.parse(fs.readFileSync(path.join(root, "global-intelligence-network-nodes-db.json"), "utf8"));
assert.equal(nodeDb.nodes.length, 9);
for (const node of nodeDb.nodes) {
  assert.equal(node.execution_allowed, false);
  assert.equal(node.external_connection_allowed, false);
}
for (const file of engine.MONITORED_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-intelligence-network-core"'));
assert.ok(index.includes('<script src="global-intelligence-network-core.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-intelligence-network-core"'));
assert.ok(readme.includes("Phase18-13 Global Intelligence Network Core Skeleton"));
assert.ok(diagnosis.includes('"global-intelligence-network-core-db.json"'));
assert.ok(diagnosis.includes('"tests/globalIntelligenceNetworkCore.test.js"'));

console.log("global intelligence network core tests passed");
