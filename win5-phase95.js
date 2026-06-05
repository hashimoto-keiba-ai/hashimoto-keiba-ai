(() => {
  const fallbackDatabase = {
    records: [
      {
        date: "2026-06-06",
        race1: "Tokyo 10R",
        race2: "Hanshin 10R",
        race3: "Tokyo 11R",
        race4: "Hanshin 11R",
        race5: "Hakodate 11R",
        selections: {
          race1: ["A-01", "B-05"],
          race2: ["A-03"],
          race3: ["A-08", "C-12"],
          race4: ["A-02", "B-07"],
          race5: ["A-04"]
        },
        aiScore: 86,
        hitProbability: 12.8,
        expectedReturn: 168000,
        riskLevel: "Balanced",
        raceType: "A/B/C",
        godHoleCandidates: ["C-12"],
        dangerPopularHorses: ["No.1 heavy favorite"],
        kamiAnaCandidates: ["B-07", "C-12"],
        notes: "Phase9-5 seed record. Replace with live WIN5 card after entries are loaded."
      }
    ]
  };

  const sourceConnections = {
    aiIndexDatabase: "aiRanking",
    dangerPopularHorseDatabase: "riskyFavoriteRanking",
    kamiAnaDatabase: "longshotRanking",
    godHoleRankingDatabase: "divineRaceRanking"
  };

  const list = (value) => Array.isArray(value) ? value : [];
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const yen = (value) => `${Math.round(number(value)).toLocaleString("ja-JP")}円`;
  const percent = (value) => `${number(value).toFixed(1)}%`;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const setText = (id, value) => {
    const target = document.getElementById(id);
    if (target) target.textContent = value;
  };

  const readJson = (key, fallback = []) => {
    try {
      const raw = window.localStorage?.getItem?.(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  };

  const selectionCount = (record = {}) => {
    const selections = record.selections || {};
    return ["race1", "race2", "race3", "race4", "race5"]
      .map((key) => list(selections[key]).length || 1)
      .reduce((total, count) => total * count, 1);
  };

  const calculateRecord = (record = {}, sources = {}) => {
    const aiScores = list(sources.aiIndexDatabase).map((item) => number(item.score ?? item.aiScore)).filter(Boolean);
    const averageAiScore = aiScores.length ? aiScores.reduce((sum, score) => sum + score, 0) / aiScores.length : number(record.aiScore, 70);
    const dangerCount = list(record.dangerPopularHorses).length + list(sources.dangerPopularHorseDatabase).length;
    const kamiAnaCount = list(record.kamiAnaCandidates).length + list(sources.kamiAnaDatabase).length;
    const godHoleCount = list(record.godHoleCandidates).length + list(sources.godHoleRankingDatabase).length;
    const combinationCount = selectionCount(record);
    const baseHit = number(record.hitProbability) || averageAiScore * 0.16;
    const hitProbability = Math.max(1, Math.min(65, baseHit + godHoleCount * 1.4 - dangerCount * 0.9 - Math.max(0, combinationCount - 8) * 0.25));
    const riskScore = Math.max(5, Math.min(100, 28 + dangerCount * 8 + kamiAnaCount * 5 + combinationCount * 1.2 - godHoleCount * 2));
    const expectedReturn = number(record.expectedReturn) || Math.round((hitProbability / 100) * (90000 + kamiAnaCount * 45000 + godHoleCount * 28000) * Math.max(1, combinationCount / 4));

    return {
      ...record,
      combinationCount,
      aiScore: Math.round(number(record.aiScore, averageAiScore) * 10) / 10,
      hitProbability: Math.round(hitProbability * 10) / 10,
      expectedReturn,
      riskScore: Math.round(riskScore * 10) / 10,
      riskLevel: record.riskLevel || (riskScore >= 70 ? "High" : riskScore >= 45 ? "Balanced" : "Safe")
    };
  };

  const buildDashboard = ({ win5Database = fallbackDatabase, sources = {} } = {}) => {
    const records = list(win5Database.records).map((record) => calculateRecord(record, sources));
    const byHit = [...records].sort((a, b) => b.hitProbability - a.hitProbability);
    const byReturn = [...records].sort((a, b) => b.expectedReturn - a.expectedReturn);
    const balanced = [...records].sort((a, b) => (b.hitProbability + b.expectedReturn / 10000 - b.riskScore) - (a.hitProbability + a.expectedReturn / 10000 - a.riskScore));
    const safe = byHit.filter((record) => record.riskScore < 55);
    const highReturn = byReturn.filter((record) => record.riskScore >= 45 || record.expectedReturn >= 100000);
    const recommended = balanced[0] || byHit[0] || null;

    return {
      sourceConnections,
      records,
      recommendedWin5: recommended ? [recommended] : [],
      safeWin5: safe.length ? safe.slice(0, 3) : byHit.slice(0, 1),
      balancedWin5: balanced.slice(0, 3),
      highReturnWin5: highReturn.length ? highReturn.slice(0, 3) : byReturn.slice(0, 1),
      todayWidget: recommended,
      engine: {
        hitProbability: recommended?.hitProbability || 0,
        expectedReturn: recommended?.expectedReturn || 0,
        riskScore: recommended?.riskScore || 0
      }
    };
  };

  const title = (record) => [record.race1, record.race2, record.race3, record.race4, record.race5].filter(Boolean).join(" / ") || record.date || "WIN5";

  const renderLane = (id, records) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.innerHTML = records.length
      ? records.map((record) => `
          <article class="race-card win5-race-card phase95-win5-card">
            <span class="race-meta">${escapeHtml(record.date || "--")} / ${escapeHtml(record.raceType || "A/B/C")}</span>
            <strong>${escapeHtml(title(record))}</strong>
            <div class="race-kpi">
              <span>Hit ${percent(record.hitProbability)}</span>
              <span>Return ${yen(record.expectedReturn)}</span>
              <span>Risk ${escapeHtml(record.riskScore)} / ${escapeHtml(record.riskLevel)}</span>
              <span>Selections ${escapeHtml(record.combinationCount)}点</span>
            </div>
          </article>
        `).join("")
      : `<article class="race-card"><strong>WIN5 data pending</strong><span class="race-meta">win5Database records will appear here after entries are loaded.</span></article>`;
  };

  const render = (report) => {
    const widget = report.todayWidget;
    setText("phase95-win5-hit-probability", percent(report.engine.hitProbability));
    setText("phase95-win5-expected-return", yen(report.engine.expectedReturn));
    setText("phase95-win5-risk-score", report.engine.riskScore.toFixed(1));
    setText("phase95-widget-title", widget ? title(widget) : "--");
    setText("phase95-widget-hit", widget ? percent(widget.hitProbability) : "0.0%");
    setText("phase95-widget-return", widget ? yen(widget.expectedReturn) : "0円");

    renderLane("phase95-recommended-win5", report.recommendedWin5);
    renderLane("phase95-safe-win5", report.safeWin5);
    renderLane("phase95-balanced-win5", report.balancedWin5);
    renderLane("phase95-high-return-win5", report.highReturnWin5);

    const table = document.getElementById("phase95-win5-database");
    if (table) {
      table.innerHTML = report.records.length
        ? report.records.map((record) => `
            <tr>
              <td>${escapeHtml(record.date || "--")}</td>
              <td>${escapeHtml(record.race1 || "--")}</td>
              <td>${escapeHtml(record.race2 || "--")}</td>
              <td>${escapeHtml(record.race3 || "--")}</td>
              <td>${escapeHtml(record.race4 || "--")}</td>
              <td>${escapeHtml(record.race5 || "--")}</td>
              <td>${escapeHtml(record.combinationCount)}点</td>
              <td>${escapeHtml(record.aiScore)}</td>
              <td>${percent(record.hitProbability)}</td>
              <td>${yen(record.expectedReturn)}</td>
              <td>${escapeHtml(record.riskLevel)}</td>
              <td>${escapeHtml(record.raceType || "--")}</td>
              <td>${escapeHtml(list(record.godHoleCandidates).join(" / ") || "--")}</td>
              <td>${escapeHtml(list(record.dangerPopularHorses).join(" / ") || "--")}</td>
              <td>${escapeHtml(list(record.kamiAnaCandidates).join(" / ") || "--")}</td>
              <td>${escapeHtml(record.notes || "--")}</td>
            </tr>
          `).join("")
        : `<tr><td colspan="16">win5Database is ready. Add records to data/win5Database.json.</td></tr>`;
    }
  };

  const loadWin5Database = async () => {
    try {
      const response = await fetch("data/win5Database.json", { cache: "no-store" });
      return response.ok ? await response.json() : fallbackDatabase;
    } catch (_error) {
      return fallbackDatabase;
    }
  };

  const boot = async () => {
    const win5Database = await loadWin5Database();
    const sources = {
      aiIndexDatabase: readJson("aiRanking", []),
      dangerPopularHorseDatabase: readJson("riskyFavoriteRanking", []),
      kamiAnaDatabase: readJson("longshotRanking", []),
      godHoleRankingDatabase: readJson("divineRaceRanking", [])
    };
    render(buildDashboard({ win5Database, sources }));
  };

  window.HashimotoPhase95Win5Engine = { buildDashboard, calculateRecord, selectionCount, sourceConnections };

  if (typeof module !== "undefined") {
    module.exports = { buildDashboard, calculateRecord, selectionCount, sourceConnections };
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
