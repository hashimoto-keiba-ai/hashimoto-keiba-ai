(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase214PrivateLocalDisplayRecoveryChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-4";
  const CHECKLIST_NAME = "Private Local Display Recovery Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_4_private_local_display_recovery_checklist_plan_only";
  const DISPLAY_RECOVERY_STATUS = "DISPLAY_RECOVERY_REVIEW_READY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_1_PREREQUISITE = "READY_FOR_PRIVATE_LOCAL_PLANNING";
  const PHASE21_2_PREREQUISITE = "CONTINUITY_CONFIRMED_PLAN_ONLY";
  const PHASE21_3_PREREQUISITE = "DEVICE_SYNC_OPERATION_REVIEW_READY";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Run private local display, pull-after-update, recovery, and merge-readiness checks manually before Phase21-5";
  const CHECKS = [
    { id: "P21-4-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-4-P21-1-GATE", label: "Phase21-1 Start Gate display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-4-P21-2-CHECKLIST", label: "Phase21-2 Continuity Checklist display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-4-P21-3-CHECKLIST", label: "Phase21-3 Device Sync Checklist display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-4-HOME-PC-LAUNCH", label: "Home PC confirms private-local.html opens from the local repository", area: "device_launch", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-4-COMPANY-PC-LAUNCH", label: "Company PC confirms private-local.html opens from the local repository", area: "device_launch", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-4-IPAD-LAUNCH", label: "iPad confirms private-local.html can be reviewed through private repository access", area: "device_launch", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-4-INDEX-DISPLAY", label: "index.html displays Phase21-4 and prior Phase21 panels", area: "display", device: "all", status: "ManualReviewRequired" },
    { id: "P21-4-DASHBOARD-ROUTE", label: "Dashboard route from private-local.html to index.html Phase21-4 panel is present", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-4-PULL-CHECK", label: "After GitHub pull, re-open private-local.html and index.html locally", area: "post_pull", device: "Home PC / Company PC", status: "ManualReviewRequired" },
    { id: "P21-4-PULL-STATUS", label: "After GitHub pull, confirm working tree is clean before local operation", area: "post_pull", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-4-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-4-NO-PAGES-PREMISE", label: "GitHub Pages publication is not required for operation confirmation", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-4-RECOVERY-RELOAD", label: "Failure recovery starts with reload, local file re-open, and branch/status check", area: "recovery", device: "all", status: "Confirmed" },
    { id: "P21-4-RECOVERY-REVERT", label: "If display breaks after pull, stop and use PR review or local revert guidance before continuing", area: "recovery", device: "all", status: "Confirmed" },
    { id: "P21-4-MERGE-CHECKS", label: "Before merge, JSON, JS syntax, Phase20/Phase21 tests, conflict markers, and unsafe flags are checked", area: "merge_readiness", device: "all", status: "Confirmed" },
    { id: "P21-4-NO-PUBLIC-PUBLISH", label: "Web or GitHub Pages public publishing remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-4-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-4-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-4-NO-AUTO-MERGE", label: "Auto execution, direct main push, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" }
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
      display_recovery_review_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase21_2_prerequisite: PHASE21_2_PREREQUISITE,
      phase21_3_prerequisite: PHASE21_3_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_2_continuity_checklist_preserved: true,
      phase21_3_device_sync_checklist_preserved: true,
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

  function buildCheckRecord(item) {
    return {
      ...item,
      display_recovery_review_status: item.status === "Blocked" ? "blocked_by_private_local_policy" : item.status === "ManualReviewRequired" ? "pending_manual_local_confirmation" : "display_recovery_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalDisplayRecoveryChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      display_recovery_status: DISPLAY_RECOVERY_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      display_recovery_review_only: true,
      home_pc_confirmation_required: true,
      company_pc_confirmation_required: true,
      ipad_confirmation_required: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      github_pull_after_update_check_required: true,
      recovery_checklist_required: true,
      merge_before_check_required: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase21_2_prerequisite: PHASE21_2_PREREQUISITE,
      phase21_3_prerequisite: PHASE21_3_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_2_continuity_checklist_preserved: true,
      phase21_3_device_sync_checklist_preserved: true,
      phase21_4_route_added: true,
      readme_updated: true,
      json_syntax_check_required: true,
      javascript_syntax_check_required: true,
      new_test_added: true,
      phase21_related_tests_required: true,
      phase20_related_tests_required: true,
      conflict_marker_check_required: true,
      unsafe_flag_check_required: true,
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
      panel_id: `PHASE21-4-DISPLAY-RECOVERY-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      display_recovery_status: DISPLAY_RECOVERY_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_4_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalDisplayRecoveryChecklist(options = {}) {
    return buildPrivateLocalDisplayRecoveryChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalDisplayRecoveryChecklist(panel, doc = document) {
    const summary = panel.phase21_4_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-4-panel-status", panel.panel_status);
    set("#phase21-4-display-recovery-status", panel.display_recovery_status);
    set("#phase21-4-total-checks", summary.total_checks);
    set("#phase21-4-confirmed-checks", summary.confirmed_checks);
    set("#phase21-4-manual-checks", summary.manual_review_required_checks);
    set("#phase21-4-blocked-checks", summary.blocked_checks);
    set("#phase21-4-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-4-phase21-1-preserved", summary.phase21_1_start_gate_preserved);
    set("#phase21-4-phase21-2-preserved", summary.phase21_2_continuity_checklist_preserved);
    set("#phase21-4-phase21-3-preserved", summary.phase21_3_device_sync_checklist_preserved);
    set("#phase21-4-private-local", summary.private_local_launch_check_required);
    set("#phase21-4-index-display", summary.index_display_check_required);
    set("#phase21-4-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-4-pull-check", summary.github_pull_after_update_check_required);
    set("#phase21-4-recovery", summary.recovery_checklist_required);
    set("#phase21-4-merge-check", summary.merge_before_check_required);
    set("#phase21-4-local-first", summary.local_first_operation);
    set("#phase21-4-plan-only", summary.plan_only);
    set("#phase21-4-protected", summary.protected_mode);
    set("#phase21-4-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-4-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-4-no-external-api", summary.external_api_connection);
    set("#phase21-4-no-auto", summary.auto_execution);
    set("#phase21-4-merge", summary.merge_allowed);
    set("#phase21-4-unsafe-flags", summary.unsafe_flags);
    set("#phase21-4-next-step", summary.next_recommended_step);
    set("#phase21-4-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-4-private-local-display-recovery-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-4-private-local-display-recovery-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.display_recovery_review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalDisplayRecoveryChecklist(panel, storage) {
    if (storage) storage.setItem("phase214PrivateLocalDisplayRecoveryChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalDisplayRecoveryChecklist(options = {}) {
    const panel = runPrivateLocalDisplayRecoveryChecklist(options);
    persistPrivateLocalDisplayRecoveryChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalDisplayRecoveryChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-4-private-local-display-recovery-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalDisplayRecoveryChecklist());
      if (document.querySelector("#phase21-4-private-local-display-recovery-checklist-builder")) runAndRenderPrivateLocalDisplayRecoveryChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    DISPLAY_RECOVERY_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_1_PREREQUISITE,
    PHASE21_2_PREREQUISITE,
    PHASE21_3_PREREQUISITE,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalDisplayRecoveryChecklist,
    runPrivateLocalDisplayRecoveryChecklist,
    renderPrivateLocalDisplayRecoveryChecklist,
    persistPrivateLocalDisplayRecoveryChecklist,
    runAndRenderPrivateLocalDisplayRecoveryChecklist
  };
});
