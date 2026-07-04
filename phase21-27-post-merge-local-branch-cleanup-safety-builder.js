(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2127PostMergeLocalBranchCleanupSafetyBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-27";
  const CHECKLIST_NAME = "Post Merge Local Branch Cleanup Safety Checklist";
  const PANEL_STATUS = "phase21_27_post_merge_local_branch_cleanup_safety_plan_only";
  const STATUS = "PHASE21_27_POST_MERGE_LOCAL_BRANCH_CLEANUP_SAFETY_READY";
  const DB_URL = "phase21-27-post-merge-local-branch-cleanup-safety-db.json";
  const SUMMARY_URL = "phase21-27-post-merge-local-branch-cleanup-safety-summary-db.json";
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
  const CLEANUP_CHECKS = [
    { id: "P21-27-SWITCH-MAIN", label: "After merge, switch to main first.", command: "git switch main", status: "Required" },
    { id: "P21-27-PULL-MAIN", label: "Update main from the private repository.", command: "git pull origin main", status: "Required" },
    { id: "P21-27-STATUS", label: "Confirm working tree clean.", command: "git status", status: "Required" },
    { id: "P21-27-LOG", label: "Confirm latest merge commit.", command: "git log --oneline -5", status: "Required" },
    { id: "P21-27-BRANCH", label: "Confirm current and remaining branches.", command: "git branch", status: "Required" },
    { id: "P21-27-OLD-BRANCH-OK", label: "Old feature branches may remain without immediate risk.", command: "manual review", status: "Informational" },
    { id: "P21-27-DELETE-MAIN-CURRENT", label: "Before deletion, confirm current branch is main.", command: "git branch", status: "Required" },
    { id: "P21-27-DELETE-MERGED", label: "Delete only confirmed merged branches.", command: "manual merged check", status: "Required" },
    { id: "P21-27-NO-DELETE-UNKNOWN", label: "Do not delete unconfirmed branches.", command: "blocked", status: "Blocked" },
    { id: "P21-27-NO-DELETE-MAIN", label: "Do not delete main.", command: "blocked", status: "Blocked" },
    { id: "P21-27-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-27-NO-LAUNCHERS", label: "Do not use .bat, .ps1, .cmd, or .exe files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-27-PRIVATE-LOCAL", label: "Keep private repository, local first, and no GitHub Pages dependency.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-27-UNKNOWN",
      label: safe.label || "Manual post-merge branch cleanup safety confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostMergeLocalBranchCleanupSafetyPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postMergeChecks,
      db.remainingBranchPolicy,
      db.deleteBeforeChecks,
      db.neverDelete,
      db.mainAheadResponse,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, CLEANUP_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      autoDeleteAllowed: false,
      bulkDeleteAllowed: false,
      mainDeleteAllowed: false,
      mainDirectPushAllowed: false,
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
      cleanupPolicy: summary.cleanupPolicy || db.cleanupPolicy || "update main, confirm clean status, review log, and inspect branches before cleanup.",
      branchDeletePolicy: summary.branchDeletePolicy || db.branchDeletePolicy || "old feature branches may remain; delete only confirmed merged branches while on main.",
      mainProtectionPolicy: summary.mainProtectionPolicy || "do not delete main and do not push main directly.",
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY, ...(db.blockedScriptPolicy || {}), ...(summary.blockedScriptPolicy || {}) },
      workingTreeCleanRequired: summary.workingTreeCleanRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "After merge, update main and inspect status, log, and branches before local cleanup.",
      records: normalizedRecords
    };
  }

  function renderPostMergeLocalBranchCleanupSafetyPanel(panel, doc = document) {
    const safePanel = panel || buildPostMergeLocalBranchCleanupSafetyPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedScriptPolicy || BLOCKED_SCRIPT_POLICY;
      set("#phase21-27-panel-status", safePanel.panelStatus);
      set("#phase21-27-status", safePanel.status);
      set("#phase21-27-total-checks", safePanel.totalChecks);
      set("#phase21-27-passed", safePanel.passed);
      set("#phase21-27-cleanup-policy", safePanel.cleanupPolicy);
      set("#phase21-27-branch-delete-policy", safePanel.branchDeletePolicy);
      set("#phase21-27-main-protection-policy", safePanel.mainProtectionPolicy);
      set("#phase21-27-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-27-auto-delete", false);
      set("#phase21-27-delete-main", false);
      set("#phase21-27-main-push", false);
      set("#phase21-27-no-bat", policy.batAllowed);
      set("#phase21-27-no-ps1", policy.ps1Allowed);
      set("#phase21-27-no-cmd", policy.cmdAllowed);
      set("#phase21-27-no-exe", policy.exeAllowed);
      set("#phase21-27-no-pages", safePanel.githubPagesRequired);
      set("#phase21-27-next-step", safePanel.nextRecommendedStep);
      set("#phase21-27-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-27-post-merge-local-branch-cleanup-safety-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-27-post-merge-local-branch-cleanup-safety-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-27-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-27-status");
      if (status) status.textContent = "PHASE21_27_BRANCH_CLEANUP_RENDER_FALLBACK";
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

  async function runPostMergeLocalBranchCleanupSafetyPanel(options = {}) {
    if (options.sources) return buildPostMergeLocalBranchCleanupSafetyPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostMergeLocalBranchCleanupSafetyPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostMergeLocalBranchCleanupSafetyPanel(options = {}) {
    const panel = await runPostMergeLocalBranchCleanupSafetyPanel(options);
    return renderPostMergeLocalBranchCleanupSafetyPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-27-post-merge-local-branch-cleanup-safety");
      if (button) button.addEventListener("click", () => runAndRenderPostMergeLocalBranchCleanupSafetyPanel());
      if (document.querySelector("#phase21-27-post-merge-local-branch-cleanup-safety")) runAndRenderPostMergeLocalBranchCleanupSafetyPanel();
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
    CLEANUP_CHECKS,
    buildPostMergeLocalBranchCleanupSafetyPanel,
    renderPostMergeLocalBranchCleanupSafetyPanel,
    runPostMergeLocalBranchCleanupSafetyPanel,
    runAndRenderPostMergeLocalBranchCleanupSafetyPanel
  };
});
