(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoRepairApprovalGate = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-6";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const STATUSES = ["pending", "approved", "rejected", "blocked", "executed_mock"];
  const HISTORY_DATABASE = "repair-approval-history-db.json";
  const STORAGE_KEYS = {
    latest: "repairApprovalLatest",
    history: "repairApprovalHistory",
    sourcePlan: "selfRepairLatestPlan"
  };

  const normalizeText = (value, fallback = "unknown") => String(value ?? fallback);
  const normalizeSeverity = (item) => normalizeText(item.severity || item.priority || "MEDIUM").toUpperCase();
  const safetyLevel = (item) => {
    if (item.category === "release_protection_risk" || item.safeOperation?.blockedByProtection) return "PROTECTED_BLOCK";
    if (item.safeOperation?.requiresBackup || normalizeSeverity(item) === "CRITICAL") return "MANUAL_REVIEW";
    return "PLAN_ONLY_SAFE";
  };

  function createApprovalRecord(item = {}, index = 0) {
    const blocked = item.category === "release_protection_risk" || item.safeOperation?.blockedByProtection === true;
    return {
      repair_id: normalizeText(item.repair_id || item.id, `repair-${String(index + 1).padStart(3, "0")}`),
      category: normalizeText(item.category),
      severity: normalizeSeverity(item),
      priority: normalizeText(item.priority || normalizeSeverity(item)).toUpperCase(),
      target_file: normalizeText(item.target_file || item.target),
      reason: normalizeText(item.reason || item.cause),
      impact: normalizeText(item.impact),
      proposed_action: normalizeText(item.proposed_action || item.proposal),
      safety_level: safetyLevel(item),
      approval_required: item.approval_required ?? item.safeOperation?.requiresApproval ?? true,
      status: blocked ? "blocked" : "pending",
      execution_policy: EXECUTION_POLICY,
      actual_execution: false,
      updated_at: null
    };
  }

  function createApprovalGate(plan = {}, now = () => new Date()) {
    const records = Array.isArray(plan.items) ? plan.items.map(createApprovalRecord) : [];
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      sourcePhase: plan.phase || "Phase18-5",
      sourceGeneratedAt: plan.generatedAt || null,
      generatedAt: now().toISOString(),
      actualRepairEnabled: false,
      records
    };
  }

  function transitionRecord(record, action, now = () => new Date()) {
    const next = { ...record };
    if (record.status === "blocked") return next;
    if (action === "approve" && record.status === "pending") next.status = "approved";
    else if (action === "reject" && ["pending", "approved"].includes(record.status)) next.status = "rejected";
    else if (action === "execute_mock" && record.status === "approved") next.status = "executed_mock";
    else return next;
    next.actual_execution = false;
    next.updated_at = now().toISOString();
    return next;
  }

  function updateRecord(gate, repairId, action, now = () => new Date()) {
    return {
      ...gate,
      records: gate.records.map((record) => record.repair_id === repairId ? transitionRecord(record, action, now) : record),
      updatedAt: now().toISOString()
    };
  }

  function persistGate(gate, storage) {
    if (!storage) return gate;
    let history = [];
    try { history = JSON.parse(storage.getItem(STORAGE_KEYS.history) || "[]"); } catch (_) { history = []; }
    history.unshift(gate);
    storage.setItem(STORAGE_KEYS.latest, JSON.stringify(gate));
    storage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 100)));
    return gate;
  }

  function loadSourcePlan(storage) {
    try { return JSON.parse(storage?.getItem(STORAGE_KEYS.sourcePlan) || "null"); } catch (_) { return null; }
  }

  function renderGate(gate, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#repair-approval-policy", gate.executionPolicy);
    set("#repair-approval-pending", gate.records.filter((record) => record.status === "pending").length);
    set("#repair-approval-approved", gate.records.filter((record) => record.status === "approved").length);
    set("#repair-approval-blocked", gate.records.filter((record) => record.status === "blocked").length);
    set("#repair-approval-updated", gate.updatedAt || gate.generatedAt);
    const list = doc.querySelector("#repair-approval-list");
    if (!list) return gate;
    list.replaceChildren(...gate.records.map((record) => {
      const row = doc.createElement("li");
      row.className = `repair-approval-item status-${record.status}`;
      const detail = doc.createElement("p");
      detail.textContent = `${record.repair_id} / ${record.category} / ${record.severity} / ${record.priority} / ${record.target_file} / ${record.reason} / ${record.impact} / ${record.proposed_action} / ${record.safety_level} / approval:${record.approval_required} / ${record.status}`;
      const actions = doc.createElement("div");
      [["approve", "承認"], ["reject", "却下"], ["execute_mock", "Mock実行"]].forEach(([action, label]) => {
        const button = doc.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.repairId = record.repair_id;
        button.dataset.approvalAction = action;
        button.disabled = record.status === "blocked" || (action === "execute_mock" && record.status !== "approved");
        actions.appendChild(button);
      });
      row.append(detail, actions);
      return row;
    }));
    if (!gate.records.length) {
      const empty = doc.createElement("li");
      empty.textContent = "承認対象の修復プランはありません。";
      list.appendChild(empty);
    }
    return gate;
  }

  function runApprovalGate(options = {}) {
    const storage = options.storage || window.localStorage;
    const doc = options.document || document;
    const plan = options.plan || loadSourcePlan(storage) || { phase: "Phase18-5", items: [] };
    let gate = createApprovalGate(plan);
    const apply = (repairId, action) => {
      gate = updateRecord(gate, repairId, action);
      persistGate(gate, storage);
      renderGate(gate, doc);
    };
    const list = doc.querySelector("#repair-approval-list");
    if (list && !list.dataset.approvalBound) {
      list.dataset.approvalBound = "true";
      list.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-approval-action]");
        if (button) apply(button.dataset.repairId, button.dataset.approvalAction);
      });
    }
    persistGate(gate, storage);
    return renderGate(gate, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => runApprovalGate();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, STATUSES, HISTORY_DATABASE, STORAGE_KEYS, safetyLevel, createApprovalRecord, createApprovalGate, transitionRecord, updateRecord, persistGate, loadSourcePlan, renderGate, runApprovalGate };
});
