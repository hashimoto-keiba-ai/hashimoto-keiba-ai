(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase221RaceInputCore = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const MAX_FIELD_SIZE = 18;
  const RACE_FIELDS = ["raceDate", "racecourse", "raceNumber", "raceName", "surface", "distance", "trackCondition", "fieldSize"];
  const HORSE_FIELDS = ["horseNumber", "horseName", "jockey", "odds", "popularity"];
  const PHASE21_CLEANUP_KEY_PATTERN = /phase21/i;
  const PHASE21_CLEANUP_TYPE_PATTERN = /(checklist|check|continuation|latest|summary|generated|temporary|temp|panel|builder|closure|operation)/i;

  function text(value) {
    return String(value ?? "").trim();
  }

  function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function buildEmptyHorse(index) {
    return {
      horseNumber: String(index + 1),
      horseName: "",
      jockey: "",
      odds: "",
      popularity: ""
    };
  }

  function buildHorseRows(fieldSize) {
    const count = Number(fieldSize);
    if (!Number.isInteger(count) || count < 1 || count > MAX_FIELD_SIZE) return [];
    return Array.from({ length: count }, (_, index) => buildEmptyHorse(index));
  }

  function normalizeRaceInput(input = {}) {
    const race = input.race || input;
    const fieldSize = Number.parseInt(race.fieldSize, 10);
    const horses = Array.isArray(input.horses) ? input.horses : [];
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: input.savedAt || new Date().toISOString(),
      safety: {
        privateRepository: true,
        privateLocalOnly: true,
        planOnly: true,
        protectedMode: true,
        githubPages: false,
        publicUrl: false,
        externalApi: false,
        autoFetch: false,
        ipatConnection: false,
        autoBetting: false,
        autoExecution: false
      },
      race: {
        raceDate: text(race.raceDate),
        racecourse: text(race.racecourse),
        raceNumber: text(race.raceNumber),
        raceName: text(race.raceName),
        surface: text(race.surface),
        distance: text(race.distance),
        trackCondition: text(race.trackCondition),
        fieldSize: Number.isInteger(fieldSize) ? fieldSize : null
      },
      horses: horses.map((horse) => ({
        horseNumber: text(horse.horseNumber),
        horseName: text(horse.horseName),
        jockey: text(horse.jockey),
        odds: text(horse.odds),
        popularity: text(horse.popularity)
      }))
    };
  }

  function validateRaceInput(input = {}) {
    const normalized = normalizeRaceInput(input);
    const errors = [];
    const race = normalized.race;
    if (!race.raceDate) errors.push("開催日を入力してください。");
    if (!race.racecourse) errors.push("競馬場を入力してください。");
    if (!race.raceNumber) errors.push("レース番号を入力してください。");
    if (!race.raceName) errors.push("レース名を入力してください。");
    if (!race.surface) errors.push("芝／ダートを選択してください。");
    if (!race.distance) errors.push("距離を入力してください。");
    if (!race.trackCondition) errors.push("馬場状態を入力してください。");
    if (!Number.isInteger(race.fieldSize) || race.fieldSize < 1 || race.fieldSize > MAX_FIELD_SIZE) {
      errors.push(`頭数は1〜${MAX_FIELD_SIZE}で入力してください。`);
    }
    if (Number.isInteger(race.fieldSize) && normalized.horses.length !== race.fieldSize) {
      errors.push("頭数と出走馬入力行数が一致していません。");
    }

    const seenHorseNumbers = new Set();
    normalized.horses.forEach((horse, index) => {
      const row = index + 1;
      const horseNumber = numberOrNull(horse.horseNumber);
      const odds = numberOrNull(horse.odds);
      const popularity = numberOrNull(horse.popularity);
      if (!Number.isInteger(horseNumber) || horseNumber < 1) errors.push(`${row}行目の馬番を正しく入力してください。`);
      if (horse.horseNumber && seenHorseNumbers.has(horse.horseNumber)) errors.push(`馬番${horse.horseNumber}が重複しています。`);
      if (horse.horseNumber) seenHorseNumbers.add(horse.horseNumber);
      if (!horse.horseName) errors.push(`${row}行目の馬名を入力してください。`);
      if (!horse.jockey) errors.push(`${row}行目の騎手を入力してください。`);
      if (odds === null || odds <= 0) errors.push(`${row}行目のオッズを正しく入力してください。`);
      if (!Number.isInteger(popularity) || popularity < 1) errors.push(`${row}行目の人気を正しく入力してください。`);
    });

    return { valid: errors.length === 0, errors, data: normalized };
  }

  function getStorage(storage) {
    return storage || (root && root.localStorage) || null;
  }

  function saveRaceInput(input, storage) {
    const result = validateRaceInput(input);
    if (!result.valid) return result;
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { ...result, valid: false, saved: false, storageError: true, errors: ["localStorageを利用できません。"] };
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
        storageError: true,
        errors: [quotaExceeded ? "localStorageの容量が不足しているため保存できませんでした。不要な保存データを削除してから再度保存してください。" : "localStorageへの保存に失敗しました。"]
      };
    }
  }

  function loadRaceInput(storage) {
    try {
      const targetStorage = getStorage(storage);
      if (!targetStorage) return null;
      const raw = targetStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
      return normalizeRaceInput(parsed);
    } catch (error) {
      return null;
    }
  }

  function deleteRaceInput(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function estimateStorageBytes(key, value) {
    return (String(key || "").length + String(value || "").length) * 2;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function isPhase21CleanupKey(key) {
    if (!key || key === STORAGE_KEY) return false;
    return PHASE21_CLEANUP_KEY_PATTERN.test(key) && PHASE21_CLEANUP_TYPE_PATTERN.test(key);
  }

  function getPhase21CleanupCandidates(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage || typeof targetStorage.length !== "number" || typeof targetStorage.key !== "function") return [];
    const candidates = [];
    for (let index = 0; index < targetStorage.length; index += 1) {
      const key = targetStorage.key(index);
      if (!isPhase21CleanupKey(key)) continue;
      const value = targetStorage.getItem(key) || "";
      candidates.push({ key, bytes: estimateStorageBytes(key, value) });
    }
    return candidates;
  }

  function summarizePhase21Cleanup(storage) {
    const candidates = getPhase21CleanupCandidates(storage);
    const bytes = candidates.reduce((sum, item) => sum + item.bytes, 0);
    return { count: candidates.length, bytes, displaySize: formatBytes(bytes), keys: candidates.map((item) => item.key) };
  }

  function cleanupPhase21LocalData(storage, confirmCleanup = () => false) {
    const targetStorage = getStorage(storage);
    const summary = summarizePhase21Cleanup(targetStorage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable", ...summary };
    if (!confirmCleanup(summary)) return { deleted: false, reason: "confirmation_required", ...summary };
    summary.keys.forEach((key) => targetStorage.removeItem(key));
    return { deleted: true, removedCount: summary.count, releasedBytes: summary.bytes, releasedSize: summary.displaySize, keys: summary.keys };
  }

  function collectFromDocument(doc) {
    const race = {};
    RACE_FIELDS.forEach((field) => {
      const node = doc.querySelector(`[data-phase22-race="${field}"]`);
      race[field] = node ? node.value : "";
    });
    const horses = Array.from(doc.querySelectorAll("[data-phase22-horse-row]")).map((row) => {
      const horse = {};
      HORSE_FIELDS.forEach((field) => {
        const node = row.querySelector(`[data-phase22-horse="${field}"]`);
        horse[field] = node ? node.value : "";
      });
      return horse;
    });
    return { race, horses };
  }

  function setMessage(doc, message, kind = "info") {
    const node = doc.querySelector("#phase22-race-input-message");
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function updateCleanupSummary(doc, storage) {
    const node = doc.querySelector("#phase22-phase21-cleanup-summary");
    if (!node) return null;
    const summary = summarizePhase21Cleanup(storage);
    node.textContent = `削除対象候補: ${summary.count}件 / 概算 ${summary.displaySize}`;
    node.dataset.count = String(summary.count);
    node.dataset.bytes = String(summary.bytes);
    return summary;
  }

  function renderHorseRows(doc, horses) {
    const list = doc.querySelector("#phase22-horse-input-list");
    if (!list) return;
    list.textContent = "";
    horses.forEach((horse, index) => {
      const row = doc.createElement("div");
      row.className = "phase22-horse-row";
      row.setAttribute("data-phase22-horse-row", String(index + 1));
      row.innerHTML = HORSE_FIELDS.map((field) => {
        const label = { horseNumber: "馬番", horseName: "馬名", jockey: "騎手", odds: "オッズ", popularity: "人気" }[field];
        const type = field === "horseName" || field === "jockey" ? "text" : "number";
        const min = type === "number" ? ' min="1" step="0.1"' : "";
        return `<label><span>${label}</span><input type="${type}"${min} data-phase22-horse="${field}" value=""></label>`;
      }).join("");
      HORSE_FIELDS.forEach((field) => {
        const input = row.querySelector(`[data-phase22-horse="${field}"]`);
        if (input) input.value = horse[field] || "";
      });
      list.appendChild(row);
    });
  }

  function restoreToDocument(doc, data) {
    if (!data) return;
    RACE_FIELDS.forEach((field) => {
      const node = doc.querySelector(`[data-phase22-race="${field}"]`);
      if (node) node.value = data.race[field] ?? "";
    });
    renderHorseRows(doc, data.horses);
  }

  function bindRaceInputPanel(options = {}) {
    const doc = options.document || (root && root.document) || null;
    const storage = getStorage(options.storage);
    if (!doc || typeof doc.querySelector !== "function") return null;
    const panel = doc.querySelector("#phase22-race-input-core");
    if (!panel) return null;

    const generate = () => {
      const sizeNode = doc.querySelector('[data-phase22-race="fieldSize"]');
      const rows = buildHorseRows(sizeNode ? sizeNode.value : "");
      if (!rows.length) {
        setMessage(doc, `頭数は1〜${MAX_FIELD_SIZE}で入力してください。`, "error");
        return;
      }
      renderHorseRows(doc, rows);
      setMessage(doc, `${rows.length}頭分の入力行を生成しました。`, "info");
    };

    const save = () => {
      const result = saveRaceInput(collectFromDocument(doc), storage);
      if (!result.valid) {
        setMessage(doc, result.errors.join(" / "), "error");
        return result;
      }
      setMessage(doc, "レース情報と出走馬情報をlocalStorageへ保存しました。", "success");
      return result;
    };

    const restore = () => {
      const data = loadRaceInput(storage);
      if (!data) {
        setMessage(doc, "保存済みデータはありません。", "info");
        return null;
      }
      restoreToDocument(doc, data);
      setMessage(doc, "保存済みデータを復元しました。", "success");
      return data;
    };

    const remove = () => {
      const confirmDelete = options.confirmDelete || (() => (root && typeof root.confirm === "function" ? root.confirm("保存済みのレース入力を削除しますか？") : false));
      const result = deleteRaceInput(storage, confirmDelete);
      setMessage(doc, result.deleted ? "保存済みデータを削除しました。" : "削除には確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };

    const cleanupPhase21 = () => {
      const before = summarizePhase21Cleanup(storage);
      const confirmCleanup = options.confirmCleanup || ((summary) => (
        root && typeof root.confirm === "function"
          ? root.confirm(`古いPhase21ローカル保存データ ${summary.count}件（概算 ${summary.displaySize}）を整理します。Phase22-1の入力中フォームと保存キーは削除しません。実行しますか？`)
          : false
      ));
      const result = cleanupPhase21LocalData(storage, confirmCleanup);
      updateCleanupSummary(doc, storage);
      if (!result.deleted) {
        setMessage(doc, result.reason === "confirmation_required" ? "Phase21ローカル保存データ整理は確認が必要です。" : "localStorageを利用できないため整理できません。", "error");
        return result;
      }
      setMessage(doc, `古いPhase21ローカル保存データを${result.removedCount}件整理しました。概算${formatBytes(before.bytes)}を解放しました。`, "success");
      return result;
    };

    const actions = [
      ["#phase22-generate-horses", "click", generate],
      ["#phase22-save-race-input", "click", save],
      ["#phase22-restore-race-input", "click", restore],
      ["#phase22-delete-race-input", "click", remove],
      ["#phase22-cleanup-phase21-storage", "click", cleanupPhase21]
    ];
    actions.forEach(([selector, event, handler]) => {
      const node = doc.querySelector(selector);
      if (node) node.addEventListener(event, handler);
    });

    const existing = loadRaceInput(storage);
    if (existing) restoreToDocument(doc, existing);
    else renderHorseRows(doc, buildHorseRows(8));
    updateCleanupSummary(doc, storage);
    setMessage(doc, existing ? "保存済みデータを読み込みました。" : "頭数を指定して出走馬入力行を生成してください。", "info");
    return { generate, save, restore, remove, cleanupPhase21 };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindRaceInputPanel();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    STORAGE_KEY,
    MAX_FIELD_SIZE,
    buildHorseRows,
    normalizeRaceInput,
    validateRaceInput,
    saveRaceInput,
    loadRaceInput,
    deleteRaceInput,
    estimateStorageBytes,
    formatBytes,
    isPhase21CleanupKey,
    getPhase21CleanupCandidates,
    summarizePhase21Cleanup,
    cleanupPhase21LocalData,
    renderHorseRows,
    restoreToDocument,
    bindRaceInputPanel
  };
});
