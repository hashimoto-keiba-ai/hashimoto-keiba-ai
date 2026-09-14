"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm");
const real=require("../phase30-17-phase30-post-start-stabilization-closure-post-execution-verification-decision-core.js"),p3016=real.PHASE3016_REFERENCE;
const NOW="2027-01-05T00:00:00Z",options={now:()=>new Date(NOW)},human={performedBy:"reviewer",reason:"manual record verification",explicitConfirmation:true,performedAt:NOW};
const sourceName="phase30PostStartStabilizationClosurePostExecutionVerification",ownName="phase30PostStartStabilizationClosurePostExecutionVerificationDecision";
const code=fs.readFileSync(require.resolve("../phase30-17-phase30-post-start-stabilization-closure-post-execution-verification-decision-core.js"),"utf8"),copy=v=>JSON.parse(JSON.stringify(v));
let externalCalls=0;const forbidden=()=>{externalCalls++;throw new Error("external operation forbidden")};
// Isolate only the upstream validator in unit cases; use the real Phase30-16 schema, input and integrity checks.
const dependency={...p3016,...Object.fromEntries(Object.keys(p3016).filter(k=>/^(create|start|begin|update|submit|complete|handoff|invalidate|save|load)/.test(k)).map(k=>[k,forbidden])),validatePhase3015Eligibility:s=>({valid:!!(s&&s.chainValid),reasons:[]})};
function load(dep=dependency){const box={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-16-phase30-post-start-stabilization-closure-post-execution-verification-core.js");return dep},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden}};vm.runInNewContext(code,box);return box.module.exports}
const core=load();
function stamp(r,name=sourceName){const b={...r};delete b[name+"Snapshot"];delete b[name+"SnapshotHash"];const snap=copy(b);delete snap[name===ownName?"phase3016SourceSnapshot":"phase3015SourceSnapshot"];return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:core.computeSnapshotHash(snap)}}
function fields(api,list){const r={};api[list].forEach(k=>r[k]=k);api.ARRAY_FIELDS.forEach(k=>r[k]=[]);api.REQUIRED_TRUE.forEach(k=>r[k]=true);return r}
function verificationHistory(){const a=p3016.STATES,p=p3016.CURRENT_STAGE;return [[p+"_creation","",a[0]],["start_"+p,a[0],a[1]],["begin_"+p+"_work",a[1],a[2]],["submit_"+p+"_review",a[2],a[3]],["complete_"+p,a[3],a[4]],["manual_handoff_to_phase30_post_start_stabilization_closure_post_execution_verification_decision",a[4],a[9]]].map(([action,from,to])=>({...human,action,from,to}))}
function source(patch={}){
 const execution={chainValid:true};
 const r={...fields(p3016,"VERIFICATION_FIELDS"),...p3016.SAFETY,[sourceName+"Id"]:"verification-1",[sourceName+"Status"]:p3016.STATES[9],[sourceName+"Result"]:p3016.RESULTS[0],[sourceName+"Version"]:p3016.SCHEMA_VERSION,phase:"phase30",stage:p3016.CURRENT_STAGE,nextStage:p3016.NEXT_STAGE,phase30Started:true,manualPhase30StartCompleted:true,verificationChecks:copy(p3016.VERIFIED_CHECKS),verificationStartedAt:NOW,verificationCompletedAt:NOW,preExecutionSnapshot:{ready:true},postExecutionSnapshot:{managementRecordCompleted:true},recordVersion:6,auditTrail:verificationHistory(),phase3015SourceSnapshot:execution};
 p3016.REFERENCE_IDS.concat(p3016.UPSTREAM_FIELDS).forEach(k=>r[k]=execution[k]=k+"-1");
 p3016.SOURCE_EVIDENCE_FIELDS.forEach(k=>execution[k]=copy(r[k]));
 r.verificationBeforeSnapshot={phase30PostStartStabilizationClosureExecutionId:r.phase30PostStartStabilizationClosureExecutionId,phase30PostStartStabilizationClosureExecutionSnapshotHash:r.phase30PostStartStabilizationClosureExecutionSnapshotHash,phase30PostStartStabilizationClosureExecutionVersion:r.phase30PostStartStabilizationClosureExecutionVersion};
 return stamp({...r,...patch});
}
const src=source(),sourceBefore=JSON.stringify(src);
function input(s=src){const r={...fields(core,"DECISION_FIELDS"),verificationResult:s[sourceName+"Result"]};core.SOURCE_EVIDENCE_FIELDS.forEach(k=>r[k]=copy(s[k]));return r}
assert(core.validatePhase3016Eligibility(src).valid);
assert.strictEqual(core.NEXT_STAGE,"manual_phase30_post_start_stabilization_closure_acceptance");
assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationDecisionCandidates([src],[]).length,1);
for(const patch of [{phase:"phase29"},{phase:undefined},{stage:"wrong"},{stage:undefined},{currentStage:"wrong"},{nextStage:"wrong"},{nextStage:undefined},{[sourceName+"Status"]:"wrong"},{[sourceName+"Version"]:"wrong"},{verificationChecks:null},{verificationChecks:undefined},{verificationChecks:{}},{verificationBeforeSnapshot:{}},{verificationChecks:{extra:true}},{verificationStartedAt:"bad"},{verificationCompletedAt:"bad"},{verificationCompletedAt:"2000-01-01"},{executionResult:""},{verifiedBy:""},{postExecutionSnapshot:null},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{phase30Started:false},{manualPhase30StartCompleted:false},{auditTrail:[]},{recordVersion:0},{recordVersion:7},{phase3015SourceSnapshot:{chainValid:false}}])assert.strictEqual(core.validatePhase3016Eligibility(source(patch)).valid,false,JSON.stringify(patch));
for(const status of p3016.STATES.filter(v=>v!==p3016.STATES[9]))assert.strictEqual(core.validatePhase3016Eligibility(source({[sourceName+"Status"]:status})).valid,false,status);
for(const result of ["",...p3016.RESULTS.slice(1)])assert.strictEqual(core.validatePhase3016Eligibility(source({[sourceName+"Result"]:result})).valid,false,result);
for(const [k,v] of Object.entries(p3016.SAFETY))assert.strictEqual(core.validatePhase3016Eligibility(source({[k]:!v})).valid,false,k);
for(const k of p3016.REQUIRED_TRUE)assert.strictEqual(core.validatePhase3016Eligibility(source({[k]:false})).valid,false,k);
for(const k of ["errors","unresolvedIssues","criticalIssues","blockingConditions"])for(const value of [["issue"],null,"bad"])assert.strictEqual(core.validatePhase3016Eligibility(source({[k]:value})).valid,false,k);
for(const k of p3016.REFERENCE_IDS.concat(p3016.UPSTREAM_FIELDS))assert.strictEqual(core.validatePhase3016Eligibility(source({[k]:"mismatch"})).valid,false,k);
for(const patch of [{[sourceName+"SnapshotHash"]:"tampered"},{[sourceName+"Snapshot"]:{tampered:true}},{notes:"tampered"}])assert.strictEqual(core.validatePhase3016Eligibility({...src,...patch}).valid,false);
for(const patch of [{action:"automatic_execution"},{from:"wrong"},{to:"wrong"},{performedAt:"bad"},{explicitConfirmation:false},null]){const audit=verificationHistory();audit[4]=patch===null?null:{...audit[4],...patch};assert.strictEqual(core.validatePhase3016Eligibility(source({auditTrail:audit})).valid,false)}
assert.strictEqual(core.validatePhase3016Eligibility(source({recordVersion:1,auditTrail:[{...human,action:"manual_handoff",from:"",to:p3016.STATES[9]}]})).valid,false);
assert.strictEqual(core.validatePhase3016Eligibility({...src,auditTrail:new Array(6)}).valid,false);
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...dependency,...patch}).validatePhase3016Eligibility(src).valid,false);
const withUpdate=verificationHistory();withUpdate.splice(3,0,{...human,action:"update_"+p3016.CURRENT_STAGE,from:p3016.STATES[2],to:p3016.STATES[2]});assert(core.validatePhase3016Eligibility(source({recordVersion:7,auditTrail:withUpdate,warnings:["manual note"]})).valid);
const created=core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,input(),human,options,[]);assert(created.created,created.reasons.join());const initial=created.record;assert(Object.isFrozen(initial));assert.strictEqual(JSON.stringify(initial.verificationChecks),JSON.stringify(src.verificationChecks));
assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,input(),human,options,[initial]).created,false);
assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationDecisionCandidates([src],[initial]).length,0);
for(const field of core.DECISION_FIELDS){const value=input();delete value[field];assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,value,human,options,[]).created,false,field)}
for(const field of core.SOURCE_EVIDENCE_FIELDS)assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,{...input(),[field]:"mismatch"},human,options,[]).created,false,field);
assert.strictEqual(core.beginStabilizationClosurePostExecutionVerificationDecision(initial,human,options).transitioned,false);
assert.strictEqual(core.submitStabilizationClosurePostExecutionVerificationDecisionReview(initial,human,options).transitioned,false);
const started=core.startStabilizationClosurePostExecutionVerificationDecision(initial,human,options);assert(started.transitioned);
const work=core.beginStabilizationClosurePostExecutionVerificationDecision(started.record,human,options);assert(work.transitioned);
for(const patch of [{phase3016SourceSnapshot:{}},{auditTrail:[]},{recordVersion:99},{protectedMode:false},{phase:"phase29"},{stage:"wrong"},{nextStage:"wrong"},{verificationChecks:{}},{decisionBeforeSnapshot:{}},{[ownName+"Status"]:core.STATES[4]},{[sourceName+"Id"]:"other"},{invalidatedAt:NOW},{expiresAt:NOW}]){assert.strictEqual(core.updateStabilizationClosurePostExecutionVerificationDecision(work.record,patch,human,options).updated,false);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,{...input(),...patch},human,options,[]).created,false)}
for(const k of core.SOURCE_EVIDENCE_FIELDS)assert.strictEqual(core.updateStabilizationClosurePostExecutionVerificationDecision(work.record,{[k]:"changed"},human,options).updated,false);
const updated=core.updateStabilizationClosurePostExecutionVerificationDecision(work.record,{notes:"manual evidence checked"},human,options);assert(updated.updated);
const submitted=core.submitStabilizationClosurePostExecutionVerificationDecisionReview(updated.record,human,options);assert(submitted.transitioned);
const completion={result:core.RESULTS[0],decisionSummary:"approved for manual acceptance",decisionAfterSnapshot:{approved:true},decisionAt:NOW};
for(const patch of [{decisionAt:"bad"},{decisionSummary:""},{decisionAfterSnapshot:null},{actualResult:""},{difference:""},{dataIntegrity:false},{errors:["error"]},{errors:"bad"},{unresolvedIssues:["issue"]},{criticalIssues:["issue"]},{blockingConditions:["issue"]},{verificationChecks:p3016.VERIFIED_CHECKS}])assert.strictEqual(core.decideStabilizationClosurePostExecutionVerification(submitted.record,{...completion,...patch},human,options).decided,false,JSON.stringify(patch));
for(const k of core.REQUIRED_TRUE)assert.strictEqual(core.decideStabilizationClosurePostExecutionVerification(submitted.record,{...completion,[k]:false},human,options).decided,false,k);
const done=core.decideStabilizationClosurePostExecutionVerification(submitted.record,completion,human,options);assert(done.decided,done.reasons.join());assert.strictEqual(done.record[ownName+"Status"],core.STATES[4]);
const expectedChecks=["executionRecordPresent","planOnlyMaintained","protectedModeMaintained","privateLocalOnlyMaintained","noExternalCommunication","noExternalTransmission","noExternalExecution","auditHistoryContinuous","referenceChainContinuous","sourceUnchanged"];
for(const k of expectedChecks)assert.strictEqual(done.record.verificationChecks[k],true,k);
const handed=core.handoffToStabilizationClosureAcceptance(done.record,human,options);assert(handed.handedOff);assert.strictEqual(handed.record[ownName+"Status"],core.STATES[9]);
assert.strictEqual(core.handoffToStabilizationClosureAcceptance(initial,human,options).handedOff,false);
assert.strictEqual(core.handoffToStabilizationClosureAcceptance(handed.record,human,options).handedOff,false);
assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,input(),human,options,[handed.record]).created,false);
for(const patch of [{errors:["late error"]},{executionRecordConfirmed:false},{verificationChecks:{...p3016.VERIFIED_CHECKS,sourceUnchanged:false}},{recordVersion:99},{phase3016SourceSnapshot:source({verificationChecks:null})}])assert.strictEqual(core.handoffToStabilizationClosureAcceptance(stamp({...done.record,...patch},ownName),human,options).handedOff,false);
const otherResults=[{conditions:"c",conditionReason:"r",conditionOwner:"owner",conditionDeadline:NOW,conditionVerificationMethod:"manual",conditionReleaseCriteria:"verified"},{failureReason:"failed",failureImpact:"cannot proceed",requiredActions:["manual review"]},{incompleteReason:"missing evidence",missingItems:["evidence"]},{blockedReason:"blocked",blockedImpact:"cannot proceed",unblockingConditions:["manual review"]}];
otherResults.forEach((details,i)=>{const result=core.RESULTS[i+1];assert.strictEqual(core.decideStabilizationClosurePostExecutionVerification(submitted.record,{result},human,options).decided,false);const other=core.decideStabilizationClosurePostExecutionVerification(submitted.record,{result,...details},human,options);assert(other.decided);assert.strictEqual(JSON.stringify(other.record.verificationChecks),JSON.stringify(src.verificationChecks));assert.strictEqual(core.handoffToStabilizationClosureAcceptance(other.record,human,options).handedOff,false)});
for(const h of [{},{...human,performedBy:false},{...human,reason:{}},{...human,performedBy:""},{...human,reason:""},{...human,performedAt:"bad"},{...human,explicitConfirmation:false}]){assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,input(),h,options,[]).created,false);assert.strictEqual(core.startStabilizationClosurePostExecutionVerificationDecision(initial,h,options).transitioned,false);assert.strictEqual(core.beginStabilizationClosurePostExecutionVerificationDecision(started.record,h,options).transitioned,false);assert.strictEqual(core.updateStabilizationClosurePostExecutionVerificationDecision(work.record,{notes:"updated"},h,options).updated,false);assert.strictEqual(core.submitStabilizationClosurePostExecutionVerificationDecisionReview(work.record,h,options).transitioned,false);assert.strictEqual(core.decideStabilizationClosurePostExecutionVerification(submitted.record,completion,h,options).decided,false);assert.strictEqual(core.handoffToStabilizationClosureAcceptance(done.record,h,options).handedOff,false);assert.strictEqual(core.invalidateStabilizationClosurePostExecutionVerificationDecision(done.record,h,options).transitioned,false)}
const invalid=core.invalidateStabilizationClosurePostExecutionVerificationDecision(done.record,human,options);assert(invalid.transitioned);assert.strictEqual(core.handoffToStabilizationClosureAcceptance(invalid.record,human,options).handedOff,false);
assert.strictEqual(core.startStabilizationClosurePostExecutionVerificationDecision({...initial,notes:"tampered"},human,options).transitioned,false);
assert.strictEqual(core.startStabilizationClosurePostExecutionVerificationDecision(stamp({...initial,expiredAt:NOW},ownName),human,options).transitioned,false);
for(const r of [initial,started.record,work.record,updated.record,submitted.record,done.record,handed.record,invalid.record]){assert(core.integrityIntact(r));for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k);assert.strictEqual(r.phase,"phase30");assert.strictEqual(r.stage,core.CURRENT_STAGE);assert.strictEqual(r.nextStage,core.NEXT_STAGE);assert.strictEqual(r.auditTrail.length,r.recordVersion);assert.strictEqual(JSON.stringify(r.phase3016SourceSnapshot),sourceBefore)}
const mem={value:null,setItem(k,v){assert.strictEqual(k,core.STORAGE_KEY);this.value=v},getItem(){return this.value}};
assert(core.saveStabilizationClosurePostExecutionVerificationDecisionRecords(mem,[handed.record,invalid.record]).saved);assert(core.loadStabilizationClosurePostExecutionVerificationDecisionRecords(mem).loaded);
for(const value of ["{",JSON.stringify({schemaVersion:"wrong",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]})]){mem.value=value;assert.strictEqual(core.loadStabilizationClosurePostExecutionVerificationDecisionRecords(mem).loaded,false)}
const browser={HashimotoPhase3016PostStartStabilizationClosurePostExecutionVerification:dependency};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3017PostStartStabilizationClosurePostExecutionVerificationDecision);assert.throws(()=>vm.runInNewContext(code,{}),/Phase30-16/);
assert.strictEqual(externalCalls,0);assert.strictEqual(JSON.stringify(src),sourceBefore);assert.strictEqual(Object.isFrozen(src),false);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|child_process|execSync|spawnSync|setTimeout|setInterval|writeFile|mkdir|https?\.request/.test(code));
for(const key of ["automaticallyExecute","automaticallyAdvance","startNextPhase","automaticallyRollback","automaticallyReleaseConditions","rerunExecution"])assert.strictEqual(core[key],undefined);
for(const key of Object.keys(p3016.VERIFIED_CHECKS)){for(const value of [false,undefined,"true"]){const checks=copy(p3016.VERIFIED_CHECKS);checks[key]=value;assert.strictEqual(core.validatePhase3016Eligibility(source({verificationChecks:checks})).valid,false,key)}}
for(const k of ["expectedResult","actualResult","difference","performance","dataIntegrity","verificationResult"])assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,{...input(),[k]:"mismatch"},human,options,[]).created,false,k);
// Non-normal verification sources remain unchanged and are never converted into acceptance-ready decisions.
p3016.RESULTS.slice(1).forEach(result=>{const abnormal=source({[sourceName+"Result"]:result,[sourceName+"Status"]:p3016.RESULT_STATUS[result],verificationChecks:null}),before=JSON.stringify(abnormal);assert.strictEqual(core.validatePhase3016Eligibility(abnormal).valid,false,result);assert.strictEqual(core.createStabilizationClosurePostExecutionVerificationDecisionRecord(abnormal,input(abnormal),human,options,[]).created,false,result);assert.strictEqual(core.extractStabilizationClosurePostExecutionVerificationDecisionCandidates([abnormal],[]).length,0);assert.strictEqual(JSON.stringify(abnormal),before)});
assert.strictEqual(core.startStabilizationClosurePostExecutionVerificationDecision(stamp({...initial,[ownName+"Result"]:core.RESULTS[0]},ownName),human,options).transitioned,false);
console.log("Phase30-17 unit cases: PASS");


