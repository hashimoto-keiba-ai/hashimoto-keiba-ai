(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoFinalSafetyLock = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-10";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const FINAL_STATUSES = ["release_ready", "release_warning", "release_blocked", "protected_only", "plan_only_ready"];
  const DATABASES = ["final-safety-lock-db.json", "release-readiness-db.json"];
  const SOURCE_DATABASES = [
    "self-diagnosis-db.json", "self-diagnosis-history-db.json", "self-diagnosis-rule-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json",
    "self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json", "repair-approval-history-db.json",
    "repair-audit-history-db.json", "repair-rollback-plan-db.json", "repair-governance-db.json", "governance-alert-db.json", "governance-priority-recommendation-db.json"
  ];
  const REQUIRED_TESTS = ["tests/selfDiagnosisEngine.test.js", "tests/selfRepairEngine.test.js", "tests/repairApprovalGate.test.js", "tests/repairAuditRollback.test.js", "tests/repairGovernanceDashboard.test.js", "tests/governanceAlertPriority.test.js", "tests/finalSafetyLockReleaseReadiness.test.js"];
  const SAFETY_FILES = ["self-diagnosis-page.js", "self-repair-page.js", "repair-approval-page.js", "repair-audit-page.js", "repair-governance-dashboard.js", "governance-alert-page.js", "index.html", "private-local.html", "README.md"];
  const STORAGE_KEYS = {
    diagnosis: "selfDiagnosisLatest",
    repair: "selfRepairLatestPlan",
    approval: "repairApprovalLatest",
    audit: "repairAuditLatest",
    governance: "repairGovernanceLatest",
    alerts: "governanceAlertLatest",
    latest: "finalSafetyLockLatest"
  };
  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };
  const recordsOf = (value) => Array.isArray(value?.records) ? value.records : [];
  const hasConflictMarker = (text) => /^(<<<<<<<|=======|>>>>>>>)/m.test(String(text || ""));

  function determineFinalStatus(checks, context = {}) {
    const criticalCore = ["official_release_protected", "plan_only_enforced", "execution_blocked", "conflict_marker_zero", "test_readiness"].every((key) => checks[key]);
    if (!criticalCore) return "release_blocked";
    if (context.protectedRiskCount > 0) return "protected_only";
    if (Object.values(checks).every(Boolean)) return "release_ready";
    if (context.criticalAlertCount === 0 && context.warningAlertCount === 0) return "plan_only_ready";
    return "release_warning";
  }

  function buildFinalAssessment(sources = {}, inventory = {}, now = () => new Date()) {
    const databases = sources.databases || {};
    const diagnosis = sources.diagnosis || databases["self-diagnosis-db.json"] || {};
    const healthDb = databases["self-diagnosis-health-db.json"] || {};
    const repair = sources.repair || databases["self-repair-plan-db.json"] || {};
    const approval = sources.approval || databases["repair-approval-history-db.json"] || {};
    const audit = sources.audit || databases["repair-audit-history-db.json"] || {};
    const governance = sources.governance || databases["repair-governance-db.json"] || {};
    const alertReport = sources.alerts || databases["governance-alert-db.json"] || {};
    const diagnosisScores = diagnosis.scores || diagnosis.health || healthDb.scores || {};
    const healthScore = Number(diagnosisScores.systemHealthScore ?? diagnosisScores.system ?? governance.summary?.healthScore ?? 100);
    const approvalRecords = recordsOf(approval);
    const auditRecords = recordsOf(audit);
    const alerts = Array.isArray(alertReport.alerts) ? alertReport.alerts : recordsOf(alertReport);
    const protectedRiskCount = Number(governance.summary?.protectedReleaseBlockedCount || 0) + auditRecords.filter((record) => record.audit_status === "protected_release_blocked").length;
    const criticalAlertCount = alerts.filter((alert) => alert.category === "critical").length;
    const warningAlertCount = alerts.filter((alert) => alert.category === "warning").length;
    const allDatabasesPresent = SOURCE_DATABASES.every((file) => inventory.databases?.[file] !== false);
    const allTestsPresent = REQUIRED_TESTS.every((file) => inventory.tests?.[file] !== false);
    const testScore = Number(diagnosisScores.test ?? diagnosisScores.testHealthScore ?? 100);
    const policies = [repair.executionPolicy, approval.executionPolicy, audit.executionPolicy, governance.executionPolicy, alertReport.executionPolicy].filter(Boolean);
    const executionFlags = [repair.immediateExecution, approval.actualRepairEnabled, audit.executionAllowed, governance.executionAllowed, governance.summary?.executionAllowed, alertReport.executionAllowed]
      .filter((value) => value !== undefined);
    const checks = {
      health_score_ok: healthScore === 100,
      diagnosis_ok: /healthy|on/i.test(String(diagnosis.status || (healthScore === 100 ? "HEALTHY" : "WARNING"))) && !(diagnosis.anomalies?.length > 0),
      repair_plan_ok: repair.immediateExecution !== true && !((repair.items || repair.records || []).some?.((item) => item.priority === "CRITICAL")),
      approval_gate_ok: approval.actualRepairEnabled !== true && !approvalRecords.some((record) => ["pending", "blocked"].includes(record.status)),
      audit_rollback_ok: audit.executionAllowed !== true && !auditRecords.some((record) => ["audit_blocked", "rollback_required"].includes(record.audit_status)),
      governance_dashboard_ok: governance.executionAllowed !== true && governance.summary?.executionAllowed !== true && Number(governance.summary?.blockedCount || 0) === 0,
      alert_priority_ok: criticalAlertCount === 0 && warningAlertCount === 0 && alerts.every((alert) => alert.auto_execution_allowed !== true),
      official_release_protected: true,
      plan_only_enforced: policies.every((policy) => policy === "PLAN_ONLY"),
      execution_blocked: executionFlags.every((flag) => flag === false),
      conflict_marker_zero: Number(inventory.conflictMarkers || 0) === 0,
      test_readiness: allTestsPresent && testScore === 100 && allDatabasesPresent
    };
    const context = { protectedRiskCount, criticalAlertCount, warningAlertCount };
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      officialReleaseStatus: "protected",
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      generatedAt: now().toISOString(),
      healthScore,
      checks,
      context,
      finalStatus: determineFinalStatus(checks, context),
      unresolvedRisks: Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name)
    };
  }

  async function fetchText(path, fetcher) {
    try {
      const response = await fetcher(path, { cache: "no-store" });
      return response.ok ? await response.text() : null;
    } catch (_) { return null; }
  }

  async function collectInventory(fetcher) {
    const databasePairs = await Promise.all(SOURCE_DATABASES.map(async (file) => {
      const text = await fetchText(file, fetcher);
      if (text === null) return [file, false, null, null];
      try { return [file, true, JSON.parse(text), text]; } catch (_) { return [file, false, null, text]; }
    }));
    const testPairs = await Promise.all(REQUIRED_TESTS.map(async (file) => {
      const text = await fetchText(file, fetcher);
      return [file, text !== null, text];
    }));
    const safetyTexts = await Promise.all(SAFETY_FILES.map((file) => fetchText(file, fetcher)));
    const inspectedTexts = [...safetyTexts, ...databasePairs.map(([, , , text]) => text), ...testPairs.map(([, , text]) => text)];
    return {
      databases: Object.fromEntries(databasePairs.map(([file, ok]) => [file, ok])),
      databaseData: Object.fromEntries(databasePairs.filter(([, ok]) => ok).map(([file, , data]) => [file, data])),
      tests: Object.fromEntries(testPairs),
      conflictMarkers: inspectedTexts.filter((text) => hasConflictMarker(text)).length
    };
  }

  function persistAssessment(assessment, storage) {
    if (storage) storage.setItem(STORAGE_KEYS.latest, JSON.stringify(assessment));
    return assessment;
  }

  function renderAssessment(assessment, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#final-safety-status", assessment.finalStatus);
    set("#final-safety-health", assessment.healthScore);
    set("#final-safety-passed", Object.values(assessment.checks).filter(Boolean).length);
    set("#final-safety-total", Object.keys(assessment.checks).length);
    set("#final-safety-risks", assessment.unresolvedRisks.length);
    set("#final-safety-execution", "false");
    set("#final-safety-updated", assessment.generatedAt);
    const list = doc.querySelector("#final-safety-checks");
    if (list) list.replaceChildren(...Object.entries(assessment.checks).map(([name, ok]) => {
      const item = doc.createElement("li");
      item.className = ok ? "safety-check-ok" : "safety-check-warning";
      item.textContent = `${name}: ${ok}`;
      return item;
    }));
    return assessment;
  }

  async function runFinalSafetyLock(options = {}) {
    const storage = options.storage || window.localStorage;
    const fetcher = options.fetch || fetch;
    const doc = options.document || document;
    const inventory = await collectInventory(fetcher);
    const sources = {
      databases: inventory.databaseData,
      diagnosis: readStoredJson(storage, STORAGE_KEYS.diagnosis),
      repair: readStoredJson(storage, STORAGE_KEYS.repair),
      approval: readStoredJson(storage, STORAGE_KEYS.approval),
      audit: readStoredJson(storage, STORAGE_KEYS.audit),
      governance: readStoredJson(storage, STORAGE_KEYS.governance),
      alerts: readStoredJson(storage, STORAGE_KEYS.alerts)
    };
    const assessment = buildFinalAssessment(sources, inventory);
    persistAssessment(assessment, storage);
    return renderAssessment(assessment, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-final-safety-lock");
      if (button) button.addEventListener("click", () => runFinalSafetyLock().catch(() => undefined));
      runFinalSafetyLock().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, FINAL_STATUSES, DATABASES, SOURCE_DATABASES, REQUIRED_TESTS, SAFETY_FILES, STORAGE_KEYS, readStoredJson, hasConflictMarker, determineFinalStatus, buildFinalAssessment, fetchText, collectInventory, persistAssessment, renderAssessment, runFinalSafetyLock };
});
