(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19FinalValidationAuditReviewBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-15";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "7ec8221af9da3c79ebb743c18ecb79eae6c4eafd";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const AUDIT_REVIEW_STATUSES = ["audit_review_passed", "audit_review_plan_only", "audit_review_hold", "audit_review_blocked", "protected_only"];
  const QUEUE_STATUSES = ["queue_ready", "queue_plan_only", "queue_hold", "queue_blocked", "protected_only"];
  const VALIDATION_PRIORITIES = ["P0", "P1", "P2", "P3", "protected", "blocked"];
  const REQUIRED_QUEUE_FIELDS = ["queue_id", "reassessment_id", "audit_log_id", "node_name", "category", "priority_id", "queue_status", "validation_priority", "risk_level", "required_validation_items", "hold_reasons", "blocked_reasons", "safety_constraints", "recommended_next_audit", "blocked_actions", "allowed_actions", "execution_allowed", "external_connection_allowed"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-final-validation-audit-review-db.json", "phase19-final-validation-audit-review-summary-db.json"];
  const SOURCE_ASSETS = ["phase19-final-validation-queue-builder.js", "phase19-final-validation-queue-db.json", "phase19-final-validation-queue-summary-db.json"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const STORAGE_KEY = "phase19FinalValidationAuditReviewLatest";

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

  function duplicateIds(records, field) {
    const seen = new Set();
    const duplicated = new Set();
    records.forEach((record) => {
      const value = record[field];
      if (!value) return;
      if (seen.has(value)) duplicated.add(value);
      seen.add(value);
    });
    return duplicated;
  }

  function missingFieldsFor(record) {
    return REQUIRED_QUEUE_FIELDS.filter((field) => !Object.hasOwn(record, field));
  }

  function statusFor(queueItem, context) {
    if (queueItem.queue_status === "protected_only" || queueItem.validation_priority === "protected") return "protected_only";
    if (context.unsafe || context.duplicateQueueIds.has(queueItem.queue_id) || context.missingFields.length > 0 || !QUEUE_STATUSES.includes(queueItem.queue_status) || !VALIDATION_PRIORITIES.includes(queueItem.validation_priority)) return "audit_review_blocked";
    if (queueItem.queue_status === "queue_blocked" || queueItem.validation_priority === "blocked") return "audit_review_blocked";
    if (queueItem.queue_status === "queue_hold") return "audit_review_hold";
    if (queueItem.queue_status === "queue_plan_only") return "audit_review_plan_only";
    return "audit_review_passed";
  }

  function priorityFindingFor(queueItem) {
    if (!VALIDATION_PRIORITIES.includes(queueItem.validation_priority)) return [`invalid_validation_priority:${queueItem.validation_priority}`];
    if (queueItem.queue_status === "protected_only" && queueItem.validation_priority !== "protected") return ["protected_queue_requires_protected_priority"];
    if (queueItem.queue_status === "queue_blocked" && queueItem.validation_priority !== "blocked") return ["blocked_queue_requires_blocked_priority"];
    return ["validation_priority_consistent"];
  }

  function validationStatusFindingFor(queueItem) {
    if (!QUEUE_STATUSES.includes(queueItem.queue_status)) return [`invalid_queue_status:${queueItem.queue_status}`];
    if (queueItem.queue_status === "queue_ready" && queueItem.validation_priority === "P0") return ["queue_ready_priority_p0_confirmed"];
    if (queueItem.queue_status === "queue_plan_only" && queueItem.validation_priority === "P2") return ["queue_plan_only_priority_p2_confirmed"];
    if (queueItem.queue_status === "protected_only" && queueItem.validation_priority === "protected") return ["protected_only_priority_confirmed"];
    return ["queue_status_review_required"];
  }

  function createAuditReviewItem(queueItem, context = {}) {
    const missingFields = missingFieldsFor(queueItem);
    const status = statusFor(queueItem, { ...context, missingFields });
    return {
      audit_review_id: `P19-FINAL-AUDIT-REVIEW-${queueItem.priority_id.split("-").pop()}`,
      queue_id: queueItem.queue_id,
      reassessment_id: queueItem.reassessment_id,
      audit_log_id: queueItem.audit_log_id,
      node_name: queueItem.node_name,
      category: queueItem.category,
      priority_id: queueItem.priority_id,
      audit_review_status: status,
      queue_status: queueItem.queue_status,
      validation_priority: queueItem.validation_priority,
      risk_level: queueItem.risk_level,
      integrity_checks: ["queue_record_present", "summary_alignment_checked", "required_fields_checked", "duplicate_queue_id_checked", "priority_status_checked", "safety_flags_checked"],
      consistency_findings: context.summaryAligned ? ["queue_summary_aligned"] : ["queue_summary_mismatch"],
      duplicate_findings: context.duplicateQueueIds.has(queueItem.queue_id) ? [`duplicate_queue_id:${queueItem.queue_id}`] : ["no_duplicate_queue_id"],
      missing_field_findings: missingFields,
      priority_findings: priorityFindingFor(queueItem),
      validation_status_findings: validationStatusFindingFor(queueItem),
      safety_constraints: [...(queueItem.safety_constraints || []), "audit_review_only", "no_queue_release_authority"],
      recommended_next_audit: status === "protected_only" ? "Recommended: retain protected-only audit review and keep the node read-only." : status === "audit_review_blocked" ? "Recommended: keep the item blocked and resolve audit findings without enabling execution." : "Recommended: record the final validation audit review and continue PLAN_ONLY reporting.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildFinalValidationAuditReview(sources = {}, now = () => new Date()) {
    const queueDatabase = sources.queueDatabase || { records: [] };
    const queueSummary = sources.queueSummary || {};
    const records = queueDatabase.records || [];
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(queueDatabase, queueSummary);
    const duplicateQueueIds = duplicateIds(records, "queue_id");
    const summaryTotal = queueSummary.final_validation_queue_summary ? queueSummary.final_validation_queue_summary.total : undefined;
    const summaryAligned = summaryTotal === undefined ? false : summaryTotal === records.length;
    const auditRecords = records.map((item) => createAuditReviewItem(item, { unsafe, duplicateQueueIds, summaryAligned }));
    const statusCounts = Object.fromEntries(AUDIT_REVIEW_STATUSES.map((status) => [status, auditRecords.filter((item) => item.audit_review_status === status).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      audit_review_id: `P19-FINAL-VALIDATION-AUDIT-REVIEW-${generatedAt.getTime()}`,
      audit_review_status: unsafe || duplicateQueueIds.size > 0 || !summaryAligned || missingSources.length > 0 ? "final_validation_audit_review_blocked" : "final_validation_audit_review_plan_only",
      source_queue_builder_status: queueDatabase.queue_builder_status || "unknown",
      source_queue_summary_status: queueSummary.queue_builder_status || "unknown",
      official_release_protected: queueDatabase.official_release_protected !== false && queueSummary.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records: auditRecords,
      final_validation_audit_review_summary: {
        total: auditRecords.length,
        audit_review_statuses: statusCounts,
        duplicate_queue_id_count: duplicateQueueIds.size,
        missing_required_field_count: auditRecords.reduce((sum, item) => sum + item.missing_field_findings.length, 0),
        invalid_priority_count: auditRecords.filter((item) => item.priority_findings.some((finding) => finding.startsWith("invalid_") || finding.includes("requires_"))).length,
        invalid_status_count: auditRecords.filter((item) => item.validation_status_findings.some((finding) => finding.startsWith("invalid_"))).length,
        summary_alignment_ok: summaryAligned,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length,
        external_connection_blocked: true,
        auto_execution_blocked: true
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-16 Global Network Final Validation Closure Report",
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
      queueDatabase: options.queueDatabase || databases["phase19-final-validation-queue-db.json"],
      queueSummary: options.queueSummary || databases["phase19-final-validation-queue-summary-db.json"],
      availableSources: ["phase19-final-validation-queue-builder.js", ...loaded.filter(([, value]) => value !== null).map(([asset]) => asset)],
      databases
    };
  }

  function persistAuditReview(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderAuditReview(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-final-audit-review-status", plan.audit_review_status);
    set("#phase19-final-audit-review-total", plan.final_validation_audit_review_summary.total);
    set("#phase19-final-audit-review-passed", plan.final_validation_audit_review_summary.audit_review_statuses.audit_review_passed);
    set("#phase19-final-audit-review-plan-only", plan.final_validation_audit_review_summary.audit_review_statuses.audit_review_plan_only);
    set("#phase19-final-audit-review-protected", plan.final_validation_audit_review_summary.audit_review_statuses.protected_only);
    set("#phase19-final-audit-review-duplicates", plan.final_validation_audit_review_summary.duplicate_queue_id_count);
    set("#phase19-final-audit-review-unsafe", plan.final_validation_audit_review_summary.unsafe_flags_count);
    set("#phase19-final-audit-review-next", plan.next_validation_step);
    set("#phase19-final-audit-review-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-final-validation-audit-review-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-final-validation-audit-review-item status-${item.audit_review_status}`;
        row.textContent = `${item.audit_review_id} / ${item.node_name} / ${item.audit_review_status} / queue:${item.queue_status} / priority:${item.validation_priority}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runFinalValidationAuditReview(options = {}) {
    const plan = buildFinalValidationAuditReview(await loadSources(options));
    persistAuditReview(plan, options.storage || window.localStorage);
    return renderAuditReview(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-final-validation-audit-review");
      if (button) button.addEventListener("click", () => runFinalValidationAuditReview().catch(() => undefined));
      runFinalValidationAuditReview().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, AUDIT_REVIEW_STATUSES, QUEUE_STATUSES, VALIDATION_PRIORITIES, REQUIRED_QUEUE_FIELDS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, duplicateIds, missingFieldsFor, statusFor, priorityFindingFor, validationStatusFindingFor, createAuditReviewItem, buildFinalValidationAuditReview, loadJson, loadSources, persistAuditReview, renderAuditReview, runFinalValidationAuditReview };
});
