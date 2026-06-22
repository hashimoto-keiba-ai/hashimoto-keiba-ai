(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19NodePriorityPlanner = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-2";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "47ddfbd70aeed2ecd93df4e194745d686d5dceaf";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const CATEGORIES = ["local_ai_modules", "race_course_os", "prediction_engines", "result_learning_engines", "governance_engines", "dashboard_engines"];
  const DEPENDENCY_LEVELS = ["low", "medium", "high", "protected"];
  const SAFETY_LEVELS = ["safe_plan_only", "caution", "blocked", "protected_only"];
  const CONNECTION_READINESS = ["ready_for_simulation", "needs_validation", "blocked", "protected_only", "plan_only"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-node-priority-db.json", "phase19-validation-sequence-db.json"];
  const SOURCE_ASSETS = [
    "phase19-integration-blueprint-db.json", "phase19-safety-contract-db.json",
    "phase18-completion-audit-db.json", "phase18-release-audit-db.json",
    "global-intelligence-network-core-db.json", "global-network-node-sync-db.json",
    "global-network-safety-score-db.json", "global-network-audit-report-db.json"
  ];
  const NODE_DEFINITIONS = [
    { priority_id: "P19-PRI-001", node_name: "Self Diagnosis Planning Node", category: "local_ai_modules", source_file: "self-diagnosis-page.js", dependency_level: "low", safety_level: "safe_plan_only", connection_readiness: "ready_for_simulation", recommended_order: 1, required_validation: ["health_score", "phase18_completion", "plan_only_contract"] },
    { priority_id: "P19-PRI-002", node_name: "Racing OS Protected Node", category: "race_course_os", source_file: "integrated-os-page.js", dependency_level: "protected", safety_level: "protected_only", connection_readiness: "protected_only", recommended_order: 2, required_validation: ["official_release_protection", "racing_os_integrity", "read_only_validation"] },
    { priority_id: "P19-PRI-003", node_name: "Prediction Engine Simulation Node", category: "prediction_engines", source_file: "prediction-page.js", dependency_level: "medium", safety_level: "safe_plan_only", connection_readiness: "ready_for_simulation", recommended_order: 3, required_validation: ["input_schema", "simulation_isolation", "no_external_connection"] },
    { priority_id: "P19-PRI-004", node_name: "Result Learning Validation Node", category: "result_learning_engines", source_file: "result-learning-pipeline-phase145.js", dependency_level: "high", safety_level: "caution", connection_readiness: "needs_validation", recommended_order: 4, required_validation: ["result_schema", "learning_write_block", "rollback_plan_review"] },
    { priority_id: "P19-PRI-005", node_name: "Governance Safety Node", category: "governance_engines", source_file: "repair-governance-dashboard.js", dependency_level: "high", safety_level: "safe_plan_only", connection_readiness: "plan_only", recommended_order: 5, required_validation: ["approval_gate", "audit_trail", "safety_contract"] },
    { priority_id: "P19-PRI-006", node_name: "Dashboard Observation Node", category: "dashboard_engines", source_file: "dashboard.js", dependency_level: "low", safety_level: "safe_plan_only", connection_readiness: "ready_for_simulation", recommended_order: 6, required_validation: ["display_only", "route_integrity", "no_mutation"] }
  ];
  const STORAGE_KEY = "phase19NodePriorityPlanLatest";

  function contractIsSafe(contract = {}) {
    const blocked = Array.isArray(contract.blocked_actions) ? contract.blocked_actions : BLOCKED_ACTIONS;
    const allowed = Array.isArray(contract.allowed_actions) ? contract.allowed_actions : ALLOWED_ACTIONS;
    return BLOCKED_ACTIONS.every((action) => blocked.includes(action)) && ALLOWED_ACTIONS.every((action) => allowed.includes(action)) &&
      contract.executionAllowed !== true && contract.autoExecutionAllowed !== true && contract.auto_execution_allowed !== true && contract.external_connection_allowed !== true;
  }

  function createCandidate(definition, plannerBlocked, sourceWarning) {
    const protectedNode = definition.safety_level === "protected_only";
    return {
      ...definition,
      required_validation: [...definition.required_validation],
      safety_level: protectedNode ? "protected_only" : plannerBlocked ? "blocked" : sourceWarning && definition.safety_level === "safe_plan_only" ? "caution" : definition.safety_level,
      connection_readiness: protectedNode ? "protected_only" : plannerBlocked ? "blocked" : sourceWarning && definition.connection_readiness === "ready_for_simulation" ? "needs_validation" : definition.connection_readiness,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildPriorityPlan(sources = {}, now = () => new Date()) {
    const blueprint = sources.blueprint || { integration_status: "plan_only_blueprint", source_phase18_status: { phase18_final_status: "phase18_complete", phase19_readiness_status: "phase19_ready", remaining_risks: 0 } };
    const safetyContract = sources.safetyContract || { blocked_actions: BLOCKED_ACTIONS, allowed_actions: ALLOWED_ACTIONS, executionAllowed: false, autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false, official_release_protected: true };
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const plannerBlocked = ["blueprint_blocked"].includes(blueprint.integration_status) || !contractIsSafe(safetyContract) || safetyContract.official_release_protected === false;
    const sourceWarning = ["blueprint_warning"].includes(blueprint.integration_status) || missingSources.length > 0;
    const candidates = NODE_DEFINITIONS.map((definition) => createCandidate(definition, plannerBlocked, sourceWarning));
    const generatedAt = now();
    return {
      phase: PHASE,
      planner_id: `P19-PRIORITY-PLAN-${generatedAt.getTime()}`,
      planner_status: plannerBlocked ? "priority_blocked" : sourceWarning ? "priority_warning" : "priority_plan_ready",
      source_blueprint_status: blueprint.integration_status || "blueprint_warning",
      source_phase18_status: blueprint.source_phase18_status || null,
      official_release_protected: safetyContract.official_release_protected !== false,
      candidates,
      validation_sequence: candidates.map((candidate) => ({ order: candidate.recommended_order, priority_id: candidate.priority_id, category: candidate.category, required_validation: [...candidate.required_validation], connection_readiness: candidate.connection_readiness })),
      category_summary: Object.fromEntries(CATEGORIES.map((category) => [category, candidates.filter((candidate) => candidate.category === category).length])),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-3 Node Simulation Contract Validator",
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
    return { blueprint: options.blueprint || databases["phase19-integration-blueprint-db.json"], safetyContract: options.safetyContract || databases["phase19-safety-contract-db.json"], availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset), databases };
  }

  function persistPlan(plan, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return plan;
  }

  function renderPlan(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-priority-status", plan.planner_status);
    set("#phase19-priority-count", plan.candidates.length);
    set("#phase19-simulation-ready", plan.candidates.filter((candidate) => candidate.connection_readiness === "ready_for_simulation").length);
    set("#phase19-needs-validation", plan.candidates.filter((candidate) => candidate.connection_readiness === "needs_validation").length);
    set("#phase19-protected-count", plan.candidates.filter((candidate) => candidate.connection_readiness === "protected_only").length);
    set("#phase19-priority-external", plan.external_connection_allowed);
    set("#phase19-priority-next", plan.next_validation_step);
    set("#phase19-priority-updated", plan.generated_at);
    const list = doc.querySelector("#phase19-priority-list");
    if (list) {
      list.textContent = "";
      plan.candidates.forEach((candidate) => {
        const item = doc.createElement("li");
        item.className = `phase19-priority-item status-${candidate.connection_readiness}`;
        item.textContent = `${candidate.recommended_order}. ${candidate.node_name} / ${candidate.category} / ${candidate.connection_readiness}`;
        list.appendChild(item);
      });
    }
    return plan;
  }

  async function runPriorityPlanner(options = {}) {
    const plan = buildPriorityPlan(await loadSources(options));
    persistPlan(plan, options.storage || window.localStorage);
    return renderPlan(plan, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-priority-planner");
      if (button) button.addEventListener("click", () => runPriorityPlanner().catch(() => undefined));
      runPriorityPlanner().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, CATEGORIES, DEPENDENCY_LEVELS, SAFETY_LEVELS, CONNECTION_READINESS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, NODE_DEFINITIONS, STORAGE_KEY, contractIsSafe, createCandidate, buildPriorityPlan, loadJson, loadSources, persistPlan, renderPlan, runPriorityPlanner };
});
