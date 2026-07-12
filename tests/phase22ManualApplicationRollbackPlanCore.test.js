const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-14-manual-application-plan-rollback-plan-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }
  };
}

function sampleApprovalStore() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T15:00:00.000Z",
    finalized: true,
    approvals: [
      { approvalId: "approval-ok", approvalStatus: "approved", applicationStatus: "not_applied", finalApprover: "Owner", approvedAt: "2026-07-12T12:00:00.000Z", approvalConditions: "手動のみ", effectiveStartDate: "2026-07-12", effectiveEndDate: "2026-08-12" },
      { approvalId: "approval-draft", approvalStatus: "awaiting_approval", applicationStatus: "not_applied" },
      { approvalId: "approval-planned", approvalStatus: "approved", applicationStatus: "planned" }
    ]
  };
}

function sampleImpactStore() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T15:10:00.000Z",
    sourceRaceKey: "2026-07-12東京11R",
    finalized: true,
    impacts: [
      { impactId: "impact-clear", name: "影響確認OK", description: "no conflict", targetApprovalId: "approval-ok", targetReviewId: "review-ok", targetValidationPlanId: "plan-ok", targetImprovementRuleId: "rule-ok", checkStatus: "cleared", decisionResult: "no_conflict", safetyWarning: "no_warning", checker: "Owner", checkedAt: "2026-07-12T14:00:00.000Z", checkComment: "確認済み" },
      { impactId: "impact-resolvable", name: "影響確認回避策あり", description: "resolvable", targetApprovalId: "approval-ok", targetReviewId: "review-ok", targetValidationPlanId: "plan-ok", targetImprovementRuleId: "rule-ok-2", checkStatus: "cleared", decisionResult: "resolvable", safetyWarning: "manual_resolution_required", mitigationPlan: "優先順位を手動固定", resolutionOwner: "Owner", resolutionDueDate: "2026-07-20", checker: "Owner", checkedAt: "2026-07-12T14:05:00.000Z", checkComment: "回避策あり" },
      { impactId: "impact-unresolved", targetApprovalId: "approval-ok", targetReviewId: "review-u", targetValidationPlanId: "plan-u", targetImprovementRuleId: "rule-u", checkStatus: "conflict_found", decisionResult: "unresolved", safetyWarning: "manual_resolution_required" },
      { impactId: "impact-blocked", targetApprovalId: "approval-ok", targetReviewId: "review-b", targetValidationPlanId: "plan-b", targetImprovementRuleId: "rule-b", checkStatus: "blocked", decisionResult: "blocked", safetyWarning: "application_blocked" },
      { impactId: "impact-draft-approval", targetApprovalId: "approval-draft", targetReviewId: "review-d", targetValidationPlanId: "plan-d", targetImprovementRuleId: "rule-d", checkStatus: "cleared", decisionResult: "no_conflict", safetyWarning: "no_warning" },
      { impactId: "impact-planned-approval", targetApprovalId: "approval-planned", targetReviewId: "review-p", targetValidationPlanId: "plan-p", targetImprovementRuleId: "rule-p", checkStatus: "cleared", decisionResult: "no_conflict", safetyWarning: "no_warning" }
    ]
  };
}

