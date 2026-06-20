(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalNetworkAuditReport = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-17";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const NETWORK_STATUSES = ["audit_ready", "audit_warning", "audit_blocked", "protected_only", "simulation_only"];
  const RISK_LEVELS = ["low", "medium", "high", "protected", "blocked"];
  const DATABASES = ["global-network-audit-report-db.json", "global-network-audit-summary-db.json"];
  const SOURCE_DATABASES = [
    "global-intelligence-network-core-db.json", "global-intelligence-network-nodes-db.json",
    "global-network-node-sync-db.json", "global-network-dependency-validator-db.json",
    "global-network-safety-score-db.json", "global-network-preconnection-gate-db.json",
    "global-network-simulation-log-db.json", "global-network-audit-trail-db.json"
  ];
  const STORAGE_KEYS = {
    core: "globalIntelligenceNetworkCoreLatest", sync: "globalNetworkNodeSyncLatest",
    safety: "globalNetworkSafetyScoreLatest", simulation: "globalNetworkSimulationLogLatest",
    audit: "globalNetworkAuditTrail", latest: "globalNetworkComprehensiveAuditLatest"
  };
  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };

  function summarizeSources(sources = {}) {
    const databases = sources.databases || {};
    const core = sources.core || databases["global-intelligence-network-core-db.json"] || {};
    const nodeDb = sources.nodeDb || databases["global-intelligence-network-nodes-db.json"] || {};
    const sync = sources.sync || databases["global-network-node-sync-db.json"] || {};
    const safety = sources.safety || databases["global-network-safety-score-db.json"] || {};
    const simulation = sources.simulation || databases["global-network-simulation-log-db.json"] || {};
    const auditHistory = Array.isArray(sources.audit) ? sources.audit : [];
    const nodes = Array.isArray(core.nodes) ? core.nodes : Array.isArray(nodeDb.nodes) ? nodeDb.nodes : [];
    const syncResults = Array.isArray(sync.results) ? sync.results : [];
    const logs = Array.isArray(simulation.logs) ? simulation.logs : [];
    const missingNodes = syncResults.filter((result) => result.node_sync_status === "dependency_missing" && result.checks?.node_id_exists === false).length || Math.max(0, 9 - nodes.length);
    const blockedNodes = syncResults.filter((result) => result.node_sync_status === "sync_blocked").length || nodes.filter((node) => node.status === "node_blocked").length;
    const dependencyWarnings = syncResults.filter((result) => result.dependency_status === "dependency_warning").length;
    const dependencyBlocked = syncResults.filter((result) => ["dependency_blocked", "dependency_missing"].includes(result.dependency_status)).length;
    const blockedReasons = [...new Set(logs.map((log) => log.blocked_reason).filter(Boolean))];
    return { core, sync, safety, simulation, auditHistory, nodes, syncResults, logs, missingNodes, blockedNodes, dependencyWarnings, dependencyBlocked, blockedReasons };
  }

  function determineNetworkStatus(summary) {
    if (summary.safety.safety_status === "protected_only" || summary.core.core_status === "protected_only") return "protected_only";
    if (summary.safety.safety_status === "safety_blocked" || summary.safety.connection_gate_status === "gate_blocked" || summary.missingNodes > 0 || summary.blockedNodes > 0 || summary.dependencyBlocked > 0) return "audit_blocked";
    if (summary.safety.safety_status === "safety_warning" || summary.dependencyWarnings > 0 || summary.sync.overall_sync_status === "sync_warning") return "audit_warning";
    if (!summary.logs.length) return "simulation_only";
    return "audit_ready";
  }

  function determineRiskLevel(status, summary) {
    if (status === "protected_only") return "protected";
    if (status === "audit_blocked") return "blocked";
    if (status === "audit_warning") return summary.dependencyWarnings > 1 ? "high" : "medium";
    return "low";
  }

  function recommendNextAction(status) {
    if (status === "protected_only") return "Official Release v2.8の保護状態を維持し、変更を伴わない監査確認を継続することが安全です。";
    if (status === "audit_blocked") return "blocked理由と依存欠落を確認し、実行を伴わない修復プランの再審査を検討できます。";
    if (status === "audit_warning") return "警告項目の根拠を確認し、次回のsimulation_only監査で再評価することを提案します。";
    if (status === "simulation_only") return "ローカル疑似監査ログを生成してから、監査レポートを再確認することを提案します。";
    return "現在のPLAN_ONLYとゲート閉鎖を維持し、定期的なローカル監査を継続することを提案します。";
  }

  function buildAuditReport(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const summary = summarizeSources(sources);
    const networkStatus = determineNetworkStatus(summary);
    const riskLevel = determineRiskLevel(networkStatus, summary);
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      report_id: `GNAR-${generatedAt.getTime()}`,
      generated_at: generatedAt.toISOString(),
      network_status: networkStatus,
      risk_level: riskLevel,
      node_summary: { expected: 9, detected: summary.nodes.length, missing: summary.missingNodes, blocked: summary.blockedNodes, protected: summary.nodes.filter((node) => node.protected === true).length },
      dependency_summary: { status: summary.dependencyBlocked ? "blocked" : summary.dependencyWarnings ? "warning" : "healthy", warnings: summary.dependencyWarnings, blocked: summary.dependencyBlocked },
      safety_score_summary: { score: Number(summary.safety.safety_score ?? 100), status: summary.safety.safety_status || "simulation_only" },
      preconnection_gate_summary: { status: summary.safety.connection_gate_status || "gate_closed_safe", connection_allowed: false, external_connection_allowed: false },
      simulation_log_summary: { count: summary.logs.length, blocked: summary.logs.filter((log) => log.safety_result !== "safe_blocked").length, mode: "simulation_only" },
      audit_trail_summary: { history_count: summary.auditHistory.length, latest_status: summary.simulation.audit_status || "simulation_only", retention_limit: 50 },
      protected_release_summary: { release: "Official Release v2.8", status: "protected", protected: true },
      blocked_reason_summary: { count: summary.blockedReasons.length, reasons: summary.blockedReasons },
      recommended_next_action: recommendNextAction(networkStatus)
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
      core: readStoredJson(storage, STORAGE_KEYS.core), sync: readStoredJson(storage, STORAGE_KEYS.sync),
      safety: readStoredJson(storage, STORAGE_KEYS.safety), simulation: readStoredJson(storage, STORAGE_KEYS.simulation),
      audit: readStoredJson(storage, STORAGE_KEYS.audit)
    };
  }

  function persistReport(report, storage) {
    if (storage) storage.setItem(STORAGE_KEYS.latest, JSON.stringify(report));
    return report;
  }

  function renderReport(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#comprehensive-audit-status", report.network_status);
    set("#comprehensive-audit-risk", report.risk_level);
    set("#comprehensive-audit-score", report.safety_score_summary.score);
    set("#comprehensive-audit-nodes", `${report.node_summary.detected}/${report.node_summary.expected}`);
    set("#comprehensive-audit-logs", report.simulation_log_summary.count);
    set("#comprehensive-audit-external", report.external_connection_allowed);
    set("#comprehensive-audit-action", report.recommended_next_action);
    set("#comprehensive-audit-updated", report.generated_at);
    const list = doc.querySelector("#comprehensive-audit-reasons");
    if (list) list.innerHTML = (report.blocked_reason_summary.reasons.length ? report.blocked_reason_summary.reasons : ["No additional blocked reason; Pre-Connection Gate remains closed."]).map((reason) => `<li>${reason}</li>`).join("");
    return report;
  }

  async function runComprehensiveAudit(options = {}) {
    const storage = options.storage || window.localStorage;
    const report = buildAuditReport(await loadSources({ ...options, storage }));
    persistReport(report, storage);
    return renderReport(report, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-comprehensive-audit");
      if (button) button.addEventListener("click", () => runComprehensiveAudit().catch(() => undefined));
      runComprehensiveAudit().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, NETWORK_STATUSES, RISK_LEVELS, DATABASES, SOURCE_DATABASES, STORAGE_KEYS, readStoredJson, summarizeSources, determineNetworkStatus, determineRiskLevel, recommendNextAction, buildAuditReport, loadJson, loadSources, persistReport, renderReport, runComprehensiveAudit };
});
