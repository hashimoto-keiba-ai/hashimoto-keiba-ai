(() => {
  const VERSION = "2.6";
  const STORAGE_KEYS = {
    history: "history-db.json",
    course: "course-db.json",
    distance: "distance-db.json",
    profit: "profit-db.json",
    returnAi: "return-ai-db.json",
    learning: "learning-engine.json"
  };
  const FLOW_STEPS = [
    "結果入力",
    "事前予想と照合",
    "検証を生成",
    "アップデート内容を生成",
    "history-db.jsonへ保存",
    "course-db.jsonへ保存",
    "distance-db.jsonへ保存",
    "profit-db.jsonへ保存",
    "return-ai-db.jsonへ保存",
    "learning-engine.jsonへ保存"
  ];
  const LEARNING_ITEMS = [
    "危険人気馬",
    "神穴馬",
    "人気ゾーン",
    "騎手傾向",
    "調教師傾向",
    "コース傾向",
    "距離傾向",
    "三連単構造",
    "WIN5構造"
  ];
  const EVOLUTION_HISTORY = [
    "v1.0 基本版",
    "v1.1 Console化",
    "v1.2 競馬場メニュー",
    "v1.2.1 レイアウト整理",
    "v1.3 R1～R12管理",
    "v1.4 JSON保存",
    "v1.5 自己進化DB",
    "v1.6 全競馬場統合AI",
    "v1.7 回収率AI",
    "v1.8 自動学習AI",
    "v1.9 予想生成AI",
    "v2.0 橋本競馬AI統合OS",
    "v2.1 AI秘書システム",
    "v2.2 万馬券探索AI",
    "v2.3 WIN5完全自動化AI",
    "v2.4 回収率管理AI",
    "v2.5 AI研究所",
    "v2.6 自己進化エンジン"
  ];
  const DEFAULT_RESULT = Object.freeze({
    date: "2026-06-14",
    course: "東京競馬場",
    race: "11R",
    prediction: "AI指数上位＋神穴馬を三連単フォーメーションで評価",
    result: "自動学習用サンプル結果",
    beforeScore: 91,
    afterScore: 111,
    hit: true,
    returnRate: 148.6,
    trifectaPattern: "1着軸→相手2頭→穴3頭",
    win5Pattern: "A軸固定＋Bゾーン2点"
  });

  const readJson = (storage, key, fallback = []) => {
    try {
      const raw = storage?.getItem?.(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : Array.isArray(parsed.records) ? parsed.records : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const writeRecords = (storage, key, records) => {
    storage?.setItem?.(key, JSON.stringify({ version: VERSION, storageKey: key, records }, null, 2));
    return records;
  };
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const todayString = () => new Date().toISOString().slice(0, 10);

  const buildGeneratedLearningItems = (record) => ({
    dangerPopular: record.hit ? 1 : 2,
    kamiAna: record.returnRate >= 120 ? 1 : 0,
    popularityZone: record.returnRate >= 100 ? "Bゾーン強化" : "Aゾーン過信抑制",
    jockeyTrend: `${record.course}の継続騎乗を評価`,
    trainerTrend: "厩舎仕上げと当日気配を次回補正",
    courseTrend: `${record.course}の馬場バイアスを保存`,
    distanceTrend: `${record.race}の距離適性を再評価`,
    trifectaStructure: record.trifectaPattern,
    win5Structure: record.win5Pattern
  });

  const buildLearningRecord = (input = {}) => {
    const base = { ...DEFAULT_RESULT, ...input };
    const beforeScore = toNumber(base.beforeScore, 0);
    const afterScore = toNumber(base.afterScore, beforeScore);
    const hit = Boolean(base.hit);
    const returnRate = toNumber(base.returnRate, 0);
    const record = {
      date: base.date || todayString(),
      course: base.course || "未設定競馬場",
      race: base.race || "未設定R",
      prediction: base.prediction || "事前予想未設定",
      result: base.result || "結果未入力",
      review: hit ? `的中。回収率${returnRate}%の要因を自動検証。` : `不的中。予想と結果の差分を自動検証。`,
      update: afterScore >= beforeScore ? "勝ちパターンを強化し、低回収条件を抑制。" : "過信条件を弱化し、見送り条件を追加。",
      learnedRule: `${base.course || "競馬場"} ${base.race || "レース"}: ${hit ? "的中構造を強化" : "不的中構造を抑制"}`,
      beforeScore,
      afterScore,
      hit,
      returnRate,
      trifectaPattern: base.trifectaPattern || "三連単構造未設定",
      win5Pattern: base.win5Pattern || "WIN5構造未設定",
      aiMemo: base.aiMemo || LEARNING_ITEMS.map((item) => `${item}を自動学習`).join(" / ")
    };
    return { ...record, generatedItems: buildGeneratedLearningItems(record), savedAt: new Date().toISOString() };
  };

  const buildAutomaticLearningFlow = (input = {}) => ({
    version: VERSION,
    theme: "自動学習AI",
    steps: FLOW_STEPS,
    learningItems: LEARNING_ITEMS,
    record: buildLearningRecord(input)
  });

  const saveLearningResult = ({ storage = window.localStorage, record = buildLearningRecord() } = {}) => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      const records = readJson(storage, key, []);
      writeRecords(storage, key, [record, ...records].slice(0, 300));
    });
    return record;
  };

  const applyAiUpdate = ({ storage = window.localStorage } = {}) => {
    const records = readJson(storage, STORAGE_KEYS.learning, []);
    const latest = records[0] || buildLearningRecord();
    const update = {
      version: VERSION,
      appliedAt: new Date().toISOString(),
      status: "AIアップデート反映済み",
      learnedRule: latest.learnedRule,
      afterScore: latest.afterScore
    };
    storage?.setItem?.("ai-learning-update-status", JSON.stringify(update));
    return update;
  };

  const buildLearningStatus = ({ storage = window.localStorage, today = todayString() } = {}) => {
    const records = readJson(storage, STORAGE_KEYS.learning, []);
    const hitRecords = records.filter((record) => record.hit);
    return {
      totalLearningCount: records.length,
      todayLearningCount: records.filter((record) => record.date === today).length,
      hitLearningCount: hitRecords.length,
      returnRateImprovement: records.reduce((sum, record) => sum + (toNumber(record.afterScore) - toNumber(record.beforeScore)), 0),
      dangerPopularCount: records.reduce((sum, record) => sum + toNumber(record.generatedItems?.dangerPopular, record.aiMemo?.includes("危険人気馬") ? 1 : 0), 0),
      kamiAnaCount: records.reduce((sum, record) => sum + toNumber(record.generatedItems?.kamiAna, record.aiMemo?.includes("神穴馬") ? 1 : 0), 0),
      trifectaPatternCount: new Set(records.map((record) => record.trifectaPattern).filter(Boolean)).size,
      win5PatternCount: new Set(records.map((record) => record.win5Pattern).filter(Boolean)).size
    };
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };
  const fillList = (id, items, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };

  const renderLearningStatus = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const status = buildLearningStatus({ storage });
    setText("learning-total-count", status.totalLearningCount, documentRef);
    setText("learning-today-count", status.todayLearningCount, documentRef);
    setText("learning-hit-count", status.hitLearningCount, documentRef);
    setText("learning-return-improvement", status.returnRateImprovement, documentRef);
    setText("learning-danger-count", status.dangerPopularCount, documentRef);
    setText("learning-kamiana-count", status.kamiAnaCount, documentRef);
    setText("learning-trifecta-count", status.trifectaPatternCount, documentRef);
    setText("learning-win5-count", status.win5PatternCount, documentRef);
    fillList("automatic-learning-flow", FLOW_STEPS, documentRef);
    fillList("automatic-learning-items", LEARNING_ITEMS, documentRef);
    fillList("ai-evolution-history", EVOLUTION_HISTORY, documentRef);
    return status;
  };

  const bindRaceLearningButtons = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    let currentFlow = buildAutomaticLearningFlow();
    const statusText = (value) => setText("learning-action-status", value, documentRef);
    documentRef.getElementById("run-auto-learning")?.addEventListener("click", () => {
      currentFlow = buildAutomaticLearningFlow();
      statusText("自動学習フローを生成しました");
      renderLearningStatus({ storage, documentRef });
    });
    documentRef.getElementById("save-learning-result")?.addEventListener("click", () => {
      saveLearningResult({ storage, record: currentFlow.record });
      statusText("学習結果を各DBへ保存しました");
      renderLearningStatus({ storage, documentRef });
    });
    documentRef.getElementById("apply-ai-update")?.addEventListener("click", () => {
      const update = applyAiUpdate({ storage });
      statusText(`${update.status}: ${update.learnedRule}`);
      renderLearningStatus({ storage, documentRef });
    });
    renderLearningStatus({ storage, documentRef });
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => bindRaceLearningButtons());
  }

  const api = {
    VERSION,
    STORAGE_KEYS,
    FLOW_STEPS,
    LEARNING_ITEMS,
    EVOLUTION_HISTORY,
    buildLearningRecord,
    buildAutomaticLearningFlow,
    saveLearningResult,
    applyAiUpdate,
    buildLearningStatus,
    renderLearningStatus,
    bindRaceLearningButtons
  };
  if (typeof window !== "undefined") window.HashimotoAutomaticLearningEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})();
