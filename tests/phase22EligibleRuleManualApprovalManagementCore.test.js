const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-12-eligible-rule-manual-approval-management-core.js");

function memoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    }
  };
}

function samplePhase2211Store() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-12T09:00:00.000Z",
    sourceRaceKey: "2026-07-12東京11R",
    finalized: true,
    finalizedAt: "2026-07-12T09:10:00.000Z",
    reviews: [
      {
        reviewId: "review-eligible",
        name: "回収率改善レビュー",
        description: "eligible候補",
        targetValidationPlanId: "plan-roi",
        targetImprovementRuleId: "rule-roi",
        reviewStatus: "completed",
        applicationDecision: "eligible",
        reviewer: "Owner",
        reviewedAt: "2026-07-12T09:05:00.000Z",
        reviewComment: "人が確認済み"
      },
      {
        reviewId: "review-pending",
        name: "保留レビュー",
        description: "pending",
        targetValidationPlanId: "plan-pending",
        targetImprovementRuleId: "rule-pending",
        reviewStatus: "completed",
        applicationDecision: "pending"
      },
      {
        reviewId: "review-incomplete",
        name: "未完了レビュー",
        description: "eligibleだが未完了",
        targetValidationPlanId: "plan-incomplete",
        targetImprovementRuleId: "rule-incomplete",
        reviewStatus: "under_review",
        applicationDecision: "eligible"
      }
    ]
  };
}