function readyPlan(plan) {
  return {
    ...plan,
    planStatus: "ready",
    executionStatus: "not_started",
    planDecision: "ready_for_manual_execution",
    manualSteps: [
      { stepId: "step-1", order: 1, work: "バックアップ確認", operator: "Operator", checker: "Checker", prerequisites: "保存済み", completionCriteria: "確認完了" },
      { stepId: "step-2", order: 2, work: "手動反映手順確認", operator: "Operator", checker: "Checker", prerequisites: "step-1", completionCriteria: "手順確認" }
    ],
    scheduledAt: "2026-07-13T10:00:00",
    deadlineAt: "2026-07-13T11:00:00",
    operator: "Operator",
    checker: "Checker",
    backupPlan: { targets: "localStorage export", destination: "local folder", procedure: "手動保存", verificationMethod: "目視確認", retentionPeriod: "30日" },
    rollbackPlan: { conditions: "異常時", decisionMaker: "Owner", operator: "Operator", restoreTargets: "local data", restoreProcedure: "手動復旧", verificationItems: "画面確認", targetRecoveryTime: "30分" },
    abortConditions: "不明点がある場合",
    postApplicationChecks: [{ itemId: "check-1", order: 1, content: "表示確認", expectedResult: "正常表示" }],
    humanApprovalReviewer: "Owner",
    humanApprovedAt: "2026-07-13T09:30:00",
    humanApprovalComment: "手動計画を確認"
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1");
const storage = memoryStorage({
  [engine.IMPACT_STORAGE_KEY]: JSON.stringify(sampleImpactStore()),
  [engine.APPROVAL_STORAGE_KEY]: JSON.stringify(sampleApprovalStore())
});
const impactLoad = engine.loadImpactStore(storage);
const approvalLoad = engine.loadApprovalStore(storage);
assert.strictEqual(engine.eligibleImpacts(impactLoad.impactStore, approvalLoad.approvalStore).length, 2, "cleared no_conflict/resolvableのみ生成対象");

const store = engine.normalizePlanStore({}, impactLoad.impactStore, approvalLoad.approvalStore);
assert.strictEqual(store.plans.length, 2, "計画生成");
assert.deepStrictEqual(engine.normalizePlanStore({}, impactLoad.impactStore, approvalLoad.approvalStore).plans.map((plan) => plan.planId), store.plans.map((plan) => plan.planId), "決定的ID");
const plan = store.plans.find((item) => item.targetImpactId === "impact-clear");
const resolvable = store.plans.find((item) => item.targetImpactId === "impact-resolvable");

assert.ok(!engine.validatePlan({ ...plan, planDecision: "ready_for_manual_execution" }).ok, "手順なしready拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), manualSteps: [] }).ok, "適用手順なしready拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), manualSteps: [{ order: 1, work: "a" }, { order: 1, work: "b" }] }).ok, "手順重複拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), manualSteps: [{ order: 1, work: "a" }, { order: 3, work: "b" }] }).ok, "手順欠番拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), operator: "" }).ok, "実施者なしready拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), checker: "" }).ok, "確認者なしready拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), operator: "Owner", checker: "Owner", samePersonExceptionReason: "" }).ok, "同一人物例外理由なし拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), backupPlan: {} }).ok, "バックアップなし拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), rollbackPlan: {} }).ok, "ロールバックなし拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), abortConditions: "" }).ok, "中止条件なし拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), postApplicationChecks: [] }).ok, "適用後確認なし拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), scheduledAt: "2026-07-14T10:00:00", deadlineAt: "2026-07-13T10:00:00" }).ok, "不正な日付範囲拒否");
assert.ok(!engine.validatePlan({ ...readyPlan(plan), sourceSafetyWarning: "application_blocked" }).ok, "application_blocked ready拒否");
assert.ok(!engine.validatePlan(readyPlan(resolvable)).ok, "resolvable回避策未反映拒否");
assert.ok(engine.validatePlan({ ...readyPlan(resolvable), mitigationReflected: "計画へ反映済み" }).ok, "resolvable回避策反映あり");
assert.ok(engine.validatePlan(readyPlan(plan)).ok, "ready条件OK");
assert.strictEqual(readyPlan(plan).executionStatus, "not_started", "readyでもnot_started");
assert.strictEqual(readyPlan(plan).safety.automaticApply, false, "自動適用なし");
assert.strictEqual(readyPlan(plan).safety.autoExecution, false, "自動実行なし");

assert.ok(!engine.validatePlan({ ...plan, planDecision: "revision_required" }).ok, "revision_required理由必須");
assert.ok(!engine.validatePlan({ ...plan, planDecision: "blocked" }).ok, "blocked理由必須");
assert.ok(!engine.validatePlan({ ...plan, planDecision: "cancelled" }).ok, "cancelled理由必須");
assert.strictEqual(engine.canTransition("draft", "planning"), true, "正しい状態遷移");
assert.strictEqual(engine.canTransition("draft", "ready"), false, "不正状態遷移拒否");
assert.strictEqual(engine.applyPlanEdit({ ...plan, planStatus: "approved" }, { operator: "x" }).updated, false, "approved後直接編集拒否");
assert.strictEqual(engine.applyPlanEdit({ ...plan, planStatus: "ready" }, { operator: "x" }).updated, false, "ready後直接編集拒否");
assert.notStrictEqual(engine.createReplanCase(readyPlan(plan), "2026-07-14T00:00:00").planId, readyPlan(plan).planId, "再計画は新規案件");

