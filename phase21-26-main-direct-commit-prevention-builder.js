(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2126MainDirectCommitPreventionBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-26";
  const CHECKLIST_NAME = "Main Direct Commit Prevention Checklist";
  const PANEL_STATUS = "phase21_26_main_direct_commit_prevention_plan_only";
  const STATUS = "PHASE21_26_MAIN_DIRECT_COMMIT_PREVENTION_READY";
  const DB_URL = "phase21-26-main-direct-commit-prevention-db.json";
  const SUMMARY_URL = "phase21-26-main-direct-commit-prevention-summary-db.json";
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
  const BRANCH_CHECKS = [
    { id: "P21-26-START-SWITCH-MAIN", label: "Switch to stable main before work.", command: "git switch main", status: "Required" },
    { id: "P21-26-START-PULL-MAIN", label: "Pull latest main from private repository.", command: "git pull origin main", status: "Required" },
    { id: "P21-26-START-STATUS", label: "Confirm working tree clean.", command: "git status", status: "Required" },
    { id: "P21-26-START-BRANCH", label: "Create feature branch before implementation.", command: "git switch -c codex/phaseXX-description", status: "Required" },
    { id: "P21-26-NO-MAIN-COMMIT", label: "Do not commit directly on main.", command: "blocked", status: "MainBlocked" },
    { id: "P21-26-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "MainBlocked" },
    { id: "P21-26-PUSH-FEATURE-ONLY", label: "Push only codex/phaseXX-* feature branches.", command: "git push origin codex/phaseXX-description", status: "Required" },
    { id: "P21-26-PR-FLOW", label: "Bring changes into main through PR merge.", command: "PR flow", status: "Required" },
    { id: "P21-26-MAIN-AHEAD", label: "If main is ahead, stop and create a feature branch before push.", command: "git switch -c codex/phaseXX-description", status: "MainAheadPolicy" },
    { id: "P21-26-NO-LAUNCHERS", label: "Do not use .bat, .ps1, .cmd, or .exe launch/update files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-26-PRIVATE-LOCAL", label: "Keep private repository, local first, and no GitHub Pages dependency.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-26-UNKNOWN",
      label: safe.label || "Manual branch policy confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildMainDirectCommitPreventionPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.workStartChecks,
      db.commitBeforeChecks,
      db.pushBeforeChecks,
      db.prBeforeChecks,
      db.mainDirectCommitResponse,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, BRANCH_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      mainDirectCommitAllowed: false,
      mainDirectPushAllowed: false,
      featureBranchRequired: true,
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
      branchPolicy: summary.branchPolicy || db.branchPolicy || "Create codex/phaseXX-* feature branches before implementation; never commit directly on main.",
      mainPushPolicy: summary.mainPushPolicy || db.mainPushPolicy || "main direct push is prohibited; push only codex/phaseXX-* branches.",
      prPolicy: summary.prPolicy || db.prPolicy || "main receives implementation through PR merge only.",
      mainAheadPolicy: summary.mainAheadPolicy || "if main is ahead, do not push main; create a feature branch first.",
      blockedScriptPolicy: { ...BLOCKED_SCRIPT_POLICY, ...(db.blockedScriptPolicy || {}), ...(summary.blockedScriptPolicy || {}) },
      workingTreeCleanRequired: summary.workingTreeCleanRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Start on main, pull origin main, confirm git status, create codex/phaseXX-* feature branch, then commit only on that branch.",
      records: normalizedRecords
    };
  }

  function renderMainDirectCommitPreventionPanel(panel, doc = document) {
    const safePanel = panel || buildMainDirectCommitPreventionPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedScriptPolicy || BLOCKED_SCRIPT_POLICY;
      set("#phase21-26-panel-status", safePanel.panelStatus);
      set("#phase21-26-status", safePanel.status);
      set("#phase21-26-total-checks", safePanel.totalChecks);
      set("#phase21-26-passed", safePanel.passed);
      set("#phase21-26-branch-policy", safePanel.branchPolicy);
      set("#phase21-26-main-push-policy", safePanel.mainPushPolicy);
      set("#phase21-26-pr-policy", safePanel.prPolicy);
      set("#phase21-26-main-ahead-policy", safePanel.mainAheadPolicy);
      set("#phase21-26-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-26-no-main-commit", false);
      set("#phase21-26-no-main-push", false);
      set("#phase21-26-no-bat", policy.batAllowed);
      set("#phase21-26-no-ps1", policy.ps1Allowed);
      set("#phase21-26-no-cmd", policy.cmdAllowed);
      set("#phase21-26-no-exe", policy.exeAllowed);
      set("#phase21-26-no-pages", safePanel.githubPagesRequired);
      set("#phase21-26-next-step", safePanel.nextRecommendedStep);
      set("#phase21-26-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-26-main-direct-commit-prevention-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-26-main-direct-commit-prevention-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-26-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-26-status");
      if (status) status.textContent = "PHASE21_26_MAIN_DIRECT_COMMIT_RENDER_FALLBACK";
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

  async function runMainDirectCommitPreventionPanel(options = {}) {
    if (options.sources) return buildMainDirectCommitPreventionPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildMainDirectCommitPreventionPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderMainDirectCommitPreventionPanel(options = {}) {
    const panel = await runMainDirectCommitPreventionPanel(options);
    return renderMainDirectCommitPreventionPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-26-main-direct-commit-prevention");
      if (button) button.addEventListener("click", () => runAndRenderMainDirectCommitPreventionPanel());
      if (document.querySelector("#phase21-26-main-direct-commit-prevention")) runAndRenderMainDirectCommitPreventionPanel();
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
    BRANCH_CHECKS,
    buildMainDirectCommitPreventionPanel,
    renderMainDirectCommitPreventionPanel,
    runMainDirectCommitPreventionPanel,
    runAndRenderMainDirectCommitPreventionPanel
  };
});
