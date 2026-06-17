(function () {
  const yenFormatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  });

  const racecourses = [
    "Tokyo",
    "Nakayama",
    "Hanshin",
    "Kyoto",
    "Chukyo",
    "Fukushima",
    "Niigata",
    "Kokura",
    "Hakodate",
    "Sapporo"
  ];
  const betTypes = ["Win", "Place", "Exacta", "Quinella", "Trifecta", "WIN5"];

  const fallbackDatabase = {
    databaseName: "roiDatabase",
    phase: "Phase10-3",
    startingBankroll: 100000,
    records: [
      {
        date: "2026-06-01",
        racecourse: "Tokyo",
        raceName: "Tokyo Value Sprint",
        betType: "Win",
        investment: 3000,
        return: 7200,
        profit: 4200,
        roi: 140,
        hit: true,
        aiScore: 88,
        confidence: 84,
        category: "A"
      },
      {
        date: "2026-06-02",
        racecourse: "Kyoto",
        raceName: "Kyoto Longshot Cup",
        betType: "Quinella",
        investment: 2800,
        return: 9100,
        profit: 6300,
        roi: 225,
        hit: true,
        aiScore: 82,
        confidence: 77,
        category: "A"
      },
      {
        date: "2026-06-03",
        racecourse: "Chukyo",
        raceName: "Chukyo Trifecta Logic",
        betType: "Trifecta",
        investment: 4800,
        return: 18800,
        profit: 14000,
        roi: 291.7,
        hit: true,
        aiScore: 91,
        confidence: 81,
        category: "A"
      },
      {
        date: "2026-06-06",
        racecourse: "Kyoto",
        raceName: "Kyoto WIN5 Finish",
        betType: "WIN5",
        investment: 6000,
        return: 38600,
        profit: 32600,
        roi: 543.3,
        hit: true,
        aiScore: 89,
        confidence: 79,
        category: "A"
      }
    ]
  };

  const sourceConnections = {
    fundManagementDatabase: "data/fundManagementDatabase.json",
    win5Database: "data/win5Database.json",
    trifectaDatabase: "data/trifectaDatabase.json",
    predictionDatabase: "data/predictions.json",
    resultVerificationDatabase: "data/results.json"
  };

  function sum(records, field) {
    return records.reduce((total, record) => total + (Number(record[field]) || 0), 0);
  }

  function calculateRoi(records) {
    const investment = sum(records, "investment");
    const profit = sum(records, "profit");
    return investment > 0 ? Number(((profit / investment) * 100).toFixed(1)) : 0;
  }

  function normalizeRecord(record) {
    const investment = Number(record.investment) || 0;
    const payout = Number(record.return) || 0;
    const profit = Number.isFinite(Number(record.profit)) ? Number(record.profit) : payout - investment;
    return {
      ...record,
      investment,
      return: payout,
      profit,
      roi: investment > 0 ? Number(((profit / investment) * 100).toFixed(1)) : 0,
      hit: Boolean(record.hit)
    };
  }

  function groupBy(records, keyFn) {
    return records.reduce((groups, record) => {
      const key = keyFn(record);
      groups[key] = groups[key] || [];
      groups[key].push(record);
      return groups;
    }, {});
  }

  function getWeekKey(dateText) {
    const date = new Date(`${dateText}T00:00:00Z`);
    const firstDay = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayOffset = Math.floor((date - firstDay) / 86400000);
    const weekNumber = Math.ceil((dayOffset + firstDay.getUTCDay() + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
  }

  function getMonthKey(dateText) {
    return String(dateText || "").slice(0, 7);
  }

  function buildPeriodRoi(records, keyFn) {
    return Object.entries(groupBy(records, keyFn))
      .map(([period, periodRecords]) => ({
        period,
        investment: sum(periodRecords, "investment"),
        return: sum(periodRecords, "return"),
        profit: sum(periodRecords, "profit"),
        roi: calculateRoi(periodRecords),
        hitRate: periodRecords.length
          ? Number(((periodRecords.filter((record) => record.hit).length / periodRecords.length) * 100).toFixed(1))
          : 0
      }))
      .sort((left, right) => left.period.localeCompare(right.period));
  }

  function buildDimension(records, values, field) {
    return values.map((value) => {
      const scoped = records.filter((record) => record[field] === value);
      return {
        name: value,
        investment: sum(scoped, "investment"),
        return: sum(scoped, "return"),
        profit: sum(scoped, "profit"),
        roi: calculateRoi(scoped),
        count: scoped.length,
        hitRate: scoped.length
          ? Number(((scoped.filter((record) => record.hit).length / scoped.length) * 100).toFixed(1))
          : 0
      };
    });
  }

  function pickBest(items) {
    return items
      .filter((item) => item.count > 0)
      .slice()
      .sort((left, right) => right.roi - left.roi || right.profit - left.profit)[0];
  }

  function pickWorst(items) {
    return items
      .filter((item) => item.count > 0)
      .slice()
      .sort((left, right) => left.roi - right.roi || left.profit - right.profit)[0];
  }

  function buildCurves(records, startingBankroll) {
    let bankroll = startingBankroll;
    let peakBankroll = startingBankroll;
    let cumulativeProfit = 0;

    return records
      .slice()
      .sort((left, right) => `${left.date}-${left.raceName}`.localeCompare(`${right.date}-${right.raceName}`))
      .map((record) => {
        bankroll += record.profit;
        cumulativeProfit += record.profit;
        peakBankroll = Math.max(peakBankroll, bankroll);
        const drawdown = peakBankroll > 0 ? Number((((peakBankroll - bankroll) / peakBankroll) * 100).toFixed(1)) : 0;
        return {
          date: record.date,
          raceName: record.raceName,
          profit: record.profit,
          cumulativeProfit,
          bankroll,
          drawdown,
          roi: record.roi
        };
      });
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const startingBankroll = Number(source.startingBankroll) || 100000;
    const records = (source.records || []).map(normalizeRecord);
    const byRacecourse = buildDimension(records, racecourses, "racecourse");
    const byBetType = buildDimension(records, betTypes, "betType");
    const curves = buildCurves(records, startingBankroll);
    const currentBankroll = curves.length ? curves[curves.length - 1].bankroll : startingBankroll;
    const drawdown = curves.length ? Math.max(...curves.map((point) => point.drawdown)) : 0;

    return {
      databaseName: source.databaseName || "roiDatabase",
      phase: source.phase || "Phase10-3",
      sourceConnections,
      records,
      summary: {
        dailyRoi: buildPeriodRoi(records, (record) => record.date),
        weeklyRoi: buildPeriodRoi(records, (record) => getWeekKey(record.date)),
        monthlyRoi: buildPeriodRoi(records, (record) => getMonthKey(record.date)),
        byRacecourse,
        byBetType,
        bestRacecourse: pickBest(byRacecourse),
        worstRacecourse: pickWorst(byRacecourse),
        bestBetType: pickBest(byBetType),
        worstBetType: pickWorst(byBetType),
        currentBankroll,
        totalInvestment: sum(records, "investment"),
        totalReturn: sum(records, "return"),
        totalProfit: sum(records, "profit"),
        overallRoi: calculateRoi(records),
        drawdown
      },
      charts: {
        roiTrend: buildPeriodRoi(records, (record) => record.date).map((point) => ({
          label: point.period,
          value: point.roi
        })),
        profitTrend: curves.map((point) => ({
          label: point.date,
          value: point.cumulativeProfit
        })),
        bankrollTrend: curves.map((point) => ({
          label: point.date,
          value: point.bankroll
        })),
        profitCurve: curves
      }
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function renderBars(id, points, formatter) {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    const values = points.map((point) => Math.abs(Number(point.value) || 0));
    const maxValue = Math.max(...values, 1);
    element.innerHTML = points
      .map((point) => {
        const numericValue = Number(point.value) || 0;
        const width = Math.max(8, Math.round((Math.abs(numericValue) / maxValue) * 100));
        return `
          <article>
            <span>${point.label}</span>
            <strong>${formatter(numericValue)}</strong>
            <em style="display:block;width:${width}%;height:8px;background:#d6a84f;border-radius:999px;"></em>
          </article>`;
      })
      .join("");
  }

  function renderTable(id, rows, nameLabel) {
    const table = document.getElementById(id);
    if (!table) {
      return;
    }
    table.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${row[nameLabel]}</td>
            <td>${row.count}</td>
            <td>${yenFormatter.format(row.investment)}</td>
            <td>${yenFormatter.format(row.return)}</td>
            <td>${yenFormatter.format(row.profit)}</td>
            <td>${row.roi}%</td>
            <td>${row.hitRate}%</td>
          </tr>`
      )
      .join("");
  }

  function renderRecords(records) {
    const table = document.getElementById("phase103-roi-database");
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
            <td>${record.betType}</td>
            <td>${yenFormatter.format(record.investment)}</td>
            <td>${yenFormatter.format(record.return)}</td>
            <td>${yenFormatter.format(record.profit)}</td>
            <td>${record.roi}%</td>
            <td>${record.hit ? "Hit" : "Miss"}</td>
            <td>${record.aiScore}</td>
            <td>${record.confidence}%</td>
            <td>${record.category}</td>
          </tr>`
      )
      .join("");
  }

  function renderDashboard(report) {
    const summary = report.summary;
    setText("phase103-widget-bankroll", yenFormatter.format(summary.currentBankroll));
    setText("phase103-widget-roi", `${summary.overallRoi}%`);
    setText("phase103-widget-profit", yenFormatter.format(summary.totalProfit));
    setText("phase103-widget-drawdown", `${summary.drawdown}%`);
    setText("phase103-best-racecourse", `${summary.bestRacecourse.name} / ${summary.bestRacecourse.roi}%`);
    setText("phase103-worst-racecourse", `${summary.worstRacecourse.name} / ${summary.worstRacecourse.roi}%`);
    setText("phase103-best-bet-type", `${summary.bestBetType.name} / ${summary.bestBetType.roi}%`);
    setText("phase103-worst-bet-type", `${summary.worstBetType.name} / ${summary.worstBetType.roi}%`);
    setText("phase103-connections", Object.keys(sourceConnections).join(" / "));
  }

  function renderPage(report) {
    renderDashboard(report);
    renderBars("phase103-roi-trend", report.charts.roiTrend, (value) => `${value.toFixed(1)}%`);
    renderBars("phase103-profit-trend", report.charts.profitTrend, (value) => yenFormatter.format(value));
    renderBars("phase103-bankroll-trend", report.charts.bankrollTrend, (value) => yenFormatter.format(value));
    renderTable("phase103-by-racecourse", report.summary.byRacecourse, "name");
    renderTable("phase103-by-bet-type", report.summary.byBetType, "name");
    renderRecords(report.records);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") {
      return fallbackDatabase;
    }
    try {
      const response = await fetch("data/roiDatabase.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("roiDatabase fetch failed");
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
    window.HashimotoPhase103RoiDashboardReport = report;
  }

  window.HashimotoPhase103RoiDashboardEngine = {
    betTypes,
    buildDashboard,
    calculateRoi,
    fallbackDatabase,
    racecourses,
    sourceConnections
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
})();
