(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2138PostPr232PrivateLocalOperationStabilityCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-38";
  const CHECKLIST_NAME = "Post PR232 Private Local Operation Stability Check";
  const PANEL_STATUS = "phase21_38_post_pr232_private_local_operation_stability_check_plan_only";
  const STATUS = "PHASE21_38_POST_PR232_PRIVATE_LOCAL_OPERATION_STABILITY_CHECK_READY";
  const DB_URL = "phase21-38-post-pr232-private-local-operation-stability-check-db.json";
  const SUMMARY_URL = "phase21-38-post-pr232-private-local-operation-stability-check-summary-db.json";
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
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const STABILITY_CHECKS = [
    { id: "P21-38-PR232-MERGED", label: "Confirm PR #232 is merged before treating main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-38-PHASE21-37-MAIN", label: "Confirm Phase21-37 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-38-HOME-MAIN-LATEST", label: "Confirm home PC main branch is latest before continuation.", command: "manual latest main confirmation", status: "Required" },
    { id: "P21-38-WORKTREE-CLEAN", label: "Confirm working tree is clean before follow-up work.", command: "git status --short", status: "Required" },
    { id: "P21-38-TEMP-STASH-REMOVED", label: "Confirm old temporary Phase21-37 stash is removed.", command: "manual stash confirmation", status: "Required" },
    { id: "P21-38-UNRELATED-STASHES-UNTOUCHED", label: "Confirm old unrelated stashes remain untouched.", command: "manual stash preservation confirmation", status: "Required" },
    { id: "P21-38-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-38-FEATURE-BRANCH", label: "Feature branch is required for follow-up work.", command: "feature branch", status: "Required" },
    { id: "P21-38-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-38-MERGE-CONFIRM", label: "Merge only after user confirmation.", command: "manual merge confirmation", status: "Required" },
    { id: "P21-38-PRIVATE-FIRST", label: "Private Local first remains required.", command: "private local", status: "Required" },
    { id: "P21-38-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-38-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-38-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-38-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-38-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-38-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-38-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-38-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-38-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-38-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-38-UNKNOWN",
      label: safe.label || "Manual Post PR232 Private Local operation stability confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr232PrivateLocalOperationStabilityCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr232MergeChecks,
      db.homePcStabilityChecks,
      db.stashSafetyChecks,
      db.branchPrMergeChecks,
      db.privateLocalChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, STABILITY_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #232 merged main / Phase21-37 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #232 merged main / Phase21-37 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local first remains required after PR #232 main pull.",
      stabilityPolicy: summary.stabilityPolicy || db.stabilityPolicy || "Home PC continuation starts only from latest main and a clean working tree.",
      stashPolicy: summary.stashPolicy || db.stashPolicy || "Only the old temporary Phase21-37 stash is removed; unrelated stashes remain untouched.",
      securitySoftwarePolicy: summary.securitySoftwarePolicy || db.securitySoftwarePolicy || "Security software friendly operation avoids auto-run, hidden updates, and suspicious launcher behavior.",
      devicePolicy: summary.devicePolicy || db.devicePolicy || "home PC continues stable local operation; iPad is view/confirm only.",
      prMergePolicy: summary.prMergePolicy || db.prMergePolicy || "Feature branch and Draft PR are required; merge only after user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr232MergedConfirmationRequired: db.pr232MergedConfirmationRequired !== false,
      phase2137MainReflectionRequired: db.phase2137MainReflectionRequired !== false,
      homePcMainLatestConfirmed: db.homePcMainLatestConfirmed !== false,
      workingTreeCleanConfirmed: db.workingTreeCleanConfirmed !== false,
      oldTemporaryPhase2137StashRemoved: db.oldTemporaryPhase2137StashRemoved !== false,
      oldUnrelatedStashesUntouched: db.oldUnrelatedStashesUntouched !== false,
      featureBranchRequired: db.featureBranchRequired !== false,
      draftPrRequired: db.draftPrRequired !== false,
      mergeAfterUserConfirmationOnly: db.mergeAfterUserConfirmationOnly !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Continue home PC work only from latest clean main, then use a feature branch and Draft PR for Phase21 follow-up work.",
      records: normalizedRecords
    };
  }

  function renderPostPr232PrivateLocalOperationStabilityCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr232PrivateLocalOperationStabilityCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-38-panel-status", safePanel.panelStatus);
      set("#phase21-38-status", safePanel.status);
      set("#phase21-38-baseline", safePanel.baseline);
      set("#phase21-38-total-checks", safePanel.totalChecks);
      set("#phase21-38-passed", safePanel.passed);
      set("#phase21-38-operation-policy", safePanel.operationPolicy);
      set("#phase21-38-stability-policy", safePanel.stabilityPolicy);
      set("#phase21-38-stash-policy", safePanel.stashPolicy);
      set("#phase21-38-security-policy", safePanel.securitySoftwarePolicy);
      set("#phase21-38-device-policy", safePanel.devicePolicy);
      set("#phase21-38-pr-merge-policy", safePanel.prMergePolicy);
      set("#phase21-38-plan-only", safePanel.planOnly);
      set("#phase21-38-protected", safePanel.protected);
      set("#phase21-38-private-repository", safePanel.privateRepository);
      set("#phase21-38-local-first", safePanel.localFirst);
      set("#phase21-38-pr232-merged", safePanel.pr232MergedConfirmationRequired);
      set("#phase21-38-phase21-37-main", safePanel.phase2137MainReflectionRequired);
      set("#phase21-38-home-main-latest", safePanel.homePcMainLatestConfirmed);
      set("#phase21-38-worktree-clean", safePanel.workingTreeCleanConfirmed);
      set("#phase21-38-temp-stash-removed", safePanel.oldTemporaryPhase2137StashRemoved);
      set("#phase21-38-unrelated-stashes-untouched", safePanel.oldUnrelatedStashesUntouched);
      set("#phase21-38-feature-branch", safePanel.featureBranchRequired);
      set("#phase21-38-draft-pr", safePanel.draftPrRequired);
      set("#phase21-38-merge-confirm", safePanel.mergeAfterUserConfirmationOnly);
      set("#phase21-38-no-pages", safePanel.githubPagesRequired);
      set("#phase21-38-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-38-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-38-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-38-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-38-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-38-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-38-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-38-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-38-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-38-no-bat", policy.batAllowed);
      set("#phase21-38-no-ps1", policy.ps1Allowed);
      set("#phase21-38-no-cmd", policy.cmdAllowed);
      set("#phase21-38-no-exe", policy.exeAllowed);
      set("#phase21-38-next-step", safePanel.nextRecommendedStep);
      set("#phase21-38-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-38-post-pr232-private-local-operation-stability-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-38-post-pr232-private-local-operation-stability-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-38-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-38-status");
      if (status) status.textContent = "PHASE21_38_POST_PR232_PRIVATE_LOCAL_STABILITY_RENDER_FALLBACK";
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

  async function runPostPr232PrivateLocalOperationStabilityCheckPanel(options = {}) {
    if (options.sources) return buildPostPr232PrivateLocalOperationStabilityCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr232PrivateLocalOperationStabilityCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr232PrivateLocalOperationStabilityCheckPanel(options = {}) {
    const panel = await runPostPr232PrivateLocalOperationStabilityCheckPanel(options);
    return renderPostPr232PrivateLocalOperationStabilityCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-38-post-pr232-private-local-operation-stability-check");
      if (button) button.addEventListener("click", () => runAndRenderPostPr232PrivateLocalOperationStabilityCheckPanel());
      if (document.querySelector("#phase21-38-post-pr232-private-local-operation-stability-check")) runAndRenderPostPr232PrivateLocalOperationStabilityCheckPanel();
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
    STABILITY_CHECKS,
    buildPostPr232PrivateLocalOperationStabilityCheckPanel,
    renderPostPr232PrivateLocalOperationStabilityCheckPanel,
    runPostPr232PrivateLocalOperationStabilityCheckPanel,
    runAndRenderPostPr232PrivateLocalOperationStabilityCheckPanel
  };
});
