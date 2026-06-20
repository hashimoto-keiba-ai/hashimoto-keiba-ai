const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-network-simulation-log.js");

assert.equal(engine.PHASE, "Phase18-16");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.LOG_TARGETS, ["node_sync", "dependency_validation", "safety_scoring", "preconnection_gate", "readiness_simulation", "control_center"]);
assert.deepEqual(engine.SIMULATION_MODES, ["simulation_only", "readiness_only", "skeleton_only", "blocked_simulation", "protected_only"]);
assert.deepEqual(engine.SAFETY_RESULTS, ["safe_blocked", "warning_blocked", "protected_blocked", "dependency_blocked", "preconnection_closed"]);

const safeSources = {
  core: { core_status: "skeleton_only", executionAllowed: false, external_connection_allowed: false },
  sync: { overall_sync_status: "sync_ready", blocked_count: 0, results: [] },
  safety: { safety_score: 100, safety_status: "safety_ready", connection_gate_status: "gate_closed_safe", connection_allowed: false },
  readiness: { readiness_status: "network_ready_simulation", external_connection_allowed: false },
  control: { control_center_status: "control_ready", globalIntelligenceNetworkConnectionAllowed: false },
  databases: {}
};
const report = engine.buildAuditReport(safeSources, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(report.log_count, 6);
assert.equal(report.executionAllowed, false);
assert.equal(report.autoExecutionAllowed, false);
assert.equal(report.auto_execution_allowed, false);
assert.equal(report.external_connection_allowed, false);
assert.deepEqual(report.logs.map((log) => log.simulated_event), engine.LOG_TARGETS);
for (const log of report.logs) {
  for (const field of ["log_id", "source_phase", "source_node", "target_node", "simulation_mode", "simulated_event", "safety_result", "blocked_reason", "execution_allowed", "external_connection_allowed", "audit_notes"]) assert.ok(Object.hasOwn(log, field), `${field} required`);
  assert.ok(engine.SIMULATION_MODES.includes(log.simulation_mode));
  assert.ok(engine.SAFETY_RESULTS.includes(log.safety_result));
  assert.equal(log.execution_allowed, false);
  assert.equal(log.external_connection_allowed, false);
}
assert.equal(report.logs.find((log) => log.simulated_event === "preconnection_gate").safety_result, "preconnection_closed");

const dependencyBlocked = engine.buildAuditReport({ ...safeSources, sync: { ...safeSources.sync, results: [{ dependency_status: "dependency_missing" }] } });
assert.equal(dependencyBlocked.logs.find((log) => log.simulated_event === "dependency_validation").safety_result, "dependency_blocked");
const protectedReport = engine.buildAuditReport({ ...safeSources, safety: { ...safeSources.safety, safety_status: "protected_only", connection_gate_status: "gate_protected_only" } });
assert.equal(protectedReport.logs.find((log) => log.simulated_event === "preconnection_gate").simulation_mode, "protected_only");
assert.equal(protectedReport.logs.find((log) => log.simulated_event === "preconnection_gate").safety_result, "protected_blocked");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistAudit(report, storage);
engine.persistAudit(report, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEYS.latest)).external_connection_allowed, false);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEYS.audit)).length, 2);

const root = path.resolve(__dirname, "..");
for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-16");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.external_connection_allowed, false);
}
for (const file of engine.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-network-simulation-audit"'));
assert.ok(index.includes('<script src="global-network-simulation-log.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-network-simulation-audit"'));
assert.ok(readme.includes("Phase18-16 Global Network Simulation Log Audit Trail Engine"));
assert.ok(diagnosis.includes('"global-network-simulation-log-db.json"'));
assert.ok(diagnosis.includes('"tests/globalNetworkSimulationLog.test.js"'));

console.log("global network simulation log tests passed");
