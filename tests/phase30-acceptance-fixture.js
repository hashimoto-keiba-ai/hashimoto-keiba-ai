"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

function setupAcceptance() {
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
const src=source();
function input(s=src){const r={...fields(core,"ACCEPTANCE_FIELDS"),verificationDecisionResult:s[sourceName+"Result"]};core.SOURCE_EVIDENCE_FIELDS.forEach(k=>r[k]=copy(s[k]));return r}
return {real,p3017,NOW,options,human,sourceName,ownName,code,copy,forbidden,dependency,load,core,stamp,fields,verificationHistory,source,src,input,getExternalCalls:()=>externalCalls};
}

function createRealAcceptance() {
const {real,p3017,NOW,options,human,sourceName,copy,fields,input}=setupAcceptance();
const p3016=p3017.PHASE3016_REFERENCE;
const p3015=p3016.PHASE3015_REFERENCE;
const p3014=p3015.PHASE3014_REFERENCE;
const p3013=p3014.PHASE3013_REFERENCE;
const p3012=p3013.PHASE3012_REFERENCE;
const p3011=p3012.PHASE3011_REFERENCE;
const p3010=p3011.PHASE3010_REFERENCE;
const build = api => require("./phase30-chain-fixture")(api, NOW);

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
return {actual,finalDecision,sourceHash};
}


function acceptanceHandoff(api, record, human, options) {
  const started = api.startStabilizationClosureAcceptance(record,human,options);
  assert(started.transitioned);
  const work = api.beginStabilizationClosureAcceptance(started.record,human,options);
  assert(work.transitioned);
  const pending = api.submitStabilizationClosureAcceptanceReview(work.record,human,options);
  assert(pending.transitioned);
  const done = api.decideStabilizationClosureAcceptance(pending.record,{
    result:api.RESULTS[0],acceptanceSummary:"approved for manual acceptance",
    acceptanceAfterSnapshot:{approved:true},acceptedAt:human.performedAt
  },human,options);
  assert(done.decided,done.reasons.join());
  const handoff = api.handoffToPhase30FinalClosure(done.record,human,options);
  assert(handoff.handedOff);
  return handoff.record;
}

function buildAcceptanceForClosure() {
  const {core,human,options,src,input}=setupAcceptance();
  const created=core.createStabilizationClosureAcceptanceRecord(src,input(),human,options,[]);
  assert(created.created,created.reasons.join());
  const started=core.startStabilizationClosureAcceptance(created.record,human,options);
  assert(started.transitioned);
  const work=core.beginStabilizationClosureAcceptance(started.record,human,options);
  assert(work.transitioned);
  const updated=core.updateStabilizationClosureAcceptance(work.record,{notes:"manual evidence checked"},human,options);
  assert(updated.updated);
  const submitted=core.submitStabilizationClosureAcceptanceReview(updated.record,human,options);
  assert(submitted.transitioned);
  const done=core.decideStabilizationClosureAcceptance(submitted.record,{
    result:core.RESULTS[0],acceptanceSummary:"approved for manual acceptance",acceptanceAfterSnapshot:{approved:true},acceptedAt:human.performedAt
  },human,options);
  assert(done.decided,done.reasons.join());
  const handed=core.handoffToPhase30FinalClosure(done.record,human,options);
  assert(handed.handedOff);
  return {acceptanceApi:core,acceptanceSource:handed.record};
}

function buildRealAcceptanceForClosure() {
  const {real,human,options}=setupAcceptance();
  return acceptanceHandoff(real,createRealAcceptance().actual.record,human,options);
}

module.exports = {setupAcceptance,createRealAcceptance,buildAcceptanceForClosure,buildRealAcceptanceForClosure};
