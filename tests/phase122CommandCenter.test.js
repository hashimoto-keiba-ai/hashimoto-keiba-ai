const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "command-center-phase122.js"), "utf8");
const context = { Intl, console, window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(script, context);

const commandCenter = context.window.HashimotoPhase122CommandCenter;
assert.ok(commandCenter, "Phase12-2 command center should be exported");
const report = commandCenter.buildDashboard(commandCenter.fallbackData);
assert.strictEqual(report.databaseName, "hashimotoCommandCenter");
assert.strictEqual(report.phase, "Phase12-2");
["godRaceWidget", "roiWidget", "win5Widget", "trifectaWidget", "dangerHorseWidget", "kamiAnaWidget", "simulationWidget", "learningWidget", "fundWidget"].forEach((widgetName) => assert.ok(Array.isArray(report.widgets[widgetName]), `${widgetName} should be generated`));
assert.ok(report.summary.todaysGodRaces.length > 0, "God races should be shown");
assert.ok(report.summary.topRoiOpportunities.length > 0, "ROI opportunities should be shown");
assert.ok(report.summary.topTrifectaOpportunities.length > 0, "Trifecta opportunities should be shown");
assert.ok(report.summary.topWin5Opportunities.length > 0, "WIN5 opportunities should be shown");
assert.ok(report.summary.dangerPopularHorses.length > 0, "Danger horses should be shown");
assert.ok(report.summary.kamiAnaHorses.length > 0, "Kami-Ana horses should be shown");
assert.ok(report.summary.raceFutureSimulationResults.length > 0, "Simulation results should be shown");
assert.ok(report.summary.fundManagementStatus, "Fund status should be shown");
assert.ok(report.summary.bankrollStatus.remaining > 0, "Bankroll status should be calculated");
assert.ok(report.summary.learningStatus.records > 0, "Learning status should be calculated");
assert.ok(report.summary.roiTrend.length > 0, "ROI trend should be generated");
assert.strictEqual(JSON.stringify(Object.keys(report.sourceConnections)), JSON.stringify(["predictionDatabase", "resultVerificationDatabase", "osUpdateDatabase", "aiIndexDatabase", "win5Database", "trifectaDatabase", "roiDatabase", "learningDatabase", "raceSimulationDatabase", "godRaceDatabase", "fundManagementDatabase", "autoBettingDatabase"]));
console.log("Phase12-2 command center test passed");
