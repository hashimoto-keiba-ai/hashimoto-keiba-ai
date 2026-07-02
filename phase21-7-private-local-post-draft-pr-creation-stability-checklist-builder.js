(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase217PrivateLocalPostDraftPrCreationStabilityChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-7";
  const CHECKLIST_NAME = "Private Local Post Draft PR Creation Stability Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_7_private_local_post_draft_pr_creation_stability_checklist_plan_only";
  const POST_DRAFT_PR_CREATION_STATUS = "POST_DRAFT_PR_CREATION_STABILITY_READY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_5_PREREQUISITE = "POST_PR_REVIEW_STABILITY_READY";
  const PHASE21_6_PREREQUISITE = "DRAFT_PR_CHAIN_REVIEW_READY";
  const PHASE21_4_DRAFT_PR = "PR #198 Draft";
  const PHASE21_5_DRAFT_PR = "PR #199 Draft";
  const PHASE21_6_DRAFT_PR = "PR #200 Draft";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Keep Phase21-4, Phase21-5, Phase21-6, and Phase21-7 as draft chain review work until explicit push and PR instructions are given";
  const CHECKS = [
    { id: "P21-7-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-7-P21-5-CHECKLIST", label: "Phase21-5 Post PR Review Stability Checklist route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-7-P21-6-CHECKLIST", label: "Phase21-6 Draft PR Chain Readiness Checklist route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-7-PR198-DRAFT", label: "Phase21-4 PR #198 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-7-PR199-DRAFT", label: "Phase21-5 PR #199 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-7-PR200-DRAFT", label: "Phase21-6 PR #200 exists as draft and remains unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-7-BASE-COMPARE", label: "Phase21-6 PR #200 base is Phase21-5 and compare is Phase21-6", area: "draft_pr_chain", device: "all", status: "Confirmed" },
    { id: "P21-7-NEXT-BRANCH", label: "Phase21-7 remains local only until explicit push and PR creation instructions", area: "branch_hygiene", device: "Home PC", status: "Confirmed" },
    { id: "P21-7-COMPANY-PC-MAIN", label: "Company PC main is clean and no Phase21-4/5/6 merge is assumed", area: "branch_hygiene", device: "Company PC", status: "Confirmed" },
    { id: "P21-7-HOME-PC-POST-PR200", label: "Home PC confirms chained local display after PR #200 creation", area: "device_review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-7-COMPANY-PC-POST-PR200", label: "Company PC confirms local display remains stable from clean main context", area: "device_review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-7-IPAD-POST-PR200", label: "iPad confirms private repository display review after PR #200 creation", area: "device_review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-7-PRIVATE-LOCAL", label: "private-local.html route includes Phase21-7 without public URL dependency", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-7-INDEX-DISPLAY", label: "index.html displays Phase21-7 without altering prior panels", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-7-DASHBOARD-STYLE", label: "dashboard.css adds Phase21-7 styling only", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-7-README-HANDOFF", label: "README documents the post draft PR creation stability policy", area: "documentation", device: "all", status: "Confirmed" },
    { id: "P21-7-REVIEW-FEEDBACK", label: "PR #200 feedback remains manual and local-test backed", area: "review_response", device: "all", status: "Confirmed" },
    { id: "P21-7-POST-PULL", label: "After pull or review update, rerun local display and related tests", area: "verification", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-7-PHASE-TESTS", label: "Phase20 and Phase21 related tests remain required before merge decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-7-CONFLICT-SAFETY", label: "Conflict markers and unsafe flags are checked before push, PR creation, ready-for-review, or merge decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-7-RECOVERY-HOLD", label: "If chained display breaks, keep all affected PRs draft until fixed", area: "recovery", device: "all", status: "Confirmed" },
    { id: "P21-7-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-7-NO-PUBLIC-PUBLISH", label: "Web or GitHub Pages public publishing remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-7-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-7-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-7-NO-AUTO-MERGE", label: "Auto execution, ready-for-review transition, direct main push, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-7-NO-PUSH-UNTIL-INSTRUCTED", label: "Phase21-7 push and PR creation remain blocked until explicit instruction", area: "blocked", device: "all", status: "Blocked" }
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
    "push_phase21_7_without_instruction",
    "create_phase21_7_pr_without_instruction",
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
      post_draft_pr_creation_stability_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_5_prerequisite: PHASE21_5_PREREQUISITE,
      phase21_6_prerequisite: PHASE21_6_PREREQUISITE,
      phase21_4_draft_pr: PHASE21_4_DRAFT_PR,
      phase21_5_draft_pr: PHASE21_5_DRAFT_PR,
      phase21_6_draft_pr: PHASE21_6_DRAFT_PR,
      phase20_completion_final_closure_preserved: true,
      phase21_5_post_pr_review_stability_checklist_preserved: true,
      phase21_6_draft_pr_chain_readiness_checklist_preserved: true,
      phase21_4_merge_allowed: false,
      phase21_5_merge_allowed: false,
      phase21_6_merge_allowed: false,
      phase21_7_push_allowed_without_instruction: false,
      phase21_7_pr_creation_allowed_without_instruction: false,
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
      post_draft_pr_creation_status: item.status === "Blocked" ? "blocked_by_post_draft_pr_creation_policy" : item.status === "ManualReviewRequired" ? "pending_manual_post_draft_pr_creation_review" : "post_draft_pr_creation_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalPostDraftPrCreationStabilityChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      post_draft_pr_creation_status: POST_DRAFT_PR_CREATION_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      post_draft_pr_creation_stability_only: true,
      phase21_4_draft_pr_review_required: true,
      phase21_5_draft_pr_review_required: true,
      phase21_6_draft_pr_review_required: true,
      phase21_4_merge_allowed: false,
      phase21_5_merge_allowed: false,
      phase21_6_merge_allowed: false,
      phase21_7_push_allowed_without_instruction: false,
      phase21_7_pr_creation_allowed_without_instruction: false,
      company_pc_main_clean_confirmed: true,
      draft_pr_chain_order_confirmed: true,
      phase21_6_pr200_created: true,
      base_compare_chain_required: true,
      home_pc_post_pr200_confirmation_required: true,
      company_pc_post_pr200_confirmation_required: true,
      ipad_post_pr200_confirmation_required: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      post_pull_update_check_required: true,
      recovery_hold_required: true,
      merge_before_check_required: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_5_prerequisite: PHASE21_5_PREREQUISITE,
      phase21_6_prerequisite: PHASE21_6_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_5_post_pr_review_stability_checklist_preserved: true,
      phase21_6_draft_pr_chain_readiness_checklist_preserved: true,
      phase21_7_route_added: true,
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
      panel_id: `PHASE21-7-POST-DRAFT-PR-CREATION-STABILITY-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      post_draft_pr_creation_status: POST_DRAFT_PR_CREATION_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_7_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalPostDraftPrCreationStabilityChecklist(options = {}) {
    return buildPrivateLocalPostDraftPrCreationStabilityChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalPostDraftPrCreationStabilityChecklist(panel, doc = document) {
    const summary = panel.phase21_7_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-7-panel-status", panel.panel_status);
    set("#phase21-7-post-draft-pr-status", panel.post_draft_pr_creation_status);
    set("#phase21-7-total-checks", summary.total_checks);
    set("#phase21-7-confirmed-checks", summary.confirmed_checks);
    set("#phase21-7-manual-checks", summary.manual_review_required_checks);
    set("#phase21-7-blocked-checks", summary.blocked_checks);
    set("#phase21-7-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-7-phase21-5-preserved", summary.phase21_5_post_pr_review_stability_checklist_preserved);
    set("#phase21-7-phase21-6-preserved", summary.phase21_6_draft_pr_chain_readiness_checklist_preserved);
    set("#phase21-7-pr198-review", summary.phase21_4_draft_pr_review_required);
    set("#phase21-7-pr199-review", summary.phase21_5_draft_pr_review_required);
    set("#phase21-7-pr200-review", summary.phase21_6_draft_pr_review_required);
    set("#phase21-7-pr200-created", summary.phase21_6_pr200_created);
    set("#phase21-7-company-main", summary.company_pc_main_clean_confirmed);
    set("#phase21-7-chain-order", summary.draft_pr_chain_order_confirmed);
    set("#phase21-7-base-compare", summary.base_compare_chain_required);
    set("#phase21-7-push-hold", summary.phase21_7_push_allowed_without_instruction);
    set("#phase21-7-pr-hold", summary.phase21_7_pr_creation_allowed_without_instruction);
    set("#phase21-7-private-local", summary.private_local_launch_check_required);
    set("#phase21-7-index-display", summary.index_display_check_required);
    set("#phase21-7-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-7-post-pull", summary.post_pull_update_check_required);
    set("#phase21-7-recovery-hold", summary.recovery_hold_required);
    set("#phase21-7-merge-check", summary.merge_before_check_required);
    set("#phase21-7-local-first", summary.local_first_operation);
    set("#phase21-7-plan-only", summary.plan_only);
    set("#phase21-7-protected", summary.protected_mode);
    set("#phase21-7-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-7-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-7-no-external-api", summary.external_api_connection);
    set("#phase21-7-no-auto", summary.auto_execution);
    set("#phase21-7-no-ready", summary.auto_ready_for_review_allowed);
    set("#phase21-7-merge", summary.merge_allowed);
    set("#phase21-7-unsafe-flags", summary.unsafe_flags);
    set("#phase21-7-next-step", summary.next_recommended_step);
    set("#phase21-7-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-7-private-local-post-draft-pr-creation-stability-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-7-private-local-post-draft-pr-creation-stability-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.post_draft_pr_creation_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalPostDraftPrCreationStabilityChecklist(panel, storage) {
    if (storage) storage.setItem("phase217PrivateLocalPostDraftPrCreationStabilityChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalPostDraftPrCreationStabilityChecklist(options = {}) {
    const panel = runPrivateLocalPostDraftPrCreationStabilityChecklist(options);
    persistPrivateLocalPostDraftPrCreationStabilityChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalPostDraftPrCreationStabilityChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-7-private-local-post-draft-pr-creation-stability-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostDraftPrCreationStabilityChecklist());
      if (document.querySelector("#phase21-7-private-local-post-draft-pr-creation-stability-checklist-builder")) runAndRenderPrivateLocalPostDraftPrCreationStabilityChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    POST_DRAFT_PR_CREATION_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_5_PREREQUISITE,
    PHASE21_6_PREREQUISITE,
    PHASE21_4_DRAFT_PR,
    PHASE21_5_DRAFT_PR,
    PHASE21_6_DRAFT_PR,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalPostDraftPrCreationStabilityChecklist,
    runPrivateLocalPostDraftPrCreationStabilityChecklist,
    renderPrivateLocalPostDraftPrCreationStabilityChecklist,
    persistPrivateLocalPostDraftPrCreationStabilityChecklist,
    runAndRenderPrivateLocalPostDraftPrCreationStabilityChecklist
  };
});
