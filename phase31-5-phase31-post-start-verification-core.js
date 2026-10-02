(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-4-phase31-start-execution-core.js"):root.HashimotoPhase314StartExecution;
  const api=factory(dependency);if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase315PostStartVerification=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p314){
  "use strict";if(!p314)throw new Error("Phase31-4 start execution definition is required");
  const STORAGE_KEY="hashimoto.phase31.5.postStartVerificationRecords",SCHEMA_VERSION="31.5.1",CURRENT_STAGE="phase31_post_start_verification",NEXT_STAGE="manual_phase31_post_start_verification_decision";
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v},clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v)) ,date=v=>typeof v==="string"&&Number.isFinite(Date.parse(v)),human=h=>!!(h&&text(h.performedBy)&&text(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt)),now=(o,h)=>new Date(o&&o.now?o.now():h.performedAt).toISOString();
  const STATES=deepFreeze(["awaiting_manual_phase31_post_start_verification","manual_phase31_post_start_verification_in_progress","awaiting_manual_phase31_post_start_verification_review","ready_for_manual_phase31_post_start_verification_decision","phase31_post_start_verification_conditionally_confirmed","phase31_post_start_verification_failed","phase31_post_start_verification_incomplete","phase31_post_start_verification_blocked","invalidated"]),RESULTS=deepFreeze(["phase31_post_start_verification_passed","phase31_post_start_verification_conditionally_confirmed","phase31_post_start_verification_failed","phase31_post_start_verification_incomplete","phase31_post_start_verification_blocked"]),RESULT_STATUS=deepFreeze(Object.fromEntries(RESULTS.map((r,i)=>[r,STATES[i+3]])));
  const VERIFICATION_FIELDS=deepFreeze(["verificationTarget","verificationScope","verificationOperator","reviewer","responsiblePerson","startExecutionResultConfirmation","executionTimeConfirmation","targetScopeConfirmation","beforeAfterSnapshotConfirmation","safetyBoundaryConfirmation","prohibitedActionsConfirmation","verificationItems","requiredTestResults","gitStateEvidence","workingTreeEvidence","mainOriginMainAlignmentEvidence","startExecutionBeforeSnapshot","startExecutionAfterSnapshot","rollbackPoint","recoveryPoint","notes"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","startExecutionConfirmed","executionTimesConfirmed","targetScopeConfirmed","beforeAfterSnapshotsConfirmed","safetyBoundaryConfirmed","prohibitedActionsConfirmed","requiredTestsConfirmedByHuman","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman"]);
  const SAFETY=deepFreeze({...p314.SAFETY,automaticDecisionPerformed:false,phase31PostStartVerificationDecisionAutomaticallyExecuted:false,automaticVerificationPerformed:false,manualVerificationRecordOnly:true,privateLocalOnly:true,planOnly:true,protectedMode:true,phase31AutomaticallyStarted:false,phase31AutomaticallyRestarted:false,nextPhaseAutomaticallyStarted:false,phase31PostStartVerificationAutomaticallyExecuted:false,phase31StartExecutionAutomaticallyStarted:false,phase31StartExecutionAutomaticallyRepeated:false,automaticPhaseAdvancePerformed:false,automaticCorrectionPerformed:false,automaticRollbackPerformed:false,automaticRecoveryPerformed:false,automaticConditionReleasePerformed:false,networkCommunicationPerformed:false,externalTransmissionPerformed:false,webAccessPerformed:false,apiRequestPerformed:false,authenticationPerformed:false,credentialUsed:false,credentialsStored:false,schedulerEnabled:false,schedulerUsed:false,timerEnabled:false,timerUsed:false,pollingEnabled:false,pollingUsed:false,backgroundWorkerEnabled:false,workerUsed:false,filesystemOperationPerformed:false,filesystemMutationPerformed:false,fileAutomaticallyGenerated:false,fileAutomaticallyModified:false,directoryAutomaticallyModified:false,stagingDataModified:false,formalDataModified:false,dataMutationPerformed:false,dataAutomaticallyMigrated:false,automaticValidationExecuted:false,learningUpdated:false,automaticLearningUpdatePerformed:false,appliedToPrediction:false,appliedToLearning:false,automaticPredictionApplicationPerformed:false,automaticLearningApplicationPerformed:false,purchaseExecuted:false,bettingExecuted:false,automaticPurchasePerformed:false,gitOperationPerformed:false,githubApiOperationPerformed:false,githubOperationPerformed:false,publicReleasePerformed:false,githubPagesPublished:false});
  const REFERENCE_IDS=deepFreeze(["phase31StartExecutionId",...p314.REFERENCE_IDS]),UPSTREAM_FIELDS=deepFreeze(["phase31StartExecutionSnapshotHash","phase31StartExecutionVersion",...p314.UPSTREAM_FIELDS]);
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);function computeSnapshotHash(v){let h=2166136261;for(const c of stable(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return`fnv1a32-${(h>>>0).toString(16).padStart(8,"0")}`}
  const OWN="phase31PostStartVerification",SOURCE="phase31StartExecution";
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const strings=v=>Array.isArray(v)&&Array.from(v).every(text);
  const plain=v=>{if(!v||typeof v!=="object"||Array.isArray(v))return false;const p=Object.getPrototypeOf(v);return p===null||(Object.getPrototypeOf(p)===null&&Object.prototype.hasOwnProperty.call(p,"constructor")&&typeof p.constructor==="function"&&p.constructor.prototype===p&&p.constructor.name==="Object")};
  const allowed=(v,keys)=>plain(v)&&Object.keys(v).every(k=>keys.includes(k));
  const noIssues=r=>ISSUE_FIELDS.every(k=>strings(r[k])&&r[k].length===0);
  const SAFETY_BOUNDARY=p314.SAFETY_BOUNDARY;
  const CONTENT_FIELDS=deepFreeze([...VERIFICATION_FIELDS,"postStartState","correctionRequired","rollbackRequired"]);
  const CONDITION_FIELDS=deepFreeze(["conditions","conditionReason","conditionOwner","conditionDeadline","conditionVerificationMethod","conditionReleaseCriteria"]);
  const COMPLETION_FIELDS=deepFreeze(["result","canProceedToNextStage","verificationSummary","verifiedBy","verifiedAt","reviewedBy","reviewedAt",...CONDITION_FIELDS,"failureReason","incompleteReason","blockedReason"]);
  const INPUT_FIELDS=[...CONTENT_FIELDS,...ISSUE_FIELDS,...REQUIRED_TRUE,"sourceRecordId","raceId"];
  const PROTECTED_FIELDS=deepFreeze(["phase314SourceSnapshot",OWN+"Id",OWN+"Status",OWN+"Result",OWN+"Snapshot",OWN+"SnapshotHash",OWN+"Version","schemaVersion","phase","stage","nextStage","safetyBoundary","phase31Started","manualPhase31StartCompleted","canProceedToNextStage","createdAt","updatedAt","recordVersion","auditTrail","previousStatus","invalidatedAt","expiredAt","expiresAt",...REFERENCE_IDS,...UPSTREAM_FIELDS,...Object.keys(SAFETY)]);
  const EVIDENCE_FIELDS=deepFreeze({gitStateEvidence:["branch","headCommit"],workingTreeEvidence:["status"],mainOriginMainAlignmentEvidence:["mainCommit","originMainCommit"],requiredTestResults:["summary"]});
  // Expiry is evaluated against explicit human/clock context, never an implicit clock.
  // Without that context an expiry-bearing record is excluded, rather than assumed valid.
  const evaluationAt=o=>o&&typeof o.now==="function"?new Date(o.now()).toISOString():null;
  const inactive=(r,at)=>!r||!!r.invalidatedAt||!!r.expiredAt||(r.expiresAt!==undefined&&(!date(r.expiresAt)||!date(at)||Date.parse(r.expiresAt)<=Date.parse(at)));
  function jsonValue(v,seen=new Set()){
    if(v===null||typeof v==="string"||typeof v==="boolean")return true;
    if(typeof v==="number")return Number.isFinite(v);
    if(!v||typeof v!=="object"||seen.has(v)||(!Array.isArray(v)&&!plain(v)))return false;
    seen.add(v);const valid=(Array.isArray(v)?Array.from(v):Object.values(v)).every(x=>jsonValue(x,seen));seen.delete(v);return valid;
  }
  const snapshot=v=>plain(v)&&Object.keys(v).length>0&&jsonValue(v);
  const identityIntact=(v,r)=>!!v&&["sourceRecordId","raceId"].every(k=>Object.prototype.hasOwnProperty.call(v,k)&&text(v[k])&&v[k]===r[k]);
  function evidenceIntact(k,v){
    const flag={workingTreeEvidence:"clean",mainOriginMainAlignmentEvidence:"aligned",requiredTestResults:"passed"}[k];
    if(!allowed(v,[...EVIDENCE_FIELDS[k],"confirmedBy","confirmedAt","confirmed",...(flag?[flag]:[])]))return false;
    if(!EVIDENCE_FIELDS[k].every(f=>text(v[f]))||!text(v.confirmedBy)||!date(v.confirmedAt)||v.confirmed!==true)return false;
    if(flag&&typeof v[flag]!=="boolean")return false;
    return k!=="mainOriginMainAlignmentEvidence"||v.aligned===(v.mainCommit===v.originMainCommit);
  }
  const safetyIntact=r=>!!r&&Object.keys(SAFETY).every(k=>r[k]===SAFETY[k])&&stable(r.safetyBoundary)===stable(SAFETY_BOUNDARY);
  function validatePhase314Eligibility(s,o){
    const reasons=[];
    try{
      if(!plain(s))return deepFreeze({valid:false,reasons:["source_plain_record_required"]});
      if(p314.CURRENT_STAGE!=="phase31_start_execution"||p314.NEXT_STAGE!=="manual_phase31_post_start_verification")reasons.push("source_contract_invalid");
      if(s.phase!=="phase31"||s.stage!==p314.CURRENT_STAGE||s.nextStage!==p314.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(s[SOURCE+"Status"]!=="phase31_start_execution_confirmed")reasons.push("source_status_invalid");
      if(s[SOURCE+"Result"]!=="phase31_start_execution_confirmed")reasons.push("source_result_invalid");
      if(s.phase31Started!==true||s.manualPhase31StartCompleted!==true)reasons.push("manual_start_not_completed");
      if(inactive(s,evaluationAt(o)))reasons.push("source_inactive_or_expiry_context_required");
      if(!p314.safetyIntact(s))reasons.push("source_safety_invalid");
      if(s[SOURCE+"Version"]!==p314.SCHEMA_VERSION)reasons.push("source_version_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!text(s[k]))reasons.push(k+"_required");
      if(!noIssues(s))reasons.push("source_issues_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // The dependency recursively verifies the entire execution/approval chain.
      if(!p314.integrityIntact(s,o))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  const EXECUTION_EVIDENCE_FIELDS=deepFreeze(["startExecutionBeforeSnapshot","startExecutionAfterSnapshot","rollbackPoint","recoveryPoint"]);
  const sourceAligned=(r,s)=>{try{return !!r&&!!s&&["startExecutionBeforeSnapshot","startExecutionAfterSnapshot","postStartState"].every(k=>snapshot(r[k]))&&EXECUTION_EVIDENCE_FIELDS.every(k=>stable(r[k])===stable(s[k]))&&identityIntact(r.startExecutionBeforeSnapshot,s)&&identityIntact(r.startExecutionAfterSnapshot,s)&&identityIntact(r.postStartState,s)}catch(_){return false}};
  function validateVerificationInput(input){
    const reasons=[];
    for(const k of CONTENT_FIELDS){
      const v=input&&input[k];
      if(k==="correctionRequired"||k==="rollbackRequired"){if(typeof v!=="boolean")reasons.push(k+"_boolean_required")}
      else if(k==="verificationItems"){if(!strings(v)||!v.length)reasons.push(k+"_nonempty_string_array_required")}
      else if(k==="startExecutionBeforeSnapshot"||k==="startExecutionAfterSnapshot"||k==="postStartState"){if(!snapshot(v)||!text(v.sourceRecordId)||!text(v.raceId))reasons.push(k+"_with_identity_required")}
      else if(Object.prototype.hasOwnProperty.call(EVIDENCE_FIELDS,k)){if(!evidenceIntact(k,v))reasons.push(k+"_invalid")}
      else if(!text(v))reasons.push(k+"_required");
    }
    for(const k of ISSUE_FIELDS)if(!input||!strings(input[k]))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return reasons;
  }
  function validateCompletion(r,input){
    const reasons=[];
    if(!input||!RESULTS.includes(input.result))return ["explicit_manual_result_required"];
    // This is consistency checking of the human's decision, never a computed verdict.
    if(typeof input.canProceedToNextStage!=="boolean"||input.canProceedToNextStage!==(input.result===RESULTS[0]))reasons.push("explicit_consistent_next_stage_choice_required");
    if(input.result===RESULTS[0]){
      for(const k of ["verificationSummary","verifiedBy","reviewedBy"])if(!text(input[k]))reasons.push(k+"_required");
      for(const k of ["verifiedAt","reviewedAt"])if(!date(input[k]))reasons.push(k+"_invalid");
      if(!noIssues(r)||r.correctionRequired||r.rollbackRequired||!r.workingTreeEvidence.clean||!r.mainOriginMainAlignmentEvidence.aligned||!r.requiredTestResults.passed)reasons.push("issues_or_readiness_require_manual_resolution");
      if(CONDITION_FIELDS.concat(["failureReason","incompleteReason","blockedReason"]).some(k=>input[k]!==undefined))reasons.push("passed_verification_cannot_carry_conditions_or_failure");
    }
    if(input.result===RESULTS[1]){
      for(const k of CONDITION_FIELDS)if(!text(input[k]))reasons.push(k+"_required");
      if(!date(input.conditionDeadline))reasons.push("condition_deadline_invalid");
    }
    if(input.result===RESULTS[2]&&!text(input.failureReason))reasons.push("failure_reason_required");
    for(const k of ["verifiedAt","reviewedAt"])if(input[k]!==undefined&&!date(input[k]))reasons.push(k+"_invalid");
    for(const k of ["verificationSummary","verifiedBy","reviewedBy","failureReason","incompleteReason","blockedReason"])if(input[k]!==undefined&&!text(input[k]))reasons.push(k+"_invalid");
    return reasons;
  }
  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;r.schemaVersion=SCHEMA_VERSION;
    const body=clone(r);delete body.phase314SourceSnapshot;
    r[OWN+"Snapshot"]=body;r[OWN+"SnapshotHash"]=computeSnapshotHash(body);return deepFreeze(r);
  }
  const TRANSITIONS=deepFreeze({[STATES[0]]:[STATES[1]],[STATES[1]]:[STATES[2]],[STATES[2]]:STATES.slice(3,8)});
  function auditIntact(r){
    const a=r.auditTrail;
    const rules={phase31_post_start_verification_creation:[["",STATES[0]]],begin_phase31_post_start_verification:[[STATES[0],STATES[1]]],update_phase31_post_start_verification:[[STATES[1],STATES[1]]],submit_phase31_post_start_verification_review:[[STATES[1],STATES[2]]],complete_phase31_post_start_verification:RESULTS.map(result=>[STATES[2],RESULT_STATUS[result]]),invalidation:STATES.slice(0,8).map(from=>[from,STATES[8]])};
    return Number.isInteger(r.recordVersion)&&r.recordVersion>0&&Array.isArray(a)&&a.length===r.recordVersion&&Array.from(a).every((e,i)=>e&&human(e)&&Object.prototype.hasOwnProperty.call(rules,e.action)&&rules[e.action].some(([from,to])=>e.from===from&&e.to===to)&&(i===0?e.from==="":e.from===a[i-1].to))&&a.at(-1).to===r[OWN+"Status"];
  }
  function integrityIntact(r,o){
    try{
      if(!allowed(r,INPUT_FIELDS.concat(PROTECTED_FIELDS,COMPLETION_FIELDS))||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||r.schemaVersion!==SCHEMA_VERSION||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateVerificationInput(r).length)return false;
      if(r[OWN+"Id"]!==`phase31-post-start-verification-${r.createdAt}-${r[SOURCE+"Id"]}`||!sourceAligned(r,r.phase314SourceSnapshot))return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"],decision=r.auditTrail.find(e=>e.action==="complete_phase31_post_start_verification");
      if(!STATES.includes(status)||result!==(decision?RESULTS.find(value=>RESULT_STATUS[value]===decision.to):""))return false;
      if(result===""?r.result!==undefined:r.result!==result)return false;
      if(result===""&&(r.canProceedToNextStage!==false||COMPLETION_FIELDS.filter(k=>k!=="canProceedToNextStage").some(k=>r[k]!==undefined)))return false;
      if(STATES.slice(0,3).includes(status)&&result!==""||STATES.slice(3,8).includes(status)&&RESULT_STATUS[result]!==status)return false;
      if(result!==""&&validateCompletion(r,r).length)return false;
      if(r.phase31Started!==true||r.manualPhase31StartCompleted!==true)return false;
      if(status===STATES[8]?!date(r.invalidatedAt):r.invalidatedAt!==undefined)return false;
      const body=clone(r);delete body.phase314SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase314Eligibility(r.phase314SourceSnapshot,o).valid)return false;
      return REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase314SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractPostStartVerificationCandidates(sources,existing,o){
    if(!Array.isArray(sources)||!Array.isArray(existing))return deepFreeze([]);
    const seen=new Set();return deepFreeze(sources.filter(s=>{if(!validatePhase314Eligibility(s,o).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:h.performedAt,reason:h.reason,explicitConfirmation:true}}
  function operationContext(h,o){if(!human(h))return null;try{const at=now(o,h);return {at,options:{now:()=>at}}}catch(_){return null}}
  function createPostStartVerificationRecord(source,input,h,o,existing){
    const context=operationContext(h,o),reasons=[...validatePhase314Eligibility(source,context&&context.options).reasons,...validateVerificationInput(input)];
    if(!allowed(input,INPUT_FIELDS)||!jsonValue(input))reasons.push("unsupported_protected_or_non_json_field");
    if(!context)reasons.push("valid_human_operation_and_clock_required");
    if(!Array.isArray(existing))reasons.push("existing_records_required");else if(source&&duplicate(source,existing))reasons.push("duplicate_phase31_post_start_verification");
    for(const k of ["sourceRecordId","raceId"])if(input&&input[k]!==undefined&&(!text(input[k])||!source||input[k]!==source[k]))reasons.push(k+"_mismatch");
    if(!sourceAligned(input,source))reasons.push("execution_evidence_or_identity_mismatch");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=context.at,r={...clone(input),...SAFETY,safetyBoundary:clone(SAFETY_BOUNDARY),phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-post-start-verification-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase31Started:true,manualPhase31StartCompleted:true,canProceedToNextStage:false,phase314SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event("phase31_post_start_verification_creation","",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  function transition(r,from,to,action,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||r[OWN+"Status"]!==from||!integrityIntact(r,c.options))return {transitioned:false,record:r,reasons:["valid_active_manual_record_required"]};
    const n={...clone(r),[OWN+"Status"]:to,previousStatus:from,updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  const beginPostStartVerification=(r,h,o)=>transition(r,STATES[0],STATES[1],"begin_phase31_post_start_verification",h,o);
  const submitPostStartVerificationForReview=(r,h,o)=>transition(r,STATES[1],STATES[2],"submit_phase31_post_start_verification_review",h,o);
  function updatePostStartVerification(r,changes,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||r[OWN+"Status"]!==STATES[1]||!allowed(changes,CONTENT_FIELDS.concat(ISSUE_FIELDS))||!jsonValue(changes)||!integrityIntact(r,c.options)||validateVerificationInput({...r,...changes}).length||!sourceAligned({...r,...changes},r.phase314SourceSnapshot))return {updated:false,record:r,reasons:["valid_manual_update_required"]};
    const n={...clone(r),...clone(changes),updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("update_phase31_post_start_verification",STATES[1],STATES[1],h))};return deepFreeze({updated:true,record:stamp(n),reasons:[]});
  }
  function completePostStartVerification(r,input,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||r[OWN+"Status"]!==STATES[2]||!allowed(input,COMPLETION_FIELDS)||!jsonValue(input)||!integrityIntact(r,c.options))return {completed:false,record:r,reasons:["valid_manual_completion_required"]};
    const reasons=validateCompletion(r,input);if(reasons.length)return {completed:false,record:r,reasons};
    const nextStatus=RESULT_STATUS[input.result],n={...clone(r),...clone(input),[OWN+"Status"]:nextStatus,[OWN+"Result"]:input.result,previousStatus:STATES[2],updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("complete_phase31_post_start_verification",STATES[2],nextStatus,h))};
    // Record only the explicit human result and next-stage choice. No decision API is called.
    return deepFreeze({completed:true,record:stamp(n),reasons:[]});
  }
  function invalidatePostStartVerification(r,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||!integrityIntact(r,c.options))return {transitioned:false,record:r,reasons:["valid_active_manual_record_required"]};
    const at=c.at,n={...clone(r),[OWN+"Status"]:STATES[8],previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("invalidation",r[OWN+"Status"],STATES[8],h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  function recordsValid(records,o){return Array.isArray(records)&&Array.from(records).every(r=>integrityIntact(r,o))&&new Set(records.map(r=>r[SOURCE+"Id"])).size===records.length}
  function savePostStartVerificationRecords(storage,records,o){try{if(!recordsValid(records,o))return deepFreeze({saved:false});storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,records:clone(records)}));return deepFreeze({saved:true})}catch(_){return deepFreeze({saved:false})}}
  function loadPostStartVerificationRecords(storage,o){try{const data=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");const loaded=data.schemaVersion===SCHEMA_VERSION&&recordsValid(data.records,o);return deepFreeze({loaded,records:loaded?clone(data.records):[]})}catch(_){return deepFreeze({loaded:false,records:[]})}}
  function render(r,o){return deepFreeze({currentStage:CURRENT_STAGE,nextStage:NEXT_STAGE,status:r&&r[OWN+"Status"]||"",result:r&&r[OWN+"Result"]||"",phase314Dependency:r&&r[SOURCE+"Id"]||"",verificationTarget:r&&r.verificationTarget||"",verificationScope:r&&r.verificationScope||"",phase31Started:!!r&&r.phase31Started===true,manualStartRecorded:!!r&&r.manualPhase31StartCompleted===true,privateLocalOnly:!!r&&r.privateLocalOnly===true,planOnly:!!r&&r.planOnly===true,protectedMode:!!r&&r.protectedMode===true,canProceedToNextStage:!!r&&r.canProceedToNextStage===true,automaticVerificationDisabled:!!r&&r.phase31PostStartVerificationAutomaticallyExecuted===false,automaticDecisionDisabled:!!r&&r.automaticDecisionPerformed===false,externalCommunicationDisabled:!!r&&r.networkCommunicationPerformed===false,safetyIntact:safetyIntact(r),integrityIntact:integrityIntact(r,o)})}
  return deepFreeze({PHASE314_REFERENCE:p314,STORAGE_KEY,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,RESULT_STATUS,VERIFICATION_FIELDS,CONTENT_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,CONDITION_FIELDS,PROTECTED_FIELDS,TRANSITIONS,SAFETY,SAFETY_BOUNDARY,EVIDENCE_FIELDS,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase314Eligibility,extractPostStartVerificationCandidates,validateVerificationInput,createPostStartVerificationRecord,beginPostStartVerification,updatePostStartVerification,submitPostStartVerificationForReview,completePostStartVerification,invalidatePostStartVerification,savePostStartVerificationRecords,loadPostStartVerificationRecords,render});
});
