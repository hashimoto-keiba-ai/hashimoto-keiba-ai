(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19DryRunResultAuditLogger = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-12";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "e4c0f87b13eeae727b9c0a8a4328b7c6f387fdbb";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const AUDIT_RESULT_STATUSES = ["audit_passed", "audit_warning", "audit_hold", "audit_blocked", "protected_only", "plan_only_audit"];
  const SAFETY_RESULTS = ["safety_ok", "safety_warning", "safety_hold", "safety_blocked", "protected_only"];
  const STOP_CONDITION_RESULTS = ["no_stop_condition", "stop_condition_warning", "stop_condition_hold", "stop_condition_triggered", "protected_stop"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-dry-run-result-audit-log-db.json", "phase19-dry-run-result-audit-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-validation-dry-run-db.json",
    "phase19-validation-dry-run-summary-db.json",
    "phase19-validation-scenario-db.json",
    "phase19-validation-scenario-summary-db.json",
    "phase19-validation-readiness-checklist-db.json",
    "phase19-validation-readiness-summary-db.json",
    "phase19-connection-readiness-matrix-db.json",
    "phase19-connection-readiness-summary-db.json"
  ];
  const STORAGE_KEY = "phase19DryRunResultAuditLoggerLatest";

  function hasUnsafeFlags(...sources) {
    const keys = ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed", "execution_allowed", "connection_authority_issued"];
    return sources.some((source) => {
      const visit = (value) => {
        if (!value || typeof value !== "object") return false;
        if (Array.isArray(value)) return value.some(visit);
        return Object.entries(value).some(([key, nested]) => (keys.includes(key) && nested === true) || visit(nested));
      };
      return visit(source);
    });
  }

  function auditStatusFor(dryRun, unsafe) {
    if (dryRun.dry_run_status === "protected_only") return "protected_only";
    if (unsafe || dryRun.dry_run_status === "dry_run_blocked") return "audit_blocked";
    if (dryRun.dry_run_status === "dry_run_hold") return "audit_hold";
    if (dryRun.dry_run_status === "dry_run_needs_review") return "audit_warning";
    if (dryRun.dry_run_status === "dry_run_plan_only") return "plan_only_audit";
    return "audit_passed";
  }

  function safetyResultFor(auditStatus) {
    if (auditStatus === "protected_only") return "protected_only";
    if (auditStatus === "audit_blocked") return "safety_blocked";
    if (auditStatus === "audit_hold") return "safety_hold";
    if (auditStatus === "audit_warning") return "safety_warning";
    return "safety_ok";
  }

  function stopConditionResultFor(auditStatus) {
    if (auditStatus === "protected_only") return "protected_stop";
    if (auditStatus === "audit_blocked") return "stop_condition_triggered";
    if (auditStatus === "audit_hold") return "stop_condition_hold";
    if (auditStatus === "audit_warning") return "stop_condition_warning";
    return "no_stop_condition";
  }

  function observedResultFor(dryRun, auditStatus) {
    if (auditStatus === "protected_only") return `pseudo_observed:${dryRun.dry_run_id}:protected_only read-only release protection log retained; no validation execution occurred.`;
    return `pseudo_observed:${dryRun.dry_run_id}:${dryRun.dry_run_mode} expected PLAN_ONLY log preview matched without execution or external connection.`;
  }

  function logSummaryFor(dryRun, auditStatus) {
    return {
      pseudo_log_only: true,
      expected_log_count: (dryRun.expected_logs || []).length,
      observation_point_count: (dryRun.observation_points || []).length,
      audit_requirement_count: (dryRun.audit_requirements || []).length,
      audit_result_status: auditStatus,
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function auditNotesFor(dryRun, auditStatus) {
    const notes = ["pseudo_observation_only", "no_real_execution", "no_external_connection", "plan_only_policy_retained"];
    if (auditStatus === "protected_only") notes.push("official_release_v2_8_protected");
    if (auditStatus === "audit_warning" || auditStatus === "audit_hold" || auditStatus === "audit_blocked") notes.push(`requires_safe_review:${dryRun.dry_run_status}`);
    return notes;
  }

  function recommendedActionFor(auditStatus) {
    if (auditStatus === "protected_only") return "Recommended: keep the record as protected-only evidence and continue read-only release protection review.";
    if (auditStatus === "plan_only_audit") return "Recommended: keep the node in PLAN_ONLY audit/report review and retain all connection blocks.";
    if (auditStatus === "audit_passed") return "Recommended: review the pseudo audit log and proceed only to the next safe validation planning step.";
    if (auditStatus === "audit_warning") return "Recommended: review warning evidence before any further dry-run planning.";
    if (auditStatus === "audit_hold") return "Recommended: hold the node and collect additional safety evidence only.";
    return "Recommended: stop at audit logging and resolve blocking evidence without enabling execution.";
  }

  function createAuditLog(dryRun, context = {}) {
    const auditStatus = auditStatusFor(dryRun, context.unsafe);
    return {
      audit_log_id: `P19-DRY-AUDIT-${dryRun.priority_id.split("-").pop()}`,
      dry_run_id: dryRun.dry_run_id,
      checklist_id: dryRun.checklist_id,
      scenario_id: dryRun.scenario_id,
      node_name: dryRun.node_name,
      category: dryRun.category,
      priority_id: dryRun.priority_id,
      dry_run_status: dryRun.dry_run_status,
      audit_result_status: auditStatus,
      observed_result: observedResultFor(dryRun, auditStatus),
      safety_result: safetyResultFor(auditStatus),
      stop_condition_result: stopConditionResultFor(auditStatus),
      log_summary: logSummaryFor(dryRun, auditStatus),
      audit_notes: auditNotesFor(dryRun, auditStatus),
      recommended_next_action: recommendedActionFor(auditStatus),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildDryRunResultAuditLogs(sources = {}, now = () => new Date()) {
    const dryRunDatabase = sources.dryRunDatabase || { records: [] };
    const dryRunSummary = sources.dryRunSummary || {};
    const scenarioDatabase = sources.scenarioDatabase || {};
    const scenarioSummary = sources.scenarioSummary || {};
    const checklistDatabase = sources.checklistDatabase || {};
    const checklistSummary = sources.checklistSummary || {};
    const matrixDatabase = sources.matrixDatabase || {};
    const matrixSummary = sources.matrixSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(dryRunDatabase, dryRunSummary, scenarioDatabase, scenarioSummary, checklistDatabase, checklistSummary, matrixDatabase, matrixSummary);
    const records = (dryRunDatabase.records || []).map((dryRun) => createAuditLog(dryRun, { unsafe }));
    const auditCounts = Object.fromEntries(AUDIT_RESULT_STATUSES.map((status) => [status, records.filter((item) => item.audit_result_status === status).length]));
    const safetyCounts = Object.fromEntries(SAFETY_RESULTS.map((status) => [status, records.filter((item) => item.safety_result === status).length]));
    const stopCounts = Object.fromEntries(STOP_CONDITION_RESULTS.map((status) => [status, records.filter((item) => item.stop_condition_result === status).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      audit_logger_id: `P19-DRY-RUN-AUDIT-LOGGER-${generatedAt.getTime()}`,
      audit_logger_status: unsafe || missingSources.length > 0 ? "audit_logger_blocked" : "audit_logger_plan_only",
      source_dry_run_planner_status: dryRunDatabase.dry_run_planner_status || "unknown",
      source_scenario_status: scenarioDatabase.scenario_builder_status || "unknown",
      source_checklist_status: checklistDatabase.checklist_builder_status || "unknown",
      source_matrix_status: matrixDatabase.matrix_status || "unknown",
      official_release_protected: dryRunDatabase.official_release_protected !== false && scenarioDatabase.official_release_protected !== false && checklistDatabase.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      audit_summary: {
        total: records.length,
        audit_results: auditCounts,
        safety_results: safetyCounts,
        stop_condition_results: stopCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length,
        pseudo_observation_only: true
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-13 Global Network Dry Run Audit Review",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      generated_at: generatedAt.toISOString(),
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false
    };
  }

  async function loadJson(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const loaded = await Promise.all(SOURCE_ASSETS.map(async (asset) => [asset, await loadJson(asset, fetcher)]));
    const databases = Object.fromEntries(loaded.filter(([, value]) => value !== null));
    return {
      dryRunDatabase: options.dryRunDatabase || databases["phase19-validation-dry-run-db.json"],
      dryRunSummary: options.dryRunSummary || databases["phase19-validation-dry-run-summary-db.json"],
      scenarioDatabase: options.scenarioDatabase || databases["phase19-validation-scenario-db.json"],
      scenarioSummary: options.scenarioSummary || databases["phase19-validation-scenario-summary-db.json"],
      checklistDatabase: options.checklistDatabase || databases["phase19-validation-readiness-checklist-db.json"],
      checklistSummary: options.checklistSummary || databases["phase19-validation-readiness-summary-db.json"],
      matrixDatabase: options.matrixDatabase || databases["phase19-connection-readiness-matrix-db.json"],
      matrixSummary: options.matrixSummary || databases["phase19-connection-readiness-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistAudit(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderAudit(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-audit-logger-status", plan.audit_logger_status);
    set("#phase19-audit-total", plan.audit_summary.total);
    set("#phase19-audit-passed", plan.audit_summary.audit_results.audit_passed);
    set("#phase19-audit-plan-only", plan.audit_summary.audit_results.plan_only_audit);
    set("#phase19-audit-protected", plan.audit_summary.audit_results.protected_only);
    set("#phase19-audit-unsafe", plan.audit_summary.unsafe_flags_count);
    set("#phase19-audit-authority", plan.connection_authority_issued);
    set("#phase19-audit-next", plan.next_validation_step);
    set("#phase19-audit-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-audit-log-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-audit-log-item status-${item.audit_result_status}`;
        row.textContent = `${item.audit_log_id} / ${item.node_name} / ${item.audit_result_status} / ${item.safety_result} / ${item.stop_condition_result}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runDryRunResultAuditLogger(options = {}) {
    const plan = buildDryRunResultAuditLogs(await loadSources(options));
    persistAudit(plan, options.storage || window.localStorage);
    return renderAudit(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-audit-logger");
      if (button) button.addEventListener("click", () => runDryRunResultAuditLogger().catch(() => undefined));
      runDryRunResultAuditLogger().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, AUDIT_RESULT_STATUSES, SAFETY_RESULTS, STOP_CONDITION_RESULTS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, auditStatusFor, safetyResultFor, stopConditionResultFor, observedResultFor, logSummaryFor, auditNotesFor, recommendedActionFor, createAuditLog, buildDryRunResultAuditLogs, loadJson, loadSources, persistAudit, renderAudit, runDryRunResultAuditLogger };
});
