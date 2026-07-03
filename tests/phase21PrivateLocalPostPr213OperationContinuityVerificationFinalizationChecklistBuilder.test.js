const assert = require("assert");

const builder = require("../phase21-20-private-local-post-pr213-operation-continuity-verification-finalization-checklist-builder.js");

const fixed = new Date("2026-07-03T00:00:00.000Z");
const panel = builder.buildPrivateLocalPostPr213OperationContinuityVerificationFinalizationChecklist({}, () => fixed);

assert.strictEqual(builder.PHASE, "Phase21-20");
assert.strictEqual(panel.phase, "Phase21-20");
assert.strictEqual(panel.checklist_name, "Private Local Post PR213 Operation Continuity Verification Finalization Checklist");
assert.strictEqual(panel.executionPolicy, "PLAN_ONLY");
assert.strictEqual(panel.protectionPolicy, "Protected");
assert.strictEqual(panel.panel_status, "phase21_20_private_local_post_pr213_operation_continuity_verification_finalization_checklist_plan_only");
assert.strictEqual(panel.post_pr213_operation_continuity_verification_finalization_status, "POST_PR213_PRIVATE_LOCAL_OPERATION_CONTINUITY_VERIFICATION_FINALIZATION_READY");
assert.strictEqual(panel.phase21_20_summary.total_checks, 33);
assert.strictEqual(panel.phase21_20_summary.confirmed_checks, 22);
assert.strictEqual(panel.phase21_20_summary.manual_review_required_checks, 6);
assert.strictEqual(panel.phase21_20_summary.blocked_checks, 5);
assert.strictEqual(panel.phase21_20_summary.phase21_19_pr213_merged, true);
assert.strictEqual(panel.phase21_20_summary.pr213_main_merge_confirmed, true);
assert.strictEqual(panel.phase21_20_summary.phase21_19_post_pr212_operation_continuity_verification_stabilization_checklist_preserved, true);
assert.strictEqual(panel.phase21_20_summary.github_pages_setting_change_allowed, false);
assert.strictEqual(panel.phase21_20_summary.public_url_guidance_allowed, false);
assert.strictEqual(panel.phase21_20_summary.external_api_connection, false);
assert.strictEqual(panel.phase21_20_summary.auto_execution, false);
assert.strictEqual(panel.phase21_20_summary.ready_for_review_allowed, false);
assert.strictEqual(panel.phase21_20_summary.merge_allowed, false);
assert.strictEqual(panel.phase21_20_summary.unsafe_flags, 0);
assert.ok(panel.records.every((record) => record.private_repository === true));
assert.ok(panel.records.some((record) => record.status === "ManualReviewRequired"));
assert.ok(panel.records.some((record) => record.status === "Blocked"));
assert.ok(panel.records.every((record) => record.blocked_actions.includes("merge")));
assert.ok(panel.records.every((record) => record.out_of_scope_operations.includes("github_pages_publish")));
assert.ok(panel.records.every((record) => record.allowed_actions.includes("local_commit")));

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-20-private-local-post-pr213-operation-continuity-verification-finalization-checklist-list") {
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

builder.renderPrivateLocalPostPr213OperationContinuityVerificationFinalizationChecklist(panel, fakeDoc);
assert.strictEqual(rendered.length, 33);
assert.ok(rendered[0].includes("P21-20-PR213-MERGED"));

console.log("Phase21-20 private local post PR213 operation continuity verification finalization checklist test passed");
