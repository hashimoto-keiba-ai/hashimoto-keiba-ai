(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase212PrivateLocalOperationContinuityChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-2";
  const CHECKLIST_NAME = "Private Local Operation Continuity Checklist";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase21_2_private_local_operation_continuity_checklist_plan_only";
  const CONTINUITY_STATUS = "CONTINUITY_CONFIRMED_PLAN_ONLY";
  const PHASE20_COMPLETION_PREREQUISITE = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const PHASE21_1_PREREQUISITE = "READY_FOR_PRIVATE_LOCAL_PLANNING";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Continue Phase21 only with private local checklist review and draft PR review";
  const CONTINUITY_CHECKS = [
    { id: "P21-2-P20-CLOSURE", label: "Phase20 Completion Final Closure display and route preserved", status: "Confirmed" },
    { id: "P21-2-P21-1-GATE", label: "Phase21-1 Start Gate display and route preserved", status: "Confirmed" },
    { id: "P21-2-PRIVATE", label: "Private repository premise maintained", status: "Confirmed" },
    { id: "P21-2-LOCAL", label: "Local-only operation maintained", status: "Confirmed" },
    { id: "P21-2-PLAN", label: "PLAN_ONLY policy maintained", status: "Confirmed" },
    { id: "P21-2-PROTECTED", label: "Protected policy maintained", status: "Confirmed" },
    { id: "P21-2-PAGES", label: "GitHub Pages settings unchanged", status: "Confirmed" },
    { id: "P21-2-PUBLIC-URL", label: "No public URL added", status: "Confirmed" },
    { id: "P21-2-EXTERNAL-API", label: "No external API connection added", status: "Confirmed" },
    { id: "P21-2-AUTO", label: "No automatic execution added", status: "Confirmed" },
    { id: "P21-2-AUTO-PUBLISH", label: "Auto publish blocked", status: "Blocked" },
    { id: "P21-2-AUTO-LAUNCH", label: "Auto launch blocked", status: "Blocked" },
    { id: "P21-2-BILLING", label: "Billing integration blocked", status: "Blocked" },
    { id: "P21-2-MERGE", label: "Merge blocked", status: "Blocked" },
    { id: "P21-2-MAIN-PUSH", label: "Main direct push blocked", status: "Blocked" },
    { id: "P21-2-DRAFT-PR", label: "Draft PR review required", status: "Confirmed" }
  ];
  const OUT_OF_SCOPE_OPERATIONS = [
    "public_publish",
    "github_pages_publish",
    "github_pages_setting_change",
    "public_url_guidance",
    "external_sharing",
    "external_connection",
    "external_api_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "auto_merge",
    "merge",
    "main_direct_push"
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
    "external_api_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "repository_visibility_change"
  ];
  const ALLOWED_ACTIONS = ["checklist", "plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "draft_pr"];

  function policyFields() {
    return {
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      protected_mode: true,
      plan_only: true,
      unsafe_guard: true,
      checklist_audit_display_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase21_1_start_gate_preserved: true,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      public_release_ready: false,
      external_connection: false,
      external_connection_allowed: false,
      external_api_connection: false,
      external_api_connection_allowed: false,
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

  function buildContinuityRecord(item) {
    return {
      ...item,
      continuity_review_status: item.status === "Blocked" ? "blocked_by_continuity_policy" : "continuity_check_confirmed",
      ...policyFields()
    };
  }

  function buildPrivateLocalOperationContinuityChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CONTINUITY_CHECKS.map(buildContinuityRecord);
    const summary = {
      total_continuity_checks: records.length,
      confirmed_continuity_checks: records.filter((record) => record.status === "Confirmed").length,
      blocked_continuity_checks: records.filter((record) => record.status === "Blocked").length,
      continuity_status: CONTINUITY_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      plan_only: true,
      protected_mode: true,
      checklist_audit_display_only: true,
      phase20_completion_prerequisite: PHASE20_COMPLETION_PREREQUISITE,
      phase21_1_prerequisite: PHASE21_1_PREREQUISITE,
      phase20_completion_final_closure_preserved: true,
      phase20_completion_display_preserved: true,
      phase20_completion_route_preserved: true,
      phase21_1_start_gate_preserved: true,
      phase21_1_display_preserved: true,
      phase21_1_route_preserved: true,
      phase21_2_route_added: true,
      readme_updated: true,
      json_syntax_check_required: true,
      javascript_syntax_check_required: true,
      new_test_added: true,
      phase21_1_test_required: true,
      phase20_completion_test_required: true,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      external_connection: false,
      external_api_connection: false,
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
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      blocked_actions: [...BLOCKED_ACTIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      checklist_name: CHECKLIST_NAME,
      panel_id: `PHASE21-2-CONTINUITY-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      continuity_status: CONTINUITY_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase21_2_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPrivateLocalOperationContinuityChecklist(options = {}) {
    return buildPrivateLocalOperationContinuityChecklist(options.sources || {}, options.now);
  }

  function renderPrivateLocalOperationContinuityChecklist(panel, doc = document) {
    const summary = panel.phase21_2_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase21-2-panel-status", panel.panel_status);
    set("#phase21-2-continuity-status", panel.continuity_status);
    set("#phase21-2-total-checks", summary.total_continuity_checks);
    set("#phase21-2-confirmed-checks", summary.confirmed_continuity_checks);
    set("#phase21-2-blocked-checks", summary.blocked_continuity_checks);
    set("#phase21-2-phase20-preserved", summary.phase20_completion_final_closure_preserved);
    set("#phase21-2-phase21-1-preserved", summary.phase21_1_start_gate_preserved);
    set("#phase21-2-private-repo", summary.private_repository);
    set("#phase21-2-local-only", summary.local_only_operation);
    set("#phase21-2-plan-only", summary.plan_only);
    set("#phase21-2-protected", summary.protected_mode);
    set("#phase21-2-no-pages-change", summary.github_pages_setting_change_allowed);
    set("#phase21-2-no-public-url", summary.public_url_guidance_allowed);
    set("#phase21-2-no-external-api", summary.external_api_connection);
    set("#phase21-2-no-auto", summary.auto_execution);
    set("#phase21-2-auto-publish", summary.auto_publish);
    set("#phase21-2-auto-launch", summary.auto_launch);
    set("#phase21-2-billing", summary.billing_integration_allowed);
    set("#phase21-2-main-push", summary.direct_push_to_main_allowed);
    set("#phase21-2-merge", summary.merge_allowed);
    set("#phase21-2-unsafe-flags", summary.unsafe_flags);
    set("#phase21-2-next-step", summary.next_recommended_step);
    set("#phase21-2-updated", panel.generated_at);
    const list = doc.querySelector("#phase21-2-private-local-operation-continuity-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase21-2-private-local-operation-continuity-checklist-item status-${record.status.toLowerCase()}`;
        row.textContent = `${record.id} ${record.label} / ${record.status} / ${record.continuity_review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPrivateLocalOperationContinuityChecklist(panel, storage) {
    if (storage) storage.setItem("phase212PrivateLocalOperationContinuityChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPrivateLocalOperationContinuityChecklist(options = {}) {
    const panel = runPrivateLocalOperationContinuityChecklist(options);
    persistPrivateLocalOperationContinuityChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPrivateLocalOperationContinuityChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-2-private-local-operation-continuity-checklist");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalOperationContinuityChecklist());
      if (document.querySelector("#phase21-2-private-local-operation-continuity-checklist-builder")) runAndRenderPrivateLocalOperationContinuityChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    CONTINUITY_STATUS,
    PHASE20_COMPLETION_PREREQUISITE,
    PHASE21_1_PREREQUISITE,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    CONTINUITY_CHECKS,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    buildPrivateLocalOperationContinuityChecklist,
    runPrivateLocalOperationContinuityChecklist,
    renderPrivateLocalOperationContinuityChecklist,
    persistPrivateLocalOperationContinuityChecklist,
    runAndRenderPrivateLocalOperationContinuityChecklist
  };
});
