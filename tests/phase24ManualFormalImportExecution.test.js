"use strict";
const assert=require("assert"),{webcrypto}=require("crypto"),core=require("../phase24-5-manual-formal-import-execution.js");
(async()=>{
const candidate={importCandidateId:"c1",candidateStatus:"approved_as_import_candidate",sourcePhase24_3RecordId:"r3",sourcePhase24_2RecordId:"r2",acquisitionPlanId:"p",targetType:"odds",targetDate:"2026-07-25",racecourse:"Tokyo",raceNumber:"11",normalizedPayload:{raceId:"x",value:2.5},sourceSnapshot:{recordCount:1},verificationSummary:{result:"passed"},verificationChecks:[],contentHash:"a".repeat(64),candidateHash:"b".repeat(64)};
const candidates={candidates:[candidate,{...candidate,importCandidateId:"bad",candidateStatus:"cancelled"}]};
let store=core.defaultStore(),r=core.createImportRecord(store,candidates,"c1",{operator:"human"});assert(r.created);store=r.store;assert(!core.createImportRecord(store,candidates,"bad",{operator:"human"}).created);
r=core.transition(store,"formal-import-c1","import_precheck_in_progress",{operator:"human",reason:"start"});store=r.store;r=core.addPrecheck(store,"formal-import-c1",{checkId:"all",checkName:"all required checks",result:"passed",checkedBy:"human",message:"confirmed"});assert(r.added);store=r.store;
r=core.transition(store,"formal-import-c1","ready_for_manual_import",{operator:"human",reason:"ready"});store=r.store;r=core.transition(store,"formal-import-c1","import_in_progress",{operator:"human",reason:"execute",explicitConfirmation:true});store=r.store;
r=await core.executeManualImport(store,"formal-import-c1",{importedBy:"human",importReason:"manual",explicitConfirmation:true},{crypto:webcrypto});assert(r.executed);store=r.store;assert.equal(r.record.importStatus,"imported");assert.equal(r.record.safetyFlags.phase22Modified,false);
r=core.transition(store,"formal-import-c1","rollback_requested",{operator:"human",reason:"undo",confirmation:"ROLLBACK"});assert(r.transitioned);store=r.store;r=core.transition(store,"formal-import-c1","rolled_back",{operator:"human",reason:"done"});assert(r.transitioned);
assert(core.validateBackup(core.exportBackup(store)).valid);assert(core.validatePayload(JSON.parse('{"__proto__":{"x":1}}')).includes("dangerous_key"));assert(!core.STATUSES.includes("phase22_reflected"));
console.log("phase24ManualFormalImportExecution.test.js: PASS");
})().catch(e=>{console.error(e);process.exitCode=1});
