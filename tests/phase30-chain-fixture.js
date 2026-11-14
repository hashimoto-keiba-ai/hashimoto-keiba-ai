"use strict";

const fs = require("node:fs");
const parentValidator = require("../phase30-1-purpose-scope-safety-boundary-definition-core.js").validatePhase2919Eligibility;
const validators = new Map();
for (const file of fs.readdirSync(require("node:path").join(__dirname, ".."))) {
 if (!/^phase30-.*core\.js$/.test(file)) continue;
 const api = require("../" + file);
 for (const key of Object.keys(api)) if (/^validatePhase30\d+Eligibility$/.test(key)) validators.set(key, api[key]);
}

function build(api, parentValidator, now){
 const version=api.SCHEMA_VERSION,terminal=version.startsWith("29."),ref=Object.keys(api).find(k=>/^PHASE\d+_REFERENCE$/.test(k));
 const up=terminal?null:build(api[ref], parentValidator, now);
 const validator = terminal ? parentValidator : validators.get("validatePhase" + version.split(".").slice(0, 2).join("") + "Eligibility");
 const text=validator.toString(),status=text.match(/s\.([A-Za-z0-9]+Status)!=="([^"]+)"/),result=text.match(/s\.([A-Za-z0-9]+Result)!=="([^"]+)"/),name=status[1].slice(0,-6);
 const b={...api.SAFETY,[name+"Id"]:name+"-1",[status[1]]:status[2],[result[1]]:result[2],errors:[],unresolvedIssues:[],criticalIssues:[],blockingConditions:[],recordVersion:1,auditTrail:[{action:"manual",from:"",to:status[2],performedBy:"human",reason:"confirmed",performedAt:now}]};
 for(const k of api.REFERENCE_IDS.concat(api.UPSTREAM_FIELDS))b[k]=up?up[k]:k+"-1";
 if(up)b[ref.toLowerCase().replace("_reference","SourceSnapshot")]=up;
 if(!terminal&&Number(version.split(".")[1])>=4)b.phase30Started=b.manualPhase30StartCompleted=true;const snap={...b};if(name==="phase30Definition")delete snap[ref.toLowerCase().replace("_reference","SourceSnapshot")];
 return {...b,[name+"Snapshot"]:snap,[name+"SnapshotHash"]:api.computeSnapshotHash(snap),[name+"Version"]:version};
}

module.exports = (api, now) => build(api, parentValidator, now);
