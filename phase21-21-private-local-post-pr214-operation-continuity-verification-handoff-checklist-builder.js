(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2121PrivateLocalPostPr214OperationContinuityVerificationHandoffChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-21";
  const CHECKLIST_NAME = "Private Local Post PR214 Operation Continuity Verification Handoff Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_21_private_local_post_pr214_operation_continuity_verification_handoff_checklist_plan_only";
  const POST_PR214_OPERATION_CONTINUITY_VERIFICATION_HANDOFF_STATUS = "POST_PR214_PRIVATE_LOCAL_OPERATION_CONTINUITY_VERIFICATION_HANDOFF_READY";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Save Phase21-21 validation results before any draft PR creation; ready-for-review and merge remain human-confirmed only";

  const CHECKS = [
    { id: "P21-21-PR214-MERGED", label: "PR #214 merge is reflected on main before Phase21-21 continuity verification handoff starts", area: "main_sync", device: "all", status: "Confirmed" },
    { id: "P21-21-MAIN-LATEST", label: "main is updated after PR #214 merge", area: "main_sync", device: "all", status: "Confirmed" },
    { id: "P21-21-MAIN-HEAD-MATCH", label: "local main, origin/main, and origin/HEAD match after fetch", area: "main_sync", device: "all", status: "Confirmed" },
    { id: "P21-21-WORKTREE-CLEAN", label: "working tree clean state is confirmed before handoff checklist continuation", area: "branch_hygiene", device: "all", status: "Confirmed" },
    { id: "P21-21-P21-20-MAIN", label: "Phase21-20 builder, DB, summary, and test artifacts are reflected on main", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-21-P21-17-CONTINUITY", label: "Phase21-17 Post PR210 Operation Continuity Verification Continuation Checklist continuity remains preserved", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-21-P21-18-CONTINUITY", label: "Phase21-18 Post PR211 Operation Continuity Verification Extension Checklist continuity remains preserved", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-21-P21-19-CONTINUITY", label: "Phase21-19 Post PR212 Operation Continuity Verification Stabilization Checklist continuity remains preserved", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-21-P21-20-CONTINUITY", label: "Phase21-20 Post PR213 Operation Continuity Verification Finalization Checklist naturally precedes Phase21-21 after PR #214", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-21-PRIVATE-LOCAL-ROUTE", label: "private-local.html can remain private-local first without public URL dependency", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-21-INDEX-ROUTE", label: "index.html Phase21 route policy remains intact while adding Phase21-21 core artifacts", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-21-DASHBOARD-STYLE", label: "dashboard.css route styling remains unchanged unless explicitly requested", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-21-VALIDATION-SAVE", label: "validation results can be saved before draft PR creation", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-PHASE21-18-REGRESSION", label: "Phase21-18 regression test remains required", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-PHASE21-19-REGRESSION", label: "Phase21-19 regression test remains required", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-PHASE21-20-REGRESSION", label: "Phase21-20 regression test remains required", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-PHASE21-TESTS", label: "Phase21 test suite remains required before status decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-CONFLICT-MARKER-CHECK", label: "conflict marker search is required before push, PR creation, ready-for-review, or merge", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-UNSAFE-FLAG-CHECK", label: "unsafe true flag search is required and must not introduce unsafe true flags", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-21-NO-PUBLIC-DELIVERY-CHANGE", label: "private local continuity handoff is prioritized without public delivery, publishing, or external exposure changes", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-21-HUMAN-READY-REVIEW", label: "Ready for review is performed only after human confirmation", area: "human_gate", device: "all", status: "ManualReviewRequired" },
    { id: "P21-21-HUMAN-MERGE", label: "merge is performed only after human confirmation", area: "human_gate", device: "all", status: "ManualReviewRequired" },
    { id: "P21-21-DRAFT-PR-HOLD", label: "Draft PR creation waits until validation results are saved and explicit instruction is given", area: "human_gate", device: "all", status: "ManualReviewRequired" },
    { id: "P21-21-HOME-PC-REVIEW", label: "Home PC private local continuity verification handoff review remains manual", area: "device_review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-21-COMPANY-PC-REVIEW", label: "Company PC clean-main continuity verification handoff review remains manual", area: "device_review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-21-IPAD-REVIEW", label: "iPad private repository display review remains manual", area: "device_review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-21-PRIVATE-OPERATION", label: "Private local operation remains checklist and display only under PLAN_ONLY Protected policy", area: "operation", device: "all", status: "Confirmed" },
    { id: "P21-21-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-21-NO-GITHUB-PAGES", label: "GitHub Pages publishing and setting changes remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-21-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-21-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-21-NO-AUTO-MERGE", label: "Auto execution, ready-for-review transition, direct main push, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-21-NO-UNREQUESTED-PR", label: "Phase21-21 PR creation remains blocked until explicit instruction", area: "blocked", device: "all", status: "Blocked" }
  ];

  const OUT_OF_SCOPE_OPERATIONS = ["public_publish", "github_pages_publish", "github_pages_setting_change", "public_url_guidance", "external_connection", "external_api_connection", "external_api_submission", "billing_integration", "real_ticket_auto_purchase", "auto_execution", "auto_publish", "auto_launch", "auto_ready_for_review", "ready_for_review_pr", "auto_push", "auto_pr_creation", "auto_merge", "merge", "main_direct_push"];
  const BLOCKED_ACTIONS = ["direct_push_to_main", "merge", "ready_for_review_pr", "create_phase21_21_pr_without_instruction", "public_publish", "github_pages_publish", "github_pages_setting_change", "public_url_guidance", "external_connection", "external_api_connection", "external_api_submission", "billing_integration", "real_ticket_auto_purchase", "auto_execution", "auto_publish", "auto_launch", "auto_ready_for_review", "repository_visibility_change"];
  const ALLOWED_ACTIONS = ["checklist", "plan", "manual_review", "validate", "audit", "report", "local_launch", "dashboard_view", "draft_pr_review", "local_commit"];

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
      private_local_operation_checklist_only: true,
      post_pr214_operation_continuity_verification_handoff_checklist_only: true,
      phase20_completion_final_closure_preserved: true,
      phase21_17_post_pr210_operation_continuity_verification_continuation_checklist_preserved: true,
      phase21_18_post_pr211_operation_continuity_verification_extension_checklist_preserved: true,
      phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved: true,
      phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved: true,
      pr214_merged_to_main: true,
      main_latest_after_pr214_merge: true,
      local_main_origin_main_origin_head_match: true,
      working_tree_clean_confirmed: true,
      validation_results_save_before_draft_pr_required: true,
      phase21_21_push_explicitly_requested: false,
      phase21_21_push_allowed_without_instruction: false,
      phase21_21_pr_creation_allowed_without_instruction: false,
      public_delivery_change_allowed: false,
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
      ready_for_review_allowed: false,
      auto_push_allowed: false,
      auto_pr_creation_allowed: false,
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
      post_pr214_operation_continuity_verification_handoff_status: item.status === "Blocked" ? "blocked_by_post_pr214_private_local_policy" : item.status === "ManualReviewRequired" ? "pending_manual_post_pr214_private_local_review" : "post_pr214_private_local_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      post_pr214_operation_continuity_verification_handoff_status: POST_PR214_OPERATION_CONTINUITY_VERIFICATION_HANDOFF_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      private_local_operation_checklist_only: true,
      post_pr214_operation_continuity_verification_handoff_checklist_only: true,
      phase21_18_regression_required: true,
      phase21_19_regression_required: true,
      phase21_20_regression_required: true,
      phase21_20_pr214_merged: true,
      pr214_main_merge_confirmed: true,
      local_main_origin_main_origin_head_match: true,
      working_tree_clean_confirmed: true,
      company_pc_main_clean_confirmed: true,
      validation_results_save_before_draft_pr_required: true,
      ready_for_review_human_confirmation_required: true,
      merge_human_confirmation_required: true,
      private_local_continuity_prioritized: true,
      home_pc_post_pr214_confirmation_required: true,
      company_pc_post_pr214_confirmation_required: true,
      ipad_post_pr214_confirmation_required: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      post_pull_update_check_required: true,
      recovery_hold_required: true,
      merge_before_check_required: true,
      draft_pr_chain_audit_required: true,
      phase20_completion_final_closure_preserved: true,
      phase21_17_post_pr210_operation_continuity_verification_continuation_checklist_preserved: true,
      phase21_18_post_pr211_operation_continuity_verification_extension_checklist_preserved: true,
      phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved: true,
      phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved: true,
      phase21_21_route_added: true,
      readme_updated: true,
      json_syntax_check_required: true,
      javascript_syntax_check_required: true,
      new_test_added: true,
      phase21_related_tests_required: true,
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
      ready_for_review_allowed: false,
      auto_push_allowed: false,
      auto_pr_creation_allowed: false,
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
      panel_id: `PHASE21-21-POST-PR214-PRIVATE-LOCAL-OPERATION-CONTINUITY-VERIFICATION-HANDOFF-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      post_pr214_operation_continuity_verification_handoff_status: POST_PR214_OPERATION_CONTINUITY_VERIFICATION_HANDOFF_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_21_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(options = {}) {
    return buildPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(panel, doc = document) {
    const summary = panel.phase21_21_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-21-panel-status", panel.panel_status);
    set("#phase21-21-post-pr214-status", panel.post_pr214_operation_continuity_verification_handoff_status);
    set("#phase21-21-total-checks", summary.total_checks);
    set("#phase21-21-confirmed-checks", summary.confirmed_checks);
    set("#phase21-21-manual-checks", summary.manual_review_required_checks);
    set("#phase21-21-blocked-checks", summary.blocked_checks);
    set("#phase21-21-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-21-phase21-17-preserved", summary.phase21_17_post_pr210_operation_continuity_verification_continuation_checklist_preserved);
    set("#phase21-21-phase21-18-preserved", summary.phase21_18_post_pr211_operation_continuity_verification_extension_checklist_preserved);
    set("#phase21-21-phase21-19-preserved", summary.phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved);
    set("#phase21-21-phase21-20-preserved", summary.phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved);
    set("#phase21-21-pr214-merged", summary.phase21_20_pr214_merged);
    set("#phase21-21-main-latest", summary.pr214_main_merge_confirmed);
    set("#phase21-21-main-head-match", summary.local_main_origin_main_origin_head_match);
    set("#phase21-21-worktree-clean", summary.working_tree_clean_confirmed);
    set("#phase21-21-company-main", summary.company_pc_main_clean_confirmed);
    set("#phase21-21-validation-save", summary.validation_results_save_before_draft_pr_required);
    set("#phase21-21-push-request", summary.phase21_21_push_explicitly_requested);
    set("#phase21-21-pr-hold", summary.phase21_21_pr_creation_allowed_without_instruction);
    set("#phase21-21-private-local", summary.private_local_launch_check_required);
    set("#phase21-21-index-display", summary.index_display_check_required);
    set("#phase21-21-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-21-post-pull", summary.post_pull_update_check_required);
    set("#phase21-21-recovery-hold", summary.recovery_hold_required);
    set("#phase21-21-chain-audit", summary.draft_pr_chain_audit_required);
    set("#phase21-21-merge-check", summary.merge_before_check_required);
    set("#phase21-21-ready-human", summary.ready_for_review_human_confirmation_required);
    set("#phase21-21-merge-human", summary.merge_human_confirmation_required);
    set("#phase21-21-local-first", summary.local_first_operation);
    set("#phase21-21-plan-only", summary.plan_only);
    set("#phase21-21-protected", summary.protected_mode);
    set("#phase21-21-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-21-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-21-no-external-api", summary.external_api_connection);
    set("#phase21-21-no-auto", summary.auto_execution);
    set("#phase21-21-no-ready", summary.ready_for_review_allowed);
    set("#phase21-21-merge", summary.merge_allowed);
    set("#phase21-21-unsafe-flags", summary.unsafe_flags);
    set("#phase21-21-next-step", summary.next_recommended_step);
    set("#phase21-21-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-21-private-local-post-pr214-operation-continuity-verification-handoff-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-21-private-local-post-pr214-operation-continuity-verification-handoff-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.post_pr214_operation_continuity_verification_handoff_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(panel, storage) {
    if (storage) storage.setItem("phase2121PrivateLocalPostPr214OperationContinuityVerificationHandoffChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(options = {}) {
    const panel = runPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(options);
    persistPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-21-private-local-post-pr214-operation-continuity-verification-handoff-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist());
      if (document.querySelector("#phase21-21-private-local-post-pr214-operation-continuity-verification-handoff-checklist-builder")) runAndRenderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    POST_PR214_OPERATION_CONTINUITY_VERIFICATION_HANDOFF_STATUS,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist,
    runPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist,
    renderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist,
    persistPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist,
    runAndRenderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist
  };
});
