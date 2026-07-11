const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const engine = require("../phase22-11-validation-result-review-application-eligibility-decision-core.js");

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
    },
    dump() {
      return { ...store };
    }
  };
}

function samplePhase2210Store() {
  return {
    schemaVersion: 1,
    savedAt: "2026-07-11T10:00:00.000Z",
    sourceRaceKey: "2026-07-11東京11R",
    finalized: true,
    finalizedAt: "2026-07-11T10:10:00.000Z",
    plans: [
      {
        planId: "plan-passed",
        name: "回収率改善ルール",
        description: "候補ルールを検証する",
        targetRuleId: "rule-roi",
        validationStatus: "completed",
        judgementResult: "passed",
        judgementReason: "baselineより良好",
        comparison: { baseline: "現行", candidate: "候補" },
        metrics: ["回収率", "的中率"],
        passCriteria: "回収率100%以上",
        failCriteria: "回収率悪化",
        evaluationValue: "118%",
        criteriaValue: "100%",
        differenceValue: "+18",
        sampleSizeCondition: "10",
        validationMemo: "手動確認済み"
      },
      {
        planId: "plan-failed",
        name: "失敗ルール",
        description: "失敗候補",
        targetRuleId: "rule-failed",
        validationStatus: "completed",
        judgementResult: "failed",
        judgementReason: "悪化",
        comparison: { baseline: "現行", candidate: "候補" },
        metrics: ["回収率"],
        passCriteria: "改善",
        failCriteria: "悪化",
        sampleSizeCondition: "5"
      },
      {
        planId: "plan-running",
        name: "実行中ルール",
        description: "未完了",
        targetRuleId: "rule-running",
        validationStatus: "running",
        judgementResult: "pending",
        comparison: { baseline: "現行", candidate: "候補" },
        metrics: ["回収率"],
        passCriteria: "改善",
        failCriteria: "悪化",
        sampleSizeCondition: "5"
      },
      {
        planId: "plan-inconclusive",
        name: "未確定ルール",
        description: "判定不能",
        targetRuleId: "rule-inconclusive",
        validationStatus: "completed",
        judgementResult: "inconclusive",
        judgementReason: "サンプル不足",
        comparison: { baseline: "現行", candidate: "候補" },
        metrics: ["回収率"],
        passCriteria: "改善",
        failCriteria: "悪化",
        sampleSizeCondition: "2"
      }
    ]
  };
}

function makeEligibleReview(review) {
  return {
    ...review,
    reviewStatus: "completed",
    applicationDecision: "eligible",
    reviewer: "Owner",
    reviewedAt: "2026-07-11T11:00:00.000Z",
    reviewComment: "人が確認した"
  };
}

