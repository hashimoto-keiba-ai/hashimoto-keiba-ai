(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase22LocalStorageCleanup = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE21_CLEANUP_KEY_PATTERN = /phase21/i;
  const PHASE21_CLEANUP_TYPE_PATTERN = /(checklist|check|continuation|latest|summary|generated|temporary|temp|panel|builder|closure|operation)/i;

  function estimateStorageBytes(key, value) {
    return (String(key || "").length + String(value || "").length) * 2;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function normalizeProtectedKeys(protectedKeys) {
    return new Set((protectedKeys || []).filter(Boolean).map(String));
  }

  function isPhase21CleanupKey(key, protectedKeys = []) {
    const normalizedKey = String(key || "");
    if (!normalizedKey) return false;
    if (normalizeProtectedKeys(protectedKeys).has(normalizedKey)) return false;
    return PHASE21_CLEANUP_KEY_PATTERN.test(normalizedKey) && PHASE21_CLEANUP_TYPE_PATTERN.test(normalizedKey);
  }

  function getPhase21CleanupCandidates(storage, protectedKeys = []) {
    if (!storage || typeof storage.length !== "number" || typeof storage.key !== "function") return [];
    const candidates = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!isPhase21CleanupKey(key, protectedKeys)) continue;
      const value = storage.getItem(key) || "";
      candidates.push({ key, bytes: estimateStorageBytes(key, value) });
    }
    return candidates;
  }

  function summarizePhase21Cleanup(storage, protectedKeys = []) {
    const candidates = getPhase21CleanupCandidates(storage, protectedKeys);
    const bytes = candidates.reduce((sum, item) => sum + item.bytes, 0);
    return { count: candidates.length, bytes, displaySize: formatBytes(bytes), keys: candidates.map((item) => item.key) };
  }

  function cleanupPhase21LocalData(storage, confirmCleanup = () => false, protectedKeys = []) {
    const summary = summarizePhase21Cleanup(storage, protectedKeys);
    if (!storage) return { deleted: false, reason: "storage_unavailable", ...summary };
    if (!confirmCleanup(summary)) return { deleted: false, reason: "confirmation_required", ...summary };
    summary.keys.forEach((key) => storage.removeItem(key));
    return { deleted: true, removedCount: summary.count, releasedBytes: summary.bytes, releasedSize: summary.displaySize, keys: summary.keys };
  }

  return {
    PHASE21_CLEANUP_KEY_PATTERN,
    PHASE21_CLEANUP_TYPE_PATTERN,
    estimateStorageBytes,
    formatBytes,
    isPhase21CleanupKey,
    getPhase21CleanupCandidates,
    summarizePhase21Cleanup,
    cleanupPhase21LocalData
  };
});
