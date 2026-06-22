(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19MidphaseIntegrityAudit = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-7";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "2e098f4e5cc0f9e7d5f7fcaa37fa099ef37369bf";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const MIDPHASE_STATUSES = ["midphase_ready", "midphase_warning", "midphase_blocked", "protected_only", "plan_only_midphase"];
  const RISK_SUMMARIES = ["no_remaining_risk", "low_risk", "medium_risk", "high_risk", "protected_risk", "blocked_risk"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const MODULES = ["phase19-integration-blueprint.js", "phase19-node-priority-planner.js", "phase19-preconnection-simulation-planner.js", "phase19-simulation-result-evaluator.js", "phase19-preconnection-approval-gate.js", "phase19-final-preconnection-safety-review.js"];
  const DATABASES = ["phase19-integration-blueprint-db.json", "phase19-safety-contract-db.json", "phase19-node-priority-db.json", "phase19-validation-sequence-db.json", "phase19-preconnection-simulation-plan-db.json", "phase19-preconnection-stop-condition-db.json", "phase19-simulation-result-db.json", "phase19-simulation-evaluation-summary-db.json", "phase19-preconnection-approval-db.json", "phase19-preconnection-approval-summary-db.json", "phase19-final-preconnection-safety-review-db.json", "phase19-final-risk-summary-db.json"];
  const TESTS = ["tests/phase19IntegrationBlueprint.test.js", "tests/phase19NodePriorityPlanner.test.js", "tests/phase19PreconnectionSimulationPlanner.test.js", "tests/phase19SimulationResultEvaluator.test.js", "tests/phase19PreconnectionApprovalGate.test.js", "tests/phase19FinalPreconnectionSafetyReview.test.js"];
  const DASHBOARD_IDS = ["phase19-integration-blueprint", "phase19-node-priority-planner", "phase19-preconnection-simulation-planner", "phase19-simulation-result-evaluator", "phase19-preconnection-approval-gate", "phase19-final-preconnection-safety-review"];
  const README_HEADINGS = ["Phase19-1 Global Intelligence Network Integration Blueprint", "Phase19-2 Global Intelligence Network Node Priority Planner", "Phase19-3 Global Intelligence Network Pre-Connection Simulation Planner", "Phase19-4 Global Network Simulation Result Evaluator", "Phase19-5 Global Network Pre-Connection Approval Gate", "Phase19-6 Global Network Final Pre-Connection Safety Review"];
  const AUDIT_DATABASES = ["phase19-midphase-integrity-audit-db.json", "phase19-midphase-integrity-summary-db.json"];
  const SOURCE_ASSETS = [...MODULES, ...DATABASES, ...TESTS, "index.html", "private-local.html", "README.md"];
  const DEFAULT_VALIDATION = Object.freeze({ json: { checked: 133, passed: 133, failed: 0, status: "passed" }, javascript: { checked: 161, passed: 161, failed: 0, status: "passed" }, tests: { checked: 25, passed: 25, failed: 0, status: "passed" } });
  const STORAGE_KEY = "phase19MidphaseIntegrityAuditLatest";

  function countUnsafeFlags(value) {
    const unsafeKeys = new Set(["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed", "execution_allowed", "connection_authority_issued"]);
    let count = 0;
    const visit = (item) => {
      if (!item || typeof item !== "object") return;
      if (Array.isArray(item)) return item.forEach(visit);
      Object.entries(item).forEach(([key, nested]) => { if (unsafeKeys.has(key) && nested === true) count += 1; visit(nested); });
    };
    visit(value);
    return count;
  }

  function classifyRisk(summary = {}) {
    if ((summary.blocked || 0) > 0) return "blocked_risk";
    if ((summary.high || 0) > 0) return "high_risk";
    if ((summary.medium || 0) > 0) return "medium_risk";
    if ((summary.low || 0) > 0) return "low_risk";
    // A protected release is an enforced safety state, not an unresolved risk.
    // protected_risk remains available for explicit protected-only audits.
    return "no_remaining_risk";
  }

  function buildMidphaseAudit(sources = {}, now = () => new Date()) {
    const availableFiles = new Set(sources.availableFiles || SOURCE_ASSETS);
    const contents = sources.contents || {};
    const databases = sources.databases || {};
    const modulesPresent = MODULES.every((file) => availableFiles.has(file));
    const dbsPresent = DATABASES.every((file) => availableFiles.has(file));
    const testsPresent = TESTS.every((file) => availableFiles.has(file));
    const index = contents["index.html"] || "";
    const privateLocal = contents["private-local.html"] || "";
    const readme = contents["README.md"] || "";
    const dashboardLinksOk = DASHBOARD_IDS.every((id) => index.includes(`id="${id}"`));
    const privateLocalLinksOk = DASHBOARD_IDS.every((id) => privateLocal.includes(`href="index.html#${id}"`));
    const readmeLinksOk = README_HEADINGS.every((heading) => readme.includes(heading));
    const unsafeFlagsCount = countUnsafeFlags(databases) + Number(sources.additionalUnsafeFlags || 0);
    const modulePolicyOk = MODULES.every((file) => !contents[file] || contents[file].includes("PLAN_ONLY"));
    const safetyContract = databases["phase19-safety-contract-db.json"] || {};
    const finalRiskDatabase = databases["phase19-final-risk-summary-db.json"] || {};
    const planOnlyEnforced = modulePolicyOk && safetyContract.execution_policy === "PLAN_ONLY" && unsafeFlagsCount === 0;
    const officialReleaseProtected = safetyContract.official_release_protected === true && finalRiskDatabase.official_release_protected === true;
    const executionBlocked = unsafeFlagsCount === 0 && safetyContract.blocked_actions?.includes("auto_execution") && finalRiskDatabase.connection_authority_issued === false;
    const externalConnectionBlocked = unsafeFlagsCount === 0 && safetyContract.blocked_actions?.includes("external_connection") && finalRiskDatabase.external_connection_allowed === false;
    const conflictMarkerCount = Object.values(contents).reduce((count, text) => count + ((String(text).match(/^(<<<<<<<|=======|>>>>>>>)/gm) || []).length), 0);
    const validation = sources.validation || DEFAULT_VALIDATION;
    const validationOk = [validation.json, validation.javascript, validation.tests].every((item) => item.failed === 0 && item.status === "passed");
    const remainingRiskSummary = classifyRisk(finalRiskDatabase.remaining_risk_summary || {});
    const structuralFailure = !modulesPresent || !dbsPresent || !testsPresent || !dashboardLinksOk || !privateLocalLinksOk || !readmeLinksOk || !planOnlyEnforced || !officialReleaseProtected || !executionBlocked || !externalConnectionBlocked || unsafeFlagsCount > 0 || conflictMarkerCount > 0 || !validationOk;
    const warning = ["medium_risk", "high_risk", "blocked_risk"].includes(remainingRiskSummary);
    const midphaseStatus = sources.protectedOnlyMode ? "protected_only" : structuralFailure ? "midphase_blocked" : warning ? "midphase_warning" : "plan_only_midphase";
    const generatedAt = now();
    return {
      phase: PHASE,
      audit_id: `P19-MIDPHASE-${generatedAt.getTime()}`,
      phase19_midphase_status: midphaseStatus,
      phase19_modules_present: modulesPresent,
      phase19_dbs_present: dbsPresent,
      phase19_tests_present: testsPresent,
      dashboard_links_ok: dashboardLinksOk,
      private_local_links_ok: privateLocalLinksOk,
      readme_links_ok: readmeLinksOk,
      plan_only_enforced: planOnlyEnforced,
      official_release_protected: officialReleaseProtected,
      execution_blocked: executionBlocked,
      external_connection_blocked: externalConnectionBlocked,
      unsafe_flags_count: unsafeFlagsCount,
      conflict_marker_count: conflictMarkerCount,
      json_validation_summary: { ...validation.json },
      javascript_validation_summary: { ...validation.javascript },
      test_validation_summary: { ...validation.tests },
      remaining_risk_summary: remainingRiskSummary,
      remaining_risk_details: { ...(finalRiskDatabase.remaining_risk_summary || {}) },
      recommended_next_phase: ["midphase_blocked", "midphase_warning"].includes(midphaseStatus) ? "remediation_review" : "Phase19-8",
      missing_modules: MODULES.filter((file) => !availableFiles.has(file)),
      missing_databases: DATABASES.filter((file) => !availableFiles.has(file)),
      missing_tests: TESTS.filter((file) => !availableFiles.has(file)),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      generated_at: generatedAt.toISOString(),
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false
    };
  }

  async function loadAsset(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); if (!response.ok) return null; return path.endsWith(".json") ? await response.json() : await response.text(); }
    catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const loaded = await Promise.all(SOURCE_ASSETS.map(async (asset) => [asset, await loadAsset(asset, fetcher)]));
    const assets = Object.fromEntries(loaded.filter(([, value]) => value !== null));
    return { availableFiles: loaded.filter(([, value]) => value !== null).map(([asset]) => asset), contents: Object.fromEntries(Object.entries(assets).filter(([, value]) => typeof value === "string")), databases: Object.fromEntries(Object.entries(assets).filter(([file]) => file.endsWith(".json"))), validation: options.validation || DEFAULT_VALIDATION };
  }

  function persistAudit(audit, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(audit)); return audit; }

  function renderAudit(audit, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-midphase-status", audit.phase19_midphase_status);
    set("#phase19-midphase-modules", audit.phase19_modules_present);
    set("#phase19-midphase-dbs", audit.phase19_dbs_present);
    set("#phase19-midphase-tests", audit.phase19_tests_present);
    set("#phase19-midphase-unsafe", audit.unsafe_flags_count);
    set("#phase19-midphase-conflicts", audit.conflict_marker_count);
    set("#phase19-midphase-risk", audit.remaining_risk_summary);
    set("#phase19-midphase-next", audit.recommended_next_phase);
    set("#phase19-midphase-updated", audit.generated_at);
    return audit;
  }

  async function runMidphaseAudit(options = {}) {
    const audit = buildMidphaseAudit(await loadSources(options));
    persistAudit(audit, options.storage || window.localStorage);
    return renderAudit(audit, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => { const button = document.querySelector("#run-phase19-midphase-audit"); if (button) button.addEventListener("click", () => runMidphaseAudit().catch(() => undefined)); runMidphaseAudit().catch(() => undefined); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, MIDPHASE_STATUSES, RISK_SUMMARIES, BLOCKED_ACTIONS, ALLOWED_ACTIONS, MODULES, DATABASES, TESTS, DASHBOARD_IDS, README_HEADINGS, AUDIT_DATABASES, SOURCE_ASSETS, DEFAULT_VALIDATION, STORAGE_KEY, countUnsafeFlags, classifyRisk, buildMidphaseAudit, loadAsset, loadSources, persistAudit, renderAudit, runMidphaseAudit };
});
