const assert = require("assert");
const {
  HashimotoOfficialReleaseEngine,
  OFFICIAL_RELEASE,
  PHASE15_DASHBOARD,
  PHASE16_DASHBOARD,
  STORAGE_KEYS
} = require("../dashboard.js");

function createStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    readRaw(key) {
      return store.get(key);
    },
    readJson(key) {
      return JSON.parse(store.get(key));
    }
  };
}

const storage = createStorage({
  [STORAGE_KEYS.releaseAuditReports]: [
    {
      version: "v7.4",
      completion: 96,
      releaseScore: 112,
      judgment: "正式版"
    }
  ],
  [STORAGE_KEYS.finalHealthCheckReports]: [
    {
      healthScore: 94,
      criticalErrors: 0,
      localStorageIntegrity: true
    }
  ]
});

const engine = new HashimotoOfficialReleaseEngine({
  storage,
  now: () => new Date("2026-06-05T09:00:00.000Z")
});
const release = engine.generateRelease();

assert.strictEqual(OFFICIAL_RELEASE.version, "3.0");
assert.strictEqual(release.version, "3.0");
assert.strictEqual(release.releaseDate, "2026-06-16");
assert.strictEqual(release.completionScore, 96);
assert.strictEqual(release.healthScore, 94);
assert.strictEqual(release.releaseScore, 113);
assert.strictEqual(release.releaseStatus, "Hashimoto Racing AI Version 3.0 Development");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseVersion), "3.0");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseStatus), "Hashimoto Racing AI Version 3.0 Development");
assert.strictEqual(storage.readJson(STORAGE_KEYS.officialReleaseReports)[0].version, "3.0");
assert.ok(release.releaseNotes.some((note) => note.includes("Version 3.0")));
assert.strictEqual(PHASE15_DASHBOARD.rcStatus, "Official Release v2.8");
assert.strictEqual(PHASE16_DASHBOARD.developmentStatus, "Hashimoto Racing AI Version 3.0 Development");
assert.strictEqual(PHASE16_DASHBOARD.superCoreEngine, "Hashimoto Super Core Engine v3.0");
assert.ok(PHASE16_DASHBOARD.developmentTargets.includes("未来予測エンジン"));
assert.deepStrictEqual(PHASE15_DASHBOARD.modules, ["研究所", "自己進化", "AI秘書", "WIN5", "Profit"]);

console.log("releaseVersion tests passed");
