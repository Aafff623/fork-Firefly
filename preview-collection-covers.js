(function () {
  var KEY = "firefly-collection-cover-picks";

  function slugs() {
    return Array.prototype.map.call(document.querySelectorAll(".group"), function (el) {
      return el.getAttribute("data-slug");
    });
  }

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function currentPicks() {
    var out = {};
    slugs().forEach(function (slug) {
      var checked = document.querySelector('input[name="pick-' + slug + '"]:checked');
      if (checked) out[slug] = checked.value;
    });
    return out;
  }

  function renderChosen() {
    var picks = currentPicks();
    var el = document.getElementById("chosen-json");
    var keys = Object.keys(picks);
    el.textContent = keys.length ? JSON.stringify(picks, null, 2) : "尚未选择";
    writeStore(picks);
  }

  function restore() {
    var saved = readStore();
    Object.keys(saved).forEach(function (slug) {
      var input = document.querySelector(
        'input[name="pick-' + slug + '"][value="' + saved[slug] + '"]'
      );
      if (input) input.checked = true;
    });
    renderChosen();
  }

  document.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t && t.matches && t.matches('input[type="radio"][name^="pick-"]')) {
      renderChosen();
    }
  });

  var clearBtn = document.getElementById("clear-picks");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      document.querySelectorAll('input[type="radio"][name^="pick-"]').forEach(function (el) {
        el.checked = false;
      });
      writeStore({});
      renderChosen();
    });
  }

  restore();
})();
