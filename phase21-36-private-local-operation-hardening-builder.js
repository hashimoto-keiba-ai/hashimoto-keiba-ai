(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2136PrivateLocalOperationHardeningBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-36";
  const CHECKLIST_NAME = "Private Local Operation Hardening Checklist";
  const PANEL_STATUS = "phase21_36_private_local_operation_hardening_plan_only";
  const STATUS = "PHASE21_36_PRIVATE_LOCAL_OPERATION_HARDENING_READY";
  const DB_URL = "phase21-36-private-local-operation-hardening-db.json";
  const SUMMARY_URL = "phase21-36-private-local-operation-hardening-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    automaticRemotePublishAllowed: false,
    automaticMergeAllowed: false,
    hiddenBackgroundUpdateAllowed: false,
    suspiciousAutoRunScriptAllowed: false,
    launcherFileChangeAllowed: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };

  const HARDENING_CHECKS = [
    { id: "P21-36-BASELINE", label: "Confirm baseline is Phase21-35 / PR #228 reflected main.", command: "git log --oneline -5", status: "Required" },
    { id: "P21-36-PRIVATE-FIRST", label: "Private Local first remains the primary operation mode.", command: "private local", status: "Required" },
    { id: "P21-36-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-36-MANUAL-CONFIRM", label: "Manual confirmation is required.", command: "manual confirmation", status: "Required" },
    { id: "P21-36-NO-REMOTE-PUBLISH", label: "No automatic remote publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-36-NO-AUTO-MERGE", label: "No automatic merge is added.", command: "blocked", status: "Blocked" },
    { id: "P21-36-NO-HIDDEN-UPDATE", label: "No hidden background update is added.", command: "blocked", status: "Blocked" },
    { id: "P21-36-NO-AUTORUN", label: "No suspicious auto-run script is added.", command: "blocked", status: "Blocked" },
    { id: "P21-36-IPAD", label: "iPad remains view/confirm only.", command: "manual view", status: "Required" },
    { id: "P21-36-DRAFT", label: "PR remains Draft until confirmed.", command: "Draft PR", status: "Required" },
    { id: "P21-36-MERGE", label: "Merge only after user confirmation.", command: "manual merge confirmation", status: "Required" },
    { id: "P21-36-LOCAL-BROWSER", label: "Local files and browser display confirmation are required.", command: "private-local.html / index.html", status: "Required" },
    { id: "P21-36-NO-LAUNCHERS", label: "Do not create or modify launcher-type files.", command: "blocked", status: "BlockedScriptPolicy" }
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
      id: safe.id || "P21-36-UNKNOWN",
      label: safe.label || "Manual Private Local hardening confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalOperationHardeningPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.privateLocalHardeningChecks,
      db.blockedAutomationChecks,
      db.deviceOperationChecks,
      db.prAndMergeChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, HARDENING_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "Phase21-35 / PR #228 reflected main",
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
      baseline: summary.baseline || db.baseline || "Phase21-35 / PR #228 reflected main",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local first remains required.",
      securitySoftwarePolicy: summary.securitySoftwarePolicy || db.securitySoftwarePolicy || "Norton-friendly operation avoids auto-run and hidden updater behavior.",
      devicePolicy: summary.devicePolicy || "home PC and company PC confirm locally; iPad is view/confirm only.",
      prMergePolicy: summary.prMergePolicy || "Draft PR until confirmed; merge only after user confirmation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      autoExecutionAllowed: false,
      desktopShortcutOptional: db.desktopShortcutOptional !== false,
      ipadViewConfirmOnly: db.ipadViewConfirmOnly !== false,
      powerShellManualOnly: db.powerShellManualOnly !== false,
      draftPrUntilConfirmed: db.draftPrUntilConfirmed !== false,
      mergeAfterUserConfirmationOnly: db.mergeAfterUserConfirmationOnly !== false,
      localFilesAndBrowserConfirmationRequired: db.localFilesAndBrowserConfirmationRequired !== false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Confirm private-local.html and index.html manually while keeping PLAN_ONLY / Protected / Private Local operation.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalOperationHardeningPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalOperationHardeningPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-36-panel-status", safePanel.panelStatus);
      set("#phase21-36-status", safePanel.status);
      set("#phase21-36-baseline", safePanel.baseline);
      set("#phase21-36-total-checks", safePanel.totalChecks);
      set("#phase21-36-passed", safePanel.passed);
      set("#phase21-36-operation-policy", safePanel.operationPolicy);
      set("#phase21-36-security-policy", safePanel.securitySoftwarePolicy);
      set("#phase21-36-device-policy", safePanel.devicePolicy);
      set("#phase21-36-pr-merge-policy", safePanel.prMergePolicy);
      set("#phase21-36-plan-only", safePanel.planOnly);
      set("#phase21-36-protected", safePanel.protected);
      set("#phase21-36-private-repository", safePanel.privateRepository);
      set("#phase21-36-local-first", safePanel.localFirst);
      set("#phase21-36-no-pages", safePanel.githubPagesRequired);
      set("#phase21-36-no-public", safePanel.publicDeliveryAllowed);
      set("#phase21-36-no-external-api", safePanel.externalApiAllowed);
      set("#phase21-36-no-auto-execution", safePanel.autoExecutionAllowed);
      set("#phase21-36-no-remote-publish", policy.automaticRemotePublishAllowed);
      set("#phase21-36-no-auto-merge", policy.automaticMergeAllowed);
      set("#phase21-36-no-hidden-update", policy.hiddenBackgroundUpdateAllowed);
      set("#phase21-36-no-autorun", policy.suspiciousAutoRunScriptAllowed);
      set("#phase21-36-shortcut-optional", safePanel.desktopShortcutOptional);
      set("#phase21-36-ipad-view-only", safePanel.ipadViewConfirmOnly);
      set("#phase21-36-powershell-manual", safePanel.powerShellManualOnly);
      set("#phase21-36-draft-pr", safePanel.draftPrUntilConfirmed);
      set("#phase21-36-merge-confirm", safePanel.mergeAfterUserConfirmationOnly);
      set("#phase21-36-local-browser-confirm", safePanel.localFilesAndBrowserConfirmationRequired);
      set("#phase21-36-no-bat", policy.batAllowed);
      set("#phase21-36-no-ps1", policy.ps1Allowed);
      set("#phase21-36-no-cmd", policy.cmdAllowed);
      set("#phase21-36-no-exe", policy.exeAllowed);
      set("#phase21-36-next-step", safePanel.nextRecommendedStep);
      set("#phase21-36-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-36-private-local-operation-hardening-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-36-private-local-operation-hardening-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-36-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-36-status");
      if (status) status.textContent = "PHASE21_36_PRIVATE_LOCAL_HARDENING_RENDER_FALLBACK";
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

  async function runPrivateLocalOperationHardeningPanel(options = {}) {
    if (options.sources) return buildPrivateLocalOperationHardeningPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalOperationHardeningPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalOperationHardeningPanel(options = {}) {
    const panel = await runPrivateLocalOperationHardeningPanel(options);
    return renderPrivateLocalOperationHardeningPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-36-private-local-operation-hardening");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalOperationHardeningPanel());
      if (document.querySelector("#phase21-36-private-local-operation-hardening")) runAndRenderPrivateLocalOperationHardeningPanel();
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
    HARDENING_CHECKS,
    buildPrivateLocalOperationHardeningPanel,
    renderPrivateLocalOperationHardeningPanel,
    runPrivateLocalOperationHardeningPanel,
    runAndRenderPrivateLocalOperationHardeningPanel
  };
});
