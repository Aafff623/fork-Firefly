(() => {
  const cfg = window.__PREVIEW_README__ || {};
  const status = document.getElementById("status");
  const content = document.getElementById("content");
  const reloadBtn = document.getElementById("reload");

  const ALERT_META = {
    NOTE: { className: "markdown-alert-note", label: "Note", emoji: "ℹ️" },
    TIP: { className: "markdown-alert-tip", label: "Tip", emoji: "💡" },
    IMPORTANT: { className: "markdown-alert-important", label: "Important", emoji: "❗️" },
    WARNING: { className: "markdown-alert-warning", label: "Warning", emoji: "⚠️" },
    CAUTION: { className: "markdown-alert-caution", label: "Caution", emoji: "🚨" },
  };

  /** GitHub Alerts → HTML (marked 不原生支持 [!TIP]) */
  function renderGitHubAlerts(md) {
    return md.replace(
      /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*(?:\n|$))*)/gm,
      (_m, type, body) => {
        const meta = ALERT_META[type] || ALERT_META.NOTE;
        const innerMd = body
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join("\n")
          .trim();
        const innerHtml = marked.parse(innerMd, { async: false });
        return (
          `<div class="markdown-alert ${meta.className}" dir="auto">` +
          `<p class="markdown-alert-title"><span aria-hidden="true">${meta.emoji}</span> ${meta.label}</p>\n` +
          `${innerHtml}` +
          `</div>\n\n`
        );
      },
    );
  }

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
      const md = renderGitHubAlerts(await res.text());
      content.innerHTML = marked.parse(md);
      status.textContent = "已加载 · " + new Date().toLocaleTimeString();
    } catch (e) {
      status.innerHTML = '<span id="error">失败：' + String(e.message || e) + "</span>";
    }
  }

  reloadBtn.addEventListener("click", load);
  load();
})();
