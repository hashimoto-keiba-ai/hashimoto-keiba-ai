(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19PreconnectionSimulationPlanner = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-3";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "04f3d985f0127dc8fd971e5ad877d1731caf9fbe";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const SIMULATION_MODES = ["simulation_only", "validation_only", "audit_only", "report_only", "protected_only"];
  const STOP_CONDITIONS = ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-preconnection-simulation-plan-db.json", "phase19-preconnection-stop-condition-db.json"];
  const SOURCE_ASSETS = [
    "phase19-integration-blueprint.js", "phase19-integration-blueprint-db.json", "phase19-safety-contract-db.json",
    "phase19-node-priority-planner.js", "phase19-node-priority-db.json", "phase19-validation-sequence-db.json"
  ];
  const STORAGE_KEY = "phase19PreconnectionSimulationPlanLatest";

  function contractIsSafe(contract = {}) {
    const blocked = Array.isArray(contract.blocked_actions) ? contract.blocked_actions : [];
    const allowed = Array.isArray(contract.allowed_actions) ? contract.allowed_actions : [];
    return contract.official_release_protected !== false &&
      BLOCKED_ACTIONS.every((action) => blocked.includes(action)) && ALLOWED_ACTIONS.every((action) => allowed.includes(action)) &&
      contract.executionAllowed !== true && contract.autoExecutionAllowed !== true && contract.auto_execution_allowed !== true && contract.external_connection_allowed !== true;
  }

  function modeForCandidate(candidate, plannerBlocked) {
    if (candidate.connection_readiness === "protected_only" || candidate.safety_level === "protected_only") return "protected_only";
    if (plannerBlocked || candidate.connection_readiness === "blocked") return "validation_only";
    if (candidate.category === "result_learning_engines") return "validation_only";
    if (candidate.category === "governance_engines") return "audit_only";
    if (candidate.category === "dashboard_engines") return "report_only";
    return "simulation_only";
  }

  function createSimulationPlan(candidate, sequenceOrder, plannerBlocked) {
    const simulationMode = modeForCandidate(candidate, plannerBlocked);
    const requiredChecks = [...new Set([...(candidate.required_validation || []), "safety_contract", "execution_flags_false", "external_connection_blocked"])];
    return {
      simulation_plan_id: `P19-SIM-${String(sequenceOrder).padStart(3, "0")}`,
      node_name: candidate.node_name,
      category: candidate.category,
      priority_id: candidate.priority_id,
      simulation_order: sequenceOrder,
      simulation_mode: simulationMode,
      required_checks: requiredChecks,
      stop_conditions: [...STOP_CONDITIONS],
      audit_requirements: ["record_simulation_input", "record_check_results", "record_stop_reason", "produce_plan_only_report"],
      expected_output: `${candidate.category}_${simulationMode}_report`,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildSimulationPlanner(sources = {}, now = () => new Date()) {
    const blueprint = sources.blueprint || { integration_status: "plan_only_blueprint" };
    const safetyContract = sources.safetyContract || { official_release_protected: true, blocked_actions: BLOCKED_ACTIONS, allowed_actions: ALLOWED_ACTIONS, executionAllowed: false, autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false };
    const priorityDatabase = sources.priorityDatabase || { planner_status: "priority_plan_ready", records: [] };
    const validationDatabase = sources.validationDatabase || { sequence: [] };
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const records = Array.isArray(priorityDatabase.records) ? [...priorityDatabase.records].sort((a, b) => a.recommended_order - b.recommended_order) : [];
    const unsafeSourceFlags = [blueprint.executionAllowed, blueprint.autoExecutionAllowed, blueprint.auto_execution_allowed, blueprint.external_connection_allowed, priorityDatabase.executionAllowed, priorityDatabase.autoExecutionAllowed, priorityDatabase.auto_execution_allowed, priorityDatabase.external_connection_allowed, validationDatabase.executionAllowed, validationDatabase.autoExecutionAllowed, validationDatabase.auto_execution_allowed, validationDatabase.external_connection_allowed].some((flag) => flag === true);
    const plannerBlocked = blueprint.integration_status === "blueprint_blocked" || priorityDatabase.planner_status === "priority_blocked" || !contractIsSafe(safetyContract) || unsafeSourceFlags || records.length === 0;
    const plannerWarning = blueprint.integration_status === "blueprint_warning" || priorityDatabase.planner_status === "priority_warning" || missingSources.length > 0 || validationDatabase.sequence?.length !== records.length;
    const plans = records.map((candidate, index) => createSimulationPlan(candidate, index + 1, plannerBlocked));
    const generatedAt = now();
    return {
      phase: PHASE,
      planner_id: `P19-PRECONNECTION-${generatedAt.getTime()}`,
      planner_status: plannerBlocked ? "simulation_plan_blocked" : plannerWarning ? "simulation_plan_warning" : "simulation_plan_ready",
      source_blueprint_status: blueprint.integration_status || "blueprint_warning",
      source_priority_status: priorityDatabase.planner_status || "priority_warning",
      official_release_protected: safetyContract.official_release_protected !== false,
      plans,
      simulation_sequence: plans.map((plan) => ({ simulation_order: plan.simulation_order, simulation_plan_id: plan.simulation_plan_id, priority_id: plan.priority_id, simulation_mode: plan.simulation_mode })),
      stop_conditions: [...STOP_CONDITIONS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-4 Pre-Connection Simulation Validator",
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
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      assets
    };
  }

  function persistPlanner(plan, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return plan;
  }

  function renderPlanner(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-simulation-plan-status", plan.planner_status);
    set("#phase19-simulation-plan-count", plan.plans.length);
    set("#phase19-simulation-only-count", plan.plans.filter((item) => item.simulation_mode === "simulation_only").length);
    set("#phase19-validation-only-count", plan.plans.filter((item) => item.simulation_mode === "validation_only").length);
    set("#phase19-protected-plan-count", plan.plans.filter((item) => item.simulation_mode === "protected_only").length);
    set("#phase19-simulation-external", plan.external_connection_allowed);
    set("#phase19-simulation-next", plan.next_validation_step);
    set("#phase19-simulation-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-simulation-plan-list");
    if (list) {
      list.textContent = "";
      plan.plans.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-simulation-plan-item status-${item.simulation_mode}`;
        row.textContent = `${item.simulation_order}. ${item.node_name} / ${item.simulation_mode} / STOP ${item.stop_conditions.length}`;
        list.appendChild(row);
      });
    }
    return plan;
  }

  async function runSimulationPlanner(options = {}) {
    const plan = buildSimulationPlanner(await loadSources(options));
    persistPlanner(plan, options.storage || window.localStorage);
    return renderPlanner(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-simulation-planner");
      if (button) button.addEventListener("click", () => runSimulationPlanner().catch(() => undefined));
      runSimulationPlanner().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, SIMULATION_MODES, STOP_CONDITIONS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, contractIsSafe, modeForCandidate, createSimulationPlan, buildSimulationPlanner, loadAsset, loadSources, persistPlanner, renderPlanner, runSimulationPlanner };
});
