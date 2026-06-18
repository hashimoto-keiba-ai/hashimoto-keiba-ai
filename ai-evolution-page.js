(function (global) {
  "use strict";

  const DEVELOPMENT_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const PHASE = "Phase18-3";
  const SYSTEM_NAME = "AI Evolution Engine";
  const PROTECTED_SYSTEM = "Hashimoto Racing OS v4.0 Final";
  const INTEGRATED_SYSTEMS = Object.freeze(["Self Expansion System", "Auto Development Engine"]);
  const DATABASES = Object.freeze({
    evolution: "ai-evolution-db.json",
    history: "ai-evolution-history-db.json",
    rules: "ai-evolution-rule-db.json",
    priority: "ai-evolution-priority-db.json",
    proposal: "ai-evolution-proposal-db.json"
  });
  const PRIORITY_WEIGHTS = Object.freeze({
    importance: 0.25,
    urgency: 0.20,
    roiImpact: 0.20,
    courseImpact: 0.12,
    win5Impact: 0.10,
    maintainability: 0.13
  });

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.records)) return value.records;
    return [];
  }

  function latest(value) {
    const records = asArray(value);
    return records[records.length - 1] || (value && typeof value === "object" ? value : {});
  }

  function number(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(number(value, 0))));
  }

  function average(records, selector) {
    if (!records.length) return 0;
    return Math.round(records.reduce((sum, item) => sum + clamp(selector(item)), 0) / records.length);
  }

  function includesAll(source, expected) {
    const text = String(source || "");
    return expected.every((item) => text.includes(item));
  }

  function diagnoseEvolution(input) {
    const state = input || {};
    const successPatterns = asArray(state.successPatterns);
    const failurePatterns = asArray(state.failurePatterns);
    const development = latest(state.autoDevelopment);
    const expansionHistory = asArray(state.selfExpansionHistory);
    const successScore = average(successPatterns, (item) => item.effectiveness ?? item.score ?? item.roiImprovement ?? 70);
    const failureRisk = average(failurePatterns, (item) => item.severity ?? item.risk ?? item.recurrence ?? 60);
    const uiLabels = ["AI Evolution Engine", "Evolution Proposal", "Evolution Priority Ranking"];
    const menuLabels = ["自己進化", "進化案生成", "優先順位", "成功失敗学習", "v5.0進化センター"];
    const protectedRelease = String(state.officialRelease || OFFICIAL_RELEASE) === OFFICIAL_RELEASE;
    const racingOsProtected = state.racingOsProtected !== false;
    return {
      phase: PHASE,
      diagnosedAt: (state.now || new Date()).toISOString(),
      successPatternAnalysis: {
        count: successPatterns.length,
        score: successScore,
        strongest: successPatterns.slice().sort((a, b) => number(b.effectiveness ?? b.score, 0) - number(a.effectiveness ?? a.score, 0))[0] || null
      },
      failurePatternAnalysis: {
        count: failurePatterns.length,
        riskScore: failureRisk,
        highestRisk: failurePatterns.slice().sort((a, b) => number(b.severity ?? b.risk, 0) - number(a.severity ?? a.risk, 0))[0] || null
      },
      autoDevelopmentAnalysis: {
        status: development.diagnosis?.status || development.status || "NOT_SCANNED",
        missingCount: number(development.diagnosis?.totalMissing ?? development.totalMissing, 0),
        candidates: development.candidates || {}
      },
      selfExpansionAnalysis: {
        historyCount: expansionHistory.length,
        latest: expansionHistory[expansionHistory.length - 1] || null,
        status: expansionHistory.length ? "ANALYZED" : "NO_HISTORY"
      },
      protectionAnalysis: {
        officialRelease: OFFICIAL_RELEASE,
        officialReleaseProtected: protectedRelease,
        racingOs: PROTECTED_SYSTEM,
        racingOsProtected
      },
      interfaceEvolutionAnalysis: {
        dashboard: includesAll(state.dashboardHtml, uiLabels),
        privateLocal: includesAll(state.privateLocalHtml, uiLabels),
        oneTapMenu: includesAll(state.privateLocalHtml, menuLabels)
      }
    };
  }

  function baseMetrics(overrides) {
    return Object.assign({
      importance: 80,
      urgency: 70,
      roiImpact: 70,
      courseImpact: 65,
      win5Impact: 60,
      maintainability: 75
    }, overrides || {});
  }

  function generateEvolutionProposals(diagnosis) {
    const candidate = diagnosis.autoDevelopmentAnalysis.candidates;
    const failure = diagnosis.failurePatternAnalysis.highestRisk || {};
    const success = diagnosis.successPatternAnalysis.strongest || {};
    const protectionNeeded = !diagnosis.protectionAnalysis.officialReleaseProtected || !diagnosis.protectionAnalysis.racingOsProtected;
    return [
      {
        category: "engine",
        target: candidate.nextEngine || failure.engine || "Development Orchestration Engine",
        reason: "自己開発診断と失敗パターンから次の改善対象を選定",
        metrics: baseMetrics({ importance: 94, urgency: diagnosis.autoDevelopmentAnalysis.missingCount ? 92 : 72, roiImpact: 82 })
      },
      {
        category: "database",
        target: candidate.nextDatabase || failure.database || "ai-evolution-knowledge-db.json",
        reason: "成功・失敗パターンの再利用精度を強化",
        metrics: baseMetrics({ importance: 88, urgency: 76, maintainability: 92 })
      },
      {
        category: "research",
        target: success.research || "競馬場別成功失敗因果研究",
        reason: "競馬場別効果と回収率改善要因を研究へ接続",
        metrics: baseMetrics({ importance: 84, roiImpact: 90, courseImpact: 96 })
      },
      {
        category: "dashboard",
        target: candidate.nextDashboardPanel || "Evolution Impact Monitor",
        reason: "進化案と優先順位をDashboardで可視化",
        metrics: baseMetrics({ importance: 78, urgency: diagnosis.interfaceEvolutionAnalysis.dashboard ? 55 : 88, maintainability: 86 })
      },
      {
        category: "privateLocal",
        target: candidate.nextPrivateLocalMenu || "Evolution Research Center",
        reason: "Private Localから進化診断へ一発接続",
        metrics: baseMetrics({ importance: 72, urgency: diagnosis.interfaceEvolutionAnalysis.privateLocal ? 50 : 86, maintainability: 82 })
      },
      {
        category: "test",
        target: candidate.nextTest || "tests/evolutionImpactEngine.test.js",
        reason: "進化ロジックと保護条件の回帰を防止",
        metrics: baseMetrics({ importance: 91, urgency: 82, roiImpact: 55, maintainability: 98 })
      },
      {
        category: "protection",
        target: protectionNeeded ? "Official Release v2.8 / Racing OS v4.0 Final" : "Phase18-1 / Phase18-2 integration",
        reason: "永久保存版と既存Version 5.0基盤を継続保護",
        metrics: baseMetrics({ importance: 100, urgency: protectionNeeded ? 100 : 75, roiImpact: 45, maintainability: 100 })
      }
    ];
  }

  function calculatePriority(metrics) {
    return Math.round(Object.entries(PRIORITY_WEIGHTS).reduce((sum, entry) => {
      const key = entry[0];
      const weight = entry[1];
      return sum + clamp(metrics[key]) * weight;
    }, 0) * 10) / 10;
  }

  function rankEvolutionProposals(proposals) {
    return (proposals || []).map((proposal) => ({
      ...proposal,
      priorityScore: calculatePriority(proposal.metrics)
    })).sort((a, b) => b.priorityScore - a.priorityScore || a.category.localeCompare(b.category))
      .map((proposal, index) => ({ ...proposal, rank: index + 1 }));
  }

  function buildReport(input) {
    const diagnosis = diagnoseEvolution(input);
    const proposals = generateEvolutionProposals(diagnosis);
    const priorities = rankEvolutionProposals(proposals);
    return {
      system: SYSTEM_NAME,
      phase: PHASE,
      developmentVersion: DEVELOPMENT_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      protectedSystems: ["Official Release v2.8", PROTECTED_SYSTEM, "Self Expansion System", "Auto Development Engine"],
      status: "ON",
      proposalStatus: "ON",
      priorityRankingStatus: "ON",
      patternLearningStatus: "ON",
      diagnosis,
      proposals,
      priorities,
      createdAt: diagnosis.diagnosedAt
    };
  }

  function readJson(storage, key, fallback) {
    try {
      const raw = storage && storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function collectStorageInput(storage, extras) {
    return Object.assign({
      successPatterns: readJson(storage, "success-pattern-db.json", []),
      failurePatterns: readJson(storage, "failure-pattern-db.json", []),
      autoDevelopment: readJson(storage, "auto-development-db.json", {}),
      selfExpansionHistory: readJson(storage, "self-expansion-history-db.json", []),
      officialRelease: storage && storage.getItem ? storage.getItem("releaseVersion") || OFFICIAL_RELEASE : OFFICIAL_RELEASE,
      racingOsProtected: true
    }, extras || {});
  }

  function writeJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function saveEvolution(storage, input) {
    if (!storage || typeof storage.setItem !== "function") throw new Error("localStorage is required");
    const report = buildReport(input || collectStorageInput(storage));
    const previous = readJson(storage, DATABASES.history, []);
    const history = Array.isArray(previous) ? previous.slice(-99) : [];
    history.push({
      date: report.createdAt,
      phase: PHASE,
      proposalCount: report.proposals.length,
      topPriority: report.priorities[0]?.target || "",
      priorityScore: report.priorities[0]?.priorityScore || 0
    });
    writeJson(storage, DATABASES.evolution, report);
    writeJson(storage, DATABASES.history, history);
    writeJson(storage, DATABASES.rules, { phase: PHASE, weights: PRIORITY_WEIGHTS, protectedSystems: report.protectedSystems });
    writeJson(storage, DATABASES.priority, { phase: PHASE, priorities: report.priorities, generatedAt: report.createdAt });
    writeJson(storage, DATABASES.proposal, { phase: PHASE, proposals: report.proposals, generatedAt: report.createdAt });
    storage.setItem("releaseVersion", OFFICIAL_RELEASE);
    storage.setItem("releaseStatus", "Official Release v" + OFFICIAL_RELEASE);
    return report;
  }

  function setText(documentRef, id, value) {
    const node = documentRef && documentRef.getElementById(id);
    if (node) node.textContent = String(value);
  }

  function collectBrowserInput(documentRef, storage) {
    const html = documentRef && documentRef.documentElement ? documentRef.documentElement.outerHTML : "";
    return collectStorageInput(storage, { dashboardHtml: html, privateLocalHtml: html });
  }

  function renderEvolution(documentRef, report) {
    const value = report || buildReport({ officialRelease: OFFICIAL_RELEASE, racingOsProtected: true });
    setText(documentRef, "ai-evolution-status", "AI Evolution Engine ON");
    setText(documentRef, "ai-evolution-proposal", "Self Evolution Proposal ON");
    setText(documentRef, "ai-evolution-ranking", "Evolution Priority Ranking ON");
    setText(documentRef, "ai-evolution-learning", "Success / Failure Pattern Learning ON");
    setText(documentRef, "ai-evolution-development", "Auto Development Engine Integrated");
    setText(documentRef, "ai-evolution-expansion", "Self Expansion System Integrated");
    setText(documentRef, "ai-evolution-release", "Official Release v2.8 Protected");
    setText(documentRef, "ai-evolution-racing-os", "Racing OS v4.0 Final Integrated");
    setText(documentRef, "ai-evolution-top-target", value.priorities[0]?.target || "--");
    setText(documentRef, "ai-evolution-top-score", value.priorities[0]?.priorityScore || 0);
    setText(documentRef, "ai-evolution-proposal-count", value.proposals.length);
    return value;
  }

  function bindEvolution(documentRef, storage) {
    renderEvolution(documentRef);
    const button = documentRef && documentRef.getElementById("run-ai-evolution");
    if (button) button.addEventListener("click", function () {
      const report = saveEvolution(storage, collectBrowserInput(documentRef, storage));
      renderEvolution(documentRef, report);
      setText(documentRef, "ai-evolution-message", "自己進化案と優先順位を保存しました");
    });
  }

  const api = {
    DEVELOPMENT_VERSION,
    OFFICIAL_RELEASE,
    PHASE,
    SYSTEM_NAME,
    PROTECTED_SYSTEM,
    INTEGRATED_SYSTEMS,
    DATABASES,
    PRIORITY_WEIGHTS,
    diagnoseEvolution,
    generateEvolutionProposals,
    calculatePriority,
    rankEvolutionProposals,
    buildReport,
    collectStorageInput,
    saveEvolution,
    renderEvolution,
    bindEvolution
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HashimotoAiEvolutionEngine = api;
  if (global.document) {
    const start = function () { bindEvolution(global.document, global.localStorage); };
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
