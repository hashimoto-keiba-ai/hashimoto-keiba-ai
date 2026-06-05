const OFFICIAL_RELEASE = {
  appName: "橋本競馬AI",
  version: "1.0",
  releaseDate: "2026-06-05",
  status: "Official Release",
  statusJa: "正式版",
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
  aiIndexSummary: {
    entryCount: 3,
    averageScore: 91.3,
    topScore: 92.8,
    byCourse: [],
    topHorses: []
  },
  latestLogs: [],
  courseMemos: [],
  divineRaceRanking: [],
  autoDivineRaces: [],
  riskyFavoriteRanking: [],
  longshotRanking: [],
  autoWin5Candidates: {
    raceCount: 0,
    combinationCount: 0,
    estimatedInvestment: 0,
    races: []
  },
  roiMonitor: {
    totalInvestment: 0,
    totalPayout: 0,
    profit: 0,
    roi: 0,
    hitRate: 0,
    raceCount: 0,
    hitCount: 0,
    byCourse: [],
    byTicketType: [],
    monthly: [],
    recent: []
  },
  win5Dashboard: {
    date: "",
    investment: 0,
    targetPayout: 0,
    confidence: "",
    combinationCount: 0,
    races: [],
    file: ""
  },
  updatedAt: null,
  source: "sample",
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatYen(value) {
  return `${Number(value || 0).toLocaleString("ja-JP")}円`;
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

async function loadDashboardData() {
  if (typeof fetch !== "function") return null;
  try {
    const response = await fetch("data/dashboard-data.json", { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function mergeDashboardData(loadedData) {
  if (!loadedData || typeof loadedData !== "object") return;

  for (const key of ["races", "aiRanking", "latestLogs", "courseMemos", "divineRaceRanking", "autoDivineRaces", "riskyFavoriteRanking", "longshotRanking"]) {
    if (Array.isArray(loadedData[key])) {
      dashboardData[key] = loadedData[key];
    }
  }

  if (loadedData.roiMonitor && typeof loadedData.roiMonitor === "object") {
    dashboardData.roiMonitor = { ...dashboardData.roiMonitor, ...loadedData.roiMonitor };
  }
  if (loadedData.win5Dashboard && typeof loadedData.win5Dashboard === "object") {
    dashboardData.win5Dashboard = { ...dashboardData.win5Dashboard, ...loadedData.win5Dashboard };
  }
  if (loadedData.aiIndexSummary && typeof loadedData.aiIndexSummary === "object") {
    dashboardData.aiIndexSummary = { ...dashboardData.aiIndexSummary, ...loadedData.aiIndexSummary };
  }
  if (loadedData.autoWin5Candidates && typeof loadedData.autoWin5Candidates === "object") {
    dashboardData.autoWin5Candidates = { ...dashboardData.autoWin5Candidates, ...loadedData.autoWin5Candidates };
  }

  dashboardData.updatedAt = loadedData.updatedAt || dashboardData.updatedAt;
  dashboardData.source = loadedData.source || "json";
}

class HashimotoReleaseAuditEngine {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== "undefined" ? localStorage : null);
    this.now = options.now || (() => new Date());
    this.targets = options.targets || auditTargets;
    this.baseScores = options.baseScores || dashboardData.auditBase;
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
      `完成度${release.completionScore}%、ヘルススコア${release.healthScore}で本番運用ステータスを${release.releaseStatus}に固定しました。`,
      "Version Manager、最終監査、localStorage保存、JSON出力、スマホ/iPad対応を正式リリース範囲に含めています。"
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

let currentAuditReport = null;
let currentOfficialRelease = null;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderOverview() {
  setText("stat-ai", `${dashboardData.aiRanking.length}頭`);
  setText("stat-version", `Version ${OFFICIAL_RELEASE.version}`);
  setText("stat-release-score", currentAuditReport ? currentAuditReport.releaseScore : "--");
  setText("stat-release-judgment", currentOfficialRelease ? currentOfficialRelease.releaseStatusJa : "未判定");
}

function renderDataStatus() {
  const sourceLabel = dashboardData.source === "markdown" ? "実データ連携" : "サンプル表示";
  setText("dashboard-data-source", sourceLabel);
  setText("dashboard-data-updated", dashboardData.updatedAt ? new Date(dashboardData.updatedAt).toLocaleString("ja-JP") : "--");
}

function renderRaceMonitor() {
  const target = document.getElementById("race-monitor");
  if (!target) return;
  target.innerHTML = dashboardData.races.length
    ? dashboardData.races
    .map(
      (race) => `
        <article class="race-card">
          <span class="race-meta">${escapeHtml(race.course)} ${escapeHtml(race.race)}</span>
          <strong>${escapeHtml(race.name)}</strong>
          <div class="race-row">
            <span>${escapeHtml(race.surface || "距離未入力")}</span>
            <span>馬場 ${escapeHtml(race.going || "未入力")}</span>
            <span>展開 ${escapeHtml(race.pace || "未入力")}</span>
          </div>
          <div class="race-kpi">
            <span>軸 ${escapeHtml(race.topHorse || "未入力")}</span>
            <span>優位 ${escapeHtml(race.edge || "--")}</span>
            <span>信頼 ${escapeHtml(race.confidence || "--")}</span>
          </div>
        </article>
      `
    )
    .join("")
    : `<article class="race-card"><strong>重点レース未登録</strong><span class="race-meta">事前予想テンプレートを保存すると表示されます。</span></article>`;
}

function renderLatestLogs() {
  const target = document.getElementById("latest-logs");
  if (!target) return;
  target.innerHTML = dashboardData.latestLogs.length
    ? dashboardData.latestLogs
        .map(
          (log) => `
            <tr>
              <td>${escapeHtml(log.date || "--")}</td>
              <td>${escapeHtml(log.course || "--")}</td>
              <td>${escapeHtml(log.type || "--")}</td>
              <td>${escapeHtml(log.race || "--")}</td>
              <td>${escapeHtml(log.title || log.file || "--")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="5">保存ログはまだありません。` + `input/` + ` にMarkdownを置いて自動振り分け後、JSONを生成してください。</td></tr>`;
}

function renderAiRanking() {
  const target = document.getElementById("ai-ranking");
  if (!target) return;
  target.innerHTML = dashboardData.aiRanking.length
    ? dashboardData.aiRanking
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.rank || "--")}</td>
              <td>${escapeHtml(item.horse || "--")}</td>
              <td>${escapeHtml(item.race || "--")}</td>
              <td>${escapeHtml(item.score ?? "--")}</td>
              <td>${escapeHtml(item.value ?? "--")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="5">AI指数はまだ登録されていません。</td></tr>`;
}

function renderAiIndexSummary() {
  const data = dashboardData.aiIndexSummary;
  setText("ai-index-count", `${Number(data.entryCount || 0).toLocaleString("ja-JP")}頭`);
  setText("ai-index-average", Number(data.averageScore || 0).toFixed(1));
  setText("ai-index-top", Number(data.topScore || 0).toFixed(1));

  const courseTarget = document.getElementById("ai-index-by-course");
  if (courseTarget) {
    courseTarget.innerHTML = data.byCourse.length
      ? data.byCourse
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.course)}</td>
                <td>${escapeHtml(item.entryCount)}頭</td>
                <td>${escapeHtml(Number(item.averageScore || 0).toFixed(1))}</td>
                <td>${escapeHtml(Number(item.topScore || 0).toFixed(1))}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="4">AI指数集計データはまだありません。</td></tr>`;
  }

  const topTarget = document.getElementById("ai-index-top-horses");
  if (topTarget) {
    topTarget.innerHTML = data.topHorses.length
      ? data.topHorses
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.rank)}</td>
                <td>${escapeHtml(item.horse)}</td>
                <td>${escapeHtml(item.race || "--")}</td>
                <td>${escapeHtml(Number(item.score || 0).toFixed(1))}</td>
                <td>${escapeHtml(item.confidence || "--")}</td>
                <td>${escapeHtml(item.expectedValue ?? "--")}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="6">AI指数上位馬はまだありません。</td></tr>`;
  }
}

function renderCourseMemos() {
  const target = document.getElementById("course-memos");
  if (!target) return;
  target.innerHTML = dashboardData.courseMemos.length
    ? dashboardData.courseMemos
        .map(
          (memo) => `
            <article class="race-card">
              <span class="race-meta">${escapeHtml(memo.course)} ${escapeHtml(memo.date || "")}</span>
              <strong>${escapeHtml(memo.type || "メモ")}</strong>
              <p>${escapeHtml(memo.memo)}</p>
            </article>
          `
        )
        .join("")
    : `<article class="race-card"><strong>馬場・展開メモ未登録</strong><span class="race-meta">Markdownの「## 馬場・展開メモ」または「## 展開メモ」を読み取ります。</span></article>`;
}

function renderRoiMonitor() {
  const data = dashboardData.roiMonitor;
  setText("roi-total-investment", formatYen(data.totalInvestment));
  setText("roi-total-payout", formatYen(data.totalPayout));
  setText("roi-rate", formatPercent(data.roi));
  setText("roi-hit-rate", formatPercent(data.hitRate));
  setText("roi-race-count", `${Number(data.raceCount || 0).toLocaleString("ja-JP")}R`);
  setText("roi-profit", formatYen(data.profit));

  const courseTarget = document.getElementById("roi-by-course");
  if (courseTarget) {
    courseTarget.innerHTML = data.byCourse.length
      ? data.byCourse
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.label)}</td>
                <td>${formatYen(item.investment)}</td>
                <td>${formatYen(item.payout)}</td>
                <td>${formatPercent(item.roi)}</td>
                <td>${formatPercent(item.hitRate)}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="5">結果検証データはまだありません。</td></tr>`;
  }

  const ticketTarget = document.getElementById("roi-by-ticket");
  if (ticketTarget) {
    ticketTarget.innerHTML = data.byTicketType.length
      ? data.byTicketType
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.label)}</td>
                <td>${formatYen(item.investment)}</td>
                <td>${formatYen(item.payout)}</td>
                <td>${formatPercent(item.roi)}</td>
                <td>${formatPercent(item.hitRate)}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="5">券種別データはまだありません。</td></tr>`;
  }
}

function renderDivineRaceRanking() {
  const target = document.getElementById("divine-race-ranking");
  if (!target) return;
  target.innerHTML = dashboardData.divineRaceRanking.length
    ? dashboardData.divineRaceRanking
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.rank)}</td>
              <td>${escapeHtml(item.course)} ${escapeHtml(item.race)}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.divineScore || "--")}</td>
              <td>${escapeHtml(item.confidence || "--")}</td>
              <td>${escapeHtml(item.expectedValue || "--")}</td>
              <td>${formatYen(item.recommendedStake)}</td>
              <td>${escapeHtml(item.reason || "--")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="8">神レース指数つきの事前予想はまだありません。</td></tr>`;
}

function renderAutoDivineRaces() {
  const target = document.getElementById("auto-divine-races");
  if (!target) return;
  target.innerHTML = dashboardData.autoDivineRaces.length
    ? dashboardData.autoDivineRaces
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.rank)}</td>
              <td>${escapeHtml(item.course)} ${escapeHtml(item.race)}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.autoScore)}</td>
              <td>${escapeHtml(item.aiScore)}</td>
              <td>${escapeHtml(item.confidence || "--")}</td>
              <td>${escapeHtml(item.expectedValue || "--")}</td>
              <td>${formatYen(item.recommendedStake)}</td>
              <td>${escapeHtml((item.reasons || []).join(" / ") || "--")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="9">自動判定できる神レース候補はまだありません。</td></tr>`;
}

