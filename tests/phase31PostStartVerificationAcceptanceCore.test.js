"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path"),{createRequire}=require("module");
const real=require("../phase31-7-phase31-post-start-verification-acceptance-core.js"),p316=require("../phase31-6-phase31-post-start-verification-decision-core.js");
const code=fs.readFileSync(require.resolve("../phase31-7-phase31-post-start-verification-acceptance-core.js"),"utf8");
const previousPath=require.resolve("./phase31PostStartVerificationDecisionCore.test.js"),previous=fs.readFileSync(previousPath,"utf8");
const copy=v=>JSON.parse(JSON.stringify(v)),NOW="2027-02-06T00:00:00Z",options={now:()=>NOW},human={performedBy:"operator",performedAt:NOW,reason:"manual post-start verification record",explicitConfirmation:true};
const fixture={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console:{log:()=>{}}};
vm.runInNewContext(previous.slice(0,previous.lastIndexOf('if(!process.argv.includes("--unit-only"))'))+"\nglobalThis.decisionApi=core;globalThis.decisionRecord=done.record;globalThis.nonProceedingRecords=nonNormal;",fixture);
let forbiddenCalls=0;
const forbidden=()=>{forbiddenCalls++;throw Error("forbidden side effect or implicit clock")};
class ExplicitDate extends Date{constructor(...args){if(!args.length)forbidden();super(...args)}static now(){return forbidden()}}
function load(dependency=fixture.decisionApi){
 const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase31-6-phase31-post-start-verification-decision-core.js");return dependency},Date:ExplicitDate,fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden},localStorage:{getItem:forbidden,setItem:forbidden}};
 vm.runInNewContext(code,sandbox);return sandbox.module.exports;
}
const core=load(),source=copy(fixture.decisionRecord),sourceBefore=JSON.stringify(source);
function input(s=source,patch={}){
 const r={};for(const k of core.ACCEPTANCE_FIELDS)r[k]=k;
 for(const k of core.ISSUE_FIELDS)r[k]=[];for(const k of core.REQUIRED_TRUE)r[k]=true;
 const evidence={confirmed:true,confirmedBy:"reviewer",confirmedAt:NOW};
 Object.assign(r,{correctionRequired:false,rollbackRequired:false,rollbackPoint:s.rollbackPoint,recoveryPoint:s.recoveryPoint,
 gitStateEvidence:{...evidence,branch:"codex/decision",headCommit:"5eb896a"},workingTreeEvidence:{...evidence,status:"clean",clean:true},mainOriginMainAlignmentEvidence:{...evidence,mainCommit:"5eb896a",originMainCommit:"5eb896a",aligned:true},requiredTestResults:{...evidence,summary:"required tests passed",passed:true}});
 return {...r,...patch};
}
function success(){return {result:core.RESULTS[0],canProceedToNextStage:true,nextStageCandidate:core.NEXT_STAGE,acceptanceSummary:"human decision recorded",acceptanceReason:"evidence reviewed",acceptedBy:"operator",acceptedAt:NOW,reviewedBy:"reviewer",reviewedAt:NOW}}
function stamp(r,prefix="phase31PostStartVerificationDecision",sourceField="phase315SourceSnapshot"){
 const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];
 return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)};
}
const stampOwn=r=>stamp(r,"phase31PostStartVerificationAcceptance","phase316SourceSnapshot");
function rejectSource(patch,rehash=true){
 const s=rehash?stamp({...source,...patch}):{...source,...patch},before=JSON.stringify(s);
 assert.strictEqual(core.validatePhase316Eligibility(s,options).valid,false,JSON.stringify(patch));
 assert.strictEqual(core.createPostStartAcceptanceRecord(s,input(),human,options,[]).created,false);
 assert.strictEqual(core.extractPostStartAcceptanceCandidates([s],[],options).length,0);assert.strictEqual(JSON.stringify(s),before);
}
assert.strictEqual(real.PHASE316_REFERENCE,p316);
assert.strictEqual(core.NEXT_STAGE,"manual_phase31_post_start_stabilization_review");assert(core.validatePhase316Eligibility(source).valid);
rejectSource({canProceedToNextStage:false});
for(const s of fixture.nonProceedingRecords){assert.strictEqual(core.validatePhase316Eligibility(s,options).valid,false);assert.strictEqual(core.createPostStartAcceptanceRecord(s,input(s),human,options,[]).created,false)}
for(const patch of [{phase31PostStartVerificationDecisionStatus:"phase31_post_start_verification_conditionally_confirmed"},{phase31PostStartVerificationDecisionResult:"phase31_post_start_verification_failed"},{phase31Started:false},{manualPhase31StartCompleted:false},{phase:"phase30"},{stage:"wrong"},{nextStage:"wrong"},{phase31PostStartVerificationDecisionVersion:"wrong"},{schemaVersion:"wrong"},{phase315SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{auditTrail:[]},{recordVersion:0},{safetyBoundary:{}}])rejectSource(patch);
for(const [k,v] of Object.entries(p316.SAFETY))rejectSource({[k]:!v});
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS)){
 rejectSource({[k]:"mismatch"},k!=="phase31PostStartVerificationDecisionSnapshotHash");
 if(["phase31PostStartVerificationDecisionId","phase31PostStartVerificationId","phase31StartExecutionId","phase31StartApprovalId","phase31StartPreparationId","phase31DefinitionId","sourceRecordId","raceId"].includes(k))rejectSource({[k]:""});
}
for(const k of core.ISSUE_FIELDS)for(const value of [["issue"],"bad",null,[1]])rejectSource({[k]:value});
for(const patch of [{executionTarget:"tampered"},{phase31PostStartVerificationDecisionSnapshotHash:"wrong"},{phase31PostStartVerificationDecisionSnapshot:{}}])rejectSource(patch,false);
for(const patch of [{action:"automatic_verification"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false}])rejectSource({auditTrail:source.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)});
for(const patch of [{phase31StartApprovalId:"other"},{phase31StartPreparationId:"other"},{phase31DefinitionId:"other"},{sourceRecordId:"other"},{raceId:"other"},{phase313SourceSnapshot:null}])rejectSource({phase315SourceSnapshot:{...source.phase315SourceSnapshot,...patch}});
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...fixture.decisionApi,...patch}).validatePhase316Eligibility(source).valid,false);
for(const s of [null,undefined,{},[],"bad"])assert.strictEqual(core.validatePhase316Eligibility(s).valid,false);
const expiring=stamp({...source,expiresAt:"2027-02-07T00:00:00Z"});
assert.strictEqual(core.validatePhase316Eligibility(expiring).valid,false);assert(core.validatePhase316Eligibility(expiring,options).valid);
assert.strictEqual(core.validatePhase316Eligibility(expiring,{now:()=>"2027-02-08T00:00:00Z"}).valid,false);
assert(core.createPostStartAcceptanceRecord(expiring,input(expiring),human,undefined,[]).created);
assert.strictEqual(core.createPostStartAcceptanceRecord(expiring,input(expiring),{...human,performedAt:"2027-02-08T00:00:00Z"},undefined,[]).created,false);
for(const k of core.CONTENT_FIELDS){const bad=input();delete bad[k];assert.strictEqual(core.createPostStartAcceptanceRecord(source,bad,human,options,[]).created,false,k)}
for(const k of core.REQUIRED_TRUE)for(const value of [false,"true",undefined])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,{[k]:value}),human,options,[]).created,false,k);
for(const k of core.ISSUE_FIELDS)for(const value of [null,"bad",[1]])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,{[k]:value}),human,options,[]).created,false,k);
for(const k of ["sourceRecordId","raceId"])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,{[k]:"other"}),human,options,[]).created,false);
const cycle={};cycle.self=cycle;assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,{acceptanceBasis:cycle}),human,options,[]).created,false);
for(const k of ["rollbackPoint","recoveryPoint"])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,{[k]:"other"}),human,options,[]).created,false);
for(const k of Object.keys(core.EVIDENCE_FIELDS))for(const patch of [{confirmed:false},{confirmedBy:""},{confirmedAt:"bad"},{extra:true}])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,{[k]:{...input()[k],...patch}}),human,options,[]).created,false);
for(const patch of [{verificationItems:[]},{verificationItems:[1]},{postStartState:null},{correctionRequired:"false"},{rollbackRequired:0},{mainOriginMainAlignmentEvidence:{...input().mainOriginMainAlignmentEvidence,aligned:false}},{automaticDecisionPerformed:true},{canProceedToNextStage:true},{result:core.RESULTS[0]}])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(source,patch),human,options,[]).created,false);
for(const h of [null,{}, {...human,explicitConfirmation:false},{...human,performedAt:"bad"},{...human,performedBy:""}])assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(),h,options,[]).created,false);
assert.strictEqual(core.createPostStartAcceptanceRecord(source,input(),human,options).created,false);
const data=input(),beforeData=JSON.stringify(data),created=core.createPostStartAcceptanceRecord(source,data,human,options,[]);assert(created.created,created.reasons.join());
const initial=created.record;assert(core.integrityIntact(initial));assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.phase316SourceSnapshot));
assert.strictEqual(JSON.stringify(core.createPostStartAcceptanceRecord(source,data,human,undefined,[]).record),JSON.stringify(initial));
assert.strictEqual(JSON.stringify(core.createPostStartAcceptanceRecord(source,data,human,options,[])),JSON.stringify(created));
const reverse=Object.fromEntries(Object.entries(data).reverse());assert.strictEqual(core.createPostStartAcceptanceRecord(source,reverse,human,options,[]).record.phase31PostStartVerificationAcceptanceSnapshotHash,initial.phase31PostStartVerificationAcceptanceSnapshotHash);
assert.strictEqual(JSON.stringify(data),beforeData);assert.strictEqual(core.createPostStartAcceptanceRecord(source,data,human,options,[initial]).created,false);
assert.strictEqual(core.extractPostStartAcceptanceCandidates([source,source],[],options).length,1);assert.strictEqual(core.extractPostStartAcceptanceCandidates([source],[initial],options).length,0);
assert.strictEqual(core.decidePostStartAcceptance(initial,success(),human,options).accepted,false);
const begun=core.beginPostStartAcceptance(initial,human,options);assert(begun.transitioned);
assert.strictEqual(core.beginPostStartAcceptance(begun.record,human,options).transitioned,false);
const changed=core.updatePostStartAcceptance(begun.record,{acceptanceNotes:"human observation"},human,options);assert(changed.updated);assert(core.integrityIntact(changed.record));
for(const patch of [{sourceRecordId:"other"},{phase31Started:false},{canProceedToNextStage:true},{result:core.RESULTS[0]},{rollbackPoint:"other"},{postStartState:{sourceRecordId:"other",raceId:source.raceId}}])assert.strictEqual(core.updatePostStartAcceptance(begun.record,patch,human,options).updated,false);
const review=core.submitPostStartAcceptanceForReview(changed.record,human,options);assert(review.transitioned);
assert.strictEqual(review.record.acceptanceDecision,"");assert.strictEqual(review.record.nextStageCandidate,undefined);
assert.strictEqual(review.record.phase31PostStartVerificationAcceptanceResult,"");assert.strictEqual(review.record.canProceedToNextStage,false);
for(const k of Object.keys(success())){const bad=success();delete bad[k];assert.strictEqual(core.decidePostStartAcceptance(review.record,bad,human,options).accepted,false,k)}
for(const patch of [{result:"automatic"},{canProceedToNextStage:false},{canProceedToNextStage:"true"},{acceptedAt:"bad"},{conditions:"conditions"},{automaticDecisionPerformed:true}])assert.strictEqual(core.decidePostStartAcceptance(review.record,{...success(),...patch},human,options).accepted,false);
const done=core.decidePostStartAcceptance(review.record,success(),human,options);assert(done.accepted,done.reasons.join());assert(core.integrityIntact(done.record));
assert.strictEqual(done.record.acceptanceDecision,core.RESULTS[0]);
for(const nextStageCandidate of ["automatic_start","manual_hold","rework_required","rollback_review_required"])assert.strictEqual(core.decidePostStartAcceptance(review.record,{...success(),nextStageCandidate},human,options).accepted,false);
for(const candidate of ["rework_required","rollback_review_required"]){
 const patch=candidate==="rework_required"?{correctionRequired:true}:{rollbackRequired:true};
 const updated=core.updatePostStartAcceptance(begun.record,patch,human,options);assert(updated.updated);
 const pending=core.submitPostStartAcceptanceForReview(updated.record,human,options);assert(pending.transitioned);
 const decision={...success(),result:core.RESULTS[2],canProceedToNextStage:false,nextStageCandidate:candidate,rejectionReasons:["human requests manual review"]},before=JSON.stringify(decision);
 assert.strictEqual(core.decidePostStartAcceptance(review.record,decision,human,options).accepted,false);
 const result=core.decidePostStartAcceptance(pending.record,decision,human,options);assert(result.accepted,result.reasons.join());assert(core.integrityIntact(result.record));
 assert.strictEqual(result.record.nextStageCandidate,candidate);assert.strictEqual(result.record.canProceedToNextStage,false);
 assert.strictEqual(result.record.automaticCorrectionPerformed,false);assert.strictEqual(result.record.automaticRollbackPerformed,false);
 assert.strictEqual(JSON.stringify(decision),before);assert.strictEqual(updated.record.acceptanceDecision,"");
 assert.strictEqual(core.integrityIntact(stampOwn({...result.record,decision:core.RESULTS[0]})),false);
}
assert.strictEqual(done.record.phase31PostStartVerificationAcceptanceStatus,core.STATES[3]);assert.strictEqual(done.record.phase31PostStartVerificationAcceptanceResult,core.RESULTS[0]);assert.strictEqual(done.record.canProceedToNextStage,true);
assert.strictEqual(done.record.phase31Started,true);assert.strictEqual(done.record.manualPhase31StartCompleted,true);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(done.record[k],v,k);
assert.strictEqual(core.decidePostStartAcceptance(done.record,success(),human,options).accepted,false);
for(const operation of [()=>core.beginPostStartAcceptance(initial,null,options),()=>core.updatePostStartAcceptance(begun.record,{acceptanceNotes:"x"},null,options),()=>core.submitPostStartAcceptanceForReview(begun.record,null,options),()=>core.decidePostStartAcceptance(review.record,success(),null,options),()=>core.invalidatePostStartAcceptance(done.record,null,options)])assert(Object.values(operation()).includes(false));
const nonNormal=[];
for(const result of core.RESULTS.slice(1)){
 const completion={...success(),result,canProceedToNextStage:false,nextStageCandidate:"manual_hold"};
 if(result===core.RESULTS[1]){for(const k of core.CONDITION_FIELDS)completion[k]=k;completion.conditionDeadline="2027-03-01T00:00:00Z";
  for(const k of core.CONDITION_FIELDS){const bad={...completion};delete bad[k];assert.strictEqual(core.decidePostStartAcceptance(review.record,bad,human,options).accepted,false)}}
 if(result===core.RESULTS[2])completion.rejectionReasons=["human rejected the handoff"];
 assert.strictEqual(core.decidePostStartAcceptance(review.record,{...completion,canProceedToNextStage:true},human,options).accepted,false);
 const r=core.decidePostStartAcceptance(review.record,completion,human,options);assert(r.accepted,r.reasons.join());assert(core.integrityIntact(r.record));assert.strictEqual(r.record.phase31PostStartVerificationAcceptanceStatus,core.RESULT_STATUS[result]);assert.strictEqual(r.record.phase31Started,true);nonNormal.push(r.record);
}
for(const patch of [{criticalIssues:["critical"]},{blockingConditions:["blocked"]},{unresolvedIssues:["open"]},{correctionRequired:true},{rollbackRequired:true},{workingTreeEvidence:{...data.workingTreeEvidence,clean:false,status:"dirty"}},{requiredTestResults:{...data.requiredTestResults,passed:false}},{mainOriginMainAlignmentEvidence:{...data.mainOriginMainAlignmentEvidence,originMainCommit:"other",aligned:false}}]){
 const a=core.createPostStartAcceptanceRecord(source,input(source,patch),human,options,[]);assert(a.created);
 const b=core.beginPostStartAcceptance(a.record,human,options),c=core.submitPostStartAcceptanceForReview(b.record,human,options);
 assert.strictEqual(core.decidePostStartAcceptance(c.record,success(),human,options).accepted,false);
 const blocked=core.decidePostStartAcceptance(c.record,{...success(),result:core.RESULTS[4],canProceedToNextStage:false,nextStageCandidate:"manual_hold",blockedReason:"human chose blocked"},human,options);assert(blocked.accepted);assert(core.integrityIntact(blocked.record));
}
const invalid=core.invalidatePostStartAcceptance(done.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record));
const expired=stampOwn({...initial,expiresAt:"2000-01-01"});
for(const r of [invalid.record,expired,stampOwn({...initial,expiredAt:NOW})]){assert.strictEqual(core.beginPostStartAcceptance(r,human,options).transitioned,false);assert.strictEqual(core.invalidatePostStartAcceptance(r,human,options).transitioned,false);assert.strictEqual(core.createPostStartAcceptanceRecord(source,data,human,options,[r]).created,false)}
for(const patch of [{acceptanceTarget:"tampered"},{phase31PostStartVerificationAcceptanceSnapshotHash:"bad"},{phase31PostStartVerificationAcceptanceSnapshot:{}},{phase31PostStartVerificationAcceptanceVersion:"bad"},{schemaVersion:"bad"},{phase316SourceSnapshot:null}])assert.strictEqual(core.integrityIntact({...done.record,...patch}),false);
for(const patch of [{phase31PostStartVerificationAcceptanceId:"other"},{sourceRecordId:"other"},{raceId:"other"},{phase31PostStartVerificationId:"other"},{auditTrail:[]},{recordVersion:1},{result:"failed"},{canProceedToNextStage:false},{phase31Started:false},{manualPhase31StartCompleted:false},{automaticDecisionPerformed:true},{safetyBoundary:{}},{criticalIssues:["issue"]},{rollbackRequired:true}])assert.strictEqual(core.integrityIntact(stampOwn({...done.record,...patch})),false);
for(const r of [null,undefined,{},[],"bad"]){assert.strictEqual(core.integrityIntact(r),false);assert.strictEqual(core.beginPostStartAcceptance(r,human,options).transitioned,false)}
const mem={v:null,writes:0,setItem(key,value){assert.strictEqual(key,core.STORAGE_KEY);this.writes++;this.v=value},getItem(key){assert.strictEqual(key,core.STORAGE_KEY);return this.v}};
for(const r of [initial,done.record,...nonNormal,invalid.record,expired]){assert(core.savePostStartAcceptanceRecords(mem,[r]).saved);const loaded=core.loadPostStartAcceptanceRecords(mem);assert(loaded.loaded);assert(Object.isFrozen(loaded.records[0]));assert.strictEqual(JSON.stringify(loaded.records[0]),JSON.stringify(r))}
for(const records of [null,{},[{}],[done.record,done.record],[{...done.record,raceId:"other"}]]){const writes=mem.writes;assert.strictEqual(core.savePostStartAcceptanceRecords(mem,records).saved,false);assert.strictEqual(mem.writes,writes)}
for(const value of ["{",JSON.stringify({schemaVersion:"bad",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[done.record,done.record]})]){mem.v=value;assert.strictEqual(core.loadPostStartAcceptanceRecords(mem).loaded,false)}
assert.strictEqual(core.savePostStartAcceptanceRecords({setItem(){throw Error("unavailable")}},[]).saved,false);assert.strictEqual(core.loadPostStartAcceptanceRecords({getItem(){throw Error("unavailable")}}).loaded,false);
assert.strictEqual(core.render(done.record).canProceedToNextStage,true);assert.strictEqual(core.render(done.record).automaticAcceptanceDisabled,true);
assert.strictEqual(JSON.stringify(source),sourceBefore);assert.strictEqual(JSON.stringify(data),beforeData);assert.strictEqual(forbiddenCalls,0);assert(Object.isFrozen(core));
for(const k of ["automaticallyAccept","automaticallyVerify","automaticallyDecide","automaticallyCorrect","automaticallyRollback","startPhase31","advancePhase31","releaseConditions","startNextPhase"])assert.strictEqual(core[k],undefined);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|localStorage|Date\.now\s*\(|Math\.random\s*\(|eval\s*\(|new\s+Function\s*\(/.test(code));
const browser={HashimotoPhase316PostStartVerificationDecision:fixture.decisionApi};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase317PostStartVerificationAcceptance);
assert.throws(()=>load(null),/Phase31-6 post-start verification decision definition is required/);assert.throws(()=>vm.runInNewContext(code,{}),/Phase31-6 post-start verification decision definition is required/);
console.log("Phase31-7 unit, deterministic, storage and browser cases: PASS");
if(!process.argv.includes("--unit-only")){
 const integration={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console,process};
 vm.runInNewContext(previous.replace('console.log("phase31PostStartVerificationDecisionCore.test.js: PASS','globalThis.realDecision=r.record;console.log("phase31PostStartVerificationDecisionCore.test.js: PASS'),integration);
 const actual=integration.realDecision,before=JSON.stringify(actual);
 let r=real.createPostStartAcceptanceRecord(actual,input(actual),human,undefined,[]);assert(r.created,r.reasons.join());
 r=real.beginPostStartAcceptance(r.record,human);assert(r.transitioned);
 r=real.submitPostStartAcceptanceForReview(r.record,human);assert(r.transitioned);
 r=real.decidePostStartAcceptance(r.record,success(),human);assert(r.accepted,r.reasons.join());assert(real.integrityIntact(r.record));
 assert.strictEqual(JSON.stringify(actual),before);assert.strictEqual(r.record.automaticAcceptancePerformed,false);
 console.log("phase31PostStartVerificationAcceptanceCore.test.js: PASS (real upstream chain)");
}
