(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19FinalValidationClosureReportBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-16";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "c7df497e8142c21d9447081083e317283205ec67";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const IPAD_VALIDATION_STATUS = "deferred";
  const NEXT_RECOMMENDED_STEP = "Phase20 Global Network Post-Closure Device Validation and Release Planning";
  const CLOSURE_STATUSES = ["closure_ready", "closure_deferred", "closure_hold", "closure_blocked", "protected_only"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-final-validation-closure-report-db.json", "phase19-final-validation-closure-report-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-connection-readiness-matrix-db.json",
    "phase19-connection-readiness-summary-db.json",
    "phase19-validation-scenario-db.json",
    "phase19-validation-scenario-summary-db.json",
    "phase19-validation-readiness-checklist-db.json",
    "phase19-validation-readiness-summary-db.json",
    "phase19-validation-dry-run-db.json",
    "phase19-validation-dry-run-summary-db.json",
    "phase19-dry-run-result-audit-log-db.json",
    "phase19-dry-run-result-audit-summary-db.json",
    "phase19-preconnection-risk-reassessment-db.json",
    "phase19-preconnection-risk-reassessment-summary-db.json",
    "phase19-final-validation-queue-db.json",
    "phase19-final-validation-queue-summary-db.json",
    "phase19-final-validation-audit-review-db.json",
    "phase19-final-validation-audit-review-summary-db.json",
    "index.html",
    "private-local.html",
    "README.md"
  ];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase19FinalValidationClosureReportLatest";

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

  function countBy(records, field, values) {
    return Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
  }

  function getQueueStatus(auditItem) {
    if (auditItem.audit_review_status === "protected_only") return "protected_only";
    if (auditItem.audit_review_status === "audit_review_blocked" || auditItem.queue_status === "queue_blocked") return "closure_blocked";
    if (auditItem.audit_review_status === "audit_review_hold" || auditItem.queue_status === "queue_hold") return "closure_hold";
    if (auditItem.audit_review_status === "audit_review_plan_only" || auditItem.queue_status === "queue_plan_only") return "closure_deferred";
    return "closure_ready";
  }

  function assessSourceCoverage(availableSources) {
    const available = new Set(availableSources || []);
    const missing = SOURCE_ASSETS.filter((asset) => !available.has(asset));
    return { missing, ok: missing.length === 0 };
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase19_16_link: index.includes('id="phase19-final-validation-closure-report-builder"') && index.includes('<script src="phase19-final-validation-closure-report-builder.js"></script>'),
      private_local_phase19_16_link: privateLocal.includes('href="index.html#phase19-final-validation-closure-report-builder"'),
      readme_phase19_16_section: readme.includes("Phase19-16 Global Network Final Validation Closure Report"),
      phase19_14_link_retained: index.includes('id="phase19-final-validation-queue-builder"') && privateLocal.includes('href="index.html#phase19-final-validation-queue-builder"'),
      phase19_15_link_retained: index.includes('id="phase19-final-validation-audit-review-builder"') && privateLocal.includes('href="index.html#phase19-final-validation-audit-review-builder"')
    };
  }

  function createClosureItem(auditItem, context = {}) {
    const closureStatus = getQueueStatus(auditItem);
    return {
      closure_id: `P19-FINAL-CLOSURE-${auditItem.priority_id.split("-").pop()}`,
      queue_id: auditItem.queue_id,
      audit_review_id: auditItem.audit_review_id,
      reassessment_id: auditItem.reassessment_id,
      audit_log_id: auditItem.audit_log_id,
      node_name: auditItem.node_name,
      category: auditItem.category,
      priority_id: auditItem.priority_id,
      closure_status: closureStatus,
      queue_status: auditItem.queue_status,
      audit_review_status: auditItem.audit_review_status,
      validation_priority: auditItem.validation_priority,
      risk_level: auditItem.risk_level,
      closure_findings: context.summaryAligned ? ["queue_and_audit_summaries_aligned", "unsafe_flags_absent", "plan_only_policy_retained"] : ["summary_alignment_requires_review"],
      deferred_items: closureStatus === "closure_deferred" ? ["plan_only_item_retained_for_future_review"] : closureStatus === "protected_only" ? ["protected_only_item_retained_read_only"] : [],
      safety_constraints: [...(auditItem.safety_constraints || []), "closure_report_only", "ipad_validation_deferred"],
      recommended_next_step: closureStatus === "protected_only" ? "Recommended: keep protected-only items read-only in the post-closure plan." : "Recommended: carry this item into post-closure planning without enabling execution.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildFinalValidationClosureReport(sources = {}, now = () => new Date()) {
    const queueDatabase = sources.queueDatabase || { records: [] };
    const queueSummaryDb = sources.queueSummary || {};
    const auditReviewDatabase = sources.auditReviewDatabase || { records: [] };
    const auditReviewSummaryDb = sources.auditReviewSummary || {};
    const textSources = sources.textSources || {};
    const availableSources = sources.availableSources || SOURCE_ASSETS;
    const sourceCoverage = assessSourceCoverage(availableSources);
    const uiReadmeChecks = assessUiAndReadme(textSources);
    const queueSummary = queueSummaryDb.final_validation_queue_summary || {};
    const auditSummary = auditReviewSummaryDb.final_validation_audit_review_summary || {};
    const auditStatuses = auditSummary.audit_review_statuses || {};
    const queueStatuses = queueSummary.queue_statuses || {};
    const queueSummaryAligned = queueSummary.total === (queueDatabase.records || []).length;
    const auditSummaryAligned = auditSummary.total === (auditReviewDatabase.records || []).length && auditSummary.summary_alignment_ok === true;
    const summaryAlignmentOk = queueSummaryAligned && auditSummaryAligned;
    const unsafeFlagsCount = (queueSummary.unsafe_flags_count || 0) + (auditSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(queueDatabase, queueSummaryDb, auditReviewDatabase, auditReviewSummaryDb) ? 1 : 0);
    const unresolvedIssueCount = [
      queueStatuses.queue_hold || 0,
      queueStatuses.queue_blocked || 0,
      auditStatuses.audit_review_hold || 0,
      auditStatuses.audit_review_blocked || 0,
      auditSummary.duplicate_queue_id_count || 0,
      auditSummary.missing_required_field_count || 0,
      auditSummary.invalid_priority_count || 0,
      auditSummary.invalid_status_count || 0,
      auditSummary.missing_source_count || 0,
      queueSummary.missing_source_count || 0,
      sourceCoverage.missing.length,
      summaryAlignmentOk ? 0 : 1,
      unsafeFlagsCount
    ].reduce((sum, value) => sum + value, 0);
    const closureRecords = (auditReviewDatabase.records || []).map((item) => createClosureItem(item, { summaryAligned: summaryAlignmentOk }));
    const closureStatusCounts = countBy(closureRecords, "closure_status", CLOSURE_STATUSES);
    const closureReady = unresolvedIssueCount === 0 && unsafeFlagsCount === 0 && summaryAlignmentOk;
    const generatedAt = now();
    return {
      phase: PHASE,
      closure_report_id: `P19-FINAL-VALIDATION-CLOSURE-${generatedAt.getTime()}`,
      closure_report_status: closureReady ? "final_validation_closed" : "final_validation_closure_blocked",
      source_queue_builder_status: queueDatabase.queue_builder_status || "unknown",
      source_audit_review_status: auditReviewDatabase.audit_review_status || "unknown",
      official_release_protected: queueDatabase.official_release_protected !== false && auditReviewDatabase.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records: closureRecords,
      final_validation_closure_summary: {
        total: closureRecords.length,
        closure_statuses: closureStatusCounts,
        final_validation_closed: closureReady,
        queue_ready_count: queueStatuses.queue_ready || 0,
        audit_passed_count: auditStatuses.audit_review_passed || 0,
        unresolved_issue_count: unresolvedIssueCount,
        unsafe_flags_count: unsafeFlagsCount,
        protected_item_count: closureStatusCounts.protected_only || 0,
        plan_only_item_count: closureStatusCounts.closure_deferred || 0,
        summary_alignment_ok: summaryAlignmentOk,
        source_coverage_ok: sourceCoverage.ok,
        ui_readme_checks: uiReadmeChecks,
        closure_ready: closureReady,
        next_recommended_step: NEXT_RECOMMENDED_STEP,
        ipad_validation_status: IPAD_VALIDATION_STATUS,
        external_connection_blocked: true,
        auto_execution_blocked: true
      },
      missing_source_assets: sourceCoverage.missing,
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ipad_validation_status: IPAD_VALIDATION_STATUS,
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

  async function loadText(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.text() : ""; }
    catch (_) { return ""; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const jsonLoaded = await Promise.all(JSON_SOURCE_ASSETS.map(async (asset) => [asset, await loadJson(asset, fetcher)]));
    const textLoaded = await Promise.all(TEXT_SOURCE_ASSETS.map(async (asset) => [asset, await loadText(asset, fetcher)]));
    const databases = Object.fromEntries(jsonLoaded.filter(([, value]) => value !== null));
    const textSources = Object.fromEntries(textLoaded.filter(([, value]) => value !== ""));
    return {
      queueDatabase: options.queueDatabase || databases["phase19-final-validation-queue-db.json"],
      queueSummary: options.queueSummary || databases["phase19-final-validation-queue-summary-db.json"],
      auditReviewDatabase: options.auditReviewDatabase || databases["phase19-final-validation-audit-review-db.json"],
      auditReviewSummary: options.auditReviewSummary || databases["phase19-final-validation-audit-review-summary-db.json"],
      textSources: options.textSources || textSources,
      availableSources: [...jsonLoaded.filter(([, value]) => value !== null).map(([asset]) => asset), ...textLoaded.filter(([, value]) => value !== "").map(([asset]) => asset)],
      databases
    };
  }

  function persistClosureReport(report, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(report)); return report; }

  function renderClosureReport(report, doc = document) {
    const summary = report.final_validation_closure_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-final-closure-status", report.closure_report_status);
    set("#phase19-final-closure-ready", summary.closure_ready);
    set("#phase19-final-closure-closed", summary.final_validation_closed);
    set("#phase19-final-closure-unresolved", summary.unresolved_issue_count);
    set("#phase19-final-closure-unsafe", summary.unsafe_flags_count);
    set("#phase19-final-closure-ipad", summary.ipad_validation_status);
    set("#phase19-final-closure-next", summary.next_recommended_step);
    set("#phase19-final-closure-updated", report.generated_at);
    const list = doc.querySelector("#phase19-final-validation-closure-report-list");
    if (list) {
      list.textContent = "";
      report.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-final-validation-closure-report-item status-${item.closure_status}`;
        row.textContent = `${item.closure_id} / ${item.node_name} / ${item.closure_status} / audit:${item.audit_review_status} / iPad:${summary.ipad_validation_status}`;
        list.appendChild(row);
      });
    }
    return report;
  }

  async function runFinalValidationClosureReport(options = {}) {
    const report = buildFinalValidationClosureReport(await loadSources(options));
    persistClosureReport(report, options.storage || window.localStorage);
    return renderClosureReport(report, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-final-validation-closure-report");
      if (button) button.addEventListener("click", () => runFinalValidationClosureReport().catch(() => undefined));
      runFinalValidationClosureReport().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, IPAD_VALIDATION_STATUS, NEXT_RECOMMENDED_STEP, CLOSURE_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, countBy, getQueueStatus, assessSourceCoverage, assessUiAndReadme, createClosureItem, buildFinalValidationClosureReport, loadJson, loadText, loadSources, persistClosureReport, renderClosureReport, runFinalValidationClosureReport };
});
