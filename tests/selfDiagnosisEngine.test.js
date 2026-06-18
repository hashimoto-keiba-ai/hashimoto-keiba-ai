"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../self-diagnosis-page.js");

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    readJson(key) { return JSON.parse(values.get(key)); }
  };
}

const root = path.join(__dirname, "..");
const dashboardHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocalHtml = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readmeText = fs.readFileSync(path.join(root, "README.md"), "utf8");
const files = [].concat(engine.REQUIREMENTS.engines, engine.REQUIREMENTS.databases, engine.REQUIREMENTS.tests);
const now = new Date("2026-06-18T12:00:00.000Z");
const healthyInput = {
  files,
  dashboardHtml,
  privateLocalHtml,
  readmeText,
  links: [{ href: "index.html#self-diagnosis-panel", exists: true }],
  jsonResults: engine.REQUIREMENTS.databases.map((file) => ({ file, valid: true })),
  javascriptResults: engine.REQUIREMENTS.engines.map((file) => ({ file, valid: true })),
  conflictMarkers: [],
  officialRelease: "2.8",
  racingOsProtected: true,
  selfExpansionIntegrated: true,
  autoDevelopmentIntegrated: true,
  aiEvolutionIntegrated: true,
  now
};

assert.equal(engine.PHASE, "Phase18-4");
assert.equal(engine.DEVELOPMENT_VERSION, "5.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.deepEqual(engine.INTEGRATED_SYSTEMS, [
  "Self Expansion System",
  "Auto Development Engine",
  "AI Evolution Engine"
]);

const healthy = engine.diagnoseSystem(healthyInput);
assert.equal(healthy.status, "HEALTHY");
assert.equal(healthy.anomalyCount, 0);
assert.equal(healthy.health.systemHealthScore, 100);
assert.equal(healthy.health.engineHealthScore, 100);
assert.equal(healthy.health.dbHealthScore, 100);
assert.equal(healthy.health.dashboardHealthScore, 100);
assert.equal(healthy.health.menuHealthScore, 100);
assert.equal(healthy.health.testHealthScore, 100);
assert.equal(healthy.health.protectionHealthScore, 100);
assert.equal(healthy.repairs.nextFileToRepair, "No broken file detected");

const broken = engine.diagnoseSystem({
  files: [],
  dashboardHtml: "",
  privateLocalHtml: "",
  readmeText: "",
  links: [{ href: "missing-page.html", exists: false }],
  jsonResults: [{ file: "broken-db.json", valid: false }],
  javascriptResults: [{ file: "broken-engine.js", valid: false }],
  conflictMarkers: ["index.html:10"],
  officialRelease: "1.0",
  racingOsProtected: false,
  selfExpansionIntegrated: false,
  autoDevelopmentIntegrated: false,
  aiEvolutionIntegrated: false,
  now
});
assert.equal(broken.status, "REPAIR_REQUIRED");
assert.ok(broken.anomalyCount > 0);
assert.ok(broken.anomalies.brokenLinks.includes("missing-page.html"));
assert.ok(broken.anomalies.unconnectedPages.includes("self-diagnosis-page.js"));
assert.ok(broken.anomalies.missingDatabases.includes("self-diagnosis-db.json"));
assert.ok(broken.anomalies.missingTests.includes("tests/selfDiagnosisEngine.test.js"));
assert.ok(broken.anomalies.dashboardHiddenFeatures.includes("Self Diagnosis Engine ON"));
assert.ok(broken.anomalies.privateLocalHiddenFeatures.includes("Self Diagnosis Engine"));
assert.ok(broken.anomalies.oneTapDisconnectedFeatures.includes("自己診断"));
assert.ok(broken.anomalies.readmeMissingFeatures.includes("Phase18-4"));
assert.ok(broken.anomalies.jsonIntegrityErrors.includes("broken-db.json"));
assert.ok(broken.anomalies.javascriptSyntaxErrors.includes("broken-engine.js"));
assert.ok(broken.anomalies.conflictMarkers.includes("index.html:10"));
assert.ok(broken.anomalies.missingProtection.includes("Official Release v2.8"));
assert.ok(broken.health.systemHealthScore < 100);
assert.ok(broken.health.protectionHealthScore < 100);
assert.equal(broken.repairs.nextFileToRepair, "broken-engine.js");
assert.equal(broken.repairs.nextDatabaseToAdd, "final-system-db.json");
assert.equal(broken.repairs.nextTestToAdd, "tests/finalSystemEngine.test.js");
assert.equal(broken.repairs.nextPageToConnect, "final-system-page.js");
assert.equal(broken.repairs.nextDashboardUpdate, "Hashimoto Racing OS v4.0 Final");
assert.equal(broken.repairs.nextReadmeUpdate, "Phase18-4");

const storage = createStorage({ releaseVersion: "2.8", releaseStatus: "Official Release v2.8" });
const report = engine.saveDiagnosis(storage, healthyInput);
assert.equal(report.diagnosis.status, "HEALTHY");
assert.equal(storage.getItem("releaseVersion"), "2.8");
assert.equal(storage.getItem("releaseStatus"), "Official Release v2.8");
for (const key of Object.values(engine.DATABASES)) assert.ok(storage.getItem(key), key + " is saved");
assert.equal(storage.readJson(engine.DATABASES.history).length, 1);
assert.equal(storage.readJson(engine.DATABASES.health).health.systemHealthScore, 100);

for (const file of Object.values(engine.DATABASES)) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-4");
  assert.equal(db.officialRelease, "2.8");
  assert.ok(db.protectedSystems.includes("Hashimoto Racing OS v4.0 Final"));
  assert.ok(db.protectedSystems.includes("AI Evolution Engine"));
}

[
  "Self Diagnosis Engine ON",
  "System Health Scan ON",
  "Missing Feature Detection ON",
  "Broken Link Detection ON",
  "Protection Check ON",
  "Repair Proposal ON",
  "Official Release v2.8 Protected",
  "Racing OS v4.0 Final Integrated",
  "Self Expansion System Integrated",
  "Auto Development Engine Integrated",
  "AI Evolution Engine Integrated"
].forEach((text) => assert.ok(dashboardHtml.includes(text), text + " is on Dashboard"));

for (const item of engine.REQUIREMENTS.privateLocal) assert.ok(privateLocalHtml.includes(item), item + " is in private-local.html");
for (const item of engine.REQUIREMENTS.oneTap) assert.ok(privateLocalHtml.includes(item), item + " is in One Tap Menu");
assert.ok(dashboardHtml.includes("AI Evolution Engine ON"), "Phase18-3 remains");
assert.ok(dashboardHtml.includes("Auto Development Engine ON"), "Phase18-2 remains");
assert.ok(dashboardHtml.includes("Self Expansion System ON"), "Phase18-1 remains");
assert.ok(dashboardHtml.includes('src="self-diagnosis-page.js"'));
assert.ok(privateLocalHtml.includes('src="self-diagnosis-page.js"'));

console.log("self diagnosis engine tests passed");