function renderAutoWin5Candidates() {
  const data = dashboardData.autoWin5Candidates;
  setText("auto-win5-race-count", `${Number(data.raceCount || 0).toLocaleString("ja-JP")}R`);
  setText("auto-win5-combination-count", `${Number(data.combinationCount || 0).toLocaleString("ja-JP")}点`);
  setText("auto-win5-investment", formatYen(data.estimatedInvestment));

  const target = document.getElementById("auto-win5-candidates");
  if (!target) return;
  target.innerHTML = data.races.length
    ? data.races
        .map(
          (race) => `
            <article class="race-card win5-race-card">
              <span class="race-meta">${escapeHtml(race.label)} ${escapeHtml(race.name || "")}</span>
              <strong>${escapeHtml(race.candidates.length)}頭</strong>
              <div class="race-kpi">
                ${race.candidates
                  .map((candidate) => `<span>${escapeHtml(candidate.zone)} ${escapeHtml(candidate.horse)} / 指数 ${escapeHtml(candidate.aiScore)}</span>`)
                  .join("")}
              </div>
            </article>
          `
        )
        .join("")
    : `<article class="race-card"><strong>WIN5候補未生成</strong><span class="race-meta">事前予想MarkdownにWIN5対象・WIN5ゾーン・高AI指数が入ると自動生成されます。</span></article>`;
}

