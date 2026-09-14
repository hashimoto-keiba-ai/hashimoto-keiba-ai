"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm");
const real=require("../phase30-16-phase30-post-start-stabilization-closure-post-execution-verification-core.js"),p3015=real.PHASE3015_REFERENCE;
const NOW="2027-01-05T00:00:00Z",options={now:()=>new Date(NOW)},human={performedBy:"reviewer",reason:"manual record verification",explicitConfirmation:true,performedAt:NOW};
const sourceName="phase30PostStartStabilizationClosureExecution",ownName="phase30PostStartStabilizationClosurePostExecutionVerification";
const code=fs.readFileSync(require.resolve("../phase30-16-phase30-post-start-stabilization-closure-post-execution-verification-core.js"),"utf8"),copy=v=>JSON.parse(JSON.stringify(v));
let externalCalls=0;const forbidden=()=>{externalCalls++;throw new Error("external operation forbidden")};
// Isolate only the upstream validator in unit cases; use the real Phase30-15 schema, input and integrity checks.
const dependency={...p3015,validatePhase3014Eligibility:s=>({valid:!!(s&&s.chainValid),reasons:[]})};
function load(dep=dependency){const box={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-15-phase30-post-start-stabilization-closure-execution-core.js");return dep},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden}};vm.runInNewContext(code,box);return box.module.exports}
const core=load();
function stamp(r,name=sourceName){const b={...r};delete b[name+"Snapshot"];delete b[name+"SnapshotHash"];const snap=copy(b);delete snap[name===ownName?"phase3015SourceSnapshot":"phase3014SourceSnapshot"];return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:core.computeSnapshotHash(snap)}}
function fields(api,list){const r={};api[list].forEach(k=>r[k]=k);api.ARRAY_FIELDS.forEach(k=>r[k]=[]);api.REQUIRED_TRUE.forEach(k=>r[k]=true);return r}
function executionHistory(){const a=p3015.STATES,p=p3015.CURRENT_STAGE;return [[p+"_record_creation","",a[0]],["start_"+p+"_record",a[0],a[1]],["begin_"+p+"_record_work",a[1],a[2]],["submit_"+p+"_review",a[2],a[3]],["complete_"+p+"_record",a[3],a[4]],["manual_handoff_to_phase30_post_start_stabilization_closure_post_execution_verification",a[4],a[8]]].map(([action,from,to])=>({...human,action,from,to}))}
function source(patch={}){
 const approval={chainValid:true,phase30PostStartStabilizationClosureExecutionApprovalResult:p3015.PHASE3014_REFERENCE.RESULTS[0],approvedBy:"approver",decisionBy:"approver",decisionAt:NOW,auditTrail:[human]};
 const r={...fields(p3015,"EXECUTION_FIELDS"),...p3015.SAFETY,[sourceName+"Id"]:"execution-1",[sourceName+"Status"]:p3015.STATES[8],[sourceName+"Result"]:p3015.RESULTS[0],[sourceName+"Version"]:p3015.SCHEMA_VERSION,phase:"phase30",stage:p3015.CURRENT_STAGE,nextStage:p3015.NEXT_STAGE,phase30Started:true,manualPhase30StartCompleted:true,manualExecutionRecorded:true,approvalResult:p3015.PHASE3014_REFERENCE.RESULTS[0],executionStartedAt:NOW,executionCompletedAt:NOW,preExecutionSnapshot:{ready:true},postExecutionSnapshot:{managementRecordCompleted:true},recordVersion:6,auditTrail:executionHistory(),phase3014SourceSnapshot:approval};
 p3015.REFERENCE_IDS.concat(p3015.UPSTREAM_FIELDS).forEach(k=>r[k]=approval[k]=k+"-1");
 r.manualApprovalEvidence={approvalId:approval.phase30PostStartStabilizationClosureExecutionApprovalId,approvalSnapshotHash:approval.phase30PostStartStabilizationClosureExecutionApprovalSnapshotHash,approvalResult:approval.phase30PostStartStabilizationClosureExecutionApprovalResult,approvedBy:approval.approvedBy,decisionBy:approval.decisionBy,decisionAt:approval.decisionAt,handoffBy:human.performedBy,handoffAt:human.performedAt,explicitConfirmation:true};
 r.executionBeforeSnapshot={phase30PostStartStabilizationClosureExecutionApprovalId:r.phase30PostStartStabilizationClosureExecutionApprovalId,phase30PostStartStabilizationClosureExecutionApprovalSnapshotHash:r.phase30PostStartStabilizationClosureExecutionApprovalSnapshotHash,phase30PostStartStabilizationClosureExecutionApprovalVersion:r.phase30PostStartStabilizationClosureExecutionApprovalVersion};
 return stamp({...r,...patch});
}
const src=source(),sourceBefore=JSON.stringify(src);
function input(s=src){const r=fields(core,"CREATION_FIELDS");core.SOURCE_EVIDENCE_FIELDS.forEach(k=>r[k]=copy(s[k]));return r}
assert(core.validatePhase3015Eligibility(src).valid);
assert.strictEqual(core.NEXT_STAGE,"manual_phase30_post_start_stabilization_closure_post_execution_verification_decision");
assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([src],[]).length,1);
for(const patch of [{phase:"phase29"},{phase:undefined},{stage:"wrong"},{stage:undefined},{currentStage:"wrong"},{nextStage:"wrong"},{nextStage:undefined},{[sourceName+"Status"]:"wrong"},{[sourceName+"Version"]:"wrong"},{manualExecutionRecorded:false},{manualExecutionRecorded:undefined},{manualApprovalEvidence:{}},{executionBeforeSnapshot:{}},{approvalResult:"not approved"},{executionStartedAt:"bad"},{executionCompletedAt:"bad"},{executionCompletedAt:"2000-01-01"},{executionResult:""},{executedBy:""},{postExecutionSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{phase30Started:false},{manualPhase30StartCompleted:false},{auditTrail:[]},{recordVersion:0},{recordVersion:7},{phase3014SourceSnapshot:{chainValid:false}}])assert.strictEqual(core.validatePhase3015Eligibility(source(patch)).valid,false,JSON.stringify(patch));
for(const status of p3015.STATES.filter(v=>v!==p3015.STATES[8]))assert.strictEqual(core.validatePhase3015Eligibility(source({[sourceName+"Status"]:status})).valid,false,status);
for(const result of ["",...p3015.RESULTS.slice(1)])assert.strictEqual(core.validatePhase3015Eligibility(source({[sourceName+"Result"]:result})).valid,false,result);
for(const [k,v] of Object.entries(p3015.SAFETY))assert.strictEqual(core.validatePhase3015Eligibility(source({[k]:!v})).valid,false,k);
for(const k of p3015.REQUIRED_TRUE)assert.strictEqual(core.validatePhase3015Eligibility(source({[k]:false})).valid,false,k);
for(const k of ["errors","unresolvedIssues","criticalIssues","blockingConditions"])for(const value of [["issue"],null,"bad"])assert.strictEqual(core.validatePhase3015Eligibility(source({[k]:value})).valid,false,k);
for(const k of p3015.REFERENCE_IDS.concat(p3015.UPSTREAM_FIELDS))assert.strictEqual(core.validatePhase3015Eligibility(source({[k]:"mismatch"})).valid,false,k);
for(const patch of [{[sourceName+"SnapshotHash"]:"tampered"},{[sourceName+"Snapshot"]:{tampered:true}},{notes:"tampered"}])assert.strictEqual(core.validatePhase3015Eligibility({...src,...patch}).valid,false);
for(const patch of [{action:"automatic_execution"},{from:"wrong"},{to:"wrong"},{performedAt:"bad"},{explicitConfirmation:false},null]){const audit=executionHistory();audit[4]=patch===null?null:{...audit[4],...patch};assert.strictEqual(core.validatePhase3015Eligibility(source({auditTrail:audit})).valid,false)}
assert.strictEqual(core.validatePhase3015Eligibility(source({recordVersion:1,auditTrail:[{...human,action:"manual_handoff",from:"",to:p3015.STATES[8]}]})).valid,false);
assert.strictEqual(core.validatePhase3015Eligibility({...src,auditTrail:new Array(6)}).valid,false);
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...dependency,...patch}).validatePhase3015Eligibility(src).valid,false);
const withUpdate=executionHistory();withUpdate.splice(3,0,{...human,action:"update_"+p3015.CURRENT_STAGE+"_record",from:p3015.STATES[2],to:p3015.STATES[2]});assert(core.validatePhase3015Eligibility(source({recordVersion:7,auditTrail:withUpdate,warnings:["manual note"]})).valid);
const created=core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),human,options,[]);assert(created.created,created.reasons.join());const initial=created.record;assert(Object.isFrozen(initial));assert.strictEqual(initial.verificationChecks,null);
assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),human,options,[initial]).created,false);
assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([src],[initial]).length,0);
for(const field of core.CREATION_FIELDS){const value=input();delete value[field];assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,value,human,options,[]).created,false,field)}
for(const field of core.SOURCE_EVIDENCE_FIELDS)assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,{...input(),[field]:"mismatch"},human,options,[]).created,false,field);
assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(initial,human,options).transitioned,false);
assert.strictEqual(core.submitStabilizationClosurePostExecutionVerificationReview(initial,human,options).transitioned,false);
const started=core.startStabilizationClosurePostExecutionVerification(initial,human,options);assert(started.transitioned);
const work=core.beginStabilizationClosurePostExecutionVerification(started.record,human,options);assert(work.transitioned);
for(const patch of [{phase3015SourceSnapshot:{}},{auditTrail:[]},{recordVersion:99},{protectedMode:false},{phase:"phase29"},{stage:"wrong"},{nextStage:"wrong"},{verificationChecks:{}},{verificationBeforeSnapshot:{}},{[ownName+"Status"]:core.STATES[4]},{[sourceName+"Id"]:"other"},{invalidatedAt:NOW},{expiresAt:NOW}]){assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(work.record,patch,human,options).updated,false);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,{...input(),...patch},human,options,[]).created,false)}
for(const k of core.SOURCE_EVIDENCE_FIELDS)assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(work.record,{[k]:"changed"},human,options).updated,false);
const updated=core.updateStabilizationClosurePostExecutionVerification(work.record,{notes:"manual evidence checked"},human,options);assert(updated.updated);
const submitted=core.submitStabilizationClosurePostExecutionVerificationReview(updated.record,human,options);assert(submitted.transitioned);
const completion={result:core.RESULTS[0],actualResult:"management record matches",difference:"none",performance:"record check only",dataIntegrity:"intact",verificationStartedAt:NOW,verificationCompletedAt:NOW};
for(const patch of [{verificationStartedAt:"bad"},{verificationCompletedAt:"bad"},{verificationCompletedAt:"2000-01-01"},{actualResult:""},{difference:""},{dataIntegrity:false},{errors:["error"]},{errors:"bad"},{unresolvedIssues:["issue"]},{criticalIssues:["issue"]},{blockingConditions:["issue"]},{verificationChecks:core.VERIFIED_CHECKS}])assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(submitted.record,{...completion,...patch},human,options).completed,false,JSON.stringify(patch));
for(const k of core.REQUIRED_TRUE)assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(submitted.record,{...completion,[k]:false},human,options).completed,false,k);
const done=core.completeStabilizationClosurePostExecutionVerification(submitted.record,completion,human,options);assert(done.completed,done.reasons.join());assert.strictEqual(done.record[ownName+"Status"],core.STATES[4]);
const expectedChecks=["executionRecordPresent","planOnlyMaintained","protectedModeMaintained","privateLocalOnlyMaintained","noExternalCommunication","noExternalTransmission","noExternalExecution","auditHistoryContinuous","referenceChainContinuous","sourceUnchanged"];
for(const k of expectedChecks)assert.strictEqual(done.record.verificationChecks[k],true,k);
const handed=core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,human,options);assert(handed.handedOff);assert.strictEqual(handed.record[ownName+"Status"],core.STATES[9]);
assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(initial,human,options).handedOff,false);
assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(handed.record,human,options).handedOff,false);
assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),human,options,[handed.record]).created,false);
for(const patch of [{errors:["late error"]},{executionRecordConfirmed:false},{verificationChecks:{...core.VERIFIED_CHECKS,sourceUnchanged:false}},{recordVersion:99},{phase3015SourceSnapshot:source({manualExecutionRecorded:false})}])assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(stamp({...done.record,...patch},ownName),human,options).handedOff,false);
const otherResults=[{conditions:"c",conditionReason:"r",conditionOwner:"owner",conditionDeadline:NOW,conditionVerificationMethod:"manual",conditionReleaseCriteria:"verified"},{failureReason:"failed",failureImpact:"cannot proceed",requiredActions:["manual review"]},{incompleteReason:"missing evidence",missingItems:["evidence"]},{blockedReason:"blocked",blockedImpact:"cannot proceed",unblockingConditions:["manual review"]}];
otherResults.forEach((details,i)=>{const result=core.RESULTS[i+1];assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(submitted.record,{result},human,options).completed,false);const other=core.completeStabilizationClosurePostExecutionVerification(submitted.record,{result,...details},human,options);assert(other.completed);assert.strictEqual(other.record.verificationChecks,null);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(other.record,human,options).handedOff,false)});
for(const h of [{},{...human,performedBy:""},{...human,reason:""},{...human,performedAt:"bad"},{...human,explicitConfirmation:false}]){assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),h,options,[]).created,false);assert.strictEqual(core.startStabilizationClosurePostExecutionVerification(initial,h,options).transitioned,false);assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(started.record,h,options).transitioned,false);assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(work.record,{notes:"updated"},h,options).updated,false);assert.strictEqual(core.submitStabilizationClosurePostExecutionVerificationReview(work.record,h,options).transitioned,false);assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(submitted.record,completion,h,options).completed,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,h,options).handedOff,false);assert.strictEqual(core.invalidateStabilizationClosurePostExecutionVerification(done.record,h,options).transitioned,false)}
const invalid=core.invalidateStabilizationClosurePostExecutionVerification(done.record,human,options);assert(invalid.transitioned);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(invalid.record,human,options).handedOff,false);
assert.strictEqual(core.startStabilizationClosurePostExecutionVerification({...initial,notes:"tampered"},human,options).transitioned,false);
assert.strictEqual(core.startStabilizationClosurePostExecutionVerification(stamp({...initial,expiredAt:NOW},ownName),human,options).transitioned,false);
for(const r of [initial,started.record,work.record,updated.record,submitted.record,done.record,handed.record,invalid.record]){assert(core.integrityIntact(r));for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k);assert.strictEqual(r.phase,"phase30");assert.strictEqual(r.stage,core.CURRENT_STAGE);assert.strictEqual(r.nextStage,core.NEXT_STAGE);assert.strictEqual(r.auditTrail.length,r.recordVersion);assert.strictEqual(JSON.stringify(r.phase3015SourceSnapshot),sourceBefore)}
const mem={value:null,setItem(k,v){assert.strictEqual(k,core.STORAGE_KEY);this.value=v},getItem(){return this.value}};
assert(core.saveStabilizationClosurePostExecutionVerificationRecords(mem,[handed.record,invalid.record]).saved);assert(core.loadStabilizationClosurePostExecutionVerificationRecords(mem).loaded);
for(const value of ["{",JSON.stringify({schemaVersion:"wrong",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]})]){mem.value=value;assert.strictEqual(core.loadStabilizationClosurePostExecutionVerificationRecords(mem).loaded,false)}
const browser={HashimotoPhase3015PostStartStabilizationClosureExecution:dependency};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3016PostStartStabilizationClosurePostExecutionVerification);assert.throws(()=>vm.runInNewContext(code,{}),/Phase30-15/);
assert.strictEqual(externalCalls,0);assert.strictEqual(JSON.stringify(src),sourceBefore);assert.strictEqual(Object.isFrozen(src),false);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|child_process|execSync|spawnSync|setTimeout|setInterval|writeFile|mkdir|https?\.request/.test(code));
for(const key of ["automaticallyExecute","automaticallyAdvance","startNextPhase","automaticallyRollback","automaticallyReleaseConditions","rerunExecution"])assert.strictEqual(core[key],undefined);
console.log("Phase30-16 unit cases: PASS");

