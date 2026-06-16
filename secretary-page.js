(() => {
  const VERSION = "2.8";
  const STORAGE_KEY = "ai-secretary-db.json";
  const SOURCE_KEYS = ["integrated-os.json", "prediction-engine.json", "learning-engine.json", "return-ai-db.json", "history-db.json", "ai-secretary-db.json", "auto-review-db.json", "auto-update-db.json"];
  const QUESTIONS = ["東京11Rは？", "危険な1人気は？", "今日の神穴は？", "WIN5候補は？", "回収率の高い騎手は？"];
  const DEFAULT_MEMO = Object.freeze({
    date: "2026-06-15",
    course: "東京競馬場",
    race: "11R",
    favoriteHorse: "AI本命サンプル",
    dangerHorse: "危険な1人気サンプル",
    darkHorse: "神穴サンプル",
    win5Horse: "WIN5固定A候補",
    jockeyRank: ["回収率騎手A", "安定騎手B", "穴騎手C"],
    trainerRank: ["仕上げ厩舎A", "上昇厩舎B", "穴厩舎C"],
    memo: "AI秘書が統合OS・予想生成AI・学習DBから本日の注目情報を要約。"
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
  const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "") || "--";
  const latestSourceRecord = (storage) => SOURCE_KEYS.flatMap((key) => readRecords(storage, key, [])).find(Boolean) || {};
  const buildSecretaryMemo = ({ storage = window.localStorage, input = {} } = {}) => {
    const source = latestSourceRecord(storage);
    return {
      date: first(input.date, source.date, DEFAULT_MEMO.date),
      course: first(input.course, source.course, DEFAULT_MEMO.course),
      race: first(input.race, source.race, DEFAULT_MEMO.race),
      favoriteHorse: first(input.favoriteHorse, source.favoriteHorse, source.axisHorse, DEFAULT_MEMO.favoriteHorse),
      dangerHorse: first(input.dangerHorse, source.dangerHorse, DEFAULT_MEMO.dangerHorse),
      darkHorse: first(input.darkHorse, source.darkHorse, DEFAULT_MEMO.darkHorse),
      win5Horse: first(input.win5Horse, source.win5Horse, source.win5Pattern, DEFAULT_MEMO.win5Horse),
      jockeyRank: input.jockeyRank || source.jockeyRank || DEFAULT_MEMO.jockeyRank,
      trainerRank: input.trainerRank || source.trainerRank || DEFAULT_MEMO.trainerRank,
      memo: first(input.memo, source.memo, DEFAULT_MEMO.memo),
      linkedSources: SOURCE_KEYS,
      generatedAt: new Date().toISOString()
    };
  };
  const saveSecretaryMemo = ({ storage = window.localStorage, memo = buildSecretaryMemo({ storage }) } = {}) => {
    const records = readRecords(storage, STORAGE_KEY, []);
    writeRecords(storage, STORAGE_KEY, [memo, ...records].slice(0, 300));
    return memo;
  };
  const buildAutoReviewDigest = ({ storage = window.localStorage } = {}) => { const review = readRecords(storage, "auto-review-db.json", [])[0] || {}; const update = readRecords(storage, "auto-update-db.json", [])[0] || {}; return { reviewText: review.reviewText || "自動レビュー待機", updateText: update.updateText || "自動アップデート待機", learnedRule: review.learnedRule || update.learnedRule || "レビュー後に生成" }; };
  const buildSecretaryEngine = ({ storage = window.localStorage } = {}) => {
    const memo = buildSecretaryMemo({ storage });
    const digest = buildAutoReviewDigest({ storage });
    return { version: VERSION, phase: "Phase15", engine: "secretaryEngine", stableBase: "Official Release v2.7", dailyReport: `${memo.course}${memo.race} 本命:${memo.favoriteHorse} 危険:${memo.dangerHorse}`, weeklyReport: `${memo.jockeyRank} / ${memo.trainerRank} を継続監視`, autoReview: digest.reviewText, autoUpdate: digest.updateText, memo: memo.memo };
  };
  const buildSecretaryStatus = ({ storage = window.localStorage } = {}) => {
    const memo = readRecords(storage, STORAGE_KEY, [buildSecretaryMemo({ storage })])[0] || DEFAULT_MEMO;
    return {
      recommendedRace: `${memo.course} ${memo.race}`,
      favoriteHorse: memo.favoriteHorse,
      dangerHorse: memo.dangerHorse,
      darkHorse: memo.darkHorse,
      win5Horse: memo.win5Horse,
      topJockey: Array.isArray(memo.jockeyRank) ? memo.jockeyRank[0] : memo.jockeyRank,
      topTrainer: Array.isArray(memo.trainerRank) ? memo.trainerRank[0] : memo.trainerRank,
      memo: memo.memo
    };
  };
  const answerQuestion = (question, status) => {
    if (/東京11R/.test(question)) return `本日の推奨は${status.recommendedRace}、本命は${status.favoriteHorse}です。`;
    if (/危険/.test(question)) return `危険人気馬は${status.dangerHorse}です。`;
    if (/神穴/.test(question)) return `今日の神穴は${status.darkHorse}です。`;
    if (/WIN5/.test(question)) return `WIN5候補は${status.win5Horse}です。`;
    if (/騎手/.test(question)) return `回収率の高い騎手は${status.topJockey}です。`;
    return status.memo;
  };
  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };
  const fillList = (id, items, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };
  const renderSecretary = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const status = buildSecretaryStatus({ storage });
    setText("secretary-recommended-race", status.recommendedRace, documentRef);
    setText("secretary-favorite-horse", status.favoriteHorse, documentRef);
    setText("secretary-danger-horse", status.dangerHorse, documentRef);
    setText("secretary-dark-horse", status.darkHorse, documentRef);
    setText("secretary-win5-horse", status.win5Horse, documentRef);
    setText("secretary-top-jockey", status.topJockey, documentRef);
    setText("secretary-top-trainer", status.topTrainer, documentRef);
    fillList("secretary-question-list", QUESTIONS.map((question) => `<strong>${question}</strong><span>${answerQuestion(question, status)}</span>`), documentRef);
    return status;
  };
  const bindSecretary = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    let currentMemo = buildSecretaryMemo({ storage });
    const run = (message, patch = {}) => {
      currentMemo = buildSecretaryMemo({ storage, input: { ...currentMemo, ...patch } });
      setText("secretary-action-status", message, documentRef);
      renderSecretary({ storage, documentRef });
    };
    documentRef.getElementById("run-ai-secretary")?.addEventListener("click", () => run("AI秘書が本日の要約を生成しました"));
    documentRef.getElementById("show-secretary-danger")?.addEventListener("click", () => run("危険人気馬を表示しました", { dangerHorse: currentMemo.dangerHorse }));
    documentRef.getElementById("show-secretary-dark")?.addEventListener("click", () => run("神穴馬を表示しました", { darkHorse: currentMemo.darkHorse }));
    documentRef.getElementById("show-secretary-win5")?.addEventListener("click", () => run("WIN5候補を表示しました", { win5Horse: currentMemo.win5Horse }));
    documentRef.getElementById("save-secretary-memo")?.addEventListener("click", () => {
      saveSecretaryMemo({ storage, memo: currentMemo });
      setText("secretary-action-status", "秘書メモをai-secretary-db.jsonへ保存しました", documentRef);
      renderSecretary({ storage, documentRef });
    });
    renderSecretary({ storage, documentRef });
  };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindSecretary());
  const api = { VERSION, STORAGE_KEY, SOURCE_KEYS, QUESTIONS, buildSecretaryMemo, saveSecretaryMemo, buildAutoReviewDigest, buildSecretaryEngine, buildSecretaryStatus, answerQuestion, renderSecretary, bindSecretary };
  if (typeof window !== "undefined") window.HashimotoAiSecretary = api;
  if (typeof module !== "undefined") module.exports = api;
})();
