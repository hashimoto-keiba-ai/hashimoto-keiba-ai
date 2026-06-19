const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const auditEngine = require("../repair-audit-page.js");

assert.equal(auditEngine.PHASE, "Phase18-7");
assert.equal(auditEngine.OFFICIAL_RELEASE, "2.8");
assert.equal(auditEngine.EXECUTION_POLICY, "PLAN_ONLY");
assert.deepEqual(auditEngine.ELIGIBLE_APPROVAL_STATUSES, ["approved", "executed_mock"]);
assert.deepEqual(auditEngine.AUDIT_STATUSES, ["audit_pending", "audit_passed_mock", "audit_blocked", "rollback_required", "protected_release_blocked"]);

const approvalGate = {
  phase: "Phase18-6",
  records: [
    { repair_id: "repair-001", status: "pending", target_file: "pending.js", proposed_action: "待機", severity: "LOW" },
    { repair_id: "repair-002", status: "approved", category: "broken_link", target_file: "index.html", proposed_action: "リンク候補を確認", severity: "HIGH", safety_level: "PLAN_ONLY_SAFE" },
    { repair_id: "repair-003", status: "executed_mock", category: "test_missing", target_file: "tests/new.test.js", proposed_action: "テスト雛形を検討", severity: "MEDIUM", safety_level: "PLAN_ONLY_SAFE" },
    { repair_id: "repair-004", status: "approved", category: "db_inconsistency", target_file: "sample-db.json", proposed_action: "DB補正案を確認", severity: "CRITICAL", safety_level: "MANUAL_REVIEW" },
    { repair_id: "repair-005", status: "approved", category: "missing_file", target_file: "official-release-v2.8.json", proposed_action: "保護対象を確認", severity: "CRITICAL", safety_level: "PLAN_ONLY_SAFE" },
    { repair_id: "repair-006", status: "approved", category: "missing_file", target_file: "unknown", proposed_action: null, severity: "HIGH" }
  ]
};
const report = auditEngine.generateAuditReport(approvalGate, () => new Date("2026-06-19T00:00:00.000Z"));
assert.equal(report.executionAllowed, false);
assert.equal(report.records.length, 5);
assert.ok(report.records.every((record) => record.execution_allowed === false));
assert.ok(!report.records.some((record) => record.repair_id === "repair-001"));
for (const record of report.records) {
  for (const field of ["audit_id", "repair_id", "approval_status", "target_file", "proposed_action", "expected_diff_summary", "rollback_plan", "risk_level", "official_release_protected", "execution_allowed", "audit_status"]) {
    assert.ok(Object.hasOwn(record, field), `${field} is required`);
  }
  assert.equal(record.rollback_plan.automatic, false);
  assert.equal(record.rollback_plan.requiresApproval, true);
}
assert.equal(report.records.find((record) => record.repair_id === "repair-002").audit_status, "audit_pending");
assert.equal(report.records.find((record) => record.repair_id === "repair-003").audit_status, "audit_passed_mock");
assert.equal(report.records.find((record) => record.repair_id === "repair-004").audit_status, "rollback_required");
assert.equal(report.records.find((record) => record.repair_id === "repair-005").audit_status, "protected_release_blocked");
assert.equal(report.records.find((record) => record.repair_id === "repair-006").audit_status, "audit_blocked");

const store = new Map([["repairApprovalLatest", JSON.stringify(approvalGate)]]);
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
assert.equal(auditEngine.loadApprovalGate(storage).phase, "Phase18-6");
auditEngine.persistAudit(report, storage);
assert.equal(JSON.parse(storage.getItem("repairAuditLatest")).executionAllowed, false);
assert.equal(JSON.parse(storage.getItem("repairAuditHistory")).length, 1);
assert.equal(JSON.parse(storage.getItem("repairRollbackPlans")).length, 5);

const root = path.resolve(__dirname, "..");
for (const dbFile of auditEngine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, dbFile), "utf8"));
  assert.equal(db.phase, "Phase18-7");
}
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="repair-audit-engine"'));
assert.ok(index.includes('<script src="repair-audit-page.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#repair-audit-engine"'));
assert.ok(readme.includes("Phase18-7 Repair Execution Audit & Rollback Plan Engine"));
assert.ok(diagnosis.includes('"repair-audit-history-db.json"'));
assert.ok(diagnosis.includes('"tests/repairAuditRollback.test.js"'));

console.log("repair audit rollback tests passed");
