(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase229ImprovementRuleManagementCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const LEARNING_REVIEW_STORAGE_KEY = "hashimotoKeibaAi.phase22.learningCandidateReviewSummary.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.improvementRuleManagement.v1";
  const PROTECTED_STORAGE_KEYS = [LEARNING_REVIEW_STORAGE_KEY, STORAGE_KEY];
  const MANAGEMENT_STATUSES = ["draft", "approved", "validating", "suspended", "rejected", "expired"];
  const VALIDATION_STATUSES = ["notStarted", "readyForManualValidation", "inReview", "validated", "needsRevision", "failed"];
  const LOGIC_TARGETS = {
    "AI評価点": "aiScore",
    "危険人気馬判定": "dangerousPopular",
    "穴馬判定": "longshot",
    "神穴候補判定": "divineLongshot",
    "買い目構成": "ticketStructure",
    "予算配分": "budgetAllocation",
    "購入直前判断": "executionDecision"
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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "rule";
  }

  function stableRuleId(candidate) {
    return `phase22-9-rule-${stableSlug(candidate.id || candidate.title || candidate.category)}`;
  }

  function normalizeCandidate(input = {}) {
    return {
      id: text(input.id),
      category: text(input.category),
      title: text(input.title),
      body: text(input.body),
      evidence: text(input.evidence),
      targetHorse: text(input.targetHorse),
      targetTicketType: text(input.targetTicketType),
      targetEvaluation: text(input.targetEvaluation),
      outcome: text(input.outcome || "neutral"),
      importance: text(input.importance || "middle"),
      confidence: text(input.confidence || "medium"),
      scope: text(input.scope || "次回以降の手動確認候補"),
      nextAction: text(input.nextAction),
      approvalStatus: text(input.approvalStatus || "unconfirmed"),
      comment: text(input.comment)
    };
  }

  function normalizeLearningReview(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      candidates: Array.isArray(input.candidates) ? input.candidates.map(normalizeCandidate) : [],
      overallReview: input.overallReview || {},
      phase227Snapshot: input.phase227Snapshot || null
    };
  }

  function loadLearningReview(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { review: normalizeLearningReview(), parseError: false };
    const raw = targetStorage.getItem(LEARNING_REVIEW_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { review: normalizeLearningReview(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function approvedCandidates(review) {
    return (review.candidates || []).filter((candidate) => candidate.approvalStatus === "candidate");
  }

  function inferTargetLogic(candidate) {
    return LOGIC_TARGETS[candidate.category] || stableSlug(candidate.category || "manualReview");
  }

  function buildRuleFromCandidate(candidate, review = {}, savedRule = {}) {
    const normalized = normalizeCandidate(candidate);
    const ruleId = text(savedRule.ruleId) || stableRuleId(normalized);
    return {
      ruleId,
      name: text(savedRule.name) || normalized.title || `${normalized.category} 改善ルール候補`,
      description: text(savedRule.description) || normalized.body || normalized.nextAction,
      sourceCandidateId: normalized.id,
      sourceCategory: normalized.category,
      sourceEvidence: normalized.evidence,
      targetConditions: text(savedRule.targetConditions) || normalized.evidence || "手動確認で条件を補完",
      targetRaceConditions: text(savedRule.targetRaceConditions) || "同種条件のレースで手動検証",
      targetLogic: text(savedRule.targetLogic) || inferTargetLogic(normalized),
      applicationScope: text(savedRule.applicationScope) || normalized.scope || "Private Local manual validation only",
      effectiveStartDate: text(savedRule.effectiveStartDate),
      effectiveEndDate: text(savedRule.effectiveEndDate),
      validationStatus: VALIDATION_STATUSES.includes(savedRule.validationStatus) ? savedRule.validationStatus : "notStarted",
      managementStatus: MANAGEMENT_STATUSES.includes(savedRule.managementStatus) ? savedRule.managementStatus : "draft",
      verificationMemo: text(savedRule.verificationMemo),
      safety: {
        planOnly: true,
        protectedMode: true,
        privateLocal: true,
        automaticLearning: false,
        automaticApply: false,
        automaticUpdate: false,
        publicUrl: false,
        githubPages: false,
        externalApi: false,
        autoExecution: false
      },
      createdFromPhase228SavedAt: text(review.savedAt),
      sourceFinalizedAt: text(review.finalizedAt),
      updatedAt: text(savedRule.updatedAt)
    };
  }

  function validateRule(rule) {
    const errors = [];
    if (!text(rule.ruleId)) errors.push("改善ルールIDが不足しています。");
    if (!text(rule.name)) errors.push("名称が不足しています。");
    if (!text(rule.description)) errors.push("説明が不足しています。");
    if (!text(rule.sourceCandidateId)) errors.push("承認元候補IDが不足しています。");
    if (!text(rule.targetConditions)) errors.push("対象条件が不足しています。");
    if (!text(rule.targetRaceConditions)) errors.push("対象レース条件が不足しています。");
    if (!text(rule.targetLogic)) errors.push("対象ロジックが不足しています。");
    if (!text(rule.applicationScope)) errors.push("適用範囲が不足しています。");
    if (!MANAGEMENT_STATUSES.includes(rule.managementStatus)) errors.push("管理状態が不正です。");
    if (!VALIDATION_STATUSES.includes(rule.validationStatus)) errors.push("検証状態が不正です。");
    if (rule.effectiveStartDate && rule.effectiveEndDate && rule.effectiveStartDate > rule.effectiveEndDate) errors.push("有効期限が有効開始日より前です。");
    return { ok: errors.length === 0, errors };
  }

  function generateRulesFromApprovedCandidates(review, savedRules = []) {
    const savedByCandidate = new Map((savedRules || []).map((rule) => [text(rule.sourceCandidateId), rule]));
    return approvedCandidates(review).map((candidate) => buildRuleFromCandidate(candidate, review, savedByCandidate.get(candidate.id) || {}))
      .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  }

  function normalizePlan(input = {}, review = normalizeLearningReview()) {
    const rules = generateRulesFromApprovedCandidates(review, input.rules || []);
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase228SavedAt: text(input.sourcePhase228SavedAt || review.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || review.sourceRaceKey),
      rules,
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      reviewSnapshot: input.reviewSnapshot || snapshotReview(review)
    };
  }

  function snapshotReview(review) {
    return {
      savedAt: review.savedAt,
      sourceRaceKey: review.sourceRaceKey,
      finalized: review.finalized,
      finalizedAt: review.finalizedAt,
      approvedCandidateIds: approvedCandidates(review).map((candidate) => candidate.id).sort()
    };
  }

  function loadSavedRulePlan(storage, review) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { plan: normalizePlan({}, review), parseError: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { plan: normalizePlan(parsed || {}, review), parseError: Boolean(raw && !parsed) };
  }

  function detectPhase228Changes(review, plan) {
    const snapshot = plan && plan.reviewSnapshot;
    if (!snapshot) return [];
    const changes = [];
    if (snapshot.savedAt && snapshot.savedAt !== review.savedAt) changes.push("Phase22-8の保存時刻が変わっています。");
    if (Boolean(snapshot.finalized) !== Boolean(review.finalized)) changes.push("Phase22-8の確定状態が変わっています。");
    const before = (snapshot.approvedCandidateIds || []).join("|");
    const current = approvedCandidates(review).map((candidate) => candidate.id).sort().join("|");
    if (before !== current) changes.push("承認済み候補の一覧が変わっています。");
    return changes;
  }

  function buildWarnings({ review, plan, parseErrors = [] }) {
    const warnings = [];
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ severity: "error", message }));
    if (!review.finalized) warnings.push({ severity: "error", message: "Phase22-8が未確定です。" });
    if (!approvedCandidates(review).length) warnings.push({ severity: "warning", message: "承認済み学習候補がありません。" });
    plan.rules.forEach((rule) => {
      const validation = validateRule(rule);
      validation.errors.forEach((message) => warnings.push({ severity: "error", message: `${rule.ruleId}: ${message}` }));
    });
    detectPhase228Changes(review, plan).forEach((message) => warnings.push({ severity: "warning", message: `Phase22-8更新検知: ${message}` }));
    if (plan.rules.some((rule) => rule.managementStatus === "approved")) warnings.push({ severity: "notice", message: "approved状態でも自動適用は行いません。" });
    return warnings;
  }

  function buildPayload({ review, plan, warnings }) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      sourcePhase228SavedAt: review.savedAt,
      sourceRaceKey: review.sourceRaceKey,
      rules: plan.rules.map((rule) => ({ ...rule, updatedAt: new Date().toISOString() })).sort((a, b) => a.ruleId.localeCompare(b.ruleId)),
      finalized: Boolean(plan.finalized),
      finalizedAt: text(plan.finalizedAt),
      confirmerName: text(plan.confirmerName),
      warnings,
      reviewSnapshot: snapshotReview(review),
      safety: {
        planOnly: true,
        protectedMode: true,
        privateLocal: true,
        automaticLearning: false,
        automaticApply: false,
        automaticUpdate: false
      }
    };
  }

  function saveRulePlan(payload, storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"] };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return { saved: true, data: payload };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため改善ルール管理データを保存できませんでした。" : "localStorageへの保存に失敗しました。"] };
    }
  }

  function deleteSavedRulePlan(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function canFinalize({ review, plan, warnings }) {
    const errors = warnings.filter((warning) => warning.severity === "error");
    return {
      ok: review.finalized && plan.rules.length > 0 && plan.rules.every((rule) => validateRule(rule).ok) && errors.length === 0,
      reasons: [
        review.finalized ? "" : "Phase22-8が未確定です。",
        plan.rules.length > 0 ? "" : "改善ルール候補がありません。",
        plan.rules.every((rule) => validateRule(rule).ok) ? "" : "不正または不足した入力があります。",
        errors.length === 0 ? "" : "エラー警告があります。"
      ].filter(Boolean)
    };
  }

  function finalizeRulePlan(plan, state, confirmerName, confirmFinalize = () => false) {
    const result = canFinalize(state);
    if (!result.ok) return { finalized: false, reasons: result.reasons, plan };
    if (!confirmFinalize()) return { finalized: false, reasons: ["confirmation_required"], plan };
    return { finalized: true, plan: { ...plan, finalized: true, finalizedAt: new Date().toISOString(), confirmerName: text(confirmerName) || "未設定" } };
  }

  function unfinalizeRulePlan(plan, confirmUnlock = () => false) {
    if (!confirmUnlock()) return { unlocked: false, reason: "confirmation_required", plan };
    return { unlocked: true, plan: { ...plan, finalized: false, finalizedAt: "" } };
  }

  function generatePlainText({ review, plan, warnings }) {
    const lines = [];
    lines.push("Phase22-9 承認済み学習候補・改善ルール管理");
    lines.push(`Phase22-8: ${review.finalized ? "確定済み" : "未確定"} ${review.finalizedAt || ""}`);
    lines.push(`改善ルール候補: ${plan.rules.length}件`);
    plan.rules.forEach((rule) => {
      lines.push(`- ${rule.ruleId} / ${rule.name} / ${rule.managementStatus} / ${rule.validationStatus}`);
      lines.push(`  元候補: ${rule.sourceCandidateId} / 対象ロジック: ${rule.targetLogic} / 適用範囲: ${rule.applicationScope}`);
    });
    lines.push("警告:");
    if (warnings.length) warnings.forEach((warning) => lines.push(`- [${warning.severity}] ${warning.message}`));
    else lines.push("- なし");
    lines.push("自動学習・自動適用・自動更新・外部送信は行いません。PLAN_ONLY / protected_mode / Private Local 専用です。");
    return lines.join("\n");
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function bindRuleManagementPanel(options = {}) {
    const doc = options.document || (root && root.document);
    const storage = getStorage(options.storage);
    if (!doc || !storage) return null;
    const rootNode = doc.querySelector("#phase22-improvement-rule-management-core");
    if (!rootNode || rootNode.dataset.phase22RuleBound === "true") return null;
    rootNode.dataset.phase22RuleBound = "true";
    const state = { reviewLoad: loadLearningReview(storage), savedLoad: null, plan: null, message: "Phase22-8で学習候補を確定してから再読込してください。", messageKind: "info" };
    state.savedLoad = loadSavedRulePlan(storage, state.reviewLoad.review);
    state.plan = state.savedLoad.plan;
    const query = (selector) => doc.querySelector(selector);
    const setMessage = (message, kind = "info") => {
      state.message = message;
      state.messageKind = kind;
      const node = query("#phase22-rule-message");
      if (node) {
        node.textContent = message;
        node.dataset.kind = kind;
      }
    };
    const runtime = () => ({ warnings: buildWarnings({ review: state.reviewLoad.review, plan: state.plan, parseErrors: [state.reviewLoad.parseError ? "破損データ読み込み: Phase22-8" : "", state.savedLoad && state.savedLoad.parseError ? "破損データ読み込み: Phase22-9" : ""] }) });

    function readInputs() {
      const confirmer = query("#phase22-rule-confirmer");
      if (confirmer) state.plan.confirmerName = text(confirmer.value);
      doc.querySelectorAll("[data-phase22-rule-field]").forEach((node) => {
        const [ruleId, field] = node.dataset.phase22RuleField.split(":");
        const rule = state.plan.rules.find((item) => item.ruleId === ruleId);
        if (rule) rule[field] = text(node.value);
      });
    }

    function render() {
      const run = runtime();
      const summary = query("#phase22-rule-summary");
      if (summary) {
        summary.textContent = `承認済み候補 ${approvedCandidates(state.reviewLoad.review).length}件 / 改善ルール候補 ${state.plan.rules.length}件 / Phase22-8 ${state.reviewLoad.review.finalized ? "確定済み" : "未確定"}`;
      }
      const list = query("#phase22-rule-list");
      if (list) {
        list.textContent = "";
        const table = makeEl(doc, "div", "phase22-rule-table");
        const header = makeEl(doc, "div", "phase22-rule-row head");
        ["ID", "名称", "説明", "元候補", "対象条件", "レース条件", "ロジック", "適用範囲", "開始", "期限", "検証", "管理", "メモ"].forEach((label) => header.appendChild(makeEl(doc, "span", "", label)));
        table.appendChild(header);
        state.plan.rules.forEach((rule) => {
          const row = makeEl(doc, "div", "phase22-rule-row");
          row.appendChild(makeEl(doc, "span", "", rule.ruleId));
          ["name", "description"].forEach((field) => row.appendChild(input(doc, rule, field)));
          row.appendChild(makeEl(doc, "span", "", rule.sourceCandidateId));
          ["targetConditions", "targetRaceConditions", "targetLogic", "applicationScope", "effectiveStartDate", "effectiveEndDate", "validationStatus", "managementStatus", "verificationMemo"].forEach((field) => row.appendChild(input(doc, rule, field)));
          table.appendChild(row);
        });
        list.appendChild(table);
      }
      const warnings = query("#phase22-rule-warning-list");
      if (warnings) {
        warnings.textContent = "";
        if (!run.warnings.length) warnings.appendChild(makeEl(doc, "div", "phase22-rule-warning notice", "警告はありません。"));
        run.warnings.forEach((warning) => warnings.appendChild(makeEl(doc, "div", `phase22-rule-warning ${warning.severity}`, `${warning.severity}: ${warning.message}`)));
      }
      const status = query("#phase22-rule-finalized-status");
      if (status) status.textContent = state.plan.finalized ? `確定済み: ${state.plan.finalizedAt} / ${state.plan.confirmerName || "未設定"}` : "未確定";
      const confirmer = query("#phase22-rule-confirmer");
      if (confirmer) confirmer.value = state.plan.confirmerName;
      setMessage(state.message, state.messageKind);
    }

    function input(doc, rule, field) {
      const selectFields = { validationStatus: VALIDATION_STATUSES, managementStatus: MANAGEMENT_STATUSES };
      if (selectFields[field]) {
        const select = makeEl(doc, "select");
        select.dataset.phase22RuleField = `${rule.ruleId}:${field}`;
        selectFields[field].forEach((value) => {
          const option = makeEl(doc, "option", "", value);
          option.value = value;
          option.selected = rule[field] === value;
          select.appendChild(option);
        });
        return select;
      }
      const node = makeEl(doc, "input");
      node.dataset.phase22RuleField = `${rule.ruleId}:${field}`;
      node.value = text(rule[field]);
      if (field === "effectiveStartDate" || field === "effectiveEndDate") node.type = "date";
      return node;
    }

    function reload() {
      readInputs();
      if (options.confirmReload && !options.confirmReload()) return;
      state.reviewLoad = loadLearningReview(storage);
      state.plan = normalizePlan(state.plan, state.reviewLoad.review);
      setMessage("Phase22-8承認候補を再読込し、既存の管理入力を保持してマージしました。", "success");
      render();
    }

    function save() {
      readInputs();
      const run = runtime();
      const payload = buildPayload({ review: state.reviewLoad.review, plan: state.plan, warnings: run.warnings });
      const result = saveRulePlan(payload, storage);
      if (result.saved) {
        state.plan = normalizePlan(result.data, state.reviewLoad.review);
        state.savedLoad = { plan: state.plan, parseError: false };
        setMessage("改善ルール管理データを保存しました。", "success");
      } else setMessage((result.errors || ["保存に失敗しました。"])[0], "error");
      render();
    }

    function restore() {
      state.savedLoad = loadSavedRulePlan(storage, state.reviewLoad.review);
      state.plan = state.savedLoad.plan;
      setMessage(state.savedLoad.parseError ? "Phase22-9保存データが破損しているため初期状態で復元しました。" : "Phase22-9保存データを復元しました。", state.savedLoad.parseError ? "warning" : "success");
      render();
    }

    function reset() {
      const result = deleteSavedRulePlan(storage, options.confirmReset || (() => true));
      if (result.deleted) {
        state.plan = normalizePlan({}, state.reviewLoad.review);
        setMessage("Phase22-9のみ初期化しました。", "success");
      } else setMessage("初期化を取り消しました。", "info");
      render();
    }

    function finalize() {
      readInputs();
      const run = runtime();
      const result = finalizeRulePlan(state.plan, { review: state.reviewLoad.review, plan: state.plan, warnings: run.warnings }, state.plan.confirmerName, options.confirmFinalize || (() => true));
      state.plan = result.plan;
      setMessage(result.finalized ? "改善ルール管理データを確定しました。自動学習・自動適用・自動更新は行いません。" : `確定できません: ${result.reasons.join(" / ")}`, result.finalized ? "success" : "error");
      render();
    }

    function unlock() {
      const result = unfinalizeRulePlan(state.plan, options.confirmUnlock || (() => true));
      state.plan = result.plan;
      setMessage(result.unlocked ? "確定を解除しました。" : "確定解除を取り消しました。", result.unlocked ? "success" : "info");
      render();
    }

    function outputText() {
      readInputs();
      const value = generatePlainText({ review: state.reviewLoad.review, plan: state.plan, warnings: runtime().warnings });
      const output = query("#phase22-rule-text-output");
      if (output) output.value = value;
      setMessage("プレーンテキストを生成しました。", "success");
    }

    [["#phase22-rule-reload", reload], ["#phase22-rule-save", save], ["#phase22-rule-restore", restore], ["#phase22-rule-reset", reset], ["#phase22-rule-finalize", finalize], ["#phase22-rule-unlock", unlock], ["#phase22-rule-text", outputText]].forEach(([selector, handler]) => {
      const node = query(selector);
      if (node) node.addEventListener("click", handler);
    });
    render();
    return { reload, save, restore, reset, finalize, unlock, outputText, render, state };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindRuleManagementPanel({
      confirmReload: () => window.confirm("Phase22-8承認済み候補を再読込します。既存の管理入力は可能な範囲で保持します。よろしいですか？"),
      confirmReset: () => window.confirm("Phase22-9の保存データだけを削除します。Phase22-1〜22-8は削除しません。よろしいですか？"),
      confirmFinalize: () => window.confirm("改善ルール管理データを確定します。自動学習・自動適用・自動更新は行いません。よろしいですか？"),
      confirmUnlock: () => window.confirm("確定を解除します。よろしいですか？")
    });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    LEARNING_REVIEW_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    MANAGEMENT_STATUSES,
    VALIDATION_STATUSES,
    normalizeCandidate,
    normalizeLearningReview,
    loadLearningReview,
    approvedCandidates,
    stableRuleId,
    buildRuleFromCandidate,
    validateRule,
    generateRulesFromApprovedCandidates,
    normalizePlan,
    loadSavedRulePlan,
    detectPhase228Changes,
    buildWarnings,
    buildPayload,
    saveRulePlan,
    deleteSavedRulePlan,
    canFinalize,
    finalizeRulePlan,
    unfinalizeRulePlan,
    generatePlainText,
    bindRuleManagementPanel
  };
});
