(function (root, factory) {
  const phase269 = typeof module === "object" && module.exports
    ? require("./phase26-9-manual-result-data-read-temporary-holding-core.js")
    : root.HashimotoPhase269ManualResultDataReadTemporaryHolding;
  const api = factory(phase269);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HashimotoPhase2610ManualResultDataParsePreviewGeneration = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (phase269) {
  "use strict";
  if (!phase269) throw new Error("Phase26-9 definition is required");
  const freeze = value => { if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(freeze); } return value; };
  const clone = value => Array.isArray(value) ? value.map(clone) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])) : value;
  const clean = value => typeof value === "string" ? value.trim() : "";
  const unique = values => [...new Set(Array.isArray(values) ? values : [])];
  const nowIso = options => new Date(options && typeof options.now === "function" ? options.now() : new Date()).toISOString();
  const manual = (operation, explicit) => Boolean(operation && clean(operation.performedBy) && clean(operation.reason) && (!explicit || operation.explicitConfirmation === true));

  const PHASE269_REFERENCE = phase269;
  const LIMITS = freeze({ maximumCharacters: 5000000, maximumRows: 100000, maximumColumns: 200, maximumPreviewRows: 100, maximumCellDisplayCharacters: 500 });
  const STATES = freeze(["awaiting_manual_parse_configuration", "parse_configuration_recorded", "validating_parse_configuration", "ready_for_manual_parse_execution", "manual_parse_in_progress", "manual_parse_succeeded", "manual_parse_failed", "manual_parse_interrupted", "manual_parse_cancelled", "preview_generated", "preview_review_preparation", "preview_discarded", "ready_for_manual_result_preview_review"]);
  const PREVIEW_STATUSES = freeze(["none", "generating", "generated", "held", "discarded", "invalidated"]);
  const CHECK_STATUSES = freeze(["unchecked", "passed", "failed", "not_applicable", "needs_review"]);
  const ALWAYS_FALSE_FLAGS = freeze({
    resultDataStored: false, resultDataImported: false, resultDataApplied: false, resultDataLearned: false,
    resultPreviewReady: false, intakeReady: false, autoExecutionEnabled: false, automaticParseEnabled: false,
    automaticImportEnabled: false, externalConnectionEnabled: false, fileContentStored: false,
    fileUploaded: false, fileExternallyTransmitted: false, permanentStorageCompleted: false,
    formalImportCompleted: false, applicationCompleted: false, learningCompleted: false
  });
  const CHECK_DEFINITIONS = freeze([
    ["phase269_ready","対象がPhase26-9 ready","target"],["temporary_exists","一時保持データが存在","target"],["temporary_held","temporaryDataStatusがheld","target"],["raw_in_memory","rawTextがメモリ上に存在","target"],
    ["config_id","解析設定IDが存在","config"],["configured_by","解析設定者が記録済み","config"],["format","解析対象形式が記録済み","config"],["delimiter","区切り文字が記録済み","config"],["quote","引用符設定が記録済み","config"],["header","ヘッダー有無が記録済み","config"],["max_rows","最大解析行数が記録済み","limits"],["max_preview","最大プレビュー行数が記録済み","limits"],
    ["format_compared","Phase26-8申告形式との比較完了","comparison"],["delimiter_compared","Phase26-8申告区切り文字との比較完了","comparison"],["header_compared","Phase26-8申告ヘッダーとの比較完了","comparison"],["difference_reviewed","差異の人間確認が完了","comparison"],
    ["manual_start","解析開始が人間の明示操作","execution"],["executor","解析実行者が記録済み","execution"],["started","解析開始日時が記録済み","execution"],["completed","解析終了日時が記録済み","execution"],["duration","解析時間が記録済み","execution"],["outcome","解析成功可否が記録済み","execution"],
    ["row_count","解析行数が記録済み","result"],["column_count","解析列数が記録済み","result"],["header_info","ヘッダー情報が記録済み","result"],["data_rows","データ行数が記録済み","result"],["blank_rows","空行数が記録済み","result"],["irregular_rows","不規則行数が記録済み","result"],["few_columns","列数不足行が記録済み","result"],["many_columns","列数超過行が記録済み","result"],
    ["quote_anomaly","引用符異常を確認済み","anomaly"],["empty_header","空ヘッダーを確認済み","anomaly"],["duplicate_header","重複ヘッダーを確認済み","anomaly"],["control_character","制御文字候補を確認済み","anomaly"],["formula_warning","Formula Injection候補を確認済み","anomaly"],["missing_summary","欠損候補を集計済み","analysis"],["duplicate_summary","重複行候補を集計済み","analysis"],
    ["preview_limit","プレビュー行数が上限以内","preview"],["cell_limit","セル表示文字数が上限以内","preview"],["safe_text","セル値をHTML描画していない","safety"],["no_external_url","外部URLを自動読込していない","safety"],["no_script","scriptを実行していない","safety"],["no_auto_fix","データを自動修正していない","safety"],["no_auto_delete","データを自動削除していない","safety"],["no_auto_merge","データを自動統合していない","safety"],
    ["no_store","正式保存していない","safety"],["no_import","正式インポートしていない","safety"],["no_apply","データ適用していない","safety"],["no_learning","学習更新していない","safety"],["no_send","外部送信していない","safety"],
    ["preview_id","プレビューIDが存在","preview"],["preview_held","previewStatusがheld","preview"],["not_discarded","プレビューが破棄されていない","preview"],["human_review","人間の生成結果確認が完了","handoff"],["handoff","Phase26-11引渡し可否を記録済み","handoff"],["no_failure","未解決の解析失敗がない","exceptions"],["no_interrupt","未解決の中断がない","exceptions"],["no_cancel","未解決の取消がない","exceptions"]
  ].map(([checkId,label,category]) => ({ checkId,label,category,required:true })));
  const ALLOWED_TRANSITIONS = freeze({
    awaiting_manual_parse_configuration:["parse_configuration_recorded","manual_parse_cancelled"],
    parse_configuration_recorded:["validating_parse_configuration","manual_parse_cancelled"],
    validating_parse_configuration:["ready_for_manual_parse_execution","manual_parse_cancelled"],
    ready_for_manual_parse_execution:["manual_parse_in_progress","manual_parse_cancelled"],
    manual_parse_in_progress:["manual_parse_succeeded","manual_parse_failed","manual_parse_interrupted","manual_parse_cancelled"],
    manual_parse_succeeded:["preview_generated","manual_parse_cancelled"],
    manual_parse_failed:["ready_for_manual_parse_execution","manual_parse_cancelled"],
    manual_parse_interrupted:["ready_for_manual_parse_execution","manual_parse_cancelled"],
    manual_parse_cancelled:[], preview_generated:["preview_review_preparation","preview_discarded"],
    preview_review_preparation:["ready_for_manual_result_preview_review","preview_discarded"],
    preview_discarded:[], ready_for_manual_result_preview_review:[]
  });
  const previewMemory = new Map();
  const activeParses = new Set();
  const requestedActions = new Map();

  function createChecklist(items) {
    const map = new Map((Array.isArray(items) ? items : []).map(item => [item && item.checkId,item]));
    return CHECK_DEFINITIONS.map(def => { const item=map.get(def.checkId)||{}; return {...def,status:CHECK_STATUSES.includes(item.status)?item.status:"unchecked",checkedBy:clean(item.checkedBy),checkedAt:clean(item.checkedAt),note:clean(item.note)}; });
  }
  function snapshot(target) {
    const value=target||{}, temp=value.temporaryData||{}, p268=value.phase268Snapshot||{};
    return freeze({
      readExecutionRecordId:clean(value.readExecutionRecordId),status:clean(value.status),resultDataRead:value.resultDataRead===true,
      fileContentAccessed:value.fileContentAccessed===true,temporaryDataHeld:value.temporaryDataHeld===true,
      resultDataParsed:value.resultDataParsed===true,resultDataStored:value.resultDataStored===true,resultDataImported:value.resultDataImported===true,
      resultDataApplied:value.resultDataApplied===true,resultDataLearned:value.resultDataLearned===true,resultPreviewCreated:value.resultPreviewCreated===true,
      resultPreviewReady:value.resultPreviewReady===true,intakeReady:value.intakeReady===true,fileContentStored:value.fileContentStored===true,
      fileUploaded:value.fileUploaded===true,fileExternallyTransmitted:value.fileExternallyTransmitted===true,
      temporaryData:{temporaryDataId:clean(temp.temporaryDataId),temporaryDataStatus:clean(temp.temporaryDataStatus),sourceFileName:clean(temp.sourceFileName)},
      declared:{format:clean(p268.expectedDataFormat||p268.expectedFileType),extension:clean(p268.extension),mimeType:clean(p268.mimeType),encoding:clean(p268.expectedEncoding),delimiter:clean(p268.expectedDelimiter),headerPresent:typeof p268.expectedHeaderPresent==="boolean"?p268.expectedHeaderPresent:null},
      unresolvedIssues:unique(value.unresolvedIssues),failureRecord:clone(value.failureRecord||{}),interruptionRecord:clone(value.interruptionRecord||{}),cancellationRecord:clone(value.cancellationRecord||{})
    });
  }
  function validateTarget(target) {
    const value=target||{}, temp=value.temporaryData||{}, reasons=[];
    if(value.status!=="ready_for_manual_result_data_parse_preview")reasons.push("phase269_status_not_ready");
    if(!clean(value.readExecutionRecordId)||!clean(value.successRecord&&value.successRecord.successRecordId))reasons.push("phase269_read_record_missing");
    if(!clean(temp.temporaryDataId)||temp.temporaryDataStatus!=="held"||value.temporaryDataHeld!==true)reasons.push("temporary_data_not_held");
    if(phase269.getTemporaryData(value)===undefined)reasons.push("raw_text_not_in_memory");
    if(value.resultDataRead!==true||value.fileContentAccessed!==true)reasons.push("read_flags_invalid");
    for(const key of ["resultDataParsed","resultDataStored","resultDataImported","resultDataApplied","resultDataLearned","resultPreviewCreated","resultPreviewReady","intakeReady","fileContentStored","fileUploaded","fileExternallyTransmitted"])if(value[key]!==false)reasons.push(`${key}_must_be_false`);
    if((value.unresolvedIssues||[]).length||value.failureRecord&&value.failureRecord.unresolved||value.interruptionRecord&&value.interruptionRecord.unresolved||value.cancellationRecord&&value.cancellationRecord.unresolved)reasons.push("unresolved_read_issue");
    return freeze({valid:reasons.length===0,reasons});
  }
  function normalize(input,options) {
    const s=input||{}, config=s.configuration||{}, comp=s.configurationComparison||{}, result=s.parseResult||{}, preview=s.preview||{}, review=s.handoffReview||{};
    return {
      parseConfigurationId:clean(s.parseConfigurationId||config.parseConfigurationId),phase269ReadExecutionRecordId:clean(s.phase269ReadExecutionRecordId),targetTemporaryDataId:clean(s.targetTemporaryDataId),
      phase269Snapshot:snapshot(s.phase269Snapshot||{}),status:STATES.includes(s.status)?s.status:"awaiting_manual_parse_configuration",
      configuration:{parseConfigurationId:clean(config.parseConfigurationId||s.parseConfigurationId),configuredBy:clean(config.configuredBy),configurationDate:clean(config.configurationDate),configurationTime:clean(config.configurationTime),executionReason:clean(config.executionReason),expectedFormat:clean(config.expectedFormat),parseFormat:clean(config.parseFormat),declaredEncoding:clean(config.declaredEncoding),delimiter:typeof config.delimiter==="string"?config.delimiter:"",quote:typeof config.quote==="string"?config.quote:"",escapeCharacter:typeof config.escapeCharacter==="string"?config.escapeCharacter:"",newlineMode:clean(config.newlineMode),headerPresent:typeof config.headerPresent==="boolean"?config.headerPresent:null,headerRowNumber:Number.isInteger(config.headerRowNumber)?config.headerRowNumber:1,dataStartRowNumber:Number.isInteger(config.dataStartRowNumber)?config.dataStartRowNumber:2,blankLineHandling:clean(config.blankLineHandling),trimHandling:clean(config.trimHandling),trailingDelimiterHandling:clean(config.trailingDelimiterHandling),columnMismatchHandling:clean(config.columnMismatchHandling),duplicateHeaderHandling:clean(config.duplicateHeaderHandling),emptyHeaderHandling:clean(config.emptyHeaderHandling),maximumCharacters:Number.isInteger(config.maximumCharacters)?config.maximumCharacters:LIMITS.maximumCharacters,maximumRows:Number.isInteger(config.maximumRows)?config.maximumRows:LIMITS.maximumRows,maximumPreviewRows:Number.isInteger(config.maximumPreviewRows)?config.maximumPreviewRows:LIMITS.maximumPreviewRows,maximumColumns:Number.isInteger(config.maximumColumns)?config.maximumColumns:LIMITS.maximumColumns,maximumCellDisplayCharacters:Number.isInteger(config.maximumCellDisplayCharacters)?config.maximumCellDisplayCharacters:LIMITS.maximumCellDisplayCharacters,note:clean(config.note),missingTokens:Array.isArray(config.missingTokens)?config.missingTokens.map(String):["","null","NA","N/A","undefined"]},
      configurationComparison:{formatMatch:comp.formatMatch===true,encodingDeclarationMatch:comp.encodingDeclarationMatch===true,delimiterMatch:comp.delimiterMatch===true,headerDeclarationMatch:comp.headerDeclarationMatch===true,mismatchFields:unique(comp.mismatchFields),mismatchReason:clean(comp.mismatchReason),humanReviewResult:clean(comp.humanReviewResult),reviewedBy:clean(comp.reviewedBy),reviewedAt:clean(comp.reviewedAt)},
      encodingReview:clone(s.encodingReview||{}),parseExecution:clone(s.parseExecution||{}),parseResult:clone(result),
      preview:{previewDataId:clean(preview.previewDataId),targetTemporaryDataId:clean(preview.targetTemporaryDataId),parseExecutionRecordId:clean(preview.parseExecutionRecordId),parseConfigurationId:clean(preview.parseConfigurationId),previewStatus:PREVIEW_STATUSES.includes(preview.previewStatus)?preview.previewStatus:"none",createdBy:clean(preview.createdBy),createdAt:clean(preview.createdAt),discardedBy:clean(preview.discardedBy),discardedAt:clean(preview.discardedAt),discardReason:clean(preview.discardReason)},
      failureRecord:clone(s.failureRecord||{}),interruptionRecord:clone(s.interruptionRecord||{}),cancellationRecord:clone(s.cancellationRecord||{}),checklist:createChecklist(s.checklist),
      handoffReview:{parseResultAccepted:review.parseResultAccepted===true,previewAccepted:review.previewAccepted===true,decision:clean(review.decision),confirmedBy:clean(review.confirmedBy),confirmedAt:clean(review.confirmedAt),reason:clean(review.reason)},
      unresolvedIssues:unique(s.unresolvedIssues),createdBy:clean(s.createdBy),createdAt:clean(s.createdAt)||nowIso(options),updatedBy:clean(s.updatedBy),updatedAt:clean(s.updatedAt)||clean(s.createdAt)||nowIso(options),stateHistory:Array.isArray(s.stateHistory)?clone(s.stateHistory):[],auditHistory:Array.isArray(s.auditHistory)?clone(s.auditHistory):[],
      resultDataRead:true,fileContentAccessed:true,temporaryDataHeld:true,resultDataParsed:s.resultDataParsed===true,fileContentParsed:s.fileContentParsed===true,resultPreviewCreated:s.resultPreviewCreated===true,temporaryPreviewHeld:preview.previewStatus==="held",...clone(ALWAYS_FALSE_FLAGS)
    };
  }
  function configReasons(record) {
    const c=normalize(record).configuration, cmp=normalize(record).configurationComparison, reasons=[];
    for(const key of ["parseConfigurationId","configuredBy","configurationDate","configurationTime","executionReason","expectedFormat","parseFormat","declaredEncoding","newlineMode","blankLineHandling","trimHandling","trailingDelimiterHandling","columnMismatchHandling","duplicateHeaderHandling","emptyHeaderHandling"])if(!clean(c[key]))reasons.push(`${key}_required`);
    if(!["csv","tsv","delimited_text"].includes(c.parseFormat))reasons.push("unsupported_format");
    if(typeof c.delimiter!=="string"||[...c.delimiter].length!==1)reasons.push("single_delimiter_required");
    if(typeof c.quote!=="string"||[...c.quote].length!==1)reasons.push("single_quote_required");
    if(c.headerPresent===null||c.headerRowNumber<1||c.dataStartRowNumber<1)reasons.push("header_configuration_invalid");
    if(c.maximumCharacters<1||c.maximumCharacters>LIMITS.maximumCharacters||c.maximumRows<1||c.maximumRows>LIMITS.maximumRows||c.maximumColumns<1||c.maximumColumns>LIMITS.maximumColumns||c.maximumPreviewRows<1||c.maximumPreviewRows>LIMITS.maximumPreviewRows||c.maximumCellDisplayCharacters<1||c.maximumCellDisplayCharacters>LIMITS.maximumCellDisplayCharacters)reasons.push("parse_limit_invalid");
    const mismatch=!cmp.formatMatch||!cmp.encodingDeclarationMatch||!cmp.delimiterMatch||!cmp.headerDeclarationMatch;
    if(mismatch&&(!cmp.mismatchReason||cmp.humanReviewResult!=="accepted"||!cmp.reviewedBy||!cmp.reviewedAt))reasons.push("configuration_difference_not_reviewed");
    return reasons;
  }
  function addAudit(record,action,operation,details,options){return [...(record.auditHistory||[]),{auditId:`phase26-10-audit-${(record.auditHistory||[]).length+1}`,action,actor:clean(operation&&operation.performedBy),occurredAt:nowIso(options),reason:clean(operation&&operation.reason),details:clone(details||{})}];}
  function appendState(record,state,operation,options,extra){const current=normalize(record,options),at=nowIso(options);return normalize({...current,...(extra||{}),status:state,updatedBy:operation.performedBy,updatedAt:at,stateHistory:[...current.stateHistory,{changedBy:operation.performedBy,changedAt:at,from:current.status,to:state,reason:operation.reason}],auditHistory:addAudit(current,"state_changed",operation,{from:current.status,to:state},options)},options);}
  function createConfiguration(target,input,operation,options){
    if(!manual(operation,true))return freeze({created:false,reason:"manual_operation_required"});
    const checked=validateTarget(target);if(!checked.valid)return freeze({created:false,reason:"phase269_target_invalid",reasons:checked.reasons});
    const record=normalize({...input,phase269ReadExecutionRecordId:target.readExecutionRecordId,targetTemporaryDataId:target.temporaryData.temporaryDataId,phase269Snapshot:snapshot(target),status:"parse_configuration_recorded",createdBy:operation.performedBy,createdAt:nowIso(options)},options);
    const reasons=configReasons(record);if(reasons.length)return freeze({created:false,reason:"parse_configuration_incomplete",reasons,record});
    return freeze({created:true,record:normalize({...record,stateHistory:[{changedBy:operation.performedBy,changedAt:nowIso(options),from:"awaiting_manual_parse_configuration",to:"parse_configuration_recorded",reason:operation.reason}],auditHistory:addAudit(record,"parse_configuration_created",operation,{},options)},options)});
  }
  function parseDelimited(raw,configuration){
    const c=configuration, rows=[], anomalies=[], controls=[], formulas=[], missingByColumn=[], duplicates=new Map();let row=[],field="",quoted=false,afterQuote=false,line=1,truncatedRows=false,truncatedColumns=false,bom=false;
    let source=raw;if(source.charCodeAt(0)===0xFEFF){source=source.slice(1);bom=true;}
    const pushField=()=>{if(row.length<c.maximumColumns)row.push(field);else truncatedColumns=true;field="";afterQuote=false;};
    const pushRow=()=>{if(rows.length<c.maximumRows)rows.push(row);else truncatedRows=true;row=[];line++;};
    for(let i=0;i<source.length;i++){const ch=source[i];
      if(quoted){if(ch===c.quote){if(source[i+1]===c.quote){field+=c.quote;i++;}else{quoted=false;afterQuote=true;}}else field+=ch;continue;}
      if(ch===c.quote&&field===""){quoted=true;continue;}
      if(ch===c.delimiter){pushField();continue;}
      if(ch==="\r"||ch==="\n"){if(ch==="\r"&&source[i+1]==="\n")i++;pushField();pushRow();if(truncatedRows)break;continue;}
      if(afterQuote&&!/\s/.test(ch))anomalies.push({type:"invalid_quote_placement",line});field+=ch;
    }
    if(quoted)anomalies.push({type:"unclosed_quote",line});
    if(field!==""||row.length||source.endsWith(c.delimiter)){pushField();pushRow();}
    const header=c.headerPresent?(rows[c.headerRowNumber-1]||[]):[];const data=rows.slice(Math.max(0,c.dataStartRowNumber-1));const expected=header.length||(data[0]||[]).length;
    const emptyHeaders=[],duplicateHeaders=[],whitespaceHeaders=[],controlHeaders=[],longHeaders=[],headerSeen=new Map();header.forEach((h,i)=>{if(h==="")emptyHeaders.push(i);if(h!==h.trim())whitespaceHeaders.push(i);if(/[\u0000-\u001F\u007F]/.test(h))controlHeaders.push(i);if(h.length>c.maximumCellDisplayCharacters)longHeaders.push(i);if(headerSeen.has(h))duplicateHeaders.push([headerSeen.get(h),i]);else headerSeen.set(h,i);});
    let blank=0,irregular=0,nullCharacterCount=0;const tooFew=[],tooMany=[],longCells=[];data.forEach((r,index)=>{if(r.every(v=>v===""))blank++;if(r.length!==expected)irregular++;if(r.length<expected)tooFew.push(index+1);if(r.length>expected)tooMany.push(index+1);const key=r.join("\u001f");const list=duplicates.get(key)||[];list.push(index+1);duplicates.set(key,list);r.forEach((v,col)=>{if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(v))controls.push({row:index+1,column:col+1});if(v.includes("\u0000"))nullCharacterCount++;if(v.length>c.maximumCellDisplayCharacters)longCells.push({row:index+1,column:col+1,length:v.length});if(/^[=+\-@]/.test(v))formulas.push({row:index+1,column:col+1});if(!missingByColumn[col])missingByColumn[col]=0;if(c.missingTokens.includes(v)||/^\s+$/.test(v))missingByColumn[col]++;});});
    const duplicateGroups=[...duplicates.values()].filter(group=>group.length>1);
    const previewRows=data.slice(0,c.maximumPreviewRows).map((r,rowIndex)=>({rowNumber:rowIndex+1,cells:r.slice(0,c.maximumColumns).map((v,columnIndex)=>({columnNumber:columnIndex+1,displayValue:v.slice(0,c.maximumCellDisplayCharacters),truncated:v.length>c.maximumCellDisplayCharacters,originalLength:v.length,empty:v==="",formulaInjectionCandidate:/^[=+\-@]/.test(v)}))}));
    return {rows,previewRows,header,summary:{parsedRowCount:rows.length,parsedColumnCount:expected,headerCount:header.length,dataRowCount:data.length,blankRowCount:blank,irregularRowCount:irregular,minimumColumnCount:rows.length?Math.min(...rows.map(r=>r.length)):0,maximumColumnCount:rows.length?Math.max(...rows.map(r=>r.length)):0,expectedColumnCount:expected,rowsWithTooFewColumns:tooFew,rowsWithTooManyColumns:tooMany,truncatedByMaximumRows:truncatedRows,truncatedByMaximumColumns:truncatedColumns},warnings:{bomRemoved:bom,unclosedQuote:anomalies.some(a=>a.type==="unclosed_quote"),invalidQuotePlacementCount:anomalies.filter(a=>a.type==="invalid_quote_placement").length,emptyHeaders,duplicateHeaders,whitespaceHeaders,controlHeaders,longHeaders,controlCharacterCandidates:controls,nullCharacterCount,longCellCandidates:longCells,formulaInjectionCandidates:formulas,previewTruncated:data.length>previewRows.length},missing:{countsByColumn:missingByColumn,total:missingByColumn.reduce((a,b)=>a+(b||0),0)},duplicates:{duplicateCandidateCount:duplicateGroups.reduce((a,g)=>a+g.length-1,0),duplicateGroups,duplicateRowIndexes:duplicateGroups.flat(),comparisonScope:"complete rows within parse limit",truncatedByLimit:truncatedRows}};
  }
  function transition(record,next,operation,target,options){const current=normalize(record,options);if(!manual(operation,true))return freeze({transitioned:false,reason:"manual_operation_required",record:current});if(!(ALLOWED_TRANSITIONS[current.status]||[]).includes(next))return freeze({transitioned:false,reason:"transition_not_allowed",record:current});if(next==="ready_for_manual_parse_execution"&&configReasons(current).length)return freeze({transitioned:false,reason:"configuration_invalid",reasons:configReasons(current),record:current});if(next==="manual_parse_in_progress")return freeze({transitioned:false,reason:"use_execute_manual_parse",record:current});if(next==="ready_for_manual_result_preview_review"){const evaluation=evaluateHandoff(current,target);if(!evaluation.passed)return freeze({transitioned:false,reason:"handoff_conditions_not_met",reasons:evaluation.reasons,record:current});}return freeze({transitioned:true,record:appendState(current,next,operation,options)});}
  async function executeManualParse(record,target,execution,operation,options){
    const current=normalize(record,options);if(!manual(operation,true))return freeze({started:false,reason:"manual_operation_required",record:current});if(current.status!=="ready_for_manual_parse_execution")return freeze({started:false,reason:"parse_state_not_ready",record:current});if(activeParses.has(current.parseConfigurationId))return freeze({started:false,reason:"parse_already_in_progress",record:current});
    const checked=validateTarget(target);if(!checked.valid)return freeze({started:false,reason:"phase269_target_invalid",reasons:checked.reasons,record:current});const raw=phase269.getTemporaryData(target);if(typeof raw!=="string")return freeze({started:false,reason:"raw_text_not_available",record:current});if(raw.length>current.configuration.maximumCharacters)return freeze({started:false,reason:"maximum_characters_exceeded",record:current});
    activeParses.add(current.parseConfigurationId);const startedAt=nowIso(options),inProgress=appendState(current,"manual_parse_in_progress",operation,options);await Promise.resolve();
    try{const action=requestedActions.get(current.parseConfigurationId);if(action){const state=action.type==="cancel"?"manual_parse_cancelled":"manual_parse_interrupted";return freeze({started:true,succeeded:false,reason:`${action.type}_requested`,record:appendState(inProgress,state,action.operation,options,{[action.type==="cancel"?"cancellationRecord":"interruptionRecord"]:{declared:true,reason:action.operation.reason,declaredBy:action.operation.performedBy,declaredAt:action.at,unresolved:false}})});}
      const parsed=parseDelimited(raw,current.configuration);if(!parsed.summary.dataRowCount||!parsed.summary.parsedColumnCount)throw Object.assign(new Error("Parsed result is empty"),{code:"EMPTY_PARSE_RESULT"});
      const completedAt=nowIso(options),previewDataId=`phase26-10-preview-${current.parseConfigurationId}-${Date.parse(completedAt)}`,parseExecutionRecordId=clean(execution&&execution.parseExecutionRecordId);
      if(!parseExecutionRecordId||!clean(execution&&execution.executedBy))throw Object.assign(new Error("Parse execution record incomplete"),{code:"EXECUTION_RECORD_INCOMPLETE"});
      previewMemory.set(previewDataId,{headerMetadata:parsed.header.map((name,index)=>({columnNumber:index+1,originalName:name,displayName:name||`column_${index+1}`})),previewRows:parsed.previewRows,warningSummary:parsed.warnings,anomalySummary:{irregularRowCount:parsed.summary.irregularRowCount},missingCandidateSummary:parsed.missing,duplicateCandidateSummary:parsed.duplicates});
      const warningCount=Object.values(parsed.warnings).reduce((n,v)=>n+(Array.isArray(v)?v.length:v===true?1:typeof v==="number"?v:0),0),anomalyCount=parsed.summary.irregularRowCount+(parsed.warnings.unclosedQuote?1:0)+parsed.warnings.invalidQuotePlacementCount;
      const parseResult={...parsed.summary,headerMetadata:parsed.header.map((name,index)=>({columnNumber:index+1,originalName:name,displayName:name||`column_${index+1}`})),warningSummary:parsed.warnings,anomalySummary:{count:anomalyCount},missingCandidateSummary:parsed.missing,duplicateCandidateSummary:parsed.duplicates};
      const parseExecution={parseExecutionRecordId,executedBy:execution.executedBy,executionDate:clean(execution.executionDate),startedAt,completedAt,durationMs:Math.max(0,Date.parse(completedAt)-Date.parse(startedAt)),temporaryDataId:current.targetTemporaryDataId,parseConfigurationId:current.parseConfigurationId,delimiter:current.configuration.delimiter,quote:current.configuration.quote,headerPresent:current.configuration.headerPresent,parsedCharacterCount:raw.length,parsedRowCount:parsed.summary.parsedRowCount,success:true,warningCount,anomalyCount,failureCode:"",failureMessage:"",note:clean(execution.note)};
      const preview={previewDataId,targetTemporaryDataId:current.targetTemporaryDataId,parseExecutionRecordId,parseConfigurationId:current.parseConfigurationId,previewStatus:"generated",createdBy:operation.performedBy,createdAt:completedAt,discardedBy:"",discardedAt:"",discardReason:""};
      return freeze({started:true,succeeded:true,record:appendState(inProgress,"manual_parse_succeeded",operation,options,{parseExecution,parseResult,preview,resultDataParsed:true,fileContentParsed:true,resultPreviewCreated:true})});
    }catch(error){const failedAt=nowIso(options),code=clean(error&&error.code)||"PARSE_FAILED";return freeze({started:true,succeeded:false,reason:code,record:appendState(inProgress,"manual_parse_failed",operation,options,{failureRecord:{errorCode:code,errorName:clean(error&&error.name)||"Error",errorMessage:clean(error&&error.message),failedAt,failureStage:"delimited_text_parse",sourceTemporaryDataId:current.targetTemporaryDataId,parseConfigurationId:current.parseConfigurationId,partialResultCreated:false,partialResultDiscarded:true,retryAllowed:true,retryReason:"new human operation required",reviewedBy:"",reviewedAt:""},preview:{previewStatus:"none"}})});}finally{activeParses.delete(current.parseConfigurationId);requestedActions.delete(current.parseConfigurationId);}
  }
  function requestInterrupt(id,operation,options){id=clean(id);if(!id||!activeParses.has(id)||!manual(operation,true))return freeze({requested:false});requestedActions.set(id,{type:"interrupt",operation:clone(operation),at:nowIso(options)});return freeze({requested:true});}
  function requestCancel(id,operation,options){id=clean(id);if(!id||!activeParses.has(id)||!manual(operation,true))return freeze({requested:false});requestedActions.set(id,{type:"cancel",operation:clone(operation),at:nowIso(options)});return freeze({requested:true});}
  function holdPreview(record,review,operation,options){const current=normalize(record,options),p=current.preview;if(!manual(operation,true)||current.status!=="manual_parse_succeeded"||p.previewStatus!=="generated"||!previewMemory.has(p.previewDataId))return freeze({held:false,record:current});if(review.parseResultAccepted!==true||review.previewAccepted!==true||clean(review.decision)!=="approved"||!clean(review.confirmedBy)||!clean(review.confirmedAt)||!clean(review.reason))return freeze({held:false,reason:"human_review_required",record:current});return freeze({held:true,record:appendState(current,"preview_generated",operation,options,{preview:{...p,previewStatus:"held"},handoffReview:review,resultDataParsed:true,fileContentParsed:true,resultPreviewCreated:true})});}
  function discardPreview(record,reason,operation,options){const current=normalize(record,options),p=current.preview;if(!manual(operation,true)||!clean(reason)||!["preview_generated","preview_review_preparation"].includes(current.status)||!p.previewDataId)return freeze({discarded:false,record:current});previewMemory.delete(p.previewDataId);return freeze({discarded:true,record:appendState(current,"preview_discarded",operation,options,{preview:{...p,previewStatus:"discarded",discardedBy:operation.performedBy,discardedAt:nowIso(options),discardReason:reason},resultDataParsed:true,fileContentParsed:true,resultPreviewCreated:false,temporaryPreviewHeld:false})});}
  function getPreview(record){const value=normalize(record),id=value.preview.previewDataId;return id&&value.preview.previewStatus==="held"&&previewMemory.has(id)?clone(previewMemory.get(id)):undefined;}
  function updateChecklist(record,id,update,operation,options){const current=normalize(record,options);if(!manual(operation,false)||!CHECK_DEFINITIONS.some(c=>c.checkId===id)||!CHECK_STATUSES.includes(update&&update.status))return freeze({updated:false,record:current});const checklist=current.checklist.map(item=>item.checkId===id?{...item,status:update.status,checkedBy:operation.performedBy,checkedAt:nowIso(options),note:clean(update.note)}:item);return freeze({updated:true,record:normalize({...current,checklist,auditHistory:addAudit(current,"check_updated",operation,{checkId:id},options)},options)});}
  function evaluateHandoff(record,target){const value=normalize(record),reasons=[...validateTarget(target||value.phase269Snapshot).reasons,...configReasons(value)];if(!value.parseExecution.success||!value.parseExecution.startedAt||!value.parseExecution.completedAt)reasons.push("parse_not_successful");if(!value.parseResult.parsedColumnCount||!value.parseResult.dataRowCount)reasons.push("parsed_result_empty");if(!value.preview.previewDataId||value.preview.previewStatus!=="held"||!previewMemory.has(value.preview.previewDataId))reasons.push("preview_not_held");if(value.checklist.some(item=>item.required&&!["passed","not_applicable"].includes(item.status)))reasons.push("checklist_incomplete");const h=value.handoffReview;if(!h.parseResultAccepted||!h.previewAccepted||h.decision!=="approved"||!h.confirmedBy||!h.confirmedAt||!h.reason)reasons.push("handoff_not_approved");if(value.unresolvedIssues.length||value.failureRecord.unresolved||value.interruptionRecord.unresolved||value.cancellationRecord.unresolved)reasons.push("unresolved_parse_issue");return freeze({passed:unique(reasons).length===0,reasons:unique(reasons)});}
  function renderPreview(documentRef,record){const container=documentRef&&documentRef.getElementById("phase2610-preview");if(!container)return;container.replaceChildren();const preview=getPreview(record);if(!preview)return;const table=documentRef.createElement("table"),head=documentRef.createElement("tr");preview.headerMetadata.forEach(h=>{const th=documentRef.createElement("th");th.textContent=h.displayName;head.appendChild(th);});table.appendChild(head);preview.previewRows.forEach(row=>{const tr=documentRef.createElement("tr");row.cells.forEach(cell=>{const td=documentRef.createElement("td");td.textContent=cell.displayValue;tr.appendChild(td);});table.appendChild(tr);});container.appendChild(table);}
  function render(documentRef){if(!documentRef)return;const list=documentRef.getElementById("phase2610-checklist");if(list&&!list.children.length)CHECK_DEFINITIONS.forEach(def=>{const div=documentRef.createElement("div");div.className="phase2610-check-item";div.textContent=`[unchecked] ${def.label}`;list.appendChild(div);});}
  if(typeof document!=="undefined"){const start=()=>render(document);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();}
  return {PHASE269_REFERENCE,LIMITS,STATES,PREVIEW_STATUSES,CHECK_STATUSES,ALWAYS_FALSE_FLAGS,CHECK_DEFINITIONS,ALLOWED_TRANSITIONS,createChecklist,snapshot,validateTarget,normalize,createConfiguration,parseDelimited,transition,executeManualParse,requestInterrupt,requestCancel,holdPreview,discardPreview,getPreview,updateChecklist,evaluateHandoff,renderPreview,render};
});
