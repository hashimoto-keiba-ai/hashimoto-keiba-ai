"use strict";
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path'),{createRequire}=require('module');
if(process.argv.includes('--checkpoint-self-test')){checkpointSelfTest();process.exit(0);}
if(process.argv.includes('--integration-worker')){runIntegrationWorker();process.exit(0);}
if(process.argv.includes('--integration-only')){runIsolatedIntegration();process.exit(0);}
const real=require('../phase31-16-phase31-post-start-stabilization-closure-post-execution-verification-core.js'),p3115=require('../phase31-15-phase31-post-start-stabilization-closure-execution-core.js');
const code=fs.readFileSync(require.resolve('../phase31-16-phase31-post-start-stabilization-closure-post-execution-verification-core.js'),'utf8'),previousPath=require.resolve('./phase31PostStartStabilizationClosureExecutionCore.test.js'),previous=fs.readFileSync(previousPath,'utf8');
const box={require:createRequire(previousPath),console,process:{argv:['node','test','--unit-only']}};
vm.runInNewContext(previous.slice(0,previous.indexOf('\nfunction rejectSource'))+'\nconst done=core.completeStabilizationClosureExecution(review(),completion(),human,options);assert(done.completed);const hand=core.handoffToStabilizationClosurePostExecutionVerification(done.record,human,options);assert(hand.handedOff);globalThis.fixture={api:core,source:hand.record};',box);
// Cache only dependency checks in focused unit cases; full integration below uses the real uncached module.
const dependencyChecks=new Map(),dependency={...box.fixture.api,integrityIntact(s,o){const key=JSON.stringify([s,o&&o.now?o.now():null]);if(!dependencyChecks.has(key))dependencyChecks.set(key,box.fixture.api.integrityIntact(s,o));return dependencyChecks.get(key)}},src=JSON.parse(JSON.stringify(box.fixture.source)),copy=v=>JSON.parse(JSON.stringify(v));
const NOW="2027-02-09T00:00:00Z",options={now:()=>NOW},human={performedBy:"operator",performedAt:NOW,reason:"explicit manual stabilization closure review",explicitConfirmation:true};
let forbiddenCalls=0,getterCalls=0;const forbidden=()=>{forbiddenCalls++;throw Error("forbidden automatic/external action or implicit clock")};
class ExplicitDate extends Date{constructor(...args){if(!args.length)forbidden();super(...args)}static now(){return forbidden()}}
function load(dep=dependency){const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase31-15-phase31-post-start-stabilization-closure-execution-core.js");return dep},Date:ExplicitDate,Math:Object.assign(Object.create(Math),{random:forbidden}),fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,navigator:{sendBeacon:forbidden},setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,localStorage:{getItem:forbidden,setItem:forbidden}};vm.runInNewContext(code,sandbox);return sandbox.module.exports}
const core=load(),OWN="phase31PostStartStabilizationClosurePostExecutionVerification",SOURCE="phase31PostStartStabilizationClosureExecution";
function evidence(k){const e={confirmed:true,confirmedBy:"reviewer",confirmedAt:NOW};return k==="gitStateEvidence"?{...e,branch:"codex/closure-review",headCommit:"7992243"}:k==="workingTreeEvidence"?{...e,status:"clean",clean:true}:k==="mainOriginMainAlignmentEvidence"?{...e,mainCommit:"7992243",originMainCommit:"7992243",aligned:true}:{...e,summary:"required tests passed",passed:true}}
function input(s=src,patch={}){const r={};for(const k of core.VERIFICATION_FIELDS)r[k]=["closureDecisionItems"].includes(k)?[]:k;for(const k of core.REQUIRED_TRUE)r[k]=true;for(const k of core.ARRAY_FIELDS)r[k]=[];for(const k of Object.keys(core.EVIDENCE_FIELDS))r[k]=evidence(k);return {...r,noUnauthorizedOperationsConfirmed:true,verificationOperator:"operator",preExecutionSnapshot:copy(s.preExecutionSnapshot),postExecutionSnapshot:copy(s.postExecutionSnapshot),rollbackPoint:s.rollbackPoint,recoveryPoint:s.recoveryPoint,...patch}}
function completion(result=core.RESULTS[0],patch={}){return {result,...(result===core.RESULTS[0]?{explicitVerificationConfirmation:true}:{}),canProceedToNextStage:false,verificationSummary:"human closure readiness review",verificationAfterSnapshot:{runtimeState:"reviewed locally"},verifiedBy:"operator",verifiedAt:NOW,completionReason:"evidence confirmed",confirmedBy:"reviewer",confirmedAt:NOW,...patch}}
function stamp(r,prefix=OWN,sourceField="phase3115SourceSnapshot"){const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)}}
function create(patch={}){const r=core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,patch),human,options,[]);assert(r.created,r.reasons.join());return r.record}
function review(patch={}){let r=create(patch);r=core.beginStabilizationClosurePostExecutionVerification(r,human,options);assert(r.transitioned);r=core.submitStabilizationClosurePostExecutionVerificationReview(r.record,human,options);assert(r.transitioned);return r.record}
function rejectSource(patch,rehash=true){const s=rehash?stamp({...src,...patch},SOURCE,"phase3114SourceSnapshot"):{...src,...patch};const before=JSON.stringify(s);assert.strictEqual(core.validatePhase3115Eligibility(s,options).valid,false,JSON.stringify(patch));assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(s,input(),human,options,[]).created,false);assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([s],[],options).length,0);assert.strictEqual(JSON.stringify(s),before)}
assert.strictEqual(real.PHASE3115_REFERENCE,p3115);assert.strictEqual(core.PHASE3115_REFERENCE,dependency);
assert.strictEqual(core.STORAGE_KEY,"hashimoto.phase31.16.postStartStabilizationClosurePostExecutionVerificationRecords");assert.strictEqual(core.SCHEMA_VERSION,"31.16.1");assert.strictEqual(core.CURRENT_STAGE,"phase31_post_start_stabilization_closure_post_execution_verification");assert.strictEqual(core.NEXT_STAGE,"manual_phase31_post_start_stabilization_closure_post_execution_verification_decision");
assert(core.validatePhase3115Eligibility(src,options).valid,JSON.stringify(core.validatePhase3115Eligibility(src,options).reasons));
assert.strictEqual(core.startStabilizationClosurePostExecutionVerification,core.beginStabilizationClosurePostExecutionVerification);
assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),{...human,performedAt:"2027-02-08"},options,[]).created,false);
for(const patch of [{gitStateEvidence:{}},{workingTreeEvidence:{...src.workingTreeEvidence,clean:false}},{mainOriginMainAlignmentEvidence:{...src.mainOriginMainAlignmentEvidence,originMainCommit:"other",aligned:false}},{requiredTestResults:{...src.requiredTestResults,passed:false}}])rejectSource(patch);assert(Object.isFrozen(core.validateVerificationInput(input())));
for(const patch of [{[SOURCE+"Status"]:dependency.STATES[4]},{[SOURCE+"Result"]:dependency.RESULTS[1]},{canProceedToNextStage:false},{phase:"phase30"},{stage:"wrong"},{nextStage:"wrong"},{phase31Started:false},{manualPhase31StartCompleted:false},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{schemaVersion:"bad"},{[SOURCE+"Version"]:"bad"},{phase3114SourceSnapshot:null},{auditTrail:[]},{recordVersion:0},{safetyBoundary:{}},{rollbackPoint:"other"},{recoveryPoint:"other"}])rejectSource(patch);
for(const v of [false,0,null,""])rejectSource({expiredAt:v});
for(const status of dependency.STATES.filter((_,i)=>i!==7))rejectSource({[SOURCE+"Status"]:status});
for(const result of dependency.RESULTS.slice(1))rejectSource({[SOURCE+"Result"]:result});
for(const [k,v] of Object.entries(dependency.SAFETY))rejectSource({[k]:!v});
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS)){rejectSource({[k]:""},k!==SOURCE+"SnapshotHash");rejectSource({[k]:"other"},k!==SOURCE+"SnapshotHash")}
for(const k of ["errors",...core.ISSUE_FIELDS])for(const v of [["issue"],null,"bad",[1]])rejectSource({[k]:v});
const brokenChain=copy(src.phase3114SourceSnapshot);brokenChain.phase3113SourceSnapshot.phase3112SourceSnapshot.phase3111SourceSnapshot.phase3110SourceSnapshot.phase319SourceSnapshot.phase318SourceSnapshot.phase317SourceSnapshot=null;rejectSource({phase3114SourceSnapshot:brokenChain});
for(const patch of [{[SOURCE+"Snapshot"]:{}},{[SOURCE+"SnapshotHash"]:"bad"},{followupTarget:"tampered"}])rejectSource(patch,false);
for(const patch of [{action:"automatic_review"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false}])rejectSource({auditTrail:src.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)});
for(const s of [null,undefined,[],"bad",{}])assert.strictEqual(core.validatePhase3115Eligibility(s).valid,false);
for(const patch of [{CURRENT_STAGE:"bad"},{NEXT_STAGE:"bad"}])assert.strictEqual(load({...dependency,...patch}).validatePhase3115Eligibility(src,options).valid,false);
let legacyDelegations=0;const clockGuard=load({...dependency,integrityIntact(){legacyDelegations++;throw Error("legacy implicit clock must not be reached")}});
for(const key of ["phase312SourceSnapshot","phase311SourceSnapshot","phase3019SourceSnapshot","phase2919SourceSnapshot","legacySourceSnapshot"]){const legacy=copy(src);legacy.phase3114SourceSnapshot[key]={expiresAt:"2028-01-01"};const rejected=clockGuard.validatePhase3115Eligibility(legacy,options);assert.strictEqual(rejected.valid,false);assert(rejected.reasons.includes("legacy_expiry_requires_clock_safe_upstream"));}assert.strictEqual(legacyDelegations,0);
const expiring=stamp({...src,expiresAt:"2027-02-10T00:00:00Z"},SOURCE,"phase3114SourceSnapshot");assert.strictEqual(core.validatePhase3115Eligibility(expiring).valid,false);assert(core.validatePhase3115Eligibility(expiring,options).valid);assert.strictEqual(core.validatePhase3115Eligibility(expiring,{now:()=>"2027-02-11T00:00:00Z"}).valid,false);
for(const k of core.CONTENT_FIELDS){const bad=input();delete bad[k];assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,bad,human,options,[]).created,false,k)}
for(const k of core.REQUIRED_TRUE)for(const v of [false,"true",undefined])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{[k]:v}),human,options,[]).created,false,k);
for(const k of core.ARRAY_FIELDS)for(const v of [null,"bad",[1]])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{[k]:v}),human,options,[]).created,false,k);
for(const k of ["sourceRecordId","raceId","rollbackPoint","recoveryPoint"])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{[k]:"other"}),human,options,[]).created,false);
for(const k of Object.keys(core.EVIDENCE_FIELDS))for(const v of [{},{confirmed:true},{...evidence(k),confirmedBy:""},{...evidence(k),confirmedAt:"bad"}])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{[k]:v}),human,options,[]).created,false);
for(const h of [null,{}, {...human,performedAt:"bad"},{...human,explicitConfirmation:false},{...human,reason:""}])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),h,options,[]).created,false);
for(const o of [{now:()=>"bad"},{now:null},{now:()=>{throw Error("clock")}}])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),human,o,[]).created,false);
const accessorClock={};Object.defineProperty(accessorClock,"now",{enumerable:true,get(){getterCalls++;return ()=>NOW}});assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),human,accessorClock,[]).created,false);
const cycle={};cycle.self=cycle;const unsafe=[cycle,()=>{},undefined,NaN,Infinity,1n,new Date(NOW),new Map(),Object.assign(Object.create({custom:true}),{x:1}),{toJSON(){getterCalls++;return {}}}];
for(const v of unsafe)assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{verificationNotes:v}),human,options,[]).created,false);
const accessorInput=input();Object.defineProperty(accessorInput,"verificationTarget",{enumerable:true,get(){getterCalls++;return "unsafe"}});assert.strictEqual(core.validateVerificationInput(accessorInput).length>0,true);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,accessorInput,human,options,[]).created,false);
const accessorSource={...src};Object.defineProperty(accessorSource,SOURCE+"Status",{enumerable:true,get(){getterCalls++;return dependency.STATES[3]}});assert.strictEqual(core.validatePhase3115Eligibility(accessorSource,options).valid,false);
const accessorHuman={...human};Object.defineProperty(accessorHuman,"performedBy",{enumerable:true,get(){getterCalls++;return "unsafe"}});assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),accessorHuman,options,[]).created,false);
const hidden=input();Object.defineProperty(hidden,"verificationTarget",{value:"hidden",enumerable:false});assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,hidden,human,options,[]).created,false);
const sparse=input();sparse.errors=new Array(1);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,sparse,human,options,[]).created,false);
const inheritedArray=[];Object.setPrototypeOf(inheritedArray,Object.create(Array.prototype,{[Symbol.iterator]:{get(){getterCalls++;return Array.prototype[Symbol.iterator]}}}));assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{errors:inheritedArray}),human,options,[]).created,false);
const inheritedMap=[];Object.setPrototypeOf(inheritedMap,Object.create(Array.prototype,{map:{get(){getterCalls++;return Array.prototype.map}}}));assert.throws(()=>core.computeSnapshotHash(inheritedMap),/JSON-safe/);assert.strictEqual(core.render({verificationTarget:inheritedMap}).verificationTarget,"");
const data=input(),beforeData=JSON.stringify(data),beforeSource=JSON.stringify(src),initial=core.createStabilizationClosurePostExecutionVerificationRecord(src,data,human,options,[]).record;
assert(core.integrityIntact(initial,options));assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.auditTrail));assert(Object.isFrozen(initial.phase3115SourceSnapshot));assert(Object.isFrozen(core));
assert.strictEqual(JSON.stringify(initial),JSON.stringify(core.createStabilizationClosurePostExecutionVerificationRecord(src,data,human,options,[]).record));assert(core.createStabilizationClosurePostExecutionVerificationRecord(src,data,human,undefined,[]).created);assert.strictEqual(core.computeSnapshotHash({b:2,a:1}),core.computeSnapshotHash({a:1,b:2}));
for(const now of [()=>new Date(NOW),()=>Date.parse(NOW)])assert.strictEqual(JSON.stringify(core.createStabilizationClosurePostExecutionVerificationRecord(src,data,human,{now},[]).record),JSON.stringify(initial));
assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,data,human,options,[initial]).created,false);assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([src,src],[],options).length,1);assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([src],[initial],options).length,0);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),human,options,[initial,initial]).created,false);assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([src],[initial,initial],options).length,0);
assert.strictEqual(core.submitStabilizationClosurePostExecutionVerificationReview(initial,human,options).transitioned,false);const begun=core.beginStabilizationClosurePostExecutionVerification(initial,human,options);assert(begun.transitioned);assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(begun.record,human,options).transitioned,false);
for(const k of core.PROTECTED_FIELDS.concat(["result","verificationSummary","verifiedBy","verifiedAt","verificationAfterSnapshot","completionReason","confirmedBy","confirmedAt","conditions","unstableReason","incompleteReason","blockedReason","unknown"]))assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(begun.record,{[k]:"tamper"},human,options).updated,false,k);
assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(initial,human,{now:()=>"2027-02-08T00:00:00Z"}).transitioned,false);
const updated=core.updateStabilizationClosurePostExecutionVerification(begun.record,{verificationNotes:"updated explicitly"},human,options);assert(updated.updated);assert(core.integrityIntact(updated.record,options));const pending=core.submitStabilizationClosurePostExecutionVerificationReview(updated.record,human,options);assert(pending.transitioned);
assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(begun.record,{verificationNotes:"old clock"},human,{now:()=>"2027-02-08"}).updated,false);
assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(),human,{now:()=>"2027-02-08"}).completed,false);
for(const k of ["explicitVerificationConfirmation","verificationSummary","verificationAfterSnapshot","verifiedBy","verifiedAt","completionReason","confirmedBy","confirmedAt","canProceedToNextStage"]){const bad=completion();delete bad[k];assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,bad,human,options).completed,false,k)}
for(const patch of [{result:"bad"},{canProceedToNextStage:true},{verificationAfterSnapshot:{}},{verifiedAt:"bad"},{confirmedAt:"bad"},{conditions:"injected"},{automaticHandoffPerformed:true}])assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(core.RESULTS[0],patch),human,options).completed,false);
for(const patch of [{errors:["error"]},{unresolvedIssues:["issue"]},{criticalIssues:["critical"]},{blockingConditions:["blocked"]},{workingTreeEvidence:{...evidence("workingTreeEvidence"),clean:false}},{mainOriginMainAlignmentEvidence:{...evidence("mainOriginMainAlignmentEvidence"),originMainCommit:"other",aligned:false}},{requiredTestResults:{...evidence("requiredTestResults"),passed:false}}])assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(review(patch),completion(),human,options).completed,false);
// Management completion identity and dates must agree with the explicit human audit event.
for(const patch of [{verifiedBy:"someone else"},{verifiedAt:"2027-02-10"},{verifiedAt:"2027-02-08"},{confirmedAt:"2027-02-10"},{confirmedAt:"2027-02-08"}])assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(core.RESULTS[0],patch),human,options).completed,false);
assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(review({workingTreeEvidence:{...evidence("workingTreeEvidence"),status:"dirty"}}),completion(),human,options).completed,false);
assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(review({requiredTestResults:{...evidence("requiredTestResults"),confirmedAt:"2027-02-10"}}),completion(),human,options).completed,false);
rejectSource({workingTreeEvidence:{...src.workingTreeEvidence,status:"dirty"}});
assert.strictEqual(core.RESULTS.length,5);
for(const patch of [{completedBy:"forged manager"},{completedAt:"2027-02-10"},{confirmedBy:""},{confirmedAt:"2027-02-10"}])rejectSource(patch);
for(const field of ["performedBy","performedAt","reason","explicitConfirmation"]){const bad={...human};delete bad[field];assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(),bad,options,[]).created,false);assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(),bad,options).completed,false);}
for(const value of [{},[],"evidence",null]){assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{preExecutionSnapshot:value}),human,options,[]).created,false);assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(core.RESULTS[0],{verificationAfterSnapshot:value}),human,options).completed,false);}
assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(review({verificationOperator:"different manager"}),completion(),human,options).completed,false);
assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion("conditionally_complete_phase31_post_start_stabilization_closure_post_execution_verification"),human,options).completed,false);
for(const key of ["preExecutionSnapshot","postExecutionSnapshot"]){for(const value of [{},[],null,"bad",{tampered:true}])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{[key]:value}),human,options,[]).created,false);assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(begun.record,{[key]:copy(src[key])},human,options).updated,false);}
for(const value of [undefined,null,"true",1])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,input(src,{noUnauthorizedOperationsConfirmed:value}),human,options,[]).created,false);
const issueReview=review({noUnauthorizedOperationsConfirmed:false,criticalIssues:["human reports an unauthorized operation"]});assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(issueReview,completion(),human,options).completed,false);
const issueResult=core.completeStabilizationClosurePostExecutionVerification(issueReview,completion(core.RESULTS[2],{failureReason:"unauthorized operation reported by human",impactScope:"management scope",requiredActions:["manual assessment"],missingItems:["review evidence"],unblockingConditions:["human resolution"],responseOwner:"owner"}),human,options);assert(issueResult.completed);assert(core.integrityIntact(issueResult.record,options));assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(issueResult.record,human,options).handedOff,false);
assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(begun.record,{noUnauthorizedOperationsConfirmed:false},human,options).updated,true);
const done=core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(),human,options);assert(done.completed,done.reasons.join());assert(core.integrityIntact(done.record,options));assert.strictEqual(done.record[OWN+"Status"],core.STATES[3]);assert.strictEqual(done.record.canProceedToNextStage,false);assert.strictEqual(done.record.automaticHandoffPerformed,false);
const nonNormal=[];
for(let i=1;i<core.RESULTS.length;i++){
 const metadata=i===1?{conditions:"human follow-up required",conditionReason:"pending evidence",conditionOwner:"owner",conditionDeadline:"2027-02-11",conditionVerificationMethod:"human review",conditionReleaseCriteria:"evidence confirmed"}:{...[{failureReason:"failed"},{incompleteReason:"incomplete"},{blockedReason:"blocked"}][i-2],impactScope:"local management only",requiredActions:["human action"],missingItems:["unresolved work"],unblockingConditions:["human review required"],responseOwner:"responsible operator"};
 const valid=completion(core.RESULTS[i],metadata);
 for(const k of Object.keys(metadata)){const bad={...valid};delete bad[k];assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,bad,human,options).completed,false,k)}
 if(i===1)assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,{...valid,conditionDeadline:"bad"},human,options).completed,false);
 for(const k of ["requiredActions","missingItems","unblockingConditions"].filter(k=>k in metadata))for(const value of [[],[1],"action"])assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,{...valid,[k]:value},human,options).completed,false);
 const r=core.completeStabilizationClosurePostExecutionVerification(pending.record,valid,human,options);assert(r.completed,r.reasons.join());assert(core.integrityIntact(r.record,options));assert.strictEqual(r.record[OWN+"Status"],core.RESULT_STATUS[core.RESULTS[i]]);assert.strictEqual(r.record.canProceedToNextStage,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(r.record,human,options).handedOff,false);nonNormal.push(r.record);
}
assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,null,options).handedOff,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,{...human,explicitConfirmation:false},options).handedOff,false);
assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,human,{now:()=>"2027-02-08T00:00:00Z"}).handedOff,false);
const hand=core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,human,options);assert(hand.handedOff,hand.reasons.join());assert(core.integrityIntact(hand.record,options));assert.strictEqual(hand.record[OWN+"Status"],core.STATES[8]);assert.strictEqual(hand.record.canProceedToNextStage,true);assert.strictEqual(hand.record.phase31PostStartStabilizationClosurePostExecutionVerificationDecisionAutomaticallyStarted,false);assert.strictEqual(hand.record.automaticVerificationHandoffPerformed,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(hand.record,human,options).handedOff,false);
for(const patch of [{verifiedBy:"forged"},{verifiedAt:"2027-02-10"},{confirmedAt:"2027-02-10"}]){const forged=stamp({...done.record,...patch});assert.strictEqual(core.integrityIntact(forged,options),false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(forged,human,options).handedOff,false);}
assert.strictEqual(hand.record.verificationMode,"LOCAL_MANAGEMENT_RECORD_ONLY");assert.strictEqual(core.render(hand.record,options).managementRecordOnly,true);assert.strictEqual(core.render(hand.record,options).verificationMode,"LOCAL_MANAGEMENT_RECORD_ONLY");
for(const key of ["manualVerificationRecordOnly","verificationMode","externalEnvironmentVerified","sourceMutationPerformed","executionRerunPerformed","manualExecutionRecordOnly","manualApprovalBasedExecution","executionMode","externalExecutionPerformed","actualClosurePostExecutionVerificationPerformed","actualClosureExecutionPerformed","actualFilesystemChangePerformed","actualDataChangePerformed","automaticVerificationHandoffPerformed"]){const forged=stamp({...done.record,[key]:typeof done.record[key]==="boolean"?!done.record[key]:"ACTUAL_EXECUTION"});assert.strictEqual(core.integrityIntact(forged,options),false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(forged,human,options).handedOff,false);}
for(const record of [initial,begun.record,pending.record])assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(record,human,options).handedOff,false);
assert.deepStrictEqual(copy(done.record.preExecutionSnapshot),copy(data.preExecutionSnapshot));assert(Object.isFrozen(done.record.preExecutionSnapshot));assert(Object.isFrozen(done.record.verificationAfterSnapshot));assert(Object.isFrozen(done.record.postExecutionSnapshot));assert.deepStrictEqual(copy(done.record.postExecutionSnapshot),copy(src.postExecutionSnapshot));assert.strictEqual(core.render(hand.record,options).externalEnvironmentVerified,false);
assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(done.record,{verificationNotes:"late update"},human,options).updated,false);
for(const key of ["preExecutionSnapshot","postExecutionSnapshot"]){const altered=stamp({...done.record,[key]:{tampered:true}});assert.strictEqual(core.integrityIntact(altered,options),false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(altered,human,options).handedOff,false);}
const conditional=nonNormal[0];assert.strictEqual(conditional[OWN+"Result"],core.RESULTS[1]);assert.strictEqual(core.updateStabilizationClosurePostExecutionVerification(conditional,{conditions:"resolved"},human,options).updated,false);assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(conditional,completion(),human,options).completed,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(stamp({...conditional,canProceedToNextStage:true}),human,options).handedOff,false);
for(const expiry of [NOW,"2027-02-08"]){const bad=completion(core.RESULTS[1],{conditions:"pending",conditionReason:"reason",conditionOwner:"owner",conditionDeadline:expiry,conditionVerificationMethod:"human verification",conditionReleaseCriteria:"evidence"});assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,bad,human,options).completed,false);}
const invalid=core.invalidateStabilizationClosurePostExecutionVerification(hand.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record,options));assert.strictEqual(invalid.record.canProceedToNextStage,false);assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(invalid.record,human,options).transitioned,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(invalid.record,human,options).handedOff,false);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationRecord(src,data,human,options,[invalid.record]).created,false);
for(const patch of [{[OWN+"Snapshot"]:{}},{[OWN+"SnapshotHash"]:"bad"},{verificationTarget:"tampered"},{phase3115SourceSnapshot:{...src,reviewNotes:"tampered"}},{networkCommunicationPerformed:true}])assert.strictEqual(core.integrityIntact({...done.record,...patch},options),false);
for(const patch of [{action:"automatic_handoff"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false},{performedAt:"bad"},{performedBy:""},{reason:""}])assert.strictEqual(core.integrityIntact(stamp({...done.record,auditTrail:done.record.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)}),options),false);
for(const patch of [{recordVersion:99},{schemaVersion:"bad"},{[OWN+"Version"]:"bad"},{previousStatus:"wrong"},{canProceedToNextStage:true},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"bad"}])assert.strictEqual(core.integrityIntact(stamp({...done.record,...patch}),options),false);
// Rehashing cannot legitimize invented audit metadata or impossible human chronology.
for(const patch of [{performedAt:"2027-02-10"},{performedAt:"2027-02-08"},{unexpected:"injected"}])assert.strictEqual(core.integrityIntact(stamp({...done.record,auditTrail:done.record.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)}),options),false);
assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(initial,{...human,performedAt:"2027-02-08"},options).transitioned,false);
assert.strictEqual(core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(core.RESULTS[1],{conditions:"manual",conditionReason:"review",conditionOwner:"owner",conditionDeadline:NOW,conditionVerificationMethod:"manual",conditionReleaseCriteria:"evidence"}),human,options).completed,false);
for(const operation of [()=>core.updateStabilizationClosurePostExecutionVerification(begun.record,{verificationNotes:"old human time"},{...human,performedAt:"2027-02-08"},options),()=>core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(),{...human,performedAt:"2027-02-08"},options),()=>core.invalidateStabilizationClosurePostExecutionVerification(done.record,{...human,performedAt:"2027-02-08"},options)])assert(Object.values(operation()).includes(false));
assert.strictEqual(core.render({...hand.record,canProceedToNextStage:true,networkCommunicationPerformed:true},options).canProceedToNextStage,false);
for(const k of ["sourceRecordId","raceId"])assert.strictEqual(core.integrityIntact(stamp({...done.record,[k]:"other"}),options),false);
const ownExpiring=stamp({...done.record,expiresAt:"2027-02-10"});assert.strictEqual(core.integrityIntact(ownExpiring),false);assert(core.integrityIntact(ownExpiring,options));assert.strictEqual(core.integrityIntact(ownExpiring,{now:()=>"2027-02-11"}),false);
assert.strictEqual(core.integrityIntact(ownExpiring,{now:()=>"2027-02-10"}),false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(ownExpiring,{...human,performedAt:"2027-02-10"},{now:()=>"2027-02-10"}).handedOff,false);
const invalidExpiring=core.invalidateStabilizationClosurePostExecutionVerification(ownExpiring,human,options);assert(invalidExpiring.transitioned);assert(core.integrityIntact(invalidExpiring.record,options));assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerificationDecision(invalidExpiring.record,human,options).handedOff,false);
const accessorRecord={...initial};Object.defineProperty(accessorRecord,OWN+"Status",{enumerable:true,get(){getterCalls++;return core.STATES[0]}});assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(accessorRecord,human,options).transitioned,false);assert.strictEqual(core.render(accessorRecord).status,"");assert.strictEqual(core.safetyIntact(accessorSource),false);
for(const r of [null,undefined,{},[],"bad",cycle,new Proxy({},{getPrototypeOf(){throw Error("malformed")}})]){assert.strictEqual(core.integrityIntact(r,options),false);assert.strictEqual(core.beginStabilizationClosurePostExecutionVerification(r,human,options).transitioned,false);assert(Object.isFrozen(core.render(r)))}
for(const operation of [()=>core.beginStabilizationClosurePostExecutionVerification(initial,null,options),()=>core.updateStabilizationClosurePostExecutionVerification(begun.record,{verificationNotes:"x"},null,options),()=>core.submitStabilizationClosurePostExecutionVerificationReview(begun.record,null,options),()=>core.completeStabilizationClosurePostExecutionVerification(pending.record,completion(),null,options),()=>core.invalidateStabilizationClosurePostExecutionVerification(done.record,null,options)]){const r=operation();assert(Object.values(r).includes(false));assert(Object.isFrozen(r))}
const mem={v:null,writes:0,setItem(k,v){assert.strictEqual(k,core.STORAGE_KEY);this.writes++;this.v=v},getItem(k){assert.strictEqual(k,core.STORAGE_KEY);return this.v}};
for(const r of [initial,done.record,hand.record,...nonNormal,invalid.record]){assert(core.saveStabilizationClosurePostExecutionVerificationRecords(mem,[r],options).saved);const loaded=core.loadStabilizationClosurePostExecutionVerificationRecords(mem,options);assert(loaded.loaded);assert.strictEqual(JSON.stringify(loaded.records[0]),JSON.stringify(r));assert(Object.isFrozen(loaded.records[0]))}
for(const records of [null,{},[{}],[done.record,done.record],[initial,done.record],[{...done.record,raceId:"other"}]]){const writes=mem.writes;assert.strictEqual(core.saveStabilizationClosurePostExecutionVerificationRecords(mem,records,options).saved,false);assert.strictEqual(mem.writes,writes)}
for(const v of ["{","null",JSON.stringify({schemaVersion:"wrong",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:{}}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[initial,done.record]})]){mem.v=v;assert.strictEqual(core.loadStabilizationClosurePostExecutionVerificationRecords(mem,options).loaded,false)}
assert.strictEqual(core.saveStabilizationClosurePostExecutionVerificationRecords({setItem(){throw Error("storage")}},[],options).saved,false);assert.strictEqual(core.loadStabilizationClosurePostExecutionVerificationRecords({getItem(){throw Error("storage")}},options).loaded,false);
const pastClock={now:()=>"2027-02-08T00:00:00Z"};
assert.strictEqual(core.validatePhase3115Eligibility(src,pastClock).valid,false);assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationCandidates([src],[],pastClock).length,0);
assert.strictEqual(core.integrityIntact(done.record,pastClock),false);assert.strictEqual(core.render(hand.record,pastClock).canProceedToNextStage,false);
const writesBeforeFutureCheck=mem.writes;assert.strictEqual(core.saveStabilizationClosurePostExecutionVerificationRecords(mem,[done.record],pastClock).saved,false);assert.strictEqual(mem.writes,writesBeforeFutureCheck);
mem.v=JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[done.record]});assert.strictEqual(core.loadStabilizationClosurePostExecutionVerificationRecords(mem,pastClock).loaded,false);
const laterHuman={...human,performedAt:"2027-02-10T00:00:00Z"},laterClock={now:()=>laterHuman.performedAt};
const futureUpdate=core.updateStabilizationClosurePostExecutionVerification(begun.record,{verificationNotes:"explicit later management update"},laterHuman,laterClock);assert(futureUpdate.updated);assert(core.integrityIntact(futureUpdate.record,laterClock));assert(core.validatePhase3115Eligibility(src,options).valid);assert.strictEqual(core.integrityIntact(futureUpdate.record,options),false);
const futureWrites=mem.writes;assert.strictEqual(core.saveStabilizationClosurePostExecutionVerificationRecords(mem,[futureUpdate.record],options).saved,false);assert.strictEqual(mem.writes,futureWrites);mem.v=JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[futureUpdate.record]});assert.strictEqual(core.loadStabilizationClosurePostExecutionVerificationRecords(mem,options).loaded,false);
const malformed={verificationTarget:{nested:true},verificationScope:[]};assert.strictEqual(core.render(malformed).verificationTarget,"");assert.strictEqual(Object.isFrozen(malformed.verificationTarget),false);
const view=core.render(hand.record,options);for(const k of ["phase31Started","manualStartRecorded","privateLocalOnly","planOnly","protectedMode","canProceedToNextStage","automaticReviewDisabled","automaticCompletionDisabled","automaticHandoffDisabled","externalCommunicationDisabled","automationDisabled","safetyIntact","integrityIntact"])assert.strictEqual(view[k],true,k);assert.strictEqual(view.phase3115Dependency,src[SOURCE+"Id"]);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(hand.record[k],v,k);for(const [k,v] of Object.entries(dependency.SAFETY))assert.strictEqual(core.SAFETY[k],v,k);
const browser={HashimotoPhase3115PostStartStabilizationClosureExecution:dependency};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3116PostStartStabilizationClosurePostExecutionVerification);assert.throws(()=>load(null),/Phase31-15 post-start stabilization closure execution definition is required/);assert.throws(()=>vm.runInNewContext(code,{}),/Phase31-15/);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|localStorage|Date\.now\s*\(|Math\.random\s*\(|eval\s*\(|new\s+Function\s*\(/.test(code));
for(const k of ["automaticallyDecide","automaticallyApprove","automaticallyHandoff","automaticallyCorrect","automaticallyRollback","automaticallyRecover","startPhase31","startNextPhase","releaseConditions"])assert.strictEqual(core[k],undefined);
assert.strictEqual(forbiddenCalls,0);assert.strictEqual(getterCalls,0);assert.strictEqual(JSON.stringify(src),beforeSource);assert.strictEqual(JSON.stringify(data),beforeData);assert.strictEqual(Object.isFrozen(src),false);assert.strictEqual(Object.isFrozen(data),false);
console.log("Phase31-16 strict eligibility, PLAN_ONLY post-execution verification/handoff, audit, storage, immutable, deterministic and browser unit cases: PASS");
if(!process.argv.includes("--unit-only"))runIsolatedIntegration();

// Each foreground worker releases its VM fixtures before validating the real source.
// This retains real validators and every upstream unit case without retaining all
// legacy snapshots and nested VM contexts in a single V8 heap.
function runIsolatedIntegration(){
 const cp=require('child_process'),os=require('os');
 const checkpointArg=process.argv.indexOf('--checkpoint-dir');
 const persistent=checkpointArg!==-1;
 if(persistent)assert(process.argv[checkpointArg+1]&&!process.argv[checkpointArg+1].startsWith('--'),'explicit checkpoint directory required');
 const dir=persistent?path.resolve(process.argv[checkpointArg+1]):fs.mkdtempSync(path.join(os.tmpdir(),'hashimoto-phase3116-'));
 if(persistent&&!fs.existsSync(dir))fs.mkdirSync(dir);
 const files=Array.from({length:17},(_,i)=>path.join(dir,'stage-'+i+'.json'));
 const progressPath=path.join(dir,'progress.json'),codeHash=integrationCodeHash();
 let firstStage=0;
 if(persistent&&fs.existsSync(progressPath)){
  const progress=JSON.parse(fs.readFileSync(progressPath,'utf8'));
  assert(Number.isInteger(progress.lastStage)&&progress.lastStage>=0&&progress.lastStage<=16,'invalid checkpoint stage');
  const fixture=fs.readFileSync(files[progress.lastStage]);
  assert(checkpointValid(progress,codeHash,fixture),'checkpoint code or fixture mismatch; use a new directory');
  firstStage=progress.lastStage+1;
  console.log('RESUME verified checkpoint after stage '+progress.lastStage);
 }
 try{
  for(let stage=firstStage;stage<=16;stage++){
   console.log('RUN isolated real integration stage '+stage);
   const result=cp.spawnSync(process.execPath,['--expose-gc','--max-old-space-size='+workerHeapMiB(),__filename,'--integration-worker',String(stage),stage?files[stage-1]:'-',files[stage]],{stdio:'inherit'});
   assert.strictEqual(result.status,0,'isolated real integration stage '+stage+' failed');
   if(persistent){
    const progress={schemaVersion:1,codeHash,lastStage:stage,fixtureHash:checkpointHash(fs.readFileSync(files[stage]))};
    fs.writeFileSync(progressPath+'.tmp',JSON.stringify(progress));
    fs.renameSync(progressPath+'.tmp',progressPath);
    console.log('CHECKPOINT stage '+stage+' PASS');
   }
   if(stage&&fs.existsSync(files[stage-1]))fs.unlinkSync(files[stage-1]);
  }
  console.log('phase31PostStartStabilizationClosurePostExecutionVerificationCore.test.js: PASS (unchanged Phase31-1 through 15 unit regressions, real Phase30-19 anchor and real Phase31-15 to 16 integration)');
 }finally{if(!persistent){for(const file of files)if(fs.existsSync(file))fs.unlinkSync(file);fs.rmdirSync(dir)}}
}
// Optional durable test fixtures survive interrupted desktop sessions. They are
// never product storage, and are resumed only against identical code and bytes.
function checkpointHash(bytes){return require('crypto').createHash('sha256').update(bytes).digest('hex')}
function integrationCodeHash(){
 const hash=require('crypto').createHash('sha256');
 for(const dir of [path.join(__dirname,'..'),__dirname])for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.js')).sort()){
  hash.update(path.basename(dir)+'/'+name+'\0');hash.update(fs.readFileSync(path.join(dir,name)));hash.update('\0');
 }
 return hash.digest('hex');
}
function checkpointValid(p,codeHash,fixture){
 return !!p&&Object.keys(p).sort().join(',')==='codeHash,fixtureHash,lastStage,schemaVersion'&&p.schemaVersion===1&&p.codeHash===codeHash&&Number.isInteger(p.lastStage)&&p.lastStage>=0&&p.lastStage<=16&&p.fixtureHash===checkpointHash(fixture);
}
function checkpointSelfTest(){
 const fixture=Buffer.from('{"fixture":"local test only"}'),codeHash=integrationCodeHash();
 const p={schemaVersion:1,codeHash,lastStage:7,fixtureHash:checkpointHash(fixture)};
 assert(checkpointValid(p,codeHash,fixture));
 for(const patch of [{lastStage:-1},{lastStage:17},{lastStage:1.5},{schemaVersion:2},{codeHash:'changed'},{fixtureHash:'changed'},{extra:true}])assert(!checkpointValid({...p,...patch},codeHash,fixture));
 assert(!checkpointValid(p,codeHash,Buffer.from('tampered')));
 assert(!checkpointValid(p,'changed code',fixture));
 console.log('Phase31-16 test checkpoint integrity cases: PASS');
}
function workerHeapMiB(){return Math.max(4096,Math.min(16384,Math.floor(require('os').totalmem()/1048576/2)))}
function runIntegrationWorker(){
 const heapMiB=workerHeapMiB();
 if(require('v8').getHeapStatistics().heap_size_limit/1048576+128<heapMiB){
  const child=require('child_process').spawnSync(process.execPath,['--expose-gc','--max-old-space-size='+heapMiB,...process.argv.slice(1)],{stdio:'inherit'});
  process.exit(child.status===null?1:child.status);
 }

 const stage=Number(process.argv[process.argv.indexOf('--integration-worker')+1]),inputPath=process.argv[process.argv.indexOf('--integration-worker')+2],outputPath=process.argv[process.argv.indexOf('--integration-worker')+3];
 assert(Number.isInteger(stage)&&stage>=0&&stage<=16);
 if(stage===0){
  const file=require.resolve('./phase30FinalClosureCore.test.js'),box={require:createRequire(file),__dirname:path.dirname(file),console};
  vm.runInNewContext(fs.readFileSync(file,'utf8')+'\nglobalThis.anchor=final.record;',box);
  fs.writeFileSync(outputPath,JSON.stringify(box.anchor));console.log('Real Phase30-19 anchor: PASS');return;
 }
 const tests=['phase31PurposeScopeSafetyBoundaryDefinitionCore.test.js','phase31StartPreparationCore.test.js','phase31StartApprovalCore.test.js','phase31StartExecutionCore.test.js','phase31PostStartVerificationCore.test.js','phase31PostStartVerificationDecisionCore.test.js','phase31PostStartVerificationAcceptanceCore.test.js','phase31PostStartStabilizationReviewCore.test.js','phase31PostStartStabilizationDecisionCore.test.js','phase31PostStartStabilizationFollowupCore.test.js','phase31PostStartStabilizationClosureReviewCore.test.js','phase31PostStartStabilizationClosureDecisionCore.test.js','phase31PostStartStabilizationClosureExecutionPreparationCore.test.js','phase31PostStartStabilizationClosureExecutionApprovalCore.test.js','phase31PostStartStabilizationClosureExecutionCore.test.js','phase31PostStartStabilizationClosurePostExecutionVerificationCore.test.js'];
 const actions=[
 ['createDefinition','startDefinition','submitDefinitionForReview','completeDefinition','completed'],
 ['createStartPreparationRecord','startPreparation','submitPreparationForReview','completePreparation','completed'],
 ['createStartApprovalRecord','startApprovalReview','submitApprovalForReview','decideStartApproval','completed'],
 ['createStartExecutionRecord','beginStartExecutionRecord','submitStartExecutionForReview','completeStartExecution','completed'],
 ['createPostStartVerificationRecord','beginPostStartVerification','submitPostStartVerificationForReview','completePostStartVerification','completed'],
 ['createVerificationDecisionRecord','beginVerificationDecision','submitVerificationDecisionForReview','decideVerification','decided'],
 ['createPostStartAcceptanceRecord','beginPostStartAcceptance','submitPostStartAcceptanceForReview','decidePostStartAcceptance','accepted'],
 ['createStabilizationReviewRecord','beginStabilizationReview','submitStabilizationReview','completeStabilizationReview','completed'],
 ['createStabilizationDecisionRecord','beginStabilizationDecision','submitStabilizationDecisionReview','decideStabilization','decided','handoffToStabilizationFollowup'],
 ['createStabilizationFollowupRecord','beginStabilizationFollowup','submitStabilizationFollowupReview','completeStabilizationFollowup','completed','handoffToStabilizationClosureReview'],
 ['createStabilizationClosureReviewRecord','beginStabilizationClosureReview','submitStabilizationClosureReview','completeStabilizationClosureReview','completed','handoffToStabilizationClosureDecision'],
 ['createStabilizationClosureDecisionRecord','beginStabilizationClosureDecision','submitStabilizationClosureDecisionReview','decideStabilizationClosure','decided','handoffToStabilizationClosureExecutionPreparation'],
 ['createStabilizationClosureExecutionPreparationRecord','beginStabilizationClosureExecutionPreparation','submitStabilizationClosureExecutionPreparationReview','completeStabilizationClosureExecutionPreparation','completed','handoffToStabilizationClosureExecutionApproval'],
 ['createStabilizationClosureExecutionApprovalRecord','beginStabilizationClosureExecutionApproval','submitStabilizationClosureExecutionApprovalReview','decideStabilizationClosureExecutionApproval','decided','handoffToStabilizationClosureExecution'],
 ['createStabilizationClosureExecutionRecord','beginStabilizationClosureExecution','submitStabilizationClosureExecutionReview','completeStabilizationClosureExecution','completed','handoffToStabilizationClosurePostExecutionVerification'],
 ['createStabilizationClosurePostExecutionVerificationRecord','beginStabilizationClosurePostExecutionVerification','submitStabilizationClosurePostExecutionVerificationReview','completeStabilizationClosurePostExecutionVerification','completed','handoffToStabilizationClosurePostExecutionVerificationDecision']
 ][stage-1];
 const testFile=require.resolve('./'+tests[stage-1]);let box={require:createRequire(testFile),__dirname:path.dirname(testFile),console,process:{argv:['node',testFile,'--unit-only']}};
 vm.runInNewContext(fs.readFileSync(testFile,'utf8'),box);
 const source=JSON.parse(fs.readFileSync(inputPath,'utf8'));box.actual=source;
 const dataExpression=stage<=3?'input()':'input(actual)',completionExpression=stage===3?'approve':stage===4?'success(actual)':stage>=5&&stage<=7?'success()':stage<=2?'completion':'completion()';
 vm.runInNewContext('globalThis.material={input:'+dataExpression+',completion:'+completionExpression+',human};',box);
 const material=JSON.parse(JSON.stringify(box.material));box=null;if(global.gc)global.gc();
 const coreFile=fs.readdirSync(path.join(__dirname,'..')).find(f=>f.startsWith('phase31-'+stage+'-')&&f.endsWith('-core.js')),api=require('../'+coreFile),options={now:()=>material.human.performedAt};
 const digest=v=>require('crypto').createHash('sha256').update(JSON.stringify(v)).digest('hex'),before=digest(source);
 function checked(result,key){assert.strictEqual(result[key],true,stage+': '+JSON.stringify(result.reasons));return result.record}
 let record=checked(api[actions[0]](source,material.input,material.human,options,[]),'created');if(global.gc)global.gc();
 record=checked(api[actions[1]](record,material.human,options),'transitioned');if(global.gc)global.gc();
 record=checked(api[actions[2]](record,material.human,options),'transitioned');if(global.gc)global.gc();
 record=checked(api[actions[3]](record,material.completion,material.human,options),actions[4]);if(global.gc)global.gc();
 assert(api.integrityIntact(record,options));
 if(actions[5]){assert.strictEqual(record.canProceedToNextStage,false);record=checked(api[actions[5]](record,material.human,options),'handedOff');assert.strictEqual(record.canProceedToNextStage,true);assert(api.integrityIntact(record,options))}
 assert.strictEqual(digest(source),before);for(const [key,value] of Object.entries(api.SAFETY))assert.strictEqual(record[key],value,key);
 fs.writeFileSync(outputPath,JSON.stringify(record));console.log('Real Phase31-'+stage+' integration and unchanged unit regression: PASS');
}
