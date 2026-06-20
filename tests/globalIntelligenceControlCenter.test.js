const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../global-intelligence-control-center.js");

assert.equal(engine.PHASE, "Phase18-11");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.NETWORK_CONNECTION_ALLOWED, false);
assert.deepEqual(engine.CONTROL_STATUSES, ["control_ready", "control_warning", "control_blocked", "protected_only", "plan_only_ready"]);

const safeSources = {
  diagnosis: { status: "HEALTHY", scores: { systemHealthScore: 100 } },
  repair: { executionPolicy: "PLAN_ONLY", immediateExecution: false, status: "NO_REPAIR_NEEDED" },
  approval: { executionPolicy: "PLAN_ONLY", actualRepairEnabled: false, records: [] },
  audit: { executionPolicy: "PLAN_ONLY", executionAllowed: false, records: [] },
  governance: { executionPolicy: "PLAN_ONLY", executionAllowed: false, summary: { executionAllowed: false, protectedReleaseBlockedCount: 0 } },
  alerts: { executionPolicy: "PLAN_ONLY", executionAllowed: false, alerts: [{ category: "protected", auto_execution_allowed: false }, { category: "plan_only_notice", auto_execution_allowed: false }] },
  finalSafety: { executionPolicy: "PLAN_ONLY", executionAllowed: false, autoExecutionAllowed: false, finalStatus: "release_ready" },
  databases: {}
};
const ready = engine.buildControlCenterStatus(safeSources, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(ready.control_center_status, "control_ready");
assert.equal(ready.health_score, 100);
assert.equal(ready.diagnosis_status, "HEALTHY");
assert.equal(ready.protected_release_status, "protected_only");
assert.equal(ready.plan_only_status, "enforced");
assert.equal(ready.execution_gate_status, "blocked");
assert.equal(ready.executionAllowed, false);
assert.equal(ready.autoExecutionAllowed, false);
assert.equal(ready.auto_execution_allowed, false);
assert.equal(ready.globalIntelligenceNetworkConnectionAllowed, false);
assert.equal(ready.globalIntelligenceNetworkStatus, "readiness_only");
for (const field of ["control_center_status", "health_score", "diagnosis_status", "repair_status", "approval_status", "audit_status", "governance_status", "alert_status", "final_safety_status", "protected_release_status", "plan_only_status", "execution_gate_status"]) assert.ok(Object.hasOwn(ready, field), `${field} required`);

const warning = engine.buildControlCenterStatus({ ...safeSources, diagnosis: { status: "WARNING", scores: { systemHealthScore: 90 } }, alerts: { ...safeSources.alerts, alerts: [{ category: "warning" }] } });
assert.equal(warning.control_center_status, "control_warning");
const blocked = engine.buildControlCenterStatus({ ...safeSources, finalSafety: { ...safeSources.finalSafety, finalStatus: "release_blocked" }, governance: { ...safeSources.governance, executionAllowed: true } });
assert.equal(blocked.control_center_status, "control_blocked");
assert.equal(blocked.executionAllowed, false);
const protectedOnly = engine.buildControlCenterStatus({ ...safeSources, audit: { ...safeSources.audit, records: [{ audit_status: "protected_release_blocked" }] } });
assert.equal(protectedOnly.control_center_status, "protected_only");
const planOnly = engine.buildControlCenterStatus({ ...safeSources, approval: { ...safeSources.approval, records: [{ status: "pending" }] } });
assert.equal(planOnly.control_center_status, "plan_only_ready");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistStatus(ready, storage);
assert.equal(JSON.parse(storage.getItem("globalIntelligenceControlCenterLatest")).globalIntelligenceNetworkConnectionAllowed, false);

const root = path.resolve(__dirname, "..");
const db = JSON.parse(fs.readFileSync(path.join(root, engine.DATABASE), "utf8"));
assert.equal(db.phase, "Phase18-11");
assert.equal(db.executionAllowed, false);
assert.equal(db.globalIntelligenceNetworkConnectionAllowed, false);
for (const file of engine.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="global-intelligence-control-center"'));
assert.ok(index.includes('<script src="global-intelligence-control-center.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#global-intelligence-control-center"'));
assert.ok(readme.includes("Phase18-11 Global Intelligence Control Center"));
assert.ok(diagnosis.includes('"global-intelligence-control-center-db.json"'));
assert.ok(diagnosis.includes('"tests/globalIntelligenceControlCenter.test.js"'));

console.log("global intelligence control center tests passed");
