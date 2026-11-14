"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm");
const {setupAcceptance,createRealAcceptance}=require("./phase30-acceptance-fixture");
const {real,p3017,NOW,options,human,sourceName,ownName,code,copy,dependency,load,core,stamp,verificationHistory,source,src,input,getExternalCalls}=setupAcceptance();
const sourceBefore=JSON.stringify(src);
assert(core.validatePhase3017Eligibility(src).valid);
assert.strictEqual(core.NEXT_STAGE,"manual_phase30_final_closure");
assert.strictEqual(core.extractStabilizationClosureAcceptanceCandidates([src],[]).length,1);
for(const patch of [{phase:"phase29"},{phase:undefined},{stage:"wrong"},{stage:undefined},{currentStage:"wrong"},{nextStage:"wrong"},{nextStage:undefined},{[sourceName+"Status"]:"wrong"},{[sourceName+"Version"]:"wrong"},{verificationChecks:null},{verificationChecks:undefined},{verificationChecks:{}},{decisionBeforeSnapshot:{}},{verificationChecks:{extra:true}},{decisionAt:"bad"},{decisionSummary:""},{decisionAfterSnapshot:null},{executionResult:""},{decidedBy:""},{postExecutionSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{phase30Started:false},{manualPhase30StartCompleted:false},{auditTrail:[]},{recordVersion:0},{recordVersion:7},{phase3016SourceSnapshot:{chainValid:false}}])assert.strictEqual(core.validatePhase3017Eligibility(source(patch)).valid,false,JSON.stringify(patch));
for(const status of p3017.STATES.filter(v=>v!==p3017.STATES[9]))assert.strictEqual(core.validatePhase3017Eligibility(source({[sourceName+"Status"]:status})).valid,false,status);
for(const result of ["","rejected",...p3017.RESULTS.slice(1)])assert.strictEqual(core.validatePhase3017Eligibility(source({[sourceName+"Result"]:result})).valid,false,result);
for(const [k,v] of Object.entries(p3017.SAFETY))assert.strictEqual(core.validatePhase3017Eligibility(source({[k]:!v})).valid,false,k);
for(const k of p3017.REQUIRED_TRUE)assert.strictEqual(core.validatePhase3017Eligibility(source({[k]:false})).valid,false,k);
for(const k of ["errors","unresolvedIssues","criticalIssues","blockingConditions"])for(const value of [["issue"],null,"bad"])assert.strictEqual(core.validatePhase3017Eligibility(source({[k]:value})).valid,false,k);
for(const k of p3017.REFERENCE_IDS.concat(p3017.UPSTREAM_FIELDS))assert.strictEqual(core.validatePhase3017Eligibility(source({[k]:"mismatch"})).valid,false,k);
for(const patch of [{[sourceName+"SnapshotHash"]:"tampered"},{[sourceName+"Snapshot"]:{tampered:true}},{notes:"tampered"}])assert.strictEqual(core.validatePhase3017Eligibility({...src,...patch}).valid,false);
for(const patch of [{action:"automatic_execution"},{from:"wrong"},{to:"wrong"},{performedAt:"bad"},{explicitConfirmation:false},null]){const audit=verificationHistory();audit[4]=patch===null?null:{...audit[4],...patch};assert.strictEqual(core.validatePhase3017Eligibility(source({auditTrail:audit})).valid,false)}
assert.strictEqual(core.validatePhase3017Eligibility(source({recordVersion:1,auditTrail:[{...human,action:"manual_handoff",from:"",to:p3017.STATES[9]}]})).valid,false);
assert.strictEqual(core.validatePhase3017Eligibility({...src,auditTrail:new Array(6)}).valid,false);
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...dependency,...patch}).validatePhase3017Eligibility(src).valid,false);
const withUpdate=verificationHistory();withUpdate.splice(3,0,{...human,action:"update_"+p3017.CURRENT_STAGE,from:p3017.STATES[2],to:p3017.STATES[2]});assert(core.validatePhase3017Eligibility(source({recordVersion:7,auditTrail:withUpdate,warnings:["manual note"]})).valid);
const created=core.createStabilizationClosureAcceptanceRecord(src,input(),human,options,[]);assert(created.created,created.reasons.join());const initial=created.record;assert(Object.isFrozen(initial));assert.strictEqual(JSON.stringify(initial.verificationChecks),JSON.stringify(src.verificationChecks));
assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,input(),human,options,[initial]).created,false);
assert.strictEqual(core.extractStabilizationClosureAcceptanceCandidates([src],[initial]).length,0);
for(const field of core.ACCEPTANCE_FIELDS){const value=input();delete value[field];assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,value,human,options,[]).created,false,field)}
for(const field of core.SOURCE_EVIDENCE_FIELDS)assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,{...input(),[field]:"mismatch"},human,options,[]).created,false,field);
assert.strictEqual(core.beginStabilizationClosureAcceptance(initial,human,options).transitioned,false);
assert.strictEqual(core.submitStabilizationClosureAcceptanceReview(initial,human,options).transitioned,false);
const started=core.startStabilizationClosureAcceptance(initial,human,options);assert(started.transitioned);
const work=core.beginStabilizationClosureAcceptance(started.record,human,options);assert(work.transitioned);
for(const patch of [{phase3017SourceSnapshot:{}},{auditTrail:[]},{recordVersion:99},{protectedMode:false},{phase:"phase29"},{stage:"wrong"},{nextStage:"wrong"},{verificationChecks:{}},{acceptanceBeforeSnapshot:{}},{[ownName+"Status"]:core.STATES[4]},{[sourceName+"Id"]:"other"},{invalidatedAt:NOW},{expiresAt:NOW}]){assert.strictEqual(core.updateStabilizationClosureAcceptance(work.record,patch,human,options).updated,false);assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,{...input(),...patch},human,options,[]).created,false)}
for(const k of core.SOURCE_EVIDENCE_FIELDS)assert.strictEqual(core.updateStabilizationClosureAcceptance(work.record,{[k]:"changed"},human,options).updated,false);
const updated=core.updateStabilizationClosureAcceptance(work.record,{notes:"manual evidence checked"},human,options);assert(updated.updated);
const submitted=core.submitStabilizationClosureAcceptanceReview(updated.record,human,options);assert(submitted.transitioned);
const completion={result:core.RESULTS[0],acceptanceSummary:"approved for manual acceptance",acceptanceAfterSnapshot:{approved:true},acceptedAt:NOW};
for(const patch of [{acceptedAt:"bad"},{acceptanceSummary:""},{acceptanceAfterSnapshot:null},{actualResult:""},{difference:""},{dataIntegrity:false},{errors:["error"]},{errors:"bad"},{unresolvedIssues:["issue"]},{criticalIssues:["issue"]},{blockingConditions:["issue"]},{verificationChecks:p3017.PHASE3016_REFERENCE.VERIFIED_CHECKS}])assert.strictEqual(core.decideStabilizationClosureAcceptance(submitted.record,{...completion,...patch},human,options).decided,false,JSON.stringify(patch));
for(const k of core.REQUIRED_TRUE)assert.strictEqual(core.decideStabilizationClosureAcceptance(submitted.record,{...completion,[k]:false},human,options).decided,false,k);
const done=core.decideStabilizationClosureAcceptance(submitted.record,completion,human,options);assert(done.decided,done.reasons.join());assert.strictEqual(done.record[ownName+"Status"],core.STATES[4]);
const expectedChecks=["executionRecordPresent","planOnlyMaintained","protectedModeMaintained","privateLocalOnlyMaintained","noExternalCommunication","noExternalTransmission","noExternalExecution","auditHistoryContinuous","referenceChainContinuous","sourceUnchanged"];
for(const k of expectedChecks)assert.strictEqual(done.record.verificationChecks[k],true,k);
const handed=core.handoffToPhase30FinalClosure(done.record,human,options);assert(handed.handedOff);assert.strictEqual(handed.record[ownName+"Status"],core.STATES[9]);
assert.strictEqual(core.handoffToPhase30FinalClosure(initial,human,options).handedOff,false);
assert.strictEqual(core.handoffToPhase30FinalClosure(handed.record,human,options).handedOff,false);
assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,input(),human,options,[handed.record]).created,false);
for(const patch of [{errors:["late error"]},{executionRecordConfirmed:false},{verificationChecks:{...p3017.PHASE3016_REFERENCE.VERIFIED_CHECKS,sourceUnchanged:false}},{recordVersion:99},{phase3017SourceSnapshot:source({verificationChecks:null})}])assert.strictEqual(core.handoffToPhase30FinalClosure(stamp({...done.record,...patch},ownName),human,options).handedOff,false);
const otherResults=[{conditions:"c",conditionReason:"r",conditionOwner:"owner",conditionDeadline:NOW,conditionVerificationMethod:"manual",conditionReleaseCriteria:"verified"},{rejectionReason:"failed",rejectionImpact:"cannot proceed",requiredActions:["manual review"]},{incompleteReason:"missing evidence",missingItems:["evidence"]},{blockedReason:"blocked",blockedImpact:"cannot proceed",unblockingConditions:["manual review"]}];
otherResults.forEach((details,i)=>{const result=core.RESULTS[i+1];assert.strictEqual(core.decideStabilizationClosureAcceptance(submitted.record,{result},human,options).decided,false);const other=core.decideStabilizationClosureAcceptance(submitted.record,{result,...details},human,options);assert(other.decided);assert.strictEqual(JSON.stringify(other.record.verificationChecks),JSON.stringify(src.verificationChecks));assert.strictEqual(core.handoffToPhase30FinalClosure(other.record,human,options).handedOff,false)});
for(const h of [{},{...human,performedBy:false},{...human,reason:{}},{...human,performedBy:""},{...human,reason:""},{...human,performedAt:"bad"},{...human,explicitConfirmation:false}]){assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,input(),h,options,[]).created,false);assert.strictEqual(core.startStabilizationClosureAcceptance(initial,h,options).transitioned,false);assert.strictEqual(core.beginStabilizationClosureAcceptance(started.record,h,options).transitioned,false);assert.strictEqual(core.updateStabilizationClosureAcceptance(work.record,{notes:"updated"},h,options).updated,false);assert.strictEqual(core.submitStabilizationClosureAcceptanceReview(work.record,h,options).transitioned,false);assert.strictEqual(core.decideStabilizationClosureAcceptance(submitted.record,completion,h,options).decided,false);assert.strictEqual(core.handoffToPhase30FinalClosure(done.record,h,options).handedOff,false);assert.strictEqual(core.invalidateStabilizationClosureAcceptance(done.record,h,options).transitioned,false)}
const invalid=core.invalidateStabilizationClosureAcceptance(done.record,human,options);assert(invalid.transitioned);assert.strictEqual(core.handoffToPhase30FinalClosure(invalid.record,human,options).handedOff,false);
assert.strictEqual(core.startStabilizationClosureAcceptance({...initial,notes:"tampered"},human,options).transitioned,false);
assert.strictEqual(core.startStabilizationClosureAcceptance(stamp({...initial,expiredAt:NOW},ownName),human,options).transitioned,false);
for(const r of [initial,started.record,work.record,updated.record,submitted.record,done.record,handed.record,invalid.record]){assert(core.integrityIntact(r));for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k);assert.strictEqual(r.phase,"phase30");assert.strictEqual(r.stage,core.CURRENT_STAGE);assert.strictEqual(r.nextStage,core.NEXT_STAGE);assert.strictEqual(r.auditTrail.length,r.recordVersion);assert.strictEqual(JSON.stringify(r.phase3017SourceSnapshot),sourceBefore)}
const mem={value:null,setItem(k,v){assert.strictEqual(k,core.STORAGE_KEY);this.value=v},getItem(){return this.value}};
assert(core.saveStabilizationClosureAcceptanceRecords(mem,[handed.record,invalid.record]).saved);assert(core.loadStabilizationClosureAcceptanceRecords(mem).loaded);
for(const value of ["{",JSON.stringify({schemaVersion:"wrong",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]})]){mem.value=value;assert.strictEqual(core.loadStabilizationClosureAcceptanceRecords(mem).loaded,false)}
const browser={HashimotoPhase3017PostStartStabilizationClosurePostExecutionVerificationDecision:dependency};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3018PostStartStabilizationClosureAcceptance);assert.throws(()=>vm.runInNewContext(code,{}),/Phase30-17/);
assert.strictEqual(getExternalCalls(),0);assert.strictEqual(JSON.stringify(src),sourceBefore);assert.strictEqual(Object.isFrozen(src),false);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|child_process|execSync|spawnSync|setTimeout|setInterval|writeFile|mkdir|https?\.request/.test(code));
for(const key of ["automaticallyExecute","automaticallyAdvance","startNextPhase","automaticallyRollback","automaticallyReleaseConditions","rerunExecution"])assert.strictEqual(core[key],undefined);
for(const key of Object.keys(p3017.PHASE3016_REFERENCE.VERIFIED_CHECKS)){for(const value of [false,undefined,"true"]){const checks=copy(p3017.PHASE3016_REFERENCE.VERIFIED_CHECKS);checks[key]=value;assert.strictEqual(core.validatePhase3017Eligibility(source({verificationChecks:checks})).valid,false,key)}}
for(const k of ["expectedResult","actualResult","difference","performance","dataIntegrity","verificationDecisionResult"])assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,{...input(),[k]:"mismatch"},human,options,[]).created,false,k);
// Non-normal verification sources remain unchanged and are never converted into acceptance-ready decisions.
p3017.RESULTS.slice(1).forEach(result=>{const abnormal=source({[sourceName+"Result"]:result,[sourceName+"Status"]:p3017.RESULT_STATUS[result],verificationChecks:null}),before=JSON.stringify(abnormal);assert.strictEqual(core.validatePhase3017Eligibility(abnormal).valid,false,result);assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(abnormal,input(abnormal),human,options,[]).created,false,result);assert.strictEqual(core.extractStabilizationClosureAcceptanceCandidates([abnormal],[]).length,0);assert.strictEqual(JSON.stringify(abnormal),before)});
assert.strictEqual(core.startStabilizationClosureAcceptance(stamp({...initial,[ownName+"Result"]:core.RESULTS[0]},ownName),human,options).transitioned,false);
console.log("Phase30-18 unit cases: PASS");



