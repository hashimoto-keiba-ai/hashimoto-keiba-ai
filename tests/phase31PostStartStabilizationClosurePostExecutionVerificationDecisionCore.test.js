"use strict";
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path'),{createRequire}=require('module');
if(process.argv.includes('--integration-worker')){runIntegrationWorker();process.exit(0)}
if(process.argv.includes('--integration-only')){runIsolatedIntegration();process.exit(0)}
const previousPath=require.resolve('./phase31PostStartStabilizationClosurePostExecutionVerificationCore.test.js');
const box={require:createRequire(previousPath),console,process:{argv:['node','test','--unit-only']}};
const previous=fs.readFileSync(previousPath,'utf8');
vm.runInNewContext(previous.slice(0,previous.indexOf('\nfunction rejectSource'))+'\nconst done=core.completeStabilizationClosurePostExecutionVerification(review(),completion(),human,options);assert(done.completed);const hand=core.handoffToStabilizationClosurePostExecutionVerificationDecision(done.record,human,options);assert(hand.handedOff);globalThis.fixture={api:core,source:hand.record};',box);
let forbiddenCalls=0;const forbidden=()=>{forbiddenCalls++;throw Error('forbidden external or automatic action')};
class ExplicitDate extends Date{constructor(...args){if(!args.length)forbidden();super(...args)}static now(){return forbidden()}}
const sandbox={Date:ExplicitDate,Math:Object.assign(Object.create(Math),{random:forbidden}),navigator:{sendBeacon:forbidden},EventSource:forbidden,module:{exports:{}},require:()=>box.fixture.api,fetch:forbidden,setTimeout:forbidden,setInterval:forbidden,Worker:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden};
vm.runInNewContext(fs.readFileSync(require.resolve('../phase31-17-phase31-post-start-stabilization-closure-post-execution-verification-decision-core.js'),'utf8'),sandbox);
const core=sandbox.module.exports,src=box.fixture.source,copy=v=>JSON.parse(JSON.stringify(v)),NOW='2027-02-09T00:00:00Z',human={performedBy:'operator',performedAt:NOW,reason:'human decision',explicitConfirmation:true},options={now:()=>NOW},OWN='phase31PostStartStabilizationClosurePostExecutionVerificationDecision',SOURCE='phase31PostStartStabilizationClosurePostExecutionVerification';
function input(s=src,patch={}){const r={};for(const k of core.DECISION_FIELDS)r[k]=k;for(const k of core.REQUIRED_TRUE)r[k]=true;for(const k of core.ARRAY_FIELDS)r[k]=[];for(const k of Object.keys(core.EVIDENCE_FIELDS))r[k]=copy(s[k]);return {...r,decisionOperator:'operator',reviewer:'reviewer',rollbackPoint:s.rollbackPoint,recoveryPoint:s.recoveryPoint,...patch}}
function completion(result=core.RESULTS[0],patch={}){return {result,...(result===core.RESULTS[0]?{explicitApproval:true}:{}),canProceedToNextStage:false,decisionSummary:'manual decision',decisionAfterSnapshot:{reviewed:true},approvedBy:'operator',approvedAt:NOW,decisionReason:'human evidence review',reviewedBy:'reviewer',reviewedAt:NOW,...patch}}
function create(patch={}){const r=core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,input(src,patch),human,options,[]);assert(r.created,r.reasons.join());return r.record}
function review(patch={}){let r=create(patch);r=core.beginStabilizationClosurePostExecutionVerificationDecision(r,human,options);assert(r.transitioned);r=core.submitStabilizationClosurePostExecutionVerificationDecisionReview(r.record,human,options);assert(r.transitioned);return r.record}
const pending=review(),before=JSON.stringify(src),decide=(r,i=completion(),h=human)=>core.decideStabilizationClosurePostExecutionVerification(r,i,h,options);
const approved=decide(pending);assert(approved.decided,approved.reasons.join());assert(core.integrityIntact(approved.record,options));assert.strictEqual(approved.record.canProceedToNextStage,false);
const hand=core.handoffToStabilizationClosureAcceptance(approved.record,human,options);assert(hand.handedOff);assert(core.integrityIntact(hand.record,options));assert(!core.handoffToStabilizationClosureAcceptance(hand.record,human,options).handedOff);
assert(!decide(create()).decided);assert(!decide(approved.record).decided);assert(!decide(pending,completion(),{...human,explicitConfirmation:false}).decided);
for(const patch of [{approvedBy:'forged'},{reviewedBy:'forged'},{approvedAt:'2027-02-08'},{canProceedToNextStage:true},{automaticDecisionPerformed:true}])assert(!decide(pending,completion(core.RESULTS[0],patch)).decided);
for(const patch of [{errors:['error']},{unresolvedIssues:['issue']},{criticalIssues:['critical']},{blockingConditions:['block']},{requiredTestResults:{...src.requiredTestResults,passed:false}},{workingTreeEvidence:{...src.workingTreeEvidence,clean:false}}])assert(!decide(review(patch)).decided);
const metadata=[{}, {conditions:'manual conditions',conditionReason:'reason',conditionOwner:'owner',conditionDeadline:'2027-03-01',conditionVerificationMethod:'human',conditionReleaseCriteria:'human review'}, {notReadyReason:'rejected',notReadyImpact:'local',requiredActions:['review']},{incompleteReason:'missing',incompleteImpact:'local',requiredActions:['review'],missingItems:['evidence']},{blockedReason:'blocked',blockedImpact:'local',unblockingConditions:['human resolution']}];
assert.strictEqual(core.RESULTS.length,5);for(let i=0;i<5;i++){const r=decide(pending,completion(core.RESULTS[i],metadata[i]));assert(r.decided,r.reasons.join());assert(core.integrityIntact(r.record,options));if(i)assert(!core.handoffToStabilizationClosureAcceptance(r.record,human,options).handedOff)}
for(const patch of [{canProceedToNextStage:false},{[SOURCE+'Result']:box.fixture.api.RESULTS[1]},{auditTrail:[]},{expiresAt:'2000-01-01'},{privateLocalOnly:false},{phase3115SourceSnapshot:null}]){const s={...src,...patch};assert(!core.validatePhase3116Eligibility(s,options).valid);assert(!core.createStabilizationClosurePostExecutionVerificationDecisionRecord(s,input(),human,options,[]).created)}
for(const k of core.REFERENCE_IDS.concat(core.UPSTREAM_FIELDS)){const s={...src,[k]:'forged'};assert(!core.validatePhase3116Eligibility(s,options).valid,k)}
assert(!core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,input(),human,options,[approved.record]).created);
let stored='',writes=0;const storage={setItem(k,v){assert.strictEqual(k,core.STORAGE_KEY);stored=v;writes++},getItem(){return stored}};
assert(core.saveStabilizationClosurePostExecutionVerificationDecisionRecords(storage,[hand.record],options).saved);assert(core.loadStabilizationClosurePostExecutionVerificationDecisionRecords(storage,options).loaded);
const tampered=copy(hand.record);tampered.decisionReason='tampered';assert(!core.integrityIntact(tampered,options));assert(!core.saveStabilizationClosurePostExecutionVerificationDecisionRecords(storage,[tampered],options).saved);assert.strictEqual(writes,1);
stored=stored.replace('human evidence review','forged');assert(!core.loadStabilizationClosurePostExecutionVerificationDecisionRecords(storage,options).loaded);
const audit=copy(approved.record);audit.auditTrail[1].action='forged';assert(!core.integrityIntact(audit,options));assert(!core.saveStabilizationClosurePostExecutionVerificationDecisionRecords(storage,[hand.record,hand.record],options).saved);
assert(Object.isFrozen(hand.record));assert(Object.isFrozen(hand.record.auditTrail));assert.strictEqual(JSON.stringify(src),before);for(const [k,v] of Object.entries(core.SAFETY))assert.strictEqual(hand.record[k],v,k);assert.strictEqual(forbiddenCalls,0);

