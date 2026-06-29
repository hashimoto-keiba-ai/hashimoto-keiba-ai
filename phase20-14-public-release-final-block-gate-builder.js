(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2014PublicReleaseFinalBlockGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-14";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const GATE_STATUS = "public_release_final_block_plan_only";
  const NEXT_RECOMMENDED_STEP = "Keep public release blocked and collect manual owner/device confirmations in a future protected phase";
  const FINAL_BLOCK_RULE = "Public release remains blocked until all device confirmations and manual owner confirmation are approved in a future protected phase";
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "manual_confirm_future_phase"];
  const BLOCKED_ACTIONS = [
    "public_url_exposure",
    "external_connection",
    "auto_publish",
    "auto_execution",
    "github_pages_setting_change",
    "repository_visibility_change",
    "public_release_without_all_device_confirmations",
    "public_release_without_manual_owner_confirmation"
  ];
  const REQUIRED_POLICY_LABELS = [
    "PLAN_ONLY",
    "Protected",
    "Public release blocked",
    "Private/local-only operation unchanged",
    "External connection disabled",
    "Auto publish disabled",
    "GitHub Pages changes disabled",
    "Repository visibility changes disabled",
    "Manual owner confirmation required"
  ];

  const FINAL_BLOCK_CONDITIONS = [
    { id: "P20-14-COMPANY-PC", condition_name: "company_pc confirmation", device_type: "company_pc", confirmation_required: true, confirmation_approved: false },
    { id: "P20-14-HOME-PC", condition_name: "home_pc confirmation", device_type: "home_pc", confirmation_required: true, confirmation_approved: false },
    { id: "P20-14-IPAD", condition_name: "ipad confirmation", device_type: "ipad", confirmation_required: true, confirmation_approved: false },
    { id: "P20-14-MOBILE-PHONE", condition_name: "mobile_phone confirmation", device_type: "mobile_phone", confirmation_required: true, confirmation_approved: false }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
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
      final_public_release_block: true,
      required_policy_labels: [...REQUIRED_POLICY_LABELS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildPublicReleaseFinalBlockGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = FINAL_BLOCK_CONDITIONS.map((condition) => ({
      ...condition,
      condition_status: "blocked_pending_manual_confirmation",
      public_release_ready: false,
      private_local_policy_unchanged: true,
      final_block_rule: FINAL_BLOCK_RULE,
      ...policyFields()
    }));
    const allDeviceConfirmationsApproved = records.every((record) => record.confirmation_approved === true);
    const summary = {
      total_final_block_conditions: records.length,
      confirmation_required_count: records.filter((record) => record.confirmation_required === true).length,
      confirmation_approved_count: records.filter((record) => record.confirmation_approved === true).length,
      all_device_confirmations_approved: allDeviceConfirmationsApproved,
      public_release_ready: false,
      final_public_release_block: true,
      protected_mode: true,
      plan_only: true,
      private_local_policy_unchanged: true,
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
      unsafe_flags_count: 0,
      final_block_rule: FINAL_BLOCK_RULE,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      gate_id: `P20-14-PUBLIC-RELEASE-FINAL-BLOCK-${generatedAt.getTime()}`,
      gate_status: GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_14_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runPublicReleaseFinalBlockGate(options = {}) {
    return buildPublicReleaseFinalBlockGate(options.sources || {}, options.now);
  }

  function renderPublicReleaseFinalBlockGate(gate, doc = document) {
    const summary = gate.phase20_14_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-14-gate-status", gate.gate_status);
    set("#phase20-14-total-conditions", summary.total_final_block_conditions);
    set("#phase20-14-required-count", summary.confirmation_required_count);
    set("#phase20-14-approved-count", summary.confirmation_approved_count);
    set("#phase20-14-all-approved", summary.all_device_confirmations_approved);
    set("#phase20-14-public-release-ready", summary.public_release_ready);
    set("#phase20-14-final-block", summary.final_public_release_block);
    set("#phase20-14-external-connection", summary.external_connection);
    set("#phase20-14-auto-publish", summary.auto_publish);
    set("#phase20-14-github-pages-change", summary.github_pages_change_allowed);
    set("#phase20-14-github-pages-setting-change", summary.github_pages_setting_change_allowed);
    set("#phase20-14-repository-visibility-change", summary.repository_visibility_change_allowed);
    set("#phase20-14-public-release-allowed", summary.public_release_allowed);
    set("#phase20-14-manual-confirmation", summary.manual_confirmation_required_before_public_release);
    set("#phase20-14-protected-mode", summary.protected_mode);
    set("#phase20-14-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-14-next-step", summary.next_recommended_step);
    set("#phase20-14-updated", gate.generated_at);
    const list = doc.querySelector("#phase20-14-public-release-final-block-gate-list");
    if (list) {
      list.textContent = "";
      gate.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-14-public-release-final-block-gate-item";
        row.textContent = `${record.device_type} / required:${record.confirmation_required} / approved:${record.confirmation_approved} / finalBlock:${record.final_public_release_block}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  function persistPublicReleaseFinalBlockGate(gate, storage) {
    if (storage) storage.setItem("phase2014PublicReleaseFinalBlockGateLatest", JSON.stringify(gate));
    return gate;
  }

  function runAndRenderPublicReleaseFinalBlockGate(options = {}) {
    const gate = runPublicReleaseFinalBlockGate(options);
    persistPublicReleaseFinalBlockGate(gate, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPublicReleaseFinalBlockGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-14-public-release-final-block-gate");
      if (button) button.addEventListener("click", () => runAndRenderPublicReleaseFinalBlockGate());
      if (document.querySelector("#phase20-14-public-release-final-block-gate-builder")) runAndRenderPublicReleaseFinalBlockGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    GATE_STATUS,
    NEXT_RECOMMENDED_STEP,
    FINAL_BLOCK_RULE,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    REQUIRED_POLICY_LABELS,
    FINAL_BLOCK_CONDITIONS,
    buildPublicReleaseFinalBlockGate,
    runPublicReleaseFinalBlockGate,
    renderPublicReleaseFinalBlockGate,
    persistPublicReleaseFinalBlockGate,
    runAndRenderPublicReleaseFinalBlockGate
  };
});
