const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-1-race-input-core-foundation.js");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

function createStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    }
  };
}

const validInput = {
  race: {
    raceDate: "2026-07-12",
    racecourse: "東京",
    raceNumber: "11R",
    raceName: "Phase22テストS",
    surface: "芝",
    distance: "1600m",
    trackCondition: "良",
    fieldSize: 3
  },
  horses: [
    { horseNumber: "1", horseName: "テストホースA", jockey: "騎手A", odds: "2.4", popularity: "1" },
    { horseNumber: "2", horseName: "テストホースB", jockey: "騎手B", odds: "5.8", popularity: "2" },
    { horseNumber: "3", horseName: "テストホースC", jockey: "騎手C", odds: "12.1", popularity: "3" }
  ]
};

assert.strictEqual(engine.SCHEMA_VERSION, 1);
assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.raceInput.v1");
assert.strictEqual(engine.buildHorseRows(5).length, 5, "頭数に応じた入力行を生成できる");
assert.strictEqual(engine.buildHorseRows(0).length, 0, "無効な頭数は生成しない");
assert.strictEqual(engine.buildHorseRows(19).length, 0, "最大頭数超過は生成しない");

const validation = engine.validateRaceInput(validInput);
assert.strictEqual(validation.valid, true, "有効なレース情報を受け付ける");
assert.strictEqual(validation.data.schemaVersion, 1);
assert.strictEqual(validation.data.safety.privateLocalOnly, true);
assert.strictEqual(validation.data.safety.githubPages, false);
assert.strictEqual(validation.data.safety.publicUrl, false);
assert.strictEqual(validation.data.safety.externalApi, false);
assert.strictEqual(validation.data.safety.ipatConnection, false);
assert.strictEqual(validation.data.safety.autoBetting, false);

const storage = createStorage();
const saved = engine.saveRaceInput(validInput, storage);
assert.strictEqual(saved.saved, true, "レース情報を保存できる");
const storedPayload = JSON.parse(storage.getItem(engine.STORAGE_KEY));
assert.strictEqual(storedPayload.race.raceName, "Phase22テストS");
assert.strictEqual(storedPayload.horses.length, 3, "出走馬情報を保存できる");
assert.strictEqual(storedPayload.horses[1].jockey, "騎手B");

const restored = engine.loadRaceInput(storage);
assert.strictEqual(restored.race.racecourse, "東京", "ページ再読込後の復元相当でレース情報を読める");
assert.strictEqual(restored.horses[2].horseName, "テストホースC", "ページ再読込後の復元相当で出走馬情報を読める");

const deleteBlocked = engine.deleteRaceInput(storage, () => false);
assert.deepStrictEqual(deleteBlocked, { deleted: false, reason: "confirmation_required" }, "削除は確認なしでは拒否する");
assert.ok(storage.getItem(engine.STORAGE_KEY), "確認なし削除では保存データを残す");
const deleteDone = engine.deleteRaceInput(storage, () => true);
assert.deepStrictEqual(deleteDone, { deleted: true }, "確認後に削除できる");
assert.strictEqual(storage.getItem(engine.STORAGE_KEY), null);

const emptyRejected = engine.validateRaceInput({ race: { fieldSize: 1 }, horses: [{}] });
assert.strictEqual(emptyRejected.valid, false, "空欄を拒否する");
assert.ok(emptyRejected.errors.some((error) => error.includes("開催日")));
assert.ok(emptyRejected.errors.some((error) => error.includes("馬名")));

const duplicateRejected = engine.validateRaceInput({
  ...validInput,
  horses: validInput.horses.map((horse) => ({ ...horse, horseNumber: "1" }))
});
assert.strictEqual(duplicateRejected.valid, false, "重複馬番を拒否する");
assert.ok(duplicateRejected.errors.some((error) => error.includes("重複")));

const fieldSizeRejected = engine.validateRaceInput({ ...validInput, race: { ...validInput.race, fieldSize: 2 } });
assert.strictEqual(fieldSizeRejected.valid, false, "頭数と出走馬行数の不一致を拒否する");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-race-input-core"'), "初期画面パネルがある");
assert.ok(index.includes('data-phase22-race="raceDate"'));
assert.ok(index.includes('data-phase22-race="fieldSize"'));
assert.ok(index.includes('id="phase22-horse-input-list"'));
assert.ok(index.includes('<script src="phase22-1-race-input-core-foundation.js"></script>'));
assert.ok(privateLocal.includes("Phase22 本体機能"));
assert.ok(privateLocal.includes('href="index.html#phase22-race-input-core"'));
assert.ok(readme.includes(engine.STORAGE_KEY));
assert.ok(readme.includes("schemaVersion"));
assert.ok(readme.includes("External API is not used"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

const changedText = changedFiles
  .filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file))
  .map((file) => readText(file))
  .join("\n");
assert.strictEqual(/githubPages\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/publicUrl\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/externalApi\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/ipatConnection\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoBetting\s*:\s*true/i.test(changedText), false);
assert.strictEqual(/autoExecution\s*:\s*true/i.test(changedText), false);

console.log("Phase22-1 race input core foundation test passed");
