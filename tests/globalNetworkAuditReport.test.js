const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-network-audit-report.js");

assert.equal(engine.PHASE, "Phase18-17");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.NETWORK_STATUSES, ["audit_ready", "audit_warning", "audit_blocked", "protected_only", "simulation_only"]);
assert.deepEqual(engine.RISK_LEVELS, ["low", "medium", "high", "protected", "blocked"]);

const root = path.resolve(__dirname, "..");
const nodeDb = JSON.parse(fs.readFileSync(path.join(root, "global-intelligence-network-nodes-db.json"), "utf8"));
const safeSources = {
  core: { core_status: "skeleton_only", nodes: nodeDb.nodes },
  sync: { overall_sync_status: "sync_ready", results: nodeDb.nodes.map((node) => ({ node_id: node.node_id, node_sync_status: "sync_ready", dependency_status: "dependency_ok", checks: { node_id_exists: true } })) },
  safety: { safety_score: 100, safety_status: "safety_ready", connection_gate_status: "gate_closed_safe" },
  simulation: { audit_status: "audit_trail_recorded", logs: [{ safety_result: "safe_blocked", blocked_reason: "Gate remains closed." }] },
  audit: [{ audit_status: "audit_trail_recorded" }], databases: {}
};
const report = engine.buildAuditReport(safeSources, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(report.network_status, "audit_ready");
assert.equal(report.risk_level, "low");
assert.equal(report.executionAllowed, false);
assert.equal(report.autoExecutionAllowed, false);
assert.equal(report.auto_execution_allowed, false);
assert.equal(report.external_connection_allowed, false);
assert.equal(report.preconnection_gate_summary.connection_allowed, false);
for (const field of ["report_id", "generated_at", "network_status", "node_summary", "dependency_summary", "safety_score_summary", "preconnection_gate_summary", "simulation_log_summary", "audit_trail_summary", "protected_release_summary", "blocked_reason_summary", "recommended_next_action"]) assert.ok(Object.hasOwn(report, field), `${field} required`);
assert.equal(report.protected_release_summary.status, "protected");

const warning = engine.buildAuditReport({ ...safeSources, safety: { ...safeSources.safety, safety_status: "safety_warning" } });
assert.equal(warning.network_status, "audit_warning");
assert.equal(warning.risk_level, "medium");
const blocked = engine.buildAuditReport({ ...safeSources, safety: { ...safeSources.safety, safety_status: "safety_blocked", connection_gate_status: "gate_blocked" } });
assert.equal(blocked.network_status, "audit_blocked");
assert.equal(blocked.risk_level, "blocked");
const protectedOnly = engine.buildAuditReport({ ...safeSources, safety: { ...safeSources.safety, safety_status: "protected_only" } });
assert.equal(protectedOnly.network_status, "protected_only");
assert.equal(protectedOnly.risk_level, "protected");
const simulationOnly = engine.buildAuditReport({ ...safeSources, simulation: { logs: [] }, audit: [] });
assert.equal(simulationOnly.network_status, "simulation_only");
assert.ok(!/execute|connect now|自動実行/i.test(report.recommended_next_action));

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistReport(report, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEYS.latest)).external_connection_allowed, false);

for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-17");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.external_connection_allowed, false);
}
for (const file of engine.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-network-comprehensive-audit"'));
assert.ok(index.includes('<script src="global-network-audit-report.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-network-comprehensive-audit"'));
assert.ok(readme.includes("Phase18-17 Global Network Comprehensive Audit Report Engine"));
assert.ok(diagnosis.includes('"global-network-audit-report-db.json"'));
assert.ok(diagnosis.includes('"tests/globalNetworkAuditReport.test.js"'));

console.log("global network audit report tests passed");
