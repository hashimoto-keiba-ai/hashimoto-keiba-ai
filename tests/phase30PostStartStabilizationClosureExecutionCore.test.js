"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm");
const real=require("../phase30-15-phase30-post-start-stabilization-closure-execution-core.js"),p3014=real.PHASE3014_REFERENCE;
const NOW="2027-01-05T00:00:00Z",options={now:()=>new Date(NOW)},human={performedBy:"operator",reason:"manual management record",explicitConfirmation:true,performedAt:NOW};
const sourceName="phase30PostStartStabilizationClosureExecutionApproval",ownName="phase30PostStartStabilizationClosureExecution";
const code=fs.readFileSync(require.resolve("../phase30-15-phase30-post-start-stabilization-closure-execution-core.js"),"utf8");
const copy=v=>JSON.parse(JSON.stringify(v));
let externalCalls=0;
const forbidden=()=>{externalCalls++;throw new Error("external or automatic operation forbidden")};
// Unit tests isolate only the already tested upstream validator; source integrity and history use real Phase30-14 contracts.
const dependency={...p3014,validatePhase3013Eligibility:s=>({valid:!!(s&&s.chainValid),reasons:[]})};
function load(dep=dependency){const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-14-phase30-post-start-stabilization-closure-execution-approval-core.js");return dep},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,navigator:{sendBeacon:forbidden}};vm.runInNewContext(code,sandbox);return sandbox.module.exports}
const core=load();
function stamp(r,name=sourceName){const b={...r};delete b[name+"Snapshot"];delete b[name+"SnapshotHash"];const snap=copy(b);delete snap[name===ownName?"phase3014SourceSnapshot":"phase3013SourceSnapshot"];return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:core.computeSnapshotHash(snap)}}
function fields(api,list){const r={};api[list].forEach(k=>r[k]=k);api.ARRAY_FIELDS.forEach(k=>r[k]=[]);api.REQUIRED_TRUE.forEach(k=>r[k]=true);return r}
function approvalHistory(){const states=p3014.STATES,stage=p3014.CURRENT_STAGE;return [
 [stage+"_creation","",states[0]],["start_"+stage,states[0],states[1]],
 ["begin_"+stage+"_work",states[1],states[2]],["submit_"+stage+"_review",states[2],states[3]],
 ["decide_"+stage,states[3],states[4]],["manual_handoff_to_phase30_post_start_stabilization_closure_execution",states[4],states[9]]
 ].map(([action,from,to])=>({...human,action,from,to}))}
