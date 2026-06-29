const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase20-16-private-release-lock-audit-gate-builder.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

const db = readJson("phase20-16-private-release-lock-audit-gate-db.json");
const summaryDb = readJson("phase20-16-private-release-lock-audit-gate-summary-db.json");
const phase2012Summary = readJson("phase20-12-private-operation-safety-gate-summary-db.json");
const phase2013Summary = readJson("phase20-13-manual-device-confirmation-gate-summary-db.json");
const phase2014Summary = readJson("phase20-14-public-release-final-block-gate-summary-db.json");
const phase2015Summary = readJson("phase20-15-owner-manual-approval-lock-gate-summary-db.json");
const index = readText("index.html");
const privateLocal = readText("private-local.html");

assert.equal(engine.PHASE, "Phase20-16");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.PROTECTION_POLICY, "Protected");
assert.equal(engine.GATE_STATUS, "private_release_lock_audit_plan_only");
assert.deepEqual(engine.ALLOWED_ACTIONS, ["plan", "review", "validate", "audit", "report", "local_launch"]);
assert.deepEqual(engine.BLOCKED_ACTIONS, [
  "public_url_exposure",
  "external_connection",
  "auto_publish",
  "auto_execution",
  "github_pages_setting_change",
  "repository_visibility_change",
  "public_release_without_all_device_confirmations",
  "public_release_without_manual_owner_confirmation",
  "owner_release_unlock_without_manual_confirmation",
  "safety_lock_bypass",
  "private_policy_override"
]);
assert.deepEqual(engine.AUDIT_SCOPE, [
  "Phase20-12 private operation safety gate",
  "Phase20-13 manual device confirmation gate",
  "Phase20-14 public release final block gate",
  "Phase20-15 owner manual approval lock gate"
]);

const gate = engine.buildPrivateReleaseLockAuditGate({}, () => new Date("2026-06-29T04:00:00.000Z"));
assert.equal(gate.phase, "Phase20-16");
assert.equal(gate.gate_status, "private_release_lock_audit_plan_only");
assert.equal(gate.records.length, 10);
assert.equal(gate.private_local_policy_unchanged, true);
assert.equal(gate.protected_mode, true);
assert.equal(gate.plan_only, true);
assert.equal(gate.external_connection, false);
assert.equal(gate.auto_publish, false);
assert.equal(gate.auto_execution, false);
assert.equal(gate.github_pages_change_allowed, false);
assert.equal(gate.github_pages_setting_change_allowed, false);
assert.equal(gate.repository_visibility_change_allowed, false);
assert.equal(gate.public_release_allowed, false);
assert.equal(gate.manual_confirmation_required_before_public_release, true);
assert.equal(gate.manual_owner_confirmation_required, true);
assert.equal(gate.owner_approval_lock_active, true);
assert.equal(gate.final_public_release_block, true);
assert.equal(gate.all_device_confirmations_approved, false);
assert.equal(gate.public_release_ready, false);

assert.deepEqual(gate.phase20_16_summary, {
  total_audit_checks: 10,
  phase20_12_private_operation_safety_gate_active: true,
  phase20_13_manual_device_confirmation_gate_active: true,
  phase20_14_public_release_final_block_active: true,
  phase20_15_owner_manual_approval_lock_active: true,
  all_required_locks_active: true,
  public_release_block_integrity: true,
  private_local_policy_integrity: true,
  unsafe_unlock_detected: false,
  unsafe_public_flag_detected: false,
  external_or_auto_publish_detected: false,
  protected_mode: true,
  plan_only: true,
  private_local_policy_unchanged: true,
  external_connection: false,
  external_connection_allowed: false,
  auto_publish: false,
  auto_publish_allowed: false,
  auto_execution: false,
  auto_execution_allowed: false,
  github_pages_change_allowed: false,
  github_pages_setting_change_allowed: false,
  repository_visibility_change_allowed: false,
  public_release_blocked: true,
  public_release_allowed: false,
  manual_confirmation_required_before_public_release: true,
  manual_owner_confirmation_required: true,
  owner_approval_lock_active: true,
  final_public_release_block: true,
  all_device_confirmations_approved: false,
  public_release_ready: false,
  unsafe_flags_count: 0,
  audit_rule: engine.AUDIT_RULE,
  next_recommended_step: engine.NEXT_RECOMMENDED_STEP
});

const expectedChecks = {
  phase20_12_private_operation_safety_gate_active: true,
  phase20_13_manual_device_confirmation_gate_active: true,
  phase20_14_public_release_final_block_active: true,
  phase20_15_owner_manual_approval_lock_active: true,
  all_required_locks_active: true,
  public_release_block_integrity: true,
  private_local_policy_integrity: true,
  unsafe_unlock_detected: false,
  unsafe_public_flag_detected: false,
  external_or_auto_publish_detected: false
};
for (const [check, value] of Object.entries(expectedChecks)) {
  assert.ok(gate.records.some((record) => record.check_name === check && record.check_value === value), `${check} must be ${value}`);
}

for (const record of gate.records) {
  assert.equal(record.audit_status, "locked_audit_pass");
  assert.equal(record.private_local_policy_unchanged, true);
  assert.equal(record.protected_mode, true);
  assert.equal(record.plan_only, true);
  assert.equal(record.external_connection, false);
  assert.equal(record.auto_publish, false);
  assert.equal(record.auto_execution, false);
  assert.equal(record.github_pages_change_allowed, false);
  assert.equal(record.github_pages_setting_change_allowed, false);
  assert.equal(record.repository_visibility_change_allowed, false);
  assert.equal(record.public_release_allowed, false);
  assert.equal(record.owner_approval_lock_active, true);
  assert.equal(record.final_public_release_block, true);
  assert.equal(record.all_device_confirmations_approved, false);
  assert.equal(record.public_release_ready, false);
  assert.deepEqual(record.blocked_actions, engine.BLOCKED_ACTIONS);
  assert.deepEqual(record.allowed_actions, engine.ALLOWED_ACTIONS);
}

