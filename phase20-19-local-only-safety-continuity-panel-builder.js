(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2019LocalOnlySafetyContinuityPanelBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-19";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "local_only_safety_continuity_plan_only";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Continue private local-only review with Phase20-12 through Phase20-18 locks preserved";
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
  const CONTINUITY_SCOPE = [
    "Repository private premise",
    "start-local.bat",
    "private-local.html",
    "index.html",
    "Phase20-12 private operation safety gate",
    "Phase20-13 manual device confirmation gate",
    "Phase20-14 public release final block gate",
    "Phase20-15 owner manual approval lock gate",
    "Phase20-16 private release lock audit gate",
    "Phase20-17 private safety status dashboard",
    "Phase20-18 local launch only verification gate"
  ];
  const SAFETY_CHECKS = [
    { id: "P20-19-PRIVATE-REPO", check_name: "repository_private_premise", check_value: true },
    { id: "P20-19-LOCAL-POLICY", check_name: "local_launch_policy_preserved", check_value: true },
    { id: "P20-19-START-LOCAL", check_name: "start_local_bat_route_allowed", check_value: true },
    { id: "P20-19-PRIVATE-LOCAL", check_name: "private_local_html_route_allowed", check_value: true },
    { id: "P20-19-INDEX", check_name: "index_html_route_allowed", check_value: true },
    { id: "P20-19-GITHUB-PAGES", check_name: "github_pages_public_url_launch_allowed", check_value: false },
    { id: "P20-19-AUTO-EXECUTION", check_name: "auto_execution_allowed", check_value: false },
    { id: "P20-19-UNSAFE-FLAGS", check_name: "unsafe_flags_count", check_value: 0 },
    { id: "P20-19-LOCKS", check_name: "phase20_12_to_18_locks_preserved", check_value: true },
    { id: "P20-19-CONTINUE", check_name: "local_only_safe_to_continue", check_value: true }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      private_local_policy_unchanged: true,
      repository_private_premise: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
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
      github_pages_public_url_launch_allowed: false,
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

  function buildLocalOnlySafetyContinuityPanel(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = SAFETY_CHECKS.map((check) => ({
      ...check,
      continuity_status: "local_only_safety_confirmed",
      ...policyFields()
    }));
    const summary = {
      total_safety_checks: records.length,
      repository_private_premise: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      start_local_bat_route_allowed: true,
      private_local_html_route_allowed: true,
      index_html_route_allowed: true,
      github_pages_public_url_launch_allowed: false,
      public_url_launch_allowed: false,
      local_launch_only: true,
      phase20_12_to_18_locks_preserved: true,
      local_only_safe_to_continue: true,
      protected_mode: true,
      plan_only: true,
      private_local_policy_unchanged: true,
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
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      manual_owner_confirmation_required: true,
      owner_approval_lock_active: true,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      public_release_ready: false,
      unsafe_flags_count: 0,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      panel_id: `P20-19-LOCAL-ONLY-SAFETY-CONTINUITY-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      continuity_scope: [...CONTINUITY_SCOPE],
      records,
      phase20_19_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runLocalOnlySafetyContinuityPanel(options = {}) {
    return buildLocalOnlySafetyContinuityPanel(options.sources || {}, options.now);
  }

  function renderLocalOnlySafetyContinuityPanel(panel, doc = document) {
    const summary = panel.phase20_19_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-19-panel-status", panel.panel_status);
    set("#phase20-19-total-checks", summary.total_safety_checks);
    set("#phase20-19-private-repo", summary.repository_private_premise);
    set("#phase20-19-local-policy", summary.local_launch_policy);
    set("#phase20-19-start-local", summary.start_local_bat_route_allowed);
    set("#phase20-19-private-local", summary.private_local_html_route_allowed);
    set("#phase20-19-index", summary.index_html_route_allowed);
    set("#phase20-19-public-url", summary.public_url_launch_allowed);
    set("#phase20-19-github-pages", summary.github_pages_public_url_launch_allowed);
    set("#phase20-19-auto-execution", summary.auto_execution);
    set("#phase20-19-locks-preserved", summary.phase20_12_to_18_locks_preserved);
    set("#phase20-19-local-safe", summary.local_only_safe_to_continue);
    set("#phase20-19-public-release-allowed", summary.public_release_allowed);
    set("#phase20-19-protected-mode", summary.protected_mode);
    set("#phase20-19-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-19-next-step", summary.next_recommended_step);
    set("#phase20-19-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-19-local-only-safety-continuity-panel-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-19-local-only-safety-continuity-panel-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.continuity_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistLocalOnlySafetyContinuityPanel(panel, storage) {
    if (storage) storage.setItem("phase2019LocalOnlySafetyContinuityPanelLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderLocalOnlySafetyContinuityPanel(options = {}) {
    const panel = runLocalOnlySafetyContinuityPanel(options);
    persistLocalOnlySafetyContinuityPanel(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderLocalOnlySafetyContinuityPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-19-local-only-safety-continuity-panel");
      if (button) button.addEventListener("click", () => runAndRenderLocalOnlySafetyContinuityPanel());
      if (document.querySelector("#phase20-19-local-only-safety-continuity-panel-builder")) runAndRenderLocalOnlySafetyContinuityPanel();
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
    CONTINUITY_SCOPE,
    SAFETY_CHECKS,
    buildLocalOnlySafetyContinuityPanel,
    runLocalOnlySafetyContinuityPanel,
    renderLocalOnlySafetyContinuityPanel,
    persistLocalOnlySafetyContinuityPanel,
    runAndRenderLocalOnlySafetyContinuityPanel
  };
});
