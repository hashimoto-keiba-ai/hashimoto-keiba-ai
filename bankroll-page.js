(() => {
  const VERSION = "2.8";
  const STORAGE_KEYS = {
    bankroll: "bankroll-db.json",
    betHistory: "bet-history-db.json",
    returnRate: "return-rate-db.json",
    profitHistory: "profit-history-db.json"
  };
  const SOURCE_KEYS = ["integrated-os.json", "prediction-engine.json", "learning-engine.json", "profit-db.json", "return-ai-db.json", "win5-db.json", "history-db.json"];
  const DEFAULT_BETS = [
    { date: "2026-06-15", course: "東京", race: "11R", distance: "芝1600", betType: "三連単", betAmount: 12000, payout: 66000, odds: 55, hit: true, memo: "最高配当候補" },
    { date: "2026-06-15", course: "京都", race: "10R", distance: "芝1200", betType: "WIN5", betAmount: 8000, payout: 0, odds: 0, hit: false, memo: "WIN5監視" },
    { date: "2026-06-08", course: "東京", race: "9R", distance: "芝1600", betType: "馬連", betAmount: 5000, payout: 12000, odds: 24, hit: true, memo: "安定回収" },
    { date: "2026-05-20", course: "阪神", race: "12R", distance: "ダ1800", betType: "三連単", betAmount: 10000, payout: 24000, odds: 24, hit: true, memo: "距離別好走" }
  ];
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const readRecords = (storage, key, fallback = []) => {
    try {
      const raw = storage?.getItem?.(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : Array.isArray(parsed.records) ? parsed.records : fallback;
    } catch (_) { return fallback; }
  };
  const writeRecords = (storage, key, records) => {
    storage?.setItem?.(key, JSON.stringify({ version: VERSION, storageKey: key, linkedSources: SOURCE_KEYS, records }, null, 2));
    return records;
  };
  const withProfit = (bet) => ({ ...bet, profit: toNumber(bet.payout) - toNumber(bet.betAmount) });
  const loadBets = (storage) => {
    const own = readRecords(storage, STORAGE_KEYS.betHistory, []);
    const history = readRecords(storage, "history-db.json", []);
    const win5 = readRecords(storage, "win5-db.json", []);
    const converted = [...history, ...win5].map((item) => ({
      date: item.date || new Date().toISOString().slice(0, 10),
      course: item.course || "WIN5",
      race: item.race || "WIN5",
      distance: item.distance || "複合",
      betType: item.betType || (item.race1 ? "WIN5" : "三連単"),
      betAmount: toNumber(item.betAmount ?? item.budget, 0),
      payout: toNumber(item.payout ?? item.totalPayout ?? item.expectedPayout, 0),
      odds: toNumber(item.odds, 0),
      hit: Boolean(item.hit),
      memo: item.memo || "連携DBから取込"
    }));
    return (own.length ? own : [...converted, ...DEFAULT_BETS]).map(withProfit);
  };
  const calculateTotalBetAmount = (bets = DEFAULT_BETS) => bets.reduce((sum, bet) => sum + toNumber(bet.betAmount), 0);
  const calculateTotalPayout = (bets = DEFAULT_BETS) => bets.reduce((sum, bet) => sum + toNumber(bet.payout), 0);
  const calculateTotalProfit = (bets = DEFAULT_BETS) => calculateTotalPayout(bets) - calculateTotalBetAmount(bets);
  const calculateCurrentBankroll = ({ initialBankroll = 100000, bets = DEFAULT_BETS } = {}) => initialBankroll + calculateTotalProfit(bets);
  const calculateReturnRate = (bets = DEFAULT_BETS) => Math.round((calculateTotalPayout(bets) / Math.max(1, calculateTotalBetAmount(bets))) * 1000) / 10;
  const filterByPrefix = (bets, prefix) => bets.filter((bet) => String(bet.date || "").startsWith(prefix));
  const calculateDailyReturnRate = (bets = DEFAULT_BETS, date = "2026-06-15") => calculateReturnRate(filterByPrefix(bets, date));
  const calculateWeeklyReturnRate = (bets = DEFAULT_BETS, prefix = "2026-06") => calculateReturnRate(filterByPrefix(bets, prefix));
  const calculateMonthlyReturnRate = (bets = DEFAULT_BETS, month = "2026-06") => calculateReturnRate(filterByPrefix(bets, month));
  const calculateYearlyReturnRate = (bets = DEFAULT_BETS, year = "2026") => calculateReturnRate(filterByPrefix(bets, year));
  const groupedReturnRate = (bets, key) => bets.reduce((acc, bet) => {
    const label = bet[key] || "未分類";
    acc[label] = acc[label] || { betAmount: 0, payout: 0, returnRate: 0 };
    acc[label].betAmount += toNumber(bet.betAmount);
    acc[label].payout += toNumber(bet.payout);
    acc[label].returnRate = Math.round((acc[label].payout / Math.max(1, acc[label].betAmount)) * 1000) / 10;
    return acc;
  }, {});
  const calculateBetTypeReturnRates = (bets = DEFAULT_BETS) => groupedReturnRate(bets, "betType");
  const calculateCourseReturnRates = (bets = DEFAULT_BETS) => groupedReturnRate(bets, "course");
  const calculateDistanceReturnRates = (bets = DEFAULT_BETS) => groupedReturnRate(bets, "distance");
  const extractHighestPayout = (bets = DEFAULT_BETS) => bets.slice().sort((a, b) => toNumber(b.payout) - toNumber(a.payout))[0] || null;
  const strongestFrom = (rates) => Object.entries(rates).sort((a, b) => b[1].returnRate - a[1].returnRate)[0]?.[0] || "--";
  const judgeStrongestCourse = (bets = DEFAULT_BETS) => strongestFrom(calculateCourseReturnRates(bets));
  const judgeStrongestDistance = (bets = DEFAULT_BETS) => strongestFrom(calculateDistanceReturnRates(bets));
  const judgeStrongestBetType = (bets = DEFAULT_BETS) => strongestFrom(calculateBetTypeReturnRates(bets));
  const extractBestRace = (bets = DEFAULT_BETS) => bets.slice().map(withProfit).sort((a, b) => b.profit - a.profit)[0] || null;
  const extractWorstRace = (bets = DEFAULT_BETS) => bets.slice().map(withProfit).sort((a, b) => a.profit - b.profit)[0] || null;
  const buildBankrollRecord = ({ storage = window.localStorage, initialBankroll = 100000 } = {}) => {
    const bets = loadBets(storage);
    const totalBetAmount = calculateTotalBetAmount(bets);
    const totalPayout = calculateTotalPayout(bets);
    const totalProfit = calculateTotalProfit(bets);
    const highest = extractHighestPayout(bets);
    return {
      date: new Date().toISOString().slice(0, 10), initialBankroll, currentBankroll: initialBankroll + totalProfit,
      totalBetAmount, totalPayout, totalProfit, returnRate: calculateReturnRate(bets),
      monthlyReturnRate: calculateMonthlyReturnRate(bets), yearlyReturnRate: calculateYearlyReturnRate(bets),
      highestPayout: highest ? `${highest.course} ${highest.race} ${highest.payout}円` : "--",
      strongestCourse: judgeStrongestCourse(bets), strongestDistance: judgeStrongestDistance(bets), strongestBetType: judgeStrongestBetType(bets),
      bestRace: extractBestRace(bets), worstRace: extractWorstRace(bets), memo: "回収率管理AIが資金状況を統合管理。"
    };
  };
  const saveBankrollHistory = ({ storage = window.localStorage, initialBankroll = 100000 } = {}) => {
    const bets = loadBets(storage);
    const record = buildBankrollRecord({ storage, initialBankroll });
    writeRecords(storage, STORAGE_KEYS.bankroll, [record, ...readRecords(storage, STORAGE_KEYS.bankroll, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.betHistory, bets.slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.returnRate, [{ date: record.date, dailyReturnRate: calculateDailyReturnRate(bets), weeklyReturnRate: calculateWeeklyReturnRate(bets), monthlyReturnRate: record.monthlyReturnRate, yearlyReturnRate: record.yearlyReturnRate, trifectaReturnRate: calculateBetTypeReturnRates(bets)["三連単"]?.returnRate || 0, win5ReturnRate: calculateBetTypeReturnRates(bets)["WIN5"]?.returnRate || 0, memo: record.memo }, ...readRecords(storage, STORAGE_KEYS.returnRate, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.profitHistory, [{ date: record.date, course: record.bestRace?.course || "--", race: record.bestRace?.race || "--", betType: record.bestRace?.betType || "--", profit: record.totalProfit, returnRate: record.returnRate, bestRace: record.bestRace ? `${record.bestRace.course} ${record.bestRace.race}` : "--", worstRace: record.worstRace ? `${record.worstRace.course} ${record.worstRace.race}` : "--", memo: record.memo }, ...readRecords(storage, STORAGE_KEYS.profitHistory, [])].slice(0, 300));
    return record;
  };
  const setText = (id, value, documentRef = document) => { const target = documentRef.getElementById(id); if (target) target.textContent = value; };
  const renderBankrollPanel = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const r = buildBankrollRecord({ storage });
    setText("bankroll-total-bet", `${r.totalBetAmount.toLocaleString("ja-JP")}円`, documentRef);
    setText("bankroll-total-payout", `${r.totalPayout.toLocaleString("ja-JP")}円`, documentRef);
    setText("bankroll-total-profit", `${r.totalProfit.toLocaleString("ja-JP")}円`, documentRef);
    setText("bankroll-current", `${r.currentBankroll.toLocaleString("ja-JP")}円`, documentRef);
    setText("bankroll-return-rate", `${r.returnRate}%`, documentRef);
    setText("bankroll-monthly-return", `${r.monthlyReturnRate}%`, documentRef);
    setText("bankroll-highest-payout", r.highestPayout, documentRef);
    setText("bankroll-strong-course", r.strongestCourse, documentRef);
    setText("bankroll-strong-distance", r.strongestDistance, documentRef);
    setText("bankroll-strong-bet-type", r.strongestBetType, documentRef);
    return r;
  };
  const bindBankrollPanel = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    const run = (message) => { setText("bankroll-action-status", message, documentRef); renderBankrollPanel({ storage, documentRef }); };
    documentRef.getElementById("run-bankroll-ai")?.addEventListener("click", () => { saveBankrollHistory({ storage }); run("回収率管理AIを実行しました"); });
    documentRef.getElementById("show-bankroll-status")?.addEventListener("click", () => run("資金状況を表示しました"));
    documentRef.getElementById("show-bet-type-return")?.addEventListener("click", () => run("券種別回収率を表示しました"));
    documentRef.getElementById("show-course-return")?.addEventListener("click", () => run("競馬場別回収率を表示しました"));
    documentRef.getElementById("show-highest-payout")?.addEventListener("click", () => run("最高配当を表示しました"));
    documentRef.getElementById("save-bankroll-history")?.addEventListener("click", () => { saveBankrollHistory({ storage }); run("資金履歴を保存しました"); });
    renderBankrollPanel({ storage, documentRef });
  };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindBankrollPanel());
  const api = { VERSION, STORAGE_KEYS, SOURCE_KEYS, DEFAULT_BETS, loadBets, calculateCurrentBankroll, calculateTotalBetAmount, calculateTotalPayout, calculateTotalProfit, calculateReturnRate, calculateDailyReturnRate, calculateWeeklyReturnRate, calculateMonthlyReturnRate, calculateYearlyReturnRate, calculateBetTypeReturnRates, calculateCourseReturnRates, calculateDistanceReturnRates, extractHighestPayout, judgeStrongestCourse, judgeStrongestDistance, judgeStrongestBetType, extractBestRace, extractWorstRace, buildBankrollRecord, saveBankrollHistory, renderBankrollPanel, bindBankrollPanel };
  if (typeof window !== "undefined") window.HashimotoBankrollAI = api;
  if (typeof module !== "undefined") module.exports = api;
})();
