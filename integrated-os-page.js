(() => {
  const VERSION = "2.6";
  const STORAGE_KEY = "integrated-os.json";
  const COURSES = ["東京", "中山", "阪神", "京都", "中京", "新潟", "福島", "小倉", "函館", "札幌", "WIN5"];
  const FLOW_STEPS = [
    "history-db",
    "learning-engine",
    "prediction-engine",
    "course-db",
    "distance-db",
    "profit-db",
    "return-ai-db",
    "integrated-os",
    "最終予想"
  ];
  const MANAGEMENT_ITEMS = ["競馬場切替", "距離別分析", "コース別分析", "人気ゾーン分析", "騎手分析", "調教師分析", "三連単分析", "WIN5分析"];
  const EVOLUTION_HISTORY = [
    "v1.0 基本版",
    "v1.1 Console化",
    "v1.2 競馬場メニュー",
    "v1.2.1 レイアウト整理",
    "v1.3 R1〜R12管理",
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
  const DEFAULT_RECORD = Object.freeze({
    date: "2026-06-14",
    course: "東京",
    distance: "芝1600",
    condition: "良",
    prediction: "統合OS最終予想",
    result: "サンプル結果",
    review: "予想生成AIと自動学習AIを統合レビュー",
    update: "競馬場・距離・人気ゾーン補正を統合更新",
    learning: "v2.0統合OS学習",
    profit: 18000,
    returnRate: 205,
    dangerHorse: "危険人気馬サンプル",
    darkHorse: "神穴馬サンプル",
    axisHorse: "本命馬サンプル",
    trifectaPattern: "A→B→C",
    win5Pattern: "固定A",
    confidence: 94,
    aiScore: 111,
    memo: "全競馬場共通OSで最終予想を統合管理"
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
  const round = (value, digits = 1) => Math.round(toNumber(value) * (10 ** digits)) / (10 ** digits);
  const average = (values) => values.length ? values.reduce((sum, value) => sum + toNumber(value), 0) / values.length : 0;

  const buildIntegratedRecord = (input = {}) => ({ ...DEFAULT_RECORD, ...input, generatedAt: new Date().toISOString() });
  const buildIntegratedFlow = (input = {}) => ({
    version: VERSION,
    theme: "橋本競馬AI統合OS",
    courses: COURSES,
    managementItems: MANAGEMENT_ITEMS,
    flow: FLOW_STEPS,
    record: buildIntegratedRecord(input)
  });
  const saveIntegratedRecord = ({ storage = window.localStorage, record = buildIntegratedRecord() } = {}) => {
    const records = readRecords(storage, STORAGE_KEY, []);
    writeRecords(storage, STORAGE_KEY, [record, ...records].slice(0, 300));
    return record;
  };
  const buildIntegratedStatus = ({ storage = window.localStorage } = {}) => {
    const integrated = readRecords(storage, STORAGE_KEY, []);
    const learning = readRecords(storage, "learning-engine.json", []);
    const predictions = readRecords(storage, "prediction-engine.json", []);
    const all = [...integrated, ...predictions, ...learning];
    return {
      totalLearning: learning.length,
      totalPredictions: predictions.length || integrated.length,
      returnRate: all.length ? round(average(all.map((record) => record.returnRate))) : 0,
      aiConfidence: all.length ? round(average(all.map((record) => record.confidence || record.aiScore || record.afterScore))) : 0,
      dangerHorseCount: all.filter((record) => record.dangerHorse).length,
      darkHorseCount: all.filter((record) => record.darkHorse).length,
      trifectaPatternCount: new Set(all.map((record) => record.trifectaPattern).filter(Boolean)).size,
      win5PatternCount: new Set(all.map((record) => record.win5Pattern).filter(Boolean)).size
    };
  };
  const buildRankings = ({ storage = window.localStorage } = {}) => {
    const records = readRecords(storage, STORAGE_KEY, []);
    const source = records.length ? records : COURSES.filter((course) => course !== "WIN5").map((course, index) => buildIntegratedRecord({ course, returnRate: 180 - index * 4, jockey: `${course}騎手`, trainer: `${course}調教師` }));
    const courseRanking = source.slice().sort((a, b) => toNumber(b.returnRate) - toNumber(a.returnRate)).map((record) => `${record.course} ${record.returnRate}%`);
    const countBy = (field) => Object.entries(source.reduce((acc, record) => {
      const label = record[field] || `${record.course}${field === "jockey" ? "騎手" : "調教師"}`;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1]).map(([label, count]) => `${label} ${count}件`);
    return { courseRanking, jockeyRanking: countBy("jockey"), trainerRanking: countBy("trainer") };
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };
  const fillList = (id, items, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };
  const renderIntegratedOs = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const status = buildIntegratedStatus({ storage });
    setText("integrated-total-learning", status.totalLearning, documentRef);
    setText("integrated-total-predictions", status.totalPredictions, documentRef);
    setText("integrated-return-rate", `${status.returnRate}%`, documentRef);
    setText("integrated-ai-confidence", status.aiConfidence, documentRef);
    setText("integrated-danger-count", status.dangerHorseCount, documentRef);
    setText("integrated-dark-count", status.darkHorseCount, documentRef);
    setText("integrated-trifecta-count", status.trifectaPatternCount, documentRef);
    setText("integrated-win5-count", status.win5PatternCount, documentRef);
    fillList("integrated-course-list", COURSES, documentRef);
    fillList("integrated-management-list", MANAGEMENT_ITEMS, documentRef);
    fillList("integrated-flow-list", FLOW_STEPS, documentRef);
    fillList("integrated-evolution-history", EVOLUTION_HISTORY, documentRef);
    const rankings = buildRankings({ storage });
    fillList("integrated-course-ranking", rankings.courseRanking, documentRef);
    fillList("integrated-jockey-ranking", rankings.jockeyRanking, documentRef);
    fillList("integrated-trainer-ranking", rankings.trainerRanking, documentRef);
    return status;
  };
  const bindIntegratedOs = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    documentRef.getElementById("run-integrated-os")?.addEventListener("click", () => {
      saveIntegratedRecord({ storage, record: buildIntegratedFlow().record });
      setText("integrated-action-status", "橋本競馬AI統合OSで全競馬場を統合管理しました", documentRef);
      renderIntegratedOs({ storage, documentRef });
    });
    renderIntegratedOs({ storage, documentRef });
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindIntegratedOs());
  const api = { VERSION, STORAGE_KEY, COURSES, FLOW_STEPS, MANAGEMENT_ITEMS, EVOLUTION_HISTORY, buildIntegratedRecord, buildIntegratedFlow, saveIntegratedRecord, buildIntegratedStatus, buildRankings, renderIntegratedOs, bindIntegratedOs };
  if (typeof window !== "undefined") window.HashimotoIntegratedOs = api;
  if (typeof module !== "undefined") module.exports = api;
})();
