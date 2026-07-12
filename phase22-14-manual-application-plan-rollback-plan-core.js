(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2214ManualApplicationRollbackPlanCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const IMPACT_STORAGE_KEY = "hashimotoKeibaAi.phase22.preApplicationImpactScopeConflictCheck.v1";
  const APPROVAL_STORAGE_KEY = "hashimotoKeibaAi.phase22.eligibleRuleManualApprovalManagement.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1";
  const PLAN_STATUSES = ["draft", "planning", "awaiting_approval", "approved", "ready", "on_hold", "cancelled", "expired"];
  const EXECUTION_STATUSES = ["not_started", "blocked", "cancelled"];
  const PLAN_DECISIONS = ["pending", "ready_for_manual_execution", "revision_required", "blocked", "cancelled"];
  const TERMINAL_STATUSES = ["ready", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["planning", "cancelled"],
    planning: ["awaiting_approval", "on_hold", "cancelled"],
    awaiting_approval: ["approved", "on_hold", "cancelled"],
    approved: ["ready", "on_hold", "cancelled", "expired"],
    on_hold: ["planning", "awaiting_approval", "cancelled"],
    ready: [],
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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "plan";
  }

  function stablePlanId(impact) {
    return `phase22-14-manual-plan-${stableSlug(impact.impactId || impact.targetApprovalId || impact.targetImprovementRuleId || "impact")}`;
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
      applicationStatusMutation: false,
      ruleActivation: false
    };
  }

  function normalizeApproval(input = {}) {
    return {
      approvalId: text(input.approvalId),
      approvalStatus: text(input.approvalStatus || "draft"),
      applicationStatus: text(input.applicationStatus || "not_applied"),
      finalApprover: text(input.finalApprover),
      approvedAt: text(input.approvedAt),
      approvalConditions: text(input.approvalConditions),
      effectiveStartDate: text(input.effectiveStartDate),
      effectiveEndDate: text(input.effectiveEndDate)
    };
  }

  function normalizeApprovalStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      finalized: Boolean(input.finalized),
      approvals: Array.isArray(input.approvals) ? input.approvals.map(normalizeApproval).filter((approval) => approval.approvalId) : []
    };
  }

  function normalizeImpact(input = {}) {
    return {
      impactId: text(input.impactId),
      name: text(input.name),
      description: text(input.description),
      targetApprovalId: text(input.targetApprovalId),
      targetReviewId: text(input.targetReviewId),
      targetValidationPlanId: text(input.targetValidationPlanId),
      targetImprovementRuleId: text(input.targetImprovementRuleId),
      finalApprover: text(input.finalApprover),
      approvedAt: text(input.approvedAt),
      approvalConditions: text(input.approvalConditions),
      effectiveStartDate: text(input.effectiveStartDate),
      effectiveEndDate: text(input.effectiveEndDate),
      checkStatus: text(input.checkStatus || "draft"),
      decisionResult: text(input.decisionResult || "pending"),
      safetyWarning: text(input.safetyWarning || "review_required"),
      mitigationPlan: text(input.mitigationPlan),
      resolutionOwner: text(input.resolutionOwner),
      resolutionDueDate: text(input.resolutionDueDate),
      checker: text(input.checker),
      checkedAt: text(input.checkedAt),
      checkComment: text(input.checkComment),
      blockReason: text(input.blockReason)
    };
  }

  function normalizeImpactStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      impacts: Array.isArray(input.impacts) ? input.impacts.map(normalizeImpact).filter((impact) => impact.impactId) : []
    };
  }

  function loadImpactStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { impactStore: normalizeImpactStore(), parseError: false };
    const raw = targetStorage.getItem(IMPACT_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { impactStore: normalizeImpactStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function loadApprovalStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { approvalStore: normalizeApprovalStore(), parseError: false };
    const raw = targetStorage.getItem(APPROVAL_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { approvalStore: normalizeApprovalStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function approvalById(approvalStore) {
    return new Map((approvalStore.approvals || []).map((approval) => [approval.approvalId, approval]));
  }

  function eligibleImpacts(impactStore, approvalStore) {
    const approvals = approvalById(approvalStore);
    return (impactStore.impacts || []).filter((impact) => {
      const approval = approvals.get(impact.targetApprovalId);
      return impact.checkStatus === "cleared"
        && ["no_conflict", "resolvable"].includes(impact.decisionResult)
        && impact.safetyWarning !== "application_blocked"
        && approval
        && approval.approvalStatus === "approved"
        && approval.applicationStatus === "not_applied";
    });
  }

  function normalizeStep(step = {}, index = 0) {
    return {
      stepId: text(step.stepId) || `step-${index + 1}`,
      order: number(step.order, index + 1),
      work: text(step.work),
      operator: text(step.operator),
      checker: text(step.checker),
      prerequisites: text(step.prerequisites),
      completionCriteria: text(step.completionCriteria),
      expectedMinutes: text(step.expectedMinutes),
      notes: text(step.notes)
    };
  }

  function normalizeCheckItem(item = {}, index = 0) {
    return {
      itemId: text(item.itemId) || `check-${index + 1}`,
      order: number(item.order, index + 1),
      content: text(item.content),
      expectedResult: text(item.expectedResult),
      actualResult: text(item.actualResult),
      judgement: text(item.judgement || "pending"),
      checker: text(item.checker),
      checkedAt: text(item.checkedAt)
    };
  }

  function normalizeBackupPlan(input = {}) {
    return {
      targets: text(input.targets),
      destination: text(input.destination),
      procedure: text(input.procedure),
      capturedAt: text(input.capturedAt),
      verificationMethod: text(input.verificationMethod),
      retentionPeriod: text(input.retentionPeriod)
    };
  }

  function normalizeRollbackPlan(input = {}) {
    return {
      conditions: text(input.conditions),
      decisionMaker: text(input.decisionMaker),
      operator: text(input.operator),
      restoreTargets: text(input.restoreTargets),
      restoreProcedure: text(input.restoreProcedure),
      verificationItems: text(input.verificationItems),
      targetRecoveryTime: text(input.targetRecoveryTime)
    };
  }

  function buildPlanFromImpact(impactInput, approvalStore = {}, impactStore = {}, savedPlan = {}) {
    const impact = normalizeImpact(impactInput);
    const approval = approvalById(approvalStore).get(impact.targetApprovalId) || normalizeApproval();
    const planId = text(savedPlan.planId) || stablePlanId(impact);
    const steps = Array.isArray(savedPlan.manualSteps) ? savedPlan.manualSteps.map(normalizeStep) : [];
    const checkItems = Array.isArray(savedPlan.postApplicationChecks) ? savedPlan.postApplicationChecks.map(normalizeCheckItem) : [];
    return {
      planId,
      name: text(savedPlan.name) || `${impact.name || impact.targetImprovementRuleId} 手動適用計画`,
      description: text(savedPlan.description) || `${impact.description || impact.impactId} の手動適用とロールバックを計画する`,
      targetImpactId: impact.impactId,
      targetApprovalId: impact.targetApprovalId,
      targetReviewId: impact.targetReviewId,
      targetValidationPlanId: impact.targetValidationPlanId,
      targetImprovementRuleId: impact.targetImprovementRuleId,
      sourceCheckStatus: impact.checkStatus,
      sourceDecisionResult: impact.decisionResult,
      sourceSafetyWarning: impact.safetyWarning,
      sourceMitigationPlan: impact.mitigationPlan,
      sourceResolutionOwner: impact.resolutionOwner,
      sourceResolutionDueDate: impact.resolutionDueDate,
      sourceChecker: impact.checker,
      sourceCheckedAt: impact.checkedAt,
      sourceCheckComment: impact.checkComment,
      sourceApprovalStatus: approval.approvalStatus,
      sourceApplicationStatus: approval.applicationStatus,
      finalApprover: text(savedPlan.finalApprover) || approval.finalApprover || impact.finalApprover,
      approvedAt: text(savedPlan.approvedAt) || approval.approvedAt || impact.approvedAt,
      approvalConditions: text(savedPlan.approvalConditions) || approval.approvalConditions || impact.approvalConditions,
      effectiveStartDate: text(savedPlan.effectiveStartDate) || approval.effectiveStartDate || impact.effectiveStartDate,
      effectiveEndDate: text(savedPlan.effectiveEndDate) || approval.effectiveEndDate || impact.effectiveEndDate,
      manualSteps: steps,
      scheduledAt: text(savedPlan.scheduledAt),
      deadlineAt: text(savedPlan.deadlineAt),
      allowedTimeWindow: text(savedPlan.allowedTimeWindow),
      workLocation: text(savedPlan.workLocation),
      targetDevice: text(savedPlan.targetDevice),
      operator: text(savedPlan.operator),
      checker: text(savedPlan.checker),
      approverRole: text(savedPlan.approverRole) || approval.finalApprover || impact.finalApprover,
      samePersonExceptionReason: text(savedPlan.samePersonExceptionReason),
      backupPlan: normalizeBackupPlan(savedPlan.backupPlan),
      rollbackPlan: normalizeRollbackPlan(savedPlan.rollbackPlan),
      abortConditions: text(savedPlan.abortConditions),
      holdConditions: text(savedPlan.holdConditions),
      resumeConditions: text(savedPlan.resumeConditions),
      postApplicationChecks: checkItems,
      planStatus: PLAN_STATUSES.includes(savedPlan.planStatus) ? savedPlan.planStatus : "draft",
      executionStatus: EXECUTION_STATUSES.includes(savedPlan.executionStatus) ? savedPlan.executionStatus : "not_started",
      planDecision: PLAN_DECISIONS.includes(savedPlan.planDecision) ? savedPlan.planDecision : "pending",
      revisionReason: text(savedPlan.revisionReason),
      blockReason: text(savedPlan.blockReason),
      cancellationReason: text(savedPlan.cancellationReason),
      humanApprovalReviewer: text(savedPlan.humanApprovalReviewer),
      humanApprovedAt: text(savedPlan.humanApprovedAt),
      humanApprovalComment: text(savedPlan.humanApprovalComment),
      history: Array.isArray(savedPlan.history) ? savedPlan.history : [],
      createdFromImpactSavedAt: text(impactStore.savedAt),
      sourceImpactFinalized: Boolean(impactStore.finalized),
      safety: buildSafety()
    };
  }

  function stepsSequential(steps) {
    const orders = steps.map((step) => step.order).sort((a, b) => a - b);
    return orders.every((order, index) => order === index + 1);
  }

  function hasBackup(plan) {
    const backup = plan.backupPlan || {};
    return text(backup.targets) && text(backup.destination) && text(backup.procedure) && text(backup.verificationMethod);
  }

  function hasRollback(plan) {
    const rollback = plan.rollbackPlan || {};
    return text(rollback.conditions) && text(rollback.decisionMaker) && text(rollback.operator) && text(rollback.restoreTargets) && text(rollback.restoreProcedure) && text(rollback.verificationItems);
  }

  function validatePlan(planInput) {
    const plan = planInput || {};
    const errors = [];
    if (!text(plan.planId)) errors.push("適用計画IDが不足しています。");
    if (!text(plan.name)) errors.push("名称が不足しています。");
    if (!text(plan.description)) errors.push("説明が不足しています。");
    if (!text(plan.targetImpactId)) errors.push("対象影響確認IDが不足しています。");
    if (!text(plan.targetApprovalId)) errors.push("対象承認案件IDが不足しています。");
    if (!text(plan.targetReviewId)) errors.push("対象レビューIDが不足しています。");
    if (!text(plan.targetValidationPlanId)) errors.push("対象検証計画IDが不足しています。");
    if (!text(plan.targetImprovementRuleId)) errors.push("対象改善ルールIDが不足しています。");
    if (!PLAN_STATUSES.includes(plan.planStatus)) errors.push("計画状態が不正です。");
    if (!EXECUTION_STATUSES.includes(plan.executionStatus)) errors.push("実行状態が不正です。");
    if (!PLAN_DECISIONS.includes(plan.planDecision)) errors.push("計画判定が不正です。");
    if (["applied", "running", "completed"].includes(plan.executionStatus)) errors.push("applied / running / completed はPhase22-14では扱いません。");
    if (plan.effectiveStartDate && plan.effectiveEndDate && plan.effectiveEndDate < plan.effectiveStartDate) errors.push("有効期限が有効開始日より前です。");
    if (plan.scheduledAt && plan.deadlineAt && plan.deadlineAt < plan.scheduledAt) errors.push("実施期限が実施予定日時より前です。");
    if (plan.planStatus === "approved" || plan.planStatus === "ready") {
      if (plan.executionStatus !== "not_started") errors.push("approved / readyでも実行状態はnot_startedのままにしてください。");
    }
    if (plan.planDecision === "ready_for_manual_execution") {
      if (plan.sourceCheckStatus !== "cleared") errors.push("readyにはPhase22-13 checkStatus clearedが必要です。");
      if (!["no_conflict", "resolvable"].includes(plan.sourceDecisionResult)) errors.push("readyにはPhase22-13 decisionResult no_conflictまたはresolvableが必要です。");
      if (plan.sourceApprovalStatus !== "approved") errors.push("readyにはPhase22-12 approvalStatus approvedが必要です。");
      if (plan.sourceApplicationStatus !== "not_applied") errors.push("readyにはPhase22-12 applicationStatus not_appliedが必要です。");
      if (plan.sourceSafetyWarning === "application_blocked") errors.push("application_blocked警告があるためreadyにできません。");
      if (!Array.isArray(plan.manualSteps) || plan.manualSteps.length === 0) errors.push("readyには適用手順が1件以上必要です。");
      if (Array.isArray(plan.manualSteps) && !stepsSequential(plan.manualSteps)) errors.push("手順順序は重複なく1から連続している必要があります。");
      if (!text(plan.operator)) errors.push("readyには実施者が必要です。");
      if (!text(plan.checker)) errors.push("readyには確認者が必要です。");
      if (text(plan.operator) && text(plan.checker) && plan.operator === plan.checker && !text(plan.samePersonExceptionReason)) errors.push("実施者と確認者が同一の場合は例外理由が必要です。");
      if (!hasBackup(plan)) errors.push("readyにはバックアップ計画が必要です。");
      if (!hasRollback(plan)) errors.push("readyにはロールバック計画が必要です。");
      if (!text(plan.abortConditions)) errors.push("readyには中止条件が必要です。");
      if (!Array.isArray(plan.postApplicationChecks) || plan.postApplicationChecks.length === 0) errors.push("readyには適用後確認項目が必要です。");
      if (plan.sourceDecisionResult === "resolvable" && (!text(plan.sourceMitigationPlan) || !text(plan.mitigationReflected))) errors.push("resolvable由来の案件では回避策と解決内容の計画反映が必要です。");
      if (!text(plan.humanApprovalReviewer) || !text(plan.humanApprovedAt) || !text(plan.humanApprovalComment)) errors.push("readyには人による承認記録が必要です。");
    }
    if (plan.planDecision === "revision_required" && !text(plan.revisionReason)) errors.push("revision_requiredには修正理由が必要です。");
    if (plan.planDecision === "blocked" && !text(plan.blockReason)) errors.push("blockedにはブロック理由が必要です。");
    if (plan.planDecision === "cancelled" && !text(plan.cancellationReason)) errors.push("cancelledには中止理由が必要です。");
    const safety = plan.safety || {};
    if (safety.automaticApply || safety.automaticLearning || safety.automaticUpdate || safety.autoExecution || safety.publicUrl || safety.githubPages || safety.externalApi || safety.applicationStatusMutation || safety.ruleActivation) errors.push("安全条件に反する自動適用・外部公開フラグがあります。");
    return { ok: errors.length === 0, errors };
  }

  function canTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] || []).includes(to);
  }

  function transitionPlan(plan, toStatus) {
    if (!PLAN_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", plan };
    if (!canTransition(plan.planStatus, toStatus)) return { transitioned: false, reason: "invalid_transition", plan };
    return { transitioned: true, plan: { ...plan, planStatus: toStatus, executionStatus: ["approved", "ready"].includes(toStatus) ? "not_started" : plan.executionStatus, safety: buildSafety() } };
  }

  function canEditPlan(plan) {
    return !["approved", "ready", "cancelled", "expired"].includes(plan.planStatus);
  }

  function applyPlanEdit(plan, changes) {
    if (!canEditPlan(plan)) return { updated: false, reason: "locked_plan", plan };
    return { updated: true, plan: { ...plan, ...changes, safety: buildSafety() } };
  }

  function createReplanCase(plan, suffix) {
    return {
      ...plan,
      planId: `${stablePlanId({ impactId: plan.targetImpactId })}-replan-${stableSlug(suffix || new Date(0).toISOString())}`,
      planStatus: "draft",
      executionStatus: "not_started",
      planDecision: "pending",
      humanApprovalReviewer: "",
      humanApprovedAt: "",
      humanApprovalComment: "",
      history: [...(plan.history || []), { planId: plan.planId, createdAt: text(suffix), reason: "再計画は新規案件として作成" }],
      safety: buildSafety()
    };
  }

  function generatePlansFromImpacts(impactStore, approvalStore, savedPlans = []) {
    const savedByImpact = new Map((savedPlans || []).map((plan) => [text(plan.targetImpactId), plan]));
    return eligibleImpacts(impactStore, approvalStore)
      .map((impact) => buildPlanFromImpact(impact, approvalStore, impactStore, savedByImpact.get(impact.impactId) || {}))
      .sort((a, b) => a.planId.localeCompare(b.planId));
  }

  function snapshotSources(impactStore, approvalStore) {
    return {
      impactSavedAt: impactStore.savedAt,
      approvalSavedAt: approvalStore.savedAt,
      impactIds: eligibleImpacts(impactStore, approvalStore).map((impact) => impact.impactId).sort()
    };
  }

  function isValidSavedStore(input) {
    return Boolean(input && typeof input === "object" && (!input.plans || Array.isArray(input.plans)));
  }

  function normalizePlanStore(input = {}, impactStore = normalizeImpactStore(), approvalStore = normalizeApprovalStore()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2213SavedAt: text(input.sourcePhase2213SavedAt || impactStore.savedAt),
      sourcePhase2212SavedAt: text(input.sourcePhase2212SavedAt || approvalStore.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || impactStore.sourceRaceKey),
      plans: generatePlansFromImpacts(impactStore, approvalStore, input.plans || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      sourceSnapshot: input.sourceSnapshot || snapshotSources(impactStore, approvalStore)
    };
  }

  function loadSavedPlanStore(storage, impactStore, approvalStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizePlanStore({}, impactStore, approvalStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizePlanStore({}, impactStore, approvalStore), parseError: true, rejected: true };
    if (parsed && !isValidSavedStore(parsed)) return { store: normalizePlanStore({}, impactStore, approvalStore), parseError: false, rejected: true };
    return { store: normalizePlanStore(parsed || {}, impactStore, approvalStore), parseError: false, rejected: false };
  }

  function buildWarnings({ impactStore = normalizeImpactStore(), approvalStore = normalizeApprovalStore(), store = normalizePlanStore({}, impactStore, approvalStore), parseErrors = [] } = {}) {
    const warnings = [];
    if (!eligibleImpacts(impactStore, approvalStore).length) warnings.push({ level: "warning", message: "Phase22-13 cleared かつ Phase22-12 approved / not_applied の案件がありません。" });
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ level: "error", message }));
    (store.plans || []).forEach((plan) => validatePlan(plan).errors.forEach((message) => warnings.push({ level: "error", message: `${plan.planId}: ${message}` })));
    if ((store.plans || []).some((plan) => plan.planDecision === "ready_for_manual_execution" || plan.planStatus === "ready")) warnings.push({ level: "notice", message: "readyでも未実行・未適用・自動反映なしです。" });
    return warnings;
  }

  function buildPayload(store, now = new Date()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: now.toISOString(),
      sourcePhase2213SavedAt: text(store.sourcePhase2213SavedAt),
      sourcePhase2212SavedAt: text(store.sourcePhase2212SavedAt),
      sourceRaceKey: text(store.sourceRaceKey),
      plans: (store.plans || []).map((plan) => ({ ...plan, safety: buildSafety() })).sort((a, b) => a.planId.localeCompare(b.planId)),
      finalized: Boolean(store.finalized),
      finalizedAt: text(store.finalizedAt),
      confirmerName: text(store.confirmerName),
      sourceSnapshot: store.sourceSnapshot || {}
    };
  }

  function savePlanStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(buildPayload(store, now)));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function deleteSavedPlanStore(storage, confirmDelete) {
    if (confirmDelete && !confirmDelete()) return { deleted: false, reason: "cancelled" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function canFinalize(store) {
    const errors = [];
    (store.plans || []).forEach((plan) => {
      const result = validatePlan(plan);
      if (!result.ok) errors.push(...result.errors.map((message) => `${plan.planId}: ${message}`));
    });
    if (!(store.plans || []).length) errors.push("適用計画案件がありません。");
    return { ok: errors.length === 0, errors };
  }

  function finalizePlanStore(store, confirmerName, now = new Date()) {
    const result = canFinalize(store);
    if (!result.ok) return { finalized: false, errors: result.errors, store };
    return { finalized: true, errors: [], store: { ...store, finalized: true, finalizedAt: now.toISOString(), confirmerName: text(confirmerName) } };
  }

  function unfinalizePlanStore(store) {
    return { ...store, finalized: false, finalizedAt: "" };
  }

  function generatePlainText(store) {
    const lines = ["Phase22-14 手動適用計画・ロールバック計画", `保存キー: ${STORAGE_KEY}`, "ready_for_manual_executionでも未実行・未適用・自動反映なし"];
    (store.plans || []).forEach((plan) => {
      lines.push("", `${plan.planId} / ${plan.name}`, `影響確認: ${plan.targetImpactId}`, `状態: ${plan.planStatus} / 判定: ${plan.planDecision}`, `実行状態: ${plan.executionStatus}`);
    });
    return lines.join("\n");
  }

  function createElement(doc, tag, className, textValue) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function bindManualApplicationPlanPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-manual-application-plan-core");
    if (!rootNode || rootNode.dataset.phase2214Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2214Bound = "true";
    const storage = getStorage(options.storage);
    const nodes = {
      message: doc.querySelector("#phase22-plan-message"),
      finalizedStatus: doc.querySelector("#phase22-plan-finalized-status"),
      summary: doc.querySelector("#phase22-plan-summary"),
      warningList: doc.querySelector("#phase22-plan-warning-list"),
      list: doc.querySelector("#phase22-plan-list"),
      confirmer: doc.querySelector("#phase22-plan-confirmer"),
      textOutput: doc.querySelector("#phase22-plan-text-output")
    };
    let impactLoad = loadImpactStore(storage);
    let approvalLoad = loadApprovalStore(storage);
    let savedLoad = loadSavedPlanStore(storage, impactLoad.impactStore, approvalLoad.approvalStore);
    let state = { impactLoad, approvalLoad, savedLoad, store: savedLoad.store };

    function setMessage(message, kind = "info") {
      if (!nodes.message) return;
      nodes.message.textContent = message;
      nodes.message.dataset.kind = kind;
    }

    function renderWarnings() {
      if (!nodes.warningList) return;
      nodes.warningList.replaceChildren();
      buildWarnings({
        impactStore: state.impactLoad.impactStore,
        approvalStore: state.approvalLoad.approvalStore,
        store: state.store,
        parseErrors: [
          state.impactLoad.parseError ? "破損データ読み込み: Phase22-13" : "",
          state.approvalLoad.parseError ? "破損データ読み込み: Phase22-12" : "",
          state.savedLoad.parseError || state.savedLoad.rejected ? "破損データ読み込み: Phase22-14" : ""
        ]
      }).forEach((warning) => nodes.warningList.appendChild(createElement(doc, "div", `phase22-plan-warning ${warning.level}`, warning.message)));
    }

    function updateField(planId, field, value) {
      state.store = {
        ...state.store,
        plans: (state.store.plans || []).map((plan) => {
          if (plan.planId !== planId || !canEditPlan(plan)) return plan;
          return { ...plan, [field]: value, safety: buildSafety() };
        })
      };
      render();
    }

    function renderList() {
      if (!nodes.list) return;
      nodes.list.replaceChildren();
      const table = createElement(doc, "div", "phase22-plan-table");
      const headers = ["ID", "影響確認", "改善ルール", "計画状態", "判定", "実行", "実施者", "確認者", "予定日時", "期限", "バックアップ", "ロールバック", "中止条件", "承認者", "未実行"];
      const head = createElement(doc, "div", "phase22-plan-row head");
      headers.forEach((label) => head.appendChild(createElement(doc, "span", "", label)));
      table.appendChild(head);
      (state.store.plans || []).forEach((plan) => {
        const row = createElement(doc, "div", "phase22-plan-row");
        row.appendChild(createElement(doc, "span", "", plan.planId));
        row.appendChild(createElement(doc, "span", "", plan.targetImpactId));
        row.appendChild(createElement(doc, "span", "", plan.targetImprovementRuleId));
        const status = createElement(doc, "select");
        PLAN_STATUSES.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === plan.planStatus;
          status.appendChild(option);
        });
        status.disabled = !canEditPlan(plan);
        status.addEventListener("change", () => updateField(plan.planId, "planStatus", status.value));
        row.appendChild(status);
        const decision = createElement(doc, "select");
        PLAN_DECISIONS.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === plan.planDecision;
          decision.appendChild(option);
        });
        decision.disabled = !canEditPlan(plan);
        decision.addEventListener("change", () => updateField(plan.planId, "planDecision", decision.value));
        row.appendChild(decision);
        row.appendChild(createElement(doc, "span", "", plan.executionStatus));
        ["operator", "checker", "scheduledAt", "deadlineAt", "abortConditions", "humanApprovalReviewer"].forEach((field) => {
          const input = createElement(doc, "input");
          input.value = plan[field] || "";
          input.disabled = !canEditPlan(plan);
          input.addEventListener("input", () => updateField(plan.planId, field, input.value));
          row.appendChild(input);
        });
        row.appendChild(createElement(doc, "span", "", hasBackup(plan) ? "あり" : "未設定"));
        row.appendChild(createElement(doc, "span", "", hasRollback(plan) ? "あり" : "未設定"));
        row.appendChild(createElement(doc, "span", "", "未実行・未適用・自動反映なし"));
        table.appendChild(row);
      });
      nodes.list.appendChild(table);
    }

    function render() {
      if (nodes.summary) nodes.summary.textContent = `対象 ${eligibleImpacts(state.impactLoad.impactStore, state.approvalLoad.approvalStore).length}件 / 計画 ${(state.store.plans || []).length}件 / ready ${(state.store.plans || []).filter((plan) => plan.planStatus === "ready").length}件`;
      if (nodes.finalizedStatus) {
        nodes.finalizedStatus.textContent = state.store.finalized ? `確定済み ${state.store.finalizedAt}` : "未確定";
        nodes.finalizedStatus.dataset.kind = state.store.finalized ? "success" : "warning";
      }
      renderWarnings();
      renderList();
    }

    function reload() {
      impactLoad = loadImpactStore(storage);
      approvalLoad = loadApprovalStore(storage);
      savedLoad = loadSavedPlanStore(storage, impactLoad.impactStore, approvalLoad.approvalStore);
      state = { impactLoad, approvalLoad, savedLoad, store: savedLoad.store };
      setMessage("Phase22-13/12から手動適用計画案件を再生成しました。", "success");
      render();
    }

    function save() {
      state.store = { ...state.store, confirmerName: nodes.confirmer ? nodes.confirmer.value : state.store.confirmerName };
      const result = savePlanStore(storage, state.store);
      setMessage(result.saved ? "Phase22-14適用計画データを保存しました。" : result.reason === "quota_exceeded" ? "localStorageの容量が不足しているため保存できませんでした。" : "保存できませんでした。", result.saved ? "success" : "error");
    }

    function restore() {
      state.savedLoad = loadSavedPlanStore(storage, state.impactLoad.impactStore, state.approvalLoad.approvalStore);
      state.store = state.savedLoad.store;
      setMessage(state.savedLoad.parseError || state.savedLoad.rejected ? "Phase22-14保存データが不正なため初期状態で復元しました。" : "Phase22-14保存データを復元しました。", state.savedLoad.parseError || state.savedLoad.rejected ? "warning" : "success");
      render();
    }

    function reset() {
      const confirmReset = options.confirmReset || (() => root && root.confirm && root.confirm("Phase22-14の保存データだけを削除します。Phase22-1〜22-13は削除しません。よろしいですか？"));
      const result = deleteSavedPlanStore(storage, confirmReset);
      if (result.deleted) reload();
      setMessage(result.deleted ? "Phase22-14のみ初期化しました。" : "初期化を取り消しました。", result.deleted ? "success" : "warning");
    }

    function finalize() {
      const result = finalizePlanStore(state.store, nodes.confirmer ? nodes.confirmer.value : "");
      if (!result.finalized) {
        setMessage(`確定できません: ${result.errors[0] || "未確認項目があります。"}`, "error");
        render();
        return;
      }
      state.store = result.store;
      setMessage("Phase22-14適用計画を確定しました。自動実行は行いません。", "success");
      render();
    }

    function unlock() {
      state.store = unfinalizePlanStore(state.store);
      setMessage("確定解除しました。自動実行は行いません。", "warning");
      render();
    }

    function outputText() {
      if (nodes.textOutput) nodes.textOutput.value = generatePlainText(state.store);
      setMessage("プレーンテキストを生成しました。", "success");
    }

    const actions = {
      "#phase22-plan-reload": reload,
      "#phase22-plan-save": save,
      "#phase22-plan-restore": restore,
      "#phase22-plan-reset": reset,
      "#phase22-plan-finalize": finalize,
      "#phase22-plan-unlock": unlock,
      "#phase22-plan-text": outputText
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, state, actions, nodes };
  }

  if (root && root.document) {
    const start = () => bindManualApplicationPlanPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    IMPACT_STORAGE_KEY,
    APPROVAL_STORAGE_KEY,
    STORAGE_KEY,
    PLAN_STATUSES,
    EXECUTION_STATUSES,
    PLAN_DECISIONS,
    normalizeImpactStore,
    normalizeApprovalStore,
    loadImpactStore,
    loadApprovalStore,
    eligibleImpacts,
    normalizeStep,
    normalizeCheckItem,
    normalizeBackupPlan,
    normalizeRollbackPlan,
    stablePlanId,
    buildPlanFromImpact,
    validatePlan,
    canTransition,
    transitionPlan,
    canEditPlan,
    applyPlanEdit,
    createReplanCase,
    generatePlansFromImpacts,
    normalizePlanStore,
    loadSavedPlanStore,
    buildWarnings,
    buildPayload,
    savePlanStore,
    deleteSavedPlanStore,
    canFinalize,
    finalizePlanStore,
    unfinalizePlanStore,
    generatePlainText,
    bindManualApplicationPlanPanel
  };
});
