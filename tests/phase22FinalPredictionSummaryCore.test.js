const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const engine = require("../phase22-3-final-prediction-summary-core.js");
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
    race: {
      raceDate: "2026-07-12",
      racecourse: "東京",
      raceNumber: "11R",
      raceName: "Phase22最終予想S",
      surface: "芝",
      distance: "1600m",
      trackCondition: "良",
      fieldSize: 4
    },
    horses: [
      { horseNumber: "1", horseName: "テストホースA", jockey: "騎手A", odds: "2.4", popularity: "1" },
      { horseNumber: "2", horseName: "テストホースB", jockey: "騎手B", odds: "5.8", popularity: "2" },
      { horseNumber: "3", horseName: "テストホースC", jockey: "騎手C", odds: "12.1", popularity: "3" },
      { horseNumber: "4", horseName: "テストホースD", jockey: "騎手D", odds: "38.8", popularity: "9" }
    ]
  };
}

function createPredictionEvaluation(raceInput) {
  const sourceRaceKey = engine.buildSourceRaceKey(raceInput.race);
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T01:00:00.000Z",
    sourceRaceKey,
    raceSummary: raceInput.race,
    evaluations: [
      { ...raceInput.horses[0], aiScore: "91.5", mark: "◎", reason: "安定", paceComment: "平均", dangerousPopular: false, longshot: false, keyCandidate: true, opponentCandidate: false },
      { ...raceInput.horses[1], aiScore: "91.5", mark: "○", reason: "同点", paceComment: "先行", dangerousPopular: true, longshot: false, keyCandidate: false, opponentCandidate: true },
      { ...raceInput.horses[2], aiScore: "78", mark: "△", reason: "押さえ", paceComment: "差し", dangerousPopular: false, longshot: false, keyCandidate: false, opponentCandidate: false },
      { ...raceInput.horses[3], aiScore: "84", mark: "☆", reason: "穴", paceComment: "展開待ち", dangerousPopular: false, longshot: true, keyCandidate: false, opponentCandidate: true }
    ]
  };
}

assert.strictEqual(engine.SCHEMA_VERSION, 1);
assert.strictEqual(engine.RACE_INPUT_STORAGE_KEY, "hashimotoKeibaAi.phase22.raceInput.v1");
assert.strictEqual(engine.PREDICTION_EVALUATION_STORAGE_KEY, "hashimotoKeibaAi.phase22.predictionEvaluation.v1");
assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.finalPredictionSummary.v1");
assert.ok(engine.PROTECTED_CLEANUP_KEYS.includes(engine.STORAGE_KEY));

const raceInput = createRaceInput();
const predictionEvaluation = createPredictionEvaluation(raceInput);
const storage = createStorage();
storage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(raceInput));
storage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, JSON.stringify(predictionEvaluation));

const loadedRace = engine.loadRaceInput(storage);
const loadedEvaluation = engine.loadPredictionEvaluation(storage);
assert.strictEqual(loadedRace.race.raceName, "Phase22最終予想S", "Phase22-1 race data loads");
assert.strictEqual(loadedEvaluation.evaluations.length, 4, "Phase22-2 evaluation data loads");

const aggregate = engine.buildAggregate(loadedRace, loadedEvaluation);
assert.strictEqual(aggregate.raceKeyMatches, true, "Phase22-1 and Phase22-2 source race keys match");
assert.deepStrictEqual(aggregate.ranking.map((horse) => horse.horseNumber), ["1", "2", "4", "3"], "AI評価点順は同点時も馬番順で安定する");
assert.strictEqual(aggregate.markSummary.find((entry) => entry.mark === "▲").horses.length, 0, "未設定印は空配列で表す");
assert.strictEqual(aggregate.markSummary.find((entry) => entry.mark === "◎").horses[0].horseName, "テストホースA");
assert.deepStrictEqual(aggregate.candidateSummary.keyCandidates.map((horse) => horse.horseNumber), ["1"], "軸候補を集約する");
assert.deepStrictEqual(aggregate.candidateSummary.opponentCandidates.map((horse) => horse.horseNumber), ["2", "4"], "相手候補を集約する");
assert.deepStrictEqual(aggregate.candidateSummary.holdCandidates.map((horse) => horse.horseNumber), ["3"], "押さえ候補を集約する");
assert.deepStrictEqual(aggregate.riskSummary.dangerousPopular.map((horse) => horse.horseNumber), ["2"], "危険人気馬を集約する");
assert.deepStrictEqual(aggregate.riskSummary.longshots.map((horse) => horse.horseNumber), ["4"], "穴馬を集約する");
assert.deepStrictEqual(aggregate.riskSummary.divineLongshots.map((horse) => horse.horseNumber), ["4"], "神穴候補を集約する");

