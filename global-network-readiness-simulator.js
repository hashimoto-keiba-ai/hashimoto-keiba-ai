(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalNetworkReadinessSimulator = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-12";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const CONNECTION_MODES = ["readiness_only", "simulation_only"];
  const READINESS_STATUSES = ["network_ready_simulation", "network_warning", "network_blocked", "protected_only", "plan_only_ready"];
  const DATABASES = ["global-network-readiness-db.json", "global-network-simulation-db.json"];
  const SOURCE_DATABASES = [
    "self-diagnosis-db.json", "self-diagnosis-history-db.json", "self-diagnosis-rule-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json",
    "self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json", "repair-approval-history-db.json",
    "repair-audit-history-db.json", "repair-rollback-plan-db.json", "repair-governance-db.json", "governance-alert-db.json", "governance-priority-recommendation-db.json",
    "final-safety-lock-db.json", "release-readiness-db.json", "global-intelligence-control-center-db.json"
  ];
  const STORAGE_KEYS = {
    diagnosis: "selfDiagnosisLatest", repair: "selfRepairLatestPlan", approval: "repairApprovalLatest",
    audit: "repairAuditLatest", governance: "repairGovernanceLatest", alerts: "governanceAlertLatest",
    finalSafety: "finalSafetyLockLatest", controlCenter: "globalIntelligenceControlCenterLatest",
    readiness: "globalNetworkReadinessLatest", simulation: "globalNetworkSimulationLatest"
  };
  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };
  const recordsOf = (value) => Array.isArray(value?.records) ? value.records : [];

  function buildReadinessChecks(sources = {}) {
    const databases = sources.databases || {};
    const diagnosis = sources.diagnosis || databases["self-diagnosis-db.json"] || {};
    const repair = sources.repair || databases["self-repair-plan-db.json"] || {};
    const approval = sources.approval || databases["repair-approval-history-db.json"] || {};
    const audit = sources.audit || databases["repair-audit-history-db.json"] || {};
    const governance = sources.governance || databases["repair-governance-db.json"] || {};
    const alerts = sources.alerts || databases["governance-alert-db.json"] || {};
    const finalSafety = sources.finalSafety || databases["final-safety-lock-db.json"] || {};
    const control = sources.controlCenter || databases["global-intelligence-control-center-db.json"] || {};
    const executionFlags = [
      repair.immediateExecution, approval.actualRepairEnabled, audit.executionAllowed, governance.executionAllowed,
      alerts.executionAllowed, finalSafety.executionAllowed, finalSafety.autoExecutionAllowed,
      control.executionAllowed, control.autoExecutionAllowed, control.auto_execution_allowed,
      control.globalIntelligenceNetworkConnectionAllowed
    ].filter((value) => value !== undefined);
    const policies = [repair.executionPolicy, approval.executionPolicy, audit.executionPolicy, governance.executionPolicy, alerts.executionPolicy, finalSafety.executionPolicy, control.executionPolicy].filter(Boolean);
    const approvalBlocked = recordsOf(approval).some((record) => record.status === "blocked");
    const auditBlocked = recordsOf(audit).some((record) => ["audit_blocked", "rollback_required"].includes(record.audit_status));
    const criticalAlert = (Array.isArray(alerts.alerts) ? alerts.alerts : recordsOf(alerts)).some((alert) => alert.category === "critical");
    return {
      control_center_ready: ["control_ready", "plan_only_ready"].includes(control.control_center_status || "plan_only_ready"),
      final_safety_ready: ["release_ready", "plan_only_ready", "release_warning"].includes(finalSafety.finalStatus || "plan_only_ready"),
      governance_ready: !["blocked", "warning"].includes(governance.finalStatus) && governance.executionAllowed !== true,
      alert_priority_ready: !criticalAlert && alerts.executionAllowed !== true,
      diagnosis_ready: !["CRITICAL", "BLOCKED"].includes(String(diagnosis.status || "HEALTHY").toUpperCase()),
      repair_ready: repair.immediateExecution !== true && repair.executionPolicy !== "AUTO_EXECUTE",
      approval_ready: !approvalBlocked && approval.actualRepairEnabled !== true,
      audit_ready: !auditBlocked && audit.executionAllowed !== true,
      official_release_protected: true,
      execution_blocked: executionFlags.every((flag) => flag === false),
      plan_only_enforced: policies.every((policy) => policy === "PLAN_ONLY"),
      network_simulation_only: control.globalIntelligenceNetworkConnectionAllowed !== true && ["readiness_only", "simulation_only"].includes(control.globalIntelligenceNetworkStatus || "readiness_only")
    };
  }

  function determineReadinessStatus(checks, sources = {}) {
    const controlStatus = sources.controlCenter?.control_center_status;
    const finalStatus = sources.finalSafety?.finalStatus;
    if (controlStatus === "protected_only" || finalStatus === "protected_only") return "protected_only";
    if (!checks.execution_blocked || !checks.network_simulation_only || !checks.plan_only_enforced || controlStatus === "control_blocked" || finalStatus === "release_blocked") return "network_blocked";
    const core = [checks.control_center_ready, checks.final_safety_ready, checks.governance_ready, checks.alert_priority_ready, checks.diagnosis_ready, checks.repair_ready, checks.approval_ready, checks.audit_ready];
    if (core.every(Boolean)) return "network_ready_simulation";
    if (checks.official_release_protected && checks.execution_blocked && checks.plan_only_enforced) return "network_warning";
    return "plan_only_ready";
  }

  function buildSimulation(sources = {}, now = () => new Date()) {
    const checks = buildReadinessChecks(sources);
    const readinessStatus = determineReadinessStatus(checks, sources);
    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
    const safeToSimulate = !["network_blocked", "protected_only"].includes(readinessStatus);
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      generatedAt: now().toISOString(),
      readiness_status: readinessStatus,
      checks,
      simulation: {
        simulation_id: `GNS-${now().getTime()}`,
        target_network: "Global Intelligence Network",
        connection_mode: "simulation_only",
        readiness_status: readinessStatus,
        blocked_reason: safeToSimulate ? "" : (failed.join(", ") || readinessStatus),
        safety_notes: "PLAN_ONLY。実接続・外部通信・自動修復・自動上書き・自動ロールバックは行いません。Official Release v2.8を保護します。",
        recommended_next_action: safeToSimulate ? "疑似結果を確認し、実接続せず安全審査を継続してください。" : "不合格項目を確認し、承認済みの安全プランだけを再審査してください。",
        external_connection_allowed: false
      }
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
      diagnosis: readStoredJson(storage, STORAGE_KEYS.diagnosis), repair: readStoredJson(storage, STORAGE_KEYS.repair),
      approval: readStoredJson(storage, STORAGE_KEYS.approval), audit: readStoredJson(storage, STORAGE_KEYS.audit),
      governance: readStoredJson(storage, STORAGE_KEYS.governance), alerts: readStoredJson(storage, STORAGE_KEYS.alerts),
      finalSafety: readStoredJson(storage, STORAGE_KEYS.finalSafety), controlCenter: readStoredJson(storage, STORAGE_KEYS.controlCenter)
    };
  }

  function persistResult(result, storage) {
    if (storage) {
      storage.setItem(STORAGE_KEYS.readiness, JSON.stringify({ ...result, simulation: undefined }));
      storage.setItem(STORAGE_KEYS.simulation, JSON.stringify(result.simulation));
    }
    return result;
  }

  function renderResult(result, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#global-network-readiness-status", result.readiness_status);
    set("#global-network-connection-mode", result.simulation.connection_mode);
    set("#global-network-external-allowed", result.simulation.external_connection_allowed);
    set("#global-network-blocked-reason", result.simulation.blocked_reason || "none");
    set("#global-network-next-action", result.simulation.recommended_next_action);
    set("#global-network-readiness-updated", result.generatedAt);
    const list = doc.querySelector("#global-network-readiness-checks");
    if (list) list.innerHTML = Object.entries(result.checks).map(([name, ok]) => `<li class="network-check-${ok ? "ok" : "warning"}">${name}: ${ok}</li>`).join("");
    return result;
  }

  async function runSimulator(options = {}) {
    const storage = options.storage || window.localStorage;
    const result = buildSimulation(await loadSources({ ...options, storage }));
    persistResult(result, storage);
    return renderResult(result, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-global-network-simulation");
      if (button) button.addEventListener("click", () => runSimulator().catch(() => undefined));
      runSimulator().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, CONNECTION_MODES, READINESS_STATUSES, DATABASES, SOURCE_DATABASES, STORAGE_KEYS, readStoredJson, buildReadinessChecks, determineReadinessStatus, buildSimulation, loadJson, loadSources, persistResult, renderResult, runSimulator };
});
