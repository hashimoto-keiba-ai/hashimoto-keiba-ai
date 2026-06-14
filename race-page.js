const RACE_RELEASE_VERSION = "1.5";
const RACE_RELEASE_STATUS = "Official Release v1.5";
const RACE_RELEASE_SCORE = 100;
const RACE_DATA_STORAGE_KEY = "hashimotoRaceDataJson";
const HISTORY_DB_STORAGE_KEY = "hashimotoHistoryDbJson";
const RACE_DATA_FILE_NAME = "race-data.json";
const HISTORY_DB_FILE_NAME = "history-db.json";

const raceCourseLabels = {
  tokyo: "東京版", nakayama: "中山版", hanshin: "阪神版", chukyo: "中京版", kyoto: "京都版",
  niigata: "新潟版", fukushima: "福島版", kokura: "小倉版", hakodate: "函館版", sapporo: "札幌版"
};

const historyCategories = {
  tokyo: "東京", nakayama: "中山", hanshin: "阪神", chukyo: "中京", kyoto: "京都",
  niigata: "新潟", fukushima: "福島", kokura: "小倉", hakodate: "函館", sapporo: "札幌", win5: "WIN5"
};

const raceDataFields = [
  { key: "date", label: "日付", type: "date" },
  { key: "prediction", label: "事前予想", type: "textarea" },
  { key: "result", label: "結果", type: "textarea" },
  { key: "review", label: "検証", type: "textarea" },
  { key: "update", label: "アップデート", type: "textarea" },
  { key: "hitRate", label: "的中率", type: "text" },
  { key: "returnRate", label: "回収率", type: "text" },
  { key: "trifectaReturnRate", label: "三連単回収率", type: "text" },
  { key: "win5Result", label: "WIN5成績", type: "text" },
  { key: "aiUpdateLog", label: "AI更新ログ", type: "textarea" }
];

function setRaceText(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }
function normalizeRaceNumber(value) { const raceNumber = Number(value || 1); return Math.min(12, Math.max(1, Number.isFinite(raceNumber) ? raceNumber : 1)); }
function createEmptyRaceData() { return { version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: null, races: [] }; }
function createEmptyHistoryDb() { return { version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, theme: "自己進化データベース", updatedAt: null, categories: Object.values(historyCategories).reduce((categories, label) => { categories[label] = []; return categories; }, {}) }; }
function readJsonFromStorage(storage, key, fallback) { if (!storage || typeof storage.getItem !== "function") return fallback(); try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : fallback(); } catch (_error) { return fallback(); } }
function readStoredRaceData(storage) { const data = readJsonFromStorage(storage, RACE_DATA_STORAGE_KEY, createEmptyRaceData); return { ...createEmptyRaceData(), ...data, races: Array.isArray(data.races) ? data.races : [] }; }
function readStoredHistoryDb(storage) { const data = readJsonFromStorage(storage, HISTORY_DB_STORAGE_KEY, createEmptyHistoryDb); return { ...createEmptyHistoryDb(), ...data, categories: { ...createEmptyHistoryDb().categories, ...(data.categories || {}) } }; }
function writeStoredRaceData(storage, data) { if (storage && typeof storage.setItem === "function") storage.setItem(RACE_DATA_STORAGE_KEY, serializeRaceData(data)); }
function writeStoredHistoryDb(storage, data) { if (storage && typeof storage.setItem === "function") storage.setItem(HISTORY_DB_STORAGE_KEY, serializeHistoryDb(data)); }

function buildRaceDataRecord({ courseKey, raceNumber, values, now = new Date() }) {
  const savedAt = now.toISOString();
  return {
    course: courseKey,
    race: `R${normalizeRaceNumber(raceNumber)}`,
    date: values.date || savedAt.slice(0, 10),
    prediction: values.prediction || "",
    result: values.result || "",
    review: values.review || "",
    update: values.update || "",
    hitRate: values.hitRate || "",
    returnRate: values.returnRate || "",
    trifectaReturnRate: values.trifectaReturnRate || "",
    win5Result: values.win5Result || "",
    aiUpdateLog: values.aiUpdateLog || "",
    savedAt
  };
}

function upsertRaceDataRecord(data, record) {
  const next = { ...createEmptyRaceData(), ...data, version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: record.savedAt, races: Array.isArray(data.races) ? [...data.races] : [] };
  const index = next.races.findIndex((item) => item.course === record.course && item.race === record.race);
  if (index >= 0) next.races[index] = record; else next.races.push(record);
  return next;
}

function buildHistoryEntry(record) {
  return {
    course: historyCategories[record.course] || record.course,
    race: record.race,
    date: record.date,
    prediction: record.prediction || "",
    result: record.result || "",
    review: record.review || "",
    update: record.update || "",
    hitRate: record.hitRate || "",
    returnRate: record.returnRate || "",
    trifectaReturnRate: record.trifectaReturnRate || "",
    win5Result: record.win5Result || "",
    aiUpdateLog: record.aiUpdateLog || "",
    savedAt: record.savedAt
  };
}

function accumulateHistoryRecord(historyDb, record) {
  const category = historyCategories[record.course] || record.course;
  const entry = buildHistoryEntry(record);
  const next = { ...createEmptyHistoryDb(), ...historyDb, version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: record.savedAt, categories: { ...createEmptyHistoryDb().categories, ...(historyDb.categories || {}) } };
  const list = Array.isArray(next.categories[category]) ? [...next.categories[category]] : [];
  const index = list.findIndex((item) => item.race === entry.race && item.date === entry.date);
  if (index >= 0) list[index] = entry; else list.push(entry);
  next.categories[category] = list;
  return next;
}