// Full integration: obtain the verified source through the real Phase30-16 manual APIs.
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

const realDecision=build(p3010.PHASE309_REFERENCE);
const f=fields(p3010,"FOLLOWUP_FIELDS");let followup=p3010.createStabilizationFollowupRecord(realDecision,f,human,options,[]);assert(followup.created,followup.reasons.join());followup=p3010.beginStabilizationFollowup(followup.record,human,options);followup=p3010.submitStabilizationFollowupReview(followup.record,human,options);followup=p3010.completeStabilizationFollowup(followup.record,{result:p3010.RESULTS[0],followupSummary:"complete",followupAfterSnapshot:{stable:true},completedBy:"human",completedAt:NOW},human,options);assert(followup.completed);followup=p3010.handoffToStabilizationClosureReview(followup.record,human,options);assert(followup.handedOff);

let review=p3011.createStabilizationClosureReviewRecord(followup.record,fields(p3011,"REVIEW_FIELDS"),human,options,[]);assert(review.created,review.reasons.join());review=p3011.beginStabilizationClosureReview(review.record,human,options);review=p3011.submitStabilizationClosureReview(review.record,human,options);review=p3011.completeStabilizationClosureReview(review.record,{result:p3011.RESULTS[0],reviewSummary:"ready",closureReviewAfterSnapshot:{ready:true},completedBy:"human",completedAt:NOW},human,options);assert(review.completed);review=p3011.handoffToStabilizationClosureDecision(review.record,human,options);assert(review.handedOff);

