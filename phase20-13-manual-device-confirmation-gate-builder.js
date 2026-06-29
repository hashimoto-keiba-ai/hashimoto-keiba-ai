(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2013ManualDeviceConfirmationGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-13";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const GATE_STATUS = "manual_device_confirmation_gate_plan_only";
  const NEXT_RECOMMENDED_STEP = "Collect protected manual device confirmations in a future phase before any public release";
  const FUTURE_RELEASE_RULE = "Public release allowed only after all device confirmations are manually approved in a future protected phase";
  const REQUIRED_POLICY_LABELS = [
    "PLAN_ONLY",
    "Protected",
    "Private/local-only operation unchanged",
    "Manual device confirmation required",
    "External connection disabled",
    "Auto publish disabled",
    "GitHub Pages changes disabled",
    "Repository visibility changes disabled",
    "Public release blocked"
  ];
  const BLOCKED_ACTIONS = [
    "public_release",
    "public_url_exposure",
    "external_connection",
    "auto_publish",
    "auto_execution",
    "github_pages_setting_change",
    "repository_visibility_change",
    "release_without_all_manual_device_confirmations"
  ];
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "manual_confirm_future_phase"];

  const DEVICE_CONFIRMATION_TARGETS = [
    {
      id: "P20-13-COMPANY-PC",
      device_type: "company_pc",
      target_name: "Company PC manual confirmation",
      confirmation_scope: "company policy, local browser launch, private-local visibility, no public URL exposure"
    },
    {
      id: "P20-13-HOME-PC",
      device_type: "home_pc",
      target_name: "Home PC manual confirmation",
      confirmation_scope: "start-local.bat launch, private-local.html visibility, local-only operation"
    },
    {
      id: "P20-13-IPAD",
      device_type: "ipad",
      target_name: "iPad manual confirmation",
      confirmation_scope: "manual local network display check, private-local route visibility, no public URL exposure"
    },
    {
      id: "P20-13-MOBILE-PHONE",
      device_type: "mobile_phone",
      target_name: "Mobile phone manual confirmation",
      confirmation_scope: "manual local network display check, private-local route visibility, no public URL exposure"
    }
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
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      future_protected_phase_required: true,
      required_policy_labels: [...REQUIRED_POLICY_LABELS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function buildManualDeviceConfirmationGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = DEVICE_CONFIRMATION_TARGETS.map((target) => ({
      ...target,
      confirmation_status: "manual_confirmation_required",
      manually_approved: false,
      public_release_ready: false,
      release_rule: FUTURE_RELEASE_RULE,
      private_local_policy_unchanged: true,
      ...policyFields()
    }));
    const allDevicesManuallyApproved = records.every((record) => record.manually_approved === true);
    const summary = {
      total_device_targets: records.length,
      manual_confirmation_required_count: records.filter((record) => record.confirmation_status === "manual_confirmation_required").length,
      manually_approved_count: records.filter((record) => record.manually_approved === true).length,
      all_devices_manually_approved: allDevicesManuallyApproved,
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
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      future_protected_phase_required: true,
      unsafe_flags_count: 0,
      release_rule: FUTURE_RELEASE_RULE,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      gate_id: `P20-13-MANUAL-DEVICE-CONFIRMATION-${generatedAt.getTime()}`,
      gate_status: GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_13_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runManualDeviceConfirmationGate(options = {}) {
    return buildManualDeviceConfirmationGate(options.sources || {}, options.now);
  }

  function renderManualDeviceConfirmationGate(gate, doc = document) {
    const summary = gate.phase20_13_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-13-gate-status", gate.gate_status);
    set("#phase20-13-total-device-targets", summary.total_device_targets);
    set("#phase20-13-manual-required", summary.manual_confirmation_required_count);
    set("#phase20-13-manually-approved", summary.manually_approved_count);
    set("#phase20-13-all-approved", summary.all_devices_manually_approved);
    set("#phase20-13-external-connection", summary.external_connection);
    set("#phase20-13-auto-publish", summary.auto_publish);
    set("#phase20-13-github-pages-change", summary.github_pages_setting_change_allowed);
    set("#phase20-13-repository-visibility-change", summary.repository_visibility_change_allowed);
    set("#phase20-13-public-release", summary.public_release_allowed);
    set("#phase20-13-protected-mode", summary.protected_mode);
    set("#phase20-13-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-13-next-step", summary.next_recommended_step);
    set("#phase20-13-updated", gate.generated_at);
    const list = doc.querySelector("#phase20-13-manual-device-confirmation-gate-list");
    if (list) {
      list.textContent = "";
      gate.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-13-manual-device-confirmation-gate-item";
        row.textContent = `${record.device_type} / ${record.confirmation_status} / approved:${record.manually_approved} / publicRelease:${record.public_release_allowed}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  function persistManualDeviceConfirmationGate(gate, storage) {
    if (storage) storage.setItem("phase2013ManualDeviceConfirmationGateLatest", JSON.stringify(gate));
    return gate;
  }

  function runAndRenderManualDeviceConfirmationGate(options = {}) {
    const gate = runManualDeviceConfirmationGate(options);
    persistManualDeviceConfirmationGate(gate, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderManualDeviceConfirmationGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-13-manual-device-confirmation-gate");
      if (button) button.addEventListener("click", () => runAndRenderManualDeviceConfirmationGate());
      if (document.querySelector("#phase20-13-manual-device-confirmation-gate-builder")) runAndRenderManualDeviceConfirmationGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    GATE_STATUS,
    NEXT_RECOMMENDED_STEP,
    FUTURE_RELEASE_RULE,
    REQUIRED_POLICY_LABELS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    DEVICE_CONFIRMATION_TARGETS,
    buildManualDeviceConfirmationGate,
    runManualDeviceConfirmationGate,
    renderManualDeviceConfirmationGate,
    persistManualDeviceConfirmationGate,
    runAndRenderManualDeviceConfirmationGate
  };
});
