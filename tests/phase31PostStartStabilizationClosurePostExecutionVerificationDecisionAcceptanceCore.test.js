"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const {createHash} = require("node:crypto");
const {spawnSync} = require("node:child_process");
const {createRequire} = require("node:module");

const previousTest = require.resolve("./phase31PostStartStabilizationClosurePostExecutionVerificationDecisionCore.test.js");
const corePath = require.resolve("../phase31-18-phase31-post-start-stabilization-closure-post-execution-verification-decision-acceptance-core.js");
const dependencyPath = require.resolve("../phase31-17-phase31-post-start-stabilization-closure-post-execution-verification-decision-core.js");
const OWN = "phase31PostStartStabilizationClosureAcceptance";
const SOURCE = "phase31PostStartStabilizationClosurePostExecutionVerificationDecision";
const NOW = "2027-02-09T00:00:00Z";
const clock = {now: () => NOW};
const human = {performedBy:"operator", performedAt:NOW, reason:"human acceptance review", explicitConfirmation:true};
const copy = value => JSON.parse(JSON.stringify(value));
const digest = bytes => createHash("sha256").update(bytes).digest("hex");

function input(core, source, patch = {}) {
  const fields = Object.fromEntries(core.ACCEPTANCE_FIELDS.map(key => [key, key]));
  for (const key of core.REQUIRED_TRUE) fields[key] = true;
  for (const key of core.ARRAY_FIELDS) fields[key] = [];
  for (const key of Object.keys(core.EVIDENCE_FIELDS)) fields[key] = copy(source[key]);
  return {...fields, acceptanceOperator:"operator", reviewer:"reviewer",
    rollbackPoint:source.rollbackPoint, recoveryPoint:source.recoveryPoint,
    noUnauthorizedOperationsConfirmed:true, ...patch};
}

function completion(core, result = core.RESULTS[0], patch = {}) {
  return {result, ...(result === core.RESULTS[0] ? {explicitAcceptance:true} : {}),
    canProceedToNextStage:false, acceptanceSummary:"manual acceptance",
    acceptanceAfterSnapshot:{reviewed:true}, acceptedBy:"operator", acceptedAt:NOW,
    reviewedBy:"reviewer", reviewedAt:NOW, acceptanceReason:"evidence reviewed", ...patch};
}

function checked(result, flag) {
  assert.equal(result[flag], true, JSON.stringify(result.reasons));
  return result.record;
}

function loadWithDependency(dependency, sandbox = {}) {
  const context = {...sandbox, module:{exports:{}}, require:id => {
    assert.equal(id, "./" + path.basename(dependencyPath));
    return dependency;
  }};
  vm.runInNewContext(fs.readFileSync(corePath, "utf8"), context);
  return context.module.exports;
}

function focusedFixture() {
  const previous = fs.readFileSync(previousTest, "utf8");
  const box = {require:createRequire(previousTest), console, __dirname, process:{argv:["node",previousTest,"--unit-only"]}};
  const end = previous.indexOf("assert(!decide(create())");
  assert(end > 0);
  vm.runInNewContext(previous.slice(0, end) +
    "\nglobalThis.fixture18={api:core,source:hand.record,unhanded:approved.record};", box);
  return box.fixture18;
}

