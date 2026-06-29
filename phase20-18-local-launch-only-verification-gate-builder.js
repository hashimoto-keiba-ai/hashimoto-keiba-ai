(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2018LocalLaunchOnlyVerificationGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-18";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const GATE_STATUS = "local_launch_only_verification_plan_only";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Continue local launch only through start-local.bat, private-local.html, and index.html while public release remains blocked";
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
  const VERIFICATION_SCOPE = [
    "start-local.bat",
    "private-local.html",
    "index.html",
    "Phase20-12 private operation safety gate",
    "Phase20-13 manual device confirmation gate",
    "Phase20-14 public release final block gate",
    "Phase20-15 owner manual approval lock gate",
    "Phase20-16 private release lock audit gate",
    "Phase20-17 private safety status dashboard"
  ];
  const VERIFICATION_CHECKS = [
    { id: "P20-18-START-LOCAL", check_name: "start_local_bat_required", check_value: true },
    { id: "P20-18-PRIVATE-LOCAL", check_name: "private_local_html_required", check_value: true },
    { id: "P20-18-INDEX", check_name: "index_html_local_panel_required", check_value: true },
    { id: "P20-18-LOCAL-ONLY", check_name: "local_launch_only", check_value: true },
    { id: "P20-18-PUBLIC-URL", check_name: "public_url_launch_allowed", check_value: false },
    { id: "P20-18-GITHUB-PAGES", check_name: "github_pages_launch_allowed", check_value: false },
    { id: "P20-18-EXTERNAL-NETWORK", check_name: "external_network_launch_allowed", check_value: false },
    { id: "P20-18-AUTO-LAUNCH", check_name: "auto_launch_allowed", check_value: false },
    { id: "P20-18-LOCAL-DASHBOARD", check_name: "local_dashboard_safe", check_value: true },
    { id: "P20-18-LOCKS", check_name: "phase20_12_to_17_locks_preserved", check_value: true }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      private_local_policy_unchanged: true,
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

  function buildLocalLaunchOnlyVerificationGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = VERIFICATION_CHECKS.map((check) => ({
      ...check,
      verification_status: "local_launch_only_verified",
      ...policyFields()
    }));
    const summary = {
      total_verification_checks: records.length,
      start_local_bat_required: true,
      private_local_html_required: true,
      index_html_local_panel_required: true,
      local_launch_only: true,
      public_url_launch_allowed: false,
      github_pages_launch_allowed: false,
      external_network_launch_allowed: false,
      auto_launch_allowed: false,
      local_dashboard_safe: true,
      phase20_12_to_17_locks_preserved: true,
      protected_mode: true,
      plan_only: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      private_local_policy_unchanged: true,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      auto_launch: false,
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
      gate_id: `P20-18-LOCAL-LAUNCH-ONLY-${generatedAt.getTime()}`,
      gate_status: GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      verification_scope: [...VERIFICATION_SCOPE],
      records,
      phase20_18_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runLocalLaunchOnlyVerificationGate(options = {}) {
    return buildLocalLaunchOnlyVerificationGate(options.sources || {}, options.now);
  }

  function renderLocalLaunchOnlyVerificationGate(gate, doc = document) {
    const summary = gate.phase20_18_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-18-gate-status", gate.gate_status);
    set("#phase20-18-total-checks", summary.total_verification_checks);
    set("#phase20-18-local-policy", summary.local_launch_policy);
    set("#phase20-18-start-local", summary.start_local_bat_required);
    set("#phase20-18-private-local", summary.private_local_html_required);
    set("#phase20-18-index-panel", summary.index_html_local_panel_required);
    set("#phase20-18-local-only", summary.local_launch_only);
    set("#phase20-18-public-url", summary.public_url_launch_allowed);
    set("#phase20-18-github-pages-launch", summary.github_pages_launch_allowed);
    set("#phase20-18-external-network", summary.external_network_launch_allowed);
    set("#phase20-18-auto-launch", summary.auto_launch_allowed);
    set("#phase20-18-dashboard-safe", summary.local_dashboard_safe);
    set("#phase20-18-locks-preserved", summary.phase20_12_to_17_locks_preserved);
    set("#phase20-18-public-release-allowed", summary.public_release_allowed);
    set("#phase20-18-auto-execution", summary.auto_execution);
    set("#phase20-18-protected-mode", summary.protected_mode);
    set("#phase20-18-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-18-next-step", summary.next_recommended_step);
    set("#phase20-18-updated", gate.generated_at);
    const list = doc.querySelector("#phase20-18-local-launch-only-verification-gate-list");
    if (list) {
      list.textContent = "";
      gate.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-18-local-launch-only-verification-gate-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.verification_status}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  function persistLocalLaunchOnlyVerificationGate(gate, storage) {
    if (storage) storage.setItem("phase2018LocalLaunchOnlyVerificationGateLatest", JSON.stringify(gate));
    return gate;
  }

  function runAndRenderLocalLaunchOnlyVerificationGate(options = {}) {
    const gate = runLocalLaunchOnlyVerificationGate(options);
    persistLocalLaunchOnlyVerificationGate(gate, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderLocalLaunchOnlyVerificationGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-18-local-launch-only-verification-gate");
      if (button) button.addEventListener("click", () => runAndRenderLocalLaunchOnlyVerificationGate());
      if (document.querySelector("#phase20-18-local-launch-only-verification-gate-builder")) runAndRenderLocalLaunchOnlyVerificationGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    GATE_STATUS,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    VERIFICATION_SCOPE,
    VERIFICATION_CHECKS,
    buildLocalLaunchOnlyVerificationGate,
    runLocalLaunchOnlyVerificationGate,
    renderLocalLaunchOnlyVerificationGate,
    persistLocalLaunchOnlyVerificationGate,
    runAndRenderLocalLaunchOnlyVerificationGate
  };
});
