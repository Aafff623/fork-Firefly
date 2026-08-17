/* extracted from SurpriseClock.astro */
(function () {
    // 仅翻页计时；已去掉鼠标悬停斥力/复式位移
    const ROOT_ID = "surprise-clock-root";
    const WEATHER_CACHE_KEY = "lc7-weather"; // 与分层时钟共享缓存，一次请求两钟受益

    let timer = 0;
    /** @type {HTMLElement[]} */
    let digitGroups = [];
    let builtFor = null;
    let lastWeatherCheck = 0;
    const prefersReducedMotion =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** @param {HTMLElement} el */
    function syncSkyAssets(el) {
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
      const baseImg = el.querySelector(".surprise-clock__sky-base");
      const weatherImg = el.querySelector(".surprise-clock__sky-weather");

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

    /** @param {HTMLImageElement} img @param {HTMLElement} root */
    function onSkyImgLoad(img, root) {
      if (img.complete && img.naturalWidth > 0) {
        root.setAttribute("data-sky-gif-ready", "1");
      }
    }

    /** @param {HTMLImageElement} img @param {HTMLElement} root */
    function onSkyImgError(img, root) {
      img.remove();
      root.removeAttribute("data-sky-gif-ready");
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
      document
        .querySelectorAll(".surprise-clock[data-sky-mode]")
        .forEach(function (el) {
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

    function build(root) {
      if (builtFor === root && digitGroups.length) return;
      root.innerHTML = "";
      digitGroups = [];
      builtFor = root;

      // 天空层：GIF 基底 + CSS 日月云星兜底
      const sky = document.createElement("div");
      sky.className = "surprise-clock__sky";
      sky.setAttribute("aria-hidden", "true");

      const baseImg = document.createElement("img");
      baseImg.className = "surprise-clock__sky-base";
      baseImg.alt = "";
      baseImg.decoding = "async";
      baseImg.loading = "lazy";
      baseImg.hidden = true;
      baseImg.addEventListener("load", function () {
        onSkyImgLoad(baseImg, root);
      });
      baseImg.addEventListener("error", function () {
        onSkyImgError(baseImg, root);
      });
      sky.appendChild(baseImg);

      const weatherImg = document.createElement("img");
      weatherImg.className = "surprise-clock__sky-weather";
      weatherImg.alt = "";
      weatherImg.decoding = "async";
      weatherImg.loading = "lazy";
      weatherImg.hidden = true;
      weatherImg.addEventListener("load", function () {
        onSkyImgLoad(weatherImg, root);
      });
      weatherImg.addEventListener("error", function () {
        onSkyImgError(weatherImg, root);
      });
      sky.appendChild(weatherImg);

      const celestial = document.createElement("div");
      celestial.className = "surprise-clock__celestial";
      sky.appendChild(celestial);

      const stars = document.createElement("div");
      stars.className = "surprise-clock__stars";
      sky.appendChild(stars);

      ["a", "b"].forEach(function (suffix) {
        const cloud = document.createElement("div");
        cloud.className =
          "surprise-clock__cloud surprise-clock__cloud--" + suffix;
        sky.appendChild(cloud);
      });

      root.appendChild(sky);

      const time10 = Array.from({ length: 10 }, (_, i) => i);
      const time6 = time10.slice(0, 6);
      const time3 = time10.slice(0, 3);
      const structure = [
        [time3, time10],
        [time6, time10],
        [time6, time10],
      ];

      const units = ["hour", "minute", "second"];
      const gradients = [
        ["oklch(0.66 0.2 292)", "oklch(0.61 0.2 255)"],
        ["oklch(0.72 0.19 350)", "oklch(0.7 0.18 20)"],
        ["oklch(0.72 0.15 205)", "oklch(0.75 0.14 165)"],
      ];
      structure.forEach((digits, index) => {
        const group = document.createElement("div");
        group.className = "surprise-clock__group";
        group.dataset.unit = units[index];
        group.style.setProperty("--sc-group-start", gradients[index][0]);
        group.style.setProperty("--sc-group-end", gradients[index][1]);
        root.appendChild(group);
        digitGroups.push(group);
        digits.forEach((digitList) => {
          const digit = document.createElement("div");
          digit.className = "surprise-clock__digit";
          const track = document.createElement("div");
          track.className = "surprise-clock__digit-track";
          digitList.forEach((n) => {
            const el = document.createElement("div");
            el.className = "surprise-clock__num";
            const glyph = document.createElement("span");
            glyph.className = "surprise-clock__glyph";
            glyph.style.background = `linear-gradient(125deg, ${gradients[index][0]}, ${gradients[index][1]})`;
            glyph.style.backgroundClip = "text";
            glyph.style.setProperty("-webkit-background-clip", "text");
            glyph.style.setProperty("-webkit-text-fill-color", "transparent");
            glyph.textContent = String(n);
            el.appendChild(glyph);
            track.appendChild(el);
          });
          digit.appendChild(track);
          group.appendChild(digit);
        });
      });
    }

    let visible = true;

    function scheduleNextTick() {
      if (!visible) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(tick, Math.max(80, 1020 - (Date.now() % 1000)));
    }

    function tick() {
      if (!visible) return;
      scheduleNextTick();
      const root = document.getElementById(ROOT_ID);
      if (!root || document.hidden) return;
      if (
        root.closest("#right-sidebar") &&
        window.matchMedia("(max-width: 1279px)").matches
      ) return;
      if (root.getClientRects().length === 0) return;
      build(root);
      syncSky(root);
      syncSkyAssets(root);

      // 天气检查走分钟级节流，不随帧 tick 发请求
      if (Date.now() - lastWeatherCheck > 60000) {
        lastWeatherCheck = Date.now();
        void syncWeather(root);
      }

      const date = new Date();
      const time = [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((n) => `0${n}`.slice(-2).split("").map((e) => +e))
        .reduce((p, n) => p.concat(n), []);

      const label = time
        .map((n, i) => (i && i % 2 === 0 ? `:${n}` : String(n)))
        .join("");
      if (root.getAttribute("aria-label") !== label) {
        root.setAttribute("aria-label", label);
      }

      time.forEach((n, i) => {
        const group = digitGroups[Math.floor(i * 0.5)];
        if (!group) return;
        const digit = group.children[i % 2];
        if (!(digit instanceof HTMLElement)) return;
        const track = digit.querySelector(".surprise-clock__digit-track");
        if (!(track instanceof HTMLElement)) return;
        Array.from(track.children).forEach((el, i2) => {
          el.classList.toggle("is-bright", i2 === n);
        });
        const bright = track.children[n];
        if (bright instanceof HTMLElement) {
          const mid = digit.clientHeight * 0.5 - bright.offsetHeight * 0.5;
          track.style.setProperty("--sc-shift", `${mid - bright.offsetTop}px`);
        }
      });
    }

    function start() {
      if (timer) window.clearTimeout(timer);
      digitGroups = [];
      builtFor = null;
      tick();
    }

    // 主题切换（含 19:00 时间感知自动入夜）→ 全部大钟天空即时联动；只绑定一次
    if (!window.__scThemeBound) {
      window.__scThemeBound = true;
      window.addEventListener("theme-change", syncAllSkies);
    }

    start();

    // 离屏暂停 tick（80px 预见量）；软导航后 root 可能被替换，需重挂观察并复位 visible，
    // 否则旧 root 脱离 DOM 时 IO 回调 false 会把 visible 永久锁死
    var clockIo = null;
    function observeClockRoot() {
      var clockRoot = document.getElementById(ROOT_ID);
      if (!clockRoot || typeof IntersectionObserver === "undefined") {
        visible = true;
        return;
      }
      if (clockIo) clockIo.disconnect();
      clockIo = new IntersectionObserver(
        function (entries) {
          visible = entries.some(function (entry) {
            return entry.isIntersecting;
          });
          if (visible) start();
          else if (timer) {
            window.clearTimeout(timer);
            timer = 0;
          }
        },
        { rootMargin: "80px 0px" },
      );
      visible = true;
      clockIo.observe(clockRoot);
    }
    observeClockRoot();

    // swup 软导航后重起时钟并重挂离屏观察。swup@4 派发的是 swup:page:view
    // （contentReplaced 是 swup2/3 事件名，本站不会触发；astro:page-load 在
    // 无 ClientRouter 时同样不触发）。幂等 guard：document 监听只绑一次
    if (!window.__scSwupBound) {
      window.__scSwupBound = true;
      document.addEventListener("swup:page:view", () => {
        visible = true;
        setTimeout(start, 80);
        observeClockRoot();
      });
    }
  })();
