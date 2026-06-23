(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19ConnectionReadinessMatrix = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-8";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "4c030d123dea996a8cb3df08cca2ac8333be0f04";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const READINESS_STATUSES = ["readiness_plan_only", "readiness_ready_for_simulation", "readiness_needs_validation", "readiness_hold", "readiness_blocked", "protected_only"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-connection-readiness-matrix-db.json", "phase19-connection-readiness-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-integration-blueprint-db.json",
    "phase19-safety-contract-db.json",
    "phase19-node-priority-db.json",
    "phase19-validation-sequence-db.json",
    "phase19-preconnection-simulation-plan-db.json",
    "phase19-preconnection-stop-condition-db.json",
    "phase19-simulation-result-db.json",
    "phase19-simulation-evaluation-summary-db.json",
    "phase19-preconnection-approval-db.json",
    "phase19-preconnection-approval-summary-db.json",
    "phase19-final-preconnection-safety-review-db.json",
    "phase19-final-risk-summary-db.json",
    "phase19-midphase-integrity-audit-db.json",
    "phase19-midphase-integrity-summary-db.json"
  ];
  const STORAGE_KEY = "phase19ConnectionReadinessMatrixLatest";

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

  function safetyConstraintsFor(priority, finalReview, midphaseReady) {
    const constraints = ["PLAN_ONLY", "external_connection_allowed_false", "execution_allowed_false", "auto_execution_disabled"];
    if (priority?.category === "race_course_os" || finalReview?.final_review_status === "protected_only") constraints.push("Official Release v2.8 protected_only");
    if (!midphaseReady) constraints.push("midphase_integrity_must_be_ready_before_next_review");
    return constraints;
  }

  function remainingConditionsFor(priority, simulation, approval, finalReview, midphaseReady) {
    if (priority?.category === "race_course_os" || finalReview?.final_review_status === "protected_only") return ["permanent_release_protection", "read_only_protection_audit"];
    const conditions = [];
    if (!midphaseReady) conditions.push("phase19_midphase_ready_confirmation");
    if (!simulation || !["simulation_passed", "plan_only_result"].includes(simulation.evaluation_status)) conditions.push("simulation_result_confirmation");
    if (!approval || !["approval_plan_ready", "plan_only_approved"].includes(approval.approval_status)) conditions.push("approval_gate_confirmation");
    if (!finalReview || !["final_review_ready", "plan_only_review"].includes(finalReview.final_review_status)) conditions.push("final_safety_review_confirmation");
    if (priority?.connection_readiness === "needs_validation") conditions.push("repeat_isolated_validation_review");
    return conditions;
  }

  function classifyReadiness(priority, simulation, approval, finalReview, midphaseReady, unsafe) {
    if (priority?.category === "race_course_os" || finalReview?.final_review_status === "protected_only") return "protected_only";
    if (unsafe || !midphaseReady || finalReview?.final_review_status === "final_review_blocked" || approval?.approval_status === "approval_blocked") return "readiness_blocked";
    if (approval?.approval_status === "approval_hold" || finalReview?.final_review_status === "final_review_warning") return "readiness_hold";
    if (finalReview?.final_review_status === "plan_only_review" || approval?.approval_status === "plan_only_approved" || priority?.connection_readiness === "plan_only") return "readiness_plan_only";
    if (priority?.connection_readiness === "needs_validation" && simulation?.evaluation_status !== "simulation_passed") return "readiness_needs_validation";
    if (simulation?.evaluation_status === "simulation_passed" && approval?.approval_status === "approval_plan_ready" && finalReview?.final_review_status === "final_review_ready") return "readiness_ready_for_simulation";
    return "readiness_needs_validation";
  }

  function createMatrixRow(priority, context) {
    const simulation = context.resultByPriority.get(priority.priority_id);
    const approval = context.approvalByPriority.get(priority.priority_id);
    const finalReview = context.reviewByPriority.get(priority.priority_id);
    const readinessStatus = classifyReadiness(priority, simulation, approval, finalReview, context.midphaseReady, context.unsafe);
    const remainingConditions = remainingConditionsFor(priority, simulation, approval, finalReview, context.midphaseReady);
    const nextValidationStep = readinessStatus === "protected_only"
      ? "Recommended: keep read-only protection audits and do not request connection authority."
      : readinessStatus === "readiness_plan_only"
        ? "Recommended: continue planning, validation, audit, and report review while the connection gate stays closed."
        : readinessStatus === "readiness_ready_for_simulation"
          ? "Recommended: run another isolated simulation review and keep all execution and connection flags false."
          : "Recommended: resolve listed conditions through PLAN_ONLY validation before any later review.";
    return {
      matrix_id: `P19-MATRIX-${priority.priority_id.split("-").pop()}`,
      node_name: priority.node_name,
      category: priority.category,
      priority_id: priority.priority_id,
      readiness_status: readinessStatus,
      simulation_status: simulation ? simulation.evaluation_status : "simulation_missing",
      approval_status: approval ? approval.approval_status : "approval_missing",
      final_review_status: finalReview ? finalReview.final_review_status : "final_review_missing",
      remaining_conditions: remainingConditions,
      safety_constraints: safetyConstraintsFor(priority, finalReview, context.midphaseReady),
      next_validation_step: nextValidationStep,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildConnectionReadinessMatrix(sources = {}, now = () => new Date()) {
    const priorityDatabase = sources.priorityDatabase || { records: [] };
    const resultDatabase = sources.resultDatabase || { records: [] };
    const approvalDatabase = sources.approvalDatabase || { records: [] };
    const finalReviewDatabase = sources.finalReviewDatabase || { records: [] };
    const finalRiskSummary = sources.finalRiskSummary || {};
    const midphaseAudit = sources.midphaseAudit || {};
    const midphaseSummary = sources.midphaseSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const midphaseReady = midphaseAudit.phase19_midphase_status === "plan_only_midphase" &&
      midphaseAudit.remaining_risk_summary === "no_remaining_risk" &&
      midphaseAudit.recommended_next_phase === "Phase19-8" &&
      midphaseSummary.phase19_midphase_status !== "midphase_blocked";
    const unsafe = hasUnsafeFlags(priorityDatabase, resultDatabase, approvalDatabase, finalReviewDatabase, finalRiskSummary, midphaseAudit, midphaseSummary);
    const resultByPriority = new Map((resultDatabase.records || []).map((result) => [`P19-PRI-${result.result_id.split("-").pop()}`, result]));
    const approvalByPriority = new Map((approvalDatabase.records || []).map((approval) => [approval.priority_id, approval]));
    const reviewByPriority = new Map((finalReviewDatabase.records || []).map((review) => [review.priority_id, review]));
    const context = { resultByPriority, approvalByPriority, reviewByPriority, midphaseReady, unsafe };
    const records = (priorityDatabase.records || []).map((priority) => createMatrixRow(priority, context));
    const statusCounts = Object.fromEntries(READINESS_STATUSES.map((status) => [status, records.filter((item) => item.readiness_status === status).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      matrix_id: `P19-CONNECTION-MATRIX-${generatedAt.getTime()}`,
      matrix_status: unsafe || missingSources.length > 0 ? "readiness_matrix_blocked" : "readiness_matrix_plan_only",
      source_midphase_status: midphaseAudit.phase19_midphase_status || "unknown",
      source_remaining_risk_summary: midphaseAudit.remaining_risk_summary || "unknown",
      source_recommended_next_phase: midphaseAudit.recommended_next_phase || "unknown",
      official_release_protected: finalRiskSummary.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      readiness_summary: {
        total: records.length,
        ...statusCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-9 Global Network Connection Contract Review",
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
      blueprint: options.blueprint || databases["phase19-integration-blueprint-db.json"],
      safetyContract: options.safetyContract || databases["phase19-safety-contract-db.json"],
      priorityDatabase: options.priorityDatabase || databases["phase19-node-priority-db.json"],
      validationDatabase: options.validationDatabase || databases["phase19-validation-sequence-db.json"],
      simulationDatabase: options.simulationDatabase || databases["phase19-preconnection-simulation-plan-db.json"],
      stopDatabase: options.stopDatabase || databases["phase19-preconnection-stop-condition-db.json"],
      resultDatabase: options.resultDatabase || databases["phase19-simulation-result-db.json"],
      evaluationSummary: options.evaluationSummary || databases["phase19-simulation-evaluation-summary-db.json"],
      approvalDatabase: options.approvalDatabase || databases["phase19-preconnection-approval-db.json"],
      approvalSummary: options.approvalSummary || databases["phase19-preconnection-approval-summary-db.json"],
      finalReviewDatabase: options.finalReviewDatabase || databases["phase19-final-preconnection-safety-review-db.json"],
      finalRiskSummary: options.finalRiskSummary || databases["phase19-final-risk-summary-db.json"],
      midphaseAudit: options.midphaseAudit || databases["phase19-midphase-integrity-audit-db.json"],
      midphaseSummary: options.midphaseSummary || databases["phase19-midphase-integrity-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistMatrix(matrix, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(matrix)); return matrix; }

  function renderMatrix(matrix, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-readiness-matrix-status", matrix.matrix_status);
    set("#phase19-readiness-matrix-total", matrix.readiness_summary.total);
    set("#phase19-readiness-ready-simulation", matrix.readiness_summary.readiness_ready_for_simulation);
    set("#phase19-readiness-plan-only", matrix.readiness_summary.readiness_plan_only);
    set("#phase19-readiness-protected", matrix.readiness_summary.protected_only);
    set("#phase19-readiness-unsafe", matrix.readiness_summary.unsafe_flags_count);
    set("#phase19-readiness-authority", matrix.connection_authority_issued);
    set("#phase19-readiness-next", matrix.next_validation_step);
    set("#phase19-readiness-updated", matrix.generated_at);
    const list = doc.querySelector("#phase19-readiness-matrix-list");
    if (list) {
      list.textContent = "";
      matrix.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-readiness-matrix-item status-${item.readiness_status}`;
        row.textContent = `${item.matrix_id} / ${item.node_name} / ${item.readiness_status} / ${item.next_validation_step}`;
        list.appendChild(row);
      });
    }
    return matrix;
  }

  async function runConnectionReadinessMatrix(options = {}) {
    const matrix = buildConnectionReadinessMatrix(await loadSources(options));
    persistMatrix(matrix, options.storage || window.localStorage);
    return renderMatrix(matrix, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-readiness-matrix");
      if (button) button.addEventListener("click", () => runConnectionReadinessMatrix().catch(() => undefined));
      runConnectionReadinessMatrix().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, READINESS_STATUSES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, safetyConstraintsFor, remainingConditionsFor, classifyReadiness, createMatrixRow, buildConnectionReadinessMatrix, loadJson, loadSources, persistMatrix, renderMatrix, runConnectionReadinessMatrix };
});
