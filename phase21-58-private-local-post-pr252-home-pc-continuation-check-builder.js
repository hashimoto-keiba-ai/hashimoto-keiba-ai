(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2158PrivateLocalPostPr252HomePcContinuationCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-58";
  const CHECKLIST_NAME = "Private Local Post PR252 Home PC Continuation Check";
  const PANEL_STATUS = "phase21_58_private_local_post_pr252_home_pc_continuation_check_plan_only";
  const STATUS = "PHASE21_58_PRIVATE_LOCAL_POST_PR252_HOME_PC_CONTINUATION_CHECK_READY";
  const DB_URL = "phase21-58-private-local-post-pr252-home-pc-continuation-check-db.json";
  const SUMMARY_URL = "phase21-58-private-local-post-pr252-home-pc-continuation-check-summary-db.json";
  const BASELINE = "PR #252 merged / Phase21-57 reflected on main / home PC main updated / private-local.html confirmed / main sync / private local continuation / no Pages";
  const LATEST_MAIN_HEAD = "3d6429e";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    publicUrlRequired: false,
    automaticRemotePublishAllowed: false,
    automaticMergeAllowed: false,
    hiddenBackgroundUpdateAllowed: false,
    automaticUpdateAllowed: false,
    externalSendAllowed: false,
    deletionProcessAllowed: false,
    credentialOutputAllowed: false,
    readyForReviewAllowed: false,
    mergeAllowed: false,
    suspiciousAutoRunScriptAllowed: false,
    unnecessaryPublicRouteAllowed: false,
    launcherFileChangeAllowed: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };
  const OPERATION_CHECKS = [
    { id: "P21-58-PR252-MERGED", label: "PR #252 merged and Phase21-57 is reflected on main.", command: "manual main confirmation", status: "Required" },
    { id: "P21-58-MAIN-HEAD", label: "Latest main HEAD is 3d6429e before Phase21-58 starts.", command: "git log --oneline -1", status: "Required" },
    { id: "P21-58-HOME-PC-MAIN-UPDATED", label: "Home PC main updated and private-local.html confirmed after Phase21-57 / PR #252 merge reflection.", command: "manual home PC confirmation", status: "Required" },
    { id: "P21-58-MAIN-SYNC", label: "main sync is confirmed before continuing private local work.", command: "git switch main / git pull origin main / git status", status: "Required" },
    { id: "P21-58-WORKTREE-CLEAN", label: "Working tree clean is required before local display confirmation.", command: "git status", status: "Required" },
    { id: "P21-58-PRIVATE-LOCAL-FIRST", label: "Private Local first remains the operation baseline.", command: "private-local.html", status: "PrivateLocalPolicy" },
    { id: "P21-58-MANUAL-LAUNCH", label: "Manual launch through private-local.html / index.html remains required.", command: "manual browser launch", status: "Required" },
    { id: "P21-58-NO-PAGES", label: "GitHub Pages is not required and no public URL is added.", command: "blocked", status: "Blocked" },
    { id: "P21-58-NO-AUTO-PUBLISH", label: "No automatic remote publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-58-NO-AUTO-MERGE", label: "No automatic merge is added.", command: "blocked", status: "Blocked" },
    { id: "P21-58-NO-HIDDEN-UPDATE", label: "No hidden background update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-58-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-58-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" }
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
      id: safe.id || "P21-58-UNKNOWN",
      label: safe.label || "Manual Private Local post PR252 home PC continuation confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalPostPr252HomePcContinuationCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.continuationChecks,
      db.privateLocalOperationChecks,
      db.prPolicyChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, OPERATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: BASELINE,
      planOnly: true,
      protected: true,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      autoExecutionAllowed: false,
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY }
    }));
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      baseline: summary.baseline || db.baseline || BASELINE,
      latestMainHead: summary.latestMainHead || db.latestMainHead || LATEST_MAIN_HEAD,
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, protected, and local first after PR #252 / Phase21-57 is merged into main.",
      safeLocalUsePolicy: summary.safeLocalUsePolicy || db.safeLocalUsePolicy || "Safe local use requires home PC main sync, clean working tree, local browser confirmation, and no GitHub Pages requirement.",
      prPolicy: summary.prPolicy || db.prPolicy || "PLAN_ONLY / protected / draft PR only remains active; Ready for review and merge require explicit user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      manualOperation: db.manualOperation !== false,
      draftPrOnly: db.draftPrOnly !== false,
      doNotMergeYet: db.doNotMergeYet !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      manualLaunchRequired: db.manualLaunchRequired !== false,
      homePcMainUpdatedAndPrivateLocalHtmlConfirmed: db.homePcMainUpdatedAndPrivateLocalHtmlConfirmed !== false,
      mainSyncedAfterPr252: db.mainSyncedAfterPr252 !== false,
      phase2157MainReflectionConfirmed: db.phase2157MainReflectionConfirmed !== false,
      workingTreeCleanRequired: db.workingTreeCleanRequired !== false,
      privateLocalOperationConfirmed: db.privateLocalOperationConfirmed !== false,
      operationRouteConsistencyConfirmed: db.operationRouteConsistencyConfirmed !== false,
      readmeRecordConsistencyConfirmed: db.readmeRecordConsistencyConfirmed !== false,
      localBrowserConfirmationRequired: db.localBrowserConfirmationRequired !== false,
      ipadViewConfirmOnly: db.ipadViewConfirmOnly !== false,
      powerShellManualOnly: db.powerShellManualOnly !== false,
      desktopShortcutOptional: db.desktopShortcutOptional !== false,
      readyForReviewAllowed: false,
      readyForReviewPerformed: false,
      mergeAllowed: false,
      mergePerformed: false,
      mainDirectPushAllowed: false,
      mainDirectCommitAllowed: false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      publicUrlRequired: false,
      externalApiAllowed: false,
      autoExecutionAllowed: false,
      automaticRemotePublishAllowed: false,
      automaticMergeAllowed: false,
      hiddenBackgroundUpdateAllowed: false,
      automaticUpdateAllowed: false,
      suspiciousAutoRunScriptAllowed: false,
      unnecessaryPublicRouteAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Create the Phase21-58 Draft PR from the post PR252 home PC continuation branch, keep it Draft, confirm private-local.html and index.html locally, and do not merge until user confirmation.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalPostPr252HomePcContinuationCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalPostPr252HomePcContinuationCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      [
        ["#phase21-58-panel-status", safePanel.panelStatus],
        ["#phase21-58-status", safePanel.status],
        ["#phase21-58-baseline", safePanel.baseline],
        ["#phase21-58-main-head", safePanel.latestMainHead],
        ["#phase21-58-total-checks", safePanel.totalChecks],
        ["#phase21-58-passed", safePanel.passed],
        ["#phase21-58-operation-policy", safePanel.operationPolicy],
        ["#phase21-58-safe-local-use-policy", safePanel.safeLocalUsePolicy],
        ["#phase21-58-pr-policy", safePanel.prPolicy],
        ["#phase21-58-plan-only", safePanel.planOnly],
        ["#phase21-58-protected", safePanel.protected],
        ["#phase21-58-manual-operation", safePanel.manualOperation],
        ["#phase21-58-draft-pr-only", safePanel.draftPrOnly],
        ["#phase21-58-do-not-merge-yet", safePanel.doNotMergeYet],
        ["#phase21-58-private-repository", safePanel.privateRepository],
        ["#phase21-58-local-first", safePanel.localFirst],
        ["#phase21-58-manual-launch", safePanel.manualLaunchRequired],
        ["#phase21-58-home-pc-main-updated", safePanel.homePcMainUpdatedAndPrivateLocalHtmlConfirmed],
        ["#phase21-58-main-sync", safePanel.mainSyncedAfterPr252],
        ["#phase21-58-phase21-57-main", safePanel.phase2157MainReflectionConfirmed],
        ["#phase21-58-working-tree-clean", safePanel.workingTreeCleanRequired],
        ["#phase21-58-private-local-confirmed", safePanel.privateLocalOperationConfirmed],
        ["#phase21-58-operation-route-consistency-confirmed", safePanel.operationRouteConsistencyConfirmed],
        ["#phase21-58-readme-record-consistency-confirmed", safePanel.readmeRecordConsistencyConfirmed],
        ["#phase21-58-local-browser-confirm", safePanel.localBrowserConfirmationRequired],
        ["#phase21-58-ipad-view-only", safePanel.ipadViewConfirmOnly],
        ["#phase21-58-powershell-manual", safePanel.powerShellManualOnly],
        ["#phase21-58-shortcut-optional", safePanel.desktopShortcutOptional],
        ["#phase21-58-ready-for-review", safePanel.readyForReviewPerformed],
        ["#phase21-58-merge", safePanel.mergePerformed],
        ["#phase21-58-main-push", safePanel.mainDirectPushAllowed],
        ["#phase21-58-main-commit", safePanel.mainDirectCommitAllowed],
        ["#phase21-58-no-pages", safePanel.githubPagesRequired],
        ["#phase21-58-no-public", safePanel.publicDeliveryAllowed],
        ["#phase21-58-no-public-url", safePanel.publicUrlRequired],
        ["#phase21-58-no-external-api", safePanel.externalApiAllowed],
        ["#phase21-58-no-auto-execution", safePanel.autoExecutionAllowed],
        ["#phase21-58-no-auto-publish", safePanel.automaticRemotePublishAllowed],
        ["#phase21-58-no-auto-merge", safePanel.automaticMergeAllowed],
        ["#phase21-58-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed],
        ["#phase21-58-no-auto-update", safePanel.automaticUpdateAllowed],
        ["#phase21-58-no-autorun", safePanel.suspiciousAutoRunScriptAllowed],
        ["#phase21-58-no-public-route", safePanel.unnecessaryPublicRouteAllowed],
        ["#phase21-58-no-bat", policy.batAllowed],
        ["#phase21-58-no-ps1", policy.ps1Allowed],
        ["#phase21-58-no-cmd", policy.cmdAllowed],
        ["#phase21-58-no-exe", policy.exeAllowed],
        ["#phase21-58-next-step", safePanel.nextRecommendedStep],
        ["#phase21-58-updated", safePanel.generatedAt]
      ].forEach(([selector, value]) => set(selector, value));
      const list = doc.querySelector("#phase21-58-private-local-post-pr252-home-pc-continuation-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-58-private-local-post-pr252-home-pc-continuation-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-58-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-58-status");
      if (status) status.textContent = "PHASE21_58_PRIVATE_LOCAL_POST_PR252_HOME_PC_CONTINUATION_RENDER_FALLBACK";
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

  async function runPrivateLocalPostPr252HomePcContinuationCheckPanel(options = {}) {
    if (options.sources) return buildPrivateLocalPostPr252HomePcContinuationCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalPostPr252HomePcContinuationCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalPostPr252HomePcContinuationCheckPanel(options = {}) {
    const panel = await runPrivateLocalPostPr252HomePcContinuationCheckPanel(options);
    return renderPrivateLocalPostPr252HomePcContinuationCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-58-private-local-post-pr252-home-pc-continuation-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr252HomePcContinuationCheckPanel());
      if (document.querySelector("#phase21-58-private-local-post-pr252-home-pc-continuation-check")) runAndRenderPrivateLocalPostPr252HomePcContinuationCheckPanel();
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
    BASELINE,
    LATEST_MAIN_HEAD,
    BLOCKED_ACTION_POLICY,
    OPERATION_CHECKS,
    buildPrivateLocalPostPr252HomePcContinuationCheckPanel,
    renderPrivateLocalPostPr252HomePcContinuationCheckPanel,
    runPrivateLocalPostPr252HomePcContinuationCheckPanel,
    runAndRenderPrivateLocalPostPr252HomePcContinuationCheckPanel
  };
});
