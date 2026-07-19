(function () {
  "use strict";
  const core = globalThis.HashimotoPhase234StagingIntegrityReferenceImportGateCore;
  if (!core || typeof document === "undefined") return;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  if (!$("phase23-staging-integrity-reference-import-gate")) return;
  let source = [], validation = { stagings: [], issues: [], summary: { total: 0, info: 0, warning: 0, error: 0, fatal: 0 } }, store = core.loadStore().store, selectedId = "", processing = false;
  function message(value) { $("p234-message").textContent = value; }
  function selected() { return validation.stagings.find((item) => item.stagingId === selectedId) || null; }
  function approval() { return { warningConfirmed: $("p234-warning-confirmed").checked, approvedBy: $("p234-approver").value, approvedAt: $("p234-approved-at").value, reason: $("p234-reason").value, protectedMode: true, PLAN_ONLY: true, privateLocalOnly: true, phase22NotAppliedConfirmed: $("p234-phase22-confirmed").checked, formalImportNotExecutedConfirmed: $("p234-import-confirmed").checked }; }
  function render() {
    const current = selected();
    $("p234-summary").textContent = `eligible ${source.length} / gate records ${store.records.length} / fatal ${validation.summary.fatal || 0} / error ${validation.summary.error || 0} / warning ${validation.summary.warning || 0}`;
    $("p234-stagings").innerHTML = validation.stagings.map((item) => `<button type="button" data-id="${esc(item.stagingId)}" class="${item.stagingId === selectedId ? "selected" : ""}"><strong>${esc(item.stagingId)}</strong><span>${esc(item.dataType)} / ${item.normalizedRecords.length} records</span><small>${esc(item.integrityStatus)} / fatal ${item.validation.counts.fatal} / error ${item.validation.counts.error} / warning ${item.validation.counts.warning}</small></button>`).join("") || "<p>staged対象記録はありません。</p>";
    $("p234-stagings").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { selectedId = button.dataset.id; render(); }));
    if (!current) { $("p234-integrity").textContent = "対象を選択してください。"; $("p234-issues").innerHTML = ""; return; }
    const v = current.validation, problems = core.gateProblems(current, approval());
    $("p234-integrity").textContent = `${current.integrityStatus} / references ${v.referenceSummary.status} / chronology ${v.chronologySummary.status} / counts ${v.countSummary.status} / conflict ${v.conflict} / gate ${problems.length ? problems.join(", ") : "ready for human action"}`;
    $("p234-issues").innerHTML = v.issues.map((item) => `<article class="level-${esc(item.level)}"><strong>${esc(item.level)} / ${esc(item.code)}</strong><span>row ${item.row} / ${esc(item.field)} / ${esc(item.message)}</span></article>`).join("") || "<p>issueなし</p>";
  }
  function reload() {
    const loaded = core.loadSourceStore(); source = loaded.parseError ? [] : core.eligibleSources(loaded.sourceStore); store = core.loadStore().store;
    validation = core.validateGroup(source, store.records); if (!validation.stagings.some((item) => item.stagingId === selectedId)) selectedId = validation.stagings[0] ? validation.stagings[0].stagingId : "";
    message(loaded.parseError ? "Phase23-3保存値を解析できないため、安全に空データとして扱いました。" : "Phase23-3のstaged記録を読取専用で再検証しました。"); render();
  }
  function saveBuilt(built) {
    if (!built.created) { message(`記録拒否: ${built.reason} ${(built.problems || []).join(", ")}`); return; }
    const saved = core.addGateRecord(store, built.record, localStorage, new Date()); if (!saved.saved) { message(`保存失敗: ${saved.reason}。既存値を維持しました。`); return; }
    store = saved.store; $("p234-output").value = core.auditText(built.record); message(`${built.record.gateStatus}を監査記録しました。正式インポートは実行していません。`); render();
  }
  $("p234-reload").addEventListener("click", reload);
  ["p234-warning-confirmed", "p234-phase22-confirmed", "p234-import-confirmed"].forEach((id) => $(id).addEventListener("change", render));
  ["p234-approver", "p234-approved-at", "p234-reason"].forEach((id) => $(id).addEventListener("input", render));
  $("p234-ready").addEventListener("click", () => { if (processing) return message("処理中の二重操作を拒否しました。"); const current = selected(); if (!current) return message("対象を選択してください。"); processing = true; try { saveBuilt(core.buildGateRecord(current, approval(), store.records, new Date())); } finally { processing = false; } });
  ["rejected", "cancelled", "expired"].forEach((status) => $(`p234-${status}`).addEventListener("click", () => { const current = selected(); if (!current) return message("対象を選択してください。"); saveBuilt(core.buildTerminalRecord(current, status, { operator: $("p234-approver").value, reason: $("p234-reason").value, previousStatus: current.integrityStatus }, new Date())); }));
  $("p234-audit").addEventListener("click", () => { const record = store.records.find((item) => item.stagingId === selectedId); $("p234-output").value = record ? core.auditText(record) : "保存済み監査記録がありません。"; });
  reload();
})();
