(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.HashimotoPhase252SourceCandidateManagement=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const SCHEMA_VERSION=1,STORAGE_KEY="hashimotoKeibaAi.phase25.sourceCandidateManagement.v1";
const SOURCE_TYPES=["official_public_site","official_api_candidate","licensed_data_provider","public_reference_site","manual_download_source","local_file_source","unknown","prohibited"];
const DATA_CATEGORIES=["race_entry","odds","race_result","payout","jockey","trainer","horse_profile","track_condition","weather","schedule","historical_result","other"];
const METHODS=["manual_browser_reference","manual_download","manual_csv_import","manual_json_import","official_api_review_candidate","browser_assisted_candidate","local_file_only","undecided","prohibited"];
const REGISTRATION_STATUSES=["draft","registered","under_review","approved_for_method_review","suspended","rejected","prohibited","archived"];
const REVIEW_STATUSES=["not_reviewed","review_required","under_review","acceptable","unacceptable","unknown"];
const ROBOTS_REVIEW_STATUSES=["not_reviewed","review_required","under_review","acceptable","unacceptable","not_applicable","unknown"];
const USAGE_PERMISSION_STATUSES=["not_confirmed","confirmation_required","under_review","confirmed_manual_use_only","confirmed_limited_use","prohibited","unknown"];
const RISK_LEVELS=["low","medium","high","critical","prohibited","unknown"];
const AUDIT_ACTIONS=["candidate_registered","candidate_updated","candidate_suspended","candidate_rejected","candidate_archived","candidate_marked_prohibited","review_status_changed","risk_level_changed","safety_gate_evaluated"];
const REQUIRED=["sourceCandidateId","sourceName","sourceType","dataCategory","acquisitionMethodCandidate","registrationStatus","riskLevel"];
const MAX_CANDIDATES=1000,MAX_AUDITS=10000,MAX_TEXT=4000,MAX_STORE=4*1024*1024;
const BLOCKED_TEXT=/(<script|javascript\s*:|data\s*:\s*text\/html|powershell|cmd\.exe|child_process|eval\s*\(|new\s+function|document\.cookie)/i;
const clip=v=>v==null?"":String(v).trim().slice(0,MAX_TEXT),iso=v=>new Date(v||Date.now()).toISOString();
const clone=v=>JSON.parse(JSON.stringify(v));
function defaultStore(){return{schemaVersion:SCHEMA_VERSION,candidates:[],auditLogs:[],savedAt:""}}
function normalizeStore(value={}){const v=value&&typeof value==="object"?clone(value):{};return{schemaVersion:SCHEMA_VERSION,candidates:Array.isArray(v.candidates)?v.candidates.slice(0,MAX_CANDIDATES):[],auditLogs:Array.isArray(v.auditLogs)?v.auditLogs.slice(-MAX_AUDITS):[],savedAt:clip(v.savedAt)}}
function enumValid(value,list){return list.includes(value)}
function validateCandidate(input={},existing=[]){
  const errors=[];
  REQUIRED.forEach(k=>{if(!clip(input[k]))errors.push(`${k}_required`)});
  if(clip(input.sourceCandidateId)&&existing.some(x=>x.sourceCandidateId===clip(input.sourceCandidateId)))errors.push("duplicate_source_candidate_id");
  if(input.sourceType&&!enumValid(input.sourceType,SOURCE_TYPES))errors.push("invalid_source_type");
  const cats=Array.isArray(input.dataCategory)?input.dataCategory:[input.dataCategory];
  if(!cats.length||cats.some(x=>!enumValid(x,DATA_CATEGORIES)))errors.push("invalid_data_category");
  if(input.acquisitionMethodCandidate&&!enumValid(input.acquisitionMethodCandidate,METHODS))errors.push("invalid_acquisition_method_candidate");
  if(input.registrationStatus&&!enumValid(input.registrationStatus,REGISTRATION_STATUSES))errors.push("invalid_registration_status");
  if(input.termsReviewStatus&&!enumValid(input.termsReviewStatus,REVIEW_STATUSES))errors.push("invalid_terms_review_status");
  if(input.robotsReviewStatus&&!enumValid(input.robotsReviewStatus,ROBOTS_REVIEW_STATUSES))errors.push("invalid_robots_review_status");
  if(input.accessRestrictionReviewStatus&&!enumValid(input.accessRestrictionReviewStatus,REVIEW_STATUSES))errors.push("invalid_access_restriction_review_status");
  if(input.usagePermissionStatus&&!enumValid(input.usagePermissionStatus,USAGE_PERMISSION_STATUSES))errors.push("invalid_usage_permission_status");
  if(input.riskLevel&&!enumValid(input.riskLevel,RISK_LEVELS))errors.push("invalid_risk_level");
  for(const[k,v]of Object.entries(input))if(typeof v==="string"&&BLOCKED_TEXT.test(v))errors.push(`${k}_executable_text_rejected`);
  return[...new Set(errors)];
}
function audit(action,id,by,reason,previousValue,nextValue,now){return{auditId:`p252-audit-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,action,sourceCandidateId:id,performedAt:iso(now),performedBy:clip(by),previousValue:clone(previousValue||null),nextValue:clone(nextValue||null),reason:clip(reason),schemaVersion:SCHEMA_VERSION}}
function appendAudit(store,entry){return{...store,auditLogs:[...store.auditLogs,entry].slice(-MAX_AUDITS)}}
function createCandidate(storeInput,input={},now=new Date()){
  const store=normalizeStore(storeInput),errors=validateCandidate(input,store.candidates);
  if(store.candidates.length>=MAX_CANDIDATES)errors.push("candidate_limit");
  if(!clip(input.createdBy))errors.push("createdBy_required");
  if(errors.length)return{created:false,errors:[...new Set(errors)]};
  const candidate={
    sourceCandidateId:clip(input.sourceCandidateId),sourceName:clip(input.sourceName),sourceType:input.sourceType,
    dataCategory:(Array.isArray(input.dataCategory)?input.dataCategory:[input.dataCategory]).slice(0,DATA_CATEGORIES.length),
    sourceUrlReference:clip(input.sourceUrlReference),providerName:clip(input.providerName),description:clip(input.description),
    acquisitionMethodCandidate:input.acquisitionMethodCandidate,authenticationRequirement:clip(input.authenticationRequirement),
    termsReviewStatus:input.termsReviewStatus||"not_reviewed",robotsReviewStatus:input.robotsReviewStatus||"not_reviewed",
    accessRestrictionReviewStatus:input.accessRestrictionReviewStatus||"not_reviewed",usagePermissionStatus:input.usagePermissionStatus||"not_confirmed",
    registrationStatus:input.registrationStatus,riskLevel:input.riskLevel,notes:clip(input.notes),createdAt:iso(now),updatedAt:iso(now),
    createdBy:clip(input.createdBy),updatedBy:clip(input.createdBy),externalAcquisitionExecutionAllowed:false,networkCommunicationAllowed:false
  };
  const entry=audit("candidate_registered",candidate.sourceCandidateId,input.createdBy,input.reason||"manual registration",null,candidate,now);
  return{created:true,candidate,store:appendAudit({...store,candidates:[...store.candidates,candidate]},entry)};
}
function automaticBlockReasons(candidate={}){
  const reasons=[];
  if(candidate.sourceType==="prohibited")reasons.push("source_type_prohibited");
  if(candidate.acquisitionMethodCandidate==="prohibited")reasons.push("acquisition_method_prohibited");
  if(candidate.registrationStatus==="prohibited")reasons.push("registration_prohibited");
  if(candidate.usagePermissionStatus==="prohibited")reasons.push("usage_permission_prohibited");
  for(const key of["termsReviewStatus","robotsReviewStatus","accessRestrictionReviewStatus"])if(candidate[key]==="unacceptable")reasons.push(`${key}_unacceptable`);
  if(["critical","prohibited"].includes(candidate.riskLevel))reasons.push("risk_level_blocked");
  return reasons;
}
function updateCandidate(storeInput,id,patch={},meta={},now=new Date()){
  const store=normalizeStore(storeInput),index=store.candidates.findIndex(x=>x.sourceCandidateId===id);
  if(index<0)return{updated:false,errors:["candidate_not_found"]};
  const previous=store.candidates[index];
  if(previous.registrationStatus==="prohibited")return{updated:false,errors:["prohibited_candidate_immutable"]};
  if(!clip(meta.updatedBy)||!clip(meta.reason))return{updated:false,errors:["updatedBy_and_reason_required"]};
  const next={...previous,...clone(patch),sourceCandidateId:previous.sourceCandidateId,createdAt:previous.createdAt,createdBy:previous.createdBy,updatedAt:iso(now),updatedBy:clip(meta.updatedBy),externalAcquisitionExecutionAllowed:false,networkCommunicationAllowed:false};
  const errors=validateCandidate(next,[]);
  if(errors.length)return{updated:false,errors};
  const statusAction=next.registrationStatus!==previous.registrationStatus?({suspended:"candidate_suspended",rejected:"candidate_rejected",archived:"candidate_archived",prohibited:"candidate_marked_prohibited"}[next.registrationStatus]||"candidate_updated"):next.riskLevel!==previous.riskLevel?"risk_level_changed":["termsReviewStatus","robotsReviewStatus","accessRestrictionReviewStatus","usagePermissionStatus"].some(k=>next[k]!==previous[k])?"review_status_changed":"candidate_updated";
  const candidates=store.candidates.slice();candidates[index]=next;
  return{updated:true,candidate:next,store:appendAudit({...store,candidates},audit(statusAction,id,meta.updatedBy,meta.reason,previous,next,now))};
}
function evaluateMethodReviewGate(candidate={},phase251Boundary={}){
  const reasons=automaticBlockReasons(candidate);
  if(candidate.registrationStatus!=="approved_for_method_review")reasons.push("registration_not_approved_for_method_review");
  if(phase251Boundary.privateLocalOnly!==true||phase251Boundary.planOnly!==true||phase251Boundary.protectedMode!==true)reasons.push("phase25_1_safety_boundary_closed");
  if(phase251Boundary.humanApprovalRequired!==true)reasons.push("human_approval_required");
  if(phase251Boundary.externalAcquisitionExecutionAllowed!==false)reasons.push("external_acquisition_must_remain_disabled");
  if(phase251Boundary.networkCommunicationAllowed===true)reasons.push("network_communication_must_remain_disabled");
  return{eligibleForMethodReview:reasons.length===0,externalAcquisitionExecutionAllowed:false,networkCommunicationAllowed:false,reasons};
}
function recordGateEvaluation(storeInput,id,boundary,performedBy,reason,now=new Date()){
  const store=normalizeStore(storeInput),candidate=store.candidates.find(x=>x.sourceCandidateId===id);
  if(!candidate)return{recorded:false,errors:["candidate_not_found"]};
  if(!clip(performedBy)||!clip(reason))return{recorded:false,errors:["performedBy_and_reason_required"]};
  const result=evaluateMethodReviewGate(candidate,boundary);
  return{recorded:true,result,store:appendAudit(store,audit("safety_gate_evaluated",id,performedBy,reason,candidate,result,now))};
}
function saveStore(value,storage,now=new Date()){if(!storage)return{saved:false,reason:"storage_unavailable"};const store=normalizeStore(value);store.savedAt=iso(now);const raw=JSON.stringify(store);if(new TextEncoder().encode(raw).length>MAX_STORE)return{saved:false,reason:"store_capacity"};try{storage.setItem(STORAGE_KEY,raw);return{saved:true,store}}catch(_){return{saved:false,reason:"storage_error"}}}
function loadStore(storage){try{return{store:normalizeStore(JSON.parse(storage&&storage.getItem(STORAGE_KEY)||"{}")),parseError:false}}catch(_){return{store:defaultStore(),parseError:true}}}
function bindUi(documentRef,storage,boundary){if(!documentRef)return;let store=loadStore(storage).store;const q=id=>documentRef.getElementById(id),msg=t=>{if(q("p252-message"))q("p252-message").textContent=t},render=()=>{const box=q("p252-list");if(box)box.textContent=store.candidates.map(x=>`${x.sourceCandidateId} | ${x.sourceName} | ${x.sourceType} | ${x.dataCategory.join(",")} | ${x.acquisitionMethodCandidate} | ${x.riskLevel} | ${x.registrationStatus} | gate:${evaluateMethodReviewGate(x,boundary).eligibleForMethodReview?"OPEN FOR REVIEW":"CLOSED"}`).join("\n")||"登録候補なし";};
  q("p252-register")&&q("p252-register").addEventListener("click",()=>{const input={sourceCandidateId:q("p252-id").value,sourceName:q("p252-name").value,sourceType:q("p252-type").value,dataCategory:[q("p252-category").value],sourceUrlReference:q("p252-url").value,providerName:q("p252-provider").value,description:q("p252-description").value,acquisitionMethodCandidate:q("p252-method").value,authenticationRequirement:q("p252-auth").value,termsReviewStatus:q("p252-terms").value,robotsReviewStatus:q("p252-robots").value,accessRestrictionReviewStatus:q("p252-access").value,usagePermissionStatus:q("p252-usage").value,registrationStatus:"draft",riskLevel:q("p252-risk").value,createdBy:q("p252-actor").value,reason:q("p252-reason").value};const r=createCandidate(store,input);if(!r.created)return msg(r.errors.join(" / "));store=r.store;saveStore(store,storage);msg("手動登録しました。外部取得は未許可です。");render()});
  q("p252-update")&&q("p252-update").addEventListener("click",()=>{const patch={sourceName:q("p252-name").value,sourceType:q("p252-type").value,dataCategory:[q("p252-category").value],sourceUrlReference:q("p252-url").value,providerName:q("p252-provider").value,description:q("p252-description").value,acquisitionMethodCandidate:q("p252-method").value,authenticationRequirement:q("p252-auth").value,termsReviewStatus:q("p252-terms").value,robotsReviewStatus:q("p252-robots").value,accessRestrictionReviewStatus:q("p252-access").value,usagePermissionStatus:q("p252-usage").value,registrationStatus:q("p252-status").value,riskLevel:q("p252-risk").value};const r=updateCandidate(store,q("p252-id").value,patch,{updatedBy:q("p252-actor").value,reason:q("p252-reason").value});if(!r.updated)return msg(r.errors.join(" / "));store=r.store;saveStore(store,storage);msg("手動更新しました。");render()});render();
  q("p252-evaluate")&&q("p252-evaluate").addEventListener("click",()=>{const r=recordGateEvaluation(store,q("p252-id").value,boundary,q("p252-actor").value,q("p252-reason").value);if(!r.recorded)return msg(r.errors.join(" / "));store=r.store;saveStore(store,storage);msg(`安全ゲート: ${r.result.eligibleForMethodReview?"次段階レビュー候補":"閉鎖"} / ${r.result.reasons.join(" / ")||"違反なし"} / 外部取得は未許可`);render()});render();
}
if(typeof document!=="undefined"){const start=()=>bindUi(document,typeof localStorage!=="undefined"?localStorage:null,(root.HashimotoPhase251PurposeScopeSafetyBoundary||{}).SAFETY_BOUNDARY||{});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start()}
return{SCHEMA_VERSION,STORAGE_KEY,SOURCE_TYPES,DATA_CATEGORIES,METHODS,REGISTRATION_STATUSES,REVIEW_STATUSES,ROBOTS_REVIEW_STATUSES,USAGE_PERMISSION_STATUSES,RISK_LEVELS,AUDIT_ACTIONS,REQUIRED,defaultStore,normalizeStore,validateCandidate,createCandidate,automaticBlockReasons,updateCandidate,evaluateMethodReviewGate,recordGateEvaluation,saveStore,loadStore,bindUi};
});
