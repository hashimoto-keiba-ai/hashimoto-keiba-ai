const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-network-node-sync-validator.js");

assert.equal(engine.PHASE, "Phase18-14");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.EXPECTED_NODE_IDS.length, 9);
assert.deepEqual(engine.NODE_SYNC_STATUSES, ["sync_ready", "sync_warning", "sync_blocked", "dependency_missing", "protected_only", "skeleton_only"]);
assert.deepEqual(engine.DEPENDENCY_STATUSES, ["dependency_ok", "dependency_warning", "dependency_blocked", "dependency_missing"]);

const root = path.resolve(__dirname, "..");
const nodeDb = JSON.parse(fs.readFileSync(path.join(root, "global-intelligence-network-nodes-db.json"), "utf8"));
const availableFiles = nodeDb.nodes.map((node) => node.source_file);
const report = engine.buildValidationReport(nodeDb.nodes, availableFiles, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(report.overall_sync_status, "sync_ready");
assert.equal(report.expected_node_count, 9);
assert.equal(report.validated_node_count, 9);
assert.equal(report.executionAllowed, false);
assert.equal(report.autoExecutionAllowed, false);
assert.equal(report.auto_execution_allowed, false);
assert.equal(report.external_connection_allowed, false);
for (const result of report.results) {
  assert.ok(engine.EXPECTED_NODE_IDS.includes(result.node_id));
  assert.equal(result.execution_allowed, false);
  assert.equal(result.external_connection_allowed, false);
  assert.ok(engine.NODE_SYNC_STATUSES.includes(result.node_sync_status));
  assert.ok(engine.DEPENDENCY_STATUSES.includes(result.dependency_status));
}
assert.equal(report.results.find((result) => result.node_id === "safety_lock_node").node_sync_status, "protected_only");
assert.equal(report.results.find((result) => result.node_id === "readiness_simulator_node").node_sync_status, "skeleton_only");

const missingDependencyNodes = nodeDb.nodes.map((node) => ({ ...node, dependencies: [...node.dependencies] }));
missingDependencyNodes.find((node) => node.node_id === "repair_node").dependencies = ["missing_node"];
const missing = engine.buildValidationReport(missingDependencyNodes, availableFiles);
assert.equal(missing.results.find((result) => result.node_id === "repair_node").dependency_status, "dependency_missing");
assert.equal(missing.results.find((result) => result.node_id === "repair_node").node_sync_status, "dependency_missing");

const unsafeNodes = nodeDb.nodes.map((node) => ({ ...node }));
unsafeNodes.find((node) => node.node_id === "diagnosis_node").execution_allowed = true;
const unsafe = engine.buildValidationReport(unsafeNodes, availableFiles);
assert.equal(unsafe.overall_sync_status, "sync_blocked");
assert.equal(unsafe.results.find((result) => result.node_id === "diagnosis_node").checks.execution_blocked, false);

const missingNode = engine.buildValidationReport(nodeDb.nodes.filter((node) => node.node_id !== "approval_node"), availableFiles);
assert.equal(missingNode.results.find((result) => result.node_id === "approval_node").node_sync_status, "dependency_missing");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistReport(report, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEY)).external_connection_allowed, false);

for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-14");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.external_connection_allowed, false);
}
for (const file of availableFiles) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-network-node-sync-validator"'));
assert.ok(index.includes('<script src="global-network-node-sync-validator.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-network-node-sync-validator"'));
assert.ok(readme.includes("Phase18-14 Global Network Node Sync Dependency Validator"));
assert.ok(diagnosis.includes('"global-network-node-sync-db.json"'));
assert.ok(diagnosis.includes('"tests/globalNetworkNodeSyncValidator.test.js"'));

console.log("global network node sync validator tests passed");
