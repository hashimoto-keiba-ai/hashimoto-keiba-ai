(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2012PrivateOperationSafetyGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-12";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const GATE_STATUS = "private_operation_safety_gate_plan_only";
  const NEXT_RECOMMENDED_STEP = "Keep private/local-only operation and require manual confirmation before any public release";
  const LOCAL_LAUNCHER_POLICY = "start-local.bat / private-local.html";
  const GITHUB_PAGES_POLICY = "OFF or not required for private local operation";
  const SAFE_OPERATION_RULE = "Do not expose public URL unless explicitly approved";
  const REQUIRED_POLICY_LABELS = [
    "PLAN_ONLY",
    "Protected",
    "Private/local-only readiness",
    "GitHub Pages OFF or not required",
    "Local launcher required",
    "External connection disabled",
    "Auto publish disabled",
    "Manual confirmation required before public release"
  ];
  const BLOCKED_ACTIONS = [
    "public_url_exposure",
    "external_connection",
    "auto_publish",
    "auto_execution",
    "github_pages_setting_change",
    "repository_visibility_change",
    "public_release_without_manual_confirmation"
  ];
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch"];

  const SAFETY_CHECK_ITEMS = [
    {
      id: "P20-12-REPOSITORY-VISIBILITY",
      check_name: "Repository visibility awareness",
      category: "repository_visibility",
      expected_state: "public/private awareness confirmed before operation",
      ready_state: "awareness_required"
    },
    {
      id: "P20-12-GITHUB-PAGES",
      check_name: "GitHub Pages private-local policy",
      category: "github_pages_policy",
      expected_state: GITHUB_PAGES_POLICY,
      ready_state: "off_or_not_required"
    },
    {
      id: "P20-12-LOCAL-LAUNCHER",
      check_name: "Local launcher policy",
      category: "local_launcher_policy",
      expected_state: LOCAL_LAUNCHER_POLICY,
      ready_state: "required"
    },
    {
      id: "P20-12-COMPANY-PC",
      check_name: "Company PC device policy",
      category: "device_policy",
      device_type: "company_pc",
      expected_state: "local browser only after company policy confirmation",
      ready_state: "manual_confirmation_required"
    },
    {
      id: "P20-12-HOME-PC",
      check_name: "Home PC device policy",
      category: "device_policy",
      device_type: "home_pc",
      expected_state: "start-local.bat and private-local.html local operation",
      ready_state: "ready_for_local_only"
    },
    {
      id: "P20-12-IPAD",
      check_name: "iPad device policy",
      category: "device_policy",
      device_type: "ipad",
      expected_state: "manual local network check only; no public URL exposure",
      ready_state: "manual_confirmation_required"
    },
    {
      id: "P20-12-MOBILE-PHONE",
      check_name: "Mobile phone device policy",
      category: "device_policy",
      device_type: "mobile_phone",
      expected_state: "manual local network check only; no public URL exposure",
      ready_state: "manual_confirmation_required"
    },
    {
      id: "P20-12-SAFE-OPERATION",
      check_name: "Safe operation rule",
      category: "safe_operation_rule",
      expected_state: SAFE_OPERATION_RULE,
      ready_state: "public_release_blocked_without_approval"
    },
    {
      id: "P20-12-MANUAL-CONFIRMATION",
      check_name: "Manual public release confirmation",
      category: "release_confirmation",
      expected_state: "manual confirmation required before any public release",
      ready_state: "required"
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
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_allowed: false,
      manual_confirmation_required_before_public_release: true,
      required_policy_labels: [...REQUIRED_POLICY_LABELS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function countBy(records, field, value) {
    return records.filter((record) => record[field] === value).length;
  }

  function buildPrivateOperationSafetyGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = SAFETY_CHECK_ITEMS.map((item) => ({
      ...item,
      check_status: "manual_confirmation_required",
      private_local_ready: item.category !== "repository_visibility" && item.category !== "release_confirmation",
      github_pages_policy: GITHUB_PAGES_POLICY,
      local_launcher_policy: LOCAL_LAUNCHER_POLICY,
      safe_operation_rule: SAFE_OPERATION_RULE,
      ...policyFields()
    }));
    const summary = {
      total_check_items: records.length,
      repository_visibility_awareness_required: true,
      github_pages_policy: GITHUB_PAGES_POLICY,
      local_launcher_policy: LOCAL_LAUNCHER_POLICY,
      device_policy_targets: countBy(records, "category", "device_policy"),
      safe_operation_rule: SAFE_OPERATION_RULE,
      protected_mode: true,
      plan_only: true,
      external_connection: false,
      external_connection_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      manual_confirmation_required_before_public_release: true,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      public_release_allowed: false,
      unsafe_flags_count: 0,
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      gate_id: `P20-12-PRIVATE-OPERATION-SAFETY-${generatedAt.getTime()}`,
      gate_status: GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_12_summary: summary,
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runPrivateOperationSafetyGate(options = {}) {
    return buildPrivateOperationSafetyGate(options.sources || {}, options.now);
  }

  function renderPrivateOperationSafetyGate(gate, doc = document) {
    const summary = gate.phase20_12_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-12-gate-status", gate.gate_status);
    set("#phase20-12-total-check-items", summary.total_check_items);
    set("#phase20-12-repository-visibility-awareness", summary.repository_visibility_awareness_required);
    set("#phase20-12-github-pages-policy", summary.github_pages_policy);
    set("#phase20-12-local-launcher-policy", summary.local_launcher_policy);
    set("#phase20-12-device-policy-targets", summary.device_policy_targets);
    set("#phase20-12-external-connection", summary.external_connection);
    set("#phase20-12-auto-publish", summary.auto_publish);
    set("#phase20-12-manual-confirmation", summary.manual_confirmation_required_before_public_release);
    set("#phase20-12-protected-mode", summary.protected_mode);
    set("#phase20-12-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-12-next-step", summary.next_recommended_step);
    set("#phase20-12-updated", gate.generated_at);
    const list = doc.querySelector("#phase20-12-private-operation-safety-gate-list");
    if (list) {
      list.textContent = "";
      gate.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase20-12-private-operation-safety-gate-item";
        row.textContent = `${record.check_name} / ${record.expected_state} / protected:${record.protected_mode} / external:${record.external_connection}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  function persistPrivateOperationSafetyGate(gate, storage) {
    if (storage) storage.setItem("phase2012PrivateOperationSafetyGateLatest", JSON.stringify(gate));
    return gate;
  }

  function runAndRenderPrivateOperationSafetyGate(options = {}) {
    const gate = runPrivateOperationSafetyGate(options);
    persistPrivateOperationSafetyGate(gate, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateOperationSafetyGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-12-private-operation-safety-gate");
      if (button) button.addEventListener("click", () => runAndRenderPrivateOperationSafetyGate());
      if (document.querySelector("#phase20-12-private-operation-safety-gate-builder")) runAndRenderPrivateOperationSafetyGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    GATE_STATUS,
    NEXT_RECOMMENDED_STEP,
    LOCAL_LAUNCHER_POLICY,
    GITHUB_PAGES_POLICY,
    SAFE_OPERATION_RULE,
    REQUIRED_POLICY_LABELS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    SAFETY_CHECK_ITEMS,
    buildPrivateOperationSafetyGate,
    runPrivateOperationSafetyGate,
    renderPrivateOperationSafetyGate,
    persistPrivateOperationSafetyGate,
    runAndRenderPrivateOperationSafetyGate
  };
});
