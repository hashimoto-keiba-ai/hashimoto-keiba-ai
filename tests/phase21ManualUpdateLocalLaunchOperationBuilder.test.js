const assert = require("assert");
const fs = require("fs");
const path = require("path");
const builder = require("../phase21-24-manual-update-local-launch-operation-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-24-manual-update-local-launch-operation-db.json");
const summary = readJson("phase21-24-manual-update-local-launch-operation-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.strictEqual(builder.PHASE, "Phase21-24");
assert.strictEqual(db.phase, "Phase21-24");
assert.strictEqual(summary.status, "PHASE21_24_MANUAL_UPDATE_LOCAL_LAUNCH_OPERATION_READY");
assert.strictEqual(db.blockedScriptPolicy.batAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedScriptPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.exeAllowed, false);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildManualUpdateLocalLaunchOperationPanel({}, () => new Date("2026-07-03T00:00:00.000Z"));
assert.strictEqual(panel.totalSteps, 9);
assert.strictEqual(panel.updatePolicy, "manual git pull from private repository");
assert.strictEqual(panel.launchPolicy, "manual private-local.html open");
assert.strictEqual(panel.workingTreeCleanRequired, true);
assert.strictEqual(panel.blockedScriptPolicy.exeAllowed, false);
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));

assert.ok(index.includes('id="phase21-24-manual-update-local-launch-operation"'));
assert.ok(index.includes('<script src="phase21-24-manual-update-local-launch-operation-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-24-manual-update-local-launch-operation"'));
assert.ok(readme.includes("Phase21-24"));
assert.ok(readme.includes("git pull origin main"));
assert.ok(readme.includes("private-local.html"));

const newFiles = [
  "phase21-24-manual-update-local-launch-operation-db.json",
  "phase21-24-manual-update-local-launch-operation-summary-db.json",
  "phase21-24-manual-update-local-launch-operation-builder.js",
  "tests/phase21ManualUpdateLocalLaunchOperationBuilder.test.js"
];
for (const file of newFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be a launcher/executable`);
}

for (const source of [db, summary]) {
  assert.notStrictEqual(source.githubPagesRequired, true);
  assert.notStrictEqual(source.externalApiAllowed, true);
  assert.notStrictEqual(source.publicDeliveryAllowed, true);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-24-manual-update-local-launch-operation-list") {
      return {
        textContent: "old",
        appendChild(row) { rendered.push(row.textContent); }
      };
    }
    return { textContent: "" };
  },
  createElement() {
    return { className: "", textContent: "" };
  }
};
builder.renderManualUpdateLocalLaunchOperationPanel(panel, fakeDoc);
assert.strictEqual(rendered.length, 9);

console.log("Phase21-24 manual update local launch operation builder test passed");
