(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase207FinalManualDeviceConfirmationChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-7";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "02939f8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const CHECKLIST_STATUS = "final_manual_device_confirmation_checklist_plan_only";
  const NEXT_RECOMMENDED_STEP = "Phase20-8 Manual Confirmation Result Review and Final Closure Decision";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const AUTO_VERIFICATION_ALLOWED = false;
  const AUTO_FIX_ALLOWED = false;
  const AUTO_RELEASE_ALLOWED = false;
  const ROLLBACK_ALLOWED = false;
  const CONFIRMATION_STATUSES = ["manual_review_pending", "deferred_review", "release_gate_locked"];
  const TARGET_ORDER = ["iphone", "ipad", "pc_browser", "github_pages", "private_local", "governance"];
  const TARGET_LABELS = {
    iphone: "iPhone",
    ipad: "iPad",
    pc_browser: "PC browser",
    github_pages: "GitHub Pages",
    private_local: "private-local",
    governance: "Governance / Release Gate"
  };
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_verification", "auto_fix", "auto_release", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase20-7-final-manual-device-confirmation-checklist-db.json", "phase20-7-final-manual-device-confirmation-checklist-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase20-6-manual-evidence-review-release-gate-decision-db.json",
    "phase20-6-manual-evidence-review-release-gate-decision-summary-db.json",
    "index.html",
    "private-local.html",
    "README.md"
  ];
  const JSON_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => asset.endsWith(".json"));
  const TEXT_SOURCE_ASSETS = SOURCE_ASSETS.filter((asset) => !asset.endsWith(".json"));
  const STORAGE_KEY = "phase207FinalManualDeviceConfirmationChecklistLatest";

  function hasUnsafeFlags(...sources) {
    const keys = ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed", "execution_allowed", "connection_authority_issued", "auto_verification_allowed", "auto_fix_allowed", "auto_release_allowed", "rollback_allowed"];
    return sources.some((source) => {
      const visit = (value) => {
        if (!value || typeof value !== "object") return false;
        if (Array.isArray(value)) return value.some(visit);
        return Object.entries(value).some(([key, nested]) => (keys.includes(key) && nested === true) || visit(nested));
      };
      return visit(source);
    });
  }

  function confirmationStatusFor(deviceType) {
    if (deviceType === "ipad") return "deferred_review";
    if (deviceType === "governance") return "release_gate_locked";
    return "manual_review_pending";
  }

  function confirmationTypeFor(deviceType) {
    if (deviceType === "governance") return "release_gate_governance_confirmation";
    if (deviceType === "github_pages") return "github_pages_manual_display_confirmation";
    return `${deviceType}_manual_device_confirmation`;
  }

  function orderTargets(records = []) {
    const byDevice = Object.fromEntries(records.map((record) => [record.device_type, record]));
    return TARGET_ORDER.map((deviceType) => byDevice[deviceType] || { device_type: deviceType, target_name: TARGET_LABELS[deviceType] });
  }

  function countStatus(records, status) {
    return records.filter((record) => record.confirmation_status === status).length;
  }

  function assessUiAndReadme(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    const readme = textSources["README.md"] || "";
    return {
      index_phase20_7_panel: index.includes('id="phase20-7-final-manual-device-confirmation-checklist-builder"') && index.includes('<script src="phase20-7-final-manual-device-confirmation-checklist-builder.js"></script>'),
      private_local_phase20_7_card: privateLocal.includes('href="index.html#phase20-7-final-manual-device-confirmation-checklist-builder"'),
      readme_phase20_7_section: readme.includes("Phase20-7 Final Manual Device Confirmation Checklist"),
      phase20_6_link_retained: index.includes('id="phase20-6-manual-evidence-review-release-gate-decision-builder"') && privateLocal.includes('href="index.html#phase20-6-manual-evidence-review-release-gate-decision-builder"')
    };
  }

  function createConfirmationTarget(source, index) {
    const deviceType = source.device_type;
    const confirmationStatus = confirmationStatusFor(deviceType);
    return {
      target_id: `P20-7-CONFIRM-${String(index + 1).padStart(3, "0")}`,
      source_release_gate_id: source.id || "",
      target_name: TARGET_LABELS[deviceType],
      confirmation_type: confirmationTypeFor(deviceType),
      manual_confirmation_required: true,
      evidence_required: true,
      evidence_present: false,
      confirmation_status: confirmationStatus,
      confirmation_result: "not_confirmed",
      reviewer_action_required: confirmationStatus === "release_gate_locked" ? "review_release_gate_after_manual_device_confirmation" : confirmationStatus === "deferred_review" ? "confirm_device_availability_before_manual_review" : "perform_manual_confirmation_and_enter_evidence",
      release_gate_dependency: confirmationStatus === "release_gate_locked" ? "locked_until_all_manual_device_confirmations_are_reviewed" : "blocks_release_gate_until_manual_evidence_review",
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      auto_verification_allowed: false,
      auto_fix_allowed: false,
      auto_release_allowed: false,
      rollback_allowed: false,
      notes: confirmationStatus === "deferred_review" ? "iPad remains deferred until the device is available for human confirmation." : confirmationStatus === "release_gate_locked" ? "Release gate remains locked; this checklist does not authorize release." : "Manual confirmation and evidence entry are required; no automatic access or validation is authorized."
    };
  }

  function buildFinalManualDeviceConfirmationChecklist(sources = {}, now = () => new Date()) {
    const releaseGateDb = sources.releaseGateDb || { records: [] };
    const releaseGateSummaryDb = sources.releaseGateSummary || {};
    const phase20_6_summary = releaseGateSummaryDb.phase20_6_summary || releaseGateDb.phase20_6_summary || {};
    const textSources = sources.textSources || {};
    const records = orderTargets(releaseGateDb.records || []).map(createConfirmationTarget);
    const pendingCount = countStatus(records, "manual_review_pending");
    const deferredCount = countStatus(records, "deferred_review");
    const lockedCount = countStatus(records, "release_gate_locked");
    const evidencePresentCount = records.filter((record) => record.evidence_present === true).length;
    const confirmedCount = records.filter((record) => record.confirmation_result !== "not_confirmed").length;
    const unsafeFlagsCount = (phase20_6_summary.unsafe_flags_count || 0) + (hasUnsafeFlags(releaseGateDb, releaseGateSummaryDb) ? 1 : 0);
    const generatedAt = now();
    return {
      phase: PHASE,
      title: "Final Manual Device Confirmation Checklist",
      checklist_id: `P20-7-FINAL-MANUAL-CONFIRMATION-${generatedAt.getTime()}`,
      checklist_status: CHECKLIST_STATUS,
      source_release_gate_status: releaseGateDb.release_gate_status || releaseGateSummaryDb.release_gate_status || "unknown",
      source_release_gate_open: phase20_6_summary.release_gate_open === true,
      source_closure_ready: phase20_6_summary.closure_ready === true,
      source_final_release_ready: phase20_6_summary.final_release_ready === true,
      protected_mode: true,
      plan_only: true,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      phase20_7_summary: {
        phase: PHASE,
        title: "Final Manual Device Confirmation Checklist",
        total_confirmation_targets: records.length,
        manual_confirmation_required_count: records.filter((record) => record.manual_confirmation_required === true).length,
        evidence_required_count: records.filter((record) => record.evidence_required === true).length,
        evidence_present_count: evidencePresentCount,
        confirmed_count: confirmedCount,
        pending_count: pendingCount,
        deferred_count: deferredCount,
        locked_count: lockedCount,
        protected_mode: true,
        plan_only: true,
        execution_allowed: false,
        auto_execution_allowed: false,
        external_connection_allowed: false,
        auto_verification_allowed: false,
        auto_fix_allowed: false,
        auto_release_allowed: false,
        rollback_allowed: false,
        release_gate_open: false,
        closure_ready: false,
        final_release_ready: false,
        unsafe_flags_count: unsafeFlagsCount,
        blocked_items_count: phase20_6_summary.blocked_items_count || 0,
        summary_alignment_ok: records.length === TARGET_ORDER.length,
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
      external_connection_allowed: false,
      auto_verification_allowed: false,
      auto_fix_allowed: false,
      auto_release_allowed: false,
      rollback_allowed: false
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
      releaseGateDb: options.releaseGateDb || databases["phase20-6-manual-evidence-review-release-gate-decision-db.json"],
      releaseGateSummary: options.releaseGateSummary || databases["phase20-6-manual-evidence-review-release-gate-decision-summary-db.json"],
      textSources: options.textSources || textSources,
      databases
    };
  }

  function persistChecklist(checklist, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(checklist)); return checklist; }

  function renderChecklist(checklist, doc = document) {
    const data = checklist.phase20_7_summary;
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase20-7-checklist-status", checklist.checklist_status);
    set("#phase20-7-total-targets", data.total_confirmation_targets);
    set("#phase20-7-manual-required", data.manual_confirmation_required_count);
    set("#phase20-7-evidence-required", data.evidence_required_count);
    set("#phase20-7-evidence-present", data.evidence_present_count);
    set("#phase20-7-confirmed", data.confirmed_count);
    set("#phase20-7-pending", data.pending_count);
    set("#phase20-7-deferred", data.deferred_count);
    set("#phase20-7-locked", data.locked_count);
    set("#phase20-7-release-gate", data.release_gate_open);
    set("#phase20-7-final-release-ready", data.final_release_ready);
    set("#phase20-7-next-step", data.next_recommended_step);
    set("#phase20-7-updated", checklist.generated_at);
    const list = doc.querySelector("#phase20-7-final-manual-device-confirmation-checklist-list");
    if (list) {
      list.textContent = "";
      checklist.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase20-7-final-manual-device-confirmation-checklist-item status-${item.confirmation_status}`;
        row.textContent = `${item.target_id} / ${item.target_name} / ${item.confirmation_status} / ${item.confirmation_result}`;
        list.appendChild(row);
      });
    }
    return checklist;
  }

  async function runFinalManualDeviceConfirmationChecklist(options = {}) {
    const checklist = buildFinalManualDeviceConfirmationChecklist(await loadSources(options));
    persistChecklist(checklist, options.storage || window.localStorage);
    return renderChecklist(checklist, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-7-final-manual-device-confirmation-checklist");
      if (button) button.addEventListener("click", () => runFinalManualDeviceConfirmationChecklist().catch(() => undefined));
      runFinalManualDeviceConfirmationChecklist().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, CHECKLIST_STATUS, NEXT_RECOMMENDED_STEP, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, AUTO_VERIFICATION_ALLOWED, AUTO_FIX_ALLOWED, AUTO_RELEASE_ALLOWED, ROLLBACK_ALLOWED, CONFIRMATION_STATUSES, TARGET_ORDER, TARGET_LABELS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, JSON_SOURCE_ASSETS, TEXT_SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, confirmationStatusFor, confirmationTypeFor, orderTargets, countStatus, assessUiAndReadme, createConfirmationTarget, buildFinalManualDeviceConfirmationChecklist, loadJson, loadText, loadSources, persistChecklist, renderChecklist, runFinalManualDeviceConfirmationChecklist };
});
