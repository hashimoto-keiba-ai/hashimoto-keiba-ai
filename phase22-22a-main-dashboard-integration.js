(function (root) {
  "use strict";
  function bind() {
    const doc = root.document;
    const panel = doc && doc.getElementById("phase22-limited-application-final-decision-handoff-main-core");
    const core = root.HashimotoPhase2222LimitedApplicationFinalDecisionOperationalHandoffPlanCore;
    if (!panel || !core || panel.dataset.bound === "true") return;
    panel.dataset.bound = "true";
    const storage = root.localStorage;
    const byId = (id) => doc.getElementById(id);
    let source = {};
    let loaded = { store: { records: [] } };
    function audit() { return { operator: byId("p2222-main-operator").value, at: byId("p2222-main-at").value, reason: byId("p2222-main-reason").value, notes: byId("p2222-main-notes").value }; }
    function current() { return loaded.store.records.find((record) => record.decisionRecordId === byId("p2222-main-record").value); }
    function replace(record) { loaded.store.records = loaded.store.records.map((item) => item.decisionRecordId === record.decisionRecordId ? record : item); render(); }
    function message(value) { byId("p2222-main-message").textContent = value; }
    function render() {
      const select = byId("p2222-main-record"); const selected = select.value; select.replaceChildren();
      loaded.store.records.forEach((record) => { const option = doc.createElement("option"); option.value = record.decisionRecordId; option.textContent = `${record.registeredTrialId || record.sourceComparisonId} / ${record.status}`; select.appendChild(option); });
      if (selected) select.value = selected;
      byId("p2222-main-summary").textContent = `eligible ${core.eligibleSources(source.sourceStore || {}).length} / records ${loaded.store.records.length}`;
      const list = byId("p2222-main-list"); list.replaceChildren();
      loaded.store.records.forEach((record) => { const row = doc.createElement("div"); row.className = "phase2222-main-row"; [record.registeredTrialId || record.sourceComparisonId, record.status, record.recommendedDecision, record.finalDecision || "pending"].forEach((value) => { const span = doc.createElement("span"); span.textContent = value; row.appendChild(span); }); list.appendChild(row); });
    }
    function reload() { source = core.loadSource(storage); loaded = core.loadStore(storage, source.sourceStore); render(); message(source.parseError ? "Phase22-21データの読込に失敗しました。" : "Phase22-21のfinalized評価を読み込みました。"); }
    byId("p2222-main-set-decision").addEventListener("click", () => { const record = current(), a = audit(); const result = record && core.setDecision(record, byId("p2222-main-decision").value, a.operator, a.at, a.reason, a.notes); if (!result || !result.updated) return message(`Rejected: ${result ? result.reason : "record_missing"}`); replace(result.record); message("人間の最終判定を記録しました。"); });
    byId("p2222-main-set-handoff").addEventListener("click", () => { const record = current(), a = audit(); const handoff = { owner: byId("p2222-main-owner").value, backupOwner: byId("p2222-main-backup").value, startAt: byId("p2222-main-start").value, reviewAt: byId("p2222-main-review").value, scope: byId("p2222-main-scope").value, monitoringItems: byId("p2222-main-monitoring").value, stopConditions: byId("p2222-main-stop").value, rollbackProcedure: byId("p2222-main-rollback").value, communicationPlan: byId("p2222-main-communication").value, notes: a.notes }; const result = record && core.setHandoff(record, handoff, a.operator, a.at, a.reason); if (!result || !result.updated) return message(`Rejected: ${result ? result.reason : "record_missing"}`); replace(result.record); message("運用引継ぎ計画を記録しました。"); });
    panel.querySelectorAll("[data-p2222-main-status]").forEach((button) => button.addEventListener("click", () => { const record = current(), a = audit(); const result = record && core.transition(record, button.dataset.p2222MainStatus, a.operator, a.at, a.reason, a.notes); if (!result || !result.transitioned) return message(`Rejected: ${result ? result.reason : "record_missing"}`); replace(result.record); message(`状態を ${button.dataset.p2222MainStatus} に変更しました。`); }));
    byId("p2222-main-reload").addEventListener("click", reload);
    byId("p2222-main-save").addEventListener("click", () => { const result = core.saveStore(loaded.store, storage, new Date().toISOString()); message(result.saved ? "保存しました。" : `保存失敗: ${result.reason}`); });
    byId("p2222-main-audit").addEventListener("click", () => { byId("p2222-main-output").value = current() ? core.buildAuditText(current()) : "対象記録がありません。"; });
    reload();
  }
  if (root.document) { if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", bind, { once: true }); else bind(); }
})(typeof window !== "undefined" ? window : globalThis);
