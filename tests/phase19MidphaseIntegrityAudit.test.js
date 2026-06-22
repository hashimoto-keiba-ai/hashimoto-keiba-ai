const assert = require("assert");
const fs = require("fs");
const path = require("path");
const engine = require("../phase19-midphase-integrity-audit.js");

const root = path.resolve(__dirname, "..");
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

assert.strictEqual(engine.PHASE, "Phase19-7");
assert.strictEqual(engine.BASE_MAIN_COMMIT, "2e098f4e5cc0f9e7d5f7fcaa37fa099ef37369bf");
assert.deepStrictEqual(engine.MIDPHASE_STATUSES, ["midphase_ready", "midphase_warning", "midphase_blocked", "protected_only", "plan_only_midphase"]);
assert.deepStrictEqual(engine.RISK_SUMMARIES, ["no_remaining_risk", "low_risk", "medium_risk", "high_risk", "protected_risk", "blocked_risk"]);
assert.deepStrictEqual(engine.BLOCKED_ACTIONS, ["external_connection", "auto_execution", "auto_repair", "auto_overwrite", "auto_rollback"]);
assert.deepStrictEqual(engine.ALLOWED_ACTIONS, ["plan", "simulate", "validate", "audit", "report"]);

const availableFiles = [...engine.SOURCE_ASSETS];
const contents = Object.fromEntries(availableFiles.map((file) => [file, readText(file)]));
const databases = Object.fromEntries(engine.DATABASES.map((file) => [file, readJson(file)]));
databases["phase19-safety-contract-db.json"] = readJson("phase19-safety-contract-db.json");
databases["phase19-final-risk-summary-db.json"] = readJson("phase19-final-risk-summary-db.json");

const audit = engine.buildMidphaseAudit({
  availableFiles,
  contents,
  databases,
  validation: engine.DEFAULT_VALIDATION
});

assert.strictEqual(audit.phase19_midphase_status, "plan_only_midphase");
assert.strictEqual(audit.phase19_modules_present, true);
assert.strictEqual(audit.phase19_dbs_present, true);
assert.strictEqual(audit.phase19_tests_present, true);
assert.strictEqual(audit.dashboard_links_ok, true);
assert.strictEqual(audit.private_local_links_ok, true);
assert.strictEqual(audit.readme_links_ok, true);
assert.strictEqual(audit.plan_only_enforced, true);
assert.strictEqual(audit.official_release_protected, true);
assert.strictEqual(audit.execution_blocked, true);
assert.strictEqual(audit.external_connection_blocked, true);
assert.strictEqual(audit.unsafe_flags_count, 0);
assert.strictEqual(audit.conflict_marker_count, 0);
assert.strictEqual(audit.remaining_risk_summary, "no_remaining_risk");
assert.strictEqual(audit.recommended_next_phase, "Phase19-8");
assert.strictEqual(audit.executionAllowed, false);
assert.strictEqual(audit.autoExecutionAllowed, false);
assert.strictEqual(audit.auto_execution_allowed, false);
assert.strictEqual(audit.external_connection_allowed, false);

const missingModule = engine.buildMidphaseAudit({ availableFiles: availableFiles.filter((file) => file !== engine.MODULES[0]), contents, databases, validation: engine.DEFAULT_VALIDATION });
assert.strictEqual(missingModule.phase19_midphase_status, "midphase_blocked");
assert.strictEqual(missingModule.recommended_next_phase, "remediation_review");

const unsafeDatabases = JSON.parse(JSON.stringify(databases));
unsafeDatabases["phase19-safety-contract-db.json"].executionAllowed = true;
const unsafe = engine.buildMidphaseAudit({ availableFiles, contents, databases: unsafeDatabases, validation: engine.DEFAULT_VALIDATION });
assert.strictEqual(unsafe.phase19_midphase_status, "midphase_blocked");
assert.ok(unsafe.unsafe_flags_count > 0);

const noRiskDatabases = JSON.parse(JSON.stringify(databases));
noRiskDatabases["phase19-final-risk-summary-db.json"].remaining_risk_summary = { none: 5, low: 0, medium: 0, high: 0, protected: 1, blocked: 0 };
const ready = engine.buildMidphaseAudit({ availableFiles, contents, databases: noRiskDatabases, validation: engine.DEFAULT_VALIDATION });
assert.strictEqual(ready.phase19_midphase_status, "plan_only_midphase");
assert.strictEqual(ready.recommended_next_phase, "Phase19-8");

const auditDb = readJson("phase19-midphase-integrity-audit-db.json");
const summaryDb = readJson("phase19-midphase-integrity-summary-db.json");
assert.strictEqual(auditDb.phase19_midphase_status, "plan_only_midphase");
assert.strictEqual(summaryDb.remaining_risk_summary, "no_remaining_risk");
assert.strictEqual(auditDb.recommended_next_phase, "Phase19-8");
assert.strictEqual(auditDb.executionAllowed, false);
assert.strictEqual(auditDb.external_connection_allowed, false);

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const readme = readText("README.md");
assert.ok(index.includes('id="phase19-midphase-integrity-audit"'));
assert.ok(index.includes('src="phase19-midphase-integrity-audit.js"'));
assert.ok(privateLocal.includes("index.html#phase19-midphase-integrity-audit"));
assert.ok(readme.includes("## Phase19-7 Global Network Mid-Phase Integrity Audit"));

console.log("Phase19-7 mid-phase integrity audit tests passed");