function findRaceRecord(data, courseKey, raceNumber) { const race = `R${normalizeRaceNumber(raceNumber)}`; return (data.races || []).find((item) => item.course === courseKey && item.race === race) || null; }
function serializeRaceData(data) { return `${JSON.stringify(data, null, 2)}\n`; }
function serializeHistoryDb(data) { return `${JSON.stringify(data, null, 2)}\n`; }

function renderFieldEditors(record) {
  const target = document.getElementById("race-data-fields");
  if (!target) return;
  target.innerHTML = raceDataFields.map((field) => {
    const value = record ? record[field.key] || "" : "";
    if (field.type === "textarea") return `<label class="race-data-field" for="race-${field.key}"><span>${field.label}</span><textarea id="race-${field.key}" data-race-field="${field.key}" rows="6">${value}</textarea></label>`;
    return `<label class="race-data-field compact" for="race-${field.key}"><span>${field.label}</span><input id="race-${field.key}" type="${field.type}" data-race-field="${field.key}" value="${value}"></label>`;
  }).join("");
}

function readFormValues() { return raceDataFields.reduce((values, field) => { const element = document.querySelector(`[data-race-field="${field.key}"]`); values[field.key] = element ? element.value.trim() : ""; return values; }, {}); }
function downloadJson(data, fileName, serializer) { if (typeof Blob === "undefined" || typeof URL === "undefined" || typeof document === "undefined") return; const blob = new Blob([serializer(data)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
async function saveJsonFile(data, fileName, serializer) { if (typeof window !== "undefined" && window.showSaveFilePicker) { const handle = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "JSON", accept: { "application/json": [".json"] } }] }); const writable = await handle.createWritable(); await writable.write(serializer(data)); await writable.close(); return; } downloadJson(data, fileName, serializer); }

function bootRaceManagementPage() {
  const params = new URLSearchParams(window.location.search);
  const courseKey = params.get("course") || "tokyo";
  const safeRaceNumber = normalizeRaceNumber(params.get("race") || 1);
  const courseLabel = raceCourseLabels[courseKey] || raceCourseLabels.tokyo;
  const title = `${courseLabel}AI Console R${safeRaceNumber}`;
  const storage = window.localStorage;
  const existingRecord = findRaceRecord(readStoredRaceData(storage), courseKey, safeRaceNumber);

  document.title = `橋本競馬AI Version ${RACE_RELEASE_VERSION} / ${title}`;
  setRaceText("official-banner-title", `橋本競馬AI ${RACE_RELEASE_STATUS}`);
  setRaceText("race-heading", title);
  setRaceText("race-title", title);
  setRaceText("race-subtitle", `${title} / race-data.json → history-db.json`);
  setRaceText("race-version", `橋本競馬AI Version ${RACE_RELEASE_VERSION}`);
  setRaceText("race-status", RACE_RELEASE_STATUS);
  setRaceText("race-score", `Release Score ${RACE_RELEASE_SCORE}`);
  setRaceText("race-file-name", `${RACE_DATA_FILE_NAME} / ${HISTORY_DB_FILE_NAME}`);
  setRaceText("back-console-link", `${courseLabel}AI Consoleへ戻る`);
  const backLink = document.getElementById("back-console-link");
  if (backLink) backLink.href = `${courseKey}-console.html`;
  renderFieldEditors(existingRecord);

  const saveButton = document.getElementById("race-data-save");
  const historyButton = document.getElementById("history-db-save");
  const saveStatus = document.getElementById("race-save-status");
  function saveCurrentRaceData(now = new Date()) { const record = buildRaceDataRecord({ courseKey, raceNumber: safeRaceNumber, values: readFormValues(), now }); const next = upsertRaceDataRecord(readStoredRaceData(storage), record); writeStoredRaceData(storage, next); return { next, record }; }
  if (saveButton) saveButton.addEventListener("click", async () => { const { next, record } = saveCurrentRaceData(); if (saveStatus) saveStatus.textContent = `${record.race} を ${RACE_DATA_FILE_NAME} に保存しました`; await saveJsonFile(next, RACE_DATA_FILE_NAME, serializeRaceData); });
  if (historyButton) historyButton.addEventListener("click", async () => { const { record } = saveCurrentRaceData(); const historyDb = accumulateHistoryRecord(readStoredHistoryDb(storage), record); writeStoredHistoryDb(storage, historyDb); if (saveStatus) saveStatus.textContent = `${record.race} を ${HISTORY_DB_FILE_NAME} へ蓄積しました`; await saveJsonFile(historyDb, HISTORY_DB_FILE_NAME, serializeHistoryDb); });
}

if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootRaceManagementPage);
if (typeof module !== "undefined") module.exports = { HISTORY_DB_FILE_NAME, HISTORY_DB_STORAGE_KEY, RACE_DATA_FILE_NAME, RACE_DATA_STORAGE_KEY, accumulateHistoryRecord, buildHistoryEntry, buildRaceDataRecord, createEmptyHistoryDb, createEmptyRaceData, historyCategories, normalizeRaceNumber, serializeHistoryDb, serializeRaceData, upsertRaceDataRecord };