function readText(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

assert.strictEqual(engine.STORAGE_KEY, "hashimotoKeibaAi.phase22.validationResultReviewApplicationDecision.v1");
assert.strictEqual(engine.VALIDATION_PLAN_STORAGE_KEY, "hashimotoKeibaAi.phase22.improvementRuleValidationPlan.v1");

const storage = memoryStorage({
  [engine.VALIDATION_PLAN_STORAGE_KEY]: JSON.stringify(samplePhase2210Store())
});
const validationLoad = engine.loadValidationPlanStore(storage);
assert.strictEqual(validationLoad.parseError, false);
assert.strictEqual(validationLoad.validationPlanStore.plans.length, 4, "Phase22-10データ読込");

const store = engine.normalizeReviewStore({}, validationLoad.validationPlanStore);
assert.strictEqual(store.reviews.length, 4, "レビュー案件生成");
assert.deepStrictEqual(store.reviews.map((review) => review.reviewId), store.reviews.map((review) => review.reviewId).slice().sort(), "決定的な順序");
assert.deepStrictEqual(
  engine.normalizeReviewStore({}, validationLoad.validationPlanStore).reviews.map((review) => review.reviewId),
  store.reviews.map((review) => review.reviewId),
  "同一入力で同一ID"
);

const passedReview = store.reviews.find((review) => review.targetValidationPlanId === "plan-passed");
assert.strictEqual(passedReview.applicationDecision, "pending", "passedでも自動eligibleにしない");
assert.strictEqual(passedReview.safety.automaticApply, false, "自動適用なし");
assert.strictEqual(passedReview.safety.automaticLearning, false, "自動学習なし");

assert.ok(!engine.validateReview({}).ok, "必須入力不足を拒否");
assert.ok(!engine.validateReview({ ...passedReview, reviewStatus: "completed", applicationDecision: "pending" }).ok, "pendingのままcompleted拒否");
assert.ok(!engine.validateReview({ ...passedReview, applicationDecision: "eligible" }).ok, "人レビューなしeligible拒否");
assert.ok(engine.validateReview(makeEligibleReview(passedReview)).ok, "人レビューありeligible許可");

const failedReview = store.reviews.find((review) => review.targetValidationPlanId === "plan-failed");
assert.ok(!engine.validateReview(makeEligibleReview(failedReview)).ok, "failedをeligible拒否");
const runningReview = store.reviews.find((review) => review.targetValidationPlanId === "plan-running");
assert.ok(!engine.validateReview({ ...runningReview, applicationDecision: "rejected", rejectionReason: "未完了" }).ok, "未完了検証から最終判定拒否");
const inconclusiveReview = store.reviews.find((review) => review.targetValidationPlanId === "plan-inconclusive");
assert.ok(!engine.validateReview(makeEligibleReview(inconclusiveReview)).ok, "inconclusiveをeligible拒否");

assert.ok(!engine.validateReview({ ...passedReview, applicationDecision: "revalidation_required", reviewStatus: "completed" }).ok, "再検証理由・条件必須");
assert.ok(engine.validateReview({ ...passedReview, applicationDecision: "revalidation_required", reviewStatus: "completed", revalidationReason: "サンプル不足", revalidationConditions: "20レース追加" }).ok, "再検証理由・条件あり");
assert.ok(!engine.validateReview({ ...passedReview, applicationDecision: "on_hold", reviewStatus: "completed", holdReason: "開催替わり待ち" }).ok, "保留理由・再確認条件必須");
assert.ok(engine.validateReview({ ...passedReview, applicationDecision: "on_hold", reviewStatus: "completed", holdReason: "開催替わり待ち", recheckConditions: "次開催で確認" }).ok, "保留理由・再確認条件あり");
assert.ok(!engine.validateReview({ ...passedReview, applicationDecision: "rejected", reviewStatus: "completed" }).ok, "却下理由必須");
assert.ok(engine.validateReview({ ...passedReview, applicationDecision: "rejected", reviewStatus: "completed", rejectionReason: "運用負荷が高い" }).ok, "却下理由あり");

assert.strictEqual(engine.canTransition("draft", "under_review"), true, "正しい状態遷移");
assert.strictEqual(engine.canTransition("draft", "completed"), false, "不正な状態遷移拒否");
assert.strictEqual(engine.transitionReview({ ...passedReview, reviewStatus: "completed" }, "under_review").transitioned, false, "completed後の直接変更拒否");
assert.strictEqual(engine.applyReviewEdit({ ...passedReview, reviewStatus: "completed" }, { reviewComment: "変更" }).updated, false, "completed後の直接編集拒否");

const payloadBefore = storage.getItem(engine.VALIDATION_PLAN_STORAGE_KEY);
const finalizedStore = {
  ...store,
  reviews: store.reviews
    .filter((review) => review.targetValidationPlanId !== "plan-running")
    .map((review) => review.targetValidationPlanId === "plan-passed" ? makeEligibleReview(review) : { ...review, reviewStatus: "completed", applicationDecision: "rejected", rejectionReason: "対象外" })
};
const finalizeResult = engine.finalizeReviewStore(finalizedStore, "Owner", new Date("2026-07-11T12:00:00.000Z"));
assert.strictEqual(finalizeResult.finalized, true, "確定成功");
const saveResult = engine.saveReviewStore(storage, finalizeResult.store, new Date("2026-07-11T12:01:00.000Z"));
assert.strictEqual(saveResult.saved, true, "localStorage保存");
assert.strictEqual(storage.getItem(engine.VALIDATION_PLAN_STORAGE_KEY), payloadBefore, "既存Phase22-10データを書き換えない");
const restored = engine.loadSavedReviewStore(storage, validationLoad.validationPlanStore);
assert.strictEqual(restored.store.reviews.length, 4, "復元");
assert.ok(engine.generatePlainText(restored.store).includes("未適用・自動反映なし"), "テキスト安全表示");
assert.strictEqual(engine.deleteSavedReviewStore(storage, () => false).deleted, false, "初期化は確認必須");
assert.strictEqual(engine.deleteSavedReviewStore(storage, () => true).deleted, true, "Phase22-11のみ初期化");
assert.strictEqual(storage.getItem(engine.VALIDATION_PLAN_STORAGE_KEY), payloadBefore, "初期化でもPhase22-10非破壊");

const malformedStorage = memoryStorage({ [engine.STORAGE_KEY]: "{broken" });
assert.strictEqual(engine.loadSavedReviewStore(malformedStorage, validationLoad.validationPlanStore).rejected, true, "破損保存データ拒否");
const invalidStoreStorage = memoryStorage({ [engine.STORAGE_KEY]: JSON.stringify({ reviews: "bad" }) });
assert.strictEqual(engine.loadSavedReviewStore(invalidStoreStorage, validationLoad.validationPlanStore).rejected, true, "不正保存データ拒否");

const warnings = engine.buildWarnings({ validationPlanStore: validationLoad.validationPlanStore, store: { ...store, reviews: [makeEligibleReview(passedReview)] } });
assert.ok(warnings.some((warning) => warning.message.includes("未適用")), "eligibleでも未適用警告");

const index = readText("index.html");
const privateLocal = readText("private-local.html");
const css = readText("dashboard.css");
const readme = readText("README.md");
assert.ok(index.includes('id="phase22-validation-result-review-application-decision-core"'), "HTML panel");
assert.ok(index.indexOf("phase22-10-improvement-rule-validation-plan-pre-application-evaluation-core.js") < index.indexOf("phase22-11-validation-result-review-application-eligibility-decision-core.js"), "HTML内の読み込み順");
assert.ok(privateLocal.includes('href="index.html#phase22-validation-result-review-application-decision-core"'), "private-local導線");
assert.ok(css.includes(".phase22-review-decision-core"), "Phase22-11 CSS");
assert.ok(readme.includes("hashimotoKeibaAi.phase22.validationResultReviewApplicationDecision.v1"), "README保存キー");
assert.ok(readme.includes("eligible is still unapplied") || readme.includes("eligible` is still unapplied"), "README安全仕様");

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
  "#phase22-validation-result-review-application-decision-core",
  "#phase22-review-message",
  "#phase22-review-finalized-status",
  "#phase22-review-summary",
  "#phase22-review-warning-list",
  "#phase22-review-list",
  "#phase22-review-confirmer",
  "#phase22-review-text-output",
  "#phase22-review-reload",
  "#phase22-review-save",
  "#phase22-review-restore",
  "#phase22-review-reset",
  "#phase22-review-finalize",
  "#phase22-review-unlock",
  "#phase22-review-text"
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
const panel = engine.bindReviewDecisionPanel({ document: fakeDocument, storage });
assert.strictEqual(panel.initialized, true, "file://相当初期化");
assert.ok(panel.nodes.summary.textContent.includes("レビュー"), "初期表示");
panel.actions["#phase22-review-reload"]();
panel.actions["#phase22-review-text"]();
assert.ok(panel.nodes.textOutput.value.includes("Phase22-11"), "出力欄");

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
vm.runInContext(readText("phase22-11-validation-result-review-application-eligibility-decision-core.js"), sandbox, { filename: "phase22-11-validation-result-review-application-eligibility-decision-core.js" });
assert.ok(sandbox.window.HashimotoPhase2211ValidationResultReviewDecisionCore, "browser global export");

console.log("Phase22-11 validation result review application decision core test passed");
