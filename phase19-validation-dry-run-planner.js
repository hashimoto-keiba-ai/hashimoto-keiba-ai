(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19ValidationDryRunPlanner = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-11";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "7657d17a8c1c556d59feab8950c71372912b3e11";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const DRY_RUN_STATUSES = ["dry_run_ready", "dry_run_plan_only", "dry_run_needs_review", "dry_run_hold", "dry_run_blocked", "protected_only"];
  const DRY_RUN_MODES = ["plan_only_dry_run", "simulation_dry_run", "validation_dry_run", "audit_dry_run", "report_dry_run", "protected_only"];
  const STOP_CONDITIONS = ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-validation-dry-run-db.json", "phase19-validation-dry-run-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-validation-scenario-db.json",
    "phase19-validation-scenario-summary-db.json",
    "phase19-validation-readiness-checklist-db.json",
    "phase19-validation-readiness-summary-db.json",
    "phase19-connection-readiness-matrix-db.json",
    "phase19-connection-readiness-summary-db.json"
  ];
  const STORAGE_KEY = "phase19ValidationDryRunPlannerLatest";

  function hasUnsafeFlags(...sources) {
    const keys = ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed", "execution_allowed", "connection_authority_issued"];
    return sources.some((source) => {
      const visit = (value) => {
        if (!value || typeof value !== "object") return false;
        if (Array.isArray(value)) return value.some(visit);
        return Object.entries(value).some(([key, nested]) => (keys.includes(key) && nested === true) || visit(nested));
      };
      return visit(source);
    });
  }

  function dryRunStatusFor(checklist, unsafe) {
    if (checklist.checklist_status === "protected_only") return "protected_only";
    if (unsafe || checklist.checklist_status === "checklist_blocked") return "dry_run_blocked";
    if (checklist.checklist_status === "checklist_hold") return "dry_run_hold";
    if (checklist.checklist_status === "checklist_needs_review") return "dry_run_needs_review";
    if (checklist.checklist_status === "checklist_plan_only") return "dry_run_plan_only";
    return "dry_run_ready";
  }

  function dryRunModeFor(checklist, scenario) {
    if (checklist.checklist_status === "protected_only") return "protected_only";
    if (checklist.checklist_status === "checklist_plan_only") {
      if (scenario?.validation_mode === "audit_only") return "audit_dry_run";
      if (scenario?.validation_mode === "report_only") return "report_dry_run";
      return "plan_only_dry_run";
    }
    if (scenario?.validation_mode === "validation_only") return "validation_dry_run";
    if (scenario?.validation_mode === "audit_only") return "audit_dry_run";
    if (scenario?.validation_mode === "report_only") return "report_dry_run";
    return "simulation_dry_run";
  }

  function dryRunStepsFor(checklist, mode) {
    const steps = ["review_readiness_checklist", "confirm_required_prechecks", "confirm_stop_conditions", "confirm_audit_requirements", "confirm_execution_flags_false", "confirm_external_connection_false"];
    const modeSteps = {
      simulation_dry_run: ["plan_mock_input_observation", "plan_expected_simulation_log_review"],
      validation_dry_run: ["plan_schema_and_dependency_observation", "plan_validation_result_log_review"],
      audit_dry_run: ["plan_governance_audit_observation", "plan_audit_trace_log_review"],
      report_dry_run: ["plan_dashboard_render_observation", "plan_display_only_log_review"],
      plan_only_dry_run: ["plan_non_executing_review_sequence", "plan_report_only_evidence_capture"],
      protected_only: ["plan_read_only_protection_review", "plan_protected_release_log_record"]
    };
    return [...steps, ...(modeSteps[mode] || []), ...(checklist.required_prechecks || []).slice(0, 4).map((item) => `observe_${item}`)];
  }

  function observationPointsFor(checklist, scenario) {
    return [
      `checklist_status:${checklist.checklist_status}`,
      `scenario_status:${checklist.scenario_status}`,
      `validation_mode:${scenario?.validation_mode || "unknown"}`,
      "execution_allowed:false",
      "external_connection_allowed:false",
      `unresolved_items:${(checklist.unresolved_items || []).length}`
    ];
  }

  function expectedLogsFor(checklist, mode, status) {
    return [
      `dry_run_status=${status}`,
      `dry_run_mode=${mode}`,
      `checklist_id=${checklist.checklist_id}`,
      "execution_allowed=false",
      "external_connection_allowed=false",
      "connection_authority_issued=false"
    ];
  }

  function recommendedActionFor(status) {
    if (status === "protected_only") return "Recommended: keep the dry run as a read-only protection review with no validation execution.";
    if (status === "dry_run_plan_only") return "Recommended: keep the dry run as plan/audit/report review only and retain all connection blocks.";
    if (status === "dry_run_ready") return "Recommended: proceed only to a PLAN_ONLY dry-run review; do not enable execution or external connection.";
    if (status === "dry_run_needs_review") return "Recommended: review unresolved checklist items before scheduling any dry-run review.";
    if (status === "dry_run_hold") return "Recommended: keep the dry run on hold and gather safety evidence only.";
    return "Recommended: stop at dry-run planning and resolve blocking evidence without changing safety policy.";
  }

  function createDryRunPlan(checklist, context = {}) {
    const scenario = context.scenarioById.get(checklist.scenario_id);
    const status = dryRunStatusFor(checklist, context.unsafe);
    const mode = dryRunModeFor(checklist, scenario);
    return {
      dry_run_id: `P19-DRY-RUN-${checklist.priority_id.split("-").pop()}`,
      checklist_id: checklist.checklist_id,
      scenario_id: checklist.scenario_id,
      node_name: checklist.node_name,
      category: checklist.category,
      priority_id: checklist.priority_id,
      dry_run_status: status,
      dry_run_mode: mode,
      dry_run_steps: dryRunStepsFor(checklist, mode),
      observation_points: observationPointsFor(checklist, scenario),
      expected_logs: expectedLogsFor(checklist, mode, status),
      stop_conditions: [...STOP_CONDITIONS],
      audit_requirements: [...(checklist.audit_requirements || [])],
      recommended_next_action: recommendedActionFor(status),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildValidationDryRunPlans(sources = {}, now = () => new Date()) {
    const scenarioDatabase = sources.scenarioDatabase || { records: [] };
    const scenarioSummary = sources.scenarioSummary || {};
    const checklistDatabase = sources.checklistDatabase || { records: [] };
    const checklistSummary = sources.checklistSummary || {};
    const matrixDatabase = sources.matrixDatabase || {};
    const matrixSummary = sources.matrixSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(scenarioDatabase, scenarioSummary, checklistDatabase, checklistSummary, matrixDatabase, matrixSummary);
    const scenarioById = new Map((scenarioDatabase.records || []).map((scenario) => [scenario.scenario_id, scenario]));
    const context = { scenarioById, unsafe };
    const records = (checklistDatabase.records || []).map((checklist) => createDryRunPlan(checklist, context));
    const statusCounts = Object.fromEntries(DRY_RUN_STATUSES.map((status) => [status, records.filter((item) => item.dry_run_status === status).length]));
    const modeCounts = Object.fromEntries(DRY_RUN_MODES.map((mode) => [mode, records.filter((item) => item.dry_run_mode === mode).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      dry_run_planner_id: `P19-DRY-RUN-PLANNER-${generatedAt.getTime()}`,
      dry_run_planner_status: unsafe || missingSources.length > 0 ? "dry_run_planner_blocked" : "dry_run_planner_plan_only",
      source_scenario_status: scenarioDatabase.scenario_builder_status || "unknown",
      source_checklist_status: checklistDatabase.checklist_builder_status || "unknown",
      source_matrix_status: matrixDatabase.matrix_status || "unknown",
      official_release_protected: scenarioDatabase.official_release_protected !== false && checklistDatabase.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      dry_run_summary: {
        total: records.length,
        ...statusCounts,
        dry_run_modes: modeCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-12 Global Network Dry Run Result Evaluator",
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      generated_at: generatedAt.toISOString(),
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false
    };
  }

  async function loadJson(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const loaded = await Promise.all(SOURCE_ASSETS.map(async (asset) => [asset, await loadJson(asset, fetcher)]));
    const databases = Object.fromEntries(loaded.filter(([, value]) => value !== null));
    return {
      scenarioDatabase: options.scenarioDatabase || databases["phase19-validation-scenario-db.json"],
      scenarioSummary: options.scenarioSummary || databases["phase19-validation-scenario-summary-db.json"],
      checklistDatabase: options.checklistDatabase || databases["phase19-validation-readiness-checklist-db.json"],
      checklistSummary: options.checklistSummary || databases["phase19-validation-readiness-summary-db.json"],
      matrixDatabase: options.matrixDatabase || databases["phase19-connection-readiness-matrix-db.json"],
      matrixSummary: options.matrixSummary || databases["phase19-connection-readiness-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistDryRun(plan, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan)); return plan; }

  function renderDryRun(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-dry-run-planner-status", plan.dry_run_planner_status);
    set("#phase19-dry-run-total", plan.dry_run_summary.total);
    set("#phase19-dry-run-ready", plan.dry_run_summary.dry_run_ready);
    set("#phase19-dry-run-plan-only", plan.dry_run_summary.dry_run_plan_only);
    set("#phase19-dry-run-protected", plan.dry_run_summary.protected_only);
    set("#phase19-dry-run-unsafe", plan.dry_run_summary.unsafe_flags_count);
    set("#phase19-dry-run-authority", plan.connection_authority_issued);
    set("#phase19-dry-run-next", plan.next_validation_step);
    set("#phase19-dry-run-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-dry-run-list");
    if (list) {
      list.textContent = "";
      plan.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-dry-run-item status-${item.dry_run_status}`;
        row.textContent = `${item.dry_run_id} / ${item.node_name} / ${item.dry_run_status} / ${item.dry_run_mode}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runValidationDryRunPlanner(options = {}) {
    const plan = buildValidationDryRunPlans(await loadSources(options));
    persistDryRun(plan, options.storage || window.localStorage);
    return renderDryRun(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-dry-run-planner");
      if (button) button.addEventListener("click", () => runValidationDryRunPlanner().catch(() => undefined));
      runValidationDryRunPlanner().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, DRY_RUN_STATUSES, DRY_RUN_MODES, STOP_CONDITIONS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, dryRunStatusFor, dryRunModeFor, dryRunStepsFor, observationPointsFor, expectedLogsFor, recommendedActionFor, createDryRunPlan, buildValidationDryRunPlans, loadJson, loadSources, persistDryRun, renderDryRun, runValidationDryRunPlanner };
});