function runUnit() {
  const {api, source, unhanded} = focusedFixture();
  const previousBytes = JSON.stringify(source);
  let forbiddenCalls = 0;
  const forbidden = () => { forbiddenCalls++; throw Error("unexpected external or automatic action"); };
  class ExplicitDate extends Date {
    constructor(...args) { if (!args.length) forbidden(); super(...args); }
    static now() { return forbidden(); }
  }
  const core = loadWithDependency(api, {
    Date:ExplicitDate, fetch:forbidden, XMLHttpRequest:forbidden, WebSocket:forbidden,
    Worker:forbidden, setTimeout:forbidden, setInterval:forbidden,
    navigator:{sendBeacon:forbidden}, localStorage:{getItem:forbidden,setItem:forbidden}
  });
  const browser = {HashimotoPhase3117PostStartStabilizationClosurePostExecutionVerificationDecision:api};
  vm.runInNewContext(fs.readFileSync(corePath, "utf8"), browser);
  assert.equal(browser.HashimotoPhase3118PostStartStabilizationClosureAcceptance.SCHEMA_VERSION,"31.18.1");
  assert.equal(require(corePath).PHASE3117_REFERENCE, require(dependencyPath));
  const create = (patch = {}, existing = []) => core.createStabilizationClosureAcceptanceRecord(source, input(core, source, patch), human, clock, existing);
  const begin = record => core.beginStabilizationClosureAcceptance(record, human, clock);
  const submit = record => core.submitStabilizationClosureAcceptanceReview(record, human, clock);
  const decide = (record, details = completion(core)) => core.decideStabilizationClosureAcceptance(record, details, human, clock);
  const handoff = record => core.handoffToPhase31FinalClosure(record, human, clock);
  const start = checked(create(), "created");
  const working = checked(begin(start), "transitioned");
  const updated = checked(core.updateStabilizationClosureAcceptance(working, {acceptanceNotes:"checked"}, human, clock), "updated");
  const pending = checked(submit(updated), "transitioned");
  const accepted = checked(decide(pending), "decided");
  const handed = checked(handoff(accepted), "handedOff");
  assert.equal(accepted.canProceedToNextStage, false);
  assert.equal(handed.canProceedToNextStage, true);
  assert.equal(handed[OWN+"Status"], "ready_for_manual_phase31_final_closure");
  assert.equal(handed.nextStage, "manual_phase31_final_closure");
  assert(!handoff(handed).handedOff);
  assert(!handoff(pending).handedOff);
  assert(!decide(start).decided);
  assert(!submit(start).transitioned);
  assert(!begin(pending).transitioned);
  const metadata = [
    {conditions:"follow up",conditionReason:"condition",conditionOwner:"owner",conditionDeadline:"2027-03-01",conditionVerificationMethod:"review",conditionReleaseCriteria:"verified"},
    {rejectionReason:"rejected",rejectionImpact:"local",requiredActions:["review"],responseOwner:"owner"},
    {incompleteReason:"missing",incompleteImpact:"local",requiredActions:["review"],missingItems:["evidence"],responseOwner:"owner"},
    {blockedReason:"blocked",blockedImpact:"local",requiredActions:["review"],unblockingConditions:["resolution"],responseOwner:"owner"}
  ];
  for (let index = 0; index < metadata.length; index++) {
    const outcome = checked(decide(pending, completion(core, core.RESULTS[index+1], metadata[index])), "decided");
    assert(core.integrityIntact(outcome, clock));
    assert(!handoff(outcome).handedOff);
    assert(!decide(outcome).decided);
  }
  assert(!decide(pending, completion(core, core.RESULTS[1], {...metadata[0],conditionDeadline:NOW})).decided);
  for (const patch of [{acceptedAt:"invalid"},{reviewedAt:"2027-02-10"},{acceptedBy:"someone else"},{explicitAcceptance:false},{canProceedToNextStage:true}]) {
    assert(!decide(pending, completion(core, core.RESULTS[0], patch)).decided);
  }
  for (const patch of [
    {criticalIssues:["critical"]},{unresolvedIssues:["open"]},{blockingConditions:["blocked"]},
    {noUnauthorizedOperationsConfirmed:false},{requiredTestResults:{...source.requiredTestResults,passed:false}},
    {workingTreeEvidence:{...source.workingTreeEvidence,clean:false}},
    {gitStateEvidence:{...source.gitStateEvidence,headCommit:"other"}}
  ]) {
    const record = checked(submit(checked(begin(checked(create(patch),"created")),"transitioned")),"transitioned");
    assert(!decide(record).decided);
  }
  assert(!core.validatePhase3117Eligibility(unhanded, clock).valid);
  for (const patch of [{[SOURCE+"Id"]:"bad"},{[SOURCE+"SnapshotHash"]:"bad"},{schemaVersion:"old"},
    {auditTrail:[]},{invalidatedAt:NOW},{expiresAt:NOW},{protectedMode:false},{phase3116SourceSnapshot:null},
    ...api.RESULTS.slice(1).map(result => ({[SOURCE+"Result"]:result}))]) {
    assert(!core.validatePhase3117Eligibility({...source,...patch}, clock).valid);
  }
  for (const key of ["performedBy","performedAt","reason","explicitConfirmation"]) {
    const operation = {...human};
    delete operation[key];
    assert(!core.beginStabilizationClosureAcceptance(start, operation, clock).transitioned);
  }
  assert(!core.beginStabilizationClosureAcceptance(start, {...human,performedAt:"2027-02-10"}, clock).transitioned);
  for (const value of ["2027-02-30T00:00:00Z","2027-02-09T00:00:00"]) {
    assert(!core.beginStabilizationClosureAcceptance(start,{...human,performedAt:value}).transitioned);
  }
  const invalid = checked(core.invalidateStabilizationClosureAcceptance(handed, human, clock), "transitioned");
  assert(!handoff(invalid).handedOff);
  assert(!create({},[invalid]).created);
  assert(!create({},[start]).created);
  const restamp = record => {
    const body = copy(record);
    delete body.phase3117SourceSnapshot;
    delete body[OWN+"Snapshot"];
    delete body[OWN+"SnapshotHash"];
    return {...record,[OWN+"Snapshot"]:body,[OWN+"SnapshotHash"]:core.computeSnapshotHash(body)};
  };
  const forged = copy(accepted);
  forged.auditTrail[1].action = "automatic_acceptance";
  assert(!core.integrityIntact(restamp(forged), clock));
  const extendedAudit = copy(accepted);
  extendedAudit.auditTrail[0].unexpected = true;
  assert(!core.integrityIntact(restamp(extendedAudit), clock));
  assert(!core.integrityIntact(restamp({...accepted,expiresAt:NOW}), clock));
  assert(!core.integrityIntact({...accepted,[OWN+"SnapshotHash"]:"bad"}, clock));
  assert(!core.integrityIntact({...accepted,schemaVersion:"bad"}, clock));
  assert(!core.integrityIntact(accepted,{now:() => "2027-02-08"}));
  assert(!core.integrityIntact(accepted,{now:() => NaN}));
  assert(!core.updateStabilizationClosureAcceptance(working,{rollbackPoint:"wrong"},human,clock).updated);
  assert(Object.isFrozen(handed) && Object.isFrozen(handed.auditTrail[0]) && Object.isFrozen(handed.phase3117SourceSnapshot));
  for (const [key,value] of Object.entries(api.SAFETY)) assert.equal(handed[key], value, key);
  assert.equal(forbiddenCalls, 0);
  const memory = {value:null, getItem(){return this.value}, setItem(key,value){assert.equal(key,core.STORAGE_KEY);this.value=value}};
  const save = records => core.saveStabilizationClosureAcceptanceRecords(memory, records, clock).saved;
  const load = () => core.loadStabilizationClosureAcceptanceRecords(memory, clock);
  assert(save([start]));
  assert(!save([pending]));
  assert(!save([]));
  assert(!save([start,start]));
  for (const record of [working,updated,pending,accepted,handed,invalid]) {
    assert(save([record]));
    const restored = load();
    assert(restored.loaded && Object.isFrozen(restored.records[0]));
    assert.equal(JSON.stringify(restored.records[0]), JSON.stringify(record));
  }
  assert(!save([handed]));
  const fork = restamp({...invalid,acceptanceReason:"replacement"});
  assert(core.integrityIntact(fork,clock));
  assert(!save([fork]));
  memory.value = memory.value.replace("evidence reviewed", "tampered");
  const tampered = memory.value;
  assert(!load().loaded);
  assert(!save([invalid]));
  assert.equal(memory.value,tampered);
  assert.equal(JSON.stringify(source),previousBytes);
  console.log("Phase31-18 unit / outcomes / safety / storage / audit: PASS");
}

