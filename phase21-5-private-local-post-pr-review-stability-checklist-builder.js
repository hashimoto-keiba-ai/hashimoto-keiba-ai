(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase215PrivateLocalPostPrReviewStabilityChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-5";
  const CHECKLIST_NAME = "Private Local Post PR Review Stability Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_5_private_local_post_pr_review_stability_checklist_plan_only";
  const POST_PR_REVIEW_STATUS = "POST_PR_REVIEW_STABILITY_READY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_1_PREREQUISITE = "READY_FOR_PRIVATE_LOCAL_PLANNING";
  const PHASE21_2_PREREQUISITE = "CONTINUITY_CONFIRMED_PLAN_ONLY";
  const PHASE21_3_PREREQUISITE = "DEVICE_SYNC_OPERATION_REVIEW_READY";
  const PHASE21_4_PREREQUISITE = "DISPLAY_RECOVERY_REVIEW_READY";
  const PHASE21_4_DRAFT_PR = "PR #198 Draft";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Keep Phase21-4 and Phase21-5 in draft review until manual local checks and protected merge-before checks are complete";
  const CHECKS = [
    { id: "P21-5-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-5-P21-1-GATE", label: "Phase21-1 Start Gate display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-5-P21-2-CHECKLIST", label: "Phase21-2 Continuity Checklist display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-5-P21-3-CHECKLIST", label: "Phase21-3 Device Sync Checklist display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-5-P21-4-CHECKLIST", label: "Phase21-4 Display Recovery Checklist display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-5-DRAFT-PR-198", label: "Phase21-4 Draft PR #198 remains draft and unmerged", area: "draft_pr_review", device: "all", status: "ManualReviewRequired" },
    { id: "P21-5-MAIN-CLEAN", label: "main remains clean and up to date before starting follow-up work", area: "branch_hygiene", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-5-STACK-AWARENESS", label: "Phase21-5 is tracked as follow-up work after Phase21-4 draft review", area: "branch_hygiene", device: "all", status: "Confirmed" },
    { id: "P21-5-HOME-PC-POST-PR", label: "Home PC repeats private-local.html and index.html checks after PR review updates", area: "device_review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-5-COMPANY-PC-POST-PR", label: "Company PC repeats private-local.html and index.html checks after PR review updates", area: "device_review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-5-IPAD-POST-PR", label: "iPad repeats private repository display review after PR review updates", area: "device_review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-5-REVIEW-FEEDBACK", label: "Review feedback is handled only through explicit local edits and tests", area: "review_response", device: "all", status: "ManualReviewRequired" },
    { id: "P21-5-LOCAL-ROUTES", label: "private-local.html, index.html, and dashboard routes remain the only display routes", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-5-README-HANDOFF", label: "README documents the post PR review stability policy", area: "documentation", device: "all", status: "Confirmed" },
    { id: "P21-5-UPDATE-CHECK", label: "After pull or review update, rerun Phase20/Phase21 related tests", area: "verification", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-5-CONFLICT-CHECK", label: "Conflict markers and unsafe flags are checked before any merge decision", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-5-RECOVERY-HOLD", label: "If review update breaks local display, stop and keep the PR in draft until fixed", area: "recovery", device: "all", status: "Confirmed" },
    { id: "P21-5-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-5-NO-PUBLIC-PUBLISH", label: "Web or GitHub Pages public publishing remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-5-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-5-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-5-NO-AUTO-MERGE", label: "Auto execution, direct main push, ready-for-review transition, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" }
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
    "auto_ready_for_review",
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
    "auto_ready_for_review",
    "repository_visibility_change"
  ];
  const ALLOWED_ACTIONS = ["checklist", "plan", "manual_review", "validate", "audit", "report", "local_launch", "dashboard_view", "draft_pr_review"];

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
      post_pr_review_stability_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase21_2_prerequisite: PHASE21_2_PREREQUISITE,
      phase21_3_prerequisite: PHASE21_3_PREREQUISITE,
      phase21_4_prerequisite: PHASE21_4_PREREQUISITE,
      phase21_4_draft_pr: PHASE21_4_DRAFT_PR,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_2_continuity_checklist_preserved: true,
      phase21_3_device_sync_checklist_preserved: true,
      phase21_4_display_recovery_checklist_preserved: true,
      phase21_4_merge_allowed: false,
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
      auto_ready_for_review_allowed: false,
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
      post_pr_review_status: item.status === "Blocked" ? "blocked_by_post_pr_protected_policy" : item.status === "ManualReviewRequired" ? "pending_manual_post_pr_review" : "post_pr_stability_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalPostPrReviewStabilityChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      post_pr_review_status: POST_PR_REVIEW_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      post_pr_review_stability_only: true,
      phase21_4_draft_pr_review_required: true,
      phase21_4_merge_allowed: false,
      home_pc_post_pr_confirmation_required: true,
      company_pc_post_pr_confirmation_required: true,
      ipad_post_pr_confirmation_required: true,
      review_feedback_manual_only: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      post_pull_update_check_required: true,
      recovery_hold_required: true,
      merge_before_check_required: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase21_2_prerequisite: PHASE21_2_PREREQUISITE,
      phase21_3_prerequisite: PHASE21_3_PREREQUISITE,
      phase21_4_prerequisite: PHASE21_4_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_2_continuity_checklist_preserved: true,
      phase21_3_device_sync_checklist_preserved: true,
      phase21_4_display_recovery_checklist_preserved: true,
      phase21_5_route_added: true,
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
      auto_ready_for_review_allowed: false,
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
      panel_id: `PHASE21-5-POST-PR-REVIEW-STABILITY-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      post_pr_review_status: POST_PR_REVIEW_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_5_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalPostPrReviewStabilityChecklist(options = {}) {
    return buildPrivateLocalPostPrReviewStabilityChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalPostPrReviewStabilityChecklist(panel, doc = document) {
    const summary = panel.phase21_5_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-5-panel-status", panel.panel_status);
    set("#phase21-5-post-pr-review-status", panel.post_pr_review_status);
    set("#phase21-5-total-checks", summary.total_checks);
    set("#phase21-5-confirmed-checks", summary.confirmed_checks);
    set("#phase21-5-manual-checks", summary.manual_review_required_checks);
    set("#phase21-5-blocked-checks", summary.blocked_checks);
    set("#phase21-5-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-5-phase21-1-preserved", summary.phase21_1_start_gate_preserved);
    set("#phase21-5-phase21-2-preserved", summary.phase21_2_continuity_checklist_preserved);
    set("#phase21-5-phase21-3-preserved", summary.phase21_3_device_sync_checklist_preserved);
    set("#phase21-5-phase21-4-preserved", summary.phase21_4_display_recovery_checklist_preserved);
    set("#phase21-5-draft-pr-review", summary.phase21_4_draft_pr_review_required);
    set("#phase21-5-review-feedback", summary.review_feedback_manual_only);
    set("#phase21-5-private-local", summary.private_local_launch_check_required);
    set("#phase21-5-index-display", summary.index_display_check_required);
    set("#phase21-5-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-5-post-pull", summary.post_pull_update_check_required);
    set("#phase21-5-recovery-hold", summary.recovery_hold_required);
    set("#phase21-5-merge-check", summary.merge_before_check_required);
    set("#phase21-5-local-first", summary.local_first_operation);
    set("#phase21-5-plan-only", summary.plan_only);
    set("#phase21-5-protected", summary.protected_mode);
    set("#phase21-5-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-5-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-5-no-external-api", summary.external_api_connection);
    set("#phase21-5-no-auto", summary.auto_execution);
    set("#phase21-5-no-ready", summary.auto_ready_for_review_allowed);
    set("#phase21-5-merge", summary.merge_allowed);
    set("#phase21-5-unsafe-flags", summary.unsafe_flags);
    set("#phase21-5-next-step", summary.next_recommended_step);
    set("#phase21-5-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-5-private-local-post-pr-review-stability-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-5-private-local-post-pr-review-stability-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.post_pr_review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalPostPrReviewStabilityChecklist(panel, storage) {
    if (storage) storage.setItem("phase215PrivateLocalPostPrReviewStabilityChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalPostPrReviewStabilityChecklist(options = {}) {
    const panel = runPrivateLocalPostPrReviewStabilityChecklist(options);
    persistPrivateLocalPostPrReviewStabilityChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalPostPrReviewStabilityChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-5-private-local-post-pr-review-stability-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPrReviewStabilityChecklist());
      if (document.querySelector("#phase21-5-private-local-post-pr-review-stability-checklist-builder")) runAndRenderPrivateLocalPostPrReviewStabilityChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    POST_PR_REVIEW_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_1_PREREQUISITE,
    PHASE21_2_PREREQUISITE,
    PHASE21_3_PREREQUISITE,
    PHASE21_4_PREREQUISITE,
    PHASE21_4_DRAFT_PR,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalPostPrReviewStabilityChecklist,
    runPrivateLocalPostPrReviewStabilityChecklist,
    renderPrivateLocalPostPrReviewStabilityChecklist,
    persistPrivateLocalPostPrReviewStabilityChecklist,
    runAndRenderPrivateLocalPostPrReviewStabilityChecklist
  };
});
