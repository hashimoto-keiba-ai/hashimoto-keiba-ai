(() => {
  const VERSION = "3.0";
  const ENGINE_NAME = "Future Prediction Engine";
  const PHASE = "Phase16-3";
  const STABLE_BASE = "Official Release v2.8";
  const STORAGE_KEYS = Object.freeze({
    future: "future-prediction-db.json",
    pattern: "future-pattern-db.json",
    win5: "future-win5-db.json",
    profit: "future-profit-db.json"
  });
  const SOURCE_KEYS = Object.freeze({
    course: "course-research-db.json",
    distance: "distance-db.json",
    jockey: "jockey-research-db.json",
    trainer: "trainer-research-db.json",
    darkHorse: "darkhorse-db.json",
    trifecta: "trifecta-pattern-db.json",
    win5: "win5-db.json",
    bankroll: "bankroll-db.json",
    profit: "profit-db.json",
    returnAi: "return-ai-db.json",
    history: "history-db.json",
    learning: "learning-engine.json"
  });
  const FORECAST_TARGETS = ["競馬場傾向予測", "距離傾向予測", "好調騎手予測", "人気飛び予測", "回収率予測", "WIN5成功率予測", "三連単成功率予測", "神穴候補予測"];
  const PRESERVED_ENGINES = ["researchLabEngine", "selfEvolutionEngine", "secretaryEngine", "win5Engine", "profitEngine", "Super Self Evolution Engine", "Full Auto Learning Engine"];

  const DEFAULT_FORECAST = Object.freeze({
    date: "2026-06-16",
    course: "東京",
    distance: "芝1600",
    hotJockey: "研究騎手A",
    favoriteFailure: "Aゾーン過信注意",
    returnRate: 328,
    win5SuccessRate: 38,
    trifectaSuccessRate: 42,
    darkHorseCandidate: "Cゾーン差し込み神穴",
    confidence: 94,
    pattern: "Cゾーン差し込み+A→B→C"
  });

  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const readRecords = (storage, key, fallback = []) => {
    const raw = storage?.getItem?.(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.records)) return parsed.records;
    return fallback;
  };
  const writeRecords = (storage, key, records) => {
    storage?.setItem?.(key, JSON.stringify({ version: VERSION, phase: PHASE, engine: ENGINE_NAME, storageKey: key, stableBase: STABLE_BASE, records }, null, 2));
    return records;
  };
  const latest = (records, fallback = DEFAULT_FORECAST) => records.find(Boolean) || fallback;

  const buildFutureContext = ({ storage } = {}) => {
    const sources = Object.fromEntries(Object.entries(SOURCE_KEYS).map(([name, key]) => [name, latest(readRecords(storage, key, []))]));
    return {
      sources,
      sourceCounts: Object.fromEntries(Object.entries(SOURCE_KEYS).map(([name, key]) => [name, readRecords(storage, key, []).length]))
    };
  };

  const predictCourseTrend = (context) => {
    const course = context.sources.course.course || context.sources.profit.course || DEFAULT_FORECAST.course;
    const returnRate = toNumber(context.sources.course.returnRate ?? context.sources.profit.returnRate, DEFAULT_FORECAST.returnRate);
    return { target: "競馬場傾向予測", course, trend: `${course}は回収率${returnRate}%条件を未来強化`, returnRate };
  };

  const predictDistanceTrend = (context) => {
    const distance = context.sources.distance.distance || context.sources.course.bestDistance || DEFAULT_FORECAST.distance;
    return { target: "距離傾向予測", distance, trend: `${distance}は差し込み・Cゾーン警戒を継続` };
  };

  const predictHotJockey = (context) => {
    const jockey = context.sources.jockey.jockey || DEFAULT_FORECAST.hotJockey;
    const returnRate = toNumber(context.sources.jockey.returnRate, 180);
    return { target: "好調騎手予測", jockey, trend: `${jockey}は回収率${returnRate}%で好調予測`, returnRate };
  };

  const predictFavoriteFailure = (context) => {
    const memo = context.sources.trifecta.memo || context.sources.history.memo || DEFAULT_FORECAST.favoriteFailure;
    return { target: "人気飛び予測", warning: memo.includes("A") ? "Aゾーン過信注意" : DEFAULT_FORECAST.favoriteFailure };
  };

  const predictReturnRate = (context) => {
    const values = [context.sources.profit.returnRate, context.sources.returnAi.returnRate, context.sources.course.returnRate, context.sources.jockey.returnRate].map((value) => toNumber(value)).filter(Boolean);
    const forecast = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : DEFAULT_FORECAST.returnRate;
    return { target: "回収率予測", forecast };
  };

  const predictWin5Success = (context) => {
    const hitRate = toNumber(context.sources.win5.hitRate, DEFAULT_FORECAST.win5SuccessRate);
    const expectedPayout = toNumber(context.sources.win5.expectedPayout, 1000000);
    return { target: "WIN5成功率予測", successRate: Math.min(99, Math.max(1, hitRate)), expectedPayout };
  };

  const predictTrifectaSuccess = (context) => {
    const returnRate = toNumber(context.sources.trifecta.returnRate, 240);
    return { target: "三連単成功率予測", successRate: Math.min(95, Math.max(20, Math.round(returnRate / 6))), pattern: context.sources.trifecta.pattern || DEFAULT_FORECAST.pattern };
  };

  const predictDarkHorse = (context) => {
    const horse = context.sources.darkHorse.horse || context.sources.darkHorse.darkHorsePattern || DEFAULT_FORECAST.darkHorseCandidate;
    return { target: "神穴候補予測", darkHorseCandidate: horse, confidence: toNumber(context.sources.darkHorse.confidence, DEFAULT_FORECAST.confidence) };
  };

  const buildFuturePredictionRecord = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const context = buildFutureContext({ storage });
    const courseTrend = predictCourseTrend(context);
    const distanceTrend = predictDistanceTrend(context);
    const hotJockey = predictHotJockey(context);
    const favoriteFailure = predictFavoriteFailure(context);
    const returnRate = predictReturnRate(context);
    const win5 = predictWin5Success(context);
    const trifecta = predictTrifectaSuccess(context);
    const darkHorse = predictDarkHorse(context);
    return {
      date: DEFAULT_FORECAST.date,
      phase: PHASE,
      engine: ENGINE_NAME,
      stableBase: STABLE_BASE,
      courseTrend,
      distanceTrend,
      hotJockey,
      favoriteFailure,
      returnRateForecast: returnRate.forecast,
      win5SuccessRate: win5.successRate,
      trifectaSuccessRate: trifecta.successRate,
      darkHorseCandidate: darkHorse.darkHorseCandidate,
      confidence: Math.round((DEFAULT_FORECAST.confidence + darkHorse.confidence) / 2),
      forecasts: { courseTrend, distanceTrend, hotJockey, favoriteFailure, returnRate, win5, trifecta, darkHorse },
      memo: "Future Prediction Engine が競馬場・距離・騎手・人気飛び・回収率・WIN5・三連単・神穴を予測"
    };
  };

  const buildFuturePredictionEngine = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const record = buildFuturePredictionRecord({ storage });
    return {
      version: VERSION,
      phase: PHASE,
      engine: ENGINE_NAME,
      stableBase: STABLE_BASE,
      preservedEngines: PRESERVED_ENGINES,
      forecastTargets: FORECAST_TARGETS,
      storageKeys: STORAGE_KEYS,
      sourceKeys: SOURCE_KEYS,
      record,
      statusLabel: `${ENGINE_NAME}: ${FORECAST_TARGETS.join(" / ")} 稼働`
    };
  };

  const saveFuturePrediction = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const engine = buildFuturePredictionEngine({ storage });
    const record = engine.record;
    writeRecords(storage, STORAGE_KEYS.future, [record, ...readRecords(storage, STORAGE_KEYS.future, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.pattern, [{ pattern: record.forecasts.trifecta.pattern, course: record.courseTrend.course, distance: record.distanceTrend.distance, popularZone: "C", trifectaPattern: record.forecasts.trifecta.pattern, darkHorsePattern: record.darkHorseCandidate, successRate: record.trifectaSuccessRate, confidence: record.confidence, memo: record.memo }, ...readRecords(storage, STORAGE_KEYS.pattern, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.win5, [{ date: record.date, win5Pattern: "A固定+B本線+C狙い", safeRate: 55, balanceRate: 42, highPayoutRate: 28, successRate: record.win5SuccessRate, expectedPayout: record.forecasts.win5.expectedPayout, memo: record.memo }, ...readRecords(storage, STORAGE_KEYS.win5, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.profit, [{ date: record.date, course: record.courseTrend.course, distance: record.distanceTrend.distance, returnRateForecast: record.returnRateForecast, roiForecast: record.returnRateForecast, profitScore: record.confidence, bankrollImpact: "+6%", memo: record.memo }, ...readRecords(storage, STORAGE_KEYS.profit, [])].slice(0, 300));
    return engine;
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };

  const renderFuturePrediction = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const engine = buildFuturePredictionEngine({ storage });
    setText("phase16-future-prediction-status", engine.statusLabel, documentRef);
    setText("phase16-future-prediction-summary", `${engine.record.courseTrend.trend} / WIN5成功率${engine.record.win5SuccessRate}% / 三連単成功率${engine.record.trifectaSuccessRate}%`, documentRef);
    return engine;
  };

  const bindFuturePrediction = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    renderFuturePrediction({ storage, documentRef });
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindFuturePrediction());
  const api = { VERSION, ENGINE_NAME, PHASE, STABLE_BASE, STORAGE_KEYS, SOURCE_KEYS, FORECAST_TARGETS, PRESERVED_ENGINES, buildFutureContext, predictCourseTrend, predictDistanceTrend, predictHotJockey, predictFavoriteFailure, predictReturnRate, predictWin5Success, predictTrifectaSuccess, predictDarkHorse, buildFuturePredictionRecord, buildFuturePredictionEngine, saveFuturePrediction, renderFuturePrediction, bindFuturePrediction };
  if (typeof window !== "undefined") window.HashimotoFuturePrediction = api;
  if (typeof module !== "undefined") module.exports = api;
})();