const beforeImpact = storage.getItem(engine.IMPACT_STORAGE_KEY);
const beforeApproval = storage.getItem(engine.APPROVAL_STORAGE_KEY);
const finalStore = { ...store, plans: [readyPlan(plan)] };
assert.strictEqual(engine.finalizePlanStore(finalStore, "Owner", new Date("2026-07-13T12:00:00.000Z")).finalized, true, "確定成功");
assert.strictEqual(engine.savePlanStore(storage, finalStore, new Date("2026-07-13T12:01:00.000Z")).saved, true, "保存");
assert.strictEqual(storage.getItem(engine.IMPACT_STORAGE_KEY), beforeImpact, "Phase22-13非破壊");
assert.strictEqual(storage.getItem(engine.APPROVAL_STORAGE_KEY), beforeApproval, "Phase22-12非破壊");
assert.strictEqual(engine.loadSavedPlanStore(storage, impactLoad.impactStore, approvalLoad.approvalStore).store.plans.length, 2, "復元");
assert.ok(engine.generatePlainText(finalStore).includes("未実行・未適用・自動反映なし"), "テキスト安全表示");
assert.strictEqual(engine.deleteSavedPlanStore(storage, () => false).deleted, false, "初期化確認必須");
assert.strictEqual(engine.deleteSavedPlanStore(storage, () => true).deleted, true, "Phase22-14のみ初期化");

assert.strictEqual(engine.loadSavedPlanStore(memoryStorage({ [engine.STORAGE_KEY]: "{broken" }), impactLoad.impactStore, approvalLoad.approvalStore).rejected, true, "破損保存拒否");
assert.strictEqual(engine.loadSavedPlanStore(memoryStorage({ [engine.STORAGE_KEY]: JSON.stringify({ plans: "bad" }) }), impactLoad.impactStore, approvalLoad.approvalStore).rejected, true, "不正保存拒否");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-manual-application-plan-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-13-pre-application-impact-scope-conflict-check-core.js") < index.indexOf("phase22-14-manual-application-plan-rollback-plan-core.js"), "HTML読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-manual-application-plan-core"'), "private-local導線");
assert.ok(css.includes(".phase22-plan-rollback-core"), "CSS");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.manualApplicationRollbackPlan.v1"), "README保存キー");
assert.ok(readme.includes("`ready_for_manual_execution` still does not execute anything automatically"), "README安全仕様");

function makeNode() {
  return { dataset: {}, children: [], value: "", textContent: "", disabled: false, appendChild(child) { this.children.push(child); return child; }, replaceChildren(...children) { this.children = children; }, addEventListener() {}, set className(value) { this._className = value; }, get className() { return this._className || ""; } };
}
const nodes = new Map();
["#phase22-manual-application-plan-core", "#phase22-plan-message", "#phase22-plan-finalized-status", "#phase22-plan-summary", "#phase22-plan-warning-list", "#phase22-plan-list", "#phase22-plan-confirmer", "#phase22-plan-text-output", "#phase22-plan-reload", "#phase22-plan-save", "#phase22-plan-restore", "#phase22-plan-reset", "#phase22-plan-finalize", "#phase22-plan-unlock", "#phase22-plan-text"].forEach((id) => nodes.set(id, makeNode()));
const fakeDocument = { querySelector(selector) { return nodes.get(selector) || null; }, createElement(tag) { const node = makeNode(); node.tagName = tag.toUpperCase(); if (tag === "option") node.selected = false; return node; } };
const panel = engine.bindManualApplicationPlanPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "file://相当初期化");
assert.ok(panel.nodes.summary.textContent.includes("計画"), "初期表示");
panel.actions["#phase22-plan-reload"]();
panel.actions["#phase22-plan-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-14"), "出力欄");

const sandbox = { window: { document: { readyState: "loading", addEventListener() {} } }, document: { readyState: "loading", addEventListener() {} }, console };
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-14-manual-application-plan-rollback-plan-core.js"), sandbox, { filename: "phase22-14-manual-application-plan-rollback-plan-core.js" });
assert.ok(sandbox.window.HashimotoPhase2214ManualApplicationRollbackPlanCore, "browser global export");

console.log("Phase22-14 manual application rollback plan core test passed");