// Full source-chain integration: build the source through real Phase30-15 manual operations.
const p3014=p3015.PHASE3014_REFERENCE;
const p3013=p3014.PHASE3013_REFERENCE;
const p3012=p3013.PHASE3012_REFERENCE;
const p3011=p3012.PHASE3011_REFERENCE;
const p3010=p3011.PHASE3010_REFERENCE;
function build(api){
 const version=api.SCHEMA_VERSION,terminal=version.startsWith("29."),ref=Object.keys(api).find(k=>/^PHASE\d+_REFERENCE$/.test(k));
 const up=terminal?null:build(api[ref]);
 const parentValidator=terminal?p3010.PHASE309_REFERENCE.PHASE308_REFERENCE.PHASE307_REFERENCE.PHASE306_REFERENCE.PHASE305_REFERENCE.PHASE304_REFERENCE.PHASE303_REFERENCE.PHASE302_REFERENCE.PHASE301_REFERENCE.validatePhase2919Eligibility:null;
 const files=fs.readdirSync(require("path").join(__dirname,"..")).filter(f=>f.startsWith("phase30-")&&f.endsWith("core.js"));
 let validator=parentValidator;
 if(!terminal){for(const file of files){const a=require("../"+file);const key="validatePhase"+version.split(".").slice(0,2).join("")+"Eligibility";if(a[key]){validator=a[key];break}}}
 const text=validator.toString(),status=text.match(/s\.([A-Za-z0-9]+Status)!=="([^"]+)"/),result=text.match(/s\.([A-Za-z0-9]+Result)!=="([^"]+)"/),name=status[1].slice(0,-6);
 const b={...api.SAFETY,[name+"Id"]:name+"-1",[status[1]]:status[2],[result[1]]:result[2],errors:[],unresolvedIssues:[],criticalIssues:[],blockingConditions:[],recordVersion:1,auditTrail:[{action:"manual",from:"",to:status[2],performedBy:"human",reason:"confirmed",performedAt:NOW}]};
 for(const k of api.REFERENCE_IDS.concat(api.UPSTREAM_FIELDS))b[k]=up?up[k]:k+"-1";
 if(up)b[ref.toLowerCase().replace("_reference","SourceSnapshot")]=up;
 if(!terminal&&Number(version.split(".")[1])>=4)b.phase30Started=b.manualPhase30StartCompleted=true;const snap={...b};if(name==="phase30Definition")delete snap.phase2919SourceSnapshot;
 return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:api.computeSnapshotHash(snap),[name+"Version"]:version};
}

