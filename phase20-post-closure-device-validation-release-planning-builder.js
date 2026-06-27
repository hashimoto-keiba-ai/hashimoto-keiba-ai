(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase20PostClosureDeviceValidationReleasePlanningBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "2c25ac5543fa3d106a4d6015c3c9f17a3c909dc5";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const NEXT_RECOMMENDED_STEP = "Phase20-1 Post-Closure Device Validation Checklist";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const DEVICE_STATUSES = ["confirmed_or_ready", "deferred", "pending", "plan_only", "protected_only"];
  const PLAN_STATUSES = ["device_validation_ready", "device_validation_deferred", "device_validation_pending", "release_planning_plan_only", "protected_only"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-post-closure-device-validation-release-planning-db.json", "phase20-post-closure-device-validation-release-planning-summary-db.json"];
  const SOURCE_ASSETS = ["phase19-final-validation-closure-report-db.json", "phase19-final-validation-closure-report-summary-db.json", "index.html", "private-local.html", "README.md"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase20PostClosureDeviceValidationReleasePlanningLatest";

  const DEVICE_BLUEPRINTS = [
    {
      device_plan_id: "P20-DEVICE-001",
      node_name: "PC Local Validation Node",
      device_target: "pc",
      validation_status: "confirmed_or_ready",
      plan_status: "device_validation_ready",
      validation_scope: ["index_html_local_display", "phase19_16_closure_panel", "phase20_panel_visibility", "local_json_reference"],
      release_scope: ["local_readiness_evidence", "release_note_candidate"]
    },
    {
      device_plan_id: "P20-DEVICE-002",
      node_name: "iPad Deferred Validation Node",
      device_target: "ipad",
      validation_status: "deferred",
      plan_status: "device_validation_deferred",
      validation_scope: ["ipad_viewport_check_deferred", "touch_navigation_check_deferred", "phase20_panel_future_check"],
      release_scope: ["post_closure_device_task"]
    },
    {
      device_plan_id: "P20-DEVICE-003",
      node_name: "iPhone Pending Validation Node",
      device_target: "iphone",
      validation_status: "pending",
      plan_status: "device_validation_pending",
      validation_scope: ["iphone_viewport_check_pending", "one_tap_menu_mobile_check_pending", "responsive_text_check_pending"],
      release_scope: ["mobile_validation_queue"]
    },
    {
      device_plan_id: "P20-DEVICE-004",
      node_name: "GitHub Pages Validation Node",
      device_target: "github_pages",
      validation_status: "pending",
      plan_status: "device_validation_pending",
      validation_scope: ["github_pages_static_asset_check_pending", "json_fetch_path_check_pending", "console_error_check_pending"],
      release_scope: ["public_static_review_plan"]
    },
    {
      device_plan_id: "P20-DEVICE-005",
      node_name: "private-local One Tap Menu Validation Node",
      device_target: "private_local",
      validation_status: "confirmed_or_ready",
      plan_status: "device_validation_ready",
      validation_scope: ["private_local_menu_route", "phase20_card_visibility", "phase19_routes_retained"],
      release_scope: ["local_operator_launch_path"]
    },
    {
      device_plan_id: "P20-DEVICE-006",
      node_name: "Release Planning Governance Node",
      device_target: "release_planning",
      validation_status: "plan_only",
      plan_status: "release_planning_plan_only",
      validation_scope: ["closure_ready_confirmed", "unsafe_flags_zero_confirmed", "protected_mode_confirmed", "plan_only_release_steps"],
      release_scope: ["phase20_1_checklist_preparation", "no_release_execution_authority"]
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

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_panel: index.includes('id="phase20-post-closure-device-validation-release-planning-builder"') && index.includes('<script src="phase20-post-closure-device-validation-release-planning-builder.js"></script>'),
      private_local_phase20_card: privateLocal.includes('href="index.html#phase20-post-closure-device-validation-release-planning-builder"'),
      readme_phase20_section: readme.includes("Phase20 Global Network Post-Closure Device Validation and Release Planning"),
      phase19_16_link_retained: index.includes('id="phase19-final-validation-closure-report-builder"') && privateLocal.includes('href="index.html#phase19-final-validation-closure-report-builder"')
    };
  }

  function createDevicePlanRecord(blueprint, context = {}) {
    const deferredWithoutBlocking = blueprint.device_target === "ipad" && blueprint.validation_status === "deferred";
    return {
      ...blueprint,
      source_closure_report_id: context.closureReportId || "unknown",
      source_closure_ready: context.closureReady === true,
      device_validation_ready: blueprint.device_target === "ipad" ? true : ["confirmed_or_ready", "pending", "plan_only"].includes(blueprint.validation_status),
      release_planning_status: "plan_only",
      deferred_reason: deferredWithoutBlocking ? "device_not_available_ipad_validation_deferred" : "",
      blocked_reason: "",
      validation_policy: deferredWithoutBlocking ? "deferred_device_validation_does_not_block_release_planning" : "plan_only_device_validation",
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_real_connection", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      recommended_next_step: deferredWithoutBlocking ? "Recommended: keep iPad validation deferred and include it in the Phase20-1 checklist." : "Recommended: record device validation evidence in the Phase20-1 checklist.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildPostClosureDeviceValidationReleasePlanning(sources = {}, now = () => new Date()) {
    const closureReport = sources.closureReport || {};
    const closureSummaryDb = sources.closureSummary || {};
    const textSources = sources.textSources || {};
    const closureSummary = closureSummaryDb.final_validation_closure_summary || {};
    const uiReadmeChecks = assessUiAndReadme(textSources);
    const unsafeFlagsCount = (closureSummary.unsafe_flags_count || 0) + (hasUnsafeFlags(closureReport, closureSummaryDb) ? 1 : 0);
    const closureReady = closureSummary.final_validation_closed === true && closureSummary.closure_ready === true && closureSummary.ipad_validation_status === "deferred";
    const deviceValidationReady = closureReady && unsafeFlagsCount === 0;
    const generatedAt = now();
    const records = DEVICE_BLUEPRINTS.map((blueprint) => createDevicePlanRecord(blueprint, { closureReportId: closureSummaryDb.closure_report_id || closureReport.closure_report_id, closureReady }));
    const summary = {
      total: records.length,
      device_validation_ready: deviceValidationReady,
      pc_validation_status: "confirmed_or_ready",
      ipad_validation_status: "deferred",
      iphone_validation_status: "pending",
      github_pages_validation_status: "pending",
      private_local_validation_status: "confirmed_or_ready",
      release_planning_status: "plan_only",
      unsafe_flags_count: unsafeFlagsCount,
      external_connection_allowed: false,
      auto_execution_allowed: false,
      execution_allowed: false,
      protected_mode: true,
      plan_only: true,
      ipad_deferred_blocks_release_planning: false,
      closure_ready_source_ok: closureReady,
      ui_readme_checks: uiReadmeChecks,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      planning_id: `P20-POST-CLOSURE-DEVICE-VALIDATION-${generatedAt.getTime()}`,
      phase20_status: deviceValidationReady ? "post_closure_device_validation_release_planning_plan_only" : "post_closure_device_validation_release_planning_hold",
      source_closure_report_status: closureReport.closure_report_status || "unknown",
      source_final_validation_closed: closureSummary.final_validation_closed === true,
      source_closure_ready: closureSummary.closure_ready === true,
      source_ipad_validation_status: closureSummary.ipad_validation_status || "unknown",
      official_release_protected: true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_summary: summary,
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
      closureReport: options.closureReport || databases["phase19-final-validation-closure-report-db.json"],
      closureSummary: options.closureSummary || databases["phase19-final-validation-closure-report-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistPlanning(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderPlanning(plan, doc = document) {
    const summary = plan.phase20_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-status", plan.phase20_status);
    set("#phase20-device-validation-ready", summary.device_validation_ready);
    set("#phase20-pc-validation", summary.pc_validation_status);
    set("#phase20-ipad-validation", summary.ipad_validation_status);
    set("#phase20-iphone-validation", summary.iphone_validation_status);
    set("#phase20-github-pages-validation", summary.github_pages_validation_status);
    set("#phase20-private-local-validation", summary.private_local_validation_status);
    set("#phase20-release-planning-status", summary.release_planning_status);
    set("#phase20-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-next-step", summary.next_recommended_step);
    set("#phase20-updated", plan.generated_at);
    const list = doc.querySelector("#phase20-post-closure-device-validation-release-planning-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-post-closure-device-validation-release-planning-item status-${item.plan_status}`;
        row.textContent = `${item.device_plan_id} / ${item.node_name} / ${item.validation_status} / ${item.release_planning_status}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runPostClosureDeviceValidationReleasePlanning(options = {}) {
    const plan = buildPostClosureDeviceValidationReleasePlanning(await loadSources(options));
    persistPlanning(plan, options.storage || window.localStorage);
    return renderPlanning(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-post-closure-device-validation-release-planning");
      if (button) button.addEventListener("click", () => runPostClosureDeviceValidationReleasePlanning().catch(() => undefined));
      runPostClosureDeviceValidationReleasePlanning().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, DEVICE_STATUSES, PLAN_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, DEVICE_BLUEPRINTS, hasUnsafeFlags, assessUiAndReadme, createDevicePlanRecord, buildPostClosureDeviceValidationReleasePlanning, loadJson, loadText, loadSources, persistPlanning, renderPlanning, runPostClosureDeviceValidationReleasePlanning };
});
