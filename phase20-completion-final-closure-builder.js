(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase20CompletionFinalClosureBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20";
  const CLOSURE_NAME = "Phase20 Completion Final Closure";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const PANEL_STATUS = "phase20_completion_final_closure_complete_plan_only";
  const COMPLETION_STATUS = "COMPLETE_LOCAL_ONLY_PROTECTED";
  const LOCAL_LAUNCH_POLICY = "start-local.bat / private-local.html / index.html only";
  const NEXT_RECOMMENDED_STEP = "Keep Phase20 closed for private local operation and use draft PR review before any later phase";
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
  const PHASE_COMPLETION_ITEMS = [
    { phase: "Phase20-1", title: "Post Closure Device Validation Checklist", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-2", title: "GitHub Pages Mobile Display Verification Plan", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-3", title: "Mobile Verification Result Capture Closure Plan", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-4", title: "Final Release Readiness Closure Summary", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-5", title: "Manual Mobile Verification Evidence Collection", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-6", title: "Manual Evidence Review Release Gate Decision", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-7", title: "Final Manual Device Confirmation Checklist", completion_status: "Completed as manual checkpoint record", route_status: "recorded_without_new_route" },
    { phase: "Phase20-8", title: "Course Console Activation", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-9", title: "Course Console Link Integrity", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-10", title: "Final Display Confirmation Checklist", completion_status: "Completed", route_status: "summary_record_preserved" },
    { phase: "Phase20-11", title: "Final Integration Safety Review", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-12", title: "Private Operation Safety Gate", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-13", title: "Manual Device Confirmation Gate", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-14", title: "Public Release Final Block Gate", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-15", title: "Owner Manual Approval Lock Gate", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-16", title: "Private Release Lock Audit Gate", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-17", title: "Private Safety Status Dashboard", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-18", title: "Local Launch Only Verification Gate", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-19", title: "Local Only Safety Continuity Panel", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-20", title: "Final Safety Continuity Review Panel", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-21", title: "Post Completion Safe Operation Lock Panel", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-22", title: "Safe Next Operation Review", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-23", title: "Private Local Continuity Check", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-24", title: "Safe Operation Final Guard", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-25", title: "Final Private Release Freeze Check", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-26", title: "Final Local Operation Confirmation Log", completion_status: "Completed", route_status: "route_preserved" },
    { phase: "Phase20-27", title: "Final Handoff Checklist", completion_status: "Completed", route_status: "route_preserved" }
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
      phase20_completion_status: COMPLETION_STATUS,
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
      billing_integration_allowed: false,
      external_api_submission_allowed: false,
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

  function buildCompletionRecord(item) {
    return {
      ...item,
      completion_review_status: "phase20_final_closure_confirmed",
      ...policyFields()
    };
  }

  function buildPhase20CompletionFinalClosure(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = PHASE_COMPLETION_ITEMS.map(buildCompletionRecord);
    const completedPhases = records.filter((record) => record.completion_status.toLowerCase().includes("completed")).length;
    const summary = {
      total_phase20_items: records.length,
      completed_phase20_items: completedPhases,
      protected_items: records.filter((record) => record.protected_mode === true).length,
      plan_only_items: records.filter((record) => record.plan_only === true).length,
      route_preserved_items: records.filter((record) => record.route_status === "route_preserved").length,
      summary_record_items: records.filter((record) => record.route_status === "summary_record_preserved").length,
      recorded_without_new_route_items: records.filter((record) => record.route_status === "recorded_without_new_route").length,
      phase20_completion_status: COMPLETION_STATUS,
      private_repository: true,
      repository_private_premise: true,
      local_only_operation: true,
      local_launch_policy: LOCAL_LAUNCH_POLICY,
      phase20_1_through_phase20_27_completion_summarized: true,
      existing_phase20_routes_preserved: true,
      index_html_route_added: true,
      private_local_html_route_added: true,
      readme_updated: true,
      json_syntax_check_required: true,
      javascript_syntax_check_required: true,
      new_test_added: true,
      related_phase20_tests_required: true,
      draft_pr_required: true,
      merge_allowed: false,
      github_pages_setting_change_allowed: false,
      public_url_guidance_allowed: false,
      public_release_allowed: false,
      external_connection: false,
      auto_execution: false,
      auto_publish: false,
      auto_launch: false,
      billing_integration_allowed: false,
      external_api_submission_allowed: false,
      repository_visibility_change_allowed: false,
      direct_push_to_main_allowed: false,
      unsafe_flags: 0,
      out_of_scope_operations: [...OUT_OF_SCOPE_OPERATIONS],
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      closure_name: CLOSURE_NAME,
      panel_id: `PHASE20-COMPLETION-FINAL-CLOSURE-${generatedAt.getTime()}`,
      panel_status: PANEL_STATUS,
      completion_status: COMPLETION_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_completion_summary: summary,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function runPhase20CompletionFinalClosure(options = {}) {
    return buildPhase20CompletionFinalClosure(options.sources || {}, options.now);
  }

  function renderPhase20CompletionFinalClosure(panel, doc = document) {
    const summary = panel.phase20_completion_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-completion-panel-status", panel.panel_status);
    set("#phase20-completion-status", panel.completion_status);
    set("#phase20-completion-total-items", summary.total_phase20_items);
    set("#phase20-completion-completed-items", summary.completed_phase20_items);
    set("#phase20-completion-route-preserved", summary.route_preserved_items);
    set("#phase20-completion-summary-records", summary.summary_record_items);
    set("#phase20-completion-recorded-no-route", summary.recorded_without_new_route_items);
    set("#phase20-completion-private-repo", summary.private_repository);
    set("#phase20-completion-local-only", summary.local_only_operation);
    set("#phase20-completion-plan-only", panel.plan_only);
    set("#phase20-completion-protected", panel.protected_mode);
    set("#phase20-completion-no-pages-change", summary.github_pages_setting_change_allowed);
    set("#phase20-completion-no-public-url", summary.public_url_guidance_allowed);
    set("#phase20-completion-no-external", summary.external_connection);
    set("#phase20-completion-no-auto", summary.auto_execution);
    set("#phase20-completion-unsafe-flags", summary.unsafe_flags);
    set("#phase20-completion-draft-pr", summary.draft_pr_required);
    set("#phase20-completion-merge", summary.merge_allowed);
    set("#phase20-completion-next-step", summary.next_recommended_step);
    set("#phase20-completion-updated", panel.generated_at);
    const list = doc.querySelector("#phase20-completion-final-closure-list");
    if (list) {
      list.textContent = "";
      panel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.className = `phase20-completion-final-closure-item status-${record.route_status}`;
        row.textContent = `${record.phase} ${record.title} / ${record.completion_status} / ${record.route_status} / ${EXECUTION_POLICY} / ${PROTECTION_POLICY}`;
        list.appendChild(row);
      });
    }
    return panel;
  }

  function persistPhase20CompletionFinalClosure(panel, storage) {
    if (storage) storage.setItem("phase20CompletionFinalClosureLatest", JSON.stringify(panel));
    return panel;
  }

  function runAndRenderPhase20CompletionFinalClosure(options = {}) {
    const panel = runPhase20CompletionFinalClosure(options);
    persistPhase20CompletionFinalClosure(panel, options.storage || (typeof window !== "undefined" ? window.localStorage : null));
    return renderPhase20CompletionFinalClosure(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase20-completion-final-closure");
      if (button) button.addEventListener("click", () => runAndRenderPhase20CompletionFinalClosure());
      if (document.querySelector("#phase20-completion-final-closure-builder")) runAndRenderPhase20CompletionFinalClosure();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CLOSURE_NAME,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    PANEL_STATUS,
    COMPLETION_STATUS,
    LOCAL_LAUNCH_POLICY,
    NEXT_RECOMMENDED_STEP,
    OUT_OF_SCOPE_OPERATIONS,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    PHASE_COMPLETION_ITEMS,
    buildPhase20CompletionFinalClosure,
    runPhase20CompletionFinalClosure,
    renderPhase20CompletionFinalClosure,
    persistPhase20CompletionFinalClosure,
    runAndRenderPhase20CompletionFinalClosure
  };
});
