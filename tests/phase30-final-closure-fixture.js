"use strict";

const assert=require("node:assert"),fs=require("node:fs"),vm=require("node:vm");
const real=require("../phase30-19-phase30-final-closure-core.js");
const code=fs.readFileSync(require.resolve("../phase30-19-phase30-final-closure-core.js"),"utf8");
const {buildAcceptanceForClosure,buildRealAcceptanceForClosure}=require("./phase30-acceptance-fixture");
const copy=v=>JSON.parse(JSON.stringify(v));
const NOW="2027-01-05T00:00:00Z",options={now:()=>NOW},human={performedBy:"reviewer",reason:"Phase30 complete",performedAt:NOW,explicitConfirmation:true};
const input={closureSummary:"Phase30 complete",completionCriteria:"all accepted",finalConfirmations:"chain and safety checked"};
const sourceName="phase30PostStartStabilizationClosureAcceptance";

function setupClosure(){
const fixture=buildAcceptanceForClosure();
let externalCalls=0;
const forbidden=()=>{externalCalls++;throw Error("side effect forbidden")};
const box={module:{exports:{}},require:id=>{assert.strictEqual(id,"./phase30-18-phase30-post-start-stabilization-closure-acceptance-core.js");return fixture.acceptanceApi},fetch:forbidden,XMLHttpRequest:forbidden,WebSocket:forbidden,EventSource:forbidden,Worker:forbidden,setTimeout:forbidden,setInterval:forbidden,localStorage:{getItem:forbidden,setItem:forbidden},navigator:{sendBeacon:forbidden},process:{},document:{}};
vm.runInNewContext(code,box);
const core=box.module.exports,api=fixture.acceptanceApi,source=copy(fixture.acceptanceSource),before=JSON.stringify(source);
return {core,api,source,before,getExternalCalls:()=>externalCalls};
}

function buildClosure(){
const {core,source}=setupClosure();
const created=core.createPhase30FinalClosureRecord(source,input,human,options,[]);
assert(created.created,created.reasons.join());
return {closureApi:core,closureRecord:created.record};
}

function buildRealClosure(){
const source=buildRealAcceptanceForClosure();
const final=real.createPhase30FinalClosureRecord(source,input,human,options,[]);
assert(final.created,final.reasons.join());
return final.record;
}

module.exports={setupClosure,buildClosure,buildRealClosure};
