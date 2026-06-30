const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-25-final-private-release-freeze-check-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-25-final-private-release-freeze-check-db.json");
const summaryDb = readJson("phase20-25-final-private-release-freeze-check-summary-db.json");
const phase2024Summary = readJson("phase20-24-safe-operation-final-guard-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");

assert.equal(engine.PHASE, "Phase20-25");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.PANEL_STATUS, "final_private_release_freeze_check_plan_only");
assert.deepEqual(engine.FREEZE_STATUSES, ["PASS", "HOLD", "BLOCKED"]);
assert.equal(engine.FREEZE_STATUS, "PASS");
assert.deepEqual(engine.OUT_OF_SCOPE_OPERATIONS, [
  "public_publish",
  "github_pages_publish",
  "external_sharing",
  "billing_integration",
  "real_ticket_auto_purchase",
  "external_api_submission"
]);

const panel = engine.buildFinalPrivateReleaseFreezeCheck({}, () => new Date("2026-06-30T08:00:00.000Z"));
assert.equal(panel.phase, "Phase20-25");
assert.equal(panel.records.length, 18);
assert.equal(panel.freeze_status, "PASS");
assert.equal(panel.private_repository, true);
assert.equal(panel.local_only_operation, true);
assert.equal(panel.protected_mode, true);
assert.equal(panel.plan_only, true);
assert.equal(panel.unsafe_guard, true);
assert.equal(panel.repository_private_premise, true);
assert.equal(panel.local_launcher_premise_confirmed, true);
assert.equal(panel.github_pages_independence_confirmed, true);
assert.equal(panel.external_sharing_prohibited, true);
assert.equal(panel.secrets_tokens_credentials_not_stored, true);
assert.equal(panel.manual_device_confirmation_required, true);
assert.equal(panel.rollback_revert_policy_confirmed, true);
assert.equal(panel.final_pre_merge_checklist_required, true);
assert.equal(panel.public_publish_out_of_scope, true);
assert.equal(panel.github_pages_publish_out_of_scope, true);
assert.equal(panel.external_sharing_out_of_scope, true);
assert.equal(panel.billing_integration_out_of_scope, true);
assert.equal(panel.real_ticket_auto_purchase_out_of_scope, true);
assert.equal(panel.external_api_submission_out_of_scope, true);
assert.equal(panel.github_pages_launch, false);
assert.equal(panel.public_url_launch, false);
assert.equal(panel.public_release_allowed, false);
assert.equal(panel.external_connection, false);
assert.equal(panel.auto_execution, false);
assert.equal(panel.auto_publish, false);
assert.equal(panel.auto_launch, false);
assert.equal(panel.direct_push_to_main_allowed, false);
assert.equal(panel.merge_without_pr_review_allowed, false);
assert.equal(panel.repository_visibility_change_allowed, false);
assert.equal(panel.github_pages_setting_change_allowed, false);
assert.equal(panel.unsafe_flags, 0);
assert.equal(panel.phase20_12_through_phase20_24_locks_preserved, true);

const summary = panel.phase20_25_summary;
assert.equal(summary.total_safety_checks, 18);
assert.equal(summary.freeze_status, "PASS");
assert.deepEqual(summary.freeze_statuses, ["PASS", "HOLD", "BLOCKED"]);
assert.equal(summary.repository_private_premise_confirmed, true);
assert.equal(summary.local_launcher_premise_confirmed, true);
assert.equal(summary.github_pages_independence_confirmed, true);
assert.equal(summary.external_sharing_prohibited, true);
assert.equal(summary.secrets_tokens_credentials_not_stored, true);
assert.equal(summary.manual_device_confirmation_required, true);
assert.equal(summary.rollback_revert_policy_confirmed, true);
assert.equal(summary.final_pre_merge_checklist_required, true);
assert.equal(summary.public_publish_out_of_scope, true);
assert.equal(summary.github_pages_publish_out_of_scope, true);
assert.equal(summary.external_sharing_out_of_scope, true);
assert.equal(summary.billing_integration_out_of_scope, true);
assert.equal(summary.real_ticket_auto_purchase_out_of_scope, true);
assert.equal(summary.external_api_submission_out_of_scope, true);
assert.equal(summary.github_pages_launch, false);
assert.equal(summary.public_url_launch, false);
assert.equal(summary.public_release_allowed, false);
assert.equal(summary.external_connection, false);
assert.equal(summary.auto_execution, false);
assert.equal(summary.auto_publish, false);
assert.equal(summary.auto_launch, false);
assert.equal(summary.direct_push_to_main_allowed, false);
assert.equal(summary.merge_without_pr_review_allowed, false);
assert.equal(summary.repository_visibility_change_allowed, false);
assert.equal(summary.github_pages_setting_change_allowed, false);
assert.equal(summary.unsafe_flags, 0);
assert.equal(summary.phase20_12_through_phase20_24_locks_preserved, true);

