(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-1-purpose-scope-safety-boundary-definition-core.js"):root.HashimotoPhase311PurposeScopeSafetyBoundaryDefinition;
  const api=factory(dependency);
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.HashimotoPhase312StartPreparation=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p311){
  "use strict";
  if(!p311)throw new Error("Phase31-1 purpose scope safety boundary definition is required");
  const SCHEMA_VERSION="31.2.1",CURRENT_STAGE="phase31_start_preparation",NEXT_STAGE="manual_phase31_start_approval";
  const OWN="phase31StartPreparation",SOURCE="phase31Definition";
  const clone=v=>JSON.parse(JSON.stringify(v));
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v};
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const date=v=>text(v)&&Number.isFinite(Date.parse(v));
  const human=h=>!!(h&&text(h.performedBy)&&text(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt));
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);
  const computeSnapshotHash=p311.computeSnapshotHash;
  const STATES=deepFreeze(["awaiting_manual_phase31_start_preparation","manual_phase31_start_preparation_in_progress","awaiting_manual_phase31_start_preparation_review","ready_for_manual_phase31_start_approval","phase31_start_preparation_rejected","phase31_start_preparation_incomplete","phase31_start_preparation_blocked","invalidated"]);
  const RESULTS=deepFreeze(STATES.slice(3,7));
  const PREPARATION_FIELDS=deepFreeze(["startTarget","startScope","scheduledStartAt","operator","reviewer","responsiblePerson","preparedBy","executionOwner","approvalOwner","startConditions","prerequisiteConfirmation","dependencyConfirmation","phase31DefinitionConfirmation","safetyBoundaryConfirmation","prohibitedActionsConfirmation","rollbackPoint","recoveryPoint","gitStateEvidence","workingTreeEvidence","mainOriginMainAlignmentEvidence","requiredTestEvidence","notes"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","prerequisitesConfirmed","dependenciesConfirmed","phase31DefinitionConfirmed","safetyBoundaryConfirmed","prohibitedActionsConfirmed","rollbackPointConfirmed","recoveryPointConfirmed","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman","requiredTestsConfirmedByHuman","manualReviewRequired","humanApprovalRequired"]);
  const CONTENT_FIELDS=deepFreeze([...PREPARATION_FIELDS,"safetyBoundary","correctionRequired","rollbackRequired"]);
  const SAFETY_BOUNDARY=deepFreeze({privateLocalOnly:true,planOnly:true,protectedMode:true,externalCommunicationProhibited:true,externalTransmissionProhibited:true,externalExecutionProhibited:true,automaticExecutionProhibited:true,automaticApprovalProhibited:true,gitGithubOperationsProhibited:true,automaticCorrectionProhibited:true,automaticRollbackProhibited:true,automaticRecoveryProhibited:true,automaticConditionReleaseProhibited:true,automaticNextPhaseTransitionProhibited:true,filesystemOperationsProhibited:true,publicExposureProhibited:true,automaticDataMigrationProhibited:true,automaticPurchaseProhibited:true,automaticApplicationProhibited:true,automaticLearningUpdateProhibited:true});
  const SAFETY=deepFreeze({...p311.SAFETY,privateLocalOnly:true,planOnly:true,protectedMode:true,phase31Started:false,phase31AutomaticallyStarted:false,automaticPhase31StartPerformed:false,phase31StartPreparationAutomaticallyStarted:false,nextPhaseAutomaticallyStarted:false,automaticNextStageStartPerformed:false,automaticApprovalPerformed:false,manualReviewRequired:true,humanApprovalRequired:true,manualPreparationRecordOnly:true,preparationMode:"LOCAL_MANAGEMENT_RECORD_ONLY",phase31StartApprovalAutomaticallyExecuted:false,phase31DefinitionAutomaticallyReleased:false,automaticStartPreparationPerformed:false,automaticStartApprovalPerformed:false,automaticConditionReleasePerformed:false,filesystemMutationPerformed:false,gitOperationPerformed:false,githubApiOperationPerformed:false,publicReleasePerformed:false,githubPagesPublished:false});
  const REFERENCE_IDS=deepFreeze([SOURCE+"Id",...p311.REFERENCE_IDS]);
  const UPSTREAM_FIELDS=deepFreeze([SOURCE+"SnapshotHash",SOURCE+"Version",...p311.UPSTREAM_FIELDS]);
  const INPUT_FIELDS=[...CONTENT_FIELDS,...ISSUE_FIELDS,...REQUIRED_TRUE];
  const COMPLETION_FIELDS=["result","reviewedBy","reviewedAt","rejectionReason","incompleteReason","blockedReason"];
  const allowed=(v,keys)=>!!(v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k)));
  const boundaryIntact=v=>!!(v&&stable(v)===stable(SAFETY_BOUNDARY));
  const safetyIntact=r=>!!r&&Object.keys(SAFETY).every(k=>r[k]===SAFETY[k]);
  const inactive=r=>!r||!!r.invalidatedAt||!!r.expiredAt||(r.expiresAt!==undefined&&(!date(r.expiresAt)||Date.parse(r.expiresAt)<=Date.now()));
  const noIssues=r=>ISSUE_FIELDS.every(k=>Array.isArray(r[k])&&r[k].length===0);

  function validatePhase311Eligibility(s){
    const reasons=[];
    try{
      if(p311.CURRENT_STAGE!=="phase31_purpose_scope_safety_boundary_definition"||p311.NEXT_STAGE!=="manual_phase31_start_preparation")reasons.push("source_contract_invalid");
      if(!s||s.phase!=="phase31"||s.stage!==p311.CURRENT_STAGE||s.nextStage!==p311.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(!s||s.phase31DefinitionStatus!=="ready_for_manual_phase31_start_preparation")reasons.push("source_status_invalid");
      if(!s||s.phase31DefinitionResult!=="phase31_purpose_scope_safety_boundary_defined")reasons.push("source_not_completed");
      if(inactive(s))reasons.push("source_inactive");
      if(!s||!p311.safetyIntact(s)||!boundaryIntact(s.safetyBoundary))reasons.push("source_safety_invalid");
      if(!s||s.phase31DefinitionVersion!==p311.SCHEMA_VERSION)reasons.push("source_version_invalid");
      if(s&&s.phase31DefinitionId!==`phase31-definition-${s.createdAt}-${s.phase30FinalClosureId}`)reasons.push("source_creation_identity_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!s||!text(s[k]))reasons.push(k+"_required");
      if(!s||!noIssues(s))reasons.push("source_issues_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // The dependency verifies the final closure and its complete recursive chain.
      if(!p311.integrityIntact(s))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  // Evidence is supplied by a human; these fields never trigger external checks.
  const EVIDENCE_FIELDS=deepFreeze({gitStateEvidence:["branch","headCommit"],workingTreeEvidence:["status"],mainOriginMainAlignmentEvidence:["mainCommit","originMainCommit"],requiredTestEvidence:["summary"]});
  function evidenceIntact(k,v){
    if(!allowed(v,[...EVIDENCE_FIELDS[k],"confirmedBy","confirmedAt","confirmed","clean","aligned","passed"]))return false;
    if(!EVIDENCE_FIELDS[k].every(f=>text(v[f]))||!text(v.confirmedBy)||!date(v.confirmedAt)||v.confirmed!==true)return false;
    if(k==="workingTreeEvidence")return typeof v.clean==="boolean";
    if(k==="mainOriginMainAlignmentEvidence")return typeof v.aligned==="boolean"&&v.aligned===(v.mainCommit===v.originMainCommit);
    if(k==="requiredTestEvidence")return typeof v.passed==="boolean";
    return true;
  }
  const ready=r=>noIssues(r)&&r.correctionRequired===false&&r.rollbackRequired===false&&r.workingTreeEvidence.clean===true&&r.mainOriginMainAlignmentEvidence.aligned===true&&r.requiredTestEvidence.passed===true;
  function validatePreparationInput(input){
    const reasons=[];
    for(const k of CONTENT_FIELDS){
      const v=input&&input[k];
      if(k==="safetyBoundary"){if(!boundaryIntact(v))reasons.push("safetyBoundary_invalid")}
      else if(k==="correctionRequired"||k==="rollbackRequired"){if(typeof v!=="boolean")reasons.push(k+"_boolean_required")}
      else if(Object.prototype.hasOwnProperty.call(EVIDENCE_FIELDS,k)){if(!evidenceIntact(k,v))reasons.push(k+"_invalid")}
      else if(k==="scheduledStartAt"){if(!date(v))reasons.push(k+"_invalid")}
      else if(!text(v))reasons.push(k+"_required");
    }
    for(const k of ISSUE_FIELDS)if(!input||!Array.isArray(input[k])||!Array.from(input[k]).every(text))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return reasons;
  }
  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;
    const snapshot=clone(r);delete snapshot.phase311SourceSnapshot;
    r[OWN+"Snapshot"]=snapshot;r[OWN+"SnapshotHash"]=computeSnapshotHash(snapshot);
    return deepFreeze(r);
  }
  function auditIntact(r){
    const a=r.auditTrail,status=r[OWN+"Status"];
    const rules={phase31_start_preparation_creation:[["",STATES[0]]],start_phase31_start_preparation:[[STATES[0],STATES[1]]],update_phase31_start_preparation:[[STATES[1],STATES[1]]],submit_phase31_start_preparation_review:[[STATES[1],STATES[2]]],complete_phase31_start_preparation:RESULTS.map(to=>[STATES[2],to]),invalidation:STATES.slice(0,7).map(from=>[from,STATES[7]])};
    return Number.isInteger(r.recordVersion)&&r.recordVersion>0&&Array.isArray(a)&&a.length===r.recordVersion&&Array.from(a).every((e,i)=>e&&human(e)&&Object.prototype.hasOwnProperty.call(rules,e.action)&&rules[e.action].some(([from,to])=>e.from===from&&e.to===to)&&(i===0?e.from==="":e.from===a[i-1].to))&&a.at(-1).to===status;
  }
  const reviewIntact=r=>text(r.reviewedBy)&&date(r.reviewedAt);
  function integrityIntact(r){
    try{
      if(!r||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||!text(r[OWN+"Id"])||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validatePreparationInput(r).length)return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"];
      if(!STATES.includes(status)||(STATES.slice(0,3).includes(status)&&result!=="")||(status===STATES[3]&&(result!==STATES[3]||!ready(r)||!reviewIntact(r)))||(STATES.slice(4,7).includes(status)&&result!==status))return false;
      if(result===""?r.result!==undefined:r.result!==result)return false;
      const decision=r.auditTrail.find(e=>e.action==="complete_phase31_start_preparation");
      if(result!==(decision?decision.to:""))return false;
      if(result===STATES[3]&&(!ready(r)||!reviewIntact(r)))return false;
      if(result===STATES[4]&&!text(r.rejectionReason)||result===STATES[5]&&!text(r.incompleteReason)||result===STATES[6]&&!text(r.blockedReason))return false;
      if(status===STATES[7]&&(!date(r.invalidatedAt)||(result!==""&&!RESULTS.includes(result))))return false;
      if(status!==STATES[7]&&r.invalidatedAt!==undefined)return false;
      const body=clone(r);delete body.phase311SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase311Eligibility(r.phase311SourceSnapshot).valid)return false;
      return REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase311SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractStartPreparationCandidates(sources,existing){
    if(!Array.isArray(sources)||!Array.isArray(existing))return deepFreeze([]);
    const seen=new Set();
    return deepFreeze(sources.filter(s=>{if(!validatePhase311Eligibility(s).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:h.performedAt,reason:h.reason,explicitConfirmation:true}}
  const now=o=>new Date(o&&o.now?o.now():new Date()).toISOString();
  function createStartPreparationRecord(source,input,h,o,existing){
    const reasons=[...validatePhase311Eligibility(source).reasons,...validatePreparationInput(input)];
    if(!allowed(input,INPUT_FIELDS))reasons.push("unsupported_or_protected_field");
    if(!human(h))reasons.push("human_operation_required");
    if(!Array.isArray(existing))reasons.push("existing_records_required");
    else if(source&&duplicate(source,existing))reasons.push("duplicate_phase31_start_preparation");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=now(o),r={...clone(input),...SAFETY,phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-start-preparation-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase311SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event("phase31_start_preparation_creation","",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];
    return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  function transition(r,from,to,action,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==from||!integrityIntact(r))return {transitioned:false,record:r};
    const n={...clone(r),[OWN+"Status"]:to,previousStatus:from,updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};
    return deepFreeze({transitioned:true,record:stamp(n)});
  }
  const startPreparation=(r,h,o)=>transition(r,STATES[0],STATES[1],"start_phase31_start_preparation",h,o);
  const submitPreparationForReview=(r,h,o)=>transition(r,STATES[1],STATES[2],"submit_phase31_start_preparation_review",h,o);
  function updatePreparation(r,changes,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==STATES[1]||!allowed(changes,CONTENT_FIELDS.concat(ISSUE_FIELDS))||!integrityIntact(r)||validatePreparationInput({...r,...changes}).length)return {updated:false,record:r};
    const n={...clone(r),...clone(changes),updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("update_phase31_start_preparation",STATES[1],STATES[1],h))};
    return deepFreeze({updated:true,record:stamp(n)});
  }
  function completePreparation(r,input,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==STATES[2]||!allowed(input,COMPLETION_FIELDS)||!RESULTS.includes(input.result)||!integrityIntact(r))return {completed:false,record:r,reasons:["valid_manual_completion_required"]};
    const reasons=[];
    if(input.result===STATES[3]){
      if(!reviewIntact(input))reasons.push("manual_preparation_review_required");
      if(!ready(r))reasons.push("issues_or_readiness_require_manual_resolution");
    }
    const reasonField={[STATES[4]]:"rejectionReason",[STATES[5]]:"incompleteReason",[STATES[6]]:"blockedReason"}[input.result];
    if(reasonField&&!text(input[reasonField]))reasons.push(reasonField+"_required");
    if(reasons.length)return {completed:false,record:r,reasons};
    const n={...clone(r),...clone(input),[OWN+"Status"]:input.result,[OWN+"Result"]:input.result,previousStatus:STATES[2],updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("complete_phase31_start_preparation",STATES[2],input.result,h))};
    // This decision records readiness for manual approval only.
    return deepFreeze({completed:true,record:stamp(n),reasons:[]});
  }
  function invalidatePreparation(r,h,o){
    if(!human(h)||inactive(r)||!integrityIntact(r))return {transitioned:false,record:r};
    const at=now(o),n={...clone(r),[OWN+"Status"]:STATES[7],previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("invalidation",r[OWN+"Status"],STATES[7],h))};
    return deepFreeze({transitioned:true,record:stamp(n)});
  }
  function render(r){return deepFreeze({currentStage:CURRENT_STAGE,nextStage:NEXT_STAGE,status:r&&r[OWN+"Status"]||"",result:r&&r[OWN+"Result"]||"",startTarget:r&&r.startTarget||"",startScope:r&&r.startScope||"",scheduledStartAt:r&&r.scheduledStartAt||"",phase311Dependency:r&&r.phase31DefinitionId||"",phase31NotStarted:!!r&&r.phase31Started===false,privateLocalOnly:!!r&&r.privateLocalOnly===true,planOnly:!!r&&r.planOnly===true,protectedMode:!!r&&r.protectedMode===true,manualReviewRequired:true,humanApprovalRequired:true,safetyIntact:safetyIntact(r),integrityIntact:integrityIntact(r)})}
  return deepFreeze({PHASE311_REFERENCE:p311,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,PREPARATION_FIELDS,EVIDENCE_FIELDS,CONTENT_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,SAFETY_BOUNDARY,SAFETY,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase311Eligibility,validatePreparationInput,extractStartPreparationCandidates,createStartPreparationRecord,startPreparation,updatePreparation,submitPreparationForReview,completePreparation,invalidatePreparation,render});
});
