(function () {
  const yenFormatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  });

  const fallbackDatabase = {
    databaseName: "trifectaDatabase",
    phase: "Phase10-1",
    records: [
      {
        date: "2026-06-06",
        racecourse: "Tokyo",
        raceName: "Phase10-1 Trifecta Sample",
        distance: "1600m",
        surface: "Turf",
        trackCondition: "Good",
        aiRank1: "AI-01",
        aiRank2: "AI-03",
        aiRank3: "KA-07",
        aiRank4: "GH-11",
        aiRank5: "AI-05",
        godHoleCandidate: "GH-11",
        kamiAnaCandidate: "KA-07",
        dangerPopularHorse: "AI-01",
        raceType: "A/B/C",
        expectedPace: "Medium-High",
        expectedValue: 188000,
        hitProbability: 18.6,
        recommendedStrategy: "Standard Mode",
        generatedTickets: [],
        notes: "Connects AI Index, Danger Popular Horse, Kami-Ana, and God Hole rankings for automatic trifecta formation."
      }
    ]
  };

  const sourceConnections = {
    aiIndexDatabase: "aiRanking",
    dangerPopularHorseDatabase: "riskyFavoriteRanking",
    kamiAnaDatabase: "longshotRanking",
    godHoleRankingDatabase: "divineRaceRanking"
  };

  const modes = {
    "Safe Mode": {
      ticketLimit: 8,
      firstDepth: 2,
      secondDepth: 4,
      thirdDepth: 5,
      probabilityBoost: 1.18,
      returnBoost: 0.78,
      riskBoost: 0.72
    },
    "Standard Mode": {
      ticketLimit: 12,
      firstDepth: 3,
      secondDepth: 4,
      thirdDepth: 5,
      probabilityBoost: 1,
      returnBoost: 1,
      riskBoost: 1
    },
    "High Return Mode": {
      ticketLimit: 16,
      firstDepth: 3,
      secondDepth: 5,
      thirdDepth: 5,
      probabilityBoost: 0.82,
      returnBoost: 1.44,
      riskBoost: 1.25
    },
    "Monster Ticket Mode": {
      ticketLimit: 16,
      firstDepth: 4,
      secondDepth: 5,
      thirdDepth: 5,
      probabilityBoost: 0.68,
      returnBoost: 1.88,
      riskBoost: 1.55
    }
  };

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function getRanks(record) {
    return unique([record.aiRank1, record.aiRank2, record.aiRank3, record.aiRank4, record.aiRank5]);
  }

  function buildPositions(record, modeName) {
    const mode = modes[modeName] || modes["Standard Mode"];
    const ranks = getRanks(record);
    const danger = record.dangerPopularHorse;
    const godHole = record.godHoleCandidate;
    const kamiAna = record.kamiAnaCandidate;
    const safeFirst = ranks.filter((horse) => horse !== danger);

    const firstPosition = unique([
      ...safeFirst.slice(0, mode.firstDepth),
      ...(modeName === "Monster Ticket Mode" ? [kamiAna] : []),
      ranks[0]
    ]).slice(0, mode.firstDepth);
    const secondPosition = unique([
      ...ranks.slice(0, mode.secondDepth),
      kamiAna,
      ...(modeName.includes("Return") || modeName.includes("Monster") ? [godHole] : [])
    ]).slice(0, mode.secondDepth + 1);
    const thirdPosition = unique([
      ...ranks.slice(1, mode.thirdDepth),
      godHole,
      kamiAna,
      danger
    ]).slice(0, mode.thirdDepth + 2);

    return { firstPosition, secondPosition, thirdPosition };
  }

  function generateTickets(record, modeName) {
    const mode = modes[modeName] || modes["Standard Mode"];
    const positions = buildPositions(record, modeName);
    const tickets = [];

    positions.firstPosition.forEach((first) => {
      positions.secondPosition.forEach((second) => {
        positions.thirdPosition.forEach((third) => {
          if (first === second || first === third || second === third) {
            return;
          }
          tickets.push({ first, second, third, mode: modeName });
        });
      });
    });

    return {
      mode: modeName,
      positions,
      tickets: tickets.slice(0, mode.ticketLimit),
      ticketLimit: mode.ticketLimit
    };
  }

  function simulate(record, modeName) {
    const mode = modes[modeName] || modes["Standard Mode"];
    const rankCount = getRanks(record).length || 1;
    const baseProbability = Number(record.hitProbability) || 12;
    const holeBonus = record.godHoleCandidate ? 1.08 : 1;
    const kamiBonus = record.kamiAnaCandidate ? 1.04 : 1;
    const dangerPenalty = record.dangerPopularHorse === record.aiRank1 ? 0.92 : 1;
    const depthPenalty = Math.max(0.82, 1 - (rankCount - 4) * 0.025);
    const hitProbability = Math.min(
      42,
      baseProbability * mode.probabilityBoost * holeBonus * kamiBonus * dangerPenalty * depthPenalty
    );
    const expectedReturn = Math.round((Number(record.expectedValue) || 100000) * mode.returnBoost);
    const riskScore = Math.min(
      100,
      Math.round((100 - hitProbability) * 0.58 * mode.riskBoost + (expectedReturn / 10000) * 0.7)
    );

    return {
      hitProbability: Number(hitProbability.toFixed(1)),
      expectedReturn,
      riskScore,
      riskLevel: riskScore >= 72 ? "High" : riskScore >= 52 ? "Medium" : "Low"
    };
  }

  function buildRecord(record) {
    const modeReports = Object.keys(modes).map((modeName) => {
      const generated = generateTickets(record, modeName);
      return {
        name: modeName,
        ...generated,
        simulation: simulate(record, modeName)
      };
    });
    const recommendedMode =
      modeReports.find((mode) => mode.name === record.recommendedStrategy) || modeReports[1];
    const generatedTickets = recommendedMode.tickets;

    return {
      ...record,
      generatedTickets,
      recommendedMode: recommendedMode.name,
      modes: modeReports,
      simulation: recommendedMode.simulation,
      outputs: {
        trifecta8Point: modeReports[0].tickets,
        trifecta12Point: modeReports[1].tickets,
        trifecta16Point: modeReports[2].tickets
      },
      sourceConnections
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = (source.records || []).map(buildRecord);
    const best = records
      .slice()
      .sort((left, right) => right.simulation.expectedReturn - left.simulation.expectedReturn)[0];

    return {
      databaseName: source.databaseName || "trifectaDatabase",
      phase: source.phase || "Phase10-1",
      sourceConnections,
      records,
      todayWidget: best
        ? {
            title: `${best.racecourse} ${best.raceName}`,
            expectedReturn: best.simulation.expectedReturn,
            hitProbability: best.simulation.hitProbability,
            recommendedMode: best.recommendedMode,
            riskScore: best.simulation.riskScore
          }
        : null,
      outputs: best
        ? best.outputs
        : {
            trifecta8Point: [],
            trifecta12Point: [],
            trifecta16Point: []
          }
    };
  }

  function formatPercent(value) {
    return `${Number(value || 0).toFixed(1)}%`;
  }

  function renderTickets(tickets) {
    if (!tickets || tickets.length === 0) {
      return "<p class=\"data-footnote\">No tickets generated.</p>";
    }
    return tickets
      .map(
        (ticket, index) => `
          <article>
            <span>${index + 1}</span>
            <strong>${ticket.first} - ${ticket.second} - ${ticket.third}</strong>
            <em>${ticket.mode}</em>
          </article>`
      )
      .join("");
  }

  function renderModeCards(record) {
    const targetMap = {
      "Safe Mode": "phase101-safe-mode",
      "Standard Mode": "phase101-standard-mode",
      "High Return Mode": "phase101-high-return-mode",
      "Monster Ticket Mode": "phase101-monster-ticket-mode"
    };

    record.modes.forEach((mode) => {
      const element = document.getElementById(targetMap[mode.name]);
      if (!element) {
        return;
      }
      element.innerHTML = `
        <article>
          <span>${mode.name}</span>
          <strong>${mode.tickets.length} points</strong>
          <em>Hit ${formatPercent(mode.simulation.hitProbability)} / ${yenFormatter.format(mode.simulation.expectedReturn)}</em>
          <small>Risk ${mode.simulation.riskScore} / ${mode.simulation.riskLevel}</small>
        </article>`;
    });
  }

  function renderDatabase(records) {
    const table = document.getElementById("phase101-trifecta-database");
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
            <td>${record.distance}</td>
            <td>${record.surface}</td>
            <td>${record.trackCondition}</td>
            <td>${record.aiRank1}</td>
            <td>${record.aiRank2}</td>
            <td>${record.aiRank3}</td>
            <td>${record.aiRank4}</td>
            <td>${record.aiRank5}</td>
            <td>${record.godHoleCandidate}</td>
            <td>${record.kamiAnaCandidate}</td>
            <td>${record.dangerPopularHorse}</td>
            <td>${record.raceType}</td>
            <td>${record.expectedPace}</td>
            <td>${yenFormatter.format(record.simulation.expectedReturn)}</td>
            <td>${formatPercent(record.simulation.hitProbability)}</td>
            <td>${record.recommendedMode}</td>
            <td>${record.generatedTickets.length} points</td>
          </tr>`
      )
      .join("");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function renderDashboard(report) {
    if (!report.todayWidget) {
      return;
    }
    setText("phase101-widget-title", report.todayWidget.title);
    setText("phase101-widget-return", yenFormatter.format(report.todayWidget.expectedReturn));
    setText("phase101-widget-hit", formatPercent(report.todayWidget.hitProbability));
    setText("phase101-widget-mode", report.todayWidget.recommendedMode);
  }

  function renderPage(report) {
    const record = report.records[0];
    if (!record) {
      return;
    }

    renderDashboard(report);
    setText("phase101-trifecta-hit-probability", formatPercent(record.simulation.hitProbability));
    setText("phase101-trifecta-expected-return", yenFormatter.format(record.simulation.expectedReturn));
    setText("phase101-trifecta-risk-score", `${record.simulation.riskScore} / ${record.simulation.riskLevel}`);
    setText("phase101-trifecta-strategy", record.recommendedMode);
    setText("phase101-trifecta-race", `${record.racecourse} ${record.raceName}`);
    setText("phase101-trifecta-connections", Object.keys(sourceConnections).join(" / "));
    renderModeCards(record);
    renderDatabase(report.records);

    const eight = document.getElementById("phase101-trifecta-8");
    const twelve = document.getElementById("phase101-trifecta-12");
    const sixteen = document.getElementById("phase101-trifecta-16");
    if (eight) eight.innerHTML = renderTickets(report.outputs.trifecta8Point);
    if (twelve) twelve.innerHTML = renderTickets(report.outputs.trifecta12Point);
    if (sixteen) sixteen.innerHTML = renderTickets(report.outputs.trifecta16Point);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") {
      return fallbackDatabase;
    }
    try {
      const response = await fetch("data/trifectaDatabase.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("trifectaDatabase fetch failed");
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
    window.HashimotoPhase101TrifectaReport = report;
  }

  window.HashimotoPhase101TrifectaEngine = {
    buildDashboard,
    buildPositions,
    fallbackDatabase,
    generateTickets,
    modes,
    simulate,
    sourceConnections
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
})();
