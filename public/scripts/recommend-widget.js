/* extracted from Recommend.astro */
(function () {
    function isPostPath(pathname) {
      return /\/posts\//.test(pathname || "");
    }

    function formatDate(value) {
      try {
        return new Date(value).toISOString().substring(0, 10);
      } catch (e) {
        return "";
      }
    }

    function readRelatedFromSwup() {
      var host = document.getElementById("swup-container");
      var raw = host && host.getAttribute("data-related-posts");
      if (!raw) return [];
      try {
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function readCurrentId() {
      var host = document.getElementById("swup-container");
      return (host && host.getAttribute("data-current-post-id")) || "";
    }

    function readCurrentTags() {
      var host = document.getElementById("swup-container");
      var raw = host && host.getAttribute("data-current-post-tags");
      if (!raw) return [];
      try {
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .map(function (t) {
            return String(t || "")
              .trim()
              .toLowerCase();
          })
          .filter(Boolean);
      } catch (e) {
        return [];
      }
    }

    function readCurrentCategory() {
      var host = document.getElementById("swup-container");
      return (
        (host && (host.getAttribute("data-current-post-category") || "")) || ""
      )
        .trim()
        .toLowerCase();
    }

    function rowHtml(base, post, hideKeys) {
      var href = base + "/posts/" + post.id + "/";
      var cat = (post.category || "NOTE").trim();
      var title = post.title || "";
      var meta = post.published || formatDate(post.publishedAt) || "";
      var keyHtml = hideKeys
        ? ""
        : '<span class="recommend-index__key">' + cat + "</span>";
      return (
        '<a href="' +
        href +
        '" class="recommend-index__row" title="' +
        title.replace(/"/g, "&quot;") +
        '">' +
        keyHtml +
        '<span class="recommend-index__title"></span>' +
        '<span class="recommend-index__meta">' +
        meta +
        "</span>" +
        "</a>"
      );
    }

    function setRows(root, posts) {
      var rows = root.querySelector("[data-recommend-rows]");
      if (!rows) return;
      var apiUrl = root.dataset.apiUrl || "";
      var base = apiUrl.replace(/\/api\/allPostMeta\.json$/, "");
      var emptyText = root.dataset.emptyText || "";
      var hideKeys = false;
      if (posts.length) {
        var firstCat = String(posts[0].category || "NOTE")
          .trim()
          .toLowerCase();
        hideKeys = posts.every(function (p) {
          return (
            String(p.category || "NOTE").trim().toLowerCase() === firstCat
          );
        });
      }
      root.dataset.hideRowKeys = hideKeys ? "1" : "0";
      var sameCatEl = root.querySelector("[data-recommend-same-cat]");
      if (sameCatEl) {
        if (hideKeys && posts.length) {
          sameCatEl.textContent = String(posts[0].category || "").trim();
          sameCatEl.hidden = false;
        } else {
          sameCatEl.textContent = "";
          sameCatEl.hidden = true;
        }
      }

      if (!posts.length) {
        rows.innerHTML =
          '<div class="recommend-index__empty" data-recommend-empty>' +
          emptyText +
          "</div>";
        return;
      }

      rows.innerHTML = "";
      var frag = document.createDocumentFragment();
      posts.forEach(function (post) {
        var wrap = document.createElement("div");
        wrap.innerHTML = rowHtml(base, post, hideKeys);
        var a = wrap.firstElementChild;
        if (!a) return;
        var titleEl = a.querySelector(".recommend-index__title");
        if (titleEl) titleEl.textContent = post.title || "";
        frag.appendChild(a);
      });
      rows.appendChild(frag);
    }

    function jaccard(aArr, bSet) {
      if (!aArr.length && !bSet.size) return 0;
      var inter = 0;
      for (var i = 0; i < aArr.length; i++) {
        if (bSet.has(aArr[i])) inter++;
      }
      var union = aArr.length + bSet.size - inter;
      return union === 0 ? 0 : inter / union;
    }

    function tokenizeTitle(title) {
      var out = [];
      var seen = {};
      var text = String(title || "");
      try {
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
          var seg = new Intl.Segmenter("zh", { granularity: "word" });
          for (var part of seg.segment(text)) {
            if (!part.isWordLike) continue;
            var tok = part.segment.toLowerCase();
            if (!seen[tok]) {
              seen[tok] = true;
              out.push(tok);
            }
          }
          return out;
        }
      } catch (e) {}
      text
        .toLowerCase()
        .split(/[\s\u3000，。！？、；：""''（）\[\]{}|\\/<>]+/)
        .forEach(function (tok) {
          if (!tok || seen[tok]) return;
          seen[tok] = true;
          out.push(tok);
        });
      return out;
    }

    /** 与服务端 getRelatedPosts 对齐的轻量客户端评分 */
    function scoreCandidate(post, ctx) {
      var tags = (post.tags || [])
        .map(function (t) {
          return String(t || "")
            .trim()
            .toLowerCase();
        })
        .filter(Boolean);
      var tagSet = new Set(tags);
      var shared = 0;
      for (var i = 0; i < ctx.tags.length; i++) {
        if (tagSet.has(ctx.tags[i])) shared++;
      }
      var tagMatch = jaccard(ctx.tags, tagSet) * 100;
      var sharedBonus = Math.min(36, shared * 12);

      var titleTokens = tokenizeTitle(post.title);
      var titleSet = new Set(titleTokens);
      var titleSim = jaccard(ctx.titleTokens, titleSet) * 100;

      var effective = post.updated || post.published || 0;
      var days =
        (ctx.now - Number(effective)) / (1000 * 60 * 60 * 24);
      if (!isFinite(days) || days < 0) days = 365;
      var freshness = 30 * Math.exp((-Math.LN2 * days) / 180);

      var cat = String(post.category || "")
        .trim()
        .toLowerCase();
      var catBonus =
        ctx.category && cat && ctx.category === cat ? 12 : 0;

      var topicHeat = Number(post.topicHeat) || 0;
      var topicNorm =
        22 *
        (Math.log1p(topicHeat) / Math.log1p(Math.max(1, ctx.maxTopicHeat)));
      var pinBonus = post.pinned ? 12 : 0;
      var recentUpdate =
        post.updated && ctx.now - Number(post.updated) < 30 * 86400000
          ? 6
          : 0;
      var heat = topicNorm + pinBonus + recentUpdate;

      return {
        score:
          tagMatch * 1.4 +
          sharedBonus +
          titleSim * 0.55 +
          freshness +
          catBonus +
          heat,
        tagMatch: tagMatch,
        shared: shared,
        heat: heat,
        freshness: freshness,
        catBonus: catBonus,
      };
    }

    function pickRecommended(allPosts, currentId, limit, currentTitle) {
      var currentTags = readCurrentTags();
      var currentCategory = readCurrentCategory();
      var titleTokens = tokenizeTitle(currentTitle || "");
      var now = Date.now();
      var maxTopicHeat = 1;
      (allPosts || []).forEach(function (p) {
        var h = Number(p.topicHeat) || 0;
        if (h > maxTopicHeat) maxTopicHeat = h;
      });
      var ctx = {
        tags: currentTags,
        category: currentCategory,
        titleTokens: titleTokens,
        now: now,
        maxTopicHeat: maxTopicHeat,
      };

      var pool = (allPosts || []).filter(function (p) {
        return p && p.id && p.id !== currentId && !p.password;
      });

      var ranked = pool
        .map(function (p) {
          var s = scoreCandidate(p, ctx);
          return { post: p, s: s };
        })
        .sort(function (a, b) {
          return b.s.score - a.s.score;
        });

      var withTag = ranked.filter(function (r) {
        return r.s.tagMatch > 0 || r.s.shared > 0;
      });
      var without = ranked.filter(function (r) {
        return r.s.tagMatch === 0 && r.s.shared === 0;
      });
      without.sort(function (a, b) {
        return (
          b.s.heat +
          b.s.freshness +
          b.s.catBonus -
          (a.s.heat + a.s.freshness + a.s.catBonus)
        );
      });

      var out = [];
      function push(r) {
        if (!r || out.length >= limit) return;
        out.push({
          id: r.post.id,
          title: r.post.title,
          category: r.post.category || "NOTE",
          published: formatDate(r.post.published),
        });
      }
      withTag.forEach(push);
      without.forEach(push);
      return out.slice(0, limit);
    }

    function mergeList(related, allPosts, currentId, limit, currentTitle) {
      var exclude = {};
      exclude[currentId] = true;
      var out = [];
      related.forEach(function (p) {
        if (!p || !p.id || exclude[p.id]) return;
        exclude[p.id] = true;
        out.push({
          id: p.id,
          title: p.title,
          category: p.category || "NOTE",
          published: p.published || formatDate(p.publishedAt),
        });
      });

      if (out.length >= limit) return out.slice(0, limit);

      // 不足：用标签+热度评分补齐（不再 shuffle 随机）
      var scored = pickRecommended(
        allPosts,
        currentId,
        limit,
        currentTitle,
      );
      scored.forEach(function (p) {
        if (out.length >= limit || exclude[p.id]) return;
        exclude[p.id] = true;
        out.push(p);
      });
      return out.slice(0, limit);
    }

    function readCurrentTitle() {
      var host = document.getElementById("swup-container");
      return (host && host.getAttribute("data-current-post-title")) || "";
    }

    function renderRoot(root, allPosts) {
      if (!isPostPath(location.pathname)) return;
      var limit = Number(root.dataset.limit || 3) || 3;
      var currentId = readCurrentId() || root.dataset.currentId || "";
      var related = readRelatedFromSwup();
      var merged = mergeList(
        related,
        allPosts || [],
        currentId,
        limit,
        readCurrentTitle(),
      );
      setRows(root, merged);
    }

    function applyRecommend() {
      var roots = document.querySelectorAll("[data-recommend-root]");
      if (!roots.length) return;

      // 手机端侧栏与移动底栏均不渲染推荐卡，隐藏内容不得继续拉全量文章元数据。
      if (window.matchMedia("(max-width: 767px)").matches) return;

      if (!isPostPath(location.pathname)) return;

      function run(allPosts) {
        roots.forEach(function (root) {
          renderRoot(root, allPosts);
        });
      }

      if (window.__allPostMetaCache) {
        run(window.__allPostMetaCache);
        return;
      }

      var apiUrl =
        (roots[0] && roots[0].dataset.apiUrl) || "/api/allPostMeta.json";
      fetch(apiUrl)
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          window.__allPostMetaCache = data;
          run(data);
        })
        .catch(function () {
          roots.forEach(function (root) {
            var related = readRelatedFromSwup();
            setRows(
              root,
              related.slice(0, Number(root.dataset.limit || 3) || 3),
            );
          });
        });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyRecommend);
    } else {
      applyRecommend();
    }

    // 单通道重挂：软导航后只跑一次（原 DOM 事件 + hooks 双通道每次导航跑三遍）
    document.addEventListener("swup:page:view", applyRecommend);
  })();
