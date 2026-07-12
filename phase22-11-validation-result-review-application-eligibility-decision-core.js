(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2211ValidationResultReviewDecisionCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const VALIDATION_PLAN_STORAGE_KEY = "hashimotoKeibaAi.phase22.improvementRuleValidationPlan.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.validationResultReviewApplicationDecision.v1";
  const PROTECTED_STORAGE_KEYS = [VALIDATION_PLAN_STORAGE_KEY, STORAGE_KEY];
  const REVIEW_STATUSES = ["draft", "under_review", "returned", "completed", "cancelled", "expired"];
  const APPLICATION_DECISIONS = ["pending", "eligible", "revalidation_required", "on_hold", "rejected"];
  const VALIDATION_STATUSES = ["draft", "ready", "running", "paused", "completed", "cancelled", "expired"];
  const JUDGEMENT_RESULTS = ["pending", "passed", "failed", "inconclusive", "rejected"];
  const ALLOWED_REVIEW_TRANSITIONS = {
    draft: ["under_review", "cancelled", "expired"],
    under_review: ["returned", "completed", "cancelled"],
    returned: ["under_review", "cancelled"],
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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "review";
  }

  function stableReviewId(plan) {
    return `phase22-11-review-${stableSlug(plan.planId || plan.targetRuleId || plan.name || "plan")}`;
  }

  function normalizeList(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean);
    return text(value) ? text(value).split(",").map(text).filter(Boolean) : [];
  }

  function normalizeValidationPlan(plan = {}) {
    return {
      planId: text(plan.planId),
      name: text(plan.name),
      description: text(plan.description),
      targetRuleId: text(plan.targetRuleId),
      validationStatus: VALIDATION_STATUSES.includes(plan.validationStatus) ? plan.validationStatus : "draft",
      judgementResult: JUDGEMENT_RESULTS.includes(plan.judgementResult) ? plan.judgementResult : "pending",
      judgementReason: text(plan.judgementReason),
      comparison: {
        baseline: text(plan.comparison && plan.comparison.baseline),
        candidate: text(plan.comparison && plan.comparison.candidate)
      },
      metrics: normalizeList(plan.metrics),
      passCriteria: text(plan.passCriteria),
      failCriteria: text(plan.failCriteria),
      evaluationValue: text(plan.evaluationValue),
      criteriaValue: text(plan.criteriaValue),
      differenceValue: text(plan.differenceValue),
      sampleSizeCondition: text(plan.sampleSizeCondition),
      validationMemo: text(plan.validationMemo),
      validationStartDate: text(plan.validationStartDate),
      plannedEndDate: text(plan.plannedEndDate)
    };
  }

  function normalizeValidationPlanStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      plans: Array.isArray(input.plans) ? input.plans.map(normalizeValidationPlan).filter((plan) => plan.planId) : []
    };
  }

  function loadValidationPlanStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { validationPlanStore: normalizeValidationPlanStore(), parseError: false };
    const raw = targetStorage.getItem(VALIDATION_PLAN_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { validationPlanStore: normalizeValidationPlanStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function normalizeHistory(input) {
    return Array.isArray(input)
      ? input.map((item) => ({
        reviewedAt: text(item.reviewedAt),
        reviewer: text(item.reviewer),
        reviewStatus: REVIEW_STATUSES.includes(item.reviewStatus) ? item.reviewStatus : "under_review",
        applicationDecision: APPLICATION_DECISIONS.includes(item.applicationDecision) ? item.applicationDecision : "pending",
        comment: text(item.comment)
      })).filter((item) => item.reviewedAt || item.reviewer || item.comment)
      : [];
  }

  function buildSafety(savedSafety = {}) {
    return {
      planOnly: true,
      protectedMode: true,
      privateLocal: true,
      automaticApply: false,
      automaticLearning: false,
      automaticUpdate: false,
      autoExecution: false,
      publicUrl: false,
      githubPages: false,
      externalApi: false
    };
  }

  function buildReviewFromPlan(planInput, validationPlanStore = {}, savedReview = {}) {
    const plan = normalizeValidationPlan(planInput);
    const reviewId = text(savedReview.reviewId) || stableReviewId(plan);
    const reviewStatus = REVIEW_STATUSES.includes(savedReview.reviewStatus) ? savedReview.reviewStatus : "draft";
    const applicationDecision = APPLICATION_DECISIONS.includes(savedReview.applicationDecision) ? savedReview.applicationDecision : "pending";
    return {
      reviewId,
      name: text(savedReview.name) || `${plan.name || plan.planId} レビュー`,
      description: text(savedReview.description) || `${plan.description || plan.planId} の検証結果を人が確認し、適用候補かどうかだけを判定する`,
      targetValidationPlanId: plan.planId,
      targetImprovementRuleId: text(savedReview.targetImprovementRuleId) || plan.targetRuleId,
      validationStatusRef: plan.validationStatus,
      judgementResultRef: plan.judgementResult,
      comparison: {
        baseline: text(savedReview.comparison && savedReview.comparison.baseline) || plan.comparison.baseline,
        candidate: text(savedReview.comparison && savedReview.comparison.candidate) || plan.comparison.candidate
      },
      evaluation: {
        metrics: normalizeList((savedReview.evaluation && savedReview.evaluation.metrics) || plan.metrics),
        measuredValue: text(savedReview.evaluation && savedReview.evaluation.measuredValue) || plan.evaluationValue,
        criteriaValue: text(savedReview.evaluation && savedReview.evaluation.criteriaValue) || plan.criteriaValue,
        differenceValue: text(savedReview.evaluation && savedReview.evaluation.differenceValue) || plan.differenceValue,
        sampleCount: text(savedReview.evaluation && savedReview.evaluation.sampleCount) || plan.sampleSizeCondition
      },
      passCriteria: text(savedReview.passCriteria) || plan.passCriteria,
      failCriteria: text(savedReview.failCriteria) || plan.failCriteria,
      inconclusiveFactors: text(savedReview.inconclusiveFactors),
      resultSummary: text(savedReview.resultSummary) || plan.judgementReason,
      advantages: text(savedReview.advantages),
      problems: text(savedReview.problems),
      risks: text(savedReview.risks),
      notes: text(savedReview.notes) || plan.validationMemo,
      reviewer: text(savedReview.reviewer),
      reviewedAt: text(savedReview.reviewedAt),
      reviewComment: text(savedReview.reviewComment),
      history: normalizeHistory(savedReview.history),
      reviewStatus,
      applicationDecision,
      decisionReason: text(savedReview.decisionReason),
      revalidationReason: text(savedReview.revalidationReason),
      revalidationConditions: text(savedReview.revalidationConditions),
      holdReason: text(savedReview.holdReason),
      recheckConditions: text(savedReview.recheckConditions),
      rejectionReason: text(savedReview.rejectionReason),
      createdFromValidationSavedAt: text(validationPlanStore.savedAt),
      sourceValidationFinalized: Boolean(validationPlanStore.finalized),
      safety: buildSafety(savedReview.safety)
    };
  }

  function hasHumanReview(review) {
    return Boolean(text(review.reviewer) && text(review.reviewedAt) && text(review.reviewComment)) || normalizeHistory(review.history).length > 0;
  }

  function validateReview(reviewInput) {
    const review = reviewInput || {};
    const errors = [];
    if (!text(review.reviewId)) errors.push("レビューIDが不足しています。");
    if (!text(review.name)) errors.push("名称が不足しています。");
    if (!text(review.description)) errors.push("説明が不足しています。");
    if (!text(review.targetValidationPlanId)) errors.push("対象検証計画IDが不足しています。");
    if (!text(review.targetImprovementRuleId)) errors.push("対象改善ルールIDが不足しています。");
    if (!REVIEW_STATUSES.includes(review.reviewStatus)) errors.push("レビュー状態が不正です。");
    if (!APPLICATION_DECISIONS.includes(review.applicationDecision)) errors.push("適用可否判定が不正です。");
    if (!VALIDATION_STATUSES.includes(review.validationStatusRef)) errors.push("対象検証状態が不正です。");
    if (!JUDGEMENT_RESULTS.includes(review.judgementResultRef)) errors.push("対象判定結果が不正です。");
    if (!review.comparison || !text(review.comparison.baseline) || !text(review.comparison.candidate)) errors.push("baseline / candidate比較が不足しています。");
    if (!review.evaluation || !Array.isArray(review.evaluation.metrics) || review.evaluation.metrics.length === 0) errors.push("評価指標が不足しています。");
    if (!text(review.passCriteria)) errors.push("合格基準が不足しています。");
    if (!text(review.failCriteria)) errors.push("失格基準が不足しています。");
    if (review.reviewStatus === "completed" && review.applicationDecision === "pending") errors.push("pendingのままcompletedにはできません。");
    if (review.applicationDecision !== "pending" && review.validationStatusRef !== "completed") errors.push("Phase22-10の検証状態がcompletedでないため最終判定できません。");
    if (review.applicationDecision !== "pending" && review.judgementResultRef === "pending") errors.push("Phase22-10の判定結果がpendingのため最終判定できません。");
    if (review.applicationDecision === "eligible") {
      if (review.validationStatusRef !== "completed") errors.push("eligibleには対象検証状態completedが必要です。");
      if (review.judgementResultRef !== "passed") errors.push("failed / rejected / inconclusive / pendingの検証結果はeligibleにできません。");
      if (!hasHumanReview(review)) errors.push("eligibleには人によるレビュー記録が必要です。");
    }
    if (review.applicationDecision === "revalidation_required" && (!text(review.revalidationReason) || !text(review.revalidationConditions))) errors.push("revalidation_requiredには再検証理由と再検証条件が必要です。");
    if (review.applicationDecision === "on_hold" && (!text(review.holdReason) || !text(review.recheckConditions))) errors.push("on_holdには保留理由と再確認条件が必要です。");
    if (review.applicationDecision === "rejected" && !text(review.rejectionReason)) errors.push("rejectedには却下理由が必要です。");
    if (review.reviewedAt && Number.isNaN(Date.parse(review.reviewedAt))) errors.push("レビュー日時が不正です。");
    const safety = review.safety || {};
    if (safety.automaticApply || safety.automaticLearning || safety.automaticUpdate || safety.autoExecution || safety.publicUrl || safety.githubPages || safety.externalApi) errors.push("安全条件に反する自動適用・外部公開フラグがあります。");
    return { ok: errors.length === 0, errors };
  }

  function canTransition(from, to) {
    return (ALLOWED_REVIEW_TRANSITIONS[from] || []).includes(to);
  }

  function transitionReview(review, toStatus) {
    if (!REVIEW_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", review };
    if (!canTransition(review.reviewStatus, toStatus)) return { transitioned: false, reason: "invalid_transition", review };
    return { transitioned: true, review: { ...review, reviewStatus: toStatus } };
  }

  function canEditReview(review) {
    return !["completed", "cancelled", "expired"].includes(review.reviewStatus);
  }

  function applyReviewEdit(review, changes) {
    if (!canEditReview(review)) return { updated: false, reason: "locked_review", review };
    return { updated: true, review: { ...review, ...changes, safety: buildSafety(review.safety) } };
  }

  function generateReviewsFromPlans(validationPlanStore, savedReviews = []) {
    const savedByPlan = new Map((savedReviews || []).map((review) => [text(review.targetValidationPlanId), review]));
    return (validationPlanStore.plans || [])
      .filter((plan) => plan.planId)
      .map((plan) => buildReviewFromPlan(plan, validationPlanStore, savedByPlan.get(plan.planId) || {}))
      .sort((a, b) => a.reviewId.localeCompare(b.reviewId));
  }

  function isValidSavedStore(input) {
    return Boolean(input && typeof input === "object" && (!input.reviews || Array.isArray(input.reviews)));
  }

  function normalizeReviewStore(input = {}, validationPlanStore = normalizeValidationPlanStore()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2210SavedAt: text(input.sourcePhase2210SavedAt || validationPlanStore.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || validationPlanStore.sourceRaceKey),
      reviews: generateReviewsFromPlans(validationPlanStore, input.reviews || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      validationSnapshot: input.validationSnapshot || snapshotValidationPlans(validationPlanStore)
    };
  }

  function snapshotValidationPlans(validationPlanStore) {
    return {
      savedAt: validationPlanStore.savedAt,
      finalized: validationPlanStore.finalized,
      planIds: (validationPlanStore.plans || []).map((plan) => plan.planId).sort()
    };
  }

  function loadSavedReviewStore(storage, validationPlanStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeReviewStore({}, validationPlanStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeReviewStore({}, validationPlanStore), parseError: true, rejected: true };
    if (parsed && !isValidSavedStore(parsed)) return { store: normalizeReviewStore({}, validationPlanStore), parseError: false, rejected: true };
    return { store: normalizeReviewStore(parsed || {}, validationPlanStore), parseError: false, rejected: false };
  }

  function detectPhase2210Changes(validationPlanStore, store) {
    const snapshot = store.validationSnapshot || {};
    const currentIds = (validationPlanStore.plans || []).map((plan) => plan.planId).sort().join("|");
    const savedIds = (snapshot.planIds || []).slice().sort().join("|");
    return Boolean(snapshot.savedAt && (snapshot.savedAt !== validationPlanStore.savedAt || savedIds !== currentIds || Boolean(snapshot.finalized) !== Boolean(validationPlanStore.finalized)));
  }

  function buildWarnings({ validationPlanStore = normalizeValidationPlanStore(), store = normalizeReviewStore({}, validationPlanStore), parseErrors = [] } = {}) {
    const warnings = [];
    if (!validationPlanStore.plans.length) warnings.push({ level: "warning", message: "Phase22-10検証計画データがありません。" });
    if (!validationPlanStore.finalized) warnings.push({ level: "notice", message: "Phase22-10検証計画は未確定です。レビュー生成はできますが最終判定前に確認してください。" });
    if (detectPhase2210Changes(validationPlanStore, store)) warnings.push({ level: "warning", message: "Phase22-10データ更新の可能性があります。再読込してください。" });
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ level: "error", message }));
    (store.reviews || []).forEach((review) => {
      validateReview(review).errors.forEach((message) => warnings.push({ level: "error", message: `${review.reviewId}: ${message}` }));
    });
    if ((store.reviews || []).some((review) => review.applicationDecision === "eligible")) warnings.push({ level: "notice", message: "eligibleは適用候補判定のみです。未適用・自動反映なしです。" });
    return warnings;
  }

  function buildPayload(store, now = new Date()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: now.toISOString(),
      sourcePhase2210SavedAt: text(store.sourcePhase2210SavedAt),
      sourceRaceKey: text(store.sourceRaceKey),
      reviews: (store.reviews || []).map((review) => ({ ...review, safety: buildSafety(review.safety) })).sort((a, b) => a.reviewId.localeCompare(b.reviewId)),
      finalized: Boolean(store.finalized),
      finalizedAt: text(store.finalizedAt),
      confirmerName: text(store.confirmerName),
      validationSnapshot: store.validationSnapshot || {}
    };
  }

  function saveReviewStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(buildPayload(store, now)));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function deleteSavedReviewStore(storage, confirmDelete) {
    if (confirmDelete && !confirmDelete()) return { deleted: false, reason: "cancelled" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function canFinalize(store) {
    const errors = [];
    (store.reviews || []).forEach((review) => {
      const result = validateReview(review);
      if (!result.ok) errors.push(...result.errors.map((message) => `${review.reviewId}: ${message}`));
    });
    if (!(store.reviews || []).length) errors.push("レビュー案件がありません。");
    if ((store.reviews || []).some((review) => review.reviewStatus !== "completed")) errors.push("completedでないレビューがあります。");
    return { ok: errors.length === 0, errors };
  }

  function finalizeReviewStore(store, confirmerName, now = new Date()) {
    const result = canFinalize(store);
    if (!result.ok) return { finalized: false, errors: result.errors, store };
    return {
      finalized: true,
      errors: [],
      store: { ...store, finalized: true, finalizedAt: now.toISOString(), confirmerName: text(confirmerName) }
    };
  }

  function unfinalizeReviewStore(store) {
    return { ...store, finalized: false, finalizedAt: "" };
  }

  function generatePlainText(store) {
    const lines = [];
    lines.push("Phase22-11 検証結果レビュー・適用可否判定");
    lines.push(`保存キー: ${STORAGE_KEY}`);
    lines.push(`確定: ${store.finalized ? "yes" : "no"}`);
    lines.push("eligibleでも未適用・自動反映なし");
    (store.reviews || []).forEach((review) => {
      lines.push("");
      lines.push(`${review.reviewId} / ${review.name}`);
      lines.push(`検証計画: ${review.targetValidationPlanId}`);
      lines.push(`改善ルール: ${review.targetImprovementRuleId}`);
      lines.push(`検証状態: ${review.validationStatusRef} / 判定: ${review.judgementResultRef}`);
      lines.push(`レビュー状態: ${review.reviewStatus} / 適用可否: ${review.applicationDecision}`);
      lines.push(`baseline: ${review.comparison.baseline}`);
      lines.push(`candidate: ${review.comparison.candidate}`);
      lines.push(`評価: ${review.evaluation.measuredValue || "未設定"} / 基準: ${review.evaluation.criteriaValue || "未設定"} / 差分: ${review.evaluation.differenceValue || "未設定"}`);
      lines.push(`コメント: ${review.reviewComment || "未設定"}`);
    });
    return lines.join("\n");
  }

  function createElement(doc, tag, className, textValue) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function bindReviewDecisionPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-validation-result-review-application-decision-core");
    if (!rootNode || rootNode.dataset.phase2211Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2211Bound = "true";
    const storage = getStorage(options.storage);
    const nodes = {
      message: doc.querySelector("#phase22-review-message"),
      finalizedStatus: doc.querySelector("#phase22-review-finalized-status"),
      summary: doc.querySelector("#phase22-review-summary"),
      warningList: doc.querySelector("#phase22-review-warning-list"),
      list: doc.querySelector("#phase22-review-list"),
      confirmer: doc.querySelector("#phase22-review-confirmer"),
      textOutput: doc.querySelector("#phase22-review-text-output")
    };
    const validationLoad = loadValidationPlanStore(storage);
    let savedLoad = loadSavedReviewStore(storage, validationLoad.validationPlanStore);
    let state = { validationLoad, savedLoad, store: savedLoad.store };

    function setMessage(message, kind = "info") {
      if (!nodes.message) return;
      nodes.message.textContent = message;
      nodes.message.dataset.kind = kind;
    }

    function renderWarnings() {
      if (!nodes.warningList) return;
      nodes.warningList.replaceChildren();
      buildWarnings({
        validationPlanStore: state.validationLoad.validationPlanStore,
        store: state.store,
        parseErrors: [
          state.validationLoad.parseError ? "破損データ読み込み: Phase22-10" : "",
          state.savedLoad.parseError || state.savedLoad.rejected ? "破損データ読み込み: Phase22-11" : ""
        ]
      }).forEach((warning) => nodes.warningList.appendChild(createElement(doc, "div", `phase22-review-warning ${warning.level}`, warning.message)));
    }

    function updateField(reviewId, field, value) {
      const reviews = (state.store.reviews || []).map((review) => {
        if (review.reviewId !== reviewId || !canEditReview(review)) return review;
        const next = { ...review };
        if (["measuredValue", "criteriaValue", "differenceValue", "sampleCount"].includes(field)) next.evaluation = { ...next.evaluation, [field]: value };
        else next[field] = value;
        next.safety = buildSafety(next.safety);
        return next;
      });
      state.store = { ...state.store, reviews };
      render();
    }

    function renderList() {
      if (!nodes.list) return;
      nodes.list.replaceChildren();
      const table = createElement(doc, "div", "phase22-review-table");
      const headers = ["ID", "検証", "検証判定", "レビュー状態", "適用可否", "担当者", "日時", "コメント", "理由", "再検証", "再検証条件", "保留", "再確認条件", "却下", "評価値", "基準", "差分", "未適用"];
      const head = createElement(doc, "div", "phase22-review-row head");
      headers.forEach((label) => head.appendChild(createElement(doc, "span", "", label)));
      table.appendChild(head);
      (state.store.reviews || []).forEach((review) => {
        const row = createElement(doc, "div", "phase22-review-row");
        row.appendChild(createElement(doc, "span", "", review.reviewId));
        row.appendChild(createElement(doc, "span", "", review.targetValidationPlanId));
        row.appendChild(createElement(doc, "span", "", `${review.validationStatusRef} / ${review.judgementResultRef}`));
        const status = createElement(doc, "select");
        REVIEW_STATUSES.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === review.reviewStatus;
          status.appendChild(option);
        });
        status.disabled = !canEditReview(review);
        status.addEventListener("change", () => updateField(review.reviewId, "reviewStatus", status.value));
        row.appendChild(status);
        const decision = createElement(doc, "select");
        APPLICATION_DECISIONS.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === review.applicationDecision;
          decision.appendChild(option);
        });
        decision.disabled = !canEditReview(review);
        decision.addEventListener("change", () => updateField(review.reviewId, "applicationDecision", decision.value));
        row.appendChild(decision);
        ["reviewer", "reviewedAt", "reviewComment", "decisionReason", "revalidationReason", "revalidationConditions", "holdReason", "recheckConditions", "rejectionReason", "measuredValue", "criteriaValue", "differenceValue"].forEach((field) => {
          const input = createElement(doc, "input");
          input.value = review.evaluation && field in review.evaluation ? review.evaluation[field] : review[field] || "";
          input.disabled = !canEditReview(review);
          input.addEventListener("input", () => updateField(review.reviewId, field, input.value));
          row.appendChild(input);
        });
        row.appendChild(createElement(doc, "span", "", "未適用・自動反映なし"));
        table.appendChild(row);
      });
      nodes.list.appendChild(table);
    }

    function render() {
      if (nodes.summary) nodes.summary.textContent = `検証計画 ${(state.validationLoad.validationPlanStore.plans || []).length}件 / レビュー ${(state.store.reviews || []).length}件 / eligible ${(state.store.reviews || []).filter((review) => review.applicationDecision === "eligible").length}件`;
      if (nodes.finalizedStatus) {
        nodes.finalizedStatus.textContent = state.store.finalized ? `確定済み ${state.store.finalizedAt}` : "未確定";
        nodes.finalizedStatus.dataset.kind = state.store.finalized ? "success" : "warning";
      }
      renderWarnings();
      renderList();
    }

    function reload() {
      state.validationLoad = loadValidationPlanStore(storage);
      state.savedLoad = loadSavedReviewStore(storage, state.validationLoad.validationPlanStore);
      state.store = state.savedLoad.store;
      setMessage("Phase22-10検証計画からレビュー案件を再生成しました。", "success");
      render();
    }

    function save() {
      state.store = { ...state.store, confirmerName: nodes.confirmer ? nodes.confirmer.value : state.store.confirmerName };
      const result = saveReviewStore(storage, state.store);
      setMessage(result.saved ? "Phase22-11レビュー判定データを保存しました。" : result.reason === "quota_exceeded" ? "localStorageの容量が不足しているため保存できませんでした。古い保存データを整理してから再度保存してください。" : "保存できませんでした。", result.saved ? "success" : "error");
    }

    function restore() {
      state.savedLoad = loadSavedReviewStore(storage, state.validationLoad.validationPlanStore);
      state.store = state.savedLoad.store;
      setMessage(state.savedLoad.parseError || state.savedLoad.rejected ? "Phase22-11保存データが不正なため初期状態で復元しました。" : "Phase22-11保存データを復元しました。", state.savedLoad.parseError || state.savedLoad.rejected ? "warning" : "success");
      render();
    }

    function reset() {
      const confirmReset = options.confirmReset || (() => root && root.confirm && root.confirm("Phase22-11の保存データだけを削除します。Phase22-1〜22-10は削除しません。よろしいですか？"));
      const result = deleteSavedReviewStore(storage, confirmReset);
      if (result.deleted) reload();
      setMessage(result.deleted ? "Phase22-11のみ初期化しました。" : "初期化を取り消しました。", result.deleted ? "success" : "warning");
    }

    function finalize() {
      const result = finalizeReviewStore(state.store, nodes.confirmer ? nodes.confirmer.value : "");
      if (!result.finalized) {
        setMessage(`確定できません: ${result.errors[0] || "未確認項目があります。"}`, "error");
        render();
        return;
      }
      state.store = result.store;
      setMessage("Phase22-11レビュー判定を確定しました。自動適用は行いません。", "success");
      render();
    }

    function unlock() {
      state.store = unfinalizeReviewStore(state.store);
      setMessage("確定解除しました。自動適用は行いません。", "warning");
      render();
    }

    function outputText() {
      if (nodes.textOutput) nodes.textOutput.value = generatePlainText(state.store);
      setMessage("プレーンテキストを生成しました。", "success");
    }

    const actions = {
      "#phase22-review-reload": reload,
      "#phase22-review-save": save,
      "#phase22-review-restore": restore,
      "#phase22-review-reset": reset,
      "#phase22-review-finalize": finalize,
      "#phase22-review-unlock": unlock,
      "#phase22-review-text": outputText
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, state, actions, nodes };
  }

  if (root && root.document) {
    const start = () => bindReviewDecisionPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    VALIDATION_PLAN_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    REVIEW_STATUSES,
    APPLICATION_DECISIONS,
    normalizeValidationPlanStore,
    loadValidationPlanStore,
    stableReviewId,
    buildReviewFromPlan,
    validateReview,
    canTransition,
    transitionReview,
    canEditReview,
    applyReviewEdit,
    generateReviewsFromPlans,
    normalizeReviewStore,
    loadSavedReviewStore,
    detectPhase2210Changes,
    buildWarnings,
    buildPayload,
    saveReviewStore,
    deleteSavedReviewStore,
    canFinalize,
    finalizeReviewStore,
    unfinalizeReviewStore,
    generatePlainText,
    bindReviewDecisionPanel
  };
});
