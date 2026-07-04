(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2128WorkspaceFolderSelectionSafetyBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-28";
  const CHECKLIST_NAME = "Workspace Folder Selection Safety Checklist";
  const PANEL_STATUS = "phase21_28_workspace_folder_selection_safety_plan_only";
  const STATUS = "PHASE21_28_WORKSPACE_FOLDER_SELECTION_SAFETY_READY";
  const DB_URL = "phase21-28-workspace-folder-selection-safety-db.json";
  const SUMMARY_URL = "phase21-28-workspace-folder-selection-safety-summary-db.json";
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
  const WORKSPACE_CHECKS = [
    { id: "P21-28-PWD", label: "Confirm current workspace folder before push.", command: "pwd", status: "Required" },
    { id: "P21-28-BRANCH", label: "Confirm current branch exists in this folder.", command: "git branch", status: "Required" },
    { id: "P21-28-STATUS", label: "Confirm working tree clean.", command: "git status", status: "Required" },
    { id: "P21-28-LOG", label: "Confirm latest commit SHA.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-28-NO-BRANCH-NO-PUSH", label: "Do not push where the branch does not exist.", command: "blocked", status: "Blocked" },
    { id: "P21-28-REFSPEC", label: "For src refspec errors, check folder and branch first.", command: "git branch", status: "Required" },
    { id: "P21-28-LATEST-FOLDER", label: "Use the latest Codex work/hashimoto-keiba-ai folder containing the commit.", command: "manual folder check", status: "Required" },
    { id: "P21-28-NO-OLD-FOLDER-PUSH", label: "Do not push blindly from an old Codex folder.", command: "blocked", status: "Blocked" },
    { id: "P21-28-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-28-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-28-NO-LAUNCHERS", label: "Do not use .bat, .ps1, .cmd, or .exe files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-28-PRIVATE-LOCAL", label: "Keep private repository, local first, and no GitHub Pages dependency.", command: "private local", status: "PrivateLocalPolicy" }
  ];

  function listOrDefault(value, fallback) {
    return Array.isArray(value) && value.length ? value : fallback;
  }

  function flattenRecords(groups) {
    return groups.reduce((records, group) => records.concat(listOrDefault(group, [])), []);
  }

  function normalizeRecord(record) {
    const safe = record || {};
    return {
      id: safe.id || "P21-28-UNKNOWN",
      label: safe.label || "Manual workspace folder safety confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildWorkspaceFolderSelectionSafetyPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.workspaceFolderChecks,
      db.multipleFolderDecisionRules,
      db.pushBeforeChecks,
      db.srcRefspecResponse,
      db.correctCommitChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, WORKSPACE_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      currentFolderRequired: true,
      branchExistenceRequired: true,
      correctCommitRequired: true,
      mainDirectPushAllowed: false,
      mainDirectCommitAllowed: false,
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
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      workspacePolicy: summary.workspacePolicy || db.workspacePolicy || "confirm folder, branch, status, and latest commit before push.",
      refspecPolicy: summary.refspecPolicy || db.refspecPolicy || "src refspec errors require folder and branch verification before retrying push.",
      mainPushPolicy: summary.mainPushPolicy || db.mainPushPolicy || "main direct push is prohibited.",
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY, ...(db.blockedScriptPolicy || {}), ...(summary.blockedScriptPolicy || {}) },
      workingTreeCleanRequired: summary.workingTreeCleanRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm pwd, git branch, git status, and git log --oneline -3 before push or PR work.",
      records: normalizedRecords
    };
  }

  function renderWorkspaceFolderSelectionSafetyPanel(panel, doc = document) {
    const safePanel = panel || buildWorkspaceFolderSelectionSafetyPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedScriptPolicy || BLOCKED_SCRIPT_POLICY;
      set("#phase21-28-panel-status", safePanel.panelStatus);
      set("#phase21-28-status", safePanel.status);
      set("#phase21-28-total-checks", safePanel.totalChecks);
      set("#phase21-28-passed", safePanel.passed);
      set("#phase21-28-workspace-policy", safePanel.workspacePolicy);
      set("#phase21-28-refspec-policy", safePanel.refspecPolicy);
      set("#phase21-28-main-push-policy", safePanel.mainPushPolicy);
      set("#phase21-28-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-28-current-folder-required", true);
      set("#phase21-28-branch-exists-required", true);
      set("#phase21-28-correct-commit-required", true);
      set("#phase21-28-no-main-push", false);
      set("#phase21-28-no-main-commit", false);
      set("#phase21-28-no-bat", policy.batAllowed);
      set("#phase21-28-no-ps1", policy.ps1Allowed);
      set("#phase21-28-no-cmd", policy.cmdAllowed);
      set("#phase21-28-no-exe", policy.exeAllowed);
      set("#phase21-28-no-pages", safePanel.githubPagesRequired);
      set("#phase21-28-next-step", safePanel.nextRecommendedStep);
      set("#phase21-28-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-28-workspace-folder-selection-safety-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-28-workspace-folder-selection-safety-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-28-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-28-status");
      if (status) status.textContent = "PHASE21_28_WORKSPACE_FOLDER_RENDER_FALLBACK";
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

  async function runWorkspaceFolderSelectionSafetyPanel(options = {}) {
    if (options.sources) return buildWorkspaceFolderSelectionSafetyPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildWorkspaceFolderSelectionSafetyPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderWorkspaceFolderSelectionSafetyPanel(options = {}) {
    const panel = await runWorkspaceFolderSelectionSafetyPanel(options);
    return renderWorkspaceFolderSelectionSafetyPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-28-workspace-folder-selection-safety");
      if (button) button.addEventListener("click", () => runAndRenderWorkspaceFolderSelectionSafetyPanel());
      if (document.querySelector("#phase21-28-workspace-folder-selection-safety")) runAndRenderWorkspaceFolderSelectionSafetyPanel();
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
    WORKSPACE_CHECKS,
    buildWorkspaceFolderSelectionSafetyPanel,
    renderWorkspaceFolderSelectionSafetyPanel,
    runWorkspaceFolderSelectionSafetyPanel,
    runAndRenderWorkspaceFolderSelectionSafetyPanel
  };
});
