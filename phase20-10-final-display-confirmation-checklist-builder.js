(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashimotoPhase2010FinalDisplayConfirmationChecklistBuilder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PHASE = "Phase20-10";
  const ACTIVATION_PHASE = "Phase20-8";
  const LINK_INTEGRITY_PHASE = "Phase20-9";
  const EXECUTION_POLICY = "PLAN_ONLY";
  const PROTECTION_POLICY = "Protected";
  const CHECKLIST_STATUS = "final_display_confirmation_checklist_plan_only";
  const SAFE_FALLBACK_HREF = "index.html";
  const NEXT_RECOMMENDED_STEP = "Manual display evidence capture for Course Console / WIN5 / Hakodate / Sapporo";
  const BLOCKED_ACTIONS = ["external_connection", "auto_execution", "auto_update", "auto_repair", "auto_overwrite", "github_pages_setting_change", "repository_visibility_change"];
  const ALLOWED_ACTIONS = ["plan", "validate", "audit", "report", "manual_display_confirmation"];
  const REQUIRED_POLICY_LABELS = ["PLAN_ONLY", "Protected", "External Send Disabled", "Auto Update Disabled", "No GitHub Pages setting changes", "Private repository premise"];
  const CHECKLIST_SCOPES = ["pc_browser", "private_local", "ipad", "iphone", "github_pages", "win5_links", "hakodate_links", "sapporo_links", "fallback"];
  const DATABASES = ["phase20-10-final-display-confirmation-checklist-db.json", "phase20-10-final-display-confirmation-checklist-summary-db.json"];

  const LINK_TARGETS = [
    { console_key: "win5", title: "WIN5 Dashboard", href: "win5.html", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "win5", title: "WIN5 Folder", href: "WIN5/index.html", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "win5", title: "WIN5 Result Verification", href: "WIN5/結果検証/README.md", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "win5", title: "WIN5 Learning Log", href: "学習ログ/index.html", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "hakodate", title: "Hakodate Dashboard", href: "函館競馬場/index.html", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "hakodate", title: "Hakodate Pre-race Plan", href: "函館競馬場/2026/事前予想/README.md", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "hakodate", title: "Hakodate Result Verification", href: "函館競馬場/2026/結果検証/README.md", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "hakodate", title: "Hakodate OS Updates", href: "函館競馬場/2026/OS Updates/README.md", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "sapporo", title: "Sapporo Dashboard", href: "札幌競馬場/index.html", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "sapporo", title: "Sapporo Pre-race Plan", href: "札幌競馬場/2026/事前予想/README.md", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "sapporo", title: "Sapporo Result Verification", href: "札幌競馬場/2026/結果検証/README.md", fallback_href: SAFE_FALLBACK_HREF },
    { console_key: "sapporo", title: "Sapporo OS Updates", href: "札幌競馬場/2026/OS Updates/README.md", fallback_href: SAFE_FALLBACK_HREF }
  ];

  const BASE_CHECKLIST = [
    {
      id: "P20-10-PC-COURSE-CONSOLE",
      target_name: "PC browser Course Console display",
      scope: "pc_browser",
      local_route: "course-console.html?console=win5",
      console_scope: "win5_hakodate_sapporo",
      expected_result: "WIN5 / Hakodate / Sapporo console titles and Phase20-8/Phase20-9 policy labels are visible without Tokyo template bleed.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-PRIVATE-LOCAL-ROUTES",
      target_name: "private-local Course Console routes",
      scope: "private_local",
      local_route: "private-local.html",
      console_scope: "win5_hakodate_sapporo",
      expected_result: "Private local cards keep the existing WIN5 / Hakodate / Sapporo routes and expose this Phase20-10 checklist route.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-IPAD-COURSE-CONSOLE",
      target_name: "iPad Course Console display",
      scope: "ipad",
      local_route: "course-console.html?console=hakodate",
      console_scope: "hakodate",
      expected_result: "Hakodate cards remain readable on iPad and no automatic update or external send is triggered.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-IPHONE-COURSE-CONSOLE",
      target_name: "iPhone Course Console display",
      scope: "iphone",
      local_route: "course-console.html?console=sapporo",
      console_scope: "sapporo",
      expected_result: "Sapporo cards remain readable on iPhone and the protected policy labels remain visible.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-GITHUB-PAGES-DISPLAY",
      target_name: "GitHub Pages display confirmation",
      scope: "github_pages",
      local_route: "course-console.html?console=win5",
      console_scope: "win5_hakodate_sapporo",
      expected_result: "Only manual display confirmation is recorded; GitHub Pages settings are not changed.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-WIN5-LINKS",
      target_name: "WIN5 console link display",
      scope: "win5_links",
      local_route: "course-console.html?console=win5",
      console_scope: "win5",
      expected_result: "WIN5候補生成 / 荒れ度AI / A固定判定AI / 点数圧縮 / 結果検証 / 学習ログ links remain visible and safe.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-HAKODATE-LINKS",
      target_name: "Hakodate console link display",
      scope: "hakodate_links",
      local_route: "course-console.html?console=hakodate",
      console_scope: "hakodate",
      expected_result: "Hakodate芝1200 / 芝1800 / ダ1000 / ダ1700 / 洋芝 / 滞在競馬 / ローカル補正 cards remain visible.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-SAPPORO-LINKS",
      target_name: "Sapporo console link display",
      scope: "sapporo_links",
      local_route: "course-console.html?console=sapporo",
      console_scope: "sapporo",
      expected_result: "Sapporo芝1500 / 芝1800 / 芝2000 / ダ1700 / 洋芝 / 滞在競馬 / 函館→札幌転戦補正 cards remain visible.",
      display_confirmation_status: "manual_pending"
    },
    {
      id: "P20-10-FALLBACK-INDEX",
      target_name: "Missing link fallback display",
      scope: "fallback",
      local_route: SAFE_FALLBACK_HREF,
      console_scope: "win5_hakodate_sapporo",
      expected_result: "When a repository-local target is missing, the display path safely returns to index.html without generation or external send.",
      display_confirmation_status: "manual_pending"
    }
  ];

  function policyFields() {
    return {
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      auto_update_allowed: false,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      required_policy_labels: [...REQUIRED_POLICY_LABELS],
      blocked_actions: [...BLOCKED_ACTIONS],
      allowed_actions: [...ALLOWED_ACTIONS]
    };
  }

  function countScope(records, scope) {
    return records.filter((record) => record.scope === scope).length;
  }

  function assessHtmlRoutes(textSources = {}) {
    const index = textSources["index.html"] || "";
    const privateLocal = textSources["private-local.html"] || "";
    return {
      index_phase20_10_panel: index.includes('id="phase20-10-final-display-confirmation-checklist-builder"') && index.includes('<script src="phase20-10-final-display-confirmation-checklist-builder.js"></script>'),
      private_local_phase20_10_card: privateLocal.includes('href="index.html#phase20-10-final-display-confirmation-checklist-builder"'),
      phase20_8_course_console_routes_retained: index.includes('course-console.html?console=win5') && index.includes('course-console.html?console=hakodate') && index.includes('course-console.html?console=sapporo'),
      phase20_9_link_integrity_db_present: index.includes("Phase20-10") || privateLocal.includes("Phase20-10")
    };
  }

  function createChecklistRecord(item) {
    return {
      ...item,
      verification_method: "manual_display_confirmation",
      fallback_expected_href: SAFE_FALLBACK_HREF,
      links_to_confirm: LINK_TARGETS.filter((link) => item.console_scope === "win5_hakodate_sapporo" || link.console_key === item.console_scope),
      ...policyFields()
    };
  }

  function buildFinalDisplayConfirmationChecklist(sources = {}, now = () => new Date()) {
    const generatedAt = now();
    const records = BASE_CHECKLIST.map(createChecklistRecord);
    const summary = {
      total_check_items: records.length,
      pc_browser_items: countScope(records, "pc_browser"),
      private_local_items: countScope(records, "private_local"),
      ipad_items: countScope(records, "ipad"),
      iphone_items: countScope(records, "iphone"),
      github_pages_items: countScope(records, "github_pages"),
      win5_link_items: countScope(records, "win5_links"),
      hakodate_link_items: countScope(records, "hakodate_links"),
      sapporo_link_items: countScope(records, "sapporo_links"),
      fallback_items: countScope(records, "fallback"),
      manual_pending_count: records.filter((record) => record.display_confirmation_status === "manual_pending").length,
      protected_mode: true,
      plan_only: true,
      execution_allowed: false,
      auto_execution_allowed: false,
      external_connection_allowed: false,
      auto_update_allowed: false,
      github_pages_setting_change_allowed: false,
      repository_visibility_change_allowed: false,
      unsafe_flags_count: 0,
      html_route_checks: assessHtmlRoutes(sources.textSources || {}),
      next_recommended_step: NEXT_RECOMMENDED_STEP
    };
    return {
      phase: PHASE,
      activation_phase: ACTIVATION_PHASE,
      link_integrity_phase: LINK_INTEGRITY_PHASE,
      checklist_id: `P20-10-FINAL-DISPLAY-CONFIRMATION-${generatedAt.getTime()}`,
      checklist_status: CHECKLIST_STATUS,
      executionPolicy: EXECUTION_POLICY,
      protectionPolicy: PROTECTION_POLICY,
      records,
      phase20_10_summary: summary,
      link_targets: LINK_TARGETS.map((link) => ({ ...link })),
      safe_fallback_href: SAFE_FALLBACK_HREF,
      next_recommended_step: NEXT_RECOMMENDED_STEP,
      generated_at: generatedAt.toISOString(),
      ...policyFields()
    };
  }

  function renderFinalDisplayConfirmationChecklist(checklist, doc = document) {
    const summary = checklist.phase20_10_summary;
    const set = (selector, value) => {
      const node = doc.querySelector(selector);
      if (node) node.textContent = String(value);
    };
    set("#phase20-10-checklist-status", checklist.checklist_status);
    set("#phase20-10-total-check-items", summary.total_check_items);
    set("#phase20-10-manual-pending", summary.manual_pending_count);
    set("#phase20-10-win5-links", summary.win5_link_items);
    set("#phase20-10-hakodate-links", summary.hakodate_link_items);
    set("#phase20-10-sapporo-links", summary.sapporo_link_items);
    set("#phase20-10-fallback-items", summary.fallback_items);
    set("#phase20-10-unsafe-flags", summary.unsafe_flags_count);
    set("#phase20-10-next-step", summary.next_recommended_step);
    set("#phase20-10-updated", checklist.generated_at);
    const list = doc.querySelector("#phase20-10-final-display-confirmation-checklist-list");
    if (list) {
      list.innerHTML = "";
      checklist.records.forEach((record) => {
        const li = doc.createElement("li");
        li.textContent = `${record.target_name}: ${record.display_confirmation_status} / ${record.expected_result}`;
        list.appendChild(li);
      });
    }
    return checklist;
  }

  function runFinalDisplayConfirmationChecklist(options = {}) {
    const checklist = buildFinalDisplayConfirmationChecklist(options.sources || {}, options.now);
    if (options.document || (typeof document !== "undefined" && document)) {
      renderFinalDisplayConfirmationChecklist(checklist, options.document || document);
    }
    return checklist;
  }

  if (typeof document !== "undefined") {
    const button = document.querySelector("#run-phase20-10-final-display-confirmation-checklist");
    if (button) button.addEventListener("click", () => runFinalDisplayConfirmationChecklist());
  }

  return {
    PHASE,
    ACTIVATION_PHASE,
    LINK_INTEGRITY_PHASE,
    EXECUTION_POLICY,
    PROTECTION_POLICY,
    CHECKLIST_STATUS,
    SAFE_FALLBACK_HREF,
    NEXT_RECOMMENDED_STEP,
    BLOCKED_ACTIONS,
    ALLOWED_ACTIONS,
    REQUIRED_POLICY_LABELS,
    CHECKLIST_SCOPES,
    DATABASES,
    LINK_TARGETS,
    BASE_CHECKLIST,
    assessHtmlRoutes,
    countScope,
    createChecklistRecord,
    buildFinalDisplayConfirmationChecklist,
    renderFinalDisplayConfirmationChecklist,
    runFinalDisplayConfirmationChecklist
  };
});
