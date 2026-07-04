(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2130PostPr223MainSyncLocalVerificationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-30";
  const CHECKLIST_NAME = "Post PR223 Main Sync Local Verification Checklist";
  const PANEL_STATUS = "phase21_30_post_pr223_main_sync_local_verification_plan_only";
  const STATUS = "PHASE21_30_POST_PR223_MAIN_SYNC_LOCAL_VERIFICATION_READY";
  const DB_URL = "phase21-30-post-pr223-main-sync-local-verification-db.json";
  const SUMMARY_URL = "phase21-30-post-pr223-main-sync-local-verification-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    readyForReviewAllowed: false,
    mergeAllowed: false,
    autoMergeAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };
  const LOCAL_VERIFICATION_CHECKS = [
    { id: "P21-30-MAIN", label: "Confirm local branch is main after PR #223 merge.", command: "git switch main", status: "Required" },
    { id: "P21-30-PULL", label: "Pull latest origin/main after PR #223 merge.", command: "git pull origin main", status: "Required" },
    { id: "P21-30-STATUS", label: "Confirm main is up to date and working tree is clean.", command: "git status", status: "Required" },
    { id: "P21-30-LOG", label: "Confirm latest main commit includes PR #223 merge commit.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-30-FILES", label: "Confirm Phase21-29 files exist on main.", command: "dir phase21-29-*", status: "Required" },
    { id: "P21-30-PRIVATE", label: "Open private-local.html manually for local visual confirmation.", command: "start .\\private-local.html", status: "Manual" },
    { id: "P21-30-NO-MAIN-PUSH", label: "Do not push main directly after pull confirmation.", command: "blocked", status: "Blocked" },
    { id: "P21-30-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-30-NO-FORCE", label: "Do not force push or reset main to solve local confusion.", command: "blocked", status: "Blocked" },
    { id: "P21-30-NO-LAUNCHERS", label: "Do not create or modify .bat, .ps1, .cmd, or .exe files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-30-NO-PAGES", label: "GitHub Pages is not required for the post-merge check.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-30-UNKNOWN",
      label: safe.label || "Manual post PR223 main sync local verification",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr223MainSyncLocalVerificationPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.mainSyncChecks,
      db.localVerificationChecks,
      db.phase2129PresenceChecks,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, LOCAL_VERIFICATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      postPrNumber: 223,
      mainSyncRequired: true,
      workingTreeCleanRequired: true,
      localVisualCheckRequired: true,
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
      postPrNumber: 223,
      expectedMergeCommit: summary.expectedMergeCommit || db.expectedMergeCommit || "584efb59396e7dc075febc5bb0e47d1605082613",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      mainSyncPolicy: summary.mainSyncPolicy || db.mainSyncPolicy || "after PR #223 merge, switch to main, pull origin main, and confirm clean status.",
      localVerificationPolicy: summary.localVerificationPolicy || db.localVerificationPolicy || "open private-local.html manually and verify local-only operation remains stable.",
      nextPhaseGatePolicy: summary.nextPhaseGatePolicy || db.nextPhaseGatePolicy || "start the next phase only after main sync, clean status, and local visual confirmation are complete.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mainSyncRequired: summary.mainSyncRequired !== false,
      workingTreeCleanRequired: summary.workingTreeCleanRequired !== false,
      localVisualCheckRequired: summary.localVisualCheckRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm git switch main, git pull origin main, git status, and private-local.html before starting the next phase.",
      records: normalizedRecords
    };
  }

  function renderPostPr223MainSyncLocalVerificationPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr223MainSyncLocalVerificationPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-30-panel-status", safePanel.panelStatus);
      set("#phase21-30-status", safePanel.status);
      set("#phase21-30-post-pr", safePanel.postPrNumber);
      set("#phase21-30-merge-commit", safePanel.expectedMergeCommit);
      set("#phase21-30-total-checks", safePanel.totalChecks);
      set("#phase21-30-passed", safePanel.passed);
      set("#phase21-30-main-sync-policy", safePanel.mainSyncPolicy);
      set("#phase21-30-local-verification-policy", safePanel.localVerificationPolicy);
      set("#phase21-30-next-phase-gate-policy", safePanel.nextPhaseGatePolicy);
      set("#phase21-30-main-sync-required", safePanel.mainSyncRequired);
      set("#phase21-30-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-30-local-visual-check", safePanel.localVisualCheckRequired);
      set("#phase21-30-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-30-no-main-commit", policy.mainDirectCommitAllowed);
      set("#phase21-30-no-force-push", policy.forcePushAllowed);
      set("#phase21-30-no-bat", policy.batAllowed);
      set("#phase21-30-no-ps1", policy.ps1Allowed);
      set("#phase21-30-no-cmd", policy.cmdAllowed);
      set("#phase21-30-no-exe", policy.exeAllowed);
      set("#phase21-30-no-pages", safePanel.githubPagesRequired);
      set("#phase21-30-next-step", safePanel.nextRecommendedStep);
      set("#phase21-30-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-30-post-pr223-main-sync-local-verification-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-30-post-pr223-main-sync-local-verification-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-30-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-30-status");
      if (status) status.textContent = "PHASE21_30_POST_PR223_RENDER_FALLBACK";
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

  async function runPostPr223MainSyncLocalVerificationPanel(options = {}) {
    if (options.sources) return buildPostPr223MainSyncLocalVerificationPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr223MainSyncLocalVerificationPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr223MainSyncLocalVerificationPanel(options = {}) {
    const panel = await runPostPr223MainSyncLocalVerificationPanel(options);
    return renderPostPr223MainSyncLocalVerificationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-30-post-pr223-main-sync-local-verification");
      if (button) button.addEventListener("click", () => runAndRenderPostPr223MainSyncLocalVerificationPanel());
      if (document.querySelector("#phase21-30-post-pr223-main-sync-local-verification")) runAndRenderPostPr223MainSyncLocalVerificationPanel();
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
    LOCAL_VERIFICATION_CHECKS,
    buildPostPr223MainSyncLocalVerificationPanel,
    renderPostPr223MainSyncLocalVerificationPanel,
    runPostPr223MainSyncLocalVerificationPanel,
    runAndRenderPostPr223MainSyncLocalVerificationPanel
  };
});
