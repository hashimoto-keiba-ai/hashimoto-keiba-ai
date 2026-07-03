(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2123SecuritySoftwareSafeOperationBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase21-23";
  const CHECKLIST_NAME = "Security Software Safe Operation Checklist";
  const PANEL_STATUS = "phase21_23_security_software_safe_operation_plan_only";
  const STATUS = "PHASE21_23_SECURITY_SOFTWARE_SAFE_OPERATION_READY";
  const BLOCKED_FILE_POLICY = {
    doNotForceAllow: true,
    doNotRestoreQuarantinedFiles: true,
    doNotRecreateDeletedDetectedFiles: true,
    doNotAddBatPs1CmdExe: true,
    manualGitPullPreferred: true,
    privateLocalHtmlManualOpenPreferred: true
  };
  const CHECKS = [
    { id: "P21-23-NORTON-IDP-GENERIC", label: "Norton IDP.Generic detection: do not force allow the detected file.", status: "BlockedFilePolicy" },
    { id: "P21-23-DEFENDER-BLOCK", label: "Windows Defender block: stop and review before continuing.", status: "ManualReviewRequired" },
    { id: "P21-23-NO-RESTORE", label: "Do not restore or reuse quarantined or deleted files.", status: "BlockedFilePolicy" },
    { id: "P21-23-NO-SCRIPT-LAUNCHERS", label: "Do not create or modify .bat, .ps1, .cmd, or .exe launch/update files.", status: "BlockedFilePolicy" },
    { id: "P21-23-MANUAL-GIT-PULL", label: "Use manual git pull from the private repository for updates.", status: "Recommended" },
    { id: "P21-23-MANUAL-PRIVATE-LOCAL", label: "Open private-local.html manually for local operation.", status: "Recommended" },
    { id: "P21-23-NO-PUBLIC-PUBLISH", label: "Do not use GitHub Pages or public URLs as a workaround.", status: "BlockedFilePolicy" },
    { id: "P21-23-COMPANY-PC", label: "Company PC: follow endpoint security policy and do not bypass protection.", status: "ManualReviewRequired" },
    { id: "P21-23-HOME-PC", label: "Home PC: keep private/local operation and avoid unknown executable files.", status: "ManualReviewRequired" }
  ];

  function buildSecuritySoftwareSafeOperationPanel(sources = {}, now = () => new Date()) {
    const records = (sources.checks || CHECKS).map((check) => ({
      ...check,
      phase: PHASE,
      privateRepository: true,
      localFirst: true,
      githubPagesRequired: false,
      publicDeliveryAllowed: false,
      externalApiAllowed: false,
      autoExecutionAllowed: false,
      blockedFilePolicy: { ...BLOCKED_FILE_POLICY }
    }));
    return {
      phase: PHASE,
      checklistName: CHECKLIST_NAME,
      panelStatus: PANEL_STATUS,
      status: STATUS,
      generatedAt: now().toISOString(),
      totalChecks: records.length,
      passed: records.length,
      manualReviewRequired: records.filter((record) => record.status === "ManualReviewRequired").length,
      blockedFilePolicy: { ...BLOCKED_FILE_POLICY },
      safeUpdatePath: "manual git pull from private repository",
      safeLaunchPath: "manual private-local.html open",
      dangerousLauncherExtensionsAdded: false,
      nextRecommendedStep: "Do not force allow blocked files; avoid .bat/.ps1/.cmd/.exe launchers; update manually with git pull and open private-local.html manually.",
      records
    };
  }

  function renderSecuritySoftwareSafeOperationPanel(panel, doc = document) {
    try {
      const set = (selector, value) => {
        const node = doc.querySelector(selector);
        if (node) node.textContent = String(value);
      };
      set("#phase21-23-panel-status", panel.panelStatus);
      set("#phase21-23-status", panel.status);
      set("#phase21-23-total-checks", panel.totalChecks);
      set("#phase21-23-passed", panel.passed);
      set("#phase21-23-blocked-file-policy", panel.blockedFilePolicy.doNotForceAllow);
      set("#phase21-23-no-restore", panel.blockedFilePolicy.doNotRestoreQuarantinedFiles);
      set("#phase21-23-no-recreate", panel.blockedFilePolicy.doNotRecreateDeletedDetectedFiles);
      set("#phase21-23-no-launcher-files", panel.blockedFilePolicy.doNotAddBatPs1CmdExe);
      set("#phase21-23-safe-update", panel.safeUpdatePath);
      set("#phase21-23-safe-launch", panel.safeLaunchPath);
      set("#phase21-23-no-pages", false);
      set("#phase21-23-no-external-api", false);
      set("#phase21-23-next-step", panel.nextRecommendedStep);
      set("#phase21-23-updated", panel.generatedAt);
      const list = doc.querySelector("#phase21-23-security-software-safe-operation-list");
      if (list) {
        list.textContent = "";
        panel.records.forEach((record) => {
          const row = doc.createElement("li");
          row.className = `phase21-23-security-software-safe-operation-item status-${record.status.toLowerCase()}`;
          row.textContent = `${record.id} ${record.label} / ${record.status}`;
          list.appendChild(row);
        });
      }
    } catch (error) {
      const status = doc.querySelector("#phase21-23-status");
      if (status) status.textContent = "PHASE21_23_SAFE_OPERATION_RENDER_FALLBACK";
    }
    return panel;
  }

  function runSecuritySoftwareSafeOperationPanel(options = {}) {
    return buildSecuritySoftwareSafeOperationPanel(options.sources || {}, options.now);
  }

  function runAndRenderSecuritySoftwareSafeOperationPanel(options = {}) {
    const panel = runSecuritySoftwareSafeOperationPanel(options);
    return renderSecuritySoftwareSafeOperationPanel(panel, options.document || document);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-phase21-23-security-software-safe-operation");
      if (button) button.addEventListener("click", () => runAndRenderSecuritySoftwareSafeOperationPanel());
      if (document.querySelector("#phase21-23-security-software-safe-operation")) runAndRenderSecuritySoftwareSafeOperationPanel();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return {
    PHASE,
    CHECKLIST_NAME,
    PANEL_STATUS,
    STATUS,
    BLOCKED_FILE_POLICY,
    CHECKS,
    buildSecuritySoftwareSafeOperationPanel,
    renderSecuritySoftwareSafeOperationPanel,
    runSecuritySoftwareSafeOperationPanel,
    runAndRenderSecuritySoftwareSafeOperationPanel
  };
});
