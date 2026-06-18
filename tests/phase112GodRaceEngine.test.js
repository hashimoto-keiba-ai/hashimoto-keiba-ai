const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "god-race-phase112.js"), "utf8");
const context = { console, window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(script, context);

const engine = context.window.HashimotoPhase112GodRaceEngine;
assert.ok(engine, "Phase11-2 God Race engine should be exported");
const report = engine.buildDashboard(engine.fallbackDatabase);
assert.strictEqual(report.databaseName, "godRaceDatabase");
assert.strictEqual(report.records.length, 4);
assert.ok(report.summary.bestRace.raceScore > 0, "best race score should be calculated");
assert.ok(report.summary.topExpectedROI.length > 0, "top ROI list should be generated");
assert.ok(report.summary.topExpectedProfit.length > 0, "top profit list should be generated");
assert.ok(report.summary.topWIN5Opportunities.length > 0, "top WIN5 list should be generated");
assert.ok(report.summary.topTrifectaOpportunities.length > 0, "top Trifecta list should be generated");
report.records.forEach((record) => { assert.ok(record.raceScore >= 0 && record.raceScore <= 100); assert.ok(["God Race", "Strong Race", "Good Race", "Skip"].includes(record.raceClass)); });
assert.strictEqual(engine.classifyRace(95), "God Race");
assert.strictEqual(engine.classifyRace(85), "Strong Race");
assert.strictEqual(engine.classifyRace(75), "Good Race");
assert.strictEqual(engine.classifyRace(60), "Skip");
assert.strictEqual(JSON.stringify(Object.keys(report.sourceConnections)), JSON.stringify(["predictionDatabase", "resultVerificationDatabase", "aiIndexDatabase", "win5Database", "trifectaDatabase", "roiDatabase", "raceFutureSimulatorDatabase"]));
console.log("Phase11-2 God Race engine test passed");
