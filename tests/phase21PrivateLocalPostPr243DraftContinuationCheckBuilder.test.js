const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-49-private-local-post-pr243-draft-continuation-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-49-private-local-post-pr243-draft-continuation-check-db.json");
const summary = readJson("phase21-49-private-local-post-pr243-draft-continuation-check-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-49-private-local-post-pr243-draft-continuation-check-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-49");
assert.strictEqual(builder.PANEL_STATUS, "phase21_49_private_local_post_pr243_draft_continuation_check_plan_only");
assert.strictEqual(db.phase, "Phase21-49");
assert.strictEqual(summary.status, "PHASE21_49_PRIVATE_LOCAL_POST_PR243_DRAFT_CONTINUATION_CHECK_READY");
assert.strictEqual(db.baseline, "Draft PR #243 remains Draft / Phase21-48 flow maintained");
assert.strictEqual(db.draftPr243RemainsDraft, true);
assert.strictEqual(db.readyForReviewAllowed, false);
assert.strictEqual(db.readyForReviewPerformed, false);
assert.strictEqual(db.mergeAllowed, false);
assert.strictEqual(db.mergePerformed, false);
assert.strictEqual(db.prCreationAllowed, false);
assert.strictEqual(db.prCreationPerformed, false);
assert.strictEqual(db.phase2148FlowMaintained, true);
assert.strictEqual(db.phase2141JapaneseTextContinuityConfirmed, true);
assert.strictEqual(db.privateLocalOperationConfirmed, true);
assert.strictEqual(db.operationRouteConsistencyConfirmed, true);
assert.strictEqual(db.readmeRecordConsistencyConfirmed, true);
assert.strictEqual(db.japaneseTextDisplayContinuityConfirmed, true);
assert.strictEqual(db.safeLocalUseConfirmed, true);
assert.strictEqual(db.planOnly, true);
assert.strictEqual(db.protected, true);
assert.strictEqual(db.draftPrOnly, true);
assert.strictEqual(db.doNotMergeYet, true);
assert.strictEqual(db.privateRepository, true);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.publicDeliveryAllowed, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(db.autoExecutionAllowed, false);
assert.strictEqual(db.deletionProcessAllowed, false);
assert.strictEqual(db.credentialOutputAllowed, false);
assert.strictEqual(db.blockedActionPolicy.readyForReviewAllowed, false);
assert.strictEqual(db.blockedActionPolicy.mergeAllowed, false);
assert.strictEqual(db.blockedActionPolicy.prCreationAllowed, false);
assert.strictEqual(db.blockedActionPolicy.automaticRemotePublishAllowed, false);
assert.strictEqual(db.blockedActionPolicy.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(db.blockedActionPolicy.externalSendAllowed, false);
assert.strictEqual(db.blockedActionPolicy.deletionProcessAllowed, false);
assert.strictEqual(db.blockedActionPolicy.credentialOutputAllowed, false);
assert.strictEqual(db.blockedActionPolicy.suspiciousAutoRunScriptAllowed, false);
assert.strictEqual(db.blockedActionPolicy.unnecessaryPublicRouteAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);
assert.strictEqual(summary.unnecessaryPublicRouteAllowed, false);

const panel = builder.buildPrivateLocalPostPr243DraftContinuationCheckPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, "Draft PR #243 remains Draft / Phase21-48 flow maintained");
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.localFirst, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.publicDeliveryAllowed, false);
assert.strictEqual(panel.autoExecutionAllowed, false);
assert.strictEqual(panel.deletionProcessAllowed, false);
assert.strictEqual(panel.credentialOutputAllowed, false);
assert.strictEqual(panel.unnecessaryPublicRouteAllowed, false);
assert.strictEqual(panel.draftPrOnly, true);
assert.strictEqual(panel.doNotMergeYet, true);
assert.strictEqual(panel.draftPr243RemainsDraft, true);
assert.strictEqual(panel.readyForReviewPerformed, false);
assert.strictEqual(panel.mergePerformed, false);
assert.strictEqual(panel.prCreationPerformed, false);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.safeLocalUsePolicy.includes("no public Pages"));
assert.ok(panel.japaneseTextContinuityPolicy.includes("Japanese text"));
assert.ok(panel.prPolicy.includes("Ready for review is not performed"));
assert.ok(panel.records.some((record) => String(record.label).includes("Draft PR #243 remains Draft")));
assert.ok(panel.records.some((record) => String(record.label).includes("Ready for review")));
assert.ok(panel.records.some((record) => String(record.label).includes("Merge is not performed")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-48")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-47")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-43")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-42")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-41")));
assert.ok(panel.records.some((record) => String(record.label).includes("index.html")));
assert.ok(panel.records.some((record) => String(record.label).includes("README")));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));
assert.ok(panel.records.some((record) => String(record.label).includes("deletion process")));
assert.ok(panel.records.some((record) => String(record.label).includes("credential output")));
assert.ok(panel.records.some((record) => String(record.label).includes("public Pages route")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalPostPr243DraftContinuationCheckPanel"));
assert.ok(index.includes('id="phase21-49-private-local-post-pr243-draft-continuation-check"'));
assert.ok(index.includes('<script src="phase21-49-private-local-post-pr243-draft-continuation-check-builder.js"></script>'));
assert.ok(index.includes("Ready for review and merge are not performed"));
assert.ok(privateLocal.includes('href="index.html#phase21-49-private-local-post-pr243-draft-continuation-check"'));
assert.ok(readme.includes("Phase21-49"));
assert.ok(readme.includes("Draft PR #243"));
assert.ok(readme.includes("Phase21-48"));
assert.ok(readme.includes("Private Local operation"));
assert.ok(readme.includes("Japanese text display continuity"));
assert.ok(readme.includes("README operation records"));
assert.ok(readme.includes("GitHub Pages is not required"));
assert.ok(readme.includes("Ready for review is not performed"));
assert.ok(readme.includes("Merge is not performed"));
assert.ok(readme.includes("No credential output"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-49-private-local-post-pr243-draft-continuation-check-list") {
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
builder.renderPrivateLocalPostPr243DraftContinuationCheckPanel(panel, fakeDoc);
assert.ok(rendered.length >= 30);
assert.ok(rendered.some((line) => line.includes("Draft PR #243 remains Draft")));
assert.ok(rendered.some((line) => line.includes("Ready for review")));
assert.ok(rendered.some((line) => line.includes("No auto publish")));
assert.ok(rendered.some((line) => line.includes("deletion process")));
assert.ok(rendered.some((line) => line.includes("credential output")));

console.log("Phase21-49 private local post PR243 draft continuation check builder test passed");
