const assert = require("assert");
const fs = require("fs");
const path = require("path");
const builder = require("../phase21-23-security-software-safe-operation-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-23-security-software-safe-operation-db.json");
const summary = readJson("phase21-23-security-software-safe-operation-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.strictEqual(builder.PHASE, "Phase21-23");
assert.strictEqual(db.phase, "Phase21-23");
assert.strictEqual(summary.status, "PHASE21_23_SECURITY_SOFTWARE_SAFE_OPERATION_READY");
assert.strictEqual(db.blockedFilePolicy.doNotForceAllow, true);
assert.strictEqual(db.blockedFilePolicy.doNotAddBatPs1CmdExe, true);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildSecuritySoftwareSafeOperationPanel({}, () => new Date("2026-07-03T00:00:00.000Z"));
assert.strictEqual(panel.totalChecks, 9);
assert.strictEqual(panel.blockedFilePolicy.doNotRestoreQuarantinedFiles, true);
assert.strictEqual(panel.safeUpdatePath, "manual git pull from private repository");
assert.strictEqual(panel.safeLaunchPath, "manual private-local.html open");
assert.strictEqual(panel.dangerousLauncherExtensionsAdded, false);
assert.ok(panel.records.some((record) => record.id === "P21-23-NORTON-IDP-GENERIC"));

assert.ok(index.includes('id="phase21-23-security-software-safe-operation"'));
assert.ok(index.includes('<script src="phase21-23-security-software-safe-operation-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-23-security-software-safe-operation"'));
assert.ok(readme.includes("Phase21-23"));
assert.ok(readme.includes("IDP.Generic"));
assert.ok(readme.includes("無理に許可しない"));

const newFiles = [
  "phase21-23-security-software-safe-operation-db.json",
  "phase21-23-security-software-safe-operation-summary-db.json",
  "phase21-23-security-software-safe-operation-builder.js",
  "tests/phase21SecuritySoftwareSafeOperationBuilder.test.js"
];
for (const file of newFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be a launcher/executable`);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-23-security-software-safe-operation-list") {
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
builder.renderSecuritySoftwareSafeOperationPanel(panel, fakeDoc);
assert.strictEqual(rendered.length, 9);

console.log("Phase21-23 security software safe operation builder test passed");
