(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19PreconnectionApprovalGate = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-5";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "3633c4ceeb7d1c332a060637887a460ae3274643";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const APPROVAL_STATUSES = ["approval_plan_ready", "approval_hold", "approval_blocked", "protected_only", "plan_only_approved"];
  const SAFETY_CONTRACT_STATUSES = ["contract_ok", "contract_warning", "contract_blocked", "protected_only"];
  const STOP_CONDITION_STATUSES = ["stop_clear", "stop_warning", "stop_blocked", "protected_stop"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-preconnection-approval-db.json", "phase19-preconnection-approval-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-integration-blueprint.js", "phase19-integration-blueprint-db.json", "phase19-safety-contract-db.json",
    "phase19-node-priority-planner.js", "phase19-node-priority-db.json", "phase19-validation-sequence-db.json",
    "phase19-preconnection-simulation-planner.js", "phase19-preconnection-simulation-plan-db.json", "phase19-preconnection-stop-condition-db.json",
    "phase19-simulation-result-evaluator.js", "phase19-simulation-result-db.json", "phase19-simulation-evaluation-summary-db.json"
  ];
  const STORAGE_KEY = "phase19PreconnectionApprovalLatest";

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

  function createApproval(result, simulationPlan = {}, context = {}) {
    const protectedNode = result.evaluation_status === "protected_only" || result.category === "race_course_os";
    const blocked = context.gateBlocked || result.evaluation_status === "simulation_blocked";
    const hold = context.gateWarning || result.evaluation_status === "simulation_warning";
    let approvalStatus = "approval_plan_ready";
    let approvalReason = "Mock evaluation passed the PLAN_ONLY safety and dependency review.";
    let holdReason = "";
    let blockedReason = "";
    let requiredNextValidation = ["repeat_isolated_simulation", "confirm_execution_flags_false", "governance_review"];
    let safetyContractStatus = "contract_ok";
    let stopConditionStatus = "stop_clear";
    let recommendedNextAction = "Recommended: keep the gate closed and review another isolated simulation before any future design decision.";

    if (protectedNode) {
      approvalStatus = "protected_only";
      approvalReason = "Official Release v2.8 remains outside connection approval scope.";
      holdReason = "Permanent release protection applies.";
      blockedReason = "External connection is prohibited for the protected release node.";
      requiredNextValidation = ["read_only_protection_audit"];
      safetyContractStatus = "protected_only";
      stopConditionStatus = "protected_stop";
      recommendedNextAction = "Recommended: preserve protected-only isolation and continue read-only protection audits.";
    } else if (blocked) {
      approvalStatus = "approval_blocked";
      approvalReason = "Approval cannot proceed because a blocking safety condition exists.";
      blockedReason = result.evaluation_status === "simulation_blocked" ? "Simulation evaluation is blocked." : "Safety contract or execution policy is invalid.";
      requiredNextValidation = ["review_blocking_evidence", "restore_plan_only_contract", "repeat_mock_evaluation"];
      safetyContractStatus = "contract_blocked";
      stopConditionStatus = "stop_blocked";
      recommendedNextAction = "Recommended: review blocking evidence in PLAN_ONLY mode while every connection and execution gate remains closed.";
    } else if (hold) {
      approvalStatus = "approval_hold";
      approvalReason = "Additional validation is required before a plan-only approval can be considered.";
      holdReason = "Safety, dependency, or stop-condition warning remains unresolved.";
      requiredNextValidation = ["validate_warning_evidence", "repeat_isolated_simulation", "audit_warning_resolution"];
      safetyContractStatus = "contract_warning";
      stopConditionStatus = "stop_warning";
      recommendedNextAction = "Recommended: revalidate the warning in isolation and retain all execution and external-connection blocks.";
    } else if (result.evaluation_status === "plan_only_result") {
      approvalStatus = "plan_only_approved";
      approvalReason = "Planning and governance review may continue without connection authority.";
      requiredNextValidation = ["plan_only_governance_review", "confirm_no_execution_authority"];
      recommendedNextAction = "Recommended: use this approval only for planning, validation, audit, and reporting; do not enable connection.";
    }

    return {
      approval_id: `P19-APPROVAL-${String(result.simulation_order).padStart(3, "0")}`,
      node_name: result.node_name,
      category: result.category,
      priority_id: simulationPlan.priority_id || "priority_reference_missing",
      simulation_result_id: result.result_id,
      approval_status: approvalStatus,
      approval_reason: approvalReason,
      hold_reason: holdReason,
      blocked_reason: blockedReason,
      required_next_validation: requiredNextValidation,
      safety_contract_status: safetyContractStatus,
      stop_condition_status: stopConditionStatus,
      recommended_next_action: recommendedNextAction,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildApprovalGate(sources = {}, now = () => new Date()) {
    const blueprint = sources.blueprint || { integration_status: "plan_only_blueprint" };
    const safetyContract = sources.safetyContract || { official_release_protected: true, blocked_actions: BLOCKED_ACTIONS, allowed_actions: ALLOWED_ACTIONS, executionAllowed: false, autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false };
    const priorityDatabase = sources.priorityDatabase || { planner_status: "priority_plan_ready" };
    const validationDatabase = sources.validationDatabase || { sequence: [] };
    const simulationDatabase = sources.simulationDatabase || { planner_status: "simulation_plan_ready", records: [] };
    const stopDatabase = sources.stopDatabase || { stop_conditions: [] };
    const resultDatabase = sources.resultDatabase || { evaluator_status: "evaluation_warning", records: [] };
    const evaluationSummary = sources.evaluationSummary || { audit_summary: {} };
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const results = Array.isArray(resultDatabase.records) ? [...resultDatabase.records].sort((a, b) => a.simulation_order - b.simulation_order) : [];
    const plansById = new Map((simulationDatabase.records || []).map((plan) => [plan.simulation_plan_id, plan]));
    const gateBlocked = blueprint.integration_status === "blueprint_blocked" || priorityDatabase.planner_status === "priority_blocked" || simulationDatabase.planner_status === "simulation_plan_blocked" || !contractIsSafe(safetyContract) || hasUnsafeFlags(blueprint, safetyContract, priorityDatabase, validationDatabase, simulationDatabase, stopDatabase, resultDatabase, evaluationSummary) || results.length === 0;
    const gateWarning = missingSources.length > 0;
    const approvals = results.map((result) => createApproval(result, plansById.get(result.simulation_plan_id), { gateBlocked, gateWarning }));
    const summary = {
      total: approvals.length,
      plan_ready: approvals.filter((item) => item.approval_status === "approval_plan_ready").length,
      hold: approvals.filter((item) => item.approval_status === "approval_hold").length,
      blocked: approvals.filter((item) => item.approval_status === "approval_blocked").length,
      protected: approvals.filter((item) => item.approval_status === "protected_only").length,
      plan_only_approved: approvals.filter((item) => item.approval_status === "plan_only_approved").length
    };
    const generatedAt = now();
    return {
      phase: PHASE,
      gate_id: `P19-APPROVAL-GATE-${generatedAt.getTime()}`,
      gate_status: summary.blocked > 0 ? "approval_gate_blocked" : summary.hold > 0 || gateWarning ? "approval_gate_hold" : "approval_gate_plan_ready",
      official_release_protected: safetyContract.official_release_protected !== false,
      approvals,
      approval_summary: summary,
      connection_authority_issued: false,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-6 Global Network Final Pre-Connection Safety Review",
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
      resultDatabase: options.resultDatabase || assets["phase19-simulation-result-db.json"],
      evaluationSummary: options.evaluationSummary || assets["phase19-simulation-evaluation-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      assets
    };
  }

  function persistApproval(gate, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(gate));
    return gate;
  }

  function renderApprovalGate(gate, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-approval-status", gate.gate_status);
    set("#phase19-approval-total", gate.approval_summary.total);
    set("#phase19-approval-ready", gate.approval_summary.plan_ready);
    set("#phase19-approval-hold", gate.approval_summary.hold);
    set("#phase19-approval-blocked", gate.approval_summary.blocked);
    set("#phase19-approval-protected", gate.approval_summary.protected);
    set("#phase19-approval-authority", gate.connection_authority_issued);
    set("#phase19-approval-next", gate.next_validation_step);
    set("#phase19-approval-updated", gate.generated_at);
    const list = doc.querySelector("#phase19-approval-list");
    if (list) {
      list.textContent = "";
      gate.approvals.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-approval-item status-${item.approval_status}`;
        row.textContent = `${item.approval_id} / ${item.node_name} / ${item.approval_status}`;
        list.appendChild(row);
      });
    }
    return gate;
  }

  async function runApprovalGate(options = {}) {
    const gate = buildApprovalGate(await loadSources(options));
    persistApproval(gate, options.storage || window.localStorage);
    return renderApprovalGate(gate, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-approval-gate");
      if (button) button.addEventListener("click", () => runApprovalGate().catch(() => undefined));
      runApprovalGate().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, APPROVAL_STATUSES, SAFETY_CONTRACT_STATUSES, STOP_CONDITION_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, contractIsSafe, hasUnsafeFlags, createApproval, buildApprovalGate, loadAsset, loadSources, persistApproval, renderApprovalGate, runApprovalGate };
});
