const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const script = fs.readFileSync(path.join(__dirname, "..", "race-entry-auto-import-phase142.js"), "utf8");
const context = {
  console,
  window: {},
  document: {
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(script, context);

const importer = context.window.HashimotoPhase142RaceEntryAutoImport;
assert.ok(importer, "Phase14-2 race entry auto import should be exported");

const record = importer.autoImportRaceEntries({
  開催日: "2026-06-06",
  競馬場: "東京",
  レース番号: 11
});

assert.strictEqual(record.importStatus, "Imported");
assert.strictEqual(record.targetDatabase, "raceEntries");
assert.strictEqual(record.raceKey, "2026-06-06-東京-11R");
assert.strictEqual(record.出走馬.length, 8);
assert.strictEqual(record.errorCount, 0);

record.出走馬.forEach((entry) => {
  ["出走馬", "騎手", "調教師", "枠順", "馬番", "斤量"].forEach((field) => {
    assert.notStrictEqual(entry[field], undefined, `${field} should be imported`);
  });
});

const payload = importer.buildRaceEntriesPayload(record);
assert.strictEqual(payload.type, "raceEntries");
assert.strictEqual(payload.items.length, 8);
assert.strictEqual(payload.items[0].date, "2026-06-06");
assert.strictEqual(payload.items[0].racecourse, "東京");
assert.strictEqual(payload.items[0].raceNumber, 11);
assert.ok(payload.items[0].horseName);
assert.ok(payload.items[0].jockey);
assert.ok(payload.items[0].trainer);
assert.ok(Number.isFinite(payload.items[0].carriedWeight));

const invalid = importer.autoImportRaceEntries({
  開催日: "",
  競馬場: "門別",
  レース番号: "abc"
});

assert.strictEqual(invalid.importStatus, "Import Blocked");
assert.ok(invalid.errors.includes("開催日が未入力です"));
assert.ok(invalid.errors.includes("対応外の競馬場です"));
assert.ok(invalid.errors.includes("レース番号が不正です"));

const dashboard = importer.buildDashboard(importer.fallbackDatabase);
assert.strictEqual(dashboard.databaseName, "raceEntryAutoImportDatabase");
assert.strictEqual(dashboard.phase, "Phase14-2");
assert.strictEqual(dashboard.requiredFields.length, 3);
assert.strictEqual(dashboard.entryFields.length, 6);
assert.strictEqual(dashboard.racecourses.length, 10);
assert.strictEqual(dashboard.widget.targetDatabase, "raceEntries");

console.log("Phase14-2 race entry auto import test passed");
