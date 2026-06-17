(() => {
  const VERSION = "2.7";
  const STORAGE_KEYS = {
    lab: "research-lab-db.json",
    course: "course-research-db.json",
    jockey: "jockey-research-db.json",
    trainer: "trainer-research-db.json",
    lap: "lap-research-db.json"
  };
  const SOURCE_KEYS = ["integrated-os.json", "prediction-engine.json", "learning-engine.json", "profit-db.json", "return-ai-db.json", "win5-db.json", "bankroll-db.json", "history-db.json"];
  const DEFAULT_RESEARCH = Object.freeze({
    date: "2026-06-15",
    researchType: "AI研究所",
    course: "東京",
    distance: "芝1600",
    condition: "良",
    jockey: "研究騎手A",
    trainer: "研究調教師A",
    pace: "ハイペース",
    lapPattern: "前半34.5-後半35.1",
    popularZone: "C",
    trifectaPattern: "A→B→C",
    darkHorsePattern: "Cゾーン差し込み",
    win5Pattern: "A固定+B本線+C狙い",
    finding: "東京芝1600はCゾーン神穴とA→B→Cの三連単が高回収。",
    learnedRule: "東京芝1600良馬場ハイペースではCゾーン差し馬を神穴候補に昇格。",
    confidence: 91,
    returnRate: 328,
    memo: "AI研究所が統合DBから自己進化ルールを生成。"
  });
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
  const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "") ?? "--";
  const sourceRecord = (storage) => SOURCE_KEYS.flatMap((key) => readRecords(storage, key, [])).find(Boolean) || {};
  const buildResearchBase = ({ storage = window.localStorage, input = {} } = {}) => {
    const source = sourceRecord(storage);
    return {
      ...DEFAULT_RESEARCH,
      ...source,
      ...input,
      course: first(input.course, source.course, DEFAULT_RESEARCH.course),
      distance: first(input.distance, source.distance, DEFAULT_RESEARCH.distance),
      condition: first(input.condition, source.condition, DEFAULT_RESEARCH.condition),
      jockey: first(input.jockey, source.jockey, DEFAULT_RESEARCH.jockey),
      trainer: first(input.trainer, source.trainer, DEFAULT_RESEARCH.trainer),
      pace: first(input.pace, source.pace, DEFAULT_RESEARCH.pace),
      returnRate: toNumber(first(input.returnRate, source.returnRate, DEFAULT_RESEARCH.returnRate)),
      confidence: toNumber(first(input.confidence, source.confidence, DEFAULT_RESEARCH.confidence))
    };
  };
  const researchCourseOs = (base = DEFAULT_RESEARCH) => ({ course: base.course, bestDistance: base.distance, bestCondition: base.condition, bestPace: base.pace, bestRunningStyle: "差し", bestPopularZone: base.popularZone, bestTrifectaPattern: base.trifectaPattern, bestJockeyType: "回収率型", bestTrainerType: "東京巧者", returnRate: base.returnRate, memo: base.finding });
  const researchDistance = (base = DEFAULT_RESEARCH) => ({ distance: base.distance, finding: `${base.distance}は${base.pace}で${base.darkHorsePattern}を強化`, returnRate: base.returnRate });
  const researchJockey = (base = DEFAULT_RESEARCH) => ({ jockey: base.jockey, course: base.course, distance: base.distance, winRate: 18, placeRate: 42, showRate: 58, returnRate: base.returnRate, strongPattern: `${base.course}${base.distance}`, weakPattern: "低速上がり", memo: "騎手研究で回収率型を検出" });
  const researchTrainer = (base = DEFAULT_RESEARCH) => ({ trainer: base.trainer, course: base.course, distance: base.distance, winRate: 16, placeRate: 39, showRate: 55, returnRate: Math.max(0, base.returnRate - 12), strongPattern: `${base.condition}${base.pace}`, weakPattern: "道悪短縮", memo: "調教師研究で好走条件を抽出" });
  const researchLap = (base = DEFAULT_RESEARCH) => ({ course: base.course, distance: base.distance, pace: base.pace, lapPattern: base.lapPattern, winnerPosition: "中団", trifectaPattern: base.trifectaPattern, dangerPattern: "Aゾーン過信", darkHorsePattern: base.darkHorsePattern, returnRate: base.returnRate, memo: "ラップ研究で差し込み型を検出" });
  const researchPopularZone = (base = DEFAULT_RESEARCH) => ({ popularZone: base.popularZone, finding: `${base.popularZone}ゾーンが期待回収率を押し上げる`, returnRate: base.returnRate });
  const researchTrifecta = (base = DEFAULT_RESEARCH) => ({ trifectaPattern: base.trifectaPattern, finding: `${base.trifectaPattern}を重点研究`, returnRate: base.returnRate });
  const researchDarkHorse = (base = DEFAULT_RESEARCH) => ({ darkHorsePattern: base.darkHorsePattern, finding: `${base.darkHorsePattern}を神穴昇格`, confidence: base.confidence });
  const researchWin5 = (base = DEFAULT_RESEARCH) => ({ win5Pattern: base.win5Pattern, finding: `${base.win5Pattern}でWIN5点数を圧縮`, confidence: base.confidence });
  const generateSelfEvolutionRule = (base = DEFAULT_RESEARCH) => `${base.course}${base.distance}${base.condition}・${base.pace}では${base.darkHorsePattern}と${base.trifectaPattern}を優先する`;
  const buildResearchRecord = (options = {}) => {
    const base = buildResearchBase(options);
    return { date: base.date || new Date().toISOString().slice(0, 10), researchType: "AI研究所", course: base.course, distance: base.distance, condition: base.condition, jockey: base.jockey, trainer: base.trainer, pace: base.pace, lapPattern: base.lapPattern, popularZone: base.popularZone, trifectaPattern: base.trifectaPattern, darkHorsePattern: base.darkHorsePattern, win5Pattern: base.win5Pattern, finding: base.finding, learnedRule: generateSelfEvolutionRule(base), confidence: base.confidence, memo: base.memo };
  };
  const generateResearchRanking = ({ storage = window.localStorage } = {}) => {
    const records = readRecords(storage, STORAGE_KEYS.lab, [buildResearchRecord({ storage })]);
    return records.slice().sort((a, b) => toNumber(b.confidence) - toNumber(a.confidence)).map((r, index) => `${index + 1}. ${r.course} ${r.distance} / ${r.learnedRule}`);
  };
  const saveResearchMemo = ({ storage = window.localStorage, input = {} } = {}) => {
    const base = buildResearchBase({ storage, input });
    const record = buildResearchRecord({ storage, input });
    writeRecords(storage, STORAGE_KEYS.lab, [record, ...readRecords(storage, STORAGE_KEYS.lab, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.course, [researchCourseOs(base), ...readRecords(storage, STORAGE_KEYS.course, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.jockey, [researchJockey(base), ...readRecords(storage, STORAGE_KEYS.jockey, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.trainer, [researchTrainer(base), ...readRecords(storage, STORAGE_KEYS.trainer, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.lap, [researchLap(base), ...readRecords(storage, STORAGE_KEYS.lap, [])].slice(0, 300));
    return record;
  };
  const setText = (id, value, documentRef = document) => { const target = documentRef.getElementById(id); if (target) target.textContent = value; };
  const renderResearchLab = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const base = buildResearchBase({ storage });
    setText("research-course-os", `${base.course} ${base.distance}`, documentRef);
    setText("research-distance", researchDistance(base).finding, documentRef);
    setText("research-jockey", researchJockey(base).jockey, documentRef);
    setText("research-trainer", researchTrainer(base).trainer, documentRef);
    setText("research-lap", researchLap(base).lapPattern, documentRef);
    setText("research-popular-zone", researchPopularZone(base).finding, documentRef);
    setText("research-trifecta", researchTrifecta(base).trifectaPattern, documentRef);
    setText("research-dark-horse", researchDarkHorse(base).darkHorsePattern, documentRef);
    setText("research-win5", researchWin5(base).win5Pattern, documentRef);
    setText("research-evolution-rule", generateSelfEvolutionRule(base), documentRef);
    return base;
  };
  const bindResearchLab = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    const run = (message) => { setText("research-lab-status", message, documentRef); renderResearchLab({ storage, documentRef }); };
    documentRef.getElementById("run-research-lab")?.addEventListener("click", () => { saveResearchMemo({ storage }); run("AI研究所を実行しました"); });
    documentRef.getElementById("show-course-research")?.addEventListener("click", () => run("競馬場OS研究を表示しました"));
    documentRef.getElementById("show-jockey-research")?.addEventListener("click", () => run("騎手研究を表示しました"));
    documentRef.getElementById("show-trainer-research")?.addEventListener("click", () => run("調教師研究を表示しました"));
    documentRef.getElementById("show-lap-research")?.addEventListener("click", () => run("ラップ研究を表示しました"));
    documentRef.getElementById("show-trifecta-research")?.addEventListener("click", () => run("三連単研究を表示しました"));
    documentRef.getElementById("show-darkhorse-research")?.addEventListener("click", () => run("神穴研究を表示しました"));
    documentRef.getElementById("save-research-memo")?.addEventListener("click", () => { saveResearchMemo({ storage }); run("研究メモを保存しました"); });
    renderResearchLab({ storage, documentRef });
  };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindResearchLab());
  const api = { VERSION, STORAGE_KEYS, SOURCE_KEYS, DEFAULT_RESEARCH, buildResearchBase, researchCourseOs, researchDistance, researchJockey, researchTrainer, researchLap, researchPopularZone, researchTrifecta, researchDarkHorse, researchWin5, generateSelfEvolutionRule, buildResearchRecord, generateResearchRanking, saveResearchMemo, renderResearchLab, bindResearchLab };
  if (typeof window !== "undefined") window.HashimotoResearchLab = api;
  if (typeof module !== "undefined") module.exports = api;
})();
