const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-59-private-local-post-pr253-home-pc-continuation-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-59-private-local-post-pr253-home-pc-continuation-check-db.json");
const summary = readJson("phase21-59-private-local-post-pr253-home-pc-continuation-check-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-59-private-local-post-pr253-home-pc-continuation-check-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-59");
assert.strictEqual(builder.PANEL_STATUS, "phase21_59_private_local_post_pr253_home_pc_continuation_check_plan_only");
assert.strictEqual(db.phase, "Phase21-59");
assert.strictEqual(summary.status, "PHASE21_59_PRIVATE_LOCAL_POST_PR253_HOME_PC_CONTINUATION_CHECK_READY");
assert.strictEqual(db.latestMainHead, "bb70f25");
assert.ok(db.baseline.includes("PR #253 merged"));
assert.ok(db.baseline.includes("home PC main updated / private-local.html confirmed"));
assert.strictEqual(db.previousPhase, "Phase21-58");
assert.strictEqual(db.previousPullRequest, "PR #253");
assert.strictEqual(db.homePcMainUpdatedAndPrivateLocalHtmlConfirmed, true);
assert.strictEqual(db.mainSyncedAfterPr253, true);
assert.strictEqual(db.phase2158MainReflectionConfirmed, true);
assert.strictEqual(db.privateRepository, true);
assert.strictEqual(db.localFirst, true);
assert.strictEqual(db.manualLaunchRequired, true);
assert.strictEqual(db.ipadViewConfirmOnly, true);
assert.strictEqual(db.powerShellManualOnly, true);
assert.strictEqual(db.desktopShortcutOptional, true);
assert.strictEqual(db.githubPagesRequired, false);
assert.strictEqual(db.publicDeliveryAllowed, false);
assert.strictEqual(db.publicUrlRequired, false);
assert.strictEqual(db.externalApiAllowed, false);
assert.strictEqual(db.externalSendAllowed, false);
assert.strictEqual(db.autoExecutionAllowed, false);
assert.strictEqual(db.automaticRemotePublishAllowed, false);
assert.strictEqual(db.automaticMergeAllowed, false);
assert.strictEqual(db.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(db.suspiciousAutoRunScriptAllowed, false);
assert.strictEqual(db.readyForReviewAllowed, false);
assert.strictEqual(db.mergeAllowed, false);
assert.strictEqual(db.mergePerformed, false);
assert.strictEqual(db.mainDirectPushAllowed, false);
assert.strictEqual(db.mainDirectCommitAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildPrivateLocalPostPr253HomePcContinuationCheckPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, db.baseline);
assert.strictEqual(panel.latestMainHead, "bb70f25");
assert.strictEqual(panel.homePcMainUpdatedAndPrivateLocalHtmlConfirmed, true);
assert.strictEqual(panel.phase2158MainReflectionConfirmed, true);
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.publicDeliveryAllowed, false);
assert.strictEqual(panel.automaticRemotePublishAllowed, false);
assert.strictEqual(panel.automaticMergeAllowed, false);
assert.strictEqual(panel.hiddenBackgroundUpdateAllowed, false);
assert.strictEqual(panel.readyForReviewPerformed, false);
assert.strictEqual(panel.mergePerformed, false);
assert.strictEqual(panel.mainDirectPushAllowed, false);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.safeLocalUsePolicy.includes("home PC main sync"));
assert.ok(panel.prPolicy.includes("draft PR only"));
assert.ok(panel.records.some((record) => String(record.label).includes("PR #253 merged")));
assert.ok(panel.records.some((record) => String(record.label).includes("Latest main HEAD is bb70f25")));
assert.ok(panel.records.some((record) => String(record.label).includes("Home PC main updated")));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));
assert.ok(panel.records.some((record) => String(record.label).includes("No suspicious auto-run script")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalPostPr253HomePcContinuationCheckPanel"));
assert.ok(index.includes('id="phase21-59-private-local-post-pr253-home-pc-continuation-check"'));
assert.ok(index.includes('<script src="phase21-59-private-local-post-pr253-home-pc-continuation-check-builder.js"></script>'));
assert.ok(index.indexOf("phase21-59-private-local-post-pr253-home-pc-continuation-check") < index.indexOf("phase21-58-private-local-post-pr252-home-pc-continuation-check"));
assert.ok(privateLocal.includes('href="index.html#phase21-59-private-local-post-pr253-home-pc-continuation-check"'));
assert.ok(privateLocal.indexOf("phase21-59-private-local-post-pr253-home-pc-continuation-check") < privateLocal.indexOf("phase21-58-private-local-post-pr252-home-pc-continuation-check"));
assert.ok(readme.includes("Phase21-59"));
assert.ok(readme.includes("PR #253 merged"));
assert.ok(readme.includes("home PC main updated / private-local.html confirmed"));
assert.ok(readme.includes("bb70f25"));
assert.ok(readme.includes("Private Local"));
assert.ok(readme.includes("GitHub Pages is not required"));
assert.ok(readme.includes("No automatic remote publish"));
assert.ok(readme.includes("No suspicious auto-run script"));
assert.ok(readme.includes("PR remains Draft"));
assert.ok(readme.includes("Merge only after user confirmation"));

const changedFiles = childProcess.execSync("git diff --name-only HEAD", { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of changedFiles) {
  assert.strictEqual(/\.(bat|ps1|cmd|exe)$/i.test(file), false, `${file} must not be created or modified`);
}

const combinedChangedText = changedFiles
  .filter((file) => !/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(file))
  .map((file) => readText(file))
  .join("\n");
assert.strictEqual(/githubPagesRequired"\s*:\s*true/i.test(combinedChangedText), false);
assert.strictEqual(/publicDeliveryAllowed"\s*:\s*true/i.test(combinedChangedText), false);
assert.strictEqual(/automaticRemotePublishAllowed"\s*:\s*true/i.test(combinedChangedText), false);
assert.strictEqual(/automaticMergeAllowed"\s*:\s*true/i.test(combinedChangedText), false);
assert.strictEqual(/autoExecutionAllowed"\s*:\s*true/i.test(combinedChangedText), false);

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-59-private-local-post-pr253-home-pc-continuation-check-list") {
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
builder.renderPrivateLocalPostPr253HomePcContinuationCheckPanel(panel, fakeDoc);
assert.ok(rendered.length >= 20);
assert.ok(rendered.some((line) => line.includes("PR #253 merged")));
assert.ok(rendered.some((line) => line.includes("bb70f25")));
assert.ok(rendered.some((line) => line.includes("No suspicious auto-run script")));

console.log("Phase21-59 private local post PR253 home PC continuation check builder test passed");
