(function () {
  const supportedDataTypes = ["Prediction", "Result", "OS Update", "AI Index", "WIN5", "Trifecta", "ROI"];
  const targetDatabaseMap = {
    Prediction: "Prediction Database",
    Result: "Result Database",
    "OS Update": "OS Update Database",
    "AI Index": "AI Index Database",
    WIN5: "WIN5 Database",
    Trifecta: "Trifecta Database",
    ROI: "ROI Database"
  };
  const fallbackDatabase = {
    databaseName: "realRacingDataLoaderDatabase",
    phase: "Phase13-3",
    records: [
      {
        loadDate: "2026-06-06",
        source: "Tokyo migrated prediction batch",
        dataType: "Prediction",
        racecourse: "Tokyo",
        raceName: "Tokyo 11R Future Simulation Stakes",
        recordCount: 2,
        loadStatus: "Ready",
        targetDatabase: "Prediction Database",
        loadedRecords: [
          { racecourse: "Tokyo", raceName: "Tokyo 11R Future Simulation Stakes", horseNumber: 1, horseName: "AI Commander", aiScore: 91, popularity: 1, prediction: "Win candidate" },
          { racecourse: "Tokyo", raceName: "Tokyo 11R Future Simulation Stakes", horseNumber: 3, horseName: "Kami Flash", aiScore: 84, popularity: 6, prediction: "Kami-Ana candidate" }
        ],
        normalizedRecords: 2,
        validationErrors: 0,
        notes: "Loads Phase13-2 migrated data into the prediction database."
      },
      {
        loadDate: "2026-06-06",
        source: "WIN5 migrated result batch",
        dataType: "WIN5",
        racecourse: "WIN5",
        raceName: "Kyoto 12R WIN5 Finish",
        recordCount: 1,
        loadStatus: "Ready",
        targetDatabase: "WIN5 Database",
        loadedRecords: [
          { racecourse: "Kyoto", raceName: "Kyoto 12R WIN5 Finish", horseNumber: 3, horseName: "AI-03", aiScore: 89, popularity: 2, result: "WIN5 leg hit" }
        ],
        normalizedRecords: 1,
        validationErrors: 0,
        notes: "Loads WIN5 migrated result data into the WIN5 database."
      }
    ]
  };

  function toCamelCase(value) {
    const aliases = {
      "AI Score": "aiScore",
      WIN5: "win5",
      ROI: "roi"
    };
    const rawValue = String(value || "").trim().replace(/^\uFEFF/, "");
    if (aliases[rawValue]) return aliases[rawValue];
    return rawValue
      .trim()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[A-Z]/, (char) => char.toLowerCase());
  }

  function normalizeValue(value) {
    const trimmed = String(value ?? "").trim();
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    return trimmed;
  }

  function normalizeRecord(record) {
    return Object.entries(record || {}).reduce((normalized, [key, value]) => {
      normalized[toCamelCase(key)] = normalizeValue(value);
      return normalized;
    }, {});
  }

  function validateLoadedRecord(record) {
    const errors = [];
    if (!record.racecourse) errors.push("Missing racecourse");
    if (!record.raceName && !record.race) errors.push("Missing race name");
    if (record.horseNumber === undefined || record.horseNumber === "") errors.push("Missing horse number");
    if (!record.horseName) errors.push("Missing horse name");
    if (record.aiScore !== undefined && (Number(record.aiScore) < 0 || Number(record.aiScore) > 100 || Number.isNaN(Number(record.aiScore)))) errors.push("Invalid AI score");
    if (record.popularity !== undefined && (Number(record.popularity) < 1 || Number.isNaN(Number(record.popularity)))) errors.push("Invalid popularity");
    return errors;
  }

  function chooseTargetDatabase(dataType) {
    return targetDatabaseMap[dataType] || "Prediction Database";
  }

  function loadBatch({ source, dataType, racecourse, raceName, records }) {
    const normalized = (records || []).map(normalizeRecord);
    const validation = normalized.map((record, index) => ({ index, record, errors: validateLoadedRecord(record) }));
    const validationErrors = validation.reduce((total, item) => total + item.errors.length, 0);
    return {
      loadDate: new Date().toISOString().slice(0, 10),
      source,
      dataType,
      racecourse,
      raceName,
      recordCount: normalized.length,
      loadStatus: validationErrors ? "Validation Error" : "Loaded",
      targetDatabase: chooseTargetDatabase(dataType),
      loadedRecords: normalized,
      normalizedRecords: normalized.length,
      validationErrors,
      validation,
      notes: validationErrors ? "Fix validation errors before final load." : `Loaded into ${chooseTargetDatabase(dataType)}.`
    };
  }

  function createLoadReport(records) {
    const batches = records || [];
    const loadedBatches = batches.filter((record) => record.loadStatus === "Loaded" || record.loadStatus === "Ready");
    const validationErrors = batches.reduce((total, record) => total + (Number(record.validationErrors) || 0), 0);
    return {
      loadStatus: validationErrors ? "Needs Review" : "Ready",
      batchCount: batches.length,
      loadedBatchCount: loadedBatches.length,
      totalRecords: batches.reduce((total, record) => total + (Number(record.recordCount) || 0), 0),
      normalizedRecords: batches.reduce((total, record) => total + (Number(record.normalizedRecords) || 0), 0),
      validationErrors,
      targetDatabases: [...new Set(batches.map((record) => record.targetDatabase).filter(Boolean))]
    };
  }

  function buildDashboard(database) {
    const source = database || fallbackDatabase;
    const records = source.records || [];
    const report = createLoadReport(records);
    return {
      databaseName: source.databaseName || "realRacingDataLoaderDatabase",
      phase: source.phase || "Phase13-3",
      supportedDataTypes,
      targetDatabaseMap,
      records,
      report,
      widget: {
        loadStatus: report.loadStatus,
        loadedRecords: report.normalizedRecords,
        validationErrors: report.validationErrors,
        targetDatabaseCount: report.targetDatabases.length
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
    const table = document.getElementById("phase133-loader-database");
    if (!table) return;
    table.innerHTML = records.map((record) => `<tr><td>${record.loadDate}</td><td>${record.source}</td><td>${record.dataType}</td><td>${record.racecourse}</td><td>${record.raceName}</td><td>${record.recordCount}</td><td>${record.loadStatus}</td><td>${record.targetDatabase}</td><td>${record.normalizedRecords}</td><td>${record.validationErrors}</td><td>${record.notes}</td></tr>`).join("");
  }

  function renderDashboard(report) {
    setText("phase133-widget-status", report.widget.loadStatus);
    setText("phase133-widget-loaded", `${report.widget.loadedRecords}`);
    setText("phase133-widget-errors", `${report.widget.validationErrors}`);
    setText("phase133-widget-targets", `${report.widget.targetDatabaseCount}`);
    renderCards("phase133-supported-types", report.supportedDataTypes, (type) => `<article><span>${type}</span><strong>${chooseTargetDatabase(type)}</strong><em>loader route</em></article>`);
    renderCards("phase133-target-databases", report.report.targetDatabases, (target) => `<article><span>${target}</span><strong>Target</strong><em>real data load</em></article>`);
    renderCards("phase133-load-report", [report.report], (item) => `<article><span>${item.loadStatus}</span><strong>${item.normalizedRecords} records</strong><em>${item.validationErrors} validation errors</em></article>`);
    renderTable(report.records);
  }

  async function loadDatabase() {
    if (typeof fetch !== "function") return fallbackDatabase;
    try {
      const response = await fetch("data/realRacingDataLoaderDatabase.json", { cache: "no-store" });
      if (!response.ok) throw new Error("realRacingDataLoaderDatabase fetch failed");
      return await response.json();
    } catch (error) {
      return fallbackDatabase;
    }
  }

  async function bootstrap() {
    const database = await loadDatabase();
    const report = buildDashboard(database);
    renderDashboard(report);
    window.HashimotoPhase133RealRacingDataLoaderReport = report;
  }

  window.HashimotoPhase133RealRacingDataLoader = {
    buildDashboard,
    chooseTargetDatabase,
    createLoadReport,
    fallbackDatabase,
    loadBatch,
    normalizeRecord,
    supportedDataTypes,
    targetDatabaseMap,
    validateLoadedRecord
  };

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", bootstrap);
})();
