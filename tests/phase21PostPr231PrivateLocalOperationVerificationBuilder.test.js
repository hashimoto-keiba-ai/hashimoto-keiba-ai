const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-37-post-pr231-private-local-operation-verification-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-37-post-pr231-private-local-operation-verification-db.json");
const summary = readJson("phase21-37-post-pr231-private-local-operation-verification-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-37-post-pr231-private-local-operation-verification-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-37");
assert.strictEqual(db.phase, "Phase21-37");
assert.strictEqual(summary.status, "PHASE21_37_POST_PR231_PRIVATE_LOCAL_OPERATION_VERIFICATION_READY");
assert.strictEqual(db.baseline, "PR #231 merged main / Phase21-36 reflected");
assert.strictEqual(db.pr231MergedConfirmationRequired, true);
assert.strictEqual(db.phase2136MainReflectionRequired, true);
assert.strictEqual(db.companyPcWorkingTreeCleanRequired, true);
assert.strictEqual(db.homePcContinuationReadyRequired, true);
assert.strictEqual(db.mainBranchOnlyAfterPull, true);
assert.strictEqual(db.featureBranchRequired, true);
assert.strictEqual(db.draftPrRequired, true);
assert.strictEqual(db.mergeAfterUserConfirmationOnly, true);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.publicDeliveryAllowed, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(db.autoExecutionAllowed, false);
assert.strictEqual(db.automaticUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticRemotePublishAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticMergeAllowed, false);
assert.strictEqual(db.blockedActionPolicy.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.suspiciousAutoRunScriptAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildPostPr231PrivateLocalOperationVerificationPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, "PR #231 merged main / Phase21-36 reflected");
assert.strictEqual(panel.planOnly, true);
assert.strictEqual(panel.protected, true);
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.localFirst, true);
assert.strictEqual(panel.pr231MergedConfirmationRequired, true);
assert.strictEqual(panel.phase2136MainReflectionRequired, true);
assert.strictEqual(panel.companyPcWorkingTreeCleanRequired, true);
assert.strictEqual(panel.homePcContinuationReadyRequired, true);
assert.strictEqual(panel.mainBranchOnlyAfterPull, true);
assert.strictEqual(panel.featureBranchRequired, true);
assert.strictEqual(panel.draftPrRequired, true);
assert.strictEqual(panel.mergeAfterUserConfirmationOnly, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.publicDeliveryAllowed, false);
assert.strictEqual(panel.externalApiAllowed, false);
assert.strictEqual(panel.autoExecutionAllowed, false);
assert.strictEqual(panel.automaticUpdateAllowed, false);
assert.strictEqual(panel.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(panel.suspiciousAutoRunScriptAllowed, false);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.handoffPolicy.includes("home PC"));
assert.ok(panel.securitySoftwarePolicy.includes("Norton"));
assert.ok(panel.records.some((record) => String(record.label).includes("PR #231")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-36")));
assert.ok(panel.records.some((record) => String(record.label).includes("Company PC")));
assert.ok(panel.records.some((record) => String(record.label).includes("Home PC")));
assert.ok(panel.records.some((record) => String(record.label).includes("Draft PR")));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPostPr231PrivateLocalOperationVerificationPanel"));
assert.ok(index.includes('id="phase21-37-post-pr231-private-local-operation-verification"'));
assert.ok(index.includes('<script src="phase21-37-post-pr231-private-local-operation-verification-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-37-post-pr231-private-local-operation-verification"'));
assert.ok(readme.includes("Phase21-37"));
assert.ok(readme.includes("PR #231"));
assert.ok(readme.includes("Phase21-36"));
assert.ok(readme.includes("Company PC"));
assert.ok(readme.includes("Home PC"));
assert.ok(readme.includes("Private Local"));
assert.ok(readme.includes("GitHub Pages not required"));
assert.ok(readme.includes("No auto publish"));
assert.ok(readme.includes("No hidden update"));
assert.ok(readme.includes("Norton"));

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
  assert.notStrictEqual(source.autoExecutionAllowed, true);
  assert.notStrictEqual(source.automaticUpdateAllowed, true);
  assert.notStrictEqual(source.hiddenBackgroundUpdateAllowed, true);
  assert.notStrictEqual(source.suspiciousAutoRunScriptAllowed, true);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-37-post-pr231-private-local-operation-verification-list") {
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
builder.renderPostPr231PrivateLocalOperationVerificationPanel(panel, fakeDoc);
assert.ok(rendered.length >= 20);
assert.ok(rendered.some((line) => line.includes("PR #231")));
assert.ok(rendered.some((line) => line.includes("No direct commit to main")));
assert.ok(rendered.some((line) => line.includes("No auto publish")));

console.log("Phase21-37 post PR231 private local operation verification builder test passed");
