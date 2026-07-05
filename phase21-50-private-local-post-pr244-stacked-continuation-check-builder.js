(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2150PrivateLocalPostPr244StackedContinuationCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-50";
  const CHECKLIST_NAME = "Private Local Post PR244 Stacked Continuation Check";
  const PANEL_STATUS = "phase21_50_private_local_post_pr244_stacked_continuation_check_plan_only";
  const STATUS = "PHASE21_50_PRIVATE_LOCAL_POST_PR244_STACKED_CONTINUATION_CHECK_READY";
  const DB_URL = "phase21-50-private-local-post-pr244-stacked-continuation-check-db.json";
  const SUMMARY_URL = "phase21-50-private-local-post-pr244-stacked-continuation-check-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    automaticRemotePublishAllowed: false,
    automaticMergeAllowed: false,
    hiddenBackgroundUpdateAllowed: false,
    automaticUpdateAllowed: false,
    externalSendAllowed: false,
    deletionProcessAllowed: false,
    credentialOutputAllowed: false,
    readyForReviewAllowed: false,
    mergeAllowed: false,
    prCreationAllowed: false,
    suspiciousAutoRunScriptAllowed: false,
    unnecessaryPublicRouteAllowed: false,
    launcherFileChangeAllowed: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const OPERATION_CHECKS = [
    { id: "P21-50-DRAFT-PR243-STAYS-DRAFT", label: "Draft PR #243 remains Draft before the next work starts.", command: "manual Draft PR confirmation", status: "Required" },
    { id: "P21-50-DRAFT-PR244-STAYS-DRAFT", label: "Draft PR #244 remains Draft before the next work starts.", command: "manual Draft PR confirmation", status: "Required" },
    { id: "P21-50-PR244-BASE-PHASE21-48", label: "Draft PR #244 is based on the Phase21-48 branch.", command: "manual base branch confirmation", status: "Required" },
    { id: "P21-50-NO-READY-FOR-REVIEW", label: "Ready for review is not performed for Draft PR #243 or Draft PR #244.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-MERGE", label: "Merge is not performed for Draft PR #243 or Draft PR #244.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-NEW-PR", label: "No new PR is created by this Phase21-50 operation.", command: "blocked", status: "Blocked" },
    { id: "P21-50-PHASE21-49-FLOW", label: "Phase21-49 Private Local / Japanese display / operation routes / README record flow is maintained.", command: "manual flow confirmation", status: "Required" },
    { id: "P21-50-PHASE21-41-JA-CONTINUITY", label: "Confirm Phase21-41 Japanese text display cleanup continuity remains visible.", command: "local display confirmation", status: "Required" },
    { id: "P21-50-PRIVATE-LOCAL", label: "Private Local operation remains the primary operation mode.", command: "private-local.html", status: "Required" },
    { id: "P21-50-OPERATION-CONSISTENCY", label: "Normal operation consistency remains manual, private, and local only.", command: "manual normal operation confirmation", status: "Required" },
    { id: "P21-50-OPERATION-ROUTES", label: "Operation routes in index.html and private-local.html remain consistent.", command: "manual route confirmation", status: "Required" },
    { id: "P21-50-README-RECORD", label: "README operation record remains consistent with the local panels.", command: "manual README confirmation", status: "Required" },
    { id: "P21-50-SAFE-LOCAL", label: "Safe local use remains manual and local only.", command: "manual confirmation", status: "Required" },
    { id: "P21-50-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-50-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-50-JA-DISPLAY", label: "Japanese text display continuity is confirmed after Phase21-49.", command: "local browser confirmation", status: "Required" },
    { id: "P21-50-PLAN-ONLY", label: "PLAN_ONLY / protected / draft PR only / do not merge yet remains active.", command: "manual PR policy", status: "Required" },
    { id: "P21-50-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-50-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-50-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-EXTERNAL-SEND", label: "No external sending is added.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-DELETION-PROCESS", label: "No deletion process is added.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-CREDENTIAL-OUTPUT", label: "No credential output is added.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-PUBLIC-ROUTE", label: "No unnecessary public Pages route is added.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-50-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-50-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-50-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-50-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-50-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-50-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-50-UNKNOWN",
      label: safe.label || "Manual Private Local post PR244 stacked continuation confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalPostPr244StackedContinuationCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr244StackedContinuationChecks,
      db.privateLocalOperationChecks,
      db.japaneseTextDisplayContinuityChecks,
      db.prPolicyChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, OPERATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "Draft PR #243 and Draft PR #244 remain Draft / PR #244 base is Phase21-48 branch",
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
      baseline: summary.baseline || db.baseline || "Draft PR #243 and Draft PR #244 remain Draft / PR #244 base is Phase21-48 branch",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, private, and local while Draft PR #243 and Draft PR #244 stay Draft.",
      safeLocalUsePolicy: summary.safeLocalUsePolicy || db.safeLocalUsePolicy || "Safe local use requires local browser confirmation, no public Pages requirement, and no suspicious automation.",
      japaneseTextContinuityPolicy: summary.japaneseTextContinuityPolicy || db.japaneseTextContinuityPolicy || "Japanese text display continuity from Phase21-41 through Phase21-49 remains visible and stable.",
      prPolicy: summary.prPolicy || db.prPolicy || "PLAN_ONLY / protected / draft PR only / do not merge yet remains active; Ready for review and merge are not performed.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      draftPrOnly: db.draftPrOnly !== false,
      doNotMergeYet: db.doNotMergeYet !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      draftPr243RemainsDraft: db.draftPr243RemainsDraft !== false,
      draftPr244RemainsDraft: db.draftPr244RemainsDraft !== false,
      pr244BasePhase2148BranchConfirmed: db.pr244BasePhase2148BranchConfirmed !== false,
      readyForReviewAllowed: false,
      readyForReviewPerformed: false,
      mergeAllowed: false,
      mergePerformed: false,
      prCreationAllowed: false,
      prCreationPerformed: false,
      phase2149FlowMaintained: db.phase2149FlowMaintained !== false,
      phase2148FlowMaintained: db.phase2148FlowMaintained !== false,
      phase2141JapaneseTextContinuityConfirmed: db.phase2141JapaneseTextContinuityConfirmed !== false,
      privateLocalOperationConfirmed: db.privateLocalOperationConfirmed !== false,
      operationRouteConsistencyConfirmed: db.operationRouteConsistencyConfirmed !== false,
      readmeRecordConsistencyConfirmed: db.readmeRecordConsistencyConfirmed !== false,
      japaneseTextDisplayContinuityConfirmed: db.japaneseTextDisplayContinuityConfirmed !== false,
      safeLocalUseConfirmed: db.safeLocalUseConfirmed !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      autoExecutionAllowed: false,
      automaticUpdateAllowed: false,
      hiddenBackgroundUpdateAllowed: false,
      suspiciousAutoRunScriptAllowed: false,
      unnecessaryPublicRouteAllowed: false,
      deletionProcessAllowed: false,
      credentialOutputAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      ipadViewConfirmOnly: db.ipadViewConfirmOnly !== false,
      powerShellManualOnly: db.powerShellManualOnly !== false,
      localBrowserConfirmationRequired: db.localBrowserConfirmationRequired !== false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Keep Draft PR #243 and Draft PR #244 as Draft, confirm private-local.html and index.html locally, then continue the next work without Ready for review or merge.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalPostPr244StackedContinuationCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalPostPr244StackedContinuationCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-50-panel-status", safePanel.panelStatus);
      set("#phase21-50-status", safePanel.status);
      set("#phase21-50-baseline", safePanel.baseline);
      set("#phase21-50-total-checks", safePanel.totalChecks);
      set("#phase21-50-passed", safePanel.passed);
      set("#phase21-50-operation-policy", safePanel.operationPolicy);
      set("#phase21-50-safe-local-use-policy", safePanel.safeLocalUsePolicy);
      set("#phase21-50-japanese-text-continuity-policy", safePanel.japaneseTextContinuityPolicy);
      set("#phase21-50-pr-policy", safePanel.prPolicy);
      set("#phase21-50-plan-only", safePanel.planOnly);
      set("#phase21-50-protected", safePanel.protected);
      set("#phase21-50-draft-pr-only", safePanel.draftPrOnly);
      set("#phase21-50-do-not-merge-yet", safePanel.doNotMergeYet);
      set("#phase21-50-private-repository", safePanel.privateRepository);
      set("#phase21-50-local-first", safePanel.localFirst);
      set("#phase21-50-draft-pr243", safePanel.draftPr243RemainsDraft);
      set("#phase21-50-draft-pr244", safePanel.draftPr244RemainsDraft);
      set("#phase21-50-pr244-base", safePanel.pr244BasePhase2148BranchConfirmed);
      set("#phase21-50-ready-for-review", safePanel.readyForReviewPerformed);
      set("#phase21-50-merge", safePanel.mergePerformed);
      set("#phase21-50-pr-creation", safePanel.prCreationPerformed);
      set("#phase21-50-phase21-49-flow", safePanel.phase2149FlowMaintained);
      set("#phase21-50-phase21-48-flow", safePanel.phase2148FlowMaintained);
      set("#phase21-50-phase21-41-ja-continuity", safePanel.phase2141JapaneseTextContinuityConfirmed);
      set("#phase21-50-private-local-confirmed", safePanel.privateLocalOperationConfirmed);
      set("#phase21-50-operation-route-consistency-confirmed", safePanel.operationRouteConsistencyConfirmed);
      set("#phase21-50-readme-record-consistency-confirmed", safePanel.readmeRecordConsistencyConfirmed);
      set("#phase21-50-japanese-text-continuity-confirmed", safePanel.japaneseTextDisplayContinuityConfirmed);
      set("#phase21-50-safe-local-confirmed", safePanel.safeLocalUseConfirmed);
      set("#phase21-50-no-pages", safePanel.githubPagesRequired);
      set("#phase21-50-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-50-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-50-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-50-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-50-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-50-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-50-no-public-route", safePanel.unnecessaryPublicRouteAllowed);
      set("#phase21-50-no-deletion-process", safePanel.deletionProcessAllowed);
      set("#phase21-50-no-credential-output", safePanel.credentialOutputAllowed);
      set("#phase21-50-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-50-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-50-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-50-no-bat", policy.batAllowed);
      set("#phase21-50-no-ps1", policy.ps1Allowed);
      set("#phase21-50-no-cmd", policy.cmdAllowed);
      set("#phase21-50-no-exe", policy.exeAllowed);
      set("#phase21-50-next-step", safePanel.nextRecommendedStep);
      set("#phase21-50-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-50-private-local-post-pr244-stacked-continuation-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-50-private-local-post-pr244-stacked-continuation-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-50-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-50-status");
      if (status) status.textContent = "PHASE21_50_PRIVATE_LOCAL_POST_PR244_RENDER_FALLBACK";
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

  async function runPrivateLocalPostPr244StackedContinuationCheckPanel(options = {}) {
    if (options.sources) return buildPrivateLocalPostPr244StackedContinuationCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalPostPr244StackedContinuationCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalPostPr244StackedContinuationCheckPanel(options = {}) {
    const panel = await runPrivateLocalPostPr244StackedContinuationCheckPanel(options);
    return renderPrivateLocalPostPr244StackedContinuationCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-50-private-local-post-pr244-stacked-continuation-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr244StackedContinuationCheckPanel());
      if (document.querySelector("#phase21-50-private-local-post-pr244-stacked-continuation-check")) runAndRenderPrivateLocalPostPr244StackedContinuationCheckPanel();
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
    OPERATION_CHECKS,
    buildPrivateLocalPostPr244StackedContinuationCheckPanel,
    renderPrivateLocalPostPr244StackedContinuationCheckPanel,
    runPrivateLocalPostPr244StackedContinuationCheckPanel,
    runAndRenderPrivateLocalPostPr244StackedContinuationCheckPanel
  };
});
