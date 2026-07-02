(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase216PrivateLocalDraftPrChainReadinessChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-6";
  const CHECKLIST_NAME = "Private Local Draft PR Chain Readiness Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_6_private_local_draft_pr_chain_readiness_checklist_plan_only";
  const CHAIN_READINESS_STATUS = "DRAFT_PR_CHAIN_REVIEW_READY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_4_PREREQUISITE = "DISPLAY_RECOVERY_REVIEW_READY";
  const PHASE21_5_PREREQUISITE = "POST_PR_REVIEW_STABILITY_READY";
  const PHASE21_4_DRAFT_PR = "PR #198 Draft";
  const PHASE21_5_DRAFT_PR = "PR #199 Draft";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Keep Phase21-4, Phase21-5, and Phase21-6 as draft PR chain review work until manual local checks and protected merge-before checks are complete";
  const CHECKS = [
    { id: "P21-6-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-6-P21-4-CHECKLIST", label: "Phase21-4 Display Recovery Checklist route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-6-P21-5-CHECKLIST", label: "Phase21-5 Post PR Review Stability Checklist route preserved", area: "prerequisite", device: "all", status: "Confirmed" },
    { id: "P21-6-PR198-DRAFT", label: "Phase21-4 PR #198 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-6-PR199-DRAFT", label: "Phase21-5 PR #199 remains draft and unmerged", area: "draft_pr_chain", device: "all", status: "ManualReviewRequired" },
    { id: "P21-6-BASE-COMPARE", label: "Phase21-6 base is Phase21-5 branch and compare is Phase21-6 branch", area: "draft_pr_chain", device: "all", status: "Confirmed" },
    { id: "P21-6-CHAIN-ORDER", label: "Draft PR order remains Phase21-4 then Phase21-5 then Phase21-6", area: "draft_pr_chain", device: "all", status: "Confirmed" },
    { id: "P21-6-MAIN-UNCHANGED", label: "main remains clean and no Phase21-4/5/6 merge is assumed", area: "branch_hygiene", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-6-HOME-PC-CHAIN", label: "Home PC confirms chained local display after Phase21-6 addition", area: "device_review", device: "Home PC", status: "ManualReviewRequired" },
    { id: "P21-6-COMPANY-PC-CHAIN", label: "Company PC confirms chained local display after Phase21-6 addition", area: "device_review", device: "Company PC", status: "ManualReviewRequired" },
    { id: "P21-6-IPAD-CHAIN", label: "iPad confirms chained private repository display review after Phase21-6 addition", area: "device_review", device: "iPad", status: "ManualReviewRequired" },
    { id: "P21-6-PRIVATE-LOCAL", label: "private-local.html route includes Phase21-6 without public URL dependency", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-6-INDEX-DISPLAY", label: "index.html displays Phase21-6 without altering prior panels", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-6-DASHBOARD-STYLE", label: "dashboard.css adds Phase21-6 styling only", area: "display", device: "all", status: "Confirmed" },
    { id: "P21-6-README-CHAIN", label: "README documents the draft PR chain readiness policy", area: "documentation", device: "all", status: "Confirmed" },
    { id: "P21-6-REVIEW-FEEDBACK", label: "Review feedback remains manual and local-test backed", area: "review_response", device: "all", status: "Confirmed" },
    { id: "P21-6-POST-PULL", label: "After pull or review update, rerun local display and related tests", area: "verification", device: "Home PC / Company PC", status: "Confirmed" },
    { id: "P21-6-PHASE-TESTS", label: "Phase20 and Phase21 related tests remain required before merge decisions", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-6-CONFLICT-SAFETY", label: "Conflict markers and unsafe flags are checked before any ready-for-review or merge decision", area: "verification", device: "all", status: "Confirmed" },
    { id: "P21-6-RECOVERY-HOLD", label: "If chained display breaks, keep all affected PRs draft until fixed", area: "recovery", device: "all", status: "Confirmed" },
    { id: "P21-6-PRIVATE-FIRST", label: "Private local-first policy remains the operating premise", area: "policy", device: "all", status: "Confirmed" },
    { id: "P21-6-NO-PUBLIC-PUBLISH", label: "Web or GitHub Pages public publishing remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-6-NO-PUBLIC-URL", label: "Public URL guidance remains blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-6-NO-EXTERNAL-API", label: "External API connection and submission remain blocked", area: "blocked", device: "all", status: "Blocked" },
    { id: "P21-6-NO-AUTO-MERGE", label: "Auto execution, ready-for-review transition, direct main push, and merge remain blocked", area: "blocked", device: "all", status: "Blocked" }
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
      draft_pr_chain_readiness_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_4_prerequisite: PHASE21_4_PREREQUISITE,
      phase21_5_prerequisite: PHASE21_5_PREREQUISITE,
      phase21_4_draft_pr: PHASE21_4_DRAFT_PR,
      phase21_5_draft_pr: PHASE21_5_DRAFT_PR,
      phase20_completion_final_closure_preserved: true,
      phase21_4_display_recovery_checklist_preserved: true,
      phase21_5_post_pr_review_stability_checklist_preserved: true,
      phase21_4_merge_allowed: false,
      phase21_5_merge_allowed: false,
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
      chain_readiness_status: item.status === "Blocked" ? "blocked_by_draft_pr_chain_policy" : item.status === "ManualReviewRequired" ? "pending_manual_chain_review" : "draft_pr_chain_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalDraftPrChainReadinessChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKS.map(buildCheckRecord);
    const summary = {
      total_checks: records.length,
      confirmed_checks: records.filter((record) => record.status === "Confirmed").length,
      manual_review_required_checks: records.filter((record) => record.status === "ManualReviewRequired").length,
      blocked_checks: records.filter((record) => record.status === "Blocked").length,
      chain_readiness_status: CHAIN_READINESS_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_first_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      draft_pr_chain_readiness_only: true,
      phase21_4_draft_pr_review_required: true,
      phase21_5_draft_pr_review_required: true,
      phase21_4_merge_allowed: false,
      phase21_5_merge_allowed: false,
      draft_pr_chain_order_confirmed: true,
      base_compare_chain_required: true,
      home_pc_chain_confirmation_required: true,
      company_pc_chain_confirmation_required: true,
      ipad_chain_confirmation_required: true,
      private_local_launch_check_required: true,
      index_display_check_required: true,
      dashboard_route_check_required: true,
      post_pull_update_check_required: true,
      recovery_hold_required: true,
      merge_before_check_required: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_4_prerequisite: PHASE21_4_PREREQUISITE,
      phase21_5_prerequisite: PHASE21_5_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_4_display_recovery_checklist_preserved: true,
      phase21_5_post_pr_review_stability_checklist_preserved: true,
      phase21_6_route_added: true,
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
      panel_id: `PHASE21-6-DRAFT-PR-CHAIN-READINESS-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      chain_readiness_status: CHAIN_READINESS_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_6_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalDraftPrChainReadinessChecklist(options = {}) {
    return buildPrivateLocalDraftPrChainReadinessChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalDraftPrChainReadinessChecklist(panel, doc = document) {
    const summary = panel.phase21_6_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-6-panel-status", panel.panel_status);
    set("#phase21-6-chain-readiness-status", panel.chain_readiness_status);
    set("#phase21-6-total-checks", summary.total_checks);
    set("#phase21-6-confirmed-checks", summary.confirmed_checks);
    set("#phase21-6-manual-checks", summary.manual_review_required_checks);
    set("#phase21-6-blocked-checks", summary.blocked_checks);
    set("#phase21-6-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-6-phase21-4-preserved", summary.phase21_4_display_recovery_checklist_preserved);
    set("#phase21-6-phase21-5-preserved", summary.phase21_5_post_pr_review_stability_checklist_preserved);
    set("#phase21-6-pr198-review", summary.phase21_4_draft_pr_review_required);
    set("#phase21-6-pr199-review", summary.phase21_5_draft_pr_review_required);
    set("#phase21-6-chain-order", summary.draft_pr_chain_order_confirmed);
    set("#phase21-6-base-compare", summary.base_compare_chain_required);
    set("#phase21-6-private-local", summary.private_local_launch_check_required);
    set("#phase21-6-index-display", summary.index_display_check_required);
    set("#phase21-6-dashboard-route", summary.dashboard_route_check_required);
    set("#phase21-6-post-pull", summary.post_pull_update_check_required);
    set("#phase21-6-recovery-hold", summary.recovery_hold_required);
    set("#phase21-6-merge-check", summary.merge_before_check_required);
    set("#phase21-6-local-first", summary.local_first_operation);
    set("#phase21-6-plan-only", summary.plan_only);
    set("#phase21-6-protected", summary.protected_mode);
    set("#phase21-6-no-pages", summary.github_pages_setting_change_allowed);
    set("#phase21-6-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-6-no-external-api", summary.external_api_connection);
    set("#phase21-6-no-auto", summary.auto_execution);
    set("#phase21-6-no-ready", summary.auto_ready_for_review_allowed);
    set("#phase21-6-merge", summary.merge_allowed);
    set("#phase21-6-unsafe-flags", summary.unsafe_flags);
    set("#phase21-6-next-step", summary.next_recommended_step);
    set("#phase21-6-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-6-private-local-draft-pr-chain-readiness-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-6-private-local-draft-pr-chain-readiness-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / area:${record.area} / device:${record.device} / ${record.status} / ${record.chain_readiness_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalDraftPrChainReadinessChecklist(panel, storage) {
    if (storage) storage.setItem("phase216PrivateLocalDraftPrChainReadinessChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalDraftPrChainReadinessChecklist(options = {}) {
    const panel = runPrivateLocalDraftPrChainReadinessChecklist(options);
    persistPrivateLocalDraftPrChainReadinessChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalDraftPrChainReadinessChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-6-private-local-draft-pr-chain-readiness-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalDraftPrChainReadinessChecklist());
      if (document.querySelector("#phase21-6-private-local-draft-pr-chain-readiness-checklist-builder")) runAndRenderPrivateLocalDraftPrChainReadinessChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    CHAIN_READINESS_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_4_PREREQUISITE,
    PHASE21_5_PREREQUISITE,
    PHASE21_4_DRAFT_PR,
    PHASE21_5_DRAFT_PR,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalDraftPrChainReadinessChecklist,
    runPrivateLocalDraftPrChainReadinessChecklist,
    renderPrivateLocalDraftPrChainReadinessChecklist,
    persistPrivateLocalDraftPrChainReadinessChecklist,
    runAndRenderPrivateLocalDraftPrChainReadinessChecklist
  };
});
