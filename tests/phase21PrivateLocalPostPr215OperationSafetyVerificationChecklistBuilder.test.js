const assert = require("assert");
const fs = require("fs");
const path = require("path");

const builder = require("../phase21-22-private-local-post-pr215-operation-safety-verification-checklist-builder.js");
const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));
const db = readJson("phase21-22-private-local-post-pr215-operation-safety-verification-checklist-db.json");
const summaryDb = readJson("phase21-22-private-local-post-pr215-operation-safety-verification-checklist-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
const css = readText("dashboard.css");

const fixed = new Date("2026-07-03T00:00:00.000Z");
const panel = builder.buildPrivateLocalPostPr215OperationSafetyVerificationChecklist({}, () => fixed);

assert.strictEqual(builder.PHASE, "Phase21-22");
assert.strictEqual(panel.phase, "Phase21-22");
assert.strictEqual(panel.checklist_name, "Private Local Post PR215 Operation Safety Verification Checklist");
assert.strictEqual(panel.executionPolicy, "PLAN_ONLY");
assert.strictEqual(panel.protectionPolicy, "Protected");
assert.strictEqual(panel.panel_status, "phase21_22_private_local_post_pr215_operation_safety_verification_checklist_plan_only");
assert.strictEqual(panel.post_pr215_operation_safety_verification_status, "POST_PR215_PRIVATE_LOCAL_OPERATION_SAFETY_VERIFICATION_READY");
assert.strictEqual(panel.phase21_22_summary.total_checks, 33);
assert.strictEqual(panel.phase21_22_summary.confirmed_checks, 22);
assert.strictEqual(panel.phase21_22_summary.manual_review_required_checks, 6);
assert.strictEqual(panel.phase21_22_summary.blocked_checks, 5);
assert.strictEqual(panel.phase21_22_summary.phase21_21_pr215_merged, true);
assert.strictEqual(panel.phase21_22_summary.pr215_main_merge_confirmed, true);
assert.strictEqual(panel.phase21_22_summary.phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved, true);
assert.strictEqual(panel.phase21_22_summary.phase21_21_post_pr214_operation_continuity_verification_handoff_checklist_preserved, true);
assert.strictEqual(panel.phase21_22_summary.github_pages_setting_change_allowed, false);
assert.strictEqual(panel.phase21_22_summary.public_url_guidance_allowed, false);
assert.strictEqual(panel.phase21_22_summary.external_api_connection, false);
assert.strictEqual(panel.phase21_22_summary.auto_execution, false);
assert.strictEqual(panel.phase21_22_summary.ready_for_review_allowed, false);
assert.strictEqual(panel.phase21_22_summary.merge_allowed, false);
assert.strictEqual(panel.phase21_22_summary.unsafe_flags, 0);
assert.strictEqual(db.phase, "Phase21-22");
assert.strictEqual(db.summary.phase21_21_post_pr214_operation_continuity_verification_handoff_checklist_preserved, true);
assert.strictEqual(db.phase21_21_pr215_merged, true);
assert.strictEqual(db.github_pages_setting_change_allowed, false);
assert.strictEqual(db.public_url_guidance_allowed, false);
assert.strictEqual(db.external_api_connection, false);
assert.strictEqual(summaryDb.post_pr215_operation_safety_verification_status, "POST_PR215_PRIVATE_LOCAL_OPERATION_SAFETY_VERIFICATION_READY");
assert.strictEqual(summaryDb.phase21_21_post_pr214_operation_continuity_verification_handoff_checklist_preserved, true);
assert.strictEqual(summaryDb.merge_allowed, false);
assert.ok(index.includes('id="phase21-22-private-local-post-pr215-operation-safety-verification-checklist-builder"'));
assert.ok(index.includes('<script src="phase21-22-private-local-post-pr215-operation-safety-verification-checklist-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase21-22-private-local-post-pr215-operation-safety-verification-checklist-builder"'));
assert.ok(readme.includes("Phase21-22 Private Local Post PR215 Operation Safety Verification Checklist"));
assert.ok(css.includes(".phase21-22-private-local-post-pr215-operation-safety-verification-checklist"));
assert.ok(panel.records.every((record) => record.private_repository === true));
assert.ok(panel.records.some((record) => record.status === "ManualReviewRequired"));
assert.ok(panel.records.some((record) => record.status === "Blocked"));
assert.ok(panel.records.every((record) => record.blocked_actions.includes("merge")));
assert.ok(panel.records.every((record) => record.out_of_scope_operations.includes("github_pages_publish")));
assert.ok(panel.records.every((record) => record.allowed_actions.includes("local_commit")));

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-22-private-local-post-pr215-operation-safety-verification-checklist-list") {
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

builder.renderPrivateLocalPostPr215OperationSafetyVerificationChecklist(panel, fakeDoc);
assert.strictEqual(rendered.length, 33);
assert.ok(rendered[0].includes("P21-22-PR215-MERGED"));

console.log("Phase21-22 private local post PR215 operation safety verification checklist test passed");
