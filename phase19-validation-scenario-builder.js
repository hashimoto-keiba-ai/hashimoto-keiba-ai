(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19ValidationScenarioBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-9";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "2901f85156497ddc4a5a3073bbe045fde5c6fde4";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const SCENARIO_STATUSES = ["scenario_ready", "scenario_plan_only", "scenario_needs_validation", "scenario_hold", "scenario_blocked", "protected_only"];
  const VALIDATION_MODES = ["dry_run_only", "simulation_only", "validation_only", "audit_only", "report_only", "protected_only"];
  const STOP_CONDITIONS = ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-validation-scenario-db.json", "phase19-validation-scenario-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-connection-readiness-matrix-db.json",
    "phase19-connection-readiness-summary-db.json",
    "phase19-integration-blueprint-db.json",
    "phase19-safety-contract-db.json",
    "phase19-node-priority-db.json",
    "phase19-validation-sequence-db.json",
    "phase19-preconnection-simulation-plan-db.json",
    "phase19-preconnection-stop-condition-db.json",
    "phase19-simulation-result-db.json",
    "phase19-preconnection-approval-db.json",
    "phase19-final-preconnection-safety-review-db.json",
    "phase19-midphase-integrity-summary-db.json"
  ];
  const STORAGE_KEY = "phase19ValidationScenarioBuilderLatest";

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

  function scenarioStatusFromReadiness(row, unsafe) {
    if (row.readiness_status === "protected_only") return "protected_only";
    if (unsafe || row.readiness_status === "readiness_blocked") return "scenario_blocked";
    if (row.readiness_status === "readiness_hold") return "scenario_hold";
    if (row.readiness_status === "readiness_needs_validation") return "scenario_needs_validation";
    if (row.readiness_status === "readiness_plan_only") return "scenario_plan_only";
    return "scenario_ready";
  }

  function validationModeFor(row, scenarioStatus) {
    if (scenarioStatus === "protected_only") return "protected_only";
    if (scenarioStatus === "scenario_blocked") return "dry_run_only";
    if (row.category === "result_learning_engines" || scenarioStatus === "scenario_needs_validation") return "validation_only";
    if (row.category === "governance_engines") return "audit_only";
    if (row.category === "dashboard_engines") return "report_only";
    return "simulation_only";
  }

  function validationStepsFor(row, mode) {
    const base = ["load_connection_readiness_matrix", "confirm_plan_only_policy", "confirm_execution_flags_false", "confirm_external_connection_false"];
    const modeSteps = {
      simulation_only: ["run_isolated_mock_simulation_review", "compare_expected_output_summary"],
      validation_only: ["review_required_conditions", "validate_dependency_and_schema_summary"],
      audit_only: ["review_governance_evidence", "confirm_audit_trace_is_read_only"],
      report_only: ["render_dashboard_observation_report", "confirm_display_only_behavior"],
      protected_only: ["confirm_official_release_v2_8_protection", "record_read_only_protection_audit"],
      dry_run_only: ["record_blocked_dry_run", "stop_before_any_connection_step"]
    };
    return [...base, ...(modeSteps[mode] || []), ...(row.remaining_conditions || []).map((condition) => `confirm_${condition}`)];
  }

  function requiredChecksFor(row) {
    return [
      "PLAN_ONLY enforced",
      "blocked_actions include external_connection and auto_execution",
      "allowed_actions limited to plan/simulate/validate/audit/report",
      `readiness_status is ${row.readiness_status}`,
      `approval_status is ${row.approval_status}`,
      `final_review_status is ${row.final_review_status}`
    ];
  }

  function expectedOutputsFor(row, scenarioStatus, mode) {
    return [
      `scenario_status: ${scenarioStatus}`,
      `validation_mode: ${mode}`,
      "execution_allowed: false",
      "external_connection_allowed: false",
      `next_validation_step: ${row.next_validation_step}`
    ];
  }

  function auditFocusFor(row, scenarioStatus) {
    if (scenarioStatus === "protected_only") return ["Official Release v2.8 protection", "read-only release audit", "connection authority remains false"];
    if (scenarioStatus === "scenario_plan_only") return ["plan-only governance", "no execution authority", "display/audit/report evidence"];
    if (row.remaining_conditions?.length) return ["remaining condition review", "dependency/schema validation", "safety flag confirmation"];
    return ["mock simulation evidence", "safety contract compliance", "closed connection gate"];
  }

  function createScenario(row, context = {}) {
    const scenarioStatus = scenarioStatusFromReadiness(row, context.unsafe);
    const validationMode = validationModeFor(row, scenarioStatus);
    return {
      scenario_id: `P19-SCENARIO-${row.priority_id.split("-").pop()}`,
      node_name: row.node_name,
      category: row.category,
      priority_id: row.priority_id,
      readiness_status: row.readiness_status,
      scenario_status: scenarioStatus,
      validation_mode: validationMode,
      validation_steps: validationStepsFor(row, validationMode),
      required_checks: requiredChecksFor(row),
      stop_conditions: [...STOP_CONDITIONS],
      expected_outputs: expectedOutputsFor(row, scenarioStatus, validationMode),
      audit_focus: auditFocusFor(row, scenarioStatus),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildValidationScenarios(sources = {}, now = () => new Date()) {
    const matrixDatabase = sources.matrixDatabase || { records: [] };
    const matrixSummary = sources.matrixSummary || {};
    const safetyContract = sources.safetyContract || {};
    const midphaseSummary = sources.midphaseSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(matrixDatabase, matrixSummary, safetyContract, midphaseSummary);
    const records = (matrixDatabase.records || []).map((row) => createScenario(row, { unsafe }));
    const statusCounts = Object.fromEntries(SCENARIO_STATUSES.map((status) => [status, records.filter((item) => item.scenario_status === status).length]));
    const modeCounts = Object.fromEntries(VALIDATION_MODES.map((mode) => [mode, records.filter((item) => item.validation_mode === mode).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      scenario_builder_id: `P19-SCENARIO-BUILDER-${generatedAt.getTime()}`,
      scenario_builder_status: unsafe || missingSources.length > 0 ? "scenario_builder_blocked" : "scenario_builder_plan_only",
      source_matrix_status: matrixDatabase.matrix_status || "unknown",
      source_midphase_status: matrixDatabase.source_midphase_status || midphaseSummary.phase19_midphase_status || "unknown",
      official_release_protected: matrixDatabase.official_release_protected !== false && safetyContract.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      scenario_summary: {
        total: records.length,
        ...statusCounts,
        validation_modes: modeCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-10 Global Network Validation Readiness Checklist",
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
      matrixDatabase: options.matrixDatabase || databases["phase19-connection-readiness-matrix-db.json"],
      matrixSummary: options.matrixSummary || databases["phase19-connection-readiness-summary-db.json"],
      blueprint: options.blueprint || databases["phase19-integration-blueprint-db.json"],
      safetyContract: options.safetyContract || databases["phase19-safety-contract-db.json"],
      priorityDatabase: options.priorityDatabase || databases["phase19-node-priority-db.json"],
      validationSequence: options.validationSequence || databases["phase19-validation-sequence-db.json"],
      simulationPlan: options.simulationPlan || databases["phase19-preconnection-simulation-plan-db.json"],
      stopConditions: options.stopConditions || databases["phase19-preconnection-stop-condition-db.json"],
      simulationResults: options.simulationResults || databases["phase19-simulation-result-db.json"],
      approvalDatabase: options.approvalDatabase || databases["phase19-preconnection-approval-db.json"],
      finalReviewDatabase: options.finalReviewDatabase || databases["phase19-final-preconnection-safety-review-db.json"],
      midphaseSummary: options.midphaseSummary || databases["phase19-midphase-integrity-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistScenarios(scenarios, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(scenarios)); return scenarios; }

  function renderScenarios(scenarios, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-scenario-builder-status", scenarios.scenario_builder_status);
    set("#phase19-scenario-total", scenarios.scenario_summary.total);
    set("#phase19-scenario-ready", scenarios.scenario_summary.scenario_ready);
    set("#phase19-scenario-plan-only", scenarios.scenario_summary.scenario_plan_only);
    set("#phase19-scenario-protected", scenarios.scenario_summary.protected_only);
    set("#phase19-scenario-unsafe", scenarios.scenario_summary.unsafe_flags_count);
    set("#phase19-scenario-authority", scenarios.connection_authority_issued);
    set("#phase19-scenario-next", scenarios.next_validation_step);
    set("#phase19-scenario-updated", scenarios.generated_at);
    const list = doc.querySelector("#phase19-scenario-list");
    if (list) {
      list.textContent = "";
      scenarios.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-scenario-item status-${item.scenario_status}`;
        row.textContent = `${item.scenario_id} / ${item.node_name} / ${item.scenario_status} / ${item.validation_mode}`;
        list.appendChild(row);
      });
    }
    return scenarios;
  }

  async function runValidationScenarioBuilder(options = {}) {
    const scenarios = buildValidationScenarios(await loadSources(options));
    persistScenarios(scenarios, options.storage || window.localStorage);
    return renderScenarios(scenarios, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-scenario-builder");
      if (button) button.addEventListener("click", () => runValidationScenarioBuilder().catch(() => undefined));
      runValidationScenarioBuilder().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, SCENARIO_STATUSES, VALIDATION_MODES, STOP_CONDITIONS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, scenarioStatusFromReadiness, validationModeFor, validationStepsFor, requiredChecksFor, expectedOutputsFor, auditFocusFor, createScenario, buildValidationScenarios, loadJson, loadSources, persistScenarios, renderScenarios, runValidationScenarioBuilder };
});
