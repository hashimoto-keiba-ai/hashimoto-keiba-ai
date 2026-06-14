const assert = require("assert");
const { HashimotoReleaseAuditEngine, STORAGE_KEYS, auditTargets } = require("../dashboard.js");

function createStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return { getItem: (key) => store.has(key) ? store.get(key) : null, setItem: (key, value) => store.set(key, value), read: (key) => JSON.parse(store.get(key)) };
}

function createEngine(seed, baseScores) {
  return new HashimotoReleaseAuditEngine({ storage: createStorage(seed), baseScores, now: () => new Date("2026-06-15T09:00:00.000Z") });
}

const readySeed = {
  [STORAGE_KEYS.releaseManagerReports]: [{ completionScore: 96, criticalErrors: 0, localStorageIntegrity: true }],
  [STORAGE_KEYS.finalHealthCheckReports]: [{ healthScore: 94, criticalErrors: 0, localStorageIntegrity: true }],
  [STORAGE_KEYS.productionReadinessAuditReports]: [{ readinessScore: 93 }],
  [STORAGE_KEYS.productionOperationScores]: [{ operationScore: 92 }],
  [STORAGE_KEYS.performanceDashboardReports]: [{ performanceScore: 91 }]
};

const readyEngine = createEngine(readySeed);
const readyReport = readyEngine.generateReport();
assert.strictEqual(readyReport.version, "v7.4");
assert.strictEqual(readyReport.auditTargets.length, auditTargets.length);
assert.ok(readyReport.completion >= 90, "completion should be release-level");
assert.ok(readyReport.releaseScore >= 90, "release score should be RC or higher");
assert.ok(["RC版", "正式版"].includes(readyReport.judgment));
assert.ok(Array.isArray(readyEngine.storage.read(STORAGE_KEYS.releaseAuditReports)));

const problemSeed = {
  [STORAGE_KEYS.releaseManagerReports]: [{ completionScore: 72, criticalErrors: 2, localStorageIntegrity: false }],
  [STORAGE_KEYS.finalHealthCheckReports]: [{ healthScore: 64, criticalErrors: 2, localStorageIntegrity: false }],
  [STORAGE_KEYS.productionReadinessAuditReports]: [{ readinessScore: 68 }],
  [STORAGE_KEYS.productionOperationScores]: [{ operationScore: 70 }],
  [STORAGE_KEYS.performanceDashboardReports]: [{ performanceScore: 69 }]
};

const problemEngine = createEngine(problemSeed, { aiRanking: 72, holeRanking: 70, riskRanking: 69, ticketEngine: 67, win5: 71, simulation: 64, evMonitor: 66, raceDetector: 62, battleRace: 65, fundAllocation: 63, bankroll: 60, raceDatabase: 66, weaknessAnalysis: 61, selfLearning: 64, weightTuning: 62, courseEvolution: 60, roiOptimization: 65, integrationDashboard: 68, backupRestore: 63, versionManager: 70 });
const problemReport = problemEngine.generateReport();
assert.ok(problemReport.issues.some((issue) => issue.severity === "重大"));
assert.ok(["開発版", "アルファ版"].includes(problemReport.judgment));
assert.strictEqual(problemReport.priorities[0].rank, 1);
assert.match(problemReport.priorities[0].action, /最優先|高|通常/);

console.log("releaseAudit tests passed");
