const STORAGE_KEYS = {
  releaseAuditReports: "releaseAuditReports",
  releaseManagerReports: "releaseManagerReports",
  finalHealthCheckReports: "finalHealthCheckReports",
  productionReadinessAuditReports: "productionReadinessAuditReports",
  productionOperationScores: "productionOperationScores",
  performanceDashboardReports: "performanceDashboardReports"
};

const auditTargets = [
  { id: "ai-index", name: "AI指数", weight: 6, source: "aiRanking" },
  { id: "divine-hole-ai", name: "神穴AI", weight: 5, source: "holeRanking" },
  { id: "risky-favorite-ai", name: "危険人気馬AI", weight: 5, source: "riskRanking" },
  { id: "trifecta-generator", name: "三連単生成", weight: 5, source: "ticketEngine" },
  { id: "win5-generator", name: "WIN5生成", weight: 5, source: "win5" },
  { id: "future-simulator", name: "未来シミュレーター", weight: 4, source: "simulation" },
  { id: "ev-monitor", name: "EV監視", weight: 5, source: "evMonitor" },
  { id: "divine-race-detector", name: "神レース検出", weight: 4, source: "raceDetector" },
  { id: "battle-race-selector", name: "勝負レース選定", weight: 5, source: "battleRace" },
  { id: "fund-allocation", name: "資金配分", weight: 5, source: "fundAllocation" },
  { id: "bankroll-management", name: "資金管理", weight: 5, source: "bankroll" },
  { id: "race-db", name: "実戦レースDB", weight: 4, source: "raceDatabase" },
  { id: "weakness-analysis", name: "AI弱点分析", weight: 4, source: "weaknessAnalysis" },
  { id: "self-learning", name: "自己学習", weight: 5, source: "selfLearning" },
  { id: "auto-weight-tuning", name: "重み自動調整", weight: 4, source: "weightTuning" },
  { id: "course-evolution", name: "コース別自己進化", weight: 4, source: "courseEvolution" },
  { id: "roi-optimization", name: "ROI最適化", weight: 5, source: "roiOptimization" },
  { id: "integration-dashboard", name: "完全統合ダッシュボード", weight: 6, source: "integrationDashboard" },
  { id: "backup-restore", name: "バックアップ/復元", weight: 5, source: "backupRestore" },
  { id: "version-manager", name: "Version Manager", weight: 6, source: "versionManager" }
];

