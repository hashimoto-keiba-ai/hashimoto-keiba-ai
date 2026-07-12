(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2212ManualApprovalManagementCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const REVIEW_STORAGE_KEY = "hashimotoKeibaAi.phase22.validationResultReviewApplicationDecision.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.eligibleRuleManualApprovalManagement.v1";
  const PROTECTED_STORAGE_KEYS = [REVIEW_STORAGE_KEY, STORAGE_KEY];
  const APPROVAL_STATUSES = ["draft", "awaiting_approval", "approved", "revoked", "rejected", "expired", "cancelled"];
  const APPLICATION_STATUSES = ["not_applied", "planned", "blocked", "cancelled"];
  const TERMINAL_STATUSES = ["revoked", "rejected", "expired", "cancelled"];
  const ALLOWED_TRANSITIONS = {
    draft: ["awaiting_approval", "cancelled"],
    awaiting_approval: ["approved", "rejected", "cancelled"],
    approved: ["revoked", "expired"],
    revoked: [],
    rejected: [],
    expired: [],
    cancelled: []
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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "approval";
  }

  function stableApprovalId(review) {
    return `phase22-12-approval-${stableSlug(review.reviewId || review.targetImprovementRuleId || review.name || "review")}`;
  }

  function newReapprovalId(approval, suffix) {
    return `${stableApprovalId(approval)}-reauthorize-${stableSlug(suffix || new Date(0).toISOString())}`;
  }

  function buildSafety() {
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
      externalApi: false,
      appliedStateHandled: false
    };
  }

  function normalizeReview(review = {}) {
    return {
      reviewId: text(review.reviewId),
      name: text(review.name),
      description: text(review.description),
      targetValidationPlanId: text(review.targetValidationPlanId),
      targetImprovementRuleId: text(review.targetImprovementRuleId),
      reviewStatus: text(review.reviewStatus || "draft"),
      applicationDecision: text(review.applicationDecision || "pending"),
      reviewer: text(review.reviewer),
      reviewedAt: text(review.reviewedAt),
      reviewComment: text(review.reviewComment)
    };
  }

  function normalizeReviewStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      reviews: Array.isArray(input.reviews) ? input.reviews.map(normalizeReview).filter((review) => review.reviewId) : []
    };
  }

  function loadReviewStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { reviewStore: normalizeReviewStore(), parseError: false };
    const raw = targetStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { reviewStore: normalizeReviewStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function eligibleReviews(reviewStore) {
    return (reviewStore.reviews || []).filter((review) => review.reviewStatus === "completed" && review.applicationDecision === "eligible" && review.reviewId);
  }

  function normalizeHistory(input, fields) {
    return Array.isArray(input)
      ? input.map((item) => fields.reduce((acc, field) => {
        acc[field] = text(item[field]);
        return acc;
      }, {})).filter((item) => Object.values(item).some(Boolean))
      : [];
  }

  function buildApprovalFromReview(reviewInput, reviewStore = {}, savedApproval = {}) {
    const review = normalizeReview(reviewInput);
    const approvalId = text(savedApproval.approvalId) || stableApprovalId(review);
    const approvalStatus = APPROVAL_STATUSES.includes(savedApproval.approvalStatus) ? savedApproval.approvalStatus : "draft";
    const applicationStatus = APPLICATION_STATUSES.includes(savedApproval.applicationStatus) ? savedApproval.applicationStatus : "not_applied";
    return {
      approvalId,
      name: text(savedApproval.name) || `${review.name || review.targetImprovementRuleId} 手動承認`,
      description: text(savedApproval.description) || `${review.description || review.reviewId} を承認済み・未適用として管理する`,
      targetReviewId: review.reviewId,
      targetValidationPlanId: text(savedApproval.targetValidationPlanId) || review.targetValidationPlanId,
      targetImprovementRuleId: text(savedApproval.targetImprovementRuleId) || review.targetImprovementRuleId,
      sourceReviewStatus: review.reviewStatus,
      sourceApplicationDecision: review.applicationDecision,
      sourceReviewer: review.reviewer,
      sourceReviewedAt: review.reviewedAt,
      finalApprover: text(savedApproval.finalApprover),
      approverId: text(savedApproval.approverId),
      approvedAt: text(savedApproval.approvedAt),
      approvalComment: text(savedApproval.approvalComment),
      approvalConditions: text(savedApproval.approvalConditions),
      prerequisites: text(savedApproval.prerequisites),
      constraints: text(savedApproval.constraints),
      prohibitedConditions: text(savedApproval.prohibitedConditions),
      plannedScope: text(savedApproval.plannedScope),
      targetRaceConditions: text(savedApproval.targetRaceConditions),
      targetLogic: text(savedApproval.targetLogic),
      targetDataScope: text(savedApproval.targetDataScope),
      effectiveStartDate: text(savedApproval.effectiveStartDate),
      effectiveEndDate: text(savedApproval.effectiveEndDate),
      approvalValidityPeriod: text(savedApproval.approvalValidityPeriod),
      rollbackConditions: text(savedApproval.rollbackConditions),
      revokeConditions: text(savedApproval.revokeConditions),
      reapprovalConditions: text(savedApproval.reapprovalConditions),
      approvalHistory: normalizeHistory(savedApproval.approvalHistory, ["approver", "approverId", "approvedAt", "comment"]),
      revocationHistory: normalizeHistory(savedApproval.revocationHistory, ["revoker", "revokedAt", "reason"]),
      reapprovalHistory: normalizeHistory(savedApproval.reapprovalHistory, ["approvalId", "createdAt", "reason"]),
      approvalStatus,
      applicationStatus,
      rejectionReason: text(savedApproval.rejectionReason),
      revokeReason: text(savedApproval.revokeReason),
      revoker: text(savedApproval.revoker),
      revokedAt: text(savedApproval.revokedAt),
      cancellationReason: text(savedApproval.cancellationReason),
      createdFromReviewSavedAt: text(reviewStore.savedAt),
      sourceReviewFinalized: Boolean(reviewStore.finalized),
      safety: buildSafety()
    };
  }

  function validateApproval(approvalInput) {
    const approval = approvalInput || {};
    const errors = [];
    if (!text(approval.approvalId)) errors.push("承認案件IDが不足しています。");
    if (!text(approval.name)) errors.push("名称が不足しています。");
    if (!text(approval.description)) errors.push("説明が不足しています。");
    if (!text(approval.targetReviewId)) errors.push("対象レビューIDが不足しています。");
    if (!text(approval.targetValidationPlanId)) errors.push("対象検証計画IDが不足しています。");
    if (!text(approval.targetImprovementRuleId)) errors.push("対象改善ルールIDが不足しています。");
    if (!APPROVAL_STATUSES.includes(approval.approvalStatus)) errors.push("承認状態が不正です。");
    if (!APPLICATION_STATUSES.includes(approval.applicationStatus)) errors.push("適用状態が不正です。");
    if (approval.applicationStatus === "applied") errors.push("applied状態はPhase22-12では扱いません。");
    if (approval.effectiveStartDate && approval.effectiveEndDate && approval.effectiveEndDate < approval.effectiveStartDate) errors.push("有効期限が有効開始日より前です。");
    if (approval.approvalStatus === "approved") {
      if (approval.sourceReviewStatus !== "completed") errors.push("approvedにはPhase22-11レビュー状態completedが必要です。");
      if (approval.sourceApplicationDecision !== "eligible") errors.push("approvedにはPhase22-11判定eligibleが必要です。");
      if (!text(approval.finalApprover)) errors.push("approvedには最終承認者が必要です。");
      if (!text(approval.approverId)) errors.push("approvedには承認者IDが必要です。");
      if (!text(approval.approvedAt)) errors.push("approvedには承認日時が必要です。");
      if (!text(approval.approvalConditions)) errors.push("approvedには承認条件が必要です。");
      if (!text(approval.effectiveStartDate)) errors.push("approvedには有効開始日が必要です。");
      if (!text(approval.effectiveEndDate)) errors.push("approvedには有効期限が必要です。");
      if (approval.applicationStatus !== "not_applied") errors.push("approvedでも適用状態はnot_appliedのままにしてください。");
    }
    if (approval.approvalStatus === "rejected" && !text(approval.rejectionReason)) errors.push("rejectedには却下理由が必要です。");
    if (approval.approvalStatus === "revoked" && (!text(approval.revokeReason) || !text(approval.revoker) || !text(approval.revokedAt))) errors.push("revokedには取消理由、取消者、取消日時が必要です。");
    if (approval.approvalStatus === "cancelled" && !text(approval.cancellationReason)) errors.push("cancelledには中止理由が必要です。");
    if (approval.approvedAt && Number.isNaN(Date.parse(approval.approvedAt))) errors.push("承認日時が不正です。");
    if (approval.revokedAt && Number.isNaN(Date.parse(approval.revokedAt))) errors.push("取消日時が不正です。");
    const safety = approval.safety || {};
    if (safety.automaticApply || safety.automaticLearning || safety.automaticUpdate || safety.autoExecution || safety.publicUrl || safety.githubPages || safety.externalApi) errors.push("安全条件に反する自動適用・外部公開フラグがあります。");
    return { ok: errors.length === 0, errors };
  }

  function canTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] || []).includes(to);
  }

  function transitionApproval(approval, toStatus) {
    if (!APPROVAL_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", approval };
    if (!canTransition(approval.approvalStatus, toStatus)) return { transitioned: false, reason: "invalid_transition", approval };
    const next = { ...approval, approvalStatus: toStatus, applicationStatus: toStatus === "approved" ? "not_applied" : approval.applicationStatus, safety: buildSafety() };
    return { transitioned: true, approval: next };
  }

  function canEditApproval(approval) {
    return !["approved", ...TERMINAL_STATUSES].includes(approval.approvalStatus);
  }

  function applyApprovalEdit(approval, changes) {
    if (!canEditApproval(approval)) return { updated: false, reason: "locked_approval", approval };
    return { updated: true, approval: { ...approval, ...changes, safety: buildSafety() } };
  }

  function createReapprovalCase(approval, suffix) {
    const next = {
      ...approval,
      approvalId: newReapprovalId(approval, suffix),
      approvalStatus: "draft",
      applicationStatus: "not_applied",
      finalApprover: "",
      approverId: "",
      approvedAt: "",
      approvalComment: "",
      rejectionReason: "",
      revokeReason: "",
      revoker: "",
      revokedAt: "",
      cancellationReason: "",
      reapprovalHistory: [...(approval.reapprovalHistory || []), { approvalId: approval.approvalId, createdAt: text(suffix), reason: "再承認は新規案件として作成" }],
      safety: buildSafety()
    };
    return next;
  }

  function generateApprovalsFromReviews(reviewStore, savedApprovals = []) {
    const savedByReview = new Map((savedApprovals || []).map((approval) => [text(approval.targetReviewId), approval]));
    return eligibleReviews(reviewStore)
      .map((review) => buildApprovalFromReview(review, reviewStore, savedByReview.get(review.reviewId) || {}))
      .sort((a, b) => a.approvalId.localeCompare(b.approvalId));
  }

  function snapshotReviews(reviewStore) {
    return {
      savedAt: reviewStore.savedAt,
      finalized: reviewStore.finalized,
      reviewIds: eligibleReviews(reviewStore).map((review) => review.reviewId).sort()
    };
  }

  function isValidSavedStore(input) {
    return Boolean(input && typeof input === "object" && (!input.approvals || Array.isArray(input.approvals)));
  }

  function normalizeApprovalStore(input = {}, reviewStore = normalizeReviewStore()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2211SavedAt: text(input.sourcePhase2211SavedAt || reviewStore.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || reviewStore.sourceRaceKey),
      approvals: generateApprovalsFromReviews(reviewStore, input.approvals || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      reviewSnapshot: input.reviewSnapshot || snapshotReviews(reviewStore)
    };
  }

  function loadSavedApprovalStore(storage, reviewStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeApprovalStore({}, reviewStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeApprovalStore({}, reviewStore), parseError: true, rejected: true };
    if (parsed && !isValidSavedStore(parsed)) return { store: normalizeApprovalStore({}, reviewStore), parseError: false, rejected: true };
    return { store: normalizeApprovalStore(parsed || {}, reviewStore), parseError: false, rejected: false };
  }

  function detectPhase2211Changes(reviewStore, store) {
    const snapshot = store.reviewSnapshot || {};
    const currentIds = eligibleReviews(reviewStore).map((review) => review.reviewId).sort().join("|");
    const savedIds = (snapshot.reviewIds || []).slice().sort().join("|");
    return Boolean(snapshot.savedAt && (snapshot.savedAt !== reviewStore.savedAt || savedIds !== currentIds || Boolean(snapshot.finalized) !== Boolean(reviewStore.finalized)));
  }

  function buildWarnings({ reviewStore = normalizeReviewStore(), store = normalizeApprovalStore({}, reviewStore), parseErrors = [] } = {}) {
    const warnings = [];
    if (!eligibleReviews(reviewStore).length) warnings.push({ level: "warning", message: "Phase22-11のeligibleレビュー案件がありません。" });
    if (!reviewStore.finalized) warnings.push({ level: "notice", message: "Phase22-11レビュー判定は未確定です。承認前に確認してください。" });
    if (detectPhase2211Changes(reviewStore, store)) warnings.push({ level: "warning", message: "Phase22-11データ更新の可能性があります。再読込してください。" });
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ level: "error", message }));
    (store.approvals || []).forEach((approval) => {
      validateApproval(approval).errors.forEach((message) => warnings.push({ level: "error", message: `${approval.approvalId}: ${message}` }));
    });
    if ((store.approvals || []).some((approval) => approval.approvalStatus === "approved")) warnings.push({ level: "notice", message: "approvedでも承認済み・未適用・自動反映なしです。" });
    return warnings;
  }

  function buildPayload(store, now = new Date()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: now.toISOString(),
      sourcePhase2211SavedAt: text(store.sourcePhase2211SavedAt),
      sourceRaceKey: text(store.sourceRaceKey),
      approvals: (store.approvals || []).map((approval) => ({ ...approval, safety: buildSafety() })).sort((a, b) => a.approvalId.localeCompare(b.approvalId)),
      finalized: Boolean(store.finalized),
      finalizedAt: text(store.finalizedAt),
      confirmerName: text(store.confirmerName),
      reviewSnapshot: store.reviewSnapshot || {}
    };
  }

  function saveApprovalStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(buildPayload(store, now)));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function deleteSavedApprovalStore(storage, confirmDelete) {
    if (confirmDelete && !confirmDelete()) return { deleted: false, reason: "cancelled" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function canFinalize(store) {
    const errors = [];
    (store.approvals || []).forEach((approval) => {
      const result = validateApproval(approval);
      if (!result.ok) errors.push(...result.errors.map((message) => `${approval.approvalId}: ${message}`));
    });
    if (!(store.approvals || []).length) errors.push("承認案件がありません。");
    return { ok: errors.length === 0, errors };
  }

  function finalizeApprovalStore(store, confirmerName, now = new Date()) {
    const result = canFinalize(store);
    if (!result.ok) return { finalized: false, errors: result.errors, store };
    return { finalized: true, errors: [], store: { ...store, finalized: true, finalizedAt: now.toISOString(), confirmerName: text(confirmerName) } };
  }

  function unfinalizeApprovalStore(store) {
    return { ...store, finalized: false, finalizedAt: "" };
  }

  function generatePlainText(store) {
    const lines = [];
    lines.push("Phase22-12 適用候補ルール・手動承認管理");
    lines.push(`保存キー: ${STORAGE_KEY}`);
    lines.push("approvedでも承認済み・未適用・自動反映なし");
    (store.approvals || []).forEach((approval) => {
      lines.push("");
      lines.push(`${approval.approvalId} / ${approval.name}`);
      lines.push(`レビュー: ${approval.targetReviewId}`);
      lines.push(`改善ルール: ${approval.targetImprovementRuleId}`);
      lines.push(`承認状態: ${approval.approvalStatus} / 適用状態: ${approval.applicationStatus}`);
      lines.push(`承認者: ${approval.finalApprover || "未設定"} / 日時: ${approval.approvedAt || "未設定"}`);
      lines.push(`有効期間: ${approval.effectiveStartDate || "未設定"}〜${approval.effectiveEndDate || "未設定"}`);
    });
    return lines.join("\n");
  }

  function createElement(doc, tag, className, textValue) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function bindManualApprovalPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-manual-approval-management-core");
    if (!rootNode || rootNode.dataset.phase2212Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2212Bound = "true";
    const storage = getStorage(options.storage);
    const nodes = {
      message: doc.querySelector("#phase22-approval-message"),
      finalizedStatus: doc.querySelector("#phase22-approval-finalized-status"),
      summary: doc.querySelector("#phase22-approval-summary"),
      warningList: doc.querySelector("#phase22-approval-warning-list"),
      list: doc.querySelector("#phase22-approval-list"),
      confirmer: doc.querySelector("#phase22-approval-confirmer"),
      textOutput: doc.querySelector("#phase22-approval-text-output")
    };
    const reviewLoad = loadReviewStore(storage);
    let savedLoad = loadSavedApprovalStore(storage, reviewLoad.reviewStore);
    let state = { reviewLoad, savedLoad, store: savedLoad.store };

    function setMessage(message, kind = "info") {
      if (!nodes.message) return;
      nodes.message.textContent = message;
      nodes.message.dataset.kind = kind;
    }

    function renderWarnings() {
      if (!nodes.warningList) return;
      nodes.warningList.replaceChildren();
      buildWarnings({
        reviewStore: state.reviewLoad.reviewStore,
        store: state.store,
        parseErrors: [
          state.reviewLoad.parseError ? "破損データ読み込み: Phase22-11" : "",
          state.savedLoad.parseError || state.savedLoad.rejected ? "破損データ読み込み: Phase22-12" : ""
        ]
      }).forEach((warning) => nodes.warningList.appendChild(createElement(doc, "div", `phase22-approval-warning ${warning.level}`, warning.message)));
    }

    function updateField(approvalId, field, value) {
      state.store = {
        ...state.store,
        approvals: (state.store.approvals || []).map((approval) => {
          if (approval.approvalId !== approvalId || !canEditApproval(approval)) return approval;
          return { ...approval, [field]: value, applicationStatus: field === "approvalStatus" && value === "approved" ? "not_applied" : approval.applicationStatus, safety: buildSafety() };
        })
      };
      render();
    }

    function renderList() {
      if (!nodes.list) return;
      nodes.list.replaceChildren();
      const table = createElement(doc, "div", "phase22-approval-table");
      const headers = ["ID", "レビュー", "改善ルール", "承認状態", "適用状態", "承認者", "承認者ID", "承認日時", "承認条件", "有効開始", "有効期限", "取消条件", "却下理由", "取消理由", "中止理由", "未適用"];
      const head = createElement(doc, "div", "phase22-approval-row head");
      headers.forEach((label) => head.appendChild(createElement(doc, "span", "", label)));
      table.appendChild(head);
      (state.store.approvals || []).forEach((approval) => {
        const row = createElement(doc, "div", "phase22-approval-row");
        row.appendChild(createElement(doc, "span", "", approval.approvalId));
        row.appendChild(createElement(doc, "span", "", approval.targetReviewId));
        row.appendChild(createElement(doc, "span", "", approval.targetImprovementRuleId));
        const status = createElement(doc, "select");
        APPROVAL_STATUSES.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === approval.approvalStatus;
          status.appendChild(option);
        });
        status.disabled = !canEditApproval(approval);
        status.addEventListener("change", () => updateField(approval.approvalId, "approvalStatus", status.value));
        row.appendChild(status);
        row.appendChild(createElement(doc, "span", "", approval.applicationStatus));
        ["finalApprover", "approverId", "approvedAt", "approvalConditions", "effectiveStartDate", "effectiveEndDate", "revokeConditions", "rejectionReason", "revokeReason", "cancellationReason"].forEach((field) => {
          const input = createElement(doc, "input");
          input.value = approval[field] || "";
          input.disabled = !canEditApproval(approval);
          input.addEventListener("input", () => updateField(approval.approvalId, field, input.value));
          row.appendChild(input);
        });
        row.appendChild(createElement(doc, "span", "", "承認済み・未適用・自動反映なし"));
        table.appendChild(row);
      });
      nodes.list.appendChild(table);
    }

    function render() {
      if (nodes.summary) nodes.summary.textContent = `eligible ${(eligibleReviews(state.reviewLoad.reviewStore) || []).length}件 / 承認案件 ${(state.store.approvals || []).length}件 / approved ${(state.store.approvals || []).filter((approval) => approval.approvalStatus === "approved").length}件`;
      if (nodes.finalizedStatus) {
        nodes.finalizedStatus.textContent = state.store.finalized ? `確定済み ${state.store.finalizedAt}` : "未確定";
        nodes.finalizedStatus.dataset.kind = state.store.finalized ? "success" : "warning";
      }
      renderWarnings();
      renderList();
    }

    function reload() {
      state.reviewLoad = loadReviewStore(storage);
      state.savedLoad = loadSavedApprovalStore(storage, state.reviewLoad.reviewStore);
      state.store = state.savedLoad.store;
      setMessage("Phase22-11のeligibleレビューから承認案件を再生成しました。", "success");
      render();
    }

    function save() {
      state.store = { ...state.store, confirmerName: nodes.confirmer ? nodes.confirmer.value : state.store.confirmerName };
      const result = saveApprovalStore(storage, state.store);
      setMessage(result.saved ? "Phase22-12承認管理データを保存しました。" : result.reason === "quota_exceeded" ? "localStorageの容量が不足しているため保存できませんでした。古い保存データを整理してから再度保存してください。" : "保存できませんでした。", result.saved ? "success" : "error");
    }

    function restore() {
      state.savedLoad = loadSavedApprovalStore(storage, state.reviewLoad.reviewStore);
      state.store = state.savedLoad.store;
      setMessage(state.savedLoad.parseError || state.savedLoad.rejected ? "Phase22-12保存データが不正なため初期状態で復元しました。" : "Phase22-12保存データを復元しました。", state.savedLoad.parseError || state.savedLoad.rejected ? "warning" : "success");
      render();
    }

    function reset() {
      const confirmReset = options.confirmReset || (() => root && root.confirm && root.confirm("Phase22-12の保存データだけを削除します。Phase22-1〜22-11は削除しません。よろしいですか？"));
      const result = deleteSavedApprovalStore(storage, confirmReset);
      if (result.deleted) reload();
      setMessage(result.deleted ? "Phase22-12のみ初期化しました。" : "初期化を取り消しました。", result.deleted ? "success" : "warning");
    }

    function finalize() {
      const result = finalizeApprovalStore(state.store, nodes.confirmer ? nodes.confirmer.value : "");
      if (!result.finalized) {
        setMessage(`確定できません: ${result.errors[0] || "未確認項目があります。"}`, "error");
        render();
        return;
      }
      state.store = result.store;
      setMessage("Phase22-12承認管理を確定しました。承認済みでも未適用です。", "success");
      render();
    }

    function unlock() {
      state.store = unfinalizeApprovalStore(state.store);
      setMessage("確定解除しました。自動適用は行いません。", "warning");
      render();
    }

    function outputText() {
      if (nodes.textOutput) nodes.textOutput.value = generatePlainText(state.store);
      setMessage("プレーンテキストを生成しました。", "success");
    }

    const actions = {
      "#phase22-approval-reload": reload,
      "#phase22-approval-save": save,
      "#phase22-approval-restore": restore,
      "#phase22-approval-reset": reset,
      "#phase22-approval-finalize": finalize,
      "#phase22-approval-unlock": unlock,
      "#phase22-approval-text": outputText
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, state, actions, nodes };
  }

  if (root && root.document) {
    const start = () => bindManualApprovalPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    REVIEW_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    APPROVAL_STATUSES,
    APPLICATION_STATUSES,
    normalizeReviewStore,
    loadReviewStore,
    eligibleReviews,
    stableApprovalId,
    newReapprovalId,
    buildApprovalFromReview,
    validateApproval,
    canTransition,
    transitionApproval,
    canEditApproval,
    applyApprovalEdit,
    createReapprovalCase,
    generateApprovalsFromReviews,
    normalizeApprovalStore,
    loadSavedApprovalStore,
    detectPhase2211Changes,
    buildWarnings,
    buildPayload,
    saveApprovalStore,
    deleteSavedApprovalStore,
    canFinalize,
    finalizeApprovalStore,
    unfinalizeApprovalStore,
    generatePlainText,
    bindManualApprovalPanel
  };
});