for (const record of panel.records) {
  assert.equal(record.freeze_review_status, "final_private_release_freeze_confirmed");
  assert.equal(record.freeze_status, "PASS");
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.unsafe_guard, true);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.github_pages_launch_allowed, false);
  assert.equal(record.public_url_launch_allowed, false);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_launch, false);
  assert.deepEqual(record.out_of_scope_operations, engine.OUT_OF_SCOPE_OPERATIONS);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
}

assert.equal(db.phase, "Phase20-25");
assert.equal(db.freezeStatus, "PASS");
assert.deepEqual(db.freezeStatuses, ["PASS", "HOLD", "BLOCKED"]);
assert.equal(db.repositoryPrivatePremiseConfirmed, true);
assert.equal(db.localLauncherPremiseConfirmed, true);
assert.equal(db.githubPagesIndependenceConfirmed, true);
assert.equal(db.externalSharingProhibited, true);
assert.equal(db.secretsTokensCredentialsNotStored, true);
assert.equal(db.manualDeviceConfirmationRequired, true);
assert.equal(db.rollbackRevertPolicyConfirmed, true);
assert.equal(db.finalPreMergeChecklistRequired, true);
assert.equal(db.publicPublishOutOfScope, true);
assert.equal(db.githubPagesPublishOutOfScope, true);
assert.equal(db.externalSharingOutOfScope, true);
assert.equal(db.billingIntegrationOutOfScope, true);
assert.equal(db.realTicketAutoPurchaseOutOfScope, true);
assert.equal(db.externalApiSubmissionOutOfScope, true);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.githubPagesLaunch, false);
assert.equal(db.publicUrlLaunch, false);
assert.equal(db.externalConnection, false);
assert.equal(db.autoExecution, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoLaunch, false);
assert.equal(db.directPushToMainAllowed, false);
assert.equal(db.mergeWithoutPrReviewAllowed, false);
assert.equal(db.unsafeFlags, 0);
assert.equal(db.phase20_12_through_phase20_24_locks_preserved, true);

assert.equal(summaryDb.phase, "Phase20-25");
assert.equal(summaryDb.phase20_25_summary.totalSafetyChecks, 18);
assert.equal(summaryDb.phase20_25_summary.freezeStatus, "PASS");
assert.deepEqual(summaryDb.phase20_25_summary.freezeStatuses, ["PASS", "HOLD", "BLOCKED"]);
assert.equal(summaryDb.phase20_25_summary.publicPublishOutOfScope, true);
assert.equal(summaryDb.phase20_25_summary.githubPagesPublishOutOfScope, true);
assert.equal(summaryDb.phase20_25_summary.externalSharingOutOfScope, true);
assert.equal(summaryDb.phase20_25_summary.billingIntegrationOutOfScope, true);
assert.equal(summaryDb.phase20_25_summary.realTicketAutoPurchaseOutOfScope, true);
assert.equal(summaryDb.phase20_25_summary.externalApiSubmissionOutOfScope, true);
assert.deepEqual(summaryDb.outOfScopeOperations, engine.OUT_OF_SCOPE_OPERATIONS);

assert.equal(phase2024Summary.phase20_24_summary.privateRepository, true);
assert.equal(phase2024Summary.phase20_24_summary.githubPagesLaunch, false);
assert.equal(phase2024Summary.phase20_24_summary.publicUrlLaunch, false);
assert.equal(phase2024Summary.phase20_24_summary.publicReleaseAllowed, false);
assert.equal(phase2024Summary.phase20_24_summary.externalConnection, false);
assert.equal(phase2024Summary.phase20_24_summary.autoExecution, false);
assert.equal(phase2024Summary.phase20_24_summary.autoPublish, false);
assert.equal(phase2024Summary.phase20_24_summary.autoLaunch, false);
assert.equal(phase2024Summary.phase20_24_summary.directPushToMainAllowed, false);
assert.equal(phase2024Summary.phase20_24_summary.mergeWithoutPrReviewAllowed, false);

assert.ok(index.includes('id="phase20-25-final-private-release-freeze-check-builder"'));
assert.ok(index.includes('<script src="phase20-25-final-private-release-freeze-check-builder.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase20-25-final-private-release-freeze-check-builder"'));
assert.ok(privateLocal.includes("Phase20-25 Final Private Release Freeze Check"));
assert.ok(readme.includes("Phase20-25 Final Private Release Freeze Check"));
assert.ok(readme.includes("phase20-25-final-private-release-freeze-check-builder.js"));

const builderSource = readText("phase20-25-final-private-release-freeze-check-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_connection_allowed: true",
  "auto_execution: true",
  "auto_execution_allowed: true",
  "auto_publish: true",
  "auto_publish_allowed: true",
  "auto_launch: true",
  "auto_launch_allowed: true",
  "github_pages_launch_allowed: true",
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true",
  "direct_push_to_main_allowed: true",
  "merge_without_pr_review_allowed: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-25 builder`);
}

console.log("phase20-25 final private release freeze check builder tests passed");
