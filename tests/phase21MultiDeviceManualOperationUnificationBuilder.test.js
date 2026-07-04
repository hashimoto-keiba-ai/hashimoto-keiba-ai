const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-25-multi-device-manual-operation-unification-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-25-multi-device-manual-operation-unification-db.json");
const summary = readJson("phase21-25-multi-device-manual-operation-unification-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-25-multi-device-manual-operation-unification-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-25");
assert.strictEqual(db.phase, "Phase21-25");
assert.strictEqual(summary.status, "PHASE21_25_MULTI_DEVICE_MANUAL_OPERATION_UNIFICATION_READY");
assert.strictEqual(summary.totalDevices, 3);
assert.strictEqual(db.blockedScriptPolicy.batAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedScriptPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.exeAllowed, false);
assert.strictEqual(db.blockedScriptPolicy.forceAllowSecuritySoftwareAllowed, false);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildMultiDeviceManualOperationUnificationPanel({ db, summary }, () => new Date("2026-07-04T00:00:00.000Z"));
assert.strictEqual(panel.totalDevices, 3);
assert.strictEqual(panel.updatePolicy, "manual git pull from private repository");
assert.strictEqual(panel.launchPolicy, "manual private-local.html open");
assert.strictEqual(panel.workingTreeCleanRequired, true);
assert.strictEqual(panel.blockedScriptPolicy.exeAllowed, false);
assert.ok(panel.devices.some((device) => device.name === "Company PC"));
assert.ok(panel.devices.some((device) => device.name === "Home PC"));
assert.ok(panel.devices.some((device) => device.name === "iPad"));
assert.ok(panel.records.some((record) => record.command === "git pull origin main"));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(index.includes('id="phase21-25-multi-device-manual-operation-unification"'));
assert.ok(index.includes('<script src="phase21-25-multi-device-manual-operation-unification-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-25-multi-device-manual-operation-unification"'));
assert.ok(readme.includes("Phase21-25"));
assert.ok(readme.includes("会社PC"));
assert.ok(readme.includes("自宅PC"));
assert.ok(readme.includes("iPad"));
assert.ok(readme.includes("git pull origin main"));
assert.ok(readme.includes("private-local.html"));
assert.ok(readme.includes("GitHub Pages 不要"));
assert.ok(readme.includes("Private repository / local first"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

for (const source of [db, summary, panel]) {
  assert.notStrictEqual(source.githubPagesRequired, true);
  assert.notStrictEqual(source.externalApiAllowed, true);
  assert.notStrictEqual(source.publicDeliveryAllowed, true);
}

const renderedDevices = [];
const renderedSteps = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-25-device-list") {
      return {
        textContent: "old",
        appendChild(row) { renderedDevices.push(row.textContent); }
      };
    }
    if (selector === "#phase21-25-step-list") {
      return {
        textContent: "old",
        appendChild(row) { renderedSteps.push(row.textContent); }
      };
    }
    return { textContent: "" };
  },
  createElement() {
    return { className: "", textContent: "" };
  }
};
builder.renderMultiDeviceManualOperationUnificationPanel(panel, fakeDoc);
assert.strictEqual(renderedDevices.length, 3);
assert.ok(renderedDevices.some((line) => line.includes("Company PC")));
assert.ok(renderedSteps.some((line) => line.includes("private-local.html")));

console.log("Phase21-25 multi device manual operation unification builder test passed");
