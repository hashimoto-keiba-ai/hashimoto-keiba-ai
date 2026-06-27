(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase204FinalReleaseReadinessClosureSummaryBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-4";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "ec08f9f86f4056d74204e1951abd55431b7874ec";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const CLOSURE_SUMMARY_STATUS = "final_release_readiness_closure_summary_plan_only";
  const NEXT_RECOMMENDED_STEP = "Phase20-5 Manual Mobile Verification Evidence Collection";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const RELEASE_READINESS_STATUSES = ["pending_release_evidence", "deferred_release_evidence", "plan_only_governance_confirmed"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-4-final-release-readiness-closure-summary-db.json", "phase20-4-final-release-readiness-closure-summary-summary-db.json"];
  const SOURCE_ASSETS = ["phase20-3-mobile-verification-result-capture-closure-plan-db.json", "phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json", "index.html", "private-local.html", "README.md"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase204FinalReleaseReadinessClosureSummaryLatest";

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

  function readinessStatusFor(result) {
    if (result.result_capture_status === "deferred_result_capture") return "deferred_release_evidence";
    if (result.result_capture_status === "plan_only_closure_confirmed") return "plan_only_governance_confirmed";
    return "pending_release_evidence";
  }

  function countStatus(records, status) {
    return records.filter((record) => record.release_readiness_status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_4_panel: index.includes('id="phase20-4-final-release-readiness-closure-summary-builder"') && index.includes('<script src="phase20-4-final-release-readiness-closure-summary-builder.js"></script>'),
      private_local_phase20_4_card: privateLocal.includes('href="index.html#phase20-4-final-release-readiness-closure-summary-builder"'),
      readme_phase20_4_section: readme.includes("Phase20-4 Final Release Readiness Closure Summary"),
      phase20_3_link_retained: index.includes('id="phase20-3-mobile-verification-result-capture-closure-plan-builder"') && privateLocal.includes('href="index.html#phase20-3-mobile-verification-result-capture-closure-plan-builder"')
    };
  }

  function createReleaseReadinessRecord(result, context = {}) {
    const releaseReadinessStatus = readinessStatusFor(result);
    return {
      id: `P20-4-RELEASE-${result.id.split("-").pop()}`,
      source_result_id: result.id,
      target_name: result.target_name,
      device_type: result.device_type,
      previous_result_capture_status: result.result_capture_status,
      release_readiness_status: releaseReadinessStatus,
      evidence_status: result.evidence_status,
      closure_decision: result.closure_decision,
      release_ready: false,
      closure_ready: false,
      readiness_reason: releaseReadinessStatus === "plan_only_governance_confirmed" ? "governance_constraints_confirmed_without_release_authority" : releaseReadinessStatus === "deferred_release_evidence" ? "device_evidence_deferred_release_not_ready" : "manual_evidence_pending_release_not_ready",
      source_result_capture_plan_id: context.resultCapturePlanId || "unknown",
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_release_execution", "no_external_connection", "no_auto_confirmation", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      next_action: releaseReadinessStatus === "plan_only_governance_confirmed" ? "Keep governance closure constraints recorded for the next manual evidence phase." : "Collect manual evidence before release readiness can be closed.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildFinalReleaseReadinessClosureSummary(sources = {}, now = () => new Date()) {
    const resultCaptureDb = sources.resultCaptureDb || { records: [] };
    const resultCaptureSummaryDb = sources.resultCaptureSummary || {};
    const resultCaptureSummary = resultCaptureSummaryDb.phase20_3_summary || {};
    const textSources = sources.textSources || {};
    const records = (resultCaptureDb.records || []).map((result) => createReleaseReadinessRecord(result, { resultCapturePlanId: resultCaptureSummaryDb.result_capture_plan_id || resultCaptureDb.result_capture_plan_id }));
    const unsafeFlagsCount = (resultCaptureSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(resultCaptureDb, resultCaptureSummaryDb) ? 1 : 0);
    const blockedItemsCount = resultCaptureSummary.blocked_items_count || 0;
    const pendingReleaseItemsCount = countStatus(records, "pending_release_evidence");
    const deferredReleaseItemsCount = countStatus(records, "deferred_release_evidence");
    const planOnlyConfirmedCount = countStatus(records, "plan_only_governance_confirmed");
    const summaryAlignmentOk = records.length === (resultCaptureSummary.total_result_targets || records.length);
    const finalReleaseReady = false;
    const closureReady = false;
    const generatedAt = now();
    return {
      phase: PHASE,
      release_readiness_summary_id: `P20-4-FINAL-RELEASE-READINESS-${generatedAt.getTime()}`,
      closure_summary_status: CLOSURE_SUMMARY_STATUS,
      source_result_capture_plan_status: resultCaptureDb.result_capture_plan_status || resultCaptureSummaryDb.result_capture_plan_status || "unknown",
      source_closure_ready: resultCaptureSummary.closure_ready === true,
      source_final_release_ready: resultCaptureSummary.final_release_ready === true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_4_summary: {
        total_release_targets: records.length,
        pending_release_items_count: pendingReleaseItemsCount,
        deferred_release_items_count: deferredReleaseItemsCount,
        plan_only_confirmed_count: planOnlyConfirmedCount,
        blocked_items_count: blockedItemsCount,
        unsafe_flags_count: unsafeFlagsCount,
        closure_ready: closureReady,
        final_release_ready: finalReleaseReady,
        protected_mode: true,
        plan_only: true,
        execution_allowed: false,
        auto_execution_allowed: false,
        external_connection_allowed: false,
        pending_or_deferred_items_remaining: pendingReleaseItemsCount + deferredReleaseItemsCount,
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
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistReleaseReadinessSummary(summary, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(summary)); return summary; }

  function renderReleaseReadinessSummary(summary, doc = document) {
    const data = summary.phase20_4_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-4-summary-status", summary.closure_summary_status);
    set("#phase20-4-total-targets", data.total_release_targets);
    set("#phase20-4-pending-items", data.pending_release_items_count);
    set("#phase20-4-deferred-items", data.deferred_release_items_count);
    set("#phase20-4-plan-only-confirmed", data.plan_only_confirmed_count);
    set("#phase20-4-closure-ready", data.closure_ready);
    set("#phase20-4-final-release-ready", data.final_release_ready);
    set("#phase20-4-unsafe-flags", data.unsafe_flags_count);
    set("#phase20-4-blocked-items", data.blocked_items_count);
    set("#phase20-4-next-step", data.next_recommended_step);
    set("#phase20-4-updated", summary.generated_at);
    const list = doc.querySelector("#phase20-4-final-release-readiness-closure-summary-list");
    if (list) {
      list.textContent = "";
      summary.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-4-final-release-readiness-closure-summary-item status-${item.release_readiness_status}`;
        row.textContent = `${item.id} / ${item.target_name} / ${item.release_readiness_status} / release:${item.release_ready}`;
        list.appendChild(row);
      });
    }
    return summary;
  }

  async function runFinalReleaseReadinessClosureSummary(options = {}) {
    const summary = buildFinalReleaseReadinessClosureSummary(await loadSources(options));
    persistReleaseReadinessSummary(summary, options.storage || window.localStorage);
    return renderReleaseReadinessSummary(summary, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-4-final-release-readiness-closure-summary");
      if (button) button.addEventListener("click", () => runFinalReleaseReadinessClosureSummary().catch(() => undefined));
      runFinalReleaseReadinessClosureSummary().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, CLOSURE_SUMMARY_STATUS, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, RELEASE_READINESS_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, readinessStatusFor, countStatus, assessUiAndReadme, createReleaseReadinessRecord, buildFinalReleaseReadinessClosureSummary, loadJson, loadText, loadSources, persistReleaseReadinessSummary, renderReleaseReadinessSummary, runFinalReleaseReadinessClosureSummary };
});
