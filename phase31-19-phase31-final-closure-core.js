(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-18-phase31-post-start-stabilization-closure-post-execution-verification-decision-acceptance-core.js"):root.HashimotoPhase3118PostStartStabilizationClosureAcceptance;
  const api=factory(dependency);if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase3119FinalClosure=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p3118){
  "use strict";if(!p3118)throw new Error("Phase31-18 closure acceptance definition is required");
  const STORAGE_KEY="hashimoto.phase31.19.finalClosureRecords",SCHEMA_VERSION="31.19.1",CURRENT_STAGE="phase31_final_closure",NEXT_STAGE=null;
  const TERMINAL_STAGE = true;
  function deepFreeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
    }
    return value;
  }

  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

  // Date-only values are UTC. Timestamps must include an explicit offset.
  function date(value) {
    if (typeof value !== "string") return false;
    const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
    if (!parts || !Number.isFinite(Date.parse(value))) return false;
    const day = new Date(parts[1] + "-" + parts[2] + "-" + parts[3] + "T00:00:00Z");
    return day.getUTCDate() === Number(parts[3]);
  }

  function human(operation) {
    return jsonValue(operation) && plain(operation) && text(operation.performedBy) &&
      text(operation.reason) && operation.explicitConfirmation === true && date(operation.performedAt);
  }
  const STATES = deepFreeze([
    "awaiting_manual_phase31_final_closure",
    "manual_phase31_final_closure_in_progress",
    "awaiting_manual_phase31_final_closure_review",
    "phase31_final_closed",
    "phase31_final_conditionally_closed",
    "phase31_final_closure_failed",
    "phase31_final_closure_incomplete",
    "phase31_final_closure_blocked",
    "invalidated"
  ]);
  const RESULTS = deepFreeze([
    "complete_phase31_final_closure",
    "conditionally_complete_phase31_final_closure",
    "fail_phase31_final_closure",
    "phase31_final_closure_incomplete",
    "phase31_final_closure_blocked"
  ]);
  const RESULT_STATUS=deepFreeze(Object.fromEntries(RESULTS.map((r,i)=>[r,STATES[i+3]])));
  const CLOSURE_FIELDS=deepFreeze([
    "closureTarget",
    "closureScope",
    "closureOperator",
    "reviewer",
    "responsiblePerson",
    "verificationResultConfirmation",
    "verificationEvidenceConfirmation",
    "runtimeStateConfirmation",
    "requiredTestResultsConfirmation",
    "safetyBoundaryConfirmation",
    "prohibitedActionsConfirmation",
    "gitStateEvidence",
    "workingTreeEvidence",
    "mainOriginMainAlignmentEvidence",
    "rollbackPoint",
    "recoveryPoint",
    "closureBoundaryConfirmation",
    "closureBasis",
    "closureNotes"
  ]),ARRAY_FIELDS=deepFreeze(["errors","warnings","unresolvedIssues","criticalIssues","blockingConditions"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","verificationResultConfirmed","verificationEvidenceConfirmed","runtimeStateConfirmed","requiredTestResultsConfirmedByHuman","safetyBoundaryConfirmed","prohibitedActionsConfirmed","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman","rollbackPointConfirmed","recoveryPointConfirmed","closureBoundaryConfirmed"]);
  const SAFETY = deepFreeze({
    ...p3118.SAFETY,
    manualFinalClosureRecordOnly: true,
    finalClosureMode: "LOCAL_MANAGEMENT_RECORD_ONLY",
    automaticFinalClosurePerformed: false,
    phase32AutomaticallyStarted: false,
    livePredictionAutomaticallyStarted: false,
    liveOperationApproved: false
  });
  const SOURCE="phase31PostStartStabilizationClosureAcceptance", OWN="phase31FinalClosure";
  const REFERENCE_IDS=deepFreeze([SOURCE+"Id",...p3118.REFERENCE_IDS]);
  const UPSTREAM_FIELDS=deepFreeze([SOURCE+"SnapshotHash",SOURCE+"Version",...p3118.UPSTREAM_FIELDS]);
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);
  const computeSnapshotHash=p3118.computeSnapshotHash;
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const strings=v=>Array.isArray(v)&&Array.from(v).every(text);
  const plain=v=>{try{return plainObject(v)}catch(_){return false}};
  const plainObject=v=>{if(!v||typeof v!=="object"||Array.isArray(v))return false;const p=Object.getPrototypeOf(v);if(p===null)return true;if(Object.getPrototypeOf(p)!==null)return false;const c=Object.getOwnPropertyDescriptor(p,"constructor");return !!c&&typeof c.value==="function"&&Object.getOwnPropertyDescriptor(c.value,"prototype")?.value===p&&Object.getOwnPropertyDescriptor(c.value,"name")?.value==="Object"&&/^function\s+Object\s*\(\s*\)\s*\{\s*\[native code\]\s*\}$/.test(Function.prototype.toString.call(c.value))};
  const allowed=(v,keys)=>{try{return plain(v)&&Object.keys(v).every(k=>keys.includes(k))}catch(_){return false}};
  const noIssues=r=>ISSUE_FIELDS.every(k=>strings(r[k])&&r[k].length===0);
  const SAFETY_BOUNDARY=p3118.SAFETY_BOUNDARY;
  const CONTENT_FIELDS=deepFreeze([...CLOSURE_FIELDS,"requiredTestResults","noUnauthorizedOperationsConfirmed"]);
  const CONDITION_FIELDS=deepFreeze(["conditions","conditionReason","conditionOwner","conditionDeadline","conditionVerificationMethod","conditionReleaseCriteria"]);
  const COMPLETION_FIELDS=deepFreeze([
    "result",
    "explicitFinalApproval",
    "canProceedToNextStage",
    "closureSummary",
    "closedBy",
    "closedAt",
    "closureReason",
    "reviewedBy",
    "reviewedAt",
    "closureAfterSnapshot",
    ...CONDITION_FIELDS,
    "rejectionReason",
    "rejectionImpact",
    "requiredActions",
    "incompleteReason",
    "incompleteImpact",
    "missingItems",
    "blockedReason",
    "blockedImpact",
    "unblockingConditions",
    "responseOwner"
  ]);
  const INPUT_FIELDS=[...CONTENT_FIELDS,...ARRAY_FIELDS,...REQUIRED_TRUE,"sourceRecordId","raceId"];
  const PROTECTED_FIELDS=deepFreeze([
    "phase3118SourceSnapshot",
    OWN+"Id",
    OWN+"Status",
    OWN+"Result",
    OWN+"Snapshot",
    OWN+"SnapshotHash",
    OWN+"Version",
    "schemaVersion",
    "phase",
    "stage",
    "nextStage",
    "safetyBoundary",
    "terminalStage",
    "phase31Completed",
    "phase31ClosedAt",
    "phase31Started",
    "manualPhase31StartCompleted",
    "canProceedToNextStage",
    "finalClosure",
    "createdAt",
    "updatedAt",
    "recordVersion",
    "auditTrail",
    "previousStatus",
    "invalidatedAt",
    "expiredAt",
    "expiresAt",
    ...REFERENCE_IDS,
    ...UPSTREAM_FIELDS,
    ...Object.keys(SAFETY),
    ...COMPLETION_FIELDS,
    "sourceRecordId",
    "raceId"
  ]);
  const EVIDENCE_FIELDS=deepFreeze({gitStateEvidence:["branch","headCommit"],workingTreeEvidence:["status"],mainOriginMainAlignmentEvidence:["mainCommit","originMainCommit"],requiredTestResults:["summary"]});
  // Expiry is evaluated against explicit human/clock context, never an implicit clock.
  // Without that context an expiry-bearing record is excluded, rather than assumed valid.
  const evaluationAt=o=>{if(o===undefined||o===null)return null;if(!plain(o))throw Error("explicit_clock_required");const d=Object.getOwnPropertyDescriptors(o);if(Reflect.ownKeys(d).some(k=>k!=="now")||d.now&&!("value" in d.now))throw Error("explicit_clock_required");if(!d.now)return null;if(typeof d.now.value!=="function")throw Error("explicit_clock_required");const value=d.now.value(),millis=typeof value==="string"?(date(value)?Date.parse(value):NaN):typeof value==="number"?value:Date.prototype.getTime.call(value);if(!Number.isFinite(millis))throw Error("valid_explicit_clock_required");return new Date(millis).toISOString()};
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
  function validatePhase3118Eligibility(s,o){
    const reasons=[];
    try{
      if(!plain(s)||!jsonValue(s))return deepFreeze({valid:false,reasons:["source_plain_record_required"]});
      if(p3118.CURRENT_STAGE!=="phase31_post_start_stabilization_closure_acceptance"||p3118.NEXT_STAGE!=="manual_phase31_final_closure")reasons.push("source_contract_invalid");
      if(s.phase!=="phase31"||s.stage!==p3118.CURRENT_STAGE||s.nextStage!==p3118.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(s[SOURCE+"Status"]!=="ready_for_manual_phase31_final_closure")reasons.push("source_status_invalid");
      if(s[SOURCE+"Result"]!=="accept_phase31_post_start_stabilization_closure")reasons.push("source_result_invalid");
      if(s.canProceedToNextStage!==true||s.auditTrail?.at?.(-1)?.action!=="manual_handoff_to_phase31_final_closure")reasons.push("source_manual_handoff_required");
      if(s.phase31Started!==true||s.manualPhase31StartCompleted!==true)reasons.push("manual_start_not_completed");
      const at=evaluationAt(o);if(inactive(s,at))reasons.push("source_inactive_or_expiry_context_required");if(date(at)&&Date.parse(s.updatedAt)>Date.parse(at))reasons.push("source_record_from_future");
      if(!p3118.safetyIntact(s))reasons.push("source_safety_invalid");
      if(s.schemaVersion!==p3118.SCHEMA_VERSION||s[SOURCE+"Version"]!==p3118.SCHEMA_VERSION)reasons.push("source_version_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!text(s[k]))reasons.push(k+"_required");
      if(!strings(s.errors)||s.errors.length||!noIssues(s)||s.noUnauthorizedOperationsConfirmed!==true)reasons.push("source_issues_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // The dependency recursively verifies the entire execution/approval chain.
      if(!p3118.integrityIntact(s,at===null?undefined:{now:()=>at}))reasons.push("source_integrity_audit_or_reference_chain_invalid");
    }catch(_){reasons.push("source_malformed")}
    return deepFreeze({valid:reasons.length===0,reasons});
  }
  function sourceAligned(record, source) {
    return !!record && !!source &&
      ["rollbackPoint", "recoveryPoint"].every(key => text(record[key]) && record[key] === source[key]);
  }

  function gitReferencesMatch(record, source) {
    return ["gitStateEvidence", "mainOriginMainAlignmentEvidence"].every(key =>
      EVIDENCE_FIELDS[key].every(field => record[key][field] === source[key][field]));
  }
  function validateClosureInput(input){
    if(!jsonValue(input)||!plain(input))return deepFreeze(["plain_json_closure_input_required"]);
    return validateClosureFields(input);
  }
  function validateClosureFields(input){
    const reasons=[];
    for(const k of CONTENT_FIELDS){
      const v=input&&input[k];
      if(Object.prototype.hasOwnProperty.call(EVIDENCE_FIELDS,k)){if(!evidenceIntact(k,v))reasons.push(k+"_invalid")}
      else if(k==="noUnauthorizedOperationsConfirmed"){if(typeof v!=="boolean")reasons.push(k+"_boolean_required");}
      else if(!text(v))reasons.push(k+"_required");
    }
    for(const k of ARRAY_FIELDS)if(!input||!strings(input[k]))reasons.push(k+"_string_array_required");
    for(const k of REQUIRED_TRUE)if(!input||input[k]!==true)reasons.push(k+"_must_be_true");
    return deepFreeze(reasons);
  }
  const OUTCOME_FIELDS = deepFreeze({
    [RESULTS[0]]: [],
    [RESULTS[1]]: CONDITION_FIELDS,
    [RESULTS[2]]: ["rejectionReason", "rejectionImpact", "requiredActions", "responseOwner"],
    [RESULTS[3]]: ["incompleteReason", "incompleteImpact", "requiredActions", "missingItems", "responseOwner"],
    [RESULTS[4]]: ["blockedReason", "blockedImpact", "requiredActions", "unblockingConditions", "responseOwner"]
  });
  const OUTCOME_LIST_FIELDS = ["requiredActions", "missingItems", "unblockingConditions"];
  const SPECIFIC_FIELDS = [...new Set(Object.values(OUTCOME_FIELDS).flat())];

  function readyForNormalClosure(record) {
    return record.noUnauthorizedOperationsConfirmed && noIssues(record) && !record.errors.length &&
      gitReferencesMatch(record, record.phase3118SourceSnapshot) &&
      record.workingTreeEvidence.clean && record.workingTreeEvidence.status === "clean" &&
      record.mainOriginMainAlignmentEvidence.aligned && record.requiredTestResults.passed;
  }

  function validateCompletion(record, input) {
    if (!RESULTS.includes(input.result)) return ["explicit_manual_result_required"];
    const reasons = [];
    if (input.canProceedToNextStage !== false) reasons.push("terminal_stage_cannot_advance");
    for (const key of ["closureSummary", "closedBy", "closureReason", "reviewedBy"]) {
      if (!text(input[key])) reasons.push(key + "_required");
    }
    for (const key of ["closedAt", "reviewedAt"]) {
      if (!date(input[key])) reasons.push(key + "_invalid");
    }
    const snapshot = input.closureAfterSnapshot;
    if (!plain(snapshot) || !Object.keys(snapshot).length || !jsonValue(snapshot)) {
      reasons.push("closureAfterSnapshot_invalid");
    }
    const expected = OUTCOME_FIELDS[input.result];
    if (SPECIFIC_FIELDS.some(key => input[key] !== undefined && !expected.includes(key))) {
      reasons.push("inconsistent_result_metadata");
    }
    for (const key of expected) {
      const value = input[key];
      const valid = OUTCOME_LIST_FIELDS.includes(key) ? strings(value) && value.length > 0 : text(value);
      if (!valid) reasons.push(key + "_required");
    }
    if (input.result === RESULTS[0]) {
      if (input.explicitFinalApproval !== true) reasons.push("explicit_human_closure_required");
      if (!readyForNormalClosure(record)) reasons.push("issues_or_readiness_require_manual_resolution");
    } else if (input.explicitFinalApproval !== undefined) {
      reasons.push("inconsistent_closure_metadata");
    }
    for (const key of Object.keys(EVIDENCE_FIELDS)) {
      if (Date.parse(record[key].confirmedAt) > Date.parse(input.closedAt)) reasons.push(key + "_from_future");
    }
    if (input.result === RESULTS[1] &&
        (!date(input.conditionDeadline) || Date.parse(input.conditionDeadline) <= Date.parse(input.closedAt))) {
      reasons.push("condition_deadline_invalid");
    }
    return reasons;
  }

  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;r.schemaVersion=SCHEMA_VERSION;
    const body=clone(r);delete body.phase3118SourceSnapshot;
    r[OWN+"Snapshot"]=body;r[OWN+"SnapshotHash"]=computeSnapshotHash(body);return deepFreeze(r);
  }
  const TRANSITIONS=deepFreeze({[STATES[0]]:[STATES[1]],[STATES[1]]:[STATES[2]],[STATES[2]]:RESULTS.map(r=>RESULT_STATUS[r])});
  const ACTION = deepFreeze({
    create: "phase31_final_closure_creation",
    begin: "begin_phase31_final_closure",
    update: "update_phase31_final_closure",
    submit: "submit_phase31_final_closure",
    decide: "decide_phase31_final_closure",
    invalidate: "invalidation"
  });
  const AUDIT_FIELDS = ["action", "from", "to", "performedBy", "performedAt", "reason", "explicitConfirmation"];
  const AUDIT_RULES = deepFreeze({
    [ACTION.create]: [["", STATES[0]]],
    [ACTION.begin]: [[STATES[0], STATES[1]]],
    [ACTION.update]: [[STATES[1], STATES[1]]],
    [ACTION.submit]: [[STATES[1], STATES[2]]],
    [ACTION.decide]: RESULTS.map(result => [STATES[2], RESULT_STATUS[result]]),
    [ACTION.invalidate]: STATES.slice(0, -1).map(from => [from, STATES[8]])
  });

  function auditIntact(record) {
    const trail = record.auditTrail;
    if (!Array.isArray(trail) || trail.length === 0 || trail.length !== record.recordVersion) return false;
    return trail.every((entry, index) =>
      allowed(entry, AUDIT_FIELDS) && human(entry) &&
      Object.hasOwn(AUDIT_RULES, entry.action) &&
      AUDIT_RULES[entry.action].some(([from, to]) => entry.from === from && entry.to === to) &&
      entry.from === (index === 0 ? "" : trail[index - 1].to)
    ) && trail.at(-1).to === record[OWN + "Status"];
  }

  function integrityIntact(r,o){
    try{
      if(!jsonValue(r)||!allowed(r,INPUT_FIELDS.concat(PROTECTED_FIELDS,COMPLETION_FIELDS))||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||r.schemaVersion!==SCHEMA_VERSION||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateClosureFields(r).length)return false;
      if(r[OWN+"Id"]!==`phase31-final-closure-${r.createdAt}-${r[SOURCE+"Id"]}`||!sourceAligned(r,r.phase3118SourceSnapshot))return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"],finalClosure=r.auditTrail.find(e=>e.action===ACTION.decide);
      if(!STATES.includes(status)||result!==(finalClosure?RESULTS.find(value=>RESULT_STATUS[value]===finalClosure.to):""))return false;
      if(r.finalClosure!==result||(result===""?r.result!==undefined:r.result!==result))return false;
      if(result===""&&(r.canProceedToNextStage!==false||COMPLETION_FIELDS.filter(k=>k!=="canProceedToNextStage").some(k=>r[k]!==undefined)))return false;
      if(STATES.slice(0,3).includes(status)&&result!==""||STATES.slice(3,8).includes(status)&&RESULT_STATUS[result]!==status)return false;
      if(result!==""&&validateCompletion(r,{...r,canProceedToNextStage:false}).length)return false;
      if(result!==""&&(r.closedBy!==r.closureOperator||r.closedBy!==finalClosure.performedBy||r.reviewedBy!==r.reviewer||Date.parse(r.closedAt)!==Date.parse(finalClosure.performedAt)||Date.parse(r.reviewedAt)!==Date.parse(r.closedAt)))return false;
      if(r.auditTrail.some((e,i)=>Date.parse(e.performedAt)<Date.parse(i?r.auditTrail[i-1].performedAt:r.createdAt)||Date.parse(e.performedAt)>Date.parse(r.updatedAt))||Date.parse(r.auditTrail[0].performedAt)!==Date.parse(r.createdAt)||Date.parse(r.auditTrail.at(-1).performedAt)!==Date.parse(r.updatedAt))return false;
      if (r.canProceedToNextStage !== false || r.terminalStage !== TERMINAL_STAGE) return false;
      if (r.phase31Completed !== (status === STATES[3])) return false;
      if (r.phase31ClosedAt !== (result === RESULTS[0] ? r.closedAt : undefined)) return false;
      if(r.phase31Started!==true||r.manualPhase31StartCompleted!==true)return false;
      if(["expiresAt","expiredAt"].some(k=>r[k]!==undefined&&!date(r[k])))return false;
      if(r.expiredAt!==undefined)return false;
      const evaluatedAt=evaluationAt(o);
      if(r.expiresAt!==undefined&&(!date(evaluatedAt)||Date.parse(r.expiresAt)<=Date.parse(evaluatedAt)))return false;
      if(status===STATES[8]?!date(r.invalidatedAt):r.invalidatedAt!==undefined)return false;
      if(Date.parse(r.updatedAt)<Date.parse(r.createdAt))return false;
      if(date(evaluatedAt)&&Date.parse(r.updatedAt)>Date.parse(evaluatedAt))return false;
      if(r.previousStatus!==(r.auditTrail.length>1?r.auditTrail.at(-1).from:undefined))return false;
      if(status===STATES[8]&&r.invalidatedAt!==r.updatedAt)return false;
      const body=clone(r);delete body.phase3118SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase3118Eligibility(r.phase3118SourceSnapshot,evaluatedAt===null?undefined:{now:()=>evaluatedAt}).valid)return false;
      return Date.parse(r.createdAt)>=Date.parse(r.phase3118SourceSnapshot.updatedAt)&&["sourceRecordId","raceId"].every(k=>r[k]===undefined||text(r[k])&&r[k]===r.phase3118SourceSnapshot[k])&&REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase3118SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractPhase31FinalClosureCandidates(sources,existing,o){
    if(!jsonValue(sources)||!Array.isArray(sources)||!recordsValid(existing,o))return deepFreeze([]);
    const seen=new Set();return deepFreeze(sources.filter(s=>{if(!validatePhase3118Eligibility(s,o).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:new Date(h.performedAt).toISOString(),reason:h.reason,explicitConfirmation:true}}
  function operationContext(h,o){if(!human(h))return null;try{const at=evaluationAt(o)||new Date(h.performedAt).toISOString();if(Date.parse(at)!==Date.parse(h.performedAt))return null;return {at,options:{now:()=>at}}}catch(_){return null}}
  function createPhase31FinalClosureRecord(source,input,h,o,existing){
    const context=operationContext(h,o),reasons=[...validatePhase3118Eligibility(source,context&&context.options).reasons,...validateClosureInput(input)];
    if(!allowed(input,INPUT_FIELDS)||!jsonValue(input))reasons.push("unsupported_protected_or_non_json_field");
    if(!context)reasons.push("valid_human_operation_and_clock_required");
    if(!recordsValid(existing,context&&context.options))reasons.push("existing_records_required");else if(reasons.length===0&&source&&duplicate(source,existing))reasons.push("duplicate_phase31_final_closure");
    if(reasons.length)return deepFreeze({created:false,reasons});
    for(const k of ["sourceRecordId","raceId"])if(input&&input[k]!==undefined&&(!text(input[k])||!source||input[k]!==source[k]))reasons.push(k+"_mismatch");
    if(Date.parse(context.at)<Date.parse(source.updatedAt))reasons.push("source_record_from_future");if(!sourceAligned(input,source))reasons.push("rollback_or_recovery_point_mismatch");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=context.at,r={...clone(input),...SAFETY,safetyBoundary:clone(SAFETY_BOUNDARY),phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-final-closure-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase31Started:true,manualPhase31StartCompleted:true,terminalStage:TERMINAL_STAGE,phase31Completed:false,canProceedToNextStage:false,finalClosure:"",phase3118SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event(ACTION.create,"",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  function failure(flag, record, reasons) {
    return deepFreeze({[flag]:false, record:jsonValue(record) ? clone(record) : null, reasons});
  }

  function validOperation(record, context, from) {
    return context && integrityIntact(record, context.options) &&
      !inactive(record, context.at) && (from === undefined || record[OWN + "Status"] === from);
  }

  function advance(record, operation, context, action, status, changes = {}) {
    const from = record[OWN + "Status"];
    return stamp({
      ...clone(record),
      ...clone(changes),
      [OWN + "Status"]: status,
      phase31Completed: status === STATES[3],
      canProceedToNextStage: false,
      previousStatus: from,
      updatedAt: context.at,
      recordVersion: record.recordVersion + 1,
      auditTrail: record.auditTrail.concat(event(action, from, status, operation))
    });
  }

  function transition(record, from, to, action, operation, options) {
    const context = operationContext(operation, options);
    if (!validOperation(record, context, from)) {
      return failure("transitioned", record, ["valid_active_manual_record_required"]);
    }
    return deepFreeze({transitioned:true, record:advance(record, operation, context, action, to), reasons:[]});
  }

  const beginPhase31FinalClosure = (r,h,o) => transition(r,STATES[0],STATES[1],ACTION.begin,h,o);
  const submitPhase31FinalClosureReview = (r,h,o) => transition(r,STATES[1],STATES[2],ACTION.submit,h,o);

  function updatePhase31FinalClosure(record, changes, operation, options) {
    const context = operationContext(operation, options);
    if (!allowed(changes, CONTENT_FIELDS.concat(ARRAY_FIELDS)) || !jsonValue(changes) ||
        !validOperation(record, context, STATES[1])) {
      return failure("updated", record, ["valid_manual_update_required"]);
    }
    const updated = {...record, ...changes};
    if (validateClosureFields(updated).length || !sourceAligned(updated, record.phase3118SourceSnapshot)) {
      return failure("updated", record, ["valid_manual_update_required"]);
    }
    return deepFreeze({
      updated:true,
      record:advance(record, operation, context, ACTION.update, STATES[1], changes),
      reasons:[]
    });
  }

  function decidePhase31FinalClosure(record, input, operation, options) {
    const context = operationContext(operation, options);
    if (!allowed(input, COMPLETION_FIELDS) || !jsonValue(input) || !validOperation(record, context, STATES[2])) {
      return failure("decided", record, ["valid_manual_completion_required"]);
    }
    const reasons = validateCompletion(record, input);
    if (input.closedBy !== operation.performedBy || input.closedBy !== record.closureOperator ||
        input.reviewedBy !== record.reviewer || Date.parse(input.closedAt) !== Date.parse(context.at) ||
        Date.parse(input.reviewedAt) !== Date.parse(context.at)) {
      reasons.push("closure_identity_or_time_mismatch");
    }
    if (reasons.length) return failure("decided", record, reasons);
    const changes = {...input, finalClosure:input.result, [OWN + "Result"]:input.result};
    if (input.result === RESULTS[0]) changes.phase31ClosedAt = input.closedAt;
    return deepFreeze({
      decided:true,
      record:advance(record, operation, context, ACTION.decide, RESULT_STATUS[input.result], changes),
      reasons:[]
    });
  }

  function invalidatePhase31FinalClosure(record, operation, options) {
    const context = operationContext(operation, options);
    if (!validOperation(record, context)) {
      return failure("transitioned", record, ["valid_active_manual_record_required"]);
    }
    return deepFreeze({
      transitioned:true,
      record:advance(record, operation, context, ACTION.invalidate, STATES[8], {invalidatedAt:context.at}),
      reasons:[]
    });
  }

  function recordsValid(records,o){return jsonValue(records)&&Array.isArray(records)&&Array.from(records).every(r=>integrityIntact(r,o))&&new Set(records.map(r=>r[SOURCE+"Id"])).size===records.length&&new Set(records.map(r=>r[OWN+"Id"])).size===records.length}
  function readRecords(raw, options) {
    if (typeof raw !== "string") throw Error("invalid_storage_value");
    const data = JSON.parse(raw);
    if (!allowed(data, ["schemaVersion", "records"]) ||
        data.schemaVersion !== SCHEMA_VERSION || !recordsValid(data.records, options)) {
      throw Error("invalid_closure_store");
    }
    return data.records;
  }

  // A persisted revision can only be replaced by the exact result of its next legal operation.
  function isSuccessor(previous, next) {
    if (stable(previous) === stable(next)) return true;
    if (next.recordVersion !== previous.recordVersion + 1 ||
        stable(next.auditTrail.slice(0, -1)) !== stable(previous.auditTrail)) return false;
    const operation = next.auditTrail.at(-1);
    const pick = keys => Object.fromEntries(keys.filter(k => Object.hasOwn(next, k)).map(k => [k, next[k]]));
    let result;
    switch (operation.action) {
      case ACTION.begin:
        result = beginPhase31FinalClosure(previous, operation);
        break;
      case ACTION.update:
        result = updatePhase31FinalClosure(previous, pick(CONTENT_FIELDS.concat(ARRAY_FIELDS)), operation);
        break;
      case ACTION.submit:
        result = submitPhase31FinalClosureReview(previous, operation);
        break;
      case ACTION.decide:
        result = decidePhase31FinalClosure(previous, pick(COMPLETION_FIELDS), operation);
        break;
      case ACTION.invalidate:
        result = invalidatePhase31FinalClosure(previous, operation);
        break;
      default:
        return false;
    }
    return stable(result.record) === stable(next);
  }

  function savePhase31FinalClosureRecords(storage, records, options) {
    try {
      const at = evaluationAt(options);
      const clock = at === null ? undefined : {now: () => at};
      if (!recordsValid(records, clock)) return deepFreeze({saved:false});
      const serialized = JSON.stringify({schemaVersion:SCHEMA_VERSION, records});
      const candidate = JSON.parse(serialized).records;
      const raw = storage.getItem(STORAGE_KEY);
      const previous = raw === null ? [] : readRecords(raw, clock);
      const byId = new Map(candidate.map(record => [record[OWN + "Id"], record]));
      if (!previous.every(record => {
        const next = byId.get(record[OWN + "Id"]);
        return next && isSuccessor(record, next);
      })) return deepFreeze({saved:false});
      // Detect changes to the stored collection during validation.
      if (storage.getItem(STORAGE_KEY) !== raw) return deepFreeze({saved:false});
      if (serialized !== raw) storage.setItem(STORAGE_KEY, serialized);
      return deepFreeze({saved:storage.getItem(STORAGE_KEY) === serialized});
    } catch (_) {
      return deepFreeze({saved:false});
    }
  }

  function loadPhase31FinalClosureRecords(storage, options) {
    try {
      const at = evaluationAt(options);
      const clock = at === null ? undefined : {now: () => at};
      return deepFreeze({loaded:true, records:readRecords(storage.getItem(STORAGE_KEY), clock)});
    } catch (_) {
      return deepFreeze({loaded:false, records:[]});
    }
  }
  function getPhase31FinalClosureResult(record, options) {
    if (!integrityIntact(record, options)) return null;
    return deepFreeze({
      id: record[OWN + "Id"],
      status: record[OWN + "Status"],
      result: record[OWN + "Result"],
      phase31Completed: record.phase31Completed,
      closedAt: record.phase31ClosedAt ?? null,
      canProceedToNextStage: false,
      nextStage: NEXT_STAGE
    });
  }
  return deepFreeze({PHASE3118_REFERENCE:p3118,getPhase31FinalClosureResult,STORAGE_KEY,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,TERMINAL_STAGE,STATES,RESULTS,RESULT_STATUS,CLOSURE_FIELDS,ARRAY_FIELDS,CONTENT_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,CONDITION_FIELDS,PROTECTED_FIELDS,TRANSITIONS,SAFETY,SAFETY_BOUNDARY,EVIDENCE_FIELDS,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase3118Eligibility,extractPhase31FinalClosureCandidates,validateClosureInput,startPhase31FinalClosure:beginPhase31FinalClosure,createPhase31FinalClosureRecord,beginPhase31FinalClosure,updatePhase31FinalClosure,submitPhase31FinalClosureReview,decidePhase31FinalClosure,invalidatePhase31FinalClosure,savePhase31FinalClosureRecords,loadPhase31FinalClosureRecords});
});
