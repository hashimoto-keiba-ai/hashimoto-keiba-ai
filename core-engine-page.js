(() => {
  const VERSION = "2.8";
  const CORE_ENGINE_NAME = "Hashimoto Racing AI Core Engine v2.8";
  const STABLE_BASE = "Official Release v2.8";
  const RELEASE_STATUS = "Official Release v2.8";
  const researchModule = typeof require !== "undefined" ? require("./research-lab-page.js") : window.HashimotoResearchLab;
  const evolutionModule = typeof require !== "undefined" ? require("./self-evolution-page.js") : window.HashimotoSelfEvolution;
  const secretaryModule = typeof require !== "undefined" ? require("./secretary-page.js") : window.HashimotoAiSecretary;
  const win5Module = typeof require !== "undefined" ? require("./win5-page.js") : window.HashimotoAutomatedWin5;
  const profitModule = typeof require !== "undefined" ? require("./profit-page.js") : window.HashimotoProfitExplorer;

  const buildCoreEngine = ({ storage = typeof window !== "undefined" ? window.localStorage : undefined } = {}) => {
    const research = researchModule.buildResearchLabEngine({ storage });
    const selfEvolution = evolutionModule.buildFullAutoEvolutionPipeline({ storage });
    const secretary = secretaryModule.buildSecretaryEngine({ storage });
    const win5 = win5Module.buildWin5Engine({});
    const profit = profitModule.analyzeProfitEngine({ storage });
    return {
      version: VERSION,
      releaseStatus: RELEASE_STATUS,
      stableBase: STABLE_BASE,
      engine: CORE_ENGINE_NAME,
      phase: "Phase15 Official",
      modules: { research, selfEvolution, secretary, win5, profit },
      dashboardLabels: {
        research: research.engine,
        selfEvolution: selfEvolution.steps.join("→"),
        secretary: secretary.dailyReport,
        win5: `${win5.hitRate}% / ${win5.returnRate}%`,
        profit: `ROI ${profit.roi}% / 回収率 ${profit.averageReturnRate}%`
      },
      completionState: "永久保存版"
    };
  };

  const setText = (id, value, documentRef = document) => {
    const target = documentRef.getElementById(id);
    if (target) target.textContent = value;
  };

  const renderCoreEngine = ({ storage = window.localStorage, documentRef = document } = {}) => {
    const core = buildCoreEngine({ storage });
    setText("phase15-research-status", core.dashboardLabels.research, documentRef);
    setText("phase15-evolution-status", core.dashboardLabels.selfEvolution, documentRef);
    setText("phase15-secretary-status", core.dashboardLabels.secretary, documentRef);
    setText("phase15-win5-status", core.dashboardLabels.win5, documentRef);
    setText("phase15-profit-status", core.dashboardLabels.profit, documentRef);
    return core;
  };

  const bindCoreEngine = ({ storage = window.localStorage, documentRef = document } = {}) => {
    if (!documentRef?.getElementById) return;
    renderCoreEngine({ storage, documentRef });
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindCoreEngine());
  const api = { VERSION, CORE_ENGINE_NAME, STABLE_BASE, RELEASE_STATUS, buildCoreEngine, renderCoreEngine, bindCoreEngine };
  if (typeof window !== "undefined") window.HashimotoRacingAiCoreEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})();
