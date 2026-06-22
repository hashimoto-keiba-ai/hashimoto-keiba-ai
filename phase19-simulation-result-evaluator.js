(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19SimulationResultEvaluator = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-4";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "20353761067d5fbc0b6957eaa70937667b3eb38d";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const EVALUATION_STATUSES = ["simulation_passed", "simulation_warning", "simulation_blocked", "protected_only", "plan_only_result"];
  const SAFETY_CHECK_RESULTS = ["safety_ok", "safety_warning", "safety_blocked", "protected_only"];
  const DEPENDENCY_CHECK_RESULTS = ["dependency_ok", "dependency_warning", "dependency_blocked", "dependency_missing"];
  const STOP_CONDITION_RESULTS = ["no_stop_condition", "stop_condition_warning", "stop_condition_triggered", "protected_stop"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-simulation-result-db.json", "phase19-simulation-evaluation-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-integration-blueprint.js", "phase19-integration-blueprint-db.json", "phase19-safety-contract-db.json",
    "phase19-node-priority-planner.js", "phase19-node-priority-db.json", "phase19-validation-sequence-db.json",
    "phase19-preconnection-simulation-planner.js", "phase19-preconnection-simulation-plan-db.json", "phase19-preconnection-stop-condition-db.json"
  ];
  const STORAGE_KEY = "phase19SimulationEvaluationLatest";

  function contractIsSafe(contract = {}) {
    const blocked = Array.isArray(contract.blocked_actions) ? contract.blocked_actions : [];
    const allowed = Array.isArray(contract.allowed_actions) ? contract.allowed_actions : [];
    return contract.official_release_protected !== false &&
      BLOCKED_ACTIONS.every((action) => blocked.includes(action)) && ALLOWED_ACTIONS.every((action) => allowed.includes(action)) &&
      contract.executionAllowed !== true && contract.autoExecutionAllowed !== true && contract.auto_execution_allowed !== true && contract.external_connection_allowed !== true;
  }

  function hasUnsafeFlags(...sources) {
    return sources.some((source) => source && [source.executionAllowed, source.autoExecutionAllowed, source.auto_execution_allowed, source.external_connection_allowed, source.execution_allowed].some((flag) => flag === true));
  }

  function evaluateSimulationPlan(plan, context = {}) {
    const protectedPlan = plan.simulation_mode === "protected_only" || plan.category === "race_course_os";
    const dependencyMissing = (context.missingDependencies || []).includes(plan.simulation_plan_id) || (context.missingDependencies || []).includes(plan.priority_id);
    const blocked = context.evaluatorBlocked || dependencyMissing;
    const warning = context.evaluatorWarning || plan.simulation_mode === "validation_only";
    let evaluationStatus = "simulation_passed";
    let safetyCheckResult = "safety_ok";
    let dependencyCheckResult = "dependency_ok";
    let stopConditionResult = "no_stop_condition";
    let auditResult = "simulation_audit_passed_mock";
    let recommendedNextAction = "Recommended: retain PLAN_ONLY and include this passed mock result in the next safety review.";

    if (protectedPlan) {
      evaluationStatus = "protected_only";
      safetyCheckResult = "protected_only";
      stopConditionResult = "protected_stop";
      auditResult = "protected_release_audit_recorded";
      recommendedNextAction = "Recommended: keep Official Release v2.8 isolated as protected-only and continue read-only audit review.";
    } else if (blocked) {
      evaluationStatus = "simulation_blocked";
      safetyCheckResult = "safety_blocked";
      dependencyCheckResult = dependencyMissing ? "dependency_missing" : "dependency_blocked";
      stopConditionResult = "stop_condition_triggered";
      auditResult = "blocked_result_recorded";
      recommendedNextAction = "Recommended: review the blocking evidence in PLAN_ONLY mode before preparing another mock evaluation.";
    } else if (warning) {
      evaluationStatus = "simulation_warning";
      safetyCheckResult = "safety_warning";
      dependencyCheckResult = "dependency_warning";
      stopConditionResult = "stop_condition_warning";
      auditResult = "warning_review_required";
      recommendedNextAction = "Recommended: validate dependencies and safety checks again in isolation; keep every execution gate closed.";
    } else if (["audit_only", "report_only"].includes(plan.simulation_mode)) {
      evaluationStatus = "plan_only_result";
      auditResult = plan.simulation_mode === "audit_only" ? "audit_summary_ready" : "report_summary_ready";
      recommendedNextAction = "Recommended: carry this plan-only summary into the next governance review without enabling execution.";
    }

    return {
      result_id: `P19-RESULT-${String(plan.simulation_order).padStart(3, "0")}`,
      simulation_plan_id: plan.simulation_plan_id,
      node_name: plan.node_name,
      category: plan.category,
      simulation_order: plan.simulation_order,
      evaluation_status: evaluationStatus,
      safety_check_result: safetyCheckResult,
      dependency_check_result: dependencyCheckResult,
      stop_condition_result: stopConditionResult,
      audit_result: auditResult,
      recommended_next_action: recommendedNextAction,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildSimulationEvaluation(sources = {}, now = () => new Date()) {
    const blueprint = sources.blueprint || { integration_status: "plan_only_blueprint" };
    const safetyContract = sources.safetyContract || { official_release_protected: true, blocked_actions: BLOCKED_ACTIONS, allowed_actions: ALLOWED_ACTIONS, executionAllowed: false, autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false };
    const priorityDatabase = sources.priorityDatabase || { planner_status: "priority_plan_ready" };
    const validationDatabase = sources.validationDatabase || { sequence: [] };
    const simulationDatabase = sources.simulationDatabase || { planner_status: "simulation_plan_ready", records: [] };
    const stopDatabase = sources.stopDatabase || { stop_conditions: [] };
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const records = Array.isArray(simulationDatabase.records) ? [...simulationDatabase.records].sort((a, b) => a.simulation_order - b.simulation_order) : [];
    const evaluatorBlocked = blueprint.integration_status === "blueprint_blocked" || priorityDatabase.planner_status === "priority_blocked" || simulationDatabase.planner_status === "simulation_plan_blocked" || !contractIsSafe(safetyContract) || hasUnsafeFlags(blueprint, safetyContract, priorityDatabase, validationDatabase, simulationDatabase, stopDatabase) || records.length === 0;
    const evaluatorWarning = blueprint.integration_status === "blueprint_warning" || priorityDatabase.planner_status === "priority_warning" || simulationDatabase.planner_status === "simulation_plan_warning" || missingSources.length > 0;
    const context = { evaluatorBlocked, evaluatorWarning, missingDependencies: sources.missingDependencies || [] };
    const results = records.map((record) => evaluateSimulationPlan(record, context));
    const summary = {
      total: results.length,
      passed: results.filter((item) => item.evaluation_status === "simulation_passed").length,
      warnings: results.filter((item) => item.evaluation_status === "simulation_warning").length,
      blocked: results.filter((item) => item.evaluation_status === "simulation_blocked").length,
      protected: results.filter((item) => item.evaluation_status === "protected_only").length,
      plan_only: results.filter((item) => item.evaluation_status === "plan_only_result").length
    };
    const generatedAt = now();
    return {
      phase: PHASE,
      evaluator_id: `P19-EVALUATOR-${generatedAt.getTime()}`,
      evaluator_status: summary.blocked > 0 ? "evaluation_blocked" : summary.warnings > 0 || evaluatorWarning ? "evaluation_warning" : "evaluation_ready",
      source_blueprint_status: blueprint.integration_status || "blueprint_warning",
      source_priority_status: priorityDatabase.planner_status || "priority_warning",
      source_simulation_status: simulationDatabase.planner_status || "simulation_plan_warning",
      official_release_protected: safetyContract.official_release_protected !== false,
      results,
      evaluation_summary: summary,
      audit_summary: { status: summary.blocked > 0 ? "audit_blocked" : summary.warnings > 0 ? "audit_warning" : "audit_ready", result_count: results.length, external_connection_observed: false, execution_observed: false },
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-5 Global Network Pre-Connection Approval Gate",
      generated_at: generatedAt.toISOString(),
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false
    };
  }

  async function loadAsset(path, fetcher) {
    try {
      const response = await fetcher(path, { cache: "no-store" });
      if (!response.ok) return null;
      return path.endsWith(".json") ? await response.json() : await response.text();
    } catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const loaded = await Promise.all(SOURCE_ASSETS.map(async (asset) => [asset, await loadAsset(asset, fetcher)]));
    const assets = Object.fromEntries(loaded.filter(([, value]) => value !== null));
    return {
      blueprint: options.blueprint || assets["phase19-integration-blueprint-db.json"],
      safetyContract: options.safetyContract || assets["phase19-safety-contract-db.json"],
      priorityDatabase: options.priorityDatabase || assets["phase19-node-priority-db.json"],
      validationDatabase: options.validationDatabase || assets["phase19-validation-sequence-db.json"],
      simulationDatabase: options.simulationDatabase || assets["phase19-preconnection-simulation-plan-db.json"],
      stopDatabase: options.stopDatabase || assets["phase19-preconnection-stop-condition-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      missingDependencies: options.missingDependencies || [],
      assets
    };
  }

  function persistEvaluation(evaluation, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(evaluation));
    return evaluation;
  }

  function renderEvaluation(evaluation, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-result-status", evaluation.evaluator_status);
    set("#phase19-result-total", evaluation.evaluation_summary.total);
    set("#phase19-result-passed", evaluation.evaluation_summary.passed);
    set("#phase19-result-warning", evaluation.evaluation_summary.warnings);
    set("#phase19-result-blocked", evaluation.evaluation_summary.blocked);
    set("#phase19-result-protected", evaluation.evaluation_summary.protected);
    set("#phase19-result-external", evaluation.external_connection_allowed);
    set("#phase19-result-next", evaluation.next_validation_step);
    set("#phase19-result-updated", evaluation.generated_at);
    const list = doc.querySelector("#phase19-result-list");
    if (list) {
      list.textContent = "";
      evaluation.results.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-result-item status-${item.evaluation_status}`;
        row.textContent = `${item.simulation_order}. ${item.node_name} / ${item.evaluation_status} / ${item.stop_condition_result}`;
        list.appendChild(row);
      });
    }
    return evaluation;
  }

  async function runSimulationEvaluator(options = {}) {
    const evaluation = buildSimulationEvaluation(await loadSources(options));
    persistEvaluation(evaluation, options.storage || window.localStorage);
    return renderEvaluation(evaluation, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-result-evaluator");
      if (button) button.addEventListener("click", () => runSimulationEvaluator().catch(() => undefined));
      runSimulationEvaluator().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, EVALUATION_STATUSES, SAFETY_CHECK_RESULTS, DEPENDENCY_CHECK_RESULTS, STOP_CONDITION_RESULTS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, contractIsSafe, hasUnsafeFlags, evaluateSimulationPlan, buildSimulationEvaluation, loadAsset, loadSources, persistEvaluation, renderEvaluation, runSimulationEvaluator };
});
