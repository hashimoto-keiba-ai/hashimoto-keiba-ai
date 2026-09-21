(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2136PostPr229MainSyncPhase2135VerificationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-36";
  const CHECKLIST_NAME = "Post PR229 Main Sync Phase21-35 Verification Checklist";
  const STATUS = "PHASE21_36_POST_PR229_MAIN_SYNC_PHASE2135_VERIFICATION_READY";
  const DB_URL = "phase21-36-post-pr229-main-sync-phase2135-verification-db.json";
  const SUMMARY_URL = "phase21-36-post-pr229-main-sync-phase2135-verification-summary-db.json";
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

  const DEFAULT_CHECKS = [
    { id: "P21-36-PR229", command: "GitHub PR #229", label: "Confirm PR #229 is merged.", status: "Required" },
    { id: "P21-36-PWD", command: "pwd", label: "Confirm workspace folder.", status: "Required" },
    { id: "P21-36-MAIN", command: "git switch main", label: "Use main for sync.", status: "Required" },
    { id: "P21-36-PULL", command: "git pull origin main", label: "Pull latest main.", status: "Required" },
    { id: "P21-36-STATUS", command: "git status", label: "Confirm clean status.", status: "Required" },
    { id: "P21-36-LOG", command: "git log --oneline -3", label: "Confirm recent merge log.", status: "Required" },
    { id: "P21-36-P21-35", command: "dir phase21-35-*", label: "Confirm Phase21-35 files.", status: "Required" },
    { id: "P21-36-DRAFT", command: "Draft PR", label: "Start next PR as Draft.", status: "Required" }
  ];

  function arrayOrDefault(value, fallback) {
    return Array.isArray(value) && value.length ? value : fallback;
  }

  function buildPostPr229MainSyncPhase2135VerificationPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = arrayOrDefault(
      [].concat(db.postMergeMainSyncChecks || [], db.phase2135PresenceChecks || [], db.nextDraftGateChecks || []),
      DEFAULT_CHECKS
    );
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      priorPrNumber: 229,
      priorPhase: "Phase21-35",
      expectedPriorMergeCommit: summary.expectedPriorMergeCommit || db.expectedPriorMergeCommit || "c4fdd4318043ae91b9d74a239da1a5ec023a6b73",
      totalChecks: Number(summary.totalChecks || records.length),
      passed: Number(summary.passed || records.length),
      mainSyncPolicy: summary.mainSyncPolicy || db.mainSyncPolicy || "Sync main after PR #229.",
      phasePresencePolicy: summary.phasePresencePolicy || db.phasePresencePolicy || "Check Phase21-35 files on main.",
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "Use Draft PR first.",
      mainSyncRequired: true,
      cleanWorkingTreeRequired: true,
      phase2135PresenceRequired: true,
      draftPrRequired: true,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Sync main, verify clean status and Phase21-35 files, then continue with Draft PR flow.",
      records
    };
  }

  function renderPostPr229MainSyncPhase2135VerificationPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr229MainSyncPhase2135VerificationPanel();
    const list = doc.querySelector && doc.querySelector("#phase21-36-post-pr229-main-sync-phase2135-verification-list");
    if (list) {
      list.textContent = "";
      safePanel.records.forEach((record) => {
        const row = doc.createElement("li");
        row.textContent = `${record.id} ${record.label} / ${record.command} / ${record.status}`;
        list.appendChild(row);
      });
    }
    return safePanel;
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    STATUS,
    DB_URL,
    SUMMARY_URL,
    BLOCKED_ACTION_POLICY,
    DEFAULT_CHECKS,
    buildPostPr229MainSyncPhase2135VerificationPanel,
    renderPostPr229MainSyncPhase2135VerificationPanel
  };
});
