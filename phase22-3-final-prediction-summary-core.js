(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase223FinalPredictionSummaryCore = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RACE_INPUT_STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const PREDICTION_EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.predictionEvaluation.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.finalPredictionSummary.v1";
  const PROTECTED_CLEANUP_KEYS = [RACE_INPUT_STORAGE_KEY, PREDICTION_EVALUATION_STORAGE_KEY, STORAGE_KEY];
  const FINAL_MARKS = ["◎", "○", "▲", "△", "☆", "注"];
  const MARK_SORT_ORDER = { "◎": 1, "○": 2, "▲": 3, "△": 4, "☆": 5, "注": 6, "消": 7, "無印": 8 };
  const MEMO_FIELDS = ["finalView", "paceMemo", "bettingMemo", "cautionMemo"];
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

  function safeParseJson(raw) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
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
    if (!input || !input.race) return null;
    const horses = Array.isArray(input.horses) ? input.horses : [];
    return {
      race: buildRaceSummary(input.race),
      horses: horses.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        jockey: text(horse.jockey),
        odds: text(horse.odds),
        popularity: text(horse.popularity)
      }))
    };
  }

  function normalizeEvaluation(evaluation = {}, fallbackHorse = {}) {
    const aiScore = text(evaluation.aiScore);
    const mark = text(evaluation.mark) || "無印";
    return {
      horseNumber: text(evaluation.horseNumber || fallbackHorse.horseNumber),
      horseName: text(evaluation.horseName || fallbackHorse.horseName),
      jockey: text(evaluation.jockey || fallbackHorse.jockey),
      odds: text(evaluation.odds || fallbackHorse.odds),
      popularity: text(evaluation.popularity || fallbackHorse.popularity),
      aiScore,
      aiScoreNumber: numberOrNull(aiScore),
      mark,
      reason: text(evaluation.reason),
      paceComment: text(evaluation.paceComment),
      dangerousPopular: Boolean(evaluation.dangerousPopular),
      longshot: Boolean(evaluation.longshot),
      keyCandidate: Boolean(evaluation.keyCandidate),
      opponentCandidate: Boolean(evaluation.opponentCandidate),
      originalIndex: Number.isInteger(evaluation.originalIndex) ? evaluation.originalIndex : 0
    };
  }

  function normalizePredictionEvaluation(input) {
    if (!input) return null;
    const evaluations = Array.isArray(input) ? input : (Array.isArray(input.evaluations) ? input.evaluations : []);
    return {
      schemaVersion: Number(input.schemaVersion) || SCHEMA_VERSION,
      savedAt: input.savedAt || "",
      sourceRaceKey: text(input.sourceRaceKey),
      raceSummary: buildRaceSummary(input.raceSummary || {}),
      evaluations: evaluations.map((evaluation, index) => normalizeEvaluation({ ...evaluation, originalIndex: index }))
    };
  }

  function loadRaceInput(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return null;
    return normalizeRaceInput(safeParseJson(targetStorage.getItem(RACE_INPUT_STORAGE_KEY)));
  }

  function loadPredictionEvaluation(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return null;
    return normalizePredictionEvaluation(safeParseJson(targetStorage.getItem(PREDICTION_EVALUATION_STORAGE_KEY)));
  }

  function mergeRaceAndEvaluations(raceInput, predictionEvaluation) {
    const horses = raceInput && Array.isArray(raceInput.horses) ? raceInput.horses : [];
    const evaluations = predictionEvaluation && Array.isArray(predictionEvaluation.evaluations) ? predictionEvaluation.evaluations : [];
    const byHorseNumber = new Map(evaluations.map((evaluation) => [text(evaluation.horseNumber), evaluation]));
    if (!horses.length) return evaluations.map((evaluation, index) => normalizeEvaluation({ ...evaluation, originalIndex: index }));
    return horses.map((horse, index) => normalizeEvaluation({ ...(byHorseNumber.get(text(horse.horseNumber)) || {}), originalIndex: index }, horse));
  }

  function rankByAiScore(evaluations = []) {
    return [...evaluations].sort((a, b) => {
      const aScore = a.aiScoreNumber;
      const bScore = b.aiScoreNumber;
      if (aScore !== null && bScore !== null && bScore !== aScore) return bScore - aScore;
      if (aScore !== null && bScore === null) return -1;
      if (aScore === null && bScore !== null) return 1;
      const horseDiff = (numberOrNull(a.horseNumber) ?? Number.POSITIVE_INFINITY) - (numberOrNull(b.horseNumber) ?? Number.POSITIVE_INFINITY);
      if (horseDiff !== 0) return horseDiff;
      return (a.originalIndex || 0) - (b.originalIndex || 0);
    });
  }

  function buildMarkSummary(evaluations = []) {
    return FINAL_MARKS.map((mark) => ({
      mark,
      horses: evaluations
        .filter((evaluation) => evaluation.mark === mark)
        .sort((a, b) => (MARK_SORT_ORDER[a.mark] || 99) - (MARK_SORT_ORDER[b.mark] || 99) || (numberOrNull(a.horseNumber) || 999) - (numberOrNull(b.horseNumber) || 999))
    }));
  }

  function buildCandidateSummary(evaluations = []) {
    const keyCandidates = evaluations.filter((evaluation) => evaluation.keyCandidate);
    const opponentCandidates = evaluations.filter((evaluation) => evaluation.opponentCandidate && !evaluation.keyCandidate);
    const holdCandidates = evaluations.filter((evaluation) => (
      !evaluation.keyCandidate
      && !evaluation.opponentCandidate
      && ["△", "☆", "注"].includes(evaluation.mark)
    ));
    return {
      keyCandidates: rankByAiScore(keyCandidates),
      opponentCandidates: rankByAiScore(opponentCandidates),
      holdCandidates: rankByAiScore(holdCandidates)
    };
  }

  function buildRiskSummary(evaluations = []) {
    const dangerousPopular = evaluations.filter((evaluation) => evaluation.dangerousPopular);
    const longshots = evaluations.filter((evaluation) => evaluation.longshot);
    const divineLongshots = evaluations.filter((evaluation) => evaluation.longshot && (evaluation.mark === "☆" || (evaluation.aiScoreNumber !== null && evaluation.aiScoreNumber >= 80)));
    return {
      dangerousPopular: rankByAiScore(dangerousPopular),
      longshots: rankByAiScore(longshots),
      divineLongshots: rankByAiScore(divineLongshots)
    };
  }

  function buildAggregate(raceInput, predictionEvaluation) {
    const evaluations = mergeRaceAndEvaluations(raceInput, predictionEvaluation);
    const raceSummary = raceInput ? raceInput.race : (predictionEvaluation ? predictionEvaluation.raceSummary : buildRaceSummary({}));
    const sourceRaceKey = buildSourceRaceKey(raceSummary);
    const predictionRaceKey = predictionEvaluation ? predictionEvaluation.sourceRaceKey : "";
    return {
      raceSummary,
      sourceRaceKey,
      predictionRaceKey,
      raceKeyMatches: Boolean(sourceRaceKey && predictionRaceKey && sourceRaceKey === predictionRaceKey),
      evaluations,
      ranking: rankByAiScore(evaluations),
      markSummary: buildMarkSummary(evaluations),
      candidateSummary: buildCandidateSummary(evaluations),
      riskSummary: buildRiskSummary(evaluations)
    };
  }

  function normalizeFinalSummary(input = {}) {
    const memos = input.memos || input;
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: input.savedAt || new Date().toISOString(),
      sourceRaceKey: text(input.sourceRaceKey),
      memos: {
        finalView: text(memos.finalView),
        paceMemo: text(memos.paceMemo),
        bettingMemo: text(memos.bettingMemo),
        cautionMemo: text(memos.cautionMemo)
      }
    };
  }

  function loadFinalSummary(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return null;
    const parsed = safeParseJson(targetStorage.getItem(STORAGE_KEY));
    return parsed ? normalizeFinalSummary(parsed) : null;
  }

  function saveFinalSummary(input, storage) {
    const targetStorage = getStorage(storage);
    const data = normalizeFinalSummary(input);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"], data };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { saved: true, data };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return {
        saved: false,
        quotaExceeded,
        storageError: true,
        errors: [quotaExceeded ? "localStorageの容量が不足しているため最終予想メモを保存できませんでした。古い保存データを整理してから再度保存してください。" : "localStorageへの保存に失敗しました。"],
        data
      };
    }
  }

  function deleteFinalSummary(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function summarizePhase21Cleanup(storage) {
    return cleanupApi.summarizePhase21Cleanup(getStorage(storage), PROTECTED_CLEANUP_KEYS);
  }

  function cleanupPhase21LocalData(storage, confirmCleanup = () => false) {
    return cleanupApi.cleanupPhase21LocalData(getStorage(storage), confirmCleanup, PROTECTED_CLEANUP_KEYS);
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function setMessage(doc, message, kind = "info") {
    const node = doc.querySelector("#phase22-final-summary-message");
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function readMemosFromDocument(doc) {
    const memos = {};
    MEMO_FIELDS.forEach((field) => {
      const node = doc.querySelector(`[data-phase22-final-memo="${field}"]`);
      memos[field] = node ? node.value : "";
    });
    return memos;
  }

  function restoreMemosToDocument(doc, summary) {
    const memos = summary && summary.memos ? summary.memos : {};
    MEMO_FIELDS.forEach((field) => {
      const node = doc.querySelector(`[data-phase22-final-memo="${field}"]`);
      if (node) node.value = memos[field] || "";
    });
  }

  function renderRaceSummary(doc, race) {
    const container = doc.querySelector("#phase22-final-race-summary");
    if (!container) return;
    container.textContent = "";
    [
      ["開催日", race.raceDate],
      ["競馬場", race.racecourse],
      ["レース番号", race.raceNumber],
      ["レース名", race.raceName],
      ["芝／ダート", race.surface],
      ["距離", race.distance],
      ["馬場状態", race.trackCondition],
      ["頭数", race.fieldSize]
    ].forEach(([label, value]) => {
      const item = makeEl(doc, "article", "", "");
      item.appendChild(makeEl(doc, "span", "", label));
      item.appendChild(makeEl(doc, "strong", "", value || "--"));
      container.appendChild(item);
    });
  }

  function renderHorseList(doc, containerId, horses, emptyText = "該当なし") {
    const container = doc.querySelector(containerId);
    if (!container) return;
    container.textContent = "";
    if (!horses || horses.length === 0) {
      container.appendChild(makeEl(doc, "p", "phase22-empty-note", emptyText));
      return;
    }
    horses.forEach((horse) => {
      const item = makeEl(doc, "article", "phase22-summary-horse", "");
      item.appendChild(makeEl(doc, "strong", "", `${horse.horseNumber || "--"} ${horse.horseName || "馬名未設定"}`));
      item.appendChild(makeEl(doc, "span", "", `AI評価点 ${horse.aiScore || "未評価"}`));
      item.appendChild(makeEl(doc, "span", "", `印 ${horse.mark || "無印"}`));
      container.appendChild(item);
    });
  }

  function renderRanking(doc, ranking) {
    const container = doc.querySelector("#phase22-final-ranking");
    if (!container) return;
    container.textContent = "";
    if (!ranking || ranking.length === 0) {
      container.appendChild(makeEl(doc, "p", "phase22-empty-note", "Phase22-2の予想評価がありません。"));
      return;
    }
    ranking.forEach((horse, index) => {
      const row = makeEl(doc, "article", "phase22-ranking-row", "");
      row.appendChild(makeEl(doc, "span", "phase22-ranking-rank", String(index + 1)));
      row.appendChild(makeEl(doc, "strong", "", `${horse.horseNumber || "--"} ${horse.horseName || "馬名未設定"}`));
      row.appendChild(makeEl(doc, "span", "", `AI評価点 ${horse.aiScore || "未評価"}`));
      row.appendChild(makeEl(doc, "span", "", `最終印 ${horse.mark || "無印"}`));
      container.appendChild(row);
    });
  }

  function renderMarks(doc, markSummary) {
    const container = doc.querySelector("#phase22-final-mark-summary");
    if (!container) return;
    container.textContent = "";
    markSummary.forEach((entry) => {
      const block = makeEl(doc, "article", "phase22-mark-block", "");
      block.appendChild(makeEl(doc, "strong", "", entry.mark));
      const body = makeEl(doc, "div", "phase22-mark-horses", "");
      if (!entry.horses.length) {
        body.appendChild(makeEl(doc, "span", "phase22-empty-note", "未設定"));
      } else {
        entry.horses.forEach((horse) => body.appendChild(makeEl(doc, "span", "", `${horse.horseNumber || "--"} ${horse.horseName || "馬名未設定"} / ${horse.aiScore || "未評価"}`)));
      }
      block.appendChild(body);
      container.appendChild(block);
    });
  }

  function renderAggregate(doc, aggregate) {
    renderRaceSummary(doc, aggregate.raceSummary);
    renderRanking(doc, aggregate.ranking);
    renderMarks(doc, aggregate.markSummary);
    renderHorseList(doc, "#phase22-final-key-candidates", aggregate.candidateSummary.keyCandidates);
    renderHorseList(doc, "#phase22-final-opponent-candidates", aggregate.candidateSummary.opponentCandidates);
    renderHorseList(doc, "#phase22-final-hold-candidates", aggregate.candidateSummary.holdCandidates);
    renderHorseList(doc, "#phase22-final-dangerous-popular", aggregate.riskSummary.dangerousPopular);
    renderHorseList(doc, "#phase22-final-longshots", aggregate.riskSummary.longshots);
    renderHorseList(doc, "#phase22-final-divine-longshots", aggregate.riskSummary.divineLongshots);
  }

  function updateCleanupSummary(doc, storage) {
    const node = doc.querySelector("#phase22-final-phase21-cleanup-summary");
    if (!node) return null;
    const summary = summarizePhase21Cleanup(storage);
    node.textContent = `削除対象候補: ${summary.count}件 / 概算 ${summary.displaySize}`;
    node.dataset.count = String(summary.count);
    node.dataset.bytes = String(summary.bytes);
    return summary;
  }

  function bindFinalPredictionSummaryPanel(options = {}) {
    const doc = options.document || (root && root.document) || null;
    const storage = getStorage(options.storage);
    if (!doc || typeof doc.querySelector !== "function") return null;
    const panel = doc.querySelector("#phase22-final-prediction-summary-core");
    if (!panel || panel.dataset.phase22FinalBound === "true") return null;
    panel.dataset.phase22FinalBound = "true";
    let aggregate = buildAggregate(loadRaceInput(storage), loadPredictionEvaluation(storage));

    const refresh = () => {
      aggregate = buildAggregate(loadRaceInput(storage), loadPredictionEvaluation(storage));
      renderAggregate(doc, aggregate);
      updateCleanupSummary(doc, storage);
      if (!aggregate.evaluations.length) {
        setMessage(doc, "Phase22-2 予想評価入力で保存してから集約してください。", "error");
      } else if (aggregate.predictionRaceKey && !aggregate.raceKeyMatches) {
        setMessage(doc, "Phase22-1のレース情報とPhase22-2の評価データが一致しません。内容を確認してください。", "error");
      } else {
        setMessage(doc, "Phase22-2の予想評価を集約しました。", "success");
      }
      return aggregate;
    };

    const save = () => {
      const result = saveFinalSummary({ sourceRaceKey: aggregate.sourceRaceKey, memos: readMemosFromDocument(doc) }, storage);
      setMessage(doc, result.saved ? "最終予想メモを保存しました。" : result.errors.join(" / "), result.saved ? "success" : "error");
      return result;
    };

    const restore = () => {
      refresh();
      const saved = loadFinalSummary(storage);
      if (!saved) {
        setMessage(doc, "Phase22-3の保存済みメモはありません。", "info");
        return null;
      }
      if (saved.sourceRaceKey && aggregate.sourceRaceKey && saved.sourceRaceKey !== aggregate.sourceRaceKey) {
        setMessage(doc, "保存済みの最終予想メモは別レースのため自動復元しません。", "error");
        return saved;
      }
      restoreMemosToDocument(doc, saved);
      setMessage(doc, "保存済みの最終予想メモを復元しました。", "success");
      return saved;
    };

    const reset = () => {
      const confirmReset = options.confirmReset || (() => (root && typeof root.confirm === "function" ? root.confirm("Phase22-3の最終予想メモだけを初期化しますか？Phase22-1/22-2のデータは削除しません。") : false));
      const result = deleteFinalSummary(storage, confirmReset);
      if (result.deleted) restoreMemosToDocument(doc, { memos: {} });
      setMessage(doc, result.deleted ? "Phase22-3の保存済みメモだけを初期化しました。Phase22-1/22-2のデータは残しています。" : "初期化には確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };

    const cleanupPhase21 = () => {
      const before = summarizePhase21Cleanup(storage);
      const confirmCleanup = options.confirmCleanup || ((summary) => (
        root && typeof root.confirm === "function"
          ? root.confirm(`古いPhase21ローカル保存データ ${summary.count}件（概算 ${summary.displaySize}）を整理します。Phase22-1/22-2/22-3の保存データと入力中メモは削除しません。実行しますか？`)
          : false
      ));
      const result = cleanupPhase21LocalData(storage, confirmCleanup);
      updateCleanupSummary(doc, storage);
      setMessage(doc, result.deleted ? `古いPhase21ローカル保存データを${result.removedCount}件整理しました。概算${cleanupApi.formatBytes(before.bytes)}を解放しました。` : "Phase21ローカル保存データ整理は確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };

    [
      ["#phase22-refresh-final-summary", "click", refresh],
      ["#phase22-save-final-summary", "click", save],
      ["#phase22-restore-final-summary", "click", restore],
      ["#phase22-reset-final-summary", "click", reset],
      ["#phase22-cleanup-phase21-storage-for-final-summary", "click", cleanupPhase21]
    ].forEach(([selector, event, handler]) => {
      const node = doc.querySelector(selector);
      if (node) node.addEventListener(event, handler);
    });

    refresh();
    const saved = loadFinalSummary(storage);
    if (saved && (!saved.sourceRaceKey || saved.sourceRaceKey === aggregate.sourceRaceKey)) restoreMemosToDocument(doc, saved);
    return { refresh, save, restore, reset, cleanupPhase21 };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindFinalPredictionSummaryPanel();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RACE_INPUT_STORAGE_KEY,
    PREDICTION_EVALUATION_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_CLEANUP_KEYS,
    FINAL_MARKS,
    buildSourceRaceKey,
    buildRaceSummary,
    normalizeRaceInput,
    normalizePredictionEvaluation,
    normalizeFinalSummary,
    loadRaceInput,
    loadPredictionEvaluation,
    loadFinalSummary,
    saveFinalSummary,
    deleteFinalSummary,
    mergeRaceAndEvaluations,
    rankByAiScore,
    buildMarkSummary,
    buildCandidateSummary,
    buildRiskSummary,
    buildAggregate,
    summarizePhase21Cleanup,
    cleanupPhase21LocalData,
    renderAggregate,
    bindFinalPredictionSummaryPanel
  };
});
