(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2025FinalPrivateReleaseFreezeCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-25";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "final_private_release_freeze_check_plan_only";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const FREEZE_STATUSES = ["PASS", "HOLD", "BLOCKED"];
  const FREEZE_STATUS = "PASS";
  const NEXT_RECOMMENDED_STEP = "Keep private release frozen unless manual owner review confirms every release prerequisite";
  const OUT_OF_SCOPE_OPERATIONS = [
    "public_publish",
    "github_pages_publish",
    "external_sharing",
    "billing_integration",
    "real_ticket_auto_purchase",
    "external_api_submission"
  ];
  const RELEASE_FREEZE_CHECKLIST = [
    "repository private premise confirmed",
    "local launcher premise confirmed",
    "GitHub Pages independence confirmed",
    "external sharing prohibited",
    "secrets tokens credentials not stored",
    "manual device confirmation required",
    "rollback revert policy confirmed",
    "final pre-merge checklist required"
  ];
  const UNFREEZE_CONDITIONS = [
    "manual owner approval",
    "manual device confirmation complete",
    "working branch review complete",
    "PR review complete",
    "rollback plan confirmed",
    "unsafe flags remain zero"
  ];
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "branch_plan", "pr_review_plan", "freeze_review"];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
    "merge_without_pr_review",
    "public_publish",
    "github_pages_publish",
    "public_url_exposure",
    "external_sharing",
    "external_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_publish",
    "auto_execution",
    "auto_launch",
    "github_pages_setting_change",
    "repository_visibility_change",
    "secrets_token_credential_storage",
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
    "Final private release freeze check",
    "Repository private premise",
    "Local launcher premise",
    "GitHub Pages independence",
    "External sharing prohibition",
    "Secrets tokens credentials non-storage",
    "Manual device confirmation requirement",
    "Rollback revert policy",
    "Final pre-merge checklist",
    "Phase20-12 through Phase20-24 locks"
  ];
  const SAFETY_CHECKS = [
    { id: "P20-25-PRIVATE-REPO", check_name: "repository_private_premise_confirmed", check_value: true },
    { id: "P20-25-LOCAL-LAUNCHER", check_name: "local_launcher_premise_confirmed", check_value: true },
    { id: "P20-25-GITHUB-PAGES-INDEPENDENT", check_name: "github_pages_independence_confirmed", check_value: true },
    { id: "P20-25-EXTERNAL-SHARING", check_name: "external_sharing_prohibited", check_value: true },
    { id: "P20-25-SECRETS", check_name: "secrets_tokens_credentials_not_stored", check_value: true },
    { id: "P20-25-MANUAL-DEVICE", check_name: "manual_device_confirmation_required", check_value: true },
    { id: "P20-25-ROLLBACK", check_name: "rollback_revert_policy_confirmed", check_value: true },
    { id: "P20-25-PRE-MERGE", check_name: "final_pre_merge_checklist_required", check_value: true },
    { id: "P20-25-PUBLIC-PUBLISH", check_name: "public_publish_out_of_scope", check_value: true },
    { id: "P20-25-PAGES-PUBLISH", check_name: "github_pages_publish_out_of_scope", check_value: true },
    { id: "P20-25-BILLING", check_name: "billing_integration_out_of_scope", check_value: true },
    { id: "P20-25-TICKET", check_name: "real_ticket_auto_purchase_out_of_scope", check_value: true },
    { id: "P20-25-EXTERNAL-API", check_name: "external_api_submission_out_of_scope", check_value: true },
    { id: "P20-25-PROTECTED", check_name: "protected_mode", check_value: true },
    { id: "P20-25-PLAN-ONLY", check_name: "plan_only", check_value: true },
    { id: "P20-25-UNSAFE-FLAGS", check_name: "unsafe_flags", check_value: 0 },
    { id: "P20-25-LOCKS", check_name: "phase20_12_through_phase20_24_locks_preserved", check_value: true },
    { id: "P20-25-FREEZE", check_name: "freeze_status", check_value: FREEZE_STATUS }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      unsafe_guard: true,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      local_launcher_premise_confirmed: true,
      github_pages_independence_confirmed: true,
      external_sharing_prohibited: true,
      secrets_tokens_credentials_not_stored: true,
      manual_device_confirmation_required: true,
      rollback_revert_policy_confirmed: true,
      final_pre_merge_checklist_required: true,
      freeze_status: FREEZE_STATUS,
      freeze_statuses: [...FREEZE_STATUSES],
      unfreeze_conditions: [...UNFREEZE_CONDITIONS],
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      public_publish_out_of_scope: true,
      github_pages_publish_out_of_scope: true,
      external_sharing_out_of_scope: true,
      billing_integration_out_of_scope: true,
      real_ticket_auto_purchase_out_of_scope: true,
      external_api_submission_out_of_scope: true,
      direct_push_to_main_allowed: false,
      working_branch_recommended: true,
      pr_review_required: true,
      merge_without_pr_review_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_setting_change_allowed: false,
      github_pages_public_url_launch_allowed: false,
      public_url_launch: false,
      public_url_launch_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_allowed: false,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_24_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildFinalPrivateReleaseFreezeCheck(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = SAFETY_CHECKS.map((check) => ({
      ...check,
      freeze_review_status: "final_private_release_freeze_confirmed",
      ...policyFields()
    }));
    const summary = {
      total_safety_checks: records.length,
      freeze_status: FREEZE_STATUS,
      freeze_statuses: [...FREEZE_STATUSES],
      private_repository: true,
      local_only_operation: true,
      protected_mode: true,
      plan_only: true,
      unsafe_guard: true,
      repository_private_premise_confirmed: true,
      local_launcher_premise_confirmed: true,
      github_pages_independence_confirmed: true,
      external_sharing_prohibited: true,
      secrets_tokens_credentials_not_stored: true,
      manual_device_confirmation_required: true,
      rollback_revert_policy_confirmed: true,
      final_pre_merge_checklist_required: true,
      public_publish_out_of_scope: true,
      github_pages_publish_out_of_scope: true,
      external_sharing_out_of_scope: true,
      billing_integration_out_of_scope: true,
      real_ticket_auto_purchase_out_of_scope: true,
      external_api_submission_out_of_scope: true,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      release_freeze_checklist: [...RELEASE_FREEZE_CHECKLIST],
      unfreeze_conditions: [...UNFREEZE_CONDITIONS],
      direct_push_to_main_allowed: false,
      working_branch_recommended: true,
      pr_review_required: true,
      merge_without_pr_review_allowed: false,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_setting_change_allowed: false,
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
      repository_visibility_change_allowed: false,
      public_release_ready: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      phase20_12_through_phase20_24_locks_preserved: true,
      next_step: NEXT_RECOMMENDED_STEP,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      panel_id: `P20-25-FINAL-PRIVATE-RELEASE-FREEZE-CHECK-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      review_scope: [...REVIEW_SCOPE],
      records,
      phase20_25_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runFinalPrivateReleaseFreezeCheck(options = {}) {
    return buildFinalPrivateReleaseFreezeCheck(options.sources || {}, options.now);
  }

  function renderFinalPrivateReleaseFreezeCheck(panel, doc = document) {
    const summary = panel.phase20_25_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-25-panel-status", panel.panel_status);
    set("#phase20-25-freeze-status", summary.freeze_status);
    set("#phase20-25-total-checks", summary.total_safety_checks);
    set("#phase20-25-private-repo", summary.private_repository);
    set("#phase20-25-local-launcher", summary.local_launcher_premise_confirmed);
    set("#phase20-25-github-pages-independent", summary.github_pages_independence_confirmed);
    set("#phase20-25-external-sharing", summary.external_sharing_prohibited);
    set("#phase20-25-secrets", summary.secrets_tokens_credentials_not_stored);
    set("#phase20-25-manual-device", summary.manual_device_confirmation_required);
    set("#phase20-25-rollback", summary.rollback_revert_policy_confirmed);
    set("#phase20-25-pre-merge", summary.final_pre_merge_checklist_required);
    set("#phase20-25-public-publish", summary.public_publish_out_of_scope);
    set("#phase20-25-pages-publish", summary.github_pages_publish_out_of_scope);
    set("#phase20-25-billing", summary.billing_integration_out_of_scope);
    set("#phase20-25-ticket", summary.real_ticket_auto_purchase_out_of_scope);
    set("#phase20-25-external-api", summary.external_api_submission_out_of_scope);
    set("#phase20-25-protected-mode", summary.protected_mode);
    set("#phase20-25-plan-only", summary.plan_only);
    set("#phase20-25-unsafe-flags", summary.unsafe_flags);
    set("#phase20-25-locks-preserved", summary.phase20_12_through_phase20_24_locks_preserved);
    set("#phase20-25-next-step", summary.next_step);
    set("#phase20-25-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-25-final-private-release-freeze-check-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-25-final-private-release-freeze-check-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / freeze:${record.freeze_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistFinalPrivateReleaseFreezeCheck(panel, storage) {
    if (storage) storage.setItem("phase2025FinalPrivateReleaseFreezeCheckLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderFinalPrivateReleaseFreezeCheck(options = {}) {
    const panel = runFinalPrivateReleaseFreezeCheck(options);
    persistFinalPrivateReleaseFreezeCheck(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderFinalPrivateReleaseFreezeCheck(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-25-final-private-release-freeze-check");
      if (button) button.addEventListener("click", () => runAndRenderFinalPrivateReleaseFreezeCheck());
      if (document.querySelector("#phase20-25-final-private-release-freeze-check-builder")) runAndRenderFinalPrivateReleaseFreezeCheck();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    LOCAL_LAUNCH_POLICY,
    FREEZE_STATUSES,
    FREEZE_STATUS,
    NEXT_RECOMMENDED_STEP,
    OUT_OF_SCOPE_OPERATIONS,
    RELEASE_FREEZE_CHECKLIST,
    UNFREEZE_CONDITIONS,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    REVIEW_SCOPE,
    SAFETY_CHECKS,
    buildFinalPrivateReleaseFreezeCheck,
    runFinalPrivateReleaseFreezeCheck,
    renderFinalPrivateReleaseFreezeCheck,
    persistFinalPrivateReleaseFreezeCheck,
    runAndRenderFinalPrivateReleaseFreezeCheck
  };
});
