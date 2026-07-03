const assert = require("assert");

const builder = require("../phase21-21-private-local-post-pr214-operation-continuity-verification-handoff-checklist-builder.js");

const fixed = new Date("2026-07-03T00:00:00.000Z");
const panel = builder.buildPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist({}, () => fixed);

assert.strictEqual(builder.PHASE, "Phase21-21");
assert.strictEqual(panel.phase, "Phase21-21");
assert.strictEqual(panel.checklist_name, "Private Local Post PR214 Operation Continuity Verification Handoff Checklist");
assert.strictEqual(panel.executionPolicy, "PLAN_ONLY");
assert.strictEqual(panel.protectionPolicy, "Protected");
assert.strictEqual(panel.panel_status, "phase21_21_private_local_post_pr214_operation_continuity_verification_handoff_checklist_plan_only");
assert.strictEqual(panel.post_pr214_operation_continuity_verification_handoff_status, "POST_PR214_PRIVATE_LOCAL_OPERATION_CONTINUITY_VERIFICATION_HANDOFF_READY");
assert.strictEqual(panel.phase21_21_summary.total_checks, 33);
assert.strictEqual(panel.phase21_21_summary.confirmed_checks, 22);
assert.strictEqual(panel.phase21_21_summary.manual_review_required_checks, 6);
assert.strictEqual(panel.phase21_21_summary.blocked_checks, 5);
assert.strictEqual(panel.phase21_21_summary.phase21_20_pr214_merged, true);
assert.strictEqual(panel.phase21_21_summary.pr214_main_merge_confirmed, true);
assert.strictEqual(panel.phase21_21_summary.phase21_20_post_pr213_operation_continuity_verification_finalization_checklist_preserved, true);
assert.strictEqual(panel.phase21_21_summary.github_pages_setting_change_allowed, false);
assert.strictEqual(panel.phase21_21_summary.public_url_guidance_allowed, false);
assert.strictEqual(panel.phase21_21_summary.external_api_connection, false);
assert.strictEqual(panel.phase21_21_summary.auto_execution, false);
assert.strictEqual(panel.phase21_21_summary.ready_for_review_allowed, false);
assert.strictEqual(panel.phase21_21_summary.merge_allowed, false);
assert.strictEqual(panel.phase21_21_summary.unsafe_flags, 0);
assert.ok(panel.records.every((record) => record.private_repository === true));
assert.ok(panel.records.some((record) => record.status === "ManualReviewRequired"));
assert.ok(panel.records.some((record) => record.status === "Blocked"));
assert.ok(panel.records.every((record) => record.blocked_actions.includes("merge")));
assert.ok(panel.records.every((record) => record.out_of_scope_operations.includes("github_pages_publish")));
assert.ok(panel.records.every((record) => record.allowed_actions.includes("local_commit")));

const rendered = [];
const fakeDoc = {
  querySelector(selector) {
    if (selector === "#phase21-21-private-local-post-pr214-operation-continuity-verification-handoff-checklist-list") {
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

builder.renderPrivateLocalPostPr214OperationContinuityVerificationHandoffChecklist(panel, fakeDoc);
assert.strictEqual(rendered.length, 33);
assert.ok(rendered[0].includes("P21-21-PR214-MERGED"));

console.log("Phase21-21 private local post PR214 operation continuity verification handoff checklist test passed");
