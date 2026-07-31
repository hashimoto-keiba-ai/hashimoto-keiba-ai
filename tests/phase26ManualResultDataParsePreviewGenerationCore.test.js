"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path");
const p268=require("../phase26-8-manual-result-data-selection-pre-read-approval-core.js");
const p269=require("../phase26-9-manual-result-data-read-temporary-holding-core.js");
const core=require("../phase26-10-manual-result-data-parse-preview-generation-core.js");
const root=path.resolve(__dirname,".."),clock={now:()=>new Date("2026-08-11T02:00:00Z")},op={performedBy:"owner",reason:"manual operation",explicitConfirmation:true};
const p268target={selectionRecordId:"s1",phase267PreviewRequestId:"p1",status:"ready_for_manual_result_data_read",fileName:"result.csv",extension:"csv",mimeType:"text/csv",fileSize:50,lastModifiedAt:"2026-08-11T01:00:00.000Z",expectedEncoding:"utf-8",expectedDelimiter:",",expectedHeaderPresent:true,expectedDataFormat:"csv",selectedBy:"owner",plannedReader:{name:"owner",role:"local"},approval:{approvalRecordId:"a1",approvedBy:"owner",decision:"approved",conditions:"",approvedFileName:"result.csv",approvedFileSize:50,approvedLastModifiedAt:"2026-08-11T01:00:00.000Z",recheckRequired:false},checklist:p268.CHECK_DEFINITIONS.map(x=>({...x,status:"passed"})),unresolvedIssues:[],exceptionResolution:{abnormalityResolved:true,interruptionResolved:true,stopResolved:true,cancellationResolved:true},...p268.SAFE_FLAGS};
const readInput={readExecutionRecordId:"r1",executedBy:"owner",executionDate:"2026-08-11",readStartTime:"11:00",terminal:"pc",screen:"Private Local",executionReason:"manual",procedureConfirmation:"yes",approvalConditionsConfirmation:"yes",preReadFinalConfirmedBy:"owner",preReadFinalConfirmedAt:"2026-08-11T01:10:00Z",preReadFinalConfirmationReason:"yes",selectedFileMetadata:{fileName:"result.csv",fileSize:50,mimeType:"text/csv",lastModifiedAt:"2026-08-11T01:00:00.000Z",extension:"csv"},metadataComparison:{fileNameMatch:true,fileSizeMatch:true,lastModifiedMatch:true,mimeTypeMatch:true,extensionMatch:true,mismatchFields:[]},declaredMaximumReadSize:1000,checklist:p269.CHECK_DEFINITIONS.map(x=>({...x,status:"passed",checkedBy:"owner",checkedAt:"2026-08-11T01:20:00Z"})),unresolvedIssues:[]};
const raw="\uFEFFname,note,value,missing\r\nA,\"x,y\",=1,\r\nB,\"line1\nline2\",\"he said \"\"yes\"\"\",NA\r\nA,\"x,y\",=1,\r\nshort,row\r\n";
const file={name:"result.csv",size:50,type:"text/csv",lastModified:Date.parse("2026-08-11T01:00:00Z"),text:async()=>raw};
const config={parseConfigurationId:"c1",configuredBy:"owner",configurationDate:"2026-08-11",configurationTime:"11:30",executionReason:"manual preview",expectedFormat:"csv",parseFormat:"csv",declaredEncoding:"utf-8",delimiter:",",quote:'"',escapeCharacter:'"',newlineMode:"mixed accepted",headerPresent:true,headerRowNumber:1,dataStartRowNumber:2,blankLineHandling:"retain and count",trimHandling:"preserve",trailingDelimiterHandling:"preserve",columnMismatchHandling:"warn",duplicateHeaderHandling:"warn",emptyHeaderHandling:"warn",maximumCharacters:5000000,maximumRows:100000,maximumPreviewRows:100,maximumColumns:200,maximumCellDisplayCharacters:500,missingTokens:["","null","NA","N/A","undefined"]};
const comparison={formatMatch:true,encodingDeclarationMatch:true,delimiterMatch:true,headerDeclarationMatch:true,mismatchFields:[],mismatchReason:"",humanReviewResult:"accepted",reviewedBy:"owner",reviewedAt:"2026-08-11T01:25:00Z"};
const checks=core.CHECK_DEFINITIONS.map(x=>({...x,status:"passed",checkedBy:"owner",checkedAt:"2026-08-11T01:50:00Z",note:"confirmed"}));
async function makeTarget(){
 const created=p269.createReadExecution(p268target,readInput,op,clock).record;
 const validating=p269.transition(created,"validating_approved_file_metadata",op,p268target,clock).record;
 const ready=p269.transition(validating,"ready_for_manual_read_execution",op,p268target,clock).record;
 const read=await p269.executeManualRead(ready,file,op,p268target,clock);assert(read.succeeded);
 const held=p269.holdTemporaryData(read.record,{successRecordId:"ok1",humanResult:"accepted",handoffDecision:"approved",confirmedBy:"owner",confirmedAt:"2026-08-11T01:20:00Z",confirmationReason:"ok"},op,clock).record;
 return p269.transition(held,"ready_for_manual_result_data_parse_preview",op,p268target,clock).record;
}
async function run(){
 const target=await makeTarget();assert(core.validateTarget(target).valid);assert.strictEqual(core.PHASE269_REFERENCE,p269);assert(core.CHECK_DEFINITIONS.length>=50);
 for(const status of["temporary_data_held","manual_read_succeeded","preview_generated"])assert(!core.validateTarget({...target,status}).valid,status);
 assert(!core.validateTarget({...target,temporaryData:{...target.temporaryData,temporaryDataStatus:"discarded"}}).valid);
 const parsed=core.parseDelimited(raw,config);
 assert.equal(parsed.header[0],"name");assert.equal(parsed.previewRows[0].cells[1].displayValue,"x,y");assert.equal(parsed.previewRows[1].cells[1].displayValue,"line1\nline2");assert.equal(parsed.previewRows[1].cells[2].displayValue,'he said "yes"');assert(parsed.warnings.bomRemoved);assert(parsed.warnings.formulaInjectionCandidates.length>=2);assert(parsed.missing.total>=3);assert(parsed.duplicates.duplicateCandidateCount>=1);assert(parsed.summary.rowsWithTooFewColumns.length>=1);
 for(const newline of["a,b\r\n1,2","a,b\n1,2","a,b\r1,2"])assert.equal(core.parseDelimited(newline,{...config,maximumRows:10,maximumColumns:10,maximumPreviewRows:10,maximumCellDisplayCharacters:10}).summary.parsedRowCount,2);
 assert.equal(core.parseDelimited("a,b,\n1,2,",config).rows[0].length,3);assert(core.parseDelimited('a,b\n1,"bad',config).warnings.unclosedQuote);
 const limited=core.parseDelimited("h\n123456", {...config,maximumPreviewRows:1,maximumCellDisplayCharacters:3});assert(limited.previewRows[0].cells[0].truncated);assert.equal(limited.previewRows[0].cells[0].displayValue,"123");
 assert(!core.createConfiguration(target,{configuration:{...config,delimiter:""},configurationComparison:comparison},op,clock).created);
 assert(!core.createConfiguration(target,{configuration:{...config,headerPresent:null},configurationComparison:comparison},op,clock).created);
 assert(!core.createConfiguration(target,{configuration:config,configurationComparison:{...comparison,delimiterMatch:false,mismatchReason:"",humanReviewResult:"needs_review"}},op,clock).created);
 assert(!core.createConfiguration(target,{configuration:config,configurationComparison:comparison},{...op,explicitConfirmation:false},clock).created);
 const created=core.createConfiguration(target,{configuration:config,configurationComparison:comparison,checklist:checks},op,clock);assert(created.created);
 const validating=core.transition(created.record,"validating_parse_configuration",op,target,clock);assert(validating.transitioned);
 const ready=core.transition(validating.record,"ready_for_manual_parse_execution",op,target,clock);assert(ready.transitioned);
 assert(!(await core.executeManualParse(ready.record,target,{parseExecutionRecordId:"pe1",executedBy:"owner",executionDate:"2026-08-11"}, {...op,explicitConfirmation:false},clock)).started);
 let resolveGate;const originalGet=p269.getTemporaryData;
 // A normal execution exercises the real Phase26-9 memory handoff.
 const succeeded=await core.executeManualParse(ready.record,target,{parseExecutionRecordId:"pe1",executedBy:"owner",executionDate:"2026-08-11"},op,clock);assert(succeeded.succeeded);assert.equal(succeeded.record.status,"manual_parse_succeeded");assert(succeeded.record.resultDataParsed&&succeeded.record.fileContentParsed&&succeeded.record.resultPreviewCreated);assert(!Object.prototype.hasOwnProperty.call(succeeded.record,"previewRows"));
 for(const[k,v]of Object.entries(core.ALWAYS_FALSE_FLAGS))assert.strictEqual(succeeded.record[k],v,k);
 const review={parseResultAccepted:true,previewAccepted:true,decision:"approved",confirmedBy:"owner",confirmedAt:"2026-08-11T02:10:00Z",reason:"preview confirmed"};
 const held=core.holdPreview(succeeded.record,review,op,clock);assert(held.held);assert(core.getPreview(held.record).previewRows.length<=100);
 const prep=core.transition(held.record,"preview_review_preparation",op,target,clock);assert(prep.transitioned);
 const final=core.transition(prep.record,"ready_for_manual_result_preview_review",op,target,clock);assert(final.transitioned);
 for(const status of["failed","unchecked","needs_review"]){const bad=checks.map((x,i)=>i?x:{...x,status});const r=core.normalize({...prep.record,checklist:bad});assert(!core.transition(r,"ready_for_manual_result_preview_review",op,target,clock).transitioned,status);}
 assert(!core.transition(core.normalize({...prep.record,handoffReview:{}}),"ready_for_manual_result_preview_review",op,target,clock).transitioned);
 assert(!core.transition(core.normalize({...prep.record,preview:{...prep.record.preview,previewStatus:"generated"}}),"ready_for_manual_result_preview_review",op,target,clock).transitioned);
 const discarded=core.discardPreview(held.record,"manual discard",op,clock);assert(discarded.discarded);assert.equal(discarded.record.preview.previewStatus,"discarded");assert(!discarded.record.resultPreviewCreated);assert(!discarded.record.temporaryPreviewHeld);assert.strictEqual(core.getPreview(discarded.record),undefined);assert(!core.transition(discarded.record,"ready_for_manual_result_preview_review",op,target,clock).transitioned);
 assert(!core.transition(created.record,"ready_for_manual_result_preview_review",op,target,clock).transitioned);
 const source=fs.readFileSync(path.join(root,"phase26-10-manual-result-data-parse-preview-generation-core.js"),"utf8"),html=fs.readFileSync(path.join(root,"private-local.html"),"utf8"),css=fs.readFileSync(path.join(root,"dashboard.css"),"utf8"),readme=fs.readFileSync(path.join(root,"README.md"),"utf8");
 for(const pattern of[/JSON\.parse\s*\(/,/localStorage\s*\.\s*setItem/,/indexedDB\s*\.\s*open/,/fetch\s*\(/,/XMLHttpRequest/,/WebSocket\s*\(/,/innerHTML\s*=/,/createObjectURL/,/eval\s*\(/,/Function\s*\(/])assert(!pattern.test(source),pattern);
 for(const marker of['id="phase26-10-manual-result-data-parse-preview-generation"',"対象となるPhase26-9記録","現在状態","一時保持データ情報","元ファイル情報","解析設定フォーム","想定形式との比較結果","区切り文字設定","引用符設定","ヘッダー設定","解析上限設定","解析実行者","解析開始","解析中状態","解析成功・失敗・中断・取消結果","解析時間・解析文字数","解析行数・解析列数","ヘッダー一覧","サンプル行プレビュー","空行数・不規則行数","列数不足・超過行","欠損候補集計","重複行候補集計","形式異常一覧","Formula Injection候補","プレビューID・プレビュー状態","プレビューを破棄","プレビュー生成後チェックリスト","Phase26-11引渡し確認欄","状態遷移履歴","監査履歴","安全フラグ一覧","禁止処理一覧","Private Local only","PLAN_ONLY","protectedMode","正式保存なし","正式取込なし","適用・学習なし"])assert(html.includes(marker),marker);
 assert(css.includes(".phase2610-panel"));assert(readme.includes("Phase26-10 Manual Result Data Parse and Preview Generation Core"));
 console.log("phase26ManualResultDataParsePreviewGenerationCore.test.js: PASS");
}
run().catch(e=>{console.error(e);process.exitCode=1;});
