(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2015OwnerManualApprovalLockGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-15";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const GATE_STATUS = "owner_manual_approval_lock_plan_only";
  const NEXT_RECOMMENDED_STEP = "Keep owner approval locked and require manual owner confirmation in a future protected phase";
  const OWNER_LOCK_RULE = "Owner release unlock is blocked until manual owner confirmation and all device confirmations are approved in a future protected phase";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "manual_confirm_future_phase"];
  const BLOCKED_ACTIONS = [
    "public_url_exposure",
    "external_connection",
    "auto_publish",
    "auto_execution",
    "github_pages_setting_change",
    "repository_visibility_change",
    "public_release_without_all_device_confirmations",
    "public_release_without_manual_owner_confirmation",
    "owner_release_unlock_without_manual_confirmation"
  ];
  const REQUIRED_POLICY_LABELS = [
    "PLAN_ONLY",
    "Protected",
    "Owner manual approval required",
    "Owner approval unconfirmed",
    "Owner release unlock blocked",
    "Public release blocked",
    "Private/local-only operation unchanged",
    "External connection disabled",
    "Auto publish disabled",
    "GitHub Pages changes disabled",
    "Repository visibility changes disabled"
  ];

  const OWNER_APPROVAL_LOCK_CONDITIONS = [
    { id: "P20-15-OWNER-APPROVAL-REQUIRED", condition_name: "owner_manual_approval_required", condition_value: true },
    { id: "P20-15-OWNER-APPROVAL-CONFIRMED", condition_name: "owner_manual_approval_confirmed", condition_value: false },
    { id: "P20-15-OWNER-RELEASE-UNLOCK", condition_name: "owner_release_unlock_allowed", condition_value: false },
    { id: "P20-15-PUBLIC-RELEASE-READY", condition_name: "public_release_ready", condition_value: false },
    { id: "P20-15-FINAL-PUBLIC-RELEASE-BLOCK", condition_name: "final_public_release_block", condition_value: true },
    { id: "P20-15-DEVICE-CONFIRMATIONS", condition_name: "all_device_confirmations_approved", condition_value: false },
    { id: "P20-15-OWNER-LOCK-ACTIVE", condition_name: "owner_approval_lock_active", condition_value: true }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
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
      owner_manual_approval_required: true,
      owner_manual_approval_confirmed: false,
      owner_release_unlock_allowed: false,
      public_release_ready: false,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      owner_approval_lock_active: true,
      required_policy_labels: [...REQUIRED_POLICY_LABELS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildOwnerManualApprovalLockGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = OWNER_APPROVAL_LOCK_CONDITIONS.map((condition) => ({
      ...condition,
      condition_status: "locked_plan_only",
      private_local_policy_unchanged: true,
      owner_lock_rule: OWNER_LOCK_RULE,
      ...policyFields()
    }));
    const summary = {
      total_owner_lock_conditions: records.length,
      owner_manual_approval_required: true,
      owner_manual_approval_confirmed: false,
      owner_release_unlock_allowed: false,
      public_release_ready: false,
      final_public_release_block: true,
      all_device_confirmations_approved: false,
      owner_approval_lock_active: true,
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
      unsafe_flags_count: 0,
      owner_lock_rule: OWNER_LOCK_RULE,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      gate_id: `P20-15-OWNER-MANUAL-APPROVAL-LOCK-${generatedAt.getTime()}`,
      gate_status: GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_15_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runOwnerManualApprovalLockGate(options = {}) {
    return buildOwnerManualApprovalLockGate(options.sources || {}, options.now);
  }

  function renderOwnerManualApprovalLockGate(gate, doc = document) {
    const summary = gate.phase20_15_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-15-gate-status", gate.gate_status);
    set("#phase20-15-total-conditions", summary.total_owner_lock_conditions);
    set("#phase20-15-owner-required", summary.owner_manual_approval_required);
    set("#phase20-15-owner-confirmed", summary.owner_manual_approval_confirmed);
    set("#phase20-15-owner-unlock", summary.owner_release_unlock_allowed);
    set("#phase20-15-release-ready", summary.public_release_ready);
    set("#phase20-15-final-block", summary.final_public_release_block);
    set("#phase20-15-all-devices-approved", summary.all_device_confirmations_approved);
    set("#phase20-15-lock-active", summary.owner_approval_lock_active);
    set("#phase20-15-external-connection", summary.external_connection);
    set("#phase20-15-auto-publish", summary.auto_publish);
    set("#phase20-15-auto-execution", summary.auto_execution);
    set("#phase20-15-github-pages-change", summary.github_pages_change_allowed);
    set("#phase20-15-github-pages-setting-change", summary.github_pages_setting_change_allowed);
    set("#phase20-15-repository-visibility-change", summary.repository_visibility_change_allowed);
    set("#phase20-15-public-release-allowed", summary.public_release_allowed);
    set("#phase20-15-manual-confirmation", summary.manual_confirmation_required_before_public_release);
    set("#phase20-15-protected-mode", summary.protected_mode);
    set("#phase20-15-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-15-next-step", summary.next_recommended_step);
    set("#phase20-15-updated", gate.generated_at);
    const list = doc.querySelector("#phase20-15-owner-manual-approval-lock-gate-list");
    if (list) {
      list.textContent = "";
      gate.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-15-owner-manual-approval-lock-gate-item";
        row.textContent = `${record.condition_name} / value:${record.condition_value} / lock:${record.owner_approval_lock_active}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  function persistOwnerManualApprovalLockGate(gate, storage) {
    if (storage) storage.setItem("phase2015OwnerManualApprovalLockGateLatest", JSON.stringify(gate));
    return gate;
  }

  function runAndRenderOwnerManualApprovalLockGate(options = {}) {
    const gate = runOwnerManualApprovalLockGate(options);
    persistOwnerManualApprovalLockGate(gate, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderOwnerManualApprovalLockGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-15-owner-manual-approval-lock-gate");
      if (button) button.addEventListener("click", () => runAndRenderOwnerManualApprovalLockGate());
      if (document.querySelector("#phase20-15-owner-manual-approval-lock-gate-builder")) runAndRenderOwnerManualApprovalLockGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    GATE_STATUS,
    NEXT_RECOMMENDED_STEP,
    OWNER_LOCK_RULE,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    REQUIRED_POLICY_LABELS,
    OWNER_APPROVAL_LOCK_CONDITIONS,
    buildOwnerManualApprovalLockGate,
    runOwnerManualApprovalLockGate,
    renderOwnerManualApprovalLockGate,
    persistOwnerManualApprovalLockGate,
    runAndRenderOwnerManualApprovalLockGate
  };
});
