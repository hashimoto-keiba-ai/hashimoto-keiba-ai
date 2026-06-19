(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoSelfRepairEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase18-5";
  const ENGINE_VERSION = "5.0";
  const OFFICIAL_RELEASE = "2.8";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const DIAGNOSIS_DATABASES = ["self-diagnosis-db.json", "self-diagnosis-health-db.json", "self-diagnosis-repair-db.json"];
  const REPAIR_DATABASES = ["self-repair-plan-db.json", "self-repair-rule-db.json", "self-repair-history-db.json"];
  const CATEGORIES = ["missing_file", "broken_link", "dashboard_disconnect", "db_inconsistency", "test_missing", "release_protection_risk", "private_menu_issue"];
  const CATEGORY_RULES = {
    missing_file: { priority: "HIGH", impact: "必要な機能またはページを読み込めません。", action: "既存ファイルを上書きせず、テンプレートから不足ファイルを作成する案を生成します。", operation: "create_missing_file_if_absent" },
    broken_link: { priority: "HIGH", impact: "利用者が対象機能へ移動できません。", action: "実在する接続先を確認し、リンク先だけを差し替える案を生成します。", operation: "reconnect_verified_target" },
    dashboard_disconnect: { priority: "MEDIUM", impact: "機能がDashboardに表示されません。", action: "既存パネルを保持したまま、表示バインディングを追加する案を生成します。", operation: "append_dashboard_binding" },
    db_inconsistency: { priority: "HIGH", impact: "診断履歴またはエンジン状態を安全に読み取れません。", action: "バックアップとJSON検証を前提に、既定スキーマへ補正する案を生成します。", operation: "repair_database_after_backup" },
    test_missing: { priority: "MEDIUM", impact: "機能の退行を自動検出できません。", action: "既存テストを変更せず、不足テストの雛形を追加する案を生成します。", operation: "create_test_skeleton" },
    release_protection_risk: { priority: "CRITICAL", impact: "Official Release v2.8または保護対象機能が失われる可能性があります。", action: "自動適用を禁止し、保護対象との差分確認と手動承認を要求します。", operation: "manual_protection_review" },
    private_menu_issue: { priority: "MEDIUM", impact: "private-local.htmlまたはOne Tap Menuから機能へ移動できません。", action: "既存メニューを保持したまま、不足導線を追加する案を生成します。", operation: "append_private_menu_link" }
  };
  const TYPE_CATEGORY_MAP = {
    "missing-file": "missing_file", "missing-feature": "missing_file", "javascript-syntax": "missing_file", "conflict-marker": "missing_file",
    "broken-link": "broken_link", "unconnected-page": "broken_link", "dashboard-missing": "dashboard_disconnect",
    "missing-database": "db_inconsistency", "json-invalid": "db_inconsistency", "missing-test": "test_missing",
    "protected-target-missing": "release_protection_risk", "private-local-missing": "private_menu_issue", "one-tap-unconnected": "private_menu_issue"
  };
  const PRIORITY_WEIGHT = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
  const DIAGNOSIS_FIELD_MAP = {
    brokenLinks: "broken-link",
    unconnectedPages: "unconnected-page",
    missingDatabases: "missing-database",
    missingTests: "missing-test",
    dashboardHiddenFeatures: "dashboard-missing",
    privateLocalHiddenFeatures: "private-local-missing",
    oneTapDisconnectedFeatures: "one-tap-unconnected",
    readmeMissingFeatures: "missing-file",
    jsonIntegrityErrors: "json-invalid",
    javascriptSyntaxErrors: "javascript-syntax",
    conflictMarkers: "conflict-marker",
    missingProtection: "protected-target-missing"
  };
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  function classifyAnomaly(anomaly = {}) {
    return TYPE_CATEGORY_MAP[anomaly.type] || "missing_file";
  }

  function flattenDiagnosisAnomalies(source) {
    if (Array.isArray(source)) return source;
    if (!source || typeof source !== "object") return [];
    return Object.entries(DIAGNOSIS_FIELD_MAP).flatMap(([field, type]) => {
      const values = Array.isArray(source[field]) ? source[field] : [];
      return values.map((value) => ({
        type,
        target: typeof value === "string" ? value : value.file || value.target || value.name || field,
        detail: typeof value === "string" ? `${field}: ${value}` : value.error || value.detail || field
      }));
    });
  }

  function normalizeDiagnosis(input = {}) {
    const report = input.diagnosisReport || input.latestReport || {};
    const health = input.healthDatabase || {};
    const diagnosisDb = input.diagnosisDatabase || {};
    const reportDiagnosis = report.diagnosis || report;
    const anomalies = reportDiagnosis.anomalies
      ? flattenDiagnosisAnomalies(reportDiagnosis.anomalies)
      : Array.isArray(diagnosisDb.records) ? diagnosisDb.records.flatMap((record) => record.anomalies || []) : [];
    const rawScores = reportDiagnosis.health || report.scores || health.health || health.scores || {};
    const systemHealthScore = clamp(rawScores.systemHealthScore ?? rawScores.system ?? diagnosisDb.healthScore ?? 100);
    return {
      generatedAt: report.createdAt || report.generatedAt || reportDiagnosis.diagnosedAt || diagnosisDb.updatedAt || new Date().toISOString(),
      status: reportDiagnosis.status || report.status || diagnosisDb.status || (systemHealthScore === 100 ? "HEALTHY" : "ATTENTION"),
      scores: rawScores,
      systemHealthScore,
      anomalies
    };
  }

  function buildRepairItem(anomaly, index) {
    const category = classifyAnomaly(anomaly);
    const rule = CATEGORY_RULES[category];
    return {
      id: `repair-${String(index + 1).padStart(3, "0")}`,
      category,
      sourceType: anomaly.type || "unknown",
      target: anomaly.target || anomaly.label || "unknown",
      cause: anomaly.detail || anomaly.cause || "診断エンジンが不整合を検出しました。",
      impact: rule.impact,
      priority: rule.priority,
      proposal: rule.action,
      safeOperation: {
        type: rule.operation,
        mode: EXECUTION_POLICY,
        autoExecute: false,
        requiresApproval: true,
        overwriteExisting: false,
        requiresBackup: category === "db_inconsistency",
        blockedByProtection: category === "release_protection_risk"
      }
    };
  }

  function buildSafeRepairPlan(input = {}, now = () => new Date()) {
    const diagnosis = normalizeDiagnosis(input);
    const items = diagnosis.anomalies.map(buildRepairItem)
      .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    const summary = Object.fromEntries(CATEGORIES.map((category) => [category, items.filter((item) => item.category === category).length]));
    return {
      phase: PHASE,
      engineVersion: ENGINE_VERSION,
      officialRelease: OFFICIAL_RELEASE,
      executionPolicy: EXECUTION_POLICY,
      generatedAt: now().toISOString(),
      diagnosisGeneratedAt: diagnosis.generatedAt,
      healthScore: diagnosis.systemHealthScore,
      status: diagnosis.systemHealthScore === 100 && items.length === 0 ? "NO_REPAIR_NEEDED" : "PLAN_READY",
      immediateExecution: false,
      approvalRequired: items.length > 0,
      protectedRelease: "Official Release v2.8",
      causes: items.map((item) => item.cause),
      impacts: items.map((item) => item.impact),
      priorities: items.map((item) => item.priority),
      summary,
      items
    };
  }

  function persistPlan(plan, storage) {
    if (!storage) return plan;
    let history = [];
    try { history = JSON.parse(storage.getItem("selfRepairPlanHistory") || "[]"); } catch (_) { history = []; }
    history.unshift(plan);
    storage.setItem("selfRepairLatestPlan", JSON.stringify(plan));
    storage.setItem("selfRepairPlanHistory", JSON.stringify(history.slice(0, 50)));
    return plan;
  }

  async function loadJson(path, fetcher) {
    try {
      const response = await fetcher(path, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) { return null; }
  }

  async function loadDiagnosisSources(options = {}) {
    const fetcher = options.fetch || fetch;
    const [diagnosisDatabase, healthDatabase, repairDatabase] = await Promise.all([
      loadJson("self-diagnosis-db.json", fetcher),
      loadJson("self-diagnosis-health-db.json", fetcher),
      loadJson("self-diagnosis-repair-db.json", fetcher)
    ]);
    let diagnosisReport = null;
    try {
      const storage = options.storage || window.localStorage;
      diagnosisReport = JSON.parse(storage.getItem("self-diagnosis-db.json") || storage.getItem("selfDiagnosisLatest") || "null");
    } catch (_) { diagnosisReport = null; }
    return { diagnosisReport, diagnosisDatabase, healthDatabase, repairDatabase };
  }

  function renderPlan(plan, doc = document) {
    const set = (selector, value) => { const node = doc.querySelector(selector); if (node) node.textContent = String(value); };
    set("#self-repair-status", plan.status);
    set("#self-repair-health", plan.healthScore);
    set("#self-repair-count", plan.items.length);
    set("#self-repair-critical", plan.items.filter((item) => item.priority === "CRITICAL").length);
    set("#self-repair-high", plan.items.filter((item) => item.priority === "HIGH").length);
    set("#self-repair-policy", plan.executionPolicy);
    set("#self-repair-updated", plan.generatedAt);
    const list = doc.querySelector("#self-repair-plan-list");
    if (list) {
      const rows = plan.items.length ? plan.items : [{ category: "healthy", target: "修復不要", priority: "NONE", cause: "Health Score 100", proposal: "現在の状態を維持します。" }];
      list.replaceChildren(...rows.map((item) => {
        const row = doc.createElement("li");
        row.textContent = `[${item.priority}] ${item.category}: ${item.target} / ${item.cause} / ${item.proposal}`;
        return row;
      }));
    }
    return plan;
  }

  async function runBrowserRepairPlanning(options = {}) {
    const doc = options.document || document;
    const storage = options.storage || window.localStorage;
    const plan = buildSafeRepairPlan(await loadDiagnosisSources({ ...options, storage }));
    persistPlan(plan, storage);
    return renderPlan(plan, doc);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const boot = () => {
      const button = document.querySelector("#run-self-repair-plan");
      if (button) button.addEventListener("click", () => runBrowserRepairPlanning().catch(() => undefined));
      runBrowserRepairPlanning().catch(() => undefined);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  return { PHASE, ENGINE_VERSION, OFFICIAL_RELEASE, EXECUTION_POLICY, DIAGNOSIS_DATABASES, REPAIR_DATABASES, CATEGORIES, CATEGORY_RULES, TYPE_CATEGORY_MAP, DIAGNOSIS_FIELD_MAP, classifyAnomaly, flattenDiagnosisAnomalies, normalizeDiagnosis, buildRepairItem, buildSafeRepairPlan, persistPlan, loadDiagnosisSources, renderPlan, runBrowserRepairPlanning };
});
