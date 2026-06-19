(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoGovernanceAlertEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-9";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const AUTO_EXECUTION_ALLOWED = false;
  const ALERT_CATEGORIES = ["info", "warning", "critical", "protected", "plan_only_notice", "mock_execution_notice"];
  const DATABASES = ["governance-alert-db.json", "governance-priority-recommendation-db.json"];
  const REQUIRED_DATABASES = [
    "self-diagnosis-db.json", "self-diagnosis-history-db.json", "self-diagnosis-rule-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json",
    "self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json", "repair-approval-history-db.json",
    "repair-audit-history-db.json", "repair-rollback-plan-db.json", "repair-governance-db.json"
  ];
  const REQUIRED_TESTS = ["tests/selfDiagnosisEngine.test.js", "tests/selfRepairEngine.test.js", "tests/repairApprovalGate.test.js", "tests/repairAuditRollback.test.js", "tests/repairGovernanceDashboard.test.js", "tests/governanceAlertPriority.test.js"];
  const STORAGE_KEYS = {
    governance: "repairGovernanceLatest",
    latest: "governanceAlertLatest",
    history: "governanceAlertHistory",
    previousGovernance: "governanceAlertPreviousSnapshot"
  };
  const PRIORITY_WEIGHT = { P0: 4, P1: 3, P2: 2, P3: 1 };
  const readStoredJson = (storage, key) => {
    try { return JSON.parse(storage?.getItem(key) || "null"); } catch (_) { return null; }
  };

  const createAlert = (data) => ({
    alert_id: data.alert_id,
    category: data.category,
    severity: data.severity,
    source_phase: data.source_phase,
    source_file: data.source_file,
    message: data.message,
    reason: data.reason,
    impact: data.impact,
    recommended_action: data.recommended_action,
    priority: data.priority,
    auto_execution_allowed: false
  });

  function buildAlertReport(governance = {}, inventory = {}, previousGovernance = null, now = () => new Date()) {
    const summary = governance.summary || {};
    const previousSummary = previousGovernance?.summary || {};
    const healthScore = Number(summary.healthScore ?? 100);
    const blockedCount = Number(summary.blockedCount || 0);
    const previousBlocked = Number(previousSummary.blockedCount || 0);
    const protectedCount = Number(summary.protectedReleaseBlockedCount || 0);
    const executedMockCount = Number(summary.executedMockCount || 0);
    const alerts = [];
    let sequence = 0;
    const add = (data) => alerts.push(createAlert({ alert_id: `alert-${String(++sequence).padStart(3, "0")}`, ...data }));

    add({ category: "protected", severity: "PROTECTED", source_phase: "Official Release v2.8", source_file: "repair-governance-db.json", message: "Official Release v2.8 protection is active.", reason: "永久保存版は常時保護対象です。", impact: "保護対象への変更は実行できません。", recommended_action: "保護状態を維持し、変更候補は手動監査してください。", priority: "P0" });
    add({ category: "plan_only_notice", severity: "INFO", source_phase: PHASE, source_file: "governance-alert-page.js", message: "PLAN_ONLY governance is active.", reason: "自動実行を許可しない安全方針です。", impact: "アラートは提案のみでファイルを変更しません。", recommended_action: "内容を確認し、承認ゲートと監査を経由してください。", priority: "P3" });

    if (healthScore < 100) add({ category: healthScore < 80 ? "critical" : "warning", severity: healthScore < 80 ? "CRITICAL" : "WARNING", source_phase: "Phase18-4", source_file: "self-diagnosis-health-db.json", message: `Health Score is ${healthScore}.`, reason: "System Health Scoreが100未満です。", impact: "未接続または不足項目が存在する可能性があります。", recommended_action: "Self Diagnosisの異常一覧を確認し、安全な修復プランを生成してください。", priority: healthScore < 80 ? "P0" : "P1" });
    if (blockedCount > previousBlocked) add({ category: "warning", severity: "HIGH", source_phase: "Phase18-6 / Phase18-7", source_file: "repair-governance-db.json", message: `Blocked count increased from ${previousBlocked} to ${blockedCount}.`, reason: "blocked件数が前回より増加しました。", impact: "承認または監査を通過できない候補が増えています。", recommended_action: "新規blocked項目の理由と対象ファイルを優先確認してください。", priority: "P1" });
    if (protectedCount > 0) add({ category: "protected", severity: "PROTECTED", source_phase: "Phase18-7", source_file: "repair-audit-history-db.json", message: `${protectedCount} protected release item(s) are blocked.`, reason: "Official Release v2.8関連候補を検出しました。", impact: "保護対象のため実行できません。", recommended_action: "自動処理せず、保護差分を手動監査してください。", priority: "P0" });
    if (executedMockCount > 0) add({ category: "mock_execution_notice", severity: "INFO", source_phase: "Phase18-6", source_file: "repair-approval-history-db.json", message: `${executedMockCount} executed_mock item(s) recorded.`, reason: "Mock実行履歴があります。", impact: "実ファイルは変更されていません。", recommended_action: "Phase18-7の監査結果とロールバック計画を確認してください。", priority: "P2" });
    if (governance.executionAllowed !== false || summary.executionAllowed !== false) add({ category: "critical", severity: "CRITICAL", source_phase: "Phase18-8", source_file: "repair-governance-dashboard.js", message: "executionAllowed safety invariant is violated.", reason: "executionAllowedがfalse以外です。", impact: "安全方針に反する実行許可状態です。", recommended_action: "実行を停止し、executionAllowedをfalseへ戻して保護監査してください。", priority: "P0" });

    const missingDatabases = REQUIRED_DATABASES.filter((file) => inventory.databases?.[file] === false);
    const missingRoutes = ["index.html#governance-alert-engine", "private-local.html#governance-alert-engine"].filter((route) => inventory.routes?.[route] === false);
    const missingTests = REQUIRED_TESTS.filter((file) => inventory.tests?.[file] === false);
    missingDatabases.forEach((file) => add({ category: "critical", severity: "HIGH", source_phase: PHASE, source_file: file, message: `Required database is missing: ${file}`, reason: "統合監視に必要なDBを読み取れません。", impact: "アラート判定が不完全になります。", recommended_action: "DBを作成または接続し、JSON検証を実行してください。", priority: "P1" }));
    missingRoutes.forEach((route) => add({ category: "warning", severity: "WARNING", source_phase: PHASE, source_file: route.split("#")[0], message: `Governance alert route is missing: ${route}`, reason: "Dashboardまたはprivate-local導線がありません。", impact: "利用者が警告画面へ移動できません。", recommended_action: "既存導線を保持したまま警告パネルへのリンクを追加してください。", priority: "P2" }));
    missingTests.forEach((file) => add({ category: "warning", severity: "WARNING", source_phase: PHASE, source_file: file, message: `Required test is missing: ${file}`, reason: "関連テストを確認できません。", impact: "退行を自動検出できません。", recommended_action: "不足テストを追加し、PLAN_ONLY不変条件を検証してください。", priority: "P2" }));

    alerts.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      executionAllowed: false,
      generatedAt: now().toISOString(),
      alerts,
      recommendations: alerts.map((alert) => ({ alert_id: alert.alert_id, priority: alert.priority, action: alert.recommended_action, auto_execution_allowed: false }))
    };
  }

  async function probe(path, fetcher) {
    try { return (await fetcher(path, { cache: "no-store" })).ok; } catch (_) { return false; }
  }

  async function containsMarker(path, marker, fetcher) {
    try {
      const response = await fetcher(path, { cache: "no-store" });
      return response.ok && (await response.text()).includes(marker);
    } catch (_) { return false; }
  }

  async function collectInventory(fetcher) {
    const databaseChecks = await Promise.all(REQUIRED_DATABASES.map(async (file) => [file, await probe(file, fetcher)]));
    const testChecks = await Promise.all(REQUIRED_TESTS.map(async (file) => [file, await probe(file, fetcher)]));
    const [indexOk, privateOk] = await Promise.all([
      containsMarker("index.html", 'id="governance-alert-engine"', fetcher),
      containsMarker("private-local.html", 'href="index.html#governance-alert-engine"', fetcher)
    ]);
    return {
      databases: Object.fromEntries(databaseChecks),
      tests: Object.fromEntries(testChecks),
      routes: { "index.html#governance-alert-engine": indexOk, "private-local.html#governance-alert-engine": privateOk }
    };
  }

  function persistReport(report, governance, storage) {
    if (!storage) return report;
    let history = [];
    try { history = JSON.parse(storage.getItem(STORAGE_KEYS.history) || "[]"); } catch (_) { history = []; }
    history.unshift(report);
    storage.setItem(STORAGE_KEYS.latest, JSON.stringify(report));
    storage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 100)));
    storage.setItem(STORAGE_KEYS.previousGovernance, JSON.stringify(governance));
    return report;
  }

  function renderReport(report, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#governance-alert-total", report.alerts.length);
    set("#governance-alert-critical", report.alerts.filter((alert) => alert.category === "critical").length);
    set("#governance-alert-warning", report.alerts.filter((alert) => alert.category === "warning").length);
    set("#governance-alert-protected", report.alerts.filter((alert) => alert.category === "protected").length);
    set("#governance-alert-execution", "false");
    set("#governance-alert-updated", report.generatedAt);
    const list = doc.querySelector("#governance-alert-list");
    if (list) list.replaceChildren(...report.alerts.map((alert) => {
      const row = doc.createElement("li");
      row.className = `governance-alert-item category-${alert.category}`;
      row.textContent = `[${alert.priority}] ${alert.alert_id} / ${alert.category} / ${alert.severity} / ${alert.source_phase} / ${alert.source_file} / ${alert.message} / ${alert.reason} / ${alert.impact} / ${alert.recommended_action} / auto:false`;
      return row;
    }));
    return report;
  }

  async function runAlertEngine(options = {}) {
    const storage = options.storage || window.localStorage;
    const fetcher = options.fetch || fetch;
    const doc = options.document || document;
    const governance = options.governance || readStoredJson(storage, STORAGE_KEYS.governance) || { executionAllowed: false, summary: { executionAllowed: false } };
    const previous = readStoredJson(storage, STORAGE_KEYS.previousGovernance);
    const report = buildAlertReport(governance, await collectInventory(fetcher), previous);
    persistReport(report, governance, storage);
    return renderReport(report, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-governance-alerts");
      if (button) button.addEventListener("click", () => runAlertEngine().catch(() => undefined));
      runAlertEngine().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, AUTO_EXECUTION_ALLOWED, ALERT_CATEGORIES, DATABASES, REQUIRED_DATABASES, REQUIRED_TESTS, STORAGE_KEYS, readStoredJson, createAlert, buildAlertReport, probe, containsMarker, collectInventory, persistReport, renderReport, runAlertEngine };
});
