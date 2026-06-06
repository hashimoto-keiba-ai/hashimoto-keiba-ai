const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "roi-dashboard-phase103.js"), "utf8");
const context = { Intl, console, window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(script, context);

const engine = context.window.HashimotoPhase103RoiDashboardEngine;
assert.ok(engine, "Phase10-3 ROI engine should be exported");

const report = engine.buildDashboard(engine.fallbackDatabase);
assert.strictEqual(report.databaseName, "roiDatabase");
assert.ok(report.records.length > 0, "ROI records should be loaded");
assert.ok(report.summary.currentBankroll > 0, "current bankroll should be positive");
assert.ok(Number.isFinite(report.summary.overallRoi), "overall ROI should be calculated");
assert.ok(Number.isFinite(report.summary.drawdown), "drawdown should be calculated");
assert.strictEqual(report.summary.byRacecourse.length, 10);
assert.strictEqual(report.summary.byBetType.length, 6);
assert.ok(report.summary.bestRacecourse.name, "best racecourse should be selected");
assert.ok(report.summary.worstRacecourse.name, "worst racecourse should be selected");
assert.ok(report.summary.bestBetType.name, "best bet type should be selected");
assert.ok(report.summary.worstBetType.name, "worst bet type should be selected");
assert.ok(report.summary.dailyRoi.length >= 1, "daily ROI should be present");
assert.ok(report.summary.weeklyRoi.length >= 1, "weekly ROI should be present");
assert.ok(report.summary.monthlyRoi.length >= 1, "monthly ROI should be present");
assert.ok(report.charts.roiTrend.length >= 1, "ROI trend chart should be present");
assert.ok(report.charts.profitTrend.length >= 1, "profit trend chart should be present");
assert.ok(report.charts.bankrollTrend.length >= 1, "bankroll trend chart should be present");
assert.ok(report.charts.profitCurve.length >= 1, "profit curve should be present");
assert.strictEqual(JSON.stringify(engine.racecourses), JSON.stringify(["Tokyo", "Nakayama", "Hanshin", "Kyoto", "Chukyo", "Fukushima", "Niigata", "Kokura", "Hakodate", "Sapporo"]));
assert.strictEqual(JSON.stringify(engine.betTypes), JSON.stringify(["Win", "Place", "Exacta", "Quinella", "Trifecta", "WIN5"]));
assert.strictEqual(JSON.stringify(Object.keys(report.sourceConnections)), JSON.stringify(["fundManagementDatabase", "win5Database", "trifectaDatabase", "predictionDatabase", "resultVerificationDatabase"]));
console.log("Phase10-3 ROI dashboard engine test passed");