function source(patch={}){const r={...fields(p3014,"APPROVAL_FIELDS"),...p3014.SAFETY,[sourceName+"Id"]:"approval-1",[sourceName+"Status"]:p3014.STATES[9],[sourceName+"Result"]:p3014.RESULTS[0],[sourceName+"Version"]:p3014.SCHEMA_VERSION,phase30Started:true,manualPhase30StartCompleted:true,approvalSummary:"approved",approvalAfterSnapshot:{approved:true},decisionBy:"approver",decisionAt:NOW,recordVersion:6,auditTrail:approvalHistory(),phase3013SourceSnapshot:{chainValid:true}};p3014.REFERENCE_IDS.concat(p3014.UPSTREAM_FIELDS).forEach(k=>r[k]=r.phase3013SourceSnapshot[k]=k+"-1");return stamp({...r,...patch})}
const input=()=>({...fields(core,"CREATION_FIELDS"),approvalResult:p3014.RESULTS[0]});
const src=source();
assert.strictEqual(core.NEXT_STAGE,"manual_phase30_post_start_stabilization_closure_post_execution_verification");
assert(core.validatePhase3014Eligibility(src).valid);
assert.strictEqual(core.extractStabilizationClosureExecutionCandidates([src],[]).length,1);
for(const patch of [{phase:"phase29"},{stage:"wrong"},{currentStage:"wrong"},{nextStage:"wrong"},{[sourceName+"Status"]:"wrong"},{[sourceName+"Version"]:"wrong"},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{expiresAt:"bad"},{phase30Started:false},{manualPhase30StartCompleted:false},{approvalSummary:""},{approvalAfterSnapshot:null},{decisionBy:""},{decisionAt:"bad"},{approvedBy:""},{auditTrail:[]},{recordVersion:0},{recordVersion:7},{phase3013SourceSnapshot:{chainValid:false}}])assert.strictEqual(core.validatePhase3014Eligibility(source(patch)).valid,false,JSON.stringify(patch));
for(const status of p3014.STATES.filter(s=>s!==p3014.STATES[9]))assert.strictEqual(core.validatePhase3014Eligibility(source({[sourceName+"Status"]:status})).valid,false,status);
for(const result of ["",...p3014.RESULTS.slice(1)])assert.strictEqual(core.validatePhase3014Eligibility(source({[sourceName+"Result"]:result})).valid,false,result);
for(const [k,v] of Object.entries(p3014.SAFETY))assert.strictEqual(core.validatePhase3014Eligibility(source({[k]:!v})).valid,false,k);
for(const k of p3014.REQUIRED_TRUE)assert.strictEqual(core.validatePhase3014Eligibility(source({[k]:false})).valid,false,k);
for(const k of ["errors","unresolvedIssues","criticalIssues","blockingConditions"])for(const value of [["issue"],null,"bad"])assert.strictEqual(core.validatePhase3014Eligibility(source({[k]:value})).valid,false,k);
for(const k of p3014.REFERENCE_IDS.concat(p3014.UPSTREAM_FIELDS))assert.strictEqual(core.validatePhase3014Eligibility(source({[k]:"mismatch"})).valid,false,k);
for(const patch of [{[sourceName+"SnapshotHash"]:"tampered"},{[sourceName+"Snapshot"]:{tampered:true}},{approvalSummary:"tampered"}])assert.strictEqual(core.validatePhase3014Eligibility({...src,...patch}).valid,false);
for(const patch of [{action:"automatic_approval"},{from:"wrong"},{to:"wrong"},{performedAt:"bad"},{explicitConfirmation:false},null]){const audit=approvalHistory();audit[4]=patch===null?null:{...audit[4],...patch};assert.strictEqual(core.validatePhase3014Eligibility(source({auditTrail:audit})).valid,false)}
assert.strictEqual(core.validatePhase3014Eligibility(source({recordVersion:1,auditTrail:[{...human,action:"manual_handoff",from:"",to:p3014.STATES[9]}]})).valid,false);
assert.strictEqual(core.validatePhase3014Eligibility({...src,auditTrail:new Array(6)}).valid,false);
for(const patch of [{CURRENT_STAGE:"wrong"},{NEXT_STAGE:"wrong"}])assert.strictEqual(load({...dependency,...patch}).validatePhase3014Eligibility(src).valid,false);
const before=JSON.stringify(src),created=core.createStabilizationClosureExecutionRecord(src,input(),human,options,[]);assert(created.created,created.reasons.join());assert.strictEqual(JSON.stringify(src),before);
const initial=created.record;assert(Object.isFrozen(initial));assert.strictEqual(initial.manualExecutionRecorded,false);assert.strictEqual(initial.manualApprovalEvidence.decisionBy,"approver");assert.strictEqual(initial.manualApprovalEvidence.approvalId,src[sourceName+"Id"]);
assert.strictEqual(core.createStabilizationClosureExecutionRecord(src,input(),human,options,[initial]).created,false);
assert.strictEqual(core.extractStabilizationClosureExecutionCandidates([src],[initial]).length,0);
for(const field of core.CREATION_FIELDS){const value=input();delete value[field];assert.strictEqual(core.createStabilizationClosureExecutionRecord(src,value,human,options,[]).created,false,field)}
assert.strictEqual(core.createStabilizationClosureExecutionRecord(src,{...input(),approvalResult:"unapproved"},human,options,[]).created,false);
assert.strictEqual(core.beginStabilizationClosureExecution(initial,human,options).transitioned,false);
assert.strictEqual(core.submitStabilizationClosureExecutionReview(initial,human,options).transitioned,false);
const start=core.startStabilizationClosureExecution(initial,human,options);assert(start.transitioned);
const work=core.beginStabilizationClosureExecution(start.record,human,options);assert(work.transitioned);
for(const patch of [{phase3014SourceSnapshot:{}},{auditTrail:[]},{recordVersion:99},{protectedMode:false},{phase:"phase29"},{stage:"wrong"},{nextStage:"wrong"},{manualExecutionRecorded:true},{manualApprovalEvidence:{}},{executionBeforeSnapshot:{}},{[ownName+"Status"]:core.STATES[4]},{[sourceName+"Id"]:"other"},{invalidatedAt:NOW},{expiresAt:NOW}]){assert.strictEqual(core.updateStabilizationClosureExecution(work.record,patch,human,options).updated,false);assert.strictEqual(core.createStabilizationClosureExecutionRecord(src,{...input(),...patch},human,options,[]).created,false)}
const updated=core.updateStabilizationClosureExecution(work.record,{notes:"manual evidence updated"},human,options);assert(updated.updated);
const submitted=core.submitStabilizationClosureExecutionReview(updated.record,human,options);assert(submitted.transitioned);
const completion={result:core.RESULTS[0],executionStartedAt:NOW,executionCompletedAt:NOW,postExecutionSnapshot:{managementRecordOnly:true},executionResult:"management record completed"};
for(const patch of [{executionStartedAt:"bad"},{executionCompletedAt:"bad"},{executionCompletedAt:"2020-01-01"},{postExecutionSnapshot:null},{executionResult:""},{approvalResult:"unapproved"},{errors:["error"]},{errors:"bad"},{unresolvedIssues:["issue"]},{criticalIssues:["issue"]},{blockingConditions:["issue"]}])assert.strictEqual(core.completeStabilizationClosureExecution(submitted.record,{...completion,...patch},human,options).completed,false,JSON.stringify(patch));
for(const k of core.REQUIRED_TRUE)assert.strictEqual(core.completeStabilizationClosureExecution(submitted.record,{...completion,[k]:false},human,options).completed,false,k);
const done=core.completeStabilizationClosureExecution(submitted.record,completion,human,options);assert(done.completed,done.reasons.join());assert.strictEqual(done.record[ownName+"Status"],core.STATES[4]);assert.strictEqual(done.record.manualExecutionRecorded,true);
const handed=core.handoffToStabilizationClosurePostExecutionVerification(done.record,human,options);assert(handed.handedOff);assert.strictEqual(handed.record[ownName+"Status"],core.STATES[8]);
assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerification(initial,human,options).handedOff,false);
assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerification(handed.record,human,options).handedOff,false);
assert.strictEqual(core.createStabilizationClosureExecutionRecord(src,input(),human,options,[handed.record]).created,false);
for(const patch of [{errors:["late error"]},{manualApprovalConfirmed:false},{manualExecutionRecorded:false},{manualApprovalEvidence:{}},{recordVersion:99},{phase3014SourceSnapshot:source({decisionBy:""})}])assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerification(stamp({...done.record,...patch},ownName),human,options).handedOff,false);
const otherResults=[{failureReason:"failed",failureImpact:"cannot close",requiredActions:["manual review"]},{incompleteReason:"missing evidence",missingItems:["evidence"]},{blockedReason:"blocked",blockedImpact:"cannot proceed",unblockingConditions:["manual review"]}];
otherResults.forEach((details,i)=>{const result=core.RESULTS[i+1];assert.strictEqual(core.completeStabilizationClosureExecution(submitted.record,{result},human,options).completed,false);const other=core.completeStabilizationClosureExecution(submitted.record,{result,...details},human,options);assert(other.completed);assert.strictEqual(other.record.manualExecutionRecorded,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerification(other.record,human,options).handedOff,false)});
for(const h of [{},{...human,performedBy:""},{...human,reason:""},{...human,performedAt:"bad"},{...human,explicitConfirmation:false}]){assert.strictEqual(core.createStabilizationClosureExecutionRecord(src,input(),h,options,[]).created,false);assert.strictEqual(core.startStabilizationClosureExecution(initial,h,options).transitioned,false);assert.strictEqual(core.beginStabilizationClosureExecution(start.record,h,options).transitioned,false);assert.strictEqual(core.updateStabilizationClosureExecution(work.record,{notes:"updated"},h,options).updated,false);assert.strictEqual(core.submitStabilizationClosureExecutionReview(work.record,h,options).transitioned,false);assert.strictEqual(core.completeStabilizationClosureExecution(submitted.record,completion,h,options).completed,false);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerification(done.record,h,options).handedOff,false);assert.strictEqual(core.invalidateStabilizationClosureExecution(done.record,h,options).transitioned,false)}
const invalid=core.invalidateStabilizationClosureExecution(done.record,human,options);assert(invalid.transitioned);assert.strictEqual(core.handoffToStabilizationClosurePostExecutionVerification(invalid.record,human,options).handedOff,false);assert.strictEqual(core.updateStabilizationClosureExecution(invalid.record,{notes:"updated"},human,options).updated,false);
assert.strictEqual(core.startStabilizationClosureExecution({...initial,notes:"tampered"},human,options).transitioned,false);
assert.strictEqual(core.startStabilizationClosureExecution(stamp({...initial,expiredAt:NOW},ownName),human,options).transitioned,false);
for(const r of [initial,start.record,work.record,updated.record,submitted.record,done.record,handed.record,invalid.record]){assert(core.integrityIntact(r));for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k);assert.strictEqual(r.phase,"phase30");assert.strictEqual(r.stage,core.CURRENT_STAGE);assert.strictEqual(r.nextStage,core.NEXT_STAGE);assert.strictEqual(r.manualApprovalEvidence.explicitConfirmation,true);assert.strictEqual(r.auditTrail.length,r.recordVersion)}
const mem={value:null,setItem(k,v){assert.strictEqual(k,core.STORAGE_KEY);this.value=v},getItem(){return this.value}};
assert(core.saveStabilizationClosureExecutionRecords(mem,[handed.record,invalid.record]).saved);assert(core.loadStabilizationClosureExecutionRecords(mem).loaded);
for(const value of ["{",JSON.stringify({schemaVersion:"wrong",records:[]}),JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]})]){mem.value=value;assert.strictEqual(core.loadStabilizationClosureExecutionRecords(mem).loaded,false)}
const browser={HashimotoPhase3014PostStartStabilizationClosureExecutionApproval:dependency};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3015PostStartStabilizationClosureExecution);assert.throws(()=>vm.runInNewContext(code,{}),/Phase30-14/);
assert.strictEqual(externalCalls,0);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|child_process|execSync|spawnSync|setTimeout|setInterval|writeFile|mkdir|https?\.request/.test(code));
for(const key of ["automaticallyExecute","automaticallyAdvance","startNextPhase","automaticallyRollback","automaticallyReleaseConditions"])assert.strictEqual(core[key],undefined);
console.log("Phase30-15 unit cases: PASS");

// Full source-chain integration: obtain the approval through the real Phase30-14 manual APIs.
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
assert(real.validatePhase3014Eligibility(approval.record).valid);
const actual=real.createStabilizationClosureExecutionRecord(approval.record,input(),human,options,[]);assert(actual.created,actual.reasons.join());assert(real.integrityIntact(actual.record));
assert.strictEqual(actual.record.manualApprovalEvidence.approvalId,approval.record[sourceName+"Id"]);
const broken=copy(approval.record);broken.phase3013SourceSnapshot.phase3012SourceSnapshot=null;
assert.strictEqual(real.validatePhase3014Eligibility(broken).valid,false);
console.log("phase30PostStartStabilizationClosureExecutionCore.test.js: PASS (including real Phase30-14 source chain)");
