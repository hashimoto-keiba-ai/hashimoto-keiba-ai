(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2134PostPr227MainSyncPhase2133VerificationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-34";
  const CHECKLIST_NAME = "Post PR227 Main Sync Phase21-33 Verification Checklist";
  const PANEL_STATUS = "phase21_34_post_pr227_main_sync_phase2133_verification_plan_only";
  const STATUS = "PHASE21_34_POST_PR227_MAIN_SYNC_PHASE2133_VERIFICATION_READY";
  const DB_URL = "phase21-34-post-pr227-main-sync-phase2133-verification-db.json";
  const SUMMARY_URL = "phase21-34-post-pr227-main-sync-phase2133-verification-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    launcherFileChangeAllowed: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const PHASE2133_VERIFICATION_CHECKS = [
    { id: "P21-34-PR227", label: "Confirm PR #227 is merged before continuing.", command: "GitHub PR #227", status: "Required" },
    { id: "P21-34-PWD", label: "Confirm the active workspace folder before pulling main.", command: "pwd", status: "Required" },
    { id: "P21-34-MAIN", label: "Switch local repository to main.", command: "git switch main", status: "Required" },
    { id: "P21-34-PULL", label: "Pull latest origin/main after PR #227 merge.", command: "git pull origin main", status: "Required" },
    { id: "P21-34-STATUS", label: "Confirm local main is clean and up to date.", command: "git status", status: "Required" },
    { id: "P21-34-LOG", label: "Confirm recent log includes PR #227 merge commit.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-34-P21-33-FILES", label: "Confirm Phase21-33 files are present on main.", command: "dir phase21-33-*", status: "Required" },
    { id: "P21-34-DRAFT", label: "Next PR must start as Draft.", command: "Draft PR", status: "Required" },
    { id: "P21-34-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-34-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-34-NO-FORCE", label: "Do not force push or reset main during verification.", command: "blocked", status: "Blocked" },
    { id: "P21-34-NO-LAUNCHERS", label: "Do not create or modify launcher-type files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-34-PRIVATE", label: "Private repository and local-first operation remain required.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-34-UNKNOWN",
      label: safe.label || "Manual post PR227 main sync Phase21-33 verification confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr227MainSyncPhase2133VerificationPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postMergeMainSyncChecks,
      db.phase2133PresenceChecks,
      db.nextDraftGateChecks,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, PHASE2133_VERIFICATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      priorPrNumber: 227,
      priorPhase: "Phase21-33",
      mainSyncRequired: true,
      cleanWorkingTreeRequired: true,
      phase2133PresenceRequired: true,
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
      priorPrNumber: 227,
      priorPhase: "Phase21-33",
      expectedPriorMergeCommit: summary.expectedPriorMergeCommit || db.expectedPriorMergeCommit || "85bce137235bfb17f0e4aedfbe742cc6662a441a",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      mainSyncPolicy: summary.mainSyncPolicy || db.mainSyncPolicy || "after PR #227 merge, sync local main and confirm clean status before continuing.",
      phasePresencePolicy: summary.phasePresencePolicy || db.phasePresencePolicy || "confirm Phase21-33 files exist on main after pull.",
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "future PRs start as Draft and wait for manual confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mainSyncRequired: summary.mainSyncRequired !== false,
      cleanWorkingTreeRequired: summary.cleanWorkingTreeRequired !== false,
      phase2133PresenceRequired: summary.phase2133PresenceRequired !== false,
      draftPrRequired: summary.draftPrRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm PR #227 merge, sync main, verify clean status and Phase21-33 files, then continue with Draft PR flow only.",
      records: normalizedRecords
    };
  }

  function renderPostPr227MainSyncPhase2133VerificationPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr227MainSyncPhase2133VerificationPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-34-panel-status", safePanel.panelStatus);
      set("#phase21-34-status", safePanel.status);
      set("#phase21-34-prior-pr", safePanel.priorPrNumber);
      set("#phase21-34-prior-phase", safePanel.priorPhase);
      set("#phase21-34-merge-commit", safePanel.expectedPriorMergeCommit);
      set("#phase21-34-total-checks", safePanel.totalChecks);
      set("#phase21-34-passed", safePanel.passed);
      set("#phase21-34-main-sync-policy", safePanel.mainSyncPolicy);
      set("#phase21-34-phase-presence-policy", safePanel.phasePresencePolicy);
      set("#phase21-34-draft-pr-policy", safePanel.draftPrPolicy);
      set("#phase21-34-main-sync-required", safePanel.mainSyncRequired);
      set("#phase21-34-clean-working-tree", safePanel.cleanWorkingTreeRequired);
      set("#phase21-34-phase2133-presence", safePanel.phase2133PresenceRequired);
      set("#phase21-34-draft-pr-required", safePanel.draftPrRequired);
      set("#phase21-34-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-34-no-main-commit", policy.mainDirectCommitAllowed);
      set("#phase21-34-no-force-push", policy.forcePushAllowed);
      set("#phase21-34-no-launcher-change", policy.launcherFileChangeAllowed);
      set("#phase21-34-no-bat", policy.batAllowed);
      set("#phase21-34-no-ps1", policy.ps1Allowed);
      set("#phase21-34-no-cmd", policy.cmdAllowed);
      set("#phase21-34-no-exe", policy.exeAllowed);
      set("#phase21-34-no-pages", safePanel.githubPagesRequired);
      set("#phase21-34-next-step", safePanel.nextRecommendedStep);
      set("#phase21-34-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-34-post-pr227-main-sync-phase2133-verification-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-34-post-pr227-main-sync-phase2133-verification-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-34-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-34-status");
      if (status) status.textContent = "PHASE21_34_POST_PR227_RENDER_FALLBACK";
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

  async function runPostPr227MainSyncPhase2133VerificationPanel(options = {}) {
    if (options.sources) return buildPostPr227MainSyncPhase2133VerificationPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr227MainSyncPhase2133VerificationPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr227MainSyncPhase2133VerificationPanel(options = {}) {
    const panel = await runPostPr227MainSyncPhase2133VerificationPanel(options);
    return renderPostPr227MainSyncPhase2133VerificationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-34-post-pr227-main-sync-phase2133-verification");
      if (button) button.addEventListener("click", () => runAndRenderPostPr227MainSyncPhase2133VerificationPanel());
      if (document.querySelector("#phase21-34-post-pr227-main-sync-phase2133-verification")) runAndRenderPostPr227MainSyncPhase2133VerificationPanel();
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
    PHASE2133_VERIFICATION_CHECKS,
    buildPostPr227MainSyncPhase2133VerificationPanel,
    renderPostPr227MainSyncPhase2133VerificationPanel,
    runPostPr227MainSyncPhase2133VerificationPanel,
    runAndRenderPostPr227MainSyncPhase2133VerificationPanel
  };
});
