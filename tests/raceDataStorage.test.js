const assert = require("assert");
const { HISTORY_DB_FILE_NAME, RACE_DATA_FILE_NAME, accumulateHistoryRecord, buildRaceDataRecord, createEmptyHistoryDb, createEmptyRaceData, historyCategories, normalizeRaceNumber, serializeHistoryDb, serializeRaceData, upsertRaceDataRecord } = require("../race-page.js");

assert.strictEqual(RACE_DATA_FILE_NAME, "race-data.json");
assert.strictEqual(HISTORY_DB_FILE_NAME, "history-db.json");
assert.strictEqual(historyCategories.tokyo, "東京");
assert.strictEqual(historyCategories.win5, "WIN5");
assert.strictEqual(normalizeRaceNumber(0), 1);
assert.strictEqual(normalizeRaceNumber(13), 12);
assert.strictEqual(normalizeRaceNumber(7), 7);

const record = buildRaceDataRecord({
  courseKey: "tokyo",
  raceNumber: 11,
  values: { date: "2026-06-15", prediction: "東京R11 事前予想", result: "東京R11 結果", review: "東京R11 検証", update: "東京R11 アップデート", hitRate: "42%", returnRate: "118%", trifectaReturnRate: "164%", win5Result: "対象外", aiUpdateLog: "展開評価を更新" },
  now: new Date("2026-06-15T09:00:00.000Z")
});

assert.strictEqual(record.course, "tokyo");
assert.strictEqual(record.race, "R11");
assert.strictEqual(record.date, "2026-06-15");
assert.strictEqual(record.trifectaReturnRate, "164%");

let raceData = upsertRaceDataRecord(createEmptyRaceData(), record);
assert.strictEqual(raceData.version, "1.5");
assert.strictEqual(raceData.releaseStatus, "Official Release v1.5");
assert.strictEqual(raceData.races.length, 1);

const updated = upsertRaceDataRecord(raceData, { ...record, prediction: "更新済み予想", savedAt: "2026-06-15T10:00:00.000Z" });
assert.strictEqual(updated.races.length, 1);
assert.strictEqual(updated.races[0].prediction, "更新済み予想");
assert.ok(serializeRaceData(updated).includes('"prediction": "更新済み予想"'));

let historyDb = accumulateHistoryRecord(createEmptyHistoryDb(), record);
assert.strictEqual(historyDb.version, "1.5");
assert.strictEqual(historyDb.releaseStatus, "Official Release v1.5");
assert.strictEqual(historyDb.categories["東京"].length, 1);
assert.strictEqual(historyDb.categories["東京"][0].course, "東京");
assert.strictEqual(historyDb.categories["東京"][0].aiUpdateLog, "展開評価を更新");
assert.ok(serializeHistoryDb(historyDb).includes('"aiUpdateLog": "展開評価を更新"'));

console.log("raceDataStorage tests passed");
