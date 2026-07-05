(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2139PostPr233PrivateLocalOperationContinuityCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-39";
  const CHECKLIST_NAME = "Post PR233 Private Local Operation Continuity Check";
  const PANEL_STATUS = "phase21_39_post_pr233_private_local_operation_continuity_check_plan_only";
  const STATUS = "PHASE21_39_POST_PR233_PRIVATE_LOCAL_OPERATION_CONTINUITY_CHECK_READY";
  const DB_URL = "phase21-39-post-pr233-private-local-operation-continuity-check-db.json";
  const SUMMARY_URL = "phase21-39-post-pr233-private-local-operation-continuity-check-summary-db.json";
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

  const CONTINUITY_CHECKS = [
    { id: "P21-39-PR233-MERGED", label: "Confirm PR #233 is merged before treating main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-39-PHASE21-38-MAIN", label: "Confirm Phase21-38 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-39-HOME-MAIN-LATEST", label: "Confirm home PC main branch is latest before the next Phase.", command: "manual latest main confirmation", status: "Required" },
    { id: "P21-39-WORKTREE-CLEAN", label: "Confirm working tree is clean before the next Phase.", command: "git status --short", status: "Required" },
    { id: "P21-39-CLEAN-MAIN-START", label: "Confirm Phase21-39 starts from clean main.", command: "manual clean main confirmation", status: "Required" },
    { id: "P21-39-UNRELATED-STASHES-UNTOUCHED", label: "Confirm old unrelated stashes remain untouched.", command: "manual stash preservation confirmation", status: "Required" },
    { id: "P21-39-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-39-FEATURE-BRANCH", label: "Feature branch is required for follow-up work.", command: "feature branch", status: "Required" },
    { id: "P21-39-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-39-MERGE-CONFIRM", label: "Merge only after user confirmation.", command: "manual merge confirmation", status: "Required" },
    { id: "P21-39-PRIVATE-FIRST", label: "Private Local first remains required.", command: "private local", status: "Required" },
    { id: "P21-39-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-39-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-39-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-39-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-39-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-39-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-39-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-39-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-39-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-39-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-39-UNKNOWN",
      label: safe.label || "Manual Post PR233 Private Local operation continuity confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr233PrivateLocalOperationContinuityCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr233MergeChecks,
      db.homePcContinuityChecks,
      db.cleanMainStartChecks,
      db.stashSafetyChecks,
      db.branchPrMergeChecks,
      db.privateLocalChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, CONTINUITY_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #233 merged main / Phase21-38 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #233 merged main / Phase21-38 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local first remains required after PR #233 main pull.",
      continuityPolicy: summary.continuityPolicy || db.continuityPolicy || "Home PC continues only after latest main and clean working tree are confirmed.",
      cleanMainPolicy: summary.cleanMainPolicy || db.cleanMainPolicy || "Phase21-39 starts from clean main before moving to the next Phase.",
      stashPolicy: summary.stashPolicy || db.stashPolicy || "Old unrelated stashes remain untouched.",
      securitySoftwarePolicy: summary.securitySoftwarePolicy || db.securitySoftwarePolicy || "Security software friendly operation avoids auto-run, hidden updates, and suspicious launcher behavior.",
      devicePolicy: summary.devicePolicy || db.devicePolicy || "home PC continues stable local operation; iPad is view/confirm only.",
      prMergePolicy: summary.prMergePolicy || db.prMergePolicy || "Feature branch and Draft PR are required; merge only after user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr233MergedConfirmationRequired: db.pr233MergedConfirmationRequired !== false,
      phase2138MainReflectionRequired: db.phase2138MainReflectionRequired !== false,
      homePcMainLatestConfirmed: db.homePcMainLatestConfirmed !== false,
      workingTreeCleanConfirmed: db.workingTreeCleanConfirmed !== false,
      phase2139StartsFromCleanMain: db.phase2139StartsFromCleanMain !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Proceed to the next Phase only after PR #233 main latest, clean working tree, and local browser confirmation are complete.",
      records: normalizedRecords
    };
  }

  function renderPostPr233PrivateLocalOperationContinuityCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr233PrivateLocalOperationContinuityCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-39-panel-status", safePanel.panelStatus);
      set("#phase21-39-status", safePanel.status);
      set("#phase21-39-baseline", safePanel.baseline);
      set("#phase21-39-total-checks", safePanel.totalChecks);
      set("#phase21-39-passed", safePanel.passed);
      set("#phase21-39-operation-policy", safePanel.operationPolicy);
      set("#phase21-39-continuity-policy", safePanel.continuityPolicy);
      set("#phase21-39-clean-main-policy", safePanel.cleanMainPolicy);
      set("#phase21-39-stash-policy", safePanel.stashPolicy);
      set("#phase21-39-security-policy", safePanel.securitySoftwarePolicy);
      set("#phase21-39-device-policy", safePanel.devicePolicy);
      set("#phase21-39-pr-merge-policy", safePanel.prMergePolicy);
      set("#phase21-39-plan-only", safePanel.planOnly);
      set("#phase21-39-protected", safePanel.protected);
      set("#phase21-39-private-repository", safePanel.privateRepository);
      set("#phase21-39-local-first", safePanel.localFirst);
      set("#phase21-39-pr233-merged", safePanel.pr233MergedConfirmationRequired);
      set("#phase21-39-phase21-38-main", safePanel.phase2138MainReflectionRequired);
      set("#phase21-39-home-main-latest", safePanel.homePcMainLatestConfirmed);
      set("#phase21-39-worktree-clean", safePanel.workingTreeCleanConfirmed);
      set("#phase21-39-clean-main-start", safePanel.phase2139StartsFromCleanMain);
      set("#phase21-39-unrelated-stashes-untouched", safePanel.oldUnrelatedStashesUntouched);
      set("#phase21-39-feature-branch", safePanel.featureBranchRequired);
      set("#phase21-39-draft-pr", safePanel.draftPrRequired);
      set("#phase21-39-merge-confirm", safePanel.mergeAfterUserConfirmationOnly);
      set("#phase21-39-no-pages", safePanel.githubPagesRequired);
      set("#phase21-39-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-39-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-39-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-39-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-39-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-39-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-39-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-39-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-39-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-39-no-bat", policy.batAllowed);
      set("#phase21-39-no-ps1", policy.ps1Allowed);
      set("#phase21-39-no-cmd", policy.cmdAllowed);
      set("#phase21-39-no-exe", policy.exeAllowed);
      set("#phase21-39-next-step", safePanel.nextRecommendedStep);
      set("#phase21-39-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-39-post-pr233-private-local-operation-continuity-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-39-post-pr233-private-local-operation-continuity-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-39-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-39-status");
      if (status) status.textContent = "PHASE21_39_POST_PR233_PRIVATE_LOCAL_CONTINUITY_RENDER_FALLBACK";
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

  async function runPostPr233PrivateLocalOperationContinuityCheckPanel(options = {}) {
    if (options.sources) return buildPostPr233PrivateLocalOperationContinuityCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr233PrivateLocalOperationContinuityCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr233PrivateLocalOperationContinuityCheckPanel(options = {}) {
    const panel = await runPostPr233PrivateLocalOperationContinuityCheckPanel(options);
    return renderPostPr233PrivateLocalOperationContinuityCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-39-post-pr233-private-local-operation-continuity-check");
      if (button) button.addEventListener("click", () => runAndRenderPostPr233PrivateLocalOperationContinuityCheckPanel());
      if (document.querySelector("#phase21-39-post-pr233-private-local-operation-continuity-check")) runAndRenderPostPr233PrivateLocalOperationContinuityCheckPanel();
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
    CONTINUITY_CHECKS,
    buildPostPr233PrivateLocalOperationContinuityCheckPanel,
    renderPostPr233PrivateLocalOperationContinuityCheckPanel,
    runPostPr233PrivateLocalOperationContinuityCheckPanel,
    runAndRenderPostPr233PrivateLocalOperationContinuityCheckPanel
  };
});