assert.equal(db.phase, "Phase20-16");
assert.equal(db.gateStatus, "private_release_lock_audit_plan_only");
assert.equal(db.executionPolicy, "PLAN_ONLY");
assert.equal(db.protectionPolicy, "Protected");
assert.equal(db.auditScope.length, 4);
assert.equal(db.privateLocalPolicyUnchanged, true);
assert.equal(db.publicReleaseBlocked, true);
assert.equal(db.externalConnection, false);
assert.equal(db.autoPublish, false);
assert.equal(db.autoExecution, false);
assert.equal(db.githubPagesChangeAllowed, false);
assert.equal(db.githubPagesSettingChangeAllowed, false);
assert.equal(db.repositoryVisibilityChangeAllowed, false);
assert.equal(db.publicReleaseAllowed, false);
assert.equal(db.manualConfirmationRequiredBeforePublicRelease, true);
assert.equal(db.manualOwnerConfirmationRequired, true);
assert.equal(db.ownerApprovalLockActive, true);
assert.equal(db.finalPublicReleaseBlock, true);
assert.equal(db.allDeviceConfirmationsApproved, false);
assert.equal(db.publicReleaseReady, false);
assert.equal(db.protectedMode, true);
assert.equal(db.unsafeFlagsCount, 0);
assert.equal(db.auditChecks.length, 10);
assert.deepEqual(db.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(db.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(summaryDb.phase, "Phase20-16");
assert.equal(summaryDb.phase20_16_summary.totalAuditChecks, 10);
assert.equal(summaryDb.phase20_16_summary.allRequiredLocksActive, true);
assert.equal(summaryDb.phase20_16_summary.publicReleaseBlockIntegrity, true);
assert.equal(summaryDb.phase20_16_summary.privateLocalPolicyIntegrity, true);
assert.equal(summaryDb.phase20_16_summary.unsafeUnlockDetected, false);
assert.equal(summaryDb.phase20_16_summary.unsafePublicFlagDetected, false);
assert.equal(summaryDb.phase20_16_summary.externalOrAutoPublishDetected, false);
assert.equal(summaryDb.phase20_16_summary.publicReleaseAllowed, false);
assert.equal(summaryDb.phase20_16_summary.publicReleaseReady, false);
assert.equal(summaryDb.phase20_16_summary.unsafeFlagsCount, 0);
assert.deepEqual(summaryDb.allowedActions, engine.ALLOWED_ACTIONS);
assert.deepEqual(summaryDb.blockedActions, engine.BLOCKED_ACTIONS);

assert.equal(phase2012Summary.phase20_12_summary.publicReleaseAllowed, false);
assert.equal(phase2012Summary.phase20_12_summary.externalConnection, false);
assert.equal(phase2012Summary.phase20_12_summary.autoPublish, false);
assert.equal(phase2013Summary.phase20_13_summary.publicReleaseAllowed, false);
assert.equal(phase2013Summary.phase20_13_summary.allDevicesManuallyApproved, false);
assert.equal(phase2014Summary.phase20_14_summary.publicReleaseAllowed, false);
assert.equal(phase2014Summary.phase20_14_summary.publicReleaseReady, false);
assert.equal(phase2014Summary.phase20_14_summary.finalPublicReleaseBlock, true);
assert.equal(phase2015Summary.phase20_15_summary.publicReleaseAllowed, false);
assert.equal(phase2015Summary.phase20_15_summary.publicReleaseReady, false);
assert.equal(phase2015Summary.phase20_15_summary.ownerApprovalLockActive, true);
assert.equal(phase2015Summary.phase20_15_summary.allDeviceConfirmationsApproved, false);

for (const id of [
  "phase20-16-private-release-lock-audit-gate-builder",
  "phase20-15-owner-manual-approval-lock-gate-builder",
  "phase20-14-public-release-final-block-gate-builder",
  "phase20-13-manual-device-confirmation-gate-builder",
  "phase20-12-private-operation-safety-gate-builder"
]) {
  assert.ok(index.includes(`id="${id}"`), `${id} panel is visible`);
  assert.ok(privateLocal.includes(`href="index.html#${id}"`), `${id} private-local link is visible`);
}
assert.ok(index.includes('<script src="phase20-16-private-release-lock-audit-gate-builder.js"></script>'));
assert.ok(privateLocal.includes("Phase20-16 Private Release Lock Audit Gate"));

const builderSource = readText("phase20-16-private-release-lock-audit-gate-builder.js");
for (const forbidden of [
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "fetch(",
  "external_connection: true",
  "external_connection_allowed: true",
  "auto_publish: true",
  "auto_publish_allowed: true",
  "auto_execution: true",
  "auto_execution_allowed: true",
  "github_pages_change_allowed: true",
  "github_pages_setting_change_allowed: true",
  "repository_visibility_change_allowed: true",
  "public_release_allowed: true",
  "public_release_ready: true",
  "unsafe_unlock_detected: true",
  "unsafe_public_flag_detected: true",
  "external_or_auto_publish_detected: true"
]) {
  assert.equal(builderSource.includes(forbidden), false, `${forbidden} must not appear in Phase20-16 builder`);
}

console.log("phase20-16 private release lock audit gate builder tests passed");
