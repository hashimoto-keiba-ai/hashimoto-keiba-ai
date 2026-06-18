(function () {
  const fallbackDatabase = {
    databaseName: "learningDatabase",
    phase: "Phase10-4",
    records: [
      { date: "2026-06-01", racecourse: "Tokyo", race: "Tokyo 11R Value Sprint", prediction: "AI-01 first, KA-07 place, fast pace", actualResult: "AI-01 first, KA-07 second, fast pace", hit: true, miss: false, errorType: "None", paceError: 0, positionError: 0, popularZoneError: 0, dangerHorseError: 0, kamiAnaError: 0, win5Error: 0, trifectaError: 0, roiImpact: 4200, learningNotes: "Prediction matched pace and position. Reinforce AI Index and Kami-Ana weights." },
      { date: "2026-06-02", racecourse: "Hanshin", race: "Hanshin 10R Exacta Trial", prediction: "Medium pace, favorite holds second", actualResult: "Slow pace, favorite faded, closer won", hit: false, miss: true, errorType: "Pace,Position,Danger Horse", paceError: 1, positionError: 1, popularZoneError: 1, dangerHorseError: 1, kamiAnaError: 0, win5Error: 0, trifectaError: 1, roiImpact: -3200, learningNotes: "Pace read was too aggressive and danger-popular warning was underweighted." },
      { date: "2026-06-04", racecourse: "Kokura", race: "Kokura 9R Trifecta Risk", prediction: "Kami-Ana third, outside runner closes", actualResult: "Inside speed stayed; Kami-Ana finished sixth", hit: false, miss: true, errorType: "Racecourse,Track Condition,Kami-Ana,Trifecta", paceError: 0, positionError: 1, popularZoneError: 0, dangerHorseError: 0, kamiAnaError: 1, win5Error: 0, trifectaError: 1, roiImpact: -3600, learningNotes: "Track condition and Kokura course bias reduced outside closer reliability." },
      { date: "2026-06-06", racecourse: "Kyoto", race: "Kyoto 12R WIN5 Finish", prediction: "AI-03 anchor with balanced pace", actualResult: "AI-03 won, pace balanced, WIN5 leg hit", hit: true, miss: false, errorType: "None", paceError: 0, positionError: 0, popularZoneError: 0, dangerHorseError: 0, kamiAnaError: 0, win5Error: 0, trifectaError: 0, roiImpact: 32600, learningNotes: "WIN5 anchor logic and AI Index confidence were correct." }
    ]
  };
  const sourceConnections = { predictionDatabase: "data/predictions.json", resultVerificationDatabase: "data/results.json", aiIndexDatabase: "aiRanking", win5Database: "data/win5Database.json", trifectaDatabase: "data/trifectaDatabase.json", roiDatabase: "data/roiDatabase.json" };
  const errorClassifiers = {
    Pace: ["paceError", "Pace"], Position: ["positionError", "Position"], Popularity: ["popularZoneError", "Popularity"], Jockey: ["jockeyError", "Jockey"], Trainer: ["trainerError", "Trainer"], Racecourse: ["racecourseError", "Racecourse"], Distance: ["distanceError", "Distance"], "Track Condition": ["trackConditionError", "Track Condition"], "Danger Horse": ["dangerHorseError", "Danger Horse"], "Kami-Ana": ["kamiAnaError", "Kami-Ana"], WIN5: ["win5Error", "WIN5"], Trifecta: ["trifectaError", "Trifecta"]
  };
  const weightTargets = {
    aiIndexWeight: ["Position", "Racecourse", "Distance"],
    dangerPopularWeight: ["Popularity", "Danger Horse"],
    kamiAnaWeight: ["Kami-Ana", "Track Condition", "Racecourse"],
    win5Weight: ["WIN5", "Pace"],
    trifectaWeight: ["Trifecta", "Position", "Pace"],
    roiWeight: ["Popularity", "Racecourse", "Track Condition", "Distance"]
  };
  function classifyErrors(record) {
    const errorText = String(record.errorType || "");
    return Object.entries(errorClassifiers).filter(([label, [fieldName, token]]) => Number(record[fieldName]) > 0 || errorText.includes(token)).map(([label]) => label);
  }
  function normalizeRecord(record) {
    const categories = classifyErrors(record);
    const errorCount = categories.length;
    const hit = Boolean(record.hit);
    const roiImpact = Number(record.roiImpact) || 0;
    const learningScore = Math.max(0, Math.min(100, 100 - errorCount * 11 + (hit ? 12 : 0) + Math.sign(roiImpact) * 6));
    const improvementScore = Math.max(0, Math.min(100, errorCount * 12 + (roiImpact < 0 ? 18 : 6)));
    const confidenceAdjustment = Number(((hit ? 0.04 : -0.03) - errorCount * 0.012 + Math.max(-0.03, Math.min(0.03, roiImpact / 100000))).toFixed(3));
    return { ...record, hit, miss: Boolean(record.miss), roiImpact, errorCategories: categories, learningScore, improvementScore, confidenceAdjustment };
  }
  function summarizeErrors(records) {
    const counts = Object.keys(errorClassifiers).reduce((summary, category) => { summary[category] = { category, count: 0, roiImpact: 0 }; return summary; }, {});
    records.forEach((record) => record.errorCategories.forEach((category) => { counts[category].count += 1; counts[category].roiImpact += record.roiImpact; }));
    return Object.values(counts).filter((item) => item.count > 0).sort((left, right) => right.count - left.count || left.roiImpact - right.roiImpact);
  }
  function buildTrend(records, fieldName) {
    let runningTotal = 0;
    return records.slice().sort((left, right) => left.date.localeCompare(right.date)).map((record, index) => { runningTotal += Number(record[fieldName]) || 0; return { label: record.date, value: Number((runningTotal / (index + 1)).toFixed(1)), race: record.race }; });
  }
  function buildAccuracyTrend(records) {
    let hits = 0;
    return records.slice().sort((left, right) => left.date.localeCompare(right.date)).map((record, index) => { if (record.hit) hits += 1; return { label: record.date, value: Number(((hits / (index + 1)) * 100).toFixed(1)), race: record.race }; });
  }
  function buildRoiImprovementTrend(records) {
    let cumulativeRoi = 0;
    return records.slice().sort((left, right) => left.date.localeCompare(right.date)).map((record) => { cumulativeRoi += record.roiImpact; return { label: record.date, value: cumulativeRoi, race: record.race }; });
  }
  function calculateWeightAdjustments(records) {
    const topErrors = summarizeErrors(records);
    const hitRate = records.length ? records.filter((record) => record.hit).length / records.length : 0;
    const adjustments = {};
    Object.entries(weightTargets).forEach(([weightName, categories]) => {
      const relevantErrors = topErrors.filter((error) => categories.includes(error.category)).reduce((total, error) => total + error.count, 0);
      const positiveHits = hitRate >= 0.5 ? 0.015 : 0;
      const errorBoost = Math.min(0.09, relevantErrors * 0.018);
      adjustments[weightName] = Number((1 + positiveHits + errorBoost).toFixed(3));
    });
    return adjustments;
  }
  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = (source.records || []).map(normalizeRecord);
    const hits = records.filter((record) => record.hit).length;
    const misses = records.filter((record) => record.miss).length;
    const topLearningItems = records.slice().sort((left, right) => right.improvementScore - left.improvementScore || left.roiImpact - right.roiImpact).slice(0, 5);
    const topErrorCategories = summarizeErrors(records).slice(0, 8);
    const averageLearningScore = records.length ? Number((records.reduce((total, record) => total + record.learningScore, 0) / records.length).toFixed(1)) : 0;
    const averageImprovementScore = records.length ? Number((records.reduce((total, record) => total + record.improvementScore, 0) / records.length).toFixed(1)) : 0;
    return {
      databaseName: source.databaseName || "learningDatabase", phase: source.phase || "Phase10-4", sourceConnections, records,
      summary: {
        hits, misses, accuracy: records.length ? Number(((hits / records.length) * 100).toFixed(1)) : 0,
        totalRoiImpact: records.reduce((total, record) => total + record.roiImpact, 0), averageLearningScore, averageImprovementScore,
        averageConfidenceAdjustment: records.length ? Number((records.reduce((total, record) => total + record.confidenceAdjustment, 0) / records.length).toFixed(3)) : 0,
        topLearningItems, topErrorCategories, weightAdjustments: calculateWeightAdjustments(records)
      },
      trends: { improvementTrend: buildTrend(records, "improvementScore"), accuracyTrend: buildAccuracyTrend(records), roiImprovementTrend: buildRoiImprovementTrend(records) }
    };
  }
  function setText(id, value) { const element = document.getElementById(id); if (element) element.textContent = value; }
  function renderCards(id, items, renderer) { const element = document.getElementById(id); if (element) element.innerHTML = items.map(renderer).join(""); }
  function renderBars(id, points, formatter) {
    const element = document.getElementById(id); if (!element) return;
    const maxValue = Math.max(...points.map((point) => Math.abs(Number(point.value) || 0)), 1);
    element.innerHTML = points.map((point) => { const value = Number(point.value) || 0; const width = Math.max(8, Math.round((Math.abs(value) / maxValue) * 100)); return `<article><span>${point.label}</span><strong>${formatter(value)}</strong><em style="display:block;width:${width}%;height:8px;background:#d6a84f;border-radius:999px;"></em></article>`; }).join("");
  }
  function renderWeights(adjustments) { renderCards("phase104-weight-adjustments", Object.entries(adjustments), ([name, value]) => `<article><span>${name}</span><strong>${value.toFixed(3)}</strong><em>auto adjustment</em></article>`); }
  function renderTable(records) {
    const table = document.getElementById("phase104-learning-database"); if (!table) return;
    table.innerHTML = records.map((record) => `<tr><td>${record.date}</td><td>${record.racecourse}</td><td>${record.race}</td><td>${record.prediction}</td><td>${record.actualResult}</td><td>${record.hit ? "Hit" : "Miss"}</td><td>${record.errorCategories.join(", ") || "None"}</td><td>${record.roiImpact}</td><td>${record.learningScore}</td><td>${record.improvementScore}</td><td>${record.confidenceAdjustment}</td><td>${record.learningNotes}</td></tr>`).join("");
  }
  function renderDashboard(report) {
    const summary = report.summary;
    setText("phase104-widget-accuracy", `${summary.accuracy}%`); setText("phase104-widget-learning-score", summary.averageLearningScore.toFixed(1)); setText("phase104-widget-improvement-score", summary.averageImprovementScore.toFixed(1)); setText("phase104-widget-confidence-adjustment", summary.averageConfidenceAdjustment.toFixed(3)); setText("phase104-widget-roi-impact", `${summary.totalRoiImpact}`); setText("phase104-connections", Object.keys(sourceConnections).join(" / "));
  }
  function renderPage(report) {
    renderDashboard(report);
    renderCards("phase104-top-learning-items", report.summary.topLearningItems, (record) => `<article><span>${record.race}</span><strong>${record.improvementScore}</strong><em>${record.errorCategories.join(" / ") || "No error"}</em><small>${record.learningNotes}</small></article>`);
    renderCards("phase104-top-error-categories", report.summary.topErrorCategories, (item) => `<article><span>${item.category}</span><strong>${item.count}</strong><em>ROI impact ${item.roiImpact}</em></article>`);
    renderBars("phase104-improvement-trend", report.trends.improvementTrend, (value) => value.toFixed(1)); renderBars("phase104-accuracy-trend", report.trends.accuracyTrend, (value) => `${value.toFixed(1)}%`); renderBars("phase104-roi-improvement-trend", report.trends.roiImprovementTrend, (value) => `${value}`); renderWeights(report.summary.weightAdjustments); renderTable(report.records);
  }
  async function loadDatabase() { if (typeof fetch !== "function") return fallbackDatabase; try { const response = await fetch("data/learningDatabase.json", { cache: "no-store" }); if (!response.ok) throw new Error("learningDatabase fetch failed"); return await response.json(); } catch (error) { return fallbackDatabase; } }
  async function bootstrap() { const database = await loadDatabase(); const report = buildDashboard(database); renderPage(report); window.HashimotoPhase104SelfLearningReport = report; }
  window.HashimotoPhase104SelfLearningEngine = { buildDashboard, calculateWeightAdjustments, classifyErrors, errorClassifiers, fallbackDatabase, sourceConnections, weightTargets };
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
