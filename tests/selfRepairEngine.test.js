const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../self-repair-page.js");

assert.equal(engine.PHASE, "Phase18-5");
assert.equal(engine.ENGINE_VERSION, "5.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.deepEqual(engine.CATEGORIES, [
  "missing_file",
  "broken_link",
  "dashboard_disconnect",
  "db_inconsistency",
  "test_missing",
  "release_protection_risk",
  "private_menu_issue"
]);

const anomalies = [
  { type: "missing-file", target: "missing.js", detail: "ファイルなし" },
  { type: "broken-link", target: "missing.html", detail: "リンク切れ" },
  { type: "dashboard-missing", target: "Repair Panel", detail: "パネルなし" },
  { type: "json-invalid", target: "broken-db.json", detail: "JSON不正" },
  { type: "missing-test", target: "tests/missing.test.js", detail: "テストなし" },
  { type: "protected-target-missing", target: "Official Release v2.8", detail: "保護表示なし" },
  { type: "one-tap-unconnected", target: "自己修復", detail: "メニュー未接続" }
];
const plan = engine.buildSafeRepairPlan({
  diagnosisReport: {
    generatedAt: "2026-06-19T00:00:00.000Z",
    status: "ATTENTION",
    scores: { systemHealthScore: 82 },
    anomalies
  }
}, () => new Date("2026-06-19T01:00:00.000Z"));

assert.equal(plan.healthScore, 82);
assert.equal(plan.status, "PLAN_READY");
assert.equal(plan.executionPolicy, "PLAN_ONLY");
assert.equal(plan.immediateExecution, false);
assert.equal(plan.approvalRequired, true);
assert.equal(plan.items.length, 7);
assert.deepEqual(new Set(plan.items.map((item) => item.category)), new Set(engine.CATEGORIES));
assert.ok(plan.items.every((item) => item.cause && item.impact && item.proposal && item.priority));
assert.ok(plan.items.every((item) => item.safeOperation.autoExecute === false));
assert.ok(plan.items.every((item) => item.safeOperation.overwriteExisting === false));
const protection = plan.items.find((item) => item.category === "release_protection_risk");
assert.equal(protection.priority, "CRITICAL");
assert.equal(protection.safeOperation.blockedByProtection, true);
assert.equal(plan.items[0].category, "release_protection_risk");

const healthy = engine.buildSafeRepairPlan({
  healthDatabase: { scores: { system: 100 } },
  diagnosisDatabase: { status: "ON", records: [] }
});
assert.equal(healthy.healthScore, 100);
assert.equal(healthy.status, "NO_REPAIR_NEEDED");
assert.equal(healthy.items.length, 0);
assert.equal(healthy.approvalRequired, false);

const diagnosisDbPlan = engine.buildSafeRepairPlan({
  diagnosisReport: {
    createdAt: "2026-06-19T02:00:00.000Z",
    diagnosis: {
      status: "REPAIR_REQUIRED",
      health: { systemHealthScore: 74 },
      anomalies: {
        missingDatabases: ["missing-db.json"],
        oneTapDisconnectedFeatures: ["自己修復"]
      }
    }
  }
});
assert.equal(diagnosisDbPlan.healthScore, 74);
assert.deepEqual(diagnosisDbPlan.items.map((item) => item.category), [
  "db_inconsistency",
  "private_menu_issue"
]);

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistPlan(plan, storage);
assert.equal(JSON.parse(storage.getItem("selfRepairLatestPlan")).executionPolicy, "PLAN_ONLY");
assert.equal(JSON.parse(storage.getItem("selfRepairPlanHistory")).length, 1);

const root = path.resolve(__dirname, "..");
for (const db of engine.REPAIR_DATABASES) {
  const parsed = JSON.parse(fs.readFileSync(path.join(root, db), "utf8"));
  assert.equal(parsed.phase, "Phase18-5");
}

console.log("self repair engine tests passed");
