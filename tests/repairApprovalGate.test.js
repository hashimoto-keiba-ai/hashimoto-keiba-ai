const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const gateEngine = require("../repair-approval-page.js");
const repairEngine = require("../self-repair-page.js");

assert.equal(gateEngine.PHASE, "Phase18-6");
assert.equal(gateEngine.OFFICIAL_RELEASE, "2.8");
assert.equal(gateEngine.EXECUTION_POLICY, "PLAN_ONLY");
assert.deepEqual(gateEngine.STATUSES, ["pending", "approved", "rejected", "blocked", "executed_mock"]);

const plan = repairEngine.buildSafeRepairPlan({
  diagnosisReport: {
    scores: { systemHealthScore: 80 },
    anomalies: [
      { type: "broken-link", target: "missing.html", detail: "リンク切れ" },
      { type: "protected-target-missing", target: "Official Release v2.8", detail: "保護対象欠落" }
    ]
  }
}, () => new Date("2026-06-19T00:00:00.000Z"));
const gate = gateEngine.createApprovalGate(plan, () => new Date("2026-06-19T01:00:00.000Z"));
assert.equal(gate.actualRepairEnabled, false);
assert.equal(gate.records.length, 2);
for (const record of gate.records) {
  for (const field of ["repair_id", "category", "severity", "priority", "target_file", "reason", "impact", "proposed_action", "safety_level", "approval_required", "status"]) {
    assert.ok(Object.hasOwn(record, field), `${field} is required`);
  }
  assert.equal(record.actual_execution, false);
}

const normal = gate.records.find((record) => record.category === "broken_link");
const protectedRecord = gate.records.find((record) => record.category === "release_protection_risk");
assert.equal(normal.status, "pending");
assert.equal(protectedRecord.status, "blocked");
assert.equal(protectedRecord.safety_level, "PROTECTED_BLOCK");
assert.equal(gateEngine.transitionRecord(protectedRecord, "approve").status, "blocked");

const approved = gateEngine.transitionRecord(normal, "approve", () => new Date("2026-06-19T02:00:00.000Z"));
assert.equal(approved.status, "approved");
assert.equal(approved.actual_execution, false);
const executedMock = gateEngine.transitionRecord(approved, "execute_mock", () => new Date("2026-06-19T03:00:00.000Z"));
assert.equal(executedMock.status, "executed_mock");
assert.equal(executedMock.actual_execution, false);
assert.equal(gateEngine.transitionRecord(normal, "execute_mock").status, "pending");
assert.equal(gateEngine.transitionRecord(normal, "reject").status, "rejected");

const store = new Map([["selfRepairLatestPlan", JSON.stringify(plan)]]);
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
assert.equal(gateEngine.loadSourcePlan(storage).phase, "Phase18-5");
gateEngine.persistGate(gate, storage);
assert.equal(JSON.parse(storage.getItem("repairApprovalLatest")).executionPolicy, "PLAN_ONLY");
assert.equal(JSON.parse(storage.getItem("repairApprovalHistory")).length, 1);

const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../repair-approval-history-db.json"), "utf8"));
assert.equal(db.phase, "Phase18-6");
assert.equal(db.actualRepairEnabled, false);
assert.deepEqual(db.allowedStatuses, gateEngine.STATUSES);

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="repair-approval-gate"'));
assert.ok(index.includes('<script src="repair-approval-page.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#repair-approval-gate"'));
assert.ok(readme.includes("Phase18-6 Repair Plan Approval & Execution Gate"));
assert.ok(diagnosis.includes('"repair-approval-history-db.json"'));
assert.ok(diagnosis.includes('"tests/repairApprovalGate.test.js"'));

console.log("repair approval gate tests passed");
