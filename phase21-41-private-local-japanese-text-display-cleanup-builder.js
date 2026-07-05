(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2141PrivateLocalJapaneseTextDisplayCleanupBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-41";
  const CHECKLIST_NAME = "Private Local Japanese Text Display Cleanup Checklist";
  const PANEL_STATUS = "phase21_41_private_local_japanese_text_display_cleanup_plan_only";
  const STATUS = "PHASE21_41_PRIVATE_LOCAL_JAPANESE_TEXT_DISPLAY_CLEANUP_READY";
  const DB_URL = "phase21-41-private-local-japanese-text-display-cleanup-db.json";
  const SUMMARY_URL = "phase21-41-private-local-japanese-text-display-cleanup-summary-db.json";
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

  const CLEANUP_CHECKS = [
    { id: "P21-41-PR235-MERGED", label: "Confirm PR #235 is merged before treating main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-41-PHASE21-40-MAIN", label: "Confirm Phase21-40 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-41-HOME-APP-REFLECTION", label: "Confirm home PC app reflection before text cleanup review.", command: "manual app display confirmation", status: "Required" },
    { id: "P21-41-JA-ISSUE-OBSERVED", label: "Japanese text display issue is observed in Private Local app review.", command: "manual display review", status: "Required" },
    { id: "P21-41-MOJIBAKE-CLEANUP", label: "Mojibake cleanup is limited to visible labels and descriptions.", command: "text-only cleanup", status: "Required" },
    { id: "P21-41-PRIVATE-LOCAL-REVIEW", label: "private-local.html text review is required.", command: "private-local.html", status: "Required" },
    { id: "P21-41-INDEX-REVIEW", label: "index.html text review is required.", command: "index.html", status: "Required" },
    { id: "P21-41-README-REVIEW", label: "README text review is required.", command: "README.md", status: "Required" },
    { id: "P21-41-PANEL-LABEL-REVIEW", label: "Phase21 panel label review is required.", command: "Phase21 panels", status: "Required" },
    { id: "P21-41-NO-BEHAVIOR-CHANGE", label: "No functional behavior change is allowed.", command: "display text only", status: "Required" },
    { id: "P21-41-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-41-FEATURE-BRANCH", label: "Feature branch is required for follow-up work.", command: "feature branch", status: "Required" },
    { id: "P21-41-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-41-MERGE-CONFIRM", label: "Merge only after user confirmation.", command: "manual merge confirmation", status: "Required" },
    { id: "P21-41-PRIVATE-FIRST", label: "Private Local first remains required.", command: "private local", status: "Required" },
    { id: "P21-41-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-41-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-41-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-41-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-41-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-41-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-41-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-41-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-41-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-41-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" },
    { id: "P21-41-STASHES-UNTOUCHED", label: "Old unrelated stashes remain untouched.", command: "manual stash preservation confirmation", status: "Required" },
    { id: "P21-41-BRANCH-DELETE-CONFIRM", label: "Branch deletion is allowed only after merge confirmation.", command: "manual branch deletion confirmation", status: "Required" },
    { id: "P21-41-MAIN-SYNC-AFTER-MERGE", label: "Main sync is required after merge.", command: "manual main sync confirmation", status: "Required" }
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
      id: safe.id || "P21-41-UNKNOWN",
      label: safe.label || "Manual Japanese text display cleanup confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalJapaneseTextDisplayCleanupPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr235MergeChecks,
      db.japaneseTextReviewChecks,
      db.textCleanupScopeChecks,
      db.pendingTextCleanup,
      db.branchPrMergeChecks,
      db.privateLocalChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, CLEANUP_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #235 merged main / Phase21-40 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #235 merged main / Phase21-40 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.filter((record) => record.status !== "Pending").length),
      pending: Number(summary.pending || normalizedRecords.filter((record) => record.status === "Pending").length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local first remains required while visible Japanese text is reviewed.",
      cleanupPolicy: summary.cleanupPolicy || db.cleanupPolicy || "Only clear visible mojibake or unnatural labels are cleaned up; unclear text remains pending.",
      textScopePolicy: summary.textScopePolicy || db.textScopePolicy || "Display labels and descriptions may change; ids, links, anchors, paths, scripts, DB structure, builder structure, and tests remain stable.",
      pendingPolicy: summary.pendingPolicy || db.pendingPolicy || "Text whose meaning cannot be inferred safely is recorded as pending.",
      securitySoftwarePolicy: summary.securitySoftwarePolicy || db.securitySoftwarePolicy || "Security software friendly operation avoids auto-run, hidden updates, and suspicious launcher behavior.",
      prMergePolicy: summary.prMergePolicy || db.prMergePolicy || "Feature branch and Draft PR are required; merge only after user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      cleanedTextChanges: listOrDefault(db.cleanedTextChanges, summary.cleanedTextChanges || []),
      pendingTextCleanup: listOrDefault(db.pendingTextCleanup, summary.pendingTextCleanup || []),
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr235MergedConfirmationRequired: db.pr235MergedConfirmationRequired !== false,
      phase2140MainReflectionRequired: db.phase2140MainReflectionRequired !== false,
      homePcAppReflectionConfirmed: db.homePcAppReflectionConfirmed !== false,
      japaneseTextDisplayIssueObserved: db.japaneseTextDisplayIssueObserved !== false,
      mojibakeCleanupRequired: db.mojibakeCleanupRequired !== false,
      noFunctionalBehaviorChange: db.noFunctionalBehaviorChange !== false,
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
      oldUnrelatedStashesUntouched: db.oldUnrelatedStashesUntouched !== false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm private-local.html and index.html locally, then continue text cleanup only as visible display wording review.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalJapaneseTextDisplayCleanupPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalJapaneseTextDisplayCleanupPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-41-panel-status", safePanel.panelStatus);
      set("#phase21-41-status", safePanel.status);
      set("#phase21-41-baseline", safePanel.baseline);
      set("#phase21-41-total-checks", safePanel.totalChecks);
      set("#phase21-41-passed", safePanel.passed);
      set("#phase21-41-pending", safePanel.pending);
      set("#phase21-41-operation-policy", safePanel.operationPolicy);
      set("#phase21-41-cleanup-policy", safePanel.cleanupPolicy);
      set("#phase21-41-text-scope-policy", safePanel.textScopePolicy);
      set("#phase21-41-pending-policy", safePanel.pendingPolicy);
      set("#phase21-41-security-policy", safePanel.securitySoftwarePolicy);
      set("#phase21-41-pr-merge-policy", safePanel.prMergePolicy);
      set("#phase21-41-plan-only", safePanel.planOnly);
      set("#phase21-41-protected", safePanel.protected);
      set("#phase21-41-private-repository", safePanel.privateRepository);
      set("#phase21-41-local-first", safePanel.localFirst);
      set("#phase21-41-pr235-merged", safePanel.pr235MergedConfirmationRequired);
      set("#phase21-41-phase21-40-main", safePanel.phase2140MainReflectionRequired);
      set("#phase21-41-home-app-reflection", safePanel.homePcAppReflectionConfirmed);
      set("#phase21-41-ja-issue-observed", safePanel.japaneseTextDisplayIssueObserved);
      set("#phase21-41-mojibake-cleanup", safePanel.mojibakeCleanupRequired);
      set("#phase21-41-no-behavior-change", safePanel.noFunctionalBehaviorChange);
      set("#phase21-41-feature-branch", safePanel.featureBranchRequired);
      set("#phase21-41-draft-pr", safePanel.draftPrRequired);
      set("#phase21-41-merge-confirm", safePanel.mergeAfterUserConfirmationOnly);
      set("#phase21-41-branch-delete-confirm", safePanel.branchDeletionOnlyAfterMergeConfirmation);
      set("#phase21-41-main-sync-after-merge", safePanel.mainSyncRequiredAfterMerge);
      set("#phase21-41-no-pages", safePanel.githubPagesRequired);
      set("#phase21-41-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-41-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-41-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-41-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-41-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-41-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-41-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-41-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-41-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-41-unrelated-stashes-untouched", safePanel.oldUnrelatedStashesUntouched);
      set("#phase21-41-no-bat", policy.batAllowed);
      set("#phase21-41-no-ps1", policy.ps1Allowed);
      set("#phase21-41-no-cmd", policy.cmdAllowed);
      set("#phase21-41-no-exe", policy.exeAllowed);
      set("#phase21-41-next-step", safePanel.nextRecommendedStep);
      set("#phase21-41-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-41-private-local-japanese-text-display-cleanup-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-41-private-local-japanese-text-display-cleanup-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-41-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-41-status");
      if (status) status.textContent = "PHASE21_41_JAPANESE_TEXT_DISPLAY_CLEANUP_RENDER_FALLBACK";
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

  async function runPrivateLocalJapaneseTextDisplayCleanupPanel(options = {}) {
    if (options.sources) return buildPrivateLocalJapaneseTextDisplayCleanupPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalJapaneseTextDisplayCleanupPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalJapaneseTextDisplayCleanupPanel(options = {}) {
    const panel = await runPrivateLocalJapaneseTextDisplayCleanupPanel(options);
    return renderPrivateLocalJapaneseTextDisplayCleanupPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-41-private-local-japanese-text-display-cleanup");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalJapaneseTextDisplayCleanupPanel());
      if (document.querySelector("#phase21-41-private-local-japanese-text-display-cleanup")) runAndRenderPrivateLocalJapaneseTextDisplayCleanupPanel();
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
    CLEANUP_CHECKS,
    buildPrivateLocalJapaneseTextDisplayCleanupPanel,
    renderPrivateLocalJapaneseTextDisplayCleanupPanel,
    runPrivateLocalJapaneseTextDisplayCleanupPanel,
    runAndRenderPrivateLocalJapaneseTextDisplayCleanupPanel
  };
});
