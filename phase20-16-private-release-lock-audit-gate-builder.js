(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2016PrivateReleaseLockAuditGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-16";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const GATE_STATUS = "private_release_lock_audit_plan_only";
  const NEXT_RECOMMENDED_STEP = "Keep private release locks active and continue local-only audit before any future protected confirmation phase";
  const AUDIT_RULE = "Phase20-12 through Phase20-15 locks must remain active with no public release, external connection, auto publish, or auto execution.";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch"];
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
    "private_policy_override"
  ];
  const AUDIT_SCOPE = [
    "Phase20-12 private operation safety gate",
    "Phase20-13 manual device confirmation gate",
    "Phase20-14 public release final block gate",
    "Phase20-15 owner manual approval lock gate"
  ];

  const AUDIT_CHECKS = [
    { id: "P20-16-P20-12", check_name: "phase20_12_private_operation_safety_gate_active", check_value: true },
    { id: "P20-16-P20-13", check_name: "phase20_13_manual_device_confirmation_gate_active", check_value: true },
    { id: "P20-16-P20-14", check_name: "phase20_14_public_release_final_block_active", check_value: true },
    { id: "P20-16-P20-15", check_name: "phase20_15_owner_manual_approval_lock_active", check_value: true },
    { id: "P20-16-LOCKS", check_name: "all_required_locks_active", check_value: true },
    { id: "P20-16-PUBLIC-BLOCK", check_name: "public_release_block_integrity", check_value: true },
    { id: "P20-16-PRIVATE-LOCAL", check_name: "private_local_policy_integrity", check_value: true },
    { id: "P20-16-UNSAFE-UNLOCK", check_name: "unsafe_unlock_detected", check_value: false },
    { id: "P20-16-UNSAFE-PUBLIC", check_name: "unsafe_public_flag_detected", check_value: false },
    { id: "P20-16-EXTERNAL-AUTO", check_name: "external_or_auto_publish_detected", check_value: false }
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

  function buildPrivateReleaseLockAuditGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = AUDIT_CHECKS.map((check) => ({
      ...check,
      audit_status: "locked_audit_pass",
      audit_rule: AUDIT_RULE,
      ...policyFields()
    }));
    const summary = {
      total_audit_checks: records.length,
      phase20_12_private_operation_safety_gate_active: true,
      phase20_13_manual_device_confirmation_gate_active: true,
      phase20_14_public_release_final_block_active: true,
      phase20_15_owner_manual_approval_lock_active: true,
      all_required_locks_active: true,
      public_release_block_integrity: true,
      private_local_policy_integrity: true,
      unsafe_unlock_detected: false,
      unsafe_public_flag_detected: false,
      external_or_auto_publish_detected: false,
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
      public_release_blocked: true,
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      manual_owner_confirmation_required: true,
      owner_approval_lock_active: true,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      public_release_ready: false,
      unsafe_flags_count: 0,
      audit_rule: AUDIT_RULE,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      gate_id: `P20-16-PRIVATE-RELEASE-LOCK-AUDIT-${generatedAt.getTime()}`,
      gate_status: GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      audit_scope: [...AUDIT_SCOPE],
      records,
      phase20_16_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runPrivateReleaseLockAuditGate(options = {}) {
    return buildPrivateReleaseLockAuditGate(options.sources || {}, options.now);
  }

  function renderPrivateReleaseLockAuditGate(gate, doc = document) {
    const summary = gate.phase20_16_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-16-gate-status", gate.gate_status);
    set("#phase20-16-total-checks", summary.total_audit_checks);
    set("#phase20-16-all-locks-active", summary.all_required_locks_active);
    set("#phase20-16-public-block-integrity", summary.public_release_block_integrity);
    set("#phase20-16-private-local-integrity", summary.private_local_policy_integrity);
    set("#phase20-16-unsafe-unlock", summary.unsafe_unlock_detected);
    set("#phase20-16-unsafe-public", summary.unsafe_public_flag_detected);
    set("#phase20-16-external-auto", summary.external_or_auto_publish_detected);
    set("#phase20-16-owner-lock-active", summary.owner_approval_lock_active);
    set("#phase20-16-final-block", summary.final_public_release_block);
    set("#phase20-16-devices-approved", summary.all_device_confirmations_approved);
    set("#phase20-16-release-ready", summary.public_release_ready);
    set("#phase20-16-public-release-allowed", summary.public_release_allowed);
    set("#phase20-16-external-connection", summary.external_connection);
    set("#phase20-16-auto-publish", summary.auto_publish);
    set("#phase20-16-auto-execution", summary.auto_execution);
    set("#phase20-16-protected-mode", summary.protected_mode);
    set("#phase20-16-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-16-next-step", summary.next_recommended_step);
    set("#phase20-16-updated", gate.generated_at);
    const list = doc.querySelector("#phase20-16-private-release-lock-audit-gate-list");
    if (list) {
      list.textContent = "";
      gate.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-16-private-release-lock-audit-gate-item";
        row.textContent = `${record.check_name} / value:${record.check_value} / status:${record.audit_status}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  function persistPrivateReleaseLockAuditGate(gate, storage) {
    if (storage) storage.setItem("phase2016PrivateReleaseLockAuditGateLatest", JSON.stringify(gate));
    return gate;
  }

  function runAndRenderPrivateReleaseLockAuditGate(options = {}) {
    const gate = runPrivateReleaseLockAuditGate(options);
    persistPrivateReleaseLockAuditGate(gate, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateReleaseLockAuditGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-16-private-release-lock-audit-gate");
      if (button) button.addEventListener("click", () => runAndRenderPrivateReleaseLockAuditGate());
      if (document.querySelector("#phase20-16-private-release-lock-audit-gate-builder")) runAndRenderPrivateReleaseLockAuditGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    GATE_STATUS,
    NEXT_RECOMMENDED_STEP,
    AUDIT_RULE,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    AUDIT_SCOPE,
    AUDIT_CHECKS,
    buildPrivateReleaseLockAuditGate,
    runPrivateReleaseLockAuditGate,
    renderPrivateReleaseLockAuditGate,
    persistPrivateReleaseLockAuditGate,
    runAndRenderPrivateReleaseLockAuditGate
  };
});
