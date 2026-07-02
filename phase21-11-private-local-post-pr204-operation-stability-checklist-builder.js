(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2111PrivateLocalPostPr204OperationStabilityChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-11";
  const CHECKLIST_NAME = "Private Local Post PR204 Operation Stability Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_11_private_local_post_pr204_operation_stability_checklist_plan_only";
  const POST_PR204_OPERATION_STABILITY_STATUS = "POST_PR204_PRIVATE_LOCAL_OPERATION_STABILITY_READY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_9_PREREQUISITE = "POST_PR202_CHAIN_STABILITY_READY";
  const PHASE21_10_PREREQUISITE = "POST_PR203_PRIVATE_LOCAL_OPERATION_READY";
  const PHASE21_4_DRAFT_PR = "PR #198 Draft";
  const PHASE21_5_DRAFT_PR = "PR #199 Draft";
  const PHASE21_6_DRAFT_PR = "PR #200 Draft";
  const PHASE21_7_DRAFT_PR = "PR #201 Draft";
  const PHASE21_8_DRAFT_PR = "PR #202 Draft";
  const PHASE21_9_DRAFT_PR = "PR #203 Draft";
  const PHASE21_10_DRAFT_PR = "PR #204 Draft";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Keep Phase21-4 through Phase21-11 as draft PR chain review and private local operation work until explicit push and PR instructions are given";
  const CHECKS = [
    { id: "P21-11-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-11-P21-9-CHECKLIST", label: "Phase21-9 Post PR202 Chain Stability Checklist route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-11-P21-10-CHECKLIST", label: "Phase21-10 Private Local Post PR203 Operation Checklist route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-11-PR198-DRAFT", label: "Phase21-4 PR #198 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR199-DRAFT", label: "Phase21-5 PR #199 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR200-DRAFT", label: "Phase21-6 PR #200 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR201-DRAFT", label: "Phase21-7 PR #201 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR202-DRAFT", label: "Phase21-8 PR #202 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR203-DRAFT", label: "Phase21-9 PR #203 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR204-DRAFT", label: "Phase21-10 PR #204 exists as draft and remains unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-11-PR204-BASE-COMPARE", label: "Phase21-10 PR #204 base is Phase21-9 and compare is Phase21-10", area: "draft_pr_chain", device: "all", status: "Confirmed" },
    { id: "P21-11-NEXT-BRANCH", label: "Phase21-11 remains local only until explicit push and PR creation instructions", area: "branch_hygiene", device: "Home PC", status: "Confirmed" },
    { id: "P21-11-COMPANY-PC-MAIN", label: "Company PC main is clean and no Phase21-4/5/6/7/8/9/10 merge is assumed", area: "branch_hygiene", device: "Company PC", status: "Confirmed" },
    { id: "P21-11-HOME-PC-POST-PR204", label: "Home PC confirms chained private local operation after PR #204 creation", area: "device_review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-11-COMPANY-PC-POST-PR204", label: "Company PC confirms private local operation remains stable from clean main context", area: "device_review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-11-IPAD-POST-PR204", label: "iPad confirms private repository display review after PR #204 creation", area: "device_review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-11-PRIVATE-LOCAL", label: "private-local.html route includes Phase21-11 without public URL dependency", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-11-INDEX-DISPLAY", label: "index.html displays Phase21-11 without altering prior panels", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-11-DASHBOARD-STYLE", label: "dashboard.css adds Phase21-11 styling only", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-11-README-HANDOFF", label: "README documents post PR #204 private local operation stability policy", area: "documentation", device: "all", status: "Confirmed" },
    { id: "P21-11-REVIEW-FEEDBACK", label: "PR #204 feedback remains manual and local-test backed", area: "review_response", device: "all", status: "Confirmed" },
    { id: "P21-11-POST-PULL", label: "After pull or review update, rerun local display and related tests", area: "verification", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-11-PHASE-TESTS", label: "Phase20 and Phase21 related tests remain required before status decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-11-CONFLICT-SAFETY", label: "Conflict markers and unsafe flags are checked before push, PR creation, ready-for-review, or merge decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-11-CHAIN-AUDIT", label: "Draft PR chain from PR #198 through PR #204 is reviewed before any status change", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-11-PRIVATE-OPERATION", label: "Private local operation remains checklist and display only under PLAN_ONLY Protected policy", area: "operation", device: "all", status: "Confirmed" },
    { id: "P21-11-RECOVERY-HOLD", label: "If chained display or private local operation breaks, keep all affected PRs draft until fixed", area: "recovery", device: "all", status: "Confirmed" },
    { id: "P21-11-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-11-NO-GITHUB-PAGES", label: "GitHub Pages publishing and setting changes remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-11-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-11-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-11-NO-AUTO-MERGE", label: "Auto execution, ready-for-review transition, direct main push, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-11-NO-PUSH-UNTIL-INSTRUCTED", label: "Phase21-11 push and PR creation remain blocked until explicit instruction", area: "blocked", device: "all", status: "Blocked" }
  ];
  const OUT_OF_SCOPE_OPERATIONS = [
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
    "ready_for_review_pr",
    "auto_push",
    "auto_pr_creation",
    "auto_merge",
    "merge",
    "main_direct_push"
  ];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
    "merge",
    "ready_for_review_pr",
    "push_phase21_11_without_instruction",
    "create_phase21_11_pr_without_instruction",
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
      post_pr204_operation_stability_checklist_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_9_prerequisite: PHASE21_9_PREREQUISITE,
      phase21_10_prerequisite: PHASE21_10_PREREQUISITE,
      phase21_4_draft_pr: PHASE21_4_DRAFT_PR,
      phase21_5_draft_pr: PHASE21_5_DRAFT_PR,
      phase21_6_draft_pr: PHASE21_6_DRAFT_PR,
      phase21_7_draft_pr: PHASE21_7_DRAFT_PR,
      phase21_8_draft_pr: PHASE21_8_DRAFT_PR,
      phase21_9_draft_pr: PHASE21_9_DRAFT_PR,
      phase21_10_draft_pr: PHASE21_10_DRAFT_PR,
      phase20_completion_final_closure_preserved: true,
      phase21_9_post_pr202_chain_stability_checklist_preserved: true,
      phase21_10_post_pr203_operation_checklist_preserved: true,
      phase21_4_merge_allowed: false,
      phase21_5_merge_allowed: false,
      phase21_6_merge_allowed: false,
      phase21_7_merge_allowed: false,
      phase21_8_merge_allowed: false,
      phase21_10_merge_allowed: false,
      phase21_11_push_allowed_without_instruction: false,
      phase21_11_pr_creation_allowed_without_instruction: false,
      company_pc_main_clean_confirmed: true,
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
      post_pr204_operation_stability_status: item.status === "Blocked" ? "blocked_by_post_pr204_private_local_policy" : item.status === "ManualReviewRequired" ? "pending_manual_post_pr204_private_local_review" : "post_pr204_private_local_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalPostPr204OperationStabilityChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      post_pr204_operation_stability_status: POST_PR204_OPERATION_STABILITY_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      private_local_operation_checklist_only: true,
      post_pr204_operation_stability_checklist_only: true,
      phase21_4_draft_pr_review_required: true,
      phase21_5_draft_pr_review_required: true,
      phase21_6_draft_pr_review_required: true,
      phase21_7_draft_pr_review_required: true,
      phase21_8_draft_pr_review_required: true,
      phase21_10_draft_pr_review_required: true,
      phase21_10_pr204_created: true,
      phase21_4_merge_allowed: false,
      phase21_5_merge_allowed: false,
      phase21_6_merge_allowed: false,
      phase21_7_merge_allowed: false,
      phase21_8_merge_allowed: false,
      phase21_10_merge_allowed: false,
      phase21_11_push_allowed_without_instruction: false,
      phase21_11_pr_creation_allowed_without_instruction: false,
      company_pc_main_clean_confirmed: true,
      draft_pr_chain_order_confirmed: true,
      pr204_base_compare_chain_required: true,
      home_pc_post_pr204_confirmation_required: true,
      company_pc_post_pr204_confirmation_required: true,
      ipad_post_pr204_confirmation_required: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      post_pull_update_check_required: true,
      recovery_hold_required: true,
      merge_before_check_required: true,
      draft_pr_chain_audit_required: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_9_prerequisite: PHASE21_9_PREREQUISITE,
      phase21_10_prerequisite: PHASE21_10_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_9_post_pr202_chain_stability_checklist_preserved: true,
      phase21_10_post_pr203_operation_checklist_preserved: true,
      phase21_11_route_added: true,
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
      panel_id: `PHASE21-10-POST-PR204-PRIVATE-LOCAL-OPERATION-STABILITY-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      post_pr204_operation_stability_status: POST_PR204_OPERATION_STABILITY_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_11_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalPostPr204OperationStabilityChecklist(options = {}) {
    return buildPrivateLocalPostPr204OperationStabilityChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalPostPr204OperationStabilityChecklist(panel, doc = document) {
    const summary = panel.phase21_11_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-11-panel-status", panel.panel_status);
    set("#phase21-11-post-pr204-status", panel.post_pr204_operation_stability_status);
    set("#phase21-11-total-checks", summary.total_checks);
    set("#phase21-11-confirmed-checks", summary.confirmed_checks);
    set("#phase21-11-manual-checks", summary.manual_review_required_checks);
    set("#phase21-11-blocked-checks", summary.blocked_checks);
    set("#phase21-11-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-11-phase21-8-preserved", summary.phase21_9_post_pr202_chain_stability_checklist_preserved);
    set("#phase21-11-phase21-9-preserved", summary.phase21_10_post_pr203_operation_checklist_preserved);
    set("#phase21-11-pr198-review", summary.phase21_4_draft_pr_review_required);
    set("#phase21-11-pr199-review", summary.phase21_5_draft_pr_review_required);
    set("#phase21-11-pr200-review", summary.phase21_6_draft_pr_review_required);
    set("#phase21-11-pr201-review", summary.phase21_7_draft_pr_review_required);
    set("#phase21-11-pr202-review", summary.phase21_8_draft_pr_review_required);
    set("#phase21-11-pr204-review", summary.phase21_10_draft_pr_review_required);
    set("#phase21-11-pr204-created", summary.phase21_10_pr204_created);
    set("#phase21-11-company-main", summary.company_pc_main_clean_confirmed);
    set("#phase21-11-chain-order", summary.draft_pr_chain_order_confirmed);
    set("#phase21-11-base-compare", summary.pr204_base_compare_chain_required);
    set("#phase21-11-push-hold", summary.phase21_11_push_allowed_without_instruction);
    set("#phase21-11-pr-hold", summary.phase21_11_pr_creation_allowed_without_instruction);
    set("#phase21-11-private-local", summary.private_local_launch_check_required);
    set("#phase21-11-index-display", summary.index_display_check_required);
    set("#phase21-11-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-11-post-pull", summary.post_pull_update_check_required);
    set("#phase21-11-recovery-hold", summary.recovery_hold_required);
    set("#phase21-11-chain-audit", summary.draft_pr_chain_audit_required);
    set("#phase21-11-merge-check", summary.merge_before_check_required);
    set("#phase21-11-local-first", summary.local_first_operation);
    set("#phase21-11-plan-only", summary.plan_only);
    set("#phase21-11-protected", summary.protected_mode);
    set("#phase21-11-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-11-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-11-no-external-api", summary.external_api_connection);
    set("#phase21-11-no-auto", summary.auto_execution);
    set("#phase21-11-no-ready", summary.ready_for_review_allowed);
    set("#phase21-11-merge", summary.merge_allowed);
    set("#phase21-11-unsafe-flags", summary.unsafe_flags);
    set("#phase21-11-next-step", summary.next_recommended_step);
    set("#phase21-11-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-11-private-local-post-pr204-operation-stability-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-11-private-local-post-pr204-operation-stability-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.post_pr204_operation_stability_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalPostPr204OperationStabilityChecklist(panel, storage) {
    if (storage) storage.setItem("phase2111PrivateLocalPostPr204OperationStabilityChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalPostPr204OperationStabilityChecklist(options = {}) {
    const panel = runPrivateLocalPostPr204OperationStabilityChecklist(options);
    persistPrivateLocalPostPr204OperationStabilityChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalPostPr204OperationStabilityChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-11-private-local-post-pr204-operation-stability-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr204OperationStabilityChecklist());
      if (document.querySelector("#phase21-11-private-local-post-pr204-operation-stability-checklist-builder")) runAndRenderPrivateLocalPostPr204OperationStabilityChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    POST_PR204_OPERATION_STABILITY_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_9_PREREQUISITE,
    PHASE21_10_PREREQUISITE,
    PHASE21_4_DRAFT_PR,
    PHASE21_5_DRAFT_PR,
    PHASE21_6_DRAFT_PR,
    PHASE21_7_DRAFT_PR,
    PHASE21_8_DRAFT_PR,
    PHASE21_9_DRAFT_PR,
    PHASE21_10_DRAFT_PR,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalPostPr204OperationStabilityChecklist,
    runPrivateLocalPostPr204OperationStabilityChecklist,
    renderPrivateLocalPostPr204OperationStabilityChecklist,
    persistPrivateLocalPostPr204OperationStabilityChecklist,
    runAndRenderPrivateLocalPostPr204OperationStabilityChecklist
  };
});
