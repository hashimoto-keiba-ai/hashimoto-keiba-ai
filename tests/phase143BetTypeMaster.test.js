const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "bet-type-master-phase143.js"), "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const master = context.window.HashimotoPhase143BetTypeMaster;
assert.ok(master, "Phase14-3 bet type master should be exported");

assert.strictEqual(JSON.stringify(master.canonicalBetTypes), JSON.stringify(["単勝", "複勝", "馬連", "馬単", "三連複", "三連単", "WIN5"]));
assert.strictEqual(master.normalizeBetType("Win"), "単勝");
assert.strictEqual(master.normalizeBetType("Exacta"), "馬単");
assert.strictEqual(master.normalizeBetType("Trifecta"), "三連単");
assert.strictEqual(master.normalizeBetType("win5"), "WIN5");

const validation = master.validateBetTypes(["Win", "Place", "Quinella", "Exacta", "Trio", "Trifecta", "WIN5"]);
assert.strictEqual(validation.valid, true);
assert.strictEqual(JSON.stringify(validation.normalized), JSON.stringify(["単勝", "複勝", "馬連", "馬単", "三連複", "三連単", "WIN5"]));

const report = master.buildDashboard(master.fallbackDatabase);
assert.strictEqual(report.databaseName, "betTypeMasterDatabase");
assert.strictEqual(report.phase, "Phase14-3");
assert.strictEqual(report.records.length, 7);
assert.strictEqual(report.validation.valid, true);
assert.strictEqual(report.widget.betTypeCount, 7);
assert.strictEqual(report.widget.validationStatus, "Ready");

const plan = master.buildTicketPlan({ budget: 10000, mode: "Balanced" });
assert.strictEqual(plan.betTypes.length, 7);
assert.strictEqual(plan.totalAmount, 10000);
assert.ok(plan.allocation.some((item) => item.betType === "馬単"));
assert.ok(plan.allocation.some((item) => item.betType === "三連複"));
assert.ok(plan.allocation.some((item) => item.betType === "WIN5"));

console.log("Phase14-3 bet type master test passed");
