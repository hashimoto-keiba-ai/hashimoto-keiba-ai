"use strict";
const assert=require("assert"),fs=require("fs"),vm=require("vm"),real=require("../phase30-14-phase30-post-start-stabilization-closure-execution-approval-core.js"),p3013=real.PHASE3013_REFERENCE;
const NOW="2027-01-05T00:00:00Z",options={now:()=>new Date(NOW)},human={performedBy:"human",reason:"manual closure review",explicitConfirmation:true,performedAt:NOW};
const code=fs.readFileSync(require.resolve("../phase30-14-phase30-post-start-stabilization-closure-execution-approval-core.js"),"utf8");
// Unit cases isolate the already tested Phase30-12 chain validator; integration below uses real dependencies.
const dependency={...p3013,validatePhase3012Eligibility:s=>({valid:!!(s&&s.chainValid),reasons:[]})};
const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-13-phase30-post-start-stabilization-closure-execution-preparation-core.js");return dependency}};vm.runInNewContext(code,sandbox);const core=sandbox.module.exports;
const sourceName="phase30PostStartStabilizationClosureExecutionPreparation",ownName="phase30PostStartStabilizationClosureExecutionApproval";
const copy=v=>JSON.parse(JSON.stringify(v));
function stamp(r,name=sourceName){const b={...r};delete b[name+"Snapshot"];delete b[name+"SnapshotHash"];const snap=copy(b);if(name===ownName)delete snap.phase3013SourceSnapshot;else delete snap.phase3012SourceSnapshot;return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:core.computeSnapshotHash(snap)}}
function fields(api,list){const r={};api[list].forEach(k=>r[k]=k);api.ARRAY_FIELDS.forEach(k=>r[k]=[]);api.REQUIRED_TRUE.forEach(k=>r[k]=true);return r}
function source(p={}){const b={...fields(p3013,"PREPARATION_FIELDS"),...p3013.SAFETY,[sourceName+"Id"]:"followup-1",[sourceName+"Status"]:p3013.STATES[8],[sourceName+"Result"]:p3013.RESULTS[0],[sourceName+"Version"]:p3013.SCHEMA_VERSION,phase30Started:true,manualPhase30StartCompleted:true,preparationSummary:"complete",preparationAfterSnapshot:{ok:true},completedBy:"human",completedAt:NOW,recordVersion:1,auditTrail:[{...human,action:"manual_handoff",from:"",to:p3013.STATES[8]}],phase3012SourceSnapshot:{chainValid:true}};p3013.REFERENCE_IDS.concat(p3013.UPSTREAM_FIELDS).forEach(k=>b[k]=b.phase3012SourceSnapshot[k]=k+"-1");return stamp({...b,...p})}
const input=()=>fields(core,"APPROVAL_FIELDS"),src=source();
assert(core.validatePhase3013Eligibility(src).valid);assert.strictEqual(core.NEXT_STAGE,"manual_phase30_post_start_stabilization_closure_execution");assert.strictEqual(core.extractStabilizationClosureExecutionApprovalCandidates([src],[]).length,1);
for(const patch of [{[sourceName+"Status"]:"invalid"},{[sourceName+"Result"]:p3013.RESULTS[1]},{[sourceName+"Version"]:"bad"},{protectedMode:false},{planOnly:false},{privateLocalOnly:false},{automaticFollowupPerformed:true},{invalidatedAt:NOW},{expiredAt:NOW},{expiresAt:"2000-01-01"},{auditTrail:[{}]},{recordVersion:0},{recordVersion:2},{errors:["error"]},{errors:"bad"},{unresolvedIssues:["issue"]},{criticalIssues:["issue"]},{blockingConditions:["issue"]},{phase3012SourceSnapshot:{chainValid:false}},{phase30PostStartStabilizationDecisionId:"other"},{phase30PostStartStabilizationDecisionVersion:"other"},{closureDecisionConfirmed:false}])assert.strictEqual(core.validatePhase3013Eligibility(source(patch)).valid,false,JSON.stringify(patch));
for(const patch of [{[sourceName+"SnapshotHash"]:"bad"},{preparationSummary:"tampered"},{[sourceName+"Snapshot"]:{bad:true}}])assert.strictEqual(core.validatePhase3013Eligibility({...src,...patch}).valid,false);
const created=core.createStabilizationClosureExecutionApprovalRecord(src,input(),human,options,[]);assert(created.created,created.reasons.join());const initial=created.record;assert(Object.isFrozen(initial));assert.strictEqual(core.createStabilizationClosureExecutionApprovalRecord(src,input(),human,options,[initial]).created,false);assert.strictEqual(core.extractStabilizationClosureExecutionApprovalCandidates([src],[initial]).length,0);
assert.strictEqual(core.submitStabilizationClosureExecutionApprovalReview(initial,human,options).transitioned,false);
const launched=core.startStabilizationClosureExecutionApproval(initial,human,options).record;assert.strictEqual(launched[ownName+"Status"],core.STATES[1]);const started=core.beginStabilizationClosureExecutionApproval(launched,human,options).record;assert.strictEqual(started[ownName+"Status"],core.STATES[2]);
for(const patch of [{phase3013SourceSnapshot:{}},{auditTrail:[]},{recordVersion:0},{protectedMode:false},{[ownName+"Status"]:core.STATES[3]},{phase30Started:false},{invalidatedAt:NOW},{phase30PostStartStabilizationClosureExecutionPreparationId:"other"}]){assert.strictEqual(core.updateStabilizationClosureExecutionApproval(started,patch,human,options).updated,false);assert.strictEqual(core.createStabilizationClosureExecutionApprovalRecord(src,{...input(),...patch},human,options,[]).created,false)}
const updated=core.updateStabilizationClosureExecutionApproval(started,{notes:"updated"},human,options);assert(updated.updated);const submitted=core.submitStabilizationClosureExecutionApprovalReview(updated.record,human,options).record;
const completion={result:core.RESULTS[0],approvalSummary:"ready",approvalAfterSnapshot:{ready:true},decisionBy:"reviewer",decisionAt:NOW};
for(const patch of [{approvalSummary:""},{decisionAt:"bad"},{executionReadinessConfirmed:false},{errors:["x"]},{unresolvedIssues:["x"]},{criticalIssues:["x"]},{blockingConditions:["x"]}])assert.strictEqual(core.decideStabilizationClosureExecutionApproval(submitted,{...completion,...patch},human,options).decided,false);
const done=core.decideStabilizationClosureExecutionApproval(submitted,completion,human,options);assert(done.decided);assert.strictEqual(done.record[ownName+"Status"],core.STATES[4]);
const hand=core.handoffToStabilizationClosureExecution(done.record,human,options);assert(hand.handedOff);assert.strictEqual(hand.record[ownName+"Status"],core.STATES[9]);
for(const patch of [{errors:["late error"]},{executionReadinessConfirmed:false}])assert.strictEqual(core.handoffToStabilizationClosureExecution(stamp({...done.record,...patch},ownName),human,options).handedOff,false);
const outcomes=[{conditions:"c",conditionReason:"r",conditionOwner:"o",conditionDeadline:NOW,conditionVerificationMethod:"manual",conditionReleaseCriteria:"reviewed"},{rejectionReason:"rejected",rejectionImpact:"cannot proceed",requiredActions:["review"]},{incompleteReason:"missing",missingItems:["evidence"]},{blockedReason:"blocked",blockedImpact:"cannot proceed",unblockingConditions:["manual review"]}];
outcomes.forEach((extra,i)=>{const result=core.RESULTS[i+1];assert.strictEqual(core.decideStabilizationClosureExecutionApproval(submitted,{result},human,options).decided,false);const x=core.decideStabilizationClosureExecutionApproval(submitted,{result,...extra},human,options);assert(x.decided,result);assert.strictEqual(core.handoffToStabilizationClosureExecution(x.record,human,options).handedOff,false)});
for(const h of [{},{...human,performedBy:""},{...human,reason:""},{...human,performedAt:"bad"},{...human,explicitConfirmation:false}]){assert.strictEqual(core.createStabilizationClosureExecutionApprovalRecord(src,input(),h,options,[]).created,false);assert.strictEqual(core.startStabilizationClosureExecutionApproval(initial,h,options).transitioned,false);assert.strictEqual(core.beginStabilizationClosureExecutionApproval(launched,h,options).transitioned,false);assert.strictEqual(core.updateStabilizationClosureExecutionApproval(started,{notes:"x"},h,options).updated,false);assert.strictEqual(core.submitStabilizationClosureExecutionApprovalReview(started,h,options).transitioned,false);assert.strictEqual(core.decideStabilizationClosureExecutionApproval(submitted,completion,h,options).decided,false);assert.strictEqual(core.handoffToStabilizationClosureExecution(done.record,h,options).handedOff,false);assert.strictEqual(core.invalidateStabilizationClosureExecutionApproval(done.record,h,options).transitioned,false)}
const invalid=core.invalidateStabilizationClosureExecutionApproval(done.record,human,options);assert(invalid.transitioned);assert.strictEqual(core.handoffToStabilizationClosureExecution(invalid.record,human,options).handedOff,false);assert(core.createStabilizationClosureExecutionApprovalRecord(src,input(),human,options,[invalid.record]).created);
assert.strictEqual(core.beginStabilizationClosureExecutionApproval({...initial,notes:"tampered"},human,options).transitioned,false);
for(const r of [initial,started,submitted,done.record,hand.record,invalid.record]){for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(r[k],v,k);assert(core.integrityIntact(r));assert(core.safetyIntact(r))}
const mem={v:null,setItem(k,v){this.v=v},getItem(){return this.v}};assert(core.saveStabilizationClosureExecutionApprovalRecords(mem,[hand.record,invalid.record]).saved);assert(core.loadStabilizationClosureExecutionApprovalRecords(mem).loaded);mem.v=JSON.stringify({schemaVersion:core.SCHEMA_VERSION,records:[{}]});assert.strictEqual(core.loadStabilizationClosureExecutionApprovalRecords(mem).loaded,false);
const browser={HashimotoPhase3013PostStartStabilizationClosureExecutionPreparation:dependency};vm.runInNewContext(code,browser);assert(browser.HashimotoPhase3014PostStartStabilizationClosureExecutionApproval);assert.throws(()=>vm.runInNewContext(code,{}),/Phase30-13/);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|child_process|execSync|spawnSync|setTimeout|setInterval|writeFile|mkdir|https?\.request/.test(code));
for(const field of core.APPROVAL_FIELDS){const value=input();delete value[field];assert.strictEqual(core.createStabilizationClosureExecutionApprovalRecord(src,value,human,options,[]).created,false,field)}
for(const field of core.REQUIRED_TRUE)assert.strictEqual(core.decideStabilizationClosureExecutionApproval(submitted,{...completion,[field]:false},human,options).decided,false,field);
assert.strictEqual(core.expireStabilizationClosureExecutionApproval,undefined);
for(const patch of [{automaticClosureDecisionHandoffPerformed:true},{auditTrail:[{...human,action:"handoff",from:"wrong",to:p3013.STATES[8]}]},{completedAt:"bad"}])assert.strictEqual(core.validatePhase3013Eligibility(source(patch)).valid,false);
assert.strictEqual(core.updateStabilizationClosureExecutionApproval(invalid.record,{notes:"x"},human,options).updated,false);
for(const field of core.APPROVAL_FIELDS.filter(k=>k.endsWith("Confirmation"))){assert.strictEqual(core.createStabilizationClosureExecutionApprovalRecord(src,{...input(),[field]:false},human,options,[]).created,false,field);assert.strictEqual(core.decideStabilizationClosureExecutionApproval(submitted,{...completion,[field]:false},human,options).decided,false,field)}
console.log("Phase30-14 unit cases: PASS");

