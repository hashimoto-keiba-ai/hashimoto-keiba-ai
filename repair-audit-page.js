(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoRepairAuditEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-7";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const ELIGIBLE_APPROVAL_STATUSES = ["approved", "executed_mock"];
  const AUDIT_STATUSES = ["audit_pending", "audit_passed_mock", "audit_blocked", "rollback_required", "protected_release_blocked"];
  const DATABASES = ["repair-audit-history-db.json", "repair-rollback-plan-db.json"];
  const STORAGE_KEYS = {
    approval: "repairApprovalLatest",
    latest: "repairAuditLatest",
    history: "repairAuditHistory",
    rollback: "repairRollbackPlans"
  };

  const text = (value, fallback = "unknown") => String(value ?? fallback);
  const isOfficialReleaseProtected = (record = {}) => {
    const searchable = [record.category, record.target_file, record.reason, record.proposed_action, record.safety_level].map((value) => text(value, "").toLowerCase()).join(" ");
    return record.official_release_protected === true || record.category === "release_protection_risk" || record.safety_level === "PROTECTED_BLOCK" || searchable.includes("official release") || searchable.includes("official-release") || searchable.includes("official_release");
  };
  const expectedDiffSummary = (record) => `PLAN_ONLY preview: ${text(record.target_file)} に対して「${text(record.proposed_action)}」を検討。実差分・書き込みは未生成です。`;
  const buildRollbackPlan = (record) => ({
    target_file: text(record.target_file),
    strategy: "restore_verified_snapshot",
    steps: ["変更前スナップショットを検証", "Mock差分を破棄", "保護対象と構文を再診断"],
    automatic: false,
    requiresApproval: true
  });

  function determineAuditStatus(record) {
    if (isOfficialReleaseProtected(record)) return "protected_release_blocked";
    if (!record.target_file || record.target_file === "unknown" || !record.proposed_action) return "audit_blocked";
    if (record.safety_level === "MANUAL_REVIEW" || text(record.severity).toUpperCase() === "CRITICAL") return "rollback_required";
    return record.status === "executed_mock" ? "audit_passed_mock" : "audit_pending";
  }

  function createAuditRecord(record = {}, index = 0) {
    const protectedRelease = isOfficialReleaseProtected(record);
    return {
      audit_id: `audit-${String(index + 1).padStart(3, "0")}`,
      repair_id: text(record.repair_id, `repair-${String(index + 1).padStart(3, "0")}`),
      approval_status: text(record.status),
      target_file: text(record.target_file),
      proposed_action: text(record.proposed_action),
      expected_diff_summary: expectedDiffSummary(record),
      rollback_plan: buildRollbackPlan(record),
      risk_level: text(record.severity || record.priority || "MEDIUM").toUpperCase(),
      official_release_protected: protectedRelease,
      execution_allowed: false,
      audit_status: determineAuditStatus(record)
    };
  }

  function generateAuditReport(approvalGate = {}, now = () => new Date()) {
    const eligible = Array.isArray(approvalGate.records)
      ? approvalGate.records.filter((record) => ELIGIBLE_APPROVAL_STATUSES.includes(record.status))
      : [];
    const records = eligible.map(createAuditRecord);
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      sourcePhase: approvalGate.phase || "Phase18-6",
      generatedAt: now().toISOString(),
      executionAllowed: false,
      records,
      rollbackPlans: records.map((record) => ({ audit_id: record.audit_id, repair_id: record.repair_id, ...record.rollback_plan }))
    };
  }

  function persistAudit(report, storage) {
    if (!storage) return report;
    let history = [];
    try { history = JSON.parse(storage.getItem(STORAGE_KEYS.history) || "[]"); } catch (_) { history = []; }
    history.unshift(report);
    storage.setItem(STORAGE_KEYS.latest, JSON.stringify(report));
    storage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 100)));
    storage.setItem(STORAGE_KEYS.rollback, JSON.stringify(report.rollbackPlans));
    return report;
  }

  function loadApprovalGate(storage) {
    try { return JSON.parse(storage?.getItem(STORAGE_KEYS.approval) || "null"); } catch (_) { return null; }
  }

  function renderAudit(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#repair-audit-count", report.records.length);
    set("#repair-audit-blocked", report.records.filter((record) => record.audit_status.includes("blocked")).length);
    set("#repair-audit-rollback", report.records.filter((record) => record.audit_status === "rollback_required").length);
    set("#repair-audit-execution", "false");
    set("#repair-audit-updated", report.generatedAt);
    const list = doc.querySelector("#repair-audit-list");
    if (!list) return report;
    list.replaceChildren(...report.records.map((record) => {
      const row = doc.createElement("li");
      row.className = `repair-audit-item status-${record.audit_status}`;
      row.textContent = `${record.audit_id} / ${record.repair_id} / ${record.approval_status} / ${record.target_file} / ${record.proposed_action} / ${record.expected_diff_summary} / rollback:${record.rollback_plan.strategy} / ${record.risk_level} / protected:${record.official_release_protected} / execution:${record.execution_allowed} / ${record.audit_status}`;
      return row;
    }));
    if (!report.records.length) {
      const empty = doc.createElement("li");
      empty.textContent = "approved / executed_mock の監査対象はありません。";
      list.appendChild(empty);
    }
    return report;
  }

  function runAudit(options = {}) {
    const storage = options.storage || window.localStorage;
    const doc = options.document || document;
    const approvalGate = options.approvalGate || loadApprovalGate(storage) || { phase: "Phase18-6", records: [] };
    const report = generateAuditReport(approvalGate);
    persistAudit(report, storage);
    return renderAudit(report, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-repair-audit");
      if (button) button.addEventListener("click", () => runAudit());
      runAudit();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, ELIGIBLE_APPROVAL_STATUSES, AUDIT_STATUSES, DATABASES, STORAGE_KEYS, isOfficialReleaseProtected, expectedDiffSummary, buildRollbackPlan, determineAuditStatus, createAuditRecord, generateAuditReport, persistAudit, loadApprovalGate, renderAudit, runAudit };
});
