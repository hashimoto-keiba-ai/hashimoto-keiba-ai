"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),path=require("path"),{createRequire}=require("module");
const real=require("../phase31-3-phase31-start-approval-core.js"),p312=require("../phase31-2-phase31-start-preparation-core.js");
const model=require("../phase30-3-phase30-start-approval-core.js");
const code=fs.readFileSync(require.resolve("../phase31-3-phase31-start-approval-core.js"),"utf8");
const previousPath=require.resolve("./phase31StartPreparationCore.test.js"),previous=fs.readFileSync(previousPath,"utf8");
const copy=v=>JSON.parse(JSON.stringify(v)),NOW="2027-02-03T00:00:00Z",options={now:()=>NOW},human={performedBy:"approver",performedAt:NOW,reason:"manual start approval",explicitConfirmation:true};
// Reuse the preceding tested fixture with real Phase31-2/31-1 validators.
// Only older upstream isolation is inherited from their unit fixtures.
const fixture={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console:{log:()=>{}}};
vm.runInNewContext(previous.slice(0,previous.lastIndexOf('if(!process.argv.includes("--unit-only"))'))+"\nglobalThis.preparationApi=core;globalThis.preparationRecord=done.record;",fixture);
let forbiddenCalls=0;
const forbidden=()=>{forbiddenCalls++;throw Error("forbidden side effect")};
function load(dependency=fixture.preparationApi){
 const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase31-2-phase31-start-preparation-core.js");return dependency},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden},localStorage:{getItem:forbidden,setItem:forbidden}};
 vm.runInNewContext(code,sandbox);return sandbox.module.exports;
}
const core=load(),source=copy(fixture.preparationRecord),sourceBefore=JSON.stringify(source);
function input(patch={}){const r={};for(const k of core.APPROVAL_FIELDS)r[k]=k;for(const k of core.ISSUE_FIELDS)r[k]=[];for(const k of core.REQUIRED_TRUE)r[k]=true;return {...r,...patch}}
function stamp(r,prefix="phase31StartPreparation",sourceField="phase311SourceSnapshot"){
 const body=copy(r);delete body[prefix+"Snapshot"];delete body[prefix+"SnapshotHash"];delete body[sourceField];
 return {...r,[prefix+"Snapshot"]:body,[prefix+"SnapshotHash"]:core.computeSnapshotHash(body)};
}
const stampOwn=r=>stamp(r,"phase31StartApproval","phase312SourceSnapshot");
function rejectSource(patch,rehash=true){
 const s=rehash?stamp({...source,...patch}):{...source,...patch},before=JSON.stringify(s);
 assert.strictEqual(core.validatePhase312Eligibility(s).valid,false,JSON.stringify(patch));
 assert.strictEqual(core.createStartApprovalRecord(s,input(),human,options,[]).created,false);
 assert.strictEqual(core.extractStartApprovalCandidates([s],[]).length,0);assert.strictEqual(JSON.stringify(s),before);
}
assert.strictEqual(real.PHASE312_REFERENCE,p312);
for(const field of ["APPROVAL_FIELDS","REQUIRED_TRUE","ISSUE_FIELDS","STATES","RESULTS"])assert.strictEqual(JSON.stringify(core[field]),JSON.stringify(model[field]).replaceAll("phase30","phase31"),field);
assert.strictEqual(core.NEXT_STAGE,"manual_phase31_start_execution");assert(core.validatePhase312Eligibility(source).valid);
for(const patch of [{phase31StartPreparationStatus:"awaiting_manual_phase31_start_preparation"},{phase31StartPreparationResult:"blocked"},{phase31StartPreparationStatus:"invalidated"},{phase:"phase30"},{stage:"wrong"},{nextStage:"wrong"},{phase31StartPreparationVersion:"wrong"},{phase31DefinitionId:""},{phase311SourceSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{auditTrail:[]},{recordVersion:0},{recordVersion:1},{safetyBoundary:{}},{correctionRequired:true},{rollbackRequired:true},{reviewedBy:""}])rejectSource(patch);
for(const [k,v] of Object.entries(p312.SAFETY))rejectSource({[k]:!v});
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))rejectSource({[k]:"mismatch"},k!=="phase31StartPreparationSnapshotHash");
for(const k of core.ISSUE_FIELDS)for(const value of [["issue"],"bad",null,[1]])rejectSource({[k]:value});
for(const patch of [{startTarget:"tampered"},{phase31StartPreparationSnapshotHash:"wrong"},{phase31StartPreparationSnapshot:{}}])rejectSource(patch,false);
for(const patch of [{action:"automatic_approval"},{action:"toString"},{from:"wrong"},{to:"wrong"},{explicitConfirmation:false},{performedAt:"bad"}])rejectSource({auditTrail:source.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)});
for(const patch of [{phase31DefinitionId:"other"},{phase31DefinitionSnapshotHash:"bad"},{phase31DefinitionVersion:"bad"},{phase3019SourceSnapshot:null}])rejectSource({phase311SourceSnapshot:{...source.phase311SourceSnapshot,...patch}});
const brokenClosure=copy(source.phase311SourceSnapshot);brokenClosure.phase3019SourceSnapshot.phase30Completed=false;rejectSource({phase311SourceSnapshot:brokenClosure});
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...fixture.preparationApi,...patch}).validatePhase312Eligibility(source).valid,false);
for(const s of [null,undefined,{},[],"bad"])assert.strictEqual(core.validatePhase312Eligibility(s).valid,false);
for(const k of core.APPROVAL_FIELDS)for(const value of ["",null,1,{}])assert.strictEqual(core.createStartApprovalRecord(source,input({[k]:value}),human,options,[]).created,false,k);
for(const k of core.REQUIRED_TRUE)for(const value of [false,"true",undefined])assert.strictEqual(core.createStartApprovalRecord(source,input({[k]:value}),human,options,[]).created,false,k);
for(const k of core.ISSUE_FIELDS)for(const value of [null,"bad",[1]])assert.strictEqual(core.createStartApprovalRecord(source,input({[k]:value}),human,options,[]).created,false,k);
for(const patch of [{phase31Started:true},{phase312SourceSnapshot:{}},{auditTrail:[]},{nextStage:"started"},{approvalDecision:core.STATES[3]},{schemaVersion:"bad"},{unknown:true}])assert.strictEqual(core.createStartApprovalRecord(source,input(patch),human,options,[]).created,false);
const rawInput=input(),rawBefore=JSON.stringify(rawInput),first=core.createStartApprovalRecord(source,rawInput,human,options,[]);assert(first.created,first.reasons.join());
const initial=first.record;assert(core.integrityIntact(initial));assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.phase312SourceSnapshot));assert(!Object.isFrozen(source));assert(!Object.isFrozen(rawInput));
assert.notStrictEqual(initial.phase312SourceSnapshot,source);assert.strictEqual(JSON.stringify(rawInput),rawBefore);
assert.strictEqual(core.createStartApprovalRecord(source,input(),human,options).created,false);
assert.strictEqual(core.createStartApprovalRecord(source,input(),human,options,[initial]).created,false);
assert.strictEqual(core.extractStartApprovalCandidates([source,source],[]).length,1);assert.strictEqual(core.extractStartApprovalCandidates([source],[initial]).length,0);
assert.strictEqual(core.extractStartApprovalCandidates([source],undefined).length,0);
assert.strictEqual(core.submitApprovalForReview(initial,human,options).transitioned,false);
const work=core.startApprovalReview(initial,human,options).record;assert.strictEqual(work.phase31StartApprovalStatus,core.STATES[1]);
assert.strictEqual(core.startApprovalReview(work,human,options).transitioned,false);
assert.strictEqual(core.updateApproval(initial,{notes:"too early"},human,options).updated,false);
for(const k of core.PROTECTED_FIELDS)assert.strictEqual(core.updateApproval(work,{[k]:"tampered"},human,options).updated,false,k);
for(const patch of [{approvalTarget:""},{unknown:true},{approvedAt:NOW},{conditionalApprovalConditions:"injected"}])assert.strictEqual(core.updateApproval(work,patch,human,options).updated,false);
const changes={notes:"manually reviewed"},changesBefore=JSON.stringify(changes),updated=core.updateApproval(work,changes,human,options);assert(updated.updated);assert(core.integrityIntact(updated.record));assert.strictEqual(JSON.stringify(changes),changesBefore);
const reviewed=core.submitApprovalForReview(updated.record,human,options).record;assert.strictEqual(reviewed.phase31StartApprovalStatus,core.STATES[2]);
assert.strictEqual(core.updateApproval(reviewed,{notes:"too late"},human,options).updated,false);
const approve={result:core.STATES[3],approvedAt:NOW,reviewedAt:NOW},approveBefore=JSON.stringify(approve);
for(const patch of [{approvalConditions:"injected condition"},{approvedAt:NOW},{conditionOwner:"injected owner"},{unknown:true}]){
 const forged=stampOwn({...reviewed,...patch});assert.strictEqual(core.integrityIntact(forged),false);
 assert.strictEqual(core.decideStartApproval(forged,approve,human,options).completed,false);
}
for(const h of [null,{}, {...human,explicitConfirmation:false},{...human,performedBy:1},{...human,performedAt:"bad"},{...human,reason:""}]){
 assert.strictEqual(core.createStartApprovalRecord(source,input(),h,options,[]).created,false);
 assert.strictEqual(core.startApprovalReview(initial,h,options).transitioned,false);
 assert.strictEqual(core.updateApproval(work,{notes:"x"},h,options).updated,false);
 assert.strictEqual(core.submitApprovalForReview(work,h,options).transitioned,false);
 assert.strictEqual(core.decideStartApproval(reviewed,approve,h,options).completed,false);
 assert.strictEqual(core.invalidateApproval(reviewed,h,options).transitioned,false);
}
for(const patch of [{approvedAt:"bad"},{reviewedAt:"bad"},{approvedAt:undefined},{reviewedAt:undefined},{unresolvedIssues:[]},{phase31Started:true},{approvalConditions:"condition"},{rejectionReasons:["rejected"]}])assert.strictEqual(core.decideStartApproval(reviewed,{...approve,...patch},human,options).completed,false);
const approved=core.decideStartApproval(reviewed,approve,human,options);assert(approved.completed);assert(core.integrityIntact(approved.record));assert.strictEqual(JSON.stringify(approve),approveBefore);
assert.strictEqual(approved.record.phase31StartApprovalStatus,core.STATES[3]);assert.strictEqual(approved.record.phase31StartApprovalResult,core.STATES[3]);assert.strictEqual(approved.record.approvalDecision,core.STATES[3]);assert.strictEqual(approved.record.nextStage,core.NEXT_STAGE);
for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(approved.record[k],v,k);
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS))assert.strictEqual(approved.record[k],source[k]);
assert.strictEqual(core.render(approved.record).phase31NotStarted,true);assert.strictEqual(core.render(approved.record).startExecutionNotPerformed,true);
const conditional={result:core.STATES[4],approvalConditions:"conditions",conditionalApprovalConditions:["manual verification"],conditionReason:"risk",conditionOwner:"owner",conditionDeadline:"2027-03-01T00:00:00Z",conditionVerificationMethod:"manual review",conditionReleaseCriteria:"verified"};
for(const k of core.CONDITION_FIELDS){const bad={...conditional};delete bad[k];assert.strictEqual(core.decideStartApproval(reviewed,bad,human,options).completed,false,k)}
for(const patch of [{conditionDeadline:"bad"},{conditionOwner:7},{approvalConditions:[]},{conditionalApprovalConditions:[1]}])assert.strictEqual(core.decideStartApproval(reviewed,{...conditional,...patch},human,options).completed,false);
const conditioned=core.decideStartApproval(reviewed,conditional,human,options);assert(conditioned.completed);assert(core.integrityIntact(conditioned.record));assert.strictEqual(conditioned.record.phase31StartApprovalStatus,core.STATES[4]);
for(const k of core.ISSUE_FIELDS){
 const w=core.updateApproval(work,{[k]:["manual investigation"]},human,options);assert(w.updated);
 const r=core.submitApprovalForReview(w.record,human,options).record;
 assert.strictEqual(core.decideStartApproval(r,approve,human,options).completed,false,k);
 assert(core.decideStartApproval(r,conditional,human,options).completed);
 const cleared=core.updateApproval(w.record,{[k]:[]},human,options);assert(cleared.updated);assert.strictEqual(w.record[k].length,1);
}
for(const value of [undefined,[],"",[1],{}])assert.strictEqual(core.decideStartApproval(reviewed,{result:core.STATES[5],rejectionReasons:value},human,options).completed,false);
const rejected=core.decideStartApproval(reviewed,{result:core.STATES[5],rejectionReasons:["not approved"]},human,options);assert(rejected.completed);
const nonNormal=[conditioned.record,rejected.record];
for(const result of [core.STATES[6],core.STATES[7]]){const r=core.decideStartApproval(reviewed,{result},human,options);assert(r.completed);assert(core.integrityIntact(r.record));nonNormal.push(r.record)}
for(const r of [approved.record,...nonNormal]){
 assert(core.integrityIntact(r));assert.strictEqual(core.startApprovalReview(r,human,options).transitioned,false);
 assert.strictEqual(core.decideStartApproval(r,approve,human,options).completed,false);assert.strictEqual(core.updateApproval(r,{notes:"late"},human,options).updated,false);
 for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k);
}
const invalid=core.invalidateApproval(approved.record,human,options);assert(invalid.transitioned);assert(core.integrityIntact(invalid.record));assert.strictEqual(core.invalidateApproval(invalid.record,human,options).transitioned,false);
const expired=stampOwn({...initial,expiresAt:"2000-01-01"});
for(const r of [invalid.record,expired,stampOwn({...initial,expiredAt:NOW})]){
 assert.strictEqual(core.startApprovalReview(r,human,options).transitioned,false);assert.strictEqual(core.invalidateApproval(r,human,options).transitioned,false);
 assert.strictEqual(core.createStartApprovalRecord(source,input(),human,options,[r]).created,false);assert.strictEqual(core.extractStartApprovalCandidates([source],[r]).length,0);
}
for(const r of [null,undefined,{},[],"bad"]){assert.strictEqual(core.integrityIntact(r),false);assert.strictEqual(core.startApprovalReview(r,human,options).transitioned,false)}
for(const patch of [{approvalTarget:"tampered"},{phase31StartApprovalSnapshotHash:"bad"},{phase31StartApprovalSnapshot:{}},{phase31StartApprovalVersion:"bad"},{schemaVersion:"bad"},{phase312SourceSnapshot:null}])assert.strictEqual(core.integrityIntact({...approved.record,...patch}),false);
for(const patch of [{phase31StartApprovalId:"other"},{auditTrail:[]},{recordVersion:1},{phase31StartPreparationId:"other"},{result:"blocked"},{approvalDecision:core.STATES[4]},{criticalIssues:["issue"]},{approvedAt:"bad"},{phase31StartExecutionPerformed:true},{safetyBoundary:{}}]){
 const forged=stampOwn({...approved.record,...patch});assert.strictEqual(core.integrityIntact(forged),false);assert.strictEqual(core.invalidateApproval(forged,human,options).transitioned,false);
}
for(const patch of [{action:"toString"},{action:"automatic_start"},{explicitConfirmation:false},{from:"wrong"}])assert.strictEqual(core.integrityIntact(stampOwn({...approved.record,auditTrail:approved.record.auditTrail.map((e,i)=>i===0?{...e,...patch}:e)})),false);
assert.strictEqual(core.integrityIntact(stampOwn({...conditioned.record,conditionDeadline:"bad"})),false);
const mem={v:null,writes:0,setItem(key,value){assert.strictEqual(key,core.STORAGE_KEY);this.writes++;this.v=value},getItem(key){assert.strictEqual(key,core.STORAGE_KEY);return this.v}};
for(const r of [initial,approved.record,...nonNormal,invalid.record,expired]){assert(core.saveStartApprovalRecords(mem,[r]).saved);const loaded=core.loadStartApprovalRecords(mem);assert(loaded.loaded);assert(Object.isFrozen(loaded.records[0]));assert.strictEqual(JSON.stringify(loaded.records[0]),JSON.stringify(r))}
for(const records of [null,{},[{}],[approved.record,approved.record],[{...approved.record,approvalTarget:"tampered"}]]){const count=mem.writes;assert.strictEqual(core.saveStartApprovalRecords(mem,records).saved,false);assert.strictEqual(mem.writes,count)}
for(const value of ["{",JSON.stringify({schemaVersion:"bad",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[approved.record,approved.record]})]){mem.v=value;assert.strictEqual(core.loadStartApprovalRecords(mem).loaded,false)}
assert.strictEqual(core.saveStartApprovalRecords({setItem(){throw Error("unavailable")}},[]).saved,false);assert.strictEqual(core.loadStartApprovalRecords({getItem(){throw Error("unavailable")}}).loaded,false);
assert(core.saveStartApprovalRecords(mem,[]).saved);assert(core.loadStartApprovalRecords(mem).loaded);
assert.strictEqual(JSON.stringify(source),sourceBefore);assert.strictEqual(forbiddenCalls,0);assert(Object.isFrozen(core));assert(Object.isFrozen(core.SAFETY));
for(const k of ["startPhase31","executePhase31Start","advancePhase31","releaseConditions","startNextPhase"])assert.strictEqual(core[k],undefined);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|child_process|execSync|spawnSync|setInterval\s*\(|setTimeout\s*\(|writeFile|mkdir|localStorage|eval\s*\(|new\s+Function\s*\(/.test(code));
const browser={HashimotoPhase312StartPreparation:fixture.preparationApi};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase313StartApproval);
assert.throws(()=>load(null),/Phase31-2 start preparation definition is required/);assert.throws(()=>vm.runInNewContext(code,{}),/Phase31-2 start preparation definition is required/);
console.log("Phase31-3 unit, storage and browser cases: PASS");
if(!process.argv.includes("--unit-only")){
 // Run unchanged Phase31-2 and Phase31-1 regressions, then reuse the real source.
 const integration={require:createRequire(previousPath),__dirname:path.dirname(previousPath),console,process};
 vm.runInNewContext(previous.replace('console.log("phase31StartPreparationCore.test.js: PASS','globalThis.realPreparation=r.record;console.log("phase31StartPreparationCore.test.js: PASS'),integration);
 const actual=integration.realPreparation,before=JSON.stringify(actual),data=input(),dataBefore=JSON.stringify(data);
 let r=real.createStartApprovalRecord(actual,data,human,options,[]);assert(r.created,r.reasons.join());
 r=real.startApprovalReview(r.record,human,options);assert(r.transitioned);
 r=real.submitApprovalForReview(r.record,human,options);assert(r.transitioned);
 r=real.decideStartApproval(r.record,approve,human,options);assert(r.completed);assert(real.integrityIntact(r.record));
 assert.strictEqual(r.record.phase31StartApprovalStatus,"ready_for_manual_phase31_start_execution");assert.strictEqual(r.record.phase31Started,false);assert.strictEqual(r.record.phase31StartExecutionPerformed,false);
 assert.strictEqual(JSON.stringify(actual),before);assert.strictEqual(JSON.stringify(data),dataBefore);
 console.log("phase31StartApprovalCore.test.js: PASS (including unchanged Phase31-2/31-1 regressions and real Phase30 reference chain)");
}
