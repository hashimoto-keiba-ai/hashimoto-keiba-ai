(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2218ManualRetrialCreationPrestartCheckCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1";
  const TRIAL_STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1";
  const EVALUATION_STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialResultEvaluationContinuationDecision.v1";
  const RETRIAL_PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.continuationTrialConditionsRetrialPlan.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.manualRetrialCreationPrestartCheck.v1";
  const CREATION_STATUSES = ["draft", "preparing", "awaiting_check", "checked", "awaiting_review", "reviewed", "awaiting_approval", "approved", "start_ready", "on_hold", "blocked", "cancelled", "expired"];
  const CREATION_DECISIONS = ["pending", "ready_for_manual_trial_entry", "revision_required", "additional_check_required", "approval_required", "blocked", "on_hold", "cancelled", "expired"];
  const TERMINAL_STATUSES = ["start_ready", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["preparing", "cancelled"],
    preparing: ["awaiting_check", "on_hold", "cancelled"],
    awaiting_check: ["checked", "preparing", "blocked", "on_hold", "cancelled"],
    checked: ["awaiting_review", "preparing", "blocked", "on_hold", "cancelled"],
    awaiting_review: ["reviewed", "checked", "blocked", "on_hold", "cancelled"],
    reviewed: ["awaiting_approval", "checked", "blocked", "on_hold", "cancelled"],
    awaiting_approval: ["approved", "reviewed", "blocked", "on_hold", "cancelled"],
    approved: ["start_ready", "blocked", "on_hold", "cancelled", "expired"],
    on_hold: ["preparing", "awaiting_check", "checked", "awaiting_review", "reviewed", "awaiting_approval", "cancelled"],
    blocked: ["preparing", "cancelled"],
    start_ready: [],
    cancelled: [],
    expired: []
  };
  const CHECK_JUDGEMENTS = ["pending", "pass", "conditional", "fail", "not_applicable"];
  const CHECK_SEVERITIES = ["info", "notice", "warning", "critical"];
  const CHECK_CATEGORIES = [
    "source_integrity",
    "approval",
    "target_scope",
    "observation_period",
    "race_count",
    "correction_completion",
    "continuation_conditions",
    "stop_conditions",
    "evaluation_criteria",
    "data_integrity",
    "duplicate_trial",
    "safety_flags",
    "manual_operation",
    "rollback_reference"
  ];

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

  function splitList(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    return text(value).split(/[\n,、，]+/).map(text).filter(Boolean);
  }

  function stableSlug(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 58) || "manual-retrial";
  }

  function generateCandidateTrialId(plan) {
    return `phase22-18-trial-${stableSlug(plan.retrialPlanId || plan.sourceEvaluationId || plan.targetImprovementRuleId)}`;
  }

  function stableCreationCheckId(plan) {
    return `phase22-18-check-${stableSlug(plan.retrialPlanId || plan.sourceEvaluationId || plan.targetImprovementRuleId)}`;
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
      manualCreationOnly: true,
      prestartCheckOnly: true,
      automaticApply: false,
      automaticLearning: false,
      automaticUpdate: false,
      autoExecution: false,
      autoRollback: false,
      autoContinuation: false,
      autoTrialCreation: false,
      autoTrialStart: false,
      publicUrl: false,
      githubPages: false,
      externalApi: false,
      predictionMutation: false,
      bettingMutation: false,
      applicationStatusMutation: false,
      ruleActivation: false,
      trialStatusMutation: false,
      evaluationStatusMutation: false,
      retrialPlanStatusMutation: false
    };
  }

  function normalizeSourcePlan(input = {}) {
    return { planId: text(input.planId), targetApprovalId: text(input.targetApprovalId), targetImprovementRuleId: text(input.targetImprovementRuleId) };
  }

  function normalizeEvaluation(input = {}) {
    return {
      evaluationId: text(input.evaluationId),
      sourceTrialId: text(input.sourceTrialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      evaluationStatus: text(input.evaluationStatus || "draft"),
      continuationDecision: text(input.continuationDecision || "pending")
    };
  }

  function normalizeTrial(input = {}) {
    return {
      trialId: text(input.trialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      targetRaceKeys: splitList(input.targetRaceKeys)
    };
  }

  function normalizeReferenceItem(input = {}, index = 0, prefix = "item") {
    return {
      id: text(input.id || input.correctionId || input.conditionId || input.stopConditionId || input.criterionId) || `${prefix}-${index + 1}`,
      order: number(input.order, index + 1),
      category: text(input.category),
      content: text(input.content || input.issue || input.condition || input.metric),
      expectedResult: text(input.expectedResult || input.completionCriteria || input.target),
      status: text(input.status || input.judgement || ""),
      severity: text(input.severity || "")
    };
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
      planType: text(input.planType),
      planStatus: text(input.planStatus || "draft"),
      planDecision: text(input.planDecision || "pending"),
      finalApprover: text(input.finalApprover),
      approvedAt: text(input.approvedAt),
      decisionReason: text(input.decisionReason),
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
      correctionItems: Array.isArray(input.correctionItems) ? input.correctionItems.map((item, index) => normalizeReferenceItem(item, index, "correction")) : [],
      continuationConditions: Array.isArray(input.continuationConditions) ? input.continuationConditions.map((item, index) => ({ ...normalizeReferenceItem(item, index, "condition"), mandatory: item.mandatory !== false })) : [],
      stopConditions: Array.isArray(input.stopConditions) ? input.stopConditions.map((item, index) => normalizeReferenceItem(item, index, "stop")) : [],
      evaluationCriteria: Array.isArray(input.evaluationCriteria) ? input.evaluationCriteria.map((item, index) => normalizeReferenceItem(item, index, "criterion")) : [],
      safety: buildSafety()
    };
  }

  function normalizeCheckItem(input = {}, index = 0) {
    const category = CHECK_CATEGORIES.includes(input.category) ? input.category : "source_integrity";
    return {
      checkItemId: text(input.checkItemId) || `check-${index + 1}`,
      order: number(input.order, index + 1),
      category,
      content: text(input.content),
      expectedResult: text(input.expectedResult),
      actualResult: text(input.actualResult),
      judgement: CHECK_JUDGEMENTS.includes(input.judgement) ? input.judgement : "pending",
      severity: CHECK_SEVERITIES.includes(input.severity) ? input.severity : "info",
      checker: text(input.checker),
      checkedAt: text(input.checkedAt),
      comment: text(input.comment)
    };
  }

  function defaultCheckItems() {
    return CHECK_CATEGORIES.map((category, index) => normalizeCheckItem({
      checkItemId: `check-${index + 1}`,
      order: index + 1,
      category,
      content: category,
      expectedResult: "manual confirmation passed",
      judgement: "pending",
      severity: category === "safety_flags" || category === "duplicate_trial" ? "critical" : "notice"
    }, index));
  }

  function normalizeCandidateTrialSnapshot(input = {}) {
    return {
      candidateTrialId: text(input.candidateTrialId),
      candidateTrialName: text(input.candidateTrialName),
      sourceRetrialPlanId: text(input.sourceRetrialPlanId),
      sourceEvaluationId: text(input.sourceEvaluationId),
      sourceTrialId: text(input.sourceTrialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      planType: text(input.planType),
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
      correctionItems: Array.isArray(input.correctionItems) ? input.correctionItems.map((item, index) => normalizeReferenceItem(item, index, "correction")) : [],
      continuationConditions: Array.isArray(input.continuationConditions) ? input.continuationConditions.map((item, index) => ({ ...normalizeReferenceItem(item, index, "condition"), mandatory: item.mandatory !== false })) : [],
      stopConditions: Array.isArray(input.stopConditions) ? input.stopConditions.map((item, index) => normalizeReferenceItem(item, index, "stop")) : [],
      evaluationCriteria: Array.isArray(input.evaluationCriteria) ? input.evaluationCriteria.map((item, index) => normalizeReferenceItem(item, index, "criterion")) : [],
      safety: buildSafety()
    };
  }

  function buildCandidateTrialSnapshot(planInput, saved = {}) {
    const plan = normalizeRetrialPlan(planInput);
    return normalizeCandidateTrialSnapshot({
      ...saved,
      candidateTrialId: text(saved.candidateTrialId) || generateCandidateTrialId(plan),
      candidateTrialName: text(saved.candidateTrialName) || `${plan.planName || plan.retrialPlanId} manual retrial candidate`,
      sourceRetrialPlanId: plan.retrialPlanId,
      sourceEvaluationId: plan.sourceEvaluationId,
      sourceTrialId: plan.sourceTrialId,
      sourcePlanId: plan.sourcePlanId,
      targetApprovalId: plan.targetApprovalId,
      targetImprovementRuleId: plan.targetImprovementRuleId,
      planType: plan.planType,
      targetRaceKeys: plan.targetRaceKeys,
      targetCourses: plan.targetCourses,
      targetRaceClasses: plan.targetRaceClasses,
      targetDistances: plan.targetDistances,
      targetSurfaceTypes: plan.targetSurfaceTypes,
      excludedRaceKeys: plan.excludedRaceKeys,
      excludedConditions: plan.excludedConditions,
      observationStartDate: plan.observationStartDate,
      observationEndDate: plan.observationEndDate,
      minimumRaceCount: plan.minimumRaceCount,
      maximumRaceCount: plan.maximumRaceCount,
      minimumValidObservationCount: plan.minimumValidObservationCount,
      warningThreshold: plan.warningThreshold,
      criticalThreshold: plan.criticalThreshold,
      maximumStopRequestCount: plan.maximumStopRequestCount,
      baselineComparisonRequirement: plan.baselineComparisonRequirement,
      reproducibilityRequirement: plan.reproducibilityRequirement,
      dataIntegrityRequirement: plan.dataIntegrityRequirement,
      correctionItems: plan.correctionItems,
      continuationConditions: plan.continuationConditions,
      stopConditions: plan.stopConditions,
      evaluationCriteria: plan.evaluationCriteria
    });
  }

  function calculateRecommendedCreationDecision(checkInput) {
    const check = normalizeCreationCheck(checkInput);
    if (check.blockReason) return { recommendedCreationDecision: "blocked", recommendedReason: "Block reason exists." };
    if (check.checkItems.some((item) => item.judgement === "fail" || item.severity === "critical" && item.judgement !== "pass" && item.judgement !== "not_applicable")) {
      return { recommendedCreationDecision: "revision_required", recommendedReason: "Critical or failed prestart check remains." };
    }
    if (check.checkItems.some((item) => item.judgement === "pending" || item.judgement === "conditional")) {
      return { recommendedCreationDecision: "additional_check_required", recommendedReason: "Pending or conditional prestart checks remain." };
    }
    return { recommendedCreationDecision: "approval_required", recommendedReason: "Manual approval is required before start_ready." };
  }

  function normalizeCreationCheck(input = {}) {
    const candidate = normalizeCandidateTrialSnapshot(input.candidateTrial || {});
    return {
      creationCheckId: text(input.creationCheckId),
      sourceRetrialPlanId: text(input.sourceRetrialPlanId || candidate.sourceRetrialPlanId),
      sourceEvaluationId: text(input.sourceEvaluationId || candidate.sourceEvaluationId),
      sourceTrialId: text(input.sourceTrialId || candidate.sourceTrialId),
      sourcePlanId: text(input.sourcePlanId || candidate.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId || candidate.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId || candidate.targetImprovementRuleId),
      candidateTrialId: text(input.candidateTrialId || candidate.candidateTrialId),
      candidateTrialName: text(input.candidateTrialName || candidate.candidateTrialName),
      creationStatus: CREATION_STATUSES.includes(input.creationStatus) ? input.creationStatus : "draft",
      creationDecision: CREATION_DECISIONS.includes(input.creationDecision) ? input.creationDecision : "pending",
      recommendedCreationDecision: CREATION_DECISIONS.includes(input.recommendedCreationDecision) ? input.recommendedCreationDecision : "pending",
      recommendedReason: text(input.recommendedReason),
      operator: text(input.operator),
      checker: text(input.checker),
      reviewer: text(input.reviewer),
      finalApprover: text(input.finalApprover),
      preparedAt: text(input.preparedAt),
      checkedAt: text(input.checkedAt),
      reviewedAt: text(input.reviewedAt),
      approvedAt: text(input.approvedAt),
      readyAt: text(input.readyAt),
      cancelledAt: text(input.cancelledAt),
      expiredAt: text(input.expiredAt),
      decisionReason: text(input.decisionReason),
      blockReason: text(input.blockReason),
      exceptionReason: text(input.exceptionReason),
      notes: text(input.notes),
      candidateTrial: candidate,
      checkItems: Array.isArray(input.checkItems) && input.checkItems.length ? input.checkItems.map(normalizeCheckItem) : defaultCheckItems(),
      createdAt: text(input.createdAt),
      updatedAt: text(input.updatedAt),
      safety: buildSafety()
    };
  }

  function normalizePlanStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), plans: Array.isArray(input.plans) ? input.plans.map(normalizeSourcePlan).filter((item) => item.planId) : [] };
  }

  function normalizeTrialStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), trials: Array.isArray(input.trials) ? input.trials.map(normalizeTrial).filter((item) => item.trialId) : [] };
  }

  function normalizeEvaluationStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), evaluations: Array.isArray(input.evaluations) ? input.evaluations.map(normalizeEvaluation).filter((item) => item.evaluationId) : [] };
  }

  function normalizeRetrialPlanStore(input = {}) {
    return { schemaVersion: number(input.schemaVersion, 1), savedAt: text(input.savedAt), retrialPlans: Array.isArray(input.retrialPlans) ? input.retrialPlans.map(normalizeRetrialPlan).filter((item) => item.retrialPlanId) : [] };
  }

  function loadJsonStore(storage, key, normalizer, name) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { [name]: normalizer(), parseError: false };
    const raw = targetStorage.getItem(key);
    const parsed = safeParseJson(raw);
    return { [name]: normalizer(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function loadPlanStore(storage) { return loadJsonStore(storage, PLAN_STORAGE_KEY, normalizePlanStore, "planStore"); }
  function loadTrialStore(storage) { return loadJsonStore(storage, TRIAL_STORAGE_KEY, normalizeTrialStore, "trialStore"); }
  function loadEvaluationStore(storage) { return loadJsonStore(storage, EVALUATION_STORAGE_KEY, normalizeEvaluationStore, "evaluationStore"); }
  function loadRetrialPlanStore(storage) { return loadJsonStore(storage, RETRIAL_PLAN_STORAGE_KEY, normalizeRetrialPlanStore, "retrialPlanStore"); }

  function readyRetrialPlans(retrialPlanStore) {
    return (retrialPlanStore.retrialPlans || []).filter((plan) => plan.planStatus === "ready" && plan.planDecision === "ready_for_manual_trial_creation");
  }

  function buildCreationCheckFromRetrialPlan(planInput, savedCheck = {}) {
    const plan = normalizeRetrialPlan(planInput);
    const candidate = buildCandidateTrialSnapshot(plan, savedCheck.candidateTrial || {});
    const base = normalizeCreationCheck({
      ...savedCheck,
      creationCheckId: text(savedCheck.creationCheckId) || stableCreationCheckId(plan),
      sourceRetrialPlanId: plan.retrialPlanId,
      sourceEvaluationId: plan.sourceEvaluationId,
      sourceTrialId: plan.sourceTrialId,
      sourcePlanId: plan.sourcePlanId,
      targetApprovalId: plan.targetApprovalId,
      targetImprovementRuleId: plan.targetImprovementRuleId,
      candidateTrialId: text(savedCheck.candidateTrialId) || candidate.candidateTrialId,
      candidateTrialName: text(savedCheck.candidateTrialName) || candidate.candidateTrialName,
      candidateTrial: candidate
    });
    const recommended = calculateRecommendedCreationDecision(base);
    return normalizeCreationCheck({ ...base, recommendedCreationDecision: recommended.recommendedCreationDecision, recommendedReason: recommended.recommendedReason });
  }

  function normalizeCreationCheckStore(input = {}, retrialPlanStore = normalizeRetrialPlanStore()) {
    const savedByPlan = new Map((input.creationChecks || []).map((check) => [text(check.sourceRetrialPlanId), check]));
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2217SavedAt: text(input.sourcePhase2217SavedAt || retrialPlanStore.savedAt),
      creationChecks: readyRetrialPlans(retrialPlanStore).map((plan) => buildCreationCheckFromRetrialPlan(plan, savedByPlan.get(plan.retrialPlanId) || {})).sort((a, b) => a.creationCheckId.localeCompare(b.creationCheckId)),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName)
    };
  }

  function loadCreationCheckStore(storage, retrialPlanStore = normalizeRetrialPlanStore()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeCreationCheckStore({}, retrialPlanStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeCreationCheckStore({}, retrialPlanStore), parseError: true, rejected: true };
    if (parsed && (!parsed || typeof parsed !== "object" || (parsed.creationChecks && !Array.isArray(parsed.creationChecks)))) return { store: normalizeCreationCheckStore({}, retrialPlanStore), parseError: false, rejected: true };
    return { store: normalizeCreationCheckStore(parsed || {}, retrialPlanStore), parseError: false, rejected: false };
  }

  function findSource(check, retrialPlanStore, evaluationStore, trialStore, planStore) {
    const retrialPlan = (retrialPlanStore.retrialPlans || []).find((item) => item.retrialPlanId === check.sourceRetrialPlanId);
    const evaluation = (evaluationStore.evaluations || []).find((item) => item.evaluationId === check.sourceEvaluationId);
    const trial = (trialStore.trials || []).find((item) => item.trialId === check.sourceTrialId);
    const sourcePlan = (planStore.plans || []).find((item) => item.planId === check.sourcePlanId);
    return { retrialPlan, evaluation, trial, sourcePlan };
  }

  function hasScope(snapshot) {
    return [snapshot.targetRaceKeys, snapshot.targetCourses, snapshot.targetRaceClasses, snapshot.targetDistances, snapshot.targetSurfaceTypes].some((list) => Array.isArray(list) && list.length);
  }

  function validateCreationSource(checkInput, retrialPlanStore = normalizeRetrialPlanStore(), evaluationStore = normalizeEvaluationStore(), trialStore = normalizeTrialStore(), planStore = normalizePlanStore()) {
    const check = normalizeCreationCheck(checkInput);
    const errors = [];
    const { retrialPlan, evaluation, trial, sourcePlan } = findSource(check, retrialPlanStore, evaluationStore, trialStore, planStore);
    if (!retrialPlan) errors.push("sourceRetrialPlanId is missing in Phase22-17.");
    if (retrialPlan && retrialPlan.planStatus !== "ready") errors.push("sourceRetrialPlan must be ready.");
    if (retrialPlan && retrialPlan.planDecision !== "ready_for_manual_trial_creation") errors.push("sourceRetrialPlan decision must be ready_for_manual_trial_creation.");
    if (!evaluation) errors.push("sourceEvaluationId is missing in Phase22-16.");
    if (!trial) errors.push("sourceTrialId is missing in Phase22-15.");
    if (!sourcePlan) errors.push("sourcePlanId is missing in Phase22-14.");
    if (retrialPlan && check.sourceEvaluationId !== retrialPlan.sourceEvaluationId) errors.push("sourceEvaluationId mismatch.");
    if (retrialPlan && check.sourceTrialId !== retrialPlan.sourceTrialId) errors.push("sourceTrialId mismatch.");
    if (retrialPlan && check.sourcePlanId !== retrialPlan.sourcePlanId) errors.push("sourcePlanId mismatch.");
    if (evaluation && trial && evaluation.sourceTrialId !== trial.trialId) errors.push("evaluation / trial mismatch.");
    if (evaluation && sourcePlan && evaluation.sourcePlanId !== sourcePlan.planId) errors.push("evaluation / plan mismatch.");
    if (trial && sourcePlan && trial.sourcePlanId !== sourcePlan.planId) errors.push("trial / plan mismatch.");
    if (retrialPlan && check.targetApprovalId !== retrialPlan.targetApprovalId) errors.push("targetApprovalId mismatch.");
    if (retrialPlan && check.targetImprovementRuleId !== retrialPlan.targetImprovementRuleId) errors.push("targetImprovementRuleId mismatch.");
    return { ok: errors.length === 0, errors };
  }

  function isSafetyValid(safety = {}) {
    const expected = buildSafety();
    return Object.keys(expected).every((key) => safety[key] === expected[key]);
  }

  function validateCreationCheck(checkInput, retrialPlanStore = normalizeRetrialPlanStore(), evaluationStore = normalizeEvaluationStore(), trialStore = normalizeTrialStore(), planStore = normalizePlanStore(), creationStore = { creationChecks: [] }) {
    const check = normalizeCreationCheck(checkInput);
    const errors = [];
    ["creationCheckId", "sourceRetrialPlanId", "sourceEvaluationId", "sourceTrialId", "sourcePlanId", "targetApprovalId", "targetImprovementRuleId", "candidateTrialId", "candidateTrialName"].forEach((field) => {
      if (!text(check[field])) errors.push(`${field} is required.`);
    });
    errors.push(...validateCreationSource(check, retrialPlanStore, evaluationStore, trialStore, planStore).errors);
    const candidate = check.candidateTrial;
    if (!hasScope(candidate)) errors.push("target scope is required.");
    if (candidate.observationStartDate && candidate.observationEndDate && candidate.observationEndDate < candidate.observationStartDate) errors.push("observationEndDate must not be before observationStartDate.");
    if (!Number.isInteger(candidate.minimumRaceCount) || candidate.minimumRaceCount <= 0) errors.push("minimumRaceCount must be a positive integer.");
    if (!Number.isInteger(candidate.maximumRaceCount) || candidate.maximumRaceCount <= 0) errors.push("maximumRaceCount must be a positive integer.");
    if (candidate.minimumRaceCount > candidate.maximumRaceCount) errors.push("minimumRaceCount must not exceed maximumRaceCount.");
    if (!Number.isInteger(candidate.minimumValidObservationCount) || candidate.minimumValidObservationCount <= 0) errors.push("minimumValidObservationCount must be a positive integer.");
    if (candidate.warningThreshold < 0 || candidate.criticalThreshold <= 0) errors.push("warningThreshold / criticalThreshold are invalid.");
    if ((trialStore.trials || []).some((trial) => trial.trialId === check.candidateTrialId)) errors.push("candidateTrialId duplicates an existing Phase22-15 trial.");
    if ((creationStore.creationChecks || []).some((item) => item.creationCheckId !== check.creationCheckId && item.sourceRetrialPlanId === check.sourceRetrialPlanId)) errors.push("sourceRetrialPlanId already has a creation check.");
    if ((creationStore.creationChecks || []).some((item) => item.creationCheckId !== check.creationCheckId && item.candidateTrialId === check.candidateTrialId)) errors.push("candidateTrialId duplicates another creation check.");
    if (candidate.correctionItems.some((item) => !["verified", "waived"].includes(item.status))) errors.push("required correctionItems must be verified or waived.");
    if (candidate.continuationConditions.some((item) => item.mandatory && !["satisfied", "waived"].includes(item.status))) errors.push("mandatory continuationConditions must be satisfied or waived.");
    if (!candidate.stopConditions.some((item) => item.severity === "critical")) errors.push("at least one critical stopCondition is required.");
    if (!candidate.evaluationCriteria.length) errors.push("evaluationCriteria are required.");
    if (check.checkItems.some((item) => item.judgement === "fail" || item.severity === "critical" && item.judgement !== "pass" && item.judgement !== "not_applicable")) errors.push("critical or failed checkItems remain.");
    if (!isSafetyValid(check.safety) || !isSafetyValid(candidate.safety)) errors.push("safety flags are invalid.");
    if (check.creationDecision === "ready_for_manual_trial_entry") {
      if (check.creationStatus !== "approved") errors.push("approved status is required before start_ready.");
      if (!text(check.finalApprover) || !text(check.approvedAt) || !text(check.decisionReason)) errors.push("finalApprover, approvedAt, and decisionReason are required.");
      if (!check.checkItems.some((item) => item.category === "manual_operation" && item.judgement === "pass")) errors.push("manual_operation check must pass.");
    }
    if (check.creationDecision !== "pending" && !text(check.finalApprover)) errors.push("final creationDecision requires a decision maker.");
    return { ok: errors.length === 0, errors };
  }

  function addCheckItem(check, item) {
    if (TERMINAL_STATUSES.includes(check.creationStatus)) return { added: false, reason: "terminal_locked", check };
    return { added: true, check: { ...check, checkItems: [...(check.checkItems || []), normalizeCheckItem(item, (check.checkItems || []).length)], safety: buildSafety() } };
  }

  function updateCheckItem(check, id, changes) {
    if (TERMINAL_STATUSES.includes(check.creationStatus)) return { updated: false, reason: "terminal_locked", check };
    return { updated: true, check: { ...check, checkItems: (check.checkItems || []).map((item) => item.checkItemId === id ? normalizeCheckItem({ ...item, ...changes }) : item), safety: buildSafety() } };
  }

  function transitionCreationStatus(check, toStatus) {
    if (!CREATION_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", check };
    if (!(ALLOWED_TRANSITIONS[check.creationStatus] || []).includes(toStatus)) return { transitioned: false, reason: "invalid_transition", check };
    return { transitioned: true, check: { ...check, creationStatus: toStatus, safety: buildSafety() } };
  }

  function setFinalCreationDecision(check, decision, maker, reason, decidedAt) {
    if (TERMINAL_STATUSES.includes(check.creationStatus)) return { set: false, reason: "terminal_locked", check };
    if (!CREATION_DECISIONS.includes(decision) || decision === "pending") return { set: false, reason: "invalid_decision", check };
    if (!text(maker) || !text(reason) || !text(decidedAt)) return { set: false, reason: "missing_required_fields", check };
    return { set: true, check: { ...check, creationDecision: decision, finalApprover: text(maker), decisionReason: text(reason), approvedAt: text(decidedAt), safety: buildSafety() } };
  }

  function approveCreationCheck(check, approver, approvedAt, reason) {
    if (!text(approver) || !text(approvedAt) || !text(reason)) return { approved: false, reason: "missing_required_fields", check };
    return { approved: true, check: { ...check, creationStatus: "approved", finalApprover: text(approver), approvedAt: text(approvedAt), decisionReason: text(reason), safety: buildSafety() } };
  }

  function markStartReady(check, retrialPlanStore, evaluationStore, trialStore, planStore, creationStore) {
    const candidate = { ...check, creationDecision: "ready_for_manual_trial_entry" };
    const result = validateCreationCheck(candidate, retrialPlanStore, evaluationStore, trialStore, planStore, creationStore);
    if (!result.ok) return { ready: false, errors: result.errors, check };
    return { ready: true, errors: [], check: { ...candidate, creationStatus: "start_ready", readyAt: text(candidate.approvedAt), safety: buildSafety() } };
  }

  function saveCreationCheckStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, savedAt: now.toISOString(), creationChecks: (store.creationChecks || []).map((check) => ({ ...check, safety: buildSafety(), candidateTrial: { ...check.candidateTrial, safety: buildSafety() } })) }));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function loadCreationCheckResult(storage, retrialPlanStore) {
    return loadCreationCheckStore(storage, retrialPlanStore);
  }

  function generatePlainText(store) {
    const lines = ["Phase22-18 Manual Retrial Creation Prestart Check", `Storage: ${STORAGE_KEY}`, "Manual creation preparation only / no auto trial creation / no auto start / no production mutation"];
    (store.creationChecks || []).forEach((check) => lines.push("", `${check.creationCheckId} / ${check.candidateTrialId}`, `source: ${check.sourceRetrialPlanId}`, `status: ${check.creationStatus}`, `recommended: ${check.recommendedCreationDecision}`, `final: ${check.creationDecision}`));
    return lines.join("\n");
  }

  function bindCreationCheckPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-manual-retrial-creation-check-core");
    if (!rootNode || rootNode.dataset.phase2218Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2218Bound = "true";
    const storage = getStorage(options.storage);
    let retrialPlanStore = loadRetrialPlanStore(storage).retrialPlanStore;
    let creationLoad = loadCreationCheckStore(storage, retrialPlanStore);
    const nodes = { summary: doc.querySelector("#phase22-creation-check-summary"), list: doc.querySelector("#phase22-creation-check-list"), textOutput: doc.querySelector("#phase22-creation-check-text-output"), message: doc.querySelector("#phase22-creation-check-message") };
    function render() {
      if (nodes.summary) nodes.summary.textContent = `ready plans ${readyRetrialPlans(retrialPlanStore).length} / creation checks ${(creationLoad.store.creationChecks || []).length}`;
      if (nodes.list) {
        nodes.list.replaceChildren();
        const table = doc.createElement("div");
        table.className = "phase22-creation-check-table";
        (creationLoad.store.creationChecks || []).forEach((check) => {
          const row = doc.createElement("div");
          row.className = "phase22-creation-check-row";
          [check.creationCheckId, check.sourceRetrialPlanId, check.candidateTrialId, check.creationStatus, check.recommendedCreationDecision, check.creationDecision, "no auto start"].forEach((value) => {
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
      "#phase22-creation-check-reload": () => { retrialPlanStore = loadRetrialPlanStore(storage).retrialPlanStore; creationLoad = loadCreationCheckStore(storage, retrialPlanStore); render(); },
      "#phase22-creation-check-save": () => { const result = saveCreationCheckStore(storage, creationLoad.store); if (nodes.message) nodes.message.textContent = result.saved ? "Saved." : "Save failed."; },
      "#phase22-creation-check-text": () => { if (nodes.textOutput) nodes.textOutput.value = generatePlainText(creationLoad.store); }
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, actions, nodes, state: { creationLoad } };
  }

  if (root && root.document) {
    const start = () => bindCreationCheckPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    PLAN_STORAGE_KEY,
    TRIAL_STORAGE_KEY,
    EVALUATION_STORAGE_KEY,
    RETRIAL_PLAN_STORAGE_KEY,
    STORAGE_KEY,
    CREATION_STATUSES,
    CREATION_DECISIONS,
    normalizeCreationCheck,
    normalizeCreationCheckStore,
    loadRetrialPlanStore,
    loadEvaluationStore,
    loadTrialStore,
    loadPlanStore,
    loadCreationCheckStore,
    validateCreationSource,
    buildCreationCheckFromRetrialPlan,
    buildCandidateTrialSnapshot,
    generateCandidateTrialId,
    calculateRecommendedCreationDecision,
    validateCreationCheck,
    addCheckItem,
    updateCheckItem,
    transitionCreationStatus,
    setFinalCreationDecision,
    approveCreationCheck,
    markStartReady,
    saveCreationCheckStore,
    loadCreationCheckResult,
    readyRetrialPlans,
    buildSafety,
    escapeHtml,
    generatePlainText,
    bindCreationCheckPanel
  };
});
