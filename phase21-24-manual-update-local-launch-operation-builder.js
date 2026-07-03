(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2124ManualUpdateLocalLaunchOperationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-24";
  const CHECKLIST_NAME = "Manual Update Local Launch Operation Checklist";
  const PANEL_STATUS = "phase21_24_manual_update_local_launch_operation_plan_only";
  const STATUS = "PHASE21_24_MANUAL_UPDATE_LOCAL_LAUNCH_OPERATION_READY";
  const BLOCKED_SCRIPT_POLICY = {
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false,
    autoUpdateLauncherAllowed: false,
    shortcutCreationAllowed: false,
    forceAllowSecuritySoftwareAllowed: false
  };
  const STEPS = [
    { id: "P21-24-PC-SWITCH-MAIN", label: "After merge, run git switch main manually.", command: "git switch main", status: "Required" },
    { id: "P21-24-PC-PULL-MAIN", label: "Run git pull origin main manually from the private repository.", command: "git pull origin main", status: "Required" },
    { id: "P21-24-PC-STATUS", label: "Run git status and confirm working tree clean.", command: "git status", status: "Required" },
    { id: "P21-24-PC-OPEN-LOCAL", label: "Open private-local.html manually.", command: "manual private-local.html open", status: "Required" },
    { id: "P21-24-IPAD-REVIEW", label: "Use GitHub app or browser for iPad private repository review.", command: "manual review", status: "Recommended" },
    { id: "P21-24-NO-SCRIPT-LAUNCHERS", label: "Do not use .bat, .ps1, .cmd, or .exe launch/update files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-24-NORTON-NO-FORCE", label: "If Norton blocks a file, do not force allow it.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-24-NO-RESTORE", label: "Do not restore quarantined files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-24-NO-PAGES", label: "Keep private repository, local first, and no GitHub Pages dependency.", command: "private local", status: "Required" }
  ];

  function normalizeSteps(steps) {
    return Array.isArray(steps) && steps.length ? steps : STEPS;
  }

  function buildManualUpdateLocalLaunchOperationPanel(sources = {}, now = () => new Date()) {
    const records = normalizeSteps(sources.steps).map((step) => ({
      ...step,
      phase: PHASE,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY }
    }));
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: STATUS,
      generatedAt: now().toISOString(),
      totalSteps: records.length,
      passed: records.length,
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY },
      launchPolicy: "manual private-local.html open",
      updatePolicy: "manual git pull from private repository",
      workingTreeCleanRequired: true,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: "Use git switch main, git pull origin main, git status, then manually open private-local.html.",
      records
    };
  }

  function renderManualUpdateLocalLaunchOperationPanel(panel, doc = document) {
    const safePanel = panel || buildManualUpdateLocalLaunchOperationPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedScriptPolicy || BLOCKED_SCRIPT_POLICY;
      set("#phase21-24-panel-status", safePanel.panelStatus);
      set("#phase21-24-status", safePanel.status);
      set("#phase21-24-total-steps", safePanel.totalSteps);
      set("#phase21-24-passed", safePanel.passed);
      set("#phase21-24-update-policy", safePanel.updatePolicy);
      set("#phase21-24-launch-policy", safePanel.launchPolicy);
      set("#phase21-24-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-24-no-bat", policy.batAllowed);
      set("#phase21-24-no-ps1", policy.ps1Allowed);
      set("#phase21-24-no-cmd", policy.cmdAllowed);
      set("#phase21-24-no-exe", policy.exeAllowed);
      set("#phase21-24-no-pages", false);
      set("#phase21-24-next-step", safePanel.nextRecommendedStep);
      set("#phase21-24-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-24-manual-update-local-launch-operation-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-24-manual-update-local-launch-operation-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-24-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-24-status");
      if (status) status.textContent = "PHASE21_24_MANUAL_OPERATION_RENDER_FALLBACK";
    }
    return safePanel;
  }

  function runManualUpdateLocalLaunchOperationPanel(options = {}) {
    return buildManualUpdateLocalLaunchOperationPanel(options.sources || {}, options.now);
  }

  function runAndRenderManualUpdateLocalLaunchOperationPanel(options = {}) {
    const panel = runManualUpdateLocalLaunchOperationPanel(options);
    return renderManualUpdateLocalLaunchOperationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-24-manual-update-local-launch-operation");
      if (button) button.addEventListener("click", () => runAndRenderManualUpdateLocalLaunchOperationPanel());
      if (document.querySelector("#phase21-24-manual-update-local-launch-operation")) runAndRenderManualUpdateLocalLaunchOperationPanel();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    PANEL_STATUS,
    STATUS,
    BLOCKED_SCRIPT_POLICY,
    STEPS,
    buildManualUpdateLocalLaunchOperationPanel,
    renderManualUpdateLocalLaunchOperationPanel,
    runManualUpdateLocalLaunchOperationPanel,
    runAndRenderManualUpdateLocalLaunchOperationPanel
  };
});
