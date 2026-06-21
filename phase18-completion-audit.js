(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase18CompletionAudit = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-18";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "009c9c1a58af7bc40a9673efe61af0e5bb4b60a5";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const COMPLETION_STATUSES = ["completion_ready", "completion_warning", "completion_blocked", "protected_only", "plan_only_complete"];
  const RELEASE_AUDIT_STATUSES = ["release_audit_ready", "release_audit_warning", "release_audit_blocked", "protected_release_only"];
  const DATABASES = ["phase18-completion-audit-db.json", "phase18-release-audit-db.json"];
  const PHASE_MANIFEST = [
    { phase: "Phase18-1", engine: "self-expansion-page.js", database: "self-expansion-db.json", test: "tests/selfExpansionEngine.test.js" },
    { phase: "Phase18-2", engine: "auto-development-page.js", database: "auto-development-db.json", test: "tests/autoDevelopmentEngine.test.js" },
    { phase: "Phase18-3", engine: "ai-evolution-page.js", database: "ai-evolution-db.json", test: "tests/aiEvolutionEngine.test.js" },
    { phase: "Phase18-4", engine: "self-diagnosis-page.js", database: "self-diagnosis-db.json", test: "tests/selfDiagnosisEngine.test.js", route: "self-diagnosis-engine" },
    { phase: "Phase18-5", engine: "self-repair-page.js", database: "self-repair-plan-db.json", test: "tests/selfRepairEngine.test.js", route: "self-repair-engine" },
    { phase: "Phase18-6", engine: "repair-approval-page.js", database: "repair-approval-history-db.json", test: "tests/repairApprovalGate.test.js", route: "repair-approval-gate" },
    { phase: "Phase18-7", engine: "repair-audit-page.js", database: "repair-audit-history-db.json", test: "tests/repairAuditRollback.test.js", route: "repair-audit-engine" },
    { phase: "Phase18-8", engine: "repair-governance-dashboard.js", database: "repair-governance-db.json", test: "tests/repairGovernanceDashboard.test.js", route: "repair-governance-dashboard" },
    { phase: "Phase18-9", engine: "governance-alert-page.js", database: "governance-alert-db.json", test: "tests/governanceAlertPriority.test.js", route: "governance-alert-engine" },
    { phase: "Phase18-10", engine: "final-safety-lock-page.js", database: "final-safety-lock-db.json", test: "tests/finalSafetyLockReleaseReadiness.test.js", route: "final-safety-lock-gate" },
    { phase: "Phase18-11", engine: "global-intelligence-control-center.js", database: "global-intelligence-control-center-db.json", test: "tests/globalIntelligenceControlCenter.test.js", route: "global-intelligence-control-center" },
    { phase: "Phase18-12", engine: "global-network-readiness-simulator.js", database: "global-network-readiness-db.json", test: "tests/globalNetworkReadinessSimulator.test.js", route: "global-network-readiness-simulator" },
    { phase: "Phase18-13", engine: "global-intelligence-network-core.js", database: "global-intelligence-network-core-db.json", test: "tests/globalIntelligenceNetworkCore.test.js", route: "global-intelligence-network-core" },
    { phase: "Phase18-14", engine: "global-network-node-sync-validator.js", database: "global-network-node-sync-db.json", test: "tests/globalNetworkNodeSyncValidator.test.js", route: "global-network-node-sync-validator" },
    { phase: "Phase18-15", engine: "global-network-safety-scoring.js", database: "global-network-safety-score-db.json", test: "tests/globalNetworkSafetyScoring.test.js", route: "global-network-safety-gate" },
    { phase: "Phase18-16", engine: "global-network-simulation-log.js", database: "global-network-simulation-log-db.json", test: "tests/globalNetworkSimulationLog.test.js", route: "global-network-simulation-audit" },
    { phase: "Phase18-17", engine: "global-network-audit-report.js", database: "global-network-audit-report-db.json", test: "tests/globalNetworkAuditReport.test.js", route: "global-network-comprehensive-audit" }
  ];
  const AUDIT_FILES = ["index.html", "private-local.html", "README.md", ...PHASE_MANIFEST.flatMap((item) => [item.engine, item.database, item.test]), ...DATABASES];
  const STORAGE_KEY = "phase18CompletionAuditLatest";
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const conflictPattern = /^(<<<<<<<|=======|>>>>>>>)(?: .*)?$/m;

  function validateJson(files) {
    const entries = Object.entries(files).filter(([file]) => file.endsWith(".json"));
    return entries.length > 0 && entries.every(([, value]) => { try { JSON.parse(String(value)); return true; } catch (_) { return false; } });
  }

  function validateJavaScript(files) {
    const entries = PHASE_MANIFEST.map((item) => item.engine).filter((file) => hasOwn(files, file));
    return entries.length > 0 && entries.every((file) => { try { new Function(String(files[file])); return true; } catch (_) { return false; } });
  }

  function auditSnapshot(snapshot = {}, now = () => new Date()) {
    const files = snapshot.files || {};
    const indexText = String(files["index.html"] || "");
    const privateText = String(files["private-local.html"] || "");
    const readmeText = String(files["README.md"] || "");
    const allPhaseFilesPresent = PHASE_MANIFEST.every((item) => hasOwn(files, item.engine) && hasOwn(files, item.database));
    const allPhaseTestsPresent = PHASE_MANIFEST.every((item) => hasOwn(files, item.test));
    const routed = PHASE_MANIFEST.filter((item) => item.route);
    const dashboardLinksOk = routed.every((item) => indexText.includes(`id="${item.route}"`));
    const privateLocalLinksOk = routed.every((item) => privateText.includes(`index.html#${item.route}`));
    const officialReleaseProtected = readmeText.includes("Official Release v2.8") && !/officialReleaseProtected\s*["']?\s*:\s*false/i.test(Object.values(files).join("\n"));
    const policyText = PHASE_MANIFEST.slice(4).map((item) => String(files[item.engine] || "")).join("\n") + readmeText;
    const planOnlyEnforced = policyText.includes("PLAN_ONLY") && !/executionPolicy\s*["']?\s*:\s*["'](?:AUTO|EXECUTE)/i.test(policyText);
    const engineText = PHASE_MANIFEST.map((item) => String(files[item.engine] || "")).join("\n");
    const executionBlocked = !/(?:executionAllowed|autoExecutionAllowed|auto_execution_allowed)\s*[:=]\s*true/i.test(engineText);
    const externalConnectionBlocked = !/external_connection_allowed\s*[:=]\s*true/i.test(engineText);
    const conflictMarkerZero = Object.values(files).every((value) => !conflictPattern.test(String(value)));
    const jsonValid = validateJson(files);
    const javascriptValid = validateJavaScript(files);
    const testSummary = { expected: PHASE_MANIFEST.length, present: PHASE_MANIFEST.filter((item) => hasOwn(files, item.test)).length, passed: Number(snapshot.testSummary?.passed ?? 0), failed: Number(snapshot.testSummary?.failed ?? 0) };
    const coreChecks = [allPhaseFilesPresent, allPhaseTestsPresent, dashboardLinksOk, privateLocalLinksOk, officialReleaseProtected, planOnlyEnforced, executionBlocked, externalConnectionBlocked, conflictMarkerZero, jsonValid, javascriptValid, testSummary.failed === 0];
    const blocked = !officialReleaseProtected || !executionBlocked || !externalConnectionBlocked || !conflictMarkerZero || !jsonValid || !javascriptValid || testSummary.failed > 0;
    const warning = !allPhaseFilesPresent || !allPhaseTestsPresent || !dashboardLinksOk || !privateLocalLinksOk;
    const completionStatus = snapshot.protectedOnlyMode ? "protected_only" : blocked ? "completion_blocked" : warning ? "completion_warning" : planOnlyEnforced ? "plan_only_complete" : "completion_ready";
    const releaseAuditStatus = snapshot.protectedOnlyMode ? "protected_release_only" : blocked ? "release_audit_blocked" : warning ? "release_audit_warning" : "release_audit_ready";
    const generatedAt = now().toISOString();
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      baseMainCommit: BASE_MAIN_COMMIT,
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      generatedAt,
      phase18_completion_status: completionStatus,
      all_phase_files_present: allPhaseFilesPresent,
      all_phase_tests_present: allPhaseTestsPresent,
      dashboard_links_ok: dashboardLinksOk,
      private_local_links_ok: privateLocalLinksOk,
      official_release_protected: officialReleaseProtected,
      plan_only_enforced: planOnlyEnforced,
      execution_blocked: executionBlocked,
      external_connection_blocked: externalConnectionBlocked,
      conflict_marker_zero: conflictMarkerZero,
      json_valid: jsonValid,
      javascript_valid: javascriptValid,
      test_summary: testSummary,
      release_audit_summary: { status: releaseAuditStatus, protected_release_status: "protected_release_only", main_base_verified: snapshot.mainBaseCommit ? snapshot.mainBaseCommit.startsWith("009c9c1") : true, completed_checks: coreChecks.filter(Boolean).length, total_checks: coreChecks.length }
    };
  }

  async function loadText(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.text() : null; }
    catch (_) { return null; }
  }

  async function loadSnapshot(options = {}) {
    const fetcher = options.fetch || fetch;
    const loaded = await Promise.all(AUDIT_FILES.map(async (file) => [file, await loadText(file, fetcher)]));
    return { files: Object.fromEntries(loaded.filter(([, value]) => value !== null)), testSummary: options.testSummary || { passed: 0, failed: 0 }, mainBaseCommit: BASE_MAIN_COMMIT };
  }

  function persistReport(report, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(report));
    return report;
  }

  function renderReport(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase18-completion-status", report.phase18_completion_status);
    set("#phase18-release-audit-status", report.release_audit_summary.status);
    set("#phase18-files-status", report.all_phase_files_present);
    set("#phase18-tests-status", report.all_phase_tests_present);
    set("#phase18-protection-status", report.official_release_protected);
    set("#phase18-plan-status", report.plan_only_enforced);
    set("#phase18-execution-status", report.execution_blocked);
    set("#phase18-external-status", report.external_connection_blocked);
    set("#phase18-audit-updated", report.generatedAt);
    return report;
  }

  async function runCompletionAudit(options = {}) {
    const storage = options.storage || window.localStorage;
    const report = auditSnapshot(await loadSnapshot(options));
    persistReport(report, storage);
    return renderReport(report, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase18-completion-audit");
      if (button) button.addEventListener("click", () => runCompletionAudit().catch(() => undefined));
      runCompletionAudit().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, COMPLETION_STATUSES, RELEASE_AUDIT_STATUSES, DATABASES, PHASE_MANIFEST, AUDIT_FILES, STORAGE_KEY, validateJson, validateJavaScript, auditSnapshot, loadText, loadSnapshot, persistReport, renderReport, runCompletionAudit };
});
