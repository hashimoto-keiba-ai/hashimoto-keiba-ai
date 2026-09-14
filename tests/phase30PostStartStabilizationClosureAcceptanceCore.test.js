"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm");
const real=require("../phase30-18-phase30-post-start-stabilization-closure-acceptance-core.js"),p3017=real.PHASE3017_REFERENCE;
const NOW="2027-01-05T00:00:00Z",options={now:()=>new Date(NOW)},human={performedBy:"reviewer",reason:"manual record verification",explicitConfirmation:true,performedAt:NOW};
const sourceName="phase30PostStartStabilizationClosurePostExecutionVerificationDecision",ownName="phase30PostStartStabilizationClosureAcceptance";
const code=fs.readFileSync(require.resolve("../phase30-18-phase30-post-start-stabilization-closure-acceptance-core.js"),"utf8"),copy=v=>JSON.parse(JSON.stringify(v));
let externalCalls=0;const forbidden=()=>{externalCalls++;throw new Error("external operation forbidden")};
// Isolate only the upstream validator in unit cases; use the real Phase30-17 schema, input and integrity checks.
const dependency={...p3017,...Object.fromEntries(Object.keys(p3017).filter(k=>/^(create|start|begin|update|submit|complete|decide|handoff|invalidate|save|load)/.test(k)).map(k=>[k,forbidden])),validatePhase3016Eligibility:s=>({valid:!!(s&&s.chainValid),reasons:[]})};
function load(dep=dependency){const box={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-17-phase30-post-start-stabilization-closure-post-execution-verification-decision-core.js");return dep},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden}};vm.runInNewContext(code,box);return box.module.exports}
const core=load();
function stamp(r,name=sourceName){const b={...r};delete b[name+"Snapshot"];delete b[name+"SnapshotHash"];const snap=copy(b);delete snap[name===ownName?"phase3017SourceSnapshot":"phase3016SourceSnapshot"];return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:core.computeSnapshotHash(snap)}}
function fields(api,list){const r={};api[list].forEach(k=>r[k]=k);api.ARRAY_FIELDS.forEach(k=>r[k]=[]);api.REQUIRED_TRUE.forEach(k=>r[k]=true);return r}
function verificationHistory(){const a=p3017.STATES,p=p3017.CURRENT_STAGE;return [[p+"_creation","",a[0]],["start_"+p,a[0],a[1]],["begin_"+p+"_work",a[1],a[2]],["submit_"+p+"_review",a[2],a[3]],["decide_phase30_post_start_stabilization_closure_post_execution_verification",a[3],a[4]],["manual_handoff_to_phase30_post_start_stabilization_closure_acceptance",a[4],a[9]]].map(([action,from,to])=>({...human,action,from,to}))}
function source(patch={}){
 const verification={chainValid:true,phase30PostStartStabilizationClosurePostExecutionVerificationResult:p3017.PHASE3016_REFERENCE.RESULTS[0],verificationChecks:copy(p3017.PHASE3016_REFERENCE.VERIFIED_CHECKS)};
 const r={...fields(p3017,"DECISION_FIELDS"),...p3017.SAFETY,[sourceName+"Id"]:"decision-1",[sourceName+"Status"]:p3017.STATES[9],[sourceName+"Result"]:p3017.RESULTS[0],[sourceName+"Version"]:p3017.SCHEMA_VERSION,phase:"phase30",stage:p3017.CURRENT_STAGE,nextStage:p3017.NEXT_STAGE,phase30Started:true,manualPhase30StartCompleted:true,verificationChecks:copy(verification.verificationChecks),verificationResult:verification.phase30PostStartStabilizationClosurePostExecutionVerificationResult,decisionSummary:"approved",decisionAfterSnapshot:{approved:true},decisionAt:NOW,recordVersion:6,auditTrail:verificationHistory(),phase3016SourceSnapshot:verification};
 p3017.REFERENCE_IDS.concat(p3017.UPSTREAM_FIELDS).forEach(k=>r[k]=verification[k]=k+"-1");
 p3017.SOURCE_EVIDENCE_FIELDS.forEach(k=>verification[k]=copy(r[k]));
 r.decisionBeforeSnapshot={phase30PostStartStabilizationClosurePostExecutionVerificationId:r.phase30PostStartStabilizationClosurePostExecutionVerificationId,phase30PostStartStabilizationClosurePostExecutionVerificationSnapshotHash:r.phase30PostStartStabilizationClosurePostExecutionVerificationSnapshotHash,phase30PostStartStabilizationClosurePostExecutionVerificationVersion:r.phase30PostStartStabilizationClosurePostExecutionVerificationVersion};
 return stamp({...r,...patch});
}
const src=source(),sourceBefore=JSON.stringify(src);
function input(s=src){const r={...fields(core,"ACCEPTANCE_FIELDS"),verificationDecisionResult:s[sourceName+"Result"]};core.SOURCE_EVIDENCE_FIELDS.forEach(k=>r[k]=copy(s[k]));return r}
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
assert.strictEqual(externalCalls,0);assert.strictEqual(JSON.stringify(src),sourceBefore);assert.strictEqual(Object.isFrozen(src),false);
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
const p3016=p3017.PHASE3016_REFERENCE;
const p3015=p3016.PHASE3015_REFERENCE;
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

let realDecision=build(p3010.PHASE309_REFERENCE);
const f=fields(p3010,"FOLLOWUP_FIELDS");let followup=p3010.createStabilizationFollowupRecord(realDecision,f,human,options,[]);assert(followup.created,followup.reasons.join()); realDecision=null;followup=p3010.beginStabilizationFollowup(followup.record,human,options);followup=p3010.submitStabilizationFollowupReview(followup.record,human,options);followup=p3010.completeStabilizationFollowup(followup.record,{result:p3010.RESULTS[0],followupSummary:"complete",followupAfterSnapshot:{stable:true},completedBy:"human",completedAt:NOW},human,options);assert(followup.completed);followup=p3010.handoffToStabilizationClosureReview(followup.record,human,options);assert(followup.handedOff);

let review=p3011.createStabilizationClosureReviewRecord(followup.record,fields(p3011,"REVIEW_FIELDS"),human,options,[]);assert(review.created,review.reasons.join()); followup=null;review=p3011.beginStabilizationClosureReview(review.record,human,options);review=p3011.submitStabilizationClosureReview(review.record,human,options);review=p3011.completeStabilizationClosureReview(review.record,{result:p3011.RESULTS[0],reviewSummary:"ready",closureReviewAfterSnapshot:{ready:true},completedBy:"human",completedAt:NOW},human,options);assert(review.completed);review=p3011.handoffToStabilizationClosureDecision(review.record,human,options);assert(review.handedOff);

let decision=p3012.createStabilizationClosureDecisionRecord(review.record,fields(p3012,"DECISION_FIELDS"),human,options,[]);assert(decision.created,decision.reasons.join()); review=null;decision=p3012.beginStabilizationClosureDecision(decision.record,human,options);decision=p3012.submitStabilizationClosureDecisionReview(decision.record,human,options);decision=p3012.decideStabilizationClosure(decision.record,{result:p3012.RESULTS[0],decisionSummary:"approved",decisionAfterSnapshot:{ready:true},approvedBy:"human",approvedAt:NOW},human,options);assert(decision.decided);decision=p3012.handoffToStabilizationClosureExecutionPreparation(decision.record,human,options);assert(decision.handedOff);

let preparation=p3013.createStabilizationClosureExecutionPreparationRecord(decision.record,fields(p3013,"PREPARATION_FIELDS"),human,options,[]);assert(preparation.created,preparation.reasons.join()); decision=null;
preparation=p3013.startStabilizationClosureExecutionPreparation(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.beginStabilizationClosureExecutionPreparation(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.submitStabilizationClosureExecutionPreparationReview(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.completeStabilizationClosureExecutionPreparation(preparation.record,{result:p3013.RESULTS[0],preparationSummary:"ready",preparationAfterSnapshot:{ready:true},completedBy:"human",completedAt:NOW},human,options);assert(preparation.completed);
preparation=p3013.handoffToStabilizationClosureExecutionApproval(preparation.record,human,options);assert(preparation.handedOff);

let approval=p3014.createStabilizationClosureExecutionApprovalRecord(preparation.record,fields(p3014,"APPROVAL_FIELDS"),human,options,[]);assert(approval.created,approval.reasons.join()); preparation=null;
approval=p3014.startStabilizationClosureExecutionApproval(approval.record,human,options);assert(approval.transitioned);
approval=p3014.beginStabilizationClosureExecutionApproval(approval.record,human,options);assert(approval.transitioned);
approval=p3014.submitStabilizationClosureExecutionApprovalReview(approval.record,human,options);assert(approval.transitioned);
approval=p3014.decideStabilizationClosureExecutionApproval(approval.record,{result:p3014.RESULTS[0],approvalSummary:"approved",approvalAfterSnapshot:{approved:true},decisionBy:"approver",decisionAt:NOW},human,options);assert(approval.decided);
approval=p3014.handoffToStabilizationClosureExecution(approval.record,human,options);assert(approval.handedOff);

let execution=p3015.createStabilizationClosureExecutionRecord(approval.record,{...fields(p3015,"CREATION_FIELDS"),approvalResult:p3014.RESULTS[0]},human,options,[]);assert(execution.created,execution.reasons.join()); approval=null;
execution=p3015.startStabilizationClosureExecution(execution.record,human,options);assert(execution.transitioned);
execution=p3015.beginStabilizationClosureExecution(execution.record,human,options);assert(execution.transitioned);
execution=p3015.submitStabilizationClosureExecutionReview(execution.record,human,options);assert(execution.transitioned);
execution=p3015.completeStabilizationClosureExecution(execution.record,{result:p3015.RESULTS[0],executionStartedAt:NOW,executionCompletedAt:NOW,postExecutionSnapshot:{managementRecordOnly:true},executionResult:"management record completed"},human,options);assert(execution.completed);
execution=p3015.handoffToStabilizationClosurePostExecutionVerification(execution.record,human,options);assert(execution.handedOff);

const verificationInput=fields(p3016,"CREATION_FIELDS");p3016.SOURCE_EVIDENCE_FIELDS.forEach(k=>verificationInput[k]=copy(execution.record[k]));
let verification=p3016.createStabilizationClosurePostExecutionVerificationRecord(execution.record,verificationInput,human,options,[]);assert(verification.created,verification.reasons.join()); execution=null;
verification=p3016.startStabilizationClosurePostExecutionVerification(verification.record,human,options);assert(verification.transitioned);
verification=p3016.beginStabilizationClosurePostExecutionVerification(verification.record,human,options);assert(verification.transitioned);
verification=p3016.submitStabilizationClosurePostExecutionVerificationReview(verification.record,human,options);assert(verification.transitioned);
verification=p3016.completeStabilizationClosurePostExecutionVerification(verification.record,{result:p3016.RESULTS[0],actualResult:"management record matches",difference:"none",performance:"record check only",dataIntegrity:"intact",verificationStartedAt:NOW,verificationCompletedAt:NOW},human,options);assert(verification.completed);
verification=p3016.handoffToStabilizationClosurePostExecutionVerificationDecision(verification.record,human,options);assert(verification.handedOff);
const decisionInput=fields(p3017,"DECISION_FIELDS");decisionInput.verificationResult=verification.record.phase30PostStartStabilizationClosurePostExecutionVerificationResult;p3017.SOURCE_EVIDENCE_FIELDS.forEach(k=>decisionInput[k]=copy(verification.record[k]));
let finalDecision=p3017.createStabilizationClosurePostExecutionVerificationDecisionRecord(verification.record,decisionInput,human,options,[]);assert(finalDecision.created,finalDecision.reasons.join()); verification=null;
finalDecision=p3017.startStabilizationClosurePostExecutionVerificationDecision(finalDecision.record,human,options);assert(finalDecision.transitioned);
finalDecision=p3017.beginStabilizationClosurePostExecutionVerificationDecision(finalDecision.record,human,options);assert(finalDecision.transitioned);
finalDecision=p3017.submitStabilizationClosurePostExecutionVerificationDecisionReview(finalDecision.record,human,options);assert(finalDecision.transitioned);
finalDecision=p3017.decideStabilizationClosurePostExecutionVerification(finalDecision.record,{result:p3017.RESULTS[0],decisionSummary:"approved",decisionAfterSnapshot:{approved:true},decisionAt:NOW},human,options);assert(finalDecision.decided);
finalDecision=p3017.handoffToStabilizationClosureAcceptance(finalDecision.record,human,options);assert(finalDecision.handedOff);
assert(real.validatePhase3017Eligibility(finalDecision.record).valid);
const sourceHash=finalDecision.record[sourceName+"SnapshotHash"];
const actual=real.createStabilizationClosureAcceptanceRecord(finalDecision.record,input(finalDecision.record),human,options,[]);assert(actual.created,actual.reasons.join());assert(real.integrityIntact(actual.record));
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
