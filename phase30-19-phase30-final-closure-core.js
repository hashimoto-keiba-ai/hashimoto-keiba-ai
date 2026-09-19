(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase30-18-phase30-post-start-stabilization-closure-acceptance-core.js"):root.HashimotoPhase3018PostStartStabilizationClosureAcceptance;
  const api=factory(dependency);
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.HashimotoPhase3019FinalClosure=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p3018){
  "use strict";
  if(!p3018)throw new Error("Phase30-18 acceptance definition is required");
  const SCHEMA_VERSION="30.19.1",CURRENT_STAGE="phase30_final_closure",NEXT_STAGE=null,TERMINAL_STAGE=true;
  const SOURCE="phase30PostStartStabilizationClosureAcceptance",OWN="phase30FinalClosure";
  const clone=v=>JSON.parse(JSON.stringify(v));
  const deepFreeze=v=>{if(v&&typeof v==="object"&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(deepFreeze)}return v};
  const present=v=>typeof v==="string"&&v.trim().length>0;
  const date=v=>present(v)&&Number.isFinite(Date.parse(v));
  const human=h=>!!(h&&present(h.performedBy)&&present(h.reason)&&h.explicitConfirmation===true&&date(h.performedAt));
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);
  const computeSnapshotHash=p3018.computeSnapshotHash;
  const STATES=deepFreeze(["phase30_final_closed"]);
  const SAFETY=deepFreeze({...p3018.SAFETY,manualFinalClosureRecordOnly:true,finalClosureMode:"LOCAL_MANAGEMENT_RECORD_ONLY",automaticFinalClosurePerformed:false,nextPhaseAutomaticallyStarted:false,automaticNextPhaseStartPerformed:false});
  const REFERENCE_IDS=deepFreeze([SOURCE+"Id",...p3018.REFERENCE_IDS]);
  const UPSTREAM_FIELDS=deepFreeze([SOURCE+"SnapshotHash",SOURCE+"Version",...p3018.UPSTREAM_FIELDS]);
  const CLOSURE_FIELDS=deepFreeze(["closureSummary","completionCriteria","finalConfirmations"]);
  const safetyIntact=r=>!!r&&Object.keys(SAFETY).every(k=>r[k]===SAFETY[k]);

  function validatePhase3018Eligibility(s){
    const reasons=[];
    try{
      if(!s||s[SOURCE+"Status"]!=="ready_for_manual_phase30_final_closure")reasons.push("source_status_invalid");
      if(!s||s[SOURCE+"Result"]!==p3018.RESULTS[0]||s.result!==p3018.RESULTS[0])reasons.push("source_result_invalid");
      if(!s||s.phase30Started!==true||s.manualPhase30StartCompleted!==true||s.nextPhaseAutomaticallyStarted!==false)reasons.push("source_start_or_handoff_flags_invalid");
      if(!s||s.phase!=="phase30"||s.stage!==p3018.CURRENT_STAGE||s.nextStage!=="manual_phase30_final_closure"||(s.currentStage!==undefined&&s.currentStage!==s.stage)||p3018.NEXT_STAGE!=="manual_phase30_final_closure")reasons.push("source_stage_invalid");
      if(!s||s.invalidatedAt||s.expiredAt||(s.expiresAt&&(!date(s.expiresAt)||Date.parse(s.expiresAt)<=Date.now())))reasons.push("source_inactive");
      if(!s||!p3018.safetyIntact(s)||!p3018.integrityIntact(s))reasons.push("source_safety_or_integrity_invalid");
      if(!s||p3018.validateAcceptanceInput(s).length||!present(s.acceptanceSummary)||!s.acceptanceAfterSnapshot||!Object.keys(s.acceptanceAfterSnapshot).length||!date(s.acceptedAt))reasons.push("source_acceptance_invalid");
      for(const k of ["errors",...p3018.ISSUE_FIELDS])if(!s||!Array.isArray(s[k])||s[k].length)reasons.push(k+"_must_be_empty_array");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!s||!present(s[k]))reasons.push(k+"_required");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // Reuse Phase30-18's complete record validator via its read-only codec.
      // This adapter is in-memory only; no localStorage or filesystem is accessed.
      const encoded=JSON.stringify({schemaVersion:p3018.SCHEMA_VERSION,records:[s]});
      if(!p3018.loadStabilizationClosureAcceptanceRecords({getItem:()=>encoded}).loaded)reasons.push("source_audit_or_reference_chain_invalid");
      const upstream=s.phase3017SourceSnapshot;
      const before={};
      for(const suffix of ["Id","SnapshotHash","Version"]){const k="phase30PostStartStabilizationClosurePostExecutionVerificationDecision"+suffix;before[k]=upstream[k]}
      if(stable(s.acceptanceBeforeSnapshot)!==stable(before))reasons.push("source_before_snapshot_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  function validateClosureInput(input){
    const reasons=[];
    for(const k of CLOSURE_FIELDS)if(!input||!present(input[k]))reasons.push(k+"_required");
    if(input&&Object.keys(input).some(k=>!CLOSURE_FIELDS.includes(k)))reasons.push("unsupported_or_protected_field");
    return reasons;
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractPhase30FinalClosureCandidates(sources,existing){
    if(!Array.isArray(sources)||!Array.isArray(existing))return deepFreeze([]);
    const seen=new Set();
    return deepFreeze(sources.filter(s=>{if(!validatePhase3018Eligibility(s).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function createPhase30FinalClosureRecord(source,input,operation,options,existing){
    const reasons=[...validatePhase3018Eligibility(source).reasons,...validateClosureInput(input)];
    if(!human(operation))reasons.push("human_operation_required");
    // The caller must explicitly supply its complete ledger, including closed records.
    if(!Array.isArray(existing))reasons.push("existing_records_required");
    else if(source&&duplicate(source,existing))reasons.push("duplicate_phase30_final_closure");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=new Date(options&&options.now?options.now():new Date()).toISOString();
    const record={...clone(input),...SAFETY,phase:"phase30",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,terminalStage:true,phase30Status:"closed",phase30Completed:true,phase30ClosedAt:at,
      [OWN+"Id"]:`phase30-final-closure-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"complete_phase30_final_closure",[OWN+"Version"]:SCHEMA_VERSION,
      phase3018SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,
      auditTrail:[{action:"manual_phase30_final_closure",from:"",to:STATES[0],performedBy:operation.performedBy,performedAt:operation.performedAt,reason:operation.reason,explicitConfirmation:true}]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))record[k]=source[k];
    const snapshot=clone(record);delete snapshot.phase3018SourceSnapshot;
    record[OWN+"Snapshot"]=snapshot;record[OWN+"SnapshotHash"]=computeSnapshotHash(snapshot);
    return deepFreeze({created:true,record,reasons:[]});
  }
  function integrityIntact(r){
    try{
      if(!r||!safetyIntact(r)||!validatePhase3018Eligibility(r.phase3018SourceSnapshot).valid||validateClosureInput(Object.fromEntries(CLOSURE_FIELDS.map(k=>[k,r[k]]))).length)return false;
      const body=clone(r);delete body.phase3018SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      const a=r.auditTrail;
      return r[OWN+"Version"]===SCHEMA_VERSION&&r[OWN+"Status"]===STATES[0]&&r[OWN+"Result"]==="complete_phase30_final_closure"&&r.phase==="phase30"&&r.stage===CURRENT_STAGE&&r.nextStage===null&&r.terminalStage===true&&r.phase30Status==="closed"&&r.phase30Completed===true&&date(r.phase30ClosedAt)&&r.recordVersion===1&&Array.isArray(a)&&a.length===1&&human(a[0])&&a[0].action==="manual_phase30_final_closure"&&a[0].from===""&&a[0].to===STATES[0]&&REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase3018SourceSnapshot[k])&&stable(body)===stable(r[OWN+"Snapshot"])&&computeSnapshotHash(body)===r[OWN+"SnapshotHash"];
    }catch(_){return false}
  }
  return deepFreeze({PHASE3018_REFERENCE:p3018,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,TERMINAL_STAGE,STATES,SAFETY,REFERENCE_IDS,UPSTREAM_FIELDS,CLOSURE_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validateClosureInput,validatePhase3018Eligibility,extractPhase30FinalClosureCandidates,createPhase30FinalClosureRecord});
});
