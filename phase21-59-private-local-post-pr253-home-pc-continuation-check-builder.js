(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2159PrivateLocalPostPr253HomePcContinuationCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-59";
  const CHECKLIST_NAME = "Private Local Post PR253 Home PC Continuation Check";
  const PANEL_STATUS = "phase21_59_private_local_post_pr253_home_pc_continuation_check_plan_only";
  const STATUS = "PHASE21_59_PRIVATE_LOCAL_POST_PR253_HOME_PC_CONTINUATION_CHECK_READY";
  const DB_URL = "phase21-59-private-local-post-pr253-home-pc-continuation-check-db.json";
  const SUMMARY_URL = "phase21-59-private-local-post-pr253-home-pc-continuation-check-summary-db.json";
  const BASELINE = "PR #253 merged / Phase21-58 reflected on main / home PC main updated / private-local.html confirmed / main sync / private local continuation / no Pages";
  const LATEST_MAIN_HEAD = "bb70f25";
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
    { id: "P21-59-PR253-MERGED", label: "PR #253 merged and Phase21-58 is reflected on main.", command: "manual main confirmation", status: "Required" },
    { id: "P21-59-MAIN-HEAD", label: "Latest main HEAD is bb70f25 before Phase21-59 starts.", command: "git log --oneline -1", status: "Required" },
    { id: "P21-59-HOME-PC-MAIN-UPDATED", label: "Home PC main updated and private-local.html confirmed after Phase21-58 / PR #253 merge reflection.", command: "manual home PC confirmation", status: "Required" },
    { id: "P21-59-MAIN-SYNC", label: "main sync is confirmed before continuing private local work.", command: "git switch main / git pull origin main / git status", status: "Required" },
    { id: "P21-59-WORKTREE-CLEAN", label: "Working tree clean is required before local display confirmation.", command: "git status", status: "Required" },
    { id: "P21-59-PRIVATE-LOCAL-FIRST", label: "Private Local first remains the operation baseline.", command: "private-local.html", status: "PrivateLocalPolicy" },
    { id: "P21-59-MANUAL-LAUNCH", label: "Manual launch through private-local.html / index.html remains required.", command: "manual browser launch", status: "Required" },
    { id: "P21-59-NO-PAGES", label: "GitHub Pages is not required and no public URL is added.", command: "blocked", status: "Blocked" },
    { id: "P21-59-NO-AUTO-PUBLISH", label: "No automatic remote publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-59-NO-AUTO-MERGE", label: "No automatic merge is added.", command: "blocked", status: "Blocked" },
    { id: "P21-59-NO-HIDDEN-UPDATE", label: "No hidden background update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-59-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-59-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" }
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
      id: safe.id || "P21-59-UNKNOWN",
      label: safe.label || "Manual Private Local post PR253 home PC continuation confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalPostPr253HomePcContinuationCheckPanel(sources = {}, now = () => new Date()) {
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
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, protected, and local first after PR #253 / Phase21-58 is merged into main.",
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
      mainSyncedAfterPr253: db.mainSyncedAfterPr253 !== false,
      phase2158MainReflectionConfirmed: db.phase2158MainReflectionConfirmed !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Create the Phase21-59 Draft PR from the post PR253 home PC continuation branch, keep it Draft, confirm private-local.html and index.html locally, and do not merge until user confirmation.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalPostPr253HomePcContinuationCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalPostPr253HomePcContinuationCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      [
        ["#phase21-59-panel-status", safePanel.panelStatus],
        ["#phase21-59-status", safePanel.status],
        ["#phase21-59-baseline", safePanel.baseline],
        ["#phase21-59-main-head", safePanel.latestMainHead],
        ["#phase21-59-total-checks", safePanel.totalChecks],
        ["#phase21-59-passed", safePanel.passed],
        ["#phase21-59-operation-policy", safePanel.operationPolicy],
        ["#phase21-59-safe-local-use-policy", safePanel.safeLocalUsePolicy],
        ["#phase21-59-pr-policy", safePanel.prPolicy],
        ["#phase21-59-plan-only", safePanel.planOnly],
        ["#phase21-59-protected", safePanel.protected],
        ["#phase21-59-manual-operation", safePanel.manualOperation],
        ["#phase21-59-draft-pr-only", safePanel.draftPrOnly],
        ["#phase21-59-do-not-merge-yet", safePanel.doNotMergeYet],
        ["#phase21-59-private-repository", safePanel.privateRepository],
        ["#phase21-59-local-first", safePanel.localFirst],
        ["#phase21-59-manual-launch", safePanel.manualLaunchRequired],
        ["#phase21-59-home-pc-main-updated", safePanel.homePcMainUpdatedAndPrivateLocalHtmlConfirmed],
        ["#phase21-59-main-sync", safePanel.mainSyncedAfterPr253],
        ["#phase21-59-phase21-58-main", safePanel.phase2158MainReflectionConfirmed],
        ["#phase21-59-working-tree-clean", safePanel.workingTreeCleanRequired],
        ["#phase21-59-private-local-confirmed", safePanel.privateLocalOperationConfirmed],
        ["#phase21-59-operation-route-consistency-confirmed", safePanel.operationRouteConsistencyConfirmed],
        ["#phase21-59-readme-record-consistency-confirmed", safePanel.readmeRecordConsistencyConfirmed],
        ["#phase21-59-local-browser-confirm", safePanel.localBrowserConfirmationRequired],
        ["#phase21-59-ipad-view-only", safePanel.ipadViewConfirmOnly],
        ["#phase21-59-powershell-manual", safePanel.powerShellManualOnly],
        ["#phase21-59-shortcut-optional", safePanel.desktopShortcutOptional],
        ["#phase21-59-ready-for-review", safePanel.readyForReviewPerformed],
        ["#phase21-59-merge", safePanel.mergePerformed],
        ["#phase21-59-main-push", safePanel.mainDirectPushAllowed],
        ["#phase21-59-main-commit", safePanel.mainDirectCommitAllowed],
        ["#phase21-59-no-pages", safePanel.githubPagesRequired],
        ["#phase21-59-no-public", safePanel.publicDeliveryAllowed],
        ["#phase21-59-no-public-url", safePanel.publicUrlRequired],
        ["#phase21-59-no-external-api", safePanel.externalApiAllowed],
        ["#phase21-59-no-auto-execution", safePanel.autoExecutionAllowed],
        ["#phase21-59-no-auto-publish", safePanel.automaticRemotePublishAllowed],
        ["#phase21-59-no-auto-merge", safePanel.automaticMergeAllowed],
        ["#phase21-59-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed],
        ["#phase21-59-no-auto-update", safePanel.automaticUpdateAllowed],
        ["#phase21-59-no-autorun", safePanel.suspiciousAutoRunScriptAllowed],
        ["#phase21-59-no-public-route", safePanel.unnecessaryPublicRouteAllowed],
        ["#phase21-59-no-bat", policy.batAllowed],
        ["#phase21-59-no-ps1", policy.ps1Allowed],
        ["#phase21-59-no-cmd", policy.cmdAllowed],
        ["#phase21-59-no-exe", policy.exeAllowed],
        ["#phase21-59-next-step", safePanel.nextRecommendedStep],
        ["#phase21-59-updated", safePanel.generatedAt]
      ].forEach(([selector, value]) => set(selector, value));
      const list = doc.querySelector("#phase21-59-private-local-post-pr253-home-pc-continuation-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-59-private-local-post-pr253-home-pc-continuation-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-59-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-59-status");
      if (status) status.textContent = "PHASE21_59_PRIVATE_LOCAL_POST_PR253_HOME_PC_CONTINUATION_RENDER_FALLBACK";
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

  async function runPrivateLocalPostPr253HomePcContinuationCheckPanel(options = {}) {
    if (options.sources) return buildPrivateLocalPostPr253HomePcContinuationCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalPostPr253HomePcContinuationCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalPostPr253HomePcContinuationCheckPanel(options = {}) {
    const panel = await runPrivateLocalPostPr253HomePcContinuationCheckPanel(options);
    return renderPrivateLocalPostPr253HomePcContinuationCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-59-private-local-post-pr253-home-pc-continuation-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr253HomePcContinuationCheckPanel());
      if (document.querySelector("#phase21-59-private-local-post-pr253-home-pc-continuation-check")) runAndRenderPrivateLocalPostPr253HomePcContinuationCheckPanel();
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
    buildPrivateLocalPostPr253HomePcContinuationCheckPanel,
    renderPrivateLocalPostPr253HomePcContinuationCheckPanel,
    runPrivateLocalPostPr253HomePcContinuationCheckPanel,
    runAndRenderPrivateLocalPostPr253HomePcContinuationCheckPanel
  };
});
