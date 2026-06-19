const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "fund-management-phase102.js"), "utf8");
const context = {
  Intl,
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const engine = context.window.HashimotoPhase102FundManagementEngine;
assert.ok(engine, "Phase10-2 fund engine should be exported");

const report = engine.buildDashboard(engine.fallbackDatabase);
assert.strictEqual(report.databaseName, "fundManagementDatabase");
assert.strictEqual(report.records.length, 2);
assert.ok(report.todayWidget, "today widget should be generated");
assert.ok(report.todayWidget.recommendedBudget > 0, "recommended budget should be positive");
assert.ok(report.todayWidget.expectedRoi > 0, "expected ROI should be positive");
assert.ok(report.todayWidget.confidence > 0, "confidence should be positive");

const best = report.records[0];
assert.strictEqual(best.raceCategory, "A");
assert.strictEqual(best.raceCategoryLabel, "Strong Bet");
assert.ok(best.expectedProfit > 0, "expected profit should be positive");
assert.ok(["Low", "Medium", "High"].includes(best.riskLevel), "risk level should be classified");

assert.strictEqual(
  JSON.stringify(best.modes.map((mode) => mode.mode)),
  JSON.stringify(["Conservative", "Balanced", "Aggressive"])
);

const modeBudgets = best.modes.map((mode) => mode.recommendedBudget);
assert.ok(modeBudgets[0] <= modeBudgets[1], "Conservative budget should not exceed Balanced");
assert.ok(modeBudgets[1] <= modeBudgets[2], "Balanced budget should not exceed Aggressive");

assert.strictEqual(engine.classifyRace({ aiScore: 50, hitProbability: 10, expectedReturn: 0.92, riskScore: 80 }), "D");
assert.strictEqual(engine.classifyRace({ aiScore: 88, hitProbability: 35, expectedReturn: 1.7, riskScore: 40, confidence: 82 }), "A");

assert.strictEqual(
  JSON.stringify(Object.keys(report.sourceConnections)),
  JSON.stringify([
    "aiIndexDatabase",
    "win5Database",
    "trifectaDatabase",
    "dangerPopularHorseDatabase",
    "kamiAnaDatabase"
  ])
);

console.log("Phase10-2 fund management engine test passed");
