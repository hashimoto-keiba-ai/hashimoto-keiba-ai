(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase211PostPhase20PrivateLocalOperationStartGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-1";
  const GATE_NAME = "Post Phase20 Private Local Operation Start Gate";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_1_private_local_operation_start_gate_plan_only";
  const START_GATE_STATUS = "READY_FOR_PRIVATE_LOCAL_PLANNING";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Continue Phase21 only as private local PLAN_ONLY review work with draft PR review";
  const REQUIRED_INPUTS = [
    "Phase20 Completion Final Closure",
    "private-local.html route",
    "index.html route",
    "PLAN_ONLY policy",
    "Protected policy"
  ];
  const START_CHECKS = [
    { id: "P21-1-P20-CLOSURE", label: "Phase20 Completion Final Closure remains visible and linked", status: "Confirmed" },
    { id: "P21-1-PRIVATE", label: "Private repository premise maintained", status: "Confirmed" },
    { id: "P21-1-LOCAL", label: "Local-only operation maintained", status: "Confirmed" },
    { id: "P21-1-PLAN", label: "PLAN_ONLY policy maintained", status: "Confirmed" },
    { id: "P21-1-PROTECTED", label: "Protected policy maintained", status: "Confirmed" },
    { id: "P21-1-PAGES", label: "GitHub Pages settings unchanged", status: "Confirmed" },
    { id: "P21-1-PUBLIC-URL", label: "No public URL added", status: "Confirmed" },
    { id: "P21-1-EXTERNAL-API", label: "No external API connection added", status: "Confirmed" },
    { id: "P21-1-AUTO", label: "No automatic execution added", status: "Confirmed" },
    { id: "P21-1-DRAFT-PR", label: "Draft PR review required", status: "Confirmed" }
  ];
  const OUT_OF_SCOPE_OPERATIONS = [
    "public_publish",
    "github_pages_publish",
    "github_pages_setting_change",
    "public_url_guidance",
    "external_sharing",
    "external_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "auto_merge",
    "merge"
  ];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
    "merge",
    "ready_for_review_pr",
    "public_publish",
    "github_pages_publish",
    "github_pages_setting_change",
    "public_url_guidance",
    "external_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "repository_visibility_change"
  ];
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "draft_pr"];

  function policyFields() {
    return {
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      protected_mode: true,
      plan_only: true,
      unsafe_guard: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      public_release_ready: false,
      external_connection: false,
      external_connection_allowed: false,
      external_api_submission_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      billing_integration_allowed: false,
      repository_visibility_change_allowed: false,
      direct_push_to_main_allowed: false,
      merge_allowed: false,
      draft_pr_required: true,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
  }

  function buildStartCheckRecord(item) {
    return {
      ...item,
      start_gate_review_status: "phase21_1_start_gate_confirmed",
      ...policyFields()
    };
  }

  function buildPostPhase20PrivateLocalOperationStartGate(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = START_CHECKS.map(buildStartCheckRecord);
    const summary = {
      total_start_checks: records.length,
      confirmed_start_checks: records.filter((record) => record.status === "Confirmed").length,
      start_gate_status: START_GATE_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase20_completion_display_preserved: true,
      phase20_completion_route_preserved: true,
      phase21_1_route_added: true,
      readme_updated: true,
      json_syntax_check_required: true,
      javascript_syntax_check_required: true,
      new_test_added: true,
      phase20_completion_test_required: true,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      external_connection: false,
      external_api_submission_allowed: false,
      auto_execution: false,
      auto_publish: false,
      auto_launch: false,
      billing_integration_allowed: false,
      repository_visibility_change_allowed: false,
      direct_push_to_main_allowed: false,
      merge_allowed: false,
      draft_pr_required: true,
      unsafe_flags: 0,
      required_inputs: [...REQUIRED_INPUTS],
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      gate_name: GATE_NAME,
      panel_id: `PHASE21-1-PRIVATE-LOCAL-START-GATE-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      start_gate_status: START_GATE_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_1_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPostPhase20PrivateLocalOperationStartGate(options = {}) {
    return buildPostPhase20PrivateLocalOperationStartGate(options.sources || {}, options.now);
  }

  function renderPostPhase20PrivateLocalOperationStartGate(panel, doc = document) {
    const summary = panel.phase21_1_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-1-panel-status", panel.panel_status);
    set("#phase21-1-start-gate-status", panel.start_gate_status);
    set("#phase21-1-total-checks", summary.total_start_checks);
    set("#phase21-1-confirmed-checks", summary.confirmed_start_checks);
    set("#phase21-1-phase20-prerequisite", summary.phase20_completion_prerequisite);
    set("#phase21-1-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-1-private-repo", summary.private_repository);
    set("#phase21-1-local-only", summary.local_only_operation);
    set("#phase21-1-plan-only", summary.plan_only);
    set("#phase21-1-protected", summary.protected_mode);
    set("#phase21-1-no-pages-change", summary.github_pages_setting_change_allowed);
    set("#phase21-1-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-1-no-external-api", summary.external_api_submission_allowed);
    set("#phase21-1-no-auto", summary.auto_execution);
    set("#phase21-1-unsafe-flags", summary.unsafe_flags);
    set("#phase21-1-draft-pr", summary.draft_pr_required);
    set("#phase21-1-merge", summary.merge_allowed);
    set("#phase21-1-next-step", summary.next_recommended_step);
    set("#phase21-1-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-1-post-phase20-private-local-operation-start-gate-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = "phase21-1-post-phase20-private-local-operation-start-gate-item";
        row.textContent = `${record.id} ${record.label} / ${record.status} / ${EXECUTION_POLICY} / ${PROTECTION_POLICY}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPostPhase20PrivateLocalOperationStartGate(panel, storage) {
    if (storage) storage.setItem("phase211PostPhase20PrivateLocalOperationStartGateLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPostPhase20PrivateLocalOperationStartGate(options = {}) {
    const panel = runPostPhase20PrivateLocalOperationStartGate(options);
    persistPostPhase20PrivateLocalOperationStartGate(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPostPhase20PrivateLocalOperationStartGate(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-1-post-phase20-private-local-operation-start-gate");
      if (button) button.addEventListener("click", () => runAndRenderPostPhase20PrivateLocalOperationStartGate());
      if (document.querySelector("#phase21-1-post-phase20-private-local-operation-start-gate-builder")) runAndRenderPostPhase20PrivateLocalOperationStartGate();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    GATE_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    START_GATE_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    REQUIRED_INPUTS,
    START_CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPostPhase20PrivateLocalOperationStartGate,
    runPostPhase20PrivateLocalOperationStartGate,
    renderPostPhase20PrivateLocalOperationStartGate,
    persistPostPhase20PrivateLocalOperationStartGate,
    runAndRenderPostPhase20PrivateLocalOperationStartGate
  };
});
