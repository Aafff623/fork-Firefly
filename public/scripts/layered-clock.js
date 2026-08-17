/* extracted from LayeredClock.astro */
(function () {
    const ROOT_ID = "layered-clock-root";
    const WEATHER_CACHE_KEY = "lc7-weather";
    /** @type {number | undefined} */
    let loop;
    let lastWeatherCheck = 0;
    const prefersReducedMotion =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** @param {HTMLElement} el */
    function initSkyImgs(el) {
      const sky = el.querySelector(".lc7__layer--sky");
      if (!(sky instanceof HTMLElement)) return;
      if (sky.getAttribute("data-sky-imgs-bound")) return;
      sky.setAttribute("data-sky-imgs-bound", "1");
      sky.querySelectorAll(".lc7__sky-base, .lc7__sky-weather").forEach(function (img) {
        if (!(img instanceof HTMLImageElement)) return;
        img.addEventListener("load", function () {
          if (img.naturalWidth > 0) el.setAttribute("data-sky-gif-ready", "1");
        });
        img.addEventListener("error", function () {
          img.remove();
          el.removeAttribute("data-sky-gif-ready");
        });
      });
    }

    /** @param {HTMLElement} el */
    function syncSkyAssets(el) {
      initSkyImgs(el);
      const raw = el.getAttribute("data-sky-assets");
      if (!raw) return;
      /** @type {{ enable?: boolean; day?: string; night?: string; weather?: Record<string, string> }} */
      let assets;
      try {
        assets = JSON.parse(raw);
      } catch {
        return;
      }
      if (!assets.enable || prefersReducedMotion) {
        el.removeAttribute("data-sky-gif-ready");
        return;
      }

      const sky = el.getAttribute("data-sky");
      const weatherScene = el.getAttribute("data-weather") || "clear";
      const baseImg = el.querySelector(".lc7__sky-base");
      const weatherImg = el.querySelector(".lc7__sky-weather");

      if (baseImg instanceof HTMLImageElement && sky) {
        const src = sky === "night" ? assets.night : assets.day;
        if (src && baseImg.getAttribute("data-src") !== src) {
          baseImg.setAttribute("data-src", src);
          baseImg.src = src;
        }
        baseImg.hidden = !src;
      }

      if (weatherImg instanceof HTMLImageElement) {
        const wSrc =
          weatherScene !== "clear" && assets.weather
            ? assets.weather[weatherScene] || ""
            : "";
        if (wSrc && weatherImg.getAttribute("data-src") !== wSrc) {
          weatherImg.setAttribute("data-src", wSrc);
          weatherImg.src = wSrc;
        }
        weatherImg.hidden = !wSrc;
      }
    }

    function applyFace(el) {
      const face = el.getAttribute("data-face");
      if (!face) return;
      const img = el.querySelector(".lc7__layer--img");
      if (img instanceof HTMLElement) {
        img.style.backgroundImage = 'url("' + face + '")';
        img.style.backgroundSize = "100% 100%";
        img.style.backgroundPosition = "0 0";
      }
    }

    /** 昼夜：跟随站点主题（html.dark），theme-change 事件即时联动 */
    function syncSky(el) {
      const mode = el.getAttribute("data-sky-mode") || "auto";
      if (mode === "off") {
        el.removeAttribute("data-sky");
        return;
      }
      const sky =
        mode === "auto"
          ? document.documentElement.classList.contains("dark")
            ? "night"
            : "day"
          : mode;
      if (el.getAttribute("data-sky") !== sky) {
        el.setAttribute("data-sky", sky);
        syncSkyAssets(el);
      }
    }

    function syncAllSkies() {
      document.querySelectorAll(".lc7[data-sky-mode]").forEach(function (el) {
        if (el instanceof HTMLElement) syncSky(el);
      });
    }

    /** WMO weather_code → 场景枚举 */
    function mapWeatherCode(code) {
      if (code <= 1) return "clear";
      if (code <= 3) return "cloudy";
      if (code === 45 || code === 48) return "fog";
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
      if (code >= 95) return "thunder";
      return "clear";
    }

    function applyWeather(el, scene) {
      if (el.getAttribute("data-weather") !== scene) {
        el.setAttribute("data-weather", scene);
        syncSkyAssets(el);
      }
    }

    function readWeatherCache(maxAgeMs) {
      try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!raw) return null;
        const o = JSON.parse(raw);
        if (typeof o.code !== "number" || typeof o.ts !== "number") return null;
        return { code: o.code, fresh: Date.now() - o.ts < maxAgeMs };
      } catch {
        return null;
      }
    }

    /** 天气：Open-Meteo 直连（免 key），localStorage 缓存 TTL 分钟级；失败静默降级 */
    async function syncWeather(el) {
      const lat = Number.parseFloat(el.getAttribute("data-weather-lat") || "");
      const lon = Number.parseFloat(el.getAttribute("data-weather-lon") || "");
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const refreshMin = Number.parseInt(
        el.getAttribute("data-weather-refresh") || "30",
        10,
      );

      const cached = readWeatherCache(refreshMin * 60000);
      if (cached) {
        applyWeather(el, mapWeatherCode(cached.code));
        if (cached.fresh) return;
      }

      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=" +
            lat +
            "&longitude=" +
            lon +
            "&current=weather_code&timezone=auto",
        );
        if (!res.ok) return;
        const data = await res.json();
        const code = data?.current?.weather_code;
        if (typeof code !== "number") return;
        try {
          localStorage.setItem(
            WEATHER_CACHE_KEY,
            JSON.stringify({ code, ts: Date.now() }),
          );
        } catch {
          /* 缓存失败无碍 */
        }
        applyWeather(el, mapWeatherCode(code));
      } catch {
        /* 静默降级：保持缓存或默认 clear */
      }
    }

    function timeAsObject() {
      const date = new Date();
      return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
    }

    function timeDigitsGrouped() {
      let { h, m, s } = timeAsObject();
      const ap = h > 11 ? "PM" : "AM";
      if (h === 0) h += 12;
      else if (h > 12) h -= 12;
      return [
        String(h),
        m < 10 ? "0" + m : String(m),
        s < 10 ? "0" + s : String(s),
        ap,
      ];
    }

    function timeAsString() {
      const p = timeDigitsGrouped();
      return p[0] + ":" + p[1] + ":" + p[2] + " " + p[3];
    }

    function tick() {
      const el = document.getElementById(ROOT_ID);
      if (!el) return;
      applyFace(el);
      syncSky(el);
      syncSkyAssets(el);

      // 天气检查走分钟级节流，不随秒 tick 发请求
      if (Date.now() - lastWeatherCheck > 60000) {
        lastWeatherCheck = Date.now();
        void syncWeather(el);
      }

      const time = timeAsObject();
      const secFraction = time.s / 60;
      const minFraction = (time.m + secFraction) / 60;
      const hrFraction = (time.h + minFraction) / 12;
      el.style.setProperty("--secAngle", 360 * secFraction + "deg");
      el.style.setProperty("--minAngle", 360 * minFraction + "deg");
      el.style.setProperty("--hrAngle", 360 * hrFraction + "deg");
      el.setAttribute("aria-label", timeAsString());

      const digits = timeDigitsGrouped();
      el.querySelectorAll("[data-unit]").forEach(function (unit, i) {
        unit.textContent = digits[i] || "";
      });

      clearTimeout(loop);
      loop = window.setTimeout(tick, 1000);
    }

    function start() {
      clearTimeout(loop);
      tick();
    }

    // 主题切换（含 19:00 时间感知自动入夜）→ 全部时钟天空即时联动；只绑定一次
    if (!window.__lc7ThemeBound) {
      window.__lc7ThemeBound = true;
      window.addEventListener("theme-change", syncAllSkies);
    }

    start();

    // swup 软导航后重起时钟。swup@4 派发 swup:page:view（contentReplaced 是
    // swup2/3 事件名不触发；astro:page-load 在无 ClientRouter 的站点不触发）。
    // 幂等 guard：SiteStats 桌面+移动双份渲染，document 监听只绑一次
    if (!window.__lc7SwupBound) {
      window.__lc7SwupBound = true;
      document.addEventListener("swup:page:view", function () {
        setTimeout(start, 80);
      });
    }
  })();
