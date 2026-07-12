(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2216LimitedTrialEvaluationDecisionCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1";
  const TRIAL_STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialResultEvaluationContinuationDecision.v1";
  const EVALUATION_STATUSES = ["draft", "evaluating", "awaiting_review", "reviewed", "finalized", "on_hold", "cancelled", "expired"];
  const CONTINUATION_DECISIONS = ["pending", "continue_limited_trial", "continue_with_conditions", "revision_required", "additional_observation_required", "pause_required", "stop_required", "rejected", "cancelled"];
  const CHECK_JUDGEMENTS = ["pending", "pass", "conditional", "fail", "not_applicable"];
  const CHECK_SEVERITIES = ["info", "notice", "warning", "critical"];
  const TERMINAL_STATUSES = ["finalized", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["evaluating", "cancelled"],
    evaluating: ["awaiting_review", "on_hold", "cancelled"],
    awaiting_review: ["reviewed", "evaluating", "on_hold", "cancelled"],
    reviewed: ["finalized", "evaluating", "on_hold", "cancelled"],
    on_hold: ["evaluating", "awaiting_review", "cancelled"],
    finalized: [],
    cancelled: [],
    expired: []
  };

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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "evaluation";
  }

  function stableEvaluationId(trial) {
    return `phase22-16-evaluation-${stableSlug(trial.trialId || trial.sourcePlanId || trial.targetImprovementRuleId || "trial")}`;
  }

  function buildSafety() {
    return {
      planOnly: true,
      protectedMode: true,
      privateLocal: true,
      observationOnly: true,
      shadowMode: true,
      evaluationOnly: true,
      automaticApply: false,
      automaticLearning: false,
      automaticUpdate: false,
      autoExecution: false,
      autoRollback: false,
      autoContinuation: false,
      publicUrl: false,
      githubPages: false,
      externalApi: false,
      predictionMutation: false,
      bettingMutation: false,
      applicationStatusMutation: false,
      ruleActivation: false,
      trialStatusMutation: false
    };
  }

  function safetyOk(safety) {
    const trueKeys = ["planOnly", "protectedMode", "privateLocal", "observationOnly", "shadowMode"];
    const falseKeys = ["automaticApply", "automaticLearning", "automaticUpdate", "autoExecution", "autoRollback", "autoContinuation", "publicUrl", "githubPages", "externalApi", "predictionMutation", "bettingMutation", "applicationStatusMutation", "ruleActivation", "trialStatusMutation"];
    return trueKeys.every((key) => safety[key] !== false) && falseKeys.every((key) => safety[key] !== true);
  }

  function normalizePlan(input = {}) {
    return {
      planId: text(input.planId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      planStatus: text(input.planStatus),
      planDecision: text(input.planDecision),
      executionStatus: text(input.executionStatus)
    };
  }

  function normalizePlanStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      plans: Array.isArray(input.plans) ? input.plans.map(normalizePlan).filter((plan) => plan.planId) : []
    };
  }

  function normalizeObservation(input = {}, index = 0) {
    return {
      observationId: text(input.observationId) || `observation-${index + 1}`,
      raceKey: text(input.raceKey),
      observedAt: text(input.observedAt),
      baselinePrediction: text(input.baselinePrediction),
      trialPrediction: text(input.trialPrediction),
      differenceSummary: text(input.differenceSummary),
      expectedBehavior: text(input.expectedBehavior),
      actualBehavior: text(input.actualBehavior),
      resultSummary: text(input.resultSummary),
      anomalyLevel: ["none", "notice", "warning", "critical"].includes(input.anomalyLevel) ? input.anomalyLevel : "none",
      anomalyDetails: text(input.anomalyDetails),
      observer: text(input.observer),
      judgement: text(input.judgement),
      notes: text(input.notes)
    };
  }

  function normalizeTrial(input = {}) {
    return {
      trialId: text(input.trialId),
      sourcePlanId: text(input.sourcePlanId),
      targetApprovalId: text(input.targetApprovalId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      trialName: text(input.trialName),
      trialStatus: text(input.trialStatus),
      trialDecision: text(input.trialDecision),
      stopReason: text(input.stopReason),
      stopRequests: Array.isArray(input.stopRequests) ? input.stopRequests.map(text).filter(Boolean) : [],
      maximumRaceCount: number(input.maximumRaceCount, 0),
      observedRaceCount: number(input.observedRaceCount, 0),
      targetRaceKeys: Array.isArray(input.targetRaceKeys) ? input.targetRaceKeys.map(text).filter(Boolean) : [],
      observationStartDate: text(input.observationStartDate),
      observationEndDate: text(input.observationEndDate),
      observations: Array.isArray(input.observations) ? input.observations.map(normalizeObservation) : [],
      safety: input.safety || buildSafety()
    };
  }

  function normalizeTrialStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      trials: Array.isArray(input.trials) ? input.trials.map(normalizeTrial).filter((trial) => trial.trialId) : []
    };
  }

  function loadPlanStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { planStore: normalizePlanStore(), parseError: false };
    const raw = targetStorage.getItem(PLAN_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { planStore: normalizePlanStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function loadTrialStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { trialStore: normalizeTrialStore(), parseError: false };
    const raw = targetStorage.getItem(TRIAL_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { trialStore: normalizeTrialStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function planById(planStore) {
    return new Map((planStore.plans || []).map((plan) => [plan.planId, plan]));
  }

  function eligibleTrials(trialStore) {
    return (trialStore.trials || []).filter((trial) => ["completed", "stopped"].includes(trial.trialStatus) && trial.observations.length);
  }

  function calculateTrialSummary(trialInput) {
    const trial = normalizeTrial(trialInput);
    const observations = trial.observations || [];
    const raceSeen = new Set();
    const summary = {
      plannedRaceCount: trial.maximumRaceCount || trial.targetRaceKeys.length,
      observedRaceCount: observations.length,
      validObservationCount: 0,
      excludedObservationCount: 0,
      anomalyNoneCount: 0,
      anomalyNoticeCount: 0,
      anomalyWarningCount: 0,
      anomalyCriticalCount: 0,
      stopRequestCount: trial.stopRequests.length,
      baselineBetterCount: 0,
      trialBetterCount: 0,
      equivalentCount: 0,
      insufficientDataCount: 0,
      scopeViolationCount: 0,
      periodViolationCount: 0,
      duplicateObservationCount: 0,
      dataIntegrityErrorCount: 0
    };
    observations.forEach((item) => {
      if (!item.raceKey || !item.observedAt) summary.dataIntegrityErrorCount += 1;
      if (raceSeen.has(item.raceKey)) summary.duplicateObservationCount += 1;
      raceSeen.add(item.raceKey);
      if (trial.targetRaceKeys.length && !trial.targetRaceKeys.includes(item.raceKey)) summary.scopeViolationCount += 1;
      const date = item.observedAt.slice(0, 10);
      if ((trial.observationStartDate && date < trial.observationStartDate) || (trial.observationEndDate && date > trial.observationEndDate)) summary.periodViolationCount += 1;
      summary[`anomaly${item.anomalyLevel.charAt(0).toUpperCase()}${item.anomalyLevel.slice(1)}Count`] += 1;
      const judgement = `${item.judgement} ${item.differenceSummary} ${item.resultSummary}`.toLowerCase();
      if (judgement.includes("trial_better") || judgement.includes("trial better") || judgement.includes("改善")) summary.trialBetterCount += 1;
      else if (judgement.includes("baseline_better") || judgement.includes("baseline better") || judgement.includes("悪化")) summary.baselineBetterCount += 1;
      else if (judgement.includes("insufficient") || judgement.includes("不足")) summary.insufficientDataCount += 1;
      else summary.equivalentCount += 1;
    });
    summary.validObservationCount = observations.length - summary.scopeViolationCount - summary.periodViolationCount - summary.duplicateObservationCount - summary.dataIntegrityErrorCount;
    summary.excludedObservationCount = observations.length - Math.max(summary.validObservationCount, 0);
    return summary;
  }

  function buildRecommendedDecision(trialInput, options = {}) {
    const trial = normalizeTrial(trialInput);
    const summary = calculateTrialSummary(trial);
    const warningLimit = number(options.warningLimit, 2);
    const minimumValidObservationCount = number(options.minimumValidObservationCount, 2);
    if (summary.anomalyCriticalCount > 0) return { recommendedDecision: "stop_required", recommendedReason: "critical異常があります。", summary };
    if (summary.scopeViolationCount || summary.periodViolationCount || summary.duplicateObservationCount || summary.dataIntegrityErrorCount) return { recommendedDecision: "revision_required", recommendedReason: "対象外、期間外、重複、データ破損などの整合性違反があります。", summary };
    if (summary.anomalyWarningCount >= warningLimit) return { recommendedDecision: "pause_required", recommendedReason: "warning異常が設定上限以上です。", summary };
    if (summary.validObservationCount < minimumValidObservationCount) return { recommendedDecision: "additional_observation_required", recommendedReason: "有効観測件数が最低必要件数未満です。", summary };
    if (trial.trialStatus === "stopped" && trial.stopReason) return { recommendedDecision: "stop_required", recommendedReason: "試験が停止終了しており停止理由があります。", summary };
    if (summary.trialBetterCount > 0 || summary.equivalentCount >= summary.baselineBetterCount) return { recommendedDecision: "continue_limited_trial", recommendedReason: "異常が許容範囲内でbaselineと同等以上です。", summary };
    return { recommendedDecision: "revision_required", recommendedReason: "改善効果が確認できません。", summary };
  }

  function defaultChecks() {
    return [
      "対象範囲遵守", "観測期間遵守", "最大件数遵守", "データ完全性", "異常内容", "停止要求内容", "baselinePredictionとtrialPredictionの差", "expectedBehaviorとactualBehaviorの差", "結果の再現性", "継続試験条件", "修正要否", "追加観測要否", "停止要否"
    ].map((content, index) => ({ checkId: `check-${index + 1}`, order: index + 1, category: "evaluation", content, expectedResult: "人が確認する", actualResult: "", judgement: "pending", severity: "info", reviewer: "", reviewedAt: "", comment: "" }));
  }

  function normalizeEvaluationCheck(input = {}, index = 0) {
    return {
      checkId: text(input.checkId) || `check-${index + 1}`,
      order: number(input.order, index + 1),
      category: text(input.category || "evaluation"),
      content: text(input.content),
      expectedResult: text(input.expectedResult),
      actualResult: text(input.actualResult),
      judgement: CHECK_JUDGEMENTS.includes(input.judgement) ? input.judgement : "pending",
      severity: CHECK_SEVERITIES.includes(input.severity) ? input.severity : "info",
      reviewer: text(input.reviewer),
      reviewedAt: text(input.reviewedAt),
      comment: text(input.comment)
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
      evaluationPurpose: text(input.evaluationPurpose),
      evaluationStatus: EVALUATION_STATUSES.includes(input.evaluationStatus) ? input.evaluationStatus : "draft",
      continuationDecision: CONTINUATION_DECISIONS.includes(input.continuationDecision) ? input.continuationDecision : "pending",
      recommendedDecision: CONTINUATION_DECISIONS.includes(input.recommendedDecision) ? input.recommendedDecision : "pending",
      recommendedReason: text(input.recommendedReason),
      evaluator: text(input.evaluator),
      reviewer: text(input.reviewer),
      finalDecisionMaker: text(input.finalDecisionMaker),
      evaluationStartedAt: text(input.evaluationStartedAt),
      evaluatedAt: text(input.evaluatedAt),
      reviewedAt: text(input.reviewedAt),
      finalizedAt: text(input.finalizedAt),
      nextReviewDueDate: text(input.nextReviewDueDate),
      summary: input.summary || {},
      decisionReason: text(input.decisionReason),
      requiredCorrections: text(input.requiredCorrections),
      continuationConditions: text(input.continuationConditions),
      stopReason: text(input.stopReason),
      notes: text(input.notes),
      checks: Array.isArray(input.checks) ? input.checks.map(normalizeEvaluationCheck) : defaultChecks(),
      createdAt: text(input.createdAt),
      updatedAt: text(input.updatedAt),
      safety: buildSafety()
    };
  }

  function buildEvaluationFromTrial(trialInput, planStore = normalizePlanStore(), savedEvaluation = {}) {
    const trial = normalizeTrial(trialInput);
    const recommended = buildRecommendedDecision(trial);
    return normalizeEvaluation({
      ...savedEvaluation,
      evaluationId: text(savedEvaluation.evaluationId) || stableEvaluationId(trial),
      sourceTrialId: trial.trialId,
      sourcePlanId: trial.sourcePlanId,
      targetApprovalId: trial.targetApprovalId,
      targetImprovementRuleId: trial.targetImprovementRuleId,
      evaluationName: text(savedEvaluation.evaluationName) || `${trial.trialName} 結果評価`,
      evaluationPurpose: text(savedEvaluation.evaluationPurpose) || "限定試験の観測結果から継続可否を人が判定する",
      recommendedDecision: recommended.recommendedDecision,
      recommendedReason: recommended.recommendedReason,
      summary: recommended.summary
    });
  }

  function validateEvaluationSource(evaluation, trialStore, planStore) {
    const errors = [];
    const trial = (trialStore.trials || []).find((item) => item.trialId === evaluation.sourceTrialId);
    const plan = (planStore.plans || []).find((item) => item.planId === evaluation.sourcePlanId);
    if (!trial) errors.push("sourceTrialIdがPhase22-15に存在しません。");
    if (trial && !["completed", "stopped"].includes(trial.trialStatus)) errors.push("元試験はcompletedまたはstoppedである必要があります。");
    if (trial && !trial.observations.length) errors.push("元試験に観測記録がありません。");
    if (!plan) errors.push("元Phase22-14計画が存在しません。");
    if (trial && plan && trial.sourcePlanId !== plan.planId) errors.push("sourcePlanIdが元計画と整合しません。");
    if (trial && evaluation.targetApprovalId !== trial.targetApprovalId) errors.push("targetApprovalIdが整合しません。");
    if (trial && evaluation.targetImprovementRuleId !== trial.targetImprovementRuleId) errors.push("targetImprovementRuleIdが整合しません。");
    return { ok: errors.length === 0, errors };
  }

  function validateEvaluation(evaluationInput, trialStore = normalizeTrialStore(), planStore = normalizePlanStore()) {
    const evaluation = normalizeEvaluation(evaluationInput);
    const errors = [];
    ["evaluationId", "sourceTrialId", "sourcePlanId", "targetApprovalId", "targetImprovementRuleId", "evaluationName", "evaluationPurpose"].forEach((field) => { if (!text(evaluation[field])) errors.push(`${field}が不足しています。`); });
    if (evaluation.continuationDecision !== "pending") {
      if (!text(evaluation.finalDecisionMaker)) errors.push("最終判定には決定者が必要です。");
      if (!text(evaluation.decisionReason)) errors.push("最終判定には決定理由が必要です。");
      if (!text(evaluation.finalizedAt)) errors.push("最終判定には日時が必要です。");
    }
    const source = validateEvaluationSource(evaluation, trialStore, planStore);
    errors.push(...source.errors);
    if (!safetyOk(evaluation.safety)) errors.push("安全フラグが無効です。");
    return { ok: errors.length === 0, errors };
  }

  function addEvaluationCheck(evaluation, check) {
    if (evaluation.evaluationStatus === "finalized") return { added: false, reason: "finalized", evaluation };
    return { added: true, evaluation: { ...evaluation, checks: [...(evaluation.checks || []), normalizeEvaluationCheck(check, (evaluation.checks || []).length)], safety: buildSafety() } };
  }

  function updateEvaluationCheck(evaluation, checkId, changes) {
    if (evaluation.evaluationStatus === "finalized") return { updated: false, reason: "finalized", evaluation };
    return { updated: true, evaluation: { ...evaluation, checks: (evaluation.checks || []).map((check) => check.checkId === checkId ? normalizeEvaluationCheck({ ...check, ...changes }) : check), safety: buildSafety() } };
  }

  function transitionEvaluationStatus(evaluation, toStatus) {
    if (!EVALUATION_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", evaluation };
    if (!(ALLOWED_TRANSITIONS[evaluation.evaluationStatus] || []).includes(toStatus)) return { transitioned: false, reason: "invalid_transition", evaluation };
    return { transitioned: true, evaluation: { ...evaluation, evaluationStatus: toStatus, safety: buildSafety() } };
  }

  function setFinalContinuationDecision(evaluation, decision, maker, reason, decidedAt) {
    if (evaluation.evaluationStatus === "finalized") return { set: false, reason: "finalized", evaluation };
    if (!CONTINUATION_DECISIONS.includes(decision) || decision === "pending") return { set: false, reason: "invalid_decision", evaluation };
    if (!text(maker) || !text(reason) || !text(decidedAt)) return { set: false, reason: "missing_required_final_decision_fields", evaluation };
    return { set: true, evaluation: { ...evaluation, continuationDecision: decision, finalDecisionMaker: text(maker), decisionReason: text(reason), finalizedAt: text(decidedAt), safety: buildSafety() } };
  }

  function finalizeEvaluation(evaluation) {
    if (!text(evaluation.finalDecisionMaker) || !text(evaluation.decisionReason) || !text(evaluation.finalizedAt) || evaluation.continuationDecision === "pending") return { finalized: false, reason: "missing_final_decision", evaluation };
    return { finalized: true, evaluation: { ...evaluation, evaluationStatus: "finalized", safety: buildSafety() } };
  }

  function normalizeEvaluationStore(input = {}, trialStore = normalizeTrialStore(), planStore = normalizePlanStore()) {
    const savedByTrial = new Map((input.evaluations || []).map((evaluation) => [text(evaluation.sourceTrialId), evaluation]));
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2215SavedAt: text(input.sourcePhase2215SavedAt || trialStore.savedAt),
      sourcePhase2214SavedAt: text(input.sourcePhase2214SavedAt || planStore.savedAt),
      evaluations: eligibleTrials(trialStore).map((trial) => buildEvaluationFromTrial(trial, planStore, savedByTrial.get(trial.trialId) || {})).sort((a, b) => a.evaluationId.localeCompare(b.evaluationId)),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName)
    };
  }

  function loadEvaluationStore(storage, trialStore, planStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeEvaluationStore({}, trialStore, planStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeEvaluationStore({}, trialStore, planStore), parseError: true, rejected: true };
    if (parsed && (!parsed || typeof parsed !== "object" || (parsed.evaluations && !Array.isArray(parsed.evaluations)))) return { store: normalizeEvaluationStore({}, trialStore, planStore), parseError: false, rejected: true };
    return { store: normalizeEvaluationStore(parsed || {}, trialStore, planStore), parseError: false, rejected: false };
  }

  function loadEvaluationResult(storage, trialStore, planStore) {
    return loadEvaluationStore(storage, trialStore, planStore);
  }

  function saveEvaluationStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, savedAt: now.toISOString(), evaluations: (store.evaluations || []).map((evaluation) => ({ ...evaluation, safety: buildSafety() })) }));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function generatePlainText(store) {
    const lines = ["Phase22-16 限定試験結果評価・継続可否判定", `保存キー: ${STORAGE_KEY}`, "評価専用 / 継続判定のみ / 本番反映なし"];
    (store.evaluations || []).forEach((evaluation) => lines.push("", `${evaluation.evaluationId} / ${evaluation.evaluationName}`, `推奨: ${evaluation.recommendedDecision}`, `最終: ${evaluation.continuationDecision}`));
    return lines.join("\n");
  }

  function bindEvaluationPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-trial-evaluation-decision-core");
    if (!rootNode || rootNode.dataset.phase2216Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2216Bound = "true";
    const storage = getStorage(options.storage);
    let trialLoad = loadTrialStore(storage);
    let planLoad = loadPlanStore(storage);
    let evalLoad = loadEvaluationStore(storage, trialLoad.trialStore, planLoad.planStore);
    const nodes = {
      summary: doc.querySelector("#phase22-evaluation-summary"),
      list: doc.querySelector("#phase22-evaluation-list"),
      textOutput: doc.querySelector("#phase22-evaluation-text-output"),
      message: doc.querySelector("#phase22-evaluation-message")
    };
    function render() {
      if (nodes.summary) nodes.summary.textContent = `評価対象 ${eligibleTrials(trialLoad.trialStore).length}件 / 評価 ${(evalLoad.store.evaluations || []).length}件`;
      if (nodes.list) {
        nodes.list.replaceChildren();
        const table = doc.createElement("div");
        table.className = "phase22-evaluation-decision-table";
        (evalLoad.store.evaluations || []).forEach((evaluation) => {
          const row = doc.createElement("div");
          row.className = "phase22-evaluation-decision-row";
          [evaluation.evaluationId, evaluation.sourceTrialId, evaluation.recommendedDecision, evaluation.continuationDecision, "本番反映なし"].forEach((value) => {
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
      "#phase22-evaluation-reload": () => { trialLoad = loadTrialStore(storage); planLoad = loadPlanStore(storage); evalLoad = loadEvaluationStore(storage, trialLoad.trialStore, planLoad.planStore); render(); },
      "#phase22-evaluation-save": () => { const result = saveEvaluationStore(storage, evalLoad.store); if (nodes.message) nodes.message.textContent = result.saved ? "保存しました。" : "保存できませんでした。"; },
      "#phase22-evaluation-text": () => { if (nodes.textOutput) nodes.textOutput.value = generatePlainText(evalLoad.store); }
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, actions, nodes, state: { trialLoad, planLoad, evalLoad } };
  }

  if (root && root.document) {
    const start = () => bindEvaluationPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    PLAN_STORAGE_KEY,
    TRIAL_STORAGE_KEY,
    STORAGE_KEY,
    EVALUATION_STATUSES,
    CONTINUATION_DECISIONS,
    normalizeEvaluation,
    normalizeEvaluationStore,
    loadTrialStore,
    loadPlanStore,
    loadEvaluationStore,
    buildEvaluationFromTrial,
    calculateTrialSummary,
    validateEvaluationSource,
    validateEvaluation,
    buildRecommendedDecision,
    addEvaluationCheck,
    updateEvaluationCheck,
    transitionEvaluationStatus,
    setFinalContinuationDecision,
    finalizeEvaluation,
    saveEvaluationStore,
    loadEvaluationResult,
    buildSafety,
    escapeHtml,
    eligibleTrials,
    generatePlainText,
    bindEvaluationPanel
  };
});
