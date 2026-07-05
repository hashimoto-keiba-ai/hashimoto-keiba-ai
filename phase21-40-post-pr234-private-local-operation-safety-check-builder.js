(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2140PostPr234PrivateLocalOperationSafetyCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-40";
  const CHECKLIST_NAME = "Post PR234 Private Local Operation Safety Check";
  const PANEL_STATUS = "phase21_40_post_pr234_private_local_operation_safety_check_plan_only";
  const STATUS = "PHASE21_40_POST_PR234_PRIVATE_LOCAL_OPERATION_SAFETY_CHECK_READY";
  const DB_URL = "phase21-40-post-pr234-private-local-operation-safety-check-db.json";
  const SUMMARY_URL = "phase21-40-post-pr234-private-local-operation-safety-check-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    automaticRemotePublishAllowed: false,
    automaticMergeAllowed: false,
    hiddenBackgroundUpdateAllowed: false,
    automaticUpdateAllowed: false,
    externalSendAllowed: false,
    suspiciousAutoRunScriptAllowed: false,
    launcherFileChangeAllowed: false,
    unrelatedStashChangeAllowed: false,
    branchDeletionBeforeMergeConfirmationAllowed: false,
    mainSyncAfterMergeRequired: true,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const SAFETY_CHECKS = [
    { id: "P21-40-PR234-MERGED", label: "Confirm PR #234 is merged before treating main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-40-PHASE21-39-MAIN", label: "Confirm Phase21-39 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-40-HOME-MAIN-LATEST", label: "Confirm home PC main branch is latest before the next Phase.", command: "manual latest main confirmation", status: "Required" },
    { id: "P21-40-WORKTREE-CLEAN", label: "Confirm working tree is clean before the next Phase.", command: "git status --short", status: "Required" },
    { id: "P21-40-CLEAN-MAIN-START", label: "Confirm Phase21-40 starts from clean main.", command: "manual clean main confirmation", status: "Required" },
    { id: "P21-40-UNRELATED-STASHES-UNTOUCHED", label: "Confirm old unrelated stashes remain untouched.", command: "manual stash preservation confirmation", status: "Required" },
    { id: "P21-40-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-40-FEATURE-BRANCH", label: "Feature branch is required for follow-up work.", command: "feature branch", status: "Required" },
    { id: "P21-40-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-40-MERGE-CONFIRM", label: "Merge only after user confirmation.", command: "manual merge confirmation", status: "Required" },
    { id: "P21-40-BRANCH-DELETE-CONFIRM", label: "Branch deletion is allowed only after merge confirmation.", command: "manual branch deletion confirmation", status: "Required" },
    { id: "P21-40-MAIN-SYNC-AFTER-MERGE", label: "Main sync is required after merge.", command: "manual main sync confirmation", status: "Required" },
    { id: "P21-40-PRIVATE-FIRST", label: "Private Local first remains required.", command: "private local", status: "Required" },
    { id: "P21-40-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-40-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-40-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-40-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-40-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-40-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-40-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-40-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-40-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-40-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-40-UNKNOWN",
      label: safe.label || "Manual Post PR234 Private Local operation safety confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr234PrivateLocalOperationSafetyCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr234MergeChecks,
      db.homePcSafetyChecks,
      db.cleanMainStartChecks,
      db.stashSafetyChecks,
      db.branchPrMergeChecks,
      db.privateLocalChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, SAFETY_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #234 merged main / Phase21-39 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #234 merged main / Phase21-39 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local first remains required after PR #234 main pull.",
      safetyPolicy: summary.safetyPolicy || db.safetyPolicy || "Home PC continues only after latest main and clean working tree are confirmed.",
      cleanMainPolicy: summary.cleanMainPolicy || db.cleanMainPolicy || "Phase21-40 starts from clean main before moving to the next Phase.",
      stashPolicy: summary.stashPolicy || db.stashPolicy || "Old unrelated stashes remain untouched.",
      branchCleanupPolicy: summary.branchCleanupPolicy || db.branchCleanupPolicy || "Branch deletion is allowed only after merge confirmation, and main sync is required after merge.",
      securitySoftwarePolicy: summary.securitySoftwarePolicy || db.securitySoftwarePolicy || "Security software friendly operation avoids auto-run, hidden updates, and suspicious launcher behavior.",
      devicePolicy: summary.devicePolicy || db.devicePolicy || "home PC continues stable local operation; iPad is view/confirm only.",
      prMergePolicy: summary.prMergePolicy || db.prMergePolicy || "Feature branch and Draft PR are required; merge only after user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr234MergedConfirmationRequired: db.pr234MergedConfirmationRequired !== false,
      phase2139MainReflectionRequired: db.phase2139MainReflectionRequired !== false,
      homePcMainLatestConfirmed: db.homePcMainLatestConfirmed !== false,
      workingTreeCleanConfirmed: db.workingTreeCleanConfirmed !== false,
      phase2140StartsFromCleanMain: db.phase2140StartsFromCleanMain !== false,
      oldUnrelatedStashesUntouched: db.oldUnrelatedStashesUntouched !== false,
      featureBranchRequired: db.featureBranchRequired !== false,
      draftPrRequired: db.draftPrRequired !== false,
      mergeAfterUserConfirmationOnly: db.mergeAfterUserConfirmationOnly !== false,
      branchDeletionOnlyAfterMergeConfirmation: db.branchDeletionOnlyAfterMergeConfirmation !== false,
      mainSyncRequiredAfterMerge: db.mainSyncRequiredAfterMerge !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      autoExecutionAllowed: false,
      automaticUpdateAllowed: false,
      hiddenBackgroundUpdateAllowed: false,
      suspiciousAutoRunScriptAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      ipadViewConfirmOnly: db.ipadViewConfirmOnly !== false,
      powerShellManualOnly: db.powerShellManualOnly !== false,
      localBrowserConfirmationRequired: db.localBrowserConfirmationRequired !== false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Proceed to the next Phase only after PR #234 main latest, clean working tree, branch cleanup policy, and local browser confirmation are complete.",
      records: normalizedRecords
    };
  }

  function renderPostPr234PrivateLocalOperationSafetyCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr234PrivateLocalOperationSafetyCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-40-panel-status", safePanel.panelStatus);
      set("#phase21-40-status", safePanel.status);
      set("#phase21-40-baseline", safePanel.baseline);
      set("#phase21-40-total-checks", safePanel.totalChecks);
      set("#phase21-40-passed", safePanel.passed);
      set("#phase21-40-operation-policy", safePanel.operationPolicy);
      set("#phase21-40-safety-policy", safePanel.safetyPolicy);
      set("#phase21-40-clean-main-policy", safePanel.cleanMainPolicy);
      set("#phase21-40-stash-policy", safePanel.stashPolicy);
      set("#phase21-40-branch-cleanup-policy", safePanel.branchCleanupPolicy);
      set("#phase21-40-security-policy", safePanel.securitySoftwarePolicy);
      set("#phase21-40-device-policy", safePanel.devicePolicy);
      set("#phase21-40-pr-merge-policy", safePanel.prMergePolicy);
      set("#phase21-40-plan-only", safePanel.planOnly);
      set("#phase21-40-protected", safePanel.protected);
      set("#phase21-40-private-repository", safePanel.privateRepository);
      set("#phase21-40-local-first", safePanel.localFirst);
      set("#phase21-40-pr234-merged", safePanel.pr234MergedConfirmationRequired);
      set("#phase21-40-phase21-39-main", safePanel.phase2139MainReflectionRequired);
      set("#phase21-40-home-main-latest", safePanel.homePcMainLatestConfirmed);
      set("#phase21-40-worktree-clean", safePanel.workingTreeCleanConfirmed);
      set("#phase21-40-clean-main-start", safePanel.phase2140StartsFromCleanMain);
      set("#phase21-40-unrelated-stashes-untouched", safePanel.oldUnrelatedStashesUntouched);
      set("#phase21-40-feature-branch", safePanel.featureBranchRequired);
      set("#phase21-40-draft-pr", safePanel.draftPrRequired);
      set("#phase21-40-merge-confirm", safePanel.mergeAfterUserConfirmationOnly);
      set("#phase21-40-branch-delete-confirm", safePanel.branchDeletionOnlyAfterMergeConfirmation);
      set("#phase21-40-main-sync-after-merge", safePanel.mainSyncRequiredAfterMerge);
      set("#phase21-40-no-pages", safePanel.githubPagesRequired);
      set("#phase21-40-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-40-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-40-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-40-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-40-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-40-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-40-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-40-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-40-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-40-no-bat", policy.batAllowed);
      set("#phase21-40-no-ps1", policy.ps1Allowed);
      set("#phase21-40-no-cmd", policy.cmdAllowed);
      set("#phase21-40-no-exe", policy.exeAllowed);
      set("#phase21-40-next-step", safePanel.nextRecommendedStep);
      set("#phase21-40-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-40-post-pr234-private-local-operation-safety-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-40-post-pr234-private-local-operation-safety-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-40-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-40-status");
      if (status) status.textContent = "PHASE21_40_POST_PR234_PRIVATE_LOCAL_SAFETY_RENDER_FALLBACK";
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

  async function runPostPr234PrivateLocalOperationSafetyCheckPanel(options = {}) {
    if (options.sources) return buildPostPr234PrivateLocalOperationSafetyCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr234PrivateLocalOperationSafetyCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr234PrivateLocalOperationSafetyCheckPanel(options = {}) {
    const panel = await runPostPr234PrivateLocalOperationSafetyCheckPanel(options);
    return renderPostPr234PrivateLocalOperationSafetyCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-40-post-pr234-private-local-operation-safety-check");
      if (button) button.addEventListener("click", () => runAndRenderPostPr234PrivateLocalOperationSafetyCheckPanel());
      if (document.querySelector("#phase21-40-post-pr234-private-local-operation-safety-check")) runAndRenderPostPr234PrivateLocalOperationSafetyCheckPanel();
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
    SAFETY_CHECKS,
    buildPostPr234PrivateLocalOperationSafetyCheckPanel,
    renderPostPr234PrivateLocalOperationSafetyCheckPanel,
    runPostPr234PrivateLocalOperationSafetyCheckPanel,
    runAndRenderPostPr234PrivateLocalOperationSafetyCheckPanel
  };
});
