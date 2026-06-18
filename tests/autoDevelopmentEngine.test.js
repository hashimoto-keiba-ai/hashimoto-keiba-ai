"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../auto-development-page.js");

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    readJson(key) { return JSON.parse(values.get(key)); }
  };
}

const root = path.join(__dirname, "..");
const files = [
  "auto-development-page.js",
  "auto-development-db.json",
  "auto-development-history-db.json",
  "auto-development-rule-db.json",
  "auto-development-roadmap-db.json",
  "auto-development-scan-db.json",
  "tests/autoDevelopmentEngine.test.js"
];
const dashboardHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocalHtml = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readmeText = fs.readFileSync(path.join(root, "README.md"), "utf8");
const now = new Date("2026-06-18T10:00:00.000Z");

assert.equal(engine.PHASE, "Phase18-2");
assert.equal(engine.DEVELOPMENT_VERSION, "5.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.equal(engine.INTEGRATED_SYSTEM, "Self Expansion System v5.0");

const complete = engine.diagnoseSystem({ files, dashboardHtml, privateLocalHtml, readmeText, now });
assert.equal(complete.status, "READY");
assert.equal(complete.totalMissing, 0);
assert.deepEqual(complete.categories.missingDatabases, []);
assert.deepEqual(complete.categories.missingTests, []);

const incomplete = engine.diagnoseSystem({
  files: [],
  dashboardHtml: "",
  privateLocalHtml: "",
  readmeText: "",
  now
});
assert.equal(incomplete.status, "DEVELOPMENT_REQUIRED");
assert.equal(incomplete.categories.unconnectedPages[0], "auto-development-page.js");
assert.equal(incomplete.categories.missingDatabases.length, 5);
assert.equal(incomplete.categories.missingTests[0], "tests/autoDevelopmentEngine.test.js");
assert.ok(incomplete.categories.dashboardHiddenFeatures.length > 0);
assert.ok(incomplete.categories.privateLocalHiddenFeatures.length > 0);
assert.ok(incomplete.categories.oneTapDisconnectedFeatures.length > 0);
assert.ok(incomplete.categories.readmeMissingFeatures.length > 0);

const candidates = engine.generateDevelopmentCandidates(incomplete);
assert.equal(candidates.nextEngine, "auto-development-page.js");
assert.equal(candidates.nextDatabase, "auto-development-db.json");
assert.equal(candidates.nextTest, "tests/autoDevelopmentEngine.test.js");
assert.equal(candidates.priority, "HIGH");

const nextCandidates = engine.generateDevelopmentCandidates(complete);
assert.equal(nextCandidates.nextEngine, "AI Evolution Engine");
assert.equal(nextCandidates.priority, "NEXT_PHASE");

const roadmap = engine.generateRoadmap();
assert.deepEqual(roadmap.map((item) => item.phase), [
  "Phase18-3",
  "Phase18-4",
  "Phase18-5",
  "Version5.0 Final"
]);
assert.equal(roadmap[0].status, "NEXT");

const storage = createStorage({
  releaseVersion: "2.8",
  releaseStatus: "Official Release v2.8"
});
const report = engine.saveAutoDevelopment(storage, { files, dashboardHtml, privateLocalHtml, readmeText, now });
assert.equal(report.diagnosis.status, "READY");
assert.equal(storage.getItem("releaseVersion"), "2.8");
assert.equal(storage.getItem("releaseStatus"), "Official Release v2.8");
for (const key of Object.values(engine.DATABASES)) assert.ok(storage.getItem(key), key + " is saved");
assert.equal(storage.readJson(engine.DATABASES.history).length, 1);
assert.equal(storage.readJson(engine.DATABASES.roadmap).roadmap.length, 4);

for (const file of Object.values(engine.DATABASES)) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-2");
  assert.equal(db.officialRelease, "2.8");
  assert.ok(db.protectedSystems.includes("Hashimoto Racing OS v4.0 Final"));
  assert.ok(db.protectedSystems.includes("Self Expansion System v5.0"));
}

[
  "Auto Development Engine ON",
  "Missing Feature Scan ON",
  "Auto Roadmap Generation ON",
  "Dashboard / private-local / One Tap Menu 監視中",
  "Official Release v2.8 Protected",
  "Racing OS v4.0 Final Integrated",
  "Self Expansion System v5.0 Integrated"
].forEach((text) => assert.ok(dashboardHtml.includes(text), text + " is on Dashboard"));

for (const item of engine.REQUIREMENTS.privateLocal) assert.ok(privateLocalHtml.includes(item), item + " is in private-local.html");
for (const item of engine.REQUIREMENTS.oneTap) assert.ok(privateLocalHtml.includes(item), item + " is in One Tap Menu");
assert.ok(dashboardHtml.includes('src="auto-development-page.js"'));
assert.ok(privateLocalHtml.includes('src="auto-development-page.js"'));
assert.ok(dashboardHtml.includes("Self Expansion System"), "Phase18-1 remains on Dashboard");

console.log("auto development engine tests passed");
