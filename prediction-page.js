(() => {
  const VERSION = "2.8";
  const STORAGE_KEY = "prediction-engine.json";
  const SOURCE_KEYS = [
    "history-db.json",
    "learning-engine.json",
    "course-db.json",
    "distance-db.json",
    "profit-db.json",
    "return-ai-db.json",
    "騎手AI",
    "調教師AI",
    "人気ゾーンAI",
    "危険人気馬AI",
    "神穴馬AI",
    "三連単構造AI",
    "WIN5構造AI",
    "prediction-engine",
    "最終予想生成"
  ];
  const MARKS = ["◎", "○", "▲", "△", "☆", "🤫観測馬"];
  const POPULAR_ZONES = {
    A: "1〜3人気",
    B: "4〜6人気",
    C: "7〜10人気",
    D: "11人気以下"
  };
  const TRIFECTA_STRUCTURES = ["A→A→B", "A→B→C", "B→C→A", "B→C→C", "C→D→B"];
  const WIN5_STRUCTURES = ["固定A", "本線B", "狙いC", "爆穴D"];
  const DEFAULT_INPUT = Object.freeze({
    date: "2026-06-14",
    course: "東京競馬場",
    race: "11R",
    distance: "芝1600",
    condition: "良",
    jockeyScore: 88,
    trainerScore: 84,
    courseScore: 91,
    distanceScore: 86,
    profitScore: 93,
    returnScore: 112,
    dangerHorse: "過剰人気サンプル",
    darkHorse: "神穴サンプル",
    axisHorse: "本命サンプル"
  });

  const readRecords = (storage, key, fallback = []) => {
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
  const average = (values) => values.length ? values.reduce((sum, value) => sum + toNumber(value), 0) / values.length : 0;
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);

  const classifyPopularZone = (popularity = 1) => {
    const value = toNumber(popularity, 1);
    if (value <= 3) return "A";
    if (value <= 6) return "B";
    if (value <= 10) return "C";
    return "D";
  };

  const buildPredictionRecord = (input = {}) => {
    const base = { ...DEFAULT_INPUT, ...input };
    const popularZone = base.popularZone || classifyPopularZone(base.popularity || 2);
    const confidence = round(average([base.jockeyScore, base.trainerScore, base.courseScore, base.distanceScore, base.profitScore, base.returnScore]), 1);
    return {
      date: base.date,
      course: base.course,
      race: base.race,
      distance: base.distance,
      condition: base.condition,
      popularZone,
      jockeyScore: toNumber(base.jockeyScore),
      trainerScore: toNumber(base.trainerScore),
      courseScore: toNumber(base.courseScore),
      distanceScore: toNumber(base.distanceScore),
      profitScore: toNumber(base.profitScore),
      returnScore: toNumber(base.returnScore),
      dangerHorse: base.dangerHorse,
      darkHorse: base.darkHorse,
      axisHorse: base.axisHorse,
      trifectaPattern: base.trifectaPattern || TRIFECTA_STRUCTURES[1],
      win5Pattern: base.win5Pattern || WIN5_STRUCTURES[0],
      predictionRank: base.predictionRank || MARKS.map((mark, index) => ({ mark, horse: base[`${index}Horse`] || `${mark}候補`, score: round(confidence - index * 3, 1) })),
      confidence,
      memo: base.memo || `人気ゾーン${popularZone}(${POPULAR_ZONES[popularZone]})を基準に予想生成AIが最終予想を作成。`,
      hit: Boolean(base.hit),
      returnRate: toNumber(base.returnRate, base.returnScore),
      jockey: base.jockey || "好調騎手AI",
      trainer: base.trainer || "好調調教師AI",
      generatedAt: new Date().toISOString()
    };
  };

  const buildPredictionFlow = (input = {}) => ({
    version: VERSION,
    theme: "予想生成AI",
    flow: SOURCE_KEYS,
    marks: MARKS,
    popularZones: POPULAR_ZONES,
    trifectaStructures: TRIFECTA_STRUCTURES,
    win5Structures: WIN5_STRUCTURES,
    record: buildPredictionRecord(input)
  });

  const savePrediction = ({ storage = window.localStorage, record = buildPredictionRecord() } = {}) => {
    const records = readRecords(storage, STORAGE_KEY, []);
    writeRecords(storage, STORAGE_KEY, [record, ...records].slice(0, 300));
    return record;
  };

  const buildPredictionStatus = ({ storage = window.localStorage } = {}) => {
    const records = readRecords(storage, STORAGE_KEY, []);
    const total = records.length;
    const hitRecords = records.filter((record) => record.hit);
    const dangerCount = records.filter((record) => record.dangerHorse).length;
    const darkCount = records.filter((record) => record.darkHorse).length;
    return {
      totalPredictions: total,
      axisHitRate: total ? round((hitRecords.filter((record) => record.axisHorse).length / total) * 100, 1) : 0,
      dangerDetectionRate: total ? round((dangerCount / total) * 100, 1) : 0,
      darkHorseDetectionRate: total ? round((darkCount / total) * 100, 1) : 0,
      trifectaSuccessRate: total ? round((records.filter((record) => /A|B|C|D/.test(record.trifectaPattern || "")).length / total) * 100, 1) : 0,
      win5SuccessRate: total ? round((records.filter((record) => /固定|本線|狙い|爆穴/.test(record.win5Pattern || "")).length / total) * 100, 1) : 0,
      averageReturnRate: total ? round(average(records.map((record) => record.returnRate)), 1) : 0,
      aiConfidence: total ? round(average(records.map((record) => record.confidence)), 1) : 0
    };
  };

  const buildPredictionHistoryCards = ({ storage = window.localStorage } = {}) => {
    const records = readRecords(storage, STORAGE_KEY, []);
    const byReturn = records.slice().sort((a, b) => toNumber(b.returnRate) - toNumber(a.returnRate));
    const countBy = (field) => Object.entries(records.reduce((acc, record) => {
      const label = record[field] || "未設定";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1]).map(([label, count]) => `${label} ${count}件`);
    return {
      latest: records.slice(0, 5).map((record) => `${record.date} ${record.course}${record.race} ${record.axisHorse}`),
      hits: records.filter((record) => record.hit).slice(0, 5).map((record) => `${record.course}${record.race} 回収率${record.returnRate}%`),
      returnRanking: byReturn.slice(0, 5).map((record) => `${record.course}${record.race} ${record.returnRate}%`),
      jockeyRanking: countBy("jockey").slice(0, 5),
      trainerRanking: countBy("trainer").slice(0, 5)
    };
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };
  const fillList = (id, items, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.innerHTML = items.length ? items.map((item) => `<li>${item}</li>`).join("") : '<li class="empty-state">予想データ待ち</li>';
  };

  const renderPredictionStatus = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const status = buildPredictionStatus({ storage });
    setText("prediction-total-count", status.totalPredictions, documentRef);
    setText("prediction-axis-hit-rate", `${status.axisHitRate}%`, documentRef);
    setText("prediction-danger-rate", `${status.dangerDetectionRate}%`, documentRef);
    setText("prediction-dark-rate", `${status.darkHorseDetectionRate}%`, documentRef);
    setText("prediction-trifecta-rate", `${status.trifectaSuccessRate}%`, documentRef);
    setText("prediction-win5-rate", `${status.win5SuccessRate}%`, documentRef);
    setText("prediction-average-return", `${status.averageReturnRate}%`, documentRef);
    setText("prediction-ai-confidence", status.aiConfidence, documentRef);
    fillList("prediction-flow-list", SOURCE_KEYS, documentRef);
    fillList("prediction-mark-list", MARKS, documentRef);
    fillList("prediction-popular-zone-list", Object.entries(POPULAR_ZONES).map(([key, value]) => `${key}＝${value}`), documentRef);
    fillList("prediction-trifecta-structure-list", TRIFECTA_STRUCTURES, documentRef);
    fillList("prediction-win5-structure-list", WIN5_STRUCTURES, documentRef);
    const cards = buildPredictionHistoryCards({ storage });
    fillList("prediction-latest-list", cards.latest, documentRef);
    fillList("prediction-hit-list", cards.hits, documentRef);
    fillList("prediction-return-ranking", cards.returnRanking, documentRef);
    fillList("prediction-jockey-ranking", cards.jockeyRanking, documentRef);
    fillList("prediction-trainer-ranking", cards.trainerRanking, documentRef);
    return status;
  };

  const bindPredictionButtons = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    let currentFlow = buildPredictionFlow();
    const statusText = (value) => setText("prediction-action-status", value, documentRef);
    const setRecord = (patch, message) => {
      currentFlow = buildPredictionFlow({ ...currentFlow.record, ...patch });
      statusText(message);
      renderPredictionStatus({ storage, documentRef });
    };
    documentRef.getElementById("generate-prediction")?.addEventListener("click", () => setRecord({}, "予想生成AIが最終予想を生成しました"));
    documentRef.getElementById("generate-axis-horse")?.addEventListener("click", () => setRecord({ axisHorse: "◎本命馬" }, "本命馬を生成しました"));
    documentRef.getElementById("judge-danger-horse")?.addEventListener("click", () => setRecord({ dangerHorse: "危険人気馬" }, "危険人気馬を判定しました"));
    documentRef.getElementById("judge-dark-horse")?.addEventListener("click", () => setRecord({ darkHorse: "☆神穴馬" }, "神穴馬を判定しました"));
    documentRef.getElementById("generate-trifecta")?.addEventListener("click", () => setRecord({ trifectaPattern: TRIFECTA_STRUCTURES[2] }, "三連単構造を生成しました"));
    documentRef.getElementById("generate-win5")?.addEventListener("click", () => setRecord({ win5Pattern: WIN5_STRUCTURES[2] }, "WIN5構造を生成しました"));
    documentRef.getElementById("save-prediction")?.addEventListener("click", () => {
      savePrediction({ storage, record: currentFlow.record });
      statusText("prediction-engine.jsonへ予想を保存しました");
      renderPredictionStatus({ storage, documentRef });
    });
    renderPredictionStatus({ storage, documentRef });
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => bindPredictionButtons());
  }

  const api = {
    VERSION,
    STORAGE_KEY,
    SOURCE_KEYS,
    MARKS,
    POPULAR_ZONES,
    TRIFECTA_STRUCTURES,
    WIN5_STRUCTURES,
    classifyPopularZone,
    buildPredictionRecord,
    buildPredictionFlow,
    savePrediction,
    buildPredictionStatus,
    buildPredictionHistoryCards,
    renderPredictionStatus,
    bindPredictionButtons
  };
  if (typeof window !== "undefined") window.HashimotoPredictionEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})();
