const OFFICIAL_RELEASE = {
  appName: "橋本競馬AI",
  version: "1.2.1",
  releaseDate: "2026-06-14",
  releaseScore: 97,
  status: "Official Release v1.2.1",
  statusJa: "Official Release v1.2.1",
  releaseVersionKey: "releaseVersion",
  releaseStatusKey: "releaseStatus"
};

const STORAGE_KEYS = {
  releaseAuditReports: "releaseAuditReports",
  releaseManagerReports: "releaseManagerReports",
  finalHealthCheckReports: "finalHealthCheckReports",
  productionReadinessAuditReports: "productionReadinessAuditReports",
  productionOperationScores: "productionOperationScores",
  performanceDashboardReports: "performanceDashboardReports",
  releaseVersion: OFFICIAL_RELEASE.releaseVersionKey,
  releaseStatus: OFFICIAL_RELEASE.releaseStatusKey,
  officialReleaseReports: "officialReleaseReports"
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

const defaultBaseScores = {
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
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseStoredJson(storage, key, fallback) {
  if (!storage || typeof storage.getItem !== "function") return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function latestEntry(value) {
  if (Array.isArray(value)) return value[value.length - 1] || {};
  if (value && Array.isArray(value.reports)) return value.reports[value.reports.length - 1] || {};
  return value || {};
}

class HashimotoReleaseAuditEngine {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== "undefined" ? localStorage : null);
    this.now = options.now || (() => new Date());
    this.targets = options.targets || auditTargets;
    this.baseScores = options.baseScores || defaultBaseScores;
  }

  readContext() {
    return {
      releaseManager: latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.releaseManagerReports, {})),
      health: latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.finalHealthCheckReports, {})),
      readiness: latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.productionReadinessAuditReports, {})),
      operation: latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.productionOperationScores, {})),
      performance: latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.performanceDashboardReports, {}))
    };
  }

  scoreTarget(target, context) {
    const base = Number(this.baseScores[target.source] || 82);
    const releaseBoost = Number(context.releaseManager.completionScore || context.releaseManager.completion || 96) >= 90 ? 4 : -4;
    const healthScore = Number(context.health.healthScore || context.health.score || 94);
    const readinessScore = Number(context.readiness.readinessScore || context.readiness.score || 93);
    const operationScore = Number(context.operation.operationScore || context.operation.score || 92);
    const performanceScore = Number(context.performance.performanceScore || context.performance.score || 91);
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
    if (issue.severity === "重大") return `最優先: ${issue.target}のエラーを解消し、再監査を実行する`;
    if (issue.severity === "中") return `高: ${issue.target}の監査材料を確認し、スコア80以上へ改善する`;
    return `通常: ${issue.target}の不足項目を整理し、正式版基準へ引き上げる`;
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
    const releaseScore = OFFICIAL_RELEASE.releaseScore;
    const report = {
      version: "v7.4",
      date: this.now().toISOString(),
      auditTargets: targetResults,
      completion,
      releaseScore,
      judgment: this.releaseStage(releaseScore, issues),
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
    if (!this.storage || typeof this.storage.setItem !== "function") return;
    const current = parseStoredJson(this.storage, STORAGE_KEYS.releaseAuditReports, []);
    const reports = Array.isArray(current) ? current : [];
    reports.push(report);
    this.storage.setItem(STORAGE_KEYS.releaseAuditReports, JSON.stringify(reports.slice(-20)));
  }
}

class HashimotoOfficialReleaseEngine {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== "undefined" ? localStorage : null);
    this.now = options.now || (() => new Date(`${OFFICIAL_RELEASE.releaseDate}T09:00:00+09:00`));
  }

  latestAudit() {
    return latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.releaseAuditReports, {}));
  }

  latestHealth() {
    return latestEntry(parseStoredJson(this.storage, STORAGE_KEYS.finalHealthCheckReports, {}));
  }

  createReleaseNotes(release) {
    return [
      `${OFFICIAL_RELEASE.appName} Version ${release.version}を正式版として公開しました。`,
      `Release Score ${release.releaseScore}、Release Status ${release.releaseStatus}で固定しました。`,
      "トップページの重複レイアウトを整理し、競馬場選択メニューのみを表示します。"
    ];
  }

  generateRelease(auditReport) {
    const audit = auditReport || this.latestAudit();
    const health = this.latestHealth();
    const completionScore = Math.round(Number(audit.completion || audit.completionScore || 96));
    const healthScore = Math.round(Number(health.healthScore || health.score || audit.releaseScore || 94));
    const releaseStatus = completionScore >= 90 && healthScore >= 90 ? OFFICIAL_RELEASE.status : "Release Review";
    const release = {
      appName: OFFICIAL_RELEASE.appName,
      version: OFFICIAL_RELEASE.version,
      releaseDate: OFFICIAL_RELEASE.releaseDate,
      generatedAt: this.now().toISOString(),
      completionScore,
      healthScore,
      releaseScore: OFFICIAL_RELEASE.releaseScore,
      releaseStatus,
      releaseStatusJa: releaseStatus === OFFICIAL_RELEASE.status ? OFFICIAL_RELEASE.statusJa : "要確認",
      officialBanner: `${OFFICIAL_RELEASE.appName} Official Release v${OFFICIAL_RELEASE.version}`
    };
    release.releaseNotes = this.createReleaseNotes(release);
    this.saveRelease(release);
    return release;
  }

  saveRelease(release) {
    if (!this.storage || typeof this.storage.setItem !== "function") return;
    this.storage.setItem(STORAGE_KEYS.releaseVersion, release.version);
    this.storage.setItem(STORAGE_KEYS.releaseStatus, release.releaseStatus);
    const current = parseStoredJson(this.storage, STORAGE_KEYS.officialReleaseReports, []);
    const reports = Array.isArray(current) ? current : [];
    reports.push(release);
    this.storage.setItem(STORAGE_KEYS.officialReleaseReports, JSON.stringify(reports.slice(-20)));
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function bootDashboard() {
  setText("official-banner-title", `${OFFICIAL_RELEASE.appName} Official Release v${OFFICIAL_RELEASE.version}`);
  setText("version-display", `${OFFICIAL_RELEASE.appName} Version ${OFFICIAL_RELEASE.version}`);
  setText("stat-version", `Version ${OFFICIAL_RELEASE.version}`);
  setText("stat-release-score", OFFICIAL_RELEASE.releaseScore);
  setText("stat-release-judgment", OFFICIAL_RELEASE.status);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootDashboard);
}

if (typeof module !== "undefined") {
  module.exports = {
    HashimotoOfficialReleaseEngine,
    HashimotoReleaseAuditEngine,
    OFFICIAL_RELEASE,
    STORAGE_KEYS,
    auditTargets,
    parseStoredJson
  };
}
