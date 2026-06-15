(() => {
  const VERSION = "2.7";
  const STORAGE_KEYS = {
    profit: "profit-db.json",
    darkhorse: "darkhorse-db.json",
    popularZone: "popular-zone-db.json",
    trifectaPattern: "trifecta-pattern-db.json"
  };
  const SOURCE_KEYS = ["integrated-os.json", "prediction-engine.json", "learning-engine.json", "ai-secretary-db.json", "history-db.json", "return-ai-db.json"];
  const DEFAULT_CANDIDATE = Object.freeze({
    date: "2026-06-15",
    course: "東京競馬場",
    race: "11R",
    distance: "芝1600",
    condition: "良",
    pace: "ハイペース",
    popularZone: "C",
    dangerHorse: "危険1人気サンプル",
    darkHorse: "神穴サンプル",
    longshotHorse: "大穴サンプル",
    lowPopularRunner: "低人気激走サンプル",
    axisHorse: "本命サンプル",
    trifectaPattern: "A→B→C",
    returnRate: 320,
    profitScore: 112,
    memo: "万馬券探索AIが危険1人気と神穴を組み合わせて候補生成。"
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
    storage?.setItem?.(key, JSON.stringify({ version: VERSION, storageKey: key, linkedSources: SOURCE_KEYS, records }, null, 2));
    return records;
  };
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "") || "--";
  const sourceRecord = (storage) => SOURCE_KEYS.flatMap((key) => readRecords(storage, key, [])).find(Boolean) || {};
  const buildProfitCandidate = ({ storage = window.localStorage, input = {} } = {}) => {
    const source = sourceRecord(storage);
    return {
      date: first(input.date, source.date, DEFAULT_CANDIDATE.date),
      course: first(input.course, source.course, DEFAULT_CANDIDATE.course),
      race: first(input.race, source.race, DEFAULT_CANDIDATE.race),
      distance: first(input.distance, source.distance, DEFAULT_CANDIDATE.distance),
      condition: first(input.condition, source.condition, DEFAULT_CANDIDATE.condition),
      pace: first(input.pace, source.pace, DEFAULT_CANDIDATE.pace),
      popularZone: first(input.popularZone, source.popularZone, DEFAULT_CANDIDATE.popularZone),
      dangerHorse: first(input.dangerHorse, source.dangerHorse, DEFAULT_CANDIDATE.dangerHorse),
      darkHorse: first(input.darkHorse, source.darkHorse, DEFAULT_CANDIDATE.darkHorse),
      longshotHorse: first(input.longshotHorse, source.longshotHorse, DEFAULT_CANDIDATE.longshotHorse),
      lowPopularRunner: first(input.lowPopularRunner, source.lowPopularRunner, DEFAULT_CANDIDATE.lowPopularRunner),
      axisHorse: first(input.axisHorse, source.axisHorse, DEFAULT_CANDIDATE.axisHorse),
      trifectaPattern: first(input.trifectaPattern, source.trifectaPattern, DEFAULT_CANDIDATE.trifectaPattern),
      returnRate: toNumber(first(input.returnRate, source.returnRate, DEFAULT_CANDIDATE.returnRate)),
      profitScore: toNumber(first(input.profitScore, source.profitScore, source.aiScore, DEFAULT_CANDIDATE.profitScore)),
      memo: first(input.memo, source.memo, DEFAULT_CANDIDATE.memo),
      linkedSources: SOURCE_KEYS,
      generatedAt: new Date().toISOString()
    };
  };
  const judgeDangerFavorite = (candidate) => candidate.dangerHorse;
  const judgeDarkHorse = (candidate) => candidate.darkHorse;
  const judgeLongshot = (candidate) => candidate.longshotHorse;
  const judgeLowPopularRunner = (candidate) => candidate.lowPopularRunner;
  const analyzePopularZone = (candidate) => ({ Azone: "1〜3人気", Bzone: "4〜6人気", Czone: candidate.popularZone, Dzone: "11人気以下", successRate: 62, averageReturn: candidate.returnRate });
  const analyzeTrifectaPattern = (candidate) => ({ pattern: candidate.trifectaPattern, hitCount: 1, returnRate: candidate.returnRate, memo: candidate.memo });
  const calculateExpectedReturn = (candidate) => Math.round((toNumber(candidate.returnRate) * 0.72) + (toNumber(candidate.profitScore) * 0.58));
  const generateProfitCandidate = (options = {}) => ({ ...buildProfitCandidate(options), expectedReturn: calculateExpectedReturn(buildProfitCandidate(options)) });
  const saveLearningHistory = ({ storage = window.localStorage, candidate = buildProfitCandidate({ storage }) } = {}) => {
    writeRecords(storage, STORAGE_KEYS.profit, [candidate, ...readRecords(storage, STORAGE_KEYS.profit, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.darkhorse, [{ date: candidate.date, course: candidate.course, race: candidate.race, horse: candidate.darkHorse, popularity: candidate.popularZone, jockey: "穴騎手AI", trainer: "穴厩舎AI", runningStyle: "差し", result: candidate.returnRate >= 100 ? "好走" : "検証", memo: candidate.memo }, ...readRecords(storage, STORAGE_KEYS.darkhorse, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.popularZone, [analyzePopularZone(candidate), ...readRecords(storage, STORAGE_KEYS.popularZone, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.trifectaPattern, [analyzeTrifectaPattern(candidate), ...readRecords(storage, STORAGE_KEYS.trifectaPattern, [])].slice(0, 300));
    return candidate;
  };
  const buildReturnRanking = ({ storage = window.localStorage } = {}) => readRecords(storage, STORAGE_KEYS.profit, [])
    .slice()
    .sort((a, b) => toNumber(b.returnRate) - toNumber(a.returnRate))
    .map((item) => `${item.course}${item.race} ${item.returnRate}% ${item.trifectaPattern}`);
  const buildProfitStatus = ({ storage = window.localStorage } = {}) => {
    const candidate = readRecords(storage, STORAGE_KEYS.profit, [buildProfitCandidate({ storage })])[0];
    return {
      candidate: `${candidate.course} ${candidate.race}`,
      dangerHorse: judgeDangerFavorite(candidate),
      darkHorse: judgeDarkHorse(candidate),
      longshotHorse: judgeLongshot(candidate),
      expectedReturn: calculateExpectedReturn(candidate),
      trifectaPattern: candidate.trifectaPattern,
      ranking: buildReturnRanking({ storage })
    };
  };
  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };
  const fillList = (id, items, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.innerHTML = items.length ? items.map((item) => `<li>${item}</li>`).join("") : '<li class="empty-state">万馬券データ待ち</li>';
  };
  const renderProfitExplorer = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const status = buildProfitStatus({ storage });
    setText("profit-candidate", status.candidate, documentRef);
    setText("profit-danger-horse", status.dangerHorse, documentRef);
    setText("profit-dark-horse", status.darkHorse, documentRef);
    setText("profit-longshot-horse", status.longshotHorse, documentRef);
    setText("profit-expected-return", `${status.expectedReturn}%`, documentRef);
    setText("profit-trifecta-pattern", status.trifectaPattern, documentRef);
    fillList("profit-return-ranking", status.ranking, documentRef);
    return status;
  };
  const bindProfitExplorer = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    let current = buildProfitCandidate({ storage });
    const run = (message, patch = {}) => {
      current = generateProfitCandidate({ storage, input: { ...current, ...patch } });
      setText("profit-action-status", message, documentRef);
      renderProfitExplorer({ storage, documentRef });
    };
    documentRef.getElementById("run-profit-explorer")?.addEventListener("click", () => { current = generateProfitCandidate({ storage }); saveLearningHistory({ storage, candidate: current }); run("万馬券候補を生成しました", current); });
    documentRef.getElementById("show-profit-danger")?.addEventListener("click", () => run("危険1人気を表示しました"));
    documentRef.getElementById("show-profit-dark")?.addEventListener("click", () => run("神穴馬を表示しました"));
    documentRef.getElementById("show-profit-longshot")?.addEventListener("click", () => run("大穴馬を表示しました"));
    documentRef.getElementById("show-profit-return")?.addEventListener("click", () => run("期待回収率を計算しました"));
    documentRef.getElementById("show-profit-trifecta")?.addEventListener("click", () => run("三連単パターンを表示しました"));
    renderProfitExplorer({ storage, documentRef });
  };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindProfitExplorer());
  const api = { VERSION, STORAGE_KEYS, SOURCE_KEYS, buildProfitCandidate, judgeDangerFavorite, judgeDarkHorse, judgeLongshot, judgeLowPopularRunner, analyzePopularZone, analyzeTrifectaPattern, calculateExpectedReturn, generateProfitCandidate, saveLearningHistory, buildReturnRanking, buildProfitStatus, renderProfitExplorer, bindProfitExplorer };
  if (typeof window !== "undefined") window.HashimotoProfitExplorer = api;
  if (typeof module !== "undefined") module.exports = api;
})();
