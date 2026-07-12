(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2213ImpactScopeConflictCheckCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const APPROVAL_STORAGE_KEY = "hashimotoKeibaAi.phase22.eligibleRuleManualApprovalManagement.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.preApplicationImpactScopeConflictCheck.v1";
  const PROTECTED_STORAGE_KEYS = [APPROVAL_STORAGE_KEY, STORAGE_KEY];
  const CONFLICT_TYPES = ["none", "condition_overlap", "logic_overlap", "priority_conflict", "exclusion_conflict", "data_scope_conflict", "validity_period_conflict", "duplicate_rule", "unknown"];
  const CONFLICT_SEVERITIES = ["info", "low", "medium", "high", "critical"];
  const SAFETY_WARNINGS = ["no_warning", "review_required", "manual_resolution_required", "application_blocked"];
  const CHECK_STATUSES = ["draft", "checking", "conflict_found", "cleared", "blocked", "cancelled", "expired"];
  const DECISION_RESULTS = ["pending", "no_conflict", "resolvable", "unresolved", "blocked"];
  const TERMINAL_STATUSES = ["cleared", "blocked", "cancelled", "expired"];
  const ALLOWED_TRANSITIONS = {
    draft: ["checking", "cancelled"],
    checking: ["conflict_found", "cleared", "blocked", "cancelled"],
    conflict_found: ["checking", "cleared", "blocked", "cancelled"],
    cleared: [],
    blocked: [],
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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "impact";
  }

  function stableImpactId(approval) {
    return `phase22-13-impact-${stableSlug(approval.approvalId || approval.targetImprovementRuleId || approval.name || "approval")}`;
  }

  function normalizeTokens(value) {
    return text(value).toLowerCase().split(/[\s,、/／|｜・]+/).map(text).filter(Boolean);
  }

  function overlapRatio(a, b) {
    const left = Array.from(new Set(normalizeTokens(a)));
    const right = Array.from(new Set(normalizeTokens(b)));
    if (!left.length || !right.length) return 0;
    const matches = left.filter((token) => right.includes(token)).length;
    return Math.round((matches / Math.max(left.length, right.length)) * 100);
  }

  function overlapKind(a, b) {
    const ratio = overlapRatio(a, b);
    if (!ratio) return "none";
    return ratio === 100 ? "exact" : "partial";
  }

  function rangesOverlap(startA, endA, startB, endB) {
    if (!startA || !endA || !startB || !endB) return false;
    return startA <= endB && startB <= endA;
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
      automaticPriorityChange: false,
      automaticRuleMutation: false
    };
  }

  function normalizeApproval(approval = {}) {
    return {
      approvalId: text(approval.approvalId),
      name: text(approval.name),
      description: text(approval.description),
      targetReviewId: text(approval.targetReviewId),
      targetValidationPlanId: text(approval.targetValidationPlanId),
      targetImprovementRuleId: text(approval.targetImprovementRuleId),
      approvalStatus: text(approval.approvalStatus || "draft"),
      applicationStatus: text(approval.applicationStatus || "not_applied"),
      finalApprover: text(approval.finalApprover),
      approvedAt: text(approval.approvedAt),
      approvalConditions: text(approval.approvalConditions),
      effectiveStartDate: text(approval.effectiveStartDate),
      effectiveEndDate: text(approval.effectiveEndDate),
      plannedScope: text(approval.plannedScope),
      targetRaceConditions: text(approval.targetRaceConditions),
      targetLogic: text(approval.targetLogic),
      targetDataScope: text(approval.targetDataScope),
      constraints: text(approval.constraints),
      prohibitedConditions: text(approval.prohibitedConditions),
      priority: text(approval.priority || approval.rulePriority),
      existingRules: Array.isArray(approval.existingRules) ? approval.existingRules : []
    };
  }

  function normalizeApprovalStore(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      approvals: Array.isArray(input.approvals) ? input.approvals.map(normalizeApproval).filter((approval) => approval.approvalId) : []
    };
  }

  function loadApprovalStore(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { approvalStore: normalizeApprovalStore(), parseError: false };
    const raw = targetStorage.getItem(APPROVAL_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { approvalStore: normalizeApprovalStore(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function approvedNotAppliedApprovals(approvalStore) {
    return (approvalStore.approvals || []).filter((approval) => approval.approvalStatus === "approved" && approval.applicationStatus === "not_applied" && approval.approvalId);
  }

  function normalizeExistingRule(rule = {}) {
    return {
      ruleId: text(rule.ruleId || rule.targetImprovementRuleId || rule.approvalId),
      name: text(rule.name),
      targetRaceConditions: text(rule.targetRaceConditions),
      targetLogic: text(rule.targetLogic),
      targetDataScope: text(rule.targetDataScope),
      plannedScope: text(rule.plannedScope),
      effectiveStartDate: text(rule.effectiveStartDate),
      effectiveEndDate: text(rule.effectiveEndDate),
      priority: text(rule.priority || rule.rulePriority),
      exclusionConditions: text(rule.exclusionConditions || rule.prohibitedConditions),
      severityHint: CONFLICT_SEVERITIES.includes(rule.severityHint) ? rule.severityHint : ""
    };
  }

  function normalizeComparison(input = {}) {
    return {
      existingRuleId: text(input.existingRuleId),
      existingRuleName: text(input.existingRuleName),
      conflictType: CONFLICT_TYPES.includes(input.conflictType) ? input.conflictType : "unknown",
      severity: CONFLICT_SEVERITIES.includes(input.severity) ? input.severity : "medium",
      conditionOverlapRate: number(input.conditionOverlapRate, 0),
      logicOverlapRate: number(input.logicOverlapRate, 0),
      dataScopeOverlapRate: number(input.dataScopeOverlapRate, 0),
      overlapKind: text(input.overlapKind || "unknown"),
      conflictReason: text(input.conflictReason),
      impactDescription: text(input.impactDescription),
      mitigationPlan: text(input.mitigationPlan),
      resolved: Boolean(input.resolved)
    };
  }

  function makeComparison(existingRule, conflictType, severity, approval, reason) {
    return normalizeComparison({
      existingRuleId: existingRule.ruleId,
      existingRuleName: existingRule.name,
      conflictType,
      severity,
      conditionOverlapRate: overlapRatio(approval.targetRaceConditions || approval.plannedScope, existingRule.targetRaceConditions || existingRule.plannedScope),
      logicOverlapRate: overlapRatio(approval.targetLogic, existingRule.targetLogic),
      dataScopeOverlapRate: overlapRatio(approval.targetDataScope, existingRule.targetDataScope),
      overlapKind: overlapKind(`${approval.targetRaceConditions} ${approval.targetLogic} ${approval.targetDataScope}`, `${existingRule.targetRaceConditions} ${existingRule.targetLogic} ${existingRule.targetDataScope}`),
      conflictReason: reason,
      impactDescription: "適用前に人が影響範囲と優先順位を確認してください。",
      resolved: false
    });
  }

  function compareExistingRules(approvalInput, existingRulesInput = []) {
    const approval = normalizeApproval(approvalInput);
    const existingRules = existingRulesInput.map(normalizeExistingRule).filter((rule) => rule.ruleId || rule.name);
    if (!existingRules.length) {
      return [normalizeComparison({
        existingRuleId: "unknown",
        existingRuleName: "既存ルール未取得",
        conflictType: "unknown",
        severity: "medium",
        conflictReason: "既存ルール一覧が取得できないため安全側で確認が必要です。",
        impactDescription: "既存ルールとの競合を手動確認してください。",
        overlapKind: "unknown"
      })];
    }
    const comparisons = [];
    existingRules.forEach((rule) => {
      if (rule.ruleId && rule.ruleId === approval.targetImprovementRuleId) comparisons.push(makeComparison(rule, "duplicate_rule", "critical", approval, "同一改善ルールIDが既存ルールに存在します。"));
      const conditionKind = overlapKind(approval.targetRaceConditions || approval.plannedScope, rule.targetRaceConditions || rule.plannedScope);
      if (conditionKind !== "none") comparisons.push(makeComparison(rule, "condition_overlap", conditionKind === "exact" ? "high" : "medium", approval, `対象条件が${conditionKind === "exact" ? "完全" : "部分"}一致しています。`));
      const logicKind = overlapKind(approval.targetLogic, rule.targetLogic);
      if (logicKind !== "none") comparisons.push(makeComparison(rule, "logic_overlap", logicKind === "exact" ? "high" : "medium", approval, `対象ロジックが${logicKind === "exact" ? "完全" : "部分"}一致しています。`));
      const dataKind = overlapKind(approval.targetDataScope, rule.targetDataScope);
      if (dataKind !== "none") comparisons.push(makeComparison(rule, "data_scope_conflict", dataKind === "exact" ? "high" : "medium", approval, `対象データ範囲が${dataKind === "exact" ? "完全" : "部分"}一致しています。`));
      if (approval.priority && rule.priority && approval.priority === rule.priority && (conditionKind !== "none" || logicKind !== "none")) comparisons.push(makeComparison(rule, "priority_conflict", "medium", approval, "重複条件で同順位のため優先順位確認が必要です。"));
      if (approval.prohibitedConditions && rule.exclusionConditions && overlapKind(approval.prohibitedConditions, rule.exclusionConditions) !== "none") comparisons.push(makeComparison(rule, "exclusion_conflict", "high", approval, "排他条件または禁止条件が重複しています。"));
      if (rangesOverlap(approval.effectiveStartDate, approval.effectiveEndDate, rule.effectiveStartDate, rule.effectiveEndDate)) comparisons.push(makeComparison(rule, "validity_period_conflict", "medium", approval, "有効期間が既存ルールと重なっています。"));
    });
    return comparisons.length ? comparisons.sort((a, b) => `${a.existingRuleId}-${a.conflictType}`.localeCompare(`${b.existingRuleId}-${b.conflictType}`)) : [normalizeComparison({ conflictType: "none", severity: "info", conflictReason: "既存ルールとの明確な競合は検出されていません。", resolved: true })];
  }

  function inferSafetyWarning(comparisons) {
    if (!comparisons.length) return "review_required";
    if (comparisons.some((item) => item.conflictType === "unknown")) return "review_required";
    if (comparisons.some((item) => item.severity === "critical")) return "application_blocked";
    if (comparisons.some((item) => ["high", "medium"].includes(item.severity) && !item.resolved)) return "manual_resolution_required";
    return "no_warning";
  }

  function buildImpactFromApproval(approvalInput, approvalStore = {}, savedImpact = {}) {
    const approval = normalizeApproval(approvalInput);
    const existingRules = Array.isArray(savedImpact.existingRules) && savedImpact.existingRules.length ? savedImpact.existingRules.map(normalizeExistingRule) : approval.existingRules.map(normalizeExistingRule);
    const comparisons = Array.isArray(savedImpact.comparisons) && savedImpact.comparisons.length ? savedImpact.comparisons.map(normalizeComparison) : compareExistingRules(approval, existingRules);
    const impactId = text(savedImpact.impactId) || stableImpactId(approval);
    const checkStatus = CHECK_STATUSES.includes(savedImpact.checkStatus) ? savedImpact.checkStatus : "draft";
    const decisionResult = DECISION_RESULTS.includes(savedImpact.decisionResult) ? savedImpact.decisionResult : "pending";
    return {
      impactId,
      name: text(savedImpact.name) || `${approval.name || approval.targetImprovementRuleId} 影響確認`,
      description: text(savedImpact.description) || `${approval.description || approval.approvalId} の適用前影響範囲と競合を人が確認する`,
      targetApprovalId: approval.approvalId,
      targetReviewId: approval.targetReviewId,
      targetValidationPlanId: approval.targetValidationPlanId,
      targetImprovementRuleId: approval.targetImprovementRuleId,
      finalApprover: approval.finalApprover,
      approvedAt: approval.approvedAt,
      approvalConditions: approval.approvalConditions,
      effectiveStartDate: approval.effectiveStartDate,
      effectiveEndDate: approval.effectiveEndDate,
      targetRaceConditions: text(savedImpact.targetRaceConditions) || approval.targetRaceConditions,
      targetLogic: text(savedImpact.targetLogic) || approval.targetLogic,
      targetDataScope: text(savedImpact.targetDataScope) || approval.targetDataScope,
      plannedScope: text(savedImpact.plannedScope) || approval.plannedScope,
      impactScope: {
        racecourse: text(savedImpact.impactScope && savedImpact.impactScope.racecourse),
        course: text(savedImpact.impactScope && savedImpact.impactScope.course),
        distance: text(savedImpact.impactScope && savedImpact.impactScope.distance),
        trackCondition: text(savedImpact.impactScope && savedImpact.impactScope.trackCondition),
        raceClass: text(savedImpact.impactScope && savedImpact.impactScope.raceClass),
        raceConditions: text(savedImpact.impactScope && savedImpact.impactScope.raceConditions) || approval.targetRaceConditions,
        logic: text(savedImpact.impactScope && savedImpact.impactScope.logic) || approval.targetLogic,
        metrics: text(savedImpact.impactScope && savedImpact.impactScope.metrics),
        data: text(savedImpact.impactScope && savedImpact.impactScope.data) || approval.targetDataScope,
        period: text(savedImpact.impactScope && savedImpact.impactScope.period) || `${approval.effectiveStartDate}〜${approval.effectiveEndDate}`
      },
      conditionOverlapRate: number(savedImpact.conditionOverlapRate, Math.max(...comparisons.map((item) => item.conditionOverlapRate), 0)),
      logicOverlapRate: number(savedImpact.logicOverlapRate, Math.max(...comparisons.map((item) => item.logicOverlapRate), 0)),
      dataScopeOverlapRate: number(savedImpact.dataScopeOverlapRate, Math.max(...comparisons.map((item) => item.dataScopeOverlapRate), 0)),
      priority: text(savedImpact.priority || approval.priority),
      priorityReason: text(savedImpact.priorityReason),
      samePriorityHandling: text(savedImpact.samePriorityHandling),
      exclusionConditions: text(savedImpact.exclusionConditions || approval.prohibitedConditions),
      combinedUseBanConditions: text(savedImpact.combinedUseBanConditions),
      prerequisites: text(savedImpact.prerequisites),
      followUpConditions: text(savedImpact.followUpConditions),
      existingRules,
      comparisons,
      conflictReason: text(savedImpact.conflictReason),
      impactDescription: text(savedImpact.impactDescription),
      mitigationPlan: text(savedImpact.mitigationPlan),
      resolutionOwner: text(savedImpact.resolutionOwner),
      resolutionDueDate: text(savedImpact.resolutionDueDate),
      blockReason: text(savedImpact.blockReason),
      checkMemo: text(savedImpact.checkMemo),
      safetyWarning: SAFETY_WARNINGS.includes(savedImpact.safetyWarning) ? savedImpact.safetyWarning : inferSafetyWarning(comparisons),
      checkStatus,
      decisionResult,
      checker: text(savedImpact.checker),
      checkedAt: text(savedImpact.checkedAt),
      checkComment: text(savedImpact.checkComment),
      history: Array.isArray(savedImpact.history) ? savedImpact.history : [],
      createdFromApprovalSavedAt: text(approvalStore.savedAt),
      sourceApprovalFinalized: Boolean(approvalStore.finalized),
      safety: buildSafety()
    };
  }

  function unresolvedBySeverity(impact, severities) {
    return (impact.comparisons || []).filter((item) => severities.includes(item.severity) && !item.resolved && item.conflictType !== "none");
  }

  function validateImpact(impactInput) {
    const impact = impactInput || {};
    const errors = [];
    if (!text(impact.impactId)) errors.push("影響確認IDが不足しています。");
    if (!text(impact.name)) errors.push("名称が不足しています。");
    if (!text(impact.description)) errors.push("説明が不足しています。");
    if (!text(impact.targetApprovalId)) errors.push("対象承認案件IDが不足しています。");
    if (!text(impact.targetReviewId)) errors.push("対象レビューIDが不足しています。");
    if (!text(impact.targetValidationPlanId)) errors.push("対象検証計画IDが不足しています。");
    if (!text(impact.targetImprovementRuleId)) errors.push("対象改善ルールIDが不足しています。");
    if (!CHECK_STATUSES.includes(impact.checkStatus)) errors.push("確認状態が不正です。");
    if (!DECISION_RESULTS.includes(impact.decisionResult)) errors.push("判定結果が不正です。");
    if (!SAFETY_WARNINGS.includes(impact.safetyWarning)) errors.push("安全警告が不正です。");
    if (impact.effectiveStartDate && impact.effectiveEndDate && impact.effectiveEndDate < impact.effectiveStartDate) errors.push("有効期限が有効開始日より前です。");
    const comparisons = Array.isArray(impact.comparisons) ? impact.comparisons.map(normalizeComparison) : [];
    if (!comparisons.length) errors.push("既存ルールとの比較結果が不足しています。");
    if (impact.decisionResult === "no_conflict") {
      if (comparisons.some((item) => item.severity === "critical" && !item.resolved)) errors.push("critical競合があるためno_conflictにできません。");
      if (unresolvedBySeverity({ comparisons }, ["medium", "high", "critical"]).length) errors.push("critical / high / mediumの未解決競合があるためno_conflictにできません。");
      if (impact.safetyWarning === "application_blocked") errors.push("application_blockedではno_conflictにできません。");
    }
    if (impact.decisionResult === "resolvable" && (!text(impact.mitigationPlan) || !text(impact.resolutionOwner) || !text(impact.resolutionDueDate))) errors.push("resolvableには回避策、解決担当者、解決期限が必要です。");
    if (impact.decisionResult === "blocked" && !text(impact.blockReason)) errors.push("blockedにはブロック理由が必要です。");
    if (impact.checkStatus === "cleared") {
      if (!["no_conflict", "resolvable"].includes(impact.decisionResult)) errors.push("clearedにはno_conflictまたはresolvable判定が必要です。");
      if (unresolvedBySeverity({ comparisons }, ["high", "critical"]).length) errors.push("high / criticalの未解決競合があるためclearedにできません。");
      if (!text(impact.checker) || !text(impact.checkedAt) || !text(impact.checkComment)) errors.push("clearedには人による確認記録が必要です。");
    }
    if (impact.checkStatus === "blocked" && !text(impact.blockReason)) errors.push("blockedにはブロック理由が必要です。");
    if (impact.checkedAt && Number.isNaN(Date.parse(impact.checkedAt))) errors.push("確認日時が不正です。");
    if (impact.resolutionDueDate && Number.isNaN(Date.parse(impact.resolutionDueDate))) errors.push("解決期限が不正です。");
    const safety = impact.safety || {};
    if (safety.automaticApply || safety.automaticLearning || safety.automaticUpdate || safety.autoExecution || safety.publicUrl || safety.githubPages || safety.externalApi || safety.automaticPriorityChange || safety.automaticRuleMutation) errors.push("安全条件に反する自動適用・外部公開フラグがあります。");
    return { ok: errors.length === 0, errors };
  }

  function canTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] || []).includes(to);
  }

  function transitionImpact(impact, toStatus) {
    if (!CHECK_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", impact };
    if (!canTransition(impact.checkStatus, toStatus)) return { transitioned: false, reason: "invalid_transition", impact };
    return { transitioned: true, impact: { ...impact, checkStatus: toStatus, safety: buildSafety() } };
  }

  function canEditImpact(impact) {
    return !TERMINAL_STATUSES.includes(impact.checkStatus);
  }

  function applyImpactEdit(impact, changes) {
    if (!canEditImpact(impact)) return { updated: false, reason: "locked_impact", impact };
    return { updated: true, impact: { ...impact, ...changes, safety: buildSafety() } };
  }

  function createRecheckCase(impact, suffix) {
    return {
      ...impact,
      impactId: `${stableImpactId({ approvalId: impact.targetApprovalId })}-recheck-${stableSlug(suffix || new Date(0).toISOString())}`,
      checkStatus: "draft",
      decisionResult: "pending",
      checker: "",
      checkedAt: "",
      checkComment: "",
      history: [...(impact.history || []), { impactId: impact.impactId, createdAt: text(suffix), reason: "再確認は新規案件として作成" }],
      safety: buildSafety()
    };
  }

  function generateImpactsFromApprovals(approvalStore, savedImpacts = []) {
    const savedByApproval = new Map((savedImpacts || []).map((impact) => [text(impact.targetApprovalId), impact]));
    return approvedNotAppliedApprovals(approvalStore)
      .map((approval) => buildImpactFromApproval(approval, approvalStore, savedByApproval.get(approval.approvalId) || {}))
      .sort((a, b) => a.impactId.localeCompare(b.impactId));
  }

  function snapshotApprovals(approvalStore) {
    return {
      savedAt: approvalStore.savedAt,
      finalized: approvalStore.finalized,
      approvalIds: approvedNotAppliedApprovals(approvalStore).map((approval) => approval.approvalId).sort()
    };
  }

  function isValidSavedStore(input) {
    return Boolean(input && typeof input === "object" && (!input.impacts || Array.isArray(input.impacts)));
  }

  function normalizeImpactStore(input = {}, approvalStore = normalizeApprovalStore()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase2212SavedAt: text(input.sourcePhase2212SavedAt || approvalStore.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || approvalStore.sourceRaceKey),
      impacts: generateImpactsFromApprovals(approvalStore, input.impacts || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      approvalSnapshot: input.approvalSnapshot || snapshotApprovals(approvalStore)
    };
  }

  function loadSavedImpactStore(storage, approvalStore) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizeImpactStore({}, approvalStore), parseError: false, rejected: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    if (raw && !parsed) return { store: normalizeImpactStore({}, approvalStore), parseError: true, rejected: true };
    if (parsed && !isValidSavedStore(parsed)) return { store: normalizeImpactStore({}, approvalStore), parseError: false, rejected: true };
    return { store: normalizeImpactStore(parsed || {}, approvalStore), parseError: false, rejected: false };
  }

  function detectPhase2212Changes(approvalStore, store) {
    const snapshot = store.approvalSnapshot || {};
    const currentIds = approvedNotAppliedApprovals(approvalStore).map((approval) => approval.approvalId).sort().join("|");
    const savedIds = (snapshot.approvalIds || []).slice().sort().join("|");
    return Boolean(snapshot.savedAt && (snapshot.savedAt !== approvalStore.savedAt || savedIds !== currentIds || Boolean(snapshot.finalized) !== Boolean(approvalStore.finalized)));
  }

  function buildWarnings({ approvalStore = normalizeApprovalStore(), store = normalizeImpactStore({}, approvalStore), parseErrors = [] } = {}) {
    const warnings = [];
    if (!approvedNotAppliedApprovals(approvalStore).length) warnings.push({ level: "warning", message: "Phase22-12のapproved / not_applied承認案件がありません。" });
    if (!approvalStore.finalized) warnings.push({ level: "notice", message: "Phase22-12承認管理は未確定です。影響確認前に確認してください。" });
    if (detectPhase2212Changes(approvalStore, store)) warnings.push({ level: "warning", message: "Phase22-12データ更新の可能性があります。再読込してください。" });
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ level: "error", message }));
    (store.impacts || []).forEach((impact) => {
      validateImpact(impact).errors.forEach((message) => warnings.push({ level: "error", message: `${impact.impactId}: ${message}` }));
    });
    if ((store.impacts || []).some((impact) => impact.checkStatus === "cleared" || impact.decisionResult === "no_conflict")) warnings.push({ level: "notice", message: "cleared / no_conflictでも未適用・自動反映なしです。" });
    return warnings;
  }

  function buildPayload(store, now = new Date()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: now.toISOString(),
      sourcePhase2212SavedAt: text(store.sourcePhase2212SavedAt),
      sourceRaceKey: text(store.sourceRaceKey),
      impacts: (store.impacts || []).map((impact) => ({ ...impact, safety: buildSafety() })).sort((a, b) => a.impactId.localeCompare(b.impactId)),
      finalized: Boolean(store.finalized),
      finalizedAt: text(store.finalizedAt),
      confirmerName: text(store.confirmerName),
      approvalSnapshot: store.approvalSnapshot || {}
    };
  }

  function saveImpactStore(storage, store, now = new Date()) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, reason: "storage_unavailable" };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(buildPayload(store, now)));
      return { saved: true };
    } catch (error) {
      return { saved: false, reason: error && error.name === "QuotaExceededError" ? "quota_exceeded" : "storage_error" };
    }
  }

  function deleteSavedImpactStore(storage, confirmDelete) {
    if (confirmDelete && !confirmDelete()) return { deleted: false, reason: "cancelled" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function canFinalize(store) {
    const errors = [];
    (store.impacts || []).forEach((impact) => {
      const result = validateImpact(impact);
      if (!result.ok) errors.push(...result.errors.map((message) => `${impact.impactId}: ${message}`));
    });
    if (!(store.impacts || []).length) errors.push("影響確認案件がありません。");
    return { ok: errors.length === 0, errors };
  }

  function finalizeImpactStore(store, confirmerName, now = new Date()) {
    const result = canFinalize(store);
    if (!result.ok) return { finalized: false, errors: result.errors, store };
    return { finalized: true, errors: [], store: { ...store, finalized: true, finalizedAt: now.toISOString(), confirmerName: text(confirmerName) } };
  }

  function unfinalizeImpactStore(store) {
    return { ...store, finalized: false, finalizedAt: "" };
  }

  function generatePlainText(store) {
    const lines = [];
    lines.push("Phase22-13 適用前影響範囲・競合確認");
    lines.push(`保存キー: ${STORAGE_KEY}`);
    lines.push("cleared / no_conflictでも未適用・自動反映なし");
    (store.impacts || []).forEach((impact) => {
      lines.push("");
      lines.push(`${impact.impactId} / ${impact.name}`);
      lines.push(`承認案件: ${impact.targetApprovalId}`);
      lines.push(`改善ルール: ${impact.targetImprovementRuleId}`);
      lines.push(`確認状態: ${impact.checkStatus} / 判定: ${impact.decisionResult}`);
      lines.push(`安全警告: ${impact.safetyWarning}`);
      lines.push(`比較件数: ${(impact.comparisons || []).length}`);
    });
    return lines.join("\n");
  }

  function createElement(doc, tag, className, textValue) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function bindImpactConflictPanel(options = {}) {
    const doc = options.document || (root && root.document);
    if (!doc) return { initialized: false, reason: "document_unavailable" };
    const rootNode = doc.querySelector("#phase22-impact-conflict-check-core");
    if (!rootNode || rootNode.dataset.phase2213Bound === "true") return { initialized: false, reason: rootNode ? "already_bound" : "root_missing" };
    rootNode.dataset.phase2213Bound = "true";
    const storage = getStorage(options.storage);
    const nodes = {
      message: doc.querySelector("#phase22-impact-message"),
      finalizedStatus: doc.querySelector("#phase22-impact-finalized-status"),
      summary: doc.querySelector("#phase22-impact-summary"),
      warningList: doc.querySelector("#phase22-impact-warning-list"),
      list: doc.querySelector("#phase22-impact-list"),
      confirmer: doc.querySelector("#phase22-impact-confirmer"),
      textOutput: doc.querySelector("#phase22-impact-text-output")
    };
    const approvalLoad = loadApprovalStore(storage);
    let savedLoad = loadSavedImpactStore(storage, approvalLoad.approvalStore);
    let state = { approvalLoad, savedLoad, store: savedLoad.store };

    function setMessage(message, kind = "info") {
      if (!nodes.message) return;
      nodes.message.textContent = message;
      nodes.message.dataset.kind = kind;
    }

    function renderWarnings() {
      if (!nodes.warningList) return;
      nodes.warningList.replaceChildren();
      buildWarnings({
        approvalStore: state.approvalLoad.approvalStore,
        store: state.store,
        parseErrors: [
          state.approvalLoad.parseError ? "破損データ読み込み: Phase22-12" : "",
          state.savedLoad.parseError || state.savedLoad.rejected ? "破損データ読み込み: Phase22-13" : ""
        ]
      }).forEach((warning) => nodes.warningList.appendChild(createElement(doc, "div", `phase22-impact-warning ${warning.level}`, warning.message)));
    }

    function updateField(impactId, field, value) {
      state.store = {
        ...state.store,
        impacts: (state.store.impacts || []).map((impact) => {
          if (impact.impactId !== impactId || !canEditImpact(impact)) return impact;
          return { ...impact, [field]: value, safety: buildSafety() };
        })
      };
      render();
    }

    function renderList() {
      if (!nodes.list) return;
      nodes.list.replaceChildren();
      const table = createElement(doc, "div", "phase22-impact-table");
      const headers = ["ID", "承認", "改善ルール", "確認状態", "判定", "警告", "競合", "重大度", "条件%", "ロジック%", "データ%", "確認者", "確認日時", "回避策", "担当", "期限", "ブロック理由", "未適用"];
      const head = createElement(doc, "div", "phase22-impact-row head");
      headers.forEach((label) => head.appendChild(createElement(doc, "span", "", label)));
      table.appendChild(head);
      (state.store.impacts || []).forEach((impact) => {
        const firstConflict = (impact.comparisons || [])[0] || {};
        const row = createElement(doc, "div", "phase22-impact-row");
        row.appendChild(createElement(doc, "span", "", impact.impactId));
        row.appendChild(createElement(doc, "span", "", impact.targetApprovalId));
        row.appendChild(createElement(doc, "span", "", impact.targetImprovementRuleId));
        const status = createElement(doc, "select");
        CHECK_STATUSES.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === impact.checkStatus;
          status.appendChild(option);
        });
        status.disabled = !canEditImpact(impact);
        status.addEventListener("change", () => updateField(impact.impactId, "checkStatus", status.value));
        row.appendChild(status);
        const decision = createElement(doc, "select");
        DECISION_RESULTS.forEach((value) => {
          const option = createElement(doc, "option", "", value);
          option.value = value;
          option.selected = value === impact.decisionResult;
          decision.appendChild(option);
        });
        decision.disabled = !canEditImpact(impact);
        decision.addEventListener("change", () => updateField(impact.impactId, "decisionResult", decision.value));
        row.appendChild(decision);
        row.appendChild(createElement(doc, "span", "", impact.safetyWarning));
        row.appendChild(createElement(doc, "span", "", firstConflict.conflictType || "none"));
        row.appendChild(createElement(doc, "span", "", firstConflict.severity || "info"));
        row.appendChild(createElement(doc, "span", "", String(impact.conditionOverlapRate || 0)));
        row.appendChild(createElement(doc, "span", "", String(impact.logicOverlapRate || 0)));
        row.appendChild(createElement(doc, "span", "", String(impact.dataScopeOverlapRate || 0)));
        ["checker", "checkedAt", "mitigationPlan", "resolutionOwner", "resolutionDueDate", "blockReason"].forEach((field) => {
          const input = createElement(doc, "input");
          input.value = impact[field] || "";
          input.disabled = !canEditImpact(impact);
          input.addEventListener("input", () => updateField(impact.impactId, field, input.value));
          row.appendChild(input);
        });
        row.appendChild(createElement(doc, "span", "", "未適用・自動反映なし"));
        table.appendChild(row);
      });
      nodes.list.appendChild(table);
    }

    function render() {
      if (nodes.summary) nodes.summary.textContent = `approved / not_applied ${approvedNotAppliedApprovals(state.approvalLoad.approvalStore).length}件 / 影響確認 ${(state.store.impacts || []).length}件 / cleared ${(state.store.impacts || []).filter((impact) => impact.checkStatus === "cleared").length}件`;
      if (nodes.finalizedStatus) {
        nodes.finalizedStatus.textContent = state.store.finalized ? `確定済み ${state.store.finalizedAt}` : "未確定";
        nodes.finalizedStatus.dataset.kind = state.store.finalized ? "success" : "warning";
      }
      renderWarnings();
      renderList();
    }

    function reload() {
      state.approvalLoad = loadApprovalStore(storage);
      state.savedLoad = loadSavedImpactStore(storage, state.approvalLoad.approvalStore);
      state.store = state.savedLoad.store;
      setMessage("Phase22-12のapproved / not_applied承認案件から影響確認案件を再生成しました。", "success");
      render();
    }

    function save() {
      state.store = { ...state.store, confirmerName: nodes.confirmer ? nodes.confirmer.value : state.store.confirmerName };
      const result = saveImpactStore(storage, state.store);
      setMessage(result.saved ? "Phase22-13影響確認データを保存しました。" : result.reason === "quota_exceeded" ? "localStorageの容量が不足しているため保存できませんでした。古い保存データを整理してから再度保存してください。" : "保存できませんでした。", result.saved ? "success" : "error");
    }

    function restore() {
      state.savedLoad = loadSavedImpactStore(storage, state.approvalLoad.approvalStore);
      state.store = state.savedLoad.store;
      setMessage(state.savedLoad.parseError || state.savedLoad.rejected ? "Phase22-13保存データが不正なため初期状態で復元しました。" : "Phase22-13保存データを復元しました。", state.savedLoad.parseError || state.savedLoad.rejected ? "warning" : "success");
      render();
    }

    function reset() {
      const confirmReset = options.confirmReset || (() => root && root.confirm && root.confirm("Phase22-13の保存データだけを削除します。Phase22-1〜22-12は削除しません。よろしいですか？"));
      const result = deleteSavedImpactStore(storage, confirmReset);
      if (result.deleted) reload();
      setMessage(result.deleted ? "Phase22-13のみ初期化しました。" : "初期化を取り消しました。", result.deleted ? "success" : "warning");
    }

    function finalize() {
      const result = finalizeImpactStore(state.store, nodes.confirmer ? nodes.confirmer.value : "");
      if (!result.finalized) {
        setMessage(`確定できません: ${result.errors[0] || "未確認項目があります。"}`, "error");
        render();
        return;
      }
      state.store = result.store;
      setMessage("Phase22-13影響確認を確定しました。自動適用は行いません。", "success");
      render();
    }

    function unlock() {
      state.store = unfinalizeImpactStore(state.store);
      setMessage("確定解除しました。自動適用は行いません。", "warning");
      render();
    }

    function outputText() {
      if (nodes.textOutput) nodes.textOutput.value = generatePlainText(state.store);
      setMessage("プレーンテキストを生成しました。", "success");
    }

    const actions = {
      "#phase22-impact-reload": reload,
      "#phase22-impact-save": save,
      "#phase22-impact-restore": restore,
      "#phase22-impact-reset": reset,
      "#phase22-impact-finalize": finalize,
      "#phase22-impact-unlock": unlock,
      "#phase22-impact-text": outputText
    };
    Object.keys(actions).forEach((selector) => {
      const button = doc.querySelector(selector);
      if (button) button.addEventListener("click", actions[selector]);
    });
    render();
    return { initialized: true, state, actions, nodes };
  }

  if (root && root.document) {
    const start = () => bindImpactConflictPanel();
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    SCHEMA_VERSION,
    APPROVAL_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    CONFLICT_TYPES,
    CONFLICT_SEVERITIES,
    SAFETY_WARNINGS,
    CHECK_STATUSES,
    DECISION_RESULTS,
    normalizeApprovalStore,
    loadApprovalStore,
    approvedNotAppliedApprovals,
    normalizeExistingRule,
    normalizeComparison,
    compareExistingRules,
    inferSafetyWarning,
    stableImpactId,
    buildImpactFromApproval,
    validateImpact,
    canTransition,
    transitionImpact,
    canEditImpact,
    applyImpactEdit,
    createRecheckCase,
    generateImpactsFromApprovals,
    normalizeImpactStore,
    loadSavedImpactStore,
    detectPhase2212Changes,
    buildWarnings,
    buildPayload,
    saveImpactStore,
    deleteSavedImpactStore,
    canFinalize,
    finalizeImpactStore,
    unfinalizeImpactStore,
    generatePlainText,
    bindImpactConflictPanel
  };
});
