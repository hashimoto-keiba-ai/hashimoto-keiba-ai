(() => {
  const consoles = {
    tokyo: "東京版",
    nakayama: "中山版",
    hanshin: "阪神版",
    chukyo: "中京版",
    kyoto: "京都版",
    niigata: "新潟版",
    fukushima: "福島版",
    kokura: "小倉版",
    hakodate: "函館版",
    sapporo: "札幌版",
    win5: "WIN5 AI"
  };

  const resolveConsoleLabel = (key = "tokyo") => consoles[key] || consoles.tokyo;

  const renderConsolePage = (documentRef = document, locationRef = window.location) => {
    if (!documentRef?.getElementById) return null;
    const params = new URLSearchParams(locationRef.search || "");
    const key = params.get("console") || "tokyo";
    const label = resolveConsoleLabel(key);
    const title = `${label} AI Console`;
    documentRef.title = `橋本競馬AI Version 2.7 / ${title}`;
    documentRef.getElementById("console-heading").textContent = title;
    documentRef.getElementById("console-title").textContent = title;
    documentRef.getElementById("console-message").textContent = `${title} / Coming Soon`;
    return { key, label, title };
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => renderConsolePage());
  }

  if (typeof module !== "undefined") {
    module.exports = { consoles, resolveConsoleLabel, renderConsolePage };
  }
})();
