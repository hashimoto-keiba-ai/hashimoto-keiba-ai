"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path"),{createRequire}=require("module");
const real=require("../phase31-4-phase31-start-execution-core.js"),p313=require("../phase31-3-phase31-start-approval-core.js"),model=require("../phase30-4-phase30-start-execution-core.js");
const code=fs.readFileSync(require.resolve("../phase31-4-phase31-start-execution-core.js"),"utf8");
const previousPath=require.resolve("./phase31StartApprovalCore.test.js"),previous=fs.readFileSync(previousPath,"utf8");
const copy=v=>JSON.parse(JSON.stringify(v)),NOW="2027-02-04T00:00:00Z",options={now:()=>NOW},human={performedBy:"operator",performedAt:NOW,reason:"manual start execution record",explicitConfirmation:true};
const fixture={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console:{log:()=>{}}};
vm.runInNewContext(previous.slice(0,previous.lastIndexOf('if(!process.argv.includes("--unit-only"))'))+"\nglobalThis.approvalApi=core;globalThis.approvalRecord=approved.record;",fixture);
let forbiddenCalls=0;
const forbidden=()=>{forbiddenCalls++;throw Error("forbidden side effect or implicit clock")};
class ExplicitDate extends Date{constructor(...args){if(!args.length)forbidden();super(...args)}static now(){return forbidden()}}
function load(dependency=fixture.approvalApi){
 const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase31-3-phase31-start-approval-core.js");return dependency},Date:ExplicitDate,fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden},localStorage:{getItem:forbidden,setItem:forbidden}};
 vm.runInNewContext(code,sandbox);return sandbox.module.exports;
}
const core=load(),source=copy(fixture.approvalRecord),sourceBefore=JSON.stringify(source);
function input(s=source,patch={}){
 const r={};for(const k of core.EXECUTION_FIELDS)r[k]=k;
 for(const k of core.ISSUE_FIELDS)r[k]=[];for(const k of core.REQUIRED_TRUE)r[k]=true;
 const evidence={confirmed:true,confirmedBy:"reviewer",confirmedAt:NOW};
 Object.assign(r,{scheduledStartAt:NOW,executionConditions:"manual start only",prerequisiteConfirmation:"prerequisites checked",prerequisitesConfirmed:true,correctionRequired:false,rollbackRequired:false,
 startExecutionBeforeSnapshot:{sourceRecordId:s.sourceRecordId,raceId:s.raceId,stage:"before manual start"},
 gitStateEvidence:{...evidence,branch:"codex/preparation",headCommit:"1a46aec"},workingTreeEvidence:{...evidence,status:"clean",clean:true},mainOriginMainAlignmentEvidence:{...evidence,mainCommit:"1a46aec",originMainCommit:"1a46aec",aligned:true},requiredTestEvidence:{...evidence,summary:"required tests passed",passed:true}});
 return {...r,...patch};
}
function success(s=source){return {result:core.STATES[3],actualStartAt:NOW,actualEndAt:"2027-02-04T00:10:00Z",executionSummary:"manual start recorded",startExecutionAfterSnapshot:{sourceRecordId:s.sourceRecordId,raceId:s.raceId,stage:"after manual start"},reviewedBy:"reviewer",reviewedAt:"2027-02-04T00:10:00Z"}}
function stamp(r,prefix="phase31StartApproval",sourceField="phase312SourceSnapshot"){
 const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];
 return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)};
}
const stampOwn=r=>stamp(r,"phase31StartExecution","phase313SourceSnapshot");
function rejectSource(patch,rehash=true){
 const s=rehash?stamp({...source,...patch}):{...source,...patch},before=JSON.stringify(s);
 assert.strictEqual(core.validatePhase313Eligibility(s,options).valid,false,JSON.stringify(patch));
 assert.strictEqual(core.createStartExecutionRecord(s,input(),human,options,[]).created,false);
 assert.strictEqual(core.extractStartExecutionCandidates([s],[],options).length,0);assert.strictEqual(JSON.stringify(s),before);
}
assert.strictEqual(real.PHASE313_REFERENCE,p313);
for(const field of ["EXECUTION_FIELDS","REQUIRED_TRUE","ISSUE_FIELDS","STATES","RESULTS"])assert.strictEqual(JSON.stringify(core[field]),JSON.stringify(model[field]).replaceAll("phase30","phase31"),field);
assert.strictEqual(core.NEXT_STAGE,"manual_phase31_post_start_verification");assert(core.validatePhase313Eligibility(source).valid);
for(const patch of [{phase31StartApprovalStatus:"phase31_start_conditionally_approved"},{phase31StartApprovalResult:"phase31_start_approval_rejected"},{approvalDecision:"blocked"},{phase:"phase30"},{stage:"wrong"},{nextStage:"wrong"},{phase31StartApprovalVersion:"wrong"},{schemaVersion:"wrong"},{phase312SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{auditTrail:[]},{recordVersion:0},{safetyBoundary:{}},{approvedAt:"bad"}])rejectSource(patch);
for(const [k,v] of Object.entries(p313.SAFETY))rejectSource({[k]:!v});
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS)){
 rejectSource({[k]:"mismatch"},k!=="phase31StartApprovalSnapshotHash");
 if(["phase31StartApprovalId","phase31StartPreparationId","phase31DefinitionId","sourceRecordId","raceId"].includes(k))rejectSource({[k]:""});
}
for(const k of core.ISSUE_FIELDS)for(const value of [["issue"],"bad",null,[1]])rejectSource({[k]:value});
for(const patch of [{approvalTarget:"tampered"},{phase31StartApprovalSnapshotHash:"wrong"},{phase31StartApprovalSnapshot:{}}])rejectSource(patch,false);
for(const patch of [{action:"automatic_start"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false}])rejectSource({auditTrail:source.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)});
for(const patch of [{phase31StartPreparationId:"other"},{phase31DefinitionId:"other"},{sourceRecordId:"other"},{raceId:"other"},{phase311SourceSnapshot:null}])rejectSource({phase312SourceSnapshot:{...source.phase312SourceSnapshot,...patch}});
const broken=copy(source.phase312SourceSnapshot);broken.phase311SourceSnapshot.phase3019SourceSnapshot=null;rejectSource({phase312SourceSnapshot:broken});
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...fixture.approvalApi,...patch}).validatePhase313Eligibility(source).valid,false);
for(const s of [null,undefined,{},[],"bad"])assert.strictEqual(core.validatePhase313Eligibility(s).valid,false);
const expiring=stamp({...source,expiresAt:"2027-02-05T00:00:00Z"});
assert.strictEqual(core.validatePhase313Eligibility(expiring).valid,false);assert(core.validatePhase313Eligibility(expiring,options).valid);
assert.strictEqual(core.validatePhase313Eligibility(expiring,{now:()=>"2027-02-06T00:00:00Z"}).valid,false);
assert(core.createStartExecutionRecord(expiring,input(expiring),human,undefined,[]).created);
assert.strictEqual(core.createStartExecutionRecord(expiring,input(expiring),{...human,performedAt:"2027-02-06T00:00:00Z"},undefined,[]).created,false);
for(const k of core.CONTENT_FIELDS){const bad=input();delete bad[k];assert.strictEqual(core.createStartExecutionRecord(source,bad,human,options,[]).created,false,k)}
for(const k of core.REQUIRED_TRUE)for(const value of [false,"true",undefined])assert.strictEqual(core.createStartExecutionRecord(source,input(source,{[k]:value}),human,options,[]).created,false,k);
for(const k of core.ISSUE_FIELDS)for(const value of [null,"bad",[1]])assert.strictEqual(core.createStartExecutionRecord(source,input(source,{[k]:value}),human,options,[]).created,false,k);
for(const k of ["sourceRecordId","raceId"]){
 assert.strictEqual(core.createStartExecutionRecord(source,input(source,{[k]:"other"}),human,options,[]).created,false);
 assert.strictEqual(core.createStartExecutionRecord(source,input(source,{startExecutionBeforeSnapshot:{...input().startExecutionBeforeSnapshot,[k]:"other"}}),human,options,[]).created,false);
}
for(const k of Object.keys(core.EVIDENCE_FIELDS))for(const value of [null,{},"checked",{...input()[k],confirmedAt:"bad"},{...input()[k],confirmed:false}])assert(core.validateExecutionInput(input(source,{[k]:value})).length,k);
for(const patch of [{scheduledStartAt:"bad"},{correctionRequired:"no"},{rollbackRequired:null},{workingTreeEvidence:{...input().workingTreeEvidence,clean:"true"}},{mainOriginMainAlignmentEvidence:{...input().mainOriginMainAlignmentEvidence,originMainCommit:"other"}},{requiredTestEvidence:{...input().requiredTestEvidence,passed:"yes"}}])assert(core.validateExecutionInput(input(source,patch)).length);
const circular={sourceRecordId:source.sourceRecordId,raceId:source.raceId};circular.self=circular;
for(const value of [null,[],circular,{...input().startExecutionBeforeSnapshot,bad:NaN},{...input().startExecutionBeforeSnapshot,bad:undefined},{...input().startExecutionBeforeSnapshot,bad:()=>true}])assert(core.validateExecutionInput(input(source,{startExecutionBeforeSnapshot:value})).length);
for(const patch of [{phase31Started:true},{manualPhase31StartCompleted:true},{phase313SourceSnapshot:{}},{auditTrail:[]},{safetyBoundary:{}},{unknown:true}])assert.strictEqual(core.createStartExecutionRecord(source,input(source,patch),human,options,[]).created,false);
const data=input(),dataBefore=JSON.stringify(data),first=core.createStartExecutionRecord(source,data,human,undefined,[]);assert(first.created,first.reasons.join());
assert.strictEqual(core.createStartExecutionRecord(source,Object.create(data),human,options,[]).created,false);
assert.strictEqual(core.validatePhase313Eligibility(Object.create(source)).valid,false);
assert.strictEqual(core.createStartExecutionRecord(source,input(source,{startExecutionBeforeSnapshot:Object.create(data.startExecutionBeforeSnapshot)}),human,options,[]).created,false);
const initial=first.record;assert(core.integrityIntact(initial));assert.strictEqual(initial.phase31Started,false);assert.strictEqual(initial.manualPhase31StartCompleted,false);
assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.phase313SourceSnapshot));assert(!Object.isFrozen(data));assert(!Object.isFrozen(source));assert.notStrictEqual(initial.phase313SourceSnapshot,source);
assert.strictEqual(JSON.stringify(data),dataBefore);assert.strictEqual(JSON.stringify(core.createStartExecutionRecord(source,data,human,undefined,[])),JSON.stringify(first));
assert.strictEqual(JSON.stringify(core.createStartExecutionRecord(source,data,human,options,[])),JSON.stringify(first));
const reordered=Object.fromEntries(Object.entries(data).reverse());assert.strictEqual(core.createStartExecutionRecord(source,reordered,human,undefined,[]).record.phase31StartExecutionSnapshotHash,initial.phase31StartExecutionSnapshotHash);
assert(core.createStartExecutionRecord(source,input(source,{sourceRecordId:source.sourceRecordId,raceId:source.raceId}),human,options,[]).created);
assert.strictEqual(core.createStartExecutionRecord(source,data,human,{now:()=>"bad"},[]).created,false);
assert.strictEqual(core.createStartExecutionRecord(source,data,human,options).created,false);
assert.strictEqual(core.createStartExecutionRecord(source,data,human,options,[initial]).created,false);
assert.strictEqual(core.extractStartExecutionCandidates([source,source],[]).length,1);assert.strictEqual(core.extractStartExecutionCandidates([source],[initial]).length,0);
assert.strictEqual(core.submitStartExecutionForReview(initial,human,options).transitioned,false);
const work=core.beginStartExecutionRecord(initial,human,options).record;assert.strictEqual(work.phase31StartExecutionStatus,core.STATES[1]);
for(const k of core.PROTECTED_FIELDS)assert.strictEqual(core.updateStartExecution(work,{[k]:"tampered"},human,options).updated,false,k);
for(const patch of [{executionTarget:""},{actualStartAt:NOW},{unknown:true},{startExecutionBeforeSnapshot:{...data.startExecutionBeforeSnapshot,raceId:"other"}}])assert.strictEqual(core.updateStartExecution(work,patch,human,options).updated,false);
const changes={notes:"manually reviewed"},changeBefore=JSON.stringify(changes),updated=core.updateStartExecution(work,changes,human,options);assert(updated.updated);assert(core.integrityIntact(updated.record));assert.strictEqual(JSON.stringify(changes),changeBefore);
const reviewed=core.submitStartExecutionForReview(updated.record,human,options).record,completion=success(),completionBefore=JSON.stringify(completion);
assert.strictEqual(core.updateStartExecution(reviewed,{notes:"late"},human,options).updated,false);
for(const h of [null,{}, {...human,explicitConfirmation:false},{...human,performedBy:1},{...human,performedAt:"bad"},{...human,reason:""}]){
 assert.strictEqual(core.createStartExecutionRecord(source,data,h,options,[]).created,false);
 assert.strictEqual(core.beginStartExecutionRecord(initial,h,options).transitioned,false);
 assert.strictEqual(core.updateStartExecution(work,{notes:"x"},h,options).updated,false);
 assert.strictEqual(core.submitStartExecutionForReview(work,h,options).transitioned,false);
 assert.strictEqual(core.completeStartExecution(reviewed,completion,h,options).completed,false);
 assert.strictEqual(core.invalidateStartExecution(reviewed,h,options).transitioned,false);
}
for(const k of ["actualStartAt","actualEndAt","executionSummary","startExecutionAfterSnapshot","reviewedBy","reviewedAt"]){const bad={...completion};delete bad[k];assert.strictEqual(core.completeStartExecution(reviewed,bad,human,options).completed,false,k)}
for(const patch of [{actualStartAt:"bad"},{actualEndAt:"2000-01-01"},{reviewedAt:"bad"},{executionSummary:1},{conditions:"condition"},{failureReason:"failed"},{phase31Started:true},{unresolvedIssues:[]}])assert.strictEqual(core.completeStartExecution(reviewed,{...completion,...patch},human,options).completed,false);
for(const k of ["sourceRecordId","raceId"])assert.strictEqual(core.completeStartExecution(reviewed,{...completion,startExecutionAfterSnapshot:{...completion.startExecutionAfterSnapshot,[k]:"other"}},human,options).completed,false);
for(const patch of [{actualStartAt:NOW},{conditions:"injected"},{unknown:true}]){const forged=stampOwn({...reviewed,...patch});assert.strictEqual(core.integrityIntact(forged),false);assert.strictEqual(core.completeStartExecution(forged,completion,human,options).completed,false)}
const done=core.completeStartExecution(reviewed,completion,human,undefined);assert(done.completed,done.reasons.join());assert(core.integrityIntact(done.record));assert.strictEqual(JSON.stringify(completion),completionBefore);
assert.strictEqual(JSON.stringify(core.completeStartExecution(reviewed,completion,human,undefined)),JSON.stringify(done));
assert.strictEqual(done.record.phase31StartExecutionStatus,"phase31_start_execution_confirmed");assert.strictEqual(done.record.phase31StartExecutionResult,core.STATES[3]);assert.strictEqual(done.record.nextStage,core.NEXT_STAGE);
assert.strictEqual(done.record.phase31Started,true);assert.strictEqual(done.record.manualPhase31StartCompleted,true);assert.strictEqual(done.record.phase31StartExecutionPerformed,false);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(done.record[k],v,k);
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))assert.strictEqual(done.record[k],source[k]);
assert.strictEqual(core.render(done.record).manualStartRecorded,true);
for(const patch of [...core.ISSUE_FIELDS.map(k=>({[k]:["manual investigation"]})),{correctionRequired:true},{rollbackRequired:true},{workingTreeEvidence:{...data.workingTreeEvidence,status:"dirty",clean:false}},{mainOriginMainAlignmentEvidence:{...data.mainOriginMainAlignmentEvidence,originMainCommit:"other",aligned:false}},{requiredTestEvidence:{...data.requiredTestEvidence,passed:false}}]){
 const w=core.updateStartExecution(work,patch,human,options);assert(w.updated);const r=core.submitStartExecutionForReview(w.record,human,options).record;
 assert.strictEqual(core.completeStartExecution(r,completion,human,options).completed,false);
 assert(core.completeStartExecution(r,{result:core.STATES[7]},human,options).completed);
}
const conditional={result:core.STATES[4],conditions:"manual conditions",conditionReason:"risk",conditionOwner:"owner",conditionDeadline:"2027-03-01T00:00:00Z",conditionVerificationMethod:"manual review",conditionReleaseCriteria:"verified"};
for(const k of core.CONDITION_FIELDS){const bad={...conditional};delete bad[k];assert.strictEqual(core.completeStartExecution(reviewed,bad,human,options).completed,false,k)}
assert.strictEqual(core.completeStartExecution(reviewed,{...conditional,conditionDeadline:"bad"},human,options).completed,false);
assert.strictEqual(core.completeStartExecution(reviewed,{result:core.STATES[5]},human,options).completed,false);
assert.strictEqual(core.completeStartExecution(reviewed,{result:core.STATES[5],failureReason:"failed",conditions:circular},human,options).completed,false);
const nonNormal=[];for(const decision of [conditional,{result:core.STATES[5],failureReason:"manual failure"},{result:core.STATES[6]},{result:core.STATES[7]}]){const r=core.completeStartExecution(reviewed,decision,human,options);assert(r.completed);assert(core.integrityIntact(r.record));assert.strictEqual(r.record.phase31Started,false);assert.strictEqual(r.record.manualPhase31StartCompleted,false);nonNormal.push(r.record)}
for(const r of [done.record,...nonNormal]){assert.strictEqual(core.beginStartExecutionRecord(r,human,options).transitioned,false);assert.strictEqual(core.completeStartExecution(r,completion,human,options).completed,false);for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k)}
const invalid=core.invalidateStartExecution(done.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record));assert.strictEqual(invalid.record.phase31Started,true);
const expired=stampOwn({...initial,expiresAt:"2000-01-01"});
for(const r of [invalid.record,expired,stampOwn({...initial,expiredAt:NOW})]){assert.strictEqual(core.beginStartExecutionRecord(r,human,options).transitioned,false);assert.strictEqual(core.invalidateStartExecution(r,human,options).transitioned,false);assert.strictEqual(core.createStartExecutionRecord(source,data,human,options,[r]).created,false)}
for(const patch of [{executionTarget:"tampered"},{phase31StartExecutionSnapshotHash:"bad"},{phase31StartExecutionSnapshot:{}},{phase31StartExecutionVersion:"bad"},{schemaVersion:"bad"},{phase313SourceSnapshot:null}])assert.strictEqual(core.integrityIntact({...done.record,...patch}),false);
for(const patch of [{phase31StartExecutionId:"other"},{sourceRecordId:"other"},{raceId:"other"},{phase31StartApprovalId:"other"},{auditTrail:[]},{recordVersion:1},{result:"failed"},{phase31Started:false},{manualPhase31StartCompleted:false},{phase31StartExecutionPerformed:true},{safetyBoundary:{}},{criticalIssues:["issue"]},{rollbackRequired:true}]){const forged=stampOwn({...done.record,...patch});assert.strictEqual(core.integrityIntact(forged),false);assert.strictEqual(core.invalidateStartExecution(forged,human,options).transitioned,false)}
for(const r of [null,undefined,{},[],"bad"]){assert.strictEqual(core.integrityIntact(r),false);assert.strictEqual(core.beginStartExecutionRecord(r,human,options).transitioned,false)}
const mem={v:null,writes:0,setItem(key,value){assert.strictEqual(key,core.STORAGE_KEY);this.writes++;this.v=value},getItem(key){assert.strictEqual(key,core.STORAGE_KEY);return this.v}};
for(const r of [initial,done.record,...nonNormal,invalid.record,expired]){assert(core.saveStartExecutionRecords(mem,[r]).saved);const loaded=core.loadStartExecutionRecords(mem);assert(loaded.loaded);assert(Object.isFrozen(loaded.records[0]));assert.strictEqual(JSON.stringify(loaded.records[0]),JSON.stringify(r))}
for(const records of [null,{},[{}],[done.record,done.record],[{...done.record,raceId:"other"}]]){const writes=mem.writes;assert.strictEqual(core.saveStartExecutionRecords(mem,records).saved,false);assert.strictEqual(mem.writes,writes)}
for(const value of ["{",JSON.stringify({schemaVersion:"bad",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[done.record,done.record]})]){mem.v=value;assert.strictEqual(core.loadStartExecutionRecords(mem).loaded,false)}
assert.strictEqual(core.saveStartExecutionRecords({setItem(){throw Error("unavailable")}},[]).saved,false);assert.strictEqual(core.loadStartExecutionRecords({getItem(){throw Error("unavailable")}}).loaded,false);
assert.strictEqual(JSON.stringify(source),sourceBefore);assert.strictEqual(forbiddenCalls,0);assert(Object.isFrozen(core));assert(Object.isFrozen(core.SAFETY));
for(const k of ["startPhase31","executePhase31Start","automaticallyStartPhase31","advancePhase31","releaseConditions","startNextPhase"])assert.strictEqual(core[k],undefined);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|localStorage|Date\.now\s*\(|Math\.random\s*\(|eval\s*\(|new\s+Function\s*\(/.test(code));
const browser={HashimotoPhase313StartApproval:fixture.approvalApi};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase314StartExecution);
assert.throws(()=>load(null),/Phase31-3 start approval definition is required/);assert.throws(()=>vm.runInNewContext(code,{}),/Phase31-3 start approval definition is required/);
console.log("Phase31-4 unit, deterministic, storage and browser cases: PASS");
if(!process.argv.includes("--unit-only")){
 const integration={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console,process};
 vm.runInNewContext(previous.replace('console.log("phase31StartApprovalCore.test.js: PASS','globalThis.realApproval=r.record;console.log("phase31StartApprovalCore.test.js: PASS'),integration);
 const actual=integration.realApproval,before=JSON.stringify(actual),data=input(actual),beforeData=JSON.stringify(data);
 let r=real.createStartExecutionRecord(actual,data,human,undefined,[]);assert(r.created,r.reasons.join());
 r=real.beginStartExecutionRecord(r.record,human);assert(r.transitioned);
 r=real.submitStartExecutionForReview(r.record,human);assert(r.transitioned);
 r=real.completeStartExecution(r.record,success(actual),human);assert(r.completed,r.reasons.join());assert(real.integrityIntact(r.record));
 assert.strictEqual(r.record.phase31StartExecutionStatus,"phase31_start_execution_confirmed");assert.strictEqual(r.record.phase31Started,true);assert.strictEqual(r.record.phase31StartExecutionPerformed,false);
 assert.strictEqual(JSON.stringify(actual),before);assert.strictEqual(JSON.stringify(data),beforeData);
 console.log("phase31StartExecutionCore.test.js: PASS (including unchanged Phase31-3/31-2/31-1 regressions and real Phase30 reference chain)");
}