const realDecision=build(p3010.PHASE309_REFERENCE);
const f=fields(p3010,"FOLLOWUP_FIELDS");let followup=p3010.createStabilizationFollowupRecord(realDecision,f,human,options,[]);assert(followup.created,followup.reasons.join());followup=p3010.beginStabilizationFollowup(followup.record,human,options);followup=p3010.submitStabilizationFollowupReview(followup.record,human,options);followup=p3010.completeStabilizationFollowup(followup.record,{result:p3010.RESULTS[0],followupSummary:"complete",followupAfterSnapshot:{stable:true},completedBy:"human",completedAt:NOW},human,options);assert(followup.completed);followup=p3010.handoffToStabilizationClosureReview(followup.record,human,options);assert(followup.handedOff);

let review=p3011.createStabilizationClosureReviewRecord(followup.record,fields(p3011,"REVIEW_FIELDS"),human,options,[]);assert(review.created,review.reasons.join());review=p3011.beginStabilizationClosureReview(review.record,human,options);review=p3011.submitStabilizationClosureReview(review.record,human,options);review=p3011.completeStabilizationClosureReview(review.record,{result:p3011.RESULTS[0],reviewSummary:"ready",closureReviewAfterSnapshot:{ready:true},completedBy:"human",completedAt:NOW},human,options);assert(review.completed);review=p3011.handoffToStabilizationClosureDecision(review.record,human,options);assert(review.handedOff);

