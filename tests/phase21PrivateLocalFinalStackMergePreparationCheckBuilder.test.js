const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const builder = require("../phase21-54-private-local-final-stack-merge-preparation-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase21-54-private-local-final-stack-merge-preparation-check-db.json");
const summary = readJson("phase21-54-private-local-final-stack-merge-preparation-check-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const builderSource = readText("phase21-54-private-local-final-stack-merge-preparation-check-builder.js");

assert.strictEqual(builder.PHASE, "Phase21-54");
assert.strictEqual(builder.PANEL_STATUS, "phase21_54_private_local_final_stack_merge_preparation_check_plan_only");
assert.strictEqual(db.phase, "Phase21-54");
assert.strictEqual(summary.status, "PHASE21_54_PRIVATE_LOCAL_FINAL_STACK_MERGE_PREPARATION_CHECK_READY");
assert.strictEqual(db.baseline, "Final stack merge preparation for PR #243 through PR #248 before tomorrow company PC restart");
assert.deepStrictEqual(db.mergeOrder, ["PR #243", "PR #244", "PR #245", "PR #246", "PR #247", "PR #248", "Phase21-54 PR"]);
assert.strictEqual(db.draftPr243RemainsDraft, true);
assert.strictEqual(db.draftPr248RemainsDraft, true);
assert.strictEqual(db.pr243Phase2148BaseMainConfirmed, true);
assert.strictEqual(db.pr248Phase2153BasePhase2152Confirmed, true);
assert.strictEqual(db.finalMergeOrderConfirmed, true);
assert.strictEqual(db.companyPcRestartReadyAfterMainSync, true);
assert.strictEqual(db.readyForReviewAllowed, false);
assert.strictEqual(db.readyForReviewPerformed, false);
assert.strictEqual(db.mergeAllowed, false);
assert.strictEqual(db.mergePerformed, false);
assert.strictEqual(db.prCreationAllowed, false);
assert.strictEqual(db.prCreationPerformed, false);
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
assert.strictEqual(db.blockedActionPolicy.externalSendAllowed, false);
assert.strictEqual(db.blockedActionPolicy.deletionProcessAllowed, false);
assert.strictEqual(db.blockedActionPolicy.credentialOutputAllowed, false);
assert.strictEqual(db.blockedActionPolicy.batAllowed, false);
assert.strictEqual(db.blockedActionPolicy.ps1Allowed, false);
assert.strictEqual(db.blockedActionPolicy.cmdAllowed, false);
assert.strictEqual(db.blockedActionPolicy.exeAllowed, false);
assert.strictEqual(summary.dangerousLauncherExtensionsAdded, false);

const panel = builder.buildPrivateLocalFinalStackMergePreparationCheckPanel({ db, summary }, () => new Date("2026-07-05T00:00:00.000Z"));
assert.strictEqual(panel.baseline, db.baseline);
assert.ok(panel.mergeOrder.includes("PR #243 -> PR #244 -> PR #245 -> PR #246 -> PR #247 -> PR #248 -> Phase21-54 PR"));
assert.strictEqual(panel.privateRepository, true);
assert.strictEqual(panel.githubPagesRequired, false);
assert.strictEqual(panel.readyForReviewPerformed, false);
assert.strictEqual(panel.mergePerformed, false);
assert.strictEqual(panel.prCreationPerformed, false);
assert.strictEqual(panel.pr248Phase2153BasePhase2152Confirmed, true);
assert.strictEqual(panel.finalMergeOrderConfirmed, true);
assert.strictEqual(panel.companyPcRestartReadyAfterMainSync, true);
assert.ok(panel.operationPolicy.includes("Private Local"));
assert.ok(panel.safeLocalUsePolicy.includes("main sync after each merge"));
assert.ok(panel.japaneseTextContinuityPolicy.includes("Phase21-53"));
assert.ok(panel.prPolicy.includes("Ready for review, PR creation, and merge are not performed"));
assert.ok(panel.records.some((record) => String(record.label).includes("PR #243 is Phase21-48")));
assert.ok(panel.records.some((record) => String(record.label).includes("PR #248 is Phase21-53")));
assert.ok(panel.records.some((record) => String(record.label).includes("Phase21-54 PR")));
assert.ok(panel.records.some((record) => String(record.label).includes("Tomorrow company PC restart")));
assert.ok(panel.records.some((record) => String(record.label).includes("GitHub Pages")));
assert.ok(panel.records.some((record) => String(record.label).includes("credential output")));

assert.ok(builderSource.includes("fetchJson"));
assert.ok(builderSource.includes("catch (error)"));
assert.ok(builderSource.includes("runAndRenderPrivateLocalFinalStackMergePreparationCheckPanel"));
assert.ok(index.includes('id="phase21-54-private-local-final-stack-merge-preparation-check"'));
assert.ok(index.includes('<script src="phase21-54-private-local-final-stack-merge-preparation-check-builder.js"></script>'));
assert.ok(index.includes("PR #243 -> PR #244 -> PR #245 -> PR #246 -> PR #247 -> PR #248 -> Phase21-54 PR"));
assert.ok(privateLocal.includes('href="index.html#phase21-54-private-local-final-stack-merge-preparation-check"'));
assert.ok(readme.includes("Phase21-54"));
assert.ok(readme.includes("PR #248 is Phase21-53 / Draft / base = Phase21-52"));
assert.ok(readme.includes("PR #243 -> PR #244 -> PR #245 -> PR #246 -> PR #247 -> PR #248 -> Phase21-54 PR"));
assert.ok(readme.includes("tomorrow company PC"));
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
    if (selector === "#phase21-54-private-local-final-stack-merge-preparation-check-list") {
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
builder.renderPrivateLocalFinalStackMergePreparationCheckPanel(panel, fakeDoc);
assert.ok(rendered.length >= 20);
assert.ok(rendered.some((line) => line.includes("PR #248 is Phase21-53")));
assert.ok(rendered.some((line) => line.includes("Phase21-54 PR")));
assert.ok(rendered.some((line) => line.includes("No merge")));
assert.ok(rendered.some((line) => line.includes("credential output")));

console.log("Phase21-54 private local final stack merge preparation check builder test passed");
