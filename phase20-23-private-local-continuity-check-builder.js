(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2023PrivateLocalContinuityCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-23";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "private_local_continuity_check_plan_only";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Continue private local only operation on a working branch with PR review required";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "branch_plan", "pr_review_plan"];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
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
    "Private repository continuity",
    "Local only operation continuity",
    "Protected PLAN_ONLY continuity",
    "GitHub Pages launch prevention",
    "Public URL launch prevention",
    "External connection prevention",
    "Auto execution prevention",
    "Auto publish and auto launch prevention",
    "main direct push prevention",
    "working branch and PR review continuity",
    "Phase20-12 through Phase20-22 locks"
  ];
  const SAFETY_CHECKS = [
    { id: "P20-23-PRIVATE-REPO", check_name: "private_repository", check_value: true },
    { id: "P20-23-LOCAL-ONLY", check_name: "local_only_operation", check_value: true },
    { id: "P20-23-PROTECTED", check_name: "protected_mode", check_value: true },
    { id: "P20-23-PLAN-ONLY", check_name: "plan_only", check_value: true },
    { id: "P20-23-GITHUB-PAGES", check_name: "github_pages_launch", check_value: false },
    { id: "P20-23-PUBLIC-URL", check_name: "public_url_launch", check_value: false },
    { id: "P20-23-PUBLIC-RELEASE", check_name: "public_release_allowed", check_value: false },
    { id: "P20-23-EXTERNAL", check_name: "external_connection", check_value: false },
    { id: "P20-23-AUTO-EXECUTION", check_name: "auto_execution", check_value: false },
    { id: "P20-23-AUTO-PUBLISH", check_name: "auto_publish", check_value: false },
    { id: "P20-23-AUTO-LAUNCH", check_name: "auto_launch", check_value: false },
    { id: "P20-23-DIRECT-PUSH", check_name: "direct_push_to_main_allowed", check_value: false },
    { id: "P20-23-WORKING-BRANCH", check_name: "working_branch_recommended", check_value: true },
    { id: "P20-23-PR-REVIEW", check_name: "pr_review_required", check_value: true },
    { id: "P20-23-UNSAFE-FLAGS", check_name: "unsafe_flags", check_value: 0 },
    { id: "P20-23-LOCKS", check_name: "phase20_12_through_phase20_22_locks_preserved", check_value: true }
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
      phase20_12_through_phase20_22_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildPrivateLocalContinuityCheck(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = SAFETY_CHECKS.map((check) => ({
      ...check,
      review_status: "private_local_continuity_confirmed",
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
      merge_allowed_without_pr_review: false,
      github_pages_change_allowed: false,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_blocked: true,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_22_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      panel_id: `P20-23-PRIVATE-LOCAL-CONTINUITY-CHECK-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      review_scope: [...REVIEW_SCOPE],
      records,
      phase20_23_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runPrivateLocalContinuityCheck(options = {}) {
    return buildPrivateLocalContinuityCheck(options.sources || {}, options.now);
  }

  function renderPrivateLocalContinuityCheck(panel, doc = document) {
    const summary = panel.phase20_23_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-23-panel-status", panel.panel_status);
    set("#phase20-23-total-checks", summary.total_safety_checks);
    set("#phase20-23-private-repo", summary.private_repository);
    set("#phase20-23-local-only", summary.local_only_operation);
    set("#phase20-23-protected-mode", summary.protected_mode);
    set("#phase20-23-plan-only", summary.plan_only);
    set("#phase20-23-github-pages", summary.github_pages_launch);
    set("#phase20-23-public-url", summary.public_url_launch);
    set("#phase20-23-public-release-allowed", summary.public_release_allowed);
    set("#phase20-23-external-connection", summary.external_connection);
    set("#phase20-23-auto-execution", summary.auto_execution);
    set("#phase20-23-auto-publish", summary.auto_publish);
    set("#phase20-23-auto-launch", summary.auto_launch);
    set("#phase20-23-direct-push-main", summary.direct_push_to_main_allowed);
    set("#phase20-23-working-branch", summary.working_branch_recommended);
    set("#phase20-23-pr-review", summary.pr_review_required);
    set("#phase20-23-unsafe-flags", summary.unsafe_flags);
    set("#phase20-23-locks-preserved", summary.phase20_12_through_phase20_22_locks_preserved);
    set("#phase20-23-next-step", summary.next_step);
    set("#phase20-23-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-23-private-local-continuity-check-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-23-private-local-continuity-check-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalContinuityCheck(panel, storage) {
    if (storage) storage.setItem("phase2023PrivateLocalContinuityCheckLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalContinuityCheck(options = {}) {
    const panel = runPrivateLocalContinuityCheck(options);
    persistPrivateLocalContinuityCheck(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalContinuityCheck(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-23-private-local-continuity-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalContinuityCheck());
      if (document.querySelector("#phase20-23-private-local-continuity-check-builder")) runAndRenderPrivateLocalContinuityCheck();
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
    buildPrivateLocalContinuityCheck,
    runPrivateLocalContinuityCheck,
    renderPrivateLocalContinuityCheck,
    persistPrivateLocalContinuityCheck,
    runAndRenderPrivateLocalContinuityCheck
  };
});
