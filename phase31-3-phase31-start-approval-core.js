(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-2-phase31-start-preparation-core.js"):root.HashimotoPhase312StartPreparation;
  const api=factory(dependency);if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase313StartApproval=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p312){
  "use strict";if(!p312)throw new Error("Phase31-2 start preparation definition is required");
  const STORAGE_KEY="hashimoto.phase31.3.startApprovalRecords",SCHEMA_VERSION="31.3.1",CURRENT_STAGE="phase31_start_approval",NEXT_STAGE="manual_phase31_start_execution";
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v},clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v)),array=v=>Array.isArray(v)?v:[],present=v=>v!==null&&v!==undefined&&(typeof v!=="string"||v.trim()!=="")&&(!Array.isArray(v)||v.length>0)&&(typeof v!=="object"||Array.isArray(v)||Object.keys(v).length>0),date=v=>typeof v==="string"&&Number.isFinite(Date.parse(v)),human=h=>!!(h&&text(h.performedBy)&&text(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt)),now=o=>new Date(o&&o.now?o.now():new Date()).toISOString();
  const STATES=deepFreeze(["awaiting_manual_phase31_start_approval","manual_phase31_start_approval_in_progress","awaiting_manual_phase31_start_approval_review","ready_for_manual_phase31_start_execution","phase31_start_conditionally_approved","phase31_start_approval_rejected","phase31_start_approval_incomplete","phase31_start_approval_blocked","invalidated"]),RESULTS=deepFreeze(STATES.slice(3,8));
  const APPROVAL_FIELDS=deepFreeze(["approvalTarget","approvalScope","approver","reviewer","responsiblePerson","startPreparationConfirmation","phase31DefinitionConfirmation","prerequisiteConfirmation","dependencyConfirmation","safetyBoundaryConfirmation","prohibitedActionsConfirmation","rollbackPointConfirmation","recoveryPointConfirmation","gitStateConfirmation","workingTreeConfirmation","mainOriginMainAlignmentConfirmation","requiredTestsConfirmation","notes"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","startPreparationConfirmed","phase31DefinitionConfirmed","prerequisitesConfirmed","dependenciesConfirmed","safetyBoundaryConfirmed","prohibitedActionsConfirmed","rollbackPointConfirmed","recoveryPointConfirmed","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman","requiredTestsConfirmedByHuman"]);
  const SAFETY=deepFreeze({...p312.SAFETY,privateLocalOnly:true,planOnly:true,protectedMode:true,phase31Started:false,phase31AutomaticallyStarted:false,nextPhaseAutomaticallyStarted:false,phase31StartExecutionAutomaticallyStarted:false,phase31StartExecutionPerformed:false,phase31StartApprovalAutomaticallyExecuted:false,phase31StartPreparationAutomaticallyReleased:false,phase31DefinitionAutomaticallyReleased:false,automaticPhaseAdvancePerformed:false,automaticCorrectionPerformed:false,automaticRollbackPerformed:false,automaticRecoveryPerformed:false,automaticConditionReleasePerformed:false,networkCommunicationPerformed:false,externalTransmissionPerformed:false,webAccessPerformed:false,apiRequestPerformed:false,authenticationPerformed:false,automaticAuthenticationEnabled:false,credentialUsed:false,credentialsStored:false,automaticCredentialUseEnabled:false,schedulerEnabled:false,schedulerUsed:false,timerEnabled:false,timerUsed:false,pollingEnabled:false,pollingUsed:false,backgroundWorkerEnabled:false,workerUsed:false,filesystemOperationPerformed:false,filesystemMutationPerformed:false,fileAutomaticallyGenerated:false,fileAutomaticallyModified:false,directoryAutomaticallyModified:false,stagingDataModified:false,formalDataModified:false,dataMutationPerformed:false,dataAutomaticallyMigrated:false,automaticValidationExecuted:false,automaticCorrectionExecutionPerformed:false,learningUpdated:false,automaticLearningUpdatePerformed:false,appliedToPrediction:false,appliedToLearning:false,bettingExecuted:false,gitOperationPerformed:false,githubApiOperationPerformed:false,githubOperationPerformed:false,publicReleasePerformed:false,githubPagesPublished:false});
  const REFERENCE_IDS=deepFreeze(["phase31StartPreparationId",...p312.REFERENCE_IDS]),UPSTREAM_FIELDS=deepFreeze(["phase31StartPreparationSnapshotHash","phase31StartPreparationVersion",...p312.UPSTREAM_FIELDS]);
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);function computeSnapshotHash(v){let h=2166136261;for(const c of stable(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return`fnv1a32-${(h>>>0).toString(16).padStart(8,"0")}`}
  const OWN="phase31StartApproval",SOURCE="phase31StartPreparation";
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const strings=v=>Array.isArray(v)&&Array.from(v).every(text);
  const explanation=v=>text(v)||(strings(v)&&v.length>0);
  const allowed=(v,keys)=>!!(v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k)));
  const inactive=r=>!r||!!r.invalidatedAt||!!r.expiredAt||(r.expiresAt!==undefined&&(!date(r.expiresAt)||Date.parse(r.expiresAt)<=Date.now()));
  const noIssues=r=>ISSUE_FIELDS.every(k=>strings(r[k])&&r[k].length===0);
  const SAFETY_BOUNDARY=p312.SAFETY_BOUNDARY;
  const CONDITION_FIELDS=deepFreeze(["approvalConditions","conditionalApprovalConditions","conditionReason","conditionOwner","conditionDeadline","conditionVerificationMethod","conditionReleaseCriteria"]);
  const DECISION_FIELDS=deepFreeze(["result","approvedAt","reviewedAt",...CONDITION_FIELDS,"rejectionReasons","incompleteReason","blockedReason"]);
  const INPUT_FIELDS=[...APPROVAL_FIELDS,...ISSUE_FIELDS,...REQUIRED_TRUE];
  const PROTECTED_FIELDS=deepFreeze(["phase312SourceSnapshot",OWN+"Id",OWN+"Status",OWN+"Result","approvalDecision",OWN+"Snapshot",OWN+"SnapshotHash",OWN+"Version","schemaVersion","phase","stage","nextStage","safetyBoundary","createdAt","updatedAt","recordVersion","auditTrail","previousStatus","invalidatedAt","expiredAt","expiresAt",...REFERENCE_IDS,...UPSTREAM_FIELDS,...Object.keys(SAFETY)]);
  const safetyIntact=r=>!!r&&Object.keys(SAFETY).every(k=>r[k]===SAFETY[k])&&stable(r.safetyBoundary)===stable(SAFETY_BOUNDARY);
  function validatePhase312Eligibility(s){
    const reasons=[];
    try{
      if(p312.CURRENT_STAGE!=="phase31_start_preparation"||p312.NEXT_STAGE!=="manual_phase31_start_approval")reasons.push("source_contract_invalid");
      if(!s||s.phase!=="phase31"||s.stage!==p312.CURRENT_STAGE||s.nextStage!==p312.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(!s||s[SOURCE+"Status"]!=="ready_for_manual_phase31_start_approval")reasons.push("source_status_invalid");
      if(!s||s[SOURCE+"Result"]!=="ready_for_manual_phase31_start_approval")reasons.push("source_result_invalid");
      if(inactive(s))reasons.push("source_inactive");
      if(!s||!p312.safetyIntact(s))reasons.push("source_safety_invalid");
      if(!s||s[SOURCE+"Version"]!==p312.SCHEMA_VERSION)reasons.push("source_version_invalid");
      if(!s||s[SOURCE+"Id"]!==`phase31-start-preparation-${s.createdAt}-${s.phase31DefinitionId}`)reasons.push("source_creation_identity_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!s||!text(s[k]))reasons.push(k+"_required");
      if(!s||!noIssues(s))reasons.push("source_issues_present_or_invalid");
      if(!s||!Number.isInteger(s.recordVersion)||s.recordVersion<1||!Array.isArray(s.auditTrail)||s.auditTrail.length!==s.recordVersion)reasons.push("source_audit_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // The real dependency recursively verifies Phase31-1 and Phase30 final closure.
      if(!p312.integrityIntact(s))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  function validateApprovalInput(input){
    const reasons=[];
    for(const k of APPROVAL_FIELDS)if(!input||!text(input[k]))reasons.push(k+"_required");
    for(const k of ISSUE_FIELDS)if(!input||!strings(input[k]))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return reasons;
  }
  function validateDecision(r,input){
    const reasons=[];
    if(!input||!RESULTS.includes(input.result))return ["valid_decision_required"];
    if(input.result===STATES[3]){
      if(!date(input.approvedAt)||!date(input.reviewedAt))reasons.push("approval_review_dates_invalid");
      if(!noIssues(r))reasons.push("issues_require_manual_resolution");
      if(CONDITION_FIELDS.some(k=>input[k]!==undefined)||input.rejectionReasons!==undefined||input.incompleteReason!==undefined||input.blockedReason!==undefined)reasons.push("normal_approval_cannot_carry_conditions_or_rejection");
    }
    if(input.result===STATES[4]){
      for(const k of CONDITION_FIELDS)if(!(k==="approvalConditions"||k==="conditionalApprovalConditions"?explanation(input[k]):text(input[k])))reasons.push(k+"_required");
      if(!date(input.conditionDeadline))reasons.push("condition_deadline_invalid");
    }
    if(input.result===STATES[5]&&!explanation(input.rejectionReasons))reasons.push("rejection_reasons_required");
    // As in Phase30-3, incomplete/blocked decisions need no additional reason.
    // Optional reason/date fields must still be well formed when supplied.
    for(const k of ["incompleteReason","blockedReason"])if(input[k]!==undefined&&!text(input[k]))reasons.push(k+"_invalid");
    for(const k of ["approvedAt","reviewedAt"])if(input[k]!==undefined&&!date(input[k]))reasons.push(k+"_invalid");
    return reasons;
  }
  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;r.schemaVersion=SCHEMA_VERSION;
    const snapshot=clone(r);delete snapshot.phase312SourceSnapshot;
    r[OWN+"Snapshot"]=snapshot;r[OWN+"SnapshotHash"]=computeSnapshotHash(snapshot);
    return deepFreeze(r);
  }
  const TRANSITIONS=deepFreeze({[STATES[0]]:[STATES[1]],[STATES[1]]:[STATES[2]],[STATES[2]]:STATES.slice(3,8)});
  function auditIntact(r){
    const a=r.auditTrail;
    const rules={phase31_start_approval_creation:[["",STATES[0]]],start_phase31_start_approval:[[STATES[0],STATES[1]]],update_phase31_start_approval:[[STATES[1],STATES[1]]],submit_phase31_start_approval_review:[[STATES[1],STATES[2]]],decide_phase31_start_approval:RESULTS.map(to=>[STATES[2],to]),invalidation:STATES.slice(0,8).map(from=>[from,STATES[8]])};
    return Number.isInteger(r.recordVersion)&&r.recordVersion>0&&Array.isArray(a)&&a.length===r.recordVersion&&Array.from(a).every((e,i)=>e&&human(e)&&Object.prototype.hasOwnProperty.call(rules,e.action)&&rules[e.action].some(([from,to])=>e.from===from&&e.to===to)&&(i===0?e.from==="":e.from===a[i-1].to))&&a.at(-1).to===r[OWN+"Status"];
  }
  function integrityIntact(r){
    try{
      if(!allowed(r,INPUT_FIELDS.concat(PROTECTED_FIELDS,DECISION_FIELDS)))return false;
      if(!r||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||r.schemaVersion!==SCHEMA_VERSION||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateApprovalInput(r).length)return false;
      if(r[OWN+"Id"]!==`phase31-start-approval-${r.createdAt}-${r[SOURCE+"Id"]}`)return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"],decision=r.auditTrail.find(e=>e.action==="decide_phase31_start_approval");
      if(!STATES.includes(status)||result!==(decision?decision.to:"")||r.approvalDecision!==result)return false;
      if(result===""?r.result!==undefined:r.result!==result)return false;
      if(result===""&&DECISION_FIELDS.some(k=>r[k]!==undefined))return false;
      if(STATES.slice(0,3).includes(status)&&result!==""||RESULTS.includes(status)&&result!==status)return false;
      if(result!==""&&validateDecision(r,r).length)return false;
      if(status===STATES[8]?!date(r.invalidatedAt):r.invalidatedAt!==undefined)return false;
      const body=clone(r);delete body.phase312SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase312Eligibility(r.phase312SourceSnapshot).valid)return false;
      return REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase312SourceSnapshot[k]);
    }catch(_){return false}
  }
  // Preserve prior decisions: invalidation/expiry never silently clears duplication.
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractStartApprovalCandidates(sources,existing){
    if(!Array.isArray(sources)||!Array.isArray(existing))return deepFreeze([]);
    const seen=new Set();
    return deepFreeze(sources.filter(s=>{if(!validatePhase312Eligibility(s).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:h.performedAt,reason:h.reason,explicitConfirmation:true}}
  function createStartApprovalRecord(source,input,h,o,existing){
    const reasons=[...validatePhase312Eligibility(source).reasons,...validateApprovalInput(input)];
    if(!allowed(input,INPUT_FIELDS))reasons.push("unsupported_or_protected_field");
    if(!human(h))reasons.push("human_operation_required");
    if(!Array.isArray(existing))reasons.push("existing_records_required");
    else if(source&&duplicate(source,existing))reasons.push("duplicate_phase31_start_approval");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=now(o),r={...clone(input),...SAFETY,safetyBoundary:clone(SAFETY_BOUNDARY),phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-start-approval-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",approvalDecision:"",phase312SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event("phase31_start_approval_creation","",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];
    return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  function transition(r,from,to,action,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==from||!integrityIntact(r))return {transitioned:false,record:r};
    const n={...clone(r),[OWN+"Status"]:to,previousStatus:from,updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};
    return deepFreeze({transitioned:true,record:stamp(n)});
  }
  const startApprovalReview=(r,h,o)=>transition(r,STATES[0],STATES[1],"start_phase31_start_approval",h,o);
  const submitApprovalForReview=(r,h,o)=>transition(r,STATES[1],STATES[2],"submit_phase31_start_approval_review",h,o);
  function updateApproval(r,changes,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==STATES[1]||!allowed(changes,APPROVAL_FIELDS.concat(ISSUE_FIELDS))||!integrityIntact(r)||validateApprovalInput({...r,...changes}).length)return {updated:false,record:r};
    const n={...clone(r),...clone(changes),updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("update_phase31_start_approval",STATES[1],STATES[1],h))};
    return deepFreeze({updated:true,record:stamp(n)});
  }
  function decideStartApproval(r,input,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==STATES[2]||!allowed(input,DECISION_FIELDS)||!integrityIntact(r))return {completed:false,record:r,reasons:["valid_manual_decision_required"]};
    const reasons=validateDecision(r,input);if(reasons.length)return {completed:false,record:r,reasons};
    const n={...clone(r),...clone(input),[OWN+"Status"]:input.result,[OWN+"Result"]:input.result,approvalDecision:input.result,previousStatus:STATES[2],updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("decide_phase31_start_approval",STATES[2],input.result,h))};
    // All decisions are records only. Conditional approval has no release API.
    return deepFreeze({completed:true,record:stamp(n),reasons:[]});
  }
  function invalidateApproval(r,h,o){
    if(!human(h)||inactive(r)||!integrityIntact(r))return {transitioned:false,record:r};
    const at=now(o),n={...clone(r),[OWN+"Status"]:STATES[8],previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("invalidation",r[OWN+"Status"],STATES[8],h))};
    return deepFreeze({transitioned:true,record:stamp(n)});
  }
  // Storage is explicitly supplied by the caller; there is no ambient storage access.
  function recordsValid(records){return Array.isArray(records)&&Array.from(records).every(integrityIntact)&&new Set(records.map(r=>r[SOURCE+"Id"])).size===records.length}
  function saveStartApprovalRecords(storage,records){
    try{if(!recordsValid(records))return deepFreeze({saved:false});storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,records:clone(records)}));return deepFreeze({saved:true})}catch(_){return deepFreeze({saved:false})}
  }
  function loadStartApprovalRecords(storage){
    try{const data=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");const loaded=data.schemaVersion===SCHEMA_VERSION&&recordsValid(data.records);return deepFreeze({loaded,records:loaded?clone(data.records):[]})}catch(_){return deepFreeze({loaded:false,records:[]})}
  }
  function render(r){return deepFreeze({currentStage:CURRENT_STAGE,nextStage:NEXT_STAGE,status:r&&r[OWN+"Status"]||"",result:r&&r[OWN+"Result"]||"",approvalDecision:r&&r.approvalDecision||"",phase312Dependency:r&&r[SOURCE+"Id"]||"",approvalTarget:r&&r.approvalTarget||"",approvalScope:r&&r.approvalScope||"",privateLocalOnly:!!r&&r.privateLocalOnly===true,planOnly:!!r&&r.planOnly===true,protectedMode:!!r&&r.protectedMode===true,phase31NotStarted:!!r&&r.phase31Started===false,startExecutionNotPerformed:!!r&&r.phase31StartExecutionPerformed===false,nextPhaseNotStarted:!!r&&r.nextPhaseAutomaticallyStarted===false,safetyIntact:safetyIntact(r),integrityIntact:integrityIntact(r)})}
  return deepFreeze({PHASE312_REFERENCE:p312,STORAGE_KEY,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,APPROVAL_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,CONDITION_FIELDS,PROTECTED_FIELDS,TRANSITIONS,SAFETY,SAFETY_BOUNDARY,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase312Eligibility,extractStartApprovalCandidates,validateApprovalInput,createStartApprovalRecord,startApprovalReview,updateApproval,submitApprovalForReview,decideStartApproval,invalidateApproval,saveStartApprovalRecords,loadStartApprovalRecords,render});
});
