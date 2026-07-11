const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-2-prediction-evaluation-core.js");
const raceInputEngine = require("../phase22-1-race-input-core-foundation.js");
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

function createRaceInput() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T00:00:00.000Z",
    race: {
      raceDate: "2026-07-12",
      racecourse: "東京",
      raceNumber: "11R",
      raceName: "Phase22予想評価S",
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
}

function buildPayload(raceInput, overrides = {}) {
  const raceSummary = engine.buildRaceSummary(raceInput.race);
  return {
    sourceRaceKey: engine.buildSourceRaceKey(raceSummary),
    raceSummary,
    evaluations: [
      { ...raceInput.horses[0], aiScore: "91.5", mark: "◎", reason: "末脚安定", paceComment: "平均なら軸", dangerousPopular: false, longshot: false, keyCandidate: true, opponentCandidate: false },
      { ...raceInput.horses[1], aiScore: "84", mark: "○", reason: "相手筆頭", paceComment: "先行残り", dangerousPopular: false, longshot: false, keyCandidate: false, opponentCandidate: true },
      { ...raceInput.horses[2], aiScore: "", mark: "無印", reason: "", paceComment: "", dangerousPopular: false, longshot: true, keyCandidate: false, opponentCandidate: true }
    ],
    ...overrides
  };
}

assert.strictEqual(engine.SCHEMA_VERSION, 1);
assert.strictEqual(engine.RACE_INPUT_STORAGE_KEY, "hashimotoKeibaAi.phase22.raceInput.v1");
assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.predictionEvaluation.v1");
assert.ok(engine.MARK_OPTIONS.includes("◎"));
assert.ok(engine.MARK_OPTIONS.includes("無印"));

const rawRaceInput = createRaceInput();
const storage = createStorage();
storage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(rawRaceInput));
const raceInput = engine.loadRaceInput(storage);
assert.strictEqual(raceInput.race.raceName, "Phase22予想評価S", "Phase22-1保存データを読み込める");
assert.strictEqual(raceInput.horses.length, 3, "Phase22-1出走馬を読み込める");
assert.strictEqual(engine.buildSourceRaceKey(raceInput.race), "2026-07-12|東京|11R", "レース識別キーを生成する");

const initialEvaluations = engine.buildInitialEvaluations(raceInput);
assert.strictEqual(initialEvaluations.length, 3, "出走馬ごとの評価行を作る");
assert.strictEqual(initialEvaluations[0].mark, "無印");
assert.strictEqual(initialEvaluations[0].aiScore, "");

const validPayload = buildPayload(raceInput);
const valid = engine.validateEvaluationPayload(validPayload, raceInput);
assert.strictEqual(valid.valid, true, "有効な予想評価を受け付ける");
assert.strictEqual(valid.data.schemaVersion, 1);
assert.strictEqual(valid.data.evaluations[0].aiScore, "91.5", "AI評価点の小数を保持する");

const saved = engine.saveEvaluation(validPayload, raceInput, storage);
assert.strictEqual(saved.saved, true, "予想評価を保存できる");
const storedPrediction = JSON.parse(storage.getItem(engine.STORAGE_KEY));
assert.strictEqual(storedPrediction.sourceRaceKey, "2026-07-12|東京|11R");
assert.strictEqual(storedPrediction.evaluations[1].mark, "○");
assert.ok(storage.getItem(raceInputEngine.STORAGE_KEY), "Phase22-1保存キーは保持する");

const loaded = engine.loadSavedEvaluation(storage);
assert.strictEqual(loaded.raceSummary.racecourse, "東京", "保存済み予想評価を復元できる");
assert.strictEqual(loaded.evaluations[0].reason, "末脚安定");

const merged = engine.mergeSavedEvaluations(raceInput, loaded.evaluations);
assert.strictEqual(merged[0].mark, "◎", "同じレースなら保存評価を評価行へ反映する");
assert.strictEqual(merged[0].keyCandidate, true);

