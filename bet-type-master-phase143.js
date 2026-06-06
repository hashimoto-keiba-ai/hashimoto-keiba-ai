(function () {
  const canonicalBetTypes = ["単勝", "複勝", "馬連", "馬単", "三連複", "三連単", "WIN5"];
  const fallbackDatabase = {
    databaseName: "betTypeMasterDatabase",
    phase: "Phase14-3",
    records: [
      { betType: "単勝", key: "win", unit: 100, riskLevel: "Low", target: "1着馬を当てる", engineRoute: "ROI Engine / Fund Management" },
      { betType: "複勝", key: "place", unit: 100, riskLevel: "Low", target: "3着以内を当てる", engineRoute: "ROI Engine / Fund Management" },
      { betType: "馬連", key: "quinella", unit: 100, riskLevel: "Medium", target: "1着2着の馬を順不同で当てる", engineRoute: "ROI Engine / Fund Management" },
      { betType: "馬単", key: "exacta", unit: 100, riskLevel: "Medium", target: "1着2着の馬を順番通り当てる", engineRoute: "ROI Engine / Fund Management" },
      { betType: "三連複", key: "trio", unit: 100, riskLevel: "High", target: "1着2着3着の馬を順不同で当てる", engineRoute: "Trifecta AI / ROI Engine" },
      { betType: "三連単", key: "trifecta", unit: 100, riskLevel: "High", target: "1着2着3着の馬を順番通り当てる", engineRoute: "Trifecta AI / ROI Engine" },
      { betType: "WIN5", key: "win5", unit: 100, riskLevel: "Monster", target: "対象5レースの1着馬を当てる", engineRoute: "WIN5 AI / ROI Engine" }
    ]
  };

  const aliasMap = {
    Win: "単勝",
    Place: "複勝",
    Quinella: "馬連",
    Exacta: "馬単",
    Trio: "三連複",
    Trifecta: "三連単",
    "3連複": "三連複",
    "3連単": "三連単",
    win: "単勝",
    place: "複勝",
    quinella: "馬連",
    exacta: "馬単",
    trio: "三連複",
    trifecta: "三連単",
    win5: "WIN5"
  };

  const allocationProfiles = {
    Conservative: { win: 0.26, place: 0.28, quinella: 0.15, exacta: 0.1, trio: 0.1, trifecta: 0.07, win5: 0.04 },
    Balanced: { win: 0.16, place: 0.18, quinella: 0.16, exacta: 0.14, trio: 0.16, trifecta: 0.14, win5: 0.06 },
    Aggressive: { win: 0.08, place: 0.1, quinella: 0.13, exacta: 0.16, trio: 0.18, trifecta: 0.24, win5: 0.11 }
  };

  function normalizeBetType(value) {
    const text = String(value || "").trim();
    return aliasMap[text] || text;
  }

  function validateBetTypes(types) {
    const normalized = (types || []).map(normalizeBetType);
    const missing = canonicalBetTypes.filter((type) => !normalized.includes(type));
    const extra = normalized.filter((type) => !canonicalBetTypes.includes(type));
    return {
      valid: missing.length === 0 && extra.length === 0,
      normalized,
      missing,
      extra
    };
  }

  function calculateAllocation(budget, mode, records) {
    const profile = allocationProfiles[mode] || allocationProfiles.Balanced;
    const sourceRecords = records || fallbackDatabase.records;
    return sourceRecords.map((record) => {
      const ratio = profile[record.key] || 0;
      return {
        betType: record.betType,
        key: record.key,
        riskLevel: record.riskLevel,
        ratio: Number((ratio * 100).toFixed(1)),
        amount: Math.round((Number(budget) || 0) * ratio),
        unit: record.unit,
        engineRoute: record.engineRoute
      };
    });
  }

  function buildTicketPlan({ budget = 10000, mode = "Balanced", records } = {}) {
    const sourceRecords = records || fallbackDatabase.records;
    const allocation = calculateAllocation(budget, mode, sourceRecords);
    return {
      mode,
      budget: Number(budget) || 0,
      betTypes: sourceRecords.map((record) => record.betType),
      allocation,
      totalAmount: allocation.reduce((total, item) => total + item.amount, 0),
      primaryBetType: allocation.slice().sort((left, right) => right.amount - left.amount)[0]?.betType || "単勝"
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = source.records || [];
    const validation = validateBetTypes(records.map((record) => record.betType));
    const balancedPlan = buildTicketPlan({ budget: 10000, mode: "Balanced", records });
    return {
      databaseName: source.databaseName || "betTypeMasterDatabase",
      phase: source.phase || "Phase14-3",
      canonicalBetTypes,
      aliasMap,
      allocationProfiles,
      records,
      validation,
      plans: {
        Conservative: buildTicketPlan({ budget: 10000, mode: "Conservative", records }),
        Balanced: balancedPlan,
        Aggressive: buildTicketPlan({ budget: 10000, mode: "Aggressive", records })
      },
      widget: {
        betTypeCount: records.length,
        validationStatus: validation.valid ? "Ready" : "Needs Review",
        primaryBetType: balancedPlan.primaryBetType,
        totalAmount: balancedPlan.totalAmount
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
    element.innerHTML = items.map(renderer).join("");
  }

  function renderTable(records) {
    const table = document.getElementById("phase143-bet-type-table");
    if (!table) return;
    table.innerHTML = records.map((record) => `<tr><td>${record.betType}</td><td>${record.key}</td><td>${record.unit}</td><td>${record.riskLevel}</td><td>${record.target}</td><td>${record.engineRoute}</td></tr>`).join("");
  }

  function renderDashboard(report) {
    setText("phase143-widget-count", `${report.widget.betTypeCount}`);
    setText("phase143-widget-status", report.widget.validationStatus);
    setText("phase143-widget-primary", report.widget.primaryBetType);
    setText("phase143-widget-total", `${report.widget.totalAmount}`);
    renderCards("phase143-bet-types", report.records, (record) => `<article><span>${record.betType}</span><strong>${record.riskLevel}</strong><em>${record.engineRoute}</em></article>`);
    renderCards("phase143-balanced-plan", report.plans.Balanced.allocation, (item) => `<article><span>${item.betType}</span><strong>${item.ratio}%</strong><em>${item.amount}円 / ${item.riskLevel}</em></article>`);
    renderTable(report.records);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch("data/betTypeMasterDatabase.json", { cache: "no-store" });
      if (!response.ok) throw new Error("betTypeMasterDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderDashboard(report);
    window.HashimotoPhase143BetTypeMasterReport = report;
  }

  window.HashimotoPhase143BetTypeMaster = {
    allocationProfiles,
    buildDashboard,
    buildTicketPlan,
    calculateAllocation,
    canonicalBetTypes,
    fallbackDatabase,
    normalizeBetType,
    validateBetTypes
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
