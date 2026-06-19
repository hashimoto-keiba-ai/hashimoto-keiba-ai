const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../final-safety-lock-page.js");

assert.equal(engine.PHASE, "Phase18-10");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.deepEqual(engine.FINAL_STATUSES, ["release_ready", "release_warning", "release_blocked", "protected_only", "plan_only_ready"]);

const inventory = {
  databases: Object.fromEntries(engine.SOURCE_DATABASES.map((file) => [file, true])),
  tests: Object.fromEntries(engine.REQUIRED_TESTS.map((file) => [file, true])),
  conflictMarkers: 0
};
const safeSources = {
  diagnosis: { status: "HEALTHY", scores: { systemHealthScore: 100, test: 100 }, anomalies: [] },
  repair: { executionPolicy: "PLAN_ONLY", immediateExecution: false, items: [] },
  approval: { executionPolicy: "PLAN_ONLY", actualRepairEnabled: false, records: [] },
  audit: { executionPolicy: "PLAN_ONLY", executionAllowed: false, records: [] },
  governance: { executionPolicy: "PLAN_ONLY", executionAllowed: false, summary: { executionAllowed: false, blockedCount: 0, protectedReleaseBlockedCount: 0, healthScore: 100 } },
  alerts: { executionPolicy: "PLAN_ONLY", executionAllowed: false, alerts: [
    { category: "protected", auto_execution_allowed: false },
    { category: "plan_only_notice", auto_execution_allowed: false }
  ] },
  databases: {}
};
const ready = engine.buildFinalAssessment(safeSources, inventory, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(ready.finalStatus, "release_ready");
assert.equal(ready.executionAllowed, false);
assert.equal(ready.autoExecutionAllowed, false);
assert.equal(ready.officialReleaseStatus, "protected");
assert.ok(Object.values(ready.checks).every(Boolean));
for (const field of ["health_score_ok", "diagnosis_ok", "repair_plan_ok", "approval_gate_ok", "audit_rollback_ok", "governance_dashboard_ok", "alert_priority_ok", "official_release_protected", "plan_only_enforced", "execution_blocked", "conflict_marker_zero", "test_readiness"]) assert.ok(Object.hasOwn(ready.checks, field), `${field} required`);

const protectedOnly = engine.buildFinalAssessment({ ...safeSources, governance: { ...safeSources.governance, summary: { ...safeSources.governance.summary, protectedReleaseBlockedCount: 1 } } }, inventory);
assert.equal(protectedOnly.finalStatus, "protected_only");
const blocked = engine.buildFinalAssessment({ ...safeSources, governance: { ...safeSources.governance, executionAllowed: true } }, { ...inventory, conflictMarkers: 1 });
assert.equal(blocked.finalStatus, "release_blocked");
assert.equal(blocked.executionAllowed, false);
const warning = engine.buildFinalAssessment({ ...safeSources, diagnosis: { status: "WARNING", scores: { systemHealthScore: 90, test: 100 } }, alerts: { ...safeSources.alerts, alerts: [{ category: "warning", auto_execution_allowed: false }] } }, inventory);
assert.equal(warning.finalStatus, "release_warning");
const planOnly = engine.buildFinalAssessment({ ...safeSources, approval: { ...safeSources.approval, records: [{ status: "pending" }] } }, inventory);
assert.equal(planOnly.finalStatus, "plan_only_ready");
assert.equal(engine.hasConflictMarker("<<<<<<< HEAD\na\n=======\nb\n>>>>>>> branch"), true);
assert.equal(engine.hasConflictMarker("clean"), false);

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistAssessment(ready, storage);
assert.equal(JSON.parse(storage.getItem("finalSafetyLockLatest")).executionAllowed, false);

const root = path.resolve(__dirname, "..");
for (const dbFile of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, dbFile), "utf8"));
  assert.equal(db.phase, "Phase18-10");
  assert.equal(db.executionAllowed, false);
}
for (const file of engine.SOURCE_DATABASES) assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="final-safety-lock-gate"'));
assert.ok(index.includes('<script src="final-safety-lock-page.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#final-safety-lock-gate"'));
assert.ok(readme.includes("Phase18-10 Final Safety Lock & Release Readiness Gate"));
assert.ok(diagnosis.includes('"final-safety-lock-db.json"'));
assert.ok(diagnosis.includes('"tests/finalSafetyLockReleaseReadiness.test.js"'));

console.log("final safety lock release readiness tests passed");
