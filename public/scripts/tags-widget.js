/* extracted from Tags.astro */
(function () {
    var MODE_KEY = "firefly-tag-wall-mode";

    function isPostPath(pathname) {
      return /\/posts\//.test(pathname || "");
    }

    function parseTagList(raw) {
      if (raw == null || raw === "") return [];
      try {
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed.map(function (t) { return String(t).trim(); }).filter(Boolean)
          : [];
      } catch (e) {
        return [];
      }
    }

    /** @returns {{ primary: string[], theme: string[] } | null} */
    function readFocusPayload() {
      if (!isPostPath(location.pathname)) return null;
      var host = document.getElementById("swup-container");
      var primary = parseTagList(
        host && host.getAttribute("data-current-post-tags"),
      );
      var theme = parseTagList(
        host && host.getAttribute("data-current-post-theme-tags"),
      );
      return { primary: primary, theme: theme };
    }

    function uniq(list) {
      var seen = new Set();
      var out = [];
      (list || []).forEach(function (n) {
        if (!n || seen.has(n)) return;
        seen.add(n);
        out.push(n);
      });
      return out;
    }

    function readStoredMode() {
      try {
        var m = localStorage.getItem(MODE_KEY);
        return m === "list" ? "list" : "sphere";
      } catch (e) {
        return "sphere";
      }
    }

    function writeStoredMode(mode) {
      try {
        localStorage.setItem(MODE_KEY, mode);
      } catch (e) {}
    }

    function syncModeButtons(widget, mode) {
      var btns = widget.querySelectorAll("[data-tag-wall-mode]");
      btns.forEach(function (btn) {
        var on = btn.getAttribute("data-tag-wall-mode") === mode;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function currentItemsForWall(body) {
      var payload = readFocusPayload();
      var focusMode = payload !== null;
      var catalog = [];
      try {
        catalog = JSON.parse(body.getAttribute("data-tags-catalog") || "[]");
      } catch (e) {
        catalog = [];
      }
      var maxVisible = Number(body.getAttribute("data-max-visible") || 12);
      if (focusMode) {
        var primaryNames = uniq(payload.primary);
        var primarySet = new Set(primaryNames);
        var themeNames = uniq(payload.theme).filter(function (n) {
          return !primarySet.has(n);
        });
        return primaryNames
          .map(function (n) {
            return { name: n, kind: "primary" };
          })
          .concat(
            themeNames.map(function (n) {
              return { name: n, kind: "theme" };
            }),
          );
      }
      return catalog.slice(0, maxVisible).map(function (t) {
        return { name: t.name, kind: "primary" };
      });
    }

    function applyWallMode(widget, mode) {
      var body = widget.querySelector("[data-tag-wall]");
      var sphere = body && body.querySelector("[data-tag-chalk-sphere]");
      if (!sphere) return;
      var next = mode === "list" ? "list" : "sphere";
      sphere.setAttribute("data-view-mode", next);
      syncModeButtons(widget, next);
      writeStoredMode(next);

      if (typeof window.__setTagChalkSphereMode === "function") {
        window.__setTagChalkSphereMode(sphere, next);
      }

      // 切回球模式时重挂，避免列表态未创建实例
      if (next === "sphere" && body) {
        var cloud = sphere.querySelector(".tag-sphere__cloud");
        var cloudId = cloud && cloud.id;
        if (cloudId && typeof window.__remountTagChalkSphere === "function") {
          window.__remountTagChalkSphere(cloudId, currentItemsForWall(body));
        }
      }
    }

    function bindModeToggles() {
      document.querySelectorAll("widget-layout.tags-widget").forEach(function (widget) {
        if (widget._tagWallModeBound) return;
        widget._tagWallModeBound = true;
        var toggle = widget.querySelector("[data-tag-wall-mode-toggle]");
        if (!toggle) return;
        var initial = readStoredMode();
        applyWallMode(widget, initial);
        toggle.addEventListener("click", function (ev) {
          var btn = ev.target && ev.target.closest
            ? ev.target.closest("[data-tag-wall-mode]")
            : null;
          if (!btn || !toggle.contains(btn)) return;
          applyWallMode(widget, btn.getAttribute("data-tag-wall-mode") || "sphere");
        });
      });
    }

    function applyTagWallFocus() {
      var widgets = document.querySelectorAll("widget-layout.tags-widget");
      if (!widgets.length) return;

      var payload = readFocusPayload();
      var focusMode = payload !== null;
      var primaryNames = focusMode ? uniq(payload.primary) : [];
      var primarySet = new Set(primaryNames);
      var themeNames = focusMode
        ? uniq(payload.theme).filter(function (n) {
            return !primarySet.has(n);
          })
        : [];

      widgets.forEach(function (widget) {
        var body = widget.querySelector("[data-tag-wall]");
        if (!body) return;

        widget.classList.toggle("tags-widget--focus", focusMode);
        body.setAttribute("data-tag-wall-focus", focusMode ? "1" : "0");

        var catalog = [];
        try {
          catalog = JSON.parse(body.getAttribute("data-tags-catalog") || "[]");
        } catch (e) {
          catalog = [];
        }
        var maxVisible = Number(body.getAttribute("data-max-visible") || 12);

        /** @type {{ name: string, kind: string }[]} */
        var items;
        if (focusMode) {
          items = primaryNames
            .map(function (n) {
              return { name: n, kind: "primary" };
            })
            .concat(
              themeNames.map(function (n) {
                return { name: n, kind: "theme" };
              }),
            );
        } else {
          items = catalog.slice(0, maxVisible).map(function (t) {
            return { name: t.name, kind: "primary" };
          });
        }

        var empty = body.querySelector("[data-tag-wall-empty]");
        var sphere = body.querySelector("[data-tag-chalk-sphere]");
        var more = body.querySelector("[data-tag-chalk-more]");

        if (focusMode && items.length === 0) {
          if (empty) {
            empty.classList.add("is-visible");
            empty.hidden = false;
          }
          if (sphere) sphere.style.display = "none";
          return;
        }

        if (empty) {
          empty.classList.remove("is-visible");
          empty.hidden = true;
        }
        if (sphere) sphere.style.display = "";

        var mode = readStoredMode();
        if (sphere) sphere.setAttribute("data-view-mode", mode);

        var cloud = sphere && sphere.querySelector(".tag-chalk-sphere__cloud, .tag-sphere__cloud");
        var cloudId = cloud && cloud.id;
        if (cloudId && typeof window.__remountTagChalkSphere === "function") {
          window.__remountTagChalkSphere(cloudId, items);
        }

        if (sphere && typeof window.__setTagChalkSphereMode === "function") {
          window.__setTagChalkSphereMode(sphere, mode);
        }
        syncModeButtons(widget, mode);

        if (more) {
          more.style.display = focusMode ? "none" : "";
        }
      });
    }

    function boot() {
      bindModeToggles();
      applyTagWallFocus();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }

    // 单通道重挂：软导航后只跑一次（原 DOM 事件 + hooks 双通道每次导航跑三遍）
    document.addEventListener("swup:page:view", boot);
  })();