const duplicateFavorite = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, mark: index < 2 ? "◎" : evaluation.mark }))
}), raceInput);
assert.strictEqual(duplicateFavorite.valid, false, "◎重複を拒否する");
assert.ok(duplicateFavorite.errors.some((error) => error.includes("◎は1頭まで")));

const duplicateSecond = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, mark: index < 2 ? "○" : evaluation.mark }))
}), raceInput);
assert.strictEqual(duplicateSecond.valid, false, "○重複を拒否する");

const duplicateThird = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, mark: index < 2 ? "▲" : evaluation.mark }))
}), raceInput);
assert.strictEqual(duplicateThird.valid, false, "▲重複を拒否する");

const badScore = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, aiScore: index === 0 ? "101" : evaluation.aiScore }))
}), raceInput);
assert.strictEqual(badScore.valid, false, "100超のAI評価点を拒否する");

const nonNumericScore = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, aiScore: index === 0 ? "abc" : evaluation.aiScore }))
}), raceInput);
assert.strictEqual(nonNumericScore.valid, false, "数値以外のAI評価点を拒否する");

const duplicateHorseNumber = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, horseNumber: index === 1 ? "1" : evaluation.horseNumber }))
}), raceInput);
assert.strictEqual(duplicateHorseNumber.valid, false, "同じ馬番の重複評価を拒否する");

const missingHorse = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.slice(0, 2)
}), raceInput);
assert.strictEqual(missingHorse.valid, false, "保存対象の馬数不一致を拒否する");

const unknownHorse = engine.validateEvaluationPayload(buildPayload(raceInput, {
  evaluations: validPayload.evaluations.map((evaluation, index) => ({ ...evaluation, horseNumber: index === 2 ? "9" : evaluation.horseNumber }))
}), raceInput);
assert.strictEqual(unknownHorse.valid, false, "Phase22-1にない馬番を拒否する");

assert.deepStrictEqual(engine.sortEvaluations(validPayload.evaluations, "horseNumber").map((item) => item.horseNumber), ["1", "2", "3"], "馬番順で並び替える");
assert.deepStrictEqual(engine.sortEvaluations(validPayload.evaluations, "aiScore").map((item) => item.horseNumber), ["1", "2", "3"], "AI評価点順で並び替える");
assert.deepStrictEqual(engine.sortEvaluations(validPayload.evaluations, "popularity").map((item) => item.horseNumber), ["1", "2", "3"], "人気順で並び替える");
assert.deepStrictEqual(engine.sortEvaluations(validPayload.evaluations, "odds").map((item) => item.horseNumber), ["1", "2", "3"], "オッズ順で並び替える");
assert.deepStrictEqual(engine.sortEvaluations(validPayload.evaluations, "mark").map((item) => item.horseNumber), ["1", "2", "3"], "印順で並び替える");

const changedRaceInput = engine.normalizeRaceInput({
  ...rawRaceInput,
  race: { ...rawRaceInput.race, raceNumber: "12R" }
});
assert.notStrictEqual(loaded.sourceRaceKey, engine.buildSourceRaceKey(changedRaceInput.race), "レース情報変更時はsourceRaceKeyが不一致になる");

const deleteBlocked = engine.deleteSavedEvaluation(storage, () => false);
assert.deepStrictEqual(deleteBlocked, { deleted: false, reason: "confirmation_required" }, "削除は確認なしでは拒否する");
assert.ok(storage.getItem(engine.STORAGE_KEY), "確認なし削除では予想評価を残す");
const deleteDone = engine.deleteSavedEvaluation(storage, () => true);
assert.deepStrictEqual(deleteDone, { deleted: true }, "確認後に予想評価を削除できる");
assert.strictEqual(storage.getItem(engine.STORAGE_KEY), null);
assert.ok(storage.getItem(engine.RACE_INPUT_STORAGE_KEY), "予想評価削除後もPhase22-1データは削除しない");

