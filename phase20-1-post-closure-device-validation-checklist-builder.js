(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase201PostClosureDeviceValidationChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-1";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "676a8fefcd4805d0680a6091784f3fc48280e096";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const NEXT_RECOMMENDED_STEP = "Phase20-2 GitHub Pages and Mobile Display Verification Plan";
  const CHECKLIST_STATUS = "post_closure_device_validation_checklist_plan_only";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const CHECKLIST_ITEM_STATUSES = ["confirmed_or_ready", "deferred", "pending", "plan_only", "blocked"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-1-post-closure-device-validation-checklist-db.json", "phase20-1-post-closure-device-validation-checklist-summary-db.json"];
  const SOURCE_ASSETS = ["phase20-post-closure-device-validation-release-planning-db.json", "phase20-post-closure-device-validation-release-planning-summary-db.json", "index.html", "private-local.html", "README.md"];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase201PostClosureDeviceValidationChecklistLatest";

  const CHECKLIST_BLUEPRINTS = [
    {
      checklist_id: "P20-1-CHECKLIST-001",
      checklist_name: "PC Local Display Checklist",
      device_target: "pc",
      status: "confirmed_or_ready",
      check_items: ["index.html Phase20 panel visible", "private-local.html Phase20 card visible", "local HTTP display works", "unsafe flags remain zero"]
    },
    {
      checklist_id: "P20-1-CHECKLIST-002",
      checklist_name: "iPad Deferred Checklist",
      device_target: "ipad",
      status: "deferred",
      check_items: ["iPad device not currently available", "keep deferred without blocking checklist_ready", "future viewport check required", "future touch navigation check required"]
    },
    {
      checklist_id: "P20-1-CHECKLIST-003",
      checklist_name: "iPhone Pending Checklist",
      device_target: "iphone",
      status: "pending",
      check_items: ["iPhone viewport check pending", "One Tap Menu mobile layout pending", "text wrapping check pending", "button tap area check pending"]
    },
    {
      checklist_id: "P20-1-CHECKLIST-004",
      checklist_name: "GitHub Pages Pending Checklist",
      device_target: "github_pages",
      status: "pending",
      check_items: ["Pages URL display check pending", "static JS/CSS load check pending", "JSON fetch path check pending", "console error check pending"]
    },
    {
      checklist_id: "P20-1-CHECKLIST-005",
      checklist_name: "private-local One Tap Menu Checklist",
      device_target: "private_local",
      status: "confirmed_or_ready",
      check_items: ["Phase20 card visible", "Phase20-1 card visible", "previous Phase19 links retained", "local operator launch path retained"]
    },
    {
      checklist_id: "P20-1-CHECKLIST-006",
      checklist_name: "Release Planning Governance Checklist",
      device_target: "release_planning_governance",
      status: "plan_only",
      check_items: ["no release execution authority", "no external connection authority", "no auto execution authority", "next phase remains verification planning only"]
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
    return records.filter((record) => record.status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_1_panel: index.includes('id="phase20-1-post-closure-device-validation-checklist-builder"') && index.includes('<script src="phase20-1-post-closure-device-validation-checklist-builder.js"></script>'),
      private_local_phase20_1_card: privateLocal.includes('href="index.html#phase20-1-post-closure-device-validation-checklist-builder"'),
      readme_phase20_1_section: readme.includes("Phase20-1 Post-Closure Device Validation Checklist"),
      phase20_link_retained: index.includes('id="phase20-post-closure-device-validation-release-planning-builder"') && privateLocal.includes('href="index.html#phase20-post-closure-device-validation-release-planning-builder"')
    };
  }

  function createChecklistRecord(blueprint, context = {}) {
    return {
      ...blueprint,
      source_phase20_planning_id: context.planningId || "unknown",
      source_device_validation_ready: context.deviceValidationReady === true,
      blocked_reasons: [],
      deferred_reasons: blueprint.status === "deferred" ? ["device_not_available_kept_as_follow_up"] : [],
      pending_reasons: blueprint.status === "pending" ? ["verification_pending_kept_as_plan_only_item"] : [],
      checklist_policy: blueprint.status === "deferred" ? "deferred_does_not_block_checklist_ready" : blueprint.status === "pending" ? "pending_verification_planned_without_execution" : "plan_only_checklist_item",
      safety_constraints: ["PLAN_ONLY", "Official Release v2.8 protected", "protected_mode=true", "execution_allowed=false", "auto_execution_allowed=false", "external_connection_allowed=false", "no_external_connection", "no_auto_execution", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"],
      recommended_next_step: blueprint.status === "deferred" ? "Recommended: keep the iPad checklist deferred and carry it to Phase20-2 planning." : "Recommended: keep this checklist item in verification planning only.",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildPostClosureDeviceValidationChecklist(sources = {}, now = () => new Date()) {
    const phase20Plan = sources.phase20Plan || {};
    const phase20SummaryDb = sources.phase20Summary || {};
    const textSources = sources.textSources || {};
    const phase20Summary = phase20SummaryDb.phase20_summary || {};
    const records = CHECKLIST_BLUEPRINTS.map((blueprint) => createChecklistRecord(blueprint, { planningId: phase20SummaryDb.planning_id || phase20Plan.planning_id, deviceValidationReady: phase20Summary.device_validation_ready }));
    const unsafeFlagsCount = (phase20Summary.unsafe_flags_count || 0) + (hasUnsafeFlags(phase20Plan, phase20SummaryDb) ? 1 : 0);
    const blockedItemsCount = countStatus(records, "blocked");
    const summaryAlignmentOk = records.length === CHECKLIST_BLUEPRINTS.length;
    const checklistReady = phase20Summary.device_validation_ready === true && unsafeFlagsCount === 0 && blockedItemsCount === 0 && summaryAlignmentOk;
    const uiReadmeChecks = assessUiAndReadme(textSources);
    const generatedAt = now();
    return {
      phase: PHASE,
      checklist_id: `P20-1-POST-CLOSURE-DEVICE-CHECKLIST-${generatedAt.getTime()}`,
      checklist_status: CHECKLIST_STATUS,
      source_phase20_status: phase20Plan.phase20_status || "unknown",
      source_device_validation_ready: phase20Summary.device_validation_ready === true,
      source_ipad_validation_status: phase20Summary.ipad_validation_status || "unknown",
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_1_summary: {
        total_checklist_items: records.length,
        confirmed_items_count: countStatus(records, "confirmed_or_ready"),
        deferred_items_count: countStatus(records, "deferred"),
        pending_items_count: countStatus(records, "pending"),
        plan_only_items_count: countStatus(records, "plan_only"),
        blocked_items_count: blockedItemsCount,
        unsafe_flags_count: unsafeFlagsCount,
        checklist_ready: checklistReady,
        checklist_status: CHECKLIST_STATUS,
        protected_mode: true,
        plan_only: true,
        execution_allowed: false,
        auto_execution_allowed: false,
        external_connection_allowed: false,
        ipad_validation_status: "deferred",
        iphone_validation_status: "pending",
        github_pages_validation_status: "pending",
        ipad_deferred_blocks_checklist_ready: false,
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
      phase20Plan: options.phase20Plan || databases["phase20-post-closure-device-validation-release-planning-db.json"],
      phase20Summary: options.phase20Summary || databases["phase20-post-closure-device-validation-release-planning-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistChecklist(checklist, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(checklist)); return checklist; }

  function renderChecklist(checklist, doc = document) {
    const summary = checklist.phase20_1_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-1-checklist-status", checklist.checklist_status);
    set("#phase20-1-checklist-ready", summary.checklist_ready);
    set("#phase20-1-total-checklist-items", summary.total_checklist_items);
    set("#phase20-1-confirmed-items", summary.confirmed_items_count);
    set("#phase20-1-deferred-items", summary.deferred_items_count);
    set("#phase20-1-pending-items", summary.pending_items_count);
    set("#phase20-1-blocked-items", summary.blocked_items_count);
    set("#phase20-1-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-1-protected-mode", summary.protected_mode);
    set("#phase20-1-next-step", summary.next_recommended_step);
    set("#phase20-1-updated", checklist.generated_at);
    const list = doc.querySelector("#phase20-1-post-closure-device-validation-checklist-list");
    if (list) {
      list.textContent = "";
      checklist.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-1-post-closure-device-validation-checklist-item status-${item.status}`;
        row.textContent = `${item.checklist_id} / ${item.checklist_name} / ${item.status} / checks:${item.check_items.length}`;
        list.appendChild(row);
      });
    }
    return checklist;
  }

  async function runPostClosureDeviceValidationChecklist(options = {}) {
    const checklist = buildPostClosureDeviceValidationChecklist(await loadSources(options));
    persistChecklist(checklist, options.storage || window.localStorage);
    return renderChecklist(checklist, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-1-post-closure-device-validation-checklist");
      if (button) button.addEventListener("click", () => runPostClosureDeviceValidationChecklist().catch(() => undefined));
      runPostClosureDeviceValidationChecklist().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, NEXT_RECOMMENDED_STEP, CHECKLIST_STATUS, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, CHECKLIST_ITEM_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, CHECKLIST_BLUEPRINTS, hasUnsafeFlags, countStatus, assessUiAndReadme, createChecklistRecord, buildPostClosureDeviceValidationChecklist, loadJson, loadText, loadSources, persistChecklist, renderChecklist, runPostClosureDeviceValidationChecklist };
});
