(function () {
  "use strict";
  const core = globalThis.HashimotoPhase231ExternalRacingDataAcquisitionSafetyDesignCore;
  if (!core || typeof document === "undefined") return;
  const byId = (id) => document.getElementById(id);
  const panel = byId("phase23-external-racing-data-acquisition-safety-design");
  if (!panel) return;
  let state = core.loadStore().store;
  const escape = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function render() {
    byId("p231-providers").innerHTML = core.compareProviders(state.providers).map((p) => `<article><strong>${escape(p.providerName)}</strong><span>${p.evaluation}</span><small>official=${p.officiality} / terms=${p.termsStatus} / cost=${p.costStatus}</small><em>${p.recommendation}</em></article>`).join("");
    const needs = state.providers.flatMap((p) => p.verificationItems.map((item) => `${p.providerName}: ${item}`));
    byId("p231-needs").innerHTML = needs.map((item) => `<li>${escape(item)}</li>`).join("");
    byId("p231-targets").textContent = state.targetData.join(" / ");
    byId("p231-models").textContent = Object.entries(core.MODEL_FIELDS).map(([name, fields]) => `${name} (${fields.length})`).join(" / ");
    byId("p231-architecture").textContent = state.architecture.join(" → ");
    byId("p231-recommendation").textContent = core.recommendProviders(state.providers).decision;
    byId("p231-status").value = state.status;
    byId("p231-researched-at").value = state.researchedAt || "";
    byId("p231-source-memo").value = state.sourceMemo || "";
    byId("p231-summary").textContent = `providers ${state.providers.length} / needs verification ${needs.length} / history ${state.history.length}`;
  }
  byId("p231-save").addEventListener("click", () => { state.status = byId("p231-status").value; state.researchedAt = byId("p231-researched-at").value; state.sourceMemo = byId("p231-source-memo").value; state.history = core.appendAudit(state.history, { action: "design_saved", operator: byId("p231-operator").value, reason: "human design review" }); const result = core.saveStore(state); byId("p231-message").textContent = result.saved ? "Phase23-1設計を専用領域へ保存しました。外部接続は実行していません。" : `保存失敗: ${result.reason}`; render(); });
  byId("p231-restore").addEventListener("click", () => { const result = core.loadStore(); state = result.store; byId("p231-message").textContent = result.parseError ? "保存JSONが壊れていたため安全な初期設計を表示しました。" : "Phase23-1設計を復元しました。"; render(); });
  byId("p231-audit").addEventListener("click", () => { byId("p231-output").value = core.auditText(state); });
  render();
})();
