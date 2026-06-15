(() => {
  const VERSION = "2.7";
  const STORAGE_KEYS = { review: "auto-review-db.json", compare: "result-compare-db.json", update: "auto-update-db.json" };
  const SOURCE_KEYS = ["integrated-os.json", "prediction-engine.json", "learning-engine.json", "self-evolution-db.json", "evolution-rule-db.json", "failure-pattern-db.json", "success-pattern-db.json", "research-lab-db.json", "profit-db.json", "return-ai-db.json", "win5-db.json", "bankroll-db.json", "history-db.json"];
  const DEFAULT_REVIEW = Object.freeze({
    date: "2026-06-15", course: "東京", race: "11R", prediction: "◎本命サンプル / 三連単A→B→C / WIN5 A固定", result: "本命サンプル1着 / A→B→C的中 / WIN5的中", axisHorse: "本命サンプル", resultHorse: "本命サンプル", markedHorses: ["本命サンプル", "対抗サンプル", "神穴サンプル"], resultHorses: ["本命サンプル", "対抗サンプル", "神穴サンプル"], trifectaPattern: "A→B→C", actualTrifectaPattern: "A→B→C", win5Pattern: "A固定", actualWin5Pattern: "A固定", confidenceBefore: 91, confidenceAfter: 96, scoreBefore: 111, scoreAfter: 118, returnRateImprovement: 24, memo: "全自動検証AIが結果を照合。"
  });
  const readRecords = (storage, key, fallback = []) => {
    try { const raw = storage?.getItem?.(key); if (!raw) return fallback; const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : Array.isArray(parsed.records) ? parsed.records : fallback; } catch (_) { return fallback; }
  };
  const writeRecords = (storage, key, records) => { storage?.setItem?.(key, JSON.stringify({ version: VERSION, storageKey: key, linkedSources: SOURCE_KEYS, records }, null, 2)); return records; };
  const firstSource = (storage) => SOURCE_KEYS.flatMap((key) => readRecords(storage, key, [])).find(Boolean) || {};
  const buildReviewBase = ({ storage = window.localStorage, input = {} } = {}) => ({ ...DEFAULT_REVIEW, ...firstSource(storage), ...input });
  const compareResult = (base = DEFAULT_REVIEW) => ({ date: base.date, course: base.course, race: base.race, axisHorse: base.axisHorse, resultHorse: base.resultHorse, markedHorses: base.markedHorses, resultHorses: base.resultHorses, trifectaPattern: base.trifectaPattern, actualTrifectaPattern: base.actualTrifectaPattern, win5Pattern: base.win5Pattern, actualWin5Pattern: base.actualWin5Pattern, hit: judgeHit(base), memo: "結果自動照合" });
  const compareAxisHorse = (base = DEFAULT_REVIEW) => base.axisHorse === base.resultHorse;
  const compareMarkedHorses = (base = DEFAULT_REVIEW) => (base.markedHorses || []).every((horse) => (base.resultHorses || []).includes(horse));
  const compareTrifectaPattern = (base = DEFAULT_REVIEW) => base.trifectaPattern === base.actualTrifectaPattern;
  const compareWin5 = (base = DEFAULT_REVIEW) => base.win5Pattern === base.actualWin5Pattern;
  const judgeHit = (base = DEFAULT_REVIEW) => compareAxisHorse(base) && compareMarkedHorses(base) && compareTrifectaPattern(base) && compareWin5(base);
  const judgeMiss = (base = DEFAULT_REVIEW) => !judgeHit(base);
  const analyzeFailure = (base = DEFAULT_REVIEW) => judgeMiss(base) ? `${base.course}${base.race}は印/構造のズレを修正` : "失敗原因なし";
  const analyzeSuccess = (base = DEFAULT_REVIEW) => judgeHit(base) ? `${base.course}${base.race}は本命・印・構造が一致` : "成功要因なし";
  const generateReviewText = (base = DEFAULT_REVIEW) => `検証:${base.course}${base.race} ${judgeHit(base) ? "的中" : "不的中"} / ${analyzeSuccess(base)}`;
  const generateUpdateText = (base = DEFAULT_REVIEW) => `更新:${base.trifectaPattern}と${base.win5Pattern}を${judgeHit(base) ? "強化" : "補正"}`;
  const generateLearningRule = (base = DEFAULT_REVIEW) => `${base.course}${base.race}では${base.trifectaPattern}と${base.win5Pattern}を検証結果に基づき更新`;
  const buildReviewRecord = (options = {}) => {
    const base = buildReviewBase(options);
    return { date: base.date, course: base.course, race: base.race, prediction: base.prediction, result: base.result, axisMatched: compareAxisHorse(base), marksMatched: compareMarkedHorses(base), trifectaMatched: compareTrifectaPattern(base), win5Matched: compareWin5(base), hit: judgeHit(base), reviewText: generateReviewText(base), updateText: generateUpdateText(base), learnedRule: generateLearningRule(base), returnRateImprovement: base.returnRateImprovement || 0, confidenceImprovement: (base.confidenceAfter || 0) - (base.confidenceBefore || 0), memo: base.memo };
  };
  const buildAutoUpdate = (record, base = DEFAULT_REVIEW) => ({ date: record.date, updateTarget: "自己進化エンジン", updateText: record.updateText, learnedRule: record.learnedRule, relatedDb: SOURCE_KEYS, selfEvolutionLinked: true, confidenceBefore: base.confidenceBefore, confidenceAfter: base.confidenceAfter, scoreBefore: base.scoreBefore, scoreAfter: base.scoreAfter, memo: "関連DB自動更新" });
  const saveReviewHistory = ({ storage = window.localStorage, input = {} } = {}) => {
    const base = buildReviewBase({ storage, input }); const record = buildReviewRecord({ storage, input }); const compare = compareResult(base); const update = buildAutoUpdate(record, base);
    writeRecords(storage, STORAGE_KEYS.review, [record, ...readRecords(storage, STORAGE_KEYS.review, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.compare, [compare, ...readRecords(storage, STORAGE_KEYS.compare, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.update, [update, ...readRecords(storage, STORAGE_KEYS.update, [])].slice(0, 300));
    return record;
  };
  const buildReviewStatus = ({ storage = window.localStorage, today = "2026-06-15" } = {}) => {
    const records = readRecords(storage, STORAGE_KEYS.review, [buildReviewRecord({ storage })]); const todayRecords = records.filter((r) => String(r.date || "").startsWith(today)); const hitRecords = records.filter((r) => r.hit); const missRecords = records.filter((r) => !r.hit);
    return { todayReviewCount: todayRecords.length, hitReviewCount: hitRecords.length, missReviewCount: missRecords.length, autoUpdateCount: records.length, generatedRuleCount: records.filter((r) => r.learnedRule).length, returnRateImprovement: Math.round(records.reduce((s, r) => s + (r.returnRateImprovement || 0), 0) / Math.max(1, records.length)), confidenceImprovement: Math.round(records.reduce((s, r) => s + (r.confidenceImprovement || 0), 0) / Math.max(1, records.length)) };
  };
  const linkSelfEvolution = (record) => ({ updateTarget: "self-evolution-db.json", learnedRule: record.learnedRule, reviewText: record.reviewText, linked: true });
  const setText = (id, value, documentRef = document) => { const target = documentRef.getElementById(id); if (target) target.textContent = value; };
  const renderAutoReview = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const s = buildReviewStatus({ storage });
    setText("auto-review-today", s.todayReviewCount, documentRef); setText("auto-review-hit", s.hitReviewCount, documentRef); setText("auto-review-miss", s.missReviewCount, documentRef); setText("auto-review-update", s.autoUpdateCount, documentRef); setText("auto-review-rules", s.generatedRuleCount, documentRef); setText("auto-review-return", `${s.returnRateImprovement}%`, documentRef); setText("auto-review-confidence", s.confidenceImprovement, documentRef); return s;
  };
  const bindAutoReview = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return; const run = (message) => { setText("auto-review-status", message, documentRef); renderAutoReview({ storage, documentRef }); };
    documentRef.getElementById("run-auto-review")?.addEventListener("click", () => { saveReviewHistory({ storage }); run("全自動検証を実行しました"); });
    documentRef.getElementById("show-result-compare")?.addEventListener("click", () => run("結果照合を表示しました"));
    documentRef.getElementById("show-review-failure")?.addEventListener("click", () => run("失敗原因を表示しました"));
    documentRef.getElementById("show-review-success")?.addEventListener("click", () => run("成功要因を表示しました"));
    documentRef.getElementById("show-auto-update")?.addEventListener("click", () => run("自動アップデートを表示しました"));
    documentRef.getElementById("save-auto-review")?.addEventListener("click", () => { saveReviewHistory({ storage }); run("検証履歴を保存しました"); });
    renderAutoReview({ storage, documentRef });
  };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindAutoReview());
  const api = { VERSION, STORAGE_KEYS, SOURCE_KEYS, DEFAULT_REVIEW, buildReviewBase, compareResult, compareAxisHorse, compareMarkedHorses, compareTrifectaPattern, compareWin5, judgeHit, judgeMiss, analyzeFailure, analyzeSuccess, generateReviewText, generateUpdateText, generateLearningRule, buildReviewRecord, buildAutoUpdate, saveReviewHistory, buildReviewStatus, linkSelfEvolution, renderAutoReview, bindAutoReview };
  if (typeof window !== "undefined") window.HashimotoAutoReview = api;
  if (typeof module !== "undefined") module.exports = api;
})();
