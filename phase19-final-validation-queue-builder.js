(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19FinalValidationQueueBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-14";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "45f108ce3ce5ff8ed706aeb3c5f7ba88eceadf42";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const QUEUE_STATUSES = ["queue_ready", "queue_plan_only", "queue_hold", "queue_blocked", "protected_only"];
  const VALIDATION_PRIORITIES = ["P0", "P1", "P2", "P3", "protected", "blocked"];
  const RISK_LEVELS = ["none", "low", "medium", "high", "protected", "blocked"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-final-validation-queue-db.json", "phase19-final-validation-queue-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-preconnection-risk-reassessment.js",
    "phase19-preconnection-risk-reassessment-db.json",
    "phase19-preconnection-risk-reassessment-summary-db.json",
    "phase19-connection-readiness-matrix-db.json",
    "phase19-validation-scenario-db.json",
    "phase19-validation-readiness-checklist-db.json",
    "phase19-validation-dry-run-db.json",
    "phase19-dry-run-result-audit-log-db.json"
  ];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const STORAGE_KEY = "phase19FinalValidationQueueLatest";

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

  function queueStatusFor(reassessment, unsafe) {
    if (reassessment.reassessment_status === "protected_only" || reassessment.risk_level === "protected") return "protected_only";
    if (unsafe || reassessment.reassessment_status === "reassessment_blocked" || reassessment.risk_level === "blocked") return "queue_blocked";
    if (reassessment.reassessment_status === "reassessment_hold" || reassessment.reassessment_status === "reassessment_warning") return "queue_hold";
    if (reassessment.reassessment_status === "plan_only_reassessment") return "queue_plan_only";
    return "queue_ready";
  }

  function validationPriorityFor(queueStatus, riskLevel) {
    if (queueStatus === "protected_only") return "protected";
    if (queueStatus === "queue_blocked") return "blocked";
    if (queueStatus === "queue_hold" || riskLevel === "high") return "P3";
    if (queueStatus === "queue_plan_only" || riskLevel === "low") return "P2";
    if (riskLevel === "medium") return "P1";
    return "P0";
  }

  function requiredValidationItemsFor(reassessment, queueStatus) {
    const base = [
      "confirm_phase19_13_reassessment_record",
      "confirm_dry_run_audit_log_reference",
      "confirm_execution_allowed_false",
      "confirm_external_connection_allowed_false",
      "confirm_blocked_actions_retained",
      "confirm_allowed_actions_are_plan_simulate_validate_audit_report"
    ];
    if (queueStatus === "protected_only") return [...base, "confirm_official_release_v2_8_protection", "confirm_read_only_review_only"];
    if (queueStatus === "queue_plan_only") return [...base, "confirm_plan_only_reassessment_reason", "confirm_future_validation_review_scope"];
    if (queueStatus === "queue_hold") return [...base, "confirm_hold_or_warning_reason", "confirm_additional_audit_evidence_needed"];
    if (queueStatus === "queue_blocked") return [...base, "confirm_blocked_evidence", "confirm_no_connection_authority_requested"];
    return [...base, "confirm_no_unresolved_reassessment_risk", "confirm_next_step_is_safe_audit_only"];
  }

  function holdReasonsFor(reassessment, queueStatus) {
    if (queueStatus === "protected_only") return ["official_release_v2_8_protection_hold"];
    if (queueStatus === "queue_plan_only") return [...(reassessment.hold_reasons || []), "plan_only_final_validation_queue"];
    if (queueStatus === "queue_hold") return [...(reassessment.hold_reasons || []), "warning_or_hold_requires_final_review"];
    return reassessment.hold_reasons || [];
  }

  function blockedReasonsFor(reassessment, queueStatus) {
    if (queueStatus === "protected_only") return [...(reassessment.blocked_reasons || []), "protected_release_blocks_connection_validation"];
    if (queueStatus === "queue_blocked") return [...(reassessment.blocked_reasons || []), "blocked_or_unsafe_evidence_prevents_queue_release"];
    return reassessment.blocked_reasons || [];
  }

  function safetyConstraintsFor(reassessment, queueStatus) {
    const constraints = [
      "PLAN_ONLY",
      "Official Release v2.8 protected",
      "execution_allowed=false",
      "external_connection_allowed=false",
      "connection_authority_issued=false",
      "no_real_connection",
      "no_auto_execution",
      "no_auto_repair",
      "no_auto_overwrite",
      "no_auto_rollback"
    ];
    if (queueStatus === "protected_only") return [...constraints, "protected_only_read_only_audit"];
    if (reassessment.risk_level !== "none") return [...constraints, `risk_level:${reassessment.risk_level}`];
    return constraints;
  }

  function recommendedNextAuditFor(queueStatus) {
    if (queueStatus === "protected_only") return "Recommended: continue read-only protected audit review and do not request connection validation.";
    if (queueStatus === "queue_blocked") return "Recommended: keep the queue blocked and audit blocked evidence without enabling execution.";
    if (queueStatus === "queue_hold") return "Recommended: review hold or warning evidence and update the safe validation plan only.";
    if (queueStatus === "queue_plan_only") return "Recommended: keep the item in PLAN_ONLY review and prepare display-only audit evidence.";
    return "Recommended: review the final validation checklist and produce an audit report only.";
  }

  function createQueueItem(reassessment, context = {}) {
    const queueStatus = queueStatusFor(reassessment, context.unsafe);
    const validationPriority = validationPriorityFor(queueStatus, reassessment.risk_level);
    return {
      queue_id: `P19-FINAL-QUEUE-${reassessment.priority_id.split("-").pop()}`,
      reassessment_id: reassessment.reassessment_id,
      audit_log_id: reassessment.audit_log_id,
      node_name: reassessment.node_name,
      category: reassessment.category,
      priority_id: reassessment.priority_id,
      queue_status: queueStatus,
      validation_priority: validationPriority,
      risk_level: reassessment.risk_level,
      required_validation_items: requiredValidationItemsFor(reassessment, queueStatus),
      hold_reasons: holdReasonsFor(reassessment, queueStatus),
      blocked_reasons: blockedReasonsFor(reassessment, queueStatus),
      safety_constraints: safetyConstraintsFor(reassessment, queueStatus),
      recommended_next_audit: recommendedNextAuditFor(queueStatus),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildFinalValidationQueue(sources = {}, now = () => new Date()) {
    const reassessmentDatabase = sources.reassessmentDatabase || { records: [] };
    const reassessmentSummary = sources.reassessmentSummary || {};
    const matrixDatabase = sources.matrixDatabase || {};
    const scenarioDatabase = sources.scenarioDatabase || {};
    const checklistDatabase = sources.checklistDatabase || {};
    const dryRunDatabase = sources.dryRunDatabase || {};
    const auditDatabase = sources.auditDatabase || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(reassessmentDatabase, reassessmentSummary, matrixDatabase, scenarioDatabase, checklistDatabase, dryRunDatabase, auditDatabase);
    const records = (reassessmentDatabase.records || []).map((item) => createQueueItem(item, { unsafe }));
    const queueStatusCounts = Object.fromEntries(QUEUE_STATUSES.map((status) => [status, records.filter((item) => item.queue_status === status).length]));
    const priorityCounts = Object.fromEntries(VALIDATION_PRIORITIES.map((priority) => [priority, records.filter((item) => item.validation_priority === priority).length]));
    const riskCounts = Object.fromEntries(RISK_LEVELS.map((level) => [level, records.filter((item) => item.risk_level === level).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      queue_builder_id: `P19-FINAL-VALIDATION-QUEUE-${generatedAt.getTime()}`,
      queue_builder_status: unsafe || missingSources.length > 0 ? "final_validation_queue_blocked" : "final_validation_queue_plan_only",
      source_reassessment_status: reassessmentDatabase.reassessment_engine_status || "unknown",
      source_reassessment_summary_status: reassessmentSummary.reassessment_engine_status || "unknown",
      source_matrix_status: matrixDatabase.matrix_status || "unknown",
      source_scenario_status: scenarioDatabase.scenario_builder_status || "unknown",
      source_checklist_status: checklistDatabase.checklist_builder_status || "unknown",
      source_dry_run_planner_status: dryRunDatabase.dry_run_planner_status || "unknown",
      source_audit_logger_status: auditDatabase.audit_logger_status || "unknown",
      official_release_protected: reassessmentDatabase.official_release_protected !== false && auditDatabase.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      final_validation_queue_summary: {
        total: records.length,
        queue_statuses: queueStatusCounts,
        validation_priorities: priorityCounts,
        risk_levels: riskCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length,
        external_connection_blocked: true,
        auto_execution_blocked: true
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-15 Global Network Final Validation Audit Review",
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
    const loaded = await Promise.all(JSON_SOURCE_ASSETS.map(async (asset) => [asset, await loadJson(asset, fetcher)]));
    const databases = Object.fromEntries(loaded.filter(([, value]) => value !== null));
    return {
      reassessmentDatabase: options.reassessmentDatabase || databases["phase19-preconnection-risk-reassessment-db.json"],
      reassessmentSummary: options.reassessmentSummary || databases["phase19-preconnection-risk-reassessment-summary-db.json"],
      matrixDatabase: options.matrixDatabase || databases["phase19-connection-readiness-matrix-db.json"],
      scenarioDatabase: options.scenarioDatabase || databases["phase19-validation-scenario-db.json"],
      checklistDatabase: options.checklistDatabase || databases["phase19-validation-readiness-checklist-db.json"],
      dryRunDatabase: options.dryRunDatabase || databases["phase19-validation-dry-run-db.json"],
      auditDatabase: options.auditDatabase || databases["phase19-dry-run-result-audit-log-db.json"],
      availableSources: ["phase19-preconnection-risk-reassessment.js", ...loaded.filter(([, value]) => value !== null).map(([asset]) => asset)],
      databases
    };
  }

  function persistQueue(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderQueue(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-final-queue-status", plan.queue_builder_status);
    set("#phase19-final-queue-total", plan.final_validation_queue_summary.total);
    set("#phase19-final-queue-ready", plan.final_validation_queue_summary.queue_statuses.queue_ready);
    set("#phase19-final-queue-plan-only", plan.final_validation_queue_summary.queue_statuses.queue_plan_only);
    set("#phase19-final-queue-hold", plan.final_validation_queue_summary.queue_statuses.queue_hold);
    set("#phase19-final-queue-protected", plan.final_validation_queue_summary.queue_statuses.protected_only);
    set("#phase19-final-queue-unsafe", plan.final_validation_queue_summary.unsafe_flags_count);
    set("#phase19-final-queue-next", plan.next_validation_step);
    set("#phase19-final-queue-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-final-validation-queue-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-final-validation-queue-item status-${item.queue_status}`;
        row.textContent = `${item.queue_id} / ${item.node_name} / ${item.queue_status} / priority:${item.validation_priority} / risk:${item.risk_level}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runFinalValidationQueueBuilder(options = {}) {
    const plan = buildFinalValidationQueue(await loadSources(options));
    persistQueue(plan, options.storage || window.localStorage);
    return renderQueue(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-final-validation-queue");
      if (button) button.addEventListener("click", () => runFinalValidationQueueBuilder().catch(() => undefined));
      runFinalValidationQueueBuilder().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, QUEUE_STATUSES, VALIDATION_PRIORITIES, RISK_LEVELS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, queueStatusFor, validationPriorityFor, requiredValidationItemsFor, holdReasonsFor, blockedReasonsFor, safetyConstraintsFor, recommendedNextAuditFor, createQueueItem, buildFinalValidationQueue, loadJson, loadSources, persistQueue, renderQueue, runFinalValidationQueueBuilder };
});