// Explicit stage metadata is optional in Phase30-13, but conflicting metadata is rejected.
for(const patch of [{phase:"phase29"},{stage:"wrong"},{currentStage:"wrong"},{nextStage:"wrong"},{phase30Started:false},{manualPhase30StartCompleted:false},{[sourceName+"Status"]:p3013.STATES[4]}])assert.strictEqual(core.validatePhase3013Eligibility(source(patch)).valid,false,JSON.stringify(patch));
for(const [k,v] of Object.entries(p3013.SAFETY))assert.strictEqual(core.validatePhase3013Eligibility(source({[k]:!v})).valid,false,k);
for(const k of p3013.REQUIRED_TRUE)assert.strictEqual(core.validatePhase3013Eligibility(source({[k]:false})).valid,false,k);
for(const k of p3013.REFERENCE_IDS.concat(p3013.UPSTREAM_FIELDS))assert.strictEqual(core.validatePhase3013Eligibility(source({[k]:"mismatch"})).valid,false,k);
assert.strictEqual(core.handoffToStabilizationClosureExecution(initial,human,options).handedOff,false);
assert.strictEqual(core.handoffToStabilizationClosureExecution(hand.record,human,options).handedOff,false);
for(const patch of [{auditTrail:[{...human,action:"manual",from:"wrong",to:core.STATES[4]}]},{recordVersion:999},{phase3013SourceSnapshot:source({errors:["late error"]})}])assert.strictEqual(core.handoffToStabilizationClosureExecution(stamp({...done.record,...patch},ownName),human,options).handedOff,false);
console.log("Phase30-14 source and manual approval unit cases: PASS");

// Build a real upstream chain and obtain the source through the Phase30-13 manual APIs.
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
assert(real.validatePhase3013Eligibility(preparation.record).valid);
const actual=real.createStabilizationClosureExecutionApprovalRecord(preparation.record,fields(real,"APPROVAL_FIELDS"),human,options,[]);assert(actual.created,actual.reasons.join());assert(real.integrityIntact(actual.record));
const broken=copy(preparation.record);broken.phase3012SourceSnapshot.phase3011SourceSnapshot=null;
assert.strictEqual(real.validatePhase3013Eligibility(broken).valid,false);
console.log("phase30PostStartStabilizationClosureExecutionApprovalCore.test.js: PASS (including real Phase30-13 source chain)");
