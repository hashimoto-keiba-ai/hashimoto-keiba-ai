(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2131NextPhaseStartGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-31";
  const CHECKLIST_NAME = "Next Phase Start Gate Checklist";
  const PANEL_STATUS = "phase21_31_next_phase_start_gate_plan_only";
  const STATUS = "PHASE21_31_NEXT_PHASE_START_GATE_READY";
  const DB_URL = "phase21-31-next-phase-start-gate-db.json";
  const SUMMARY_URL = "phase21-31-next-phase-start-gate-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    mergeWithoutLocalCheckAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const START_GATE_CHECKS = [
    { id: "P21-31-PR224", label: "Confirm PR #224 is merged before starting Phase21-31.", command: "GitHub PR #224", status: "Required" },
    { id: "P21-31-MAIN", label: "Confirm local repository is on main.", command: "git switch main", status: "Required" },
    { id: "P21-31-PULL", label: "Confirm latest main is pulled from origin.", command: "git pull origin main", status: "Required" },
    { id: "P21-31-STATUS", label: "Confirm working tree is clean before creating the next branch.", command: "git status", status: "Required" },
    { id: "P21-31-LOG", label: "Confirm recent log includes Phase21-30 merge commit.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-31-BRANCH", label: "Create the next work branch from updated main only.", command: "git switch -c <feature-branch>", status: "Required" },
    { id: "P21-31-DRAFT", label: "Future PR must be created as Draft first.", command: "Draft PR", status: "Required" },
    { id: "P21-31-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-31-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-31-NO-FORCE", label: "Do not force push or reset main during start gate work.", command: "blocked", status: "Blocked" },
    { id: "P21-31-NO-LAUNCHERS", label: "Do not create or modify .bat, .ps1, .cmd, or .exe files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-31-PRIVATE", label: "Private repository and local-first operation remain required.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-31-UNKNOWN",
      label: safe.label || "Manual next phase start gate confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildNextPhaseStartGatePanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.preStartChecks,
      db.branchStartChecks,
      db.draftPrGateChecks,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, START_GATE_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      priorPrNumber: 224,
      priorPhase: "Phase21-30",
      mainSyncRequired: true,
      cleanWorkingTreeRequired: true,
      featureBranchRequired: true,
      draftPrRequired: true,
      mainDirectPushAllowed: false,
      mainDirectCommitAllowed: false,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY }
    }));
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      priorPrNumber: 224,
      priorPhase: "Phase21-30",
      expectedPriorMergeCommit: summary.expectedPriorMergeCommit || db.expectedPriorMergeCommit || "8648f1831371c1c6ea52f59fd68f19f413fae556",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      startGatePolicy: summary.startGatePolicy || db.startGatePolicy || "start the next phase only after PR #224 is merged, main is pulled, and working tree is clean.",
      branchPolicy: summary.branchPolicy || db.branchPolicy || "create feature branches only from updated main; do not work directly on main.",
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "open future PRs as Draft first and stop before Ready for review or merge.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mainSyncRequired: summary.mainSyncRequired !== false,
      cleanWorkingTreeRequired: summary.cleanWorkingTreeRequired !== false,
      featureBranchRequired: summary.featureBranchRequired !== false,
      draftPrRequired: summary.draftPrRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm main sync and clean status, then create the next feature branch from updated main.",
      records: normalizedRecords
    };
  }

  function renderNextPhaseStartGatePanel(panel, doc = document) {
    const safePanel = panel || buildNextPhaseStartGatePanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-31-panel-status", safePanel.panelStatus);
      set("#phase21-31-status", safePanel.status);
      set("#phase21-31-prior-pr", safePanel.priorPrNumber);
      set("#phase21-31-prior-phase", safePanel.priorPhase);
      set("#phase21-31-merge-commit", safePanel.expectedPriorMergeCommit);
      set("#phase21-31-total-checks", safePanel.totalChecks);
      set("#phase21-31-passed", safePanel.passed);
      set("#phase21-31-start-gate-policy", safePanel.startGatePolicy);
      set("#phase21-31-branch-policy", safePanel.branchPolicy);
      set("#phase21-31-draft-pr-policy", safePanel.draftPrPolicy);
      set("#phase21-31-main-sync-required", safePanel.mainSyncRequired);
      set("#phase21-31-clean-working-tree", safePanel.cleanWorkingTreeRequired);
      set("#phase21-31-feature-branch-required", safePanel.featureBranchRequired);
      set("#phase21-31-draft-pr-required", safePanel.draftPrRequired);
      set("#phase21-31-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-31-no-main-commit", policy.mainDirectCommitAllowed);
      set("#phase21-31-no-force-push", policy.forcePushAllowed);
      set("#phase21-31-no-bat", policy.batAllowed);
      set("#phase21-31-no-ps1", policy.ps1Allowed);
      set("#phase21-31-no-cmd", policy.cmdAllowed);
      set("#phase21-31-no-exe", policy.exeAllowed);
      set("#phase21-31-no-pages", safePanel.githubPagesRequired);
      set("#phase21-31-next-step", safePanel.nextRecommendedStep);
      set("#phase21-31-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-31-next-phase-start-gate-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-31-next-phase-start-gate-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-31-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-31-status");
      if (status) status.textContent = "PHASE21_31_NEXT_PHASE_START_GATE_RENDER_FALLBACK";
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

  async function runNextPhaseStartGatePanel(options = {}) {
    if (options.sources) return buildNextPhaseStartGatePanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildNextPhaseStartGatePanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderNextPhaseStartGatePanel(options = {}) {
    const panel = await runNextPhaseStartGatePanel(options);
    return renderNextPhaseStartGatePanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-31-next-phase-start-gate");
      if (button) button.addEventListener("click", () => runAndRenderNextPhaseStartGatePanel());
      if (document.querySelector("#phase21-31-next-phase-start-gate")) runAndRenderNextPhaseStartGatePanel();
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
    BLOCKED_ACTION_POLICY,
    START_GATE_CHECKS,
    buildNextPhaseStartGatePanel,
    renderNextPhaseStartGatePanel,
    runNextPhaseStartGatePanel,
    runAndRenderNextPhaseStartGatePanel
  };
});
