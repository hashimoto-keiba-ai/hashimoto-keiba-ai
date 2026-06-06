const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "trifecta-phase101.js"), "utf8");
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

const engine = context.window.HashimotoPhase101TrifectaEngine;
assert.ok(engine, "Phase10-1 Trifecta engine should be exported");

const report = engine.buildDashboard(engine.fallbackDatabase);
assert.strictEqual(report.databaseName, "trifectaDatabase");
assert.strictEqual(report.records.length, 1);
assert.ok(report.todayWidget, "today widget should be generated");
assert.ok(report.todayWidget.expectedReturn > 0, "expected return should be positive");
assert.ok(report.todayWidget.hitProbability > 0, "hit probability should be positive");
assert.ok(report.todayWidget.riskScore > 0, "risk score should be positive");

assert.strictEqual(report.outputs.trifecta8Point.length, 8);
assert.strictEqual(report.outputs.trifecta12Point.length, 12);
assert.strictEqual(report.outputs.trifecta16Point.length, 16);

const record = report.records[0];
assert.strictEqual(
  JSON.stringify(record.modes.map((mode) => mode.name)),
  JSON.stringify(["Safe Mode", "Standard Mode", "High Return Mode", "Monster Ticket Mode"])
);

record.modes.forEach((mode) => {
  assert.ok(mode.simulation.hitProbability > 0, `${mode.name} hit probability should be positive`);
  assert.ok(mode.simulation.expectedReturn > 0, `${mode.name} expected return should be positive`);
  assert.ok(mode.simulation.riskScore > 0, `${mode.name} risk score should be positive`);
  mode.tickets.forEach((ticket) => {
    assert.ok(ticket.first, "ticket should include 1st position");
    assert.ok(ticket.second, "ticket should include 2nd position");
    assert.ok(ticket.third, "ticket should include 3rd position");
    assert.notStrictEqual(ticket.first, ticket.second);
    assert.notStrictEqual(ticket.first, ticket.third);
    assert.notStrictEqual(ticket.second, ticket.third);
  });
});

assert.strictEqual(
  JSON.stringify(Object.keys(report.sourceConnections)),
  JSON.stringify([
    "aiIndexDatabase",
    "dangerPopularHorseDatabase",
    "kamiAnaDatabase",
    "godHoleRankingDatabase"
  ])
);

console.log("Phase10-1 Trifecta engine test passed");