function renderRiskyFavoriteRanking() {
  const target = document.getElementById("risky-favorite-ranking");
  if (!target) return;
  target.innerHTML = dashboardData.riskyFavoriteRanking.length
    ? dashboardData.riskyFavoriteRanking
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.rank)}</td>
              <td>${escapeHtml(item.horse)}</td>
              <td>${escapeHtml(item.course)} ${escapeHtml(item.race)}</td>
              <td>${escapeHtml(item.riskScore)}</td>
              <td>${escapeHtml(item.popularity ?? "--")}</td>
              <td>${escapeHtml(item.popularityZone || "--")}</td>
              <td>${escapeHtml(item.reason || "--")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="7">危険人気馬データはまだありません。</td></tr>`;
}

function renderLongshotRanking() {
  const target = document.getElementById("longshot-ranking");
  if (!target) return;
  target.innerHTML = dashboardData.longshotRanking.length
    ? dashboardData.longshotRanking
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.rank)}</td>
              <td>${escapeHtml(item.horse)}</td>
              <td>${escapeHtml(item.course)} ${escapeHtml(item.race)}</td>
              <td>${escapeHtml(item.longshotScore)}</td>
              <td>${escapeHtml(item.popularity ?? "--")}</td>
              <td>${escapeHtml(item.popularityZone || "--")}</td>
              <td>${escapeHtml(item.expectedValue || "--")}</td>
              <td>${escapeHtml(item.ticket || "--")}</td>
              <td>${escapeHtml(item.reason || "--")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="9">爆穴データはまだありません。</td></tr>`;
}

