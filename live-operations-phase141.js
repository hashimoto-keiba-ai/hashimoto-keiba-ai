(function () {
  const racecourses = ["Tokyo", "Nakayama", "Hanshin", "Kyoto", "Chukyo", "Fukushima", "Niigata", "Kokura", "Hakodate", "Sapporo"];
  const integratedSystems = [
    "WIN5 AI",
    "Trifecta AI",
    "ROI Engine",
    "Fund Management",
    "Self Learning",
    "Race Future Simulator",
    "God Race Detection",
    "Command Center"
  ];
  const sourceConnections = {
    liveOperationsDatabase: "data/liveOperationsDatabase.json",
    win5Database: "data/win5Database.json",
    trifectaDatabase: "data/trifectaDatabase.json",
    roiDatabase: "data/roiDatabase.json",
    fundManagementDatabase: "data/fundManagementDatabase.json",
    learningDatabase: "data/learningDatabase.json",
    raceSimulationDatabase: "data/raceSimulationDatabase.json",
    godRaceDatabase: "data/godRaceDatabase.json",
    commandCenter: "command-center.html"
  };
  const fallbackDatabase = {
    databaseName: "liveOperationsDatabase",
    phase: "Phase14-1",
    operationDate: "2026-06-06",
    racecourses: [
      { name: "Tokyo", status: "Live", raceCount: 12, topRace: "Tokyo 11R Future Simulation Stakes", readiness: 94 },
      { name: "Nakayama", status: "Standby", raceCount: 0, topRace: "Next meeting pending", readiness: 72 },
      { name: "Hanshin", status: "Watch", raceCount: 8, topRace: "Hanshin 9R Caution Trial", readiness: 76 },
      { name: "Kyoto", status: "Live", raceCount: 12, topRace: "Kyoto 12R WIN5 Finish", readiness: 91 },
      { name: "Chukyo", status: "Live", raceCount: 10, topRace: "Chukyo 10R Trifecta Logic", readiness: 85 },
      { name: "Fukushima", status: "Standby", raceCount: 6, topRace: "Fukushima Value Sprint", readiness: 74 },
      { name: "Niigata", status: "Standby", raceCount: 5, topRace: "Niigata Outside Bias", readiness: 73 },
      { name: "Kokura", status: "Watch", raceCount: 7, topRace: "Kokura 9R Trifecta Risk", readiness: 70 },
      { name: "Hakodate", status: "Live", raceCount: 8, topRace: "Hakodate Exacta Value", readiness: 82 },
      { name: "Sapporo", status: "Standby", raceCount: 0, topRace: "Next meeting pending", readiness: 68 }
    ],
    systems: [
      { name: "WIN5 AI", status: "Live", score: 95, records: 1, route: "win5Database" },
      { name: "Trifecta AI", status: "Live", score: 92, records: 1, route: "trifectaDatabase" },
      { name: "ROI Engine", status: "Live", score: 90, records: 3, route: "roiDatabase" },
      { name: "Fund Management", status: "Live", score: 88, records: 1, route: "fundManagementDatabase" },
      { name: "Self Learning", status: "Live", score: 84, records: 2, route: "learningDatabase" },
      { name: "Race Future Simulator", status: "Live", score: 91, records: 2, route: "raceSimulationDatabase" },
      { name: "God Race Detection", status: "Live", score: 93, records: 2, route: "godRaceDatabase" },
      { name: "Command Center", status: "Live", score: 96, records: 12, route: "commandCenter" }
    ],
    liveRaces: [
      { racecourse: "Tokyo", race: "Tokyo 11R Future Simulation Stakes", raceScore: 94, expectedROI: 186.4, hitProbability: 18.6, expectedProfit: 32400, recommendedSystem: "God Race Detection", recommendedAction: "Trifecta + WIN5 anchor" },
      { racecourse: "Kyoto", race: "Kyoto 12R WIN5 Finish", raceScore: 91, expectedROI: 154.8, hitProbability: 21.4, expectedProfit: 28600, recommendedSystem: "WIN5 AI", recommendedAction: "WIN5 live confirmation" },
      { racecourse: "Chukyo", race: "Chukyo 10R Trifecta Logic", raceScore: 83, expectedROI: 132.5, hitProbability: 16.8, expectedProfit: 21400, recommendedSystem: "Trifecta AI", recommendedAction: "Standard Mode ticket check" }
    ]
  };

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function average(items, field) {
    const values = items.map((item) => Number(item[field])).filter(Number.isFinite);
    if (!values.length) return 0;
    return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1));
  }

  function sortByNumber(field) {
    return (left, right) => Number(right[field] || 0) - Number(left[field] || 0);
  }

  function buildCoverage(racecourseRecords) {
    const recordsByName = new Map(asArray(racecourseRecords).map((record) => [record.name, record]));
    return racecourses.map((name) => ({
      name,
      status: recordsByName.get(name)?.status || "Standby",
      raceCount: Number(recordsByName.get(name)?.raceCount) || 0,
      topRace: recordsByName.get(name)?.topRace || "Next meeting pending",
      readiness: Number(recordsByName.get(name)?.readiness) || 0
    }));
  }

  function buildSystemStatus(systemRecords) {
    const recordsByName = new Map(asArray(systemRecords).map((record) => [record.name, record]));
    return integratedSystems.map((name) => ({
      name,
      status: recordsByName.get(name)?.status || "Standby",
      score: Number(recordsByName.get(name)?.score) || 0,
      records: Number(recordsByName.get(name)?.records) || 0,
      route: recordsByName.get(name)?.route || name
    }));
  }

  function calculateLiveScore(race) {
    const raceScore = Number(race.raceScore) || 0;
    const roiScore = Math.min(100, (Number(race.expectedROI) || 0) / 2);
    const hitScore = Math.min(100, (Number(race.hitProbability) || 0) * 3);
    return Number(((raceScore * 0.5) + (roiScore * 0.3) + (hitScore * 0.2)).toFixed(1));
  }

  function classifyOperation(score) {
    if (score >= 90) return "Full Live";
    if (score >= 80) return "Live";
    if (score >= 70) return "Watch";
    return "Standby";
  }

  function buildDashboard(database) {
    const source = { ...fallbackDatabase, ...(database || {}) };
    const coverage = buildCoverage(source.racecourses);
    const systems = buildSystemStatus(source.systems);
    const liveRaces = asArray(source.liveRaces)
      .map((race) => ({ ...race, liveScore: calculateLiveScore(race) }))
      .sort(sortByNumber("liveScore"));
    const racecourseReadiness = average(coverage, "readiness");
    const systemReadiness = average(systems, "score");
    const liveRaceScore = average(liveRaces, "liveScore");
    const operationsScore = Number(((racecourseReadiness * 0.35) + (systemReadiness * 0.45) + (liveRaceScore * 0.2)).toFixed(1));
    const liveRacecourses = coverage.filter((course) => course.status === "Live");
    const connectedSystems = systems.filter((system) => system.status === "Live");

    return {
      databaseName: source.databaseName || "liveOperationsDatabase",
      phase: source.phase || "Phase14-1",
      operationDate: source.operationDate,
      sourceConnections,
      racecourses,
      integratedSystems,
      coverage,
      systems,
      liveRaces,
      summary: {
        operationsScore,
        operationStatus: classifyOperation(operationsScore),
        liveRacecourseCount: liveRacecourses.length,
        racecourseCoverage: Number(((coverage.length / racecourses.length) * 100).toFixed(1)),
        connectedSystemCount: connectedSystems.length,
        systemCoverage: Number(((systems.length / integratedSystems.length) * 100).toFixed(1)),
        bestLiveRace: liveRaces[0] || null,
        topRacecourses: coverage.slice().sort(sortByNumber("readiness")).slice(0, 5),
        prioritySystems: systems.slice().sort(sortByNumber("score")).slice(0, 8),
        actionQueue: liveRaces.slice(0, 5).map((race) => ({
          racecourse: race.racecourse,
          race: race.race,
          action: race.recommendedAction,
          system: race.recommendedSystem,
          liveScore: race.liveScore
        }))
      },
      widget: {
        status: classifyOperation(operationsScore),
        score: operationsScore,
        bestRace: liveRaces[0]?.race || "--",
        connectedSystems: connectedSystems.length,
        liveRacecourses: liveRacecourses.length
      }
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderCards(id, items, renderer) {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = items.length ? items.map(renderer).join("") : "<article><span>No data</span><strong>--</strong><em>waiting for live feed</em></article>";
  }

  function renderTable(id, rows, renderer) {
    const element = document.getElementById(id);
    if (!element) return;
    element.innerHTML = rows.map(renderer).join("");
  }

  function renderDashboard(report) {
    setText("phase141-widget-status", report.widget.status);
    setText("phase141-widget-score", `${report.widget.score}`);
    setText("phase141-widget-racecourses", `${report.widget.liveRacecourses} live`);
    setText("phase141-widget-systems", `${report.widget.connectedSystems} live`);
    setText("phase141-best-race", report.widget.bestRace);
    setText("phase141-connections", Object.keys(report.sourceConnections).join(" / "));
    renderCards("phase141-live-races", report.liveRaces, (race) => `<article><span>${race.racecourse}</span><strong>${race.race}</strong><em>Live ${race.liveScore} / ROI ${race.expectedROI}% / ${race.recommendedAction}</em></article>`);
    renderCards("phase141-action-queue", report.summary.actionQueue, (item) => `<article><span>${item.system}</span><strong>${item.action}</strong><em>${item.racecourse} ${item.race} / ${item.liveScore}</em></article>`);
    renderCards("phase141-top-racecourses", report.summary.topRacecourses, (course) => `<article><span>${course.name}</span><strong>${course.readiness}</strong><em>${course.status} / ${course.topRace}</em></article>`);
    renderCards("phase141-priority-systems", report.summary.prioritySystems, (system) => `<article><span>${system.name}</span><strong>${system.score}</strong><em>${system.status} / ${system.route}</em></article>`);
    renderTable("phase141-racecourse-table", report.coverage, (course) => `<tr><td>${course.name}</td><td>${course.status}</td><td>${course.raceCount}</td><td>${course.topRace}</td><td>${course.readiness}</td></tr>`);
    renderTable("phase141-system-table", report.systems, (system) => `<tr><td>${system.name}</td><td>${system.status}</td><td>${system.score}</td><td>${system.records}</td><td>${system.route}</td></tr>`);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch(sourceConnections.liveOperationsDatabase, { cache: "no-store" });
      if (!response.ok) throw new Error("liveOperationsDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderDashboard(report);
    window.HashimotoPhase141LiveOperationsReport = report;
  }

  window.HashimotoPhase141LiveOperations = {
    buildDashboard,
    calculateLiveScore,
    classifyOperation,
    fallbackDatabase,
    integratedSystems,
    racecourses,
    sourceConnections
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
