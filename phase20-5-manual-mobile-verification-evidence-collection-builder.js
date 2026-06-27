(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase205ManualMobileVerificationEvidenceCollectionBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-5";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "e7a23eeecc345656cc83a0ffe3218ba551bf53ac";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EVIDENCE_COLLECTION_STATUS = "manual_mobile_verification_evidence_collection_plan_only";
  const NEXT_RECOMMENDED_STEP = "Phase20-6 Manual Evidence Review and Release Gate Decision";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const EVIDENCE_STATUSES = ["manual_evidence_pending", "deferred_evidence", "plan_only_governance_evidence"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-5-manual-mobile-verification-evidence-collection-db.json", "phase20-5-manual-mobile-verification-evidence-collection-summary-db.json"];
  const SOURCE_ASSETS = ["phase20-4-final-release-readiness-closure-summary-db.json", "phase20-4-final-release-readiness-closure-summary-summary-db.json", "index.html", "private-local.html", "README.md"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase205ManualMobileVerificationEvidenceCollectionLatest";

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

  function evidenceStatusFor(readiness) {
    if (readiness.release_readiness_status === "deferred_release_evidence") return "deferred_evidence";
    if (readiness.release_readiness_status === "plan_only_governance_confirmed") return "plan_only_governance_evidence";
    return "manual_evidence_pending";
  }

  function evidenceTemplateFor(readiness) {
    return {
      checked_at: "",
      checked_device: readiness.device_type,
      screen_url_or_local_path: readiness.device_type === "github_pages" ? "" : "index.html",
      display_check_result: "",
      screenshot_attached: false,
      operation_notes: "",
      reviewer_notes: ""
    };
  }

  function countStatus(records, status) {
    return records.filter((record) => record.evidence_collection_status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_5_panel: index.includes('id="phase20-5-manual-mobile-verification-evidence-collection-builder"') && index.includes('<script src="phase20-5-manual-mobile-verification-evidence-collection-builder.js"></script>'),
      private_local_phase20_5_card: privateLocal.includes('href="index.html#phase20-5-manual-mobile-verification-evidence-collection-builder"'),
      readme_phase20_5_section: readme.includes("Phase20-5 Manual Mobile Verification Evidence Collection"),
      phase20_4_link_retained: index.includes('id="phase20-4-final-release-readiness-closure-summary-builder"') && privateLocal.includes('href="index.html#phase20-4-final-release-readiness-closure-summary-builder"')
    };
  }

  function createEvidenceRecord(readiness, context = {}) {
    const evidenceCollectionStatus = evidenceStatusFor(readiness);
    return {
      id: `P20-5-EVIDENCE-${readiness.id.split("-").pop()}`,
      source_release_readiness_id: readiness.id,
      target_name: readiness.target_name,
      device_type: readiness.device_type,
      previous_release_readiness_status: readiness.release_readiness_status,
      evidence_collection_status: evidenceCollectionStatus,
      manual_check_required: evidenceCollectionStatus !== "plan_only_governance_evidence",
      evidence_required: evidenceCollectionStatus !== "plan_only_governance_evidence",
      evidence_template: evidenceTemplateFor(readiness),
      evidence_present: false,
      closure_ready: false,
      final_release_ready: false,
      deferred_reason: evidenceCollectionStatus === "deferred_evidence" ? "device_unavailable_ipad_evidence_deferred" : "",
      pending_reason: evidenceCollectionStatus === "manual_evidence_pending" ? "manual_verification_evidence_not_entered" : "",
      collection_policy: evidenceCollectionStatus === "deferred_evidence" ? "deferred_evidence_does_not_auto_confirm" : evidenceCollectionStatus === "plan_only_governance_evidence" ? "plan_only_governance_evidence_recorded_without_release_authority" : "manual_evidence_pending_until_human_entry",
      source_release_readiness_summary_id: context.releaseReadinessSummaryId || "unknown",
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_github_pages_auto_connection", "no_device_auto_check", "no_auto_evidence_capture", "no_auto_confirmed_conversion", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      next_action: evidenceCollectionStatus === "deferred_evidence" ? "Keep iPad evidence deferred until the device is available." : evidenceCollectionStatus === "plan_only_governance_evidence" ? "Carry governance evidence into manual review without release authority." : "Enter manual verification evidence before release gate review.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildManualMobileVerificationEvidenceCollection(sources = {}, now = () => new Date()) {
    const releaseReadinessDb = sources.releaseReadinessDb || { records: [] };
    const releaseReadinessSummaryDb = sources.releaseReadinessSummary || {};
    const releaseSummary = releaseReadinessSummaryDb.phase20_4_summary || {};
    const textSources = sources.textSources || {};
    const records = (releaseReadinessDb.records || []).map((item) => createEvidenceRecord(item, { releaseReadinessSummaryId: releaseReadinessSummaryDb.release_readiness_summary_id || releaseReadinessDb.release_readiness_summary_id }));
    const unsafeFlagsCount = (releaseSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(releaseReadinessDb, releaseReadinessSummaryDb) ? 1 : 0);
    const blockedItemsCount = releaseSummary.blocked_items_count || 0;
    const manualEvidencePendingCount = countStatus(records, "manual_evidence_pending");
    const deferredEvidenceCount = countStatus(records, "deferred_evidence");
    const planOnlyEvidenceCount = countStatus(records, "plan_only_governance_evidence");
    const summaryAlignmentOk = records.length === (releaseSummary.total_release_targets || records.length);
    const generatedAt = now();
    return {
      phase: PHASE,
      evidence_collection_id: `P20-5-MANUAL-EVIDENCE-COLLECTION-${generatedAt.getTime()}`,
      evidence_collection_status: EVIDENCE_COLLECTION_STATUS,
      source_closure_summary_status: releaseReadinessDb.closure_summary_status || releaseReadinessSummaryDb.closure_summary_status || "unknown",
      source_closure_ready: releaseSummary.closure_ready === true,
      source_final_release_ready: releaseSummary.final_release_ready === true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_5_summary: {
        total_evidence_targets: records.length,
        manual_evidence_pending_count: manualEvidencePendingCount,
        deferred_evidence_count: deferredEvidenceCount,
        plan_only_governance_evidence_count: planOnlyEvidenceCount,
        evidence_present_count: records.filter((record) => record.evidence_present === true).length,
        pending_or_deferred_items_remaining: manualEvidencePendingCount + deferredEvidenceCount,
        blocked_items_count: blockedItemsCount,
        unsafe_flags_count: unsafeFlagsCount,
        closure_ready: false,
        final_release_ready: false,
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
      releaseReadinessDb: options.releaseReadinessDb || databases["phase20-4-final-release-readiness-closure-summary-db.json"],
      releaseReadinessSummary: options.releaseReadinessSummary || databases["phase20-4-final-release-readiness-closure-summary-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistEvidenceCollection(collection, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(collection)); return collection; }

  function renderEvidenceCollection(collection, doc = document) {
    const data = collection.phase20_5_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-5-collection-status", collection.evidence_collection_status);
    set("#phase20-5-total-targets", data.total_evidence_targets);
    set("#phase20-5-manual-pending", data.manual_evidence_pending_count);
    set("#phase20-5-deferred-evidence", data.deferred_evidence_count);
    set("#phase20-5-evidence-present", data.evidence_present_count);
    set("#phase20-5-closure-ready", data.closure_ready);
    set("#phase20-5-final-release-ready", data.final_release_ready);
    set("#phase20-5-unsafe-flags", data.unsafe_flags_count);
    set("#phase20-5-blocked-items", data.blocked_items_count);
    set("#phase20-5-next-step", data.next_recommended_step);
    set("#phase20-5-updated", collection.generated_at);
    const list = doc.querySelector("#phase20-5-manual-mobile-verification-evidence-collection-list");
    if (list) {
      list.textContent = "";
      collection.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-5-manual-mobile-verification-evidence-collection-item status-${item.evidence_collection_status}`;
        row.textContent = `${item.id} / ${item.target_name} / ${item.evidence_collection_status} / evidence:${item.evidence_present}`;
        list.appendChild(row);
      });
    }
    return collection;
  }

  async function runManualMobileVerificationEvidenceCollection(options = {}) {
    const collection = buildManualMobileVerificationEvidenceCollection(await loadSources(options));
    persistEvidenceCollection(collection, options.storage || window.localStorage);
    return renderEvidenceCollection(collection, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-5-manual-mobile-verification-evidence-collection");
      if (button) button.addEventListener("click", () => runManualMobileVerificationEvidenceCollection().catch(() => undefined));
      runManualMobileVerificationEvidenceCollection().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EVIDENCE_COLLECTION_STATUS, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, EVIDENCE_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, evidenceStatusFor, evidenceTemplateFor, countStatus, assessUiAndReadme, createEvidenceRecord, buildManualMobileVerificationEvidenceCollection, loadJson, loadText, loadSources, persistEvidenceCollection, renderEvidenceCollection, runManualMobileVerificationEvidenceCollection };
});
