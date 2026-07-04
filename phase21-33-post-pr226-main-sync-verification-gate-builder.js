(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2133PostPr226MainSyncVerificationGateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-33";
  const CHECKLIST_NAME = "Post PR226 Main Sync Verification Gate Checklist";
  const PANEL_STATUS = "phase21_33_post_pr226_main_sync_verification_gate_plan_only";
  const STATUS = "PHASE21_33_POST_PR226_MAIN_SYNC_VERIFICATION_GATE_READY";
  const DB_URL = "phase21-33-post-pr226-main-sync-verification-gate-db.json";
  const SUMMARY_URL = "phase21-33-post-pr226-main-sync-verification-gate-summary-db.json";
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

  const VERIFICATION_GATE_CHECKS = [
    { id: "P21-33-PR226", label: "Confirm PR #226 is merged before continuing.", command: "GitHub PR #226", status: "Required" },
    { id: "P21-33-PWD", label: "Confirm the active workspace folder before pulling main.", command: "pwd", status: "Required" },
    { id: "P21-33-MAIN", label: "Switch local repository to main.", command: "git switch main", status: "Required" },
    { id: "P21-33-PULL", label: "Pull latest origin/main after PR #226 merge.", command: "git pull origin main", status: "Required" },
    { id: "P21-33-STATUS", label: "Confirm local main is clean and up to date.", command: "git status", status: "Required" },
    { id: "P21-33-LOG", label: "Confirm recent log includes PR #226 merge commit.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-33-P21-32-FILES", label: "Confirm Phase21-32 files are present on main.", command: "dir phase21-32-*", status: "Required" },
    { id: "P21-33-DRAFT", label: "Next PR must start as Draft.", command: "Draft PR", status: "Required" },
    { id: "P21-33-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-33-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-33-NO-FORCE", label: "Do not force push or reset main during verification.", command: "blocked", status: "Blocked" },
    { id: "P21-33-NO-LAUNCHERS", label: "Do not create or modify launcher-type files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-33-PRIVATE", label: "Private repository and local-first operation remain required.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-33-UNKNOWN",
      label: safe.label || "Manual post PR226 main sync verification gate confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr226MainSyncVerificationGatePanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postMergeMainSyncChecks,
      db.phase2132PresenceChecks,
      db.nextDraftGateChecks,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, VERIFICATION_GATE_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      priorPrNumber: 226,
      priorPhase: "Phase21-32",
      mainSyncRequired: true,
      cleanWorkingTreeRequired: true,
      phase2132PresenceRequired: true,
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
      priorPrNumber: 226,
      priorPhase: "Phase21-32",
      expectedPriorMergeCommit: summary.expectedPriorMergeCommit || db.expectedPriorMergeCommit || "059b2d21b6629eb0a81a1e66ed99d7082e701c54",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      mainSyncPolicy: summary.mainSyncPolicy || db.mainSyncPolicy || "after PR #226 merge, sync local main and confirm clean status before continuing.",
      phasePresencePolicy: summary.phasePresencePolicy || db.phasePresencePolicy || "confirm Phase21-32 files exist on main after pull.",
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "future PRs start as Draft and stop before review/merge until confirmed.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mainSyncRequired: summary.mainSyncRequired !== false,
      cleanWorkingTreeRequired: summary.cleanWorkingTreeRequired !== false,
      phase2132PresenceRequired: summary.phase2132PresenceRequired !== false,
      draftPrRequired: summary.draftPrRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm PR #226 merge, sync main, verify clean status and Phase21-32 files, then continue with Draft PR flow only.",
      records: normalizedRecords
    };
  }

  function renderPostPr226MainSyncVerificationGatePanel(panel, doc = document) {
    const safePanel = panel || buildPostPr226MainSyncVerificationGatePanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-33-panel-status", safePanel.panelStatus);
      set("#phase21-33-status", safePanel.status);
      set("#phase21-33-prior-pr", safePanel.priorPrNumber);
      set("#phase21-33-prior-phase", safePanel.priorPhase);
      set("#phase21-33-merge-commit", safePanel.expectedPriorMergeCommit);
      set("#phase21-33-total-checks", safePanel.totalChecks);
      set("#phase21-33-passed", safePanel.passed);
      set("#phase21-33-main-sync-policy", safePanel.mainSyncPolicy);
      set("#phase21-33-phase-presence-policy", safePanel.phasePresencePolicy);
      set("#phase21-33-draft-pr-policy", safePanel.draftPrPolicy);
      set("#phase21-33-main-sync-required", safePanel.mainSyncRequired);
      set("#phase21-33-clean-working-tree", safePanel.cleanWorkingTreeRequired);
      set("#phase21-33-phase2132-presence", safePanel.phase2132PresenceRequired);
      set("#phase21-33-draft-pr-required", safePanel.draftPrRequired);
      set("#phase21-33-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-33-no-main-commit", policy.mainDirectCommitAllowed);
      set("#phase21-33-no-force-push", policy.forcePushAllowed);
      set("#phase21-33-no-launcher-change", policy.launcherFileChangeAllowed);
      set("#phase21-33-no-bat", policy.batAllowed);
      set("#phase21-33-no-ps1", policy.ps1Allowed);
      set("#phase21-33-no-cmd", policy.cmdAllowed);
      set("#phase21-33-no-exe", policy.exeAllowed);
      set("#phase21-33-no-pages", safePanel.githubPagesRequired);
      set("#phase21-33-next-step", safePanel.nextRecommendedStep);
      set("#phase21-33-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-33-post-pr226-main-sync-verification-gate-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-33-post-pr226-main-sync-verification-gate-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-33-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-33-status");
      if (status) status.textContent = "PHASE21_33_POST_PR226_RENDER_FALLBACK";
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

  async function runPostPr226MainSyncVerificationGatePanel(options = {}) {
    if (options.sources) return buildPostPr226MainSyncVerificationGatePanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr226MainSyncVerificationGatePanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr226MainSyncVerificationGatePanel(options = {}) {
    const panel = await runPostPr226MainSyncVerificationGatePanel(options);
    return renderPostPr226MainSyncVerificationGatePanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-33-post-pr226-main-sync-verification-gate");
      if (button) button.addEventListener("click", () => runAndRenderPostPr226MainSyncVerificationGatePanel());
      if (document.querySelector("#phase21-33-post-pr226-main-sync-verification-gate")) runAndRenderPostPr226MainSyncVerificationGatePanel();
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
    VERIFICATION_GATE_CHECKS,
    buildPostPr226MainSyncVerificationGatePanel,
    renderPostPr226MainSyncVerificationGatePanel,
    runPostPr226MainSyncVerificationGatePanel,
    runAndRenderPostPr226MainSyncVerificationGatePanel
  };
});
