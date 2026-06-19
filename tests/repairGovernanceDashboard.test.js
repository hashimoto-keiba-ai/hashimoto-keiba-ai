const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const governance = require("../repair-governance-dashboard.js");

assert.equal(governance.PHASE, "Phase18-8");
assert.equal(governance.OFFICIAL_RELEASE, "2.8");
assert.equal(governance.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(governance.EXECUTION_ALLOWED, false);
assert.deepEqual(governance.PHASE_STATUSES, ["healthy", "warning", "blocked", "plan_only", "mock_only", "protected"]);

const sources = {
  diagnosis: { status: "HEALTHY", scores: { systemHealthScore: 92 } },
  repair: { phase: "Phase18-5", items: [{ id: "repair-001" }, { id: "repair-002" }] },
  approval: { phase: "Phase18-6", records: [
    { repair_id: "repair-001", status: "executed_mock" },
    { repair_id: "repair-002", status: "blocked" }
  ] },
  audit: { phase: "Phase18-7", executionAllowed: true, records: [
    { audit_id: "audit-001", audit_status: "audit_passed_mock" },
    { audit_id: "audit-002", audit_status: "protected_release_blocked", official_release_protected: true },
    { audit_id: "audit-003", audit_status: "rollback_required" }
  ] },
  databases: {}
};
const snapshot = governance.buildGovernanceSnapshot(sources, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(snapshot.summary.healthScore, 92);
assert.equal(snapshot.summary.selfDiagnosisStatus, "HEALTHY");
assert.equal(snapshot.summary.repairPlanCount, 2);
assert.equal(snapshot.summary.blockedCount, 1);
assert.equal(snapshot.summary.approvalBlockedCount, 1);
assert.equal(snapshot.summary.protectedReleaseBlockedCount, 1);
assert.equal(snapshot.summary.executedMockCount, 1);
assert.equal(snapshot.summary.executionAllowed, false);
assert.equal(snapshot.executionAllowed, false);
assert.equal(snapshot.officialReleaseStatus, "protected");
assert.equal(snapshot.phases.officialRelease, "protected");
assert.equal(snapshot.phases.phase18_4, "warning");
assert.equal(snapshot.phases.phase18_5, "plan_only");
assert.equal(snapshot.phases.phase18_6, "blocked");
assert.equal(snapshot.phases.phase18_7, "protected");

const healthy = governance.buildGovernanceSnapshot({
  databases: {
    "self-diagnosis-db.json": { status: "ON" },
    "self-diagnosis-health-db.json": { scores: { system: 100 } },
    "self-repair-plan-db.json": { records: [] },
    "repair-approval-history-db.json": { records: [] },
    "repair-audit-history-db.json": { executionAllowed: false, records: [] }
  }
});
assert.equal(healthy.summary.healthScore, 100);
assert.equal(healthy.phases.phase18_4, "healthy");
assert.equal(healthy.phases.phase18_5, "healthy");
assert.equal(healthy.summary.executionAllowed, false);

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
governance.persistSnapshot(snapshot, storage);
assert.equal(JSON.parse(storage.getItem("repairGovernanceLatest")).executionAllowed, false);

const root = path.resolve(__dirname, "..");
const db = JSON.parse(fs.readFileSync(path.join(root, governance.GOVERNANCE_DATABASE), "utf8"));
assert.equal(db.phase, "Phase18-8");
assert.equal(db.officialReleaseStatus, "protected");
assert.equal(db.executionAllowed, false);
for (const file of governance.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosisPage = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="repair-governance-dashboard"'));
assert.ok(index.includes('<script src="repair-governance-dashboard.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#repair-governance-dashboard"'));
assert.ok(readme.includes("Phase18-8 Global Repair Governance Dashboard"));
assert.ok(diagnosisPage.includes('"repair-governance-db.json"'));
assert.ok(diagnosisPage.includes('"tests/repairGovernanceDashboard.test.js"'));

console.log("repair governance dashboard tests passed");
