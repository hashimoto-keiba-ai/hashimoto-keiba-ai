(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2021PostCompletionSafeOperationLockPanelBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-21";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "post_completion_safe_operation_lock_plan_only";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Continue only with private local safe operation";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view"];
  const BLOCKED_ACTIONS = [
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
    "non_local_launch"
  ];
  const REVIEW_SCOPE = [
    "Repository private premise",
    "Local only operation",
    "start-local.bat",
    "private-local.html",
    "index.html",
    "Phase20-12 private operation safety gate",
    "Phase20-13 manual device confirmation gate",
    "Phase20-14 public release final block gate",
    "Phase20-15 owner manual approval lock gate",
    "Phase20-16 private release lock audit gate",
    "Phase20-17 private safety status dashboard",
    "Phase20-18 local launch only verification gate",
    "Phase20-19 local only safety continuity panel",
    "Phase20-20 final safety continuity review panel"
  ];
  const SAFETY_CHECKS = [
    { id: "P20-21-PRIVATE-REPO", check_name: "private_repository", check_value: true },
    { id: "P20-21-LOCAL-ONLY", check_name: "local_only_operation", check_value: true },
    { id: "P20-21-START-LOCAL", check_name: "start_local_bat", check_value: true },
    { id: "P20-21-PRIVATE-LOCAL", check_name: "private_local_html", check_value: true },
    { id: "P20-21-INDEX", check_name: "index_html", check_value: true },
    { id: "P20-21-GITHUB-PAGES", check_name: "github_pages_launch", check_value: false },
    { id: "P20-21-PUBLIC-URL", check_name: "public_url_launch", check_value: false },
    { id: "P20-21-PUBLIC-RELEASE", check_name: "public_release_allowed", check_value: false },
    { id: "P20-21-AUTO-EXECUTION", check_name: "auto_execution", check_value: false },
    { id: "P20-21-EXTERNAL", check_name: "external_connection", check_value: false },
    { id: "P20-21-PROTECTED", check_name: "protected_mode", check_value: true },
    { id: "P20-21-PLAN-ONLY", check_name: "plan_only", check_value: true },
    { id: "P20-21-UNSAFE-FLAGS", check_name: "unsafe_flags", check_value: 0 },
    { id: "P20-21-LOCKS", check_name: "phase20_12_through_phase20_20_locks_preserved", check_value: true },
    { id: "P20-21-NEXT", check_name: "next_step", check_value: NEXT_RECOMMENDED_STEP }
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
      manual_confirmation_required_before_public_release: true,
      manual_owner_confirmation_required: true,
      owner_approval_lock_active: true,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_20_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildPostCompletionSafeOperationLockPanel(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = SAFETY_CHECKS.map((check) => ({
      ...check,
      review_status: "post_completion_safe_operation_locked",
      ...policyFields()
    }));
    const summary = {
      total_safety_checks: records.length,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      start_local_bat: true,
      private_local_html: true,
      index_html: true,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_public_url_launch_allowed: false,
      public_url_launch: false,
      public_url_launch_allowed: false,
      public_release_allowed: false,
      local_launch_only: true,
      protected_mode: true,
      plan_only: true,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      github_pages_change_allowed: false,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_blocked: true,
      manual_confirmation_required_before_public_release: true,
      manual_owner_confirmation_required: true,
      owner_approval_lock_active: true,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_20_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      panel_id: `P20-21-POST-COMPLETION-SAFE-OPERATION-LOCK-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      review_scope: [...REVIEW_SCOPE],
      records,
      phase20_21_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runPostCompletionSafeOperationLockPanel(options = {}) {
    return buildPostCompletionSafeOperationLockPanel(options.sources || {}, options.now);
  }

  function renderPostCompletionSafeOperationLockPanel(panel, doc = document) {
    const summary = panel.phase20_21_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-21-panel-status", panel.panel_status);
    set("#phase20-21-total-checks", summary.total_safety_checks);
    set("#phase20-21-private-repo", summary.private_repository);
    set("#phase20-21-local-only", summary.local_only_operation);
    set("#phase20-21-start-local", summary.start_local_bat);
    set("#phase20-21-private-local", summary.private_local_html);
    set("#phase20-21-index", summary.index_html);
    set("#phase20-21-github-pages", summary.github_pages_launch);
    set("#phase20-21-public-url", summary.public_url_launch);
    set("#phase20-21-public-release-allowed", summary.public_release_allowed);
    set("#phase20-21-auto-execution", summary.auto_execution);
    set("#phase20-21-external-connection", summary.external_connection);
    set("#phase20-21-protected-mode", summary.protected_mode);
    set("#phase20-21-plan-only", summary.plan_only);
    set("#phase20-21-unsafe-flags", summary.unsafe_flags);
    set("#phase20-21-locks-preserved", summary.phase20_12_through_phase20_20_locks_preserved);
    set("#phase20-21-next-step", summary.next_step);
    set("#phase20-21-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-21-post-completion-safe-operation-lock-panel-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-21-post-completion-safe-operation-lock-panel-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPostCompletionSafeOperationLockPanel(panel, storage) {
    if (storage) storage.setItem("phase2021PostCompletionSafeOperationLockPanelLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPostCompletionSafeOperationLockPanel(options = {}) {
    const panel = runPostCompletionSafeOperationLockPanel(options);
    persistPostCompletionSafeOperationLockPanel(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPostCompletionSafeOperationLockPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-21-post-completion-safe-operation-lock-panel");
      if (button) button.addEventListener("click", () => runAndRenderPostCompletionSafeOperationLockPanel());
      if (document.querySelector("#phase20-21-post-completion-safe-operation-lock-panel-builder")) runAndRenderPostCompletionSafeOperationLockPanel();
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
    buildPostCompletionSafeOperationLockPanel,
    runPostCompletionSafeOperationLockPanel,
    renderPostCompletionSafeOperationLockPanel,
    persistPostCompletionSafeOperationLockPanel,
    runAndRenderPostCompletionSafeOperationLockPanel
  };
});
