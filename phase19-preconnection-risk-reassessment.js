(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19PreconnectionRiskReassessment = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-13";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "e6b228ffe585e64ca4d0898cbe5842d891410152";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const REASSESSMENT_STATUSES = ["reassessment_ready", "reassessment_warning", "reassessment_hold", "reassessment_blocked", "protected_only", "plan_only_reassessment"];
  const RISK_LEVELS = ["none", "low", "medium", "high", "protected", "blocked"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-preconnection-risk-reassessment-db.json", "phase19-preconnection-risk-reassessment-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-dry-run-result-audit-log-db.json",
    "phase19-dry-run-result-audit-summary-db.json",
    "phase19-connection-readiness-matrix-db.json",
    "phase19-connection-readiness-summary-db.json",
    "phase19-validation-scenario-db.json",
    "phase19-validation-scenario-summary-db.json",
    "phase19-validation-readiness-checklist-db.json",
    "phase19-validation-readiness-summary-db.json",
    "phase19-validation-dry-run-db.json",
    "phase19-validation-dry-run-summary-db.json"
  ];
  const STORAGE_KEY = "phase19PreconnectionRiskReassessmentLatest";

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

  function reassessmentStatusFor(log, unsafe) {
    if (log.audit_result_status === "protected_only" || log.safety_result === "protected_only") return "protected_only";
    if (unsafe || log.audit_result_status === "audit_blocked" || log.stop_condition_result === "stop_condition_triggered") return "reassessment_blocked";
    if (log.audit_result_status === "audit_hold" || log.stop_condition_result === "stop_condition_hold") return "reassessment_hold";
    if (log.audit_result_status === "audit_warning" || log.safety_result === "safety_warning") return "reassessment_warning";
    if (log.audit_result_status === "plan_only_audit") return "plan_only_reassessment";
    return "reassessment_ready";
  }

  function riskLevelFor(status) {
    if (status === "protected_only") return "protected";
    if (status === "reassessment_blocked") return "blocked";
    if (status === "reassessment_hold") return "high";
    if (status === "reassessment_warning") return "medium";
    if (status === "plan_only_reassessment") return "low";
    return "none";
  }

  function remainingRisksFor(log, status) {
    const common = ["real_connection_not_performed", "external_connection_authority_false"];
    if (status === "protected_only") return ["official_release_v2_8_protected", "protected_node_must_remain_read_only"];
    if (status === "plan_only_reassessment") return [...common, "plan_only_audit_requires_future_validation_review"];
    if (status === "reassessment_ready") return ["no_unresolved_dry_run_audit_risk", "connection_authority_still_not_granted"];
    if (status === "reassessment_warning") return [...common, "warning_evidence_requires_safe_review"];
    if (status === "reassessment_hold") return [...common, "hold_evidence_requires_additional_audit"];
    return [...common, "blocking_audit_or_stop_condition_evidence_present"];
  }

  function holdReasonsFor(log, status) {
    if (status === "reassessment_hold") return [`audit_result_status:${log.audit_result_status}`, `stop_condition_result:${log.stop_condition_result}`];
    if (status === "plan_only_reassessment") return ["plan_only_audit_retains_connection_hold"];
    if (status === "protected_only") return ["official_release_v2_8_protection_hold"];
    return [];
  }

  function blockedReasonsFor(log, status) {
    if (status === "reassessment_blocked") return [`audit_result_status:${log.audit_result_status}`, `safety_result:${log.safety_result}`, `stop_condition_result:${log.stop_condition_result}`];
    if (status === "protected_only") return ["protected_release_risk_blocks_connection_authority"];
    return [];
  }

  function recommendedValidationFor(status) {
    if (status === "protected_only") return "Recommended: continue protected-only read-only audit review and do not request connection authority.";
    if (status === "plan_only_reassessment") return "Recommended: keep the node in PLAN_ONLY reassessment and prepare a safe audit review checklist.";
    if (status === "reassessment_ready") return "Recommended: proceed only to the next safe pre-connection validation planning step.";
    if (status === "reassessment_warning") return "Recommended: review warning reasons before expanding validation planning.";
    if (status === "reassessment_hold") return "Recommended: keep the node on hold and gather additional safety evidence.";
    return "Recommended: stop at risk reassessment and resolve blocked evidence without enabling execution.";
  }

  function createRiskReassessment(log, context = {}) {
    const status = reassessmentStatusFor(log, context.unsafe);
    return {
      reassessment_id: `P19-RISK-REASSESS-${log.priority_id.split("-").pop()}`,
      audit_log_id: log.audit_log_id,
      dry_run_id: log.dry_run_id,
      node_name: log.node_name,
      category: log.category,
      priority_id: log.priority_id,
      reassessment_status: status,
      risk_level: riskLevelFor(status),
      audit_result_status: log.audit_result_status,
      safety_result: log.safety_result,
      stop_condition_result: log.stop_condition_result,
      remaining_risks: remainingRisksFor(log, status),
      hold_reasons: holdReasonsFor(log, status),
      blocked_reasons: blockedReasonsFor(log, status),
      recommended_next_validation: recommendedValidationFor(status),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildPreconnectionRiskReassessment(sources = {}, now = () => new Date()) {
    const auditDatabase = sources.auditDatabase || { records: [] };
    const auditSummary = sources.auditSummary || {};
    const matrixDatabase = sources.matrixDatabase || {};
    const matrixSummary = sources.matrixSummary || {};
    const scenarioDatabase = sources.scenarioDatabase || {};
    const scenarioSummary = sources.scenarioSummary || {};
    const checklistDatabase = sources.checklistDatabase || {};
    const checklistSummary = sources.checklistSummary || {};
    const dryRunDatabase = sources.dryRunDatabase || {};
    const dryRunSummary = sources.dryRunSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(auditDatabase, auditSummary, matrixDatabase, matrixSummary, scenarioDatabase, scenarioSummary, checklistDatabase, checklistSummary, dryRunDatabase, dryRunSummary);
    const records = (auditDatabase.records || []).map((log) => createRiskReassessment(log, { unsafe }));
    const statusCounts = Object.fromEntries(REASSESSMENT_STATUSES.map((status) => [status, records.filter((item) => item.reassessment_status === status).length]));
    const riskCounts = Object.fromEntries(RISK_LEVELS.map((level) => [level, records.filter((item) => item.risk_level === level).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      reassessment_id: `P19-PRECONNECTION-RISK-REASSESSMENT-${generatedAt.getTime()}`,
      reassessment_engine_status: unsafe || missingSources.length > 0 ? "risk_reassessment_blocked" : "risk_reassessment_plan_only",
      source_audit_logger_status: auditDatabase.audit_logger_status || "unknown",
      source_dry_run_planner_status: dryRunDatabase.dry_run_planner_status || "unknown",
      source_checklist_status: checklistDatabase.checklist_builder_status || "unknown",
      source_scenario_status: scenarioDatabase.scenario_builder_status || "unknown",
      source_matrix_status: matrixDatabase.matrix_status || "unknown",
      official_release_protected: auditDatabase.official_release_protected !== false && dryRunDatabase.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      risk_reassessment_summary: {
        total: records.length,
        reassessment_statuses: statusCounts,
        risk_levels: riskCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length,
        external_connection_blocked: true,
        auto_execution_blocked: true
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-14 Global Network PreConnection Risk Review Gate",
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
      auditDatabase: options.auditDatabase || databases["phase19-dry-run-result-audit-log-db.json"],
      auditSummary: options.auditSummary || databases["phase19-dry-run-result-audit-summary-db.json"],
      matrixDatabase: options.matrixDatabase || databases["phase19-connection-readiness-matrix-db.json"],
      matrixSummary: options.matrixSummary || databases["phase19-connection-readiness-summary-db.json"],
      scenarioDatabase: options.scenarioDatabase || databases["phase19-validation-scenario-db.json"],
      scenarioSummary: options.scenarioSummary || databases["phase19-validation-scenario-summary-db.json"],
      checklistDatabase: options.checklistDatabase || databases["phase19-validation-readiness-checklist-db.json"],
      checklistSummary: options.checklistSummary || databases["phase19-validation-readiness-summary-db.json"],
      dryRunDatabase: options.dryRunDatabase || databases["phase19-validation-dry-run-db.json"],
      dryRunSummary: options.dryRunSummary || databases["phase19-validation-dry-run-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistReassessment(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderReassessment(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-risk-reassessment-status", plan.reassessment_engine_status);
    set("#phase19-risk-total", plan.risk_reassessment_summary.total);
    set("#phase19-risk-ready", plan.risk_reassessment_summary.reassessment_statuses.reassessment_ready);
    set("#phase19-risk-plan-only", plan.risk_reassessment_summary.reassessment_statuses.plan_only_reassessment);
    set("#phase19-risk-protected", plan.risk_reassessment_summary.reassessment_statuses.protected_only);
    set("#phase19-risk-unsafe", plan.risk_reassessment_summary.unsafe_flags_count);
    set("#phase19-risk-authority", plan.connection_authority_issued);
    set("#phase19-risk-next", plan.next_validation_step);
    set("#phase19-risk-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-risk-reassessment-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-risk-reassessment-item status-${item.reassessment_status}`;
        row.textContent = `${item.reassessment_id} / ${item.node_name} / ${item.reassessment_status} / risk:${item.risk_level}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runPreconnectionRiskReassessment(options = {}) {
    const plan = buildPreconnectionRiskReassessment(await loadSources(options));
    persistReassessment(plan, options.storage || window.localStorage);
    return renderReassessment(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-risk-reassessment");
      if (button) button.addEventListener("click", () => runPreconnectionRiskReassessment().catch(() => undefined));
      runPreconnectionRiskReassessment().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, REASSESSMENT_STATUSES, RISK_LEVELS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, reassessmentStatusFor, riskLevelFor, remainingRisksFor, holdReasonsFor, blockedReasonsFor, recommendedValidationFor, createRiskReassessment, buildPreconnectionRiskReassessment, loadJson, loadSources, persistReassessment, renderReassessment, runPreconnectionRiskReassessment };
});
