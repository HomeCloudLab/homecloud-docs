(function () {
  "use strict";

  var searchDocs = null;
  var searchPrefix = "";
  var activeSearchIndex = -1;

  function getLocaleFromPath() {
    var segments = window.location.pathname.split("/").filter(Boolean);
    return segments.indexOf("he") !== -1 ? "he" : "en";
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
    var dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    // Material sets dir on <body> too; keep it in sync or the layout won't flip.
    if (document.body) {
      document.body.setAttribute("dir", dir);
    }
  }

  var THEME_STRINGS = {
    he: {
      toc: "תוכן העניינים",
    },
  };

  // We keep reconfigure_material off (it breaks strict builds with instant nav),
  // so localize the few visible Material UI strings ourselves.
  function localizeThemeStrings(locale) {
    var strings = THEME_STRINGS[locale];
    if (!strings) return;

    var tocTitle = document.querySelector(".md-sidebar--secondary .md-nav__title");
    if (tocTitle && strings.toc) {
      tocTitle.childNodes.forEach(function (node) {
        if (node.nodeType === 3 && node.textContent.trim()) {
          node.textContent = strings.toc;
        }
      });
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

  function searchBasePath() {
    return getLocaleFromPath() === "he" ? "/he/" : "/";
  }

  function resolveDocHref(location) {
    var href = searchPrefix + (location || "");
    if (!href.endsWith("/")) href += "/";
    return href;
  }

  function loadSearchIndex() {
    var indexUrl = searchBasePath() + "search/search_index.json";
    return fetch(indexUrl)
      .then(function (response) {
        if (!response.ok) {
          return fetch("/search/search_index.json").then(function (fallback) {
            return fallback.json();
          });
        }
        return response.json();
      })
      .then(function (data) {
        searchDocs = data.docs || [];
        searchPrefix = searchBasePath();
      })
      .catch(function () {
        searchDocs = [];
      });
  }

  function filterSearch(query) {
    if (!searchDocs) return [];
    var q = query.trim().toLowerCase();
    if (!q) return [];

    return searchDocs
      .filter(function (doc) {
        return (
          (doc.title && doc.title.toLowerCase().indexOf(q) >= 0) ||
          (doc.text && doc.text.toLowerCase().indexOf(q) >= 0)
        );
      })
      .slice(0, 8);
  }

  function buildChromeStack() {
    if (document.querySelector(".hc-chrome-stack")) return;

    var locale = getLocaleFromPath();
    var labels = {
      en: {
        docs: "Documentation",
        search: "Search docs, CLI commands, guides…",
        empty: "No results",
        github: "GitHub",
      },
      he: {
        docs: "תיעוד",
        search: "חיפוש בתיעוד, פקודות CLI, מדריכים…",
        empty: "אין תוצאות",
        github: "GitHub",
      },
    };
    var t = labels[locale] || labels.en;

    var stack = document.createElement("div");
    stack.className = "hc-chrome-stack";

    var bar = document.createElement("div");
    bar.className = "hc-chrome-bar";
    bar.innerHTML =
      '<span class="hc-chrome-brand">HomeCloud</span>' +
      '<span class="hc-chrome-sep">|</span>' +
      '<span class="hc-chrome-muted">' + t.docs + "</span>" +
      '<div class="hc-chrome-search-wrap">' +
      '<svg class="hc-chrome-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>' +
      '<input type="search" class="hc-chrome-search" autocomplete="off" spellcheck="false" aria-label="' +
      t.search +
      '" placeholder="' +
      t.search +
      '" />' +
      '<span class="hc-chrome-search-kbd" aria-hidden="true"><kbd>Ctrl</kbd><kbd>K</kbd></span>' +
      '<div class="hc-search-dropdown" hidden></div>' +
      "</div>" +
      '<div class="hc-chrome-actions">' +
      '<div class="hc-lang-switch" role="group" aria-label="Language">' +
      '<a class="hc-lang-btn' +
      (locale === "en" ? " is-active" : "") +
      '" href="' +
      localePath("en") +
      '" hreflang="en" lang="en" data-md-type="link">EN</a>' +
      '<a class="hc-lang-btn' +
      (locale === "he" ? " is-active" : "") +
      '" href="' +
      localePath("he") +
      '" hreflang="he" lang="he" data-md-type="link">עב</a>' +
      "</div>" +
      '<a class="hc-github-link" href="https://github.com/HomeCloudLab/homecloud-docs" target="_blank" rel="noopener">GitHub</a>' +
      "</div>";

    var header = document.querySelector(".md-header");
    var tabs = document.querySelector(".md-tabs");
    var anchor = header && header.parentNode ? header.parentNode : document.body;

    if (header) {
      anchor.insertBefore(stack, header);
    } else {
      document.body.insertBefore(stack, document.body.firstChild);
    }

    stack.appendChild(bar);
    if (tabs) {
      stack.appendChild(tabs);
    }

    wireInlineSearch(bar, t.empty);
  }

  function wireInlineSearch(bar, emptyLabel) {
    var input = bar.querySelector(".hc-chrome-search");
    var dropdown = bar.querySelector(".hc-search-dropdown");
    if (!input || !dropdown) return;

    function closeDropdown() {
      dropdown.hidden = true;
      activeSearchIndex = -1;
    }

    function renderDropdown(results) {
      dropdown.innerHTML = "";
      if (!input.value.trim()) {
        closeDropdown();
        return;
      }

      if (!results.length) {
        var empty = document.createElement("div");
        empty.className = "hc-search-empty";
        empty.textContent = emptyLabel;
        dropdown.appendChild(empty);
        dropdown.hidden = false;
        return;
      }

      results.forEach(function (doc, index) {
        var item = document.createElement("a");
        item.className = "hc-search-item";
        item.href = resolveDocHref(doc.location);
        item.setAttribute("data-md-type", "link");
        item.innerHTML =
          '<span class="hc-search-item-title">' +
          (doc.title || "Untitled") +
          "</span>" +
          '<span class="hc-search-item-path hc-ltr">' +
          item.href +
          "</span>";

        item.addEventListener("mouseenter", function () {
          setActive(index);
        });

        item.addEventListener("click", function () {
          closeDropdown();
          input.value = "";
        });

        dropdown.appendChild(item);
      });

      dropdown.hidden = false;
      setActive(0);
    }

    function setActive(index) {
      activeSearchIndex = index;
      var items = dropdown.querySelectorAll(".hc-search-item");
      items.forEach(function (el, i) {
        el.classList.toggle("is-active", i === index);
      });
    }

    function onInput() {
      renderDropdown(filterSearch(input.value));
    }

    input.addEventListener("input", onInput);
    input.addEventListener("focus", onInput);

    input.addEventListener("keydown", function (event) {
      var items = dropdown.querySelectorAll(".hc-search-item");
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!items.length) return;
        setActive(Math.min(activeSearchIndex + 1, items.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!items.length) return;
        setActive(Math.max(activeSearchIndex - 1, 0));
        return;
      }
      if (event.key === "Enter" && activeSearchIndex >= 0 && items[activeSearchIndex]) {
        event.preventDefault();
        items[activeSearchIndex].click();
        return;
      }
      if (event.key === "Escape") {
        closeDropdown();
        input.blur();
      }
    });

    document.addEventListener("mousedown", function (event) {
      if (!bar.contains(event.target)) {
        closeDropdown();
      }
    });
  }

  function installKeyboardShortcuts() {
    document.addEventListener("keydown", function (event) {
      var key = event.key.toLowerCase();
      var mod = event.ctrlKey || event.metaKey;
      var input = document.querySelector(".hc-chrome-search");

      if (mod && key === "k") {
        event.preventDefault();
        if (input) {
          input.focus();
          input.select();
        }
      }
    });
  }

  function measureChromeHeight() {
    var stack = document.querySelector(".hc-chrome-stack");
    if (!stack) return 0;
    var height = Math.ceil(stack.getBoundingClientRect().height);
    if (height > 0) {
      document.documentElement.style.setProperty("--hc-chrome-h", height + "px");
    }
    return height;
  }

  var pinFrame = 0;

  function clearPinnedSidebar(wrap) {
    wrap.style.position = "";
    wrap.style.top = "";
    wrap.style.left = "";
    wrap.style.right = "";
    wrap.style.width = "";
    wrap.style.height = "";
    wrap.style.bottom = "";
    wrap.style.overflowX = "";
    wrap.style.overflowY = "";
    wrap.style.zIndex = "";
  }

  function pinSidebars() {
    var chromeH = measureChromeHeight();
    var footer = document.querySelector(".md-footer");
    var footerOverlap = 0;
    if (footer) {
      var footerTop = footer.getBoundingClientRect().top;
      if (footerTop < window.innerHeight) {
        footerOverlap = Math.max(0, window.innerHeight - footerTop);
      }
    }

    var primaryOk = window.matchMedia("(min-width: 76.25em)").matches;
    var secondaryOk = window.matchMedia("(min-width: 60em)").matches;

    document.querySelectorAll(".md-sidebar").forEach(function (sidebar) {
      var wrap = sidebar.querySelector(".md-sidebar__scrollwrap");
      if (!wrap) return;

      var isPrimary = sidebar.classList.contains("md-sidebar--primary");
      var enabled = isPrimary ? primaryOk : secondaryOk;
      if (!enabled || window.getComputedStyle(sidebar).display === "none") {
        clearPinnedSidebar(wrap);
        return;
      }

      var rect = sidebar.getBoundingClientRect();
      var height = Math.max(0, window.innerHeight - chromeH - footerOverlap);

      wrap.style.position = "fixed";
      wrap.style.top = chromeH + "px";
      wrap.style.left = rect.left + "px";
      wrap.style.width = rect.width + "px";
      wrap.style.height = height + "px";
      wrap.style.bottom = "auto";
      wrap.style.right = "auto";
      wrap.style.overflowX = "hidden";
      wrap.style.overflowY = "auto";
      wrap.style.zIndex = "2";
    });
  }

  function schedulePinSidebars() {
    if (pinFrame) return;
    pinFrame = window.requestAnimationFrame(function () {
      pinFrame = 0;
      pinSidebars();
    });
  }

  function init() {
    var locale = getLocaleFromPath();
    applyDocumentLocale(locale);
    buildChromeStack();
    pinSidebars();
    installKeyboardShortcuts();
    markTechnicalBlocks();
    localizeThemeStrings(locale);
    loadSearchIndex();

    window.addEventListener("resize", schedulePinSidebars);
    window.addEventListener("scroll", schedulePinSidebars, { passive: true });

    if (typeof document$ !== "undefined" && document$.subscribe) {
      document$.subscribe(function () {
        var current = getLocaleFromPath();
        applyDocumentLocale(current);
        markTechnicalBlocks();
        localizeThemeStrings(current);
        searchPrefix = searchBasePath();
        schedulePinSidebars();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
