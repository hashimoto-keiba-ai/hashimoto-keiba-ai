const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = require("../global-network-page.js");
const finalSystem = require("../final-system-page.js");

assert.equal(engine.OS_VERSION, "4.0", "Hashimoto Racing OS remains v4.0");
assert.equal(engine.OFFICIAL_RELEASE, "2.8", "Official Release v2.8 is protected");
assert.equal(finalSystem.PHASE, "Phase17-5", "Final autonomous OS is integrated");
assert.equal(finalSystem.SYSTEM_NAME, "Hashimoto Racing OS v4.0 Final");
assert.equal(new Set(engine.SOURCE_KEYS).size, engine.SOURCE_KEYS.length, "network sources are unique");
assert.ok(engine.SOURCE_KEYS.includes("integrated-os.json"));
assert.ok(engine.SOURCE_KEYS.includes("research-lab-db.json"));
assert.ok(engine.SOURCE_KEYS.includes("return-ai-db.json"));
assert.ok(engine.SOURCE_KEYS.includes("self-evolution-db.json"));

for (const key of Object.values(engine.DATABASE_KEYS)) {
  const db = JSON.parse(fs.readFileSync(key, "utf8"));
  assert.equal(db.osVersion, "4.0");
  assert.equal(db.officialRelease, "2.8");
  assert.deepEqual(db.records, []);
}

console.log("racing OS engine tests passed");

const selfExpansion = require("../self-expansion-page.js");
assert.equal(selfExpansion.DEVELOPMENT_VERSION, "5.0", "Version 5.0 development is active");
assert.equal(selfExpansion.OFFICIAL_RELEASE, "2.8", "Official Release v2.8 remains protected in Phase18-1");
assert.equal(selfExpansion.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");

const autoDevelopment = require("../auto-development-page.js");
assert.equal(autoDevelopment.PHASE, "Phase18-2");
assert.equal(autoDevelopment.OFFICIAL_RELEASE, "2.8");
assert.equal(autoDevelopment.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.equal(autoDevelopment.INTEGRATED_SYSTEM, "Self Expansion System v5.0");

const aiEvolution = require("../ai-evolution-page.js");
assert.equal(aiEvolution.PHASE, "Phase18-3");
assert.equal(aiEvolution.OFFICIAL_RELEASE, "2.8");
assert.equal(aiEvolution.PROTECTED_SYSTEM, "Hashimoto Racing OS v4.0 Final");
assert.deepEqual(aiEvolution.INTEGRATED_SYSTEMS, ["Self Expansion System", "Auto Development Engine"]);
