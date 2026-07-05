(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2142PrivateLocalPostPr236OperationCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-42";
  const CHECKLIST_NAME = "Private Local Post PR236 Operation Check";
  const PANEL_STATUS = "phase21_42_private_local_post_pr236_operation_check_plan_only";
  const STATUS = "PHASE21_42_PRIVATE_LOCAL_POST_PR236_OPERATION_CHECK_READY";
  const DB_URL = "phase21-42-private-local-post-pr236-operation-check-db.json";
  const SUMMARY_URL = "phase21-42-private-local-post-pr236-operation-check-summary-db.json";
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
    launcherFileChangeAllowed: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const OPERATION_CHECKS = [
    { id: "P21-42-PR236-MERGED", label: "Confirm PR #236 is merged before using main as the baseline.", command: "manual PR confirmation", status: "Required" },
    { id: "P21-42-PHASE21-41-MAIN", label: "Confirm Phase21-41 is reflected on main after pull.", command: "manual main reflection confirmation", status: "Required" },
    { id: "P21-42-PRIVATE-LOCAL", label: "Private Local operation remains the primary operation mode.", command: "private-local.html", status: "Required" },
    { id: "P21-42-JA-DISPLAY", label: "Japanese text display cleanup is reflected in the Private Local app.", command: "local browser confirmation", status: "Required" },
    { id: "P21-42-SAFE-LOCAL", label: "Safe local use remains manual and local only.", command: "manual confirmation", status: "Required" },
    { id: "P21-42-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-42-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-42-PLAN-ONLY", label: "PLAN_ONLY / protected / draft PR only / do not merge yet remains active.", command: "manual PR policy", status: "Required" },
    { id: "P21-42-NO-MAIN-COMMIT", label: "Do not commit directly to main.", command: "blocked", status: "Blocked" },
    { id: "P21-42-DRAFT-PR", label: "Draft PR is required before review.", command: "Draft PR", status: "Required" },
    { id: "P21-42-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-42-NO-HIDDEN-UPDATE", label: "No hidden update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-42-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-42-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-42-POWERSHELL-MANUAL", label: "PowerShell operation remains manual.", command: "manual PowerShell only", status: "Required" },
    { id: "P21-42-IPAD-VIEW", label: "iPad remains view / confirmation only.", command: "manual view", status: "Required" },
    { id: "P21-42-LOCAL-BROWSER", label: "Local browser confirmation is required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-42-SECURITY-FRIENDLY", label: "Security software friendly operation remains required.", command: "manual security confirmation", status: "Required" }
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
      id: safe.id || "P21-42-UNKNOWN",
      label: safe.label || "Manual Private Local post PR236 operation confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalPostPr236OperationCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.postPr236MergeChecks,
      db.privateLocalOperationChecks,
      db.japaneseTextDisplayChecks,
      db.prPolicyChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, OPERATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "PR #236 merged main / Phase21-41 reflected",
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
      baseline: summary.baseline || db.baseline || "PR #236 merged main / Phase21-41 reflected",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, private, and local after PR #236.",
      japaneseTextPolicy: summary.japaneseTextPolicy || db.japaneseTextPolicy || "Japanese text display cleanup from Phase21-41 is confirmed in local app review.",
      safeLocalUsePolicy: summary.safeLocalUsePolicy || db.safeLocalUsePolicy || "Safe local use requires local browser confirmation and no public Pages requirement.",
      prPolicy: summary.prPolicy || db.prPolicy || "PLAN_ONLY / protected / draft PR only / do not merge yet remains active.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      draftPrOnly: db.draftPrOnly !== false,
      doNotMergeYet: db.doNotMergeYet !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      pr236MergedConfirmationRequired: db.pr236MergedConfirmationRequired !== false,
      phase2141MainReflectionRequired: db.phase2141MainReflectionRequired !== false,
      privateLocalOperationConfirmed: db.privateLocalOperationConfirmed !== false,
      japaneseTextDisplayConfirmed: db.japaneseTextDisplayConfirmed !== false,
      safeLocalUseConfirmed: db.safeLocalUseConfirmed !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm private-local.html and index.html locally after PR #236, then keep follow-up work as Draft PR only.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalPostPr236OperationCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalPostPr236OperationCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-42-panel-status", safePanel.panelStatus);
      set("#phase21-42-status", safePanel.status);
      set("#phase21-42-baseline", safePanel.baseline);
      set("#phase21-42-total-checks", safePanel.totalChecks);
      set("#phase21-42-passed", safePanel.passed);
      set("#phase21-42-operation-policy", safePanel.operationPolicy);
      set("#phase21-42-japanese-text-policy", safePanel.japaneseTextPolicy);
      set("#phase21-42-safe-local-use-policy", safePanel.safeLocalUsePolicy);
      set("#phase21-42-pr-policy", safePanel.prPolicy);
      set("#phase21-42-plan-only", safePanel.planOnly);
      set("#phase21-42-protected", safePanel.protected);
      set("#phase21-42-draft-pr-only", safePanel.draftPrOnly);
      set("#phase21-42-do-not-merge-yet", safePanel.doNotMergeYet);
      set("#phase21-42-private-repository", safePanel.privateRepository);
      set("#phase21-42-local-first", safePanel.localFirst);
      set("#phase21-42-pr236-merged", safePanel.pr236MergedConfirmationRequired);
      set("#phase21-42-phase21-41-main", safePanel.phase2141MainReflectionRequired);
      set("#phase21-42-private-local-confirmed", safePanel.privateLocalOperationConfirmed);
      set("#phase21-42-japanese-text-confirmed", safePanel.japaneseTextDisplayConfirmed);
      set("#phase21-42-safe-local-confirmed", safePanel.safeLocalUseConfirmed);
      set("#phase21-42-no-pages", safePanel.githubPagesRequired);
      set("#phase21-42-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-42-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-42-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-42-no-auto-update", safePanel.automaticUpdateAllowed);
      set("#phase21-42-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed);
      set("#phase21-42-no-autorun", safePanel.suspiciousAutoRunScriptAllowed);
      set("#phase21-42-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-42-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-42-local-browser-confirm", safePanel.localBrowserConfirmationRequired);
      set("#phase21-42-no-bat", policy.batAllowed);
      set("#phase21-42-no-ps1", policy.ps1Allowed);
      set("#phase21-42-no-cmd", policy.cmdAllowed);
      set("#phase21-42-no-exe", policy.exeAllowed);
      set("#phase21-42-next-step", safePanel.nextRecommendedStep);
      set("#phase21-42-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-42-private-local-post-pr236-operation-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-42-private-local-post-pr236-operation-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-42-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-42-status");
      if (status) status.textContent = "PHASE21_42_PRIVATE_LOCAL_POST_PR236_RENDER_FALLBACK";
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

  async function runPrivateLocalPostPr236OperationCheckPanel(options = {}) {
    if (options.sources) return buildPrivateLocalPostPr236OperationCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalPostPr236OperationCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalPostPr236OperationCheckPanel(options = {}) {
    const panel = await runPrivateLocalPostPr236OperationCheckPanel(options);
    return renderPrivateLocalPostPr236OperationCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-42-private-local-post-pr236-operation-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalPostPr236OperationCheckPanel());
      if (document.querySelector("#phase21-42-private-local-post-pr236-operation-check")) runAndRenderPrivateLocalPostPr236OperationCheckPanel();
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
    buildPrivateLocalPostPr236OperationCheckPanel,
    renderPrivateLocalPostPr236OperationCheckPanel,
    runPrivateLocalPostPr236OperationCheckPanel,
    runAndRenderPrivateLocalPostPr236OperationCheckPanel
  };
});
