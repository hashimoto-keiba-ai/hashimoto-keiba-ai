const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "self-learning-phase104.js"), "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const engine = context.window.HashimotoPhase104SelfLearningEngine;
assert.ok(engine, "Phase10-4 self-learning engine should be exported");

const report = engine.buildDashboard(engine.fallbackDatabase);
assert.strictEqual(report.databaseName, "learningDatabase");
assert.strictEqual(report.records.length, 4);
assert.ok(report.summary.accuracy > 0, "accuracy should be calculated");
assert.ok(report.summary.averageLearningScore > 0, "learning score should be calculated");
assert.ok(report.summary.averageImprovementScore > 0, "improvement score should be calculated");
assert.ok(Number.isFinite(report.summary.averageConfidenceAdjustment), "confidence adjustment should be calculated");
assert.ok(report.summary.topLearningItems.length > 0, "top learning items should be generated");
assert.ok(report.summary.topErrorCategories.length > 0, "top error categories should be generated");
assert.ok(report.trends.improvementTrend.length === report.records.length, "improvement trend should cover all records");
assert.ok(report.trends.accuracyTrend.length === report.records.length, "accuracy trend should cover all records");
assert.ok(report.trends.roiImprovementTrend.length === report.records.length, "ROI improvement trend should cover all records");

const errorRecord = report.records.find((record) => record.race.includes("Hanshin"));
assert.ok(errorRecord.errorCategories.includes("Pace"), "pace error should be classified");
assert.ok(errorRecord.errorCategories.includes("Position"), "position error should be classified");
assert.ok(errorRecord.errorCategories.includes("Danger Horse"), "danger horse error should be classified");

assert.strictEqual(
  JSON.stringify(Object.keys(report.summary.weightAdjustments)),
  JSON.stringify([
    "aiIndexWeight",
    "dangerPopularWeight",
    "kamiAnaWeight",
    "win5Weight",
    "trifectaWeight",
    "roiWeight"
  ])
);

Object.values(report.summary.weightAdjustments).forEach((weight) => {
  assert.ok(weight >= 1, "weight adjustment should not reduce below baseline in this learning batch");
});

assert.strictEqual(
  JSON.stringify(Object.keys(report.sourceConnections)),
  JSON.stringify([
    "predictionDatabase",
    "resultVerificationDatabase",
    "aiIndexDatabase",
    "win5Database",
    "trifectaDatabase",
    "roiDatabase"
  ])
);

console.log("Phase10-4 self-learning engine test passed");
