(function(root,factory){
  const dependency=typeof module==="object"&&module.exports?require("./phase31-17-phase31-post-start-stabilization-closure-post-execution-verification-decision-core.js"):root.HashimotoPhase3117PostStartStabilizationClosurePostExecutionVerificationDecision;
  const api=factory(dependency);if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase3118PostStartStabilizationClosureAcceptance=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(p3117){
  "use strict";if(!p3117)throw new Error("Phase31-17 post-start stabilization closure post-execution verification definition is required");
  const STORAGE_KEY="hashimoto.phase31.18.postStartStabilizationClosureAcceptanceRecords",SCHEMA_VERSION="31.18.1",CURRENT_STAGE="phase31_post_start_stabilization_closure_acceptance",NEXT_STAGE="manual_phase31_final_closure";
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
  const STATES=deepFreeze([
    "awaiting_manual_phase31_post_start_stabilization_closure_acceptance",
    "manual_phase31_post_start_stabilization_closure_acceptance_in_progress",
    "awaiting_manual_phase31_post_start_stabilization_closure_acceptance_review",
    "phase31_post_start_stabilization_closure_accepted",
    "phase31_post_start_stabilization_closure_conditionally_accepted",
    "phase31_post_start_stabilization_closure_rejected",
    "phase31_post_start_stabilization_closure_acceptance_incomplete",
    "phase31_post_start_stabilization_closure_acceptance_blocked",
    "ready_for_manual_phase31_final_closure",
    "invalidated"
  ]);
  const RESULTS=deepFreeze([
    "accept_phase31_post_start_stabilization_closure",
    "conditionally_accept_phase31_post_start_stabilization_closure",
    "reject_phase31_post_start_stabilization_closure",
    "phase31_post_start_stabilization_closure_acceptance_incomplete",
    "phase31_post_start_stabilization_closure_acceptance_blocked"
  ]),RESULT_STATUS=deepFreeze(Object.fromEntries(RESULTS.map((r,i)=>[r,STATES[i+3]])));
  const ACCEPTANCE_FIELDS=deepFreeze([
    "acceptanceTarget",
    "acceptanceScope",
    "acceptanceOperator",
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
    "acceptanceBoundaryConfirmation",
    "acceptanceBasis",
    "acceptanceNotes"
  ]),ARRAY_FIELDS=deepFreeze(["errors","warnings","unresolvedIssues","criticalIssues","blockingConditions"]),ISSUE_FIELDS=deepFreeze(["unresolvedIssues","criticalIssues","blockingConditions"]),REQUIRED_TRUE=deepFreeze(["privateLocalOnly","planOnly","protectedMode","verificationResultConfirmed","verificationEvidenceConfirmed","runtimeStateConfirmed","requiredTestResultsConfirmedByHuman","safetyBoundaryConfirmed","prohibitedActionsConfirmed","gitStateConfirmedByHuman","workingTreeConfirmedByHuman","mainOriginMainAlignmentConfirmedByHuman","rollbackPointConfirmed","recoveryPointConfirmed","acceptanceBoundaryConfirmed"]);
  const SAFETY=deepFreeze({...p3117.SAFETY, manualAcceptanceRecordOnly:true, acceptanceMode:"LOCAL_MANAGEMENT_RECORD_ONLY", automaticClosureAcceptanceReviewPerformed:false, automaticClosureAcceptanceCompletionPerformed:false, automaticClosureAcceptanceHandoffPerformed:false, phase31FinalClosureAutomaticallyStarted:false});
  const SOURCE="phase31PostStartStabilizationClosurePostExecutionVerificationDecision", OWN="phase31PostStartStabilizationClosureAcceptance";
  const REFERENCE_IDS=deepFreeze([SOURCE+"Id",...p3117.REFERENCE_IDS]);
  const UPSTREAM_FIELDS=deepFreeze([SOURCE+"SnapshotHash",SOURCE+"Version",...p3117.UPSTREAM_FIELDS]);
  const stable=v=>v&&typeof v==="object"&&!Array.isArray(v)?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:Array.isArray(v)?`[${v.map(stable).join(",")}]`:JSON.stringify(v);
  const computeSnapshotHash=p3117.computeSnapshotHash;
  const text=v=>typeof v==="string"&&v.trim().length>0;
  const strings=v=>Array.isArray(v)&&Array.from(v).every(text);
  const plain=v=>{try{return plainObject(v)}catch(_){return false}};
  const plainObject=v=>{if(!v||typeof v!=="object"||Array.isArray(v))return false;const p=Object.getPrototypeOf(v);if(p===null)return true;if(Object.getPrototypeOf(p)!==null)return false;const c=Object.getOwnPropertyDescriptor(p,"constructor");return !!c&&typeof c.value==="function"&&Object.getOwnPropertyDescriptor(c.value,"prototype")?.value===p&&Object.getOwnPropertyDescriptor(c.value,"name")?.value==="Object"&&/^function\s+Object\s*\(\s*\)\s*\{\s*\[native code\]\s*\}$/.test(Function.prototype.toString.call(c.value))};
  const allowed=(v,keys)=>{try{return plain(v)&&Object.keys(v).every(k=>keys.includes(k))}catch(_){return false}};
  const noIssues=r=>ISSUE_FIELDS.every(k=>strings(r[k])&&r[k].length===0);
  const SAFETY_BOUNDARY=p3117.SAFETY_BOUNDARY;
  const CONTENT_FIELDS=deepFreeze([...ACCEPTANCE_FIELDS,"requiredTestResults","noUnauthorizedOperationsConfirmed"]);
  const CONDITION_FIELDS=deepFreeze(["conditions","conditionReason","conditionOwner","conditionDeadline","conditionVerificationMethod","conditionReleaseCriteria"]);
  const COMPLETION_FIELDS=deepFreeze([
    "result",
    "explicitAcceptance",
    "canProceedToNextStage",
    "acceptanceSummary",
    "acceptedBy",
    "acceptedAt",
    "acceptanceReason",
    "reviewedBy",
    "reviewedAt",
    "acceptanceAfterSnapshot",
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
    "phase3117SourceSnapshot",
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
    "phase31Started",
    "manualPhase31StartCompleted",
    "canProceedToNextStage",
    "stabilizationClosureAcceptance",
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
  function validatePhase3117Eligibility(s,o){
    const reasons=[];
    try{
      if(!plain(s)||!jsonValue(s))return deepFreeze({valid:false,reasons:["source_plain_record_required"]});
      if(p3117.CURRENT_STAGE!=="phase31_post_start_stabilization_closure_post_execution_verification_decision"||p3117.NEXT_STAGE!==CURRENT_STAGE.replace(/^phase31/,"manual_phase31"))reasons.push("source_contract_invalid");
      if(s.phase!=="phase31"||s.stage!==p3117.CURRENT_STAGE||s.nextStage!==p3117.NEXT_STAGE)reasons.push("source_stage_invalid");
      if(s[SOURCE+"Status"]!=="ready_for_manual_phase31_post_start_stabilization_closure_acceptance")reasons.push("source_status_invalid");
      if(s[SOURCE+"Result"]!=="approve_phase31_post_start_stabilization_closure_post_execution_verification")reasons.push("source_result_invalid");
      if(s.canProceedToNextStage!==true||s.auditTrail?.at?.(-1)?.action!=="manual_handoff_to_phase31_post_start_stabilization_closure_acceptance")reasons.push("source_manual_handoff_required");
      if(s.phase31Started!==true||s.manualPhase31StartCompleted!==true)reasons.push("manual_start_not_completed");
      const at=evaluationAt(o);if(inactive(s,at))reasons.push("source_inactive_or_expiry_context_required");if(date(at)&&Date.parse(s.updatedAt)>Date.parse(at))reasons.push("source_record_from_future");
      if(!p3117.safetyIntact(s))reasons.push("source_safety_invalid");
      if(s.schemaVersion!==p3117.SCHEMA_VERSION||s[SOURCE+"Version"]!==p3117.SCHEMA_VERSION)reasons.push("source_version_invalid");
      for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))if(!text(s[k]))reasons.push(k+"_required");
      if(!strings(s.errors)||s.errors.length||!noIssues(s))reasons.push("source_issues_present_or_invalid");
      if(reasons.length)return deepFreeze({valid:false,reasons});
      // The dependency recursively verifies the entire execution/approval chain.
      if(!p3117.integrityIntact(s,at===null?undefined:{now:()=>at}))reasons.push("source_integrity_audit_or_reference_chain_invalid");
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
  function validateAcceptanceInput(input){
    if(!jsonValue(input)||!plain(input))return deepFreeze(["plain_json_acceptance_input_required"]);
    return validateAcceptanceFields(input);
  }
  function validateAcceptanceFields(input){
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

  function readyForNormalAcceptance(record) {
    return record.noUnauthorizedOperationsConfirmed && noIssues(record) && !record.errors.length &&
      gitReferencesMatch(record, record.phase3117SourceSnapshot) &&
      record.workingTreeEvidence.clean && record.workingTreeEvidence.status === "clean" &&
      record.mainOriginMainAlignmentEvidence.aligned && record.requiredTestResults.passed;
  }

  function validateCompletion(record, input) {
    if (!RESULTS.includes(input.result)) return ["explicit_manual_result_required"];
    const reasons = [];
    if (input.canProceedToNextStage !== false) reasons.push("manual_handoff_required_before_advancing");
    for (const key of ["acceptanceSummary", "acceptedBy", "acceptanceReason", "reviewedBy"]) {
      if (!text(input[key])) reasons.push(key + "_required");
    }
    for (const key of ["acceptedAt", "reviewedAt"]) {
      if (!date(input[key])) reasons.push(key + "_invalid");
    }
    const snapshot = input.acceptanceAfterSnapshot;
    if (!plain(snapshot) || !Object.keys(snapshot).length || !jsonValue(snapshot)) {
      reasons.push("acceptanceAfterSnapshot_invalid");
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
      if (input.explicitAcceptance !== true) reasons.push("explicit_human_acceptance_required");
      if (!readyForNormalAcceptance(record)) reasons.push("issues_or_readiness_require_manual_resolution");
    } else if (input.explicitAcceptance !== undefined) {
      reasons.push("inconsistent_acceptance_metadata");
    }
    for (const key of Object.keys(EVIDENCE_FIELDS)) {
      if (Date.parse(record[key].confirmedAt) > Date.parse(input.acceptedAt)) reasons.push(key + "_from_future");
    }
    if (input.result === RESULTS[1] &&
        (!date(input.conditionDeadline) || Date.parse(input.conditionDeadline) <= Date.parse(input.acceptedAt))) {
      reasons.push("condition_deadline_invalid");
    }
    return reasons;
  }

  function stamp(record){
    const r=clone(record);delete r[OWN+"Snapshot"];delete r[OWN+"SnapshotHash"];
    r[OWN+"Version"]=SCHEMA_VERSION;r.schemaVersion=SCHEMA_VERSION;
    const body=clone(r);delete body.phase3117SourceSnapshot;
    r[OWN+"Snapshot"]=body;r[OWN+"SnapshotHash"]=computeSnapshotHash(body);return deepFreeze(r);
  }
  const TRANSITIONS=deepFreeze({[STATES[0]]:[STATES[1]],[STATES[1]]:[STATES[2]],[STATES[2]]:RESULTS.map(r=>RESULT_STATUS[r]),[STATES[3]]:[STATES[8]]});
  const ACTION = deepFreeze({
    create: "phase31_post_start_stabilization_closure_acceptance_creation",
    begin: "begin_phase31_post_start_stabilization_closure_acceptance",
    update: "update_phase31_post_start_stabilization_closure_acceptance",
    submit: "submit_phase31_post_start_stabilization_closure_acceptance",
    decide: "decide_phase31_post_start_stabilization_closure_acceptance",
    handoff: "manual_handoff_to_phase31_final_closure",
    invalidate: "invalidation"
  });
  const AUDIT_FIELDS = ["action", "from", "to", "performedBy", "performedAt", "reason", "explicitConfirmation"];
  const AUDIT_RULES = deepFreeze({
    [ACTION.create]: [["", STATES[0]]],
    [ACTION.begin]: [[STATES[0], STATES[1]]],
    [ACTION.update]: [[STATES[1], STATES[1]]],
    [ACTION.submit]: [[STATES[1], STATES[2]]],
    [ACTION.decide]: RESULTS.map(result => [STATES[2], RESULT_STATUS[result]]),
    [ACTION.handoff]: [[STATES[3], STATES[8]]],
    [ACTION.invalidate]: STATES.slice(0, -1).map(from => [from, STATES[9]])
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
      if(!jsonValue(r)||!allowed(r,INPUT_FIELDS.concat(PROTECTED_FIELDS,COMPLETION_FIELDS))||!safetyIntact(r)||r.phase!=="phase31"||r.stage!==CURRENT_STAGE||r.nextStage!==NEXT_STAGE||r[OWN+"Version"]!==SCHEMA_VERSION||r.schemaVersion!==SCHEMA_VERSION||!date(r.createdAt)||!date(r.updatedAt)||!auditIntact(r)||validateAcceptanceFields(r).length)return false;
      if(r[OWN+"Id"]!==`phase31-stabilization-closure-acceptance-${r.createdAt}-${r[SOURCE+"Id"]}`||!sourceAligned(r,r.phase3117SourceSnapshot))return false;
      const status=r[OWN+"Status"],result=r[OWN+"Result"],stabilizationClosureAcceptance=r.auditTrail.find(e=>e.action===ACTION.decide);
      if(!STATES.includes(status)||result!==(stabilizationClosureAcceptance?RESULTS.find(value=>RESULT_STATUS[value]===stabilizationClosureAcceptance.to):""))return false;
      if(r.stabilizationClosureAcceptance!==result||(result===""?r.result!==undefined:r.result!==result))return false;
      if(result===""&&(r.canProceedToNextStage!==false||COMPLETION_FIELDS.filter(k=>k!=="canProceedToNextStage").some(k=>r[k]!==undefined)))return false;
      if(STATES.slice(0,3).includes(status)&&result!==""||STATES.slice(3,8).includes(status)&&RESULT_STATUS[result]!==status)return false;
      if(result!==""&&validateCompletion(r,{...r,canProceedToNextStage:false}).length)return false;
      if(result!==""&&(r.acceptedBy!==r.acceptanceOperator||r.acceptedBy!==stabilizationClosureAcceptance.performedBy||r.reviewedBy!==r.reviewer||Date.parse(r.acceptedAt)!==Date.parse(stabilizationClosureAcceptance.performedAt)||Date.parse(r.reviewedAt)!==Date.parse(r.acceptedAt)))return false;
      if(r.auditTrail.some((e,i)=>Date.parse(e.performedAt)<Date.parse(i?r.auditTrail[i-1].performedAt:r.createdAt)||Date.parse(e.performedAt)>Date.parse(r.updatedAt))||Date.parse(r.auditTrail[0].performedAt)!==Date.parse(r.createdAt)||Date.parse(r.auditTrail.at(-1).performedAt)!==Date.parse(r.updatedAt))return false;
      const handedOff=r.auditTrail.some(e=>e.action===ACTION.handoff);
      if(r.canProceedToNextStage!==(status===STATES[8]&&handedOff))return false;
      if(status===STATES[8]&&(!handedOff||result!==RESULTS[0]))return false;
      if(r.phase31Started!==true||r.manualPhase31StartCompleted!==true)return false;
      if(["expiresAt","expiredAt"].some(k=>r[k]!==undefined&&!date(r[k])))return false;
      if(r.expiredAt!==undefined)return false;
      const evaluatedAt=evaluationAt(o);
      if(r.expiresAt!==undefined&&(!date(evaluatedAt)||Date.parse(r.expiresAt)<=Date.parse(evaluatedAt)))return false;
      if(status===STATES[9]?!date(r.invalidatedAt):r.invalidatedAt!==undefined)return false;
      if(Date.parse(r.updatedAt)<Date.parse(r.createdAt))return false;
      if(date(evaluatedAt)&&Date.parse(r.updatedAt)>Date.parse(evaluatedAt))return false;
      if(r.previousStatus!==(r.auditTrail.length>1?r.auditTrail.at(-1).from:undefined))return false;
      if(status===STATES[9]&&r.invalidatedAt!==r.updatedAt)return false;
      const body=clone(r);delete body.phase3117SourceSnapshot;delete body[OWN+"Snapshot"];delete body[OWN+"SnapshotHash"];
      if(stable(body)!==stable(r[OWN+"Snapshot"])||computeSnapshotHash(body)!==r[OWN+"SnapshotHash"])return false;
      if(!validatePhase3117Eligibility(r.phase3117SourceSnapshot,evaluatedAt===null?undefined:{now:()=>evaluatedAt}).valid)return false;
      return Date.parse(r.createdAt)>=Date.parse(r.phase3117SourceSnapshot.updatedAt)&&["sourceRecordId","raceId"].every(k=>r[k]===undefined||text(r[k])&&r[k]===r.phase3117SourceSnapshot[k])&&REFERENCE_IDS.concat(UPSTREAM_FIELDS).every(k=>r[k]===r.phase3117SourceSnapshot[k]);
    }catch(_){return false}
  }
  const duplicate=(s,records)=>records.some(r=>r&&r[SOURCE+"Id"]===s[SOURCE+"Id"]);
  function extractStabilizationClosureAcceptanceCandidates(sources,existing,o){
    if(!jsonValue(sources)||!Array.isArray(sources)||!recordsValid(existing,o))return deepFreeze([]);
    const seen=new Set();return deepFreeze(sources.filter(s=>{if(!validatePhase3117Eligibility(s,o).valid||duplicate(s,existing)||seen.has(s[SOURCE+"Id"]))return false;seen.add(s[SOURCE+"Id"]);return true}).map(clone));
  }
  function event(action,from,to,h){return {action,from,to,performedBy:h.performedBy,performedAt:new Date(h.performedAt).toISOString(),reason:h.reason,explicitConfirmation:true}}
  function operationContext(h,o){if(!human(h))return null;try{const at=evaluationAt(o)||new Date(h.performedAt).toISOString();if(Date.parse(at)!==Date.parse(h.performedAt))return null;return {at,options:{now:()=>at}}}catch(_){return null}}
  function createStabilizationClosureAcceptanceRecord(source,input,h,o,existing){
    const context=operationContext(h,o),reasons=[...validatePhase3117Eligibility(source,context&&context.options).reasons,...validateAcceptanceInput(input)];
    if(!allowed(input,INPUT_FIELDS)||!jsonValue(input))reasons.push("unsupported_protected_or_non_json_field");
    if(!context)reasons.push("valid_human_operation_and_clock_required");
    if(!recordsValid(existing,context&&context.options))reasons.push("existing_records_required");else if(reasons.length===0&&source&&duplicate(source,existing))reasons.push("duplicate_phase31_post_start_stabilization_closure_acceptance");
    if(reasons.length)return deepFreeze({created:false,reasons});
    for(const k of ["sourceRecordId","raceId"])if(input&&input[k]!==undefined&&(!text(input[k])||!source||input[k]!==source[k]))reasons.push(k+"_mismatch");
    if(Date.parse(context.at)<Date.parse(source.updatedAt))reasons.push("source_record_from_future");if(!sourceAligned(input,source))reasons.push("rollback_or_recovery_point_mismatch");
    if(reasons.length)return deepFreeze({created:false,reasons});
    const at=context.at,r={...clone(input),...SAFETY,safetyBoundary:clone(SAFETY_BOUNDARY),phase:"phase31",stage:CURRENT_STAGE,nextStage:NEXT_STAGE,[OWN+"Id"]:`phase31-stabilization-closure-acceptance-${at}-${source[SOURCE+"Id"]}`,[OWN+"Status"]:STATES[0],[OWN+"Result"]:"",phase31Started:true,manualPhase31StartCompleted:true,canProceedToNextStage:false,stabilizationClosureAcceptance:"",phase3117SourceSnapshot:clone(source),createdAt:at,updatedAt:at,recordVersion:1,auditTrail:[event(ACTION.create,"",STATES[0],h)]};
    for(const k of REFERENCE_IDS.concat(UPSTREAM_FIELDS))r[k]=source[k];return deepFreeze({created:true,record:stamp(r),reasons:[]});
  }
  const failure=(key,r,reasons)=>deepFreeze({[key]:false,record:jsonValue(r)?clone(r):null,reasons});
  function transition(r,from,to,action,h,o,handoff=false){
    const c=operationContext(h,o);if(!c||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt)||r[OWN+"Status"]!==from)return failure("transitioned",r,["valid_active_manual_record_required"]);
    const n={...clone(r),canProceedToNextStage:handoff,[OWN+"Status"]:to,previousStatus:from,updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(action,from,to,h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  const beginStabilizationClosureAcceptance=(r,h,o)=>transition(r,STATES[0],STATES[1],ACTION.begin,h,o);
  const submitStabilizationClosureAcceptanceReview=(r,h,o)=>transition(r,STATES[1],STATES[2],ACTION.submit,h,o);
  function updateStabilizationClosureAcceptance(r,changes,h,o){
    const c=operationContext(h,o);if(!c||!allowed(changes,CONTENT_FIELDS.concat(ARRAY_FIELDS))||!jsonValue(changes)||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt)||r[OWN+"Status"]!==STATES[1]||validateAcceptanceFields({...r,...changes}).length||!sourceAligned({...r,...changes},r.phase3117SourceSnapshot))return failure("updated",r,["valid_manual_update_required"]);
    const n={...clone(r),...clone(changes),previousStatus:STATES[1],updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(ACTION.update,STATES[1],STATES[1],h))};return deepFreeze({updated:true,record:stamp(n),reasons:[]});
  }
  function decideStabilizationClosureAcceptance(r,input,h,o){
    const c=operationContext(h,o);if(!c||!allowed(input,COMPLETION_FIELDS)||!jsonValue(input)||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt)||r[OWN+"Status"]!==STATES[2])return failure("decided",r,["valid_manual_completion_required"]);
    const reasons=validateCompletion(r,input);if(input.acceptedBy!==h.performedBy||input.acceptedBy!==r.acceptanceOperator||input.reviewedBy!==r.reviewer||Date.parse(input.acceptedAt)!==Date.parse(c.at)||Date.parse(input.reviewedAt)!==Date.parse(c.at))reasons.push("acceptance_identity_or_time_mismatch");if(reasons.length)return failure("decided",r,reasons);
    const nextStatus=RESULT_STATUS[input.result],n={...clone(r),...clone(input),stabilizationClosureAcceptance:input.result,[OWN+"Status"]:nextStatus,[OWN+"Result"]:input.result,previousStatus:STATES[2],updatedAt:c.at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(ACTION.decide,STATES[2],nextStatus,h))};
    // Record only the explicit human result and next-stage choice. No approval, correction, rollback or next-stage operation is executed.
    return deepFreeze({decided:true,record:stamp(n),reasons:[]});
  }
  // A separate explicit human action records handoff; it records eligibility for Phase31 Final Closure.
  function handoffToPhase31FinalClosure(r,h,o){
    const moved=transition(r,STATES[3],STATES[8],ACTION.handoff,h,o,true);
    return deepFreeze({handedOff:moved.transitioned,record:moved.record,reasons:moved.reasons});
  }
  function invalidateStabilizationClosureAcceptance(r,h,o){
    const c=operationContext(h,o);if(!c||!integrityIntact(r,c.options)||inactive(r,c.at)||Date.parse(c.at)<Date.parse(r.updatedAt))return failure("transitioned",r,["valid_active_manual_record_required"]);
    const at=c.at,n={...clone(r),[OWN+"Status"]:STATES[9],canProceedToNextStage:false,previousStatus:r[OWN+"Status"],invalidatedAt:at,updatedAt:at,recordVersion:r.recordVersion+1,auditTrail:r.auditTrail.concat(event(ACTION.invalidate,r[OWN+"Status"],STATES[9],h))};return deepFreeze({transitioned:true,record:stamp(n),reasons:[]});
  }
  function recordsValid(records,o){return jsonValue(records)&&Array.isArray(records)&&Array.from(records).every(r=>integrityIntact(r,o))&&new Set(records.map(r=>r[SOURCE+"Id"])).size===records.length&&new Set(records.map(r=>r[OWN+"Id"])).size===records.length}
  function readRecords(raw, options) {
    if (typeof raw !== "string") throw Error("invalid_storage_value");
    const data = JSON.parse(raw);
    if (!allowed(data, ["schemaVersion", "records"]) ||
        data.schemaVersion !== SCHEMA_VERSION || !recordsValid(data.records, options)) {
      throw Error("invalid_acceptance_store");
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
        result = beginStabilizationClosureAcceptance(previous, operation);
        break;
      case ACTION.update:
        result = updateStabilizationClosureAcceptance(previous, pick(CONTENT_FIELDS.concat(ARRAY_FIELDS)), operation);
        break;
      case ACTION.submit:
        result = submitStabilizationClosureAcceptanceReview(previous, operation);
        break;
      case ACTION.decide:
        result = decideStabilizationClosureAcceptance(previous, pick(COMPLETION_FIELDS), operation);
        break;
      case ACTION.handoff:
        result = handoffToPhase31FinalClosure(previous, operation);
        break;
      case ACTION.invalidate:
        result = invalidateStabilizationClosureAcceptance(previous, operation);
        break;
      default:
        return false;
    }
    return stable(result.record) === stable(next);
  }

  function saveStabilizationClosureAcceptanceRecords(storage, records, options) {
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

  function loadStabilizationClosureAcceptanceRecords(storage, options) {
    try {
      const at = evaluationAt(options);
      const clock = at === null ? undefined : {now: () => at};
      return deepFreeze({loaded:true, records:readRecords(storage.getItem(STORAGE_KEY), clock)});
    } catch (_) {
      return deepFreeze({loaded:false, records:[]});
    }
  }
  return deepFreeze({PHASE3117_REFERENCE:p3117,STORAGE_KEY,SCHEMA_VERSION,CURRENT_STAGE,NEXT_STAGE,STATES,RESULTS,RESULT_STATUS,ACCEPTANCE_FIELDS,ARRAY_FIELDS,CONTENT_FIELDS,ISSUE_FIELDS,REQUIRED_TRUE,CONDITION_FIELDS,PROTECTED_FIELDS,TRANSITIONS,SAFETY,SAFETY_BOUNDARY,EVIDENCE_FIELDS,REFERENCE_IDS,UPSTREAM_FIELDS,computeSnapshotHash,safetyIntact,integrityIntact,validatePhase3117Eligibility,extractStabilizationClosureAcceptanceCandidates,validateAcceptanceInput,startStabilizationClosureAcceptance:beginStabilizationClosureAcceptance,createStabilizationClosureAcceptanceRecord,beginStabilizationClosureAcceptance,updateStabilizationClosureAcceptance,submitStabilizationClosureAcceptanceReview,decideStabilizationClosureAcceptance,handoffToPhase31FinalClosure,invalidateStabilizationClosureAcceptance,saveStabilizationClosureAcceptanceRecords,loadStabilizationClosureAcceptanceRecords});
});
