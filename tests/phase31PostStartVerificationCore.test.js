"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path"),{createRequire}=require("module");
const real=require("../phase31-5-phase31-post-start-verification-core.js"),p314=require("../phase31-4-phase31-start-execution-core.js"),model=require("../phase30-5-phase30-post-start-verification-core.js");
const code=fs.readFileSync(require.resolve("../phase31-5-phase31-post-start-verification-core.js"),"utf8");
const previousPath=require.resolve("./phase31StartExecutionCore.test.js"),previous=fs.readFileSync(previousPath,"utf8");
const copy=v=>JSON.parse(JSON.stringify(v)),NOW="2027-02-05T00:00:00Z",options={now:()=>NOW},human={performedBy:"operator",performedAt:NOW,reason:"manual post-start verification record",explicitConfirmation:true};
const fixture={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console:{log:()=>{}}};
vm.runInNewContext(previous.slice(0,previous.lastIndexOf('if(!process.argv.includes("--unit-only"))'))+"\nglobalThis.executionApi=core;globalThis.executionRecord=done.record;",fixture);
let forbiddenCalls=0;
const forbidden=()=>{forbiddenCalls++;throw Error("forbidden side effect or implicit clock")};
class ExplicitDate extends Date{constructor(...args){if(!args.length)forbidden();super(...args)}static now(){return forbidden()}}
function load(dependency=fixture.executionApi){
 const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase31-4-phase31-start-execution-core.js");return dependency},Date:ExplicitDate,fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden},localStorage:{getItem:forbidden,setItem:forbidden}};
 vm.runInNewContext(code,sandbox);return sandbox.module.exports;
}
const core=load(),source=copy(fixture.executionRecord),sourceBefore=JSON.stringify(source);
function input(s=source,patch={}){
 const r={};for(const k of core.VERIFICATION_FIELDS)r[k]=k;
 for(const k of core.ISSUE_FIELDS)r[k]=[];for(const k of core.REQUIRED_TRUE)r[k]=true;
 const evidence={confirmed:true,confirmedBy:"reviewer",confirmedAt:NOW};
 Object.assign(r,{verificationItems:["state","safety"],correctionRequired:false,rollbackRequired:false,
 startExecutionBeforeSnapshot:copy(s.startExecutionBeforeSnapshot),startExecutionAfterSnapshot:copy(s.startExecutionAfterSnapshot),rollbackPoint:s.rollbackPoint,recoveryPoint:s.recoveryPoint,
 postStartState:{sourceRecordId:s.sourceRecordId,raceId:s.raceId,observation:"manual post-start observation"},
 gitStateEvidence:{...evidence,branch:"codex/verification",headCommit:"74905d0"},workingTreeEvidence:{...evidence,status:"clean",clean:true},mainOriginMainAlignmentEvidence:{...evidence,mainCommit:"74905d0",originMainCommit:"74905d0",aligned:true},requiredTestResults:{...evidence,summary:"required tests passed",passed:true}});
 return {...r,...patch};
}
function success(){return {result:core.RESULTS[0],canProceedToNextStage:true,verificationSummary:"human verification passed",verifiedBy:"operator",verifiedAt:NOW,reviewedBy:"reviewer",reviewedAt:NOW}}
function stamp(r,prefix="phase31StartExecution",sourceField="phase313SourceSnapshot"){
 const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];
 return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)};
}
const stampOwn=r=>stamp(r,"phase31PostStartVerification","phase314SourceSnapshot");
function rejectSource(patch,rehash=true){
 const s=rehash?stamp({...source,...patch}):{...source,...patch},before=JSON.stringify(s);
 assert.strictEqual(core.validatePhase314Eligibility(s,options).valid,false,JSON.stringify(patch));
 assert.strictEqual(core.createPostStartVerificationRecord(s,input(),human,options,[]).created,false);
 assert.strictEqual(core.extractPostStartVerificationCandidates([s],[],options).length,0);assert.strictEqual(JSON.stringify(s),before);
}
assert.strictEqual(real.PHASE314_REFERENCE,p314);
for(const field of ["VERIFICATION_FIELDS","REQUIRED_TRUE","ISSUE_FIELDS","STATES","RESULTS","RESULT_STATUS"])assert.strictEqual(JSON.stringify(core[field]),JSON.stringify(model[field]).replaceAll("phase30","phase31"),field);
assert.strictEqual(core.NEXT_STAGE,"manual_phase31_post_start_verification_decision");assert(core.validatePhase314Eligibility(source).valid);
for(const patch of [{phase31StartExecutionStatus:"phase31_start_execution_conditionally_confirmed"},{phase31StartExecutionResult:"phase31_start_execution_failed"},{phase31Started:false},{manualPhase31StartCompleted:false},{phase:"phase30"},{stage:"wrong"},{nextStage:"wrong"},{phase31StartExecutionVersion:"wrong"},{schemaVersion:"wrong"},{phase313SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{auditTrail:[]},{recordVersion:0},{safetyBoundary:{}}])rejectSource(patch);
for(const [k,v] of Object.entries(p314.SAFETY))rejectSource({[k]:!v});
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS)){
 rejectSource({[k]:"mismatch"},k!=="phase31StartExecutionSnapshotHash");
 if(["phase31StartExecutionId","phase31StartApprovalId","phase31StartPreparationId","phase31DefinitionId","sourceRecordId","raceId"].includes(k))rejectSource({[k]:""});
}
for(const k of core.ISSUE_FIELDS)for(const value of [["issue"],"bad",null,[1]])rejectSource({[k]:value});
for(const patch of [{executionTarget:"tampered"},{phase31StartExecutionSnapshotHash:"wrong"},{phase31StartExecutionSnapshot:{}}])rejectSource(patch,false);
for(const patch of [{action:"automatic_verification"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false}])rejectSource({auditTrail:source.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)});
for(const patch of [{phase31StartApprovalId:"other"},{phase31StartPreparationId:"other"},{phase31DefinitionId:"other"},{sourceRecordId:"other"},{raceId:"other"},{phase312SourceSnapshot:null}])rejectSource({phase313SourceSnapshot:{...source.phase313SourceSnapshot,...patch}});
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...fixture.executionApi,...patch}).validatePhase314Eligibility(source).valid,false);
for(const s of [null,undefined,{},[],"bad"])assert.strictEqual(core.validatePhase314Eligibility(s).valid,false);
const expiring=stamp({...source,expiresAt:"2027-02-06T00:00:00Z"});
assert.strictEqual(core.validatePhase314Eligibility(expiring).valid,false);assert(core.validatePhase314Eligibility(expiring,options).valid);
assert.strictEqual(core.validatePhase314Eligibility(expiring,{now:()=>"2027-02-07T00:00:00Z"}).valid,false);
assert(core.createPostStartVerificationRecord(expiring,input(expiring),human,undefined,[]).created);
assert.strictEqual(core.createPostStartVerificationRecord(expiring,input(expiring),{...human,performedAt:"2027-02-07T00:00:00Z"},undefined,[]).created,false);
for(const k of core.CONTENT_FIELDS){const bad=input();delete bad[k];assert.strictEqual(core.createPostStartVerificationRecord(source,bad,human,options,[]).created,false,k)}
for(const k of core.REQUIRED_TRUE)for(const value of [false,"true",undefined])assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:value}),human,options,[]).created,false,k);
for(const k of core.ISSUE_FIELDS)for(const value of [null,"bad",[1]])assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:value}),human,options,[]).created,false,k);
for(const k of ["sourceRecordId","raceId"]){
 assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:"other"}),human,options,[]).created,false);
 for(const f of ["startExecutionBeforeSnapshot","startExecutionAfterSnapshot","postStartState"])assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[f]:{...input()[f],[k]:"other"}}),human,options,[]).created,false);
}
for(const k of ["startExecutionBeforeSnapshot","startExecutionAfterSnapshot"]){
 assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:{...input()[k],tampered:true}}),human,options,[]).created,false);
 const cycle={sourceRecordId:source.sourceRecordId,raceId:source.raceId};cycle.cycle=cycle;
 assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:cycle}),human,options,[]).created,false);
}
for(const k of ["rollbackPoint","recoveryPoint"])assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:"other"}),human,options,[]).created,false);
for(const k of Object.keys(core.EVIDENCE_FIELDS))for(const patch of [{confirmed:false},{confirmedBy:""},{confirmedAt:"bad"},{extra:true}])assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,{[k]:{...input()[k],...patch}}),human,options,[]).created,false);
for(const patch of [{verificationItems:[]},{verificationItems:[1]},{postStartState:null},{correctionRequired:"false"},{rollbackRequired:0},{mainOriginMainAlignmentEvidence:{...input().mainOriginMainAlignmentEvidence,aligned:false}},{automaticDecisionPerformed:true},{canProceedToNextStage:true},{result:core.RESULTS[0]}])assert.strictEqual(core.createPostStartVerificationRecord(source,input(source,patch),human,options,[]).created,false);
for(const h of [null,{}, {...human,explicitConfirmation:false},{...human,performedAt:"bad"},{...human,performedBy:""}])assert.strictEqual(core.createPostStartVerificationRecord(source,input(),h,options,[]).created,false);
assert.strictEqual(core.createPostStartVerificationRecord(source,input(),human,options).created,false);
const data=input(),beforeData=JSON.stringify(data),created=core.createPostStartVerificationRecord(source,data,human,options,[]);assert(created.created,created.reasons.join());
const initial=created.record;assert(core.integrityIntact(initial));assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.phase314SourceSnapshot));
assert.strictEqual(JSON.stringify(core.createPostStartVerificationRecord(source,data,human,undefined,[]).record),JSON.stringify(initial));
assert.strictEqual(JSON.stringify(core.createPostStartVerificationRecord(source,data,human,options,[])),JSON.stringify(created));
const reverse=Object.fromEntries(Object.entries(data).reverse());assert.strictEqual(core.createPostStartVerificationRecord(source,reverse,human,options,[]).record.phase31PostStartVerificationSnapshotHash,initial.phase31PostStartVerificationSnapshotHash);
assert.strictEqual(JSON.stringify(data),beforeData);assert.strictEqual(core.createPostStartVerificationRecord(source,data,human,options,[initial]).created,false);
assert.strictEqual(core.extractPostStartVerificationCandidates([source,source],[],options).length,1);assert.strictEqual(core.extractPostStartVerificationCandidates([source],[initial],options).length,0);
assert.strictEqual(core.completePostStartVerification(initial,success(),human,options).completed,false);
const begun=core.beginPostStartVerification(initial,human,options);assert(begun.transitioned);
assert.strictEqual(core.beginPostStartVerification(begun.record,human,options).transitioned,false);
const changed=core.updatePostStartVerification(begun.record,{notes:"human observation"},human,options);assert(changed.updated);assert(core.integrityIntact(changed.record));
for(const patch of [{sourceRecordId:"other"},{phase31Started:false},{canProceedToNextStage:true},{result:core.RESULTS[0]},{rollbackPoint:"other"},{postStartState:{sourceRecordId:"other",raceId:source.raceId}}])assert.strictEqual(core.updatePostStartVerification(begun.record,patch,human,options).updated,false);
const review=core.submitPostStartVerificationForReview(changed.record,human,options);assert(review.transitioned);
assert.strictEqual(review.record.phase31PostStartVerificationResult,"");assert.strictEqual(review.record.canProceedToNextStage,false);
for(const k of Object.keys(success())){const bad=success();delete bad[k];assert.strictEqual(core.completePostStartVerification(review.record,bad,human,options).completed,false,k)}
for(const patch of [{result:"automatic"},{canProceedToNextStage:false},{canProceedToNextStage:"true"},{verifiedAt:"bad"},{conditions:"conditions"},{automaticDecisionPerformed:true}])assert.strictEqual(core.completePostStartVerification(review.record,{...success(),...patch},human,options).completed,false);
const done=core.completePostStartVerification(review.record,success(),human,options);assert(done.completed,done.reasons.join());assert(core.integrityIntact(done.record));
assert.strictEqual(done.record.phase31PostStartVerificationStatus,core.STATES[3]);assert.strictEqual(done.record.phase31PostStartVerificationResult,core.RESULTS[0]);assert.strictEqual(done.record.canProceedToNextStage,true);
assert.strictEqual(done.record.phase31Started,true);assert.strictEqual(done.record.manualPhase31StartCompleted,true);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(done.record[k],v,k);
assert.strictEqual(core.completePostStartVerification(done.record,success(),human,options).completed,false);
for(const operation of [()=>core.beginPostStartVerification(initial,null,options),()=>core.updatePostStartVerification(begun.record,{notes:"x"},null,options),()=>core.submitPostStartVerificationForReview(begun.record,null,options),()=>core.completePostStartVerification(review.record,success(),null,options),()=>core.invalidatePostStartVerification(done.record,null,options)])assert(Object.values(operation()).includes(false));
const nonNormal=[];
for(const result of core.RESULTS.slice(1)){
 const completion={result,canProceedToNextStage:false};
 if(result===core.RESULTS[1]){for(const k of core.CONDITION_FIELDS)completion[k]=k;completion.conditionDeadline="2027-03-01T00:00:00Z";
  for(const k of core.CONDITION_FIELDS){const bad={...completion};delete bad[k];assert.strictEqual(core.completePostStartVerification(review.record,bad,human,options).completed,false)}}
 if(result===core.RESULTS[2])completion.failureReason="human recorded failure";
 assert.strictEqual(core.completePostStartVerification(review.record,{...completion,canProceedToNextStage:true},human,options).completed,false);
 const r=core.completePostStartVerification(review.record,completion,human,options);assert(r.completed,r.reasons.join());assert(core.integrityIntact(r.record));assert.strictEqual(r.record.phase31PostStartVerificationStatus,core.RESULT_STATUS[result]);assert.strictEqual(r.record.phase31Started,true);nonNormal.push(r.record);
}
for(const patch of [{criticalIssues:["critical"]},{blockingConditions:["blocked"]},{unresolvedIssues:["open"]},{correctionRequired:true},{rollbackRequired:true},{workingTreeEvidence:{...data.workingTreeEvidence,clean:false,status:"dirty"}},{requiredTestResults:{...data.requiredTestResults,passed:false}},{mainOriginMainAlignmentEvidence:{...data.mainOriginMainAlignmentEvidence,originMainCommit:"other",aligned:false}}]){
 const a=core.createPostStartVerificationRecord(source,input(source,patch),human,options,[]);assert(a.created);
 const b=core.beginPostStartVerification(a.record,human,options),c=core.submitPostStartVerificationForReview(b.record,human,options);
 assert.strictEqual(core.completePostStartVerification(c.record,success(),human,options).completed,false);
 const blocked=core.completePostStartVerification(c.record,{result:core.RESULTS[4],canProceedToNextStage:false,blockedReason:"human chose blocked"},human,options);assert(blocked.completed);assert(core.integrityIntact(blocked.record));
}
const invalid=core.invalidatePostStartVerification(done.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record));
const expired=stampOwn({...initial,expiresAt:"2000-01-01"});
for(const r of [invalid.record,expired,stampOwn({...initial,expiredAt:NOW})]){assert.strictEqual(core.beginPostStartVerification(r,human,options).transitioned,false);assert.strictEqual(core.invalidatePostStartVerification(r,human,options).transitioned,false);assert.strictEqual(core.createPostStartVerificationRecord(source,data,human,options,[r]).created,false)}
for(const patch of [{verificationTarget:"tampered"},{phase31PostStartVerificationSnapshotHash:"bad"},{phase31PostStartVerificationSnapshot:{}},{phase31PostStartVerificationVersion:"bad"},{schemaVersion:"bad"},{phase314SourceSnapshot:null}])assert.strictEqual(core.integrityIntact({...done.record,...patch}),false);
for(const patch of [{phase31PostStartVerificationId:"other"},{sourceRecordId:"other"},{raceId:"other"},{phase31StartExecutionId:"other"},{auditTrail:[]},{recordVersion:1},{result:"failed"},{canProceedToNextStage:false},{phase31Started:false},{manualPhase31StartCompleted:false},{automaticDecisionPerformed:true},{safetyBoundary:{}},{criticalIssues:["issue"]},{rollbackRequired:true}])assert.strictEqual(core.integrityIntact(stampOwn({...done.record,...patch})),false);
for(const r of [null,undefined,{},[],"bad"]){assert.strictEqual(core.integrityIntact(r),false);assert.strictEqual(core.beginPostStartVerification(r,human,options).transitioned,false)}
const mem={v:null,writes:0,setItem(key,value){assert.strictEqual(key,core.STORAGE_KEY);this.writes++;this.v=value},getItem(key){assert.strictEqual(key,core.STORAGE_KEY);return this.v}};
for(const r of [initial,done.record,...nonNormal,invalid.record,expired]){assert(core.savePostStartVerificationRecords(mem,[r]).saved);const loaded=core.loadPostStartVerificationRecords(mem);assert(loaded.loaded);assert(Object.isFrozen(loaded.records[0]));assert.strictEqual(JSON.stringify(loaded.records[0]),JSON.stringify(r))}
for(const records of [null,{},[{}],[done.record,done.record],[{...done.record,raceId:"other"}]]){const writes=mem.writes;assert.strictEqual(core.savePostStartVerificationRecords(mem,records).saved,false);assert.strictEqual(mem.writes,writes)}
for(const value of ["{",JSON.stringify({schemaVersion:"bad",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[done.record,done.record]})]){mem.v=value;assert.strictEqual(core.loadPostStartVerificationRecords(mem).loaded,false)}
assert.strictEqual(core.savePostStartVerificationRecords({setItem(){throw Error("unavailable")}},[]).saved,false);assert.strictEqual(core.loadPostStartVerificationRecords({getItem(){throw Error("unavailable")}}).loaded,false);
assert.strictEqual(core.render(done.record).canProceedToNextStage,true);assert.strictEqual(core.render(done.record).automaticDecisionDisabled,true);
assert.strictEqual(JSON.stringify(source),sourceBefore);assert.strictEqual(JSON.stringify(data),beforeData);assert.strictEqual(forbiddenCalls,0);assert(Object.isFrozen(core));
for(const k of ["automaticallyVerify","automaticallyDecide","automaticallyCorrect","automaticallyRollback","startPhase31","advancePhase31","releaseConditions","startNextPhase"])assert.strictEqual(core[k],undefined);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|localStorage|Date\.now\s*\(|Math\.random\s*\(|eval\s*\(|new\s+Function\s*\(/.test(code));
const browser={HashimotoPhase314StartExecution:fixture.executionApi};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase315PostStartVerification);
assert.throws(()=>load(null),/Phase31-4 start execution definition is required/);assert.throws(()=>vm.runInNewContext(code,{}),/Phase31-4 start execution definition is required/);
console.log("Phase31-5 unit, deterministic, storage and browser cases: PASS");
if(!process.argv.includes("--unit-only")){
 const integration={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console,process};
 vm.runInNewContext(previous.replace('console.log("phase31StartExecutionCore.test.js: PASS','globalThis.realExecution=r.record;console.log("phase31StartExecutionCore.test.js: PASS'),integration);
 const actual=integration.realExecution,before=JSON.stringify(actual),data=input(actual),beforeData=JSON.stringify(data);
 let r=real.createPostStartVerificationRecord(actual,data,human,undefined,[]);assert(r.created,r.reasons.join());
 r=real.beginPostStartVerification(r.record,human);assert(r.transitioned);
 r=real.submitPostStartVerificationForReview(r.record,human);assert(r.transitioned);
 r=real.completePostStartVerification(r.record,success(),human);assert(r.completed,r.reasons.join());assert(real.integrityIntact(r.record));
 assert.strictEqual(r.record.phase31PostStartVerificationStatus,core.STATES[3]);assert.strictEqual(r.record.phase31PostStartVerificationResult,core.RESULTS[0]);assert.strictEqual(r.record.canProceedToNextStage,true);assert.strictEqual(r.record.automaticDecisionPerformed,false);
 assert.strictEqual(JSON.stringify(actual),before);assert.strictEqual(JSON.stringify(data),beforeData);
 console.log("phase31PostStartVerificationCore.test.js: PASS (including unchanged Phase31-4/31-3/31-2/31-1 regressions and real Phase30 reference chain)");
}
