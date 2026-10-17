(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-10-phase31-post-start-stabilization-followup-core.js"):root.HashimotoPhase3110PostStartStabilizationFollowup;
  const api=factory(dependency);if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase3111PostStartStabilizationClosureReview=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p3110){
  "use strict";if(!p3110)throw new Error("Phase31-10 post-start stabilization followup definition is required");
  const STORAGE_KEY="hashimoto.phase31.11.postStartStabilizationClosureReviewRecords",SCHEMA_VERSION="31.11.1",CURRENT_STAGE="phase31_post_start_stabilization_closure_review",NEXT_STAGE="manual_phase31_post_start_stabilization_closure_decision";
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v},clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v)) ,date=v=>typeof v==="string"&&Number.isFinite(Date.parse(v)),human=h=>!!(jsonValue(h)&&plain(h)&&text(h.performedBy)&&text(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt));
  const STATES=deepFreeze(["awaiting_manual_phase31_post_start_stabilization_closure_review","manual_phase31_post_start_stabilization_closure_review_in_progress","awaiting_manual_phase31_post_start_stabilization_closure_review_completion","phase31_post_start_stabilization_closure_review_ready_for_closure","phase31_post_start_stabilization_closure_review_conditionally_ready","phase31_post_start_stabilization_closure_review_not_ready","phase31_post_start_stabilization_closure_review_incomplete","phase31_post_start_stabilization_closure_review_blocked","ready_for_manual_phase31_post_start_stabilization_closure_decision","invalidated"]);
  const RESULTS=deepFreeze(["phase31_post_start_stabilization_closure_review_ready_for_closure","phase31_post_start_stabilization_closure_review_conditionally_ready","phase31_post_start_stabilization_closure_review_not_ready","phase31_post_start_stabilization_closure_review_incomplete","phase31_post_start_stabilization_closure_review_blocked"]),RESULT_STATUS=deepFreeze(Object.fromEntries(RESULTS.map((r,i)=>[r,STATES[i+3]])));
  const REVIEW_FIELDS=deepFreeze(["reviewTarget","reviewScope","reviewOperator","reviewer","responsiblePerson","stabilizationFollowupConfirmation","stabilizationEvidenceConfirmation","runtimeStateConfirmation","requiredTestResultsConfirmation","safetyBoundaryConfirmation","prohibitedActionsConfirmation","gitStateEvidence","workingTreeEvidence","mainOriginMainAlignmentEvidence","rollbackPoint","recoveryPoint","closureReadinessConfirmation","closureReviewItems","closureReviewBasis","closureReviewNotes"]),ARRAY_FIELDS=deepFreeze(["errors","warnings","unresolvedIssues","criticalIssues","blockingConditions"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","stabilizationFollowupConfirmed","stabilizationEvidenceConfirmed","runtimeStateConfirmed","requiredTestResultsConfirmedByHuman","safetyBoundaryConfirmed","prohibitedActionsConfirmed","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman","rollbackPointConfirmed","recoveryPointConfirmed","closureReadinessConfirmed"]);
  const SAFETY=deepFreeze({...p3110.SAFETY,phase31PostStartStabilizationClosureReviewAutomaticallyStarted:false,phase31PostStartStabilizationClosureReviewAutomaticallyExecuted:false,phase31PostStartStabilizationClosureReviewAutomaticallyCompleted:false,phase31PostStartStabilizationClosureDecisionAutomaticallyStarted:false,automaticClosureReviewPerformed:false,automaticClosureReviewCompletionPerformed:false,automaticClosureDecisionPerformed:false,automaticClosureReviewHandoffPerformed:false});
  const REFERENCE_IDS=deepFreeze(["phase31PostStartStabilizationFollowupId",...p3110.REFERENCE_IDS]),UPSTREAM_FIELDS=deepFreeze(["phase31PostStartStabilizationFollowupSnapshotHash","phase31PostStartStabilizationFollowupVersion",...p3110.UPSTREAM_FIELDS]);
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);function computeSnapshotHash(v){if(!jsonValue(v))throw new Error("JSON-safe snapshot data is required");let h=2166136261;for(const c of stable(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return`fnv1a32-${(h>>>0).toString(16).padStart(8,"0")}`}
  const OWN="phase31PostStartStabilizationClosureReview",SOURCE="phase31PostStartStabilizationFollowup";
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const strings=v=>Array.isArray(v)&&Array.from(v).every(text);
  const plain=v=>{try{return plainObject(v)}catch(_){return false}};
  const plainObject=v=>{if(!v||typeof v!=="object"||Array.isArray(v))return false;const p=Object.getPrototypeOf(v);if(p===null)return true;if(Object.getPrototypeOf(p)!==null)return false;const c=Object.getOwnPropertyDescriptor(p,"constructor");return !!c&&typeof c.value==="function"&&Object.getOwnPropertyDescriptor(c.value,"prototype")?.value===p&&Object.getOwnPropertyDescriptor(c.value,"name")?.value==="Object"&&/^function\s+Object\s*\(\s*\)\s*\{\s*\[native code\]\s*\}$/.test(Function.prototype.toString.call(c.value))};
  const allowed=(v,keys)=>{try{return plain(v)&&Object.keys(v).every(k=>keys.includes(k))}catch(_){return false}};
  const noIssues=r=>ISSUE_FIELDS.every(k=>strings(r[k])&&r[k].length===0);
  const SAFETY_BOUNDARY=p3110.SAFETY_BOUNDARY;
  const CONTENT_FIELDS=deepFreeze([...REVIEW_FIELDS,"requiredTestResults"]);
  const CONDITION_FIELDS=deepFreeze(["conditions","conditionReason","conditionOwner","conditionDeadline","conditionVerificationMethod","conditionReleaseCriteria"]);
  const COMPLETION_FIELDS=deepFreeze(["result","canProceedToNextStage","reviewSummary","completedBy","completedAt","completionReason","reviewedBy","reviewedAt","closureReviewAfterSnapshot",...CONDITION_FIELDS,"notReadyReason","notReadyImpact","requiredActions","incompleteReason","missingItems","blockedReason","blockedImpact","unblockingConditions"]);
  const INPUT_FIELDS=[...CONTENT_FIELDS,...ARRAY_FIELDS,...REQUIRED_TRUE,"sourceRecordId","raceId"];
  const PROTECTED_FIELDS=deepFreeze(["phase3110SourceSnapshot",OWN+"Id",OWN+"Status",OWN+"Result",OWN+"Snapshot",OWN+"SnapshotHash",OWN+"Version","schemaVersion","phase","stage","nextStage","safetyBoundary","phase31Started","manualPhase31StartCompleted","canProceedToNextStage","stabilizationClosureReview","createdAt","updatedAt","recordVersion","auditTrail","previousStatus","invalidatedAt","expiredAt","expiresAt",...REFERENCE_IDS,...UPSTREAM_FIELDS,...Object.keys(SAFETY),...COMPLETION_FIELDS,"sourceRecordId","raceId"]);
  const EVIDENCE_FIELDS=deepFreeze({gitStateEvidence:["branch","headCommit"],workingTreeEvidence:["status"],mainOriginMainAlignmentEvidence:["mainCommit","originMainCommit"],requiredTestResults:["summary"]});
  // Expiry is evaluated against explicit human/clock context, never an implicit clock.
  // Without that context an expiry-bearing record is excluded, rather than assumed valid.
  const evaluationAt=o=>{if(o===undefined||o===null)return null;if(!plain(o))throw Error("explicit_clock_required");const d=Object.getOwnPropertyDescriptors(o);if(Reflect.ownKeys(d).some(k=>k!=="now")||d.now&&!("value" in d.now))throw Error("explicit_clock_required");if(!d.now)return null;if(typeof d.now.value!=="function")throw Error("explicit_clock_required");const value=d.now.value(),millis=typeof value==="string"?Date.parse(value):typeof value==="number"?value:Date.prototype.getTime.call(value);if(!Number.isFinite(millis))throw Error("valid_explicit_clock_required");return new Date(millis).toISOString()};
  const inactive=(r,at)=>!r||r.invalidatedAt!==undefined||r.expiredAt!==undefined||(r.expiresAt!==undefined&&(!date(r.expiresAt)||!date(at)||Date.parse(r.expiresAt)<=Date.parse(at)));
  function jsonValue(v,seen=new Set()){try{return jsonData(v,seen)}catch(_){return false}}
  function jsonData(v,seen){
    if(v===null||typeof v==="string"||typeof v==="boolean")return true;
    if(typeof v==="number")return Number.isFinite(v);
    if(!v||typeof v!=="object"||seen.has(v)||(!Array.isArray(v)&&!plain(v)))return false;
    if(Array.isArray(v)){
      const p=Object.getPrototypeOf(v),c=p&&Object.getOwnPropertyDescriptor(p,"constructor");
      if(!Array.isArray(p)||!c||typeof c.value!=="function"||Object.getOwnPropertyDescriptor(c.value,"prototype")?.value!==p||!/^function\s+Array\s*\(\s*\)\s*\{\s*\[native code\]\s*\}$/.test(Function.prototype.toString.call(c.value)))return false;
    }
    for(let p=Object.getPrototypeOf(v);p;p=Object.getPrototypeOf(p))if(Object.prototype.hasOwnProperty.call(p,"toJSON"))return false;
    const descriptors=Object.getOwnPropertyDescriptors(v),keys=Reflect.ownKeys(descriptors),isArray=Array.isArray(v);
    if(keys.some(k=>typeof k!=="string"||!("value" in descriptors[k])||(!descriptors[k].enumerable&&!(isArray&&k==="length"))))return false;
    if(isArray&&(keys.length!==descriptors.length.value+1||keys.some(k=>k!=="length"&&(!/^(0|[1-9][0-9]*)$/.test(k)||Number(k)>=descriptors.length.value))))return false;
    seen.add(v);const valid=keys.filter(k=>!(isArray&&k==="length")).every(k=>jsonValue(descriptors[k].value,seen));seen.delete(v);return valid;
  }
  function evidenceIntact(k,v){
    const flag={workingTreeEvidence:"clean",mainOriginMainAlignmentEvidence:"aligned",requiredTestResults:"passed"}[k];
    if(!allowed(v,[...EVIDENCE_FIELDS[k],"confirmedBy","confirmedAt","confirmed",...(flag?[flag]:[])]))return false;
    if(!EVIDENCE_FIELDS[k].every(f=>text(v[f]))||!text(v.confirmedBy)||!date(v.confirmedAt)||v.confirmed!==true)return false;
    if(flag&&typeof v[flag]!=="boolean")return false;
    return k!=="mainOriginMainAlignmentEvidence"||v.aligned===(v.mainCommit===v.originMainCommit);
  }
  const safetyIntact=r=>{try{if(!plain(r))return false;const d=Object.getOwnPropertyDescriptors(r),b=d.safetyBoundary;if(!b||!("value" in b)||!jsonValue(b.value))return false;return Object.keys(SAFETY).every(k=>d[k]&&"value" in d[k]&&d[k].value===SAFETY[k])&&stable(b.value)===stable(SAFETY_BOUNDARY)}catch(_){return false}};
  function validatePhase3110Eligibility(s,o){
    const reasons=[];
    try{
      if(!plain(s)||!jsonValue(s))return deepFreeze({valid:false,reasons:["source_plain_record_required"]});
      if(p3110.CURRENT_STAGE!=="phase31_post_start_stabilization_followup"||p3110.NEXT_STAGE!=="manual_phase31_post_start_stabilization_closure_review")reasons.push("source_contract_invalid");
      if(s.phase!=="phase31"||s.stage!==p3110.CURRENT_STAGE||s.nextStage!==p3110.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(s[SOURCE+"Status"]!=="ready_for_manual_phase31_post_start_stabilization_closure_review")reasons.push("source_status_invalid");
      if(s[SOURCE+"Result"]!=="phase31_post_start_stabilization_followup_completed")reasons.push("source_result_invalid");
      if(s.canProceedToNextStage!==true)reasons.push("source_manual_handoff_required");
      if(s.phase31Started!==true||s.manualPhase31StartCompleted!==true)reasons.push("manual_start_not_completed");
      if(inactive(s,evaluationAt(o)))reasons.push("source_inactive_or_expiry_context_required");
      if(!p3110.safetyIntact(s))reasons.push("source_safety_invalid");
      if(s[SOURCE+"Version"]!==p3110.SCHEMA_VERSION)reasons.push("source_version_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!text(s[k]))reasons.push(k+"_required");
      if(!strings(s.errors)||s.errors.length||!noIssues(s))reasons.push("source_issues_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // The dependency recursively verifies the entire execution/approval chain.
      if(!p3110.integrityIntact(s,o))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  const sourceAligned=(r,s)=>!!r&&!!s&&["rollbackPoint","recoveryPoint"].every(k=>text(r[k])&&r[k]===s[k]);
  function validateClosureReviewInput(input){
    if(!jsonValue(input)||!plain(input))return deepFreeze(["plain_json_closure_review_input_required"]);
    return validateClosureReviewFields(input);
  }
  function validateClosureReviewFields(input){
    const reasons=[];
    for(const k of CONTENT_FIELDS){
      const v=input&&input[k];
      if(["closureReviewItems"].includes(k)){if(!strings(v))reasons.push(k+"_string_array_required")}
      else if(Object.prototype.hasOwnProperty.call(EVIDENCE_FIELDS,k)){if(!evidenceIntact(k,v))reasons.push(k+"_invalid")}
      else if(!text(v))reasons.push(k+"_required");
    }
    for(const k of ARRAY_FIELDS)if(!input||!strings(input[k]))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return deepFreeze(reasons);
  }
  function validateCompletion(r,input){
    const reasons=[];
    if(!input||!RESULTS.includes(input.result))return ["explicit_manual_result_required"];
    if(input.canProceedToNextStage!==false)reasons.push("manual_handoff_required_before_advancing");
    for(const k of ["reviewSummary","completedBy","completionReason","reviewedBy"])if(!text(input[k]))reasons.push(k+"_required");
    for(const k of ["completedAt","reviewedAt"])if(!date(input[k]))reasons.push(k+"_invalid");
    if(!plain(input.closureReviewAfterSnapshot)||!Object.keys(input.closureReviewAfterSnapshot).length||!jsonValue(input.closureReviewAfterSnapshot))reasons.push("closureReviewAfterSnapshot_invalid");
    const specific=[...CONDITION_FIELDS,"notReadyReason","notReadyImpact","requiredActions","incompleteReason","missingItems","blockedReason","blockedImpact","unblockingConditions"];
    const expected=input.result===RESULTS[1]?CONDITION_FIELDS:input.result===RESULTS[2]?["notReadyReason","notReadyImpact","requiredActions"]:input.result===RESULTS[3]?["incompleteReason","missingItems"]:input.result===RESULTS[4]?["blockedReason","blockedImpact","unblockingConditions"]:[];
    if(specific.some(k=>input[k]!==undefined&&!expected.includes(k)))reasons.push("inconsistent_result_metadata");
    if(input.result===RESULTS[0]&&(!noIssues(r)||r.errors.length||!r.workingTreeEvidence.clean||!r.mainOriginMainAlignmentEvidence.aligned||!r.requiredTestResults.passed))reasons.push("issues_or_readiness_require_manual_resolution");
    for(const k of expected){if(k==="requiredActions"||k==="missingItems"||k==="unblockingConditions"){if(!strings(input[k])||!input[k].length)reasons.push(k+"_required")}else if(!text(input[k]))reasons.push(k+"_required")}
    if(input.result===RESULTS[1]&&!date(input.conditionDeadline))reasons.push("condition_deadline_invalid");
    return reasons;
  }
  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;r.schemaVersion=SCHEMA_VERSION;
    const body=clone(r);delete body.phase3110SourceSnapshot;
    r[OWN+"Snapshot"]=body;r[OWN+"SnapshotHash"]=computeSnapshotHash(body);return deepFreeze(r);
  }
  const TRANSITIONS=deepFreeze({[STATES[0]]:[STATES[1]],[STATES[1]]:[STATES[2]],[STATES[2]]:RESULTS.map(r=>RESULT_STATUS[r]),[STATES[3]]:[STATES[8]]});
  function auditIntact(r){
    const a=r.auditTrail;
    const rules={phase31_post_start_stabilization_closure_review_creation:[["",STATES[0]]],begin_phase31_post_start_stabilization_closure_review:[[STATES[0],STATES[1]]],update_phase31_post_start_stabilization_closure_review:[[STATES[1],STATES[1]]],submit_phase31_post_start_stabilization_closure_review:[[STATES[1],STATES[2]]],complete_phase31_post_start_stabilization_closure_review:RESULTS.map(result=>[STATES[2],RESULT_STATUS[result]]),manual_handoff_to_phase31_post_start_stabilization_closure_decision:[[STATES[3],STATES[8]]],invalidation:STATES.filter(from=>from!==STATES[9]).map(from=>[from,STATES[9]])};
    return Number.isInteger(r.recordVersion)&&r.recordVersion>0&&Array.isArray(a)&&a.length===r.recordVersion&&Array.from(a).every((e,i)=>e&&human(e)&&Object.prototype.hasOwnProperty.call(rules,e.action)&&rules[e.action].some(([from,to])=>e.from===from&&e.to===to)&&(i===0?e.from==="":e.from===a[i-1].to))&&a.at(-1).to===r[OWN+"Status"];
  }
  function integrityIntact(r,o){
    try{
      if(!jsonValue(r)||!allowed(r,INPUT_FIELDS.concat(PROTECTED_FIELDS,COMPLETION_FIELDS))||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||r.schemaVersion!==SCHEMA_VERSION||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateClosureReviewFields(r).length)return false;
      if(r[OWN+"Id"]!==`phase31-stabilization-closure-review-${r.createdAt}-${r[SOURCE+"Id"]}`||!sourceAligned(r,r.phase3110SourceSnapshot))return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"],stabilizationClosureReview=r.auditTrail.find(e=>e.action==="complete_phase31_post_start_stabilization_closure_review");
      if(!STATES.includes(status)||result!==(stabilizationClosureReview?RESULTS.find(value=>RESULT_STATUS[value]===stabilizationClosureReview.to):""))return false;
      if(r.stabilizationClosureReview!==result||(result===""?r.result!==undefined:r.result!==result))return false;
      if(result===""&&(r.canProceedToNextStage!==false||COMPLETION_FIELDS.filter(k=>k!=="canProceedToNextStage").some(k=>r[k]!==undefined)))return false;
      if(STATES.slice(0,3).includes(status)&&result!==""||STATES.slice(3,8).includes(status)&&RESULT_STATUS[result]!==status)return false;
      if(result!==""&&validateCompletion(r,{...r,canProceedToNextStage:false}).length)return false;
      const handedOff=r.auditTrail.some(e=>e.action==="manual_handoff_to_phase31_post_start_stabilization_closure_decision");
      if(r.canProceedToNextStage!==(status===STATES[8]&&handedOff))return false;
      if(status===STATES[8]&&(!handedOff||result!==RESULTS[0]))return false;
      if(r.phase31Started!==true||r.manualPhase31StartCompleted!==true)return false;
      if(["expiresAt","expiredAt"].some(k=>r[k]!==undefined&&!date(r[k])))return false;
      if(r.expiredAt!==undefined)return false;
      if(r.expiresAt!==undefined){const at=evaluationAt(o);if(!date(at)||Date.parse(r.expiresAt)<=Date.parse(at))return false;}
      if(status===STATES[9]?!date(r.invalidatedAt):r.invalidatedAt!==undefined)return false;
      if(Date.parse(r.updatedAt)<Date.parse(r.createdAt))return false;
      if(r.previousStatus!==(r.auditTrail.length>1?r.auditTrail.at(-1).from:undefined))return false;
      if(status===STATES[9]&&r.invalidatedAt!==r.updatedAt)return false;
      const body=clone(r);delete body.phase3110SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase3110Eligibility(r.phase3110SourceSnapshot,o).valid)return false;
      return REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase3110SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractStabilizationClosureReviewCandidates(sources,existing,o){
    if(!jsonValue(sources)||!Array.isArray(sources)||!recordsValid(existing,o))return deepFreeze([]);
    const seen=new Set();return deepFreeze(sources.filter(s=>{if(!validatePhase3110Eligibility(s,o).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:new Date(h.performedAt).toISOString(),reason:h.reason,explicitConfirmation:true}}
  function operationContext(h,o){if(!human(h))return null;try{const at=evaluationAt(o)||new Date(h.performedAt).toISOString();return {at,options:{now:()=>at}}}catch(_){return null}}
  function createStabilizationClosureReviewRecord(source,input,h,o,existing){
    const context=operationContext(h,o),reasons=[...validatePhase3110Eligibility(source,context&&context.options).reasons,...validateClosureReviewInput(input)];
    if(!allowed(input,INPUT_FIELDS)||!jsonValue(input))reasons.push("unsupported_protected_or_non_json_field");
    if(!context)reasons.push("valid_human_operation_and_clock_required");
    if(!recordsValid(existing,context&&context.options))reasons.push("existing_records_required");else if(reasons.length===0&&source&&duplicate(source,existing))reasons.push("duplicate_phase31_post_start_stabilization_closure_review");
    if(reasons.length)return deepFreeze({created:false,reasons});
    for(const k of ["sourceRecordId","raceId"])if(input&&input[k]!==undefined&&(!text(input[k])||!source||input[k]!==source[k]))reasons.push(k+"_mismatch");
    if(!sourceAligned(input,source))reasons.push("rollback_or_recovery_point_mismatch");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=context.at,r={...clone(input),...SAFETY,safetyBoundary:clone(SAFETY_BOUNDARY),phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-stabilization-closure-review-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase31Started:true,manualPhase31StartCompleted:true,canProceedToNextStage:false,stabilizationClosureReview:"",phase3110SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event("phase31_post_start_stabilization_closure_review_creation","",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  const failure=(key,r,reasons)=>deepFreeze({[key]:false,record:jsonValue(r)?clone(r):null,reasons});
  function transition(r,from,to,action,h,o,handoff=false){
    const c=operationContext(h,o);if(!c||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt)||r[OWN+"Status"]!==from)return failure("transitioned",r,["valid_active_manual_record_required"]);
    const n={...clone(r),canProceedToNextStage:handoff,[OWN+"Status"]:to,previousStatus:from,updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  const beginStabilizationClosureReview=(r,h,o)=>transition(r,STATES[0],STATES[1],"begin_phase31_post_start_stabilization_closure_review",h,o);
  const submitStabilizationClosureReview=(r,h,o)=>transition(r,STATES[1],STATES[2],"submit_phase31_post_start_stabilization_closure_review",h,o);
  function updateStabilizationClosureReview(r,changes,h,o){
    const c=operationContext(h,o);if(!c||!allowed(changes,CONTENT_FIELDS.concat(ARRAY_FIELDS))||!jsonValue(changes)||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt)||r[OWN+"Status"]!==STATES[1]||validateClosureReviewFields({...r,...changes}).length||!sourceAligned({...r,...changes},r.phase3110SourceSnapshot))return failure("updated",r,["valid_manual_update_required"]);
    const n={...clone(r),...clone(changes),previousStatus:STATES[1],updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("update_phase31_post_start_stabilization_closure_review",STATES[1],STATES[1],h))};return deepFreeze({updated:true,record:stamp(n),reasons:[]});
  }
  function completeStabilizationClosureReview(r,input,h,o){
    const c=operationContext(h,o);if(!c||!allowed(input,COMPLETION_FIELDS)||!jsonValue(input)||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt)||r[OWN+"Status"]!==STATES[2])return failure("completed",r,["valid_manual_completion_required"]);
    const reasons=validateCompletion(r,input);if(reasons.length)return failure("completed",r,reasons);
    const nextStatus=RESULT_STATUS[input.result],n={...clone(r),...clone(input),stabilizationClosureReview:input.result,[OWN+"Status"]:nextStatus,[OWN+"Result"]:input.result,previousStatus:STATES[2],updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("complete_phase31_post_start_stabilization_closure_review",STATES[2],nextStatus,h))};
    // Record only the explicit human result and next-stage choice. No approval, correction, rollback or next-stage operation is executed.
    return deepFreeze({completed:true,record:stamp(n),reasons:[]});
  }
  // A separate explicit human action records handoff; it never starts closure decision.
  function handoffToStabilizationClosureDecision(r,h,o){
    const moved=transition(r,STATES[3],STATES[8],"manual_handoff_to_phase31_post_start_stabilization_closure_decision",h,o,true);
    return deepFreeze({handedOff:moved.transitioned,record:moved.record,reasons:moved.reasons});
  }
  function invalidateStabilizationClosureReview(r,h,o){
    const c=operationContext(h,o);if(!c||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt))return failure("transitioned",r,["valid_active_manual_record_required"]);
    const at=c.at,n={...clone(r),[OWN+"Status"]:STATES[9],canProceedToNextStage:false,previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event("invalidation",r[OWN+"Status"],STATES[9],h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  function recordsValid(records,o){return jsonValue(records)&&Array.isArray(records)&&Array.from(records).every(r=>integrityIntact(r,o))&&new Set(records.map(r=>r[SOURCE+"Id"])).size===records.length&&new Set(records.map(r=>r[OWN+"Id"])).size===records.length}
  function saveStabilizationClosureReviewRecords(storage,records,o){try{if(!recordsValid(records,o))return deepFreeze({saved:false});storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,records:clone(records)}));return deepFreeze({saved:true})}catch(_){return deepFreeze({saved:false})}}
  function loadStabilizationClosureReviewRecords(storage,o){try{const data=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");const loaded=data.schemaVersion===SCHEMA_VERSION&&recordsValid(data.records,o);return deepFreeze({loaded,records:loaded?clone(data.records):[]})}catch(_){return deepFreeze({loaded:false,records:[]})}}
  function render(r,o){if(!jsonValue(r)||!plain(r))r=null;return deepFreeze({currentStage:CURRENT_STAGE,nextStage:NEXT_STAGE,status:r&&text(r[OWN+"Status"])?r[OWN+"Status"]:"",result:r&&text(r[OWN+"Result"])?r[OWN+"Result"]:"",phase3110Dependency:r&&text(r[SOURCE+"Id"])?r[SOURCE+"Id"]:"",stabilizationClosureReview:r&&text(r.stabilizationClosureReview)?r.stabilizationClosureReview:"",reviewTarget:r&&text(r.reviewTarget)?r.reviewTarget:"",reviewScope:r&&text(r.reviewScope)?r.reviewScope:"",phase31Started:!!r&&r.phase31Started===true,manualStartRecorded:!!r&&r.manualPhase31StartCompleted===true,privateLocalOnly:!!r&&r.privateLocalOnly===true,planOnly:!!r&&r.planOnly===true,protectedMode:!!r&&r.protectedMode===true,canProceedToNextStage:!!r&&r.canProceedToNextStage===true,automaticReviewDisabled:!!r&&r.automaticClosureReviewPerformed===false,automaticCompletionDisabled:!!r&&r.automaticClosureReviewCompletionPerformed===false,automaticHandoffDisabled:!!r&&r.automaticClosureReviewHandoffPerformed===false,automationDisabled:!!r&&r.automationEnabled===false,externalCommunicationDisabled:!!r&&r.networkCommunicationPerformed===false,safetyIntact:safetyIntact(r),integrityIntact:integrityIntact(r,o)})}
  return deepFreeze({PHASE3110_REFERENCE:p3110,STORAGE_KEY,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,RESULT_STATUS,REVIEW_FIELDS,ARRAY_FIELDS,CONTENT_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,CONDITION_FIELDS,PROTECTED_FIELDS,TRANSITIONS,SAFETY,SAFETY_BOUNDARY,EVIDENCE_FIELDS,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase3110Eligibility,extractStabilizationClosureReviewCandidates,validateClosureReviewInput,createStabilizationClosureReviewRecord,beginStabilizationClosureReview,updateStabilizationClosureReview,submitStabilizationClosureReview,completeStabilizationClosureReview,handoffToStabilizationClosureDecision,invalidateStabilizationClosureReview,saveStabilizationClosureReviewRecords,loadStabilizationClosureReviewRecords,render});
});
