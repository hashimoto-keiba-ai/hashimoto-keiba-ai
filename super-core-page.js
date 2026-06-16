(() => {
  const VERSION = "3.0";
  const CODE_NAME = "Hashimoto Super Core Engine v3.0";
  const RELEASE_STATUS = "Hashimoto Racing AI Version 3.0 Development";
  const STABLE_BASE = "Official Release v2.8";
  const PHASE = "Phase16";
  const ADDITION_TARGETS = [
    "超自己進化",
    "完全自動学習",
    "競馬場別統合AI",
    "資金管理AI強化",
    "研究所AI強化",
    "AI秘書強化",
    "未来予測エンジン"
  ];

  const coreModule = typeof require !== "undefined" ? require("./core-engine-page.js") : window.HashimotoRacingAiCoreEngine;
  const superSelfEvolutionModule = typeof require !== "undefined" ? require("./super-self-evolution-page.js") : window.HashimotoSuperSelfEvolution;
  const fullAutoLearningModule = typeof require !== "undefined" ? require("./full-auto-learning-page.js") : window.HashimotoFullAutoLearning;
  const futurePredictionModule = typeof require !== "undefined" ? require("./future-prediction-page.js") : window.HashimotoFuturePrediction;

  const buildSuperCoreEngine = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const core = coreModule.buildCoreEngine({ storage });
    const superSelfEvolution = superSelfEvolutionModule.buildSuperSelfEvolutionEngine({ storage });
    const fullAutoLearning = fullAutoLearningModule.buildFullAutoLearningEngine({ storage });
    const futurePrediction = futurePredictionModule.buildFuturePredictionEngine({ storage });
    return {
      version: VERSION,
      codeName: CODE_NAME,
      releaseStatus: RELEASE_STATUS,
      stableBase: STABLE_BASE,
      protectedRelease: core.engine,
      protectedReleaseStatus: core.releaseStatus,
      phase: PHASE,
      preservedEngines: ["researchLabEngine", "selfEvolutionEngine", "secretaryEngine", "win5Engine", "profitEngine"],
      phase16Engines: ["Super Self Evolution Engine", "Full Auto Learning Engine", "Future Prediction Engine"],
      modules: { ...core.modules, superSelfEvolution, fullAutoLearning, futurePrediction },
      additionTargets: ADDITION_TARGETS,
      dashboardLabels: {
        research: "研究所AI強化 / researchLabEngine維持",
        evolution: "超自己進化 / selfEvolutionEngine維持",
        secretary: "AI秘書強化 / secretaryEngine維持",
        win5: "WIN5 + 資金管理AI強化 / win5Engine維持",
        profit: "Profit ROI資金推移 / profitEngine維持",
        future: "未来予測エンジン準備",
        superSelfEvolution: superSelfEvolution.statusLabel,
        fullAutoLearning: fullAutoLearning.statusLabel,
        futurePrediction: futurePrediction.statusLabel
      },
      policy: "Official Release v2.8を永久保存版として保護し、既存機能を削除せずPhase16を追加開発する。"
    };
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };

  const renderSuperCoreEngine = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const superCore = buildSuperCoreEngine({ storage });
    setText("phase16-super-core-name", superCore.codeName, documentRef);
    setText("phase16-stable-base", superCore.stableBase, documentRef);
    setText("phase16-research-status", superCore.dashboardLabels.research, documentRef);
    setText("phase16-evolution-status", superCore.dashboardLabels.evolution, documentRef);
    setText("phase16-secretary-status", superCore.dashboardLabels.secretary, documentRef);
    setText("phase16-win5-status", superCore.dashboardLabels.win5, documentRef);
    setText("phase16-profit-status", superCore.dashboardLabels.profit, documentRef);
    setText("phase16-future-status", superCore.dashboardLabels.future, documentRef);
    setText("phase16-super-self-evolution-status", superCore.dashboardLabels.superSelfEvolution, documentRef);
    setText("phase16-super-self-evolution-rule", superCore.modules.superSelfEvolution.rule.newRule, documentRef);
    setText("phase16-full-auto-learning-status", superCore.dashboardLabels.fullAutoLearning, documentRef);
    setText("phase16-full-auto-learning-rule", superCore.modules.fullAutoLearning.learningRule.learnedRule, documentRef);
    setText("phase16-future-prediction-status", superCore.dashboardLabels.futurePrediction, documentRef);
    setText("phase16-future-prediction-summary", `${superCore.modules.futurePrediction.record.courseTrend.trend} / WIN5成功率${superCore.modules.futurePrediction.record.win5SuccessRate}% / 三連単成功率${superCore.modules.futurePrediction.record.trifectaSuccessRate}%`, documentRef);
    return superCore;
  };

  const bindSuperCoreEngine = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    renderSuperCoreEngine({ storage, documentRef });
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindSuperCoreEngine());
  const api = { VERSION, CODE_NAME, RELEASE_STATUS, STABLE_BASE, PHASE, ADDITION_TARGETS, buildSuperCoreEngine, renderSuperCoreEngine, bindSuperCoreEngine };
  if (typeof window !== "undefined") window.HashimotoSuperCoreEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})();
