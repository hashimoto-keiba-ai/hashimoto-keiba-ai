const assert = require("assert");
const {
  HashimotoOfficialReleaseEngine,
  OFFICIAL_RELEASE,
  STORAGE_KEYS
} = require("../dashboard.js");
const finalSystem = require("../final-system-page.js");

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

assert.strictEqual(OFFICIAL_RELEASE.version, "2.8");
assert.strictEqual(release.version, "2.8");
assert.strictEqual(release.releaseDate, "2026-06-18");
assert.strictEqual(release.completionScore, 96);
assert.strictEqual(release.healthScore, 94);
assert.strictEqual(release.releaseScore, 113);
assert.strictEqual(release.releaseStatus, "Official Release v2.8");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseVersion), "2.8");
assert.strictEqual(storage.readRaw(STORAGE_KEYS.releaseStatus), "Official Release v2.8");
assert.strictEqual(storage.readJson(STORAGE_KEYS.officialReleaseReports)[0].version, "2.8");
assert.ok(release.releaseNotes.some((note) => note.includes("Version 2.8")));
assert.strictEqual(OFFICIAL_RELEASE.releaseScore, 113, "Official Release v2.8 remains protected");
assert.strictEqual(finalSystem.OFFICIAL_RELEASE, OFFICIAL_RELEASE.version, "Final System protects the same release");

console.log("releaseVersion tests passed");

const selfExpansion = require("../self-expansion-page.js");
assert.strictEqual(selfExpansion.OFFICIAL_RELEASE, OFFICIAL_RELEASE.version, "Self Expansion protects Official Release v2.8");
assert.strictEqual(selfExpansion.DEVELOPMENT_VERSION, "5.0", "Version 5.0 is a development version");
assert.strictEqual(selfExpansion.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");

const autoDevelopment = require("../auto-development-page.js");
assert.strictEqual(autoDevelopment.OFFICIAL_RELEASE, OFFICIAL_RELEASE.version, "Auto Development protects Official Release v2.8");
assert.strictEqual(autoDevelopment.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.strictEqual(autoDevelopment.INTEGRATED_SYSTEM, "Self Expansion System v5.0");

const aiEvolution = require("../ai-evolution-page.js");
assert.strictEqual(aiEvolution.OFFICIAL_RELEASE, OFFICIAL_RELEASE.version, "AI Evolution protects Official Release v2.8");
assert.strictEqual(aiEvolution.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.ok(aiEvolution.INTEGRATED_SYSTEMS.includes("Self Expansion System"));
assert.ok(aiEvolution.INTEGRATED_SYSTEMS.includes("Auto Development Engine"));