const dashboardData = {
  races: [
    { course: "東京競馬場", race: "11R", name: "安田記念", surface: "芝1600m", going: "良", pace: "M-H", confidence: "A", topHorse: "グランアステリオン", edge: "+18.4" },
    { course: "京都競馬場", race: "11R", name: "水無月S", surface: "芝1200m", going: "稍重", pace: "H", confidence: "B+", topHorse: "サクラヴェローチェ", edge: "+12.9" },
    { course: "阪神競馬場", race: "10R", name: "灘S", surface: "ダ1800m", going: "良", pace: "M", confidence: "B", topHorse: "ミヤビファルコン", edge: "+9.7" }
  ],
  aiRanking: [
    { rank: 1, horse: "グランアステリオン", race: "東京11R", score: 92.8, value: 128 },
    { rank: 2, horse: "サクラヴェローチェ", race: "京都11R", score: 91.4, value: 112 },
    { rank: 3, horse: "レッドブリッツ", race: "東京11R", score: 89.7, value: 121 }
  ],
  auditBase: {
    aiRanking: 96,
    holeRanking: 94,
    riskRanking: 93,
    ticketEngine: 91,
    win5: 95,
    simulation: 88,
    evMonitor: 92,
    raceDetector: 90,
    battleRace: 93,
    fundAllocation: 91,
    bankroll: 92,
    raceDatabase: 89,
    weaknessAnalysis: 87,
    selfLearning: 90,
    weightTuning: 88,
    courseEvolution: 86,
    roiOptimization: 91,
    integrationDashboard: 94,
    backupRestore: 90,
    versionManager: 96
  }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseStoredJson(storage, key, fallback) {
  if (!storage || typeof storage.getItem !== "function") {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function latestEntry(value) {
  if (Array.isArray(value)) {
    return value[value.length - 1] || {};
  }
  if (value && Array.isArray(value.reports)) {
    return value.reports[value.reports.length - 1] || {};
  }
  return value || {};
}

class HashimotoReleaseAuditEngine {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== "undefined" ? localStorage : null);
    this.now = options.now || (() => new Date());
    this.targets = options.targets || auditTargets;
    this.baseScores = options.baseScores || dashboardData.auditBase;
  }

  readContext() {
    const releaseManager = latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.releaseManagerReports, {}));
    const health = latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.finalHealthCheckReports, {}));
    const readiness = latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.productionReadinessAuditReports, {}));
    const operation = latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.productionOperationScores, {}));
    const performance = latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.performanceDashboardReports, {}));

    return { releaseManager, health, readiness, operation, performance };
  }

  scoreTarget(target, context) {
    const base = Number(this.baseScores[target.source] || 82);
    const releaseBoost = Number(context.releaseManager.completionScore || context.releaseManager.completion || 92) >= 90 ? 4 : -4;
    const healthScore = Number(context.health.healthScore || context.health.score || 91);
    const readinessScore = Number(context.readiness.readinessScore || context.readiness.score || 90);
    const operationScore = Number(context.operation.operationScore || context.operation.score || 91);
    const performanceScore = Number(context.performance.performanceScore || context.performance.score || 90);
    const averageExternal = (healthScore + readinessScore + operationScore + performanceScore) / 4;
    const storageOk = context.releaseManager.localStorageIntegrity !== false && context.health.localStorageIntegrity !== false;
    const criticalErrors = Number(context.health.criticalErrors || context.releaseManager.criticalErrors || 0);
    const adjusted = base * 0.76 + averageExternal * 0.2 + releaseBoost + (storageOk ? 3 : -9) - criticalErrors * 8;

    return Math.round(clamp(adjusted, 0, 100));
  }

  resultFromScore(score) {
    if (score >= 90) return "正常";
    if (score >= 80) return "要確認";
    if (score >= 70) return "警告";
    return "エラー";
  }

  issueSeverity(score) {
    if (score < 70) return "重大";
    if (score < 82) return "中";
    if (score < 90) return "軽微";
    return null;
  }

  releaseStage(score, issues) {
    const criticalCount = issues.filter((issue) => issue.severity === "重大").length;
    const mediumCount = issues.filter((issue) => issue.severity === "中").length;

    if (score >= 95 && criticalCount === 0 && mediumCount === 0) return "正式版";
    if (score >= 90 && criticalCount === 0) return "RC版";
    if (score >= 80 && criticalCount === 0) return "ベータ版";
    if (score >= 65) return "アルファ版";
    return "開発版";
  }

  buildPriority(issue) {
    if (issue.severity === "重大") return `最優先: ${issue.target}のエラーを解消し、再監査を実行`;
    if (issue.severity === "中") return `高: ${issue.target}の監査材料を確認し、スコア80以上へ改善`;
    return `通常: ${issue.target}の不足項目を整理し、正式版基準へ引き上げ`;
  }

  generateReport() {
    const context = this.readContext();
    const targetResults = this.targets.map((target) => {
      const score = this.scoreTarget(target, context);
      return {
        id: target.id,
        name: target.name,
        weight: target.weight,
        completion: score,
        releaseScore: Math.round(clamp(score - Math.max(0, 90 - score) * 0.4, 0, 100)),
        result: this.resultFromScore(score)
      };
    });

    const totalWeight = targetResults.reduce((sum, target) => sum + target.weight, 0);
    const completion = Math.round(targetResults.reduce((sum, target) => sum + target.completion * target.weight, 0) / totalWeight);
    const issues = targetResults
      .map((target) => {
        const severity = this.issueSeverity(target.completion);
        return severity
          ? {
              target: target.name,
              severity,
              score: target.completion,
              detail: `${target.name}は${target.result}です。完成度${target.completion}%のため改善対象です。`
            }
          : null;
      })
      .filter(Boolean);
    const severityPenalty = issues.reduce((sum, issue) => sum + (issue.severity === "重大" ? 12 : issue.severity === "中" ? 6 : 2), 0);
    const releaseScore = Math.round(clamp(completion - severityPenalty, 0, 100));
    const judgment = this.releaseStage(releaseScore, issues);
    const report = {
      version: "v7.4",
      date: this.now().toISOString(),
      auditTargets: targetResults,
      completion,
      releaseScore,
      judgment,
      issues,
      priorities: issues.map((issue, index) => ({
        rank: index + 1,
        severity: issue.severity,
        action: this.buildPriority(issue)
      }))
    };

    this.saveReport(report);
    return report;
  }

  saveReport(report) {
    if (!this.storage || typeof this.storage.setItem !== "function") {
      return;
    }

    const current = parseStoredJson(this.storage, STORAGE_KEYS.releaseAuditReports, []);
    const reports = Array.isArray(current) ? current : [];
    reports.push(report);
    this.storage.setItem(STORAGE_KEYS.releaseAuditReports, JSON.stringify(reports.slice(-20)));
  }
}

