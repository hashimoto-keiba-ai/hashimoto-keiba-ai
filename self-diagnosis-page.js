(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoSelfDiagnosisEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-4";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const OS_VERSION = "4.0 Final";
  const DATABASE_FILES = ["self-diagnosis-db.json", "self-diagnosis-history-db.json", "self-diagnosis-rule-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json", "self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json", "repair-approval-history-db.json", "repair-audit-history-db.json", "repair-rollback-plan-db.json", "repair-governance-db.json", "governance-alert-db.json", "governance-priority-recommendation-db.json", "final-safety-lock-db.json", "release-readiness-db.json", "global-intelligence-control-center-db.json", "global-network-readiness-db.json", "global-network-simulation-db.json", "global-intelligence-network-core-db.json", "global-intelligence-network-nodes-db.json"];
  const PROTECTED_FEATURES = [
    { id: "official-release", label: "Official Release v2.8", markers: ["Official Release v2.8"] },
    { id: "racing-os", label: "Hashimoto Racing OS v4.0 Final", markers: ["Hashimoto Racing OS v4.0 Final"] },
    { id: "self-expansion", label: "Phase18-1 Self Expansion System", markers: ["Self Expansion System"] },
    { id: "auto-development", label: "Phase18-2 Auto Development Engine", markers: ["Auto Development Engine"] },
    { id: "ai-evolution", label: "Phase18-3 AI Evolution Engine", markers: ["AI Evolution Engine"] },
    { id: "self-diagnosis", label: "Phase18-4 Self Diagnosis Engine", markers: ["Self Diagnosis Engine"] },
    { id: "self-repair", label: "Phase18-5 Self Repair & Auto Improvement Engine", markers: ["Self Repair & Auto Improvement Engine"] },
    { id: "repair-approval", label: "Phase18-6 Repair Plan Approval Gate", markers: ["Repair Plan Approval"] },
    { id: "repair-audit", label: "Phase18-7 Repair Execution Audit & Rollback Plan Engine", markers: ["Repair Execution Audit"] },
    { id: "repair-governance", label: "Phase18-8 Global Repair Governance Dashboard", markers: ["Global Repair Governance Dashboard"] },
    { id: "governance-alert", label: "Phase18-9 Governance Alert & Priority Recommendation Engine", markers: ["Governance Alert & Priority Recommendation Engine"] },
    { id: "final-safety-lock", label: "Phase18-10 Final Safety Lock & Release Readiness Gate", markers: ["Final Safety Lock & Release Readiness Gate"] },
    { id: "global-control-center", label: "Phase18-11 Global Intelligence Control Center", markers: ["Global Intelligence Control Center"] },
    { id: "global-network-readiness", label: "Phase18-12 Global Intelligence Network Readiness Simulator", markers: ["Global Intelligence Network Readiness Simulator"] },
    { id: "global-network-core", label: "Phase18-13 Global Intelligence Network Core Skeleton", markers: ["Global Intelligence Network Core Skeleton"] }
  ];
  const UI_MARKERS = {
    dashboard: ["Self Diagnosis Engine ON", "System Health Scan ON", "Missing Feature Detection ON", "Broken Link Detection ON", "Protection Check ON", "Repair Proposal ON"],
    privateLocal: ["Self Diagnosis Engine", "自己診断エンジン", "System Health Scan", "Broken Link Detection", "Missing Feature Detection", "Repair Proposal", "v5.0 Diagnosis Center"],
    oneTap: ["自己診断", "健康診断", "壊れた機能検出", "未接続検出", "修復候補", "v5.0診断センター"],
    readme: ["Phase18-4", "Self Diagnosis Engine", "自己診断エンジン", "System Health Scan", "Missing Feature Detection", "Broken Link Detection", "Protection Check", "Repair Proposal", "Health Score生成"]
  };
  const MONITORED_FILES = ["index.html", "private-local.html", "README.md", "self-diagnosis-page.js", "self-repair-page.js", "repair-approval-page.js", "repair-audit-page.js", "repair-governance-dashboard.js", "governance-alert-page.js", "final-safety-lock-page.js", "global-intelligence-control-center.js", "global-network-readiness-simulator.js", "global-intelligence-network-core.js", "tests/selfDiagnosisEngine.test.js", "tests/selfRepairEngine.test.js", "tests/repairApprovalGate.test.js", "tests/repairAuditRollback.test.js", "tests/repairGovernanceDashboard.test.js", "tests/governanceAlertPriority.test.js", "tests/finalSafetyLockReleaseReadiness.test.js", "tests/globalIntelligenceControlCenter.test.js", "tests/globalNetworkReadinessSimulator.test.js", "tests/globalIntelligenceNetworkCore.test.js", ...DATABASE_FILES];
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const scoreChecks = (checks) => checks.length ? clamp((checks.filter((item) => item.ok).length / checks.length) * 100) : 100;
  const asText = (value) => typeof value === "string" ? value : JSON.stringify(value ?? "");
  const hasConflictMarker = (text) => /^(<<<<<<<|=======|>>>>>>>)(?: .*)?$/m.test(text);
  const isExternalLink = (href) => /^(?:https?:|mailto:|tel:|javascript:|#)/i.test(href || "");
  const cleanLink = (href) => decodeURIComponent(String(href || "").split("#")[0].split("?")[0]).replace(/^\.\//, "");
  const extractLinksFromHtml = (html, source) => Array.from(asText(html).matchAll(/href=["']([^"']+)["']/gi), (match) => ({ source, href: match[1] }));

  function normalizeSnapshot(snapshot = {}) {
    const source = snapshot.files || {};
    const files = source instanceof Map ? Object.fromEntries(source) : { ...source };
    return { files, links: Array.isArray(snapshot.links) ? snapshot.links : [], generatedAt: snapshot.generatedAt || new Date().toISOString() };
  }
  function markerChecks(text, markers, scope) {
    return markers.map((marker) => ({ id: `${scope}:${marker}`, label: marker, scope, ok: text.includes(marker) }));
  }
  function validateJsonFiles(files) {
    return Object.entries(files).filter(([path]) => path.endsWith(".json")).map(([path, value]) => {
      try { JSON.parse(asText(value)); return { id: `json:${path}`, label: path, scope: "json", ok: true }; }
      catch (error) { return { id: `json:${path}`, label: path, scope: "json", ok: false, detail: error.message }; }
    });
  }
  function validateJavaScriptFiles(files) {
    return Object.entries(files).filter(([path]) => path.endsWith(".js")).map(([path, value]) => {
      try { new Function(asText(value)); return { id: `javascript:${path}`, label: path, scope: "javascript", ok: true }; }
      catch (error) { return { id: `javascript:${path}`, label: path, scope: "javascript", ok: false, detail: error.message }; }
    });
  }
  function buildRepairProposals(anomalies) {
    const first = (type) => anomalies.find((item) => item.type === type);
    const proposal = (type, target, action) => ({ type, target: target || null, action, priority: target ? "HIGH" : "NONE" });
    return {
      nextFile: proposal("file", first("missing-file")?.target || first("javascript-syntax")?.target || first("conflict-marker")?.target, "次に修復すべきファイル"),
      nextDatabase: proposal("database", first("missing-database")?.target, "次に追加すべきDB"),
      nextTest: proposal("test", first("missing-test")?.target, "次に追加すべきテスト"),
      nextPage: proposal("page", first("broken-link")?.target || first("unconnected-page")?.target, "次に接続すべきページ"),
      nextDashboard: proposal("dashboard", first("dashboard-missing")?.target, "次に更新すべきDashboard"),
      nextPrivateLocal: proposal("private-local", first("private-local-missing")?.target, "次に更新すべきprivate-local.html"),
      nextReadme: proposal("readme", first("readme-missing")?.target, "次に更新すべきREADME")
    };
  }
  function diagnose(snapshot = {}) {
    const { files, links, generatedAt } = normalizeSnapshot(snapshot);
    const allText = Object.values(files).map(asText).join("\n");
    const indexText = asText(files["index.html"]);
    const privateText = asText(files["private-local.html"]);
    const readmeText = asText(files["README.md"]);
    const engineChecks = [
      { id: "engine:self-diagnosis", label: "Self Diagnosis Engine", scope: "engine", ok: Object.hasOwn(files, "self-diagnosis-page.js") },
      { id: "engine:self-repair", label: "Self Repair & Auto Improvement Engine", scope: "engine", ok: Object.hasOwn(files, "self-repair-page.js") },
      { id: "engine:repair-approval", label: "Repair Plan Approval Gate", scope: "engine", ok: Object.hasOwn(files, "repair-approval-page.js") },
      { id: "engine:repair-audit", label: "Repair Execution Audit & Rollback Plan Engine", scope: "engine", ok: Object.hasOwn(files, "repair-audit-page.js") },
      { id: "engine:repair-governance", label: "Global Repair Governance Dashboard", scope: "engine", ok: Object.hasOwn(files, "repair-governance-dashboard.js") },
      { id: "engine:governance-alert", label: "Governance Alert & Priority Recommendation Engine", scope: "engine", ok: Object.hasOwn(files, "governance-alert-page.js") },
      { id: "engine:final-safety-lock", label: "Final Safety Lock & Release Readiness Gate", scope: "engine", ok: Object.hasOwn(files, "final-safety-lock-page.js") },
      { id: "engine:global-control-center", label: "Global Intelligence Control Center", scope: "engine", ok: Object.hasOwn(files, "global-intelligence-control-center.js") },
      { id: "engine:global-network-readiness", label: "Global Intelligence Network Readiness Simulator", scope: "engine", ok: Object.hasOwn(files, "global-network-readiness-simulator.js") },
      { id: "engine:global-network-core", label: "Global Intelligence Network Core Skeleton", scope: "engine", ok: Object.hasOwn(files, "global-intelligence-network-core.js") },
      ...PROTECTED_FEATURES.slice(1).map((feature) => ({ id: `engine:${feature.id}`, label: feature.label, scope: "engine", ok: feature.markers.every((marker) => allText.includes(marker)) }))
    ];
    const databaseChecks = DATABASE_FILES.map((path) => ({ id: `database:${path}`, label: path, scope: "database", ok: Object.hasOwn(files, path) }));
    const dashboardChecks = markerChecks(indexText, UI_MARKERS.dashboard, "dashboard");
    const privateChecks = markerChecks(privateText, UI_MARKERS.privateLocal, "private-local");
    const menuChecks = markerChecks(privateText, UI_MARKERS.oneTap, "menu");
    const readmeChecks = markerChecks(readmeText, UI_MARKERS.readme, "readme");
    const testChecks = [
      { id: "test:self-diagnosis", label: "tests/selfDiagnosisEngine.test.js", scope: "test", ok: Object.hasOwn(files, "tests/selfDiagnosisEngine.test.js") },
      { id: "test:self-repair", label: "tests/selfRepairEngine.test.js", scope: "test", ok: Object.hasOwn(files, "tests/selfRepairEngine.test.js") },
      { id: "test:repair-approval", label: "tests/repairApprovalGate.test.js", scope: "test", ok: Object.hasOwn(files, "tests/repairApprovalGate.test.js") },
      { id: "test:repair-audit", label: "tests/repairAuditRollback.test.js", scope: "test", ok: Object.hasOwn(files, "tests/repairAuditRollback.test.js") },
      { id: "test:repair-governance", label: "tests/repairGovernanceDashboard.test.js", scope: "test", ok: Object.hasOwn(files, "tests/repairGovernanceDashboard.test.js") },
      { id: "test:governance-alert", label: "tests/governanceAlertPriority.test.js", scope: "test", ok: Object.hasOwn(files, "tests/governanceAlertPriority.test.js") },
      { id: "test:final-safety-lock", label: "tests/finalSafetyLockReleaseReadiness.test.js", scope: "test", ok: Object.hasOwn(files, "tests/finalSafetyLockReleaseReadiness.test.js") },
      { id: "test:global-control-center", label: "tests/globalIntelligenceControlCenter.test.js", scope: "test", ok: Object.hasOwn(files, "tests/globalIntelligenceControlCenter.test.js") },
      { id: "test:global-network-readiness", label: "tests/globalNetworkReadinessSimulator.test.js", scope: "test", ok: Object.hasOwn(files, "tests/globalNetworkReadinessSimulator.test.js") },
      { id: "test:global-network-core", label: "tests/globalIntelligenceNetworkCore.test.js", scope: "test", ok: Object.hasOwn(files, "tests/globalIntelligenceNetworkCore.test.js") }
    ];
    const protectionChecks = PROTECTED_FEATURES.map((feature) => ({ id: `protection:${feature.id}`, label: feature.label, scope: "protection", ok: feature.markers.every((marker) => allText.includes(marker)) }));
    const jsonChecks = validateJsonFiles(files);
    const javascriptChecks = validateJavaScriptFiles(files);
    const conflictChecks = Object.entries(files).map(([path, value]) => ({ id: `conflict:${path}`, label: path, scope: "conflict", ok: !hasConflictMarker(asText(value)) }));
    const linkChecks = links.filter((link) => !isExternalLink(link.href)).map((link) => { const target = cleanLink(link.href) || link.source || "index.html"; return { id: `link:${link.source || "index.html"}:${target}`, label: target, scope: "link", ok: Object.hasOwn(files, target), source: link.source || "index.html" }; });
    const linkedTargets = new Set(links.map((link) => cleanLink(link.href)).filter(Boolean));
    const pageChecks = Object.keys(files).filter((path) => path.endsWith(".html") && !["index.html", "private-local.html"].includes(path)).map((path) => ({ id: `page:${path}`, label: path, scope: "page", ok: linkedTargets.has(path) }));
    const anomalies = [];
    const addFailures = (checks, type) => checks.filter((check) => !check.ok).forEach((check) => anomalies.push({ type, target: check.label, scope: check.scope, detail: check.detail || "未検出" }));
    [[engineChecks, "missing-feature"], [databaseChecks, "missing-database"], [dashboardChecks, "dashboard-missing"], [privateChecks, "private-local-missing"], [menuChecks, "one-tap-unconnected"], [readmeChecks, "readme-missing"], [testChecks, "missing-test"], [protectionChecks, "protected-target-missing"], [jsonChecks, "json-invalid"], [javascriptChecks, "javascript-syntax"], [conflictChecks, "conflict-marker"], [linkChecks, "broken-link"], [pageChecks, "unconnected-page"]].forEach(([checks, type]) => addFailures(checks, type));
    MONITORED_FILES.filter((path) => !Object.hasOwn(files, path)).forEach((path) => { if (!DATABASE_FILES.includes(path) && path !== "tests/selfDiagnosisEngine.test.js") anomalies.push({ type: "missing-file", target: path, scope: "file", detail: "監視対象ファイルなし" }); });
    const scores = {
      engineHealthScore: scoreChecks(engineChecks), dbHealthScore: scoreChecks([...databaseChecks, ...jsonChecks]), dashboardHealthScore: scoreChecks(dashboardChecks), menuHealthScore: scoreChecks([...privateChecks, ...menuChecks, ...linkChecks]), testHealthScore: scoreChecks(testChecks), protectionHealthScore: scoreChecks(protectionChecks)
    };
    scores.systemHealthScore = clamp(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length);
    return { phase: PHASE, engineVersion: ENGINE_VERSION, officialRelease: OFFICIAL_RELEASE, racingOs: OS_VERSION, generatedAt, status: anomalies.length === 0 ? "HEALTHY" : scores.systemHealthScore >= 80 ? "ATTENTION" : "REPAIR REQUIRED", scores, checks: { engines: engineChecks, databases: databaseChecks, dashboard: dashboardChecks, privateLocal: privateChecks, oneTapMenu: menuChecks, readme: readmeChecks, tests: testChecks, protection: protectionChecks, json: jsonChecks, javascript: javascriptChecks, conflicts: conflictChecks, links: linkChecks, pages: pageChecks }, anomalies, repairProposals: buildRepairProposals(anomalies) };
  }
  function persistReport(report, storage) {
    if (!storage) return report;
    let history = [];
    try { history = JSON.parse(storage.getItem("selfDiagnosisHistory") || "[]"); } catch (_) { history = []; }
    history.unshift(report);
    storage.setItem("selfDiagnosisLatest", JSON.stringify(report));
    storage.setItem("selfDiagnosisHistory", JSON.stringify(history.slice(0, 50)));
    return report;
  }
  async function buildBrowserSnapshot(doc = document, fetcher = fetch) {
    const fetchPath = async (path) => { try { const response = await fetcher(path, { cache: "no-store" }); return [path, response.ok ? await response.text() : undefined]; } catch (_) { return [path, undefined]; } };
    const entries = await Promise.all(MONITORED_FILES.map(fetchPath));
    const files = Object.fromEntries(entries.filter((entry) => entry[1] !== undefined));
    files["index.html"] = doc.documentElement.outerHTML;
    const links = [...Array.from(doc.querySelectorAll("a[href]")).map((anchor) => ({ source: "index.html", href: anchor.getAttribute("href") })), ...extractLinksFromHtml(files["private-local.html"], "private-local.html")];
    const linkTargets = Array.from(new Set(links.filter((link) => !isExternalLink(link.href)).map((link) => cleanLink(link.href)).filter(Boolean))).filter((path) => !Object.hasOwn(files, path));
    const linkedEntries = await Promise.all(linkTargets.map(fetchPath));
    linkedEntries.filter((entry) => entry[1] !== undefined).forEach(([path, content]) => { files[path] = content; });
    return { files, links };
  }
  function renderReport(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#self-diagnosis-status", report.status);
    [["system", "systemHealthScore"], ["engine", "engineHealthScore"], ["db", "dbHealthScore"], ["dashboard", "dashboardHealthScore"], ["menu", "menuHealthScore"], ["test", "testHealthScore"], ["protection", "protectionHealthScore"]].forEach(([id, key]) => set(`#self-diagnosis-${id}-score`, report.scores[key]));
    set("#self-diagnosis-anomalies", report.anomalies.length);
    const proposal = Object.values(report.repairProposals).find((item) => item.target);
    set("#self-diagnosis-repair", proposal ? `${proposal.action}: ${proposal.target}` : "修復候補なし");
    set("#self-diagnosis-updated", report.generatedAt);
    return report;
  }
  async function runBrowserDiagnosis(options = {}) {
    const doc = options.document || document;
    const report = diagnose(await buildBrowserSnapshot(doc, options.fetch || fetch));
    persistReport(report, options.storage || window.localStorage);
    return renderReport(report, doc);
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => { const button = document.querySelector("#run-self-diagnosis"); if (button) button.addEventListener("click", () => runBrowserDiagnosis().catch(() => undefined)); runBrowserDiagnosis().catch(() => undefined); window.setInterval(() => runBrowserDiagnosis().catch(() => undefined), 60000); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }
  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, OS_VERSION, DATABASE_FILES, PROTECTED_FEATURES, UI_MARKERS, MONITORED_FILES, hasConflictMarker, extractLinksFromHtml, validateJsonFiles, validateJavaScriptFiles, buildRepairProposals, diagnose, persistReport, buildBrowserSnapshot, renderReport, runBrowserDiagnosis };
});