let decision=p3012.createStabilizationClosureDecisionRecord(review.record,fields(p3012,"DECISION_FIELDS"),human,options,[]);assert(decision.created,decision.reasons.join());decision=p3012.beginStabilizationClosureDecision(decision.record,human,options);decision=p3012.submitStabilizationClosureDecisionReview(decision.record,human,options);decision=p3012.decideStabilizationClosure(decision.record,{result:p3012.RESULTS[0],decisionSummary:"approved",decisionAfterSnapshot:{ready:true},approvedBy:"human",approvedAt:NOW},human,options);assert(decision.decided);decision=p3012.handoffToStabilizationClosureExecutionPreparation(decision.record,human,options);assert(decision.handedOff);

let preparation=p3013.createStabilizationClosureExecutionPreparationRecord(decision.record,fields(p3013,"PREPARATION_FIELDS"),human,options,[]);assert(preparation.created,preparation.reasons.join());
preparation=p3013.startStabilizationClosureExecutionPreparation(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.beginStabilizationClosureExecutionPreparation(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.submitStabilizationClosureExecutionPreparationReview(preparation.record,human,options);assert(preparation.transitioned);
preparation=p3013.completeStabilizationClosureExecutionPreparation(preparation.record,{result:p3013.RESULTS[0],preparationSummary:"ready",preparationAfterSnapshot:{ready:true},completedBy:"human",completedAt:NOW},human,options);assert(preparation.completed);
preparation=p3013.handoffToStabilizationClosureExecutionApproval(preparation.record,human,options);assert(preparation.handedOff);

let approval=p3014.createStabilizationClosureExecutionApprovalRecord(preparation.record,fields(p3014,"APPROVAL_FIELDS"),human,options,[]);assert(approval.created,approval.reasons.join());
approval=p3014.startStabilizationClosureExecutionApproval(approval.record,human,options);assert(approval.transitioned);
approval=p3014.beginStabilizationClosureExecutionApproval(approval.record,human,options);assert(approval.transitioned);
approval=p3014.submitStabilizationClosureExecutionApprovalReview(approval.record,human,options);assert(approval.transitioned);
approval=p3014.decideStabilizationClosureExecutionApproval(approval.record,{result:p3014.RESULTS[0],approvalSummary:"approved",approvalAfterSnapshot:{approved:true},decisionBy:"approver",decisionAt:NOW},human,options);assert(approval.decided);
approval=p3014.handoffToStabilizationClosureExecution(approval.record,human,options);assert(approval.handedOff);

let execution=p3015.createStabilizationClosureExecutionRecord(approval.record,{...fields(p3015,"CREATION_FIELDS"),approvalResult:p3014.RESULTS[0]},human,options,[]);assert(execution.created,execution.reasons.join());
execution=p3015.startStabilizationClosureExecution(execution.record,human,options);assert(execution.transitioned);
execution=p3015.beginStabilizationClosureExecution(execution.record,human,options);assert(execution.transitioned);
execution=p3015.submitStabilizationClosureExecutionReview(execution.record,human,options);assert(execution.transitioned);
execution=p3015.completeStabilizationClosureExecution(execution.record,{result:p3015.RESULTS[0],executionStartedAt:NOW,executionCompletedAt:NOW,postExecutionSnapshot:{managementRecordOnly:true},executionResult:"management record completed"},human,options);assert(execution.completed);
execution=p3015.handoffToStabilizationClosurePostExecutionVerification(execution.record,human,options);assert(execution.handedOff);

const verificationInput=fields(p3016,"CREATION_FIELDS");p3016.SOURCE_EVIDENCE_FIELDS.forEach(k=>verificationInput[k]=copy(execution.record[k]));
let verification=p3016.createStabilizationClosurePostExecutionVerificationRecord(execution.record,verificationInput,human,options,[]);assert(verification.created,verification.reasons.join());
verification=p3016.startStabilizationClosurePostExecutionVerification(verification.record,human,options);assert(verification.transitioned);
verification=p3016.beginStabilizationClosurePostExecutionVerification(verification.record,human,options);assert(verification.transitioned);
verification=p3016.submitStabilizationClosurePostExecutionVerificationReview(verification.record,human,options);assert(verification.transitioned);
verification=p3016.completeStabilizationClosurePostExecutionVerification(verification.record,{result:p3016.RESULTS[0],actualResult:"management record matches",difference:"none",performance:"record check only",dataIntegrity:"intact",verificationStartedAt:NOW,verificationCompletedAt:NOW},human,options);assert(verification.completed);
verification=p3016.handoffToStabilizationClosurePostExecutionVerificationDecision(verification.record,human,options);assert(verification.handedOff);
assert(real.validatePhase3016Eligibility(verification.record).valid);
const sourceHash=verification.record[sourceName+"SnapshotHash"];
const actual=real.createStabilizationClosurePostExecutionVerificationDecisionRecord(verification.record,input(verification.record),human,options,[]);assert(actual.created,actual.reasons.join());assert(real.integrityIntact(actual.record));
assert.notStrictEqual(actual.record.phase3016SourceSnapshot,verification.record);
assert.strictEqual(verification.record[sourceName+"SnapshotHash"],sourceHash);assert(p3016.integrityIntact(verification.record));
const broken=copy(verification.record);broken.phase3015SourceSnapshot.phase3014SourceSnapshot=null;
assert.strictEqual(real.validatePhase3016Eligibility(broken).valid,false);
console.log("phase30PostStartStabilizationClosurePostExecutionVerificationDecisionCore.test.js: PASS (including real Phase30-16 source chain)");