function runRealAcceptance(inputPath, outputPath) {
  const upstream = require(dependencyPath);
  const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const bytes = JSON.stringify(source);
  // Only the test worker reuses successful real integrity checks for identical data and clock.
  const validated = new Set();
  const core = loadWithDependency({...upstream, integrityIntact(record, options) {
    const key = digest(JSON.stringify([record, options?.now?.() ?? null]));
    if (validated.has(key)) return true;
    const valid = upstream.integrityIntact(record, options);
    if (valid) validated.add(key);
    return valid;
  }});
  const start = checked(core.createStabilizationClosureAcceptanceRecord(source,input(core,source),human,clock,[]),"created");
  const working = checked(core.beginStabilizationClosureAcceptance(start,human,clock),"transitioned");
  const pending = checked(core.submitStabilizationClosureAcceptanceReview(working,human,clock),"transitioned");
  const accepted = checked(core.decideStabilizationClosureAcceptance(pending,completion(core),human,clock),"decided");
  assert.equal(accepted.canProceedToNextStage,false);
  const handed = checked(core.handoffToPhase31FinalClosure(accepted,human,clock),"handedOff");
  assert(core.integrityIntact(handed,clock));
  assert.equal(handed.canProceedToNextStage,true);
  assert(validated.size > 0);
  assert.equal(JSON.stringify(source),bytes);
  fs.writeFileSync(outputPath,JSON.stringify(handed));
  console.log("Real Phase31-16 → 17 → 18 integration: PASS");
}

