/* Release notes 本地预览：fetch release-notes/*.md，拆成中英双栏 */
(function () {
  const cfg = window.__PREVIEW_RELEASE__ || {};
  const enEl = document.getElementById("preview-en");
  const zhEl = document.getElementById("preview-zh");
  const statusEl = document.getElementById("preview-status");
  const titleEl = document.getElementById("preview-title");
  const hintEl = document.getElementById("preview-hint");
  const footerEl = document.getElementById("preview-footer");
  const metaEl = document.getElementById("preview-meta");
  const reloadBtn = document.getElementById("preview-reload");
  const panelsEl = document.getElementById("preview-panels");
  const tabEn = document.getElementById("tab-en");
  const tabZh = document.getElementById("tab-zh");
  const panelEn = document.getElementById("panel-en");
  const panelZh = document.getElementById("panel-zh");

  if (titleEl && cfg.title) titleEl.textContent = cfg.title;
  if (hintEl && cfg.hint) hintEl.textContent = cfg.hint;
  if (footerEl && cfg.footer) footerEl.textContent = cfg.footer;
  if (metaEl && cfg.meta) metaEl.innerHTML = cfg.meta;

  function splitNotes(md) {
    const marker = /\n---\s*\n+/;
    const parts = md.split(marker);
    if (parts.length >= 2) {
      return {
        en: parts[0].trim(),
        zh: parts.slice(1).join("\n---\n").trim(),
      };
    }
    return { en: md.trim(), zh: "" };
  }

  function setTab(lang) {
    const isEn = lang === "en";
    panelEn.classList.toggle("is-visible", isEn);
    panelZh.classList.toggle("is-visible", !isEn);
    tabEn.classList.toggle("is-active", isEn);
    tabZh.classList.toggle("is-active", !isEn);
  }

  async function loadNotes() {
    statusEl.textContent = "";
    if (location.protocol === "file:") {
      enEl.textContent = "";
      zhEl.textContent = "";
      statusEl.textContent = cfg.portError || "请使用 HTTP 打开本页。";
      return;
    }
    const file = cfg.notesFile || "./release-notes/v1.0.0.md";
    try {
      enEl.textContent = "Loading…";
      zhEl.textContent = "加载中…";
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const md = await res.text();
      const { en, zh } = splitNotes(md);
      enEl.innerHTML = marked.parse(en || "_Empty_");
      zhEl.innerHTML = marked.parse(zh || "_暂无中文块_");
      statusEl.textContent = "";
    } catch (err) {
      enEl.textContent = "";
      zhEl.textContent = "";
      statusEl.textContent = (cfg.portError || "加载失败：") + " " + err;
    }
  }

  if (panelsEl) panelsEl.setAttribute("data-mode", "tabs");
  tabEn.addEventListener("click", () => setTab("en"));
  tabZh.addEventListener("click", () => setTab("zh"));
  setTab("zh");
  reloadBtn.addEventListener("click", loadNotes);
  loadNotes();
})();
