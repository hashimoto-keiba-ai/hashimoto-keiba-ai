const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../phase18-completion-audit.js");

assert.equal(engine.PHASE, "Phase18-18");
assert.equal(engine.BASE_MAIN_COMMIT.slice(0, 7), "009c9c1");
assert.equal(engine.EXECUTION_POLICY, "PLAN_ONLY");
assert.equal(engine.EXECUTION_ALLOWED, false);
assert.equal(engine.AUTO_EXECUTION_ALLOWED, false);
assert.equal(engine.EXTERNAL_CONNECTION_ALLOWED, false);
assert.equal(engine.PHASE_MANIFEST.length, 17);
assert.deepEqual(engine.COMPLETION_STATUSES, ["completion_ready", "completion_warning", "completion_blocked", "protected_only", "plan_only_complete"]);
assert.deepEqual(engine.RELEASE_AUDIT_STATUSES, ["release_audit_ready", "release_audit_warning", "release_audit_blocked", "protected_release_only"]);

const root = path.resolve(__dirname, "..");
const files = Object.fromEntries(engine.AUDIT_FILES.map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")]));
const report = engine.auditSnapshot({ files, testSummary: { passed: 15, failed: 0 }, mainBaseCommit: engine.BASE_MAIN_COMMIT }, () => new Date("2026-06-20T00:00:00.000Z"));
assert.equal(report.phase18_completion_status, "plan_only_complete");
assert.equal(report.release_audit_summary.status, "release_audit_ready");
for (const field of ["phase18_completion_status", "all_phase_files_present", "all_phase_tests_present", "dashboard_links_ok", "private_local_links_ok", "official_release_protected", "plan_only_enforced", "execution_blocked", "external_connection_blocked", "conflict_marker_zero", "json_valid", "javascript_valid", "test_summary", "release_audit_summary"]) assert.ok(Object.hasOwn(report, field), `${field} required`);
for (const field of ["all_phase_files_present", "all_phase_tests_present", "dashboard_links_ok", "private_local_links_ok", "official_release_protected", "plan_only_enforced", "execution_blocked", "external_connection_blocked", "conflict_marker_zero", "json_valid", "javascript_valid"]) assert.equal(report[field], true, `${field} must pass`);
assert.equal(report.executionAllowed, false);
assert.equal(report.autoExecutionAllowed, false);
assert.equal(report.auto_execution_allowed, false);
assert.equal(report.external_connection_allowed, false);
assert.equal(report.release_audit_summary.protected_release_status, "protected_release_only");

const missing = { ...files };
delete missing[engine.PHASE_MANIFEST[0].engine];
const warning = engine.auditSnapshot({ files: missing, testSummary: { passed: 15, failed: 0 } });
assert.equal(warning.phase18_completion_status, "completion_warning");
assert.equal(warning.release_audit_summary.status, "release_audit_warning");
const conflicted = { ...files, "README.md": `${files["README.md"]}\n<<<<<<< HEAD\na\n=======\nb\n>>>>>>> branch` };
const blocked = engine.auditSnapshot({ files: conflicted, testSummary: { passed: 14, failed: 1 } });
assert.equal(blocked.phase18_completion_status, "completion_blocked");
assert.equal(blocked.release_audit_summary.status, "release_audit_blocked");
const protectedOnly = engine.auditSnapshot({ files, testSummary: { passed: 15, failed: 0 }, protectedOnlyMode: true });
assert.equal(protectedOnly.phase18_completion_status, "protected_only");
assert.equal(protectedOnly.release_audit_summary.status, "protected_release_only");

const store = new Map();
const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
engine.persistReport(report, storage);
assert.equal(JSON.parse(storage.getItem(engine.STORAGE_KEY)).external_connection_allowed, false);

for (const file of engine.DATABASES) {
  const db = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  assert.equal(db.phase, "Phase18-18");
  assert.equal(db.executionPolicy, "PLAN_ONLY");
  assert.equal(db.external_connection_allowed, false);
}
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const privateLocal = fs.readFileSync(path.join(root, "private-local.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const diagnosis = fs.readFileSync(path.join(root, "self-diagnosis-page.js"), "utf8");
assert.ok(index.includes('id="phase18-completion-release-audit"'));
assert.ok(index.includes('<script src="phase18-completion-audit.js"></script>'));
assert.ok(privateLocal.includes('href="index.html#phase18-completion-release-audit"'));
assert.ok(readme.includes("Phase18-18 Global Completion Release Audit Engine"));
assert.ok(diagnosis.includes('"phase18-completion-audit-db.json"'));
assert.ok(diagnosis.includes('"tests/phase18CompletionReleaseAudit.test.js"'));

console.log("phase18 completion release audit tests passed");
