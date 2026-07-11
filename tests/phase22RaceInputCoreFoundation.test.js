const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-1-race-input-core-foundation.js");
const cleanupEngine = require("../phase22-local-storage-cleanup.js");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

function createStorage() {
  const data = new Map();
  return {
    get length() {
      return data.size;
    },
    key(index) {
      return Array.from(data.keys())[index] || null;
    },
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
assert.strictEqual(engine.formatBytes(2048), cleanupEngine.formatBytes(2048), "Phase22-1 uses shared cleanup formatter");
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

const quotaStorage = {
  getItem() { return null; },
  setItem() {
    const error = new Error("quota");
    error.name = "QuotaExceededError";
    throw error;
  },
  removeItem() {}
};
const quotaResult = engine.saveRaceInput(validInput, quotaStorage);
assert.strictEqual(quotaResult.saved, false, "容量超過時は保存失敗を返す");
assert.strictEqual(quotaResult.quotaExceeded, true, "QuotaExceededErrorを識別する");
assert.ok(quotaResult.errors[0].includes("localStorageの容量"));

assert.strictEqual(engine.isPhase21CleanupKey("phase21-12-private-local-checklist"), true, "Phase21 checklist key is cleanup target");
assert.strictEqual(engine.isPhase21CleanupKey("phase21LatestOperationSummary"), true, "Phase21 latest summary key is cleanup target");
assert.strictEqual(engine.isPhase21CleanupKey(engine.STORAGE_KEY), false, "Phase22 save key is never cleanup target");
assert.strictEqual(engine.isPhase21CleanupKey("raceDatabase"), false, "non Phase21 key is not cleanup target");

const cleanupStorage = createStorage();
cleanupStorage.setItem("phase21-12-private-local-checklist", "x".repeat(2000));
cleanupStorage.setItem("phase21LatestOperationSummary", "x".repeat(2000));
cleanupStorage.setItem("phase20-final-checklist", "x".repeat(2000));
cleanupStorage.setItem(engine.STORAGE_KEY, JSON.stringify({ schemaVersion: 1, race: validInput.race, horses: validInput.horses }));
const cleanupSummary = engine.summarizePhase21Cleanup(cleanupStorage);
assert.strictEqual(cleanupSummary.count, 2, "Phase21 cleanup targets only matching Phase21 keys");
assert.ok(cleanupSummary.bytes > 0, "cleanup summary estimates size");
const cleanupBlocked = engine.cleanupPhase21LocalData(cleanupStorage, () => false);
assert.strictEqual(cleanupBlocked.deleted, false, "cleanup requires confirmation");
assert.ok(cleanupStorage.getItem("phase21-12-private-local-checklist"), "confirmation cancel keeps target");
const cleanupDone = engine.cleanupPhase21LocalData(cleanupStorage, () => true);
assert.strictEqual(cleanupDone.deleted, true, "cleanup runs after confirmation");
assert.strictEqual(cleanupDone.removedCount, 2);
assert.strictEqual(cleanupStorage.getItem("phase21-12-private-local-checklist"), null);
assert.strictEqual(cleanupStorage.getItem("phase21LatestOperationSummary"), null);
assert.ok(cleanupStorage.getItem("phase20-final-checklist"), "Phase20 key is not removed");
assert.ok(cleanupStorage.getItem(engine.STORAGE_KEY), "Phase22 save key is not removed");

const limitedStorage = createStorage();
limitedStorage.setItem("phase21-13-operation-checklist", "x".repeat(2000));
limitedStorage.setItem("phase21GeneratedPanelLatest", "x".repeat(2000));
limitedStorage.setItem("otherLargeData", "x".repeat(2000));
const originalSetItem = limitedStorage.setItem.bind(limitedStorage);
limitedStorage.setItem = (key, value) => {
  const phase21StillExists = engine.summarizePhase21Cleanup(limitedStorage).count > 0;
  if (key === engine.STORAGE_KEY && phase21StillExists) {
    const error = new Error("quota");
    error.name = "QuotaExceededError";
    throw error;
  }
  originalSetItem(key, value);
};
assert.strictEqual(engine.saveRaceInput(validInput, limitedStorage).quotaExceeded, true, "Phase21 data can block save before cleanup");
engine.cleanupPhase21LocalData(limitedStorage, () => true);
assert.strictEqual(engine.saveRaceInput(validInput, limitedStorage).saved, true, "Phase21 cleanup allows Phase22 save");

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
assert.ok(index.includes('id="phase22-cleanup-phase21-storage"'));
assert.ok(index.includes('id="phase22-phase21-cleanup-summary"'));
assert.ok(index.includes('<script src="phase22-local-storage-cleanup.js"></script>'));
assert.ok(index.includes('<script src="phase22-1-race-input-core-foundation.js"></script>'));
assert.ok(privateLocal.includes("Phase22 本体機能"));
assert.ok(privateLocal.includes('href="index.html#phase22-race-input-core"'));
assert.ok(readme.includes(engine.STORAGE_KEY));
assert.ok(readme.includes("schemaVersion"));
assert.ok(readme.includes("Cleanup target keys"));
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

function createBrowserLikeDocument() {
  const listeners = {};
  const list = {
    children: [],
    textContent: "",
    appendChild(row) {
      this.children.push(row);
    }
  };
  const message = { textContent: "", dataset: {} };
  const cleanupSummary = { textContent: "", dataset: {} };
  const fieldSize = { value: "3" };
  const panel = {};
  const buttons = {
    "#phase22-generate-horses": { addEventListener(event, handler) { listeners.generate = handler; } },
    "#phase22-save-race-input": { addEventListener() {} },
    "#phase22-restore-race-input": { addEventListener() {} },
    "#phase22-delete-race-input": { addEventListener() {} },
    "#phase22-cleanup-phase21-storage": { addEventListener(event, handler) { listeners.cleanup = handler; } }
  };
  const document = {
    readyState: "complete",
    querySelector(selector) {
      if (selector === "#phase22-race-input-core") return panel;
      if (selector === '[data-phase22-race="fieldSize"]') return fieldSize;
      if (selector === "#phase22-horse-input-list") return list;
      if (selector === "#phase22-race-input-message") return message;
      if (selector === "#phase22-phase21-cleanup-summary") return cleanupSummary;
      return buttons[selector] || null;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      const inputs = new Map();
      return {
        className: "",
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        set innerHTML(markup) {
          ["horseNumber", "horseName", "jockey", "odds", "popularity"].forEach((field) => {
            if (markup.includes(`data-phase22-horse="${field}"`)) inputs.set(field, { value: "" });
          });
        },
        querySelector(selector) {
          const match = selector.match(/data-phase22-horse="([^"]+)"/);
          return match ? inputs.get(match[1]) || null : null;
        }
      };
    }
  };
  return { document, list, message, cleanupSummary, listeners };
}

const browser = createBrowserLikeDocument();
const sandbox = {
  window: {
    document: browser.document,
    localStorage: createStorage(),
    confirm: () => true
  },
  document: browser.document,
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
assert.doesNotThrow(() => {
  vm.runInContext(readText("phase22-local-storage-cleanup.js"), sandbox, { filename: "phase22-local-storage-cleanup.js" });
  vm.runInContext(readText("phase22-1-race-input-core-foundation.js"), sandbox, { filename: "phase22-1-race-input-core-foundation.js" });
}, "browser実行時にroot未定義を起こさない");
assert.strictEqual(typeof browser.listeners.generate, "function", "生成ボタンのイベントを登録する");
assert.strictEqual(typeof browser.listeners.cleanup, "function", "Phase21整理ボタンのイベントを登録する");
browser.list.children = [];
browser.listeners.generate();
assert.strictEqual(browser.list.children.length, 3, "実機操作相当で頭数3から3行生成する");
assert.ok(browser.message.textContent.includes("3"), "生成後のステータスを更新する");
assert.ok(browser.cleanupSummary.textContent.includes("削除対象候補"), "cleanup summary is rendered");

console.log("Phase22-1 race input core foundation test passed");