function makeApproved(approval) {
  return {
    ...approval,
    approvalStatus: "approved",
    applicationStatus: "not_applied",
    finalApprover: "Owner",
    approverId: "owner-001",
    approvedAt: "2026-07-12T10:00:00.000Z",
    approvalConditions: "Private Localで手動確認後のみ",
    effectiveStartDate: "2026-07-12",
    effectiveEndDate: "2026-08-12"
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

assert.strictEqual(engine.REVIEW_STORAGE_KEY, "hashimotoKeibaAi.phase22.validationResultReviewApplicationDecision.v1");
assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.eligibleRuleManualApprovalManagement.v1");

const storage = memoryStorage({
  [engine.REVIEW_STORAGE_KEY]: JSON.stringify(samplePhase2211Store())
});
const reviewLoad = engine.loadReviewStore(storage);
assert.strictEqual(reviewLoad.parseError, false, "Phase22-11読込");
assert.strictEqual(engine.eligibleReviews(reviewLoad.reviewStore).length, 1, "eligibleだけ抽出");

const store = engine.normalizeApprovalStore({}, reviewLoad.reviewStore);
assert.strictEqual(store.approvals.length, 1, "eligible案件から承認案件生成");
assert.deepStrictEqual(
  engine.normalizeApprovalStore({}, reviewLoad.reviewStore).approvals.map((approval) => approval.approvalId),
  store.approvals.map((approval) => approval.approvalId),
  "同一入力で同一ID"
);

const approval = store.approvals[0];
assert.strictEqual(approval.targetReviewId, "review-eligible");
assert.strictEqual(approval.applicationStatus, "not_applied", "初期適用状態");
assert.strictEqual(approval.safety.automaticApply, false, "自動適用なし");
assert.ok(!engine.validateApproval({}).ok, "必須入力不足を拒否");
assert.ok(!engine.validateApproval({ ...approval, approvalStatus: "approved" }).ok, "承認者情報なしapproved拒否");
assert.ok(!engine.validateApproval({ ...approval, approvalStatus: "approved", finalApprover: "Owner", approverId: "owner-001" }).ok, "承認日時なしapproved拒否");
assert.ok(!engine.validateApproval({ ...approval, approvalStatus: "approved", finalApprover: "Owner", approverId: "owner-001", approvedAt: "2026-07-12T10:00:00.000Z" }).ok, "承認条件なしapproved拒否");
assert.ok(!engine.validateApproval({ ...makeApproved(approval), effectiveStartDate: "2026-08-12", effectiveEndDate: "2026-07-12" }).ok, "不正な有効期間拒否");
assert.ok(!engine.validateApproval({ ...makeApproved(approval), applicationStatus: "planned" }).ok, "approvedでもplanned拒否");
assert.ok(engine.validateApproval(makeApproved(approval)).ok, "正しいapproved");
assert.strictEqual(makeApproved(approval).applicationStatus, "not_applied", "approvedでもnot_applied");

const incompleteReviewApproval = engine.buildApprovalFromReview(reviewLoad.reviewStore.reviews.find((review) => review.reviewId === "review-incomplete"), reviewLoad.reviewStore);
assert.ok(!engine.validateApproval(makeApproved(incompleteReviewApproval)).ok, "completed以外のレビューからapproved拒否");

assert.ok(!engine.validateApproval({ ...approval, approvalStatus: "rejected" }).ok, "rejected理由必須");
assert.ok(engine.validateApproval({ ...approval, approvalStatus: "rejected", rejectionReason: "承認しない" }).ok, "rejected理由あり");
assert.ok(!engine.validateApproval({ ...approval, approvalStatus: "revoked", revokeReason: "取消" }).ok, "revoked理由・取消者・取消日時必須");
assert.ok(engine.validateApproval({ ...approval, approvalStatus: "revoked", revokeReason: "条件変更", revoker: "Owner", revokedAt: "2026-07-13T10:00:00.000Z" }).ok, "revoked必須項目あり");
assert.ok(!engine.validateApproval({ ...approval, approvalStatus: "cancelled" }).ok, "cancelled理由必須");
assert.ok(engine.validateApproval({ ...approval, approvalStatus: "cancelled", cancellationReason: "中止" }).ok, "cancelled理由あり");

assert.strictEqual(engine.canTransition("draft", "awaiting_approval"), true, "正しい状態遷移");
assert.strictEqual(engine.canTransition("draft", "approved"), false, "不正な状態遷移拒否");
assert.strictEqual(engine.canTransition("revoked", "approved"), false, "終端からapproved拒否");
assert.strictEqual(engine.canTransition("rejected", "approved"), false, "rejectedからapproved拒否");
assert.strictEqual(engine.transitionApproval({ ...approval, approvalStatus: "approved" }, "revoked").transitioned, true, "approvedからrevoked");
assert.strictEqual(engine.applyApprovalEdit(makeApproved(approval), { approvalConditions: "変更" }).updated, false, "approved後の直接変更拒否");

const reapproval = engine.createReapprovalCase(makeApproved(approval), "2026-07-14T00:00:00.000Z");
assert.notStrictEqual(reapproval.approvalId, approval.approvalId, "再承認は新規案件");
assert.strictEqual(reapproval.approvalStatus, "draft");
assert.strictEqual(reapproval.applicationStatus, "not_applied");

const payloadBefore = storage.getItem(engine.REVIEW_STORAGE_KEY);
const approvedStore = { ...store, approvals: [makeApproved(approval)] };
const finalizeResult = engine.finalizeApprovalStore(approvedStore, "Owner", new Date("2026-07-12T11:00:00.000Z"));
assert.strictEqual(finalizeResult.finalized, true, "確定成功");
const saveResult = engine.saveApprovalStore(storage, finalizeResult.store, new Date("2026-07-12T11:01:00.000Z"));
assert.strictEqual(saveResult.saved, true, "localStorage保存");
assert.strictEqual(storage.getItem(engine.REVIEW_STORAGE_KEY), payloadBefore, "既存Phase22-11データを書き換えない");
const restored = engine.loadSavedApprovalStore(storage, reviewLoad.reviewStore);
assert.strictEqual(restored.store.approvals.length, 1, "復元");
assert.ok(engine.generatePlainText(restored.store).includes("承認済み・未適用・自動反映なし"), "テキスト安全表示");
assert.strictEqual(engine.deleteSavedApprovalStore(storage, () => false).deleted, false, "初期化は確認必須");
assert.strictEqual(engine.deleteSavedApprovalStore(storage, () => true).deleted, true, "Phase22-12のみ初期化");
assert.strictEqual(storage.getItem(engine.REVIEW_STORAGE_KEY), payloadBefore, "初期化でもPhase22-11非破壊");

const malformedStorage = memoryStorage({ [engine.STORAGE_KEY]: "{broken" });
assert.strictEqual(engine.loadSavedApprovalStore(malformedStorage, reviewLoad.reviewStore).rejected, true, "破損保存データ拒否");
const invalidStoreStorage = memoryStorage({ [engine.STORAGE_KEY]: JSON.stringify({ approvals: "bad" }) });
assert.strictEqual(engine.loadSavedApprovalStore(invalidStoreStorage, reviewLoad.reviewStore).rejected, true, "不正保存データ拒否");

const warnings = engine.buildWarnings({ reviewStore: reviewLoad.reviewStore, store: approvedStore });
assert.ok(warnings.some((warning) => warning.message.includes("未適用")), "approvedでも未適用警告");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-manual-approval-management-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-11-validation-result-review-application-eligibility-decision-core.js") < index.indexOf("phase22-12-eligible-rule-manual-approval-management-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-manual-approval-management-core"'), "private-local導線");
assert.ok(css.includes(".phase22-approval-management-core"), "Phase22-12 CSS");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.eligibleRuleManualApprovalManagement.v1"), "README保存キー");
assert.ok(readme.includes("approved` keeps `applicationStatus: not_applied`"), "README安全仕様");

function makeNode() {
  return {
    dataset: {},
    children: [],
    value: "",
    textContent: "",
    disabled: false,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    addEventListener() {},
    set className(value) {
      this._className = value;
    },
    get className() {
      return this._className || "";
    }
  };
}

const nodes = new Map();
[
  "#phase22-manual-approval-management-core",
  "#phase22-approval-message",
  "#phase22-approval-finalized-status",
  "#phase22-approval-summary",
  "#phase22-approval-warning-list",
  "#phase22-approval-list",
  "#phase22-approval-confirmer",
  "#phase22-approval-text-output",
  "#phase22-approval-reload",
  "#phase22-approval-save",
  "#phase22-approval-restore",
  "#phase22-approval-reset",
  "#phase22-approval-finalize",
  "#phase22-approval-unlock",
  "#phase22-approval-text"
].forEach((id) => nodes.set(id, makeNode()));

const fakeDocument = {
  querySelector(selector) {
    return nodes.get(selector) || null;
  },
  createElement(tag) {
    const node = makeNode();
    node.tagName = tag.toUpperCase();
    if (tag === "option") node.selected = false;
    return node;
  }
};
const panel = engine.bindManualApprovalPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "file://相当初期化");
assert.ok(panel.nodes.summary.textContent.includes("承認案件"), "初期表示");
panel.actions["#phase22-approval-reload"]();
panel.actions["#phase22-approval-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-12"), "出力欄");

const sandbox = {
  window: {
    document: { readyState: "loading", addEventListener() {} }
  },
  document: { readyState: "loading", addEventListener() {} },
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readText("phase22-12-eligible-rule-manual-approval-management-core.js"), sandbox, { filename: "phase22-12-eligible-rule-manual-approval-management-core.js" });
assert.ok(sandbox.window.HashimotoPhase2212ManualApprovalManagementCore, "browser global export");

console.log("Phase22-12 eligible rule manual approval management core test passed");
