/* README 本地预览壳：fetch README.md 并用 marked 渲染 */
(function () {
  const cfg = window.__PREVIEW_README__ || {};
  const contentEl = document.getElementById("preview-content");
  const statusEl = document.getElementById("preview-status");
  const titleEl = document.getElementById("preview-title");
  const hintEl = document.getElementById("preview-hint");
  const footerEl = document.getElementById("preview-footer");
  const reloadBtn = document.getElementById("preview-reload");

  if (titleEl && cfg.title) titleEl.textContent = cfg.title;
  if (hintEl && cfg.hint) hintEl.textContent = cfg.hint;
  if (footerEl && cfg.footer) footerEl.textContent = cfg.footer;

  async function loadReadme() {
    statusEl.textContent = "";
    if (location.protocol === "file:") {
      contentEl.textContent = "";
      statusEl.textContent = cfg.portError || "请使用 HTTP 打开本页。";
      return;
    }
    try {
      contentEl.textContent = "加载中…";
      const res = await fetch("./README.md", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const md = await res.text();
      contentEl.innerHTML = marked.parse(md);
      statusEl.textContent = "";
    } catch (err) {
      contentEl.textContent = "";
      statusEl.textContent = (cfg.portError || "加载失败：") + " " + err;
    }
  }

  reloadBtn.addEventListener("click", loadReadme);
  loadReadme();
})();
