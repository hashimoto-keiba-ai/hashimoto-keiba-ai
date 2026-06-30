(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2027FinalHandoffChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-27";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "final_handoff_checklist_plan_only";
  const HANDOFF_STATUS = "PENDING_CONFIRMATION";
  const DEVICE_STATUS_PENDING = "Pending";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Complete iPad, home PC, and company PC manual confirmation before Phase20 completion";
  const OUT_OF_SCOPE_OPERATIONS = [
    "public_publish",
    "github_pages_publish",
    "public_url_guidance",
    "external_sharing",
    "external_connection",
    "auto_execution",
    "auto_publish",
    "auto_launch",
    "billing_integration",
    "real_ticket_auto_purchase",
    "external_api_submission"
  ];
  const CHECKLIST_ITEMS = [
    { id: "P20-27-FREEZE", label: "Private release freeze state confirmed", status: "Confirmed" },
    { id: "P20-27-LOCAL-LAUNCH", label: "Local launch confirmed", status: "Confirmed" },
    { id: "P20-27-INDEX", label: "index.html display confirmed", status: "Confirmed" },
    { id: "P20-27-PRIVATE-LOCAL", label: "private-local.html display confirmed", status: "Confirmed" },
    { id: "P20-27-LINKS", label: "Phase20-1 through Phase20-26 routes confirmed", status: "Confirmed" },
    { id: "P20-27-JSON", label: "JSON syntax confirmation required", status: "Confirmed" },
    { id: "P20-27-BUILDER", label: "builder JS syntax confirmation required", status: "Confirmed" },
    { id: "P20-27-TEST", label: "test syntax confirmation required", status: "Confirmed" },
    { id: "P20-27-PLAN-ONLY", label: "PLAN_ONLY policy maintained", status: "Confirmed" },
    { id: "P20-27-PROTECTED", label: "Protected policy maintained", status: "Confirmed" },
    { id: "P20-27-PAGES", label: "GitHub Pages independence confirmed", status: "Confirmed" },
    { id: "P20-27-NO-PUBLIC", label: "No external public exposure confirmed", status: "Confirmed" },
    { id: "P20-27-IPAD", label: "iPad confirmation", status: DEVICE_STATUS_PENDING },
    { id: "P20-27-HOME-PC", label: "Home PC confirmation", status: DEVICE_STATUS_PENDING },
    { id: "P20-27-COMPANY-PC", label: "Company PC confirmation", status: DEVICE_STATUS_PENDING },
    { id: "P20-27-NEXT", label: "Phase20 pre-completion next step available", status: "Confirmed" }
  ];
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report", "local_launch", "dashboard_view", "handoff_review", "draft_pr"];
  const BLOCKED_ACTIONS = [
    "direct_push_to_main",
    "merge",
    "merge_without_pr_review",
    "ready_for_review_pr",
    "public_publish",
    "github_pages_publish",
    "public_url_guidance",
    "public_url_exposure",
    "external_sharing",
    "external_connection",
    "external_api_submission",
    "billing_integration",
    "real_ticket_auto_purchase",
    "auto_publish",
    "auto_execution",
    "auto_launch",
    "github_pages_setting_change",
    "repository_visibility_change",
    "dashboard_public_release_enable",
    "non_local_launch",
    "auto_merge",
    "pull_request_bypass"
  ];

  function policyFields() {
    return {
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      protected_mode: true,
      plan_only: true,
      unsafe_guard: true,
      handoff_status: HANDOFF_STATUS,
      draft_pr_required: true,
      merge_allowed: false,
      direct_push_to_main_allowed: false,
      github_pages_launch: false,
      github_pages_launch_allowed: false,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      public_release_ready: false,
      external_connection: false,
      external_connection_allowed: false,
      auto_execution: false,
      auto_execution_allowed: false,
      auto_publish: false,
      auto_publish_allowed: false,
      auto_launch: false,
      auto_launch_allowed: false,
      repository_visibility_change_allowed: false,
      unsafe_flags: 0,
      unsafe_flags_count: 0,
      ipad_confirmation_status: DEVICE_STATUS_PENDING,
      home_pc_confirmation_status: DEVICE_STATUS_PENDING,
      company_pc_confirmation_status: DEVICE_STATUS_PENDING,
      pending_items_are_pending: true,
      phase20_1_through_phase20_26_routes_confirmed: true,
      phase20_12_through_phase20_26_locks_preserved: true,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
  }

  function buildFinalHandoffChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = CHECKLIST_ITEMS.map((item) => ({
      ...item,
      handoff_review_status: item.status === DEVICE_STATUS_PENDING ? "pending_manual_confirmation" : "handoff_check_confirmed",
      ...policyFields()
    }));
    const summary = {
      total_checklist_items: records.length,
      confirmed_items: records.filter((record) => record.status === "Confirmed").length,
      pending_items: records.filter((record) => record.status === DEVICE_STATUS_PENDING).length,
      handoff_status: HANDOFF_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      private_release_freeze_state_confirmed: true,
      local_launch_confirmed: true,
      index_html_display_confirmed: true,
      private_local_html_display_confirmed: true,
      phase20_1_through_phase20_26_routes_confirmed: true,
      json_syntax_confirmation_required: true,
      builder_js_syntax_confirmation_required: true,
      test_syntax_confirmation_required: true,
      plan_only: true,
      protected_mode: true,
      unsafe_guard: true,
      github_pages_independence_confirmed: true,
      no_external_public_exposure_confirmed: true,
      ipad_confirmation_status: DEVICE_STATUS_PENDING,
      home_pc_confirmation_status: DEVICE_STATUS_PENDING,
      company_pc_confirmation_status: DEVICE_STATUS_PENDING,
      pending_items_are_pending: true,
      draft_pr_required: true,
      merge_allowed: false,
      direct_push_to_main_allowed: false,
      github_pages_launch: false,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      external_connection: false,
      auto_execution: false,
      auto_publish: false,
      auto_launch: false,
      repository_visibility_change_allowed: false,
      unsafe_flags: 0,
      phase20_12_through_phase20_26_locks_preserved: true,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      panel_id: `P20-27-FINAL-HANDOFF-CHECKLIST-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_27_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runFinalHandoffChecklist(options = {}) {
    return buildFinalHandoffChecklist(options.sources || {}, options.now);
  }

  function renderFinalHandoffChecklist(panel, doc = document) {
    const summary = panel.phase20_27_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-27-panel-status", panel.panel_status);
    set("#phase20-27-handoff-status", summary.handoff_status);
    set("#phase20-27-total-items", summary.total_checklist_items);
    set("#phase20-27-confirmed-items", summary.confirmed_items);
    set("#phase20-27-pending-items", summary.pending_items);
    set("#phase20-27-freeze", summary.private_release_freeze_state_confirmed);
    set("#phase20-27-local-launch", summary.local_launch_confirmed);
    set("#phase20-27-index", summary.index_html_display_confirmed);
    set("#phase20-27-private-local", summary.private_local_html_display_confirmed);
    set("#phase20-27-routes", summary.phase20_1_through_phase20_26_routes_confirmed);
    set("#phase20-27-plan-only", summary.plan_only);
    set("#phase20-27-protected", summary.protected_mode);
    set("#phase20-27-pages-independent", summary.github_pages_independence_confirmed);
    set("#phase20-27-no-public", summary.no_external_public_exposure_confirmed);
    set("#phase20-27-ipad", summary.ipad_confirmation_status);
    set("#phase20-27-home-pc", summary.home_pc_confirmation_status);
    set("#phase20-27-company-pc", summary.company_pc_confirmation_status);
    set("#phase20-27-next-step", summary.next_recommended_step);
    set("#phase20-27-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-27-final-handoff-checklist-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase20-27-final-handoff-checklist-item ${record.status === DEVICE_STATUS_PENDING ? "pending-note" : ""}`;
        row.textContent = `${record.label} / status:${record.status} / review:${record.handoff_review_status}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistFinalHandoffChecklist(panel, storage) {
    if (storage) storage.setItem("phase2027FinalHandoffChecklistLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderFinalHandoffChecklist(options = {}) {
    const panel = runFinalHandoffChecklist(options);
    persistFinalHandoffChecklist(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderFinalHandoffChecklist(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-27-final-handoff-checklist");
      if (button) button.addEventListener("click", () => runAndRenderFinalHandoffChecklist());
      if (document.querySelector("#phase20-27-final-handoff-checklist-builder")) runAndRenderFinalHandoffChecklist();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    HANDOFF_STATUS,
    DEVICE_STATUS_PENDING,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    OUT_OF_SCOPE_OPERATIONS,
    CHECKLIST_ITEMS,
    ALLOWED_ACTIONS,
    BLOCKED_ACTIONS,
    buildFinalHandoffChecklist,
    runFinalHandoffChecklist,
    renderFinalHandoffChecklist,
    persistFinalHandoffChecklist,
    runAndRenderFinalHandoffChecklist
  };
});
