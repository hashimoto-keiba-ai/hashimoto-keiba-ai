const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-network-safety-scoring.js");

assert.equal(engine.PHASE, "Phase18-15");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.SAFETY_STATUSES, ["safety_ready", "safety_warning", "safety_blocked", "protected_only", "preconnection_only"]);
assert.deepEqual(engine.GATE_STATUSES, ["gate_closed_safe", "gate_warning", "gate_blocked", "gate_protected_only"]);

const root = path.resolve(__dirname, "..");
const nodeDb = JSON.parse(fs.readFileSync(path.join(root, "global-intelligence-network-nodes-db.json"), "utf8"));
const safeCore = {
  core_status: "skeleton_only", network_mode: "skeleton_only", readiness_mode: "readiness_only",
  officialReleaseStatus: "protected_only", executionPolicy: "PLAN_ONLY", executionAllowed: false,
  autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false,
  nodes: nodeDb.nodes
};
const safeSync = {
  overall_sync_status: "sync_ready", executionPolicy: "PLAN_ONLY", executionAllowed: false,
  autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false,
  results: nodeDb.nodes.map((node) => ({ node_id: node.node_id, node_sync_status: node.protected ? "protected_only" : node.status === "skeleton_only" ? "skeleton_only" : "sync_ready", dependency_status: "dependency_ok", checks: { node_id_exists: true } }))
};
const ready = engine.buildSafetyReport({ core: safeCore, sync: safeSync, nodeDb }, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(ready.safety_score, 100);
assert.equal(ready.safety_status, "safety_ready");
assert.equal(ready.connection_gate_status, "gate_closed_safe");
assert.equal(ready.connection_allowed, false);
assert.equal(ready.external_connection_allowed, false);
assert.equal(ready.executionAllowed, false);
assert.equal(ready.autoExecutionAllowed, false);
assert.equal(ready.auto_execution_allowed, false);
for (const field of ["network_core_ready", "node_sync_ready", "dependency_validation_ready", "protected_release_ok", "execution_blocked", "external_connection_blocked", "plan_only_enforced", "skeleton_only_enforced", "readiness_only_enforced", "missing_node_count", "dependency_warning_count", "blocked_node_count"]) assert.ok(Object.hasOwn(ready.checks, field), `${field} required`);

const warningSync = { ...safeSync, overall_sync_status: "sync_warning", results: safeSync.results.map((result, index) => index === 0 ? { ...result, dependency_status: "dependency_warning" } : result) };
const warning = engine.buildSafetyReport({ core: safeCore, sync: warningSync, nodeDb });
assert.ok(warning.safety_score < 100 && warning.safety_score >= 0);
assert.equal(warning.safety_status, "safety_warning");
assert.equal(warning.connection_gate_status, "gate_warning");
assert.equal(warning.connection_allowed, false);

const blockedCore = { ...safeCore, executionAllowed: true };
const blocked = engine.buildSafetyReport({ core: blockedCore, sync: safeSync, nodeDb });
assert.equal(blocked.safety_status, "safety_blocked");
assert.equal(blocked.connection_gate_status, "gate_blocked");
assert.equal(blocked.external_connection_allowed, false);

const protectedOnly = engine.buildSafetyReport({ core: { ...safeCore, core_status: "protected_only" }, sync: safeSync, nodeDb });
assert.equal(protectedOnly.safety_status, "protected_only");
assert.equal(protectedOnly.connection_gate_status, "gate_protected_only");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistReport(ready, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEYS.latest)).connection_allowed, false);

for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-15");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.external_connection_allowed, false);
}
for (const file of engine.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-network-safety-gate"'));
assert.ok(index.includes('<script src="global-network-safety-scoring.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-network-safety-gate"'));
assert.ok(readme.includes("Phase18-15 Global Network Safety Scoring PreConnection Gate"));
assert.ok(diagnosis.includes('"global-network-safety-score-db.json"'));
assert.ok(diagnosis.includes('"tests/globalNetworkSafetyScoring.test.js"'));

console.log("global network safety scoring tests passed");
