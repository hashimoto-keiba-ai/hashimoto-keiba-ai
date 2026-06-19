const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../governance-alert-page.js");

assert.equal(engine.PHASE, "Phase18-9");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.deepEqual(engine.ALERT_CATEGORIES, ["info", "warning", "critical", "protected", "plan_only_notice", "mock_execution_notice"]);

const inventory = {
  databases: Object.fromEntries(engine.REQUIRED_DATABASES.map((file) => [file, true])),
  routes: { "index.html#governance-alert-engine": true, "private-local.html#governance-alert-engine": true },
  tests: Object.fromEntries(engine.REQUIRED_TESTS.map((file) => [file, true]))
};
inventory.databases["repair-governance-db.json"] = false;
inventory.routes["private-local.html#governance-alert-engine"] = false;
inventory.tests["tests/repairGovernanceDashboard.test.js"] = false;

const governance = {
  executionAllowed: true,
  summary: { healthScore: 78, blockedCount: 3, protectedReleaseBlockedCount: 1, executedMockCount: 2, executionAllowed: true }
};
const previous = { summary: { blockedCount: 1 } };
const report = engine.buildAlertReport(governance, inventory, previous, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(report.executionAllowed, false);
assert.ok(report.alerts.every((alert) => alert.auto_execution_allowed === false));
assert.ok(report.recommendations.every((item) => item.auto_execution_allowed === false));
for (const alert of report.alerts) {
  for (const field of ["alert_id", "category", "severity", "source_phase", "source_file", "message", "reason", "impact", "recommended_action", "priority", "auto_execution_allowed"]) assert.ok(Object.hasOwn(alert, field), `${field} is required`);
}
for (const category of ["critical", "protected", "plan_only_notice", "mock_execution_notice", "warning"]) assert.ok(report.alerts.some((alert) => alert.category === category), `${category} alert expected`);
assert.ok(report.alerts.some((alert) => alert.message.includes("Blocked count increased")));
assert.ok(report.alerts.some((alert) => alert.message.includes("executionAllowed safety invariant")));
assert.ok(report.alerts.some((alert) => alert.source_file === "repair-governance-db.json" && alert.message.includes("missing")));
assert.ok(report.alerts.some((alert) => alert.source_file === "private-local.html"));
assert.ok(report.alerts.some((alert) => alert.source_file === "tests/repairGovernanceDashboard.test.js"));
assert.equal(report.alerts[0].priority, "P0");

const safe = engine.buildAlertReport({ executionAllowed: false, summary: { healthScore: 100, blockedCount: 0, protectedReleaseBlockedCount: 0, executedMockCount: 0, executionAllowed: false } }, {
  databases: Object.fromEntries(engine.REQUIRED_DATABASES.map((file) => [file, true])),
  routes: { "index.html#governance-alert-engine": true, "private-local.html#governance-alert-engine": true },
  tests: Object.fromEntries(engine.REQUIRED_TESTS.map((file) => [file, true]))
});
assert.deepEqual(new Set(safe.alerts.map((alert) => alert.category)), new Set(["protected", "plan_only_notice"]));

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistReport(report, governance, storage);
assert.equal(JSON.parse(storage.getItem("governanceAlertLatest")).executionAllowed, false);
assert.equal(JSON.parse(storage.getItem("governanceAlertHistory")).length, 1);

const root = path.resolve(__dirname, "..");
for (const dbFile of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, dbFile), "utf8"));
  assert.equal(db.phase, "Phase18-9");
  assert.equal(db.autoExecutionAllowed, false);
}
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="governance-alert-engine"'));
assert.ok(index.includes('<script src="governance-alert-page.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#governance-alert-engine"'));
assert.ok(readme.includes("Phase18-9 Governance Alert & Priority Recommendation Engine"));
assert.ok(diagnosis.includes('"governance-alert-db.json"'));
assert.ok(diagnosis.includes('"tests/governanceAlertPriority.test.js"'));

console.log("governance alert priority tests passed");
