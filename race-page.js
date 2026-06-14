const RACE_RELEASE_VERSION = "1.4";
const RACE_RELEASE_STATUS = "Official Release v1.4";
const RACE_RELEASE_SCORE = 99;
const RACE_DATA_STORAGE_KEY = "hashimotoRaceDataJson";
const RACE_DATA_FILE_NAME = "race-data.json";

const raceCourseLabels = {
  tokyo: "東京版",
  nakayama: "中山版",
  hanshin: "阪神版",
  chukyo: "中京版",
  kyoto: "京都版",
  niigata: "新潟版",
  fukushima: "福島版",
  kokura: "小倉版",
  hakodate: "函館版",
  sapporo: "札幌版"
};

const raceDataFields = [
  { key: "prediction", label: "事前予想" },
  { key: "result", label: "結果" },
  { key: "review", label: "検証" },
  { key: "update", label: "アップデート" }
];

function setRaceText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function normalizeRaceNumber(value) {
  const raceNumber = Number(value || 1);
  return Math.min(12, Math.max(1, Number.isFinite(raceNumber) ? raceNumber : 1));
}

function createEmptyRaceData() {
  return {
    version: RACE_RELEASE_VERSION,
    releaseStatus: RACE_RELEASE_STATUS,
    updatedAt: null,
    races: []
  };
}

function readStoredRaceData(storage) {
  if (!storage || typeof storage.getItem !== "function") return createEmptyRaceData();
  try {
    const raw = storage.getItem(RACE_DATA_STORAGE_KEY);
    if (!raw) return createEmptyRaceData();
    const parsed = JSON.parse(raw);
    return {
      ...createEmptyRaceData(),
      ...parsed,
      races: Array.isArray(parsed.races) ? parsed.races : []
    };
  } catch (_error) {
    return createEmptyRaceData();
  }
}

function writeStoredRaceData(storage, data) {
  if (!storage || typeof storage.setItem !== "function") return;
  storage.setItem(RACE_DATA_STORAGE_KEY, serializeRaceData(data));
}

function buildRaceDataRecord({ courseKey, raceNumber, values, now = new Date() }) {
  return {
    course: courseKey,
    race: `R${normalizeRaceNumber(raceNumber)}`,
    prediction: values.prediction || "",
    result: values.result || "",
    review: values.review || "",
    update: values.update || "",
    updatedAt: now.toISOString()
  };
}

function upsertRaceDataRecord(data, record) {
  const next = {
    ...createEmptyRaceData(),
    ...data,
    version: RACE_RELEASE_VERSION,
    releaseStatus: RACE_RELEASE_STATUS,
    updatedAt: record.updatedAt,
    races: Array.isArray(data.races) ? [...data.races] : []
  };
  const index = next.races.findIndex((item) => item.course === record.course && item.race === record.race);
  if (index >= 0) {
    next.races[index] = record;
  } else {
    next.races.push(record);
  }
  return next;
}

function findRaceRecord(data, courseKey, raceNumber) {
  const race = `R${normalizeRaceNumber(raceNumber)}`;
  return (data.races || []).find((item) => item.course === courseKey && item.race === race) || null;
}

function serializeRaceData(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function renderRaceDataFields(record) {
  const target = document.getElementById("race-data-fields");
  if (!target) return;
  target.innerHTML = raceDataFields.map((field) => `
    <div class="race-data-field">
      <label for="race-${field.key}">${field.label}</label>
      <textarea id="race-${field.key}" data-race-field="${field.key}">${record ? record[field.key] || "" : ""}</textarea>
    </div>
  `).join("");
}

function readRaceFieldValues() {
  return raceDataFields.reduce((values, field) => {
    const input = document.querySelector(`[data-race-field="${field.key}"]`);
    values[field.key] = input ? input.value.trim() : "";
    return values;
  }, {});
}

function saveRaceDataJson(data) {
  const json = serializeRaceData(data);
  if (typeof window !== "undefined" && typeof window.showSaveFilePicker === "function") {
    return window.showSaveFilePicker({
      suggestedName: RACE_DATA_FILE_NAME,
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
    }).then(async (handle) => {
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    });
  }
  if (typeof document === "undefined") return Promise.resolve();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = RACE_DATA_FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
  return Promise.resolve();
}

function bootRaceManagementPage() {
  const params = new URLSearchParams(window.location.search);
  const courseKey = params.get("course") || "tokyo";
  const raceNumber = normalizeRaceNumber(params.get("race") || 1);
  const courseLabel = raceCourseLabels[courseKey] || raceCourseLabels.tokyo;
  const title = `${courseLabel}AI Console R${raceNumber}`;
  const storage = typeof localStorage !== "undefined" ? localStorage : null;
  const currentData = readStoredRaceData(storage);
  const currentRecord = findRaceRecord(currentData, courseKey, raceNumber);

  document.title = `橋本競馬AI Version ${RACE_RELEASE_VERSION} / ${title}`;
  setRaceText("official-banner-title", `橋本競馬AI ${RACE_RELEASE_STATUS}`);
  setRaceText("race-heading", title);
  setRaceText("race-title", title);
  setRaceText("race-subtitle", `${title} / Race Data JSON Storage`);
  setRaceText("race-version", `橋本競馬AI Version ${RACE_RELEASE_VERSION}`);
  setRaceText("race-status", RACE_RELEASE_STATUS);
  setRaceText("race-score", `Release Score ${RACE_RELEASE_SCORE}`);
  setRaceText("race-file-name", RACE_DATA_FILE_NAME);
  setRaceText("back-console-link", `${courseLabel}AI Consoleへ戻る`);

  const backLink = document.getElementById("back-console-link");
  if (backLink) backLink.href = `${courseKey}-console.html`;

  renderRaceDataFields(currentRecord);

  const saveButton = document.getElementById("race-data-save");
  const saveStatus = document.getElementById("race-save-status");
  if (!saveButton) return;
  saveButton.addEventListener("click", async () => {
    const record = buildRaceDataRecord({
      courseKey,
      raceNumber,
      values: readRaceFieldValues(),
      now: new Date()
    });
    const nextData = upsertRaceDataRecord(readStoredRaceData(storage), record);
    writeStoredRaceData(storage, nextData);
    if (saveStatus) saveStatus.textContent = `${record.race} を ${RACE_DATA_FILE_NAME} に保存しました`;
    await saveRaceDataJson(nextData);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootRaceManagementPage);
}

if (typeof module !== "undefined") {
  module.exports = {
    RACE_DATA_FILE_NAME,
    RACE_DATA_STORAGE_KEY,
    buildRaceDataRecord,
    createEmptyRaceData,
    normalizeRaceNumber,
    serializeRaceData,
    upsertRaceDataRecord
  };
}
