"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm");
const real=require("../phase30-19-phase30-final-closure-core.js");
const code=fs.readFileSync(require.resolve("../phase30-19-phase30-final-closure-core.js"),"utf8");
const previous=fs.readFileSync(require.resolve("./phase30PostStartStabilizationClosureAcceptanceCore.test.js"),"utf8");
const copy=v=>JSON.parse(JSON.stringify(v));
const NOW="2027-01-05T00:00:00Z",options={now:()=>NOW},human={performedBy:"reviewer",reason:"Phase30 complete",performedAt:NOW,explicitConfirmation:true};
const input={closureSummary:"Phase30 complete",completionCriteria:"all accepted",finalConfirmations:"chain and safety checked"};
const sourceName="phase30PostStartStabilizationClosureAcceptance";
// Reuse the preceding stage's tested fixture without changing its tests or production code.
const fixture={require,__dirname,console:{log:()=>{}}};
vm.runInNewContext(previous.split("// Release prior stages")[0]+"\nglobalThis.acceptanceApi=core;globalThis.acceptanceSource=handed.record;",fixture);
let externalCalls=0;
const forbidden=()=>{externalCalls++;throw Error("side effect forbidden")};
const box={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-18-phase30-post-start-stabilization-closure-acceptance-core.js");return fixture.acceptanceApi},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,Worker:forbidden,setTimeout:forbidden,setInterval:forbidden,localStorage:{getItem:forbidden,setItem:forbidden},navigator:{sendBeacon:forbidden},process:{},document:{}};
vm.runInNewContext(code,box);
const core=box.module.exports,api=fixture.acceptanceApi,source=copy(fixture.acceptanceSource),before=JSON.stringify(source);
function stamp(s){const body=copy(s);delete body[sourceName+"Snapshot"];delete body[sourceName+"SnapshotHash"];delete body.phase3017SourceSnapshot;return {...s,[sourceName+"Snapshot"]:body,[sourceName+"SnapshotHash"]:core.computeSnapshotHash(body)}}
function reject(patch,rehash=true){const s=rehash?stamp({...source,...patch}):{...source,...patch},before=JSON.stringify(s);assert.strictEqual(core.validatePhase3018Eligibility(s).valid,false,JSON.stringify(patch));assert.strictEqual(core.createPhase30FinalClosureRecord(s,input,human,options,[]).created,false);assert.strictEqual(core.extractPhase30FinalClosureCandidates([s],[]).length,0);assert.strictEqual(JSON.stringify(s),before)}
assert(core.validatePhase3018Eligibility(source).valid);
for(const malformed of [null,undefined,false,"bad",[],{}])assert.strictEqual(core.validatePhase3018Eligibility(malformed).valid,false);
for(const patch of [{result:"failed"},{phase30Started:false},{manualPhase30StartCompleted:false},{nextPhaseAutomaticallyStarted:true}])reject(patch);
for(const patch of [{phase:"phase29"},{stage:"wrong"},{currentStage:"wrong"},{nextStage:"wrong"},{[sourceName+"Version"]:"wrong"},{acceptedAt:"bad"},{acceptanceSummary:""},{acceptanceAfterSnapshot:{}},{acceptanceBeforeSnapshot:{}},{auditTrail:[]},{recordVersion:1},{phase3017SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"}])reject(patch);
for(const status of api.STATES.filter(s=>s!=="ready_for_manual_phase30_final_closure"))reject({[sourceName+"Status"]:status});
for(const result of ["",...api.RESULTS.slice(1),"conditional","rejected","failed","incomplete","blocked"])reject({[sourceName+"Result"]:result});
for(const [k,v] of Object.entries(api.SAFETY))reject({[k]:!v});
for(const k of api.REQUIRED_TRUE)reject({[k]:false});
for(const k of ["errors",...api.ISSUE_FIELDS])for(const value of [["issue"],null,"invalid"])reject({[k]:value});
for(const k of api.REFERENCE_IDS.concat(api.UPSTREAM_FIELDS))reject({[k]:"mismatch"});
for(const patch of [{notes:"tampered"},{[sourceName+"SnapshotHash"]:"tampered"},{[sourceName+"Snapshot"]:{}}])reject(patch,false);
for(const patch of [{action:"automatic_acceptance"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false},{performedAt:"bad"},null]){const audit=copy(source.auditTrail);audit[4]=patch===null?null:{...audit[4],...patch};reject({auditTrail:audit})}
const created=core.createPhase30FinalClosureRecord(source,input,human,options,[]);assert(created.created,created.reasons.join());
const record=created.record;
assert(core.integrityIntact(record));assert(core.safetyIntact(record));assert(Object.isFrozen(record));assert(Object.isFrozen(record.phase3018SourceSnapshot));assert.notStrictEqual(record.phase3018SourceSnapshot,source);
assert.strictEqual(record.phase30FinalClosureStatus,"phase30_final_closed");assert.strictEqual(record.phase30Status,"closed");assert.strictEqual(record.phase30Completed,true);assert.strictEqual(record.nextStage,null);assert.strictEqual(core.NEXT_STAGE,null);assert.strictEqual(core.TERMINAL_STAGE,true);
assert.strictEqual(record.auditTrail[0].explicitConfirmation,true);
for(const [key,value] of Object.entries(core.SAFETY))assert.strictEqual(record[key],value,key);
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))assert.strictEqual(record[k],source[k]);
for(const prior of [record,{...record,invalidatedAt:NOW},{...record,expiredAt:NOW},{...record,[sourceName+"SnapshotHash"]:"changed"}]){assert.strictEqual(core.createPhase30FinalClosureRecord(source,input,human,options,[prior]).created,false);assert.strictEqual(core.extractPhase30FinalClosureCandidates([source],[prior]).length,0)}
assert.strictEqual(core.extractPhase30FinalClosureCandidates([source,source],[]).length,1);
assert.strictEqual(core.createPhase30FinalClosureRecord(source,input,human,options).created,false);
for(const h of [null,{}, {...human,explicitConfirmation:false},{...human,performedBy:""},{...human,reason:7},{...human,performedAt:"bad"}])assert.strictEqual(core.createPhase30FinalClosureRecord(source,input,h,options,[]).created,false);
for(const k of core.CLOSURE_FIELDS)assert.strictEqual(core.createPhase30FinalClosureRecord(source,{...input,[k]:""},human,options,[]).created,false);
for(const k of ["protectedMode","phase","nextStage","auditTrail","phase3018SourceSnapshot","phase30FinalClosureStatus"])assert.strictEqual(core.createPhase30FinalClosureRecord(source,{...input,[k]:false},human,options,[]).created,false);
for(const patch of [{phase30FinalClosureStatus:"ready"},{nextStage:"phase31"},{protectedMode:false},{auditTrail:[]},{phase3018SourceSnapshot:null},{closureSummary:"tampered"}])assert.strictEqual(core.integrityIntact({...record,...patch}),false);
for(const patch of [{auditTrail:[{...record.auditTrail[0],explicitConfirmation:false}]},{[core.REFERENCE_IDS[1]]:"mismatch"},{nextStage:"phase31"}]){
 const forged={...copy(record),...patch},snapshot=copy(forged);delete snapshot.phase3018SourceSnapshot;delete snapshot.phase30FinalClosureSnapshot;delete snapshot.phase30FinalClosureSnapshotHash;
 forged.phase30FinalClosureSnapshot=snapshot;forged.phase30FinalClosureSnapshotHash=core.computeSnapshotHash(snapshot);assert.strictEqual(core.integrityIntact(forged),false);
}
assert.strictEqual(JSON.stringify(source),before);
assert.strictEqual(externalCalls,0);
assert(!/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|setTimeout|setInterval|Worker|exec|spawn|writeFile|setItem)\s*\(/.test(code));
const browser={HashimotoPhase3018PostStartStabilizationClosureAcceptance:api};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3019FinalClosure);assert.throws(()=>vm.runInNewContext(code,{}),/Phase30-18/);
console.log("Phase30-19 dedicated unit cases: PASS");

// Real recursive validators through Phase30-1 and the Phase29 terminal.
const integration={require,__dirname,console:{log:()=>{}}};
vm.runInNewContext(previous+`\nlet ready=actual.record;
ready=real.startStabilizationClosureAcceptance(ready,human,options).record;
ready=real.beginStabilizationClosureAcceptance(ready,human,options).record;
ready=real.submitStabilizationClosureAcceptanceReview(ready,human,options).record;
ready=real.decideStabilizationClosureAcceptance(ready,completion,human,options).record;
ready=real.handoffToPhase30FinalClosure(ready,human,options).record;
globalThis.readySource=ready;`,integration);
const actualSource=integration.readySource,actualBefore=JSON.stringify(actualSource);
assert(real.validatePhase3018Eligibility(actualSource).valid);
const final=real.createPhase30FinalClosureRecord(actualSource,input,human,options,[]);assert(final.created,final.reasons.join());assert(real.integrityIntact(final.record));
assert.strictEqual(JSON.stringify(actualSource),actualBefore);
const broken=copy(actualSource);broken.phase3017SourceSnapshot.phase3016SourceSnapshot=null;
assert.strictEqual(real.validatePhase3018Eligibility(broken).valid,false);
console.log("phase30FinalClosureCore.test.js: PASS (real Phase30-18 acceptance and recursive source chain)");