function restamp(r){const body=copy(r);delete body.phase3116SourceSnapshot;delete body[OWN+'Snapshot'];delete body[OWN+'SnapshotHash'];return {...r,[OWN+'Snapshot']:body,[OWN+'SnapshotHash']:core.computeSnapshotHash(body)}}
for(const patch of [{approvedBy:'forged'},{reviewedAt:'2027-02-08'},{decisionOperator:'forged'},{previousStatus:'forged'},{canProceedToNextStage:true}])assert(!core.integrityIntact(restamp({...approved.record,...patch}),options));
const forgedAudit=copy(approved.record);forgedAudit.auditTrail[1].action='forged';assert(!core.integrityIntact(restamp(forgedAudit),options));
for(const k of core.DECISION_FIELDS.concat(core.REQUIRED_TRUE)){const data=input();delete data[k];assert(!core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,data,human,options,[]).created,k)}
let getterCalls=0;const hostile={};Object.defineProperty(hostile,'decisionTarget',{enumerable:true,get(){getterCalls++;throw Error('getter')}});assert(!core.createStabilizationClosurePostExecutionVerificationDecisionRecord(src,hostile,human,options,[]).created);assert.strictEqual(getterCalls,0);
assert(!core.saveStabilizationClosurePostExecutionVerificationDecisionRecords({setItem(){throw Error('storage unavailable')}},[approved.record],options).saved);
assert(!core.loadStabilizationClosurePostExecutionVerificationDecisionRecords({getItem(){return '{invalid'}},options).loaded);
const invalidated=core.invalidateStabilizationClosurePostExecutionVerificationDecision(hand.record,human,options);assert(invalidated.transitioned);assert(core.integrityIntact(invalidated.record,options));assert(!core.handoffToStabilizationClosureAcceptance(invalidated.record,human,options).handedOff);
const expired=restamp({...approved.record,expiresAt:'2027-02-08'});assert(!core.integrityIntact(expired,options));assert(!core.integrityIntact(expired));
assert(!decide(pending,completion(core.RESULTS[1],{...metadata[1],conditionDeadline:'2000-01-01'})).decided);

