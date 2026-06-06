(function () {
  const fallbackDatabase = { databaseName: "raceSimulationDatabase", phase: "Phase11-1", records: [
    { date: "2026-06-06", racecourse: "Tokyo", race: "Tokyo 11R Future Simulation Stakes", horseNumber: 1, horseName: "AI Commander", paceScore: 88, positionScore: 84, jockeyScore: 82, trainerScore: 79, aiIndex: 91, winProbability: 0, placeProbability: 0, showProbability: 0, simulationRuns: 0, expectedRank: 0, expectedROI: 0 },
    { date: "2026-06-06", racecourse: "Tokyo", race: "Tokyo 11R Future Simulation Stakes", horseNumber: 3, horseName: "Kami Flash", paceScore: 81, positionScore: 78, jockeyScore: 76, trainerScore: 72, aiIndex: 84, winProbability: 0, placeProbability: 0, showProbability: 0, simulationRuns: 0, expectedRank: 0, expectedROI: 0 },
    { date: "2026-06-06", racecourse: "Tokyo", race: "Tokyo 11R Future Simulation Stakes", horseNumber: 7, horseName: "Danger Crown", paceScore: 73, positionScore: 75, jockeyScore: 80, trainerScore: 74, aiIndex: 77, winProbability: 0, placeProbability: 0, showProbability: 0, simulationRuns: 0, expectedRank: 0, expectedROI: 0 },
    { date: "2026-06-06", racecourse: "Tokyo", race: "Tokyo 11R Future Simulation Stakes", horseNumber: 11, horseName: "Longshot Gate", paceScore: 69, positionScore: 70, jockeyScore: 71, trainerScore: 76, aiIndex: 73, winProbability: 0, placeProbability: 0, showProbability: 0, simulationRuns: 0, expectedRank: 0, expectedROI: 0 }
  ] };
  const sourceConnections = { predictionDatabase: "data/predictions.json", aiIndexDatabase: "aiRanking", dangerPopularDatabase: "riskyFavoriteRanking", kamiAnaDatabase: "longshotRanking", win5Database: "data/win5Database.json", roiDatabase: "data/roiDatabase.json" };
  const runSizes = [100, 500, 1000];
  function seededRandom(seed) { let state = seed % 2147483647; return function next() { state = (state * 48271) % 2147483647; return state / 2147483647; }; }
  function basePower(horse) { return Number(horse.paceScore) * 0.22 + Number(horse.positionScore) * 0.22 + Number(horse.jockeyScore) * 0.16 + Number(horse.trainerScore) * 0.14 + Number(horse.aiIndex) * 0.26; }
  function simulateRace(records, runs) {
    const random = seededRandom(1100 + runs + records.length);
    const counters = records.map((horse) => ({ ...horse, wins: 0, places: 0, shows: 0, rankTotal: 0, power: basePower(horse) }));
    for (let run = 0; run < runs; run += 1) {
      const ranked = counters.map((horse) => ({ horse, score: horse.power + (random() - 0.5) * 18 + (random() - 0.5) * (100 - Number(horse.paceScore)) * 0.12 })).sort((left, right) => right.score - left.score);
      ranked.forEach((entry, index) => { const rank = index + 1; entry.horse.rankTotal += rank; if (rank === 1) entry.horse.wins += 1; if (rank <= 2) entry.horse.places += 1; if (rank <= 3) entry.horse.shows += 1; });
    }
    return counters.map((horse) => {
      const winProbability = Number(((horse.wins / runs) * 100).toFixed(1));
      const placeProbability = Number(((horse.places / runs) * 100).toFixed(1));
      const showProbability = Number(((horse.shows / runs) * 100).toFixed(1));
      const expectedRank = Number((horse.rankTotal / runs).toFixed(2));
      const expectedROI = Number(((winProbability * 0.034 + placeProbability * 0.011 + Number(horse.aiIndex) * 0.006) * 100).toFixed(1));
      return { ...horse, winProbability, placeProbability, showProbability, simulationRuns: runs, expectedRank, expectedROI };
    }).sort((left, right) => right.winProbability - left.winProbability || left.expectedRank - right.expectedRank);
  }
  function topBy(results, field) { return results.slice().sort((left, right) => right[field] - left[field]).slice(0, 3); }
  function buildTrifecta(results) { const win = topBy(results, "winProbability").map((horse) => horse.horseNumber); const place = topBy(results, "placeProbability").map((horse) => horse.horseNumber); const show = topBy(results, "showProbability").map((horse) => horse.horseNumber); return `${win[0]} - ${place.find((number) => number !== win[0]) || place[0]} - ${show.find((number) => number !== win[0] && number !== place[0]) || show[0]}`; }
  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = source.records || [];
    const simulations = runSizes.reduce((summary, runs) => { summary[`${runs}`] = simulateRace(records, runs); return summary; }, {});
    const primary = simulations["1000"];
    const expectedROI = Number((primary.reduce((total, horse) => total + horse.expectedROI, 0) / Math.max(primary.length, 1)).toFixed(1));
    const expectedWIN5Value = Number((primary[0].winProbability * 1.8 + expectedROI * 0.22).toFixed(1));
    return { databaseName: source.databaseName || "raceSimulationDatabase", phase: source.phase || "Phase11-1", sourceConnections, runSizes, records: primary, simulations, summary: { topWinChances: topBy(primary, "winProbability"), topPlaceChances: topBy(primary, "placeProbability"), topShowChances: topBy(primary, "showProbability"), expectedTrifecta: buildTrifecta(primary), expectedWIN5Value, expectedROI, bestHorse: primary[0] } };
  }
  function setText(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }
  function renderCards(id, items, field) { const element = document.getElementById(id); if (!element) return; element.innerHTML = items.map((horse) => `<article><span>${horse.horseNumber} ${horse.horseName}</span><strong>${horse[field]}%</strong><em>Rank ${horse.expectedRank} / ROI ${horse.expectedROI}%</em></article>`).join(""); }
  function renderTable(records) { const table = document.getElementById("phase111-simulation-results"); if (!table) return; table.innerHTML = records.map((horse) => `<tr><td>${horse.date}</td><td>${horse.racecourse}</td><td>${horse.race}</td><td>${horse.horseNumber}</td><td>${horse.horseName}</td><td>${horse.paceScore}</td><td>${horse.positionScore}</td><td>${horse.jockeyScore}</td><td>${horse.trainerScore}</td><td>${horse.aiIndex}</td><td>${horse.winProbability}%</td><td>${horse.placeProbability}%</td><td>${horse.showProbability}%</td><td>${horse.simulationRuns}</td><td>${horse.expectedRank}</td><td>${horse.expectedROI}%</td></tr>`).join(""); }
  function renderDashboard(report) { const summary = report.summary; setText("phase111-widget-best-horse", `${summary.bestHorse.horseNumber} ${summary.bestHorse.horseName}`); setText("phase111-widget-win", `${summary.bestHorse.winProbability}%`); setText("phase111-widget-place", `${summary.bestHorse.placeProbability}%`); setText("phase111-widget-show", `${summary.bestHorse.showProbability}%`); setText("phase111-widget-trifecta", summary.expectedTrifecta); setText("phase111-widget-roi", `${summary.expectedROI}%`); setText("phase111-widget-win5", `${summary.expectedWIN5Value}%`); setText("phase111-connections", Object.keys(sourceConnections).join(" / ")); }
  function renderPage(report) { renderDashboard(report); renderCards("phase111-top-win", report.summary.topWinChances, "winProbability"); renderCards("phase111-top-place", report.summary.topPlaceChances, "placeProbability"); renderCards("phase111-top-show", report.summary.topShowChances, "showProbability"); renderTable(report.records); }
  async function loadDatabase() { if (typeof fetch !== "function") return fallbackDatabase; try { const response = await fetch("data/raceSimulationDatabase.json", { cache: "no-store" }); if (!response.ok) throw new Error("raceSimulationDatabase fetch failed"); return await response.json(); } catch (error) { return fallbackDatabase; } }
  async function bootstrap() { const database = await loadDatabase(); const report = buildDashboard(database); renderPage(report); window.HashimotoPhase111RaceFutureSimulatorReport = report; }
  window.HashimotoPhase111RaceFutureSimulator = { basePower, buildDashboard, fallbackDatabase, runSizes, simulateRace, sourceConnections };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
