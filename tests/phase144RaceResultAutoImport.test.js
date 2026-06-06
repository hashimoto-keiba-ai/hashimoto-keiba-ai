const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "race-result-auto-import-phase144.js"), "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const importer = context.window.HashimotoPhase144RaceResultAutoImport;
assert.ok(importer, "Phase14-4 race result auto import should be exported");

const record = importer.autoImportRaceResults({
  開催日: "2026-06-06",
  競馬場: "東京",
  レース番号: 11
});

assert.strictEqual(record.importStatus, "Imported");
assert.strictEqual(record.raceKey, "2026-06-06-東京-11R");
assert.strictEqual(record.着順.length, 8);
assert.strictEqual(record.ラップ.length, 8);
assert.strictEqual(record.errorCount, 0);

record.着順.forEach((result) => {
  ["着順", "馬番", "馬名", "上がり", "4角位置"].forEach((field) => {
    assert.notStrictEqual(result[field], undefined, `${field} should be imported`);
  });
});

["単勝", "複勝", "馬連", "馬単", "三連複", "三連単", "WIN5"].forEach((type) => {
  assert.ok(Number.isFinite(record.払戻[type]), `${type} payout should be imported`);
});

const raceResultsPayload = importer.buildRaceResultsPayload(record);
assert.strictEqual(raceResultsPayload.type, "raceResults");
assert.strictEqual(raceResultsPayload.items.length, 8);
assert.strictEqual(raceResultsPayload.races[0].racecourse, "東京");
assert.strictEqual(raceResultsPayload.items[0].finishPosition, 1);
assert.ok(Number.isFinite(raceResultsPayload.items[0].last3f));
assert.ok(Number.isFinite(raceResultsPayload.items[0].corner4Position));

const resultsPayload = importer.buildResultsPayload(record);
assert.strictEqual(resultsPayload.type, "results");
assert.strictEqual(resultsPayload.items[0].firstNumber, record.着順[0].馬番);
assert.strictEqual(resultsPayload.items[0].payoutAmount, record.払戻.三連単);
assert.ok(resultsPayload.items[0].lapSummary.includes("-"));

const invalid = importer.autoImportRaceResults({
  開催日: "",
  競馬場: "門別",
  レース番号: "abc"
});

assert.strictEqual(invalid.importStatus, "Import Blocked");
assert.ok(invalid.errors.includes("開催日が未入力です"));
assert.ok(invalid.errors.includes("対応外の競馬場です"));
assert.ok(invalid.errors.includes("レース番号が不正です"));

const dashboard = importer.buildDashboard(importer.fallbackDatabase);
assert.strictEqual(dashboard.databaseName, "raceResultAutoImportDatabase");
assert.strictEqual(dashboard.phase, "Phase14-4");
assert.strictEqual(dashboard.resultFields.length, 5);
assert.strictEqual(dashboard.payoutTypes.length, 7);
assert.strictEqual(dashboard.widget.lapCount, 8);

console.log("Phase14-4 race result auto import test passed");
