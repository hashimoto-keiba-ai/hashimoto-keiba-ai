(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase202GithubPagesMobileDisplayVerificationPlanBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-2";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "8d0fa2f0ea78b6718d879f2a93aca76174199a97";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PLAN_STATUS = "github_pages_mobile_display_verification_plan_only";
  const NEXT_RECOMMENDED_STEP = "Phase20-3 Mobile Verification Result Capture and Closure Plan";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const VERIFICATION_STATUSES = ["pending", "deferred", "confirmed_or_pending_plan", "plan_only_confirmed", "protected"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-2-github-pages-mobile-display-verification-plan-db.json", "phase20-2-github-pages-mobile-display-verification-plan-summary-db.json"];
  const SOURCE_ASSETS = ["phase20-1-post-closure-device-validation-checklist-db.json", "phase20-1-post-closure-device-validation-checklist-summary-db.json", "index.html", "private-local.html", "README.md"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase202GithubPagesMobileDisplayVerificationPlanLatest";

  const VERIFICATION_BLUEPRINTS = [
    {
      id: "P20-2-VERIFY-001",
      target_name: "GitHub Pages display verification",
      device_type: "github_pages",
      verification_status: "pending",
      verification_scope: ["pages_url_display_check_plan", "static_js_css_load_check_plan", "json_fetch_path_check_plan", "console_error_check_plan"],
      manual_check_required: true,
      expected_result: "GitHub Pages display can be verified manually without automated external access.",
      pending_reason: "github_pages_display_verification_pending_manual_review",
      next_action: "Prepare manual GitHub Pages display verification steps for Phase20-3."
    },
    {
      id: "P20-2-VERIFY-002",
      target_name: "iPhone display verification",
      device_type: "iphone",
      verification_status: "pending",
      verification_scope: ["iphone_viewport_plan", "one_tap_menu_mobile_layout_plan", "text_wrapping_plan", "button_tap_area_plan"],
      manual_check_required: true,
      expected_result: "iPhone display verification remains pending until a device or approved manual capture is available.",
      pending_reason: "iphone_display_verification_pending_manual_review",
      next_action: "Carry iPhone viewport and tap-area checks into Phase20-3 capture planning."
    },
    {
      id: "P20-2-VERIFY-003",
      target_name: "iPad display verification",
      device_type: "ipad",
      verification_status: "deferred",
      verification_scope: ["ipad_viewport_plan_deferred", "touch_navigation_plan_deferred", "phase20_2_panel_future_check", "private_local_card_future_check"],
      manual_check_required: true,
      expected_result: "iPad verification stays deferred and does not block the verification plan.",
      deferred_reason: "ipad_device_not_currently_available",
      next_action: "Keep iPad verification deferred and list it in Phase20-3 capture tasks."
    },
    {
      id: "P20-2-VERIFY-004",
      target_name: "PC browser display verification",
      device_type: "pc_browser",
      verification_status: "confirmed_or_pending_plan",
      verification_scope: ["index_phase20_2_panel_plan", "local_json_reference_plan", "desktop_layout_review_plan", "console_error_manual_review_plan"],
      manual_check_required: true,
      expected_result: "PC browser display verification is ready for manual confirmation in the next capture phase.",
      pending_reason: "pc_browser_confirmation_capture_pending",
      next_action: "Record PC browser confirmation evidence during Phase20-3."
    },
    {
      id: "P20-2-VERIFY-005",
      target_name: "private-local display verification",
      device_type: "private_local",
      verification_status: "confirmed_or_pending_plan",
      verification_scope: ["private_local_phase20_2_card_plan", "one_tap_menu_route_plan", "previous_phase_links_retained_plan", "local_operator_launch_path_plan"],
      manual_check_required: true,
      expected_result: "private-local display route remains ready for manual confirmation.",
      pending_reason: "private_local_confirmation_capture_pending",
      next_action: "Record private-local display confirmation in Phase20-3."
    },
    {
      id: "P20-2-VERIFY-006",
      target_name: "Release Planning Governance verification",
      device_type: "governance",
      verification_status: "plan_only_confirmed",
      verification_scope: ["no_release_execution_authority", "no_external_connection_authority", "no_auto_execution_authority", "next_phase_capture_only"],
      manual_check_required: false,
      expected_result: "Governance remains PLAN_ONLY and protected with no execution authority.",
      pending_reason: "",
      next_action: "Continue to Phase20-3 result capture planning without enabling execution."
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
    return records.filter((record) => record.verification_status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_2_panel: index.includes('id="phase20-2-github-pages-mobile-display-verification-plan-builder"') && index.includes('<script src="phase20-2-github-pages-mobile-display-verification-plan-builder.js"></script>'),
      private_local_phase20_2_card: privateLocal.includes('href="index.html#phase20-2-github-pages-mobile-display-verification-plan-builder"'),
      readme_phase20_2_section: readme.includes("Phase20-2 GitHub Pages and Mobile Display Verification Plan"),
      phase19_16_link_retained: index.includes('id="phase19-final-validation-closure-report-builder"'),
      phase20_link_retained: index.includes('id="phase20-post-closure-device-validation-release-planning-builder"'),
      phase20_1_link_retained: index.includes('id="phase20-1-post-closure-device-validation-checklist-builder"') && privateLocal.includes('href="index.html#phase20-1-post-closure-device-validation-checklist-builder"')
    };
  }

  function createVerificationRecord(blueprint, context = {}) {
    return {
      ...blueprint,
      source_checklist_id: context.checklistId || "unknown",
      source_checklist_ready: context.checklistReady === true,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      protected_mode: true,
      plan_only: true,
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_real_github_pages_connection", "no_device_auto_check", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false
    };
  }

  function buildGithubPagesMobileDisplayVerificationPlan(sources = {}, now = () => new Date()) {
    const checklistDb = sources.checklistDb || {};
    const checklistSummaryDb = sources.checklistSummary || {};
    const checklistSummary = checklistSummaryDb.phase20_1_summary || {};
    const textSources = sources.textSources || {};
    const records = VERIFICATION_BLUEPRINTS.map((blueprint) => createVerificationRecord(blueprint, { checklistId: checklistSummaryDb.checklist_id || checklistDb.checklist_id, checklistReady: checklistSummary.checklist_ready }));
    const unsafeFlagsCount = (checklistSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(checklistDb, checklistSummaryDb) ? 1 : 0);
    const blockedItemsCount = records.filter((record) => record.verification_status === "blocked").length;
    const summaryAlignmentOk = records.length === VERIFICATION_BLUEPRINTS.length;
    const checklistReady = checklistSummary.checklist_ready === true && unsafeFlagsCount === 0 && blockedItemsCount === 0 && summaryAlignmentOk;
    const uiReadmeChecks = assessUiAndReadme(textSources);
    const generatedAt = now();
    return {
      phase: PHASE,
      verification_plan_id: `P20-2-DISPLAY-VERIFICATION-${generatedAt.getTime()}`,
      verification_plan_status: PLAN_STATUS,
      source_checklist_status: checklistDb.checklist_status || checklistSummaryDb.checklist_status || "unknown",
      source_checklist_ready: checklistSummary.checklist_ready === true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_2_summary: {
        total_verification_targets: records.length,
        github_pages_status: "pending",
        iphone_status: "pending",
        ipad_status: "deferred",
        pc_browser_status: "confirmed_or_pending_plan",
        private_local_status: "confirmed_or_pending_plan",
        governance_status: "plan_only_confirmed",
        pending_items_count: countStatus(records, "pending"),
        deferred_items_count: countStatus(records, "deferred"),
        confirmed_or_pending_plan_count: countStatus(records, "confirmed_or_pending_plan"),
        plan_only_confirmed_count: countStatus(records, "plan_only_confirmed"),
        blocked_items_count: blockedItemsCount,
        unsafe_flags_count: unsafeFlagsCount,
        checklist_ready: checklistReady,
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
      checklistDb: options.checklistDb || databases["phase20-1-post-closure-device-validation-checklist-db.json"],
      checklistSummary: options.checklistSummary || databases["phase20-1-post-closure-device-validation-checklist-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistVerificationPlan(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderVerificationPlan(plan, doc = document) {
    const summary = plan.phase20_2_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-2-plan-status", plan.verification_plan_status);
    set("#phase20-2-total-targets", summary.total_verification_targets);
    set("#phase20-2-github-pages-status", summary.github_pages_status);
    set("#phase20-2-iphone-status", summary.iphone_status);
    set("#phase20-2-ipad-status", summary.ipad_status);
    set("#phase20-2-pc-status", summary.pc_browser_status);
    set("#phase20-2-private-local-status", summary.private_local_status);
    set("#phase20-2-governance-status", summary.governance_status);
    set("#phase20-2-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-2-blocked-items", summary.blocked_items_count);
    set("#phase20-2-next-step", summary.next_recommended_step);
    set("#phase20-2-updated", plan.generated_at);
    const list = doc.querySelector("#phase20-2-github-pages-mobile-display-verification-plan-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-2-github-pages-mobile-display-verification-plan-item status-${item.verification_status}`;
        row.textContent = `${item.id} / ${item.target_name} / ${item.verification_status} / manual:${item.manual_check_required}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runGithubPagesMobileDisplayVerificationPlan(options = {}) {
    const plan = buildGithubPagesMobileDisplayVerificationPlan(await loadSources(options));
    persistVerificationPlan(plan, options.storage || window.localStorage);
    return renderVerificationPlan(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-2-github-pages-mobile-display-verification-plan");
      if (button) button.addEventListener("click", () => runGithubPagesMobileDisplayVerificationPlan().catch(() => undefined));
      runGithubPagesMobileDisplayVerificationPlan().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, PLAN_STATUS, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, VERIFICATION_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, VERIFICATION_BLUEPRINTS, hasUnsafeFlags, countStatus, assessUiAndReadme, createVerificationRecord, buildGithubPagesMobileDisplayVerificationPlan, loadJson, loadText, loadSources, persistVerificationPlan, renderVerificationPlan, runGithubPagesMobileDisplayVerificationPlan };
});
