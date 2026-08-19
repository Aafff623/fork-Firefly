/* extracted from TagChalkSphere.astro */
(function () {
  function readJson(el, attr, fallback) {
    try {
      var raw = el.getAttribute(attr);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  document.querySelectorAll("[data-tag-chalk-sphere]").forEach(function (root) {
    var cloudId = root.getAttribute("data-cloud-id");
    if (!cloudId) return;
    var radius = parseInt(root.getAttribute("data-radius") || "72", 10);
    var hrefByName = readJson(root, "data-href-map", {});
    var sphereItems = readJson(root, "data-sphere-items", []);
    (function () {

    var SCRIPT_SRC = "/scripts/vendor/tagcloud.min.js";
    var DRAG_PX = 6;
    // 闲置再快一档；拖拽跟手但别飞（0.42 是拖拽过灵敏的旧值）
    var IDLE_MAX_SPEED = 0.4;
    var DRAG_MAX_SPEED = 1.85;
    var IDLE_DIV = 5;
    // 越大越钝：鼠标位移 / DRAG_DIV → 角速度
    var DRAG_DIV = 1.35;
    // 进墙首次悬停 0.5s；墙内再换签 1s；整墙离开后再进又回到 0.5s
    var HOVER_FIRST_MS = 500;
    var HOVER_NEXT_MS = 500;
    var HOVER_LEAVE_GRACE_MS = 180;
    var HOVER_SWITCH_STICKY_MS = 120;
    var FOCUS_ANIM_MS = 420;

    function reducedMotion() {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }

    /** 触摸设备优先静态列表：少一份 CDN、逐帧动画和逐标签 DOM 写入。 */
    function prefersStaticList() {
      return (
        reducedMotion() ||
        (window.matchMedia &&
          window.matchMedia("(hover: none), (pointer: coarse)").matches)
      );
    }

    function loadTagCloud(cb) {
      if (window.TagCloud) {
        cb();
        return;
      }
      var existed = document.querySelector('script[data-tagcloud-cdn="1"]');
      if (existed) {
        if (existed.dataset.tagcloudFailed === "1") {
          cb();
          return;
        }
        existed.addEventListener("load", cb, { once: true });
        existed.addEventListener("error", cb, { once: true });
        return;
      }
      var s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.dataset.tagcloudCdn = "1";
      s.onload = cb;
      s.onerror = function () {
        s.dataset.tagcloudFailed = "1";
        cb();
      };
      document.head.appendChild(s);
    }

    function clearHoverTimers(el) {
      if (!el) return;
      if (el._hoverTriggerTimer) {
        clearTimeout(el._hoverTriggerTimer);
        el._hoverTriggerTimer = null;
      }
      if (el._hoverLeaveGraceTimer) {
        clearTimeout(el._hoverLeaveGraceTimer);
        el._hoverLeaveGraceTimer = null;
      }
      if (el._hoverSwitchTimer) {
        clearTimeout(el._hoverSwitchTimer);
        el._hoverSwitchTimer = null;
      }
      el._hoverSwitchItem = null;
      if (el._focusTimer) {
        clearInterval(el._focusTimer);
        el._focusTimer = null;
      }
      if (el._focusRaf) {
        cancelAnimationFrame(el._focusRaf);
        el._focusRaf = 0;
      }
    }

    function clearHoverFocus(el) {
      if (!el) return;
      clearHoverTimers(el);
      el._focusHold = false;
      el._hoverFocusItem = null;
      el._hoverDwellItem = null;
      el._hoverFastUsed = false;
      el._hoverFirstItem = null;
      var root = el.closest("[data-tag-sphere], [data-tag-chalk-sphere]");
      var frame = root && root.querySelector("[data-tag-sphere-frame]");
      if (frame) frame.classList.remove("is-hover-focus");
      var nodes = el.querySelectorAll(".tagcloud--item");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].classList.remove("tag-sphere__item--focus");
      }
      if (el._skipResume) return;
      if (el._tagVisSync) {
        el._tagVisSync();
      } else {
        startTagCloudRaf(el._tagCloudInstance);
        setIdleSpeed(el._tagCloudInstance);
      }
    }

    function destroyCloud(el) {
      if (!el) return;
      el._skipResume = true;
      clearHoverFocus(el);
      el._skipResume = false;
      stopTagCloudRaf(el._tagCloudInstance);
      if (el._tagVisIo) {
        try {
          el._tagVisIo.disconnect();
        } catch (e) {}
        el._tagVisIo = null;
      }
      if (el._tagMetricsRo) {
        try {
          el._tagMetricsRo.disconnect();
        } catch (e) {}
        el._tagMetricsRo = null;
      }
      if (el._tagVisSync) {
        document.removeEventListener("visibilitychange", el._tagVisSync);
        el._tagVisSync = null;
      }
      el._tagVisBound = false;
      el._tagMetricsBound = false;
      if (el._tagCloudDestroy) {
        try {
          el._tagCloudDestroy();
        } catch (e) {}
        el._tagCloudDestroy = null;
      }
      el._tagCloudInstance = null;
      el._sphereItemsKey = null;
      el.innerHTML = "";
      el._tagInteract = null;
    }

    function normalizeItems(list) {
      return (list || []).map(function (item) {
        if (typeof item === "string") {
          return { name: item, kind: "primary" };
        }
        return {
          name: String(item.name || "").trim(),
          kind: item.kind === "theme" ? "theme" : "primary",
        };
      }).filter(function (it) {
        return it.name;
      });
    }

    function fallbackTagHref(name) {
      return (
        "/timeline/?tag=" + encodeURIComponent(String(name).trim())
      );
    }

    function toHtmlItems(itemList, map) {
      return normalizeItems(itemList).map(function (it) {
        var safe = String(it.name)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
        if (it.kind === "theme") {
          return (
            '<span class="tag-sphere__link tag-sphere__link--theme" title="主题标签（不计入统计）">#' +
            safe +
            "</span>"
          );
        }
        var href = (map && map[it.name]) || fallbackTagHref(it.name);
        return (
          '<a class="tag-sphere__link tag-sphere__link--primary" href="' +
          href +
          '" draggable="false">#' +
          safe +
          "</a>"
        );
      });
    }

    /** sensitivityDiv：闲置 IDLE_DIV，拖拽 DRAG_DIV（更小更跟手） */
    function applyPointerToInstance(instance, cloudEl, clientX, clientY, sensitivityDiv) {
      if (!instance || !cloudEl) return;
      var div = sensitivityDiv || IDLE_DIV;
      var rect = cloudEl.getBoundingClientRect();
      instance.mouseX = (clientX - (rect.left + rect.width / 2)) / div;
      instance.mouseY = (clientY - (rect.top + rect.height / 2)) / div;
      instance.active = true;
    }

    function setIdleSpeed(instance) {
      if (!instance) return;
      instance.maxSpeed = IDLE_MAX_SPEED;
    }

    function setDragSpeed(instance) {
      if (!instance) return;
      instance.maxSpeed = DRAG_MAX_SPEED;
    }

    function cacheItemMetrics(instance) {
      if (!instance || !instance.items) return;
      for (var i = 0; i < instance.items.length; i++) {
        var e = instance.items[i];
        var node = e.el;
        if (!node) continue;
        e._ow = node.offsetWidth;
        e._oh = node.offsetHeight;
        if (node.style) node.style.willChange = "transform";
      }
    }

    function stopTagCloudRaf(instance) {
      if (!instance) return;
      instance.paused = true;
      if (typeof instance.pause === "function") instance.pause();
      if (instance.interval && typeof instance.interval.value === "number") {
        try {
          cancelAnimationFrame(instance.interval.value);
        } catch (e) {}
        instance.interval = null;
      }
    }

    function startTagCloudRaf(instance) {
      if (!instance) return;
      instance.paused = false;
      if (typeof instance.resume === "function") instance.resume();
      if (instance.interval && typeof instance.interval.value === "number") {
        return;
      }
      if (typeof instance._requestInterval === "function") {
        instance.interval = instance._requestInterval(function () {
          instance._next.call(instance);
        }, 10);
      }
    }

    /**
     * 按这一帧里最近/最远的标签归一化。
     * 12 点斐波那契分布永远到不了 z=-R，用理论极点会把「最近那颗」也压到 0.4，整球发灰。
     */
    function paintSphereDepth(instance) {
      if (!instance || !instance.items) return;
      var items = instance.items;
      var n = items.length;
      if (!n) return;
      var d = instance.depth || 2 * (instance.radius || 72);
      var rMin = Infinity;
      var rMax = -Infinity;
      var rs = new Array(n);
      var i;
      for (i = 0; i < n; i++) {
        var rr = (2 * d) / (2 * d + items[i].z);
        rs[i] = rr;
        if (rr < rMin) rMin = rr;
        if (rr > rMax) rMax = rr;
      }
      var span = rMax - rMin;
      if (span < 0.01) span = 0.01;
      for (i = 0; i < n; i++) {
        var item = items[i];
        var node = item.el;
        if (!node) continue;
        var u = (rs[i] - rMin) / span;
        var spot = Math.pow(u, 3.2);
        var op = 0.4 + 0.6 * spot;
        var spotCss = 0.28 + 0.72 * spot;
        var cue = "";
        if (item._cue !== cue) {
          item._cue = cue;
          node.style.filter = cue;
        }
        var spotKey = spotCss.toFixed(3);
        if (item._spot !== spotKey) {
          item._spot = spotKey;
          node.style.setProperty("--tag-spot", spotKey);
        }
        node.style.opacity = op.toFixed(3);
        node.style.zIndex = String(Math.round(rs[i] * 1000));
      }
    }

    /** 库 _next 每帧读 offsetWidth；改走缓存，并去掉 IE filter 写入 */
    function patchTagCloudNext(instance) {
      if (!instance) return;
      var proto = Object.getPrototypeOf(instance);
      if (!proto) return;
      if (proto._fireflyDepthPaint === 9) return;
      proto._fireflyDepthPaint = 9;
      proto._fireflyNextPatched = true;
      proto._next = function () {
        var s = this;
        if (s.paused) return;
        if (!s.keep && !s.active) {
          s.mouseX =
            Math.abs(s.mouseX - s.mouseX0) < 1
              ? s.mouseX0
              : (s.mouseX + s.mouseX0) / 2;
          s.mouseY =
            Math.abs(s.mouseY - s.mouseY0) < 1
              ? s.mouseY0
              : (s.mouseY + s.mouseY0) / 2;
        }
        var angX =
          -(Math.min(Math.max(-s.mouseY, -s.size), s.size) / s.radius) *
          s.maxSpeed;
        var angY =
          (Math.min(Math.max(-s.mouseX, -s.size), s.size) / s.radius) *
          s.maxSpeed;
        if (s.config && s.config.reverseDirection) {
          angX = -angX;
          angY = -angY;
        }
        if (Math.abs(angX) <= 0.01 && Math.abs(angY) <= 0.01) return;
        var n = Math.PI / 180;
        var a = [
          Math.sin(angX * n),
          Math.cos(angX * n),
          Math.sin(angY * n),
          Math.cos(angY * n),
        ];
        var items = s.items || [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var x = item.x;
          var y2 = item.y * a[1] + item.z * -a[0];
          var z1 = item.y * a[0] + item.z * a[1];
          var z2 = z1 * a[3] - x * a[2];
          var r = (2 * s.depth) / (2 * s.depth + z2);
          item.x = x * a[3] + z1 * a[2];
          item.y = y2;
          item.z = z2;
          item.scale = r.toFixed(3);
          var node = item.el;
          if (!node) continue;
          var hw = (item._ow != null ? item._ow : node.offsetWidth) / 2;
          var hh = (item._oh != null ? item._oh : node.offsetHeight) / 2;
          var tr =
            "translate3d(" +
            (item.x - hw).toFixed(2) +
            "px, " +
            (item.y - hh).toFixed(2) +
            "px, 0) scale(" +
            item.scale +
            ")";
          node.style.WebkitTransform = tr;
          node.style.transform = tr;
        }
        paintSphereDepth(s);
      };
    }

    function disarmNativeLinkDrag(host) {
      if (!host || host._tagSphereDragArmed) return;
      host._tagSphereDragArmed = true;
      host.addEventListener(
        "dragstart",
        function (ev) {
          ev.preventDefault();
        },
        true,
      );
    }

    /** 球/列表视图；列表模式暂停球并露出 chalk 列表 */
    function applyViewMode(root, mode) {
      if (!root) return;
      var next = mode === "list" ? "list" : "sphere";
      if (prefersStaticList()) next = "list";
      root.setAttribute("data-view-mode", next);
      var frame = root.querySelector("[data-tag-sphere-frame]");
      var fallback = root.querySelector("[data-tag-chalk-fallback]");
      var cloudHost = root.querySelector(".tag-sphere__cloud");
      var instance = cloudHost && cloudHost._tagCloudInstance;

      if (next === "list") {
        if (fallback) fallback.hidden = false;
        if (frame) frame.setAttribute("hidden", "");
        stopTagCloudRaf(instance);
      } else {
        if (fallback) fallback.hidden = true;
        if (frame) frame.removeAttribute("hidden");
        if (cloudHost && cloudHost._tagVisSync) cloudHost._tagVisSync();
        else startTagCloudRaf(instance);
      }
    }

    window.__setTagChalkSphereMode = function (rootOrSelector, mode) {
      var root =
        typeof rootOrSelector === "string"
          ? document.querySelector(rootOrSelector)
          : rootOrSelector;
      if (!root) return;
      applyViewMode(root, mode);
    };

    /** 绕轴旋转全部 item（Rodrigues）——锁定轴向做缓动更丝滑 */
    function rotateItemsAxisAngle(items, ux, uy, uz, angle) {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var C = 1 - c;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var x = item.x;
        var y = item.y;
        var z = item.z;
        item.x =
          (c + ux * ux * C) * x +
          (ux * uy * C - uz * s) * y +
          (ux * uz * C + uy * s) * z;
        item.y =
          (uy * ux * C + uz * s) * x +
          (c + uy * uy * C) * y +
          (uy * uz * C - ux * s) * z;
        item.z =
          (uz * ux * C - uy * s) * x +
          (uz * uy * C + ux * s) * y +
          (c + uz * uz * C) * z;
      }
    }

    /** 绕 X / Y 微调（到位后收束用） */
    function rotateItemsXY(items, angleX, angleY) {
      var cosX = Math.cos(angleX);
      var sinX = Math.sin(angleX);
      var cosY = Math.cos(angleY);
      var sinY = Math.sin(angleY);
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var x = it.x;
        var y = it.y;
        var z = it.z;
        var y2 = y * cosX - z * sinX;
        var z2 = y * sinX + z * cosX;
        it.x = x * cosY + z2 * sinY;
        it.y = y2;
        it.z = -x * sinY + z2 * cosY;
      }
    }

    /** 把 TagCloud item 坐标写回 DOM（对齐库内 _next 公式） */
    function syncTagCloudStyles(instance) {
      if (!instance || !instance.items) return;
      var depth = instance.depth || 2 * (instance.radius || 72);
      for (var i = 0; i < instance.items.length; i++) {
        var e = instance.items[i];
        var r = (2 * depth) / (2 * depth + e.z);
        e.scale = r;
        var node = e.el;
        if (!node) continue;
        var hw = (e._ow != null ? e._ow : node.offsetWidth) / 2;
        var hh = (e._oh != null ? e._oh : node.offsetHeight) / 2;
        var n = (e.x - hw).toFixed(2);
        var o = (e.y - hh).toFixed(2);
        var tr =
          "translate3d(" + n + "px, " + o + "px, 0) scale(" + r + ")";
        node.style.WebkitTransform = tr;
        node.style.transform = tr;
      }
      paintSphereDepth(instance);
    }

    function findInstanceItem(instance, itemEl) {
      if (!instance || !instance.items || !itemEl) return null;
      for (var i = 0; i < instance.items.length; i++) {
        if (instance.items[i].el === itemEl) return instance.items[i];
      }
      return null;
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /** 丝滑转到正前方：开局锁定旋转轴，按缓动角度推进 */
    function animateBringToFront(el, itemEl, onDone) {
      var instance = el._tagCloudInstance;
      var target = findInstanceItem(instance, itemEl);
      if (!instance || !target) {
        if (onDone) onDone(false);
        return;
      }
      stopTagCloudRaf(instance);
      clearHoverTimers(el);

      var len =
        Math.sqrt(
          target.x * target.x + target.y * target.y + target.z * target.z,
        ) || 1;
      var cx = target.x / len;
      var cy = target.y / len;
      var cz = target.z / len;
      var fx = 0;
      var fy = 0;
      var fz = -1;
      var ux = cy * fz - cz * fy;
      var uy = cz * fx - cx * fz;
      var uz = cx * fy - cy * fx;
      var axisLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
      var dot = cx * fx + cy * fy + cz * fz;
      if (dot > 1) dot = 1;
      if (dot < -1) dot = -1;
      var totalAngle = Math.acos(dot);
      if (axisLen < 1e-5) {
        if (dot > 0.995) {
          if (onDone) onDone(true);
          return;
        }
        ux = 1;
        uy = 0;
        uz = 0;
        totalAngle = Math.PI;
      } else {
        ux /= axisLen;
        uy /= axisLen;
        uz /= axisLen;
      }

      var start = performance.now();
      var prevEased = 0;

      function fineTune() {
        var n = 8;
        while (n-- > 0) {
          if (
            Math.abs(target.x) < 12 &&
            Math.abs(target.y) < 12 &&
            target.z < -20
          ) {
            break;
          }
          var ax = -target.y * 0.16;
          var ay = target.x * 0.16;
          if (ax > 0.2) ax = 0.2;
          if (ax < -0.2) ax = -0.2;
          if (ay > 0.2) ay = 0.2;
          if (ay < -0.2) ay = -0.2;
          rotateItemsXY(instance.items, ax, ay);
        }
        syncTagCloudStyles(instance);
      }

      function tick(now) {
        if (!el._focusHold) {
          el._focusRaf = 0;
          return;
        }
        var t = Math.min(1, (now - start) / FOCUS_ANIM_MS);
        var eased = easeInOutCubic(t);
        var delta = (eased - prevEased) * totalAngle;
        prevEased = eased;
        if (Math.abs(delta) > 1e-6) {
          rotateItemsAxisAngle(instance.items, ux, uy, uz, delta);
          syncTagCloudStyles(instance);
        }
        if (t >= 1) {
          el._focusRaf = 0;
          fineTune();
          if (onDone) onDone(true);
          return;
        }
        el._focusRaf = requestAnimationFrame(tick);
      }
      el._focusRaf = requestAnimationFrame(tick);
    }

    function bindHoverFocus(el, root) {
      var frame =
        (root && root.querySelector("[data-tag-sphere-frame]")) || el;
      if (!frame || frame._tagHoverFocusBound) return;
      frame._tagHoverFocusBound = true;

      function itemUnderPointer(clientX, clientY) {
        if (typeof document.elementFromPoint !== "function") return null;
        var under = document.elementFromPoint(clientX, clientY);
        if (!under || !under.closest) return null;
        var item = under.closest(".tagcloud--item");
        if (!item || !frame.contains(item)) return null;
        return item;
      }

      function stillHovering(itemEl) {
        if (!itemEl) return false;
        var p = el._hoverLastPointer;
        if (!p) return el._hoverDwellItem === itemEl;
        return itemUnderPointer(p.x, p.y) === itemEl;
      }

      /** 仅清聚焦 UI / 计时；resetSession=true 表示整墙离开，下次进墙恢复 0.5s */
      function releaseFocus(resetSession) {
        clearHoverTimers(el);
        el._focusHold = false;
        el._hoverFocusItem = null;
        el._hoverDwellItem = null;
        if (resetSession) {
          el._hoverFastUsed = false;
          el._hoverFirstItem = null;
        }
        frame.classList.remove("is-hover-focus");
        var nodes = el.querySelectorAll(".tagcloud--item");
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].classList.remove("tag-sphere__item--focus");
        }
        if (el._tagVisSync) el._tagVisSync();
        else {
          startTagCloudRaf(el._tagCloudInstance);
          setIdleSpeed(el._tagCloudInstance);
        }
      }

      function fireFocus(itemEl) {
        if (!itemEl || reducedMotion()) return;
        if (el._tagInteract && el._tagInteract.dragged) return;
        if (!stillHovering(itemEl)) {
          // 触发瞬间已离开：不烧掉首次 0.5s；若已落到别的签再续 dwell
          releaseFocus(false);
          var pMiss = el._hoverLastPointer;
          var underMiss = pMiss ? itemUnderPointer(pMiss.x, pMiss.y) : null;
          if (underMiss && underMiss !== itemEl) beginDwell(underMiss);
          return;
        }
        // 成功触发后，同一次进墙再换签都走 1s
        el._hoverFastUsed = true;
        el._hoverFocusItem = itemEl;
        el._focusHold = true;
        frame.classList.add("is-hover-focus");
        itemEl.classList.add("tag-sphere__item--focus");
        animateBringToFront(el, itemEl, function () {
          if (!el._focusHold || el._hoverFocusItem !== itemEl) return;
          itemEl.classList.add("tag-sphere__item--focus");
        });
      }

      function startDwellTimers(itemEl) {
        clearHoverTimers(el);
        el._hoverDwellItem = itemEl;
        // 本墙会话里：第一个签 0.5s；换到别的签 / 已成功触发过 → 1s
        // 空隙抖回同一签仍算「首次签」，不烧成 1s
        if (!el._hoverFirstItem) el._hoverFirstItem = itemEl;
        var isFirstTag = !el._hoverFastUsed && el._hoverFirstItem === itemEl;
        if (!isFirstTag) el._hoverFastUsed = true;
        var ms = isFirstTag ? HOVER_FIRST_MS : HOVER_NEXT_MS;
        el._hoverTriggerTimer = setTimeout(function () {
          el._hoverTriggerTimer = null;
          if (el._hoverDwellItem !== itemEl) return;
          if (el._tagInteract && el._tagInteract.dragged) return;
          if (!stillHovering(itemEl)) {
            releaseFocus(false);
            var p = el._hoverLastPointer;
            var under = p ? itemUnderPointer(p.x, p.y) : null;
            if (under) beginDwell(under);
            return;
          }
          fireFocus(itemEl);
        }, ms);
      }

      /**
       * 开始 / 续上悬停。
       * 首次进墙 → 0.5s；仍在墙内换到其他标签 → 1s；整墙离开再进 → 又 0.5s。
       */
      function beginDwell(itemEl) {
        if (!itemEl || reducedMotion()) return;
        if (root && root.getAttribute("data-view-mode") === "list") return;
        if (el._tagInteract && el._tagInteract.dragged) return;

        if (el._hoverLeaveGraceTimer) {
          clearTimeout(el._hoverLeaveGraceTimer);
          el._hoverLeaveGraceTimer = null;
        }

        if (el._focusHold && el._hoverFocusItem === itemEl) {
          if (el._hoverSwitchTimer) {
            clearTimeout(el._hoverSwitchTimer);
            el._hoverSwitchTimer = null;
            el._hoverSwitchItem = null;
          }
          return;
        }

        if (el._hoverDwellItem === itemEl) {
          if (el._hoverSwitchTimer) {
            clearTimeout(el._hoverSwitchTimer);
            el._hoverSwitchTimer = null;
            el._hoverSwitchItem = null;
          }
          return;
        }

        // 墙内换到其他标签：标记走 1s，并 sticky 防密排布误扫
        if (el._hoverDwellItem || el._focusHold) {
          if (el._hoverSwitchItem === itemEl && el._hoverSwitchTimer) return;
          if (el._hoverSwitchTimer) {
            clearTimeout(el._hoverSwitchTimer);
            el._hoverSwitchTimer = null;
          }
          el._hoverSwitchItem = itemEl;
          el._hoverSwitchTimer = setTimeout(function () {
            el._hoverSwitchTimer = null;
            el._hoverSwitchItem = null;
            if (el._tagInteract && el._tagInteract.dragged) return;
            var p = el._hoverLastPointer;
            var under = p ? itemUnderPointer(p.x, p.y) : itemEl;
            if (under !== itemEl) return;
            el._hoverFastUsed = true;
            releaseFocus(false);
            startDwellTimers(itemEl);
          }, HOVER_SWITCH_STICKY_MS);
          return;
        }

        startDwellTimers(itemEl);
      }

      function scheduleLeaveReset() {
        // 标签间隙：只停当前计时/聚焦；不烧掉首次 0.5s（密排布抖空隙很常见）
        // 真正换签走 beginDwell sticky；整墙离开走 pointerleave → resetSession
        if (el._hoverSwitchTimer) {
          clearTimeout(el._hoverSwitchTimer);
          el._hoverSwitchTimer = null;
          el._hoverSwitchItem = null;
        }
        if (el._hoverLeaveGraceTimer) return;
        el._hoverLeaveGraceTimer = setTimeout(function () {
          el._hoverLeaveGraceTimer = null;
          releaseFocus(false);
        }, HOVER_LEAVE_GRACE_MS);
      }

      frame.addEventListener(
        "pointermove",
        function (ev) {
          el._hoverLastPointer = { x: ev.clientX, y: ev.clientY };
          if (el._tagInteract && el._tagInteract.dragged) return;
          var item = itemUnderPointer(ev.clientX, ev.clientY);
          if (item) beginDwell(item);
          else if (el._hoverDwellItem || el._focusHold) scheduleLeaveReset();
        },
        { passive: true },
      );

      frame.addEventListener(
        "pointerover",
        function (ev) {
          var t = ev.target;
          var item =
            t && t.closest ? t.closest(".tagcloud--item") : null;
          if (item && frame.contains(item)) beginDwell(item);
        },
        true,
      );

      // 整墙离开：下次再进恢复首次 0.5s
      frame.addEventListener("pointerleave", function () {
        if (el._hoverLeaveGraceTimer) {
          clearTimeout(el._hoverLeaveGraceTimer);
          el._hoverLeaveGraceTimer = null;
        }
        releaseFocus(true);
      });
    }

    function bindDragAndClick(el, root) {
      var frame =
        (root && root.querySelector("[data-tag-sphere-frame]")) || el;
      if (!frame) return;
      el._tagInteract = el._tagInteract || {
        suppressClick: false,
        dragged: false,
      };
      if (frame._tagSphereInteractBound) return;
      frame._tagSphereInteractBound = true;
      disarmNativeLinkDrag(frame);
      var pressed = false;
      var pointerId = null;
      var sx = 0;
      var sy = 0;

      function cloudBox() {
        return el.querySelector(".tagcloud") || el;
      }

      function onDown(ev) {
        if (ev.button != null && ev.button !== 0) return;
        if (root && root.getAttribute("data-view-mode") === "list") return;
        // 只记起点；超过 DRAG_PX 才 capture + 转球（轻点走原生链接）
        pressed = true;
        el._tagInteract.dragged = false;
        el._tagInteract.suppressClick = false;
        sx = ev.clientX;
        sy = ev.clientY;
        pointerId = ev.pointerId;
      }

      function onMove(ev) {
        if (!pressed) return;
        var dx = ev.clientX - sx;
        var dy = ev.clientY - sy;
        if (!el._tagInteract.dragged && dx * dx + dy * dy > DRAG_PX * DRAG_PX) {
          el._tagInteract.dragged = true;
          el._tagInteract.suppressClick = true;
          frame.classList.add("is-dragging");
          // 拖拽打断悬停聚焦
          clearHoverFocus(el);
          try {
            if (pointerId != null) frame.setPointerCapture(pointerId);
          } catch (e) {}
        }
        if (!el._tagInteract.dragged) return;
        if (ev.cancelable) ev.preventDefault();
        setDragSpeed(el._tagCloudInstance);
        applyPointerToInstance(
          el._tagCloudInstance,
          cloudBox(),
          ev.clientX,
          ev.clientY,
          DRAG_DIV,
        );
      }

      function onUp() {
        if (!pressed) return;
        pressed = false;
        if (pointerId != null) {
          try {
            if (frame.hasPointerCapture && frame.hasPointerCapture(pointerId)) {
              frame.releasePointerCapture(pointerId);
            }
          } catch (e) {}
          pointerId = null;
        }
        frame.classList.remove("is-dragging");
        setIdleSpeed(el._tagCloudInstance);
        if (el._tagInteract.suppressClick) {
          setTimeout(function () {
            el._tagInteract.suppressClick = false;
            el._tagInteract.dragged = false;
          }, 0);
        } else {
          el._tagInteract.dragged = false;
        }
      }

      frame.addEventListener("pointerdown", onDown);
      frame.addEventListener("pointermove", onMove, { passive: false });
      frame.addEventListener("pointerup", onUp);
      frame.addEventListener("pointercancel", onUp);

      // 拖过则禁止链接跳转；轻点走 <a> 原生
      frame.addEventListener(
        "click",
        function (ev) {
          if (
            !el._tagInteract.suppressClick &&
            !el._tagInteract.dragged
          ) {
            return;
          }
          ev.preventDefault();
          ev.stopPropagation();
        },
        true,
      );
    }

    function markReady(root, ready) {
      if (!root) return;
      root.setAttribute("data-ready", ready ? "1" : "0");
    }

    function bindMetricsAndVisibility(el, root) {
      if (!el) return;

      if (!window.__tagSphereResizeBound) {
        window.__tagSphereResizeBound = true;
        var resizeTimer = 0;
        function recacheAll() {
          var clouds = document.querySelectorAll(
            "[data-tag-chalk-sphere] .tag-sphere__cloud",
          );
          for (var i = 0; i < clouds.length; i++) {
            cacheItemMetrics(clouds[i]._tagCloudInstance);
          }
        }
        window.addEventListener("resize", function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(recacheAll, 120);
        });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(recacheAll).catch(function () {});
        }
      }

      if (!el._tagMetricsBound && typeof ResizeObserver !== "undefined") {
        el._tagMetricsBound = true;
        var roTimer = 0;
        var ro = new ResizeObserver(function () {
          clearTimeout(roTimer);
          roTimer = setTimeout(function () {
            cacheItemMetrics(el._tagCloudInstance);
          }, 80);
        });
        ro.observe(el);
        el._tagMetricsRo = ro;
      }

      if (el._tagVisBound) {
        el._tagVisRoot = root;
        if (el._tagVisSync) el._tagVisSync();
        return;
      }
      el._tagVisBound = true;
      el._tagVisIntersecting = true;
      el._tagVisRoot = root;

      el._tagVisSync = function () {
        var instance = el._tagCloudInstance;
        if (!instance) return;
        var host = el._tagVisRoot;
        var off =
          document.hidden ||
          el._tagVisIntersecting === false ||
          (host && host.getAttribute("data-view-mode") === "list");
        if (off) {
          if (el._focusHold) {
            el._skipResume = true;
            clearHoverFocus(el);
            el._skipResume = false;
          }
          if (el._focusRaf) {
            cancelAnimationFrame(el._focusRaf);
            el._focusRaf = 0;
          }
          stopTagCloudRaf(instance);
          return;
        }
        if (el._focusHold) {
          stopTagCloudRaf(instance);
          return;
        }
        startTagCloudRaf(instance);
        setIdleSpeed(instance);
      };

      document.addEventListener("visibilitychange", el._tagVisSync);

      if (typeof IntersectionObserver !== "undefined") {
        var io = new IntersectionObserver(
          function (entries) {
            var hit = false;
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isIntersecting) {
                hit = true;
                break;
              }
            }
            el._tagVisIntersecting = hit;
            el._tagVisSync();
          },
          { threshold: 0.01, rootMargin: "48px" },
        );
        var target =
          (root && root.querySelector("[data-tag-sphere-frame]")) || el;
        io.observe(target);
        el._tagVisIo = io;
      }

      el._tagVisSync();
    }

    function mountWith(el, nextItems, nextHrefMap, nextRadius) {
      if (!el) return;
      var root = el.closest("[data-tag-sphere], [data-tag-chalk-sphere]");
      var fallback = root && root.querySelector("[data-tag-chalk-fallback]");
      var normalized = normalizeItems(nextItems);
      var mode =
        (root && root.getAttribute("data-view-mode")) || "sphere";

      if (prefersStaticList() || !normalized.length) {
        destroyCloud(el);
        el._tagCloudInstance = null;
        el._sphereItemsKey = null;
        markReady(root, true);
        applyViewMode(root, "list");
        if (fallback) fallback.hidden = false;
        return;
      }

      // CDN 不可用时保持标签可访问，不能把组件留在 loading 空壳。
      if (!window.TagCloud) {
        destroyCloud(el);
        markReady(root, true);
        applyViewMode(root, "list");
        if (fallback) fallback.hidden = false;
        return;
      }

      // 列表模式：不挂球，只露列表
      if (mode === "list") {
        destroyCloud(el);
        el._tagCloudInstance = null;
        el._sphereItemsKey = null;
        markReady(root, true);
        applyViewMode(root, "list");
        return;
      }

      // 幂等：同一 el 已挂实例且标签数据未变 → 只恢复，不重建。
      // swup 导航的 page:view / contentReplaced 会双重触发 __remountTagChalkSphere。
      // 即便重建，keep:false 也让 mousemove 只绑在 $el（随容器销毁 GC），window 层不会累积监听。
      var r = Number(nextRadius) || 72;
      var key =
        normalized
          .map(function (it) {
            return it.name + "\x01" + it.kind;
          })
          .join("|") + "@" + r;
      var existing = el._tagCloudInstance;
      if (
        existing &&
        el._sphereItemsKey === key &&
        existing.$el &&
        document.documentElement.contains(existing.$el)
      ) {
        patchTagCloudNext(existing);
        cacheItemMetrics(existing);
        syncTagCloudStyles(existing);
        bindMetricsAndVisibility(el, root);
        setIdleSpeed(existing);
        if (fallback) fallback.hidden = true;
        markReady(root, true);
        applyViewMode(root, "sphere");
        return;
      }
      destroyCloud(el);
      // destroyCloud 会清键；销毁完成后再记录，双 page:view 才能命中幂等路径。
      el._sphereItemsKey = key;

      var htmlItems = toHtmlItems(normalized, nextHrefMap);
      var instance = window.TagCloud("#" + el.id, htmlItems, {
        radius: r,
        maxSpeed: "slow",
        initSpeed: "slow",
        direction: 135,
        // keep:false —— TagCloud._init 把 mousemove 绑到 $el（而非 window）：
        // 每跳重建的新实例不再向 window 累积 mousemove 监听，旧容器销毁时监听随元素一并 GC。
        keep: false,
        useHTML: true,
      });
      el._tagCloudInstance = instance || null;
      setIdleSpeed(instance);

      el._tagCloudDestroy = function () {
        el._skipResume = true;
        clearHoverFocus(el);
        el._skipResume = false;
        if (el._tagColorWatch) {
          cancelAnimationFrame(el._tagColorWatch);
          el._tagColorWatch = 0;
        }
        el._tagCloudInstance = null;
        el._sphereItemsKey = null;
        stopTagCloudRaf(instance);
        if (instance && typeof instance.destroy === "function") {
          instance.destroy();
        }
      };

      var links = el.querySelectorAll("a.tag-sphere__link--primary");
      for (var li = 0; li < links.length; li++) {
        links[li].setAttribute("draggable", "false");
      }

      patchTagCloudNext(instance);
      cacheItemMetrics(instance);
      syncTagCloudStyles(instance);
      // mount 后最多 1 帧：等布局稳定再量一次宽高（不再常驻 rAF 抢写 opacity）
      el._tagColorWatch = requestAnimationFrame(function () {
        el._tagColorWatch = 0;
        cacheItemMetrics(el._tagCloudInstance);
      });

      var d = r * 2 + "px";
      el.style.width = d;
      el.style.height = d;
      el.style.margin = "0 auto";
      el.style.position = "relative";
      el.style.left = "0";
      el.style.right = "0";
      el.style.display = "block";
      if (root) root.style.setProperty("--tag-sphere-d", d);

      bindDragAndClick(el, root);
      bindHoverFocus(el, root);
      bindMetricsAndVisibility(el, root);
      if (fallback) fallback.hidden = true;
      markReady(root, true);
      applyViewMode(root, "sphere");
    }

    // 软导航后原 root 可能被 swup 替换（新 DOM 的 cloudId 是新随机值）：按结构
    // 特征重找当前实例并同步闭包数据，避免 boot 永远拿着首屏快照找旧 id 而挂死
    function resolveCloud() {
      var el = cloudId ? document.getElementById(cloudId) : null;
      if (!el) {
        el = document.querySelector("[data-tag-chalk-sphere] .tag-sphere__cloud");
        if (!el) return null;
        var root = el.closest("[data-tag-chalk-sphere]");
        if (el.id) cloudId = el.id;
        if (root) {
          radius = parseInt(root.getAttribute("data-radius") || String(radius), 10);
          hrefByName = readJson(root, "data-href-map", hrefByName);
          sphereItems = readJson(root, "data-sphere-items", sphereItems);
        }
      }
      return el;
    }

    function mount() {
      var el = resolveCloud();
      if (!el) return;
      var root = el.closest("[data-tag-sphere], [data-tag-chalk-sphere]");
      markReady(root, false);
      mountWith(el, sphereItems, hrefByName, radius);
    }

    function boot() {
      var el = resolveCloud();
      var root = el && el.closest("[data-tag-sphere], [data-tag-chalk-sphere]");
      if (prefersStaticList()) {
        markReady(root, true);
        applyViewMode(root, "list");
        return;
      }
      loadTagCloud(mount);
    }

    window.__remountTagChalkSphere = function (id, nextItems) {
      var el = document.getElementById(id);
      if (!el) return;
      var root = el.closest("[data-tag-sphere], [data-tag-chalk-sphere]");
      var r = Number((root && root.getAttribute("data-radius")) || radius);
      var map = hrefByName;
      try {
        var raw = root && root.getAttribute("data-href-map");
        if (raw) map = JSON.parse(raw);
      } catch (e) {}
      markReady(root, false);
      if (prefersStaticList() || (root && root.getAttribute("data-view-mode") === "list")) {
        mountWith(el, nextItems, map, r);
        return;
      }
      loadTagCloud(function () {
        mountWith(el, nextItems, map, r);
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }

    // 离页清理：销毁容器已不在文档中的 TagCloud 实例（上一页遗留）。
    // TagCloud.destroy() 不取消 RAF 循环；keep:false 虽已把 mousemove 收进 $el，
    // 但放任 RAF 会让旧实例永久空转、整棵实例（含 $el 与元素级监听）无法被 GC，故仍先 cancel。
    function sweepOrphanTagClouds() {
      var tc = window.TagCloud;
      if (!tc || !tc.list || !tc.list.length) return;
      for (var i = tc.list.length - 1; i >= 0; i--) {
        var entry = tc.list[i];
        var container = entry && entry.container;
        var inst = entry && entry.instance;
        if (!container || !inst) continue;
        if (document.documentElement.contains(container)) continue;
        if (inst.interval && typeof inst.interval.value === "number") {
          try {
            cancelAnimationFrame(inst.interval.value);
          } catch (e) {}
          inst.interval = null;
        }
        try {
          inst.destroy();
        } catch (e) {}
      }
    }

    // 跨页重挂 / 切换视图的事件只绑一次：左栏与 /tags/ 各有一份实例，防 swup 监听累积
    if (!window.__tagChalkSphereBound) {
      window.__tagChalkSphereBound = true;
      document.addEventListener("swup:page:view", function () {
        // 等本轮 page:view 同步处理器（各组件重挂）跑完再清离页实例，避免误杀刚挂上的
        setTimeout(sweepOrphanTagClouds, 0);
        boot();
      });
      document.addEventListener("swup:enable", function () {
        if (window.swup && window.swup.hooks) {
          window.swup.hooks.on("page:view", function () {
            setTimeout(sweepOrphanTagClouds, 0);
            boot();
          });
        }
      });
    }
    })();
  });
})();
