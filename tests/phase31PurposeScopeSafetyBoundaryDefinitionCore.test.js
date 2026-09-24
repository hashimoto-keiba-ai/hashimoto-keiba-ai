"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path"),{createRequire}=require("module");
const real=require("../phase31-1-purpose-scope-safety-boundary-definition-core.js");
const coreCode=fs.readFileSync(require.resolve("../phase31-1-purpose-scope-safety-boundary-definition-core.js"),"utf8");
const previousPath=require.resolve("./phase30FinalClosureCore.test.js"),previous=fs.readFileSync(previousPath,"utf8");
const copy=v=>JSON.parse(JSON.stringify(v));
const NOW="2027-02-01T00:00:00Z",options={now:()=>NOW},human={performedBy:"human",reason:"manual Phase31 definition",explicitConfirmation:true,performedAt:NOW};
// The unit fixture keeps real Phase30-19 and Phase30-18 contracts, isolating only
// the older validator already isolated in their existing unit tests.
const fixture={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console:{log:()=>{}}};
vm.runInNewContext(previous.split("// Real recursive validators")[0]+"\nglobalThis.closureApi=core;globalThis.closureRecord=record;",fixture);
let forbiddenCalls=0;
const forbidden=()=>{forbiddenCalls++;throw Error("external or automatic operation forbidden")};
function load(dependency=fixture.closureApi){
 const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-19-phase30-final-closure-core.js");return dependency},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden},localStorage:{getItem:forbidden,setItem:forbidden}};
 vm.runInNewContext(coreCode,sandbox);return sandbox.module.exports;
}
const core=load(),source=copy(fixture.closureRecord),sourceBefore=JSON.stringify(source);
function input(){const r={};for(const k of core.CONTENT_FIELDS)r[k]=core.LIST_FIELDS.includes(k)?[k]:k;r.safetyBoundary=copy(core.SAFETY_BOUNDARY);for(const k of core.ISSUE_FIELDS)r[k]=[];for(const k of core.REQUIRED_TRUE)r[k]=true;return r}
function stamp(r,prefix="phase30FinalClosure",sourceField="phase3018SourceSnapshot"){
 const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];
 return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)};
}
function rejectSource(patch,rehash=true){
 const s=rehash?stamp({...source,...patch}):{...source,...patch},before=JSON.stringify(s);
 assert.strictEqual(core.validatePhase3019Eligibility(s).valid,false,JSON.stringify(patch));
 assert.strictEqual(core.createDefinition(s,input(),human,options,[]).created,false);
 assert.strictEqual(core.extractDefinitionCandidates([s],[]).length,0);assert.strictEqual(JSON.stringify(s),before);
}
assert(core.validatePhase3019Eligibility(source).valid);
for(const patch of [{createdAt:"2027-01-02T00:00:00Z"},{phase30FinalClosureId:"changed"}])rejectSource(patch);
assert.strictEqual(core.NEXT_STAGE,"manual_phase31_start_preparation");
assert.strictEqual(core.PHASE3019_REFERENCE.NEXT_STAGE,null);
assert.strictEqual(core.extractDefinitionCandidates([source,source],[]).length,1);
for(const patch of [{phase:"phase29"},{stage:"wrong"},{currentStage:"wrong"},{nextStage:"phase31"},{terminalStage:false},{phase30Status:"incomplete"},{phase30Completed:false},{phase30FinalClosureStatus:"phase30_final_closure_confirmed"},{phase30FinalClosureStatus:"invalidated"},{phase30FinalClosureStatus:"expired"},{phase30FinalClosureResult:"failed"},{phase30FinalClosureVersion:"bad"},{phase30FinalClosureId:""},{phase30ClosedAt:"bad"},{createdAt:""},{auditTrail:[]},{recordVersion:2},{phase3018SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"}])rejectSource(patch);
for(const result of ["conditional","rejected","incomplete","blocked"])rejectSource({phase30FinalClosureResult:result});
for(const [k,v] of Object.entries(fixture.closureApi.SAFETY))rejectSource({[k]:!v});
for(const k of fixture.closureApi.REFERENCE_IDS.concat(fixture.closureApi.UPSTREAM_FIELDS))rejectSource({[k]:"mismatch"});
for(const k of core.ISSUE_FIELDS)for(const v of [["issue"],null,"invalid"])rejectSource({[k]:v});
for(const patch of [{closureSummary:"tampered"},{phase30FinalClosureSnapshotHash:"bad"},{phase30FinalClosureSnapshot:{bad:true}}])rejectSource(patch,false);
for(const patch of [{action:"automatic_closure"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false},{performedAt:"bad"},null])rejectSource({auditTrail:[patch===null?null:{...source.auditTrail[0],...patch}]});
const missingBoundary=copy(source);delete missingBoundary.phase3018SourceSnapshot.safetyBoundary;rejectSource({phase3018SourceSnapshot:missingBoundary.phase3018SourceSnapshot});
for(const s of [null,undefined,{},[],"bad"])assert.strictEqual(core.validatePhase3019Eligibility(s).valid,false);
for(const patch of [{NEXT_STAGE:"phase31"},{TERMINAL_STAGE:false},{CURRENT_STAGE:"wrong"}])assert.strictEqual(load({...fixture.closureApi,...patch}).validatePhase3019Eligibility(source).valid,false);
for(const h of [{},null,{...human,explicitConfirmation:false},{...human,performedBy:1},{...human,reason:""},{...human,performedAt:"bad"}])assert.strictEqual(core.createDefinition(source,input(),h,options,[]).created,false);
for(const k of core.CONTENT_FIELDS){const bad=input();delete bad[k];assert.strictEqual(core.createDefinition(source,bad,human,options,[]).created,false,k)}
for(const k of core.REQUIRED_TRUE)assert.strictEqual(core.createDefinition(source,{...input(),[k]:false},human,options,[]).created,false,k);
for(const k of Object.keys(core.SAFETY_BOUNDARY)){const bad=input();bad.safetyBoundary[k]=false;assert.strictEqual(core.createDefinition(source,bad,human,options,[]).created,false,k)}
for(const k of core.ISSUE_FIELDS)assert.strictEqual(core.createDefinition(source,{...input(),[k]:"bad"},human,options,[]).created,false);
for(const patch of [{phase31Started:true},{stage:"wrong"},{nextStage:"wrong"},{phase30FinalClosureId:"other"},{phase3019SourceSnapshot:{}},{auditTrail:[]},{phase31DefinitionResult:core.STATES[3]}])assert.strictEqual(core.createDefinition(source,{...input(),...patch},human,options,[]).created,false);
const initialResult=core.createDefinition(source,input(),human,options,[]);assert(initialResult.created,initialResult.reasons.join());const initial=initialResult.record;
assert(core.integrityIntact(initial));assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.phase3019SourceSnapshot));assert.notStrictEqual(initial.phase3019SourceSnapshot,source);
assert.strictEqual(initial.phase31DefinitionStatus,core.STATES[0]);assert.strictEqual(initial.phase31Started,false);
assert.strictEqual(core.createDefinition(source,input(),human,options).created,false);
assert.strictEqual(core.submitDefinitionForReview(initial,human,options).transitioned,false);
let work=core.startDefinition(initial,human,options);assert(work.transitioned);work=work.record;
for(const patch of [{phase31Started:true},{protectedMode:false},{stage:"wrong"},{nextStage:"wrong"},{phase30FinalClosureId:"other"},{phase3019SourceSnapshot:{}},{auditTrail:[]},{phase31DefinitionStatus:core.STATES[4]},{safetyBoundary:{}},{phase31Purpose:""}])assert.strictEqual(core.updateDefinition(work,patch,human,options).updated,false);
let updated=core.updateDefinition(work,{notes:["manual check complete"]},human,options);assert(updated.updated);assert(core.integrityIntact(updated.record));
const review=core.submitDefinitionForReview(updated.record,human,options);assert(review.transitioned);
const completion={result:core.STATES[3],reviewedBy:"reviewer",reviewedAt:NOW,approvedBy:"approver",approvedAt:NOW,humanApprovalConfirmed:true};
for(const patch of [{reviewedBy:""},{reviewedAt:"bad"},{approvedBy:""},{approvedAt:"bad"},{humanApprovalConfirmed:false},{phase31Started:true},{unresolvedIssues:[]}])assert.strictEqual(core.completeDefinition(review.record,{...completion,...patch},human,options).completed,false);
assert.strictEqual(core.completeDefinition(review.record,completion,{},options).completed,false);
const done=core.completeDefinition(review.record,completion,human,options);assert(done.completed,done.reasons.join());assert(core.integrityIntact(done.record));
assert.strictEqual(done.record.phase31DefinitionStatus,"ready_for_manual_phase31_start_preparation");assert.strictEqual(done.record.phase31DefinitionResult,"phase31_purpose_scope_safety_boundary_defined");assert.strictEqual(done.record.nextStage,core.NEXT_STAGE);
assert.deepStrictEqual(Array.from(done.record.auditTrail.slice(-2),e=>e.to),[core.STATES[3],core.STATES[4]]);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(done.record[k],v,k);
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))assert.strictEqual(done.record[k],source[k]);
assert.strictEqual(core.render(done.record).phase31NotStarted,true);assert.strictEqual(core.startDefinition(done.record,human,options).transitioned,false);
for(const k of core.ISSUE_FIELDS){
 const tracked=core.createDefinition(source,{...input(),[k]:["manual investigation required"]},human,options,[]);assert(tracked.created);
 const w=core.startDefinition(tracked.record,human,options).record,r=core.submitDefinitionForReview(w,human,options).record;
 assert.strictEqual(core.completeDefinition(r,completion,human,options).completed,false,k);
 const cleared=core.updateDefinition(w,{[k]:[]},human,options);assert(cleared.updated);assert.strictEqual(w[k].length,1);
 assert(core.completeDefinition(core.submitDefinitionForReview(cleared.record,human,options).record,completion,human,options).completed);
}
for(const [result,field] of [[core.STATES[5],"rejectionReason"],[core.STATES[6],"incompleteReason"],[core.STATES[7],"blockedReason"]]){
 assert.strictEqual(core.completeDefinition(review.record,{result},human,options).completed,false);
 const nonNormal=core.completeDefinition(review.record,{result,[field]:"requires manual review"},human,options);assert(nonNormal.completed);assert(core.integrityIntact(nonNormal.record));assert.strictEqual(nonNormal.record.phase31DefinitionStatus,result);
 assert.strictEqual(core.completeDefinition(nonNormal.record,completion,human,options).completed,false);
}
const invalid=core.invalidateDefinition(done.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record));assert.strictEqual(core.startDefinition(invalid.record,human,options).transitioned,false);
for(const prior of [initial,done.record,invalid.record,{...done.record,expiredAt:NOW}]){assert.strictEqual(core.createDefinition(source,input(),human,options,[prior]).created,false);assert.strictEqual(core.extractDefinitionCandidates([source],[prior]).length,0)}
for(const patch of [{phase31Purpose:"tampered"},{phase31DefinitionSnapshotHash:"bad"},{phase31DefinitionVersion:"bad"},{phase31DefinitionSnapshot:{}},{phase3019SourceSnapshot:null}])assert.strictEqual(core.integrityIntact({...done.record,...patch}),false);
for(const patch of [{phase31Started:true},{nextStage:"phase31_started"},{auditTrail:[{...human,action:"manual_handoff_to_phase31_start_preparation",from:"",to:core.STATES[4]}],recordVersion:1},{phase30FinalClosureId:"other"},{phase31DefinitionResult:core.STATES[5]},{result:"blocked"},{criticalIssues:["issue"]}]){
 const forged=stamp({...done.record,...patch},"phase31Definition","phase3019SourceSnapshot");assert.strictEqual(core.integrityIntact(forged),false);assert.strictEqual(core.invalidateDefinition(forged,human,options).transitioned,false);
}
assert.strictEqual(core.integrityIntact(stamp({...invalid.record,humanApprovalConfirmed:false},"phase31Definition","phase3019SourceSnapshot")),false);
assert.strictEqual(JSON.stringify(source),sourceBefore);assert.strictEqual(forbiddenCalls,0);
for(const k of ["startPhase31","preparePhase31Start","startNextPhase","saveDefinitions"])assert.strictEqual(core[k],undefined);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|setItem\s*\(|eval\s*\(|new\s+Function\s*\(/.test(coreCode));
const browser={HashimotoPhase3019FinalClosure:fixture.closureApi};vm.runInNewContext(coreCode,browser);assert(browser.HashimotoPhase311PurposeScopeSafetyBoundaryDefinition);
assert.throws(()=>vm.runInNewContext(coreCode,{}),/Phase30-19 final closure definition is required/);
assert.throws(()=>load(null),/Phase30-19/);
console.log("Phase31-1 unit and browser cases: PASS");

if(!process.argv.includes("--unit-only")){
 // Run the unchanged Phase30-19 regression in full, then reuse its real final
 // closure for this integration. All recursive upstream validators remain real.
 const integration={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console};
 vm.runInNewContext(previous+"\nglobalThis.finalClosure=final.record;",integration);
 const actual=integration.finalClosure,before=JSON.stringify(actual);
 assert(real.validatePhase3019Eligibility(actual).valid);
 let r=real.createDefinition(actual,input(),human,options,[]);assert(r.created,r.reasons.join());
 r=real.startDefinition(r.record,human,options);assert(r.transitioned);
 r=real.submitDefinitionForReview(r.record,human,options);assert(r.transitioned);
 r=real.completeDefinition(r.record,completion,human,options);assert(r.completed,r.reasons.join());assert(real.integrityIntact(r.record));
 assert.strictEqual(r.record.phase31Started,false);assert.strictEqual(r.record.phase31DefinitionStatus,core.STATES[4]);assert.strictEqual(JSON.stringify(actual),before);
 console.log("phase31PurposeScopeSafetyBoundaryDefinitionCore.test.js: PASS (including unchanged Phase30-19 regression and real upstream chain)");
}
