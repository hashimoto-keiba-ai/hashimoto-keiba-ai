(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalNetworkNodeSyncValidator = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-14";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const EXPECTED_NODE_IDS = ["diagnosis_node", "repair_node", "approval_node", "audit_node", "governance_node", "alert_node", "safety_lock_node", "control_center_node", "readiness_simulator_node"];
  const ALLOWED_NODE_STATUSES = ["node_ready", "node_warning", "node_blocked", "protected_only", "skeleton_only"];
  const NODE_SYNC_STATUSES = ["sync_ready", "sync_warning", "sync_blocked", "dependency_missing", "protected_only", "skeleton_only"];
  const DEPENDENCY_STATUSES = ["dependency_ok", "dependency_warning", "dependency_blocked", "dependency_missing"];
  const DATABASES = ["global-network-node-sync-db.json", "global-network-dependency-validator-db.json"];
  const SOURCE_NODE_DATABASE = "global-intelligence-network-nodes-db.json";
  const STORAGE_KEY = "globalNetworkNodeSyncLatest";

  function validateNodeShape(node, availableFiles) {
    const files = availableFiles instanceof Set ? availableFiles : new Set(availableFiles || []);
    return {
      node_id_exists: typeof node?.node_id === "string" && node.node_id.length > 0,
      source_phase_exists: typeof node?.source_phase === "string" && node.source_phase.length > 0,
      source_file_exists: typeof node?.source_file === "string" && files.has(node.source_file),
      dependencies_exists: Array.isArray(node?.dependencies),
      protected_valid: typeof node?.protected === "boolean",
      execution_blocked: node?.execution_allowed === false,
      external_connection_blocked: node?.external_connection_allowed === false,
      status_allowed: ALLOWED_NODE_STATUSES.includes(node?.status)
    };
  }

  function resolveDependencyStatus(node, nodeMap) {
    if (!Array.isArray(node?.dependencies)) return "dependency_missing";
    const dependencies = node.dependencies.map((id) => nodeMap.get(id));
    if (dependencies.some((dependency) => !dependency)) return "dependency_missing";
    if (dependencies.some((dependency) => dependency.status === "node_blocked")) return "dependency_blocked";
    if (dependencies.some((dependency) => dependency.status === "node_warning")) return "dependency_warning";
    return "dependency_ok";
  }

  function resolveSyncStatus(node, checks, dependencyStatus) {
    if (node?.protected === true || node?.status === "protected_only") return "protected_only";
    if (Object.values(checks).some((ok) => !ok)) return "sync_blocked";
    if (dependencyStatus === "dependency_missing") return "dependency_missing";
    if (dependencyStatus === "dependency_blocked") return "sync_blocked";
    if (dependencyStatus === "dependency_warning" || node.status === "node_warning") return "sync_warning";
    if (node.status === "skeleton_only") return "skeleton_only";
    return "sync_ready";
  }

  function validateNodes(nodes = [], availableFiles = []) {
    const nodeMap = new Map(nodes.filter((node) => node?.node_id).map((node) => [node.node_id, node]));
    const results = EXPECTED_NODE_IDS.map((nodeId) => {
      const node = nodeMap.get(nodeId);
      if (!node) return { node_id: nodeId, node_sync_status: "dependency_missing", dependency_status: "dependency_missing", checks: { node_id_exists: false }, missing_dependencies: [], protected: false, execution_allowed: false, external_connection_allowed: false };
      const checks = validateNodeShape(node, availableFiles);
      const dependencyStatus = resolveDependencyStatus(node, nodeMap);
      return {
        node_id: node.node_id,
        source_phase: node.source_phase,
        source_file: node.source_file,
        node_sync_status: resolveSyncStatus(node, checks, dependencyStatus),
        dependency_status: dependencyStatus,
        checks,
        missing_dependencies: node.dependencies.filter((dependency) => !nodeMap.has(dependency)),
        protected: node.protected === true,
        execution_allowed: false,
        external_connection_allowed: false
      };
    });
    return results;
  }

  function buildValidationReport(nodes = [], availableFiles = [], now = () => new Date()) {
    const results = validateNodes(nodes, availableFiles);
    const blocked = results.filter((result) => ["sync_blocked", "dependency_missing"].includes(result.node_sync_status)).length;
    const warning = results.filter((result) => result.node_sync_status === "sync_warning").length;
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      officialReleaseStatus: "protected_only",
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      autoExecutionAllowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      validation_mode: "skeleton_only",
      generatedAt: now().toISOString(),
      overall_sync_status: blocked ? "sync_blocked" : warning ? "sync_warning" : "sync_ready",
      expected_node_count: EXPECTED_NODE_IDS.length,
      validated_node_count: results.length,
      blocked_count: blocked,
      warning_count: warning,
      protected_count: results.filter((result) => result.node_sync_status === "protected_only").length,
      results
    };
  }

  async function loadJson(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch (_) { return null; }
  }

  async function loadValidationInput(options = {}) {
    const fetcher = options.fetch || fetch;
    const nodeDb = await loadJson(SOURCE_NODE_DATABASE, fetcher);
    const nodes = Array.isArray(nodeDb?.nodes) ? nodeDb.nodes : [];
    const files = await Promise.all(nodes.map(async (node) => [node.source_file, Boolean(await loadJson(node.source_file, async (path, init) => {
      const response = await fetcher(path, init);
      return { ok: response.ok, json: async () => ({}) };
    }))]));
    return { nodes, availableFiles: files.filter(([, exists]) => exists).map(([file]) => file) };
  }

  function persistReport(report, storage) {
    if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(report));
    return report;
  }

  function renderReport(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#node-sync-overall", report.overall_sync_status);
    set("#node-sync-validated", `${report.validated_node_count}/${report.expected_node_count}`);
    set("#node-sync-blocked", report.blocked_count);
    set("#node-sync-warning", report.warning_count);
    set("#node-sync-external", report.external_connection_allowed);
    set("#node-sync-updated", report.generatedAt);
    const list = doc.querySelector("#node-sync-result-list");
    if (list) list.innerHTML = report.results.map((result) => `<li class="node-sync-item status-${result.node_sync_status}"><strong>${result.node_id}</strong><span>${result.node_sync_status} / ${result.dependency_status}</span></li>`).join("");
    return report;
  }

  async function runValidator(options = {}) {
    const storage = options.storage || window.localStorage;
    const input = await loadValidationInput(options);
    const report = buildValidationReport(input.nodes, input.availableFiles);
    persistReport(report, storage);
    return renderReport(report, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-node-sync-validator");
      if (button) button.addEventListener("click", () => runValidator().catch(() => undefined));
      runValidator().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, EXPECTED_NODE_IDS, ALLOWED_NODE_STATUSES, NODE_SYNC_STATUSES, DEPENDENCY_STATUSES, DATABASES, SOURCE_NODE_DATABASE, STORAGE_KEY, validateNodeShape, resolveDependencyStatus, resolveSyncStatus, validateNodes, buildValidationReport, loadJson, loadValidationInput, persistReport, renderReport, runValidator };
});
