(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalNetworkSimulationLog = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-16";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const LOG_TARGETS = ["node_sync", "dependency_validation", "safety_scoring", "preconnection_gate", "readiness_simulation", "control_center"];
  const SIMULATION_MODES = ["simulation_only", "readiness_only", "skeleton_only", "blocked_simulation", "protected_only"];
  const SAFETY_RESULTS = ["safe_blocked", "warning_blocked", "protected_blocked", "dependency_blocked", "preconnection_closed"];
  const DATABASES = ["global-network-simulation-log-db.json", "global-network-audit-trail-db.json"];
  const SOURCE_DATABASES = [
    "global-intelligence-network-core-db.json", "global-intelligence-network-nodes-db.json",
    "global-network-node-sync-db.json", "global-network-dependency-validator-db.json",
    "global-network-safety-score-db.json", "global-network-preconnection-gate-db.json",
    "global-network-readiness-db.json", "global-intelligence-control-center-db.json"
  ];
  const STORAGE_KEYS = {
    core: "globalIntelligenceNetworkCoreLatest", sync: "globalNetworkNodeSyncLatest",
    safety: "globalNetworkSafetyScoreLatest", readiness: "globalNetworkReadinessLatest",
    control: "globalIntelligenceControlCenterLatest", latest: "globalNetworkSimulationLogLatest",
    audit: "globalNetworkAuditTrail"
  };
  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };

  function deriveContext(sources = {}) {
    const databases = sources.databases || {};
    const core = sources.core || databases["global-intelligence-network-core-db.json"] || {};
    const sync = sources.sync || databases["global-network-node-sync-db.json"] || {};
    const safety = sources.safety || databases["global-network-safety-score-db.json"] || {};
    const readiness = sources.readiness || databases["global-network-readiness-db.json"] || {};
    const control = sources.control || databases["global-intelligence-control-center-db.json"] || {};
    const results = Array.isArray(sync.results) ? sync.results : [];
    const dependencyProblems = results.filter((result) => ["dependency_warning", "dependency_blocked", "dependency_missing"].includes(result.dependency_status)).length;
    const syncBlocked = sync.overall_sync_status === "sync_blocked" || Number(sync.blocked_count || 0) > 0;
    const protectedOnly = safety.safety_status === "protected_only" || safety.connection_gate_status === "gate_protected_only";
    const gateStatus = safety.connection_gate_status || "gate_closed_safe";
    return { core, sync, safety, readiness, control, dependencyProblems, syncBlocked, protectedOnly, gateStatus };
  }

  function createLog(sequence, descriptor, timestamp) {
    return {
      log_id: `GNSL-${timestamp.getTime()}-${String(sequence + 1).padStart(2, "0")}`,
      source_phase: descriptor.source_phase,
      source_node: descriptor.source_node,
      target_node: descriptor.target_node,
      simulation_mode: descriptor.simulation_mode,
      simulated_event: descriptor.simulated_event,
      safety_result: descriptor.safety_result,
      blocked_reason: descriptor.blocked_reason,
      execution_allowed: false,
      external_connection_allowed: false,
      audit_notes: descriptor.audit_notes
    };
  }

  function buildSimulationLogs(sources = {}, now = () => new Date()) {
    const context = deriveContext(sources);
    const syncResult = context.syncBlocked ? "warning_blocked" : "safe_blocked";
    const dependencyResult = context.dependencyProblems ? "dependency_blocked" : "safe_blocked";
    const safetyResult = context.protectedOnly ? "protected_blocked" : context.safety.safety_status === "safety_warning" ? "warning_blocked" : "safe_blocked";
    const descriptors = [
      { source_phase: "Phase18-14", source_node: "control_center_node", target_node: "node_sync", simulation_mode: "simulation_only", simulated_event: "node_sync", safety_result: syncResult, blocked_reason: context.syncBlocked ? "Node sync validation reported a blocked state." : "Simulation-only node synchronization; execution is disabled.", audit_notes: "Nine-node synchronization was evaluated locally." },
      { source_phase: "Phase18-14", source_node: "node_sync", target_node: "dependency_validation", simulation_mode: "skeleton_only", simulated_event: "dependency_validation", safety_result: dependencyResult, blocked_reason: context.dependencyProblems ? `${context.dependencyProblems} dependency issue(s) detected.` : "Dependency graph validated without opening a connection.", audit_notes: "Dependency state was read from the local validator result." },
      { source_phase: "Phase18-15", source_node: "dependency_validation", target_node: "safety_scoring", simulation_mode: "simulation_only", simulated_event: "safety_scoring", safety_result: safetyResult, blocked_reason: `Safety score ${context.safety.safety_score ?? "not persisted"}; external connection remains forbidden.`, audit_notes: "Safety scoring is evidence only and cannot authorize execution." },
      { source_phase: "Phase18-15", source_node: "safety_scoring", target_node: "preconnection_gate", simulation_mode: context.protectedOnly ? "protected_only" : "blocked_simulation", simulated_event: "preconnection_gate", safety_result: context.protectedOnly ? "protected_blocked" : "preconnection_closed", blocked_reason: `Pre-Connection Gate is ${context.gateStatus}; connection_allowed is false.`, audit_notes: "Gate closure is mandatory even when the safety score is 100." },
      { source_phase: "Phase18-12", source_node: "readiness_simulator_node", target_node: "control_center_node", simulation_mode: "readiness_only", simulated_event: "readiness_simulation", safety_result: "safe_blocked", blocked_reason: "Readiness simulation cannot establish an external connection.", audit_notes: `Readiness status: ${context.readiness.readiness_status || "readiness_only"}.` },
      { source_phase: "Phase18-11", source_node: "control_center_node", target_node: "readiness_simulator_node", simulation_mode: "skeleton_only", simulated_event: "control_center", safety_result: "safe_blocked", blocked_reason: "Control Center is restricted to readiness and skeleton monitoring.", audit_notes: `Control status: ${context.control.control_center_status || context.core.core_status || "skeleton_only"}.` }
    ];
    const timestamp = now();
    return descriptors.map((descriptor, index) => createLog(index, descriptor, timestamp));
  }

  function buildAuditReport(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const logs = buildSimulationLogs(sources, () => generatedAt);
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
      simulation_mode: "simulation_only",
      generatedAt: generatedAt.toISOString(),
      log_count: logs.length,
      blocked_log_count: logs.filter((log) => log.safety_result !== "safe_blocked").length,
      audit_status: "audit_trail_recorded",
      logs
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
      safety: readStoredJson(storage, STORAGE_KEYS.safety), readiness: readStoredJson(storage, STORAGE_KEYS.readiness),
      control: readStoredJson(storage, STORAGE_KEYS.control)
    };
  }

  function persistAudit(report, storage) {
    if (storage) {
      storage.setItem(STORAGE_KEYS.latest, JSON.stringify(report));
      const history = readStoredJson(storage, STORAGE_KEYS.audit);
      storage.setItem(STORAGE_KEYS.audit, JSON.stringify([...(Array.isArray(history) ? history : []), report].slice(-50)));
    }
    return report;
  }

  function renderAudit(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#network-simulation-log-count", report.log_count);
    set("#network-simulation-blocked-count", report.blocked_log_count);
    set("#network-simulation-audit-status", report.audit_status);
    set("#network-simulation-external", report.external_connection_allowed);
    set("#network-simulation-updated", report.generatedAt);
    const list = doc.querySelector("#network-simulation-log-list");
    if (list) list.innerHTML = report.logs.map((log) => `<li class="simulation-log-item status-${log.safety_result}"><strong>${log.simulated_event}</strong><span>${log.simulation_mode} / ${log.safety_result}</span><small>${log.blocked_reason}</small></li>`).join("");
    return report;
  }

  async function runSimulationAudit(options = {}) {
    const storage = options.storage || window.localStorage;
    const report = buildAuditReport(await loadSources({ ...options, storage }));
    persistAudit(report, storage);
    return renderAudit(report, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-network-simulation-audit");
      if (button) button.addEventListener("click", () => runSimulationAudit().catch(() => undefined));
      runSimulationAudit().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, LOG_TARGETS, SIMULATION_MODES, SAFETY_RESULTS, DATABASES, SOURCE_DATABASES, STORAGE_KEYS, readStoredJson, deriveContext, createLog, buildSimulationLogs, buildAuditReport, loadJson, loadSources, persistAudit, renderAudit, runSimulationAudit };
});
