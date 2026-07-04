(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2135PostPr228MainSyncPhase2134VerificationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-35";
  const CHECKLIST_NAME = "Post PR228 Main Sync Phase21-34 Verification Checklist";
  const PANEL_STATUS = "phase21_35_post_pr228_main_sync_phase2134_verification_plan_only";
  const STATUS = "PHASE21_35_POST_PR228_MAIN_SYNC_PHASE2134_VERIFICATION_READY";
  const DB_URL = "phase21-35-post-pr228-main-sync-phase2134-verification-db.json";
  const SUMMARY_URL = "phase21-35-post-pr228-main-sync-phase2134-verification-summary-db.json";
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

  const PHASE2134_VERIFICATION_CHECKS = [
    { id: "P21-35-PR228", label: "Confirm PR #228 is merged before continuing.", command: "GitHub PR #228", status: "Required" },
    { id: "P21-35-PWD", label: "Confirm the active workspace folder before pulling main.", command: "pwd", status: "Required" },
    { id: "P21-35-MAIN", label: "Switch local repository to main.", command: "git switch main", status: "Required" },
    { id: "P21-35-PULL", label: "Pull latest origin/main after PR #228 merge.", command: "git pull origin main", status: "Required" },
    { id: "P21-35-STATUS", label: "Confirm local main is clean and up to date.", command: "git status", status: "Required" },
    { id: "P21-35-LOG", label: "Confirm recent log includes PR #228 merge commit.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-35-P21-34-FILES", label: "Confirm Phase21-34 files are present on main.", command: "dir phase21-34-*", status: "Required" },
    { id: "P21-35-DRAFT", label: "Next PR must start as Draft.", command: "Draft PR", status: "Required" },
    { id: "P21-35-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-35-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-35-NO-FORCE", label: "Do not force push or reset main during verification.", command: "blocked", status: "Blocked" },
    { id: "P21-35-NO-LAUNCHERS", label: "Do not create or modify launcher-type files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-35-PRIVATE", label: "Private repository and local-first operation remain required.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-35-UNKNOWN",
      label: safe.label || "Manual post PR228 main sync Phase21-34 verification confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr228MainSyncPhase2134VerificationPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postMergeMainSyncChecks,
      db.phase2134PresenceChecks,
      db.nextDraftGateChecks,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, PHASE2134_VERIFICATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      priorPrNumber: 228,
      priorPhase: "Phase21-34",
      mainSyncRequired: true,
      cleanWorkingTreeRequired: true,
      phase2134PresenceRequired: true,
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
      priorPrNumber: 228,
      priorPhase: "Phase21-34",
      expectedPriorMergeCommit: summary.expectedPriorMergeCommit || db.expectedPriorMergeCommit || "8375d57d61c8f5579418be78e24e69abe059ee1b",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      mainSyncPolicy: summary.mainSyncPolicy || db.mainSyncPolicy || "after PR #228 merge, sync local main and confirm clean status before continuing.",
      phasePresencePolicy: summary.phasePresencePolicy || db.phasePresencePolicy || "confirm Phase21-34 files exist on main after pull.",
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "future PRs start as Draft and wait for manual confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mainSyncRequired: summary.mainSyncRequired !== false,
      cleanWorkingTreeRequired: summary.cleanWorkingTreeRequired !== false,
      phase2134PresenceRequired: summary.phase2134PresenceRequired !== false,
      draftPrRequired: summary.draftPrRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm PR #228 merge, sync main, verify clean status and Phase21-34 files, then continue with Draft PR flow only.",
      records: normalizedRecords
    };
  }

  function renderPostPr228MainSyncPhase2134VerificationPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr228MainSyncPhase2134VerificationPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-35-panel-status", safePanel.panelStatus);
      set("#phase21-35-status", safePanel.status);
      set("#phase21-35-prior-pr", safePanel.priorPrNumber);
      set("#phase21-35-prior-phase", safePanel.priorPhase);
      set("#phase21-35-merge-commit", safePanel.expectedPriorMergeCommit);
      set("#phase21-35-total-checks", safePanel.totalChecks);
      set("#phase21-35-passed", safePanel.passed);
      set("#phase21-35-main-sync-policy", safePanel.mainSyncPolicy);
      set("#phase21-35-phase-presence-policy", safePanel.phasePresencePolicy);
      set("#phase21-35-draft-pr-policy", safePanel.draftPrPolicy);
      set("#phase21-35-main-sync-required", safePanel.mainSyncRequired);
      set("#phase21-35-clean-working-tree", safePanel.cleanWorkingTreeRequired);
      set("#phase21-35-phase2134-presence", safePanel.phase2134PresenceRequired);
      set("#phase21-35-draft-pr-required", safePanel.draftPrRequired);
      set("#phase21-35-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-35-no-main-commit", policy.mainDirectCommitAllowed);
      set("#phase21-35-no-force-push", policy.forcePushAllowed);
      set("#phase21-35-no-launcher-change", policy.launcherFileChangeAllowed);
      set("#phase21-35-no-bat", policy.batAllowed);
      set("#phase21-35-no-ps1", policy.ps1Allowed);
      set("#phase21-35-no-cmd", policy.cmdAllowed);
      set("#phase21-35-no-exe", policy.exeAllowed);
      set("#phase21-35-no-pages", safePanel.githubPagesRequired);
      set("#phase21-35-next-step", safePanel.nextRecommendedStep);
      set("#phase21-35-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-35-post-pr228-main-sync-phase2134-verification-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-35-post-pr228-main-sync-phase2134-verification-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-35-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-35-status");
      if (status) status.textContent = "PHASE21_35_POST_PR228_RENDER_FALLBACK";
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

  async function runPostPr228MainSyncPhase2134VerificationPanel(options = {}) {
    if (options.sources) return buildPostPr228MainSyncPhase2134VerificationPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr228MainSyncPhase2134VerificationPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr228MainSyncPhase2134VerificationPanel(options = {}) {
    const panel = await runPostPr228MainSyncPhase2134VerificationPanel(options);
    return renderPostPr228MainSyncPhase2134VerificationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-35-post-pr228-main-sync-phase2134-verification");
      if (button) button.addEventListener("click", () => runAndRenderPostPr228MainSyncPhase2134VerificationPanel());
      if (document.querySelector("#phase21-35-post-pr228-main-sync-phase2134-verification")) runAndRenderPostPr228MainSyncPhase2134VerificationPanel();
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
    PHASE2134_VERIFICATION_CHECKS,
    buildPostPr228MainSyncPhase2134VerificationPanel,
    renderPostPr228MainSyncPhase2134VerificationPanel,
    runPostPr228MainSyncPhase2134VerificationPanel,
    runAndRenderPostPr228MainSyncPhase2134VerificationPanel
  };
});