let currentAuditReport = null;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderOverview() {
  setText("stat-ai", `${dashboardData.aiRanking.length}頭`);
  setText("stat-release-audit", "v7.4");
  setText("stat-release-score", currentAuditReport ? currentAuditReport.releaseScore : "--");
  setText("stat-release-judgment", currentAuditReport ? currentAuditReport.judgment : "未監査");
}

function renderRaceMonitor() {
  const target = document.getElementById("race-monitor");
  if (!target) return;
  target.innerHTML = dashboardData.races
    .map(
      (race) => `
        <article class="race-card">
          <span class="race-meta">${race.course} ${race.race}</span>
          <strong>${race.name}</strong>
          <div class="race-row">
            <span>${race.surface}</span>
            <span>馬場 ${race.going}</span>
            <span>展開 ${race.pace}</span>
          </div>
          <div class="race-kpi">
            <span>軸 ${race.topHorse}</span>
            <span>優位 ${race.edge}</span>
            <span>信頼 ${race.confidence}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAuditReport(report) {
  currentAuditReport = report;
  renderOverview();

  setText("audit-completion", `${report.completion}%`);
  setText("audit-release-score", report.releaseScore);
  setText("audit-judgment", report.judgment);
  setText("audit-updated-at", new Date(report.date).toLocaleString("ja-JP"));

  const targetList = document.getElementById("audit-targets");
  if (targetList) {
    targetList.innerHTML = report.auditTargets
      .map(
        (target) => `
          <tr>
            <td>${target.name}</td>
            <td><span class="audit-result ${target.result}">${target.result}</span></td>
            <td>${target.completion}%</td>
            <td>${target.releaseScore}</td>
          </tr>
        `
      )
      .join("");
  }

  const issueList = document.getElementById("audit-issues");
  if (issueList) {
    issueList.innerHTML = report.issues.length
      ? report.issues
          .map(
            (issue) => `
              <li>
                <strong class="severity ${issue.severity}">${issue.severity}</strong>
                <span>${issue.detail}</span>
              </li>
            `
          )
          .join("")
      : `<li><strong class="severity ok">正常</strong><span>重大・中・軽微の問題はありません。</span></li>`;
  }

  const priorityList = document.getElementById("audit-priorities");
  if (priorityList) {
    priorityList.innerHTML = report.priorities.length
      ? report.priorities.map((item) => `<li><span>${item.rank}</span>${item.action}</li>`).join("")
      : `<li><span>OK</span>正式リリース可能な状態です。</li>`;
  }
}

function exportAuditJson() {
  if (!currentAuditReport) {
    return;
  }

  const blob = new Blob([JSON.stringify(currentAuditReport, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `release-audit-${currentAuditReport.version}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function bootDashboard() {
  const engine = new HashimotoReleaseAuditEngine();
  renderRaceMonitor();
  renderAuditReport(engine.generateReport());

  const runButton = document.getElementById("run-release-audit");
  if (runButton) {
    runButton.addEventListener("click", () => renderAuditReport(engine.generateReport()));
  }

  const exportButton = document.getElementById("export-release-audit");
  if (exportButton) {
    exportButton.addEventListener("click", exportAuditJson);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootDashboard);
}

if (typeof module !== "undefined") {
  module.exports = {
    HashimotoReleaseAuditEngine,
    STORAGE_KEYS,
    auditTargets,
    parseStoredJson
  };
}
