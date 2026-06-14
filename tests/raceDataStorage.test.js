const assert = require("assert");
const {
  RACE_DATA_FILE_NAME,
  buildRaceDataRecord,
  createEmptyRaceData,
  normalizeRaceNumber,
  serializeRaceData,
  upsertRaceDataRecord
} = require("../race-page.js");

assert.strictEqual(RACE_DATA_FILE_NAME, "race-data.json");
assert.strictEqual(normalizeRaceNumber(0), 1);
assert.strictEqual(normalizeRaceNumber(13), 12);
assert.strictEqual(normalizeRaceNumber(7), 7);

const record = buildRaceDataRecord({
  courseKey: "tokyo",
  raceNumber: 11,
  values: {
    prediction: "東京R11 事前予想",
    result: "東京R11 結果",
    review: "東京R11 検証",
    update: "東京R11 アップデート"
  },
  now: new Date("2026-06-14T09:00:00.000Z")
});

assert.deepStrictEqual(record, {
  course: "tokyo",
  race: "R11",
  prediction: "東京R11 事前予想",
  result: "東京R11 結果",
  review: "東京R11 検証",
  update: "東京R11 アップデート",
  updatedAt: "2026-06-14T09:00:00.000Z"
});

let data = createEmptyRaceData();
data = upsertRaceDataRecord(data, record);
assert.strictEqual(data.version, "1.4");
assert.strictEqual(data.releaseStatus, "Official Release v1.4");
assert.strictEqual(data.races.length, 1);

const updated = buildRaceDataRecord({
  courseKey: "tokyo",
  raceNumber: 11,
  values: {
    prediction: "更新済み予想",
    result: "東京R11 結果",
    review: "東京R11 検証",
    update: "東京R11 アップデート"
  },
  now: new Date("2026-06-14T10:00:00.000Z")
});

data = upsertRaceDataRecord(data, updated);
assert.strictEqual(data.races.length, 1);
assert.strictEqual(data.races[0].prediction, "更新済み予想");
assert.ok(serializeRaceData(data).includes('"prediction": "更新済み予想"'));

console.log("raceDataStorage tests passed");
