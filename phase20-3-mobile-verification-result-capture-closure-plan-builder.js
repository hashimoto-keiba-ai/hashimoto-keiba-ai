(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase203MobileVerificationResultCaptureClosurePlanBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-3";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "80d587ed7ec3a15b5d16f75e60279464c7b17efa";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const CAPTURE_PLAN_STATUS = "mobile_verification_result_capture_closure_plan_only";
  const NEXT_RECOMMENDED_STEP = "Phase20-4 Final Release Readiness Closure Summary";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const RESULT_STATUSES = ["pending_result_capture", "deferred_result_capture", "pending_or_confirmed_result_capture", "plan_only_closure_confirmed"];
  const CLOSURE_DECISIONS = ["pending_evidence", "deferred_no_block", "plan_only_confirmed"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-3-mobile-verification-result-capture-closure-plan-db.json", "phase20-3-mobile-verification-result-capture-closure-plan-summary-db.json"];
  const SOURCE_ASSETS = ["phase20-2-github-pages-mobile-display-verification-plan-db.json", "phase20-2-github-pages-mobile-display-verification-plan-summary-db.json", "index.html", "private-local.html", "README.md"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase203MobileVerificationResultCaptureClosurePlanLatest";

  const RESULT_BLUEPRINTS = [
    {
      id: "P20-3-RESULT-001",
      target_name: "GitHub Pages display result capture",
      device_type: "github_pages",
      previous_status: "pending",
      result_capture_status: "pending_result_capture",
      manual_check_required: true,
      evidence_required: true,
      evidence_status: "missing",
      closure_decision: "pending_evidence",
      closure_ready: false,
      pending_reason: "github_pages_manual_display_evidence_not_captured",
      confirmed_result: "not_captured",
      next_action: "Capture manual GitHub Pages display evidence in Phase20-4 planning input."
    },
    {
      id: "P20-3-RESULT-002",
      target_name: "iPhone display result capture",
      device_type: "iphone",
      previous_status: "pending",
      result_capture_status: "pending_result_capture",
      manual_check_required: true,
      evidence_required: true,
      evidence_status: "missing",
      closure_decision: "pending_evidence",
      closure_ready: false,
      pending_reason: "iphone_manual_display_evidence_not_captured",
      confirmed_result: "not_captured",
      next_action: "Capture iPhone viewport and tap evidence before closure."
    },
    {
      id: "P20-3-RESULT-003",
      target_name: "iPad display result capture",
      device_type: "ipad",
      previous_status: "deferred",
      result_capture_status: "deferred_result_capture",
      manual_check_required: true,
      evidence_required: true,
      evidence_status: "deferred",
      closure_decision: "deferred_no_block",
      closure_ready: false,
      deferred_reason: "ipad_device_not_currently_available",
      confirmed_result: "deferred_not_captured",
      next_action: "Keep iPad result capture deferred without converting it to confirmed."
    },
    {
      id: "P20-3-RESULT-004",
      target_name: "PC browser display result capture",
      device_type: "pc_browser",
      previous_status: "confirmed_or_pending_plan",
      result_capture_status: "pending_or_confirmed_result_capture",
      manual_check_required: true,
      evidence_required: true,
      evidence_status: "missing",
      closure_decision: "pending_evidence",
      closure_ready: false,
      pending_reason: "pc_browser_manual_capture_not_recorded",
      confirmed_result: "not_captured",
      next_action: "Record PC browser evidence before final release readiness closure."
    },
    {
      id: "P20-3-RESULT-005",
      target_name: "private-local display result capture",
      device_type: "private_local",
      previous_status: "confirmed_or_pending_plan",
      result_capture_status: "pending_or_confirmed_result_capture",
      manual_check_required: true,
      evidence_required: true,
      evidence_status: "missing",
      closure_decision: "pending_evidence",
      closure_ready: false,
      pending_reason: "private_local_manual_capture_not_recorded",
      confirmed_result: "not_captured",
      next_action: "Record private-local display evidence before closure."
    },
    {
      id: "P20-3-RESULT-006",
      target_name: "Release Planning Governance closure result",
      device_type: "governance",
      previous_status: "plan_only_confirmed",
      result_capture_status: "plan_only_closure_confirmed",
      manual_check_required: false,
      evidence_required: false,
      evidence_status: "plan_only_confirmed",
      closure_decision: "plan_only_confirmed",
      closure_ready: false,
      pending_reason: "",
      confirmed_result: "governance_constraints_confirmed",
      next_action: "Continue PLAN_ONLY governance into Phase20-4 readiness summary."
    }
  ];

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

  function countStatus(records, status) {
    return records.filter((record) => record.result_capture_status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_3_panel: index.includes('id="phase20-3-mobile-verification-result-capture-closure-plan-builder"') && index.includes('<script src="phase20-3-mobile-verification-result-capture-closure-plan-builder.js"></script>'),
      private_local_phase20_3_card: privateLocal.includes('href="index.html#phase20-3-mobile-verification-result-capture-closure-plan-builder"'),
      readme_phase20_3_section: readme.includes("Phase20-3 Mobile Verification Result Capture and Closure Plan"),
      phase19_16_link_retained: index.includes('id="phase19-final-validation-closure-report-builder"'),
      phase20_link_retained: index.includes('id="phase20-post-closure-device-validation-release-planning-builder"'),
      phase20_1_link_retained: index.includes('id="phase20-1-post-closure-device-validation-checklist-builder"'),
      phase20_2_link_retained: index.includes('id="phase20-2-github-pages-mobile-display-verification-plan-builder"') && privateLocal.includes('href="index.html#phase20-2-github-pages-mobile-display-verification-plan-builder"')
    };
  }

  function createResultRecord(blueprint, context = {}) {
    return {
      ...blueprint,
      source_verification_plan_id: context.verificationPlanId || "unknown",
      source_checklist_ready: context.checklistReady === true,
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_real_github_pages_connection", "no_device_auto_check", "no_auto_result_capture", "no_auto_confirmed_conversion", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildMobileVerificationResultCaptureClosurePlan(sources = {}, now = () => new Date()) {
    const verificationDb = sources.verificationDb || {};
    const verificationSummaryDb = sources.verificationSummary || {};
    const verificationSummary = verificationSummaryDb.phase20_2_summary || {};
    const textSources = sources.textSources || {};
    const records = RESULT_BLUEPRINTS.map((blueprint) => createResultRecord(blueprint, { verificationPlanId: verificationSummaryDb.verification_plan_id || verificationDb.verification_plan_id, checklistReady: verificationSummary.checklist_ready }));
    const unsafeFlagsCount = (verificationSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(verificationDb, verificationSummaryDb) ? 1 : 0);
    const blockedItemsCount = records.filter((record) => record.result_capture_status === "blocked").length;
    const summaryAlignmentOk = records.length === RESULT_BLUEPRINTS.length;
    const capturedResultsCount = countStatus(records, "plan_only_closure_confirmed");
    const pendingResultCount = countStatus(records, "pending_result_capture") + countStatus(records, "pending_or_confirmed_result_capture");
    const deferredResultCount = countStatus(records, "deferred_result_capture");
    const uiReadmeChecks = assessUiAndReadme(textSources);
    const generatedAt = now();
    return {
      phase: PHASE,
      result_capture_plan_id: `P20-3-RESULT-CAPTURE-CLOSURE-${generatedAt.getTime()}`,
      result_capture_plan_status: CAPTURE_PLAN_STATUS,
      source_verification_plan_status: verificationDb.verification_plan_status || verificationSummaryDb.verification_plan_status || "unknown",
      source_checklist_ready: verificationSummary.checklist_ready === true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_3_summary: {
        total_result_targets: records.length,
        captured_results_count: capturedResultsCount,
        pending_result_count: pendingResultCount,
        deferred_result_count: deferredResultCount,
        pending_or_confirmed_result_count: countStatus(records, "pending_or_confirmed_result_capture"),
        plan_only_confirmed_count: countStatus(records, "plan_only_closure_confirmed"),
        blocked_items_count: blockedItemsCount,
        unsafe_flags_count: unsafeFlagsCount,
        checklist_ready: verificationSummary.checklist_ready === true && unsafeFlagsCount === 0 && blockedItemsCount === 0 && summaryAlignmentOk,
        closure_ready: false,
        final_release_ready: false,
        protected_mode: true,
        plan_only: true,
        execution_allowed: false,
        auto_execution_allowed: false,
        external_connection_allowed: false,
        summary_alignment_ok: summaryAlignmentOk,
        ui_readme_checks: uiReadmeChecks,
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
      verificationDb: options.verificationDb || databases["phase20-2-github-pages-mobile-display-verification-plan-db.json"],
      verificationSummary: options.verificationSummary || databases["phase20-2-github-pages-mobile-display-verification-plan-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistResultCapturePlan(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderResultCapturePlan(plan, doc = document) {
    const summary = plan.phase20_3_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-3-plan-status", plan.result_capture_plan_status);
    set("#phase20-3-total-targets", summary.total_result_targets);
    set("#phase20-3-captured-results", summary.captured_results_count);
    set("#phase20-3-pending-results", summary.pending_result_count);
    set("#phase20-3-deferred-results", summary.deferred_result_count);
    set("#phase20-3-closure-ready", summary.closure_ready);
    set("#phase20-3-final-release-ready", summary.final_release_ready);
    set("#phase20-3-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-3-blocked-items", summary.blocked_items_count);
    set("#phase20-3-next-step", summary.next_recommended_step);
    set("#phase20-3-updated", plan.generated_at);
    const list = doc.querySelector("#phase20-3-mobile-verification-result-capture-closure-plan-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-3-mobile-verification-result-capture-closure-plan-item status-${item.result_capture_status}`;
        row.textContent = `${item.id} / ${item.target_name} / ${item.result_capture_status} / closure:${item.closure_ready}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runMobileVerificationResultCaptureClosurePlan(options = {}) {
    const plan = buildMobileVerificationResultCaptureClosurePlan(await loadSources(options));
    persistResultCapturePlan(plan, options.storage || window.localStorage);
    return renderResultCapturePlan(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-3-mobile-verification-result-capture-closure-plan");
      if (button) button.addEventListener("click", () => runMobileVerificationResultCaptureClosurePlan().catch(() => undefined));
      runMobileVerificationResultCaptureClosurePlan().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, CAPTURE_PLAN_STATUS, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, RESULT_STATUSES, CLOSURE_DECISIONS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, RESULT_BLUEPRINTS, hasUnsafeFlags, countStatus, assessUiAndReadme, createResultRecord, buildMobileVerificationResultCaptureClosurePlan, loadJson, loadText, loadSources, persistResultCapturePlan, renderResultCapturePlan, runMobileVerificationResultCaptureClosurePlan };
});
