(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase221RaceInputCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.raceInput.v1";
  const MAX_FIELD_SIZE = 18;
  const RACE_FIELDS = ["raceDate", "racecourse", "raceNumber", "raceName", "surface", "distance", "trackCondition", "fieldSize"];
  const HORSE_FIELDS = ["horseNumber", "horseName", "jockey", "odds", "popularity"];

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

  function saveRaceInput(input, storage = root.localStorage) {
    const result = validateRaceInput(input);
    if (!result.valid) return result;
    storage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    return { ...result, saved: true };
  }

  function loadRaceInput(storage = root.localStorage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
      return normalizeRaceInput(parsed);
    } catch (error) {
      return null;
    }
  }

  function deleteRaceInput(storage = root.localStorage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    storage.removeItem(STORAGE_KEY);
    return { deleted: true };
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
    const doc = options.document || root.document;
    const storage = options.storage || root.localStorage;
    if (!doc || !storage || !doc.querySelector("#phase22-race-input-core")) return null;

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
      const confirmDelete = options.confirmDelete || (() => root.confirm("保存済みのレース入力を削除しますか？"));
      const result = deleteRaceInput(storage, confirmDelete);
      setMessage(doc, result.deleted ? "保存済みデータを削除しました。" : "削除には確認が必要です。", result.deleted ? "success" : "error");
      return result;
    };

    const actions = [
      ["#phase22-generate-horses", "click", generate],
      ["#phase22-save-race-input", "click", save],
      ["#phase22-restore-race-input", "click", restore],
      ["#phase22-delete-race-input", "click", remove]
    ];
    actions.forEach(([selector, event, handler]) => {
      const node = doc.querySelector(selector);
      if (node) node.addEventListener(event, handler);
    });

    const existing = loadRaceInput(storage);
    if (existing) restoreToDocument(doc, existing);
    else renderHorseRows(doc, buildHorseRows(8));
    setMessage(doc, existing ? "保存済みデータを読み込みました。" : "頭数を指定して出走馬入力行を生成してください。", "info");
    return { generate, save, restore, remove };
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
    renderHorseRows,
    restoreToDocument,
    bindRaceInputPanel
  };
});
