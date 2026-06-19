(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoRepairGovernanceDashboard = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-8";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const PHASE_STATUSES = ["healthy", "warning", "blocked", "plan_only", "mock_only", "protected"];
  const GOVERNANCE_DATABASE = "repair-governance-db.json";
  const SOURCE_DATABASES = [
    "self-diagnosis-db.json", "self-diagnosis-history-db.json", "self-diagnosis-rule-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json",
    "self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json",
    "repair-approval-history-db.json", "repair-audit-history-db.json", "repair-rollback-plan-db.json"
  ];
  const STORAGE_KEYS = {
    diagnosis: "selfDiagnosisLatest",
    repair: "selfRepairLatestPlan",
    approval: "repairApprovalLatest",
    audit: "repairAuditLatest",
    governance: "repairGovernanceLatest"
  };

  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const recordsOf = (value) => Array.isArray(value?.records) ? value.records : [];
  const countWhere = (records, predicate) => records.filter(predicate).length;
  const safeJson = (value) => {
    try { return JSON.parse(value || "null"); } catch (_) { return null; }
  };

  function phaseStates(summary) {
    return {
      officialRelease: "protected",
      phase18_4: summary.healthScore === 100 && /healthy|on/i.test(summary.selfDiagnosisStatus) ? "healthy" : "warning",
      phase18_5: summary.repairPlanCount > 0 ? "plan_only" : summary.healthScore === 100 ? "healthy" : "warning",
      phase18_6: summary.approvalBlockedCount > 0 ? "blocked" : summary.executedMockCount > 0 ? "mock_only" : "plan_only",
      phase18_7: summary.protectedReleaseBlockedCount > 0 ? "protected" : summary.auditBlockedCount > 0 ? "blocked" : summary.auditPassedMockCount > 0 ? "mock_only" : "plan_only"
    };
  }

  function buildGovernanceSnapshot(sources = {}, now = () => new Date()) {
    const databases = sources.databases || {};
    const diagnosis = sources.diagnosis || databases["self-diagnosis-db.json"] || {};
    const healthDb = databases["self-diagnosis-health-db.json"] || {};
    const repair = sources.repair || databases["self-repair-plan-db.json"] || {};
    const approval = sources.approval || databases["repair-approval-history-db.json"] || {};
    const audit = sources.audit || databases["repair-audit-history-db.json"] || {};
    const repairRecords = Array.isArray(repair.items) ? repair.items : recordsOf(repair);
    const approvalRecords = recordsOf(approval);
    const auditRecords = recordsOf(audit);
    const scores = diagnosis.scores || diagnosis.health || healthDb.scores || {};
    const healthScore = clamp(scores.systemHealthScore ?? scores.system ?? diagnosis.healthScore ?? 100);
    const approvalBlockedCount = countWhere(approvalRecords, (record) => record.status === "blocked");
    const auditBlockedOnlyCount = countWhere(auditRecords, (record) => record.audit_status === "audit_blocked");
    const blockedCount = approvalBlockedCount + auditBlockedOnlyCount;
    const protectedReleaseBlockedCount = countWhere(auditRecords, (record) => record.audit_status === "protected_release_blocked" || record.official_release_protected === true);
    const executedMockCount = countWhere(approvalRecords, (record) => record.status === "executed_mock");
    const auditPassedMockCount = countWhere(auditRecords, (record) => record.audit_status === "audit_passed_mock");
    const auditBlockedCount = countWhere(auditRecords, (record) => ["audit_blocked", "rollback_required"].includes(record.audit_status));
    const summary = {
      healthScore,
      selfDiagnosisStatus: String(diagnosis.status || (healthScore === 100 ? "HEALTHY" : "WARNING")),
      repairPlanCount: repairRecords.length,
      approvalGateStatus: blockedCount > 0 ? "blocked" : executedMockCount > 0 ? "mock_only" : approvalRecords.length ? "plan_only" : "healthy",
      auditRollbackStatus: protectedReleaseBlockedCount > 0 ? "protected" : auditBlockedCount > 0 ? "blocked" : auditPassedMockCount > 0 ? "mock_only" : auditRecords.length ? "plan_only" : "healthy",
      blockedCount,
      approvalBlockedCount,
      protectedReleaseBlockedCount,
      executedMockCount,
      auditPassedMockCount,
      auditBlockedCount,
      executionAllowed: EXECUTION_ALLOWED
    };
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      officialReleaseStatus: "protected",
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: EXECUTION_ALLOWED,
      generatedAt: now().toISOString(),
      sourceDatabases: SOURCE_DATABASES,
      summary,
      phases: phaseStates(summary)
    };
  }

  async function loadJson(path, fetcher) {
    try {
      const response = await fetcher(path, { cache: "no-store" });
      return response.ok ? await response.json() : null;
    } catch (_) { return null; }
  }

  async function loadGovernanceSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const storage = options.storage || window.localStorage;
    const loaded = await Promise.all(SOURCE_DATABASES.map(async (path) => [path, await loadJson(path, fetcher)]));
    const databases = Object.fromEntries(loaded.filter(([, value]) => value));
    return {
      databases,
      diagnosis: safeJson(storage?.getItem(STORAGE_KEYS.diagnosis)),
      repair: safeJson(storage?.getItem(STORAGE_KEYS.repair)),
      approval: safeJson(storage?.getItem(STORAGE_KEYS.approval)),
      audit: safeJson(storage?.getItem(STORAGE_KEYS.audit))
    };
  }

  function persistSnapshot(snapshot, storage) {
    if (storage) storage.setItem(STORAGE_KEYS.governance, JSON.stringify(snapshot));
    return snapshot;
  }

  function renderSnapshot(snapshot, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    const summary = snapshot.summary;
    set("#repair-governance-health", summary.healthScore);
    set("#repair-governance-diagnosis", summary.selfDiagnosisStatus);
    set("#repair-governance-plans", summary.repairPlanCount);
    set("#repair-governance-approval", summary.approvalGateStatus);
    set("#repair-governance-audit", summary.auditRollbackStatus);
    set("#repair-governance-blocked", summary.blockedCount);
    set("#repair-governance-protected-blocked", summary.protectedReleaseBlockedCount);
    set("#repair-governance-mock", summary.executedMockCount);
    set("#repair-governance-execution", String(summary.executionAllowed));
    set("#repair-governance-updated", snapshot.generatedAt);
    const phaseList = doc.querySelector("#repair-governance-phases");
    if (phaseList) {
      phaseList.replaceChildren(...Object.entries(snapshot.phases).map(([phase, status]) => {
        const item = doc.createElement("li");
        item.className = `governance-status status-${status}`;
        item.textContent = `${phase}: ${status}`;
        return item;
      }));
    }
    return snapshot;
  }

  async function runGovernanceDashboard(options = {}) {
    const storage = options.storage || window.localStorage;
    const doc = options.document || document;
    const snapshot = buildGovernanceSnapshot(await loadGovernanceSources({ ...options, storage }));
    persistSnapshot(snapshot, storage);
    return renderSnapshot(snapshot, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-repair-governance");
      if (button) button.addEventListener("click", () => runGovernanceDashboard().catch(() => undefined));
      runGovernanceDashboard().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, PHASE_STATUSES, GOVERNANCE_DATABASE, SOURCE_DATABASES, STORAGE_KEYS, phaseStates, buildGovernanceSnapshot, loadJson, loadGovernanceSources, persistSnapshot, renderSnapshot, runGovernanceDashboard };
});
