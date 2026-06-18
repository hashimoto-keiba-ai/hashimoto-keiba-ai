"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../self-expansion-page.js");

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    readJson(key) { return JSON.parse(values.get(key)); }
  };
}

const now = new Date("2026-06-18T09:00:00.000Z");
const storage = createStorage({
  releaseVersion: "2.8",
  releaseStatus: "Official Release v2.8",
  releaseAuditReports: JSON.stringify([{ releaseScore: 100 }])
});

assert.equal(engine.PHASE, "Phase18-1");
assert.equal(engine.DEVELOPMENT_VERSION, "5.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.equal(engine.ENGINE_MENU.length, 9);
assert.equal(engine.ONE_TAP_MENU.length, 8);

const status = engine.buildVersionStatus(storage, now);
assert.equal(status.currentVersion, "5.0");
assert.equal(status.releaseScore, 100);
assert.equal(status.phaseStatus, "Version 5.0 Development");
assert.deepEqual(status.protectedVersions, [
  "Official Release v2.8",
  "Hashimoto Racing OS v4.0 Final"
]);

const report = engine.saveSelfExpansion(storage, now);
assert.equal(report.status, "ACTIVE");
assert.equal(storage.getItem("releaseVersion"), "2.8", "Official Release v2.8 must remain protected");
assert.equal(storage.getItem("releaseStatus"), "Official Release v2.8");
for (const key of Object.values(engine.DATABASES)) {
  assert.ok(storage.getItem(key), key + " is saved");
}
assert.equal(storage.readJson(engine.DATABASES.history).length, 1);
assert.equal(storage.readJson(engine.DATABASES.menu).oneTapMenu.length, 8);

for (const file of Object.values(engine.DATABASES)) {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, "..", file), "utf8"));
  assert.equal(db.phase, "Phase18-1");
  assert.equal(db.developmentVersion, "5.0");
  assert.equal(db.officialRelease, "2.8");
  assert.equal(db.protectedSystem, "Hashimoto Racing OS v4.0 Final");
}

const privateLocal = fs.readFileSync(path.join(__dirname, "..", "private-local.html"), "utf8");
for (const item of engine.ENGINE_MENU) assert.ok(privateLocal.includes(item.label), item.label + " is in private-local.html");
for (const item of engine.ONE_TAP_MENU) assert.ok(privateLocal.includes(item.label), item.label + " is in One Tap Menu");
assert.ok(privateLocal.includes('id="self-expansion-system-menu"'));
assert.ok(privateLocal.includes('src="self-expansion-page.js"'));

const dashboard = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
[
  "Hashimoto Super Core Engine v5.0",
  "Self Expansion System ON",
  "Hashimoto Racing OS v4.0 Final 統合済み",
  "Official Release v2.8 Protected",
  "Private Local Operation ON"
].forEach((text) => assert.ok(dashboard.includes(text), text + " is visible on Dashboard"));
assert.ok(dashboard.includes('id="self-expansion-panel"'));
assert.ok(dashboard.includes('src="self-expansion-page.js"'));
assert.ok(dashboard.includes("Phase17-5"), "Phase17 final integration remains");
assert.ok(dashboard.includes("Global Intelligence Network"), "Phase17 global network remains");

const readme = fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8");
assert.ok(readme.includes("Phase18-1 Self Expansion System"));
assert.ok(readme.includes("Version 5.0 開発開始"));
assert.ok(readme.includes("private-local.html 自動進化"));
assert.ok(readme.includes("One Tap Menu 自動生成"));
assert.ok(readme.includes("Dashboard 自動更新"));

console.log("self expansion engine tests passed");
