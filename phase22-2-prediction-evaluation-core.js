(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase222PredictionEvaluationCore = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.predictionEvaluation.v1";
  const PROTECTED_CLEANUP_KEYS = [RACE_INPUT_STORAGE_KEY, STORAGE_KEY];
  const MARK_OPTIONS = ["◎", "○", "▲", "△", "☆", "注", "消", "無印"];
  const MARK_LABELS = {
    "◎": "◎ 本命",
    "○": "○ 対抗",
    "▲": "▲ 単穴",
    "△": "△ 連下",
    "☆": "☆ 穴",
    "注": "注 注意",
    "消": "消 消し",
    "無印": "無印"
  };
  const MARK_SORT_ORDER = { "◎": 1, "○": 2, "▲": 3, "△": 4, "☆": 5, "注": 6, "消": 7, "無印": 8 };
  const cleanupApi = (() => {
    if (root && root.HashimotoPhase22LocalStorageCleanup) return root.HashimotoPhase22LocalStorageCleanup;
    if (typeof module === "object" && module.exports) return require("./phase22-local-storage-cleanup.js");
    return null;
  })();

  function getStorage(storage) {
    return storage || (root && root.localStorage) || null;
  }

  function text(value) {
    return String(value ?? "").trim();
  }

  function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function buildSourceRaceKey(race = {}) {
    return [race.raceDate, race.racecourse, race.raceNumber].map(text).join("|");
  }

  function buildRaceSummary(race = {}) {
    return {
      raceDate: text(race.raceDate),
      racecourse: text(race.racecourse),
      raceNumber: text(race.raceNumber),
      raceName: text(race.raceName),
      surface: text(race.surface),
      distance: text(race.distance),
      trackCondition: text(race.trackCondition),
      fieldSize: Number.parseInt(race.fieldSize, 10) || 0
    };
  }

  function normalizeRaceInput(input) {
    if (!input || input.schemaVersion !== 1 || !input.race || !Array.isArray(input.horses)) return null;
    return {
      race: buildRaceSummary(input.race),
      horses: input.horses.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        jockey: text(horse.jockey),
        odds: text(horse.odds),
        popularity: text(horse.popularity)
      }))
    };
  }

  function loadRaceInput(storage) {
    try {
      const targetStorage = getStorage(storage);
      if (!targetStorage) return null;
      return normalizeRaceInput(JSON.parse(targetStorage.getItem(RACE_INPUT_STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  function buildEmptyEvaluation(horse) {
    return {
      horseNumber: text(horse.horseNumber),
      horseName: text(horse.horseName),
      jockey: text(horse.jockey),
      odds: text(horse.odds),
      popularity: text(horse.popularity),
      aiScore: "",
      mark: "無印",
      reason: "",
      paceComment: "",
      dangerousPopular: false,
      longshot: false,
      keyCandidate: false,
      opponentCandidate: false
    };
  }

  function buildInitialEvaluations(raceInput) {
    return raceInput && Array.isArray(raceInput.horses) ? raceInput.horses.map(buildEmptyEvaluation) : [];
  }

  function mergeSavedEvaluations(raceInput, savedEvaluations = []) {
    const savedByNumber = new Map(savedEvaluations.map((evaluation) => [text(evaluation.horseNumber), evaluation]));
    return buildInitialEvaluations(raceInput).map((base) => {
      const saved = savedByNumber.get(base.horseNumber);
      if (!saved) return base;
      return {
        ...base,
        aiScore: text(saved.aiScore),
        mark: MARK_OPTIONS.includes(saved.mark) ? saved.mark : "無印",
        reason: text(saved.reason),
        paceComment: text(saved.paceComment),
        dangerousPopular: Boolean(saved.dangerousPopular),
        longshot: Boolean(saved.longshot),
        keyCandidate: Boolean(saved.keyCandidate),
        opponentCandidate: Boolean(saved.opponentCandidate)
      };
    });
  }

  function normalizeEvaluationPayload(input = {}) {
    const raceSummary = buildRaceSummary(input.raceSummary || {});
    const evaluations = Array.isArray(input.evaluations) ? input.evaluations : [];
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: input.savedAt || new Date().toISOString(),
      sourceRaceKey: text(input.sourceRaceKey) || buildSourceRaceKey(raceSummary),
      raceSummary,
      evaluations: evaluations.map((evaluation) => ({
        horseNumber: text(evaluation.horseNumber),
        horseName: text(evaluation.horseName),
        jockey: text(evaluation.jockey),
        odds: text(evaluation.odds),
        popularity: text(evaluation.popularity),
        aiScore: text(evaluation.aiScore),
        mark: MARK_OPTIONS.includes(evaluation.mark) ? evaluation.mark : "無印",
        reason: text(evaluation.reason),
        paceComment: text(evaluation.paceComment),
        dangerousPopular: Boolean(evaluation.dangerousPopular),
        longshot: Boolean(evaluation.longshot),
        keyCandidate: Boolean(evaluation.keyCandidate),
        opponentCandidate: Boolean(evaluation.opponentCandidate)
      }))
    };
  }

  function validateEvaluationPayload(input = {}, raceInput) {
    const payload = normalizeEvaluationPayload(input);
    const errors = [];
    const race = raceInput ? raceInput.race : payload.raceSummary;
    const expectedCount = Number(race && race.fieldSize) || (raceInput && raceInput.horses ? raceInput.horses.length : 0);
    const sourceHorseNumbers = raceInput && raceInput.horses ? new Set(raceInput.horses.map((horse) => text(horse.horseNumber))) : null;
    if (expectedCount && payload.evaluations.length !== expectedCount) errors.push("保存対象の馬数がPhase22-1の頭数と一致していません。");
    const seen = new Set();
    const markCounts = { "◎": 0, "○": 0, "▲": 0 };
    payload.evaluations.forEach((evaluation) => {
      if (!evaluation.horseNumber) errors.push("馬番が空の評価があります。");
      if (seen.has(evaluation.horseNumber)) errors.push(`馬番${evaluation.horseNumber}の評価が重複しています。`);
      seen.add(evaluation.horseNumber);
      if (sourceHorseNumbers && !sourceHorseNumbers.has(evaluation.horseNumber)) errors.push(`Phase22-1に存在しない馬番${evaluation.horseNumber}があります。`);
      if (!MARK_OPTIONS.includes(evaluation.mark)) errors.push(`馬番${evaluation.horseNumber}の印が不正です。`);
      if (Object.prototype.hasOwnProperty.call(markCounts, evaluation.mark)) markCounts[evaluation.mark] += 1;
      if (evaluation.aiScore !== "") {
        const score = numberOrNull(evaluation.aiScore);
        if (score === null || score < 0 || score > 100) errors.push(`馬番${evaluation.horseNumber}のAI評価点は0〜100で入力してください。`);
      }
    });
    ["◎", "○", "▲"].forEach((mark) => {
      if (markCounts[mark] > 1) errors.push(`${mark}は1頭までです。`);
    });
    return { valid: errors.length === 0, errors, data: payload };
  }

  function loadSavedEvaluation(storage) {
    try {
      const targetStorage = getStorage(storage);
      if (!targetStorage) return null;
      const parsed = JSON.parse(targetStorage.getItem(STORAGE_KEY) || "null");
      return parsed && parsed.schemaVersion === SCHEMA_VERSION ? normalizeEvaluationPayload(parsed) : null;
    } catch (error) {
      return null;
    }
  }

  function saveEvaluation(input, raceInput, storage) {
    const result = validateEvaluationPayload(input, raceInput);
    if (!result.valid) return result;
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { ...result, valid: false, saved: false, errors: ["localStorageを利用できません。"] };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      return { ...result, saved: true };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return {
        ...result,
        valid: false,
        saved: false,
        quotaExceeded,
        errors: [quotaExceeded ? "localStorageの容量が不足しているため予想評価を保存できませんでした。古い保存データを整理してから再度保存してください。" : "localStorageへの保存に失敗しました。"]
      };
    }
  }

  function deleteSavedEvaluation(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function formatBytes(bytes) {
    return cleanupApi.formatBytes(bytes);
  }

  function isPhase21CleanupKey(key) {
    return cleanupApi.isPhase21CleanupKey(key, PROTECTED_CLEANUP_KEYS);
  }

  function summarizePhase21Cleanup(storage) {
    return cleanupApi.summarizePhase21Cleanup(getStorage(storage), PROTECTED_CLEANUP_KEYS);
  }

  function cleanupPhase21LocalData(storage, confirmCleanup = () => false) {
    return cleanupApi.cleanupPhase21LocalData(getStorage(storage), confirmCleanup, PROTECTED_CLEANUP_KEYS);
  }

  function sortEvaluations(evaluations, mode = "horseNumber") {
    const rows = [...(evaluations || [])];
    const numeric = (value, fallback = Number.POSITIVE_INFINITY) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    };
    const byHorseNumber = (a, b) => numeric(a.horseNumber) - numeric(b.horseNumber);
    if (mode === "aiScore") return rows.sort((a, b) => numeric(b.aiScore, -1) - numeric(a.aiScore, -1) || byHorseNumber(a, b));
    if (mode === "popularity") return rows.sort((a, b) => numeric(a.popularity) - numeric(b.popularity) || byHorseNumber(a, b));
    if (mode === "odds") return rows.sort((a, b) => numeric(a.odds) - numeric(b.odds) || byHorseNumber(a, b));
    if (mode === "mark") return rows.sort((a, b) => (MARK_SORT_ORDER[a.mark] || 99) - (MARK_SORT_ORDER[b.mark] || 99) || byHorseNumber(a, b));
    return rows.sort(byHorseNumber);
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function setMessage(doc, message, kind = "info") {
    const node = doc.querySelector("#phase22-prediction-message");
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function updateCleanupSummary(doc, storage) {
    const node = doc.querySelector("#phase22-prediction-phase21-cleanup-summary");
    if (!node) return null;
    const summary = summarizePhase21Cleanup(storage);
    node.textContent = `削除対象候補: ${summary.count}件 / 概算 ${summary.displaySize}`;
    node.dataset.count = String(summary.count);
    node.dataset.bytes = String(summary.bytes);
    return summary;
  }

  function renderRaceSummary(doc, race) {
    const container = doc.querySelector("#phase22-prediction-race-summary");
    if (!container) return;
    container.textContent = "";
    const items = [
      ["開催日", race.raceDate],
      ["競馬場", race.racecourse],
      ["レース番号", race.raceNumber],
      ["レース名", race.raceName],
      ["芝／ダート", race.surface],
      ["距離", race.distance],
      ["馬場状態", race.trackCondition],
      ["頭数", race.fieldSize]
    ];
    items.forEach(([label, value]) => {
      const item = makeEl(doc, "article", "", "");
      item.appendChild(makeEl(doc, "span", "", label));
      item.appendChild(makeEl(doc, "strong", "", value || "--"));
      container.appendChild(item);
    });
  }

  function createInput(doc, type, value, datasetKey) {
    const input = doc.createElement("input");
    input.type = type;
    input.value = value ?? "";
    input.dataset.phase22Eval = datasetKey;
    if (type === "number") {
      input.min = "0";
      input.max = "100";
      input.step = "0.1";
    }
    return input;
  }

  function createCheckbox(doc, checked, datasetKey) {
    const input = doc.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(checked);
    input.dataset.phase22Eval = datasetKey;
    return input;
  }

  function renderEvaluationRows(doc, evaluations) {
    const list = doc.querySelector("#phase22-prediction-evaluation-list");
    if (!list) return;
    list.textContent = "";
    evaluations.forEach((evaluation) => {
      const row = makeEl(doc, "div", "phase22-evaluation-row", "");
      row.dataset.phase22EvaluationRow = evaluation.horseNumber;
      const horse = makeEl(doc, "div", "phase22-evaluation-horse", "");
      [
        `馬番 ${evaluation.horseNumber}`,
        evaluation.horseName,
        `騎手 ${evaluation.jockey || "--"}`,
        `オッズ ${evaluation.odds || "--"}`,
        `人気 ${evaluation.popularity || "--"}`
      ].forEach((value) => horse.appendChild(makeEl(doc, "span", "", value)));
      row.appendChild(horse);

      const scoreLabel = makeEl(doc, "label", "", "");
      scoreLabel.appendChild(makeEl(doc, "span", "", "AI評価点"));
      scoreLabel.appendChild(createInput(doc, "number", evaluation.aiScore, "aiScore"));
      row.appendChild(scoreLabel);

      const markLabel = makeEl(doc, "label", "", "");
      markLabel.appendChild(makeEl(doc, "span", "", "印"));
      const select = doc.createElement("select");
      select.dataset.phase22Eval = "mark";
      MARK_OPTIONS.forEach((mark) => {
        const option = doc.createElement("option");
        option.value = mark;
        option.textContent = MARK_LABELS[mark];
        if (mark === evaluation.mark) option.selected = true;
        select.appendChild(option);
      });
      markLabel.appendChild(select);
      row.appendChild(markLabel);

      [["評価理由", "reason"], ["展開コメント", "paceComment"]].forEach(([label, key]) => {
        const wrapper = makeEl(doc, "label", "phase22-evaluation-wide", "");
        wrapper.appendChild(makeEl(doc, "span", "", label));
        const textarea = doc.createElement("textarea");
        textarea.value = evaluation[key] || "";
        textarea.dataset.phase22Eval = key;
        wrapper.appendChild(textarea);
        row.appendChild(wrapper);
      });

      const flags = makeEl(doc, "div", "phase22-evaluation-flags", "");
      [
        ["危険人気馬", "dangerousPopular"],
        ["穴馬", "longshot"],
        ["軸候補", "keyCandidate"],
        ["相手候補", "opponentCandidate"]
      ].forEach(([label, key]) => {
        const wrapper = makeEl(doc, "label", "", "");
        wrapper.appendChild(createCheckbox(doc, evaluation[key], key));
        wrapper.appendChild(makeEl(doc, "span", "", label));
        flags.appendChild(wrapper);
      });
      row.appendChild(flags);
      list.appendChild(row);
    });
  }

  function collectEvaluationsFromDocument(doc) {
    return Array.from(doc.querySelectorAll("[data-phase22-evaluation-row]")).map((row) => {
      const read = (key) => {
        const node = row.querySelector(`[data-phase22-eval="${key}"]`);
        if (!node) return "";
        return node.type === "checkbox" ? node.checked : node.value;
      };
      const horse = {
        horseNumber: row.dataset.phase22EvaluationRow,
        horseName: text(row.querySelector(".phase22-evaluation-horse span:nth-child(2)")?.textContent),
        jockey: text(row.querySelector(".phase22-evaluation-horse span:nth-child(3)")?.textContent).replace(/^騎手\s*/, ""),
        odds: text(row.querySelector(".phase22-evaluation-horse span:nth-child(4)")?.textContent).replace(/^オッズ\s*/, ""),
        popularity: text(row.querySelector(".phase22-evaluation-horse span:nth-child(5)")?.textContent).replace(/^人気\s*/, "")
      };
      return {
        ...horse,
        aiScore: read("aiScore"),
        mark: read("mark") || "無印",
        reason: read("reason"),
        paceComment: read("paceComment"),
        dangerousPopular: Boolean(read("dangerousPopular")),
        longshot: Boolean(read("longshot")),
        keyCandidate: Boolean(read("keyCandidate")),
        opponentCandidate: Boolean(read("opponentCandidate"))
      };
    });
  }

  function bindPredictionEvaluationPanel(options = {}) {
    const doc = options.document || (root && root.document) || null;
    const storage = getStorage(options.storage);
    if (!doc || typeof doc.querySelector !== "function") return null;
    const panel = doc.querySelector("#phase22-prediction-evaluation-core");
    if (!panel) return null;
    let raceInput = null;
    let evaluations = [];

    const render = (mode, preserveCurrentInput = false) => {
      if (preserveCurrentInput) evaluations = collectEvaluationsFromDocument(doc);
      renderEvaluationRows(doc, sortEvaluations(evaluations, mode || doc.querySelector("#phase22-prediction-sort")?.value || "horseNumber"));
    };
    const loadRace = () => {
      raceInput = loadRaceInput(storage);
      if (!raceInput) {
        setMessage(doc, "先にPhase22-1 レース情報入力で保存してください。", "error");
        return null;
      }
      const sourceRaceKey = buildSourceRaceKey(raceInput.race);
      renderRaceSummary(doc, raceInput.race);
      const saved = loadSavedEvaluation(storage);
      if (saved && saved.sourceRaceKey === sourceRaceKey) {
        evaluations = mergeSavedEvaluations(raceInput, saved.evaluations);
        setMessage(doc, "保存済みの予想評価を復元しました。", "success");
      } else {
        evaluations = buildInitialEvaluations(raceInput);
        setMessage(doc, saved && saved.sourceRaceKey !== sourceRaceKey ? "保存済み予想評価は別レースのため自動適用しません。" : "Phase22-1のレース情報を読み込みました。", saved ? "error" : "info");
      }
      render();
      return raceInput;
    };

    const save = () => {
      if (!raceInput && !loadRace()) return null;
      evaluations = collectEvaluationsFromDocument(doc);
      const payload = {
        sourceRaceKey: buildSourceRaceKey(raceInput.race),
        raceSummary: raceInput.race,
        evaluations
      };
      const result = saveEvaluation(payload, raceInput, storage);
      setMessage(doc, result.saved ? "予想評価をlocalStorageへ保存しました。" : result.errors.join(" / "), result.saved ? "success" : "error");
      return result;
    };

    const restore = () => loadRace();
    const remove = () => {
      const confirmDelete = options.confirmDelete || (() => (root && typeof root.confirm === "function" ? root.confirm("保存済みの予想評価を削除しますか？Phase22-1のレース入力データは削除しません。") : false));
      const result = deleteSavedEvaluation(storage, confirmDelete);
      setMessage(doc, result.deleted ? "保存済み予想評価を削除しました。Phase22-1のレース入力データは残しています。" : "削除には確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };
    const cleanupPhase21 = () => {
      evaluations = collectEvaluationsFromDocument(doc);
      const before = summarizePhase21Cleanup(storage);
      const confirmCleanup = options.confirmCleanup || ((summary) => (
        root && typeof root.confirm === "function"
          ? root.confirm(`古いPhase21ローカル保存データ ${summary.count}件（概算 ${summary.displaySize}）を整理します。Phase22-1のレース入力データ、Phase22-2の保存データ、入力中の予想評価フォームは削除しません。実行しますか？`)
          : false
      ));
      const result = cleanupPhase21LocalData(storage, confirmCleanup);
      updateCleanupSummary(doc, storage);
      if (!result.deleted) {
        setMessage(doc, result.reason === "confirmation_required" ? "Phase21ローカル保存データ整理は確認が必要です。" : "localStorageを利用できないため整理できません。", "error");
        return result;
      }
      render();
      setMessage(doc, `古いPhase21ローカル保存データを${result.removedCount}件整理しました。概算${formatBytes(before.bytes)}を解放しました。入力中の予想評価は保持しています。`, "success");
      return result;
    };

    const actions = [
      ["#phase22-load-race-for-prediction", "click", loadRace],
      ["#phase22-save-prediction-evaluation", "click", save],
      ["#phase22-restore-prediction-evaluation", "click", restore],
      ["#phase22-delete-prediction-evaluation", "click", remove],
      ["#phase22-cleanup-phase21-storage-for-prediction", "click", cleanupPhase21],
      ["#phase22-prediction-sort", "change", () => render(null, true)]
    ];
    actions.forEach(([selector, event, handler]) => {
      const node = doc.querySelector(selector);
      if (node) node.addEventListener(event, handler);
    });
    loadRace();
    updateCleanupSummary(doc, storage);
    return { loadRace, save, restore, remove, cleanupPhase21, render };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindPredictionEvaluationPanel();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RACE_INPUT_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_CLEANUP_KEYS,
    MARK_OPTIONS,
    MARK_LABELS,
    buildSourceRaceKey,
    buildRaceSummary,
    normalizeRaceInput,
    loadRaceInput,
    buildInitialEvaluations,
    mergeSavedEvaluations,
    normalizeEvaluationPayload,
    validateEvaluationPayload,
    saveEvaluation,
    loadSavedEvaluation,
    deleteSavedEvaluation,
    formatBytes,
    isPhase21CleanupKey,
    summarizePhase21Cleanup,
    cleanupPhase21LocalData,
    sortEvaluations,
    renderRaceSummary,
    renderEvaluationRows,
    collectEvaluationsFromDocument,
    bindPredictionEvaluationPanel
  };
});
