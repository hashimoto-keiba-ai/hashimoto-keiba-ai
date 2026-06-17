(function () {
  const fallbackDatabase = {
    databaseName: "godRaceDatabase",
    phase: "Phase11-2",
    records: [
      { date: "2026-06-06", racecourse: "Tokyo", race: "Tokyo 11R Future Simulation Stakes", raceScore: 0, expectedROI: 186.4, simulationConfidence: 91, aiIndexConfidence: 88, dangerPopularRisk: 22, kamiAnaPotential: 76, win5Value: 84, trifectaValue: 92, expectedProfit: 32400, godRaceFlag: false },
      { date: "2026-06-06", racecourse: "Kyoto", race: "Kyoto 12R WIN5 Finish", raceScore: 0, expectedROI: 154.8, simulationConfidence: 84, aiIndexConfidence: 86, dangerPopularRisk: 28, kamiAnaPotential: 68, win5Value: 95, trifectaValue: 80, expectedProfit: 28600, godRaceFlag: false },
      { date: "2026-06-06", racecourse: "Chukyo", race: "Chukyo 10R Trifecta Logic", raceScore: 0, expectedROI: 132.5, simulationConfidence: 79, aiIndexConfidence: 81, dangerPopularRisk: 35, kamiAnaPotential: 82, win5Value: 66, trifectaValue: 91, expectedProfit: 21400, godRaceFlag: false },
      { date: "2026-06-06", racecourse: "Hanshin", race: "Hanshin 9R Caution Trial", raceScore: 0, expectedROI: 74.2, simulationConfidence: 62, aiIndexConfidence: 65, dangerPopularRisk: 72, kamiAnaPotential: 44, win5Value: 48, trifectaValue: 51, expectedProfit: 4200, godRaceFlag: false }
    ]
  };

  const sourceConnections = {
    predictionDatabase: "data/predictions.json",
    resultVerificationDatabase: "data/results.json",
    aiIndexDatabase: "aiRanking",
    win5Database: "data/win5Database.json",
    trifectaDatabase: "data/trifectaDatabase.json",
    roiDatabase: "data/roiDatabase.json",
    raceFutureSimulatorDatabase: "data/raceSimulationDatabase.json"
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function calculateRaceScore(record) {
    const roiScore = clamp(Number(record.expectedROI) / 2.1, 0, 100);
    const profitScore = clamp(Number(record.expectedProfit) / 420, 0, 100);
    const dangerSafety = 100 - clamp(Number(record.dangerPopularRisk), 0, 100);
    const score =
      roiScore * 0.2 +
      Number(record.simulationConfidence) * 0.18 +
      Number(record.aiIndexConfidence) * 0.16 +
      dangerSafety * 0.12 +
      Number(record.kamiAnaPotential) * 0.1 +
      Number(record.win5Value) * 0.1 +
      Number(record.trifectaValue) * 0.1 +
      profitScore * 0.04;
    return Number(clamp(score, 0, 100).toFixed(1));
  }

  function classifyRace(score) {
    if (score >= 90) return "God Race";
    if (score >= 80) return "Strong Race";
    if (score >= 70) return "Good Race";
    return "Skip";
  }

  function enrichRecord(record) {
    const raceScore = calculateRaceScore(record);
    return {
      ...record,
      raceScore,
      raceClass: classifyRace(raceScore),
      godRaceFlag: raceScore >= 90
    };
  }

  function topBy(records, field, limit) {
    return records.slice().sort((left, right) => Number(right[field]) - Number(left[field])).slice(0, limit);
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = (source.records || []).map(enrichRecord).sort((left, right) => right.raceScore - left.raceScore);
    return {
      databaseName: source.databaseName || "godRaceDatabase",
      phase: source.phase || "Phase11-2",
      sourceConnections,
      records,
      summary: {
        topGodRaces: records.filter((record) => record.raceClass === "God Race").slice(0, 10),
        topExpectedROI: topBy(records, "expectedROI", 10),
        topExpectedProfit: topBy(records, "expectedProfit", 10),
        topWIN5Opportunities: topBy(records, "win5Value", 10),
        topTrifectaOpportunities: topBy(records, "trifectaValue", 10),
        bestRace: records[0],
        godRaceCount: records.filter((record) => record.godRaceFlag).length
      }
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderCards(id, records, metricLabel, metricField) {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = records.map((record) => `<article><span>${record.racecourse} ${record.race}</span><strong>${record[metricField]}</strong><em>${metricLabel} / ${record.raceClass}</em><small>Score ${record.raceScore} / Profit ${record.expectedProfit}</small></article>`).join("");
  }

  function renderTable(records) {
    const table = document.getElementById("phase112-god-race-database");
    if (!table) return;
    table.innerHTML = records.map((record) => `<tr><td>${record.date}</td><td>${record.racecourse}</td><td>${record.race}</td><td>${record.raceScore}</td><td>${record.expectedROI}%</td><td>${record.simulationConfidence}</td><td>${record.aiIndexConfidence}</td><td>${record.dangerPopularRisk}</td><td>${record.kamiAnaPotential}</td><td>${record.win5Value}</td><td>${record.trifectaValue}</td><td>${record.expectedProfit}</td><td>${record.godRaceFlag ? "God Race" : record.raceClass}</td></tr>`).join("");
  }

  function renderDashboard(report) {
    const best = report.summary.bestRace;
    setText("phase112-widget-race", `${best.racecourse} ${best.race}`);
    setText("phase112-widget-score", `${best.raceScore}`);
    setText("phase112-widget-class", best.raceClass);
    setText("phase112-widget-roi", `${best.expectedROI}%`);
    setText("phase112-widget-profit", `${best.expectedProfit}`);
    setText("phase112-widget-count", `${report.summary.godRaceCount}`);
    setText("phase112-connections", Object.keys(sourceConnections).join(" / "));
  }

  function renderPage(report) {
    renderDashboard(report);
    renderCards("phase112-top-god-races", report.summary.topGodRaces.length ? report.summary.topGodRaces : report.records.slice(0, 10), "Race Score", "raceScore");
    renderCards("phase112-top-roi", report.summary.topExpectedROI, "Expected ROI", "expectedROI");
    renderCards("phase112-top-profit", report.summary.topExpectedProfit, "Expected Profit", "expectedProfit");
    renderCards("phase112-top-win5", report.summary.topWIN5Opportunities, "WIN5 Value", "win5Value");
    renderCards("phase112-top-trifecta", report.summary.topTrifectaOpportunities, "Trifecta Value", "trifectaValue");
    renderTable(report.records);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch("data/godRaceDatabase.json", { cache: "no-store" });
      if (!response.ok) throw new Error("godRaceDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderPage(report);
    window.HashimotoPhase112GodRaceReport = report;
  }

  window.HashimotoPhase112GodRaceEngine = {
    buildDashboard,
    calculateRaceScore,
    classifyRace,
    fallbackDatabase,
    sourceConnections
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
