(() => {
  const VERSION = "2.7";
  const STORAGE_KEYS = { win5: "win5-db.json", pattern: "win5-pattern-db.json", history: "win5-history-db.json" };
  const SOURCE_KEYS = ["integrated-os.json", "prediction-engine.json", "learning-engine.json", "profit-db.json", "return-ai-db.json", "history-db.json"];
  const DEFAULT_RACES = [
    { race: "race1", horse: "A固定候補", zone: "A", popularity: 1, score: 96 },
    { race: "race2", horse: "B本線候補", zone: "B", popularity: 4, score: 91 },
    { race: "race3", horse: "C狙い候補", zone: "C", popularity: 8, score: 88 },
    { race: "race4", horse: "D爆穴候補", zone: "D", popularity: 12, score: 82 },
    { race: "race5", horse: "A固定候補2", zone: "A", popularity: 2, score: 94 }
  ];
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
  const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const judgeAFix = (race) => race.zone === "A" && toNumber(race.score) >= 90;
  const judgeBMain = (race) => race.zone === "B" || (toNumber(race.popularity) >= 4 && toNumber(race.popularity) <= 6);
  const judgeCTarget = (race) => race.zone === "C" || (toNumber(race.popularity) >= 7 && toNumber(race.popularity) <= 10);
  const judgeDBomb = (race) => race.zone === "D" || toNumber(race.popularity) >= 11;
  const judgeFavoriteCut = (race) => toNumber(race.popularity) === 1 && toNumber(race.score) < 88;
  const generateUpsetOrder = (races = DEFAULT_RACES) => races.slice().sort((a, b) => toNumber(b.popularity) - toNumber(a.popularity)).map((race) => `${race.race}:${race.zone}`);
  const calculateHitRate = (races = DEFAULT_RACES) => Math.round(races.reduce((sum, race) => sum + toNumber(race.score), 0) / Math.max(1, races.length));
  const calculateExpectedPayout = (races = DEFAULT_RACES) => races.reduce((sum, race) => sum * Math.max(1.2, toNumber(race.popularity, 1) * 0.92), 1000);
  const calculateTicketCount = ({ safe = 1, balance = 2, high = 4 } = {}) => safe * balance * high * 5;
  const generateTickets = (races = DEFAULT_RACES) => races.map((race) => race.horse);
  const buildWin5Candidate = ({ races = DEFAULT_RACES, budget = 12000 } = {}) => {
    const tickets = generateTickets(races);
    return {
      date: new Date().toISOString().slice(0, 10),
      race1: tickets[0], race2: tickets[1], race3: tickets[2], race4: tickets[3], race5: tickets[4],
      safeType: races.filter(judgeAFix).map((race) => race.horse).join(" / ") || tickets[0],
      balanceType: races.filter((race) => judgeBMain(race) || judgeCTarget(race)).map((race) => race.horse).join(" / ") || tickets.slice(1, 3).join(" / "),
      highPayoutType: races.filter(judgeDBomb).map((race) => race.horse).join(" / ") || tickets[3],
      hitRate: calculateHitRate(races),
      expectedPayout: Math.round(calculateExpectedPayout(races)),
      budget,
      ticketCount: calculateTicketCount(),
      result: "未確定",
      memo: "WIN5完全自動化AIが安全型・バランス型・高配当型を生成。",
      upsetOrder: generateUpsetOrder(races),
      selectedHorses: tickets,
      thirtyMillionLine: Math.round(calculateExpectedPayout(races)) >= 30000000 ? "到達" : "監視",
      oneMillionLine: Math.round(calculateExpectedPayout(races)) >= 1000000 ? "到達" : "監視"
    };
  };
  const buildPattern = (candidate) => ({ pattern: "A固定+B本線+C狙い+D爆穴", Afix: candidate.safeType, Bmain: candidate.balanceType, Ctarget: candidate.balanceType, Dbomb: candidate.highPayoutType, hitCount: 0, returnRate: Math.round(candidate.expectedPayout / Math.max(1, candidate.budget) * 100), memo: candidate.memo });
  const saveWin5History = ({ storage = window.localStorage, candidate = buildWin5Candidate() } = {}) => {
    writeRecords(storage, STORAGE_KEYS.win5, [candidate, ...readRecords(storage, STORAGE_KEYS.win5, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.pattern, [buildPattern(candidate), ...readRecords(storage, STORAGE_KEYS.pattern, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.history, [{ date: candidate.date, selectedHorses: candidate.selectedHorses, result: candidate.result, payout: candidate.expectedPayout, hit: false, review: "自動生成直後", update: "結果待ち" }, ...readRecords(storage, STORAGE_KEYS.history, [])].slice(0, 300));
    return candidate;
  };
  const buildWin5Status = ({ storage = window.localStorage } = {}) => {
    const candidate = readRecords(storage, STORAGE_KEYS.win5, [buildWin5Candidate()])[0];
    return candidate;
  };
  const setText = (id, value, documentRef = document) => { const target = documentRef.getElementById(id); if (target) target.textContent = value; };
  const renderWin5Automation = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const c = buildWin5Status({ storage });
    setText("auto-win5-safe", c.safeType, documentRef); setText("auto-win5-balance", c.balanceType, documentRef); setText("auto-win5-high", c.highPayoutType, documentRef);
    setText("auto-win5-hit-rate", `${c.hitRate}%`, documentRef); setText("auto-win5-payout", `${c.expectedPayout.toLocaleString("ja-JP")}円`, documentRef);
    setText("auto-win5-upset", (c.upsetOrder || []).join(" → "), documentRef); setText("auto-win5-ticket-count", `${c.ticketCount}点`, documentRef);
    setText("auto-win5-30m", c.thirtyMillionLine, documentRef); setText("auto-win5-1m", c.oneMillionLine, documentRef); return c;
  };
  const bindWin5Automation = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return; let current = buildWin5Candidate();
    const run = (message) => { setText("auto-win5-status", message, documentRef); renderWin5Automation({ storage, documentRef }); };
    documentRef.getElementById("generate-auto-win5")?.addEventListener("click", () => { current = buildWin5Candidate(); saveWin5History({ storage, candidate: current }); run("WIN5候補を生成しました"); });
    documentRef.getElementById("show-safe-win5")?.addEventListener("click", () => run("安全型WIN5を表示しました"));
    documentRef.getElementById("show-balance-win5")?.addEventListener("click", () => run("バランス型WIN5を表示しました"));
    documentRef.getElementById("show-high-win5")?.addEventListener("click", () => run("高配当型WIN5を表示しました"));
    documentRef.getElementById("show-upset-win5")?.addEventListener("click", () => run("荒れ順を表示しました"));
    documentRef.getElementById("generate-win5-tickets")?.addEventListener("click", () => run("買い目を自動生成しました"));
    documentRef.getElementById("save-auto-win5")?.addEventListener("click", () => { saveWin5History({ storage, candidate: current }); run("WIN5履歴を保存しました"); });
    renderWin5Automation({ storage, documentRef });
  };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindWin5Automation());
  const api = { VERSION, STORAGE_KEYS, SOURCE_KEYS, DEFAULT_RACES, judgeAFix, judgeBMain, judgeCTarget, judgeDBomb, judgeFavoriteCut, generateUpsetOrder, calculateHitRate, calculateExpectedPayout, calculateTicketCount, generateTickets, buildWin5Candidate, buildPattern, saveWin5History, buildWin5Status, renderWin5Automation, bindWin5Automation };
  if (typeof window !== "undefined") window.HashimotoAutomatedWin5 = api;
  if (typeof module !== "undefined") module.exports = api;
})();