const saved = engine.saveFinalSummary({
  sourceRaceKey: aggregate.sourceRaceKey,
  memos: {
    finalView: "本命中心",
    paceMemo: "平均ペース",
    bettingMemo: "馬連中心",
    cautionMemo: "過信しない"
  }
}, storage);
assert.strictEqual(saved.saved, true, "Phase22-3 final memo saves");
const restored = engine.loadFinalSummary(storage);
assert.strictEqual(restored.memos.finalView, "本命中心", "Phase22-3 final memo restores");

const deleteBlocked = engine.deleteFinalSummary(storage, () => false);
assert.deepStrictEqual(deleteBlocked, { deleted: false, reason: "confirmation_required" }, "Phase22-3 reset requires confirmation");
assert.ok(storage.getItem(engine.STORAGE_KEY), "cancelled reset keeps Phase22-3 data");
const deleteDone = engine.deleteFinalSummary(storage, () => true);
assert.deepStrictEqual(deleteDone, { deleted: true }, "Phase22-3 reset deletes only final memo");
assert.strictEqual(storage.getItem(engine.STORAGE_KEY), null);
assert.ok(storage.getItem(engine.RACE_INPUT_STORAGE_KEY), "Phase22-1 data remains after Phase22-3 reset");
assert.ok(storage.getItem(engine.PREDICTION_EVALUATION_STORAGE_KEY), "Phase22-2 data remains after Phase22-3 reset");

const brokenStorage = createStorage();
brokenStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, "{broken");
brokenStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, "{broken");
assert.strictEqual(engine.loadRaceInput(brokenStorage), null, "broken Phase22-1 JSON is safe");
assert.strictEqual(engine.loadPredictionEvaluation(brokenStorage), null, "broken Phase22-2 JSON is safe");
assert.doesNotThrow(() => engine.buildAggregate(engine.loadRaceInput(brokenStorage), engine.loadPredictionEvaluation(brokenStorage)), "missing/broken data does not throw");

const quotaStorage = createStorage();
quotaStorage.setItem = (key) => {
  if (key === engine.STORAGE_KEY) {
    const error = new Error("quota");
    error.name = "QuotaExceededError";
    throw error;
  }
};
const quotaResult = engine.saveFinalSummary({ sourceRaceKey: "x", memos: { finalView: "x" } }, quotaStorage);
assert.strictEqual(quotaResult.saved, false, "quota exceeded blocks save gracefully");
assert.strictEqual(quotaResult.quotaExceeded, true);
assert.ok(quotaResult.errors[0].includes("localStorageの容量"));

const cleanupStorage = createStorage();
cleanupStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, "race");
cleanupStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, "evaluation");
cleanupStorage.setItem(engine.STORAGE_KEY, "summary");
cleanupStorage.setItem("phase21-12-private-local-checklist", "x".repeat(1000));
cleanupStorage.setItem("otherPhase22Data", "x".repeat(1000));
assert.strictEqual(engine.summarizePhase21Cleanup(cleanupStorage).count, 1, "Phase22-3 cleanup targets only Phase21 keys");
engine.cleanupPhase21LocalData(cleanupStorage, () => true);
assert.strictEqual(cleanupStorage.getItem("phase21-12-private-local-checklist"), null);
assert.ok(cleanupStorage.getItem(engine.RACE_INPUT_STORAGE_KEY), "cleanup protects Phase22-1");
assert.ok(cleanupStorage.getItem(engine.PREDICTION_EVALUATION_STORAGE_KEY), "cleanup protects Phase22-2");
assert.ok(cleanupStorage.getItem(engine.STORAGE_KEY), "cleanup protects Phase22-3");
assert.ok(cleanupStorage.getItem("otherPhase22Data"), "cleanup does not delete non Phase21 data");

