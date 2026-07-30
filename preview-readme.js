(() => {
  const cfg = window.__PREVIEW_README__ || {};
  const status = document.getElementById("status");
  const content = document.getElementById("content");
  const reloadBtn = document.getElementById("reload");

  async function load() {
    status.textContent = "加载中…";
    status.removeAttribute("id"); // keep text only
    status.id = "status";
    if (location.protocol === "file:") {
      status.innerHTML =
        '<span id="error">请用 HTTP 打开：python -m http.server ' +
        (cfg.portHint || "8090") +
        " 后访问 /preview-readme.html</span>";
      content.innerHTML = "";
      return;
    }
    try {
      const res = await fetch(cfg.file || "./README.md", { cache: "no-store" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const md = await res.text();
      content.innerHTML = marked.parse(md);
      status.textContent = "已加载 · " + new Date().toLocaleTimeString();
    } catch (e) {
      status.innerHTML = '<span id="error">失败：' + String(e.message || e) + "</span>";
    }
  }

  reloadBtn.addEventListener("click", load);
  load();
})();
