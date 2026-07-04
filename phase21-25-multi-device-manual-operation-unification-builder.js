(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2125MultiDeviceManualOperationUnificationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-25";
  const CHECKLIST_NAME = "Multi Device Manual Operation Unification Checklist";
  const PANEL_STATUS = "phase21_25_multi_device_manual_operation_unification_plan_only";
  const STATUS = "PHASE21_25_MULTI_DEVICE_MANUAL_OPERATION_UNIFICATION_READY";
  const DB_URL = "phase21-25-multi-device-manual-operation-unification-db.json";
  const SUMMARY_URL = "phase21-25-multi-device-manual-operation-unification-summary-db.json";
  const BLOCKED_SCRIPT_POLICY = {
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false,
    autoUpdateLauncherAllowed: false,
    shortcutCreationAllowed: false,
    restoreQuarantinedFileAllowed: false,
    reuseBlockedFileAllowed: false,
    forceAllowSecuritySoftwareAllowed: false
  };
  const DEVICES = [
    {
      id: "company-pc",
      name: "Company PC",
      role: "Implementation, commit, push, and PR creation center",
      primaryActions: ["git switch main", "git pull origin main", "git status", "implement / test / commit"],
      checks: ["working tree clean", "private-local.html manual launch", "no .bat/.ps1/.cmd/.exe"]
    },
    {
      id: "home-pc",
      name: "Home PC",
      role: "Manual confirmation after merge",
      primaryActions: ["git switch main", "git pull origin main", "git status", "manual private-local.html open"],
      checks: ["merged main reflected", "working tree clean", "no automatic launcher"]
    },
    {
      id: "ipad",
      name: "iPad",
      role: "Private repository browsing and visual confirmation",
      primaryActions: ["GitHub app review", "browser review", "README/index confirmation"],
      checks: ["GitHub Pages not required", "no local script execution", "private repository access"]
    }
  ];
  const POST_MERGE_STEPS = [
    { id: "P21-25-HOME-SWITCH-MAIN", label: "Home PC: switch to main after merge.", command: "git switch main", status: "Required" },
    { id: "P21-25-HOME-PULL-MAIN", label: "Home PC: pull merged main manually.", command: "git pull origin main", status: "Required" },
    { id: "P21-25-HOME-STATUS", label: "Home PC: confirm working tree clean.", command: "git status", status: "Required" },
    { id: "P21-25-HOME-OPEN-LOCAL", label: "Home PC: open private-local.html manually.", command: "manual private-local.html open", status: "Required" },
    { id: "P21-25-COMPANY-WORKFLOW", label: "Company PC remains implementation, commit, push, and PR creation center.", command: "manual workflow", status: "Required" },
    { id: "P21-25-IPAD-REVIEW", label: "iPad uses GitHub app or browser for private repository browsing confirmation.", command: "manual review", status: "Recommended" },
    { id: "P21-25-NO-LAUNCHERS", label: "Do not use .bat, .ps1, .cmd, or .exe launch/update files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-25-NORTON-NO-FORCE", label: "If Norton blocks a file, do not force allow, restore, or reuse it.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-25-PRIVATE-LOCAL", label: "Keep private repository, local first, and no GitHub Pages dependency.", command: "private local", status: "PrivateLocalPolicy" }
  ];

  function listOrDefault(value, fallback) {
    return Array.isArray(value) && value.length ? value : fallback;
  }

  function countChecks(devices) {
    return devices.reduce((total, device) => total + listOrDefault(device.checks, []).length, 0);
  }

  function normalizeDevice(device) {
    const safe = device || {};
    return {
      id: safe.id || "device",
      name: safe.name || "Device",
      role: safe.role || "Manual private/local operation",
      primaryActions: listOrDefault(safe.primaryActions, ["manual confirmation"]),
      checks: listOrDefault(safe.checks, ["private/local operation confirmed"])
    };
  }

  function buildMultiDeviceManualOperationUnificationPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const devices = listOrDefault(db.devices, DEVICES).map(normalizeDevice);
    const records = listOrDefault(db.postMergeUpdateSteps, POST_MERGE_STEPS).map((step) => ({
      ...step,
      phase: PHASE,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY }
    }));
    const totalChecks = Number(summary.totalChecks || countChecks(devices));
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      totalDevices: Number(summary.totalDevices || devices.length),
      totalChecks,
      passed: Number(summary.passed || totalChecks),
      devicePolicy: summary.devicePolicy || "Company PC implements; Home PC pulls after merge; iPad browses the private repository.",
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY, ...(db.blockedScriptPolicy || {}), ...(summary.blockedScriptPolicy || {}) },
      launchPolicy: summary.launchPolicy || db.launchPolicy || "manual private-local.html open",
      updatePolicy: summary.updatePolicy || db.updatePolicy || "manual git pull from private repository",
      workingTreeCleanRequired: summary.workingTreeCleanRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Use Company PC for implementation, Home PC for post-merge git pull confirmation, and iPad for browsing confirmation.",
      devices,
      records
    };
  }

  function renderList(doc, selector, items, mapper) {
    const list = doc.querySelector(selector);
    if (!list) return;
    list.textContent = "";
    items.forEach((item) => {
      const row = doc.createElement("li");
      row.className = mapper(item).className;
      row.textContent = mapper(item).text;
      list.appendChild(row);
    });
  }

  function renderMultiDeviceManualOperationUnificationPanel(panel, doc = document) {
    const safePanel = panel || buildMultiDeviceManualOperationUnificationPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedScriptPolicy || BLOCKED_SCRIPT_POLICY;
      set("#phase21-25-panel-status", safePanel.panelStatus);
      set("#phase21-25-status", safePanel.status);
      set("#phase21-25-total-devices", safePanel.totalDevices);
      set("#phase21-25-total-checks", safePanel.totalChecks);
      set("#phase21-25-passed", safePanel.passed);
      set("#phase21-25-device-policy", safePanel.devicePolicy);
      set("#phase21-25-update-policy", safePanel.updatePolicy);
      set("#phase21-25-launch-policy", safePanel.launchPolicy);
      set("#phase21-25-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-25-no-bat", policy.batAllowed);
      set("#phase21-25-no-ps1", policy.ps1Allowed);
      set("#phase21-25-no-cmd", policy.cmdAllowed);
      set("#phase21-25-no-exe", policy.exeAllowed);
      set("#phase21-25-no-force-allow", policy.forceAllowSecuritySoftwareAllowed);
      set("#phase21-25-no-pages", safePanel.githubPagesRequired);
      set("#phase21-25-next-step", safePanel.nextRecommendedStep);
      set("#phase21-25-updated", safePanel.generatedAt);
      renderList(doc, "#phase21-25-device-list", safePanel.devices || [], (device) => ({
        className: `phase21-25-multi-device-manual-operation-unification-item device-${String(device.id || "device").toLowerCase()}`,
        text: `${device.name || "Device"}: ${device.role || ""} / ${listOrDefault(device.primaryActions, []).join(" -> ")} / checks: ${listOrDefault(device.checks, []).join(", ")}`
      }));
      renderList(doc, "#phase21-25-step-list", safePanel.records || [], (record) => ({
        className: `phase21-25-multi-device-manual-operation-unification-item status-${String(record.status || "unknown").toLowerCase()}`,
        text: `${record.id || "P21-25-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`
      }));
    } catch (error) {
      const status = doc.querySelector("#phase21-25-status");
      if (status) status.textContent = "PHASE21_25_MULTI_DEVICE_RENDER_FALLBACK";
    }
    return safePanel;
  }

  async function fetchJson(url) {
    if (typeof fetch !== "function") return null;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response || !response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function runMultiDeviceManualOperationUnificationPanel(options = {}) {
    if (options.sources) return buildMultiDeviceManualOperationUnificationPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildMultiDeviceManualOperationUnificationPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderMultiDeviceManualOperationUnificationPanel(options = {}) {
    const panel = await runMultiDeviceManualOperationUnificationPanel(options);
    return renderMultiDeviceManualOperationUnificationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-25-multi-device-manual-operation-unification");
      if (button) button.addEventListener("click", () => runAndRenderMultiDeviceManualOperationUnificationPanel());
      if (document.querySelector("#phase21-25-multi-device-manual-operation-unification")) runAndRenderMultiDeviceManualOperationUnificationPanel();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    PANEL_STATUS,
    STATUS,
    DB_URL,
    SUMMARY_URL,
    BLOCKED_SCRIPT_POLICY,
    DEVICES,
    POST_MERGE_STEPS,
    buildMultiDeviceManualOperationUnificationPanel,
    renderMultiDeviceManualOperationUnificationPanel,
    runMultiDeviceManualOperationUnificationPanel,
    runAndRenderMultiDeviceManualOperationUnificationPanel
  };
});