// Release prior stages once copied into the next record so the large legacy snapshots can be collected.
// Integration: use all real manual APIs from Phase30-10 through Phase30-17.
const {actual,finalDecision,sourceHash}=createRealAcceptance();
assert.notStrictEqual(actual.record.phase3017SourceSnapshot,finalDecision.record);
assert.strictEqual(finalDecision.record[sourceName+"SnapshotHash"],sourceHash);assert(p3017.integrityIntact(finalDecision.record));
const broken=copy(finalDecision.record);broken.phase3016SourceSnapshot.phase3015SourceSnapshot=null;
assert.strictEqual(real.validatePhase3017Eligibility(broken).valid,false);
console.log("phase30PostStartStabilizationClosureAcceptanceCore.test.js: PASS (including real Phase30-17 source chain)");

// A prior acceptance cannot be bypassed by invalidating or expiring it.
for(const prior of [invalid.record,{...initial,expiredAt:NOW}]){
 assert.strictEqual(core.createStabilizationClosureAcceptanceRecord(src,input(),human,options,[prior]).created,false);
 assert.strictEqual(core.extractStabilizationClosureAcceptanceCandidates([src],[prior]).length,0);
}
// Rehashed records still require legal audit actions and transitions.
for(const action of ['automatic_acceptance','toString']){
 const changed=copy(done.record);changed.auditTrail[4].action=action;
 const forged=stamp(changed,ownName);
 assert.strictEqual(core.handoffToPhase30FinalClosure(forged,human,options).handedOff,false);
 core.saveStabilizationClosureAcceptanceRecords(mem,[forged]);
 assert.strictEqual(core.loadStabilizationClosureAcceptanceRecords(mem).loaded,false);
}