const quotaStorage = createStorage();
quotaStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(rawRaceInput));
quotaStorage.setItem = (key) => {
  if (key === engine.STORAGE_KEY) {
    const error = new Error("quota");
    error.name = "QuotaExceededError";
    throw error;
  }
};
const quotaResult = engine.saveEvaluation(validPayload, raceInput, quotaStorage);
assert.strictEqual(quotaResult.saved, false, "容量超過時は保存失敗を返す");
assert.strictEqual(quotaResult.quotaExceeded, true, "QuotaExceededErrorを識別する");
assert.ok(quotaResult.errors[0].includes("localStorageの容量"));

function createPanelDocument() {
  const listeners = {};
  const message = { textContent: "", dataset: {} };
  const summary = { children: [], textContent: "", appendChild(child) { this.children.push(child); } };
  const list = { children: [], textContent: "", appendChild(child) { this.children.push(child); } };
  const sort = { value: "horseNumber", addEventListener(event, handler) { listeners.sort = handler; } };
  const buttons = {
    "#phase22-load-race-for-prediction": { addEventListener(event, handler) { listeners.load = handler; } },
    "#phase22-save-prediction-evaluation": { addEventListener(event, handler) { listeners.save = handler; } },
    "#phase22-restore-prediction-evaluation": { addEventListener(event, handler) { listeners.restore = handler; } },
    "#phase22-delete-prediction-evaluation": { addEventListener(event, handler) { listeners.delete = handler; } }
  };
  const document = {
    readyState: "complete",
    querySelector(selector) {
      if (selector === "#phase22-prediction-evaluation-core") return {};
      if (selector === "#phase22-prediction-message") return message;
      if (selector === "#phase22-prediction-race-summary") return summary;
      if (selector === "#phase22-prediction-evaluation-list") return list;
      if (selector === "#phase22-prediction-sort") return sort;
      return buttons[selector] || null;
    },
    querySelectorAll() {
      return [];
    },
    createElement(tag) {
      return {
        tag,
        className: "",
        textContent: "",
        dataset: {},
        children: [],
        value: "",
        checked: false,
        appendChild(child) {
          this.children.push(child);
        },
        addEventListener() {}
      };
    },
    addEventListener() {}
  };
  return { document, message, summary, list, listeners };
}

const noRacePanel = createPanelDocument();
assert.doesNotThrow(() => engine.bindPredictionEvaluationPanel({ document: noRacePanel.document, storage: createStorage() }), "Phase22-1未保存でも初期化できる");
assert.ok(noRacePanel.message.textContent.includes("先にPhase22-1 レース情報入力で保存してください"));

const panelStorage = createStorage();
panelStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(rawRaceInput));
const panel = createPanelDocument();
const binding = engine.bindPredictionEvaluationPanel({ document: panel.document, storage: panelStorage, confirmDelete: () => true });
assert.strictEqual(typeof binding.loadRace, "function", "file://相当のDOMで初期化する");
assert.strictEqual(panel.summary.children.length, 8, "レース情報を表示する");
assert.strictEqual(panel.list.children.length, 3, "出走馬一覧を表示する");

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-prediction-evaluation-core"'), "Phase22-2パネルがある");
assert.ok(index.includes('<script src="phase22-2-prediction-evaluation-core.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase22-prediction-evaluation-core"'));
assert.ok(readme.includes(engine.STORAGE_KEY));
assert.ok(readme.includes("sourceRaceKey"));
assert.ok(readme.includes("External API is not used"));

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

const sandboxPanel = createPanelDocument();
const sandbox = {
  window: {
    document: sandboxPanel.document,
    localStorage: createStorage(),
    confirm: () => true
  },
  document: sandboxPanel.document,
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
assert.doesNotThrow(() => {
  vm.runInContext(readText("phase22-2-prediction-evaluation-core.js"), sandbox, { filename: "phase22-2-prediction-evaluation-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-2 prediction evaluation core test passed");
