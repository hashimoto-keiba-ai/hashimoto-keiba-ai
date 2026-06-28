(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2011FinalIntegrationSafetyReviewBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-11";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const REVIEW_STATUS = "final_integration_safety_review_plan_only";
  const SAFE_FALLBACK_HREF = "index.html";
  const NEXT_RECOMMENDED_STEP = "Manual display confirmation before any merge";
  const BLOCKED_ACTIONS = ["merge", "external_connection", "auto_execution", "auto_update", "github_pages_setting_change", "repository_visibility_change"];
  const ALLOWED_ACTIONS = ["plan", "review", "validate", "audit", "report"];
  const REQUIRED_POLICY_LABELS = ["PLAN_ONLY", "Protected", "External Send Disabled", "Auto Update Disabled", "No GitHub Pages setting changes", "Private repository premise", "Manual confirmation required before merge"];
  const RECOMMENDED_MERGE_ORDER = ["PR #174 Phase20-8", "PR #175 Phase20-9", "PR #176 Phase20-10", "Phase20-11 review PR after manual confirmation"];

  const PR_DEPENDENCIES = [
    { pr_number: 174, phase: "Phase20-8", branch: "codex/phase20-8-win5-hakodate-sapporo-console-activation", role: "Course Console activation for WIN5 / Hakodate / Sapporo", depends_on: [], draft_required: true, merge_before_manual_confirmation_allowed: false },
    { pr_number: 175, phase: "Phase20-9", branch: "codex/phase20-9-course-console-link-integrity", role: "Course Console link integrity and index.html fallback protection", depends_on: ["Phase20-8 console activation"], draft_required: true, merge_before_manual_confirmation_allowed: false },
    { pr_number: 176, phase: "Phase20-10", branch: "codex/phase20-10-final-display-confirmation-checklist", base_branch: "codex/phase20-9-course-console-link-integrity", role: "Final display confirmation checklist before merge", depends_on: ["PR #175 branch because #176 is based on codex/phase20-9-course-console-link-integrity"], draft_required: true, merge_before_manual_confirmation_allowed: false }
  ];

  const REVIEW_TARGETS = [
    { id: "P20-11-COURSE-CONSOLE", target_name: "Course Console routes", route: "course-console.html?console=win5 / hakodate / sapporo", expected_result: "Dedicated console surfaces remain visible." },
    { id: "P20-11-WIN5", target_name: "WIN5 Console", route: "course-console.html?console=win5", expected_result: "WIN5 links remain visible." },
    { id: "P20-11-HAKODATE", target_name: "Hakodate Console", route: "course-console.html?console=hakodate", expected_result: "Hakodate cards remain visible." },
    { id: "P20-11-SAPPORO", target_name: "Sapporo Console", route: "course-console.html?console=sapporo", expected_result: "Sapporo cards remain visible." },
    { id: "P20-11-FALLBACK", target_name: "Missing link fallback", route: SAFE_FALLBACK_HREF, expected_result: "Missing repository-local links safely fall back to index.html." },
    { id: "P20-11-PRIVATE-LOCAL", target_name: "private-local route", route: "private-local.html", expected_result: "private-local keeps review routes visible." },
    { id: "P20-11-INDEX", target_name: "index.html route", route: "index.html", expected_result: "index.html keeps PLAN_ONLY review panels available." }
  ];

  function policyFields() {
    return { protected_mode: true, plan_only: true, execution_allowed: false, auto_execution_allowed: false, external_connection_allowed: false, auto_update_allowed: false, github_pages_setting_change_allowed: false, repository_visibility_change_allowed: false, merge_allowed: false, required_policy_labels: [...REQUIRED_POLICY_LABELS], blocked_actions: [...BLOCKED_ACTIONS], allowed_actions: [...ALLOWED_ACTIONS] };
  }

  function buildFinalIntegrationSafetyReview(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = REVIEW_TARGETS.map((target) => ({ ...target, review_status: "manual_review_pending", manual_confirmation_required: true, merge_before_confirmation_allowed: false, fallback_expected_href: SAFE_FALLBACK_HREF, ...policyFields() }));
    return {
      phase: PHASE,
      review_id: `P20-11-FINAL-INTEGRATION-SAFETY-${generatedAt.getTime()}`,
      review_status: REVIEW_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      pr_dependencies: PR_DEPENDENCIES.map((dependency) => ({ ...dependency })),
      records,
      phase20_11_summary: {
        total_review_targets: records.length,
        draft_prs_tracked: PR_DEPENDENCIES.length,
        pr_175_draft_required: true,
        pr_176_draft_required: true,
        pr_176_base_branch: "codex/phase20-9-course-console-link-integrity",
        merge_sequence_warning: "#176 is based on the #175 branch, so #175 must be handled before #176. Keep both Draft until manual confirmation is complete.",
        manual_confirmation_required_before_merge: true,
        protected_mode: true,
        plan_only: true,
        execution_allowed: false,
        auto_execution_allowed: false,
        external_connection_allowed: false,
        auto_update_allowed: false,
        github_pages_setting_change_allowed: false,
        repository_visibility_change_allowed: false,
        merge_allowed: false,
        unsafe_flags_count: 0,
        safe_fallback_href: SAFE_FALLBACK_HREF,
        recommended_merge_order: [...RECOMMENDED_MERGE_ORDER],
        next_recommended_step: NEXT_RECOMMENDED_STEP
      },
      generated_at: generatedAt.toISOString(),
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      ...policyFields()
    };
  }

  function runFinalIntegrationSafetyReview(options = {}) {
    return buildFinalIntegrationSafetyReview(options.sources || {}, options.now);
  }

  return { PHASE, EXECUTION_POLICY, PROTECTION_POLICY, REVIEW_STATUS, NEXT_RECOMMENDED_STEP, BLOCKED_ACTIONS, ALLOWED_ACTIONS, REQUIRED_POLICY_LABELS, SAFE_FALLBACK_HREF, RECOMMENDED_MERGE_ORDER, PR_DEPENDENCIES, REVIEW_TARGETS, buildFinalIntegrationSafetyReview, runFinalIntegrationSafetyReview };
});
