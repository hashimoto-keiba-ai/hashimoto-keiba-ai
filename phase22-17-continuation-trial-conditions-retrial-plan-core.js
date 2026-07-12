(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2217ContinuationRetrialPlanCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1";
  const TRIAL_STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1";
  const EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialResultEvaluationContinuationDecision.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.continuationTrialConditionsRetrialPlan.v1";
  const ELIGIBLE_DECISIONS = ["continue_limited_trial", "continue_with_conditions", "revision_required", "additional_observation_required", "pause_required"];
  const PLAN_TYPES = ["continuation", "conditional_continuation", "revised_retrial", "additional_observation", "paused_retrial"];
  const PLAN_STATUSES = ["draft", "planning", "awaiting_review", "reviewed", "awaiting_approval", "approved", "ready", "on_hold", "cancelled", "expired"];
  const PLAN_DECISIONS = ["pending", "ready_for_manual_trial_creation", "revision_required", "additional_review_required", "approval_required", "on_hold", "cancelled", "expired"];
  const TERMINAL_STATUSES = ["ready", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["planning", "cancelled"],
    planning: ["awaiting_review", "on_hold", "cancelled"],
    awaiting_review: ["reviewed", "planning", "on_hold", "cancelled"],
    reviewed: ["awaiting_approval", "planning", "on_hold", "cancelled"],
    awaiting_approval: ["approved", "reviewed", "on_hold", "cancelled"],
    approved: ["ready", "on_hold", "cancelled", "expired"],
    on_hold: ["planning", "awaiting_review", "reviewed", "awaiting_approval", "cancelled"],
    ready: [],
    cancelled: [],
    expired: []
  };
  const CORRECTION_STATUSES = ["pending", "in_progress", "completed", "verified", "waived", "cancelled"];
  const CONDITION_STATUSES = ["pending", "satisfied", "conditional", "failed", "waived", "not_applicable"];
  const SEVERITIES = ["notice", "warning", "critical"];

  function text(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safeParseJson(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  function getStorage(storage) {
    if (storage) return storage;
    if (root && root.localStorage) return root.localStorage;
    return null;
  }

  function escapeHtml(value) {
    return text(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function stableSlug(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "retrial";
  }

  function stableRetrialPlanId(evaluation) {
    return `phase22-17-retrial-${stableSlug(evaluation.evaluationId || evaluation.sourceTrialId || evaluation.targetImprovementRuleId)}`;
  }

  function splitList(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    return text(value).split(/[\n,、|｜]+/).map(text).filter(Boolean);
  }

  function buildSafety() {
    return {
      planOnly: true,
      protectedMode: true,
      privateLocal: true,
      observationOnly: true,
      shadowMode: true,
      evaluationOnly: true,
      retrialPlanningOnly: true,
      automaticApply: false,
      automaticLearning: false,
      automaticUpdate: false,
      autoExecution: false,
      autoRollback: false,
      autoContinuation: false,
      autoTrialCreation: false,
      publicUrl: false,
      githubPages: false,
      externalApi: false,
      predictionMutation: false,
      bettingMutation: false,
      applicationStatusMutation: false,
      ruleActivation: false,
      trialStatusMutation: false,
      evaluationStatusMutation: false
    };
  }

  function normalizeEvaluation(input = {}) {
    return {
      evaluationId: text(input.evaluationId),
      sourceTrialId: text(input.sourceTrialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      evaluationName: text(input.evaluationName),
      evaluationStatus: text(input.evaluationStatus || "draft"),
      continuationDecision: text(input.continuationDecision || "pending"),
      decisionReason: text(input.decisionReason),
      continuationConditions: text(input.continuationConditions),
      requiredCorrections: text(input.requiredCorrections),
      unresolvedIssues: text(input.unresolvedIssues),
      notes: text(input.notes)
    };
  }

  function normalizeTrial(input = {}) {
    return {
      trialId: text(input.trialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      targetRaceKeys: splitList(input.targetRaceKeys),
      targetCourses: splitList(input.targetCourses),
      targetRaceClasses: splitList(input.targetRaceClasses),
      targetDistances: splitList(input.targetDistances),
      targetSurfaceTypes: splitList(input.targetSurfaceTypes),
      observationStartDate: text(input.observationStartDate),
      observationEndDate: text(input.observationEndDate),
      maximumRaceCount: number(input.maximumRaceCount, 0)
    };
  }

  function normalizeSourcePlan(input = {}) {
    return {
      planId: text(input.planId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId)
    };
  }

  function normalizeEvaluationStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), evaluations: Array.isArray(input.evaluations) ? input.evaluations.map(normalizeEvaluation).filter((item) => item.evaluationId) : [] };
  }

  function normalizeTrialStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), trials: Array.isArray(input.trials) ? input.trials.map(normalizeTrial).filter((item) => item.trialId) : [] };
  }

  function normalizePlanStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), plans: Array.isArray(input.plans) ? input.plans.map(normalizeSourcePlan).filter((item) => item.planId) : [] };
  }

  function loadJsonStore(storage, key, normalizer, name) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { [name]: normalizer(), parseError: false };
    const raw = targetStorage.getItem(key);
    const parsed = safeParseJson(raw);
    return { [name]: normalizer(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function loadEvaluationStore(storage) { return loadJsonStore(storage, EVALUATION_STORAGE_KEY, normalizeEvaluationStore, "evaluationStore"); }
  function loadTrialStore(storage) { return loadJsonStore(storage, TRIAL_STORAGE_KEY, normalizeTrialStore, "trialStore"); }
  function loadPlanStore(storage) { return loadJsonStore(storage, PLAN_STORAGE_KEY, normalizePlanStore, "planStore"); }

  function mapDecisionToPlanType(decision) {
    return {
      continue_limited_trial: "continuation",
      continue_with_conditions: "conditional_continuation",
      revision_required: "revised_retrial",
      additional_observation_required: "additional_observation",
      pause_required: "paused_retrial"
    }[decision] || "";
  }

  function calculateRecommendedPlanDecision(evaluation) {
    if (!ELIGIBLE_DECISIONS.includes(evaluation.continuationDecision)) return { recommendedPlanDecision: "cancelled", recommendedReason: "計画対象外の継続判定です。" };
    if (evaluation.continuationDecision === "continue_limited_trial") return { recommendedPlanDecision: "approval_required", recommendedReason: "継続試験計画の承認が必要です。" };
    if (evaluation.continuationDecision === "continue_with_conditions") return { recommendedPlanDecision: "additional_review_required", recommendedReason: "継続条件のレビューが必要です。" };
    if (evaluation.continuationDecision === "revision_required") return { recommendedPlanDecision: "revision_required", recommendedReason: "修正条件の計画化が必要です。" };
    if (evaluation.continuationDecision === "additional_observation_required") return { recommendedPlanDecision: "additional_review_required", recommendedReason: "追加観測条件の確認が必要です。" };
    return { recommendedPlanDecision: "on_hold", recommendedReason: "再開条件の確認が必要です。" };
  }

  function normalizeCorrectionItem(input = {}, index = 0) {
    return {
      correctionId: text(input.correctionId) || `correction-${index + 1}`,
      order: number(input.order, index + 1),
      category: text(input.category),
      issue: text(input.issue),
      requiredAction: text(input.requiredAction),
      completionCriteria: text(input.completionCriteria),
      owner: text(input.owner),
      dueDate: text(input.dueDate),
      status: CORRECTION_STATUSES.includes(input.status) ? input.status : "pending",
      verifiedBy: text(input.verifiedBy),
      verifiedAt: text(input.verifiedAt),
      comment: text(input.comment)
    };
  }

  function normalizeContinuationCondition(input = {}, index = 0) {
    return {
      conditionId: text(input.conditionId) || `condition-${index + 1}`,
      order: number(input.order, index + 1),
      category: text(input.category),
      content: text(input.content),
      expectedResult: text(input.expectedResult),
      mandatory: input.mandatory !== false,
      verificationMethod: text(input.verificationMethod),
      status: CONDITION_STATUSES.includes(input.status) ? input.status : "pending",
      reviewer: text(input.reviewer),
      reviewedAt: text(input.reviewedAt),
      comment: text(input.comment)
    };
  }

  function normalizeStopCondition(input = {}, index = 0) {
    return {
      stopConditionId: text(input.stopConditionId) || `stop-${index + 1}`,
      order: number(input.order, index + 1),
      category: text(input.category),
      condition: text(input.condition),
      severity: SEVERITIES.includes(input.severity) ? input.severity : "warning",
      action: text(input.action),
      decisionMaker: text(input.decisionMaker),
      notes: text(input.notes)
    };
  }

  function normalizeEvaluationCriterion(input = {}, index = 0) {
    return {
      criterionId: text(input.criterionId) || `criterion-${index + 1}`,
      order: number(input.order, index + 1),
      category: text(input.category),
      metric: text(input.metric),
      baseline: text(input.baseline),
      target: text(input.target),
      tolerance: text(input.tolerance),
      minimumSampleSize: text(input.minimumSampleSize),
      judgementMethod: text(input.judgementMethod),
      notes: text(input.notes)
    };
  }

  function buildPlanFromEvaluation(evaluationInput, trialStore = normalizeTrialStore(), planStore = normalizePlanStore(), savedPlan = {}) {
    const evaluation = normalizeEvaluation(evaluationInput);
    const trial = (trialStore.trials || []).find((item) => item.trialId === evaluation.sourceTrialId) || normalizeTrial();
    const recommended = calculateRecommendedPlanDecision(evaluation);
    const planType = text(savedPlan.planType) || mapDecisionToPlanType(evaluation.continuationDecision);
    return normalizeRetrialPlan({
      ...savedPlan,
      retrialPlanId: text(savedPlan.retrialPlanId) || stableRetrialPlanId(evaluation),
      sourceEvaluationId: evaluation.evaluationId,
      sourceTrialId: evaluation.sourceTrialId,
      sourcePlanId: evaluation.sourcePlanId,
      targetApprovalId: evaluation.targetApprovalId,
      targetImprovementRuleId: evaluation.targetImprovementRuleId,
      planName: text(savedPlan.planName) || `${evaluation.evaluationName || evaluation.evaluationId} 再試験計画`,
      planPurpose: text(savedPlan.planPurpose) || "継続可否判定をもとに次回限定試験の条件を計画する",
      planType,
      recommendedPlanDecision: recommended.recommendedPlanDecision,
      recommendedReason: recommended.recommendedReason,
      targetRaceKeys: savedPlan.targetRaceKeys || trial.targetRaceKeys,
      targetCourses: savedPlan.targetCourses || trial.targetCourses,
      targetRaceClasses: savedPlan.targetRaceClasses || trial.targetRaceClasses,
      targetDistances: savedPlan.targetDistances || trial.targetDistances,
      targetSurfaceTypes: savedPlan.targetSurfaceTypes || trial.targetSurfaceTypes,
      observationStartDate: text(savedPlan.observationStartDate) || trial.observationStartDate,
      observationEndDate: text(savedPlan.observationEndDate) || trial.observationEndDate,
      minimumRaceCount: number(savedPlan.minimumRaceCount, Math.max(1, Math.min(number(trial.maximumRaceCount, 1), 2))),
      maximumRaceCount: number(savedPlan.maximumRaceCount, Math.max(number(trial.maximumRaceCount, 1), 1)),
      minimumValidObservationCount: number(savedPlan.minimumValidObservationCount, 1),
      warningThreshold: number(savedPlan.warningThreshold, 2),
      criticalThreshold: number(savedPlan.criticalThreshold, 1),
      maximumStopRequestCount: number(savedPlan.maximumStopRequestCount, 0),
      revisionSummary: text(savedPlan.revisionSummary) || evaluation.requiredCorrections,
      carryForwardConditions: text(savedPlan.carryForwardConditions) || evaluation.continuationConditions,
      unresolvedIssues: text(savedPlan.unresolvedIssues) || evaluation.unresolvedIssues,
      notes: text(savedPlan.notes) || evaluation.notes
    });
  }

  function normalizeRetrialPlan(input = {}) {
    return {
      retrialPlanId: text(input.retrialPlanId),
      sourceEvaluationId: text(input.sourceEvaluationId),
      sourceTrialId: text(input.sourceTrialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      planName: text(input.planName),
      planPurpose: text(input.planPurpose),
      planType: PLAN_TYPES.includes(input.planType) ? input.planType : "",
      planStatus: PLAN_STATUSES.includes(input.planStatus) ? input.planStatus : "draft",
      planDecision: PLAN_DECISIONS.includes(input.planDecision) ? input.planDecision : "pending",
      recommendedPlanDecision: PLAN_DECISIONS.includes(input.recommendedPlanDecision) ? input.recommendedPlanDecision : "pending",
      recommendedReason: text(input.recommendedReason),
      planner: text(input.planner),
      reviewer: text(input.reviewer),
      finalApprover: text(input.finalApprover),
      plannedAt: text(input.plannedAt),
      reviewedAt: text(input.reviewedAt),
      approvedAt: text(input.approvedAt),
      readyAt: text(input.readyAt),
      cancelledAt: text(input.cancelledAt),
      expiredAt: text(input.expiredAt),
      decisionReason: text(input.decisionReason),
      revisionSummary: text(input.revisionSummary),
      carryForwardConditions: text(input.carryForwardConditions),
      unresolvedIssues: text(input.unresolvedIssues),
      approvedExceptionReason: text(input.approvedExceptionReason),
      notes: text(input.notes),
      targetRaceKeys: splitList(input.targetRaceKeys),
      targetCourses: splitList(input.targetCourses),
      targetRaceClasses: splitList(input.targetRaceClasses),
      targetDistances: splitList(input.targetDistances),
      targetSurfaceTypes: splitList(input.targetSurfaceTypes),
      excludedRaceKeys: splitList(input.excludedRaceKeys),
      excludedConditions: text(input.excludedConditions),
      observationStartDate: text(input.observationStartDate),
      observationEndDate: text(input.observationEndDate),
      minimumRaceCount: number(input.minimumRaceCount, 0),
      maximumRaceCount: number(input.maximumRaceCount, 0),
      minimumValidObservationCount: number(input.minimumValidObservationCount, 0),
      warningThreshold: number(input.warningThreshold, 0),
      criticalThreshold: number(input.criticalThreshold, 0),
      maximumStopRequestCount: number(input.maximumStopRequestCount, 0),
      baselineComparisonRequirement: text(input.baselineComparisonRequirement),
      reproducibilityRequirement: text(input.reproducibilityRequirement),
      dataIntegrityRequirement: text(input.dataIntegrityRequirement),
      correctionItems: Array.isArray(input.correctionItems) ? input.correctionItems.map(normalizeCorrectionItem) : [],
      continuationConditions: Array.isArray(input.continuationConditions) ? input.continuationConditions.map(normalizeContinuationCondition) : [],
      stopConditions: Array.isArray(input.stopConditions) ? input.stopConditions.map(normalizeStopCondition) : [],
      evaluationCriteria: Array.isArray(input.evaluationCriteria) ? input.evaluationCriteria.map(normalizeEvaluationCriterion) : [],
      createdAt: text(input.createdAt),
      updatedAt: text(input.updatedAt),
      safety: buildSafety()
    };
  }

  function validatePlanSource(plan, evaluationStore, trialStore, sourcePlanStore) {
    const errors = [];
    const evaluation = (evaluationStore.evaluations || []).find((item) => item.evaluationId === plan.sourceEvaluationId);
    const trial = (trialStore.trials || []).find((item) => item.trialId === plan.sourceTrialId);
    const sourcePlan = (sourcePlanStore.plans || []).find((item) => item.planId === plan.sourcePlanId);
    if (!evaluation) errors.push("sourceEvaluationIdがPhase22-16に存在しません。");
    if (evaluation && evaluation.evaluationStatus !== "finalized") errors.push("sourceEvaluationはfinalizedである必要があります。");
    if (evaluation && !ELIGIBLE_DECISIONS.includes(evaluation.continuationDecision)) errors.push("continuationDecisionが計画対象外です。");
    if (!trial) errors.push("sourceTrialIdがPhase22-15に存在しません。");
    if (!sourcePlan) errors.push("sourcePlanIdがPhase22-14に存在しません。");
    if (evaluation && trial && evaluation.sourceTrialId !== trial.trialId) errors.push("evaluation / trial参照が不整合です。");
    if (evaluation && sourcePlan && evaluation.sourcePlanId !== sourcePlan.planId) errors.push("evaluation / plan参照が不整合です。");
    if (trial && sourcePlan && trial.sourcePlanId !== sourcePlan.planId) errors.push("trial / plan参照が不整合です。");
    if (evaluation && plan.targetApprovalId !== evaluation.targetApprovalId) errors.push("targetApprovalIdが整合しません。");
    if (evaluation && plan.targetImprovementRuleId !== evaluation.targetImprovementRuleId) errors.push("targetImprovementRuleIdが整合しません。");
    return { ok: errors.length === 0, errors };
  }

  function hasScope(plan) {
    return [plan.targetRaceKeys, plan.targetCourses, plan.targetRaceClasses, plan.targetDistances, plan.targetSurfaceTypes].some((list) => Array.isArray(list) && list.length);
  }

  function validateRetrialPlan(planInput, evaluationStore = normalizeEvaluationStore(), trialStore = normalizeTrialStore(), sourcePlanStore = normalizePlanStore()) {
    const plan = normalizeRetrialPlan(planInput);
    const errors = [];
    ["retrialPlanId", "sourceEvaluationId", "sourceTrialId", "sourcePlanId", "targetApprovalId", "targetImprovementRuleId", "planName", "planPurpose"].forEach((field) => { if (!text(plan[field])) errors.push(`${field}が不足しています。`); });
    errors.push(...validatePlanSource(plan, evaluationStore, trialStore, sourcePlanStore).errors);
    if (!hasScope(plan)) errors.push("対象範囲が不足しています。");
    if (plan.observationStartDate && plan.observationEndDate && plan.observationEndDate < plan.observationStartDate) errors.push("観測終了日が開始日より前です。");
    if (!Number.isInteger(plan.minimumRaceCount) || plan.minimumRaceCount <= 0) errors.push("minimumRaceCountは正の整数にしてください。");
    if (!Number.isInteger(plan.maximumRaceCount) || plan.maximumRaceCount <= 0) errors.push("maximumRaceCountは正の整数にしてください。");
    if (plan.minimumRaceCount > plan.maximumRaceCount) errors.push("minimumRaceCountはmaximumRaceCount以下にしてください。");
    if (!Number.isInteger(plan.minimumValidObservationCount) || plan.minimumValidObservationCount <= 0) errors.push("minimumValidObservationCountは正の整数にしてください。");
    if (plan.warningThreshold < 0 || plan.criticalThreshold <= 0) errors.push("warningThreshold / criticalThresholdが不正です。");
    if (plan.planType === "conditional_continuation" && !plan.continuationConditions.length) errors.push("conditional_continuationには継続条件が必要です。");
    if (plan.planType === "revised_retrial" && !plan.correctionItems.length) errors.push("revised_retrialには修正条件が必要です。");
    if (plan.planType === "additional_observation" && !text(plan.decisionReason) && plan.planDecision === "ready_for_manual_trial_creation") errors.push("additional_observationには不足理由が必要です。");
    if (plan.planType === "paused_retrial" && !text(plan.unresolvedIssues)) errors.push("paused_retrialには未解決課題が必要です。");
    if (plan.planDecision === "ready_for_manual_trial_creation") {
      if (plan.planStatus !== "approved") errors.push("ready判定にはplanStatus approvedが必要です。");
      if (!text(plan.finalApprover) || !text(plan.approvedAt) || !text(plan.decisionReason)) errors.push("ready判定には最終承認者、理由、日時が必要です。");
      if (plan.continuationConditions.some((item) => item.mandatory && !["satisfied", "waived"].includes(item.status))) errors.push("必須継続条件が未達です。");
      if (plan.correctionItems.some((item) => !["verified", "waived"].includes(item.status))) errors.push("必須修正条件がverifiedまたはwaivedではありません。");
      if (!plan.stopConditions.some((item) => item.severity === "critical")) errors.push("critical停止条件が必要です。");
      if (!plan.evaluationCriteria.length) errors.push("評価基準が必要です。");
      if (text(plan.unresolvedIssues) && !text(plan.approvedExceptionReason)) errors.push("未解決課題には承認済み例外が必要です。");
    }
    if (plan.planDecision !== "pending" && !text(plan.finalApprover)) errors.push("最終planDecisionには決定者が必要です。");
    return { ok: errors.length === 0, errors };
  }

  function addCorrectionItem(plan, item) {
    if (plan.planStatus === "ready") return { added: false, reason: "ready_locked", plan };
    return { added: true, plan: { ...plan, correctionItems: [...(plan.correctionItems || []), normalizeCorrectionItem(item, (plan.correctionItems || []).length)], safety: buildSafety() } };
  }

  function updateCorrectionItem(plan, id, changes) {
    if (plan.planStatus === "ready") return { updated: false, reason: "ready_locked", plan };
    return { updated: true, plan: { ...plan, correctionItems: (plan.correctionItems || []).map((item) => item.correctionId === id ? normalizeCorrectionItem({ ...item, ...changes }) : item), safety: buildSafety() } };
  }

  function addContinuationCondition(plan, item) {
    if (plan.planStatus === "ready") return { added: false, reason: "ready_locked", plan };
    return { added: true, plan: { ...plan, continuationConditions: [...(plan.continuationConditions || []), normalizeContinuationCondition(item, (plan.continuationConditions || []).length)], safety: buildSafety() } };
  }

  function updateContinuationCondition(plan, id, changes) {
    if (plan.planStatus === "ready") return { updated: false, reason: "ready_locked", plan };
    return { updated: true, plan: { ...plan, continuationConditions: (plan.continuationConditions || []).map((item) => item.conditionId === id ? normalizeContinuationCondition({ ...item, ...changes }) : item), safety: buildSafety() } };
  }

  function addStopCondition(plan, item) {
    return { added: plan.planStatus !== "ready", plan: plan.planStatus === "ready" ? plan : { ...plan, stopConditions: [...(plan.stopConditions || []), normalizeStopCondition(item, (plan.stopConditions || []).length)], safety: buildSafety() } };
  }

  function addEvaluationCriterion(plan, item) {
    return { added: plan.planStatus !== "ready", plan: plan.planStatus === "ready" ? plan : { ...plan, evaluationCriteria: [...(plan.evaluationCriteria || []), normalizeEvaluationCriterion(item, (plan.evaluationCriteria || []).length)], safety: buildSafety() } };
  }

  function transitionPlanStatus(plan, toStatus) {
    if (!PLAN_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", plan };
    if (!(ALLOWED_TRANSITIONS[plan.planStatus] || []).includes(toStatus)) return { transitioned: false, reason: "invalid_transition", plan };
    return { transitioned: true, plan: { ...plan, planStatus: toStatus, safety: buildSafety() } };
  }

  function setFinalPlanDecision(plan, decision, maker, reason, decidedAt) {
    if (plan.planStatus === "ready") return { set: false, reason: "ready_locked", plan };
    if (!PLAN_DECISIONS.includes(decision) || decision === "pending") return { set: false, reason: "invalid_decision", plan };
    if (!text(maker) || !text(reason) || !text(decidedAt)) return { set: false, reason: "missing_required_fields", plan };
    return { set: true, plan: { ...plan, planDecision: decision, finalApprover: text(maker), decisionReason: text(reason), approvedAt: text(decidedAt), safety: buildSafety() } };
  }

  function approveRetrialPlan(plan, approver, approvedAt, reason) {
    if (!text(approver) || !text(approvedAt) || !text(reason)) return { approved: false, reason: "missing_required_fields", plan };
    return { approved: true, plan: { ...plan, planStatus: "approved", finalApprover: text(approver), approvedAt: text(approvedAt), decisionReason: text(reason), safety: buildSafety() } };
  }

  function markPlanReady(plan, evaluationStore, trialStore, sourcePlanStore) {
    const candidate = { ...plan, planDecision: "ready_for_manual_trial_creation" };
    const result = validateRetrialPlan(candidate, evaluationStore, trialStore, sourcePlanStore);
    if (!result.ok) return { ready: false, errors: result.errors, plan };
    return { ready: true, errors: [], plan: { ...candidate, planStatus: "ready", readyAt: text(candidate.approvedAt), safety: buildSafety() } };
  }

  function eligibleEvaluations(evaluationStore) {
    return (evaluationStore.evaluations || []).filter((item) => item.evaluationStatus === "finalized" && ELIGIBLE_DECISIONS.includes(item.continuationDecision));
  }

  function normalizeRetrialPlanStore(input = {}, evaluationStore = normalizeEvaluationStore(), trialStore = normalizeTrialStore(), sourcePlanStore = normalizePlanStore()) {
    const savedByEvaluation = new Map((input.retrialPlans || []).map((plan) => [text(plan.sourceEvaluationId), plan]));
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2216SavedAt: text(input.sourcePhase2216SavedAt || evaluationStore.savedAt),
      sourcePhase2215SavedAt: text(input.sourcePhase2215SavedAt || trialStore.savedAt),
      sourcePhase2214SavedAt: text(input.sourcePhase2214SavedAt || sourcePlanStore.savedAt),
      retrialPlans: eligibleEvaluations(evaluationStore).map((evaluation) => buildPlanFromEvaluation(evaluation, trialStore, sourcePlanStore, savedByEvaluation.get(evaluation.evaluationId) || {})).sort((a, b) => a.retrialPlanId.localeCompare(b.retrialPlanId)),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName)
    };
  }

  function loadRetrialPlanStore(storage, evaluationStore, trialStore, sourcePlanStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeRetrialPlanStore({}, evaluationStore, trialStore, sourcePlanStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeRetrialPlanStore({}, evaluationStore, trialStore, sourcePlanStore), parseError: true, rejected: true };
    if (parsed && (!parsed || typeof parsed !== "object" || (parsed.retrialPlans && !Array.isArray(parsed.retrialPlans)))) return { store: normalizeRetrialPlanStore({}, evaluationStore, trialStore, sourcePlanStore), parseError: false, rejected: true };
    return { store: normalizeRetrialPlanStore(parsed || {}, evaluationStore, trialStore, sourcePlanStore), parseError: false, rejected: false };
  }

  function saveRetrialPlanStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, savedAt: now.toISOString(), retrialPlans: (store.retrialPlans || []).map((plan) => ({ ...plan, safety: buildSafety() })) }));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function loadRetrialPlanResult(storage, evaluationStore, trialStore, sourcePlanStore) {
    return loadRetrialPlanStore(storage, evaluationStore, trialStore, sourcePlanStore);
  }

  function generatePlainText(store) {
    const lines = ["Phase22-17 継続試験条件・再試験計画", `保存キー: ${STORAGE_KEY}`, "再試験計画専用 / 自動開始なし / 本番反映なし"];
    (store.retrialPlans || []).forEach((plan) => lines.push("", `${plan.retrialPlanId} / ${plan.planName}`, `種別: ${plan.planType}`, `推奨: ${plan.recommendedPlanDecision}`, `最終: ${plan.planDecision}`));
    return lines.join("\n");
  }

  function bindRetrialPlanPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-retrial-plan-core");
    if (!rootNode || rootNode.dataset.phase2217Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2217Bound = "true";
    const storage = getStorage(options.storage);
    let evaluationLoad = loadEvaluationStore(storage).evaluationStore;
    let trialLoad = loadTrialStore(storage).trialStore;
    let planLoad = loadPlanStore(storage).planStore;
    let retrialLoad = loadRetrialPlanStore(storage, evaluationLoad, trialLoad, planLoad);
    const nodes = { summary: doc.querySelector("#phase22-retrial-summary"), list: doc.querySelector("#phase22-retrial-list"), textOutput: doc.querySelector("#phase22-retrial-text-output"), message: doc.querySelector("#phase22-retrial-message") };
    function render() {
      if (nodes.summary) nodes.summary.textContent = `計画対象 ${eligibleEvaluations(evaluationLoad).length}件 / 再試験計画 ${(retrialLoad.store.retrialPlans || []).length}件`;
      if (nodes.list) {
        nodes.list.replaceChildren();
        const table = doc.createElement("div");
        table.className = "phase22-retrial-table";
        (retrialLoad.store.retrialPlans || []).forEach((plan) => {
          const row = doc.createElement("div");
          row.className = "phase22-retrial-row";
          [plan.retrialPlanId, plan.sourceEvaluationId, plan.planType, plan.recommendedPlanDecision, plan.planDecision, "自動開始なし"].forEach((value) => {
            const span = doc.createElement("span");
            span.textContent = value;
            row.appendChild(span);
          });
          table.appendChild(row);
        });
        nodes.list.appendChild(table);
      }
    }
    const actions = {
      "#phase22-retrial-reload": () => { evaluationLoad = loadEvaluationStore(storage).evaluationStore; trialLoad = loadTrialStore(storage).trialStore; planLoad = loadPlanStore(storage).planStore; retrialLoad = loadRetrialPlanStore(storage, evaluationLoad, trialLoad, planLoad); render(); },
      "#phase22-retrial-save": () => { const result = saveRetrialPlanStore(storage, retrialLoad.store); if (nodes.message) nodes.message.textContent = result.saved ? "保存しました。" : "保存できませんでした。"; },
      "#phase22-retrial-text": () => { if (nodes.textOutput) nodes.textOutput.value = generatePlainText(retrialLoad.store); }
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, actions, nodes, state: { retrialLoad } };
  }

  if (root && root.document) {
    const start = () => bindRetrialPlanPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    PLAN_STORAGE_KEY,
    TRIAL_STORAGE_KEY,
    EVALUATION_STORAGE_KEY,
    STORAGE_KEY,
    ELIGIBLE_DECISIONS,
    normalizeRetrialPlan,
    normalizeRetrialPlanStore,
    loadEvaluationStore,
    loadTrialStore,
    loadPlanStore,
    loadRetrialPlanStore,
    validatePlanSource,
    buildPlanFromEvaluation,
    mapDecisionToPlanType,
    calculateRecommendedPlanDecision,
    validateRetrialPlan,
    addCorrectionItem,
    updateCorrectionItem,
    addContinuationCondition,
    updateContinuationCondition,
    addStopCondition,
    addEvaluationCriterion,
    transitionPlanStatus,
    setFinalPlanDecision,
    approveRetrialPlan,
    markPlanReady,
    saveRetrialPlanStore,
    loadRetrialPlanResult,
    buildSafety,
    escapeHtml,
    generatePlainText,
    bindRetrialPlanPanel
  };
});
