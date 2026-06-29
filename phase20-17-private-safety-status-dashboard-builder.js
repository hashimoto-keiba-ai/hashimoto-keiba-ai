(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2017PrivateSafetyStatusDashboardBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-17";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const DASHBOARD_STATUS = "private_safety_status_dashboard_plan_only";
  const NEXT_RECOMMENDED_STEP = "Continue private/local-only operation while all public release locks remain active";
  const DASHBOARD_RULE = "Display private safety status only; do not enable public release, external connection, auto publish, or auto execution.";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view"];
  const BLOCKED_ACTIONS = [
    "public_url_exposure",
    "external_connection",
    "auto_publish",
    "auto_execution",
    "github_pages_setting_change",
    "repository_visibility_change",
    "public_release_without_all_device_confirmations",
    "public_release_without_manual_owner_confirmation",
    "owner_release_unlock_without_manual_confirmation",
    "safety_lock_bypass",
    "private_policy_override",
    "dashboard_public_release_enable"
  ];
  const DASHBOARD_SCOPE = [
    "Phase20-12 private operation safety gate",
    "Phase20-13 manual device confirmation gate",
    "Phase20-14 public release final block gate",
    "Phase20-15 owner manual approval lock gate",
    "Phase20-16 private release lock audit gate"
  ];

  const DISPLAY_CHECKS = [
    { id: "P20-17-P20-12", check_name: "phase20_12_status", check_value: "locked" },
    { id: "P20-17-P20-13", check_name: "phase20_13_status", check_value: "locked" },
    { id: "P20-17-P20-14", check_name: "phase20_14_status", check_value: "blocked" },
    { id: "P20-17-P20-15", check_name: "phase20_15_status", check_value: "owner_locked" },
    { id: "P20-17-P20-16", check_name: "phase20_16_status", check_value: "audit_pass" },
    { id: "P20-17-PRIVATE-LOCAL", check_name: "private_local_operation", check_value: true },
    { id: "P20-17-PUBLIC-BLOCKED", check_name: "public_release_blocked", check_value: true },
    { id: "P20-17-EXTERNAL", check_name: "external_connection_detected", check_value: false },
    { id: "P20-17-AUTO-PUBLISH", check_name: "auto_publish_detected", check_value: false },
    { id: "P20-17-AUTO-EXECUTION", check_name: "auto_execution_detected", check_value: false },
    { id: "P20-17-GITHUB-PAGES", check_name: "github_pages_change_detected", check_value: false },
    { id: "P20-17-REPOSITORY-VISIBILITY", check_name: "repository_visibility_change_detected", check_value: false },
    { id: "P20-17-OWNER-UNLOCK", check_name: "owner_unlock_confirmed", check_value: false },
    { id: "P20-17-DEVICES", check_name: "device_confirmations_complete", check_value: false },
    { id: "P20-17-LOCAL-CONTINUE", check_name: "dashboard_safe_to_continue_local_only", check_value: true }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      private_local_policy_unchanged: true,
      execution_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      github_pages_change_allowed: false,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_blocked: true,
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      manual_owner_confirmation_required: true,
      owner_approval_lock_active: true,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      public_release_ready: false,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildPrivateSafetyStatusDashboard(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = DISPLAY_CHECKS.map((check) => ({
      ...check,
      display_status: "dashboard_safe",
      dashboard_rule: DASHBOARD_RULE,
      ...policyFields()
    }));
    const summary = {
      total_display_checks: records.length,
      phase20_12_status: "locked",
      phase20_13_status: "locked",
      phase20_14_status: "blocked",
      phase20_15_status: "owner_locked",
      phase20_16_status: "audit_pass",
      private_local_operation: true,
      public_release_blocked: true,
      external_connection_detected: false,
      auto_publish_detected: false,
      auto_execution_detected: false,
      github_pages_change_detected: false,
      repository_visibility_change_detected: false,
      owner_unlock_confirmed: false,
      device_confirmations_complete: false,
      dashboard_safe_to_continue_local_only: true,
      protected_mode: true,
      plan_only: true,
      private_local_policy_unchanged: true,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      github_pages_change_allowed: false,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      manual_owner_confirmation_required: true,
      owner_approval_lock_active: true,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      public_release_ready: false,
      unsafe_flags_count: 0,
      dashboard_rule: DASHBOARD_RULE,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      dashboard_id: `P20-17-PRIVATE-SAFETY-STATUS-${generatedAt.getTime()}`,
      dashboard_status: DASHBOARD_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      dashboard_scope: [...DASHBOARD_SCOPE],
      records,
      phase20_17_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runPrivateSafetyStatusDashboard(options = {}) {
    return buildPrivateSafetyStatusDashboard(options.sources || {}, options.now);
  }

  function renderPrivateSafetyStatusDashboard(dashboard, doc = document) {
    const summary = dashboard.phase20_17_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-17-dashboard-status", dashboard.dashboard_status);
    set("#phase20-17-total-checks", summary.total_display_checks);
    set("#phase20-17-p20-12-status", summary.phase20_12_status);
    set("#phase20-17-p20-13-status", summary.phase20_13_status);
    set("#phase20-17-p20-14-status", summary.phase20_14_status);
    set("#phase20-17-p20-15-status", summary.phase20_15_status);
    set("#phase20-17-p20-16-status", summary.phase20_16_status);
    set("#phase20-17-local-operation", summary.private_local_operation);
    set("#phase20-17-public-blocked", summary.public_release_blocked);
    set("#phase20-17-external-detected", summary.external_connection_detected);
    set("#phase20-17-auto-publish-detected", summary.auto_publish_detected);
    set("#phase20-17-auto-execution-detected", summary.auto_execution_detected);
    set("#phase20-17-owner-unlock", summary.owner_unlock_confirmed);
    set("#phase20-17-devices-complete", summary.device_confirmations_complete);
    set("#phase20-17-safe-local", summary.dashboard_safe_to_continue_local_only);
    set("#phase20-17-protected-mode", summary.protected_mode);
    set("#phase20-17-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-17-next-step", summary.next_recommended_step);
    set("#phase20-17-updated", dashboard.generated_at);
    const list = doc.querySelector("#phase20-17-private-safety-status-dashboard-list");
    if (list) {
      list.textContent = "";
      dashboard.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-17-private-safety-status-dashboard-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.display_status}`;
        list.appendChild(row);
      });
    }
    return dashboard;
  }

  function persistPrivateSafetyStatusDashboard(dashboard, storage) {
    if (storage) storage.setItem("phase2017PrivateSafetyStatusDashboardLatest", JSON.stringify(dashboard));
    return dashboard;
  }

  function runAndRenderPrivateSafetyStatusDashboard(options = {}) {
    const dashboard = runPrivateSafetyStatusDashboard(options);
    persistPrivateSafetyStatusDashboard(dashboard, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateSafetyStatusDashboard(dashboard, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-17-private-safety-status-dashboard");
      if (button) button.addEventListener("click", () => runAndRenderPrivateSafetyStatusDashboard());
      if (document.querySelector("#phase20-17-private-safety-status-dashboard-builder")) runAndRenderPrivateSafetyStatusDashboard();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    DASHBOARD_STATUS,
    NEXT_RECOMMENDED_STEP,
    DASHBOARD_RULE,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    DASHBOARD_SCOPE,
    DISPLAY_CHECKS,
    buildPrivateSafetyStatusDashboard,
    runPrivateSafetyStatusDashboard,
    renderPrivateSafetyStatusDashboard,
    persistPrivateSafetyStatusDashboard,
    runAndRenderPrivateSafetyStatusDashboard
  };
});
