const assert = require("assert");
const { HashimotoReleaseAuditEngine, STORAGE_KEYS, auditTargets } = require("../dashboard.js");
function createStorage(seed = {}) { const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)])); return { getItem: (key) => store.has(key) ? store.get(key) : null, setItem: (key, value) => store.set(key, value), read: (key) => JSON.parse(store.get(key)) }; }
function createEngine(seed, baseScores) { return new HashimotoReleaseAuditEngine({ storage: createStorage(seed), baseScores, now: () => new Date("2026-06-15T09:00:00.000Z") }); }
const readySeed = { [STORAGE_KEYS.releaseManagerReports]: [{ completionScore: 96, criticalErrors: 0, localStorageIntegrity: true }], [STORAGE_KEYS.finalHealthCheckReports]: [{ healthScore: 94, criticalErrors: 0, localStorageIntegrity: true }], [STORAGE_KEYS.productionReadinessAuditReports]: [{ readinessScore: 93 }], [STORAGE_KEYS.productionOperationScores]: [{ operationScore: 92 }], [STORAGE_KEYS.performanceDashboardReports]: [{ performanceScore: 91 }] };
const readyReport = createEngine(readySeed).generateReport();
assert.strictEqual(readyReport.version, "v7.4");
assert.strictEqual(readyReport.auditTargets.length, auditTargets.length);
assert.ok(readyReport.completion >= 90);
assert.strictEqual(readyReport.releaseScore, 101);
assert.strictEqual(readyReport.judgment, "正式版");
const problemSeed = { [STORAGE_KEYS.releaseManagerReports]: [{ completionScore: 72, criticalErrors: 2, localStorageIntegrity: false }], [STORAGE_KEYS.finalHealthCheckReports]: [{ healthScore: 64, criticalErrors: 2, localStorageIntegrity: false }], [STORAGE_KEYS.productionReadinessAuditReports]: [{ readinessScore: 68 }], [STORAGE_KEYS.productionOperationScores]: [{ operationScore: 70 }], [STORAGE_KEYS.performanceDashboardReports]: [{ performanceScore: 69 }] };
const problemReport = createEngine(problemSeed, { aiRanking: 72, holeRanking: 70, riskRanking: 69, ticketEngine: 67, win5: 71, simulation: 64, evMonitor: 66, raceDatabase: 66, courseDatabase: 60, distanceDatabase: 60, selfLearning: 64, courseEvolution: 60, roiOptimization: 65, integrationDashboard: 68, versionManager: 70 }).generateReport();
assert.ok(problemReport.issues.some((issue) => issue.severity === "重大"));
assert.strictEqual(problemReport.judgment, "アルファ版");
assert.strictEqual(problemReport.priorities[0].rank, 1);
console.log("releaseAudit tests passed");
