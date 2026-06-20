(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalIntelligenceControlCenter = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-11";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const NETWORK_CONNECTION_ALLOWED = false;
  const CONTROL_STATUSES = ["control_ready", "control_warning", "control_blocked", "protected_only", "plan_only_ready"];
  const DATABASE = "global-intelligence-control-center-db.json";
  const SOURCE_DATABASES = [
    "self-diagnosis-db.json", "self-diagnosis-history-db.json", "self-diagnosis-rule-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json",
    "self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json", "repair-approval-history-db.json",
    "repair-audit-history-db.json", "repair-rollback-plan-db.json", "repair-governance-db.json", "governance-alert-db.json", "governance-priority-recommendation-db.json",
    "final-safety-lock-db.json", "release-readiness-db.json"
  ];
  const STORAGE_KEYS = {
    diagnosis: "selfDiagnosisLatest",
    repair: "selfRepairLatestPlan",
    approval: "repairApprovalLatest",
    audit: "repairAuditLatest",
    governance: "repairGovernanceLatest",
    alerts: "governanceAlertLatest",
    finalSafety: "finalSafetyLockLatest",
    latest: "globalIntelligenceControlCenterLatest"
  };
  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };
  const recordsOf = (value) => Array.isArray(value?.records) ? value.records : [];

  function aggregateApproval(records) {
    if (records.some((record) => record.status === "blocked")) return "blocked";
    if (records.some((record) => record.status === "pending")) return "pending";
    if (records.some((record) => record.status === "executed_mock")) return "mock_only";
    return records.length ? "approved" : "ready";
  }

  function aggregateAudit(records) {
    if (records.some((record) => record.audit_status === "protected_release_blocked")) return "protected";
    if (records.some((record) => ["audit_blocked", "rollback_required"].includes(record.audit_status))) return "blocked";
    if (records.some((record) => record.audit_status === "audit_passed_mock")) return "mock_only";
    return records.length ? "audit_pending" : "ready";
  }

  function aggregateAlerts(alerts) {
    if (alerts.some((alert) => alert.category === "critical")) return "critical";
    if (alerts.some((alert) => alert.category === "warning")) return "warning";
    if (alerts.some((alert) => alert.category === "protected")) return "protected";
    return alerts.length ? "info" : "ready";
  }

  function determineControlStatus(state) {
    if (state.protectedRiskCount > 0 || state.final_safety_status === "protected_only") return "protected_only";
    if (state.executionInvariantViolation || state.final_safety_status === "release_blocked") return "control_blocked";
    if (state.health_score < 100 || ["critical", "warning"].includes(state.alert_status) || state.final_safety_status === "release_warning") return "control_warning";
    if (state.final_safety_status === "plan_only_ready" || ["pending", "mock_only"].includes(state.approval_status) || state.audit_status === "mock_only") return "plan_only_ready";
    return "control_ready";
  }

  function buildControlCenterStatus(sources = {}, now = () => new Date()) {
    const databases = sources.databases || {};
    const diagnosis = sources.diagnosis || databases["self-diagnosis-db.json"] || {};
    const healthDb = databases["self-diagnosis-health-db.json"] || {};
    const repair = sources.repair || databases["self-repair-plan-db.json"] || {};
    const approval = sources.approval || databases["repair-approval-history-db.json"] || {};
    const audit = sources.audit || databases["repair-audit-history-db.json"] || {};
    const governance = sources.governance || databases["repair-governance-db.json"] || {};
    const alertReport = sources.alerts || databases["governance-alert-db.json"] || {};
    const finalSafety = sources.finalSafety || databases["final-safety-lock-db.json"] || {};
    const scores = diagnosis.scores || diagnosis.health || healthDb.scores || {};
    const healthScore = Number(scores.systemHealthScore ?? scores.system ?? governance.summary?.healthScore ?? finalSafety.healthScore ?? 100);
    const approvalRecords = recordsOf(approval);
    const auditRecords = recordsOf(audit);
    const alerts = Array.isArray(alertReport.alerts) ? alertReport.alerts : recordsOf(alertReport);
    const policies = [repair.executionPolicy, approval.executionPolicy, audit.executionPolicy, governance.executionPolicy, alertReport.executionPolicy, finalSafety.executionPolicy].filter(Boolean);
    const executionFlags = [repair.immediateExecution, approval.actualRepairEnabled, audit.executionAllowed, governance.executionAllowed, governance.summary?.executionAllowed, alertReport.executionAllowed, finalSafety.executionAllowed, finalSafety.autoExecutionAllowed]
      .filter((value) => value !== undefined);
    const protectedRiskCount = Number(governance.summary?.protectedReleaseBlockedCount || 0) + auditRecords.filter((record) => record.audit_status === "protected_release_blocked").length;
    const state = {
      health_score: healthScore,
      diagnosis_status: String(diagnosis.status || (healthScore === 100 ? "HEALTHY" : "WARNING")),
      repair_status: repair.status || (repair.executionPolicy === "PLAN_ONLY" ? "plan_only" : "ready"),
      approval_status: aggregateApproval(approvalRecords),
      audit_status: aggregateAudit(auditRecords),
      governance_status: governance.finalStatus || governance.summary?.auditRollbackStatus || (governance.executionAllowed === false ? "plan_only" : "warning"),
      alert_status: aggregateAlerts(alerts),
      final_safety_status: finalSafety.finalStatus || "plan_only_ready",
      protected_release_status: "protected_only",
      plan_only_status: policies.every((policy) => policy === "PLAN_ONLY") ? "enforced" : "violation",
      execution_gate_status: executionFlags.every((flag) => flag === false) ? "blocked" : "violation",
      protectedRiskCount,
      executionInvariantViolation: executionFlags.some((flag) => flag !== false)
    };
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      globalIntelligenceNetworkConnectionAllowed: false,
      globalIntelligenceNetworkStatus: "readiness_only",
      generatedAt: now().toISOString(),
      control_center_status: determineControlStatus(state),
      ...state
    };
  }

  async function loadJson(path, fetcher) {
    try {
      const response = await fetcher(path, { cache: "no-store" });
      return response.ok ? await response.json() : null;
    } catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const storage = options.storage || window.localStorage;
    const loaded = await Promise.all(SOURCE_DATABASES.map(async (file) => [file, await loadJson(file, fetcher)]));
    return {
      databases: Object.fromEntries(loaded.filter(([, value]) => value)),
      diagnosis: readStoredJson(storage, STORAGE_KEYS.diagnosis),
      repair: readStoredJson(storage, STORAGE_KEYS.repair),
      approval: readStoredJson(storage, STORAGE_KEYS.approval),
      audit: readStoredJson(storage, STORAGE_KEYS.audit),
      governance: readStoredJson(storage, STORAGE_KEYS.governance),
      alerts: readStoredJson(storage, STORAGE_KEYS.alerts),
      finalSafety: readStoredJson(storage, STORAGE_KEYS.finalSafety)
    };
  }

  function persistStatus(status, storage) {
    if (storage) storage.setItem(STORAGE_KEYS.latest, JSON.stringify(status));
    return status;
  }

  function renderStatus(status, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    const fields = {
      "#global-control-status": status.control_center_status,
      "#global-control-health": status.health_score,
      "#global-control-diagnosis": status.diagnosis_status,
      "#global-control-repair": status.repair_status,
      "#global-control-approval": status.approval_status,
      "#global-control-audit": status.audit_status,
      "#global-control-governance": status.governance_status,
      "#global-control-alert": status.alert_status,
      "#global-control-final": status.final_safety_status,
      "#global-control-protected": status.protected_release_status,
      "#global-control-plan": status.plan_only_status,
      "#global-control-execution": status.execution_gate_status,
      "#global-control-network": status.globalIntelligenceNetworkStatus,
      "#global-control-updated": status.generatedAt
    };
    Object.entries(fields).forEach(([selector, value]) => set(selector, value));
    return status;
  }

  async function runControlCenter(options = {}) {
    const storage = options.storage || window.localStorage;
    const doc = options.document || document;
    const status = buildControlCenterStatus(await loadSources({ ...options, storage }));
    persistStatus(status, storage);
    return renderStatus(status, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-global-control-center");
      if (button) button.addEventListener("click", () => runControlCenter().catch(() => undefined));
      runControlCenter().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, NETWORK_CONNECTION_ALLOWED, CONTROL_STATUSES, DATABASE, SOURCE_DATABASES, STORAGE_KEYS, readStoredJson, aggregateApproval, aggregateAudit, aggregateAlerts, determineControlStatus, buildControlCenterStatus, loadJson, loadSources, persistStatus, renderStatus, runControlCenter };
});
