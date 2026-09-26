(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-3-phase31-start-approval-core.js"):root.HashimotoPhase313StartApproval;
  const api=factory(dependency);if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase314StartExecution=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p313){
  "use strict";if(!p313)throw new Error("Phase31-3 start approval definition is required");
  const STORAGE_KEY="hashimoto.phase31.4.startExecutionRecords",SCHEMA_VERSION="31.4.1",CURRENT_STAGE="phase31_start_execution",NEXT_STAGE="manual_phase31_post_start_verification";
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v},clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v)) ,date=v=>typeof v==="string"&&Number.isFinite(Date.parse(v)),human=h=>!!(h&&text(h.performedBy)&&text(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt)),now=(o,h)=>new Date(o&&o.now?o.now():h.performedAt).toISOString();
  const STATES=deepFreeze(["awaiting_manual_phase31_start_execution","manual_phase31_start_execution_in_progress","awaiting_manual_phase31_start_execution_review","phase31_start_execution_confirmed","phase31_start_execution_conditionally_confirmed","phase31_start_execution_failed","phase31_start_execution_incomplete","phase31_start_execution_blocked","invalidated"]),RESULTS=deepFreeze(STATES.slice(3,8));
  const EXECUTION_FIELDS=deepFreeze(["executionTarget","executionScope","scheduledStartAt","executionOperator","reviewer","responsiblePerson","approvalConfirmation","preparationConfirmation","phase31DefinitionConfirmation","safetyBoundaryConfirmation","prohibitedActionsConfirmation","rollbackPoint","recoveryPoint","startExecutionBeforeSnapshot","gitStateEvidence","workingTreeEvidence","mainOriginMainAlignmentEvidence","requiredTestEvidence","notes"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","startApprovalConfirmed","startPreparationConfirmed","phase31DefinitionConfirmed","safetyBoundaryConfirmed","prohibitedActionsConfirmed","rollbackPointConfirmed","recoveryPointConfirmed","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman","requiredTestsConfirmedByHuman"]);
  const {phase31Started:_sourcePhase31Started,...inheritedSafety}=p313.SAFETY;const SAFETY=deepFreeze({...inheritedSafety,privateLocalOnly:true,planOnly:true,protectedMode:true,phase31AutomaticallyStarted:false,nextPhaseAutomaticallyStarted:false,phase31StartExecutionAutomaticallyStarted:false,phase31StartExecutionPerformed:false,phase31StartApprovalAutomaticallyExecuted:false,phase31StartApprovalAutomaticallyReleased:false,phase31StartPreparationAutomaticallyReleased:false,phase31DefinitionAutomaticallyReleased:false,automaticPhaseAdvancePerformed:false,automaticCorrectionPerformed:false,automaticRollbackPerformed:false,automaticRecoveryPerformed:false,automaticConditionReleasePerformed:false,networkCommunicationPerformed:false,externalTransmissionPerformed:false,webAccessPerformed:false,apiRequestPerformed:false,authenticationPerformed:false,automaticAuthenticationEnabled:false,credentialUsed:false,credentialsStored:false,automaticCredentialUseEnabled:false,schedulerEnabled:false,schedulerUsed:false,timerEnabled:false,timerUsed:false,pollingEnabled:false,pollingUsed:false,backgroundWorkerEnabled:false,workerUsed:false,filesystemOperationPerformed:false,filesystemMutationPerformed:false,fileAutomaticallyGenerated:false,fileAutomaticallyModified:false,directoryAutomaticallyModified:false,stagingDataModified:false,formalDataModified:false,dataMutationPerformed:false,dataAutomaticallyMigrated:false,automaticValidationExecuted:false,automaticCorrectionExecutionPerformed:false,learningUpdated:false,automaticLearningUpdatePerformed:false,appliedToPrediction:false,appliedToLearning:false,automaticPredictionApplicationPerformed:false,automaticLearningApplicationPerformed:false,bettingExecuted:false,gitOperationPerformed:false,githubApiOperationPerformed:false,githubOperationPerformed:false,publicReleasePerformed:false,githubPagesPublished:false});
  const REFERENCE_IDS=deepFreeze(["phase31StartApprovalId",...p313.REFERENCE_IDS]),UPSTREAM_FIELDS=deepFreeze(["phase31StartApprovalSnapshotHash","phase31StartApprovalVersion",...p313.UPSTREAM_FIELDS]);
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);function computeSnapshotHash(v){let h=2166136261;for(const c of stable(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return`fnv1a32-${(h>>>0).toString(16).padStart(8,"0")}`}
  const OWN="phase31StartExecution",SOURCE="phase31StartApproval";
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const strings=v=>Array.isArray(v)&&Array.from(v).every(text);
  const plain=v=>{if(!v||typeof v!=="object"||Array.isArray(v))return false;const p=Object.getPrototypeOf(v);return p===null||(Object.getPrototypeOf(p)===null&&Object.prototype.hasOwnProperty.call(p,"constructor")&&typeof p.constructor==="function"&&p.constructor.prototype===p&&p.constructor.name==="Object")};
  const allowed=(v,keys)=>plain(v)&&Object.keys(v).every(k=>keys.includes(k));
  const noIssues=r=>ISSUE_FIELDS.every(k=>strings(r[k])&&r[k].length===0);
  const SAFETY_BOUNDARY=p313.SAFETY_BOUNDARY;
  const CONTENT_FIELDS=deepFreeze([...EXECUTION_FIELDS,"executionConditions","prerequisiteConfirmation","prerequisitesConfirmed","correctionRequired","rollbackRequired"]);
  const CONDITION_FIELDS=deepFreeze(["conditions","conditionReason","conditionOwner","conditionDeadline","conditionVerificationMethod","conditionReleaseCriteria"]);
  const COMPLETION_FIELDS=deepFreeze(["result","actualStartAt","actualEndAt","executionSummary","startExecutionAfterSnapshot","reviewedBy","reviewedAt",...CONDITION_FIELDS,"failureReason","incompleteReason","blockedReason"]);
  const INPUT_FIELDS=[...CONTENT_FIELDS,...ISSUE_FIELDS,...REQUIRED_TRUE,"sourceRecordId","raceId"];
  const PROTECTED_FIELDS=deepFreeze(["phase313SourceSnapshot",OWN+"Id",OWN+"Status",OWN+"Result",OWN+"Snapshot",OWN+"SnapshotHash",OWN+"Version","schemaVersion","phase","stage","nextStage","safetyBoundary","phase31Started","manualPhase31StartCompleted","createdAt","updatedAt","recordVersion","auditTrail","previousStatus","invalidatedAt","expiredAt","expiresAt",...REFERENCE_IDS,...UPSTREAM_FIELDS,...Object.keys(SAFETY)]);
  const EVIDENCE_FIELDS=deepFreeze({gitStateEvidence:["branch","headCommit"],workingTreeEvidence:["status"],mainOriginMainAlignmentEvidence:["mainCommit","originMainCommit"],requiredTestEvidence:["summary"]});
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
    const flag={workingTreeEvidence:"clean",mainOriginMainAlignmentEvidence:"aligned",requiredTestEvidence:"passed"}[k];
    if(!allowed(v,[...EVIDENCE_FIELDS[k],"confirmedBy","confirmedAt","confirmed",...(flag?[flag]:[])]))return false;
    if(!EVIDENCE_FIELDS[k].every(f=>text(v[f]))||!text(v.confirmedBy)||!date(v.confirmedAt)||v.confirmed!==true)return false;
    if(flag&&typeof v[flag]!=="boolean")return false;
    return k!=="mainOriginMainAlignmentEvidence"||v.aligned===(v.mainCommit===v.originMainCommit);
  }
  const safetyIntact=r=>!!r&&Object.keys(SAFETY).every(k=>r[k]===SAFETY[k])&&stable(r.safetyBoundary)===stable(SAFETY_BOUNDARY);
  function validatePhase313Eligibility(s,o){
    const reasons=[];
    try{
      if(!plain(s))return deepFreeze({valid:false,reasons:["source_plain_record_required"]});
      if(p313.CURRENT_STAGE!=="phase31_start_approval"||p313.NEXT_STAGE!=="manual_phase31_start_execution")reasons.push("source_contract_invalid");
      if(!s||s.phase!=="phase31"||s.stage!==p313.CURRENT_STAGE||s.nextStage!==p313.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(!s||s[SOURCE+"Status"]!=="ready_for_manual_phase31_start_execution")reasons.push("source_status_invalid");
      if(!s||s[SOURCE+"Result"]!=="ready_for_manual_phase31_start_execution"||s.approvalDecision!==s[SOURCE+"Result"])reasons.push("source_result_invalid");
      if(inactive(s,evaluationAt(o)))reasons.push("source_inactive_or_expiry_context_required");
      if(!s||!p313.safetyIntact(s))reasons.push("source_safety_invalid");
      if(!s||s[SOURCE+"Version"]!==p313.SCHEMA_VERSION)reasons.push("source_version_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!s||!text(s[k]))reasons.push(k+"_required");
      if(!s||!noIssues(s))reasons.push("source_issues_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // Phase31-3 checks all IDs, audit events and the complete upstream chain.
      if(!p313.integrityIntact(s))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  function validateExecutionInput(input){
    const reasons=[];
    for(const k of CONTENT_FIELDS){
      const v=input&&input[k];
      if(k==="prerequisitesConfirmed"){if(v!==true)reasons.push(k+"_must_be_true")}
      else if(k==="correctionRequired"||k==="rollbackRequired"){if(typeof v!=="boolean")reasons.push(k+"_boolean_required")}
      else if(k==="scheduledStartAt"){if(!date(v))reasons.push(k+"_invalid")}
      else if(k==="startExecutionBeforeSnapshot"){if(!snapshot(v)||!text(v.sourceRecordId)||!text(v.raceId))reasons.push(k+"_with_identity_required")}
      else if(Object.prototype.hasOwnProperty.call(EVIDENCE_FIELDS,k)){if(!evidenceIntact(k,v))reasons.push(k+"_invalid")}
      else if(!text(v))reasons.push(k+"_required");
    }
    for(const k of ISSUE_FIELDS)if(!input||!strings(input[k]))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return reasons;
  }
  function validateCompletion(r,input){
    const reasons=[];
    if(!input||!RESULTS.includes(input.result))return ["valid_completion_required"];
    if(input.result===STATES[3]){
      for(const k of ["executionSummary","reviewedBy"])if(!text(input[k]))reasons.push(k+"_required");
      for(const k of ["actualStartAt","actualEndAt","reviewedAt"])if(!date(input[k]))reasons.push(k+"_invalid");
      if(date(input.actualStartAt)&&date(input.actualEndAt)&&Date.parse(input.actualEndAt)<Date.parse(input.actualStartAt))reasons.push("execution_date_order_invalid");
      if(!snapshot(input.startExecutionAfterSnapshot)||!identityIntact(input.startExecutionAfterSnapshot,r))reasons.push("after_snapshot_identity_invalid");
      if(!noIssues(r)||r.correctionRequired||r.rollbackRequired||!r.workingTreeEvidence.clean||!r.mainOriginMainAlignmentEvidence.aligned||!r.requiredTestEvidence.passed)reasons.push("issues_or_readiness_require_manual_resolution");
      if(CONDITION_FIELDS.concat(["failureReason","incompleteReason","blockedReason"]).some(k=>input[k]!==undefined))reasons.push("normal_completion_cannot_carry_conditions_or_failure");
    }
    if(input.result===STATES[4]){
      for(const k of CONDITION_FIELDS)if(!text(input[k]))reasons.push(k+"_required");
      if(!date(input.conditionDeadline))reasons.push("condition_deadline_invalid");
    }
    if(input.result===STATES[5]&&!text(input.failureReason))reasons.push("failure_reason_required");
    for(const k of ["actualStartAt","actualEndAt","reviewedAt"])if(input[k]!==undefined&&!date(input[k]))reasons.push(k+"_invalid");
    for(const k of ["executionSummary","reviewedBy","failureReason","incompleteReason","blockedReason"])if(input[k]!==undefined&&!text(input[k]))reasons.push(k+"_invalid");
    if(input.startExecutionAfterSnapshot!==undefined&&(!snapshot(input.startExecutionAfterSnapshot)||!identityIntact(input.startExecutionAfterSnapshot,r)))reasons.push("after_snapshot_identity_invalid");
    return reasons;
  }
  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;r.schemaVersion=SCHEMA_VERSION;
    const body=clone(r);delete body.phase313SourceSnapshot;
    r[OWN+"Snapshot"]=body;r[OWN+"SnapshotHash"]=computeSnapshotHash(body);return deepFreeze(r);
  }
  const TRANSITIONS=deepFreeze({[STATES[0]]:[STATES[1]],[STATES[1]]:[STATES[2]],[STATES[2]]:STATES.slice(3,8)});
  function auditIntact(r){
    const a=r.auditTrail;
    const rules={phase31_start_execution_record_creation:[["",STATES[0]]],begin_manual_phase31_start_execution_record:[[STATES[0],STATES[1]]],update_phase31_start_execution_record:[[STATES[1],STATES[1]]],submit_phase31_start_execution_review:[[STATES[1],STATES[2]]],complete_phase31_start_execution_record:RESULTS.map(to=>[STATES[2],to]),invalidation:STATES.slice(0,8).map(from=>[from,STATES[8]])};
    return Number.isInteger(r.recordVersion)&&r.recordVersion>0&&Array.isArray(a)&&a.length===r.recordVersion&&Array.from(a).every((e,i)=>e&&human(e)&&Object.prototype.hasOwnProperty.call(rules,e.action)&&rules[e.action].some(([from,to])=>e.from===from&&e.to===to)&&(i===0?e.from==="":e.from===a[i-1].to))&&a.at(-1).to===r[OWN+"Status"];
  }
  function integrityIntact(r,o){
    try{
      if(!allowed(r,INPUT_FIELDS.concat(PROTECTED_FIELDS,COMPLETION_FIELDS))||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||r.schemaVersion!==SCHEMA_VERSION||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateExecutionInput(r).length)return false;
      if(r[OWN+"Id"]!==`phase31-start-execution-${r.createdAt}-${r[SOURCE+"Id"]}`||!identityIntact(r.startExecutionBeforeSnapshot,r))return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"],decision=r.auditTrail.find(e=>e.action==="complete_phase31_start_execution_record");
      if(!STATES.includes(status)||result!==(decision?decision.to:""))return false;
      if(result===""?r.result!==undefined:r.result!==result)return false;
      if(result===""&&COMPLETION_FIELDS.some(k=>r[k]!==undefined))return false;
      if(STATES.slice(0,3).includes(status)&&result!==""||RESULTS.includes(status)&&result!==status)return false;
      if(result!==""&&validateCompletion(r,r).length)return false;
      const success=result===STATES[3];if(r.phase31Started!==success||r.manualPhase31StartCompleted!==success)return false;
      if(status===STATES[8]?!date(r.invalidatedAt):r.invalidatedAt!==undefined)return false;
      const body=clone(r);delete body.phase313SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase313Eligibility(r.phase313SourceSnapshot,o).valid)return false;
      return REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase313SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractStartExecutionCandidates(sources,existing,o){
    if(!Array.isArray(sources)||!Array.isArray(existing))return deepFreeze([]);
    const seen=new Set();return deepFreeze(sources.filter(s=>{if(!validatePhase313Eligibility(s,o).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:h.performedAt,reason:h.reason,explicitConfirmation:true}}
  function operationContext(h,o){if(!human(h))return null;try{const at=now(o,h);return {at,options:{now:()=>at}}}catch(_){return null}}
  function createStartExecutionRecord(source,input,h,o,existing){
    const context=operationContext(h,o),reasons=[...validatePhase313Eligibility(source,context&&context.options).reasons,...validateExecutionInput(input)];
    if(!allowed(input,INPUT_FIELDS)||!jsonValue(input))reasons.push("unsupported_protected_or_non_json_field");
    if(!context)reasons.push("valid_human_operation_and_clock_required");
    if(!Array.isArray(existing))reasons.push("existing_records_required");else if(source&&duplicate(source,existing))reasons.push("duplicate_phase31_start_execution");
    for(const k of ["sourceRecordId","raceId"])if(input&&input[k]!==undefined&&(!text(input[k])||!source||input[k]!==source[k]))reasons.push(k+"_mismatch");
    if(!source||!input||!identityIntact(input.startExecutionBeforeSnapshot,source))reasons.push("before_snapshot_identity_mismatch");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=context.at,r={...clone(input),...SAFETY,safetyBoundary:clone(SAFETY_BOUNDARY),phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-start-execution-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase31Started:false,manualPhase31StartCompleted:false,phase313SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event("phase31_start_execution_record_creation","",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  function transition(r,from,to,action,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||r[OWN+"Status"]!==from||!integrityIntact(r,c.options))return {transitioned:false,record:r,reasons:["valid_active_manual_record_required"]};
    const n={...clone(r),[OWN+"Status"]:to,previousStatus:from,updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  const beginStartExecutionRecord=(r,h,o)=>transition(r,STATES[0],STATES[1],"begin_manual_phase31_start_execution_record",h,o);
  const submitStartExecutionForReview=(r,h,o)=>transition(r,STATES[1],STATES[2],"submit_phase31_start_execution_review",h,o);
  function updateStartExecution(r,changes,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||r[OWN+"Status"]!==STATES[1]||!allowed(changes,CONTENT_FIELDS.concat(ISSUE_FIELDS))||!jsonValue(changes)||!integrityIntact(r,c.options)||validateExecutionInput({...r,...changes}).length||!identityIntact(changes.startExecutionBeforeSnapshot||r.startExecutionBeforeSnapshot,r))return {updated:false,record:r,reasons:["valid_manual_update_required"]};
    const n={...clone(r),...clone(changes),updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("update_phase31_start_execution_record",STATES[1],STATES[1],h))};return deepFreeze({updated:true,record:stamp(n),reasons:[]});
  }
  function completeStartExecution(r,input,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||r[OWN+"Status"]!==STATES[2]||!allowed(input,COMPLETION_FIELDS)||!jsonValue(input)||!integrityIntact(r,c.options))return {completed:false,record:r,reasons:["valid_manual_completion_required"]};
    const reasons=validateCompletion(r,input);if(reasons.length)return {completed:false,record:r,reasons};
    const success=input.result===STATES[3],n={...clone(r),...clone(input),[OWN+"Status"]:input.result,[OWN+"Result"]:input.result,phase31Started:success,manualPhase31StartCompleted:success,previousStatus:STATES[2],updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("complete_phase31_start_execution_record",STATES[2],input.result,h))};
    // These booleans describe the human's record, not an execution performed here.
    return deepFreeze({completed:true,record:stamp(n),reasons:[]});
  }
  function invalidateStartExecution(r,h,o){
    const c=operationContext(h,o);if(!c||inactive(r,c.at)||!integrityIntact(r,c.options))return {transitioned:false,record:r,reasons:["valid_active_manual_record_required"]};
    const at=c.at,n={...clone(r),[OWN+"Status"]:STATES[8],previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("invalidation",r[OWN+"Status"],STATES[8],h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  function recordsValid(records,o){return Array.isArray(records)&&Array.from(records).every(r=>integrityIntact(r,o))&&new Set(records.map(r=>r[SOURCE+"Id"])).size===records.length}
  function saveStartExecutionRecords(storage,records,o){try{if(!recordsValid(records,o))return deepFreeze({saved:false});storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,records:clone(records)}));return deepFreeze({saved:true})}catch(_){return deepFreeze({saved:false})}}
  function loadStartExecutionRecords(storage,o){try{const data=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");const loaded=data.schemaVersion===SCHEMA_VERSION&&recordsValid(data.records,o);return deepFreeze({loaded,records:loaded?clone(data.records):[]})}catch(_){return deepFreeze({loaded:false,records:[]})}}
  function render(r,o){return deepFreeze({currentStage:CURRENT_STAGE,nextStage:NEXT_STAGE,status:r&&r[OWN+"Status"]||"",result:r&&r[OWN+"Result"]||"",phase313Dependency:r&&r[SOURCE+"Id"]||"",executionTarget:r&&r.executionTarget||"",executionScope:r&&r.executionScope||"",phase31Started:!!r&&r.phase31Started===true,manualStartRecorded:!!r&&r.manualPhase31StartCompleted===true,privateLocalOnly:!!r&&r.privateLocalOnly===true,planOnly:!!r&&r.planOnly===true,protectedMode:!!r&&r.protectedMode===true,automaticStartDisabled:!!r&&r.phase31AutomaticallyStarted===false,externalCommunicationDisabled:!!r&&r.networkCommunicationPerformed===false,safetyIntact:safetyIntact(r),integrityIntact:integrityIntact(r,o)})}
  return deepFreeze({PHASE313_REFERENCE:p313,STORAGE_KEY,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,EXECUTION_FIELDS,CONTENT_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,CONDITION_FIELDS,PROTECTED_FIELDS,TRANSITIONS,SAFETY,SAFETY_BOUNDARY,EVIDENCE_FIELDS,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase313Eligibility,extractStartExecutionCandidates,validateExecutionInput,createStartExecutionRecord,beginStartExecutionRecord,updateStartExecution,submitStartExecutionForReview,completeStartExecution,invalidateStartExecution,saveStartExecutionRecords,loadStartExecutionRecords,render});
});