const browser={HashimotoPhase3116PostStartStabilizationClosurePostExecutionVerification:box.fixture.api};vm.runInNewContext(fs.readFileSync(require.resolve('../phase31-17-phase31-post-start-stabilization-closure-post-execution-verification-decision-core.js'),'utf8'),browser);assert.strictEqual(browser.HashimotoPhase3117PostStartStabilizationClosurePostExecutionVerificationDecision.SCHEMA_VERSION,'31.17.1');
console.log('Phase31-17 unit / Phase31-16 integration / outcomes / safety / storage / audit: PASS');
if(!process.argv.includes('--unit-only'))runIsolatedIntegration();
function runIsolatedIntegration(){
 const cp=require('child_process'),os=require('os');
 const checkpointArg=process.argv.indexOf('--checkpoint-dir');
 const persistent=checkpointArg!==-1;
 if(persistent)assert(process.argv[checkpointArg+1]&&!process.argv[checkpointArg+1].startsWith('--'),'explicit checkpoint directory required');
 const dir=persistent?path.resolve(process.argv[checkpointArg+1]):fs.mkdtempSync(path.join(os.tmpdir(),'hashimoto-phase3117-'));
 if(persistent&&!fs.existsSync(dir))fs.mkdirSync(dir);
 const files=Array.from({length:18},(_,i)=>path.join(dir,'stage-'+i+'.json'));
 const progressPath=path.join(dir,'progress.json'),codeHash=integrationCodeHash();
 let firstStage=0;
 if(persistent&&fs.existsSync(progressPath)){
  const progress=JSON.parse(fs.readFileSync(progressPath,'utf8'));
  assert(Number.isInteger(progress.lastStage)&&progress.lastStage>=0&&progress.lastStage<=17,'invalid checkpoint stage');
  const fixture=fs.readFileSync(files[progress.lastStage]);
  assert(checkpointValid(progress,codeHash,fixture),'checkpoint code or fixture mismatch; use a new directory');
  firstStage=progress.lastStage+1;
  console.log('RESUME verified checkpoint after stage '+progress.lastStage);
 }
 try{
  for(let stage=firstStage;stage<=17;stage++){
   console.log('RUN isolated real integration stage '+stage);
   const result=cp.spawnSync(process.execPath,['--expose-gc','--max-old-space-size='+workerHeapMiB(),__filename,'--integration-worker',String(stage),stage?files[stage-1]:'-',files[stage]],{stdio:'inherit'});
   assert.strictEqual(result.status,0,'isolated real integration stage '+stage+' failed');
   if(persistent){
    const progress={schemaVersion:1,codeHash,lastStage:stage,fixtureHash:checkpointHash(fs.readFileSync(files[stage]))};
    fs.writeFileSync(progressPath+'.tmp',JSON.stringify(progress));
    fs.renameSync(progressPath+'.tmp',progressPath);
    console.log('CHECKPOINT stage '+stage+' PASS');
   }
   if(stage&&fs.existsSync(files[stage-1]))fs.unlinkSync(files[stage-1]);
  }
  console.log('Phase31-17: PASS (unchanged Phase31-1 through 16 unit regressions, real Phase30-19 anchor and full Phase31-1 through 17 integration)');
 }finally{if(!persistent){for(const file of files)if(fs.existsSync(file))fs.unlinkSync(file);fs.rmdirSync(dir)}}
}
// Optional durable test fixtures survive interrupted desktop sessions. They are
// never product storage, and are resumed only against identical code and bytes.
function checkpointHash(bytes){return require('crypto').createHash('sha256').update(bytes).digest('hex')}
function integrationCodeHash(){
 const hash=require('crypto').createHash('sha256');
 for(const dir of [path.join(__dirname,'..'),__dirname])for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.js')).sort()){
  hash.update(path.basename(dir)+'/'+name+'\0');hash.update(fs.readFileSync(path.join(dir,name)));hash.update('\0');
 }
 return hash.digest('hex');
}
function checkpointValid(p,codeHash,fixture){
 return !!p&&Object.keys(p).sort().join(',')==='codeHash,fixtureHash,lastStage,schemaVersion'&&p.schemaVersion===1&&p.codeHash===codeHash&&Number.isInteger(p.lastStage)&&p.lastStage>=0&&p.lastStage<=17&&p.fixtureHash===checkpointHash(fixture);
}
function checkpointSelfTest(){
 const fixture=Buffer.from('{"fixture":"local test only"}'),codeHash=integrationCodeHash();
 const p={schemaVersion:1,codeHash,lastStage:7,fixtureHash:checkpointHash(fixture)};
 assert(checkpointValid(p,codeHash,fixture));
 for(const patch of [{lastStage:-1},{lastStage:18},{lastStage:1.5},{schemaVersion:2},{codeHash:'changed'},{fixtureHash:'changed'},{extra:true}])assert(!checkpointValid({...p,...patch},codeHash,fixture));
 assert(!checkpointValid(p,codeHash,Buffer.from('tampered')));
 assert(!checkpointValid(p,'changed code',fixture));
 console.log('Phase31-16 test checkpoint integrity cases: PASS');
}
function workerHeapMiB(){return Math.max(4096,Math.min(16384,Math.floor(require('os').totalmem()/1048576/2)))}
function runIntegrationWorker(){
 const heapMiB=workerHeapMiB();
 if(require('v8').getHeapStatistics().heap_size_limit/1048576+128<heapMiB){
  const child=require('child_process').spawnSync(process.execPath,['--expose-gc','--max-old-space-size='+heapMiB,...process.argv.slice(1)],{stdio:'inherit'});
  process.exit(child.status===null?1:child.status);
 }

 const stage=Number(process.argv[process.argv.indexOf('--integration-worker')+1]),inputPath=process.argv[process.argv.indexOf('--integration-worker')+2],outputPath=process.argv[process.argv.indexOf('--integration-worker')+3];
 assert(Number.isInteger(stage)&&stage>=0&&stage<=17);
 if(stage===0){
  const anchor=require("./phase30-final-closure-fixture").buildRealClosure();
  fs.writeFileSync(outputPath,JSON.stringify(anchor));console.log('Real Phase30-19 anchor: PASS');return;
 }
 const tests=['phase31PurposeScopeSafetyBoundaryDefinitionCore.test.js','phase31StartPreparationCore.test.js','phase31StartApprovalCore.test.js','phase31StartExecutionCore.test.js','phase31PostStartVerificationCore.test.js','phase31PostStartVerificationDecisionCore.test.js','phase31PostStartVerificationAcceptanceCore.test.js','phase31PostStartStabilizationReviewCore.test.js','phase31PostStartStabilizationDecisionCore.test.js','phase31PostStartStabilizationFollowupCore.test.js','phase31PostStartStabilizationClosureReviewCore.test.js','phase31PostStartStabilizationClosureDecisionCore.test.js','phase31PostStartStabilizationClosureExecutionPreparationCore.test.js','phase31PostStartStabilizationClosureExecutionApprovalCore.test.js','phase31PostStartStabilizationClosureExecutionCore.test.js','phase31PostStartStabilizationClosurePostExecutionVerificationCore.test.js','phase31PostStartStabilizationClosurePostExecutionVerificationDecisionCore.test.js'];
 const actions=[
 ['createDefinition','startDefinition','submitDefinitionForReview','completeDefinition','completed'],
 ['createStartPreparationRecord','startPreparation','submitPreparationForReview','completePreparation','completed'],
 ['createStartApprovalRecord','startApprovalReview','submitApprovalForReview','decideStartApproval','completed'],
 ['createStartExecutionRecord','beginStartExecutionRecord','submitStartExecutionForReview','completeStartExecution','completed'],
 ['createPostStartVerificationRecord','beginPostStartVerification','submitPostStartVerificationForReview','completePostStartVerification','completed'],
 ['createVerificationDecisionRecord','beginVerificationDecision','submitVerificationDecisionForReview','decideVerification','decided'],
 ['createPostStartAcceptanceRecord','beginPostStartAcceptance','submitPostStartAcceptanceForReview','decidePostStartAcceptance','accepted'],
 ['createStabilizationReviewRecord','beginStabilizationReview','submitStabilizationReview','completeStabilizationReview','completed'],
 ['createStabilizationDecisionRecord','beginStabilizationDecision','submitStabilizationDecisionReview','decideStabilization','decided','handoffToStabilizationFollowup'],
 ['createStabilizationFollowupRecord','beginStabilizationFollowup','submitStabilizationFollowupReview','completeStabilizationFollowup','completed','handoffToStabilizationClosureReview'],
 ['createStabilizationClosureReviewRecord','beginStabilizationClosureReview','submitStabilizationClosureReview','completeStabilizationClosureReview','completed','handoffToStabilizationClosureDecision'],
 ['createStabilizationClosureDecisionRecord','beginStabilizationClosureDecision','submitStabilizationClosureDecisionReview','decideStabilizationClosure','decided','handoffToStabilizationClosureExecutionPreparation'],
 ['createStabilizationClosureExecutionPreparationRecord','beginStabilizationClosureExecutionPreparation','submitStabilizationClosureExecutionPreparationReview','completeStabilizationClosureExecutionPreparation','completed','handoffToStabilizationClosureExecutionApproval'],
 ['createStabilizationClosureExecutionApprovalRecord','beginStabilizationClosureExecutionApproval','submitStabilizationClosureExecutionApprovalReview','decideStabilizationClosureExecutionApproval','decided','handoffToStabilizationClosureExecution'],
 ['createStabilizationClosureExecutionRecord','beginStabilizationClosureExecution','submitStabilizationClosureExecutionReview','completeStabilizationClosureExecution','completed','handoffToStabilizationClosurePostExecutionVerification'],
 ['createStabilizationClosurePostExecutionVerificationRecord','beginStabilizationClosurePostExecutionVerification','submitStabilizationClosurePostExecutionVerificationReview','completeStabilizationClosurePostExecutionVerification','completed','handoffToStabilizationClosurePostExecutionVerificationDecision'],
 ['createStabilizationClosurePostExecutionVerificationDecisionRecord','beginStabilizationClosurePostExecutionVerificationDecision','submitStabilizationClosurePostExecutionVerificationDecisionReview','decideStabilizationClosurePostExecutionVerification','decided','handoffToStabilizationClosureAcceptance']
 ][stage-1];
 const testFile=require.resolve('./'+tests[stage-1]);let box={require:createRequire(testFile),__dirname:path.dirname(testFile),console,process:{argv:['node',testFile,'--unit-only']}};
 vm.runInNewContext(fs.readFileSync(testFile,'utf8'),box);
 const source=JSON.parse(fs.readFileSync(inputPath,'utf8'));box.actual=source;
 const dataExpression=stage<=3?'input()':'input(actual)',completionExpression=stage===3?'approve':stage===4?'success(actual)':stage>=5&&stage<=7?'success()':stage<=2?'completion':'completion()';
 vm.runInNewContext('globalThis.material={input:'+dataExpression+',completion:'+completionExpression+',human};',box);
 const material=JSON.parse(JSON.stringify(box.material));box=null;if(global.gc)global.gc();
 const coreFile=fs.readdirSync(path.join(__dirname,'..')).find(f=>f.startsWith('phase31-'+stage+'-')&&f.endsWith('-core.js')),options={now:()=>material.human.performedAt};
 // Reuse only successful real dependency validation for identical JSON bytes and
 // explicit clock. Unit suites above execute unchanged, without this cache.
 // A changed byte/clock always invokes the real validator again; nothing is
 // treated as valid without a successful recursive production validation.
 const dependencyFile=fs.readdirSync(path.join(__dirname,'..')).find(f=>f.startsWith('phase31-'+(stage-1)+'-')&&f.endsWith('-core.js'));
 let api;
 if(stage>=12){
  const dependency=require('../'+dependencyFile),cache=new Set(),wrapped={...dependency,integrityIntact(value,clock){
   const key=require('crypto').createHash('sha256').update(JSON.stringify([value,clock&&clock.now?clock.now():null])).digest('hex');
   if(cache.has(key))return true;
   const valid=dependency.integrityIntact(value,clock);if(valid)cache.add(key);return valid;
  }};
  const sandbox={module:{exports:{}},require:id=>{assert.strictEqual(id,'./'+dependencyFile);return wrapped}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',coreFile),'utf8'),sandbox);api=sandbox.module.exports;
 }else api=require('../'+coreFile);
 const digest=v=>require('crypto').createHash('sha256').update(JSON.stringify(v)).digest('hex'),before=digest(source);
 function checked(result,key){assert.strictEqual(result[key],true,stage+': '+JSON.stringify(result.reasons));return result.record}
 let record=checked(api[actions[0]](source,material.input,material.human,options,[]),'created');if(global.gc)global.gc();
 record=checked(api[actions[1]](record,material.human,options),'transitioned');if(global.gc)global.gc();
 record=checked(api[actions[2]](record,material.human,options),'transitioned');if(global.gc)global.gc();
 record=checked(api[actions[3]](record,material.completion,material.human,options),actions[4]);if(global.gc)global.gc();
 assert(api.integrityIntact(record,options));
 if(actions[5]){assert.strictEqual(record.canProceedToNextStage,false);record=checked(api[actions[5]](record,material.human,options),'handedOff');assert.strictEqual(record.canProceedToNextStage,true);assert(api.integrityIntact(record,options))}
 assert.strictEqual(digest(source),before);for(const [key,value] of Object.entries(api.SAFETY))assert.strictEqual(record[key],value,key);
 fs.writeFileSync(outputPath,JSON.stringify(record));console.log('Real Phase31-'+stage+' integration and unchanged unit regression: PASS');
}
