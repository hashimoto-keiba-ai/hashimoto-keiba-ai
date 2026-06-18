const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "race-simulator-phase111.js"), "utf8");
const context = { console, window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(script, context);

const simulator = context.window.HashimotoPhase111RaceFutureSimulator;
assert.ok(simulator, "Phase11-1 simulator should be exported");

const report = simulator.buildDashboard(simulator.fallbackDatabase);
assert.strictEqual(report.databaseName, "raceSimulationDatabase");
assert.strictEqual(JSON.stringify(report.runSizes), JSON.stringify([100, 500, 1000]));
assert.strictEqual(report.records.length, 4);
assert.ok(report.simulations["100"].length === 4, "100-run simulation should be generated");
assert.ok(report.simulations["500"].length === 4, "500-run simulation should be generated");
assert.ok(report.simulations["1000"].length === 4, "1000-run simulation should be generated");

report.records.forEach((horse) => {
  assert.ok(horse.winProbability >= 0 && horse.winProbability <= 100);
  assert.ok(horse.placeProbability >= 0 && horse.placeProbability <= 100);
  assert.ok(horse.showProbability >= 0 && horse.showProbability <= 100);
  assert.strictEqual(horse.simulationRuns, 1000);
  assert.ok(horse.expectedRank > 0);
  assert.ok(Number.isFinite(horse.expectedROI));
});

assert.strictEqual(report.summary.topWinChances.length, 3);
assert.strictEqual(report.summary.topPlaceChances.length, 3);
assert.strictEqual(report.summary.topShowChances.length, 3);
assert.ok(report.summary.expectedTrifecta.includes("-"));
assert.ok(Number.isFinite(report.summary.expectedWIN5Value));
assert.ok(Number.isFinite(report.summary.expectedROI));
assert.ok(report.summary.bestHorse.horseName);
assert.strictEqual(JSON.stringify(Object.keys(report.sourceConnections)), JSON.stringify(["predictionDatabase", "aiIndexDatabase", "dangerPopularDatabase", "kamiAnaDatabase", "win5Database", "roiDatabase"]));
console.log("Phase11-1 race future simulator test passed");
