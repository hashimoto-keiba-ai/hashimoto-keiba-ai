(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2122PrivateLocalPostPr215OperationSafetyVerificationChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-22";
  const CHECKLIST_NAME = "Private Local Post PR215 Operation Safety Verification Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_22_private_local_post_pr215_operation_safety_verification_checklist_plan_only";
  const POST_PR215_OPERATION_SAFETY_VERIFICATION_STATUS = "POST_PR215_PRIVATE_LOCAL_OPERATION_SAFETY_VERIFICATION_READY";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Save Phase21-22 validation results before any draft PR creation; ready-for-review and merge remain human-confirmed only";

  const CHECKS = [
    { id: "P21-22-PR215-MERGED", label: "PR #215 merge is reflected on main before Phase21-22 safety verification starts", area: "main_sync", device: "all", status: "Confirmed" },
    { id: "P21-22-MAIN-LATEST", label: "main is updated after PR #215 merge", area: "main_sync", device: "all", status: "Confirmed" },
    { id: "P21-22-MAIN-HEAD-MATCH", label: "local main, origin/main, and origin/HEAD match after fetch", area: "main_sync", device: "all", status: "Confirmed" },
    { id: "P21-22-WORKTREE-CLEAN", label: "working tree clean state is confirmed before safety verification checklist continuation", area: "branch_hygiene", device: "all", status: "Confirmed" },
    { id: "P21-22-P21-21-MAIN", label: "Phase21-21 builder, DB, summary, and test artifacts are reflected on main", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-22-P21-18-CONTINUITY", label: "Phase21-18 Post PR211 Operation Continuity Verification Extension Checklist continuity remains preserved", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-22-P21-19-CONTINUITY", label: "Phase21-19 Post PR212 Operation Continuity Verification Stabilization Checklist continuity remains preserved", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-22-P21-20-CONTINUITY", label: "Phase21-20 Post PR213 Operation Continuity Verification Finalization Checklist continuity remains preserved", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-22-P21-21-CONTINUITY", label: "Phase21-21 Post PR214 Operation Continuity Verification Handoff Checklist naturally precedes Phase21-22 after PR #215", area: "continuity", device: "all", status: "Confirmed" },
    { id: "P21-22-PRIVATE-LOCAL-ROUTE", label: "private-local.html can remain private-local first without public URL dependency", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-22-INDEX-ROUTE", label: "index.html Phase21 route policy remains intact while adding Phase21-22 core artifacts", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-22-DASHBOARD-STYLE", label: "dashboard.css route styling remains unchanged unless explicitly requested", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-22-VALIDATION-SAVE", label: "validation results can be saved before draft PR creation", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-PHASE21-18-REGRESSION", label: "Phase21-18 regression test remains required", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-PHASE21-19-REGRESSION", label: "Phase21-19 regression test remains required", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-PHASE21-20-REGRESSION", label: "Phase21-20 regression test remains required", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-PHASE21-TESTS", label: "Phase21 test suite remains required before status decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-CONFLICT-MARKER-CHECK", label: "conflict marker search is required before push, PR creation, ready-for-review, or merge", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-UNSAFE-FLAG-CHECK", label: "unsafe true flag search is required and must not introduce unsafe true flags", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-22-NO-PUBLIC-DELIVERY-CHANGE", label: "private local continuity safety verification is prioritized without public delivery, publishing, or external exposure changes", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-22-HUMAN-READY-REVIEW", label: "Ready for review is performed only after human confirmation", area: "human_gate", device: "all", status: "ManualReviewRequired" },
    { id: "P21-22-HUMAN-MERGE", label: "merge is performed only after human confirmation", area: "human_gate", device: "all", status: "ManualReviewRequired" },
    { id: "P21-22-DRAFT-PR-HOLD", label: "Draft PR creation waits until validation results are saved and explicit instruction is given", area: "human_gate", device: "all", status: "ManualReviewRequired" },
    { id: "P21-22-HOME-PC-REVIEW", label: "Home PC private local safety verification review remains manual", area: "device_review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-22-COMPANY-PC-REVIEW", label: "Company PC clean-main safety verification review remains manual", area: "device_review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-22-IPAD-REVIEW", label: "iPad private repository display review remains manual", area: "device_review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-22-PRIVATE-OPERATION", label: "Private local operation remains checklist and display only under PLAN_ONLY Protected policy", area: "operation", device: "all", status: "Confirmed" },
    { id: "P21-22-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-22-NO-GITHUB-PAGES", label: "GitHub Pages publishing and setting changes remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-22-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-22-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-22-NO-AUTO-MERGE", label: "Auto execution, ready-for-review transition, direct main push, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-22-NO-UNREQUESTED-PR", label: "Phase21-22 PR creation remains blocked until explicit instruction", area: "blocked", device: "all", status: "Blocked" }
  ];

  const OUT_OF_SCOPE_OPERATIONS = ["public_publish", "github_pages_publish", "github_pages_setting_change", "public_url_guidance", "external_connection", "external_api_connection", "external_api_submission", "billing_integration", "real_ticket_auto_purchase", "auto_execution", "auto_publish", "auto_launch", "auto_ready_for_review", "ready_for_review_pr", "auto_push", "auto_pr_creation", "auto_merge", "merge", "main_direct_push"];
  const BLOCKED_ACTIONS = ["direct_push_to_main", "merge", "ready_for_review_pr", "create_phase21_22_pr_without_instruction", "public_publish", "github_pages_publish", "github_pages_setting_change", "public_url_guidance", "external_connection", "external_api_connection", "external_api_submission", "billing_integration", "real_ticket_auto_purchase", "auto_execution", "auto_publish", "auto_launch", "auto_ready_for_review", "repository_visibility_change"];
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
      post_pr215_operation_safety_verification_checklist_only: true,
      phase20_completion_final_closure_preserved: true,
      phase21_18_post_pr211_operation_continuity_verification_extension_checklist_preserved: true,
      phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved: true,
      phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved: true,
      phase21_21_post_pr214_operation_continuity_verification_handoff_checklist_preserved: true,
      pr215_merged_to_main: true,
      main_latest_after_pr215_merge: true,
      local_main_origin_main_origin_head_match: true,
      working_tree_clean_confirmed: true,
      validation_results_save_before_draft_pr_required: true,
      phase21_22_push_explicitly_requested: false,
      phase21_22_push_allowed_without_instruction: false,
      phase21_22_pr_creation_allowed_without_instruction: false,
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
      post_pr215_operation_safety_verification_status: item.status === "Blocked" ? "blocked_by_post_pr215_private_local_policy" : item.status === "ManualReviewRequired" ? "pending_manual_post_pr215_private_local_review" : "post_pr215_private_local_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalPostPr215OperationSafetyVerificationChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      post_pr215_operation_safety_verification_status: POST_PR215_OPERATION_SAFETY_VERIFICATION_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      private_local_operation_checklist_only: true,
      post_pr215_operation_safety_verification_checklist_only: true,
      phase21_18_regression_required: true,
      phase21_19_regression_required: true,
      phase21_20_regression_required: true,
      phase21_21_regression_required: true,
      phase21_21_pr215_merged: true,
      pr215_main_merge_confirmed: true,
      local_main_origin_main_origin_head_match: true,
      working_tree_clean_confirmed: true,
      company_pc_main_clean_confirmed: true,
      validation_results_save_before_draft_pr_required: true,
      ready_for_review_human_confirmation_required: true,
      merge_human_confirmation_required: true,
      private_local_continuity_prioritized: true,
      home_pc_post_pr215_confirmation_required: true,
      company_pc_post_pr215_confirmation_required: true,
      ipad_post_pr215_confirmation_required: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      post_pull_update_check_required: true,
      recovery_hold_required: true,
      merge_before_check_required: true,
      draft_pr_chain_audit_required: true,
      phase20_completion_final_closure_preserved: true,
      phase21_18_post_pr211_operation_continuity_verification_extension_checklist_preserved: true,
      phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved: true,
      phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved: true,
      phase21_21_post_pr214_operation_continuity_verification_handoff_checklist_preserved: true,
      phase21_22_route_added: true,
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
      panel_id: `PHASE21-22-POST-PR215-PRIVATE-LOCAL-OPERATION-SAFETY-VERIFICATION-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      post_pr215_operation_safety_verification_status: POST_PR215_OPERATION_SAFETY_VERIFICATION_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_22_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalPostPr215OperationSafetyVerificationChecklist(options = {}) {
    return buildPrivateLocalPostPr215OperationSafetyVerificationChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalPostPr215OperationSafetyVerificationChecklist(panel, doc = document) {
    const summary = panel.phase21_22_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-22-panel-status", panel.panel_status);
    set("#phase21-22-post-pr215-status", panel.post_pr215_operation_safety_verification_status);
    set("#phase21-22-total-checks", summary.total_checks);
    set("#phase21-22-confirmed-checks", summary.confirmed_checks);
    set("#phase21-22-manual-checks", summary.manual_review_required_checks);
    set("#phase21-22-blocked-checks", summary.blocked_checks);
    set("#phase21-22-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-22-phase21-18-preserved", summary.phase21_18_post_pr211_operation_continuity_verification_extension_checklist_preserved);
    set("#phase21-22-phase21-19-preserved", summary.phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved);
    set("#phase21-22-phase21-20-preserved", summary.phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved);
    set("#phase21-22-phase21-21-preserved", summary.phase21_21_post_pr214_operation_continuity_verification_handoff_checklist_preserved);
    set("#phase21-22-pr215-merged", summary.phase21_21_pr215_merged);
    set("#phase21-22-main-latest", summary.pr215_main_merge_confirmed);
    set("#phase21-22-main-head-match", summary.local_main_origin_main_origin_head_match);
    set("#phase21-22-worktree-clean", summary.working_tree_clean_confirmed);
    set("#phase21-22-company-main", summary.company_pc_main_clean_confirmed);
    set("#phase21-22-validation-save", summary.validation_results_save_before_draft_pr_required);
    set("#phase21-22-push-request", summary.phase21_22_push_explicitly_requested);
    set("#phase21-22-pr-hold", summary.phase21_22_pr_creation_allowed_without_instruction);
    set("#phase21-22-private-local", summary.private_local_launch_check_required);
    set("#phase21-22-index-display", summary.index_display_check_required);
    set("#phase21-22-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-22-post-pull", summary.post_pull_update_check_required);
    set("#phase21-22-recovery-hold", summary.recovery_hold_required);
    set("#phase21-22-chain-audit", summary.draft_pr_chain_audit_required);
    set("#phase21-22-merge-check", summary.merge_before_check_required);
    set("#phase21-22-ready-human", summary.ready_for_review_human_confirmation_required);
    set("#phase21-22-merge-human", summary.merge_human_confirmation_required);
    set("#phase21-22-local-first", summary.local_first_operation);
    set("#phase21-22-plan-only", summary.plan_only);
    set("#phase21-22-protected", summary.protected_mode);
    set("#phase21-22-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-22-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-22-no-external-api", summary.external_api_connection);
    set("#phase21-22-no-auto", summary.auto_execution);
    set("#phase21-22-no-ready", summary.ready_for_review_allowed);
    set("#phase21-22-merge", summary.merge_allowed);
    set("#phase21-22-unsafe-flags", summary.unsafe_flags);
    set("#phase21-22-next-step", summary.next_recommended_step);
    set("#phase21-22-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-22-private-local-post-pr215-operation-safety-verification-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-22-private-local-post-pr215-operation-safety-verification-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.post_pr215_operation_safety_verification_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalPostPr215OperationSafetyVerificationChecklist(panel, storage) {
    if (storage) storage.setItem("phase2122PrivateLocalPostPr215OperationSafetyVerificationChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalPostPr215OperationSafetyVerificationChecklist(options = {}) {
    const panel = runPrivateLocalPostPr215OperationSafetyVerificationChecklist(options);
    persistPrivateLocalPostPr215OperationSafetyVerificationChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalPostPr215OperationSafetyVerificationChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-22-private-local-post-pr215-operation-safety-verification-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr215OperationSafetyVerificationChecklist());
      if (document.querySelector("#phase21-22-private-local-post-pr215-operation-safety-verification-checklist-builder")) runAndRenderPrivateLocalPostPr215OperationSafetyVerificationChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    POST_PR215_OPERATION_SAFETY_VERIFICATION_STATUS,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalPostPr215OperationSafetyVerificationChecklist,
    runPrivateLocalPostPr215OperationSafetyVerificationChecklist,
    renderPrivateLocalPostPr215OperationSafetyVerificationChecklist,
    persistPrivateLocalPostPr215OperationSafetyVerificationChecklist,
    runAndRenderPrivateLocalPostPr215OperationSafetyVerificationChecklist
  };
});
