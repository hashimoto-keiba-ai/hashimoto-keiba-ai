(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase27-26-phase27-final-closure-core.js"):root.HashimotoPhase2726FinalClosure;
  const api=factory(dependency);
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.HashimotoPhase281PurposeScopeSafetyBoundary=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(phase2726){
  "use strict";
  if(!phase2726)throw new Error("Phase27-26 final closure definition is required");

  const deepFreeze=value=>{if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(deepFreeze)}return value};
  const PURPOSE="Phase27までに確立したPrivate Local・PLAN_ONLY・protectedMode・人間承認中心の安全運用を維持し、将来の外部レースデータ、オッズ、結果情報連携および限定的な運用自動化を検討するための目的、範囲、段階、安全境界を定義する。";
  const IN_SCOPE=deepFreeze([
    "外部データカテゴリ候補（出馬・馬・騎手・枠順・馬場・天候・オッズ・人気・結果・払戻）の定義","データ提供元・API・Web・手動取得・将来自動取得候補の分類","取得頻度・更新時点候補の定義","source trust classification","terms and usage policy review","authentication requirement and rate-limit review","data schema review","staging and temporary holding design","validation and formal import gate design","audit trail and snapshot/hash/version design","human approval, start, and stop gates","rollback and recovery planning","external communication許可前の審査設計","Phase28後続工程の安全な段階定義"
  ]);
  const OUT_OF_SCOPE=deepFreeze([
    "馬券の自動購入・自動投票・購入金額の自動確定","IPAT等への自動ログイン","外部サイト・APIへの実通信またはWebスクレイピング実行","結果・オッズ・レースデータの自動取得、定期取得、background polling","CAPTCHA・アクセス制限・認証・利用規約・rate limitの回避","非公開情報・cookie・session・credentialの無断取得または自動保存","source dataまたはregistered dataの自動変更・正式反映","予想・学習への自動適用または自動学習更新","自動condition release・correction・rollback・recovery","Git操作、commit、push、PR作成、merge","Public公開・GitHub Pages","Phase29等の自動作成または開始"
  ]);
  const REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","humanApprovalRequired","humanStartRequired","humanStopControlRequired","auditLogRequired","phase27FinalClosureRequired","sourceReviewRequired","termsReviewRequired","dataValidationRequired","stagingRequired","rollbackPlanningRequired","recoveryPlanningRequired"]);
  const REQUIRED_FALSE=deepFreeze(["publicAccessAllowed","githubPagesAllowed","externalCommunicationAllowed","externalTransmissionAllowed","externalAcquisitionExecutionAllowed","automaticExternalAcquisitionAllowed","automaticOddsAcquisitionAllowed","automaticResultAcquisitionAllowed","automaticRaceDataAcquisitionAllowed","automaticBettingAllowed","automaticLoginAllowed","automaticPurchaseAllowed","automaticApplicationAllowed","automaticLearningUpdateAllowed","automaticConditionReleaseAllowed","automaticCorrectionAllowed","automaticRollbackAllowed","automaticRecoveryAllowed","automaticCommitAllowed","automaticPushAllowed","automaticPrCreationAllowed","automaticMergeAllowed","automaticNextPhaseStartAllowed","publicReleaseAllowed"]);
  const SAFETY_BOUNDARY=deepFreeze({...phase2726.SAFETY,...Object.fromEntries(REQUIRED_TRUE.map(k=>[k,true])),...Object.fromEntries(REQUIRED_FALSE.map(k=>[k,false]))});
  const PHASE28_STAGES=deepFreeze(["definition","phase27_completion_acceptance","external_data_category_definition","source_candidate_registration","source_trust_review","terms_and_policy_review","acquisition_method_review","authentication_and_rate_limit_review","data_schema_review","staging_design","validation_design","manual_acquisition_test_plan","manual_acquisition_test_approval","manual_acquisition_test_ready","manual_acquisition_test_executed","manual_result_review","limited_external_acquisition_candidate","automation_readiness_review","suspended","rejected","closed"]);
  const CURRENT_STAGE="definition";

  function validatePhase27FinalClosure(record){
    const reasons=[];
    if(!record||record.phase27FinalClosureStatus!=="phase27_final_closure_confirmed")reasons.push("phase27_final_closure_status_invalid");
    if(!record||record.phase27FinalClosureResult!=="confirm_phase27_final_closure")reasons.push("phase27_final_closure_result_invalid");
    if(record&&(record.invalidatedAt||record.expiredAt||record.phase27FinalClosureStatus==="invalidated"||record.phase27FinalClosureStatus==="expired"))reasons.push("phase27_final_closure_inactive");
    if(!record||!phase2726.integrityIntact(record))reasons.push("phase27_final_closure_integrity_invalid");
    if(!record||!phase2726.safetyIntact(record))reasons.push("phase27_final_closure_safety_invalid");
    if(!record||!Array.isArray(record.auditTrail)||!record.auditTrail.length||!Number.isInteger(record.recordVersion)||record.recordVersion<1)reasons.push("phase27_final_closure_audit_invalid");
    for(const key of ["stableStateConfirmed","workingTreeSafe","mainOriginMainMatch","requiredTestsPassed","requiredModulesConfirmed","requiredUiConfirmed","requiredConfigConfirmed"])if(!record||record[key]!==true)reasons.push(`${key}_must_be_true`);
    for(const key of ["correctionRequired","rollbackRequired","recoveryRequired","nextPhaseAutomaticallyStarted"])if(!record||record[key]!==false)reasons.push(`${key}_must_be_false`);
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  function evaluateSafetyGate(environment,phase27Record){
    const config={...SAFETY_BOUNDARY,...(environment||{})},phase27=validatePhase27FinalClosure(phase27Record),reasons=[];
    REQUIRED_TRUE.forEach(key=>{if(config[key]!==true)reasons.push(`${key}_must_be_true`)});
    REQUIRED_FALSE.forEach(key=>{if(config[key]!==false)reasons.push(`${key}_must_be_false`)});
    reasons.push(...phase27.reasons);
    return deepFreeze({available:reasons.length===0,currentStage:CURRENT_STAGE,phase27FinalClosureConfirmed:phase27.valid,externalAcquisitionExecutionAllowed:false,networkCommunicationAllowed:false,automaticAcquisitionAllowed:false,reasons});
  }
  function definition(){return deepFreeze({namespace:"hashimotoKeibaAi.phase28.definition.v1",phase:"Phase28-1",purpose:PURPOSE,inScope:IN_SCOPE,outOfScope:OUT_OF_SCOPE,safetyBoundary:SAFETY_BOUNDARY,phase28Stages:PHASE28_STAGES,currentStage:CURRENT_STAGE,phase27Dependency:"Phase27-26",executionImplemented:false,networkCommunicationImplemented:false,automaticAcquisitionImplemented:false,automaticBettingImplemented:false,automaticApplicationImplemented:false,automaticLearningImplemented:false})}
  function render(documentRef,environment,phase27Record){
    const gate=evaluateSafetyGate(environment,phase27Record);if(!documentRef)return gate;
    const status=documentRef.getElementById("p281-gate-status"),reasons=documentRef.getElementById("p281-gate-reasons"),stage=documentRef.getElementById("p281-current-stage");
    if(status){status.textContent=gate.available?"definition available":"safety gate closed";status.dataset.available=String(gate.available)}
    if(reasons)reasons.textContent=gate.reasons.length?gate.reasons.join(" / "):"none";
    if(stage)stage.textContent=CURRENT_STAGE;
    return gate;
  }
  return deepFreeze({PHASE2726_REFERENCE:phase2726,PURPOSE,IN_SCOPE,OUT_OF_SCOPE,SAFETY_BOUNDARY,PHASE28_STAGES,CURRENT_STAGE,REQUIRED_TRUE,REQUIRED_FALSE,validatePhase27FinalClosure,evaluateSafetyGate,definition,render});
});
