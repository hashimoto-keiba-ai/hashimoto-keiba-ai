const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "live-operations-phase141.js"), "utf8");
const context = {
  console,
  Intl,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const liveOperations = context.window.HashimotoPhase141LiveOperations;
assert.ok(liveOperations, "Phase14-1 live operations system should be exported");

const report = liveOperations.buildDashboard(liveOperations.fallbackDatabase);

assert.strictEqual(report.databaseName, "liveOperationsDatabase");
assert.strictEqual(report.phase, "Phase14-1");
assert.strictEqual(report.coverage.length, 10);
assert.strictEqual(report.systems.length, 8);
assert.strictEqual(report.summary.racecourseCoverage, 100);
assert.strictEqual(report.summary.systemCoverage, 100);
assert.ok(report.summary.operationsScore > 80);
assert.ok(["Full Live", "Live", "Watch", "Standby"].includes(report.summary.operationStatus));
assert.ok(report.summary.bestLiveRace.race.includes("Tokyo"));
assert.ok(report.summary.actionQueue.length > 0);

[
  "Tokyo",
  "Nakayama",
  "Hanshin",
  "Kyoto",
  "Chukyo",
  "Fukushima",
  "Niigata",
  "Kokura",
  "Hakodate",
  "Sapporo"
].forEach((racecourse) => {
  assert.ok(report.coverage.some((item) => item.name === racecourse), `${racecourse} should be integrated`);
});

[
  "WIN5 AI",
  "Trifecta AI",
  "ROI Engine",
  "Fund Management",
  "Self Learning",
  "Race Future Simulator",
  "God Race Detection",
  "Command Center"
].forEach((system) => {
  assert.ok(report.systems.some((item) => item.name === system), `${system} should be integrated`);
});

assert.strictEqual(liveOperations.classifyOperation(95), "Full Live");
assert.strictEqual(liveOperations.classifyOperation(85), "Live");
assert.strictEqual(liveOperations.classifyOperation(75), "Watch");
assert.strictEqual(liveOperations.classifyOperation(60), "Standby");
assert.ok(liveOperations.calculateLiveScore({ raceScore: 90, expectedROI: 180, hitProbability: 20 }) > 80);

console.log("Phase14-1 live operations system test passed");
