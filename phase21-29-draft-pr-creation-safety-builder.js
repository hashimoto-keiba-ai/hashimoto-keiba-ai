(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2129DraftPrCreationSafetyBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-29";
  const CHECKLIST_NAME = "Draft PR Creation Safety Checklist";
  const PANEL_STATUS = "phase21_29_draft_pr_creation_safety_plan_only";
  const STATUS = "PHASE21_29_DRAFT_PR_CREATION_SAFETY_READY";
  const DB_URL = "phase21-29-draft-pr-creation-safety-db.json";
  const SUMMARY_URL = "phase21-29-draft-pr-creation-safety-summary-db.json";
  const BLOCKED_ACTION_POLICY = {
    mainDirectPushAllowed: false,
    mainDirectCommitAllowed: false,
    forcePushAllowed: false,
    readyForReviewAllowed: false,
    mergeAllowed: false,
    autoMergeAllowed: false,
    publicDeliveryAllowed: false,
    githubPagesRequired: false,
    batAllowed: false,
    ps1Allowed: false,
    cmdAllowed: false,
    exeAllowed: false
  };
  const DRAFT_PR_CHECKS = [
    { id: "P21-29-PWD", label: "Confirm current workspace folder before creating a PR.", command: "pwd", status: "Required" },
    { id: "P21-29-BRANCH", label: "Confirm the feature branch is selected, not main.", command: "git branch", status: "Required" },
    { id: "P21-29-STATUS", label: "Confirm working tree clean before PR creation.", command: "git status", status: "Required" },
    { id: "P21-29-LOG", label: "Confirm latest commit SHA before opening the PR.", command: "git log --oneline -3", status: "Required" },
    { id: "P21-29-PUSHED", label: "Confirm the feature branch has been pushed to origin.", command: "git push -u origin <feature-branch>", status: "Required" },
    { id: "P21-29-BASE", label: "Set base branch to main and head branch to the feature branch.", command: "GitHub compare", status: "Required" },
    { id: "P21-29-DRAFT", label: "Create the pull request as Draft.", command: "GitHub Draft PR", status: "Required" },
    { id: "P21-29-NO-READY", label: "Do not press Ready for review during this phase.", command: "blocked", status: "Blocked" },
    { id: "P21-29-NO-MERGE", label: "Do not merge the PR during this phase.", command: "blocked", status: "Blocked" },
    { id: "P21-29-NO-MAIN-PUSH", label: "Do not push main directly.", command: "blocked", status: "Blocked" },
    { id: "P21-29-NO-FORCE", label: "Do not force push to solve PR or refspec problems.", command: "blocked", status: "Blocked" },
    { id: "P21-29-NO-LAUNCHERS", label: "Do not create or modify .bat, .ps1, .cmd, or .exe files.", command: "blocked", status: "BlockedScriptPolicy" },
    { id: "P21-29-PRIVATE-LOCAL", label: "Keep private repository, local first, and no GitHub Pages dependency.", command: "private local", status: "PrivateLocalPolicy" }
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
      id: safe.id || "P21-29-UNKNOWN",
      label: safe.label || "Manual Draft PR creation safety confirmation",
      command: safe.command || "manual",
      status: safe.status || "Required"
    };
  }

  function buildDraftPrCreationSafetyPanel(sources = {}, now = () => new Date()) {
    const db = sources.db || sources;
    const summary = sources.summary || {};
    const records = flattenRecords([
      db.localPreflightChecks,
      db.githubPrCreationChecks,
      db.draftPrHoldRules,
      db.prohibitedActions,
      db.privateLocalRules
    ]);
    const normalizedRecords = listOrDefault(records, DRAFT_PR_CHECKS).map((record) => ({
      ...normalizeRecord(record),
      phase: PHASE,
      draftPrRequired: true,
      baseBranch: "main",
      featureBranchRequired: true,
      mainDirectPushAllowed: false,
      mainDirectCommitAllowed: false,
      readyForReviewAllowed: false,
      mergeAllowed: false,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY }
    }));
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: summary.status || db.status || STATUS,
      generatedAt: now().toISOString(),
      totalChecks: Number(summary.totalChecks || normalizedRecords.length),
      passed: Number(summary.passed || normalizedRecords.length),
      draftPrPolicy: summary.draftPrPolicy || db.draftPrPolicy || "create Draft PR only after folder, branch, status, commit SHA, and origin push are confirmed.",
      prHoldPolicy: summary.prHoldPolicy || db.prHoldPolicy || "leave Draft PR unmerged and not ready for review until manual confirmation.",
      branchPolicy: summary.branchPolicy || db.branchPolicy || "base main, head feature branch, no main direct push.",
      blockedActionPolicy: { ...BLOCKED_ACTION_POLICY, ...(db.blockedActionPolicy || {}), ...(summary.blockedActionPolicy || {}) },
      workingTreeCleanRequired: summary.workingTreeCleanRequired !== false,
      pushedBranchRequired: summary.pushedBranchRequired !== false,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: summary.nextRecommendedStep || db.nextRecommendedStep || "Create Draft PR only, then stop before Ready for review or merge.",
      records: normalizedRecords
    };
  }

  function renderDraftPrCreationSafetyPanel(panel, doc = document) {
    const safePanel = panel || buildDraftPrCreationSafetyPanel();
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value ?? "");
      };
      const policy = safePanel.blockedActionPolicy || BLOCKED_ACTION_POLICY;
      set("#phase21-29-panel-status", safePanel.panelStatus);
      set("#phase21-29-status", safePanel.status);
      set("#phase21-29-total-checks", safePanel.totalChecks);
      set("#phase21-29-passed", safePanel.passed);
      set("#phase21-29-draft-pr-policy", safePanel.draftPrPolicy);
      set("#phase21-29-pr-hold-policy", safePanel.prHoldPolicy);
      set("#phase21-29-branch-policy", safePanel.branchPolicy);
      set("#phase21-29-working-tree-clean", safePanel.workingTreeCleanRequired);
      set("#phase21-29-pushed-branch-required", safePanel.pushedBranchRequired);
      set("#phase21-29-no-ready", policy.readyForReviewAllowed);
      set("#phase21-29-no-merge", policy.mergeAllowed);
      set("#phase21-29-no-main-push", policy.mainDirectPushAllowed);
      set("#phase21-29-no-force-push", policy.forcePushAllowed);
      set("#phase21-29-no-bat", policy.batAllowed);
      set("#phase21-29-no-ps1", policy.ps1Allowed);
      set("#phase21-29-no-cmd", policy.cmdAllowed);
      set("#phase21-29-no-exe", policy.exeAllowed);
      set("#phase21-29-no-pages", safePanel.githubPagesRequired);
      set("#phase21-29-next-step", safePanel.nextRecommendedStep);
      set("#phase21-29-updated", safePanel.generatedAt);
      const list = doc.querySelector("#phase21-29-draft-pr-creation-safety-list");
      if (list) {
        list.textContent = "";
        (safePanel.records || []).forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-29-draft-pr-creation-safety-item status-${String(record.status || "unknown").toLowerCase()}`;
          row.textContent = `${record.id || "P21-29-UNKNOWN"} ${record.label || ""} / ${record.command || "manual"} / ${record.status || "Unknown"}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-29-status");
      if (status) status.textContent = "PHASE21_29_DRAFT_PR_CREATION_RENDER_FALLBACK";
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

  async function runDraftPrCreationSafetyPanel(options = {}) {
    if (options.sources) return buildDraftPrCreationSafetyPanel(options.sources, options.now);
    const db = await fetchJson(options.dbUrl || DB_URL);
    const summary = await fetchJson(options.summaryUrl || SUMMARY_URL);
    return buildDraftPrCreationSafetyPanel({ db: db || {}, summary: summary || {} }, options.now);
  }

  async function runAndRenderDraftPrCreationSafetyPanel(options = {}) {
    const panel = await runDraftPrCreationSafetyPanel(options);
    return renderDraftPrCreationSafetyPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-29-draft-pr-creation-safety");
      if (button) button.addEventListener("click", () => runAndRenderDraftPrCreationSafetyPanel());
      if (document.querySelector("#phase21-29-draft-pr-creation-safety")) runAndRenderDraftPrCreationSafetyPanel();
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
    DRAFT_PR_CHECKS,
    buildDraftPrCreationSafetyPanel,
    renderDraftPrCreationSafetyPanel,
    runDraftPrCreationSafetyPanel,
    runAndRenderDraftPrCreationSafetyPanel
  };
});