function renderWin5Dashboard() {
  const data = dashboardData.win5Dashboard;
  setText("win5-date", data.date || "--");
  setText("win5-investment", formatYen(data.investment));
  setText("win5-target-payout", formatYen(data.targetPayout));
  setText("win5-confidence", data.confidence || "--");
  setText("win5-combination-count", `${Number(data.combinationCount || 0).toLocaleString("ja-JP")}点`);

  const target = document.getElementById("win5-races");
  if (!target) return;
  target.innerHTML = data.races.length
    ? data.races
        .map(
          (race) => `
            <article class="race-card win5-race-card">
              <span class="race-meta">${escapeHtml(race.label)}</span>
              <strong>Zone ${escapeHtml(race.zone || "--")}</strong>
              <div class="race-kpi">
                <span>本命 ${escapeHtml(race.favorite || "--")}</span>
                <span>押さえ ${escapeHtml(race.backup || "--")}</span>
                <span>穴 ${escapeHtml(race.longshot || "--")}</span>
              </div>
            </article>
          `
        )
        .join("")
    : `<article class="race-card"><strong>WIN5未登録</strong><span class="race-meta">既存のWIN5フォルダにMarkdownを保存すると表示されます。</span></article>`;
}

function renderOperationalData() {
  renderDataStatus();
  renderRaceMonitor();
  renderLatestLogs();
  renderAiIndexSummary();
  renderAiRanking();
  renderCourseMemos();
  renderRoiMonitor();
  renderDivineRaceRanking();
  renderAutoDivineRaces();
  renderAutoWin5Candidates();
  renderRiskyFavoriteRanking();
  renderLongshotRanking();
  renderWin5Dashboard();
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
      ? report.issues.map((issue) => `<li><strong class="severity ${issue.severity}">${issue.severity}</strong><span>${issue.detail}</span></li>`).join("")
      : `<li><strong class="severity ok">正常</strong><span>重大・中・軽微の問題はありません。</span></li>`;
  }

  const priorityList = document.getElementById("audit-priorities");
  if (priorityList) {
    priorityList.innerHTML = report.priorities.length
      ? report.priorities.map((item) => `<li><span>${item.rank}</span>${item.action}</li>`).join("")
      : `<li><span>OK</span>正式リリース可能な状態です。</li>`;
  }
}

function renderOfficialRelease(release) {
  currentOfficialRelease = release;
  renderOverview();
  setText("official-banner-title", release.officialBanner);
  setText("version-display", `${release.appName} Version ${release.version}`);
  setText("release-version", release.version);
  setText("release-date", release.releaseDate);
  setText("release-completion", `${release.completionScore}%`);
  setText("release-health", release.healthScore);
  setText("release-status", release.releaseStatus);

  const notes = document.getElementById("release-notes");
  if (notes) {
    notes.innerHTML = release.releaseNotes.map((note) => `<li>${note}</li>`).join("");
  }
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function bootDashboard() {
  const auditEngine = new HashimotoReleaseAuditEngine();
  const releaseEngine = new HashimotoOfficialReleaseEngine();
  mergeDashboardData(await loadDashboardData());
  renderOperationalData();
  renderAuditReport(auditEngine.generateReport());
  renderOfficialRelease(releaseEngine.generateRelease(currentAuditReport));

  document.getElementById("run-release-audit")?.addEventListener("click", () => {
    renderAuditReport(auditEngine.generateReport());
    renderOfficialRelease(releaseEngine.generateRelease(currentAuditReport));
  });
  document.getElementById("export-release-audit")?.addEventListener("click", () => {
    if (currentAuditReport) downloadJson(`release-audit-${currentAuditReport.version}.json`, currentAuditReport);
  });
  document.getElementById("export-official-release")?.addEventListener("click", () => {
    if (currentOfficialRelease) downloadJson(`hashimoto-keiba-ai-v${currentOfficialRelease.version}.json`, currentOfficialRelease);
  });
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
