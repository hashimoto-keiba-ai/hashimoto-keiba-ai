(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2210ValidationPlanCore = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null, function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RULE_MANAGEMENT_STORAGE_KEY = "hashimotoKeibaAi.phase22.improvementRuleManagement.v1";
  const STORAGE_KEY = "hashimotoKeibaAi.phase22.improvementRuleValidationPlan.v1";
  const PROTECTED_STORAGE_KEYS = [RULE_MANAGEMENT_STORAGE_KEY, STORAGE_KEY];
  const VALIDATION_STATUSES = ["draft", "ready", "running", "paused", "completed", "cancelled", "expired"];
  const JUDGEMENT_RESULTS = ["pending", "passed", "failed", "inconclusive", "rejected"];
  const ALLOWED_TRANSITIONS = {
    draft: ["ready", "cancelled"],
    ready: ["running", "cancelled", "expired"],
    running: ["paused", "completed", "cancelled"],
    paused: ["running", "cancelled"],
    completed: [],
    cancelled: [],
    expired: []
  };
  const METRIC_DEFAULTS = ["回収率", "的中率", "収支", "判定不能率", "手動確認品質"];

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
    return text(value).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 52) || "plan";
  }

  function stablePlanId(rule) {
    return `phase22-10-validation-${stableSlug(rule.ruleId || rule.name || "rule")}`;
  }

  function normalizeRule(input = {}) {
    return {
      ruleId: text(input.ruleId),
      name: text(input.name),
      description: text(input.description),
      sourceCandidateId: text(input.sourceCandidateId),
      targetConditions: text(input.targetConditions),
      targetRaceConditions: text(input.targetRaceConditions),
      targetLogic: text(input.targetLogic),
      applicationScope: text(input.applicationScope),
      managementStatus: text(input.managementStatus || "draft"),
      validationStatus: text(input.validationStatus || "notStarted"),
      effectiveStartDate: text(input.effectiveStartDate),
      effectiveEndDate: text(input.effectiveEndDate)
    };
  }

  function normalizeRuleManagement(input = {}) {
    return {
      schemaVersion: number(input.schemaVersion, 1),
      savedAt: text(input.savedAt),
      sourceRaceKey: text(input.sourceRaceKey),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      rules: Array.isArray(input.rules) ? input.rules.map(normalizeRule) : []
    };
  }

  function loadRuleManagement(storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { ruleManagement: normalizeRuleManagement(), parseError: false };
    const raw = targetStorage.getItem(RULE_MANAGEMENT_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { ruleManagement: normalizeRuleManagement(parsed || {}), parseError: Boolean(raw && !parsed) };
  }

  function eligibleRules(ruleManagement) {
    return (ruleManagement.rules || []).filter((rule) => ["draft", "approved", "validating"].includes(rule.managementStatus) && rule.ruleId);
  }

  function buildPlanFromRule(ruleInput, ruleManagement = {}, savedPlan = {}) {
    const rule = normalizeRule(ruleInput);
    const planId = text(savedPlan.planId) || stablePlanId(rule);
    const start = text(savedPlan.validationStartDate || rule.effectiveStartDate);
    const end = text(savedPlan.plannedEndDate || rule.effectiveEndDate);
    return {
      planId,
      name: text(savedPlan.name) || `${rule.name} 検証計画`,
      description: text(savedPlan.description) || `${rule.description} を本適用前に手動検証する計画`,
      targetRuleId: rule.ruleId,
      purpose: text(savedPlan.purpose) || "改善ルール候補を本適用前に安全に検証する",
      hypothesis: text(savedPlan.hypothesis) || `${rule.name} が対象条件で予測品質を改善するか確認する`,
      targetConditions: text(savedPlan.targetConditions) || rule.targetConditions,
      exclusionConditions: text(savedPlan.exclusionConditions) || "データ不足、取消・除外・不成立など手動判定不能なケースは除外",
      comparison: {
        baseline: text(savedPlan.comparison && savedPlan.comparison.baseline) || "現行の手動予想・既存ルール",
        candidate: text(savedPlan.comparison && savedPlan.comparison.candidate) || rule.name
      },
      metrics: Array.isArray(savedPlan.metrics) && savedPlan.metrics.length ? savedPlan.metrics.map(text).filter(Boolean) : METRIC_DEFAULTS,
      passCriteria: text(savedPlan.passCriteria) || "baselineより主要評価指標が悪化せず、手動確認で改善傾向がある",
      failCriteria: text(savedPlan.failCriteria) || "baselineより主要評価指標が悪化、または判定不能・運用負荷が増える",
      validationStartDate: start,
      plannedEndDate: end,
      validationPeriod: text(savedPlan.validationPeriod) || buildPeriodLabel(start, end),
      raceScope: text(savedPlan.raceScope) || rule.targetRaceConditions,
      dataScope: text(savedPlan.dataScope) || rule.applicationScope,
      sampleSizeCondition: text(savedPlan.sampleSizeCondition) || "最低5レース以上を手動確認",
      validationStatus: VALIDATION_STATUSES.includes(savedPlan.validationStatus) ? savedPlan.validationStatus : "draft",
      judgementResult: JUDGEMENT_RESULTS.includes(savedPlan.judgementResult) ? savedPlan.judgementResult : "pending",
      judgementReason: text(savedPlan.judgementReason),
      evaluationValue: text(savedPlan.evaluationValue),
      criteriaValue: text(savedPlan.criteriaValue),
      differenceValue: text(savedPlan.differenceValue),
      validationMemo: text(savedPlan.validationMemo),
      safety: {
        planOnly: true,
        protectedMode: true,
        privateLocal: true,
        automaticApply: false,
        automaticLearning: false,
        automaticUpdate: false,
        publicUrl: false,
        githubPages: false,
        externalApi: false,
        autoExecution: false
      },
      createdFromRuleSavedAt: text(ruleManagement.savedAt),
      sourceRuleStatus: rule.managementStatus
    };
  }

  function buildPeriodLabel(start, end) {
    if (!start && !end) return "手動設定";
    if (start && end) return `${start}〜${end}`;
    return start ? `${start}〜未設定` : `未設定〜${end}`;
  }

  function validatePlan(plan) {
    const errors = [];
    if (!text(plan.planId)) errors.push("検証計画IDが不足しています。");
    if (!text(plan.name)) errors.push("名称が不足しています。");
    if (!text(plan.description)) errors.push("説明が不足しています。");
    if (!text(plan.targetRuleId)) errors.push("対象改善ルールIDが不足しています。");
    if (!text(plan.purpose)) errors.push("検証目的が不足しています。");
    if (!text(plan.hypothesis)) errors.push("検証仮説が不足しています。");
    if (!text(plan.targetConditions)) errors.push("対象条件が不足しています。");
    if (!text(plan.exclusionConditions)) errors.push("除外条件が不足しています。");
    if (!plan.comparison || !text(plan.comparison.baseline) || !text(plan.comparison.candidate)) errors.push("baseline / candidate比較構造が不足しています。");
    if (!Array.isArray(plan.metrics) || !plan.metrics.length) errors.push("評価指標が不足しています。");
    if (!text(plan.passCriteria)) errors.push("合格基準が不足しています。");
    if (!text(plan.failCriteria)) errors.push("失格基準が不足しています。");
    if (!text(plan.validationStartDate)) errors.push("検証開始日が不足しています。");
    if (!text(plan.plannedEndDate)) errors.push("終了予定日が不足しています。");
    if (plan.validationStartDate && plan.plannedEndDate && plan.validationStartDate > plan.plannedEndDate) errors.push("終了予定日が検証開始日より前です。");
    if (!text(plan.raceScope)) errors.push("対象レース範囲が不足しています。");
    if (!text(plan.dataScope)) errors.push("対象データ範囲が不足しています。");
    if (!text(plan.sampleSizeCondition)) errors.push("サンプル数条件が不足しています。");
    if (!VALIDATION_STATUSES.includes(plan.validationStatus)) errors.push("検証状態が不正です。");
    if (!JUDGEMENT_RESULTS.includes(plan.judgementResult)) errors.push("判定結果が不正です。");
    if (plan.validationStatus !== "completed" && plan.judgementResult !== "pending") errors.push("完了前の判定結果はpendingにしてください。");
    if (plan.judgementResult === "passed" && !text(plan.judgementReason)) errors.push("passedには判定理由が必要です。");
    if ((plan.judgementResult === "failed" || plan.judgementResult === "rejected") && !text(plan.judgementReason)) errors.push("failed / rejectedには判定理由が必要です。");
    return { ok: errors.length === 0, errors };
  }

  function canTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] || []).includes(to);
  }

  function transitionPlan(plan, toStatus) {
    if (!VALIDATION_STATUSES.includes(toStatus)) return { transitioned: false, reason: "invalid_status", plan };
    if (!canTransition(plan.validationStatus, toStatus)) return { transitioned: false, reason: "invalid_transition", plan };
    return { transitioned: true, plan: { ...plan, validationStatus: toStatus } };
  }

  function generatePlansFromRules(ruleManagement, savedPlans = []) {
    const savedByRule = new Map((savedPlans || []).map((plan) => [text(plan.targetRuleId), plan]));
    return eligibleRules(ruleManagement)
      .map((rule) => buildPlanFromRule(rule, ruleManagement, savedByRule.get(rule.ruleId) || {}))
      .sort((a, b) => a.planId.localeCompare(b.planId));
  }

  function normalizePlanStore(input = {}, ruleManagement = normalizeRuleManagement()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: text(input.savedAt),
      sourcePhase229SavedAt: text(input.sourcePhase229SavedAt || ruleManagement.savedAt),
      sourceRaceKey: text(input.sourceRaceKey || ruleManagement.sourceRaceKey),
      plans: generatePlansFromRules(ruleManagement, input.plans || []),
      finalized: Boolean(input.finalized),
      finalizedAt: text(input.finalizedAt),
      confirmerName: text(input.confirmerName),
      ruleSnapshot: input.ruleSnapshot || snapshotRules(ruleManagement)
    };
  }

  function snapshotRules(ruleManagement) {
    return {
      savedAt: ruleManagement.savedAt,
      finalized: ruleManagement.finalized,
      ruleIds: eligibleRules(ruleManagement).map((rule) => rule.ruleId).sort()
    };
  }

  function loadSavedPlanStore(storage, ruleManagement) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { store: normalizePlanStore({}, ruleManagement), parseError: false };
    const raw = targetStorage.getItem(STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return { store: normalizePlanStore(parsed || {}, ruleManagement), parseError: Boolean(raw && !parsed) };
  }

  function detectPhase229Changes(ruleManagement, store) {
    const snapshot = store && store.ruleSnapshot;
    if (!snapshot) return [];
    const changes = [];
    if (snapshot.savedAt && snapshot.savedAt !== ruleManagement.savedAt) changes.push("Phase22-9の保存時刻が変わっています。");
    if (Boolean(snapshot.finalized) !== Boolean(ruleManagement.finalized)) changes.push("Phase22-9の確定状態が変わっています。");
    const before = (snapshot.ruleIds || []).join("|");
    const current = eligibleRules(ruleManagement).map((rule) => rule.ruleId).sort().join("|");
    if (before !== current) changes.push("対象改善ルールの一覧が変わっています。");
    return changes;
  }

  function buildWarnings({ ruleManagement, store, parseErrors = [] }) {
    const warnings = [];
    parseErrors.filter(Boolean).forEach((message) => warnings.push({ severity: "error", message }));
    if (!ruleManagement.finalized) warnings.push({ severity: "error", message: "Phase22-9が未確定です。" });
    if (!store.plans.length) warnings.push({ severity: "warning", message: "検証計画がありません。" });
    store.plans.forEach((plan) => {
      const validation = validatePlan(plan);
      validation.errors.forEach((message) => warnings.push({ severity: "error", message: `${plan.planId}: ${message}` }));
      if (plan.judgementResult === "passed") warnings.push({ severity: "notice", message: `${plan.planId}: passedでも自動適用は行いません。` });
      if (plan.judgementResult === "failed" || plan.judgementResult === "rejected") warnings.push({ severity: "notice", message: `${plan.planId}: failed / rejectedは適用対象にしません。` });
    });
    detectPhase229Changes(ruleManagement, store).forEach((message) => warnings.push({ severity: "warning", message: `Phase22-9更新検知: ${message}` }));
    return warnings;
  }

  function buildPayload({ ruleManagement, store, warnings }) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      sourcePhase229SavedAt: ruleManagement.savedAt,
      sourceRaceKey: ruleManagement.sourceRaceKey,
      plans: store.plans.map((plan) => ({ ...plan })).sort((a, b) => a.planId.localeCompare(b.planId)),
      finalized: Boolean(store.finalized),
      finalizedAt: text(store.finalizedAt),
      confirmerName: text(store.confirmerName),
      warnings,
      ruleSnapshot: snapshotRules(ruleManagement),
      safety: {
        planOnly: true,
        protectedMode: true,
        privateLocal: true,
        automaticApply: false,
        automaticLearning: false,
        automaticUpdate: false
      }
    };
  }

  function savePlanStore(payload, storage) {
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { saved: false, storageError: true, errors: ["localStorageを利用できません。"] };
    try {
      targetStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return { saved: true, data: payload };
    } catch (error) {
      const quotaExceeded = error && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
      return { saved: false, quotaExceeded, storageError: true, errors: [quotaExceeded ? "localStorageの容量が不足しているため検証計画を保存できませんでした。" : "localStorageへの保存に失敗しました。"] };
    }
  }

  function deleteSavedPlanStore(storage, confirmDelete = () => false) {
    if (!confirmDelete()) return { deleted: false, reason: "confirmation_required" };
    const targetStorage = getStorage(storage);
    if (!targetStorage) return { deleted: false, reason: "storage_unavailable" };
    targetStorage.removeItem(STORAGE_KEY);
    return { deleted: true };
  }

  function canFinalize({ ruleManagement, store, warnings }) {
    const errors = warnings.filter((warning) => warning.severity === "error");
    return {
      ok: ruleManagement.finalized && store.plans.length > 0 && store.plans.every((plan) => validatePlan(plan).ok) && errors.length === 0,
      reasons: [
        ruleManagement.finalized ? "" : "Phase22-9が未確定です。",
        store.plans.length > 0 ? "" : "検証計画がありません。",
        store.plans.every((plan) => validatePlan(plan).ok) ? "" : "不正または不足した入力があります。",
        errors.length === 0 ? "" : "エラー警告があります。"
      ].filter(Boolean)
    };
  }

  function finalizePlanStore(store, state, confirmerName, confirmFinalize = () => false) {
    const result = canFinalize(state);
    if (!result.ok) return { finalized: false, reasons: result.reasons, store };
    if (!confirmFinalize()) return { finalized: false, reasons: ["confirmation_required"], store };
    return { finalized: true, store: { ...store, finalized: true, finalizedAt: new Date().toISOString(), confirmerName: text(confirmerName) || "未設定" } };
  }

  function unfinalizePlanStore(store, confirmUnlock = () => false) {
    if (!confirmUnlock()) return { unlocked: false, reason: "confirmation_required", store };
    return { unlocked: true, store: { ...store, finalized: false, finalizedAt: "" } };
  }

  function generatePlainText({ ruleManagement, store, warnings }) {
    const lines = [];
    lines.push("Phase22-10 改善ルール検証計画・適用前評価");
    lines.push(`Phase22-9: ${ruleManagement.finalized ? "確定済み" : "未確定"} / 検証計画 ${store.plans.length}件`);
    store.plans.forEach((plan) => {
      lines.push(`- ${plan.planId} / ${plan.name} / ${plan.validationStatus} / ${plan.judgementResult}`);
      lines.push(`  baseline: ${plan.comparison.baseline}`);
      lines.push(`  candidate: ${plan.comparison.candidate}`);
      lines.push(`  合格: ${plan.passCriteria}`);
      lines.push(`  失格: ${plan.failCriteria}`);
    });
    lines.push("警告:");
    if (warnings.length) warnings.forEach((warning) => lines.push(`- [${warning.severity}] ${warning.message}`));
    else lines.push("- なし");
    lines.push("passedでも自動適用しません。自動学習・自動更新・外部送信は行いません。");
    return lines.join("\n");
  }

  function makeEl(doc, tag, className, textValue) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (textValue !== undefined) node.textContent = textValue;
    return node;
  }

  function bindValidationPlanPanel(options = {}) {
    const doc = options.document || (root && root.document);
    const storage = getStorage(options.storage);
    if (!doc || !storage) return null;
    const rootNode = doc.querySelector("#phase22-validation-plan-core");
    if (!rootNode || rootNode.dataset.phase22ValidationBound === "true") return null;
    rootNode.dataset.phase22ValidationBound = "true";
    const state = { ruleLoad: loadRuleManagement(storage), savedLoad: null, store: null, message: "Phase22-9改善ルール管理データを確定してから再読込してください。", messageKind: "info" };
    state.savedLoad = loadSavedPlanStore(storage, state.ruleLoad.ruleManagement);
    state.store = state.savedLoad.store;
    const query = (selector) => doc.querySelector(selector);
    const setMessage = (message, kind = "info") => {
      state.message = message;
      state.messageKind = kind;
      const node = query("#phase22-validation-message");
      if (node) {
        node.textContent = message;
        node.dataset.kind = kind;
      }
    };
    const runtime = () => ({ warnings: buildWarnings({ ruleManagement: state.ruleLoad.ruleManagement, store: state.store, parseErrors: [state.ruleLoad.parseError ? "破損データ読み込み: Phase22-9" : "", state.savedLoad && state.savedLoad.parseError ? "破損データ読み込み: Phase22-10" : ""] }) });

    function readInputs() {
      const confirmer = query("#phase22-validation-confirmer");
      if (confirmer) state.store.confirmerName = text(confirmer.value);
      doc.querySelectorAll("[data-phase22-validation-field]").forEach((node) => {
        const [planId, field] = node.dataset.phase22ValidationField.split(":");
        const plan = state.store.plans.find((item) => item.planId === planId);
        if (!plan) return;
        if (field === "comparisonBaseline") plan.comparison.baseline = text(node.value);
        else if (field === "comparisonCandidate") plan.comparison.candidate = text(node.value);
        else if (field === "metrics") plan.metrics = text(node.value).split(",").map(text).filter(Boolean);
        else plan[field] = text(node.value);
      });
    }

    function render() {
      const run = runtime();
      const summary = query("#phase22-validation-summary");
      if (summary) summary.textContent = `対象改善ルール ${eligibleRules(state.ruleLoad.ruleManagement).length}件 / 検証計画 ${state.store.plans.length}件 / Phase22-9 ${state.ruleLoad.ruleManagement.finalized ? "確定済み" : "未確定"}`;
      const list = query("#phase22-validation-list");
      if (list) {
        list.textContent = "";
        const table = makeEl(doc, "div", "phase22-validation-table");
        const header = makeEl(doc, "div", "phase22-validation-row head");
        ["ID", "名称", "対象ルール", "目的", "仮説", "対象条件", "除外条件", "baseline", "candidate", "指標", "合格", "失格", "開始", "終了", "状態", "判定"].forEach((label) => header.appendChild(makeEl(doc, "span", "", label)));
        table.appendChild(header);
        state.store.plans.forEach((plan) => {
          const row = makeEl(doc, "div", "phase22-validation-row");
          row.appendChild(makeEl(doc, "span", "", plan.planId));
          ["name", "targetRuleId", "purpose", "hypothesis", "targetConditions", "exclusionConditions"].forEach((field) => row.appendChild(input(doc, plan, field)));
          row.appendChild(input(doc, plan, "comparisonBaseline"));
          row.appendChild(input(doc, plan, "comparisonCandidate"));
          row.appendChild(input(doc, plan, "metrics"));
          ["passCriteria", "failCriteria", "validationStartDate", "plannedEndDate", "validationStatus", "judgementResult"].forEach((field) => row.appendChild(input(doc, plan, field)));
          table.appendChild(row);
        });
        list.appendChild(table);
      }
      const warnings = query("#phase22-validation-warning-list");
      if (warnings) {
        warnings.textContent = "";
        if (!run.warnings.length) warnings.appendChild(makeEl(doc, "div", "phase22-validation-warning notice", "警告はありません。"));
        run.warnings.forEach((warning) => warnings.appendChild(makeEl(doc, "div", `phase22-validation-warning ${warning.severity}`, `${warning.severity}: ${warning.message}`)));
      }
      const status = query("#phase22-validation-finalized-status");
      if (status) status.textContent = state.store.finalized ? `確定済み: ${state.store.finalizedAt} / ${state.store.confirmerName || "未設定"}` : "未確定";
      const confirmer = query("#phase22-validation-confirmer");
      if (confirmer) confirmer.value = state.store.confirmerName;
      setMessage(state.message, state.messageKind);
    }

    function input(doc, plan, field) {
      const selectFields = { validationStatus: VALIDATION_STATUSES, judgementResult: JUDGEMENT_RESULTS };
      if (selectFields[field]) {
        const select = makeEl(doc, "select");
        select.dataset.phase22ValidationField = `${plan.planId}:${field}`;
        selectFields[field].forEach((value) => {
          const option = makeEl(doc, "option", "", value);
          option.value = value;
          option.selected = plan[field] === value;
          select.appendChild(option);
        });
        return select;
      }
      const node = makeEl(doc, "input");
      node.dataset.phase22ValidationField = `${plan.planId}:${field}`;
      node.value = field === "comparisonBaseline" ? plan.comparison.baseline : field === "comparisonCandidate" ? plan.comparison.candidate : field === "metrics" ? plan.metrics.join(", ") : text(plan[field]);
      if (field === "validationStartDate" || field === "plannedEndDate") node.type = "date";
      return node;
    }

    function reload() {
      readInputs();
      if (options.confirmReload && !options.confirmReload()) return;
      state.ruleLoad = loadRuleManagement(storage);
      state.store = normalizePlanStore(state.store, state.ruleLoad.ruleManagement);
      setMessage("Phase22-9データを再読込し、既存の検証入力を保持してマージしました。", "success");
      render();
    }

    function save() {
      readInputs();
      const run = runtime();
      const payload = buildPayload({ ruleManagement: state.ruleLoad.ruleManagement, store: state.store, warnings: run.warnings });
      const result = savePlanStore(payload, storage);
      if (result.saved) {
        state.store = normalizePlanStore(result.data, state.ruleLoad.ruleManagement);
        state.savedLoad = { store: state.store, parseError: false };
        setMessage("検証計画を保存しました。", "success");
      } else setMessage((result.errors || ["保存に失敗しました。"])[0], "error");
      render();
    }

    function restore() {
      state.savedLoad = loadSavedPlanStore(storage, state.ruleLoad.ruleManagement);
      state.store = state.savedLoad.store;
      setMessage(state.savedLoad.parseError ? "Phase22-10保存データが破損しているため初期状態で復元しました。" : "Phase22-10保存データを復元しました。", state.savedLoad.parseError ? "warning" : "success");
      render();
    }

    function reset() {
      const result = deleteSavedPlanStore(storage, options.confirmReset || (() => true));
      if (result.deleted) {
        state.store = normalizePlanStore({}, state.ruleLoad.ruleManagement);
        setMessage("Phase22-10のみ初期化しました。", "success");
      } else setMessage("初期化を取り消しました。", "info");
      render();
    }

    function finalize() {
      readInputs();
      const run = runtime();
      const result = finalizePlanStore(state.store, { ruleManagement: state.ruleLoad.ruleManagement, store: state.store, warnings: run.warnings }, state.store.confirmerName, options.confirmFinalize || (() => true));
      state.store = result.store;
      setMessage(result.finalized ? "検証計画を確定しました。passedでも自動適用は行いません。" : `確定できません: ${result.reasons.join(" / ")}`, result.finalized ? "success" : "error");
      render();
    }

    function unlock() {
      const result = unfinalizePlanStore(state.store, options.confirmUnlock || (() => true));
      state.store = result.store;
      setMessage(result.unlocked ? "確定を解除しました。" : "確定解除を取り消しました。", result.unlocked ? "success" : "info");
      render();
    }

    function outputText() {
      readInputs();
      const value = generatePlainText({ ruleManagement: state.ruleLoad.ruleManagement, store: state.store, warnings: runtime().warnings });
      const output = query("#phase22-validation-text-output");
      if (output) output.value = value;
      setMessage("プレーンテキストを生成しました。", "success");
    }

    [["#phase22-validation-reload", reload], ["#phase22-validation-save", save], ["#phase22-validation-restore", restore], ["#phase22-validation-reset", reset], ["#phase22-validation-finalize", finalize], ["#phase22-validation-unlock", unlock], ["#phase22-validation-text", outputText]].forEach(([selector, handler]) => {
      const node = query(selector);
      if (node) node.addEventListener("click", handler);
    });
    render();
    return { reload, save, restore, reset, finalize, unlock, outputText, render, state };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => bindValidationPlanPanel({
      confirmReload: () => window.confirm("Phase22-9改善ルールを再読込します。既存の検証入力は可能な範囲で保持します。よろしいですか？"),
      confirmReset: () => window.confirm("Phase22-10の保存データだけを削除します。Phase22-1〜22-9は削除しません。よろしいですか？"),
      confirmFinalize: () => window.confirm("検証計画を確定します。自動適用・自動学習・自動更新は行いません。よろしいですか？"),
      confirmUnlock: () => window.confirm("確定を解除します。よろしいですか？")
    });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return {
    SCHEMA_VERSION,
    RULE_MANAGEMENT_STORAGE_KEY,
    STORAGE_KEY,
    PROTECTED_STORAGE_KEYS,
    VALIDATION_STATUSES,
    JUDGEMENT_RESULTS,
    ALLOWED_TRANSITIONS,
    normalizeRule,
    normalizeRuleManagement,
    loadRuleManagement,
    eligibleRules,
    stablePlanId,
    buildPlanFromRule,
    validatePlan,
    canTransition,
    transitionPlan,
    generatePlansFromRules,
    normalizePlanStore,
    loadSavedPlanStore,
    detectPhase229Changes,
    buildWarnings,
    buildPayload,
    savePlanStore,
    deleteSavedPlanStore,
    canFinalize,
    finalizePlanStore,
    unfinalizePlanStore,
    generatePlainText,
    bindValidationPlanPanel
  };
});