const RACE_RELEASE_VERSION = "1.6";
const RACE_RELEASE_STATUS = "Official Release v1.6";
const RACE_RELEASE_SCORE = 101;
const RACE_DATA_STORAGE_KEY = "hashimotoRaceDataJson";
const HISTORY_DB_STORAGE_KEY = "hashimotoHistoryDbJson";
const COURSE_DB_STORAGE_KEY = "hashimotoCourseDbJson";
const DISTANCE_DB_STORAGE_KEY = "hashimotoDistanceDbJson";
const RACE_DATA_FILE_NAME = "race-data.json";
const HISTORY_DB_FILE_NAME = "history-db.json";
const COURSE_DB_FILE_NAME = "course-db.json";
const DISTANCE_DB_FILE_NAME = "distance-db.json";
const courseLabels = { tokyo: "東京", nakayama: "中山", hanshin: "阪神", chukyo: "中京", kyoto: "京都", niigata: "新潟", fukushima: "福島", kokura: "小倉", hakodate: "函館", sapporo: "札幌", win5: "WIN5" };
const historyCategories = courseLabels;
const distanceCategories = ["芝1200", "芝1400", "芝1600", "芝1800", "芝2000", "芝2400", "ダ1200", "ダ1400", "ダ1700", "ダ1800", "ダ1900"];
const raceDataFields = [{ key: "date", label: "日付", type: "date" }, { key: "distance", label: "距離", type: "select", options: distanceCategories }, { key: "prediction", label: "事前予想", type: "textarea" }, { key: "result", label: "結果", type: "textarea" }, { key: "review", label: "検証", type: "textarea" }, { key: "update", label: "アップデート", type: "textarea" }, { key: "hitRate", label: "的中率", type: "text" }, { key: "returnRate", label: "回収率", type: "text" }, { key: "trifectaReturnRate", label: "三連単回収率", type: "text" }, { key: "win5Result", label: "WIN5成績", type: "text" }, { key: "aiUpdateLog", label: "AI更新ログ", type: "textarea" }];
function setRaceText(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }
function normalizeRaceNumber(value) { const raceNumber = Number(value || 1); return Math.min(12, Math.max(1, Number.isFinite(raceNumber) ? raceNumber : 1)); }
function createEmptyRaceData() { return { version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, theme: "全競馬場統合AI", updatedAt: null, races: [] }; }
function createEmptyHistoryDb() { return { version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, theme: "全競馬場統合AI", updatedAt: null, categories: Object.values(historyCategories).reduce((categories, label) => { categories[label] = []; return categories; }, {}) }; }
function createEmptyCourseDb() { return { version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, theme: "全競馬場統合AI", updatedAt: null, courses: Object.values(courseLabels).reduce((courses, label) => { courses[label] = { learningCount: 0, learningData: [] }; return courses; }, {}) }; }
function createEmptyDistanceDb() { return { version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, theme: "全競馬場統合AI", updatedAt: null, distances: distanceCategories.reduce((distances, label) => { distances[label] = { learningCount: 0, learningData: [] }; return distances; }, {}) }; }
function readJsonFromStorage(storage, key, fallback) { if (!storage || typeof storage.getItem !== "function") return fallback(); try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : fallback(); } catch (_error) { return fallback(); } }
function readStoredRaceData(storage) { const data = readJsonFromStorage(storage, RACE_DATA_STORAGE_KEY, createEmptyRaceData); return { ...createEmptyRaceData(), ...data, races: Array.isArray(data.races) ? data.races : [] }; }
function readStoredHistoryDb(storage) { const data = readJsonFromStorage(storage, HISTORY_DB_STORAGE_KEY, createEmptyHistoryDb); return { ...createEmptyHistoryDb(), ...data, categories: { ...createEmptyHistoryDb().categories, ...(data.categories || {}) } }; }
function readStoredCourseDb(storage) { const data = readJsonFromStorage(storage, COURSE_DB_STORAGE_KEY, createEmptyCourseDb); return { ...createEmptyCourseDb(), ...data, courses: { ...createEmptyCourseDb().courses, ...(data.courses || {}) } }; }
function readStoredDistanceDb(storage) { const data = readJsonFromStorage(storage, DISTANCE_DB_STORAGE_KEY, createEmptyDistanceDb); return { ...createEmptyDistanceDb(), ...data, distances: { ...createEmptyDistanceDb().distances, ...(data.distances || {}) } }; }
function writeJsonToStorage(storage, key, data, serializer) { if (!storage || typeof storage.setItem !== "function") return; storage.setItem(key, serializer(data)); }
function buildRaceDataRecord({ courseKey, raceNumber, values, now = new Date() }) { const savedAt = now.toISOString(); return { course: courseKey, courseLabel: historyCategories[courseKey] || courseKey, race: `R${normalizeRaceNumber(raceNumber)}`, date: values.date || savedAt.slice(0, 10), distance: distanceCategories.includes(values.distance) ? values.distance : distanceCategories[0], prediction: values.prediction || "", result: values.result || "", review: values.review || "", update: values.update || "", hitRate: values.hitRate || "", returnRate: values.returnRate || "", trifectaReturnRate: values.trifectaReturnRate || "", win5Result: values.win5Result || "", aiUpdateLog: values.aiUpdateLog || "", savedAt }; }
function upsertByRaceAndDate(list, entry) { const next = Array.isArray(list) ? [...list] : []; const index = next.findIndex((item) => item.race === entry.race && item.date === entry.date); if (index >= 0) next[index] = entry; else next.push(entry); return next; }
function upsertRaceDataRecord(data, record) { const next = { ...createEmptyRaceData(), ...data, version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: record.savedAt, races: Array.isArray(data.races) ? [...data.races] : [] }; const index = next.races.findIndex((item) => item.course === record.course && item.race === record.race); if (index >= 0) next.races[index] = record; else next.races.push(record); return next; }
function buildHistoryEntry(record) { return { course: historyCategories[record.course] || record.course, race: record.race, date: record.date, distance: record.distance || distanceCategories[0], prediction: record.prediction || "", result: record.result || "", review: record.review || "", update: record.update || "", hitRate: record.hitRate || "", returnRate: record.returnRate || "", trifectaReturnRate: record.trifectaReturnRate || "", win5Result: record.win5Result || "", aiUpdateLog: record.aiUpdateLog || "", savedAt: record.savedAt }; }
function buildIntegratedLearningEntry(record) { const entry = buildHistoryEntry(record); return { course: entry.course, race: entry.race, date: entry.date, distance: entry.distance, prediction: entry.prediction, result: entry.result, review: entry.review, update: entry.update, savedAt: entry.savedAt }; }
function accumulateHistoryRecord(historyDb, record) { const category = historyCategories[record.course] || record.course; const entry = buildHistoryEntry(record); const next = { ...createEmptyHistoryDb(), ...historyDb, version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: record.savedAt, categories: { ...createEmptyHistoryDb().categories, ...(historyDb.categories || {}) } }; next.categories[category] = upsertByRaceAndDate(next.categories[category], entry); return next; }
function accumulateCourseRecord(courseDb, record) { const course = historyCategories[record.course] || record.course; const entry = buildIntegratedLearningEntry(record); const next = { ...createEmptyCourseDb(), ...courseDb, version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: record.savedAt, courses: { ...createEmptyCourseDb().courses, ...(courseDb.courses || {}) } }; const current = next.courses[course] || { learningCount: 0, learningData: [] }; const learningData = upsertByRaceAndDate(current.learningData, entry); next.courses[course] = { ...current, learningCount: learningData.length, learningData }; return next; }
function accumulateDistanceRecord(distanceDb, record) { const distance = distanceCategories.includes(record.distance) ? record.distance : distanceCategories[0]; const entry = buildIntegratedLearningEntry(record); const next = { ...createEmptyDistanceDb(), ...distanceDb, version: RACE_RELEASE_VERSION, releaseStatus: RACE_RELEASE_STATUS, updatedAt: record.savedAt, distances: { ...createEmptyDistanceDb().distances, ...(distanceDb.distances || {}) } }; const current = next.distances[distance] || { learningCount: 0, learningData: [] }; const learningData = upsertByRaceAndDate(current.learningData, entry); next.distances[distance] = { ...current, learningCount: learningData.length, learningData }; return next; }
function accumulateIntegratedDatabases({ historyDb, courseDb, distanceDb, record }) { return { historyDb: accumulateHistoryRecord(historyDb, record), courseDb: accumulateCourseRecord(courseDb, record), distanceDb: accumulateDistanceRecord(distanceDb, record) }; }
function findRaceRecord(data, courseKey, raceNumber) { const race = `R${normalizeRaceNumber(raceNumber)}`; return (data.races || []).find((item) => item.course === courseKey && item.race === race) || null; }
function serializeRaceData(data) { return `${JSON.stringify(data, null, 2)}\n`; }
function serializeHistoryDb(data) { return `${JSON.stringify(data, null, 2)}\n`; }
function serializeCourseDb(data) { return `${JSON.stringify(data, null, 2)}\n`; }
function serializeDistanceDb(data) { return `${JSON.stringify(data, null, 2)}\n`; }
function renderFieldEditors(record) { const target = document.getElementById("race-data-fields"); if (!target) return; target.innerHTML = raceDataFields.map((field) => { const value = record ? record[field.key] || "" : ""; if (field.type === "textarea") return `<label class="race-data-field" for="race-${field.key}"><span>${field.label}</span><textarea id="race-${field.key}" data-race-field="${field.key}" rows="6">${value}</textarea></label>`; if (field.type === "select") return `<label class="race-data-field compact" for="race-${field.key}"><span>${field.label}</span><select id="race-${field.key}" data-race-field="${field.key}">${field.options.map((option) => `<option value="${option}"${option === value ? " selected" : ""}>${option}</option>`).join("")}</select></label>`; return `<label class="race-data-field compact" for="race-${field.key}"><span>${field.label}</span><input id="race-${field.key}" type="${field.type}" data-race-field="${field.key}" value="${value}"></label>`; }).join(""); }
function readFormValues() { return raceDataFields.reduce((values, field) => { const element = document.querySelector(`[data-race-field="${field.key}"]`); values[field.key] = element ? element.value.trim() : ""; return values; }, {}); }
function downloadJson(data, fileName, serializer) { if (typeof Blob === "undefined" || typeof URL === "undefined" || typeof document === "undefined") return; const blob = new Blob([serializer(data)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
async function saveJsonFile(data, fileName, serializer) { downloadJson(data, fileName, serializer); }
function bootRaceManagementPage() { const params = new URLSearchParams(window.location.search); const courseKey = params.get("course") || "tokyo"; const safeRaceNumber = normalizeRaceNumber(params.get("race") || 1); const courseLabel = courseLabels[courseKey] || courseLabels.tokyo; const title = `${courseLabel}版AI Console R${safeRaceNumber}`; const storage = window.localStorage; const existingData = readStoredRaceData(storage); const existingRecord = findRaceRecord(existingData, courseKey, safeRaceNumber); document.title = `橋本競馬AI Version ${RACE_RELEASE_VERSION} / ${title}`; setRaceText("official-banner-title", `橋本競馬AI ${RACE_RELEASE_STATUS}`); setRaceText("race-heading", title); setRaceText("race-title", title); setRaceText("race-subtitle", `${title} / history-db.json → course-db.json / distance-db.json`); setRaceText("race-version", `橋本競馬AI Version ${RACE_RELEASE_VERSION}`); setRaceText("race-status", RACE_RELEASE_STATUS); setRaceText("race-score", `Release Score ${RACE_RELEASE_SCORE}`); setRaceText("race-file-name", `${RACE_DATA_FILE_NAME} / ${HISTORY_DB_FILE_NAME} / ${COURSE_DB_FILE_NAME} / ${DISTANCE_DB_FILE_NAME}`); setRaceText("back-console-link", `${courseLabel}版AI Consoleへ戻る`); const backLink = document.getElementById("back-console-link"); if (backLink) backLink.href = `${courseKey}-console.html`; renderFieldEditors(existingRecord); const saveButton = document.getElementById("race-data-save"); const historyButton = document.getElementById("history-db-save"); const saveStatus = document.getElementById("race-save-status"); function saveCurrentRaceData(now = new Date()) { const current = readStoredRaceData(storage); const record = buildRaceDataRecord({ courseKey, raceNumber: safeRaceNumber, values: readFormValues(), now }); const next = upsertRaceDataRecord(current, record); writeJsonToStorage(storage, RACE_DATA_STORAGE_KEY, next, serializeRaceData); return { next, record }; } if (saveButton) saveButton.addEventListener("click", async () => { const { next, record } = saveCurrentRaceData(); if (saveStatus) saveStatus.textContent = `${record.race} を ${RACE_DATA_FILE_NAME} に保存しました`; await saveJsonFile(next, RACE_DATA_FILE_NAME, serializeRaceData); }); if (historyButton) historyButton.addEventListener("click", async () => { const { record } = saveCurrentRaceData(); const integrated = accumulateIntegratedDatabases({ historyDb: readStoredHistoryDb(storage), courseDb: readStoredCourseDb(storage), distanceDb: readStoredDistanceDb(storage), record }); writeJsonToStorage(storage, HISTORY_DB_STORAGE_KEY, integrated.historyDb, serializeHistoryDb); writeJsonToStorage(storage, COURSE_DB_STORAGE_KEY, integrated.courseDb, serializeCourseDb); writeJsonToStorage(storage, DISTANCE_DB_STORAGE_KEY, integrated.distanceDb, serializeDistanceDb); if (saveStatus) saveStatus.textContent = `${record.race} を history-db / course-db / distance-db へ蓄積しました`; await saveJsonFile(integrated.historyDb, HISTORY_DB_FILE_NAME, serializeHistoryDb); }); }
if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootRaceManagementPage);
if (typeof module !== "undefined") module.exports = { ...module.exports, COURSE_DB_FILE_NAME, COURSE_DB_STORAGE_KEY, DISTANCE_DB_FILE_NAME, DISTANCE_DB_STORAGE_KEY, HISTORY_DB_FILE_NAME, HISTORY_DB_STORAGE_KEY, RACE_DATA_FILE_NAME, RACE_DATA_STORAGE_KEY, accumulateCourseRecord, accumulateDistanceRecord, accumulateHistoryRecord, accumulateIntegratedDatabases, buildHistoryEntry, buildIntegratedLearningEntry, buildRaceDataRecord, courseLabels, createEmptyCourseDb, createEmptyDistanceDb, createEmptyHistoryDb, createEmptyRaceData, distanceCategories, historyCategories, normalizeRaceNumber, serializeCourseDb, serializeDistanceDb, serializeHistoryDb, serializeRaceData, upsertRaceDataRecord };
