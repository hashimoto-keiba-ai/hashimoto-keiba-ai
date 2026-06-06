(function () {
  const yenFormatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  });

  const fallbackDatabase = {
    databaseName: "fundManagementDatabase",
    phase: "Phase10-2",
    bankroll: 100000,
    records: [
      {
        date: "2026-06-06",
        racecourse: "Tokyo",
        raceName: "Phase10-2 Capital Control Stakes",
        aiScore: 87,
        hitProbability: 32.5,
        expectedReturn: 1.92,
        riskScore: 42,
        raceCategory: "A",
        recommendedBet: "Win + Trifecta saver",
        recommendedBudget: 5200,
        kellyFraction: 0.052,
        confidence: 83,
        reason: "High AI score, positive expected return, controlled risk, and support from Trifecta/Kami-Ana signals."
      },
      {
        date: "2026-06-06",
        racecourse: "Kyoto",
        raceName: "Phase10-2 Normal Value Race",
        aiScore: 74,
        hitProbability: 24.8,
        expectedReturn: 1.48,
        riskScore: 55,
        raceCategory: "B",
        recommendedBet: "Place + Exacta",
        recommendedBudget: 2600,
        kellyFraction: 0.026,
        confidence: 68,
        reason: "Balanced value with acceptable risk and no severe danger-popular warning."
      }
    ]
  };

  const sourceConnections = {
    aiIndexDatabase: "aiRanking",
    win5Database: "data/win5Database.json",
    trifectaDatabase: "data/trifectaDatabase.json",
    dangerPopularHorseDatabase: "riskyFavoriteRanking",
    kamiAnaDatabase: "longshotRanking"
  };

  const modeProfiles = {
    Conservative: {
      kellyMultiplier: 0.45,
      maxBudgetRate: 0.035,
      riskTolerance: 0.72
    },
    Balanced: {
      kellyMultiplier: 0.7,
      maxBudgetRate: 0.06,
      riskTolerance: 1
    },
    Aggressive: {
      kellyMultiplier: 1,
      maxBudgetRate: 0.095,
      riskTolerance: 1.24
    }
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function classifyRace(record) {
    const aiScore = Number(record.aiScore) || 0;
    const hitProbability = Number(record.hitProbability) || 0;
    const expectedReturn = Number(record.expectedReturn) || 0;
    const riskScore = Number(record.riskScore) || 100;
    const confidence = Number(record.confidence) || 0;
    const blendedScore = aiScore * 0.36 + hitProbability * 0.52 + expectedReturn * 12 + confidence * 0.22 - riskScore * 0.28;

    if (expectedReturn < 1.05 || riskScore >= 78 || blendedScore < 36) {
      return "D";
    }
    if (aiScore >= 82 && hitProbability >= 30 && expectedReturn >= 1.55 && riskScore <= 50) {
      return "A";
    }
    if (aiScore >= 68 && hitProbability >= 21 && expectedReturn >= 1.25 && riskScore <= 65) {
      return "B";
    }
    return "C";
  }

  function raceCategoryLabel(category) {
    return {
      A: "Strong Bet",
      B: "Normal Bet",
      C: "Small Bet",
      D: "Skip"
    }[category] || "Skip";
  }

  function calculateKellyFraction(record) {
    const probability = clamp((Number(record.hitProbability) || 0) / 100, 0, 1);
    const expectedReturn = Number(record.expectedReturn) || 1;
    const oddsEdge = Math.max(0.01, expectedReturn - 1);
    const rawKelly = (probability * expectedReturn - 1) / oddsEdge;
    const storedKelly = Number(record.kellyFraction);
    return clamp(Number.isFinite(storedKelly) ? storedKelly : rawKelly, 0, 0.14);
  }

  function calculateMode(record, modeName, bankroll) {
    const profile = modeProfiles[modeName] || modeProfiles.Balanced;
    const category = classifyRace(record);
    const categoryBudgetScale = { A: 1, B: 0.62, C: 0.28, D: 0 };
    const riskScore = Number(record.riskScore) || 100;
    const riskAdjustment = clamp((100 - riskScore) / 68, 0.18, 1.15) * profile.riskTolerance;
    const baseKelly = calculateKellyFraction(record);
    const budgetCap = bankroll * profile.maxBudgetRate;
    const kellyBudget = bankroll * baseKelly * profile.kellyMultiplier * riskAdjustment;
    const recommendedBudget = Math.round(
      Math.min(budgetCap, kellyBudget) * (categoryBudgetScale[category] || 0)
    );
    const expectedRoi = Math.max(0, (Number(record.expectedReturn) || 1) - 1);
    const expectedProfit = Math.round(recommendedBudget * expectedRoi);
    const riskLevel = riskScore >= 70 ? "High" : riskScore >= 50 ? "Medium" : "Low";

    return {
      mode: modeName,
      category,
      categoryLabel: raceCategoryLabel(category),
      recommendedBudget,
      expectedRoi: Number((expectedRoi * 100).toFixed(1)),
      expectedProfit,
      riskLevel,
      kellyFraction: Number((baseKelly * profile.kellyMultiplier).toFixed(4))
    };
  }

  function enrichRecord(record, bankroll) {
    const modes = Object.keys(modeProfiles).map((modeName) => calculateMode(record, modeName, bankroll));
    const balancedMode = modes.find((mode) => mode.mode === "Balanced");
    const category = classifyRace(record);

    return {
      ...record,
      raceCategory: category,
      raceCategoryLabel: raceCategoryLabel(category),
      recommendedBudget: balancedMode.recommendedBudget,
      expectedRoi: balancedMode.expectedRoi,
      expectedProfit: balancedMode.expectedProfit,
      riskLevel: balancedMode.riskLevel,
      kellyFraction: balancedMode.kellyFraction,
      modes,
      sourceConnections
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const bankroll = Number(source.bankroll) || 100000;
    const records = (source.records || []).map((record) => enrichRecord(record, bankroll));
    const bestBet = records
      .filter((record) => record.raceCategory !== "D")
      .sort((left, right) => {
        const leftScore = left.expectedProfit + left.confidence * 8 - left.riskScore * 4;
        const rightScore = right.expectedProfit + right.confidence * 8 - right.riskScore * 4;
        return rightScore - leftScore;
      })[0];

    return {
      databaseName: source.databaseName || "fundManagementDatabase",
      phase: source.phase || "Phase10-2",
      bankroll,
      sourceConnections,
      modes: modeProfiles,
      records,
      todayWidget: bestBet
        ? {
            title: `${bestBet.racecourse} ${bestBet.raceName}`,
            recommendedBudget: bestBet.recommendedBudget,
            expectedRoi: bestBet.expectedRoi,
            confidence: Number(bestBet.confidence) || 0,
            category: `${bestBet.raceCategory} = ${bestBet.raceCategoryLabel}`
          }
        : null
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function renderModes(record) {
    const targets = {
      Conservative: "phase102-conservative-mode",
      Balanced: "phase102-balanced-mode",
      Aggressive: "phase102-aggressive-mode"
    };

    record.modes.forEach((mode) => {
      const element = document.getElementById(targets[mode.mode]);
      if (!element) {
        return;
      }
      element.innerHTML = `
        <article>
          <span>${mode.mode}</span>
          <strong>${yenFormatter.format(mode.recommendedBudget)}</strong>
          <em>ROI ${mode.expectedRoi}% / Profit ${yenFormatter.format(mode.expectedProfit)}</em>
          <small>${mode.categoryLabel} / ${mode.riskLevel}</small>
        </article>`;
    });
  }

  function renderTable(records) {
    const table = document.getElementById("phase102-fund-database");
    if (!table) {
      return;
    }
    table.innerHTML = records
      .map(
        (record) => `
          <tr>
            <td>${record.date}</td>
            <td>${record.racecourse}</td>
            <td>${record.raceName}</td>
            <td>${record.aiScore}</td>
            <td>${Number(record.hitProbability).toFixed(1)}%</td>
            <td>${Number(record.expectedReturn).toFixed(2)}x</td>
            <td>${record.riskScore}</td>
            <td>${record.raceCategory} / ${record.raceCategoryLabel}</td>
            <td>${record.recommendedBet}</td>
            <td>${yenFormatter.format(record.recommendedBudget)}</td>
            <td>${Number(record.kellyFraction).toFixed(4)}</td>
            <td>${record.confidence}%</td>
            <td>${record.reason}</td>
          </tr>`
      )
      .join("");
  }

  function renderDashboard(report) {
    if (!report.todayWidget) {
      return;
    }
    setText("phase102-widget-title", report.todayWidget.title);
    setText("phase102-widget-budget", yenFormatter.format(report.todayWidget.recommendedBudget));
    setText("phase102-widget-roi", `${report.todayWidget.expectedRoi}%`);
    setText("phase102-widget-confidence", `${report.todayWidget.confidence}%`);
    setText("phase102-widget-category", report.todayWidget.category);
  }

  function renderPage(report) {
    const best = report.records[0];
    renderDashboard(report);
    if (!best) {
      return;
    }
    setText("phase102-fund-bankroll", yenFormatter.format(report.bankroll));
    setText("phase102-fund-best-race", `${best.racecourse} ${best.raceName}`);
    setText("phase102-fund-risk", best.riskLevel);
    setText("phase102-fund-profit", yenFormatter.format(best.expectedProfit));
    setText("phase102-fund-connections", Object.keys(sourceConnections).join(" / "));
    renderModes(best);
    renderTable(report.records);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") {
      return fallbackDatabase;
    }
    try {
      const response = await fetch("data/fundManagementDatabase.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("fundManagementDatabase fetch failed");
      }
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderPage(report);
    window.HashimotoPhase102FundManagementReport = report;
  }

  window.HashimotoPhase102FundManagementEngine = {
    buildDashboard,
    calculateKellyFraction,
    calculateMode,
    classifyRace,
    fallbackDatabase,
    modeProfiles,
    sourceConnections
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
})();
