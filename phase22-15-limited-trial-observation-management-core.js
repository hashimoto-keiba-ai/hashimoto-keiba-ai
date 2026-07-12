(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2215LimitedTrialObservationManagementCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.limitedTrialObservationManagement.v1";
  const TRIAL_STATUSES = ["draft", "awaiting_start_approval", "approved", "observing", "paused", "stopped", "completed", "cancelled", "expired"];
  const TRIAL_DECISIONS = ["pending", "observation_continue", "observation_pause", "stop_required", "trial_completed", "insufficient_data", "abnormality_detected", "cancelled"];
  const ANOMALY_LEVELS = ["none", "notice", "warning", "critical"];
  const TERMINAL_STATUSES = ["stopped", "completed", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["awaiting_start_approval", "cancelled"],
    awaiting_start_approval: ["approved", "draft", "cancelled"],
    approved: ["observing", "cancelled", "expired"],
    observing: ["paused", "stopped", "completed"],
    paused: ["observing", "stopped", "cancelled"],
    stopped: [],
    completed: [],
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
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function getStorage(storage) {
    if (storage) return storage;
    if (root && root.localStorage) return root.localStorage;
    return null;
  }

  function stableSlug(value) {
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "trial";
  }

  function stableTrialId(plan) {
    return `phase22-15-trial-${stableSlug(plan.planId || plan.targetImprovementRuleId || "plan")}`;
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
      automaticApply: false,
      automaticLearning: false,
      automaticUpdate: false,
      autoExecution: false,
      autoRollback: false,
      publicUrl: false,
      githubPages: false,
      externalApi: false,
      predictionMutation: false,
      bettingMutation: false,
      applicationStatusMutation: false,
      ruleActivation: false
    };
  }

  function normalizePlan(plan = {}) {
    return {
      planId: text(plan.planId),
      name: text(plan.name),
      description: text(plan.description),
      targetApprovalId: text(plan.targetApprovalId),
      targetReviewId: text(plan.targetReviewId),
      targetValidationPlanId: text(plan.targetValidationPlanId),
      targetImprovementRuleId: text(plan.targetImprovementRuleId),
      planStatus: text(plan.planStatus || "draft"),
      executionStatus: text(plan.executionStatus || "not_started"),
      planDecision: text(plan.planDecision || "pending"),
      operator: text(plan.operator),
      checker: text(plan.checker),
      scheduledAt: text(plan.scheduledAt),
      deadlineAt: text(plan.deadlineAt),
      sourceApprovalStatus: text(plan.sourceApprovalStatus || "approved"),
      sourceApplicationStatus: text(plan.sourceApplicationStatus || "not_applied"),
      safety: plan.safety || {}
    };
  }

  function normalizePlanStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      plans: Array.isArray(input.plans) ? input.plans.map(normalizePlan).filter((plan) => plan.planId) : []
    };
  }

  function loadPlanStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { planStore: normalizePlanStore(), parseError: false };
    const raw = targetStorage.getItem(PLAN_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { planStore: normalizePlanStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function sourcePlanReady(plan) {
    return plan && plan.planId
      && plan.planDecision === "ready_for_manual_execution"
      && plan.planStatus === "ready"
      && plan.executionStatus === "not_started"
      && plan.sourceApprovalStatus === "approved"
      && plan.sourceApplicationStatus === "not_applied"
      && safetyOk(plan.safety || buildSafety());
  }

  function readyPlans(planStore) {
    return (planStore.plans || []).filter(sourcePlanReady);
  }

  function safetyOk(safety) {
    const requiredTrue = ["planOnly", "protectedMode", "privateLocal"];
    const requiredFalse = ["automaticApply", "automaticLearning", "automaticUpdate", "autoExecution", "autoRollback", "publicUrl", "githubPages", "externalApi", "predictionMutation", "bettingMutation", "applicationStatusMutation", "ruleActivation"];
    return requiredTrue.every((key) => safety[key] !== false) && requiredFalse.every((key) => safety[key] !== true);
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
      anomalyLevel: ANOMALY_LEVELS.includes(input.anomalyLevel) ? input.anomalyLevel : "none",
      anomalyDetails: text(input.anomalyDetails),
      observer: text(input.observer),
      judgement: text(input.judgement),
      notes: text(input.notes)
    };
  }

  function buildTrialFromPlan(planInput, planStore = {}, savedTrial = {}) {
    const plan = normalizePlan(planInput);
    const trialId = text(savedTrial.trialId) || stableTrialId(plan);
    return {
      trialId,
      sourcePlanId: plan.planId,
      targetApprovalId: plan.targetApprovalId,
      targetImprovementRuleId: plan.targetImprovementRuleId,
      trialName: text(savedTrial.trialName) || `${plan.name || plan.targetImprovementRuleId} 限定試験観測`,
      purpose: text(savedTrial.purpose) || "観測専用シャドーモードで限定試験を記録する",
      scopeType: text(savedTrial.scopeType || "race_keys"),
      targetRaceKeys: splitList(savedTrial.targetRaceKeys),
      targetCourses: splitList(savedTrial.targetCourses),
      targetRaceClasses: splitList(savedTrial.targetRaceClasses),
      targetDistances: splitList(savedTrial.targetDistances),
      targetSurfaceTypes: splitList(savedTrial.targetSurfaceTypes),
      observationStartDate: text(savedTrial.observationStartDate),
      observationEndDate: text(savedTrial.observationEndDate),
      maximumRaceCount: number(savedTrial.maximumRaceCount, 1),
      observedRaceCount: number(savedTrial.observedRaceCount, 0),
      trialStatus: TRIAL_STATUSES.includes(savedTrial.trialStatus) ? savedTrial.trialStatus : "draft",
      trialDecision: TRIAL_DECISIONS.includes(savedTrial.trialDecision) ? savedTrial.trialDecision : "pending",
      operator: text(savedTrial.operator || plan.operator),
      observer: text(savedTrial.observer || plan.checker),
      stopDecisionMaker: text(savedTrial.stopDecisionMaker || plan.checker),
      startedAt: text(savedTrial.startedAt),
      completedAt: text(savedTrial.completedAt),
      cancelledAt: text(savedTrial.cancelledAt),
      stopReason: text(savedTrial.stopReason),
      completionComment: text(savedTrial.completionComment),
      warningLimit: number(savedTrial.warningLimit, 2),
      observations: Array.isArray(savedTrial.observations) ? savedTrial.observations.map(normalizeObservation) : [],
      stopRequests: Array.isArray(savedTrial.stopRequests) ? savedTrial.stopRequests.map(text).filter(Boolean) : [],
      createdAt: text(savedTrial.createdAt),
      updatedAt: text(savedTrial.updatedAt),
      sourcePlanStatus: plan.planStatus,
      sourcePlanDecision: plan.planDecision,
      sourceExecutionStatus: plan.executionStatus,
      createdFromPlanSavedAt: text(planStore.savedAt),
      safety: buildSafety()
    };
  }

  function hasTargetScope(trial) {
    return [trial.targetRaceKeys, trial.targetCourses, trial.targetRaceClasses, trial.targetDistances, trial.targetSurfaceTypes].some((list) => Array.isArray(list) && list.length);
  }

  function isRaceInScope(trial, race = {}) {
    const raceKey = text(race.raceKey || race);
    if (trial.targetRaceKeys.length && !trial.targetRaceKeys.includes(raceKey)) return false;
    if (trial.targetCourses.length && race.course && !trial.targetCourses.includes(text(race.course))) return false;
    if (trial.targetRaceClasses.length && race.raceClass && !trial.targetRaceClasses.includes(text(race.raceClass))) return false;
    if (trial.targetDistances.length && race.distance && !trial.targetDistances.includes(text(race.distance))) return false;
    if (trial.targetSurfaceTypes.length && race.surfaceType && !trial.targetSurfaceTypes.includes(text(race.surfaceType))) return false;
    return true;
  }

  function validateTrial(trialInput) {
    const trial = trialInput || {};
    const errors = [];
    if (!text(trial.trialId)) errors.push("trialIdが不足しています。");
    if (!text(trial.sourcePlanId)) errors.push("sourcePlanIdが不足しています。");
    if (!text(trial.targetApprovalId)) errors.push("targetApprovalIdが不足しています。");
    if (!text(trial.targetImprovementRuleId)) errors.push("targetImprovementRuleIdが不足しています。");
    if (!text(trial.trialName)) errors.push("trialNameが不足しています。");
    if (!text(trial.purpose)) errors.push("purposeが不足しています。");
    if (!TRIAL_STATUSES.includes(trial.trialStatus)) errors.push("trialStatusが不正です。");
    if (!TRIAL_DECISIONS.includes(trial.trialDecision)) errors.push("trialDecisionが不正です。");
    if (!hasTargetScope(trial)) errors.push("対象レースまたは対象条件が不足しています。");
    if (trial.observationStartDate && trial.observationEndDate && trial.observationEndDate < trial.observationStartDate) errors.push("観測終了日が開始日より前です。");
    if (!Number.isInteger(Number(trial.maximumRaceCount)) || Number(trial.maximumRaceCount) <= 0) errors.push("maximumRaceCountは正の整数にしてください。");
    if (trial.sourcePlanDecision !== "ready_for_manual_execution") errors.push("元計画のdecisionResultはready_for_manual_executionが必要です。");
    if (trial.sourcePlanStatus !== "ready") errors.push("元計画のplanStatusはreadyが必要です。");
    if (trial.sourceExecutionStatus !== "not_started") errors.push("元計画のexecutionStatusはnot_startedが必要です。");
    if (!safetyOk(trial.safety || {})) errors.push("安全フラグが無効です。");
    return { ok: errors.length === 0, errors };
  }

  function evaluateStopRequests(trialInput, planStore) {
    const trial = trialInput || {};
    const reasons = [];
    const observations = Array.isArray(trial.observations) ? trial.observations : [];
    if (observations.some((item) => item.anomalyLevel === "critical")) reasons.push("critical異常があります。");
    if (observations.filter((item) => item.anomalyLevel === "warning").length >= number(trial.warningLimit, 2)) reasons.push("warning異常が設定上限以上です。");
    if (observations.length > number(trial.maximumRaceCount, 0)) reasons.push("最大対象レース数を超過しています。");
    if (observations.some((item) => !isRaceInScope(trial, item.raceKey))) reasons.push("対象外レースへの観測登録があります。");
    if (observations.some((item) => trial.observationStartDate && item.observedAt && item.observedAt.slice(0, 10) < trial.observationStartDate)) reasons.push("観測期間外の試験を検知しました。");
    if (observations.some((item) => trial.observationEndDate && item.observedAt && item.observedAt.slice(0, 10) > trial.observationEndDate)) reasons.push("観測期間外の試験を検知しました。");
    const plan = (planStore && planStore.plans || []).find((item) => item.planId === trial.sourcePlanId);
    if (!plan || !sourcePlanReady(plan)) reasons.push("Phase22-14の元計画がready_for_manual_executionではありません。");
    if (!safetyOk(trial.safety || {})) reasons.push("安全フラグが無効です。");
    return Array.from(new Set(reasons));
  }

  function addObservation(trialInput, observationInput, planStore) {
    const trial = { ...trialInput, observations: [...(trialInput.observations || [])] };
    const observation = normalizeObservation(observationInput, trial.observations.length);
    if (!isRaceInScope(trial, observation.raceKey)) return { added: false, reason: "out_of_scope", trial };
    if (trial.observations.some((item) => item.raceKey === observation.raceKey)) return { added: false, reason: "duplicate_race", trial };
    if (trial.observations.length >= number(trial.maximumRaceCount, 0)) return { added: false, reason: "maximum_exceeded", trial: { ...trial, stopRequests: evaluateStopRequests({ ...trial, observations: [...trial.observations, observation] }, planStore) } };
    trial.observations.push(observation);
    trial.observedRaceCount = trial.observations.length;
    const stopRequests = evaluateStopRequests(trial, planStore);
    return { added: true, stopRequired: stopRequests.length > 0, trial: { ...trial, stopRequests, trialDecision: stopRequests.length ? "stop_required" : trial.trialDecision } };
  }

  function canTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] || []).includes(to);
  }

  function transitionTrial(trial, toStatus) {
    if (!TRIAL_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", trial };
    if (!canTransition(trial.trialStatus, toStatus)) return { transitioned: false, reason: "invalid_transition", trial };
    return { transitioned: true, trial: { ...trial, trialStatus: toStatus, safety: buildSafety() } };
  }

  function generateTrialsFromPlans(planStore, savedTrials = []) {
    const savedByPlan = new Map((savedTrials || []).map((trial) => [text(trial.sourcePlanId), trial]));
    return readyPlans(planStore)
      .map((plan) => buildTrialFromPlan(plan, planStore, savedByPlan.get(plan.planId) || {}))
      .sort((a, b) => a.trialId.localeCompare(b.trialId));
  }

  function isValidSavedStore(input) {
    return Boolean(input && typeof input === "object" && (!input.trials || Array.isArray(input.trials)));
  }

  function normalizeTrialStore(input = {}, planStore = normalizePlanStore()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2214SavedAt: text(input.sourcePhase2214SavedAt || planStore.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || planStore.sourceRaceKey),
      trials: generateTrialsFromPlans(planStore, input.trials || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      sourceSnapshot: input.sourceSnapshot || { planIds: readyPlans(planStore).map((plan) => plan.planId).sort(), savedAt: planStore.savedAt }
    };
  }

  function loadSavedTrialStore(storage, planStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeTrialStore({}, planStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeTrialStore({}, planStore), parseError: true, rejected: true };
    if (parsed && !isValidSavedStore(parsed)) return { store: normalizeTrialStore({}, planStore), parseError: false, rejected: true };
    return { store: normalizeTrialStore(parsed || {}, planStore), parseError: false, rejected: false };
  }

  function buildWarnings({ planStore = normalizePlanStore(), store = normalizeTrialStore({}, planStore), parseErrors = [] } = {}) {
    const warnings = [];
    if (!readyPlans(planStore).length) warnings.push({ level: "warning", message: "Phase22-14のready_for_manual_execution / ready / not_started計画がありません。" });
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ level: "error", message }));
    (store.trials || []).forEach((trial) => {
      validateTrial(trial).errors.forEach((message) => warnings.push({ level: "error", message: `${trial.trialId}: ${message}` }));
      evaluateStopRequests(trial, planStore).forEach((message) => warnings.push({ level: "warning", message: `${trial.trialId}: ${message}` }));
    });
    return warnings;
  }

  function buildPayload(store, now = new Date()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: now.toISOString(),
      sourcePhase2214SavedAt: text(store.sourcePhase2214SavedAt),
      sourceRaceKey: text(store.sourceRaceKey),
      trials: (store.trials || []).map((trial) => ({ ...trial, safety: buildSafety() })).sort((a, b) => a.trialId.localeCompare(b.trialId)),
      finalized: Boolean(store.finalized),
      finalizedAt: text(store.finalizedAt),
      confirmerName: text(store.confirmerName),
      sourceSnapshot: store.sourceSnapshot || {}
    };
  }

  function saveTrialStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(buildPayload(store, now)));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function deleteSavedTrialStore(storage, confirmDelete) {
    if (confirmDelete && !confirmDelete()) return { deleted: false, reason: "cancelled" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function generatePlainText(store) {
    const lines = ["Phase22-15 限定試験適用・観測管理", `保存キー: ${STORAGE_KEY}`, "観測専用・シャドーモード / 本番予想・買い目には未反映"];
    (store.trials || []).forEach((trial) => lines.push("", `${trial.trialId} / ${trial.trialName}`, `状態: ${trial.trialStatus} / 判断: ${trial.trialDecision}`, `観測: ${trial.observedRaceCount}/${trial.maximumRaceCount}`, `停止要求: ${(trial.stopRequests || []).join(" / ") || "なし"}`));
    return lines.join("\n");
  }

  function createElement(doc, tag, className, textValue) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function bindLimitedTrialPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-limited-trial-observation-core");
    if (!rootNode || rootNode.dataset.phase2215Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2215Bound = "true";
    const storage = getStorage(options.storage);
    let planLoad = loadPlanStore(storage);
    let savedLoad = loadSavedTrialStore(storage, planLoad.planStore);
    let state = { planLoad, savedLoad, store: savedLoad.store };
    const nodes = {
      message: doc.querySelector("#phase22-trial-message"),
      finalizedStatus: doc.querySelector("#phase22-trial-finalized-status"),
      summary: doc.querySelector("#phase22-trial-summary"),
      warningList: doc.querySelector("#phase22-trial-warning-list"),
      list: doc.querySelector("#phase22-trial-list"),
      confirmer: doc.querySelector("#phase22-trial-confirmer"),
      textOutput: doc.querySelector("#phase22-trial-text-output")
    };

    function setMessage(message, kind = "info") {
      if (!nodes.message) return;
      nodes.message.textContent = message;
      nodes.message.dataset.kind = kind;
    }

    function renderWarnings() {
      if (!nodes.warningList) return;
      nodes.warningList.replaceChildren();
      buildWarnings({ planStore: state.planLoad.planStore, store: state.store, parseErrors: [state.planLoad.parseError ? "破損データ読み込み: Phase22-14" : "", state.savedLoad.parseError || state.savedLoad.rejected ? "破損データ読み込み: Phase22-15" : ""] })
        .forEach((warning) => nodes.warningList.appendChild(createElement(doc, "div", `phase22-trial-warning ${warning.level}`, warning.message)));
    }

    function renderList() {
      if (!nodes.list) return;
      nodes.list.replaceChildren();
      const table = createElement(doc, "div", "phase22-trial-table");
      const headers = ["ID", "元計画", "改善ルール", "状態", "判断", "対象", "期間", "観測数", "異常", "停止要求", "観測専用"];
      const head = createElement(doc, "div", "phase22-trial-row head");
      headers.forEach((label) => head.appendChild(createElement(doc, "span", "", label)));
      table.appendChild(head);
      (state.store.trials || []).forEach((trial) => {
        const row = createElement(doc, "div", "phase22-trial-row");
        row.appendChild(createElement(doc, "span", "", trial.trialId));
        row.appendChild(createElement(doc, "span", "", trial.sourcePlanId));
        row.appendChild(createElement(doc, "span", "", trial.targetImprovementRuleId));
        row.appendChild(createElement(doc, "span", "", trial.trialStatus));
        row.appendChild(createElement(doc, "span", "", trial.trialDecision));
        row.appendChild(createElement(doc, "span", "", trial.targetRaceKeys.join(",") || trial.targetCourses.join(",")));
        row.appendChild(createElement(doc, "span", "", `${trial.observationStartDate || "--"}〜${trial.observationEndDate || "--"}`));
        row.appendChild(createElement(doc, "span", "", `${trial.observedRaceCount}/${trial.maximumRaceCount}`));
        row.appendChild(createElement(doc, "span", "", String((trial.observations || []).filter((item) => item.anomalyLevel !== "none").length)));
        row.appendChild(createElement(doc, "span", "", (trial.stopRequests || []).length ? "あり" : "なし"));
        row.appendChild(createElement(doc, "span", "", "本番予想・買い目には未反映"));
        table.appendChild(row);
      });
      nodes.list.appendChild(table);
    }

    function render() {
      if (nodes.summary) nodes.summary.textContent = `候補 ${readyPlans(state.planLoad.planStore).length}件 / 試験 ${(state.store.trials || []).length}件 / 停止要求 ${(state.store.trials || []).filter((trial) => (trial.stopRequests || []).length).length}件`;
      if (nodes.finalizedStatus) nodes.finalizedStatus.textContent = state.store.finalized ? `確定済み ${state.store.finalizedAt}` : "未確定";
      renderWarnings();
      renderList();
    }

    function reload() {
      planLoad = loadPlanStore(storage);
      savedLoad = loadSavedTrialStore(storage, planLoad.planStore);
      state = { planLoad, savedLoad, store: savedLoad.store };
      setMessage("Phase22-14のready計画から限定試験候補を再生成しました。", "success");
      render();
    }

    function save() {
      const result = saveTrialStore(storage, state.store);
      setMessage(result.saved ? "Phase22-15観測管理データを保存しました。" : "保存できませんでした。", result.saved ? "success" : "error");
    }

    function restore() {
      state.savedLoad = loadSavedTrialStore(storage, state.planLoad.planStore);
      state.store = state.savedLoad.store;
      setMessage(state.savedLoad.rejected ? "Phase22-15保存データが不正なため初期状態で復元しました。" : "Phase22-15保存データを復元しました。", state.savedLoad.rejected ? "warning" : "success");
      render();
    }

    function reset() {
      const confirmReset = options.confirmReset || (() => root && root.confirm && root.confirm("Phase22-15の保存データだけを削除します。Phase22-1〜22-14は削除しません。よろしいですか？"));
      const result = deleteSavedTrialStore(storage, confirmReset);
      if (result.deleted) reload();
      setMessage(result.deleted ? "Phase22-15のみ初期化しました。" : "初期化を取り消しました。", result.deleted ? "success" : "warning");
    }

    function outputText() {
      if (nodes.textOutput) nodes.textOutput.value = generatePlainText(state.store);
      setMessage("プレーンテキストを生成しました。", "success");
    }

    const actions = {
      "#phase22-trial-reload": reload,
      "#phase22-trial-save": save,
      "#phase22-trial-restore": restore,
      "#phase22-trial-reset": reset,
      "#phase22-trial-text": outputText
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, state, actions, nodes };
  }

  if (root && root.document) {
    const start = () => bindLimitedTrialPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    PLAN_STORAGE_KEY,
    STORAGE_KEY,
    TRIAL_STATUSES,
    TRIAL_DECISIONS,
    ANOMALY_LEVELS,
    normalizePlanStore,
    loadPlanStore,
    readyPlans,
    sourcePlanReady,
    stableTrialId,
    buildTrialFromPlan,
    validateTrial,
    evaluateStopRequests,
    addObservation,
    isRaceInScope,
    canTransition,
    transitionTrial,
    generateTrialsFromPlans,
    normalizeTrialStore,
    loadSavedTrialStore,
    buildWarnings,
    buildPayload,
    saveTrialStore,
    deleteSavedTrialStore,
    generatePlainText,
    bindLimitedTrialPanel,
    buildSafety
  };
});
