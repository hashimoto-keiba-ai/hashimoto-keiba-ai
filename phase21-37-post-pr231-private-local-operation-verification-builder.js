(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2137PostPr231PrivateLocalOperationVerificationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-37";
  const CHECKLIST_NAME = "Post PR231 Private Local Operation Verification Checklist";
  const PANEL_STATUS = "phase21_37_post_pr231_private_local_operation_verification_plan_only";
  const STATUS = "PHASE21_37_POST_PR231_PRIVATE_LOCAL_OPERATION_VERIFICATION_READY";
  const DB_URL = "phase21-37-post-pr231-private-local-operation-verification-db.json";
  const SUMMARY_URL = "phase21-37-post-pr231-private-local-operation-verification-summary-db.json";
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
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const VERIFICATION_CHECKS = [
    { id: "P21-37-PR231-MERGED", label: "Confirm PR #231 is merged before treating main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-37-PHASE21-36-MAIN", label: "Confirm Phase21-36 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-37-COMPANY-CLEAN", label: "Confirm company PC working tree is clean before handoff.", command: "git status --short", status: "Required" },
    { id: "P21-37-HOME-READY", label: "Confirm home PC continuation is ready after pulling main.", command: "manual home PC confirmation", status: "Required" },
    { id: "P21-37-MAIN-AFTER-PULL", label: "Use main branch only after pull confirmation.", command: "manual branch confirmation", status: "Required" },
    { id: "P21-37-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-37-FEATURE-BRANCH", label: "Feature branch is required for follow-up work.", command: "feature branch", status: "Required" },
    { id: "P21-37-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-37-MERGE-CONFIRM", label: "Merge only after user confirmation.", command: "manual merge confirmation", status: "Required" },
    { id: "P21-37-PRIVATE-FIRST", label: "Private Local first remains required.", command: "private local", status: "Required" },
    { id: "P21-37-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-37-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-37-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-37-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-37-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-37-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-37-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-37-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-37-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-37-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-37-UNKNOWN",
      label: safe.label || "Manual Post PR231 Private Local operation verification",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPostPr231PrivateLocalOperationVerificationPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr231MergeChecks,
      db.handoffChecks,
      db.branchPrMergeChecks,
      db.privateLocalChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, VERIFICATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #231 merged main / Phase21-36 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #231 merged main / Phase21-36 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local first remains required after PR #231 main pull.",
      handoffPolicy: summary.handoffPolicy || db.handoffPolicy || "Company PC clean handoff and home PC continuation readiness are confirmed manually.",
      securitySoftwarePolicy: summary.securitySoftwarePolicy || db.securitySoftwarePolicy || "Security software friendly operation avoids auto-run, hidden updates, and suspicious launcher behavior.",
      devicePolicy: summary.devicePolicy || db.devicePolicy || "home PC continues operation; company PC confirms clean handoff; iPad is view/confirm only.",
      prMergePolicy: summary.prMergePolicy || db.prMergePolicy || "Feature branch and Draft PR are required; merge only after user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr231MergedConfirmationRequired: db.pr231MergedConfirmationRequired !== false,
      phase2136MainReflectionRequired: db.phase2136MainReflectionRequired !== false,
      companyPcWorkingTreeCleanRequired: db.companyPcWorkingTreeCleanRequired !== false,
      homePcContinuationReadyRequired: db.homePcContinuationReadyRequired !== false,
      mainBranchOnlyAfterPull: db.mainBranchOnlyAfterPull !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Pull main on home PC, confirm private-local.html and index.html locally, then start follow-up work only from a feature branch and Draft PR.",
      records: normalizedRecords
    };
  }

  function renderPostPr231PrivateLocalOperationVerificationPanel(panel, doc = document) {
    const safePanel = panel || buildPostPr231PrivateLocalOperationVerificationPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-37-panel-status", safePanel.panelStatus);
      set("#phase21-37-status", safePanel.status);
      set("#phase21-37-baseline", safePanel.baseline);
      set("#phase21-37-total-checks", safePanel.totalChecks);
      set("#phase21-37-passed", safePanel.passed);
      set("#phase21-37-operation-policy", safePanel.operationPolicy);
      set("#phase21-37-handoff-policy", safePanel.handoffPolicy);
      set("#phase21-37-security-policy", safePanel.securitySoftwarePolicy);
      set("#phase21-37-device-policy", safePanel.devicePolicy);
      set("#phase21-37-pr-merge-policy", safePanel.prMergePolicy);
      set("#phase21-37-plan-only", safePanel.planOnly);
      set("#phase21-37-protected", safePanel.protected);
      set("#phase21-37-private-repository", safePanel.privateRepository);
      set("#phase21-37-local-first", safePanel.localFirst);
      set("#phase21-37-pr231-merged", safePanel.pr231MergedConfirmationRequired);
      set("#phase21-37-phase21-36-main", safePanel.phase2136MainReflectionRequired);
      set("#phase21-37-company-clean", safePanel.companyPcWorkingTreeCleanRequired);
      set("#phase21-37-home-ready", safePanel.homePcContinuationReadyRequired);
      set("#phase21-37-main-after-pull", safePanel.mainBranchOnlyAfterPull);
      set("#phase21-37-feature-branch", safePanel.featureBranchRequired);
      set("#phase21-37-draft-pr", safePanel.draftPrRequired);
      set("#phase21-37-merge-confirm", safePanel.mergeAfterUserConfirmationOnly);
      set("#phase21-37-no-pages", safePanel.githubPagesRequired);
      set("#phase21-37-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-37-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-37-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-37-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-37-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-37-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-37-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-37-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-37-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-37-no-bat", policy.batAllowed);
      set("#phase21-37-no-ps1", policy.ps1Allowed);
      set("#phase21-37-no-cmd", policy.cmdAllowed);
      set("#phase21-37-no-exe", policy.exeAllowed);
      set("#phase21-37-next-step", safePanel.nextRecommendedStep);
      set("#phase21-37-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-37-post-pr231-private-local-operation-verification-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-37-post-pr231-private-local-operation-verification-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-37-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-37-status");
      if (status) status.textContent = "PHASE21_37_POST_PR231_PRIVATE_LOCAL_VERIFICATION_RENDER_FALLBACK";
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

  async function runPostPr231PrivateLocalOperationVerificationPanel(options = {}) {
    if (options.sources) return buildPostPr231PrivateLocalOperationVerificationPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPostPr231PrivateLocalOperationVerificationPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPostPr231PrivateLocalOperationVerificationPanel(options = {}) {
    const panel = await runPostPr231PrivateLocalOperationVerificationPanel(options);
    return renderPostPr231PrivateLocalOperationVerificationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-37-post-pr231-private-local-operation-verification");
      if (button) button.addEventListener("click", () => runAndRenderPostPr231PrivateLocalOperationVerificationPanel());
      if (document.querySelector("#phase21-37-post-pr231-private-local-operation-verification")) runAndRenderPostPr231PrivateLocalOperationVerificationPanel();
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
    VERIFICATION_CHECKS,
    buildPostPr231PrivateLocalOperationVerificationPanel,
    renderPostPr231PrivateLocalOperationVerificationPanel,
    runPostPr231PrivateLocalOperationVerificationPanel,
    runAndRenderPostPr231PrivateLocalOperationVerificationPanel
  };
});
