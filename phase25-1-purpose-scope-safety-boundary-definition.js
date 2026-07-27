(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase251PurposeScopeSafetyBoundary = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const deepFreeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
    }
    return value;
  };

  const PURPOSE = "Phase24までの手動取得・一時保存・検証・正式取込・監査の流れを前提に、将来の外部データ取得へ進むための安全な準備・設計・管理基盤を定義する。";
  const IN_SCOPE = deepFreeze([
    "外部データ取得候補の分類（オッズ・出馬情報・結果情報など）",
    "データ提供元候補の管理",
    "取得方式候補の管理",
    "手動取得と自動取得の境界",
    "取得前の安全確認",
    "取得データの一時保存",
    "検証前データと正式データの分離",
    "監査記録・操作履歴",
    "人間による承認・開始・停止・再開判断"
  ]);
  const OUT_OF_SCOPE = deepFreeze([
    "馬券の自動購入",
    "IPAT等への自動ログイン",
    "投票操作",
    "購入金額の自動確定",
    "外部サイト規約を無視した取得",
    "CAPTCHA回避",
    "アクセス制限回避",
    "認証回避",
    "非公開情報の取得",
    "人間の承認を省略した自動開始",
    "取得データの自動正式反映",
    "取得結果による自動学習更新",
    "Public公開",
    "GitHub Pagesでの公開運用"
  ]);
  const SAFETY_BOUNDARY = deepFreeze({
    privateLocalOnly: true,
    planOnly: true,
    protectedMode: true,
    publicAccessAllowed: false,
    githubPagesAllowed: false,
    automaticBettingAllowed: false,
    automaticLoginAllowed: false,
    automaticPurchaseAllowed: false,
    automaticApplicationAllowed: false,
    automaticLearningUpdateAllowed: false,
    externalAcquisitionExecutionAllowed: false,
    humanApprovalRequired: true,
    humanStartRequired: true,
    humanStopControlRequired: true,
    auditLogRequired: true
  });
  const ACQUISITION_STAGES = deepFreeze([
    "definition",
    "source_candidate_registration",
    "acquisition_method_review",
    "terms_and_safety_review",
    "test_plan",
    "manual_test_ready",
    "manual_test_executed",
    "result_review",
    "limited_execution_candidate",
    "suspended",
    "rejected",
    "closed"
  ]);
  const CURRENT_STAGE = "definition";
  const REQUIRED_TRUE = deepFreeze([
    "privateLocalOnly",
    "planOnly",
    "protectedMode",
    "humanApprovalRequired",
    "humanStartRequired",
    "humanStopControlRequired",
    "auditLogRequired"
  ]);
  const REQUIRED_FALSE = deepFreeze([
    "publicAccessAllowed",
    "githubPagesAllowed",
    "automaticBettingAllowed",
    "automaticLoginAllowed",
    "automaticPurchaseAllowed",
    "automaticApplicationAllowed",
    "automaticLearningUpdateAllowed",
    "externalAcquisitionExecutionAllowed"
  ]);

  function evaluateSafetyGate(environment) {
    const config = Object.assign({}, SAFETY_BOUNDARY, environment || {});
    const reasons = [];
    REQUIRED_TRUE.forEach(key => {
      if (config[key] !== true) reasons.push(`${key}_must_be_true`);
    });
    REQUIRED_FALSE.forEach(key => {
      if (config[key] !== false) reasons.push(`${key}_must_be_false`);
    });
    return deepFreeze({
      available: reasons.length === 0,
      externalAcquisitionExecutionAllowed: false,
      currentStage: CURRENT_STAGE,
      reasons
    });
  }

  function definition() {
    return deepFreeze({
      namespace: "hashimotoKeibaAi.phase25.definition.v1",
      phase: "Phase25-1",
      purpose: PURPOSE,
      inScope: IN_SCOPE,
      outOfScope: OUT_OF_SCOPE,
      safetyBoundary: SAFETY_BOUNDARY,
      acquisitionStages: ACQUISITION_STAGES,
      currentStage: CURRENT_STAGE,
      executionImplemented: false,
      networkCommunicationImplemented: false
    });
  }

  function render(documentRef, environment) {
    if (!documentRef) return evaluateSafetyGate(environment);
    const gate = evaluateSafetyGate(environment);
    const status = documentRef.getElementById("p251-gate-status");
    const reasons = documentRef.getElementById("p251-gate-reasons");
    const stage = documentRef.getElementById("p251-current-stage");
    if (status) {
      status.textContent = gate.available
        ? "定義表示利用可能（外部取得実行は未許可）"
        : "安全ゲート閉鎖";
      status.dataset.available = String(gate.available);
    }
    if (reasons) reasons.textContent = gate.reasons.length ? gate.reasons.join(" / ") : "違反なし";
    if (stage) stage.textContent = CURRENT_STAGE;
    return gate;
  }

  if (typeof document !== "undefined") {
    const start = () => render(document, SAFETY_BOUNDARY);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    PURPOSE,
    IN_SCOPE,
    OUT_OF_SCOPE,
    SAFETY_BOUNDARY,
    ACQUISITION_STAGES,
    CURRENT_STAGE,
    REQUIRED_TRUE,
    REQUIRED_FALSE,
    evaluateSafetyGate,
    definition,
    render
  };
});
