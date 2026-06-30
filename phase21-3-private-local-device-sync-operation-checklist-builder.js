(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase213PrivateLocalDeviceSyncOperationChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-3";
  const CHECKLIST_NAME = "Private Local Device Sync Operation Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_3_private_local_device_sync_operation_checklist_plan_only";
  const DEVICE_SYNC_STATUS = "DEVICE_SYNC_OPERATION_REVIEW_READY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_1_PREREQUISITE = "READY_FOR_PRIVATE_LOCAL_PLANNING";
  const PHASE21_2_PREREQUISITE = "CONTINUITY_CONFIRMED_PLAN_ONLY";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Review iPad, home PC, and company PC local operation notes before the next Phase21 checklist";
  const DEVICE_CHECKS = [
    { id: "P21-3-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", device: "all", status: "Confirmed" },
    { id: "P21-3-P21-1-GATE", label: "Phase21-1 Start Gate display and route preserved", device: "all", status: "Confirmed" },
    { id: "P21-3-P21-2-CHECKLIST", label: "Phase21-2 Continuity Checklist display and route preserved", device: "all", status: "Confirmed" },
    { id: "P21-3-IPAD", label: "iPad private local operation confirmation recorded as manual review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-3-HOME-PC", label: "Home PC private local operation confirmation recorded as manual review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-3-COMPANY-PC", label: "Company PC private local operation confirmation recorded as manual review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-3-DEVICE-SYNC", label: "Device sync uses local checklist notes only", device: "all", status: "Confirmed" },
    { id: "P21-3-DISPLAY-ROUTES", label: "index.html and private-local.html display routes remain local", device: "all", status: "Confirmed" },
    { id: "P21-3-PRIVATE", label: "Private repository premise maintained", device: "all", status: "Confirmed" },
    { id: "P21-3-LOCAL", label: "Local-first operation maintained", device: "all", status: "Confirmed" },
    { id: "P21-3-PLAN", label: "PLAN_ONLY policy maintained", device: "all", status: "Confirmed" },
    { id: "P21-3-PROTECTED", label: "Protected policy maintained", device: "all", status: "Confirmed" },
    { id: "P21-3-NO-PAGES", label: "GitHub Pages publishing not introduced", device: "all", status: "Blocked" },
    { id: "P21-3-NO-PUBLIC-URL", label: "Public URL guidance not introduced", device: "all", status: "Blocked" },
    { id: "P21-3-NO-EXTERNAL-API", label: "External API connection not introduced", device: "all", status: "Blocked" },
    { id: "P21-3-NO-AUTO", label: "Automatic execution not introduced", device: "all", status: "Blocked" },
    { id: "P21-3-NO-MERGE", label: "Merge remains blocked until draft PR review", device: "all", status: "Blocked" }
  ];
  const OUT_OF_SCOPE_OPERATIONS = [
    "public_publish",
    "github_pages_publish",
    "github_pages_setting_change",
    "public_url_guidance",
    "external_sharing",
    "external_connection",
    "external_api_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "auto_merge",
    "merge",
    "main_direct_push"
  ];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
    "merge",
    "ready_for_review_pr",
    "public_publish",
    "github_pages_publish",
    "github_pages_setting_change",
    "public_url_guidance",
    "external_connection",
    "external_api_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "repository_visibility_change"
  ];
  const ALLOWED_ACTIONS = ["checklist", "plan", "manual_review", "validate", "audit", "report", "local_launch", "dashboard_view", "draft_pr"];

  function policyFields() {
    return {
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      protected_mode: true,
      plan_only: true,
      unsafe_guard: true,
      checklist_audit_display_only: true,
      device_sync_review_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase21_2_prerequisite: PHASE21_2_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_2_continuity_checklist_preserved: true,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      public_release_ready: false,
      external_connection: false,
      external_connection_allowed: false,
      external_api_connection: false,
      external_api_connection_allowed: false,
      external_api_submission_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      billing_integration_allowed: false,
      repository_visibility_change_allowed: false,
      direct_push_to_main_allowed: false,
      merge_allowed: false,
      draft_pr_required: true,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
  }

  function buildDeviceRecord(item) {
    return {
      ...item,
      device_sync_review_status: item.status === "Blocked" ? "blocked_by_device_sync_policy" : item.status === "ManualReviewRequired" ? "pending_manual_device_confirmation" : "device_sync_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalDeviceSyncOperationChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = DEVICE_CHECKS.map(buildDeviceRecord);
    const summary = {
      total_device_checks: records.length,
      confirmed_device_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_device_checks: records.filter((record) => record.status === "Blocked").length,
      device_sync_status: DEVICE_SYNC_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      device_sync_review_only: true,
      ipad_operation_confirmation_required: true,
      home_pc_operation_confirmation_required: true,
      company_pc_operation_confirmation_required: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase21_2_prerequisite: PHASE21_2_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_2_continuity_checklist_preserved: true,
      phase21_3_route_added: true,
      readme_updated: true,
      json_syntax_check_required: true,
      javascript_syntax_check_required: true,
      new_test_added: true,
      phase21_related_tests_required: true,
      phase20_related_tests_required: true,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      external_connection: false,
      external_api_connection: false,
      external_api_submission_allowed: false,
      auto_execution: false,
      auto_publish: false,
      auto_launch: false,
      billing_integration_allowed: false,
      repository_visibility_change_allowed: false,
      direct_push_to_main_allowed: false,
      merge_allowed: false,
      draft_pr_required: true,
      unsafe_flags: 0,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      blocked_actions: [...BLOCKED_ACTIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      checklist_name: CHECKLIST_NAME,
      panel_id: `PHASE21-3-DEVICE-SYNC-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      device_sync_status: DEVICE_SYNC_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_3_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalDeviceSyncOperationChecklist(options = {}) {
    return buildPrivateLocalDeviceSyncOperationChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalDeviceSyncOperationChecklist(panel, doc = document) {
    const summary = panel.phase21_3_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-3-panel-status", panel.panel_status);
    set("#phase21-3-device-sync-status", panel.device_sync_status);
    set("#phase21-3-total-checks", summary.total_device_checks);
    set("#phase21-3-confirmed-checks", summary.confirmed_device_checks);
    set("#phase21-3-manual-checks", summary.manual_review_required_checks);
    set("#phase21-3-blocked-checks", summary.blocked_device_checks);
    set("#phase21-3-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-3-phase21-1-preserved", summary.phase21_1_start_gate_preserved);
    set("#phase21-3-phase21-2-preserved", summary.phase21_2_continuity_checklist_preserved);
    set("#phase21-3-ipad", summary.ipad_operation_confirmation_required);
    set("#phase21-3-home-pc", summary.home_pc_operation_confirmation_required);
    set("#phase21-3-company-pc", summary.company_pc_operation_confirmation_required);
    set("#phase21-3-local-first", summary.local_first_operation);
    set("#phase21-3-plan-only", summary.plan_only);
    set("#phase21-3-protected", summary.protected_mode);
    set("#phase21-3-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-3-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-3-no-external-api", summary.external_api_connection);
    set("#phase21-3-no-auto", summary.auto_execution);
    set("#phase21-3-merge", summary.merge_allowed);
    set("#phase21-3-unsafe-flags", summary.unsafe_flags);
    set("#phase21-3-next-step", summary.next_recommended_step);
    set("#phase21-3-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-3-private-local-device-sync-operation-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-3-private-local-device-sync-operation-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / device:${record.device} / ${record.status} / ${record.device_sync_review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalDeviceSyncOperationChecklist(panel, storage) {
    if (storage) storage.setItem("phase213PrivateLocalDeviceSyncOperationChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalDeviceSyncOperationChecklist(options = {}) {
    const panel = runPrivateLocalDeviceSyncOperationChecklist(options);
    persistPrivateLocalDeviceSyncOperationChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalDeviceSyncOperationChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-3-private-local-device-sync-operation-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalDeviceSyncOperationChecklist());
      if (document.querySelector("#phase21-3-private-local-device-sync-operation-checklist-builder")) runAndRenderPrivateLocalDeviceSyncOperationChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    DEVICE_SYNC_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_1_PREREQUISITE,
    PHASE21_2_PREREQUISITE,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    DEVICE_CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalDeviceSyncOperationChecklist,
    runPrivateLocalDeviceSyncOperationChecklist,
    renderPrivateLocalDeviceSyncOperationChecklist,
    persistPrivateLocalDeviceSyncOperationChecklist,
    runAndRenderPrivateLocalDeviceSyncOperationChecklist
  };
});
