(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase19ValidationReadinessChecklist = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase19-10";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const BASE_MAIN_COMMIT = "1b787111c83316cb526d027944fd4843c3f2c4f6";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const CHECKLIST_STATUSES = ["checklist_ready", "checklist_plan_only", "checklist_needs_review", "checklist_hold", "checklist_blocked", "protected_only"];
  const STOP_CONDITIONS = ["safety_contract_violation", "missing_dependency", "protected_release_risk", "execution_flag_enabled", "external_connection_flag_enabled"];
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"];
  const ALLOWED_ACTIONS = ["plan", "simulate", "validate", "audit", "report"];
  const DATABASES = ["phase19-validation-readiness-checklist-db.json", "phase19-validation-readiness-summary-db.json"];
  const SOURCE_ASSETS = [
    "phase19-connection-readiness-matrix-db.json",
    "phase19-connection-readiness-summary-db.json",
    "phase19-validation-scenario-db.json",
    "phase19-validation-scenario-summary-db.json",
    "phase19-integration-blueprint-db.json",
    "phase19-safety-contract-db.json",
    "phase19-node-priority-db.json",
    "phase19-preconnection-stop-condition-db.json",
    "phase19-simulation-result-db.json",
    "phase19-preconnection-approval-db.json",
    "phase19-final-preconnection-safety-review-db.json",
    "phase19-midphase-integrity-summary-db.json"
  ];
  const STORAGE_KEY = "phase19ValidationReadinessChecklistLatest";

  function hasUnsafeFlags(...sources) {
    const keys = ["executionAllowed", "autoExecutionAllowed", "auto_execution_allowed", "external_connection_allowed", "execution_allowed", "connection_authority_issued"];
    return sources.some((source) => {
      const visit = (value) => {
        if (!value || typeof value !== "object") return false;
        if (Array.isArray(value)) return value.some(visit);
        return Object.entries(value).some(([key, nested]) => (keys.includes(key) && nested === true) || visit(nested));
      };
      return visit(source);
    });
  }

  function checklistStatusFor(scenario, unsafe) {
    if (scenario.scenario_status === "protected_only") return "protected_only";
    if (unsafe || scenario.scenario_status === "scenario_blocked") return "checklist_blocked";
    if (scenario.scenario_status === "scenario_hold") return "checklist_hold";
    if (scenario.scenario_status === "scenario_needs_validation") return "checklist_needs_review";
    if (scenario.scenario_status === "scenario_plan_only") return "checklist_plan_only";
    return "checklist_ready";
  }

  function requiredPrechecksFor(scenario) {
    return [
      "confirm_scenario_status",
      "confirm_validation_mode",
      "confirm_required_checks_present",
      "confirm_stop_conditions_present",
      "confirm_expected_outputs_present",
      "confirm_audit_focus_present",
      "confirm_blocked_actions_enforced",
      "confirm_allowed_actions_limited",
      "confirm_execution_allowed_false",
      "confirm_external_connection_allowed_false",
      ...(scenario.validation_steps || []).filter((step) => step.startsWith("confirm_"))
    ];
  }

  function unresolvedItemsFor(scenario, status) {
    if (status === "protected_only") return ["permanent_release_protection"];
    if (status === "checklist_blocked") return ["blocked_scenario_review_required"];
    if (status === "checklist_hold") return ["held_scenario_review_required"];
    if (status === "checklist_needs_review") return ["additional_validation_review_required"];
    return [];
  }

  function safetyConstraintsFor(scenario) {
    const constraints = ["PLAN_ONLY", "no_external_connection", "no_auto_execution", "no_auto_repair", "no_auto_overwrite", "no_auto_rollback"];
    if (scenario.scenario_status === "protected_only" || scenario.category === "race_course_os") constraints.push("Official Release v2.8 protected_only");
    return constraints;
  }

  function auditRequirementsFor(scenario) {
    return [
      "record_precheck_result",
      "retain_read_only_audit_evidence",
      "verify_no_execution_authority",
      "verify_no_external_connection_authority",
      ...(scenario.audit_focus || []).map((focus) => `audit_focus: ${focus}`)
    ];
  }

  function recommendedActionFor(status) {
    if (status === "protected_only") return "Recommended: continue read-only protection checks and keep the protected release outside validation execution.";
    if (status === "checklist_plan_only") return "Recommended: keep planning, audit, and report review only; do not request connection authority.";
    if (status === "checklist_ready") return "Recommended: proceed only to PLAN_ONLY validation review with every execution and connection flag kept false.";
    if (status === "checklist_needs_review") return "Recommended: resolve unresolved checklist items through read-only validation review before any later scenario review.";
    if (status === "checklist_hold") return "Recommended: keep the checklist on hold and review safety evidence without enabling execution.";
    return "Recommended: stop at checklist review and resolve blocking evidence without changing execution policy.";
  }

  function createChecklist(scenario, context = {}) {
    const status = checklistStatusFor(scenario, context.unsafe);
    return {
      checklist_id: `P19-CHECKLIST-${scenario.priority_id.split("-").pop()}`,
      scenario_id: scenario.scenario_id,
      node_name: scenario.node_name,
      category: scenario.category,
      priority_id: scenario.priority_id,
      readiness_status: scenario.readiness_status,
      scenario_status: scenario.scenario_status,
      checklist_status: status,
      required_prechecks: requiredPrechecksFor(scenario),
      unresolved_items: unresolvedItemsFor(scenario, status),
      safety_constraints: safetyConstraintsFor(scenario),
      stop_conditions: [...STOP_CONDITIONS],
      audit_requirements: auditRequirementsFor(scenario),
      recommended_next_action: recommendedActionFor(status),
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS],
      execution_allowed: false,
      external_connection_allowed: false
    };
  }

  function buildValidationReadinessChecklist(sources = {}, now = () => new Date()) {
    const matrixDatabase = sources.matrixDatabase || {};
    const matrixSummary = sources.matrixSummary || {};
    const scenarioDatabase = sources.scenarioDatabase || { records: [] };
    const scenarioSummary = sources.scenarioSummary || {};
    const safetyContract = sources.safetyContract || {};
    const midphaseSummary = sources.midphaseSummary || {};
    const availableSources = new Set(sources.availableSources || SOURCE_ASSETS);
    const missingSources = SOURCE_ASSETS.filter((asset) => !availableSources.has(asset));
    const unsafe = hasUnsafeFlags(matrixDatabase, matrixSummary, scenarioDatabase, scenarioSummary, safetyContract, midphaseSummary);
    const records = (scenarioDatabase.records || []).map((scenario) => createChecklist(scenario, { unsafe }));
    const statusCounts = Object.fromEntries(CHECKLIST_STATUSES.map((status) => [status, records.filter((item) => item.checklist_status === status).length]));
    const generatedAt = now();
    return {
      phase: PHASE,
      checklist_builder_id: `P19-VALIDATION-CHECKLIST-${generatedAt.getTime()}`,
      checklist_builder_status: unsafe || missingSources.length > 0 ? "checklist_builder_blocked" : "checklist_builder_plan_only",
      source_matrix_status: matrixDatabase.matrix_status || "unknown",
      source_scenario_status: scenarioDatabase.scenario_builder_status || "unknown",
      source_midphase_status: matrixDatabase.source_midphase_status || midphaseSummary.phase19_midphase_status || "unknown",
      official_release_protected: matrixDatabase.official_release_protected !== false && scenarioDatabase.official_release_protected !== false && safetyContract.official_release_protected !== false,
      plan_only_enforced: true,
      connection_authority_issued: false,
      records,
      checklist_summary: {
        total: records.length,
        ...statusCounts,
        unsafe_flags_count: unsafe ? 1 : 0,
        missing_source_count: missingSources.length
      },
      missing_source_assets: missingSources,
      next_validation_step: "Phase19-11 Global Network Validation Dry Run Review",
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

  async function loadJson(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const loaded = await Promise.all(SOURCE_ASSETS.map(async (asset) => [asset, await loadJson(asset, fetcher)]));
    const databases = Object.fromEntries(loaded.filter(([, value]) => value !== null));
    return {
      matrixDatabase: options.matrixDatabase || databases["phase19-connection-readiness-matrix-db.json"],
      matrixSummary: options.matrixSummary || databases["phase19-connection-readiness-summary-db.json"],
      scenarioDatabase: options.scenarioDatabase || databases["phase19-validation-scenario-db.json"],
      scenarioSummary: options.scenarioSummary || databases["phase19-validation-scenario-summary-db.json"],
      blueprint: options.blueprint || databases["phase19-integration-blueprint-db.json"],
      safetyContract: options.safetyContract || databases["phase19-safety-contract-db.json"],
      priorityDatabase: options.priorityDatabase || databases["phase19-node-priority-db.json"],
      stopConditions: options.stopConditions || databases["phase19-preconnection-stop-condition-db.json"],
      simulationResults: options.simulationResults || databases["phase19-simulation-result-db.json"],
      approvalDatabase: options.approvalDatabase || databases["phase19-preconnection-approval-db.json"],
      finalReviewDatabase: options.finalReviewDatabase || databases["phase19-final-preconnection-safety-review-db.json"],
      midphaseSummary: options.midphaseSummary || databases["phase19-midphase-integrity-summary-db.json"],
      availableSources: loaded.filter(([, value]) => value !== null).map(([asset]) => asset),
      databases
    };
  }

  function persistChecklist(checklist, storage) { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(checklist)); return checklist; }

  function renderChecklist(checklist, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#phase19-checklist-builder-status", checklist.checklist_builder_status);
    set("#phase19-checklist-total", checklist.checklist_summary.total);
    set("#phase19-checklist-ready", checklist.checklist_summary.checklist_ready);
    set("#phase19-checklist-plan-only", checklist.checklist_summary.checklist_plan_only);
    set("#phase19-checklist-protected", checklist.checklist_summary.protected_only);
    set("#phase19-checklist-unsafe", checklist.checklist_summary.unsafe_flags_count);
    set("#phase19-checklist-authority", checklist.connection_authority_issued);
    set("#phase19-checklist-next", checklist.next_validation_step);
    set("#phase19-checklist-updated", checklist.generated_at);
    const list = doc.querySelector("#phase19-checklist-list");
    if (list) {
      list.textContent = "";
      checklist.records.forEach((item) => {
        const row = doc.createElement("li");
        row.className = `phase19-checklist-item status-${item.checklist_status}`;
        row.textContent = `${item.checklist_id} / ${item.node_name} / ${item.checklist_status} / unresolved ${item.unresolved_items.length}`;
        list.appendChild(row);
      });
    }
    return checklist;
  }

  async function runValidationReadinessChecklist(options = {}) {
    const checklist = buildValidationReadinessChecklist(await loadSources(options));
    persistChecklist(checklist, options.storage || window.localStorage);
    return renderChecklist(checklist, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase19-checklist-builder");
      if (button) button.addEventListener("click", () => runValidationReadinessChecklist().catch(() => undefined));
      runValidationReadinessChecklist().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, BASE_MAIN_COMMIT, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, CHECKLIST_STATUSES, STOP_CONDITIONS, BLOCKED_ACTIONS, ALLOWED_ACTIONS, DATABASES, SOURCE_ASSETS, STORAGE_KEY, hasUnsafeFlags, checklistStatusFor, requiredPrechecksFor, unresolvedItemsFor, safetyConstraintsFor, auditRequirementsFor, recommendedActionFor, createChecklist, buildValidationReadinessChecklist, loadJson, loadSources, persistChecklist, renderChecklist, runValidationReadinessChecklist };
});
