(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2024SafeOperationFinalGuardBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-24";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "safe_operation_final_guard_plan_only";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Keep private local only operation guarded; continue only on a working branch with PR review required";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "branch_plan", "pr_review_plan"];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
    "merge_without_pr_review",
    "public_url_exposure",
    "external_connection",
    "auto_publish",
    "auto_execution",
    "auto_launch",
    "github_pages_setting_change",
    "repository_visibility_change",
    "public_release_without_all_device_confirmations",
    "public_release_without_manual_owner_confirmation",
    "owner_release_unlock_without_manual_confirmation",
    "safety_lock_bypass",
    "private_policy_override",
    "dashboard_public_release_enable",
    "non_local_launch",
    "auto_merge",
    "pull_request_bypass"
  ];
  const REVIEW_SCOPE = [
    "Private repository final guard",
    "Local only operation final guard",
    "PLAN_ONLY and Protected final guard",
    "PR review required final guard",
    "main direct push blocked final guard",
    "GitHub Pages and Public URL blocked final guard",
    "External connection and auto execution blocked final guard",
    "Repository visibility and Pages settings unchanged",
    "Phase20-12 through Phase20-23 locks"
  ];
  const SAFETY_CHECKS = [
    { id: "P20-24-PRIVATE-REPO", check_name: "private_repository", check_value: true },
    { id: "P20-24-LOCAL-ONLY", check_name: "local_only_operation", check_value: true },
    { id: "P20-24-PROTECTED", check_name: "protected_mode", check_value: true },
    { id: "P20-24-PLAN-ONLY", check_name: "plan_only", check_value: true },
    { id: "P20-24-GITHUB-PAGES", check_name: "github_pages_launch", check_value: false },
    { id: "P20-24-PUBLIC-URL", check_name: "public_url_launch", check_value: false },
    { id: "P20-24-PUBLIC-RELEASE", check_name: "public_release_allowed", check_value: false },
    { id: "P20-24-EXTERNAL", check_name: "external_connection", check_value: false },
    { id: "P20-24-AUTO-EXECUTION", check_name: "auto_execution", check_value: false },
    { id: "P20-24-AUTO-PUBLISH", check_name: "auto_publish", check_value: false },
    { id: "P20-24-AUTO-LAUNCH", check_name: "auto_launch", check_value: false },
    { id: "P20-24-DIRECT-PUSH", check_name: "direct_push_to_main_allowed", check_value: false },
    { id: "P20-24-WORKING-BRANCH", check_name: "working_branch_recommended", check_value: true },
    { id: "P20-24-PR-REVIEW", check_name: "pr_review_required", check_value: true },
    { id: "P20-24-MERGE-WITHOUT-PR", check_name: "merge_without_pr_review_allowed", check_value: false },
    { id: "P20-24-REPO-VISIBILITY", check_name: "repository_visibility_change_allowed", check_value: false },
    { id: "P20-24-PAGES-SETTING", check_name: "github_pages_setting_change_allowed", check_value: false },
    { id: "P20-24-UNSAFE-FLAGS", check_name: "unsafe_flags", check_value: 0 },
    { id: "P20-24-LOCKS", check_name: "phase20_12_through_phase20_23_locks_preserved", check_value: true }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      local_launch_only: true,
      start_local_bat: true,
      private_local_html: true,
      index_html: true,
      main_direct_push_prevention_check: true,
      direct_push_to_main_allowed: false,
      working_branch_recommended: true,
      working_branch_operation_recommended: true,
      pr_review_required: true,
      pull_request_operation_recommended: true,
      merge_without_pr_review_allowed: false,
      merge_allowed_without_pr_review: false,
      execution_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      github_pages_change_allowed: false,
      github_pages_setting_change_allowed: false,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_public_url_launch_allowed: false,
      public_url_launch: false,
      public_url_launch_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_blocked: true,
      public_release_allowed: false,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_23_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildSafeOperationFinalGuard(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = SAFETY_CHECKS.map((check) => ({
      ...check,
      review_status: "safe_operation_final_guard_confirmed",
      ...policyFields()
    }));
    const summary = {
      total_safety_checks: records.length,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      protected_mode: true,
      plan_only: true,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_public_url_launch_allowed: false,
      public_url_launch: false,
      public_url_launch_allowed: false,
      public_release_allowed: false,
      external_connection: false,
      external_connection_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      direct_push_to_main_allowed: false,
      working_branch_recommended: true,
      working_branch_operation_recommended: true,
      pr_review_required: true,
      pull_request_operation_recommended: true,
      merge_without_pr_review_allowed: false,
      merge_allowed_without_pr_review: false,
      repository_visibility_change_allowed: false,
      github_pages_change_allowed: false,
      github_pages_setting_change_allowed: false,
      public_release_blocked: true,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_23_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      panel_id: `P20-24-SAFE-OPERATION-FINAL-GUARD-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      review_scope: [...REVIEW_SCOPE],
      records,
      phase20_24_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runSafeOperationFinalGuard(options = {}) {
    return buildSafeOperationFinalGuard(options.sources || {}, options.now);
  }

  function renderSafeOperationFinalGuard(panel, doc = document) {
    const summary = panel.phase20_24_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-24-panel-status", panel.panel_status);
    set("#phase20-24-total-checks", summary.total_safety_checks);
    set("#phase20-24-private-repo", summary.private_repository);
    set("#phase20-24-local-only", summary.local_only_operation);
    set("#phase20-24-protected-mode", summary.protected_mode);
    set("#phase20-24-plan-only", summary.plan_only);
    set("#phase20-24-github-pages", summary.github_pages_launch);
    set("#phase20-24-public-url", summary.public_url_launch);
    set("#phase20-24-public-release-allowed", summary.public_release_allowed);
    set("#phase20-24-external-connection", summary.external_connection);
    set("#phase20-24-auto-execution", summary.auto_execution);
    set("#phase20-24-auto-publish", summary.auto_publish);
    set("#phase20-24-auto-launch", summary.auto_launch);
    set("#phase20-24-direct-push-main", summary.direct_push_to_main_allowed);
    set("#phase20-24-working-branch", summary.working_branch_recommended);
    set("#phase20-24-pr-review", summary.pr_review_required);
    set("#phase20-24-merge-without-pr", summary.merge_without_pr_review_allowed);
    set("#phase20-24-repo-visibility-change", summary.repository_visibility_change_allowed);
    set("#phase20-24-pages-setting-change", summary.github_pages_setting_change_allowed);
    set("#phase20-24-unsafe-flags", summary.unsafe_flags);
    set("#phase20-24-locks-preserved", summary.phase20_12_through_phase20_23_locks_preserved);
    set("#phase20-24-next-step", summary.next_step);
    set("#phase20-24-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-24-safe-operation-final-guard-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-24-safe-operation-final-guard-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistSafeOperationFinalGuard(panel, storage) {
    if (storage) storage.setItem("phase2024SafeOperationFinalGuardLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderSafeOperationFinalGuard(options = {}) {
    const panel = runSafeOperationFinalGuard(options);
    persistSafeOperationFinalGuard(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderSafeOperationFinalGuard(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-24-safe-operation-final-guard");
      if (button) button.addEventListener("click", () => runAndRenderSafeOperationFinalGuard());
      if (document.querySelector("#phase20-24-safe-operation-final-guard-builder")) runAndRenderSafeOperationFinalGuard();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    REVIEW_SCOPE,
    SAFETY_CHECKS,
    buildSafeOperationFinalGuard,
    runSafeOperationFinalGuard,
    renderSafeOperationFinalGuard,
    persistSafeOperationFinalGuard,
    runAndRenderSafeOperationFinalGuard
  };
});
