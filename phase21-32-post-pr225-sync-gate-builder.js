(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2132PostPr225SyncGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-32";
  const CHECKLIST_NAME = "Post PR225 Sync Gate Checklist";
  const PANEL_STATUS = "phase21_32_post_pr225_sync_gate_plan_only";
  const STATUS = "PHASE21_32_POST_PR225_SYNC_GATE_READY";
  const DB_URL = "phase21-32-post-pr225-sync-gate-db.json";
  const SUMMARY_URL = "phase21-32-post-pr225-sync-gate-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    mergeWithoutReviewAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const SYNC_GATE_CHECKS = [
    { id: "P21-32-PR225", label: "Confirm PR #225 is merged before continuing.", command: "GitHub PR #225", status: "Required" },
    { id: "P21-32-PWD", label: "Confirm current workspace folder before sync work.", command: "pwd", status: "Required" },
    { id: "P21-32-MAIN", label: "Switch to main before pulling latest changes.", command: "git switch main", status: "Required" },
    { id: "P21-32-PULL", label: "Pull latest origin/main after PR #225 merge.", command: "git pull origin main", status: "Required" },
    { id: "P21-32-STATUS", label: "Confirm working tree is clean after pull.", command: "git status", status: "Required" },
    { id: "P21-32-LOG", label: "Confirm recent log includes PR #225 merge commit.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-32-P21-31-FILES", label: "Confirm Phase21-31 files are present on main.", command: "dir phase21-31-*", status: "Required" },
    { id: "P21-32-DRAFT", label: "Next PR remains Draft first.", command: "Draft PR", status: "Required" },
    { id: "P21-32-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-32-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-32-NO-FORCE", label: "Do not force push or reset main during sync work.", command: "blocked", status: "Blocked" },
    { id: "P21-32-NO-LAUNCHERS", label: "Do not create or modify .bat, .ps1, .cmd, or .exe files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-32-PRIVATE", label: "Private repository and local-first operation remain required.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-32-UNKNOWN",
      label: safe.label || "Manual post PR225 sync gate confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr225SyncGatePanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postMergeSyncChecks,
      db.phase2131PresenceChecks,
      db.nextDraftGateChecks,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, SYNC_GATE_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      priorPrNumber: 225,
      priorPhase: "Phase21-31",
      mainSyncRequired: true,
      cleanWorkingTreeRequired: true,
      phase2131PresenceRequired: true,
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
      priorPrNumber: 225,
      priorPhase: "Phase21-31",
      expectedPriorMergeCommit: summary.expectedPriorMergeCommit || db.expectedPriorMergeCommit || "4322b4fc024f2338e9091b18fcdd117b29c2c1b9",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      syncGatePolicy: summary.syncGatePolicy || db.syncGatePolicy || "after PR #225 merge, sync local main and confirm clean status before continuing.",
      phasePresencePolicy: summary.phasePresencePolicy || db.phasePresencePolicy || "confirm Phase21-31 files exist on main after pull.",
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "future PRs start as Draft and stop before review/merge until confirmed.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mainSyncRequired: summary.mainSyncRequired !== false,
      cleanWorkingTreeRequired: summary.cleanWorkingTreeRequired !== false,
      phase2131PresenceRequired: summary.phase2131PresenceRequired !== false,
      draftPrRequired: summary.draftPrRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm PR #225 merge, sync main, verify clean status, then proceed with Draft PR flow only.",
      records: normalizedRecords
    };
  }

  function renderPostPr225SyncGatePanel(panel, doc = document) {
    const safePanel = panel || buildPostPr225SyncGatePanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-32-panel-status", safePanel.panelStatus);
      set("#phase21-32-status", safePanel.status);
      set("#phase21-32-prior-pr", safePanel.priorPrNumber);
      set("#phase21-32-prior-phase", safePanel.priorPhase);
      set("#phase21-32-merge-commit", safePanel.expectedPriorMergeCommit);
      set("#phase21-32-total-checks", safePanel.totalChecks);
      set("#phase21-32-passed", safePanel.passed);
      set("#phase21-32-sync-gate-policy", safePanel.syncGatePolicy);
      set("#phase21-32-phase-presence-policy", safePanel.phasePresencePolicy);
      set("#phase21-32-draft-pr-policy", safePanel.draftPrPolicy);
      set("#phase21-32-main-sync-required", safePanel.mainSyncRequired);
      set("#phase21-32-clean-working-tree", safePanel.cleanWorkingTreeRequired);
      set("#phase21-32-phase2131-presence", safePanel.phase2131PresenceRequired);
      set("#phase21-32-draft-pr-required", safePanel.draftPrRequired);
      set("#phase21-32-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-32-no-main-commit", policy.mainDirectCommitAllowed);
      set("#phase21-32-no-force-push", policy.forcePushAllowed);
      set("#phase21-32-no-bat", policy.batAllowed);
      set("#phase21-32-no-ps1", policy.ps1Allowed);
      set("#phase21-32-no-cmd", policy.cmdAllowed);
      set("#phase21-32-no-exe", policy.exeAllowed);
      set("#phase21-32-no-pages", safePanel.githubPagesRequired);
      set("#phase21-32-next-step", safePanel.nextRecommendedStep);
      set("#phase21-32-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-32-post-pr225-sync-gate-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-32-post-pr225-sync-gate-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-32-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-32-status");
      if (status) status.textContent = "PHASE21_32_POST_PR225_SYNC_GATE_RENDER_FALLBACK";
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

  async function runPostPr225SyncGatePanel(options = {}) {
    if (options.sources) return buildPostPr225SyncGatePanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr225SyncGatePanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr225SyncGatePanel(options = {}) {
    const panel = await runPostPr225SyncGatePanel(options);
    return renderPostPr225SyncGatePanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-32-post-pr225-sync-gate");
      if (button) button.addEventListener("click", () => runAndRenderPostPr225SyncGatePanel());
      if (document.querySelector("#phase21-32-post-pr225-sync-gate")) runAndRenderPostPr225SyncGatePanel();
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
    SYNC_GATE_CHECKS,
    buildPostPr225SyncGatePanel,
    renderPostPr225SyncGatePanel,
    runPostPr225SyncGatePanel,
    runAndRenderPostPr225SyncGatePanel
  };
});
