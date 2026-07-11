(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2163FinalPrivateLocalContinuationClosureBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-63";
  const CHECKLIST_NAME = "Final Private Local Continuation Closure";
  const PANEL_STATUS = "phase21_63_final_private_local_continuation_closure_plan_only";
  const STATUS = "PHASE21_63_FINAL_PRIVATE_LOCAL_CONTINUATION_CLOSURE_READY";
  const DB_URL = "phase21-63-final-private-local-continuation-closure-db.json";
  const SUMMARY_URL = "phase21-63-final-private-local-continuation-closure-summary-db.json";
  const BASELINE = "PR #257 merged / Phase21-62 reflected on main / home PC main updated / private-local.html confirmed / Private Local maintained / no Public / no Pages / Phase21 closed";
  const LATEST_MAIN_HEAD = "4b15a0c";
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
    { id: "P21-63-PR257-MERGED", label: "PR #257 merged and Phase21-62 is reflected on main.", command: "manual main confirmation", status: "Required" },
    { id: "P21-63-PHASE21-CLOSED", label: "Phase21 is officially closed; Phase21-64 and later same-type continuation checks are not created.", command: "manual closure policy", status: "Required" },
    { id: "P21-63-MAIN-HEAD", label: "Latest main HEAD is 4b15a0c before Phase21-63 starts.", command: "git log --oneline -1", status: "Required" },
    { id: "P21-63-HOME-PC-MAIN-UPDATED", label: "Home PC main updated and private-local.html confirmed after Phase21-62 / PR #257 merge reflection.", command: "manual home PC confirmation", status: "Required" },
    { id: "P21-63-MAIN-SYNC", label: "main sync is confirmed before continuing private local work.", command: "git switch main / git pull origin main / git status", status: "Required" },
    { id: "P21-63-WORKTREE-CLEAN", label: "Working tree clean is required before local display confirmation.", command: "git status", status: "Required" },
    { id: "P21-63-PRIVATE-LOCAL-FIRST", label: "Private Local first remains the operation baseline.", command: "private-local.html", status: "PrivateLocalPolicy" },
    { id: "P21-63-MANUAL-LAUNCH", label: "Manual launch through private-local.html / index.html remains required.", command: "manual browser launch", status: "Required" },
    { id: "P21-63-NO-PAGES", label: "GitHub Pages is not required and no public URL is added.", command: "blocked", status: "Blocked" },
    { id: "P21-63-NO-AUTO-PUBLISH", label: "No automatic remote publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-63-NO-AUTO-MERGE", label: "No automatic merge is added.", command: "blocked", status: "Blocked" },
    { id: "P21-63-NO-HIDDEN-UPDATE", label: "No hidden background update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-63-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-63-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" }
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
      id: safe.id || "P21-63-UNKNOWN",
      label: safe.label || "Manual Private Local final continuation closure confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildFinalPrivateLocalContinuationClosurePanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.closureChecks,
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
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, protected, local first, and closed for Phase21 after PR #257 / Phase21-62 is merged into main.",
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
      finalPhase21Closure: db.finalPhase21Closure !== false,
      phase21Closed: db.phase21Closed !== false,
      noPhase2164OrLaterSameTypeContinuationChecks: db.noPhase2164OrLaterSameTypeContinuationChecks !== false,
      homePcMainUpdatedAndPrivateLocalHtmlConfirmed: db.homePcMainUpdatedAndPrivateLocalHtmlConfirmed !== false,
      mainSyncedAfterPr257: db.mainSyncedAfterPr257 !== false,
      phase2162MainReflectionConfirmed: db.phase2162MainReflectionConfirmed !== false,
      workingTreeCleanRequired: db.workingTreeCleanRequired !== false,
      privateLocalOperationConfirmed: db.privateLocalOperationConfirmed !== false,
      privateLocalMaintained: db.privateLocalMaintained !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Use Phase21-63 as the final Phase21 closure record; do not create Phase21-64 or later same-type continuation checks.",
      records: normalizedRecords
    };
  }

  function renderFinalPrivateLocalContinuationClosurePanel(panel, doc = document) {
    const safePanel = panel || buildFinalPrivateLocalContinuationClosurePanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      [
        ["#phase21-63-panel-status", safePanel.panelStatus],
        ["#phase21-63-status", safePanel.status],
        ["#phase21-63-baseline", safePanel.baseline],
        ["#phase21-63-main-head", safePanel.latestMainHead],
        ["#phase21-63-total-checks", safePanel.totalChecks],
        ["#phase21-63-passed", safePanel.passed],
        ["#phase21-63-operation-policy", safePanel.operationPolicy],
        ["#phase21-63-safe-local-use-policy", safePanel.safeLocalUsePolicy],
        ["#phase21-63-pr-policy", safePanel.prPolicy],
        ["#phase21-63-plan-only", safePanel.planOnly],
        ["#phase21-63-protected", safePanel.protected],
        ["#phase21-63-manual-operation", safePanel.manualOperation],
        ["#phase21-63-draft-pr-only", safePanel.draftPrOnly],
        ["#phase21-63-do-not-merge-yet", safePanel.doNotMergeYet],
        ["#phase21-63-private-repository", safePanel.privateRepository],
        ["#phase21-63-local-first", safePanel.localFirst],
        ["#phase21-63-manual-launch", safePanel.manualLaunchRequired],
        ["#phase21-63-home-pc-main-updated", safePanel.homePcMainUpdatedAndPrivateLocalHtmlConfirmed],
        ["#phase21-63-main-sync", safePanel.mainSyncedAfterPr257],
        ["#phase21-63-phase21-62-main", safePanel.phase2162MainReflectionConfirmed],
        ["#phase21-63-working-tree-clean", safePanel.workingTreeCleanRequired],
        ["#phase21-63-private-local-confirmed", safePanel.privateLocalOperationConfirmed],
        ["#phase21-63-operation-route-consistency-confirmed", safePanel.operationRouteConsistencyConfirmed],
        ["#phase21-63-readme-record-consistency-confirmed", safePanel.readmeRecordConsistencyConfirmed],
        ["#phase21-63-local-browser-confirm", safePanel.localBrowserConfirmationRequired],
        ["#phase21-63-ipad-view-only", safePanel.ipadViewConfirmOnly],
        ["#phase21-63-powershell-manual", safePanel.powerShellManualOnly],
        ["#phase21-63-shortcut-optional", safePanel.desktopShortcutOptional],
        ["#phase21-63-ready-for-review", safePanel.readyForReviewPerformed],
        ["#phase21-63-merge", safePanel.mergePerformed],
        ["#phase21-63-main-push", safePanel.mainDirectPushAllowed],
        ["#phase21-63-main-commit", safePanel.mainDirectCommitAllowed],
        ["#phase21-63-no-pages", safePanel.githubPagesRequired],
        ["#phase21-63-no-public", safePanel.publicDeliveryAllowed],
        ["#phase21-63-no-public-url", safePanel.publicUrlRequired],
        ["#phase21-63-no-external-api", safePanel.externalApiAllowed],
        ["#phase21-63-no-auto-execution", safePanel.autoExecutionAllowed],
        ["#phase21-63-no-auto-publish", safePanel.automaticRemotePublishAllowed],
        ["#phase21-63-no-auto-merge", safePanel.automaticMergeAllowed],
        ["#phase21-63-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed],
        ["#phase21-63-no-auto-update", safePanel.automaticUpdateAllowed],
        ["#phase21-63-no-autorun", safePanel.suspiciousAutoRunScriptAllowed],
        ["#phase21-63-no-public-route", safePanel.unnecessaryPublicRouteAllowed],
        ["#phase21-63-no-bat", policy.batAllowed],
        ["#phase21-63-no-ps1", policy.ps1Allowed],
        ["#phase21-63-no-cmd", policy.cmdAllowed],
        ["#phase21-63-no-exe", policy.exeAllowed],
        ["#phase21-63-next-step", safePanel.nextRecommendedStep],
        ["#phase21-63-updated", safePanel.generatedAt]
      ].forEach(([selector, value]) => set(selector, value));
      const list = doc.querySelector("#phase21-63-final-private-local-continuation-closure-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-63-final-private-local-continuation-closure-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-63-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-63-status");
      if (status) status.textContent = "PHASE21_63_FINAL_PRIVATE_LOCAL_CONTINUATION_CLOSURE_RENDER_FALLBACK";
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

  async function runFinalPrivateLocalContinuationClosurePanel(options = {}) {
    if (options.sources) return buildFinalPrivateLocalContinuationClosurePanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildFinalPrivateLocalContinuationClosurePanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderFinalPrivateLocalContinuationClosurePanel(options = {}) {
    const panel = await runFinalPrivateLocalContinuationClosurePanel(options);
    return renderFinalPrivateLocalContinuationClosurePanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-63-final-private-local-continuation-closure");
      if (button) button.addEventListener("click", () => runAndRenderFinalPrivateLocalContinuationClosurePanel());
      if (document.querySelector("#phase21-63-final-private-local-continuation-closure")) runAndRenderFinalPrivateLocalContinuationClosurePanel();
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
    buildFinalPrivateLocalContinuationClosurePanel,
    renderFinalPrivateLocalContinuationClosurePanel,
    runFinalPrivateLocalContinuationClosurePanel,
    runAndRenderFinalPrivateLocalContinuationClosurePanel
  };
});
