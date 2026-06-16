(() => {
  const VERSION = "3.0";
  const ENGINE_NAME = "Super Self Evolution Engine";
  const PHASE = "Phase16-1";
  const STABLE_BASE = "Official Release v2.8";
  const STORAGE_KEYS = Object.freeze({
    success: "success-pattern-db.json",
    failure: "failure-pattern-db.json",
    jockey: "jockey-research-db.json",
    trainer: "trainer-research-db.json",
    distance: "distance-db.json",
    course: "course-research-db.json",
    rule: "evolution-rule-db.json",
    selfEvolution: "self-evolution-db.json",
    history: "history-db.json"
  });
  const PIPELINE_STEPS = ["検証", "分析", "学習", "改善案生成", "ルール更新", "履歴保存"];
  const LINKED_RESEARCH_DBS = [STORAGE_KEYS.success, STORAGE_KEYS.failure, STORAGE_KEYS.jockey, STORAGE_KEYS.trainer, STORAGE_KEYS.distance, STORAGE_KEYS.course];

  const DEFAULT_SEED = Object.freeze({
    date: "2026-06-16",
    course: "東京",
    race: "11R",
    distance: "芝1600",
    condition: "良",
    successfulPrediction: "Cゾーン差し込み神穴",
    failedPrediction: "A固定過信",
    result: "検証済み",
    returnRate: 328,
    confidence: 94,
    jockey: "研究騎手A",
    trainer: "研究調教師A"
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
    storage?.setItem?.(key, JSON.stringify({ version: VERSION, phase: PHASE, engine: ENGINE_NAME, storageKey: key, stableBase: STABLE_BASE, linkedResearchDbs: LINKED_RESEARCH_DBS, records }, null, 2));
    return records;
  };

  const latest = (records, fallback = DEFAULT_SEED) => records.find(Boolean) || fallback;
  const buildResearchContext = ({ storage } = {}) => {
    const success = latest(readRecords(storage, STORAGE_KEYS.success, []));
    const failure = latest(readRecords(storage, STORAGE_KEYS.failure, []));
    const jockey = latest(readRecords(storage, STORAGE_KEYS.jockey, []));
    const trainer = latest(readRecords(storage, STORAGE_KEYS.trainer, []));
    const distance = latest(readRecords(storage, STORAGE_KEYS.distance, []));
    const course = latest(readRecords(storage, STORAGE_KEYS.course, []));
    return {
      success,
      failure,
      jockey,
      trainer,
      distance,
      course,
      linkedResearchDbs: LINKED_RESEARCH_DBS,
      sourceCounts: Object.fromEntries(LINKED_RESEARCH_DBS.map((key) => [key, readRecords(storage, key, []).length]))
    };
  };

  const verify = (context) => ({
    step: "検証",
    target: `${context.course.course || context.success.course || DEFAULT_SEED.course} ${context.success.race || DEFAULT_SEED.race}`,
    successPattern: context.success.successPattern || context.success.successfulPrediction || DEFAULT_SEED.successfulPrediction,
    failurePattern: context.failure.failurePattern || context.failure.failedPrediction || DEFAULT_SEED.failedPrediction,
    memo: "成功パターンDBと失敗パターンDBを照合"
  });

  const analyze = (context) => ({
    step: "分析",
    course: context.course.course || context.success.course || DEFAULT_SEED.course,
    distance: context.distance.distance || context.course.bestDistance || context.success.distance || DEFAULT_SEED.distance,
    jockeySignal: context.jockey.strongPattern || context.jockey.memo || "騎手研究DBから強パターン抽出",
    trainerSignal: context.trainer.strongPattern || context.trainer.memo || "調教師研究DBから強パターン抽出",
    cause: context.failure.cause || "人気ゾーン過信と条件補正不足"
  });

  const learn = (analysis) => ({
    step: "学習",
    learnedRule: `${analysis.course}${analysis.distance}では${analysis.jockeySignal}と${analysis.trainerSignal}を優先し、${analysis.cause}を補正する`,
    confidenceGain: 6
  });

  const generateImprovement = (learning, context) => ({
    step: "改善案生成",
    proposal: `${learning.learnedRule}。神穴・危険人気馬・三連単構造を研究所AIに再接続する`,
    expectedReturnRate: Math.max(100, toNumber(context.success.returnRate, DEFAULT_SEED.returnRate), toNumber(context.course.returnRate, 0), toNumber(context.jockey.returnRate, 0))
  });

  const updateRule = (improvement, analysis) => ({
    step: "ルール更新",
    ruleId: `super-rule-${analysis.course}-${analysis.distance}`,
    category: ENGINE_NAME,
    course: analysis.course,
    distance: analysis.distance,
    oldRule: "Phase15 自己進化ルール",
    newRule: improvement.proposal,
    trigger: "Phase16-1 完全自動パイプライン",
    successRate: 78,
    returnRate: improvement.expectedReturnRate,
    confidence: 96,
    memo: "Super Self Evolution Engine が研究所AIと連携して更新"
  });

  const buildHistory = (rule, verification) => ({
    date: DEFAULT_SEED.date,
    phase: PHASE,
    engine: ENGINE_NAME,
    pipeline: PIPELINE_STEPS,
    target: verification.target,
    ruleId: rule.ruleId,
    update: rule.newRule,
    stableBase: STABLE_BASE,
    memo: "検証→分析→学習→改善案生成→ルール更新→履歴保存を自動実行"
  });

  const buildSuperSelfEvolutionEngine = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const context = buildResearchContext({ storage });
    const verification = verify(context);
    const analysis = analyze(context);
    const learning = learn(analysis);
    const improvement = generateImprovement(learning, context);
    const rule = updateRule(improvement, analysis);
    const history = buildHistory(rule, verification);
    return {
      version: VERSION,
      phase: PHASE,
      engine: ENGINE_NAME,
      stableBase: STABLE_BASE,
      preservedEngines: ["researchLabEngine", "selfEvolutionEngine", "secretaryEngine", "win5Engine", "profitEngine"],
      linkedResearchDbs: LINKED_RESEARCH_DBS,
      pipeline: PIPELINE_STEPS,
      context,
      verification,
      analysis,
      learning,
      improvement,
      rule,
      history,
      statusLabel: `${ENGINE_NAME}: ${PIPELINE_STEPS.join("→")} 自動化`
    };
  };

  const saveSuperSelfEvolutionHistory = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const engine = buildSuperSelfEvolutionEngine({ storage });
    writeRecords(storage, STORAGE_KEYS.rule, [engine.rule, ...readRecords(storage, STORAGE_KEYS.rule, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.selfEvolution, [engine.history, ...readRecords(storage, STORAGE_KEYS.selfEvolution, [])].slice(0, 300));
    writeRecords(storage, STORAGE_KEYS.history, [engine.history, ...readRecords(storage, STORAGE_KEYS.history, [])].slice(0, 300));
    return engine;
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };

  const renderSuperSelfEvolution = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const engine = buildSuperSelfEvolutionEngine({ storage });
    setText("phase16-super-self-evolution-status", engine.statusLabel, documentRef);
    setText("phase16-super-self-evolution-rule", engine.rule.newRule, documentRef);
    return engine;
  };

  const bindSuperSelfEvolution = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    renderSuperSelfEvolution({ storage, documentRef });
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindSuperSelfEvolution());
  const api = { VERSION, ENGINE_NAME, PHASE, STABLE_BASE, STORAGE_KEYS, PIPELINE_STEPS, LINKED_RESEARCH_DBS, buildResearchContext, verify, analyze, learn, generateImprovement, updateRule, buildHistory, buildSuperSelfEvolutionEngine, saveSuperSelfEvolutionHistory, renderSuperSelfEvolution, bindSuperSelfEvolution };
  if (typeof window !== "undefined") window.HashimotoSuperSelfEvolution = api;
  if (typeof module !== "undefined") module.exports = api;
})();