function createPanelDocument() {
  const listeners = {};
  const elements = new Map();
  const ids = [
    "phase22-final-prediction-summary-core",
    "phase22-final-race-summary",
    "phase22-final-ranking",
    "phase22-final-mark-summary",
    "phase22-final-key-candidates",
    "phase22-final-opponent-candidates",
    "phase22-final-hold-candidates",
    "phase22-final-dangerous-popular",
    "phase22-final-longshots",
    "phase22-final-divine-longshots",
    "phase22-final-summary-message",
    "phase22-final-phase21-cleanup-summary"
  ];
  const makeNode = () => ({
    textContent: "",
    value: "",
    dataset: {},
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
    addEventListener() {}
  });
  ids.forEach((id) => elements.set(`#${id}`, makeNode()));
  ["finalView", "paceMemo", "bettingMemo", "cautionMemo"].forEach((field) => elements.set(`[data-phase22-final-memo="${field}"]`, makeNode()));
  const buttons = {
    "#phase22-refresh-final-summary": "refresh",
    "#phase22-save-final-summary": "save",
    "#phase22-restore-final-summary": "restore",
    "#phase22-reset-final-summary": "reset",
    "#phase22-cleanup-phase21-storage-for-final-summary": "cleanup"
  };
  Object.entries(buttons).forEach(([selector, name]) => {
    elements.set(selector, { addEventListener(event, handler) { listeners[name] = handler; } });
  });
  const document = {
    readyState: "complete",
    querySelector(selector) {
      return elements.get(selector) || null;
    },
    createElement() {
      return makeNode();
    },
    addEventListener() {}
  };
  return { document, elements, listeners };
}

const panelStorage = createStorage();
panelStorage.setItem(engine.RACE_INPUT_STORAGE_KEY, JSON.stringify(raceInput));
panelStorage.setItem(engine.PREDICTION_EVALUATION_STORAGE_KEY, JSON.stringify(predictionEvaluation));
const panel = createPanelDocument();
const binding = engine.bindFinalPredictionSummaryPanel({ document: panel.document, storage: panelStorage, confirmReset: () => true, confirmCleanup: () => true });
assert.strictEqual(typeof binding.refresh, "function", "file://相当DOMで初期化する");
assert.strictEqual(panel.elements.get("#phase22-final-ranking").children.length, 4, "ranking renders");
assert.strictEqual(panel.elements.get("#phase22-final-mark-summary").children.length, 6, "final marks render");
assert.ok(panel.elements.get("#phase22-final-summary-message").textContent.includes("集約"));

const emptyPanel = createPanelDocument();
assert.doesNotThrow(() => engine.bindFinalPredictionSummaryPanel({ document: emptyPanel.document, storage: createStorage() }), "data未登録状態でも初期化できる");
assert.ok(emptyPanel.elements.get("#phase22-final-summary-message").textContent.includes("Phase22-2"));

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-final-prediction-summary-core"'), "Phase22-3 panel exists");
assert.ok(index.includes('<script src="phase22-3-final-prediction-summary-core.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase22-final-prediction-summary-core"'));
assert.ok(readme.includes(engine.STORAGE_KEY));
assert.ok(readme.includes("Phase22-3 Final Prediction Summary Core"));

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
  vm.runInContext(readText("phase22-local-storage-cleanup.js"), sandbox, { filename: "phase22-local-storage-cleanup.js" });
  vm.runInContext(readText("phase22-3-final-prediction-summary-core.js"), sandbox, { filename: "phase22-3-final-prediction-summary-core.js" });
}, "browser実行時にfile://相当で初期化しても例外を出さない");

console.log("Phase22-3 final prediction summary core test passed");
