const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-51-private-local-post-pr245-stacked-continuation-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-51-private-local-post-pr245-stacked-continuation-check-db.json");
const summary = readJson("phase21-51-private-local-post-pr245-stacked-continuation-check-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-51-private-local-post-pr245-stacked-continuation-check-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-51");
assert.strictEqual(builder.PANEL_STATUS, "phase21_51_private_local_post_pr245_stacked_continuation_check_plan_only");
assert.strictEqual(db.phase, "Phase21-51");
assert.strictEqual(summary.status, "PHASE21_51_PRIVATE_LOCAL_POST_PR245_STACKED_CONTINUATION_CHECK_READY");
assert.strictEqual(db.baseline, "Draft PR #243, Draft PR #244, and Draft PR #245 remain Draft / PR #245 base is Phase21-49 branch");
assert.strictEqual(db.draftPr243RemainsDraft, true);
assert.strictEqual(db.draftPr244RemainsDraft, true);
assert.strictEqual(db.draftPr245RemainsDraft, true);
assert.strictEqual(db.pr244BasePhase2148BranchConfirmed, true);
assert.strictEqual(db.pr245BasePhase2149BranchConfirmed, true);
assert.strictEqual(db.readyForReviewAllowed, false);
assert.strictEqual(db.readyForReviewPerformed, false);
assert.strictEqual(db.mergeAllowed, false);
assert.strictEqual(db.mergePerformed, false);
assert.strictEqual(db.prCreationAllowed, false);
assert.strictEqual(db.prCreationPerformed, false);
assert.strictEqual(db.phase2150FlowMaintained, true);
assert.strictEqual(db.phase2149FlowMaintained, true);
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

const panel = builder.buildPrivateLocalPostPr245StackedContinuationCheckPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, "Draft PR #243, Draft PR #244, and Draft PR #245 remain Draft / PR #245 base is Phase21-49 branch");
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
assert.strictEqual(panel.draftPr244RemainsDraft, true);
assert.strictEqual(panel.draftPr245RemainsDraft, true);
assert.strictEqual(panel.pr244BasePhase2148BranchConfirmed, true);
assert.strictEqual(panel.pr245BasePhase2149BranchConfirmed, true);
assert.strictEqual(panel.readyForReviewPerformed, false);
assert.strictEqual(panel.mergePerformed, false);
assert.strictEqual(panel.prCreationPerformed, false);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.safeLocalUsePolicy.includes("no public Pages"));
assert.ok(panel.japaneseTextContinuityPolicy.includes("Phase21-50"));
assert.ok(panel.prPolicy.includes("Ready for review and merge are not performed"));
assert.ok(panel.records.some((record) => String(record.label).includes("Draft PR #243 remains Draft")));
assert.ok(panel.records.some((record) => String(record.label).includes("Draft PR #244 remains Draft")));
assert.ok(panel.records.some((record) => String(record.label).includes("Draft PR #245 remains Draft")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-48 branch")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-49 branch")));
assert.ok(panel.records.some((record) => String(record.label).includes("Ready for review")));
assert.ok(panel.records.some((record) => String(record.label).includes("Merge is not performed")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-50")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-49")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-48")));
assert.ok(panel.records.some((record) => String(record.label).includes("index.html")));
assert.ok(panel.records.some((record) => String(record.label).includes("README")));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));
assert.ok(panel.records.some((record) => String(record.label).includes("deletion process")));
assert.ok(panel.records.some((record) => String(record.label).includes("credential output")));
assert.ok(panel.records.some((record) => String(record.label).includes("public Pages route")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalPostPr245StackedContinuationCheckPanel"));
assert.ok(index.includes('id="phase21-51-private-local-post-pr245-stacked-continuation-check"'));
assert.ok(index.includes('<script src="phase21-51-private-local-post-pr245-stacked-continuation-check-builder.js"></script>'));
assert.ok(index.includes("PR #244 is confirmed as based on the Phase21-48 branch"));
assert.ok(index.includes("PR #245 is confirmed as based on the Phase21-49 branch"));
assert.ok(privateLocal.includes('href="index.html#phase21-51-private-local-post-pr245-stacked-continuation-check"'));
assert.ok(readme.includes("Phase21-51"));
assert.ok(readme.includes("Draft PR #243"));
assert.ok(readme.includes("Draft PR #244"));
assert.ok(readme.includes("Draft PR #245"));
assert.ok(readme.includes("Phase21-48 branch"));
assert.ok(readme.includes("Phase21-49 branch"));
assert.ok(readme.includes("Phase21-50"));
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
    if (selector === "#phase21-51-private-local-post-pr245-stacked-continuation-check-list") {
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
builder.renderPrivateLocalPostPr245StackedContinuationCheckPanel(panel, fakeDoc);
assert.ok(rendered.length >= 35);
assert.ok(rendered.some((line) => line.includes("Draft PR #243 remains Draft")));
assert.ok(rendered.some((line) => line.includes("Draft PR #244 remains Draft")));
assert.ok(rendered.some((line) => line.includes("Draft PR #245 remains Draft")));
assert.ok(rendered.some((line) => line.includes("Phase21-48 branch")));
assert.ok(rendered.some((line) => line.includes("Phase21-49 branch")));
assert.ok(rendered.some((line) => line.includes("Ready for review")));
assert.ok(rendered.some((line) => line.includes("No auto publish")));
assert.ok(rendered.some((line) => line.includes("deletion process")));
assert.ok(rendered.some((line) => line.includes("credential output")));

console.log("Phase21-51 private local post PR245 stacked continuation check builder test passed");
