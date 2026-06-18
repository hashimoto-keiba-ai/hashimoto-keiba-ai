"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../ai-evolution-page.js");

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
const now = new Date("2026-06-18T11:00:00.000Z");
const input = {
  successPatterns: [
    { name: "東京差し優位", effectiveness: 92, roiImprovement: 88, research: "東京差し成功条件研究" },
    { name: "WIN5一頭固定", effectiveness: 84, roiImprovement: 80 }
  ],
  failurePatterns: [
    { name: "人気馬過信", severity: 95, recurrence: 88, engine: "Danger Horse Calibration Engine", database: "failure-cause-db.json" },
    { name: "小倉先行補正不足", severity: 76, recurrence: 70 }
  ],
  autoDevelopment: {
    diagnosis: { status: "READY", totalMissing: 0 },
    candidates: {
      nextEngine: "AI Evolution Engine",
      nextDatabase: "ai-evolution-knowledge-db.json",
      nextDashboardPanel: "Evolution Impact Monitor",
      nextPrivateLocalMenu: "Evolution Research Center",
      nextTest: "tests/evolutionImpactEngine.test.js"
    }
  },
  selfExpansionHistory: [{ phase: "Phase18-1", status: "ACTIVE" }],
  officialRelease: "2.8",
  racingOsProtected: true,
  dashboardHtml,
  privateLocalHtml,
  now
};

assert.equal(engine.PHASE, "Phase18-3");
assert.equal(engine.DEVELOPMENT_VERSION, "5.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8");
assert.equal(engine.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.deepEqual(engine.INTEGRATED_SYSTEMS, ["Self Expansion System", "Auto Development Engine"]);

const diagnosis = engine.diagnoseEvolution(input);
assert.equal(diagnosis.successPatternAnalysis.count, 2);
assert.equal(diagnosis.successPatternAnalysis.strongest.name, "東京差し優位");
assert.equal(diagnosis.failurePatternAnalysis.count, 2);
assert.equal(diagnosis.failurePatternAnalysis.highestRisk.name, "人気馬過信");
assert.equal(diagnosis.autoDevelopmentAnalysis.status, "READY");
assert.equal(diagnosis.selfExpansionAnalysis.status, "ANALYZED");
assert.equal(diagnosis.protectionAnalysis.officialReleaseProtected, true);
assert.equal(diagnosis.protectionAnalysis.racingOsProtected, true);
assert.equal(diagnosis.interfaceEvolutionAnalysis.dashboard, true);
assert.equal(diagnosis.interfaceEvolutionAnalysis.privateLocal, true);
assert.equal(diagnosis.interfaceEvolutionAnalysis.oneTapMenu, true);

const proposals = engine.generateEvolutionProposals(diagnosis);
assert.equal(proposals.length, 7);
assert.deepEqual(proposals.map((item) => item.category), [
  "engine", "database", "research", "dashboard", "privateLocal", "test", "protection"
]);
assert.equal(proposals[0].target, "AI Evolution Engine");
assert.equal(proposals[1].target, "ai-evolution-knowledge-db.json");
assert.equal(proposals[2].target, "東京差し成功条件研究");

assert.equal(engine.calculatePriority({
  importance: 100,
  urgency: 100,
  roiImpact: 100,
  courseImpact: 100,
  win5Impact: 100,
  maintainability: 100
}), 100);

const ranking = engine.rankEvolutionProposals(proposals);
assert.equal(ranking.length, 7);
assert.equal(ranking[0].rank, 1);
assert.ok(ranking[0].priorityScore >= ranking[1].priorityScore);
assert.ok(ranking.every((item) => item.priorityScore >= 0 && item.priorityScore <= 100));
assert.deepEqual(
  engine.rankEvolutionProposals(proposals).map((item) => item.target),
  ranking.map((item) => item.target),
  "priority ranking is deterministic"
);

const storage = createStorage({
  releaseVersion: "2.8",
  releaseStatus: "Official Release v2.8"
});
const report = engine.saveEvolution(storage, input);
assert.equal(report.status, "ON");
assert.equal(report.proposals.length, 7);
assert.equal(report.priorities[0].rank, 1);
assert.equal(storage.getItem("releaseVersion"), "2.8");
assert.equal(storage.getItem("releaseStatus"), "Official Release v2.8");
for (const key of Object.values(engine.DATABASES)) assert.ok(storage.getItem(key), key + " is saved");
assert.equal(storage.readJson(engine.DATABASES.history).length, 1);
assert.equal(storage.readJson(engine.DATABASES.priority).priorities.length, 7);

for (const file of Object.values(engine.DATABASES)) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-3");
  assert.equal(db.officialRelease, "2.8");
  assert.ok(db.protectedSystems.includes("Hashimoto Racing OS v4.0 Final"));
  assert.ok(db.protectedSystems.includes("Self Expansion System"));
  assert.ok(db.protectedSystems.includes("Auto Development Engine"));
}

[
  "AI Evolution Engine ON",
  "Self Evolution Proposal ON",
  "Evolution Priority Ranking ON",
  "Success / Failure Pattern Learning ON",
  "Auto Development Engine Integrated",
  "Self Expansion System Integrated",
  "Official Release v2.8 Protected",
  "Racing OS v4.0 Final Integrated"
].forEach((text) => assert.ok(dashboardHtml.includes(text), text + " is on Dashboard"));

[
  "AI Evolution Engine",
  "自己進化エンジン",
  "Evolution Proposal",
  "Evolution Priority Ranking",
  "Success / Failure Learning",
  "v5.0 Evolution Center"
].forEach((text) => assert.ok(privateLocalHtml.includes(text), text + " is in private-local.html"));

["自己進化", "進化案生成", "優先順位", "成功失敗学習", "v5.0進化センター"]
  .forEach((text) => assert.ok(privateLocalHtml.includes(text), text + " is in One Tap Menu"));

assert.ok(dashboardHtml.includes("Auto Development Engine ON"), "Phase18-2 remains");
assert.ok(dashboardHtml.includes("Self Expansion System ON"), "Phase18-1 remains");
assert.ok(dashboardHtml.includes('src="ai-evolution-page.js"'));
assert.ok(privateLocalHtml.includes('src="ai-evolution-page.js"'));

console.log("AI evolution engine tests passed");
