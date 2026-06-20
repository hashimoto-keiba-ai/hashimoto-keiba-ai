(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGlobalIntelligenceNetworkCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-13";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const EXECUTION_ALLOWED = false;
  const AUTO_EXECUTION_ALLOWED = false;
  const EXTERNAL_CONNECTION_ALLOWED = false;
  const NETWORK_MODES = ["skeleton_only", "readiness_only"];
  const NODE_STATUSES = ["node_ready", "node_warning", "node_blocked", "protected_only", "skeleton_only"];
  const DATABASES = ["global-intelligence-network-core-db.json", "global-intelligence-network-nodes-db.json"];
  const MONITORED_DATABASES = [
    "self-diagnosis-db.json", "self-repair-plan-db.json", "repair-approval-history-db.json", "repair-audit-history-db.json",
    "repair-governance-db.json", "governance-alert-db.json", "final-safety-lock-db.json",
    "global-intelligence-control-center-db.json", "global-network-readiness-db.json", "global-network-simulation-db.json"
  ];
  const STORAGE_KEYS = {
    readiness: "globalNetworkReadinessLatest", simulation: "globalNetworkSimulationLatest",
    controlCenter: "globalIntelligenceControlCenterLatest", finalSafety: "finalSafetyLockLatest",
    latest: "globalIntelligenceNetworkCoreLatest"
  };
  const NODE_DEFINITIONS = [
    { node_id: "diagnosis_node", node_name: "Self Diagnosis Node", source_phase: "Phase18-4", source_file: "self-diagnosis-page.js", check: "diagnosis_ready", protected: false, dependencies: [] },
    { node_id: "repair_node", node_name: "Self Repair Node", source_phase: "Phase18-5", source_file: "self-repair-page.js", check: "repair_ready", protected: false, dependencies: ["diagnosis_node"] },
    { node_id: "approval_node", node_name: "Repair Approval Node", source_phase: "Phase18-6", source_file: "repair-approval-page.js", check: "approval_ready", protected: false, dependencies: ["repair_node"] },
    { node_id: "audit_node", node_name: "Repair Audit Node", source_phase: "Phase18-7", source_file: "repair-audit-page.js", check: "audit_ready", protected: false, dependencies: ["approval_node"] },
    { node_id: "governance_node", node_name: "Repair Governance Node", source_phase: "Phase18-8", source_file: "repair-governance-dashboard.js", check: "governance_ready", protected: false, dependencies: ["diagnosis_node", "repair_node", "approval_node", "audit_node"] },
    { node_id: "alert_node", node_name: "Governance Alert Node", source_phase: "Phase18-9", source_file: "governance-alert-page.js", check: "alert_priority_ready", protected: false, dependencies: ["governance_node"] },
    { node_id: "safety_lock_node", node_name: "Official Release Safety Lock Node", source_phase: "Phase18-10", source_file: "final-safety-lock-page.js", check: "official_release_protected", protected: true, dependencies: ["governance_node", "alert_node"] },
    { node_id: "control_center_node", node_name: "Global Intelligence Control Center Node", source_phase: "Phase18-11", source_file: "global-intelligence-control-center.js", check: "control_center_ready", protected: false, dependencies: ["safety_lock_node"] },
    { node_id: "readiness_simulator_node", node_name: "Global Network Readiness Simulator Node", source_phase: "Phase18-12", source_file: "global-network-readiness-simulator.js", check: "network_simulation_only", protected: false, dependencies: ["control_center_node", "safety_lock_node"] }
  ];

  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };

  function resolveNodeStatus(definition, readiness = {}) {
    if (definition.protected) return "protected_only";
    if (definition.node_id === "readiness_simulator_node" && readiness.readiness_status !== "network_blocked") return "skeleton_only";
    const ok = readiness.checks?.[definition.check];
    if (ok === false && readiness.readiness_status === "network_blocked") return "node_blocked";
    if (ok === false) return "node_warning";
    return "node_ready";
  }

  function buildNodes(readiness = {}) {
    return NODE_DEFINITIONS.map((definition) => ({
      node_id: definition.node_id,
      node_name: definition.node_name,
      source_phase: definition.source_phase,
      source_file: definition.source_file,
      status: resolveNodeStatus(definition, readiness),
      protected: definition.protected,
      execution_allowed: false,
      external_connection_allowed: false,
      dependencies: [...definition.dependencies],
      safety_notes: definition.protected
        ? "Official Release v2.8 protected_only。変更・実行・外部接続は禁止です。"
        : "PLAN_ONLY / skeleton_only。状態監視のみで、実行・外部接続は行いません。"
    }));
  }

  function buildNetworkCore(sources = {}, now = () => new Date()) {
    const readiness = sources.readiness || sources.databases?.["global-network-readiness-db.json"] || {};
    const nodes = buildNodes(readiness);
    const nodeBlockedCount = nodes.filter((node) => node.status === "node_blocked").length;
    const nodeWarningCount = nodes.filter((node) => node.status === "node_warning").length;
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
      network_mode: "skeleton_only",
      readiness_mode: "readiness_only",
      generatedAt: now().toISOString(),
      core_status: nodeBlockedCount ? "node_blocked" : nodeWarningCount ? "node_warning" : "skeleton_only",
      node_count: nodes.length,
      node_ready_count: nodes.filter((node) => node.status === "node_ready").length,
      node_warning_count: nodeWarningCount,
      node_blocked_count: nodeBlockedCount,
      protected_node_count: nodes.filter((node) => node.status === "protected_only").length,
      nodes,
      monitored_databases: [...MONITORED_DATABASES]
    };
  }

  async function loadJson(path, fetcher) {
    try { const response = await fetcher(path, { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch (_) { return null; }
  }

  async function loadSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const storage = options.storage || window.localStorage;
    const loaded = await Promise.all(MONITORED_DATABASES.map(async (file) => [file, await loadJson(file, fetcher)]));
    return {
      databases: Object.fromEntries(loaded.filter(([, value]) => value)),
      readiness: readStoredJson(storage, STORAGE_KEYS.readiness),
      simulation: readStoredJson(storage, STORAGE_KEYS.simulation),
      controlCenter: readStoredJson(storage, STORAGE_KEYS.controlCenter),
      finalSafety: readStoredJson(storage, STORAGE_KEYS.finalSafety)
    };
  }

  function persistCore(core, storage) {
    if (storage) storage.setItem(STORAGE_KEYS.latest, JSON.stringify(core));
    return core;
  }

  function renderCore(core, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#global-network-core-status", core.core_status);
    set("#global-network-core-mode", core.network_mode);
    set("#global-network-core-nodes", core.node_count);
    set("#global-network-core-blocked", core.node_blocked_count);
    set("#global-network-core-external", core.external_connection_allowed);
    set("#global-network-core-updated", core.generatedAt);
    const list = doc.querySelector("#global-network-core-node-list");
    if (list) list.innerHTML = core.nodes.map((node) => `<li class="core-node status-${node.status}"><strong>${node.node_id}</strong><span>${node.status} / ${node.source_phase}</span></li>`).join("");
    return core;
  }

  async function runNetworkCore(options = {}) {
    const storage = options.storage || window.localStorage;
    const core = buildNetworkCore(await loadSources({ ...options, storage }));
    persistCore(core, storage);
    return renderCore(core, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-global-network-core");
      if (button) button.addEventListener("click", () => runNetworkCore().catch(() => undefined));
      runNetworkCore().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, EXECUTION_ALLOWED, AUTO_EXECUTION_ALLOWED, EXTERNAL_CONNECTION_ALLOWED, NETWORK_MODES, NODE_STATUSES, DATABASES, MONITORED_DATABASES, STORAGE_KEYS, NODE_DEFINITIONS, readStoredJson, resolveNodeStatus, buildNodes, buildNetworkCore, loadJson, loadSources, persistCore, renderCore, runNetworkCore };
});
