(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase206ManualEvidenceReviewReleaseGateDecisionBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-6";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "f6cb8feec59953b51a27dcf9634febed022d1ab0";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const RELEASE_GATE_STATUS = "manual_evidence_review_release_gate_decision_plan_only";
  const NEXT_RECOMMENDED_STEP = "Phase20-7 Final Manual Device Confirmation Checklist";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const REVIEW_STATUSES = ["manual_review_pending_or_observed", "manual_review_pending", "deferred_review", "plan_only_gate_control_confirmed"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-6-manual-evidence-review-release-gate-decision-db.json", "phase20-6-manual-evidence-review-release-gate-decision-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase20-3-mobile-verification-result-capture-closure-plan-db.json",
    "phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json",
    "phase20-4-final-release-readiness-closure-summary-db.json",
    "phase20-4-final-release-readiness-closure-summary-summary-db.json",
    "phase20-5-manual-mobile-verification-evidence-collection-db.json",
    "phase20-5-manual-mobile-verification-evidence-collection-summary-db.json",
    "index.html",
    "private-local.html",
    "README.md"
  ];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase206ManualEvidenceReviewReleaseGateDecisionLatest";

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

  function reviewStatusFor(evidence) {
    if (evidence.device_type === "ipad") return "deferred_review";
    if (evidence.device_type === "iphone") return "manual_review_pending";
    if (evidence.device_type === "governance") return "plan_only_gate_control_confirmed";
    return "manual_review_pending_or_observed";
  }

  function countStatus(records, status) {
    return records.filter((record) => record.review_status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_6_panel: index.includes('id="phase20-6-manual-evidence-review-release-gate-decision-builder"') && index.includes('<script src="phase20-6-manual-evidence-review-release-gate-decision-builder.js"></script>'),
      private_local_phase20_6_card: privateLocal.includes('href="index.html#phase20-6-manual-evidence-review-release-gate-decision-builder"'),
      readme_phase20_6_section: readme.includes("Phase20-6 Manual Evidence Review and Release Gate Decision"),
      phase20_3_link_retained: index.includes('id="phase20-3-mobile-verification-result-capture-closure-plan-builder"') && privateLocal.includes('href="index.html#phase20-3-mobile-verification-result-capture-closure-plan-builder"'),
      phase20_4_link_retained: index.includes('id="phase20-4-final-release-readiness-closure-summary-builder"') && privateLocal.includes('href="index.html#phase20-4-final-release-readiness-closure-summary-builder"'),
      phase20_5_link_retained: index.includes('id="phase20-5-manual-mobile-verification-evidence-collection-builder"') && privateLocal.includes('href="index.html#phase20-5-manual-mobile-verification-evidence-collection-builder"')
    };
  }

  function createReviewRecord(evidence, context = {}) {
    const reviewStatus = reviewStatusFor(evidence);
    return {
      id: `P20-6-GATE-${evidence.id.split("-").pop()}`,
      source_evidence_id: evidence.id,
      target_name: evidence.target_name,
      device_type: evidence.device_type,
      previous_evidence_collection_status: evidence.evidence_collection_status,
      review_status: reviewStatus,
      evidence_present: false,
      release_gate_open: false,
      closure_ready: false,
      final_release_ready: false,
      manual_review_required: reviewStatus !== "plan_only_gate_control_confirmed",
      release_gate_decision: reviewStatus === "plan_only_gate_control_confirmed" ? "gate_control_confirmed_without_release_authority" : reviewStatus === "deferred_review" ? "gate_closed_deferred_device_review" : "gate_closed_manual_evidence_review_pending",
      review_reason: reviewStatus === "deferred_review" ? "ipad_device_unavailable_review_deferred" : reviewStatus === "manual_review_pending" ? "iphone_manual_review_pending" : reviewStatus === "plan_only_gate_control_confirmed" ? "governance_plan_only_gate_control_confirmed" : "manual_evidence_pending_or_observed_requires_human_review",
      evidence_fields_reviewed: ["checked_at", "checked_device", "screen_url_or_local_path", "display_check_result", "screenshot_attached", "operation_notes", "reviewer_notes"],
      source_evidence_collection_id: context.evidenceCollectionId || "unknown",
      source_result_capture_plan_id: context.resultCapturePlanId || "unknown",
      source_release_readiness_summary_id: context.releaseReadinessSummaryId || "unknown",
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_release_gate_open_without_manual_evidence", "no_external_connection", "no_auto_device_validation", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      next_action: reviewStatus === "deferred_review" ? "Keep iPad review deferred until device evidence can be entered manually." : reviewStatus === "plan_only_gate_control_confirmed" ? "Carry gate control constraints into the final manual device checklist." : "Review manually entered evidence before any future release gate decision.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildManualEvidenceReviewReleaseGateDecision(sources = {}, now = () => new Date()) {
    const resultCaptureDb = sources.resultCaptureDb || {};
    const resultCaptureSummaryDb = sources.resultCaptureSummary || {};
    const releaseReadinessDb = sources.releaseReadinessDb || {};
    const releaseReadinessSummaryDb = sources.releaseReadinessSummary || {};
    const evidenceCollectionDb = sources.evidenceCollectionDb || { records: [] };
    const evidenceCollectionSummaryDb = sources.evidenceCollectionSummary || {};
    const evidenceSummary = evidenceCollectionSummaryDb.phase20_5_summary || evidenceCollectionDb.phase20_5_summary || {};
    const textSources = sources.textSources || {};
    const context = {
      evidenceCollectionId: evidenceCollectionSummaryDb.evidence_collection_id || evidenceCollectionDb.evidence_collection_id,
      resultCapturePlanId: resultCaptureSummaryDb.result_capture_plan_id || resultCaptureDb.result_capture_plan_id,
      releaseReadinessSummaryId: releaseReadinessSummaryDb.release_readiness_summary_id || releaseReadinessDb.release_readiness_summary_id
    };
    const records = (evidenceCollectionDb.records || []).map((evidence) => createReviewRecord(evidence, context));
    const unsafeFlagsCount = (evidenceSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(resultCaptureDb, resultCaptureSummaryDb, releaseReadinessDb, releaseReadinessSummaryDb, evidenceCollectionDb, evidenceCollectionSummaryDb) ? 1 : 0);
    const blockedItemsCount = evidenceSummary.blocked_items_count || 0;
    const manualPendingOrObservedCount = countStatus(records, "manual_review_pending_or_observed");
    const manualPendingCount = countStatus(records, "manual_review_pending");
    const deferredReviewCount = countStatus(records, "deferred_review");
    const gateControlConfirmedCount = countStatus(records, "plan_only_gate_control_confirmed");
    const evidencePresentCount = records.filter((record) => record.evidence_present === true).length;
    const summaryAlignmentOk = records.length === (evidenceSummary.total_evidence_targets || records.length);
    const generatedAt = now();
    return {
      phase: PHASE,
      release_gate_decision_id: `P20-6-MANUAL-EVIDENCE-REVIEW-GATE-${generatedAt.getTime()}`,
      release_gate_status: RELEASE_GATE_STATUS,
      source_evidence_collection_status: evidenceCollectionDb.evidence_collection_status || evidenceCollectionSummaryDb.evidence_collection_status || "unknown",
      source_closure_ready: evidenceSummary.closure_ready === true,
      source_final_release_ready: evidenceSummary.final_release_ready === true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_6_summary: {
        total_review_targets: records.length,
        manual_review_pending_or_observed_count: manualPendingOrObservedCount,
        manual_review_pending_count: manualPendingOrObservedCount + manualPendingCount,
        iphone_manual_review_pending_count: manualPendingCount,
        deferred_review_count: deferredReviewCount,
        plan_only_gate_control_confirmed_count: gateControlConfirmedCount,
        evidence_present_count: evidencePresentCount,
        release_gate_open: false,
        closure_ready: false,
        final_release_ready: false,
        blocked_items_count: blockedItemsCount,
        unsafe_flags_count: unsafeFlagsCount,
        protected_mode: true,
        plan_only: true,
        execution_allowed: false,
        auto_execution_allowed: false,
        external_connection_allowed: false,
        summary_alignment_ok: summaryAlignmentOk,
        ui_readme_checks: assessUiAndReadme(textSources),
        next_recommended_step: NEXT_RECOMMENDED_STEP
      },
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      generated_at: generatedAt.toISOString(),
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      execution_allowed: false,
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
      resultCaptureDb: options.resultCaptureDb || databases["phase20-3-mobile-verification-result-capture-closure-plan-db.json"],
      resultCaptureSummary: options.resultCaptureSummary || databases["phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json"],
      releaseReadinessDb: options.releaseReadinessDb || databases["phase20-4-final-release-readiness-closure-summary-db.json"],
      releaseReadinessSummary: options.releaseReadinessSummary || databases["phase20-4-final-release-readiness-closure-summary-summary-db.json"],
      evidenceCollectionDb: options.evidenceCollectionDb || databases["phase20-5-manual-mobile-verification-evidence-collection-db.json"],
      evidenceCollectionSummary: options.evidenceCollectionSummary || databases["phase20-5-manual-mobile-verification-evidence-collection-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistReleaseGateDecision(decision, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(decision)); return decision; }

  function renderReleaseGateDecision(decision, doc = document) {
    const data = decision.phase20_6_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-6-gate-status", decision.release_gate_status);
    set("#phase20-6-total-targets", data.total_review_targets);
    set("#phase20-6-manual-review-pending", data.manual_review_pending_count);
    set("#phase20-6-deferred-review", data.deferred_review_count);
    set("#phase20-6-evidence-present", data.evidence_present_count);
    set("#phase20-6-release-gate-open", data.release_gate_open);
    set("#phase20-6-closure-ready", data.closure_ready);
    set("#phase20-6-final-release-ready", data.final_release_ready);
    set("#phase20-6-unsafe-flags", data.unsafe_flags_count);
    set("#phase20-6-blocked-items", data.blocked_items_count);
    set("#phase20-6-next-step", data.next_recommended_step);
    set("#phase20-6-updated", decision.generated_at);
    const list = doc.querySelector("#phase20-6-manual-evidence-review-release-gate-decision-list");
    if (list) {
      list.textContent = "";
      decision.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-6-manual-evidence-review-release-gate-decision-item status-${item.review_status}`;
        row.textContent = `${item.id} / ${item.target_name} / ${item.review_status} / gate:${item.release_gate_open}`;
        list.appendChild(row);
      });
    }
    return decision;
  }

  async function runManualEvidenceReviewReleaseGateDecision(options = {}) {
    const decision = buildManualEvidenceReviewReleaseGateDecision(await loadSources(options));
    persistReleaseGateDecision(decision, options.storage || window.localStorage);
    return renderReleaseGateDecision(decision, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-6-manual-evidence-review-release-gate-decision");
      if (button) button.addEventListener("click", () => runManualEvidenceReviewReleaseGateDecision().catch(() => undefined));
      runManualEvidenceReviewReleaseGateDecision().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, RELEASE_GATE_STATUS, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, REVIEW_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, reviewStatusFor, countStatus, assessUiAndReadme, createReviewRecord, buildManualEvidenceReviewReleaseGateDecision, loadJson, loadText, loadSources, persistReleaseGateDecision, renderReleaseGateDecision, runManualEvidenceReviewReleaseGateDecision };
});
