(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase261ExternalDataAcquisitionBoundary = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const deepFreeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
    }
    return value;
  };

  const PURPOSES = deepFreeze([
    "予想入力作業の省力化",
    "入力ミスの削減",
    "取得データの標準化",
    "予想時点データと確定結果データの分離",
    "後続の手動レビューの支援"
  ]);

  const NON_PURPOSES = deepFreeze([
    "自動購入",
    "自動意思決定",
    "取得データの予想結果への自動適用",
    "取得データの学習データへの自動登録"
  ]);

  const TARGET_DATA = deepFreeze([
    "開催情報", "競馬場", "レース番号", "発走時刻", "レース名", "コース種別", "距離",
    "馬場状態", "天候", "出馬表", "枠番", "馬番", "馬名", "性齢", "斤量", "騎手",
    "調教師", "単勝オッズ", "人気順位", "馬体重", "馬体重増減", "レース結果", "着順",
    "タイム", "着差", "上がり", "通過順位", "払戻情報"
  ]);

  const ACQUISITION_METHODS = deepFreeze([
    { id: "manual_entry", label: "人間が手動で入力", category: "manual", phase261Allowed: true },
    { id: "manual_file_selection", label: "人間がCSVまたはJSONファイルを選択", category: "manual", phase261Allowed: false },
    { id: "manual_paste", label: "人間がコピーしたテキストを貼り付け", category: "manual", phase261Allowed: false },
    { id: "manual_single_acquisition", label: "人間が開始ボタンを押した場合だけ単発取得", category: "future_manual_start", phase261Allowed: false },
    { id: "official_api", label: "将来検討用の公式API", category: "future_candidate", phase261Allowed: false },
    { id: "web_acquisition", label: "将来検討用のWeb取得", category: "future_candidate", phase261Allowed: false },
    { id: "scheduled_acquisition", label: "定期自動取得", category: "prohibited", phase261Allowed: false },
    { id: "unattended_acquisition", label: "無人自動取得", category: "prohibited", phase261Allowed: false }
  ]);

  const SAFETY_BOUNDARY = deepFreeze({
    privateLocalOnly: true,
    executionPolicy: "PLAN_ONLY",
    planOnly: true,
    protectedMode: true,
    externalAcquisitionEnabled: false,
    externalCommunicationEnabled: false,
    automaticAcquisitionEnabled: false,
    scheduledAcquisitionEnabled: false,
    unattendedAcquisitionEnabled: false,
    automaticPurchaseEnabled: false,
    automaticApplicationEnabled: false,
    automaticLearningUpdateEnabled: false,
    automaticDecisionEnabled: false,
    manualApprovalRequired: true,
    manualStartRequired: true,
    previewRequired: true,
    preAcquisitionDisclosureRequired: true,
    credentialsInSourceAllowed: false,
    plaintextSecretsAllowed: false,
    termsOrAccessRestrictionBypassAllowed: false,
    failClosed: true,
    publicAccessEnabled: false,
    githubPagesEnabled: false
  });

  const SAFETY_RULES = deepFreeze([
    "外部取得機能は初期状態で無効",
    "明示的な手動操作なしでは開始しない",
    "取得前に取得元、対象、日時、件数を表示する",
    "取得後にプレビューを表示する",
    "人間の承認前に正式データへ反映しない",
    "取得データを予想結果へ自動適用しない",
    "取得データを学習データへ自動登録しない",
    "取得データを購入処理へ送らない",
    "認証情報をソースコードへ保存しない",
    "Cookie、パスワード、APIキーを画面やログへ平文表示しない",
    "利用規約やアクセス制限を無視する取得を行わない",
    "エラー時は安全側で停止する"
  ]);

  const DATA_STATES = deepFreeze([
    "not_configured", "disabled", "awaiting_manual_selection", "awaiting_manual_start",
    "acquisition_requested", "preview_only", "validation_required", "approved_for_staging",
    "rejected", "failed", "cancelled", "expired"
  ]);

  const SOURCE_TRUST_LEVELS = deepFreeze([
    "official_source", "licensed_provider", "user_supplied_file", "user_pasted_text",
    "manually_entered", "unknown_source"
  ]);

  const DATA_TIMEPOINTS = deepFreeze([
    "preliminary", "pre_race", "near_post_time", "final", "corrected", "unknown"
  ]);

  const DECISION_RESULTS = deepFreeze([
    "allowed_for_manual_review",
    "allowed_for_preview_only",
    "blocked_by_safety_policy",
    "blocked_by_missing_source",
    "blocked_by_missing_consent",
    "blocked_by_invalid_format",
    "blocked_by_unknown_timestamp"
  ]);

  function isEligibleForFormalReflection(sourceTrustLevel) {
    return SOURCE_TRUST_LEVELS.includes(sourceTrustLevel) && sourceTrustLevel !== "unknown_source";
  }

  function evaluateReviewEligibility(candidate) {
    const input = candidate || {};
    if (!input.sourceTrustLevel || input.sourceTrustLevel === "unknown_source") {
      return deepFreeze({ result: "blocked_by_missing_source", formalReflectionEligible: false });
    }
    if (input.manualConsent !== true) {
      return deepFreeze({ result: "blocked_by_missing_consent", formalReflectionEligible: false });
    }
    if (input.formatValid !== true) {
      return deepFreeze({ result: "blocked_by_invalid_format", formalReflectionEligible: false });
    }
    if (!input.timepoint || input.timepoint === "unknown") {
      return deepFreeze({ result: "blocked_by_unknown_timestamp", formalReflectionEligible: false });
    }
    if (input.previewCompleted !== true) {
      return deepFreeze({ result: "allowed_for_preview_only", formalReflectionEligible: false });
    }
    return deepFreeze({
      result: "allowed_for_manual_review",
      formalReflectionEligible: isEligibleForFormalReflection(input.sourceTrustLevel)
    });
  }

  function definition() {
    return deepFreeze({
      namespace: "hashimotoKeibaAi.phase26.externalDataAcquisitionBoundary.v1",
      phase: "Phase26-1",
      purposes: PURPOSES,
      nonPurposes: NON_PURPOSES,
      targetData: TARGET_DATA,
      acquisitionMethods: ACQUISITION_METHODS,
      safetyBoundary: SAFETY_BOUNDARY,
      safetyRules: SAFETY_RULES,
      dataStates: DATA_STATES,
      sourceTrustLevels: SOURCE_TRUST_LEVELS,
      dataTimepoints: DATA_TIMEPOINTS,
      decisionResults: DECISION_RESULTS,
      definitionAndDisplayOnly: true,
      stateTransitionsImplemented: false,
      acquisitionImplemented: false,
      networkCommunicationImplemented: false
    });
  }

  function render(documentRef) {
    if (!documentRef) return definition();
    const mode = documentRef.getElementById("phase261-safety-mode");
    const communication = documentRef.getElementById("phase261-external-communication");
    const acquisition = documentRef.getElementById("phase261-automatic-acquisition");
    if (mode) mode.textContent = `${SAFETY_BOUNDARY.executionPolicy} / protectedMode / Private Local only`;
    if (communication) communication.textContent = "無効（通信処理は未実装）";
    if (acquisition) acquisition.textContent = "無効（自動・定期・無人取得なし）";
    return definition();
  }

  if (typeof document !== "undefined") {
    const start = () => render(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  return {
    PURPOSES,
    NON_PURPOSES,
    TARGET_DATA,
    ACQUISITION_METHODS,
    SAFETY_BOUNDARY,
    SAFETY_RULES,
    DATA_STATES,
    SOURCE_TRUST_LEVELS,
    DATA_TIMEPOINTS,
    DECISION_RESULTS,
    isEligibleForFormalReflection,
    evaluateReviewEligibility,
    definition,
    render
  };
});
