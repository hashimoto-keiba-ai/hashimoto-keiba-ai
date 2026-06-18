(() => {
  "use strict";

  const OS_VERSION = "4.0";
  const OFFICIAL_RELEASE = "2.8";
  const PHASE = "Phase17-5";
  const SYSTEM_NAME = "Hashimoto Racing OS v4.0 Final";
  const DATABASE_KEYS = Object.freeze({
    system: "final-system-db.json",
    status: "final-status-db.json",
    history: "final-history-db.json",
    release: "final-release-db.json"
  });
  const REQUIRED_COMPONENTS = Object.freeze([
    { phase: "Phase16", name: "Super Core Engine", keys: ["super-core-engine", "integrated-os.json"] },
    { phase: "Phase16", name: "Super Self Evolution Engine", keys: ["super-self-evolution-engine", "self-evolution-db.json"] },
    { phase: "Phase16", name: "Full Auto Learning Engine", keys: ["full-auto-learning-engine", "learning-engine.json"] },
    { phase: "Phase16", name: "Future Prediction Engine", keys: ["future-prediction-engine", "prediction-engine.json", "global-future-db.json"] },
    { phase: "Phase16", name: "God AI Engine", keys: ["god-ai-engine", "data/godRaceDatabase.json"] },
    { phase: "Phase16", name: "Universal Racing Intelligence Engine", keys: ["universal-racing-intelligence-engine", "global-network-db.json"] },
    { phase: "Phase17", name: "Hashimoto Racing OS v4.0", keys: ["racing-os-v4", "integrated-os.json"] },
    { phase: "Phase17", name: "Autonomous Research Institute", keys: ["autonomous-research-institute", "research-lab-db.json"] },
    { phase: "Phase17", name: "Self Optimization Center", keys: ["self-optimization-center", "evolution-rule-db.json"] },
    { phase: "Phase17", name: "Global Intelligence Network", keys: ["global-network-db.json"] }
  ]);
  const MONITORED_DATABASES = Object.freeze([
    "integrated-os.json", "learning-engine.json", "prediction-engine.json", "research-lab-db.json",
    "self-evolution-db.json", "evolution-rule-db.json", "success-pattern-db.json", "failure-pattern-db.json",
    "profit-db.json", "return-ai-db.json", "bankroll-db.json", "win5-db.json",
    "global-network-db.json", "global-learning-db.json", "global-pattern-db.json",
    "global-future-db.json", "global-evolution-db.json", "global-history-db.json"
  ]);

  const readJson = (storage, key, fallback = null) => {
    try {
      const raw = storage?.getItem?.(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const recordsOf = (value) => Array.isArray(value) ? value : Array.isArray(value?.records) ? value.records : value ? [value] : [];
  const latestOf = (value) => {
    const records = recordsOf(value);
    return records[0] || {};
  };
  const exists = (storage, key) => storage?.getItem?.(key) !== null;
  const round = (value) => Math.round(Number(value || 0) * 10) / 10;

  const inspectComponents = ({ storage = globalThis.localStorage } = {}) => REQUIRED_COMPONENTS.map((component) => {
    const activeKeys = component.keys.filter((key) => exists(storage, key));
    return { ...component, activeKeys, online: activeKeys.length > 0, status: activeKeys.length ? "ONLINE" : "WAITING" };
  });
  const inspectDatabases = ({ storage = globalThis.localStorage } = {}) => MONITORED_DATABASES.map((key) => {
    const value = readJson(storage, key);
    return { key, available: value !== null, recordCount: recordsOf(value).length, healthy: value !== null };
  });
  const resolveHealthScore = (storage) => {
    const health = latestOf(readJson(storage, "finalHealthCheckReports", []));
    return round(health.healthScore ?? health.score ?? 0);
  };
  const resolveVersion = (storage) => String(storage?.getItem?.("releaseVersion") || OFFICIAL_RELEASE).replace(/^"|"$/g, "");

  const judgeProductionReady = ({ healthScore, componentCoverage, databaseCoverage, criticalErrors, versionProtected }) => {
    const conditions = [
      { key: "health", label: "Health Score 90以上", passed: healthScore >= 90 },
      { key: "components", label: "必須機能80%以上接続", passed: componentCoverage >= 80 },
      { key: "databases", label: "監視DB80%以上正常", passed: databaseCoverage >= 80 },
      { key: "criticalErrors", label: "重大エラー0件", passed: criticalErrors === 0 },
      { key: "version", label: "Official Release v2.8保護", passed: versionProtected }
    ];
    const ready = conditions.every((condition) => condition.passed);
    return { ready, status: ready ? "Production Ready" : "Final Validation", conditions };
  };

  const buildFinalSystemReport = ({ storage = globalThis.localStorage, now = () => new Date() } = {}) => {
    const components = inspectComponents({ storage });
    const databases = inspectDatabases({ storage });
    const health = latestOf(readJson(storage, "finalHealthCheckReports", []));
    const healthScore = resolveHealthScore(storage);
    const criticalErrors = Number(health.criticalErrors ?? health.counts?.error ?? 0);
    const componentCoverage = round(components.filter((item) => item.online).length / components.length * 100);
    const databaseCoverage = round(databases.filter((item) => item.healthy).length / databases.length * 100);
    const currentVersion = resolveVersion(storage);
    const versionProtected = currentVersion === OFFICIAL_RELEASE;
    const decision = judgeProductionReady({ healthScore, componentCoverage, databaseCoverage, criticalErrors, versionProtected });
    return {
      phase: PHASE, systemName: SYSTEM_NAME, osVersion: OS_VERSION, officialRelease: OFFICIAL_RELEASE,
      generatedAt: now().toISOString(), systemStatus: decision.ready ? "AUTONOMOUS" : "MONITORING",
      autonomousControl: true, componentCoverage, databaseCoverage, healthScore, criticalErrors,
      currentVersion, versionProtected, productionReady: decision.ready, releaseStatus: decision.status,
      conditions: decision.conditions, components, databases
    };
  };

  const writeRecords = (storage, key, records) => {
    storage?.setItem?.(key, JSON.stringify({ databaseName: key.replace(/\.json$/, ""), phase: PHASE, osVersion: OS_VERSION, officialRelease: OFFICIAL_RELEASE, records }, null, 2));
  };
  const saveFinalSystem = ({ storage = globalThis.localStorage, report = buildFinalSystemReport({ storage }) } = {}) => {
    const prepend = (key, value) => writeRecords(storage, key, [value, ...recordsOf(readJson(storage, key, []))].slice(0, 500));
    prepend(DATABASE_KEYS.system, report);
    prepend(DATABASE_KEYS.status, { generatedAt: report.generatedAt, systemStatus: report.systemStatus, healthScore: report.healthScore, componentCoverage: report.componentCoverage, databaseCoverage: report.databaseCoverage });
    prepend(DATABASE_KEYS.history, { generatedAt: report.generatedAt, releaseStatus: report.releaseStatus, productionReady: report.productionReady, criticalErrors: report.criticalErrors });
    prepend(DATABASE_KEYS.release, { generatedAt: report.generatedAt, version: OFFICIAL_RELEASE, protected: true, status: report.releaseStatus, conditions: report.conditions });
    storage?.setItem?.("releaseVersion", OFFICIAL_RELEASE);
    storage?.setItem?.("releaseStatus", `Official Release v${OFFICIAL_RELEASE}`);
    return report;
  };
  const runAutonomousControl = ({ storage = globalThis.localStorage, now = () => new Date() } = {}) => saveFinalSystem({ storage, report: buildFinalSystemReport({ storage, now }) });

  const setText = (doc, id, value) => { const target = doc?.getElementById?.(id); if (target) target.textContent = value; };
  const renderFinalSystem = ({ storage = globalThis.localStorage, documentRef = globalThis.document } = {}) => {
    const report = buildFinalSystemReport({ storage });
    setText(documentRef, "final-system-status", report.systemStatus);
    setText(documentRef, "final-system-release", report.releaseStatus);
    setText(documentRef, "final-system-health", report.healthScore);
    setText(documentRef, "final-system-components", `${report.componentCoverage}%`);
    setText(documentRef, "final-system-databases", `${report.databaseCoverage}%`);
    setText(documentRef, "final-system-version", `v${report.currentVersion}`);
    setText(documentRef, "final-system-updated", new Date(report.generatedAt).toLocaleString("ja-JP"));
    return report;
  };
  const bindFinalSystem = ({ storage = globalThis.localStorage, documentRef = globalThis.document } = {}) => {
    if (!documentRef?.getElementById) return;
    documentRef.getElementById("run-final-system")?.addEventListener("click", () => {
      const report = runAutonomousControl({ storage });
      setText(documentRef, "final-system-message", `最終統合を保存しました: ${report.releaseStatus}`);
      renderFinalSystem({ storage, documentRef });
    });
    renderFinalSystem({ storage, documentRef });
  };

  const api = { OS_VERSION, OFFICIAL_RELEASE, PHASE, SYSTEM_NAME, DATABASE_KEYS, REQUIRED_COMPONENTS, MONITORED_DATABASES, readJson, inspectComponents, inspectDatabases, resolveHealthScore, judgeProductionReady, buildFinalSystemReport, saveFinalSystem, runAutonomousControl, renderFinalSystem, bindFinalSystem };
  if (typeof window !== "undefined") window.HashimotoFinalSystemEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => bindFinalSystem());
})();