let decision=p3012.createStabilizationClosureDecisionRecord(review.record,fields(p3012,"DECISION_FIELDS"),human,options,[]);assert(decision.created,decision.reasons.join());decision=p3012.beginStabilizationClosureDecision(decision.record,human,options);decision=p3012.submitStabilizationClosureDecisionReview(decision.record,human,options);decision=p3012.decideStabilizationClosure(decision.record,{result:p3012.RESULTS[0],decisionSummary:"approved",decisionAfterSnapshot:{ready:true},approvedBy:"human",approvedAt:NOW},human,options);assert(decision.decided);decision=p3012.handoffToStabilizationClosureExecutionPreparation(decision.record,human,options);assert(decision.handedOff);

let preparation=p3013.createStabilizationClosureExecutionPreparationRecord(decision.record,fields(p3013,"PREPARATION_FIELDS"),human,options,[]);assert(preparation.created,preparation.reasons.join());
preparation=p3013.startStabilizationClosureExecutionPreparation(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.beginStabilizationClosureExecutionPreparation(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.submitStabilizationClosureExecutionPreparationReview(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.completeStabilizationClosureExecutionPreparation(preparation.record,{result:p3013.RESULTS[0],preparationSummary:"ready",preparationAfterSnapshot:{ready:true},completedBy:"human",completedAt:NOW},human,options);assert(preparation.completed);
preparation=p3013.handoffToStabilizationClosureExecutionApproval(preparation.record,human,options);assert(preparation.handedOff);

let approval=p3014.createStabilizationClosureExecutionApprovalRecord(preparation.record,fields(p3014,"APPROVAL_FIELDS"),human,options,[]);assert(approval.created,approval.reasons.join());
approval=p3014.startStabilizationClosureExecutionApproval(approval.record,human,options);assert(approval.transitioned);
approval=p3014.beginStabilizationClosureExecutionApproval(approval.record,human,options);assert(approval.transitioned);
approval=p3014.submitStabilizationClosureExecutionApprovalReview(approval.record,human,options);assert(approval.transitioned);
approval=p3014.decideStabilizationClosureExecutionApproval(approval.record,{result:p3014.RESULTS[0],approvalSummary:"approved",approvalAfterSnapshot:{approved:true},decisionBy:"approver",decisionAt:NOW},human,options);assert(approval.decided);
approval=p3014.handoffToStabilizationClosureExecution(approval.record,human,options);assert(approval.handedOff);

let execution=p3015.createStabilizationClosureExecutionRecord(approval.record,{...fields(p3015,"CREATION_FIELDS"),approvalResult:p3014.RESULTS[0]},human,options,[]);assert(execution.created,execution.reasons.join());
execution=p3015.startStabilizationClosureExecution(execution.record,human,options);assert(execution.transitioned);
execution=p3015.beginStabilizationClosureExecution(execution.record,human,options);assert(execution.transitioned);
execution=p3015.submitStabilizationClosureExecutionReview(execution.record,human,options);assert(execution.transitioned);
execution=p3015.completeStabilizationClosureExecution(execution.record,{result:p3015.RESULTS[0],executionStartedAt:NOW,executionCompletedAt:NOW,postExecutionSnapshot:{managementRecordOnly:true},executionResult:"management record completed"},human,options);assert(execution.completed);
execution=p3015.handoffToStabilizationClosurePostExecutionVerification(execution.record,human,options);assert(execution.handedOff);
assert(real.validatePhase3015Eligibility(execution.record).valid);
const sourceHash=execution.record[sourceName+"SnapshotHash"];
const actual=real.createStabilizationClosurePostExecutionVerificationRecord(execution.record,input(execution.record),human,options,[]);assert(actual.created,actual.reasons.join());assert(real.integrityIntact(actual.record));
assert.notStrictEqual(actual.record.phase3015SourceSnapshot,execution.record);
assert.strictEqual(execution.record[sourceName+"SnapshotHash"],sourceHash);assert(p3015.integrityIntact(execution.record));
const broken=copy(execution.record);broken.phase3014SourceSnapshot.phase3013SourceSnapshot=null;
assert.strictEqual(real.validatePhase3015Eligibility(broken).valid,false);
console.log("phase30PostStartStabilizationClosurePostExecutionVerificationCore.test.js: PASS (including real Phase30-15 source chain)");
