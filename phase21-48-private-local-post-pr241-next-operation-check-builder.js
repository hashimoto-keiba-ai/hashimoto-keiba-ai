(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2148PrivateLocalPostPr241NextOperationCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-48";
  const CHECKLIST_NAME = "Private Local Post PR241 Next Operation Check";
  const PANEL_STATUS = "phase21_48_private_local_post_pr241_next_operation_check_plan_only";
  const STATUS = "PHASE21_48_PRIVATE_LOCAL_POST_PR241_NEXT_OPERATION_CHECK_READY";
  const DB_URL = "phase21-48-private-local-post-pr241-next-operation-check-db.json";
  const SUMMARY_URL = "phase21-48-private-local-post-pr241-next-operation-check-summary-db.json";
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
    suspiciousAutoRunScriptAllowed: false,
    unnecessaryPublicRouteAllowed: false,
    launcherFileChangeAllowed: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const OPERATION_CHECKS = [
    { id: "P21-48-PR241-MERGED", label: "Confirm PR #241 is merged before using main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-48-PHASE21-46-MAIN", label: "Confirm Phase21-46 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-48-PHASE21-41-JA-CONTINUITY", label: "Confirm Phase21-41 Japanese text display cleanup continuity remains visible.", command: "local display confirmation", status: "Required" },
    { id: "P21-48-PRIVATE-LOCAL", label: "Private Local operation remains the primary operation mode.", command: "private-local.html", status: "Required" },
    { id: "P21-48-OPERATION-CONSISTENCY", label: "Normal operation consistency remains manual, private, and local only.", command: "manual normal operation confirmation", status: "Required" },
    { id: "P21-48-INTEGRITY-CONTINUITY", label: "Operation integrity continuity from Phase21-46 remains confirmed.", command: "manual integrity continuity confirmation", status: "Required" },
    { id: "P21-48-OPERATION-ROUTES", label: "Operation routes in index.html and private-local.html remain consistent.", command: "manual route confirmation", status: "Required" },
    { id: "P21-48-README-RECORD", label: "README operation record remains consistent with the local panels.", command: "manual README confirmation", status: "Required" },
    { id: "P21-48-SAFE-LOCAL", label: "Safe local use remains manual and local only.", command: "manual confirmation", status: "Required" },
    { id: "P21-48-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-48-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-48-JA-DISPLAY", label: "Japanese text display continuity is confirmed after Phase21-46.", command: "local browser confirmation", status: "Required" },
    { id: "P21-48-PLAN-ONLY", label: "PLAN_ONLY / protected / draft PR only / do not merge yet remains active.", command: "manual PR policy", status: "Required" },
    { id: "P21-48-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-48-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-48-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-48-NO-PUBLIC-ROUTE", label: "No unnecessary public Pages route is added.", command: "blocked", status: "Blocked" },
    { id: "P21-48-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-48-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-48-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-48-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-48-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-48-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-48-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-48-UNKNOWN",
      label: safe.label || "Manual Private Local post PR241 normal operation consistency confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalPostPr241NextOperationCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr241MergeChecks,
      db.privateLocalOperationChecks,
      db.japaneseTextDisplayContinuityChecks,
      db.prPolicyChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, OPERATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #241 merged main / Phase21-46 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #241 merged main / Phase21-46 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, private, and local after PR #241.",
      safeLocalUsePolicy: summary.safeLocalUsePolicy || db.safeLocalUsePolicy || "Safe local use and normal operation consistency require local browser confirmation and no public Pages requirement.",
      japaneseTextContinuityPolicy: summary.japaneseTextContinuityPolicy || db.japaneseTextContinuityPolicy || "Japanese text display cleanup from Phase21-41 remains visible and stable through Phase21-46.",
      prPolicy: summary.prPolicy || db.prPolicy || "PLAN_ONLY / protected / draft PR only / do not merge yet remains active.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      draftPrOnly: db.draftPrOnly !== false,
      doNotMergeYet: db.doNotMergeYet !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr241MergedConfirmationRequired: db.pr241MergedConfirmationRequired !== false,
      phase2146MainReflectionRequired: db.phase2146MainReflectionRequired !== false,
      phase2141JapaneseTextContinuityConfirmed: db.phase2141JapaneseTextContinuityConfirmed !== false,
      privateLocalOperationConfirmed: db.privateLocalOperationConfirmed !== false,
      normalOperationConsistencyConfirmed: db.normalOperationConsistencyConfirmed !== false,
      operationIntegrityContinuityConfirmed: db.operationIntegrityContinuityConfirmed !== false,
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
      dangerousLauncherExtensionsAdded: false,
      ipadViewConfirmOnly: db.ipadViewConfirmOnly !== false,
      powerShellManualOnly: db.powerShellManualOnly !== false,
      localBrowserConfirmationRequired: db.localBrowserConfirmationRequired !== false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm private-local.html and index.html locally after PR #241, then keep follow-up work as Draft PR only.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalPostPr241NextOperationCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalPostPr241NextOperationCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-48-panel-status", safePanel.panelStatus);
      set("#phase21-48-status", safePanel.status);
      set("#phase21-48-baseline", safePanel.baseline);
      set("#phase21-48-total-checks", safePanel.totalChecks);
      set("#phase21-48-passed", safePanel.passed);
      set("#phase21-48-operation-policy", safePanel.operationPolicy);
      set("#phase21-48-safe-local-use-policy", safePanel.safeLocalUsePolicy);
      set("#phase21-48-japanese-text-continuity-policy", safePanel.japaneseTextContinuityPolicy);
      set("#phase21-48-pr-policy", safePanel.prPolicy);
      set("#phase21-48-plan-only", safePanel.planOnly);
      set("#phase21-48-protected", safePanel.protected);
      set("#phase21-48-draft-pr-only", safePanel.draftPrOnly);
      set("#phase21-48-do-not-merge-yet", safePanel.doNotMergeYet);
      set("#phase21-48-private-repository", safePanel.privateRepository);
      set("#phase21-48-local-first", safePanel.localFirst);
      set("#phase21-48-pr241-merged", safePanel.pr241MergedConfirmationRequired);
      set("#phase21-48-phase21-46-main", safePanel.phase2146MainReflectionRequired);
      set("#phase21-48-phase21-41-ja-continuity", safePanel.phase2141JapaneseTextContinuityConfirmed);
      set("#phase21-48-private-local-confirmed", safePanel.privateLocalOperationConfirmed);
      set("#phase21-48-normal-operation-consistency-confirmed", safePanel.normalOperationConsistencyConfirmed);
      set("#phase21-48-operation-integrity-continuity-confirmed", safePanel.operationIntegrityContinuityConfirmed);
      set("#phase21-48-operation-route-consistency-confirmed", safePanel.operationRouteConsistencyConfirmed);
      set("#phase21-48-readme-record-consistency-confirmed", safePanel.readmeRecordConsistencyConfirmed);
      set("#phase21-48-japanese-text-continuity-confirmed", safePanel.japaneseTextDisplayContinuityConfirmed);
      set("#phase21-48-safe-local-confirmed", safePanel.safeLocalUseConfirmed);
      set("#phase21-48-no-pages", safePanel.githubPagesRequired);
      set("#phase21-48-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-48-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-48-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-48-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-48-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-48-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-48-no-public-route", safePanel.unnecessaryPublicRouteAllowed);
      set("#phase21-48-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-48-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-48-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-48-no-bat", policy.batAllowed);
      set("#phase21-48-no-ps1", policy.ps1Allowed);
      set("#phase21-48-no-cmd", policy.cmdAllowed);
      set("#phase21-48-no-exe", policy.exeAllowed);
      set("#phase21-48-next-step", safePanel.nextRecommendedStep);
      set("#phase21-48-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-48-private-local-post-pr241-next-operation-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-48-private-local-post-pr241-next-operation-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-48-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-48-status");
      if (status) status.textContent = "PHASE21_48_PRIVATE_LOCAL_POST_PR241_RENDER_FALLBACK";
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

  async function runPrivateLocalPostPr241NextOperationCheckPanel(options = {}) {
    if (options.sources) return buildPrivateLocalPostPr241NextOperationCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalPostPr241NextOperationCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalPostPr241NextOperationCheckPanel(options = {}) {
    const panel = await runPrivateLocalPostPr241NextOperationCheckPanel(options);
    return renderPrivateLocalPostPr241NextOperationCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-48-private-local-post-pr241-next-operation-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr241NextOperationCheckPanel());
      if (document.querySelector("#phase21-48-private-local-post-pr241-next-operation-check")) runAndRenderPrivateLocalPostPr241NextOperationCheckPanel();
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
    buildPrivateLocalPostPr241NextOperationCheckPanel,
    renderPrivateLocalPostPr241NextOperationCheckPanel,
    runPrivateLocalPostPr241NextOperationCheckPanel,
    runAndRenderPrivateLocalPostPr241NextOperationCheckPanel
  };
});