function codeHash() {
  const hash = createHash("sha256");
  for (const dir of [path.dirname(__dirname), __dirname]) {
    for (const name of fs.readdirSync(dir).filter(name => name.endsWith(".js")).sort()) {
      hash.update(path.basename(dir) + "/" + name + "\0");
      hash.update(fs.readFileSync(path.join(dir,name)));
      hash.update("\0");
    }
  }
  return hash.digest("hex");
}

function runIntegration() {
  const checkpointArg = process.argv.indexOf("--checkpoint-dir");
  const persistent = checkpointArg !== -1;
  if (persistent) assert(process.argv[checkpointArg+1] && !process.argv[checkpointArg+1].startsWith("--"));
  const dir = persistent ? path.resolve(process.argv[checkpointArg+1]) : fs.mkdtempSync(path.join(os.tmpdir(),"hashimoto-phase3118-"));
  if (persistent && !fs.existsSync(dir)) fs.mkdirSync(dir);
  const files = Array.from({length:19}, (_,i) => path.join(dir,"phase3118-stage-"+i+".json"));
  const progressPath = path.join(dir,"phase3118-progress.json");
  const pendingPath = progressPath + ".tmp";
  const code = codeHash();
  let first = 0;
  if (persistent && fs.existsSync(progressPath)) {
    const checkpoint = JSON.parse(fs.readFileSync(progressPath,"utf8"));
    assert.equal(checkpoint.schemaVersion,1);
    assert.equal(checkpoint.code,code,"checkpoint code differs");
    assert(Number.isInteger(checkpoint.stage) && checkpoint.stage >= 0 && checkpoint.stage <= 18);
    assert.equal(checkpoint.fixture,digest(fs.readFileSync(files[checkpoint.stage])),"checkpoint fixture differs");
    first = checkpoint.stage + 1;
    console.log("Verified checkpoint through stage " + checkpoint.stage);
  } else if (persistent) {
    assert(!files.concat(pendingPath).some(file => fs.existsSync(file)), "use a fresh checkpoint directory");
  }
  const heap = Math.max(4096,Math.min(16384,Math.floor(os.totalmem()/1048576/2)));
  let completed = false;
  try {
    for (let stage = first; stage <= 18; stage++) {
      const worker = stage === 18 ? __filename : previousTest;
      console.log("RUN isolated integration stage " + stage);
      const result = spawnSync(process.execPath,["--expose-gc","--max-old-space-size="+heap,
        worker,"--integration-worker",String(stage),stage ? files[stage-1] : "-",files[stage]],{stdio:"inherit"});
      assert.equal(result.status,0,"FAIL isolated integration stage " + stage);
      if (persistent) {
        assert.equal(codeHash(),code,"code changed during validation");
        fs.writeFileSync(pendingPath,JSON.stringify({schemaVersion:1,code,stage,fixture:digest(fs.readFileSync(files[stage]))}));
        fs.renameSync(pendingPath,progressPath);
      }
      if (stage) fs.unlinkSync(files[stage-1]);
      console.log("PASS isolated integration stage " + stage);
    }
    completed = true;
    console.log("Phase31-18 full integration and unchanged Phase31-1–17 regressions: PASS");
  } finally {
    if (!persistent || completed) {
      for (const file of files.concat(progressPath,pendingPath)) if (fs.existsSync(file)) fs.unlinkSync(file);
      if (!persistent) fs.rmdirSync(dir);
    }
  }
}

if (process.argv.includes("--integration-worker")) {
  const index = process.argv.indexOf("--integration-worker");
  assert.equal(process.argv[index+1], "18");
  runRealAcceptance(process.argv[index+2], process.argv[index+3]);
} else {
  if (!process.argv.includes("--integration-only")) runUnit();
  if (!process.argv.includes("--unit-only")) runIntegration();
}
