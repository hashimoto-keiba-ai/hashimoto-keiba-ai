(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2154PrivateLocalFinalStackMergePreparationCheckBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-54";
  const CHECKLIST_NAME = "Private Local Final Stack Merge Preparation Check";
  const PANEL_STATUS = "phase21_54_private_local_final_stack_merge_preparation_check_plan_only";
  const STATUS = "PHASE21_54_PRIVATE_LOCAL_FINAL_STACK_MERGE_PREPARATION_CHECK_READY";
  const DB_URL = "phase21-54-private-local-final-stack-merge-preparation-check-db.json";
  const SUMMARY_URL = "phase21-54-private-local-final-stack-merge-preparation-check-summary-db.json";
  const MERGE_ORDER = ["PR #243", "PR #244", "PR #245", "PR #246", "PR #247", "PR #248", "Phase21-54 PR"];
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
    { id: "P21-54-PR243-PHASE21-48", label: "PR #243 is Phase21-48 / Draft / base = main.", command: "manual PR stack confirmation", status: "Required" },
    { id: "P21-54-PR244-PHASE21-49", label: "PR #244 is Phase21-49 / Draft / base = Phase21-48.", command: "manual PR stack confirmation", status: "Required" },
    { id: "P21-54-PR245-PHASE21-50", label: "PR #245 is Phase21-50 / Draft / base = Phase21-49.", command: "manual PR stack confirmation", status: "Required" },
    { id: "P21-54-PR246-PHASE21-51", label: "PR #246 is Phase21-51 / Draft / base = Phase21-50.", command: "manual PR stack confirmation", status: "Required" },
    { id: "P21-54-PR247-PHASE21-52", label: "PR #247 is Phase21-52 / Draft / base = Phase21-51.", command: "manual PR stack confirmation", status: "Required" },
    { id: "P21-54-PR248-PHASE21-53", label: "PR #248 is Phase21-53 / Draft / base = Phase21-52.", command: "manual PR stack confirmation", status: "Required" },
    { id: "P21-54-MERGE-ORDER", label: "Merge order is PR #243 -> PR #244 -> PR #245 -> PR #246 -> PR #247 -> PR #248 -> Phase21-54 PR.", command: "manual merge order confirmation", status: "Required" },
    { id: "P21-54-MAIN-SYNC", label: "main sync is required after each ordered merge before continuing.", command: "manual main sync confirmation", status: "Required" },
    { id: "P21-54-COMPANY-PC-RESTART", label: "Tomorrow company PC restart requires latest main, clean working tree, and local browser confirmation.", command: "manual company PC restart confirmation", status: "Required" },
    { id: "P21-54-PRIVATE-LOCAL", label: "Private Local operation remains the primary operation mode.", command: "private-local.html", status: "Required" },
    { id: "P21-54-NO-PAGES", label: "GitHub Pages is not required.", command: "blocked", status: "PrivateLocalPolicy" },
    { id: "P21-54-PRIVATE-REPO", label: "Repository remains private.", command: "private repository", status: "PrivateLocalPolicy" },
    { id: "P21-54-NO-READY", label: "Ready for review is not performed by this Phase21-54 operation.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-MERGE-PERFORMED", label: "No merge is performed by this Phase21-54 operation.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-PR-CREATED", label: "No PR is created by this Phase21-54 operation.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-AUTO-PUBLISH", label: "No auto publish is added.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-EXTERNAL-SEND", label: "No external sending is added.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-DELETION-PROCESS", label: "No deletion process is added.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-CREDENTIAL-OUTPUT", label: "No credential output is added.", command: "blocked", status: "Blocked" },
    { id: "P21-54-NO-BAT-PS1-CMD-EXE", label: "No new .bat / .ps1 / .cmd / .exe files are added.", command: "blocked", status: "BlockedScriptPolicy" }
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
      id: safe.id || "P21-54-UNKNOWN",
      label: safe.label || "Manual Private Local final stack merge preparation confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildPrivateLocalFinalStackMergePreparationCheckPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.finalStackMergePreparationChecks,
      db.privateLocalOperationChecks,
      db.prPolicyChecks,
      db.blockedAutomationChecks,
      db.prohibitedActions
    ]);
    const normalizedRecords = listOrDefault(records, OPERATION_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      baseline: "Final stack merge preparation for PR #243 through PR #248 before tomorrow company PC restart",
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
    const mergeOrder = listOrDefault(db.mergeOrder, MERGE_ORDER);
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      baseline: summary.baseline || db.baseline || "Final stack merge preparation for PR #243 through PR #248 before tomorrow company PC restart",
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      operationPolicy: summary.operationPolicy || db.operationPolicy || "Private Local operation remains manual, private, and local while PR #243 through PR #248 are checked before the ordered main merge sequence.",
      safeLocalUsePolicy: summary.safeLocalUsePolicy || db.safeLocalUsePolicy || "Safe local use requires local browser confirmation, main sync after each merge, and no public Pages requirement.",
      japaneseTextContinuityPolicy: summary.japaneseTextContinuityPolicy || db.japaneseTextContinuityPolicy || "Japanese text display continuity from Phase21-41 through Phase21-53 remains visible and stable.",
      prPolicy: summary.prPolicy || db.prPolicy || "PLAN_ONLY / protected / draft PR only / do not merge yet remains active; Ready for review, PR creation, and merge are not performed by this operation.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      mergeOrder: mergeOrder.join(" -> "),
      planOnly: db.planOnly !== false,
      protected: db.protected !== false,
      draftPrOnly: db.draftPrOnly !== false,
      doNotMergeYet: db.doNotMergeYet !== false,
      privateRepository: db.privateRepository !== false,
      localFirst: db.localFirst !== false,
      draftPr243RemainsDraft: db.draftPr243RemainsDraft !== false,
      draftPr244RemainsDraft: db.draftPr244RemainsDraft !== false,
      draftPr245RemainsDraft: db.draftPr245RemainsDraft !== false,
      draftPr246RemainsDraft: db.draftPr246RemainsDraft !== false,
      draftPr247RemainsDraft: db.draftPr247RemainsDraft !== false,
      draftPr248RemainsDraft: db.draftPr248RemainsDraft !== false,
      pr243Phase2148BaseMainConfirmed: db.pr243Phase2148BaseMainConfirmed !== false,
      pr244Phase2149BasePhase2148Confirmed: db.pr244Phase2149BasePhase2148Confirmed !== false,
      pr245Phase2150BasePhase2149Confirmed: db.pr245Phase2150BasePhase2149Confirmed !== false,
      pr246Phase2151BasePhase2150Confirmed: db.pr246Phase2151BasePhase2150Confirmed !== false,
      pr247Phase2152BasePhase2151Confirmed: db.pr247Phase2152BasePhase2151Confirmed !== false,
      pr248Phase2153BasePhase2152Confirmed: db.pr248Phase2153BasePhase2152Confirmed !== false,
      finalMergeOrderConfirmed: db.finalMergeOrderConfirmed !== false,
      companyPcRestartReadyAfterMainSync: db.companyPcRestartReadyAfterMainSync !== false,
      readyForReviewAllowed: false,
      readyForReviewPerformed: false,
      mergeAllowed: false,
      mergePerformed: false,
      prCreationAllowed: false,
      prCreationPerformed: false,
      phase2153FlowMaintained: db.phase2153FlowMaintained !== false,
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
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "After user confirmation, process PR #243 -> PR #244 -> PR #245 -> PR #246 -> PR #247 -> PR #248 -> Phase21-54 PR in order, syncing main after each merge and restarting tomorrow on the company PC from latest clean main.",
      records: normalizedRecords
    };
  }

  function renderPrivateLocalFinalStackMergePreparationCheckPanel(panel, doc = document) {
    const safePanel = panel || buildPrivateLocalFinalStackMergePreparationCheckPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      [
        ["#phase21-54-panel-status", safePanel.panelStatus],
        ["#phase21-54-status", safePanel.status],
        ["#phase21-54-baseline", safePanel.baseline],
        ["#phase21-54-total-checks", safePanel.totalChecks],
        ["#phase21-54-passed", safePanel.passed],
        ["#phase21-54-merge-order", safePanel.mergeOrder],
        ["#phase21-54-operation-policy", safePanel.operationPolicy],
        ["#phase21-54-safe-local-use-policy", safePanel.safeLocalUsePolicy],
        ["#phase21-54-japanese-text-continuity-policy", safePanel.japaneseTextContinuityPolicy],
        ["#phase21-54-pr-policy", safePanel.prPolicy],
        ["#phase21-54-plan-only", safePanel.planOnly],
        ["#phase21-54-protected", safePanel.protected],
        ["#phase21-54-draft-pr-only", safePanel.draftPrOnly],
        ["#phase21-54-do-not-merge-yet", safePanel.doNotMergeYet],
        ["#phase21-54-private-repository", safePanel.privateRepository],
        ["#phase21-54-local-first", safePanel.localFirst],
        ["#phase21-54-draft-pr243", safePanel.draftPr243RemainsDraft],
        ["#phase21-54-draft-pr244", safePanel.draftPr244RemainsDraft],
        ["#phase21-54-draft-pr245", safePanel.draftPr245RemainsDraft],
        ["#phase21-54-draft-pr246", safePanel.draftPr246RemainsDraft],
        ["#phase21-54-draft-pr247", safePanel.draftPr247RemainsDraft],
        ["#phase21-54-draft-pr248", safePanel.draftPr248RemainsDraft],
        ["#phase21-54-pr243-base", safePanel.pr243Phase2148BaseMainConfirmed],
        ["#phase21-54-pr244-base", safePanel.pr244Phase2149BasePhase2148Confirmed],
        ["#phase21-54-pr245-base", safePanel.pr245Phase2150BasePhase2149Confirmed],
        ["#phase21-54-pr246-base", safePanel.pr246Phase2151BasePhase2150Confirmed],
        ["#phase21-54-pr247-base", safePanel.pr247Phase2152BasePhase2151Confirmed],
        ["#phase21-54-pr248-base", safePanel.pr248Phase2153BasePhase2152Confirmed],
        ["#phase21-54-final-merge-order", safePanel.finalMergeOrderConfirmed],
        ["#phase21-54-company-pc-restart", safePanel.companyPcRestartReadyAfterMainSync],
        ["#phase21-54-ready-for-review", safePanel.readyForReviewPerformed],
        ["#phase21-54-merge", safePanel.mergePerformed],
        ["#phase21-54-pr-creation", safePanel.prCreationPerformed],
        ["#phase21-54-phase21-53-flow", safePanel.phase2153FlowMaintained],
        ["#phase21-54-phase21-41-ja-continuity", safePanel.phase2141JapaneseTextContinuityConfirmed],
        ["#phase21-54-private-local-confirmed", safePanel.privateLocalOperationConfirmed],
        ["#phase21-54-operation-route-consistency-confirmed", safePanel.operationRouteConsistencyConfirmed],
        ["#phase21-54-readme-record-consistency-confirmed", safePanel.readmeRecordConsistencyConfirmed],
        ["#phase21-54-japanese-text-continuity-confirmed", safePanel.japaneseTextDisplayContinuityConfirmed],
        ["#phase21-54-safe-local-confirmed", safePanel.safeLocalUseConfirmed],
        ["#phase21-54-no-pages", safePanel.githubPagesRequired],
        ["#phase21-54-no-public", safePanel.publicDeliveryAllowed],
        ["#phase21-54-no-external-api", safePanel.externalApiAllowed],
        ["#phase21-54-no-auto-execution", safePanel.autoExecutionAllowed],
        ["#phase21-54-no-auto-update", safePanel.automaticUpdateAllowed],
        ["#phase21-54-no-hidden-update", safePanel.hiddenBackgroundUpdateAllowed],
        ["#phase21-54-no-autorun", safePanel.suspiciousAutoRunScriptAllowed],
        ["#phase21-54-no-public-route", safePanel.unnecessaryPublicRouteAllowed],
        ["#phase21-54-no-deletion-process", safePanel.deletionProcessAllowed],
        ["#phase21-54-no-credential-output", safePanel.credentialOutputAllowed],
        ["#phase21-54-ipad-view-only", safePanel.ipadViewConfirmOnly],
        ["#phase21-54-powershell-manual", safePanel.powerShellManualOnly],
        ["#phase21-54-local-browser-confirm", safePanel.localBrowserConfirmationRequired],
        ["#phase21-54-no-bat", policy.batAllowed],
        ["#phase21-54-no-ps1", policy.ps1Allowed],
        ["#phase21-54-no-cmd", policy.cmdAllowed],
        ["#phase21-54-no-exe", policy.exeAllowed],
        ["#phase21-54-next-step", safePanel.nextRecommendedStep],
        ["#phase21-54-updated", safePanel.generatedAt]
      ].forEach(([selector, value]) => set(selector, value));
      const list = doc.querySelector("#phase21-54-private-local-final-stack-merge-preparation-check-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-54-private-local-final-stack-merge-preparation-check-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-54-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-54-status");
      if (status) status.textContent = "PHASE21_54_PRIVATE_LOCAL_FINAL_STACK_MERGE_PREPARATION_RENDER_FALLBACK";
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

  async function runPrivateLocalFinalStackMergePreparationCheckPanel(options = {}) {
    if (options.sources) return buildPrivateLocalFinalStackMergePreparationCheckPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildPrivateLocalFinalStackMergePreparationCheckPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderPrivateLocalFinalStackMergePreparationCheckPanel(options = {}) {
    const panel = await runPrivateLocalFinalStackMergePreparationCheckPanel(options);
    return renderPrivateLocalFinalStackMergePreparationCheckPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-54-private-local-final-stack-merge-preparation-check");
      if (button) button.addEventListener("click", () => runAndRenderPrivateLocalFinalStackMergePreparationCheckPanel());
      if (document.querySelector("#phase21-54-private-local-final-stack-merge-preparation-check")) runAndRenderPrivateLocalFinalStackMergePreparationCheckPanel();
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
    buildPrivateLocalFinalStackMergePreparationCheckPanel,
    renderPrivateLocalFinalStackMergePreparationCheckPanel,
    runPrivateLocalFinalStackMergePreparationCheckPanel,
    runAndRenderPrivateLocalFinalStackMergePreparationCheckPanel
  };
});
