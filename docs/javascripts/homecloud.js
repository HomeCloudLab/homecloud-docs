(function () {
  "use strict";

  var STORAGE_THEME = "homecloud_docs_theme";
  var STORAGE_LANG = "homecloud_docs_lang";

  function getLocaleFromPath() {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/he" || path.indexOf("/he/") === 0) return "he";
    return "en";
  }

  function localePath(locale, path) {
    var base = path || window.location.pathname;
    var search = window.location.search || "";
    var hash = window.location.hash || "";

    if (locale === "he") {
      if (base === "/" || base === "") return "/he/" + search + hash;
      if (base.indexOf("/he/") === 0) return base + search + hash;
      return "/he" + base + search + hash;
    }

    if (base.indexOf("/he/") === 0) {
      var stripped = base.slice(3) || "/";
      return stripped + search + hash;
    }
    if (base === "/he") return "/" + search + hash;
    return base + search + hash;
  }

  function applyDocumentLocale(locale) {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_LANG, locale);
    } catch (_e) {
      /* ignore */
    }
  }

  function markTechnicalBlocks() {
    document.querySelectorAll(".md-typeset table:not([class]) td, .md-typeset table:not([class]) th").forEach(function (cell) {
      var text = (cell.textContent || "").trim();
      if (
        /^(homecloud|so |mq |curl |pip |npm |git |export |GET |POST |PUT |DELETE )/i.test(text) ||
        /[{[\]}/]|so:\/\//.test(text) ||
        cell.querySelector("code")
      ) {
        cell.classList.add("hc-ltr");
      }
    });
  }

  function openSearch() {
    var toggle = document.querySelector('[data-md-toggle="search"]');
    if (toggle && !toggle.checked) {
      toggle.checked = true;
      toggle.dispatchEvent(new Event("change", { bubbles: true }));
    }
    var input = document.querySelector(".md-search__input");
    if (input) {
      window.setTimeout(function () {
        input.focus();
        input.select();
      }, 50);
    }
  }

  function installKeyboardShortcuts() {
    document.addEventListener("keydown", function (event) {
      var key = event.key.toLowerCase();
      var mod = event.ctrlKey || event.metaKey;

      if (mod && key === "k") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (event.target && ["INPUT", "TEXTAREA", "SELECT"].indexOf(event.target.tagName) >= 0) {
        return;
      }

      if (key === "/" || key === "s") {
        event.preventDefault();
        openSearch();
      }
    });
  }

  function syncThemePalette() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_THEME);
    } catch (_e) {
      /* ignore */
    }

    var palette = stored === "homelab-light" ? "homelab-light" : "homelab";
    var inputs = document.querySelectorAll('input[data-md-color-scheme]');
    inputs.forEach(function (input) {
      input.checked = input.getAttribute("data-md-color-scheme") === palette;
    });
    document.body.setAttribute("data-md-color-scheme", palette);

    inputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (!input.checked) return;
        var scheme = input.getAttribute("data-md-color-scheme");
        try {
          localStorage.setItem(STORAGE_THEME, scheme);
        } catch (_e) {
          /* ignore */
        }
      });
    });
  }

  function buildChromeBar() {
    if (document.querySelector(".hc-chrome-bar")) return;

    var locale = getLocaleFromPath();
    var labels = {
      en: { docs: "Documentation", search: "Search", en: "EN", he: "עב" },
      he: { docs: "תיעוד", search: "חיפוש", en: "EN", he: "עב" },
    };
    var t = labels[locale] || labels.en;

    var bar = document.createElement("div");
    bar.className = "hc-chrome-bar";
    bar.innerHTML =
      '<span class="hc-chrome-brand">HomeCloud</span>' +
      '<span class="hc-chrome-sep">|</span>' +
      '<span class="hc-chrome-muted">' + t.docs + "</span>" +
      '<span class="hc-chrome-spacer"></span>' +
      '<div class="hc-chrome-actions">' +
      '<button type="button" class="hc-search-hint" aria-label="' +
      t.search +
      '">' +
      "<span>" +
      t.search +
      "</span>" +
      "<kbd>Ctrl</kbd><kbd>K</kbd>" +
      "</button>" +
      '<div class="hc-lang-switch" role="group" aria-label="Language">' +
      '<a class="hc-lang-btn' +
      (locale === "en" ? " is-active" : "") +
      '" href="' +
      localePath("en") +
      '" hreflang="en" lang="en">EN</a>' +
      '<a class="hc-lang-btn' +
      (locale === "he" ? " is-active" : "") +
      '" href="' +
      localePath("he") +
      '" hreflang="he" lang="he">עב</a>' +
      "</div>" +
      "</div>";

    var header = document.querySelector(".md-header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(bar, header);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    var hint = bar.querySelector(".hc-search-hint");
    if (hint) {
      hint.addEventListener("click", openSearch);
    }
  }

  function init() {
    var locale = getLocaleFromPath();
    applyDocumentLocale(locale);
    buildChromeBar();
    syncThemePalette();
    installKeyboardShortcuts();
    markTechnicalBlocks();

    if (typeof document$ !== "undefined" && document$.subscribe) {
      document$.subscribe(function () {
        applyDocumentLocale(getLocaleFromPath());
        markTechnicalBlocks();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
