const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = require("../final-system-page.js");

const store = new Map();
const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)) };
engine.MONITORED_DATABASES.forEach((key) => storage.setItem(key, JSON.stringify({ records: [{ ok: true }] })));
engine.REQUIRED_COMPONENTS.forEach((component) => storage.setItem(component.keys[0], JSON.stringify({ records: [{ status: "ONLINE" }] })));
storage.setItem("finalHealthCheckReports", JSON.stringify([{ score: 96, criticalErrors: 0 }]));
storage.setItem("releaseVersion", "2.8");

const report = engine.buildFinalSystemReport({ storage, now: () => new Date("2026-06-18T06:00:00.000Z") });
assert.equal(engine.OS_VERSION, "4.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.PHASE, "Phase17-5");
assert.equal(engine.REQUIRED_COMPONENTS.length, 10);
assert.equal(report.healthScore, 96);
assert.equal(report.componentCoverage, 100);
assert.equal(report.databaseCoverage, 100);
assert.equal(report.productionReady, true);
assert.equal(report.releaseStatus, "Production Ready");
assert.equal(report.systemStatus, "AUTONOMOUS");

engine.runAutonomousControl({ storage, now: () => new Date("2026-06-18T06:00:00.000Z") });
Object.values(engine.DATABASE_KEYS).forEach((key) => {
  const saved = JSON.parse(storage.getItem(key));
  assert.equal(saved.osVersion, "4.0");
  assert.equal(saved.officialRelease, "2.8");
  assert.equal(saved.records.length, 1);
});
assert.equal(storage.getItem("releaseVersion"), "2.8");
assert.equal(storage.getItem("releaseStatus"), "Official Release v2.8");

const blocked = engine.judgeProductionReady({ healthScore: 89, componentCoverage: 100, databaseCoverage: 100, criticalErrors: 0, versionProtected: true });
assert.equal(blocked.ready, false);
assert.equal(blocked.status, "Final Validation");

for (const key of Object.values(engine.DATABASE_KEYS)) {
  const db = JSON.parse(fs.readFileSync(key, "utf8"));
  assert.equal(db.phase, "Phase17-5");
  assert.deepEqual(db.records, []);
}

console.log("final system engine tests passed");
