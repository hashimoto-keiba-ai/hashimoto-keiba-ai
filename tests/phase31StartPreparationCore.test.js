"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path"),{createRequire}=require("module");
const real=require("../phase31-2-phase31-start-preparation-core.js");
const code=fs.readFileSync(require.resolve("../phase31-2-phase31-start-preparation-core.js"),"utf8");
const previousPath=require.resolve("./phase31PurposeScopeSafetyBoundaryDefinitionCore.test.js"),previous=fs.readFileSync(previousPath,"utf8");
const copy=v=>JSON.parse(JSON.stringify(v)),NOW="2027-02-02T00:00:00Z",options={now:()=>NOW},human={performedBy:"operator",performedAt:NOW,reason:"manual preparation",explicitConfirmation:true};
const fixture={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console:{log:()=>{}}};
vm.runInNewContext(previous.split('if(!process.argv.includes("--unit-only"))')[0]+"\nglobalThis.definitionApi=core;globalThis.definitionRecord=done.record;",fixture);
let sideEffects=0;
const forbidden=()=>{sideEffects++;throw Error("forbidden operation")};
function load(dependency=fixture.definitionApi){
 const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase31-1-purpose-scope-safety-boundary-definition-core.js");return dependency},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden},localStorage:{getItem:forbidden,setItem:forbidden}};
 vm.runInNewContext(code,sandbox);return sandbox.module.exports;
}
const core=load(),source=copy(fixture.definitionRecord),before=JSON.stringify(source);
function input(){
 const r={};for(const k of core.PREPARATION_FIELDS)r[k]=k;
 for(const k of core.ISSUE_FIELDS)r[k]=[];
 for(const k of core.REQUIRED_TRUE)r[k]=true;
 r.scheduledStartAt="2027-03-01T09:00:00Z";r.safetyBoundary=copy(core.SAFETY_BOUNDARY);r.correctionRequired=false;r.rollbackRequired=false;
 const evidence={confirmed:true,confirmedBy:"reviewer",confirmedAt:NOW};
 r.gitStateEvidence={...evidence,branch:"codex/preparation",headCommit:"6dd7c7d"};
 r.workingTreeEvidence={...evidence,status:"clean",clean:true};
 r.mainOriginMainAlignmentEvidence={...evidence,mainCommit:"6dd7c7d",originMainCommit:"6dd7c7d",aligned:true};
 r.requiredTestEvidence={...evidence,summary:"required tests passed",passed:true};return r;
}
function stamp(r,prefix="phase31Definition",sourceField="phase3019SourceSnapshot"){
 const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];
 return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)};
}
function rejectSource(patch,rehash=true){
 const s=rehash?stamp({...source,...patch}):{...source,...patch},original=JSON.stringify(s);
 assert.strictEqual(core.validatePhase311Eligibility(s).valid,false,JSON.stringify(patch));
 assert.strictEqual(core.createStartPreparationRecord(s,input(),human,options,[]).created,false);
 assert.strictEqual(core.extractStartPreparationCandidates([s],[]).length,0);assert.strictEqual(JSON.stringify(s),original);
}
assert.strictEqual(real.PHASE311_REFERENCE,require("../phase31-1-purpose-scope-safety-boundary-definition-core.js"));
assert(core.validatePhase311Eligibility(source).valid);assert.strictEqual(core.NEXT_STAGE,"manual_phase31_start_approval");
for(const patch of [{phase31DefinitionStatus:"phase31_purpose_scope_safety_boundary_defined"},{phase31DefinitionStatus:"blocked"},{phase31DefinitionResult:"incomplete"},{nextStage:"wrong"},{stage:"wrong"},{phase31DefinitionVersion:"wrong"},{phase30FinalClosureId:""},{phase3019SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{auditTrail:[]},{recordVersion:1},{safetyBoundary:{}},{phase30CompletionConfirmed:false}])rejectSource(patch);
for(const [k,v] of Object.entries(core.PHASE311_REFERENCE.SAFETY))rejectSource({[k]:!v});
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))rejectSource({[k]:"mismatch"},k!=="phase31DefinitionSnapshotHash");
for(const k of core.ISSUE_FIELDS)for(const v of [["issue"],"invalid",null])rejectSource({[k]:v});
for(const patch of [{phase31Purpose:"tampered"},{phase31DefinitionSnapshotHash:"wrong"},{phase31DefinitionSnapshot:{}}])rejectSource(patch,false);
for(const patch of [{phase30Completed:false},{phase30Status:"open"},{phase30FinalClosureId:"changed"},{phase30FinalClosureVersion:"wrong"}])rejectSource({phase3019SourceSnapshot:{...source.phase3019SourceSnapshot,...patch}});
for(const patch of [{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false}])rejectSource({auditTrail:source.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)});
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...fixture.definitionApi,...patch}).validatePhase311Eligibility(source).valid,false);
for(const s of [null,undefined,{},[],"bad"])assert.strictEqual(core.validatePhase311Eligibility(s).valid,false);
for(const k of core.CONTENT_FIELDS){const r=input();delete r[k];assert.strictEqual(core.createStartPreparationRecord(source,r,human,options,[]).created,false,k)}
for(const k of core.REQUIRED_TRUE)assert.strictEqual(core.createStartPreparationRecord(source,{...input(),[k]:false},human,options,[]).created,false,k);
for(const k of core.ISSUE_FIELDS)for(const value of [null,"bad",[1]])assert.strictEqual(core.createStartPreparationRecord(source,{...input(),[k]:value},human,options,[]).created,false);
for(const k of Object.keys(core.SAFETY_BOUNDARY)){const r=input();r.safetyBoundary[k]=false;assert.strictEqual(core.validatePreparationInput(r).length>0,true,k)}
for(const k of Object.keys(core.EVIDENCE_FIELDS)){
 for(const value of [null,[],"checked",{confirmed:true},{...input()[k],confirmedBy:1},{...input()[k],confirmedAt:"bad"},{...input()[k],confirmed:false}])assert(core.validatePreparationInput({...input(),[k]:value}).length,k);
 for(const f of core.EVIDENCE_FIELDS[k]){const r=input();delete r[k][f];assert(core.validatePreparationInput(r).length,f)}
}
for(const patch of [{scheduledStartAt:"bad"},{correctionRequired:"no"},{rollbackRequired:null},{workingTreeEvidence:{...input().workingTreeEvidence,clean:"true"}},{mainOriginMainAlignmentEvidence:{...input().mainOriginMainAlignmentEvidence,originMainCommit:"other"}},{requiredTestEvidence:{...input().requiredTestEvidence,passed:"yes"}}])assert(core.validatePreparationInput({...input(),...patch}).length);
for(const h of [{},null,{...human,explicitConfirmation:false},{...human,performedBy:1}])assert.strictEqual(core.createStartPreparationRecord(source,input(),h,options,[]).created,false);
for(const patch of [{phase31Started:true},{phase311SourceSnapshot:{}},{auditTrail:[]},{nextStage:"started"},{unknown:true}])assert.strictEqual(core.createStartPreparationRecord(source,{...input(),...patch},human,options,[]).created,false);
function create(patch={}){const r=core.createStartPreparationRecord(source,{...input(),...patch},human,options,[]);assert(r.created,r.reasons.join());return r.record}
function review(patch={}){return core.submitPreparationForReview(core.startPreparation(create(patch),human,options).record,human,options).record}
const initial=create();assert(core.integrityIntact(initial));assert(Object.isFrozen(initial.phase311SourceSnapshot));assert.notStrictEqual(initial.phase311SourceSnapshot,source);
assert.strictEqual(core.createStartPreparationRecord(source,input(),human,options).created,false);
assert.strictEqual(core.createStartPreparationRecord(source,input(),human,options,[initial]).created,false);
assert.strictEqual(core.extractStartPreparationCandidates([source,source],[]).length,1);
assert.strictEqual(core.extractStartPreparationCandidates([source],[initial]).length,0);
assert.strictEqual(core.submitPreparationForReview(initial,human,options).transitioned,false);
const work=core.startPreparation(initial,human,options).record;
for(const patch of [{phase31Started:true},{phase31DefinitionId:"other"},{phase311SourceSnapshot:{}},{auditTrail:[]},{safetyBoundary:{}},{startTarget:""},{unknown:true}])assert.strictEqual(core.updatePreparation(work,patch,human,options).updated,false);
const updated=core.updatePreparation(work,{notes:"manually checked"},human,options);assert(updated.updated);assert(core.integrityIntact(updated.record));
const reviewed=core.submitPreparationForReview(updated.record,human,options).record;
const completion={result:core.STATES[3],reviewedBy:"reviewer",reviewedAt:NOW};
for(const patch of [{reviewedBy:""},{reviewedAt:"bad"},{phase31Started:true},{approvedBy:"automatic"},{unresolvedIssues:[]}])assert.strictEqual(core.completePreparation(reviewed,{...completion,...patch},human,options).completed,false);
assert.strictEqual(core.completePreparation(reviewed,completion,{},options).completed,false);
const done=core.completePreparation(reviewed,completion,human,options);assert(done.completed);assert(core.integrityIntact(done.record));
assert.strictEqual(done.record.phase31StartPreparationStatus,"ready_for_manual_phase31_start_approval");assert.strictEqual(done.record.phase31StartPreparationResult,done.record.phase31StartPreparationStatus);assert.strictEqual(done.record.nextStage,core.NEXT_STAGE);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(done.record[k],v,k);
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))assert.strictEqual(done.record[k],source[k]);
assert.strictEqual(core.render(done.record).phase31NotStarted,true);
assert.strictEqual(core.startPreparation(done.record,human,options).transitioned,false);
for(const k of core.ISSUE_FIELDS){
 const w=core.startPreparation(create({[k]:["manual investigation"]}),human,options).record;
 assert.strictEqual(core.completePreparation(core.submitPreparationForReview(w,human,options).record,completion,human,options).completed,false);
 const cleared=core.updatePreparation(w,{[k]:[]},human,options);assert(cleared.updated);assert.strictEqual(w[k].length,1);
 assert(core.completePreparation(core.submitPreparationForReview(cleared.record,human,options).record,completion,human,options).completed);
}
for(const patch of [{correctionRequired:true},{rollbackRequired:true},{workingTreeEvidence:{...input().workingTreeEvidence,status:"dirty",clean:false}},{mainOriginMainAlignmentEvidence:{...input().mainOriginMainAlignmentEvidence,originMainCommit:"other",aligned:false}},{requiredTestEvidence:{...input().requiredTestEvidence,passed:false}}])assert.strictEqual(core.completePreparation(review(patch),completion,human,options).completed,false);
for(const [result,field] of [[core.STATES[4],"rejectionReason"],[core.STATES[5],"incompleteReason"],[core.STATES[6],"blockedReason"]]){
 assert.strictEqual(core.completePreparation(reviewed,{result},human,options).completed,false);
 const r=core.completePreparation(reviewed,{result,[field]:"manual review needed"},human,options);assert(r.completed);assert(core.integrityIntact(r.record));assert.strictEqual(r.record.phase31StartPreparationStatus,result);
}
const invalid=core.invalidatePreparation(done.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record));assert.strictEqual(core.startPreparation(invalid.record,human,options).transitioned,false);
for(const patch of [{startTarget:"tampered"},{phase31StartPreparationSnapshotHash:"bad"},{phase31StartPreparationVersion:"bad"},{phase311SourceSnapshot:null}])assert.strictEqual(core.integrityIntact({...done.record,...patch}),false);
for(const patch of [{auditTrail:[]},{phase31DefinitionId:"other"},{result:"blocked"},{criticalIssues:["issue"]},{correctionRequired:true},{reviewedBy:""}]){
 const forged=stamp({...done.record,...patch},"phase31StartPreparation","phase311SourceSnapshot");assert.strictEqual(core.integrityIntact(forged),false);assert.strictEqual(core.invalidatePreparation(forged,human,options).transitioned,false);
}
assert.strictEqual(JSON.stringify(source),before);assert.strictEqual(sideEffects,0);
for(const k of ["startPhase31","approvePhase31Start","startNextPhase","saveStartPreparationRecords"])assert.strictEqual(core[k],undefined);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|setItem\s*\(|eval\s*\(|new\s+Function\s*\(/.test(code));
const browser={HashimotoPhase311PurposeScopeSafetyBoundaryDefinition:fixture.definitionApi};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase312StartPreparation);
assert.throws(()=>load(null),/Phase31-1/);assert.throws(()=>vm.runInNewContext(code,{}),/Phase31-1/);
console.log("Phase31-2 unit and browser cases: PASS");
if(!process.argv.includes("--unit-only")){
 const integration={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console,process};
 vm.runInNewContext(previous.replace('console.log("phase31PurposeScopeSafetyBoundaryDefinitionCore.test.js: PASS', 'globalThis.realDefinition=r.record;console.log("phase31PurposeScopeSafetyBoundaryDefinitionCore.test.js: PASS'),integration);
 const actual=integration.realDefinition,original=JSON.stringify(actual);
 let r=real.createStartPreparationRecord(actual,input(),human,options,[]);assert(r.created,r.reasons.join());
 r=real.startPreparation(r.record,human,options);assert(r.transitioned);
 r=real.submitPreparationForReview(r.record,human,options);assert(r.transitioned);
 r=real.completePreparation(r.record,completion,human,options);assert(r.completed);assert(real.integrityIntact(r.record));
 assert.strictEqual(r.record.phase31Started,false);assert.strictEqual(JSON.stringify(actual),original);
 console.log("phase31StartPreparationCore.test.js: PASS (real Phase31-1 and recursive Phase30 chain)");
}
