(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalNetworkSafetyScoring = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-15";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const SAFETY_STATUSES = ["safety_ready", "safety_warning", "safety_blocked", "protected_only", "preconnection_only"];
  const GATE_STATUSES = ["gate_closed_safe", "gate_warning", "gate_blocked", "gate_protected_only"];
  const DATABASES = ["global-network-safety-score-db.json", "global-network-preconnection-gate-db.json"];
  const SOURCE_DATABASES = ["global-intelligence-network-core-db.json", "global-intelligence-network-nodes-db.json", "global-network-node-sync-db.json", "global-network-dependency-validator-db.json"];
  const STORAGE_KEYS = { core: "globalIntelligenceNetworkCoreLatest", sync: "globalNetworkNodeSyncLatest", latest: "globalNetworkSafetyScoreLatest" };

  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  function summarizeSync(sync = {}, nodes = []) {
    const results = Array.isArray(sync.results) ? sync.results : [];
    const nodeIds = new Set(nodes.map((node) => node.node_id));
    const expectedIds = ["diagnosis_node", "repair_node", "approval_node", "audit_node", "governance_node", "alert_node", "safety_lock_node", "control_center_node", "readiness_simulator_node"];
    const missingNodeCount = results.length
      ? results.filter((result) => result.node_sync_status === "dependency_missing" && result.checks?.node_id_exists === false).length
      : expectedIds.filter((id) => !nodeIds.has(id)).length;
    const dependencyWarningCount = results.filter((result) => result.dependency_status === "dependency_warning").length;
    const dependencyBlockedCount = results.filter((result) => ["dependency_blocked", "dependency_missing"].includes(result.dependency_status)).length;
    const blockedNodeCount = results.length
      ? results.filter((result) => result.node_sync_status === "sync_blocked").length
      : nodes.filter((node) => node.status === "node_blocked").length;
    return { results, missingNodeCount, dependencyWarningCount, dependencyBlockedCount, blockedNodeCount };
  }

  function buildSafetyChecks(sources = {}) {
    const databases = sources.databases || {};
    const core = sources.core || databases["global-intelligence-network-core-db.json"] || {};
    const nodeDb = sources.nodeDb || databases["global-intelligence-network-nodes-db.json"] || {};
    const sync = sources.sync || databases["global-network-node-sync-db.json"] || {};
    const nodes = Array.isArray(core.nodes) ? core.nodes : Array.isArray(nodeDb.nodes) ? nodeDb.nodes : [];
    const summary = summarizeSync(sync, nodes);
    const executionFlags = [core.executionAllowed, core.autoExecutionAllowed, core.auto_execution_allowed, sync.executionAllowed, sync.autoExecutionAllowed, sync.auto_execution_allowed, ...nodes.map((node) => node.execution_allowed)].filter((value) => value !== undefined);
    const externalFlags = [core.external_connection_allowed, sync.external_connection_allowed, ...nodes.map((node) => node.external_connection_allowed)].filter((value) => value !== undefined);
    return {
      network_core_ready: ["skeleton_only", "node_ready"].includes(core.core_status || core.networkMode || "skeleton_only") && summary.blockedNodeCount === 0,
      node_sync_ready: ["sync_ready", undefined].includes(sync.overall_sync_status) && summary.missingNodeCount === 0 && summary.blockedNodeCount === 0,
      dependency_validation_ready: summary.dependencyWarningCount === 0 && summary.dependencyBlockedCount === 0,
      protected_release_ok: (core.officialReleaseStatus || "protected_only") === "protected_only" && nodes.some((node) => node.node_id === "safety_lock_node" && node.protected === true && node.status === "protected_only"),
      execution_blocked: executionFlags.every((flag) => flag === false),
      external_connection_blocked: externalFlags.every((flag) => flag === false),
      plan_only_enforced: [core.executionPolicy, sync.executionPolicy].filter(Boolean).every((policy) => policy === "PLAN_ONLY"),
      skeleton_only_enforced: (core.network_mode || core.networkMode || "skeleton_only") === "skeleton_only",
      readiness_only_enforced: (core.readiness_mode || core.readinessMode || "readiness_only") === "readiness_only",
      missing_node_count: summary.missingNodeCount,
      dependency_warning_count: summary.dependencyWarningCount,
      blocked_node_count: summary.blockedNodeCount
    };
  }

  function calculateSafetyScore(checks) {
    let score = 100;
    if (!checks.network_core_ready) score -= 20;
    if (!checks.node_sync_ready) score -= 15;
    if (!checks.dependency_validation_ready) score -= 15;
    if (!checks.protected_release_ok) score -= 20;
    if (!checks.execution_blocked) score -= 10;
    if (!checks.external_connection_blocked) score -= 10;
    if (!checks.plan_only_enforced) score -= 5;
    if (!checks.skeleton_only_enforced) score -= 3;
    if (!checks.readiness_only_enforced) score -= 2;
    score -= checks.missing_node_count * 10;
    score -= checks.dependency_warning_count * 5;
    score -= checks.blocked_node_count * 10;
    return clamp(score);
  }

  function determineSafetyStatus(checks, score, sources = {}) {
    if (sources.core?.core_status === "protected_only") return "protected_only";
    if (!checks.execution_blocked || !checks.external_connection_blocked || !checks.protected_release_ok || checks.blocked_node_count > 0 || checks.missing_node_count > 0) return "safety_blocked";
    if (score < 100) return "safety_warning";
    return "safety_ready";
  }

  function determineGateStatus(safetyStatus) {
    if (safetyStatus === "protected_only") return "gate_protected_only";
    if (safetyStatus === "safety_blocked") return "gate_blocked";
    if (safetyStatus === "safety_warning") return "gate_warning";
    return "gate_closed_safe";
  }

  function buildSafetyReport(sources = {}, now = () => new Date()) {
    const checks = buildSafetyChecks(sources);
    const safetyScore = calculateSafetyScore(checks);
    const safetyStatus = determineSafetyStatus(checks, safetyScore, sources);
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      officialReleaseStatus: "protected_only",
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      connection_allowed: false,
      generatedAt: now().toISOString(),
      safety_score: safetyScore,
      safety_status: safetyStatus,
      connection_gate_status: determineGateStatus(safetyStatus),
      checks,
      safety_notes: "Pre-Connection Gateは判定専用です。スコアに関係なく実接続・外部通信・自動実行を許可しません。"
    };
  }

  async function loadJson(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const storage = options.storage || window.localStorage;
    const loaded = await Promise.all(SOURCE_DATABASES.map(async (file) => [file, await loadJson(file, fetcher)]));
    return {
      databases: Object.fromEntries(loaded.filter(([, value]) => value)),
      core: readStoredJson(storage, STORAGE_KEYS.core),
      sync: readStoredJson(storage, STORAGE_KEYS.sync)
    };
  }

  function persistReport(report, storage) {
    if (storage) storage.setItem(STORAGE_KEYS.latest, JSON.stringify(report));
    return report;
  }

  function renderReport(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#network-safety-score", report.safety_score);
    set("#network-safety-status", report.safety_status);
    set("#network-gate-status", report.connection_gate_status);
    set("#network-gate-external", report.external_connection_allowed);
    set("#network-gate-missing", report.checks.missing_node_count);
    set("#network-gate-warnings", report.checks.dependency_warning_count);
    set("#network-gate-blocked", report.checks.blocked_node_count);
    set("#network-gate-updated", report.generatedAt);
    const list = doc.querySelector("#network-safety-check-list");
    if (list) list.innerHTML = Object.entries(report.checks).map(([name, value]) => `<li class="safety-score-check">${name}: ${value}</li>`).join("");
    return report;
  }

  async function runSafetyScoring(options = {}) {
    const storage = options.storage || window.localStorage;
    const report = buildSafetyReport(await loadSources({ ...options, storage }));
    persistReport(report, storage);
    return renderReport(report, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-network-safety-scoring");
      if (button) button.addEventListener("click", () => runSafetyScoring().catch(() => undefined));
      runSafetyScoring().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, SAFETY_STATUSES, GATE_STATUSES, DATABASES, SOURCE_DATABASES, STORAGE_KEYS, clamp, summarizeSync, buildSafetyChecks, calculateSafetyScore, determineSafetyStatus, determineGateStatus, buildSafetyReport, loadJson, loadSources, persistReport, renderReport, runSafetyScoring };
});
