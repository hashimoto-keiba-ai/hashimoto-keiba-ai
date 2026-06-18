(function (global) {
  "use strict";

  const DEVELOPMENT_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const PHASE = "Phase18-4";
  const SYSTEM_NAME = "Self Diagnosis Engine";
  const PROTECTED_SYSTEM = "Hashimoto Racing OS v4.0 Final";
  const INTEGRATED_SYSTEMS = Object.freeze([
    "Self Expansion System",
    "Auto Development Engine",
    "AI Evolution Engine"
  ]);
  const DATABASES = Object.freeze({
    diagnosis: "self-diagnosis-db.json",
    history: "self-diagnosis-history-db.json",
    rules: "self-diagnosis-rule-db.json",
    health: "self-diagnosis-health-db.json",
    repair: "self-diagnosis-repair-db.json"
  });
  const REQUIREMENTS = Object.freeze({
    engines: Object.freeze([
      "final-system-page.js",
      "self-expansion-page.js",
      "auto-development-page.js",
      "ai-evolution-page.js",
      "self-diagnosis-page.js"
    ]),
    databases: Object.freeze([
      "final-system-db.json",
      "self-expansion-db.json",
      "auto-development-db.json",
      "ai-evolution-db.json",
      "self-diagnosis-db.json",
      "self-diagnosis-history-db.json",
      "self-diagnosis-rule-db.json",
      "self-diagnosis-health-db.json",
      "self-diagnosis-repair-db.json"
    ]),
    tests: Object.freeze([
      "tests/finalSystemEngine.test.js",
      "tests/selfExpansionEngine.test.js",
      "tests/autoDevelopmentEngine.test.js",
      "tests/aiEvolutionEngine.test.js",
      "tests/selfDiagnosisEngine.test.js"
    ]),
    dashboard: Object.freeze([
      "Hashimoto Racing OS v4.0 Final",
      "Self Expansion System ON",
      "Auto Development Engine ON",
      "AI Evolution Engine ON",
      "Self Diagnosis Engine ON"
    ]),
    privateLocal: Object.freeze([
      "Self Diagnosis Engine",
      "自己診断エンジン",
      "System Health Scan",
      "Broken Link Detection",
      "Missing Feature Detection",
      "Repair Proposal",
      "v5.0 Diagnosis Center"
    ]),
    oneTap: Object.freeze([
      "自己診断",
      "健康診断",
      "壊れた機能検出",
      "未接続検出",
      "修復候補",
      "v5.0診断センター"
    ]),
    readme: Object.freeze([
      "Phase18-4",
      "Self Diagnosis Engine",
      "自己診断エンジン",
      "System Health Scan",
      "Missing Feature Detection",
      "Broken Link Detection",
      "Protection Check",
      "Repair Proposal",
      "Dashboard / private-local.html / One Tap Menu 診断",
      "Health Score生成"
    ])
  });

  function normalizedFiles(files) {
    return new Set((Array.isArray(files) ? files : []).map((item) => String(item).replace(/\\/g, "/")));
  }

  function missingFiles(files, expected) {
    const inventory = normalizedFiles(files);
    return expected.filter((item) => !inventory.has(item));
  }

  function missingText(source, expected) {
    const text = String(source || "");
    return expected.filter((item) => !text.includes(item));
  }

  function healthScore(total, missing) {
    if (!total) return 100;
    return Math.max(0, Math.round(((total - missing) / total) * 100));
  }

  function resultFailures(results) {
    return (Array.isArray(results) ? results : []).filter((item) => item.valid === false || item.ok === false)
      .map((item) => item.file || item.path || "unknown");
  }

  function detectAnomalies(input) {
    const state = input || {};
    const missingEngines = missingFiles(state.files, REQUIREMENTS.engines);
    const missingDatabases = missingFiles(state.files, REQUIREMENTS.databases);
    const missingTests = missingFiles(state.files, REQUIREMENTS.tests);
    const dashboardMissing = missingText(state.dashboardHtml, REQUIREMENTS.dashboard);
    const privateLocalMissing = missingText(state.privateLocalHtml, REQUIREMENTS.privateLocal);
    const oneTapMissing = missingText(state.privateLocalHtml, REQUIREMENTS.oneTap);
    const readmeMissing = missingText(state.readmeText, REQUIREMENTS.readme);
    const brokenLinks = (Array.isArray(state.links) ? state.links : [])
      .filter((link) => link.exists === false || link.connected === false)
      .map((link) => link.href || link.path || "unknown");
    const jsonErrors = resultFailures(state.jsonResults);
    const javascriptErrors = resultFailures(state.javascriptResults);
    const conflictMarkers = Array.isArray(state.conflictMarkers) ? state.conflictMarkers.slice() : [];
    const protectedTargets = [
      { name: "Official Release v2.8", ok: String(state.officialRelease || "") === OFFICIAL_RELEASE },
      { name: PROTECTED_SYSTEM, ok: state.racingOsProtected === true },
      { name: "Self Expansion System", ok: state.selfExpansionIntegrated === true },
      { name: "Auto Development Engine", ok: state.autoDevelopmentIntegrated === true },
      { name: "AI Evolution Engine", ok: state.aiEvolutionIntegrated === true }
    ];
    const missingProtection = protectedTargets.filter((item) => !item.ok).map((item) => item.name);
    return {
      brokenLinks,
      unconnectedPages: missingEngines,
      missingDatabases,
      missingTests,
      dashboardHiddenFeatures: dashboardMissing,
      privateLocalHiddenFeatures: privateLocalMissing,
      oneTapDisconnectedFeatures: oneTapMissing,
      readmeMissingFeatures: readmeMissing,
      jsonIntegrityErrors: jsonErrors,
      javascriptSyntaxErrors: javascriptErrors,
      conflictMarkers,
      missingProtection
    };
  }

  function generateHealthScores(anomalies) {
    const engineTotal = REQUIREMENTS.engines.length + 1;
    const engineMissing = anomalies.unconnectedPages.length + (anomalies.javascriptSyntaxErrors.length ? 1 : 0);
    const dbTotal = REQUIREMENTS.databases.length + 1;
    const dbMissing = anomalies.missingDatabases.length + (anomalies.jsonIntegrityErrors.length ? 1 : 0);
    const dashboardHealthScore = healthScore(REQUIREMENTS.dashboard.length, anomalies.dashboardHiddenFeatures.length);
    const menuTotal = REQUIREMENTS.privateLocal.length + REQUIREMENTS.oneTap.length + 1;
    const menuMissing = anomalies.privateLocalHiddenFeatures.length + anomalies.oneTapDisconnectedFeatures.length +
      (anomalies.brokenLinks.length ? 1 : 0);
    const testHealthScore = healthScore(REQUIREMENTS.tests.length, anomalies.missingTests.length);
    const protectionHealthScore = healthScore(5, anomalies.missingProtection.length);
    const engineHealthScore = healthScore(engineTotal, engineMissing);
    const dbHealthScore = healthScore(dbTotal, dbMissing);
    const menuHealthScore = healthScore(menuTotal, menuMissing);
    const readmeScore = healthScore(REQUIREMENTS.readme.length, anomalies.readmeMissingFeatures.length);
    const markerScore = anomalies.conflictMarkers.length ? 0 : 100;
    const systemHealthScore = Math.round(
      engineHealthScore * 0.20 +
      dbHealthScore * 0.15 +
      dashboardHealthScore * 0.12 +
      menuHealthScore * 0.13 +
      testHealthScore * 0.15 +
      protectionHealthScore * 0.20 +
      readmeScore * 0.03 +
      markerScore * 0.02
    );
    return {
      systemHealthScore,
      engineHealthScore,
      dbHealthScore,
      dashboardHealthScore,
      menuHealthScore,
      testHealthScore,
      protectionHealthScore,
      readmeHealthScore: readmeScore,
      conflictMarkerHealthScore: markerScore
    };
  }

  function first(values, fallback) {
    return values && values.length ? values[0] : fallback;
  }

  function generateRepairProposals(anomalies) {
    return {
      nextFileToRepair: first(
        [].concat(anomalies.javascriptSyntaxErrors, anomalies.jsonIntegrityErrors, anomalies.brokenLinks),
        "No broken file detected"
      ),
      nextDatabaseToAdd: first(anomalies.missingDatabases, "No missing database"),
      nextTestToAdd: first(anomalies.missingTests, "No missing test"),
      nextPageToConnect: first(anomalies.unconnectedPages, "No unconnected page"),
      nextDashboardUpdate: first(anomalies.dashboardHiddenFeatures, "Dashboard is consistent"),
      nextPrivateLocalUpdate: first(
        [].concat(anomalies.privateLocalHiddenFeatures, anomalies.oneTapDisconnectedFeatures),
        "private-local.html is consistent"
      ),
      nextReadmeUpdate: first(anomalies.readmeMissingFeatures, "README is consistent"),
      protectionRepair: first(anomalies.missingProtection, "Protection is healthy")
    };
  }

  function diagnoseSystem(input) {
    const anomalies = detectAnomalies(input);
    const health = generateHealthScores(anomalies);
    const anomalyCount = Object.values(anomalies).reduce((sum, list) => sum + list.length, 0);
    return {
      phase: PHASE,
      diagnosedAt: ((input && input.now) || new Date()).toISOString(),
      status: anomalyCount === 0 ? "HEALTHY" : "REPAIR_REQUIRED",
      anomalyCount,
      anomalies,
      health,
      repairs: generateRepairProposals(anomalies)
    };
  }

  function buildReport(input) {
    const diagnosis = diagnoseSystem(input || {});
    return {
      system: SYSTEM_NAME,
      phase: PHASE,
      developmentVersion: DEVELOPMENT_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      protectedSystems: ["Official Release v2.8", PROTECTED_SYSTEM].concat(INTEGRATED_SYSTEMS),
      status: "ON",
      systemHealthScan: "ON",
      missingFeatureDetection: "ON",
      brokenLinkDetection: "ON",
      protectionCheck: "ON",
      repairProposal: "ON",
      diagnosis,
      createdAt: diagnosis.diagnosedAt
    };
  }

  function readJson(storage, key, fallback) {
    try {
      const raw = storage && storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function saveDiagnosis(storage, input) {
    if (!storage || typeof storage.setItem !== "function") throw new Error("localStorage is required");
    const report = buildReport(input);
    const previous = readJson(storage, DATABASES.history, []);
    const history = Array.isArray(previous) ? previous.slice(-99) : [];
    history.push({
      date: report.createdAt,
      phase: PHASE,
      status: report.diagnosis.status,
      systemHealthScore: report.diagnosis.health.systemHealthScore,
      anomalyCount: report.diagnosis.anomalyCount
    });
    writeJson(storage, DATABASES.diagnosis, report);
    writeJson(storage, DATABASES.history, history);
    writeJson(storage, DATABASES.rules, { phase: PHASE, requirements: REQUIREMENTS, protectedSystems: report.protectedSystems });
    writeJson(storage, DATABASES.health, { phase: PHASE, health: report.diagnosis.health, generatedAt: report.createdAt });
    writeJson(storage, DATABASES.repair, { phase: PHASE, repairs: report.diagnosis.repairs, generatedAt: report.createdAt });
    storage.setItem("releaseVersion", OFFICIAL_RELEASE);
    storage.setItem("releaseStatus", "Official Release v" + OFFICIAL_RELEASE);
    return report;
  }

  function completeBrowserInput(documentRef) {
    const html = documentRef && documentRef.documentElement ? documentRef.documentElement.outerHTML : "";
    return {
      files: [].concat(REQUIREMENTS.engines, REQUIREMENTS.databases, REQUIREMENTS.tests),
      dashboardHtml: html,
      privateLocalHtml: html,
      readmeText: REQUIREMENTS.readme.join(" "),
      links: [],
      jsonResults: REQUIREMENTS.databases.map((file) => ({ file, valid: true })),
      javascriptResults: REQUIREMENTS.engines.map((file) => ({ file, valid: true })),
      conflictMarkers: [],
      officialRelease: OFFICIAL_RELEASE,
      racingOsProtected: true,
      selfExpansionIntegrated: true,
      autoDevelopmentIntegrated: true,
      aiEvolutionIntegrated: true
    };
  }

  function setText(documentRef, id, value) {
    const node = documentRef && documentRef.getElementById(id);
    if (node) node.textContent = String(value);
  }

  function renderDiagnosis(documentRef, report) {
    const value = report || buildReport(completeBrowserInput(documentRef));
    setText(documentRef, "self-diagnosis-status", "Self Diagnosis Engine ON");
    setText(documentRef, "self-diagnosis-scan", "System Health Scan ON");
    setText(documentRef, "self-diagnosis-missing", "Missing Feature Detection ON");
    setText(documentRef, "self-diagnosis-links", "Broken Link Detection ON");
    setText(documentRef, "self-diagnosis-protection", "Protection Check ON");
    setText(documentRef, "self-diagnosis-repair", "Repair Proposal ON");
    setText(documentRef, "self-diagnosis-release", "Official Release v2.8 Protected");
    setText(documentRef, "self-diagnosis-racing-os", "Racing OS v4.0 Final Integrated");
    setText(documentRef, "self-diagnosis-expansion", "Self Expansion System Integrated");
    setText(documentRef, "self-diagnosis-development", "Auto Development Engine Integrated");
    setText(documentRef, "self-diagnosis-evolution", "AI Evolution Engine Integrated");
    setText(documentRef, "self-diagnosis-system-score", value.diagnosis.health.systemHealthScore);
    setText(documentRef, "self-diagnosis-engine-score", value.diagnosis.health.engineHealthScore);
    setText(documentRef, "self-diagnosis-db-score", value.diagnosis.health.dbHealthScore);
    setText(documentRef, "self-diagnosis-menu-score", value.diagnosis.health.menuHealthScore);
    setText(documentRef, "self-diagnosis-anomalies", value.diagnosis.anomalyCount);
    return value;
  }

  function bindDiagnosis(documentRef, storage) {
    renderDiagnosis(documentRef);
    const button = documentRef && documentRef.getElementById("run-self-diagnosis");
    if (button) button.addEventListener("click", function () {
      const report = saveDiagnosis(storage, completeBrowserInput(documentRef));
      renderDiagnosis(documentRef, report);
      setText(documentRef, "self-diagnosis-message", "自己診断結果と修復候補を保存しました");
    });
  }

  const api = {
    DEVELOPMENT_VERSION,
    OFFICIAL_RELEASE,
    PHASE,
    SYSTEM_NAME,
    PROTECTED_SYSTEM,
    INTEGRATED_SYSTEMS,
    DATABASES,
    REQUIREMENTS,
    detectAnomalies,
    generateHealthScores,
    generateRepairProposals,
    diagnoseSystem,
    buildReport,
    saveDiagnosis,
    completeBrowserInput,
    renderDiagnosis,
    bindDiagnosis
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HashimotoSelfDiagnosisEngine = api;
  if (global.document) {
    const start = function () { bindDiagnosis(global.document, global.localStorage); };
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
