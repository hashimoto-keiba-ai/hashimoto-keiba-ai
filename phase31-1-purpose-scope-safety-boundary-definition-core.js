(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase30-19-phase30-final-closure-core.js"):root.HashimotoPhase3019FinalClosure;
  const api=factory(dependency);
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.HashimotoPhase311PurposeScopeSafetyBoundaryDefinition=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p3019){
  "use strict";
  if(!p3019)throw new Error("Phase30-19 final closure definition is required");
  const SCHEMA_VERSION="31.1.1",CURRENT_STAGE="phase31_purpose_scope_safety_boundary_definition",NEXT_STAGE="manual_phase31_start_preparation";
  const OWN="phase31Definition",SOURCE="phase30FinalClosure";
  const clone=v=>JSON.parse(JSON.stringify(v));
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v};
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const date=v=>text(v)&&Number.isFinite(Date.parse(v));
  const human=h=>!!(h&&text(h.performedBy)&&text(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt));
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);
  const computeSnapshotHash=p3019.computeSnapshotHash;
  const STATES=deepFreeze(["awaiting_manual_phase31_definition","manual_phase31_definition_in_progress","awaiting_manual_phase31_definition_review","phase31_purpose_scope_safety_boundary_defined","ready_for_manual_phase31_start_preparation","phase31_definition_rejected","phase31_definition_incomplete","phase31_definition_blocked","invalidated"]);
  const RESULTS=deepFreeze([STATES[3],STATES[5],STATES[6],STATES[7]]);
  const CONTENT_FIELDS=deepFreeze(["phase31Purpose","phase31Scope","phase31InScope","phase31OutOfScope","phase31Objectives","phase31NonObjectives","safetyBoundary","prohibitedActions","allowedPlanningActions","assumptions","prerequisites","dependencies","constraints","risks","startConditions","stopConditions","rollbackPoint","recoveryPoint","rollbackPolicy","recoveryPolicy","conditionReleasePolicy","externalCommunicationPolicy","authenticationPolicy","credentialPolicy","automationPolicy","dataMutationPolicy","validationPolicy","learningPolicy","predictionApplicationPolicy","bettingPolicy","gitPolicy","publicExposurePolicy","auditRequirements","traceabilityRequirements","operator","reviewer","responsiblePerson","notes"]);
  const LIST_FIELDS=deepFreeze(["phase31InScope","phase31OutOfScope","phase31Objectives","phase31NonObjectives","prohibitedActions","allowedPlanningActions","assumptions","prerequisites","dependencies","constraints","risks","startConditions","stopConditions","auditRequirements","traceabilityRequirements","notes"]);
  const ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]);
  const REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","phase30CompletionConfirmed","manualReviewRequired","humanApprovalRequired"]);
  const SAFETY_BOUNDARY=deepFreeze({privateLocalOnly:true,planOnly:true,protectedMode:true,externalCommunicationProhibited:true,externalTransmissionProhibited:true,externalExecutionProhibited:true,automaticExecutionProhibited:true,automaticApprovalProhibited:true,gitGithubOperationsProhibited:true,automaticCorrectionProhibited:true,automaticRollbackProhibited:true,automaticRecoveryProhibited:true,automaticConditionReleaseProhibited:true,automaticNextPhaseTransitionProhibited:true,filesystemOperationsProhibited:true,publicExposureProhibited:true,automaticDataMigrationProhibited:true,automaticPurchaseProhibited:true,automaticApplicationProhibited:true,automaticLearningUpdateProhibited:true});
  const SAFETY=deepFreeze({...p3019.SAFETY,privateLocalOnly:true,planOnly:true,protectedMode:true,phase31Started:false,phase31AutomaticallyStarted:false,automaticPhase31StartPerformed:false,phase31StartPreparationAutomaticallyStarted:false,nextPhaseAutomaticallyStarted:false,automaticNextStageStartPerformed:false,automaticApprovalPerformed:false,manualReviewRequired:true,humanApprovalRequired:true,manualDefinitionRecordOnly:true,definitionMode:"LOCAL_MANAGEMENT_RECORD_ONLY",automaticStartPreparationPerformed:false,automaticStartApprovalPerformed:false,automaticConditionReleasePerformed:false,filesystemMutationPerformed:false,gitOperationPerformed:false,githubApiOperationPerformed:false,publicReleasePerformed:false,githubPagesPublished:false});
  const REFERENCE_IDS=deepFreeze([SOURCE+"Id",...p3019.REFERENCE_IDS]);
  const UPSTREAM_FIELDS=deepFreeze([SOURCE+"SnapshotHash",SOURCE+"Version",...p3019.UPSTREAM_FIELDS]);
  const INPUT_FIELDS=[...CONTENT_FIELDS,...ISSUE_FIELDS,...REQUIRED_TRUE];
  const COMPLETION_FIELDS=["result","reviewedBy","reviewedAt","approvedBy","approvedAt","humanApprovalConfirmed","rejectionReason","incompleteReason","blockedReason"];
  const allowed=(v,keys)=>!!(v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k)));
  const boundaryIntact=v=>!!(v&&stable(v)===stable(SAFETY_BOUNDARY));
  const safetyIntact=r=>!!r&&Object.keys(SAFETY).every(k=>r[k]===SAFETY[k]);
  const inactive=r=>!r||!!r.invalidatedAt||!!r.expiredAt||(r.expiresAt!==undefined&&(!date(r.expiresAt)||Date.parse(r.expiresAt)<=Date.now()));
  const noIssues=r=>ISSUE_FIELDS.every(k=>Array.isArray(r[k])&&r[k].length===0);

  function validatePhase3019Eligibility(s){
    const reasons=[];
    try{
      if(p3019.CURRENT_STAGE!=="phase30_final_closure"||p3019.NEXT_STAGE!==null||p3019.TERMINAL_STAGE!==true)reasons.push("source_terminal_contract_invalid");
      if(!s||s.phase!=="phase30"||s.stage!==p3019.CURRENT_STAGE||s.nextStage!==null||s.terminalStage!==true||(s.currentStage!==undefined&&s.currentStage!==s.stage))reasons.push("source_stage_invalid");
      if(!s||s.phase30FinalClosureStatus!=="phase30_final_closed"||s.phase30Status!=="closed"||s.phase30Completed!==true)reasons.push("source_not_completed");
      if(!s||s.phase30FinalClosureResult!=="complete_phase30_final_closure")reasons.push("source_result_invalid");
      if(inactive(s))reasons.push("source_inactive");
      if(!s||!p3019.safetyIntact(s))reasons.push("source_safety_invalid");
      if(!s||s.phase30FinalClosureVersion!==p3019.SCHEMA_VERSION)reasons.push("source_version_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!s||!text(s[k]))reasons.push(k+"_required");
      if(!s||!["createdAt","updatedAt","phase30ClosedAt"].every(k=>date(s[k])))reasons.push("source_dates_invalid");
      if(s&&(s.createdAt!==s.updatedAt||s.createdAt!==s.phase30ClosedAt||s.phase30FinalClosureId!==`phase30-final-closure-${s.createdAt}-${s.phase30PostStartStabilizationClosureAcceptanceId}`))reasons.push("source_creation_identity_invalid");
      // Phase30-19 stores issue lists and the safety boundary in its Phase30-18 snapshot.
      // Additional top-level issue metadata must also be well formed and empty.
      for(const k of ["errors",...ISSUE_FIELDS])if(s&&s[k]!==undefined&&(!Array.isArray(s[k])||s[k].length))reasons.push(k+"_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      if(!p3019.integrityIntact(s))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  function validateDefinitionInput(input){
    const reasons=[];
    for(const k of CONTENT_FIELDS){
      const v=input&&input[k];
      if(k==="safetyBoundary"){if(!boundaryIntact(v))reasons.push("safetyBoundary_invalid")}
      else if(LIST_FIELDS.includes(k)){if(!Array.isArray(v)||!v.length||!Array.from(v).every(text))reasons.push(k+"_nonempty_string_array_required")}
      else if(!text(v))reasons.push(k+"_required");
    }
    for(const k of ISSUE_FIELDS)if(!input||!Array.isArray(input[k])||!Array.from(input[k]).every(text))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return reasons;
  }
  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;
    const snapshot=clone(r);delete snapshot.phase3019SourceSnapshot;
    r[OWN+"Snapshot"]=snapshot;r[OWN+"SnapshotHash"]=computeSnapshotHash(snapshot);
    return deepFreeze(r);
  }
  function auditIntact(r){
    const a=r.auditTrail,status=r[OWN+"Status"];
    const rules={phase31_definition_creation:[["",STATES[0]]],start_phase31_definition:[[STATES[0],STATES[1]]],update_phase31_definition:[[STATES[1],STATES[1]]],submit_phase31_definition_review:[[STATES[1],STATES[2]]],complete_phase31_definition:RESULTS.map(to=>[STATES[2],to]),manual_handoff_to_phase31_start_preparation:[[STATES[3],STATES[4]]],invalidation:STATES.slice(0,8).map(from=>[from,STATES[8]])};
    return Number.isInteger(r.recordVersion)&&r.recordVersion>0&&Array.isArray(a)&&a.length===r.recordVersion&&Array.from(a).every((e,i)=>e&&human(e)&&Object.prototype.hasOwnProperty.call(rules,e.action)&&rules[e.action].some(([from,to])=>e.from===from&&e.to===to)&&(i===0?e.from==="":e.from===a[i-1].to))&&a.at(-1).to===status;
  }
  const reviewIntact=r=>text(r.reviewedBy)&&date(r.reviewedAt)&&text(r.approvedBy)&&date(r.approvedAt)&&r.humanApprovalConfirmed===true;
  function integrityIntact(r){
    try{
      if(!r||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||!text(r[OWN+"Id"])||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateDefinitionInput(r).length)return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"];
      if(!STATES.includes(status)||(STATES.slice(0,3).includes(status)&&result!=="")||([STATES[3],STATES[4]].includes(status)&&(result!==STATES[3]||!noIssues(r)||!reviewIntact(r)))||([STATES[5],STATES[6],STATES[7]].includes(status)&&result!==status))return false;
      if(result===""?r.result!==undefined:r.result!==result)return false;
      const decision=r.auditTrail.find(e=>e.action==="complete_phase31_definition");
      if(result!==(decision?decision.to:""))return false;
      if(result===STATES[3]&&(!noIssues(r)||!reviewIntact(r)))return false;
      if(result===STATES[5]&&!text(r.rejectionReason)||result===STATES[6]&&!text(r.incompleteReason)||result===STATES[7]&&!text(r.blockedReason))return false;
      if(status===STATES[8]&&(!date(r.invalidatedAt)||(result!==""&&!RESULTS.includes(result))))return false;
      if(status!==STATES[8]&&r.invalidatedAt!==undefined)return false;
      const body=clone(r);delete body.phase3019SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase3019Eligibility(r.phase3019SourceSnapshot).valid)return false;
      return REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase3019SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractDefinitionCandidates(sources,existing){
    if(!Array.isArray(sources)||!Array.isArray(existing))return deepFreeze([]);
    const seen=new Set();
    return deepFreeze(sources.filter(s=>{if(!validatePhase3019Eligibility(s).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:h.performedAt,reason:h.reason,explicitConfirmation:true}}
  const now=o=>new Date(o&&o.now?o.now():new Date()).toISOString();
  function createDefinition(source,input,h,o,existing){
    const reasons=[...validatePhase3019Eligibility(source).reasons,...validateDefinitionInput(input)];
    if(!allowed(input,INPUT_FIELDS))reasons.push("unsupported_or_protected_field");
    if(!human(h))reasons.push("human_operation_required");
    if(!Array.isArray(existing))reasons.push("existing_records_required");
    else if(source&&duplicate(source,existing))reasons.push("duplicate_phase31_definition");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=now(o),r={...clone(input),...SAFETY,phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-definition-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase3019SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event("phase31_definition_creation","",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];
    return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  function transition(r,from,to,action,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==from||!integrityIntact(r))return {transitioned:false,record:r};
    const n={...clone(r),[OWN+"Status"]:to,previousStatus:from,updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};
    return deepFreeze({transitioned:true,record:stamp(n)});
  }
  const startDefinition=(r,h,o)=>transition(r,STATES[0],STATES[1],"start_phase31_definition",h,o);
  const submitDefinitionForReview=(r,h,o)=>transition(r,STATES[1],STATES[2],"submit_phase31_definition_review",h,o);
  function updateDefinition(r,changes,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==STATES[1]||!allowed(changes,CONTENT_FIELDS.concat(ISSUE_FIELDS))||!integrityIntact(r)||validateDefinitionInput({...r,...changes}).length)return {updated:false,record:r};
    const n={...clone(r),...clone(changes),updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("update_phase31_definition",STATES[1],STATES[1],h))};
    return deepFreeze({updated:true,record:stamp(n)});
  }
  function completeDefinition(r,input,h,o){
    if(!human(h)||inactive(r)||r[OWN+"Status"]!==STATES[2]||!allowed(input,COMPLETION_FIELDS)||!RESULTS.includes(input.result)||!integrityIntact(r))return {completed:false,record:r,reasons:["valid_manual_completion_required"]};
    const reasons=[];
    if(input.result===STATES[3]){
      if(!reviewIntact(input))reasons.push("manual_review_and_human_approval_required");
      if(!noIssues(r))reasons.push("issues_must_be_resolved_by_manual_review");
    }
    const reasonField={[STATES[5]]:"rejectionReason",[STATES[6]]:"incompleteReason",[STATES[7]]:"blockedReason"}[input.result];
    if(reasonField&&!text(input[reasonField]))reasons.push(reasonField+"_required");
    if(reasons.length)return {completed:false,record:r,reasons};
    const n={...clone(r),...clone(input),[OWN+"Status"]:input.result,[OWN+"Result"]:input.result,previousStatus:STATES[2],updatedAt:now(o),recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("complete_phase31_definition",STATES[2],input.result,h))};
    // As in Phase30-1, the same explicit completion records a handoff only.
    // No Phase31 start or preparation API is called, scheduled, or exposed.
    if(input.result===STATES[3]){
      n.auditTrail.push(event("manual_handoff_to_phase31_start_preparation",STATES[3],STATES[4],h));
      n.previousStatus=STATES[3];n[OWN+"Status"]=STATES[4];n.recordVersion++;
    }
    return deepFreeze({completed:true,record:stamp(n),reasons:[]});
  }
  function invalidateDefinition(r,h,o){
    if(!human(h)||inactive(r)||!integrityIntact(r))return {transitioned:false,record:r};
    const at=now(o),n={...clone(r),[OWN+"Status"]:STATES[8],previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("invalidation",r[OWN+"Status"],STATES[8],h))};
    return deepFreeze({transitioned:true,record:stamp(n)});
  }
  function render(r){return deepFreeze({currentStage:CURRENT_STAGE,nextStage:NEXT_STAGE,status:r&&r[OWN+"Status"]||"",result:r&&r[OWN+"Result"]||"",purpose:r&&r.phase31Purpose||"",scope:r&&r.phase31Scope||"",phase31NotStarted:!!r&&r.phase31Started===false,privateLocalOnly:!!r&&r.privateLocalOnly===true,planOnly:!!r&&r.planOnly===true,protectedMode:!!r&&r.protectedMode===true,manualReviewRequired:true,humanApprovalRequired:true,safetyIntact:safetyIntact(r),integrityIntact:integrityIntact(r)})}
  return deepFreeze({PHASE3019_REFERENCE:p3019,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,CONTENT_FIELDS,LIST_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,SAFETY_BOUNDARY,SAFETY,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase3019Eligibility,validateDefinitionInput,extractDefinitionCandidates,createDefinition,startDefinition,updateDefinition,submitDefinitionForReview,completeDefinition,invalidateDefinition,render});
});
