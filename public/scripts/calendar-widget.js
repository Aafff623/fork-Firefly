/* calendar-widget — extracted from Calendar.astro; config via #calendar-widget-boot[data-config] */
(function () {
  if (window.__calendarWidgetScriptLoaded) return;
  window.__calendarWidgetScriptLoaded = true;
  var __cfg = {};
  var bootEl = document.getElementById("calendar-widget-boot");
  var rawCfg = bootEl && bootEl.getAttribute("data-config");
  if (rawCfg) {
    try {
      __cfg = JSON.parse(rawCfg) || {};
    } catch (e) {
      __cfg = {};
    }
  }
  var monthNames = __cfg.monthNames;
  var yearText = __cfg.yearText;
  var currentLang = __cfg.currentLang;
  var calendarDataUrl = __cfg.calendarDataUrl;
  var postUrlPrefix = __cfg.postUrlPrefix;
  var heatmapWeekTemplate = __cfg.heatmapWeekTemplate;
  var holidayMap = __cfg.holidayMap;

  // State variables
  let displayYear = new Date().getFullYear();
  let displayMonth = new Date().getMonth();
  let currentView = 'day'; // 'day' | 'month' | 'year'
  let postDateMap = {};
  let allPostsData = [];
  let availableYears = [];

  /** 封面 GIF：可靠显示 + 按需预取轮询（侧栏常驻，Swup 不重建 DOM） */
  function initCalendarCoverRotate() {
    const cover = document.querySelector(".calendar-shell .calendar-cover");
    const media = cover && cover.querySelector(".calendar-cover-media");
    if (!cover || !media) return;

    const img = media.querySelector(".calendar-cover-img");
    if (!img) return;

    let gifs = [];
    try {
      gifs = JSON.parse(cover.getAttribute("data-cover-gifs") || "[]");
    } catch {
      gifs = [];
    }
    gifs = (Array.isArray(gifs) ? gifs : [])
      .map(function (u) { return String(u || "").trim(); })
      .filter(Boolean);
    if (!gifs.length) {
      gifs = ["/assets/images/widgets/calendar/voxel/rose-cat-gardener.gif"];
    }

    function stillUrl(url) {
      return String(url).replace(/\.gif(\?.*)?$/i, ".webp$1");
    }

    const reduceMotion = Boolean(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    if (reduceMotion) {
      const still = stillUrl(gifs[0]);
      if (img.getAttribute("src") !== still) {
        img.setAttribute("src", still);
      }
      return;
    }

    const cache = window.__calendarGifCache || (window.__calendarGifCache = Object.create(null));
    const FAIL_MARK = "__fail";

    function absoluteUrl(path) {
      try {
        return new URL(path, window.location.origin).href;
      } catch {
        return path;
      }
    }

    function preload(url) {
      const key = absoluteUrl(url);
      if (cache[key] === FAIL_MARK) return Promise.reject(new Error("cached-fail"));
      if (cache[key] === true) return Promise.resolve(url);
      if (cache[key] && typeof cache[key].then === "function") return cache[key];

      cache[key] = new Promise(function (resolve, reject) {
        const probe = new Image();
        let tries = 0;
        function attempt() {
          tries += 1;
          probe.onload = function () {
            cache[key] = true;
            resolve(url);
          };
          probe.onerror = function () {
            if (tries < 2) {
              // 失败重试一次（带 cache-bust），避免偶发网络抖动
              window.setTimeout(function () {
                probe.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "_r=" + tries;
              }, 120);
              return;
            }
            cache[key] = FAIL_MARK;
            reject(new Error("gif-load-fail"));
          };
          probe.decoding = "async";
          probe.fetchPriority = tries === 1 ? "high" : "low";
          probe.src = tries === 1 ? url : url + (url.indexOf("?") >= 0 ? "&" : "?") + "_r=" + tries;
        }
        attempt();
      });
      return cache[key];
    }

    function applyUrl(url) {
      if (img.getAttribute("src") !== url) {
        img.setAttribute("src", url);
      }
    }

    function stillUrl(url) {
      return String(url).replace(/\.gif(\?.*)?$/i, ".webp$1");
    }

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyUrl(stillUrl(gifs[0]));
      return;
    }

    /** 会话期预热上限：单页最多请求 N 张不同 GIF，达到后仅在本已缓存集合内轮换 */
    const WARM_LIMIT = 3;
    function warmPreload(url) {
      const key = absoluteUrl(url);
      const status = cache[key];
      if (status === true) return Promise.resolve(url);
      if (status === FAIL_MARK) return Promise.reject(new Error("cached-fail"));
      if (status && typeof status.then === "function") return status;
      const used = window.__calendarRotateCount || 0;
      if (used >= WARM_LIMIT) {
        return Promise.reject(new Error("cap-reached"));
      }
      window.__calendarRotateCount = used + 1;
      return preload(url);
    }

    /** 从 fromIdx 起找下一张已成功缓存（可立即显示）的 GIF */
    function findNextCached(fromIdx) {
      for (let i = 0; i < gifs.length; i++) {
        const idx2 = (fromIdx + i) % gifs.length;
        if (cache[absoluteUrl(gifs[idx2])] === true) return idx2;
      }
      return -1;
    }

    // Swup 后侧栏 DOM 常驻：已绑定则只确保首帧仍在显示，并预热下一张
    if (media.dataset.coverRotateBound === "1") {
      const cur = img.getAttribute("src") || gifs[0];
      if (!cur || !img.complete || img.naturalWidth === 0) {
        warmPreload(gifs[0]).then(function () { applyUrl(gifs[0]); }).catch(function () {});
      } else {
        applyUrl(cur);
      }
      const nextIdx = (Number(media.dataset.coverIdx || 0) + 1) % gifs.length;
      warmPreload(gifs[nextIdx]).catch(function () {});
      return;
    }
    media.dataset.coverRotateBound = "1";
    media.dataset.coverIdx = "0";

    const intervalMs = Math.max(
      2500,
      Number(cover.getAttribute("data-cover-interval-ms") || 4500) || 4500,
    );
    let idx = 0;
    let switching = false;
    let primed = false;
    let inView = false;
    let interactionPaused = false;

    // 首帧：HTML 已写 src；首次进入视口才预热，失败则换下一张
    function primeFirstFrames() {
      if (primed) return;
      primed = true;
      warmPreload(gifs[0])
        .then(function () { applyUrl(gifs[0]); })
        .catch(function () {
          // 跳过坏链，找第一张可用
          (function tryNext(i) {
            if (i >= gifs.length) return;
            warmPreload(gifs[i])
              .then(function () {
                idx = i;
                media.dataset.coverIdx = String(i);
                applyUrl(gifs[i]);
              })
              .catch(function () { tryNext(i + 1); });
          })(1);
        });

      if (gifs.length >= 2) {
        warmPreload(gifs[1]).catch(function () {});
      }
    }

    function startTimer() {
      if (gifs.length < 2) return;
      if (window.__calendarCoverRotateTimer) {
        clearInterval(window.__calendarCoverRotateTimer);
      }
      if (!inView || interactionPaused) return;
      window.__calendarCoverRotateTimer = setInterval(function () {
        if (switching) return;
        // 离屏不轮询，省带宽/解码
        if (document.hidden) return;
        const next = (idx + 1) % gifs.length;
        const url = gifs[next];
        if (cache[absoluteUrl(url)] === FAIL_MARK) {
          idx = next;
          media.dataset.coverIdx = String(idx);
          return;
        }
        switching = true;
        warmPreload(url)
          .then(function () {
            // 已缓存再换：禁止先淡出到透明（会露出红底占位）
            idx = next;
            media.dataset.coverIdx = String(idx);
            applyUrl(url);
            switching = false;
            const ahead = gifs[(idx + 1) % gifs.length];
            warmPreload(ahead).catch(function () {});
          })
          .catch(function (err) {
            switching = false;
            if (err && err.message === "cap-reached") {
              // 预热上限已到：回退到本已缓存集合内轮换，不再发起新请求
              const cachedIdx = findNextCached(next);
              if (cachedIdx >= 0 && cachedIdx !== idx) {
                idx = cachedIdx;
                media.dataset.coverIdx = String(idx);
                applyUrl(gifs[cachedIdx]);
              } else {
                idx = next;
                media.dataset.coverIdx = String(idx);
              }
            } else {
              idx = next;
              media.dataset.coverIdx = String(idx);
            }
          });
      }, intervalMs);
    }

    function enterView() {
      inView = true;
      primeFirstFrames();
      startTimer();
    }

    function leaveView() {
      inView = false;
      if (window.__calendarCoverRotateTimer) {
        clearInterval(window.__calendarCoverRotateTimer);
        window.__calendarCoverRotateTimer = null;
      }
    }

    function pauseForInteraction() {
      interactionPaused = true;
      if (window.__calendarCoverRotateTimer) {
        clearInterval(window.__calendarCoverRotateTimer);
        window.__calendarCoverRotateTimer = null;
      }
    }

    function resumeAfterInteraction() {
      interactionPaused = false;
      startTimer();
    }

    // 自动轮播在悬停或键盘焦点进入时暂停，避免内容在阅读/操作中切换。
    cover.addEventListener("mouseenter", pauseForInteraction);
    cover.addEventListener("mouseleave", resumeAfterInteraction);
    cover.addEventListener("focusin", pauseForInteraction);
    cover.addEventListener("focusout", function (event) {
      if (!cover.contains(event.relatedTarget)) resumeAfterInteraction();
    });

    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            enterView();
          } else {
            leaveView();
          }
        });
      }, { rootMargin: "100px" });
      observer.observe(cover);
    } else {
      // 降级：无 IntersectionObserver（旧浏览器）照旧立即预热 + 轮询
      enterView();
    }
  }

  async function fetchData() {
    try {
      // 使用缓存避免 swup 导航时重复请求
      if (window.__allPostMetaCache) {
        allPostsData = window.__allPostMetaCache;
      } else {
        const response = await fetch(calendarDataUrl);
        allPostsData = await response.json();
        window.__allPostMetaCache = allPostsData;
      }
      
      // Reconstruct postDateMap and availableYears
      postDateMap = {};
      const yearsSet = new Set();
      allPostsData.forEach(post => {
        const date = new Date(post.published);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        if (!postDateMap[dateKey]) {
          postDateMap[dateKey] = [];
        }
        postDateMap[dateKey].push({ id: post.id, title: post.title, published: post.published });
        yearsSet.add(date.getFullYear());
      });
      
      availableYears = Array.from(yearsSet).sort((a, b) => b - a);
      
      renderCalendar();
    } catch (error) {
      console.error("Failed to fetch calendar data", error);
    }
  }

  let snakeRaf = 0;
  let snakeTimer = 0;
  let snakePaused = false;
  let snakeOnResize = null;

  function stopHeatmapSnake() {
    if (snakeRaf) cancelAnimationFrame(snakeRaf);
    snakeRaf = 0;
    if (snakeTimer) clearTimeout(snakeTimer);
    snakeTimer = 0;
    if (snakeOnResize) {
      window.removeEventListener('resize', snakeOnResize);
      snakeOnResize = null;
    }
    const canvas = document.getElementById('heatmap-snake');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.opacity = '0';
    }
  }

  /**
   * 空闲贪吃蛇：视觉对齐 Platane/snk（自实现，不拷源码）
   * - 蛇：头大尾小；同一时刻整条同色相（赤橙黄绿青蓝紫轮换）
   * - 每 3.5s 进下一色；第 3s 起从尾→头错开过渡
   * - 步进：drawSnakeLerp 式错位插值，整条贴格滑动
   */
  function startHeatmapSnake(gridEl) {
    stopHeatmapSnake();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('heatmap-snake');
    const wrap = gridEl?.parentElement;
    if (!canvas || !wrap || !gridEl) return;

    const cells = [...gridEl.querySelectorAll('.heatmap-cell')];
    if (!cells.length) return;

    // snk basePalettes.github-light / github-dark
    const isDark = () => document.documentElement.classList.contains('dark');
    const DOT_EATEN_LIGHT = '#9be9a8';
    const DOT_EATEN_DARK = '#0f6d31';

    const COLS = 12;
    const ROWS = 4;
    const SNAKE_LEN = 4; // snk 演示常见短蛇
    const STEP_MS = 280; // 一格时长（略慢于 snk 默认观感，侧栏更从容）
    // 赤橙黄绿青蓝紫；稳色至 3s，3→3.5s 尾→头错开过渡
    const RAINBOW_HUES = [0, 30, 55, 130, 185, 220, 280];
    const COLOR_CYCLE_MS = 3500;
    const TRANSITION_MS = 500; // 从第 3s 起过渡（3500 - 500）

    let dpr = 1;
    let rects = [];
    let emptySet = new Set();

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
      }
      const wrapRect = wrap.getBoundingClientRect();
      rects = cells.map((cell) => {
        const cr = cell.getBoundingClientRect();
        return {
          x: (cr.left - wrapRect.left) * dpr,
          y: (cr.top - wrapRect.top) * dpr,
          w: Math.max(1, cr.width * dpr),
          h: Math.max(1, cr.height * dpr),
          empty: cell.getAttribute('data-level') === '0',
        };
      });
      emptySet = new Set(rects.map((p, i) => (p.empty ? i : -1)).filter((i) => i >= 0));
    };

    measure();
    if (emptySet.size < 6) return;

    snakeOnResize = () => measure();
    window.addEventListener('resize', snakeOnResize, { passive: true });

    const idxOf = (c, r) => r * COLS + c;
    const cellOf = (i) => ({ c: i % COLS, r: Math.floor(i / COLS) });

    const neighbors = (idx, avoid) => {
      const { c, r } = cellOf(idx);
      const out = [];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return;
        const ni = idxOf(nc, nr);
        if (!emptySet.has(ni)) return;
        if (avoid?.has(ni)) return;
        out.push(ni);
      });
      return out;
    };

    const pickNextWander = (head, dir, bodySet, recent, stepsStraight, turnAfter) => {
      const opts = neighbors(head, bodySet);
      if (!opts.length) return null;
      const { c, r } = cellOf(head);
      const forceTurn = stepsStraight >= turnAfter;
      const scored = opts.map((ni) => {
        const n = cellOf(ni);
        const dc = n.c - c;
        const dr = n.r - r;
        const isStraight = dc === dir.dc && dr === dir.dr;
        const isReverse = dc === -dir.dc && dr === -dir.dr;
        let score = Math.random();
        if (isStraight) score += forceTurn ? -1.4 : 0.45;
        else score += forceTurn ? 1.1 : 0.55;
        if (isReverse) score -= 2.5;
        score -= (recent.get(ni) || 0) * 0.85;
        score += neighbors(ni, bodySet).filter((x) => x !== head).length * 0.35;
        return { ni, score, dc, dr };
      });
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, Math.min(3, scored.length));
      const weights = top.map((item, i) => Math.max(0.05, item.score + 2) * (1.2 - i * 0.25));
      let sum = weights.reduce((a, b) => a + b, 0);
      let rpick = Math.random() * sum;
      for (let i = 0; i < top.length; i++) {
        rpick -= weights[i];
        if (rpick <= 0) return top[i];
      }
      return top[0];
    };

    const roundRect = (ctx, x, y, w, h, rad) => {
      const rr = Math.min(rad, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    const lerp = (k, a, b) => (1 - k) * a + k * b;
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

    /** hsl(0–360,0–1,0–1) → {r,g,b} 0–255 */
    const hslToRgb = (h, s, l) => {
      const hue = ((h % 360) + 360) % 360;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = l - c / 2;
      let rp = 0, gp = 0, bp = 0;
      if (hue < 60) [rp, gp, bp] = [c, x, 0];
      else if (hue < 120) [rp, gp, bp] = [x, c, 0];
      else if (hue < 180) [rp, gp, bp] = [0, c, x];
      else if (hue < 240) [rp, gp, bp] = [0, x, c];
      else if (hue < 300) [rp, gp, bp] = [x, 0, c];
      else [rp, gp, bp] = [c, 0, x];
      return {
        r: Math.round((rp + m) * 255),
        g: Math.round((gp + m) * 255),
        b: Math.round((bp + m) * 255),
      };
    };

    /** 当前节的色相：稳色期内整条同色；过渡期尾先、头后错开混到下一色 */
    const hueForSegment = (segT, nowMs) => {
      const cycle = ((nowMs % COLOR_CYCLE_MS) + COLOR_CYCLE_MS) % COLOR_CYCLE_MS;
      const idx = Math.floor(nowMs / COLOR_CYCLE_MS) % RAINBOW_HUES.length;
      const next = (idx + 1) % RAINBOW_HUES.length;
      const h0 = RAINBOW_HUES[idx];
      const h1 = RAINBOW_HUES[next];
      const transStart = COLOR_CYCLE_MS - TRANSITION_MS;
      if (cycle < transStart) return h0;
      // p: 0→1 覆盖最后 1s；尾(segT=1)先混，头(segT=0)后混
      const p = (cycle - transStart) / TRANSITION_MS;
      const mix = clamp((p - (1 - segT) * 0.72) / 0.28, 0, 1);
      // 最短弧插值，避免跨 0° 时绕远
      let d = ((h1 - h0 + 540) % 360) - 180;
      return (h0 + d * mix + 360) % 360;
    };

    /** snk drawSnakeLerp：各节错位插值；尾→头绘制；同色相深浅区分头尾 */
    const drawSnakeLerp = (ctx, snake0, snake1, k, nowMs) => {
      const n = snake0.length;
      const m = 0.8; // snk 同款窗口
      const dark = isDark();
      const sat = dark ? 0.8 : 0.74;
      const litHead = dark ? 0.58 : 0.46;
      const litTail = dark ? 0.7 : 0.6;
      // 先画尾再画头，避免浅色盖住深色
      for (let i = n - 1; i >= 0; i--) {
        const a = (1 - m) * (i / Math.max(n - 1, 1));
        const ki = clamp((k - a) / m, 0, 1);
        const i0 = snake0[i];
        const i1 = snake1[i] ?? snake1[snake1.length - 1];
        const r0 = rects[i0];
        const r1 = rects[i1];
        if (!r0 || !r1) continue;

        const x = lerp(ki, r0.x, r1.x);
        const y = lerp(ki, r0.y, r1.y);
        const w = lerp(ki, r0.w, r1.w);
        const h = lerp(ki, r0.h, r1.h);

        // snk：头接近 cell，尾略缩（u 随节序增大）
        const u = (i + 1) * 0.6 * (Math.min(w, h) / 16);
        const pad = Math.min(u, w * 0.22);
        const sw = w - pad * 2;
        const sh = h - pad * 2;
        const rad = Math.min(sw, sh) * 0.25;

        const t = n <= 1 ? 0 : i / (n - 1); // 0=头 … 1=尾
        const hue = hueForSegment(t, nowMs);
        const lit = lerp(t, litHead, litTail);
        const { r: cr, g: cg, b: cb } = hslToRgb(hue, sat, lit);
        const ca = lerp(t, 1, 0.52);

        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${ca})`;
        roundRect(ctx, x + pad, y + pad, sw, sh, rad);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    snakeTimer = window.setTimeout(() => {
      if (snakePaused) return;
      measure();
      if (emptySet.size < 6) return;
      canvas.style.opacity = '1';

      let head = [...emptySet][Math.floor(Math.random() * emptySet.size)];
      let body = [head]; // 头在 [0]
      let dir = { dc: 1, dr: 0 };
      let growing = true;
      let stepsStraight = 0;
      let turnAfter = 2 + Math.floor(Math.random() * 3);
      const recent = new Map();
      /** 被吃掉后短暂显示的绿点（canvas 层，不改 DOM level） */
      const eaten = new Map();
      let snake0 = [head];
      let snake1 = [head];
      let stepStart = performance.now();
      let lastTs = stepStart;

      const bodyAvoid = () => {
        const set = new Set(body);
        if (!growing && body.length >= SNAKE_LEN) set.delete(body[body.length - 1]);
        return set;
      };

      const restart = () => {
        const cold = [...emptySet].sort((a, b) => (recent.get(a) || 0) - (recent.get(b) || 0));
        head = cold[Math.floor(Math.random() * Math.min(8, cold.length))];
        body = [head];
        snake0 = [head];
        snake1 = [head];
        growing = true;
        stepsStraight = 0;
        turnAfter = 2 + Math.floor(Math.random() * 3);
        dir = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }][Math.floor(Math.random() * 4)];
      };

      const advance = () => {
        const pick = pickNextWander(head, dir, bodyAvoid(), recent, stepsStraight, turnAfter);
        if (!pick) {
          restart();
          return;
        }
        const wasStraight = pick.dc === dir.dc && pick.dr === dir.dr;
        stepsStraight = wasStraight ? stepsStraight + 1 : 0;
        if (!wasStraight) turnAfter = 2 + Math.floor(Math.random() * 3);
        dir = { dc: pick.dc, dr: pick.dr };

        snake0 = body.slice();
        head = pick.ni;
        body = [head, ...body];
        if (!(growing && body.length < SNAKE_LEN)) {
          growing = false;
          if (body.length > SNAKE_LEN) body.pop();
        }
        snake1 = body.slice();

        eaten.set(head, 1);
        recent.set(head, Math.min(3, (recent.get(head) || 0) + 1.2));
      };

      // 先走一步，避免静止
      advance();

      const tick = (now) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;

        if (!snakePaused) {
          let k = (now - stepStart) / STEP_MS;
          while (k >= 1) {
            stepStart += STEP_MS;
            advance();
            k = (now - stepStart) / STEP_MS;
            if (k > 8) {
              stepStart = now;
              k = 0;
              break;
            }
          }

          for (const [key, v] of [...recent.entries()]) {
            const nv = v - dt * 0.35;
            if (nv <= 0.05) recent.delete(key);
            else recent.set(key, nv);
          }
          for (const [key, v] of [...eaten.entries()]) {
            const nv = v - dt * 0.55;
            if (nv <= 0 || body.includes(key)) eaten.delete(key);
            else eaten.set(key, nv);
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 吃过的格：盖一层 snk 浅绿点（与格子同形）
        const dark = isDark();
        const eatenFill = dark ? DOT_EATEN_DARK : DOT_EATEN_LIGHT;
        for (const [idx, life] of eaten) {
          if (body.includes(idx) || snake1.includes(idx)) continue;
          const rc = rects[idx];
          if (!rc) continue;
          const inset = Math.min(rc.w, rc.h) * 0.08;
          ctx.globalAlpha = 0.35 + life * 0.55;
          ctx.fillStyle = eatenFill;
          roundRect(ctx, rc.x + inset, rc.y + inset, rc.w - inset * 2, rc.h - inset * 2, Math.min(rc.w, rc.h) * 0.22);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        const k = snakePaused ? clamp((now - stepStart) / STEP_MS, 0, 1) : clamp((now - stepStart) / STEP_MS, 0, 1);
        // 对齐长度：短的一侧 pad 尾
        const a = snake0.slice();
        const b = snake1.slice();
        while (a.length < b.length) a.push(a[a.length - 1]);
        while (b.length < a.length) b.push(b[b.length - 1]);
        while (a.length < SNAKE_LEN) {
          a.push(a[a.length - 1]);
          b.push(b[b.length - 1]);
        }

        drawSnakeLerp(ctx, a, b, k, now);

        snakeRaf = requestAnimationFrame(tick);
      };

      snakeRaf = requestAnimationFrame(tick);
    }, 600);
  }

  function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    const monthsEl = document.getElementById('heatmap-months');
    const gridEl = document.getElementById('heatmap-grid');
    if (!container || !monthsEl || !gridEl) return;

    // Show heatmap only in day view
    container.style.display = currentView === 'day' ? 'block' : 'none';
    if (currentView !== 'day') {
      stopHeatmapSnake();
      return;
    }

    // Render month labels (numbers 1-12)
    monthsEl.innerHTML = Array.from({length: 12}, (_, i) =>
      `<span class="heatmap-month-label">${i + 1}</span>`
    ).join('');

    // 按「月 × 月内周桶」聚合：当天发文 +1 贡献（贴合卡片 12×4，非整年 53 周）
    const heatmapData = Array.from({ length: 12 }, () => [0, 0, 0, 0]);
    allPostsData.forEach(post => {
      const date = new Date(post.published);
      if (date.getFullYear() !== displayYear) return;
      const month = date.getMonth();
      const day = date.getDate();
      const week = Math.min(Math.floor((day - 1) / 7), 3); // 0-3
      heatmapData[month][week]++;
    });

    /** 贡献浓度：0=无；有则按篇数门槛 2 / 7 / 10 / 20 进 1–4 档 */
    const contribLevel = (count) => {
      if (count >= 20) return 4;
      if (count >= 10) return 3;
      if (count >= 7) return 2;
      if (count >= 2) return 1;
      return 0;
    };

    let cellsHtml = '';
    for (let week = 0; week < 4; week++) {
      for (let month = 0; month < 12; month++) {
        const count = heatmapData[month][week];
        const level = contribLevel(count);
        const tooltip = heatmapWeekTemplate
          .replace('{month}', month + 1)
          .replace('{week}', week + 1)
          .replace('{count}', count);
        cellsHtml += `<div class="heatmap-cell level-${level}" data-level="${level}" data-tooltip="${tooltip}" data-month="${month}" data-count="${count}"></div>`;
      }
    }
    gridEl.innerHTML = cellsHtml;

    // Click on cell to navigate to that month
    gridEl.querySelectorAll('.heatmap-cell[data-month]').forEach(cell => {
      cell.addEventListener('click', () => {
        const m = parseInt(cell.getAttribute('data-month'));
        displayMonth = m;
        currentView = 'day';
        renderCalendar();
      });
    });

    // 热力图提示框 (fixed 定位，不被父容器裁剪)
    let tooltipEl = document.getElementById('heatmap-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'heatmap-tooltip';
      Object.assign(tooltipEl.style, {
        position: 'fixed',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        lineHeight: '1.2',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.15s ease',
        zIndex: '9999',
        whiteSpace: 'nowrap',
      });
      document.body.appendChild(tooltipEl);
    }
    gridEl.querySelectorAll('.heatmap-cell[data-tooltip]').forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        snakePaused = true;
        tooltipEl.textContent = cell.getAttribute('data-tooltip');
        tooltipEl.style.opacity = '1';
        const rect = cell.getBoundingClientRect();
        tooltipEl.style.left = rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2 + 'px';
        tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 6 + 'px';
      });
      cell.addEventListener('mouseleave', () => {
        snakePaused = false;
        tooltipEl.style.opacity = '0';
      });
    });

    // 空闲紫蛇：在空格上爬（有绿贡献也播；空格太少时 start 内自行 return）
    startHeatmapSnake(gridEl);
  }

  // 客户端动态渲染日历
  function renderCalendar() {
    const container = document.getElementById('calendar-view-container');
    const monthContainer = document.getElementById('month-view-container');
    const yearContainer = document.getElementById('year-view-container');
    const postsContainer = document.getElementById('calendar-posts');
    
    // Update visibility
    if (container) container.style.display = currentView === 'day' ? 'block' : 'none';
    if (monthContainer) monthContainer.style.display = currentView === 'month' ? 'grid' : 'none';
    if (yearContainer) yearContainer.style.display = currentView === 'year' ? 'grid' : 'none';
    // 常驻文章列表已迁至左侧「灯下常读」；仅点选有文日期时展开
    if (postsContainer && currentView !== 'day') postsContainer.style.display = 'none';

    updateHeader();

    if (currentView === 'day') {
      renderDayView();
    } else if (currentView === 'month') {
      renderMonthView();
    } else if (currentView === 'year') {
      renderYearView();
    }

    renderHeatmap();
  }

  function updateHeader() {
    const navDisplay = document.getElementById('current-month-display');
    const resetBtn = document.getElementById('reset-month-btn');
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    const coverDay = document.getElementById('calendar-cover-day');
    const coverMonth = document.getElementById('calendar-cover-month');
    const now = new Date();
    const isCurrentMonth = displayYear === now.getFullYear() && displayMonth === now.getMonth();
    
    if (navDisplay) {
      if (currentView === 'day') {
        if (currentLang.startsWith('zh') || currentLang.startsWith('ja')) {
            navDisplay.textContent = `${displayYear}${yearText}${monthNames[displayMonth]}`;
        } else {
            navDisplay.textContent = `${monthNames[displayMonth]} ${displayYear}`;
        }
      } else if (currentView === 'month') {
        navDisplay.textContent = `${displayYear}${yearText}`;
      } else if (currentView === 'year') {
        navDisplay.textContent = yearText;
      }
    }

    // 封面大号数字：当月显示「今天」；翻到其他月则显示月序（对照 demo 大号数字气质）
    if (coverDay) {
      if (currentView === 'year') {
        coverDay.textContent = String(displayYear).slice(-2);
      } else if (currentView === 'month') {
        coverDay.textContent = String(displayYear).slice(-2);
      } else {
        coverDay.textContent = String(isCurrentMonth ? now.getDate() : displayMonth + 1);
      }
    }
    if (coverMonth) {
      const monthLabel = monthNames[displayMonth] || '';
      coverMonth.textContent = currentView === 'year' ? yearText : monthLabel.toLowerCase();
    }

    if (resetBtn) {
      const isCurrent = isCurrentMonth;
      resetBtn.style.display = (currentView === 'day' && isCurrent) ? 'none' : 'flex';
    }
    
    // Hide prev/next buttons in year view as we show all years
    if (prevBtn) prevBtn.style.visibility = currentView === 'year' ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.style.visibility = currentView === 'year' ? 'hidden' : 'visible';
  }

  function renderDayView() {
    const now = new Date();
    const currentYear = displayYear;
    const currentMonth = displayMonth;
    const currentDate = now.getDate();
    const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();
    
    // 获取月份的第一天是星期几
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 生成日历格子
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    
    const calendarDays = [];
    
    // 添加空白格子（月初空白）
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: null, hasPost: false, count: 0, dateKey: "" });
    }
    
    // 添加每一天
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const posts = postDateMap[dateKey] || [];
      const count = posts.length;
      calendarDays.push({
        day,
        hasPost: count > 0,
        count,
        dateKey
      });
    }
    
    // 渲染日历格子
    calendarGrid.innerHTML = calendarDays.map(({day, hasPost, count, dateKey}) => {
      const isToday = day === currentDate && isCurrentMonth;
      const holiday = (holidayMap && dateKey && holidayMap[dateKey]) || null;
      const hasHoliday = !!(holiday && ((holiday.cn && holiday.cn.length) || (holiday.intl && holiday.intl.length)));
      const classes = [
        "calendar-day aspect-square flex items-center justify-center rounded-sm text-sm relative cursor-pointer"
      ];
      
      if (!day) {
        classes.push("text-neutral-400 dark:text-neutral-600");
      } else if (!hasPost) {
        classes.push("text-neutral-700 dark:text-neutral-300");
      } else {
        classes.push("text-neutral-900 dark:text-neutral-100 font-bold");
      }
      
      if (isToday) {
        classes.push("calendar-day-today");
      } else if (hasHoliday) {
        // 有节日：仅轻微改字色，不打徽章
        classes.push("calendar-day-holiday");
      }
      
      return `
        <div
          class="${classes.join(' ')}"
          data-date="${dateKey}"
          data-has-post="${hasPost}"
          data-post-count="${count}"
          data-has-holiday="${hasHoliday ? 'true' : 'false'}"
        >
          ${day || ''}
          ${hasPost ? '<span class="calendar-contrib-dot" aria-hidden="true"></span>' : ''}
          ${hasPost && count > 1 ? `<span class="calendar-contrib-count">${count}</span>` : ''}
        </div>
      `;
    }).join('');
    
    // 不再常驻展示当月列表（已迁至左侧热笺）
    hideCalendarPosts();
    
    // 单日点击筛选 + 悬停提示（笔记数 / 节日）
    setupClickHandlers();
    bindCalendarDayTooltips();
  }

  function isZhLang() {
    return String(currentLang || '').toLowerCase().startsWith('zh');
  }

  function buildDayTooltip(dateKey, count) {
    const zh = isZhLang();
    const h = (holidayMap && holidayMap[dateKey]) || { cn: [], intl: [] };
    const holidays = [].concat(h.cn || [], h.intl || []);
    const lines = [];
    if (zh) {
      lines.push(dateKey.replace(/-/g, '/'));
      lines.push(count > 0 ? `笔记 ${count} 篇` : '暂无笔记');
      if (holidays.length) lines.push(`节日：${holidays.join(' · ')}`);
    } else {
      lines.push(dateKey);
      lines.push(count > 0 ? `${count} note${count === 1 ? '' : 's'}` : 'No notes');
      if (holidays.length) lines.push(`Holiday: ${holidays.join(' · ')}`);
    }
    return lines.join('\n');
  }

  function ensureCalendarDayTooltip() {
    let el = document.getElementById('calendar-day-tooltip');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'calendar-day-tooltip';
    el.setAttribute('role', 'tooltip');
    Object.assign(el.style, {
      position: 'fixed',
      padding: '6px 10px',
      borderRadius: '8px',
      fontSize: '0.72rem',
      lineHeight: '1.45',
      background: 'rgba(28, 25, 23, 0.92)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.15s ease',
      zIndex: '9999',
      whiteSpace: 'pre-line',
      maxWidth: '16rem',
      textAlign: 'left',
    });
    document.body.appendChild(el);
    return el;
  }

  function bindCalendarDayTooltips() {
    const tip = ensureCalendarDayTooltip();
    const days = document.querySelectorAll('#calendar-grid .calendar-day[data-date]:not([data-date=""])');
    days.forEach((dayEl) => {
      const dateKey = dayEl.getAttribute('data-date') || '';
      if (!dateKey) return;
      const count = parseInt(dayEl.getAttribute('data-post-count') || '0', 10) || 0;
      const text = buildDayTooltip(dateKey, count);

      dayEl.addEventListener('mouseenter', () => {
        tip.textContent = text;
        tip.style.opacity = '1';
        const rect = dayEl.getBoundingClientRect();
        const tipW = tip.offsetWidth;
        const tipH = tip.offsetHeight;
        let left = rect.left + rect.width / 2 - tipW / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
        let top = rect.top - tipH - 8;
        if (top < 8) top = rect.bottom + 8;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      });
      dayEl.addEventListener('mouseleave', () => {
        tip.style.opacity = '0';
      });
    });
  }

  function renderMonthView() {
    const container = document.getElementById('month-view-container');
    if (!container) return;

    // Calculate which months have posts for the currently displayed year
    const monthsWithPosts = new Set();
    allPostsData.forEach(post => {
        const date = new Date(post.published);
        if (date.getFullYear() === displayYear) {
            monthsWithPosts.add(date.getMonth());
        }
    });

    container.innerHTML = monthNames.map((name, index) => {
      const isCurrent = index === displayMonth;
      const hasPost = monthsWithPosts.has(index);
      const classes = [
        "p-2 text-center text-sm rounded-sm cursor-pointer hover:bg-(--btn-plain-bg-hover) transition-colors relative"
      ];
      if (isCurrent) {
        classes.push("text-(--primary) font-bold bg-(--btn-plain-bg-hover)");
      } else {
        classes.push("text-neutral-700 dark:text-neutral-300");
      }
      
      const dotHtml = hasPost ? '<span class="calendar-contrib-dot calendar-contrib-dot--month"></span>' : '';
      
      return `<div class="${classes.join(' ')}" data-month="${index}">${name}${dotHtml}</div>`;
    }).join('');

    container.querySelectorAll('[data-month]').forEach(el => {
      el.addEventListener('click', () => {
        displayMonth = parseInt(el.getAttribute('data-month'));
        currentView = 'day';
        renderCalendar();
      });
    });
  }

  function renderYearView() {
    const container = document.getElementById('year-view-container');
    if (!container) return;

    container.innerHTML = availableYears.map(year => {
      const isCurrent = year === displayYear;
      const classes = [
        "p-2 text-center text-sm rounded-sm cursor-pointer hover:bg-(--btn-plain-bg-hover) transition-colors relative"
      ];
      if (isCurrent) {
        classes.push("text-(--primary) font-bold bg-(--btn-plain-bg-hover)");
      } else {
        classes.push("text-neutral-700 dark:text-neutral-300");
      }
      return `<div class="${classes.join(' ')}" data-year="${year}">${year}<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-(--primary)"></span></div>`;
    }).join('');

    container.querySelectorAll('[data-year]').forEach(el => {
      el.addEventListener('click', () => {
        displayYear = parseInt(el.getAttribute('data-year'));
        currentView = 'month';
        renderCalendar();
      });
    });
  }
  
  // 收起日历下文章列表（常读列表已迁左侧）
  function hideCalendarPosts() {
    const postsWrapper = document.getElementById('calendar-posts');
    const postsList = document.getElementById('calendar-posts-list');
    const divider = document.getElementById('calendar-posts-divider');
    if (postsWrapper) postsWrapper.style.display = 'none';
    if (postsList) postsList.innerHTML = '';
    if (divider) divider.style.display = 'none';
  }
  
  // 设置日历格子点击事件
  function setupClickHandlers() {
    const postsWrapper = document.getElementById('calendar-posts');
    const calendarDays = document.querySelectorAll('.calendar-day[data-date]');
    const postsList = document.getElementById('calendar-posts-list');
    const divider = document.getElementById('calendar-posts-divider');
    
    let currentSelectedDay = null;
    
    calendarDays.forEach(dayElement => {
      dayElement.addEventListener('click', () => {
        const dateKey = dayElement.getAttribute('data-date');
        const hasPost = dayElement.getAttribute('data-has-post') === 'true';
        
        if (!hasPost || !dateKey) return;
        
        // 切换选中状态
        if (currentSelectedDay === dayElement) {
          // 取消选中，收起列表
          dayElement.classList.remove('calendar-day-selected');
          currentSelectedDay = null;
          hideCalendarPosts();
          return;
        }
        
        // 移除之前选中的样式
        if (currentSelectedDay) {
          currentSelectedDay.classList.remove('calendar-day-selected');
        }
        
        // 添加选中样式
        dayElement.classList.add('calendar-day-selected');
        currentSelectedDay = dayElement;
        
        // 获取该日期的文章
        const posts = postDateMap[dateKey] || [];
        
        if (posts.length > 0 && postsList) {
          if (postsWrapper) {
            postsWrapper.style.display = 'block';
          }

          // 渲染文章列表
          postsList.innerHTML = posts.map(post => {
            const date = new Date(post.published);
            const dateStr = `${date.getMonth() + 1}-${date.getDate()}`;
            return `
            <a href="${postUrlPrefix}${post.id}/" class="flex justify-between items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-(--primary) dark:hover:text-(--primary) transition-colors px-2 py-1 rounded-sm hover:bg-(--btn-plain-bg-hover)">
              <span class="truncate">${post.title}</span>
              <span class="text-xs text-neutral-500 dark:text-neutral-400 ml-2 whitespace-nowrap">${dateStr}</span>
            </a>
          `}).join('');
          
          // 显示分割线
          if (divider) {
            divider.style.display = 'block';
          }
        }
      });
    });
  }

  function changeMonth(delta) {
    if (currentView === 'day') {
      displayMonth += delta;
      if (displayMonth > 11) {
          displayMonth = 0;
          displayYear++;
      } else if (displayMonth < 0) {
          displayMonth = 11;
          displayYear--;
      }
    } else if (currentView === 'month') {
      displayYear += delta;
    }
    renderCalendar();
  }

  function resetToToday() {
      const now = new Date();
      displayYear = now.getFullYear();
      displayMonth = now.getMonth();
      currentView = 'day';
      renderCalendar();
  }

  function initCalendar() {
      // 日历只存在于桌面右侧栏。右栏不可见时不抓取数据、不生成网格，
      // 避免手机和平板为隐藏组件承担同步布局与 GIF 轮播成本。
      if (!document.getElementById('calendar-widget') || window.matchMedia('(max-width: 1279px)').matches) {
        return;
      }
      // Reset to current date on init
      const now = new Date();
      displayYear = now.getFullYear();
      displayMonth = now.getMonth();
      
      fetchData();
      initCalendarCoverRotate();
      
      // Bind events
      const prevBtn = document.getElementById('prev-month-btn');
      const nextBtn = document.getElementById('next-month-btn');
      const resetBtn = document.getElementById('reset-month-btn');
      const navDisplay = document.getElementById('current-month-display');
      
      if (prevBtn) prevBtn.onclick = () => changeMonth(-1);
      if (nextBtn) nextBtn.onclick = () => changeMonth(1);
      if (resetBtn) resetBtn.onclick = () => resetToToday();
      
      if (navDisplay) {
        navDisplay.onclick = () => {
          if (currentView === 'day') {
            currentView = 'month';
          } else if (currentView === 'month') {
            currentView = 'year';
          }
          renderCalendar();
        };
      }
  }
  
  // 页面加载时渲染日历
  initCalendar();

  // 页面切换时重新渲染（swup@4 事件为 page:view；contentReplaced 是 swup2/3 事件名，不触发）
  document.addEventListener("swup:page:view", () => {
    setTimeout(initCalendar, 100);
  });

})();
