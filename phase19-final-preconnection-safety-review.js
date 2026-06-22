(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19FinalPreconnectionSafetyReview = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-6";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "a2297d0ae685bb9ba9be06cd98d9fd8d037e067b";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const FINAL_REVIEW_STATUSES = ["final_review_ready", "final_review_warning", "final_review_blocked", "protected_only", "plan_only_review"];
  const REMAINING_RISK_LEVELS = ["none", "low", "medium", "high", "protected", "blocked"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-final-preconnection-safety-review-db.json", "phase19-final-risk-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-integration-blueprint-db.json", "phase19-safety-contract-db.json",
    "phase19-node-priority-db.json", "phase19-validation-sequence-db.json",
    "phase19-preconnection-simulation-plan-db.json", "phase19-preconnection-stop-condition-db.json",
    "phase19-simulation-result-db.json", "phase19-simulation-evaluation-summary-db.json",
    "phase19-preconnection-approval-db.json", "phase19-preconnection-approval-summary-db.json"
  ];
  const STORAGE_KEY = "phase19FinalPreconnectionSafetyReviewLatest";

  function contractIsSafe(contract = {}) {
    const blocked = Array.isArray(contract.blocked_actions) ? contract.blocked_actions : [];
    const allowed = Array.isArray(contract.allowed_actions) ? contract.allowed_actions : [];
    return contract.official_release_protected !== false &&
      BLOCKED_ACTIONS.every((action) => blocked.includes(action)) && ALLOWED_ACTIONS.every((action) => allowed.includes(action)) &&
      contract.executionAllowed !== true && contract.autoExecutionAllowed !== true && contract.auto_execution_allowed !== true && contract.external_connection_allowed !== true;
  }

  function hasUnsafeFlags(...sources) {
    return sources.some((source) => source && [source.executionAllowed, source.autoExecutionAllowed, source.auto_execution_allowed, source.external_connection_allowed, source.execution_allowed, source.connection_authority_issued].some((flag) => flag === true));
  }

  function createFinalReview(approval, simulationResult, context = {}) {
    const protectedNode = approval.approval_status === "protected_only" || approval.category === "race_course_os";
    const missingResult = !simulationResult;
    const blocked = context.reviewBlocked || missingResult || approval.approval_status === "approval_blocked";
    const warning = context.reviewWarning || approval.approval_status === "approval_hold";
    let finalReviewStatus = "final_review_ready";
    let remainingRiskLevel = "none";
    let unresolvedItems = [];
    let finalBlockedReason = "";
    let recommendedNextValidation = "Recommended: repeat isolated validation and retain every execution and connection block before any future design review.";

    if (protectedNode) {
      finalReviewStatus = "protected_only";
      remainingRiskLevel = "protected";
      unresolvedItems = ["permanent_release_protection"];
      finalBlockedReason = "Official Release v2.8 is permanently excluded from connection authorization.";
      recommendedNextValidation = "Recommended: continue read-only release-protection audits with no connection authority.";
    } else if (blocked) {
      finalReviewStatus = "final_review_blocked";
      remainingRiskLevel = missingResult ? "high" : "blocked";
      unresolvedItems = missingResult ? ["simulation_result_missing"] : [approval.blocked_reason || "approval_gate_blocked"];
      finalBlockedReason = missingResult ? "A required simulation result is missing." : approval.blocked_reason || "The approval gate remains blocked.";
      recommendedNextValidation = "Recommended: review the blocking evidence in PLAN_ONLY mode while the final connection gate remains closed.";
    } else if (warning) {
      finalReviewStatus = "final_review_warning";
      remainingRiskLevel = "medium";
      unresolvedItems = [approval.hold_reason || "approval_warning_unresolved"];
      recommendedNextValidation = "Recommended: resolve the held warning through isolated simulation, validation, and audit only.";
    } else if (approval.approval_status === "plan_only_approved") {
      finalReviewStatus = "plan_only_review";
      remainingRiskLevel = "none";
      unresolvedItems = [];
      finalBlockedReason = "";
      recommendedNextValidation = "Recommended: continue planning and governance review only; keep external connection disabled.";
    }

    return {
      review_id: `P19-FINAL-REVIEW-${approval.approval_id.split("-").pop()}`,
      node_name: approval.node_name,
      category: approval.category,
      priority_id: approval.priority_id,
      approval_id: approval.approval_id,
      final_review_status: finalReviewStatus,
      safety_contract_status: approval.safety_contract_status,
      approval_gate_status: approval.approval_status,
      simulation_result_status: simulationResult ? simulationResult.evaluation_status : "simulation_result_missing",
      remaining_risk_level: remainingRiskLevel,
      unresolved_items: unresolvedItems,
      final_blocked_reason: finalBlockedReason,
      recommended_next_validation: recommendedNextValidation,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildFinalSafetyReview(sources = {}, now = () => new Date()) {
    const blueprint = sources.blueprint || {};
    const safetyContract = sources.safetyContract || { official_release_protected: true, blocked_actions: BLOCKED_ACTIONS, allowed_actions: ALLOWED_ACTIONS, executionAllowed: false, autoExecutionAllowed: false, auto_execution_allowed: false, external_connection_allowed: false };
    const priorityDatabase = sources.priorityDatabase || {};
    const validationDatabase = sources.validationDatabase || {};
    const simulationDatabase = sources.simulationDatabase || {};
    const stopDatabase = sources.stopDatabase || {};
    const resultDatabase = sources.resultDatabase || { records: [] };
    const evaluationSummary = sources.evaluationSummary || {};
    const approvalDatabase = sources.approvalDatabase || { records: [] };
    const approvalSummary = sources.approvalSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const approvals = Array.isArray(approvalDatabase.records) ? [...approvalDatabase.records] : [];
    const resultById = new Map((resultDatabase.records || []).map((result) => [result.result_id, result]));
    const reviewBlocked = !contractIsSafe(safetyContract) || hasUnsafeFlags(blueprint, safetyContract, priorityDatabase, validationDatabase, simulationDatabase, stopDatabase, resultDatabase, evaluationSummary, approvalDatabase, approvalSummary) || approvals.length === 0;
    const reviewWarning = missingSources.length > 0;
    const reviews = approvals.map((approval) => createFinalReview(approval, resultById.get(approval.simulation_result_id), { reviewBlocked, reviewWarning }));
    const summary = {
      total: reviews.length,
      ready: reviews.filter((item) => item.final_review_status === "final_review_ready").length,
      warning: reviews.filter((item) => item.final_review_status === "final_review_warning").length,
      blocked: reviews.filter((item) => item.final_review_status === "final_review_blocked").length,
      protected: reviews.filter((item) => item.final_review_status === "protected_only").length,
      plan_only: reviews.filter((item) => item.final_review_status === "plan_only_review").length
    };
    const riskSummary = Object.fromEntries(REMAINING_RISK_LEVELS.map((level) => [level, reviews.filter((item) => item.remaining_risk_level === level).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      final_review_id: `P19-FINAL-SAFETY-${generatedAt.getTime()}`,
      overall_status: summary.blocked > 0 ? "final_review_blocked" : summary.warning > 0 || reviewWarning ? "final_review_warning" : "final_review_ready",
      official_release_protected: safetyContract.official_release_protected !== false,
      reviews,
      review_summary: summary,
      remaining_risk_summary: riskSummary,
      connection_authority_issued: false,
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-7 Global Network Mid-Phase Integrity Audit",
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
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistReview(review, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(review));
    return review;
  }

  function renderReview(review, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-final-review-status", review.overall_status);
    set("#phase19-final-review-total", review.review_summary.total);
    set("#phase19-final-review-ready", review.review_summary.ready);
    set("#phase19-final-review-warning", review.review_summary.warning);
    set("#phase19-final-review-blocked", review.review_summary.blocked);
    set("#phase19-final-review-protected", review.review_summary.protected);
    set("#phase19-final-review-authority", review.connection_authority_issued);
    set("#phase19-final-review-next", review.next_validation_step);
    set("#phase19-final-review-updated", review.generated_at);
    const list = doc.querySelector("#phase19-final-review-list");
    if (list) {
      list.textContent = "";
      review.reviews.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-final-review-item status-${item.final_review_status}`;
        row.textContent = `${item.review_id} / ${item.node_name} / ${item.final_review_status} / risk ${item.remaining_risk_level}`;
        list.appendChild(row);
      });
    }
    return review;
  }

  async function runFinalSafetyReview(options = {}) {
    const review = buildFinalSafetyReview(await loadSources(options));
    persistReview(review, options.storage || window.localStorage);
    return renderReview(review, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-final-review");
      if (button) button.addEventListener("click", () => runFinalSafetyReview().catch(() => undefined));
      runFinalSafetyReview().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, FINAL_REVIEW_STATUSES, REMAINING_RISK_LEVELS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, contractIsSafe, hasUnsafeFlags, createFinalReview, buildFinalSafetyReview, loadJson, loadSources, persistReview, renderReview, runFinalSafetyReview };
});
