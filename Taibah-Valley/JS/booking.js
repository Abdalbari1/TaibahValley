/**
 * Booking page behavior.
 * Renders every visible string from translation JSON files using safe DOM APIs.
 */
(function () {
  "use strict";

  const BOOKING_URL = "https://taibahvalley.com.sa/book-now/";
  const LANGUAGE_PATHS = {
    ar: "../Lang/booking_ar.json",
    en: "../Lang/booking_en.json",
  };
  const STORAGE_KEYS = {
    language: "tv-lang",
    theme: "tv-theme",
  };
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const translationCache = new Map();

  const ICONS = {
    workspace: [
      { tag: "rect", x: "3", y: "4", width: "18", height: "14", rx: "2" },
      { tag: "path", d: "M8 21h8" },
      { tag: "path", d: "M12 18v3" },
      { tag: "path", d: "M7 9h10" },
      { tag: "path", d: "M7 13h6" },
    ],
    avenue: [
      { tag: "path", d: "M4 19 12 3l8 16" },
      { tag: "path", d: "M8 19h8" },
      { tag: "path", d: "M10 14h4" },
      { tag: "path", d: "M12 3v16" },
    ],
    halls: [
      { tag: "rect", x: "4", y: "5", width: "16", height: "14", rx: "2" },
      { tag: "path", d: "M8 5V3" },
      { tag: "path", d: "M16 5V3" },
      { tag: "path", d: "M4 10h16" },
      { tag: "path", d: "m8.5 15 2 2 5-5" },
    ],
    arrow: [
      { tag: "path", d: "M5 12h14" },
      { tag: "path", d: "m13 6 6 6-6 6" },
    ],
    x: [
      { tag: "path", fill: "currentColor", stroke: "none", d: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L1.2 2h6.5l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L7 3.8H5.1l12.7 16.3Z" },
    ],
    linkedin: [
      { tag: "path", fill: "currentColor", stroke: "none", d: "M20.4 3H3.6A.6.6 0 0 0 3 3.6v16.8a.6.6 0 0 0 .6.6h16.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6ZM8.3 18.4H5.7V9.6h2.6v8.8ZM7 8.4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11.4 10h-2.6v-4.3c0-1-.02-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2v4.4h-2.6V9.6h2.5v1.2h.04a2.8 2.8 0 0 1 2.5-1.4c2.7 0 3.2 1.8 3.2 4v5Z" },
    ],
    instagram: [
      { tag: "rect", x: "3", y: "3", width: "18", height: "18", rx: "5" },
      { tag: "circle", cx: "12", cy: "12", r: "4" },
      { tag: "circle", cx: "17.2", cy: "6.8", r: "0.8", fill: "currentColor", stroke: "none" },
    ],
    youtube: [
      { tag: "path", fill: "currentColor", stroke: "none", d: "M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.8 12 3.8 12 3.8s-7.5 0-9.4.6A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5ZM9.7 15.5V8.5L15.8 12l-6.1 3.5Z" },
    ],
  };

  const state = {
    content: null,
    language: getStoredLanguage(),
    theme: getStoredTheme(),
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createElement(tag, options) {
    const node = document.createElement(tag);
    const settings = options || {};

    if (settings.className) {
      node.className = settings.className;
    }

    if (settings.text !== undefined) {
      node.textContent = settings.text;
    }

    if (settings.attributes) {
      Object.entries(settings.attributes).forEach(function (entry) {
        node.setAttribute(entry[0], entry[1]);
      });
    }

    return node;
  }

  function createIcon(name) {
    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    const shapes = ICONS[name] || ICONS.workspace;

    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    shapes.forEach(function (shape) {
      const element = document.createElementNS(SVG_NAMESPACE, shape.tag);
      Object.entries(shape).forEach(function (entry) {
        if (entry[0] !== "tag") {
          element.setAttribute(entry[0], entry[1]);
        }
      });
      svg.appendChild(element);
    });

    return svg;
  }

  function setText(id, value) {
    const node = byId(id);
    if (node) {
      node.textContent = value || "";
    }
  }

  function setAttribute(id, name, value) {
    const node = byId(id);
    if (node) {
      node.setAttribute(name, value || "");
    }
  }

  function safeHref(value) {
    if (typeof value !== "string" || !value.trim()) {
      return "#";
    }

    try {
      const parsed = new URL(value, window.location.href);
      if (["http:", "https:", "mailto:", "tel:"].indexOf(parsed.protocol) !== -1) {
        return value;
      }
    } catch (error) {
      return "#";
    }

    return "#";
  }

  function configureLink(node, href) {
    const safe = safeHref(href);
    node.href = safe;

    if (/^https?:\/\//i.test(safe)) {
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    } else {
      node.removeAttribute("target");
      node.removeAttribute("rel");
    }
  }

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.theme);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch (error) {
      return "dark";
    }

    return "dark";
  }

  function getStoredLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.language);
      if (stored === "ar" || stored === "en") {
        return stored;
      }
    } catch (error) {
      return getBrowserLanguage();
    }

    return getBrowserLanguage();
  }

  function getBrowserLanguage() {
    return (navigator.language || "ar").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }

  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      /* Storage can be unavailable in private browsing. */
    }
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    saveSetting(STORAGE_KEYS.theme, theme);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#341a52" : "#ffffff");
    }
  }

  function renderThemeControl(content) {
    if (!content) {
      return;
    }

    setAttribute("theme-toggle", "aria-label", state.theme === "dark" ? content.labels.toggleLight : content.labels.toggleDark);
  }

  function setMetadata(content) {
    document.title = content.meta.title;
    setMeta("description", content.meta.description, "name");
    setMeta("keywords", content.meta.keywords, "name");
    setMeta("og:title", content.meta.title, "property");
    setMeta("og:description", content.meta.description, "property");
    setMeta("og:locale", content.meta.locale, "property");
    setMeta("twitter:title", content.meta.title, "name");
    setMeta("twitter:description", content.meta.description, "name");

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = content.meta.canonical;
    }

    updateStructuredData(content);
  }

  function setMeta(name, value, attribute) {
    const attr = attribute || "name";
    let node = document.querySelector("meta[" + attr + "=\"" + name + "\"]");

    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attr, name);
      document.head.appendChild(node);
    }

    node.setAttribute("content", value || "");
  }

  function updateStructuredData(content) {
    let script = byId("booking-ld-json");

    if (!script) {
      script = document.createElement("script");
      script.id = "booking-ld-json";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: content.meta.title,
      description: content.meta.description,
      url: content.meta.canonical,
      inLanguage: content.lang,
      isPartOf: {
        "@type": "WebSite",
        name: content.site.name,
        url: content.site.url,
      },
    });
  }

  function renderHeader(content) {
    setText("skip-link", content.labels.skipToContent);
    setAttribute("brand-link", "aria-label", content.labels.siteHome);
    setAttribute("brand-logo", "alt", content.labels.logoAlt);
    setAttribute("primary-navigation", "aria-label", content.labels.primaryNavigation);
    setAttribute("nav-toggle", "aria-label", content.labels.openMenu);
    setText("lang-pill", content.labels.langPill);
    setAttribute("lang-toggle", "aria-label", content.labels.switchLanguage);
    setText("login-link", content.actions.login);
    setText("contact-link", content.actions.contact);

    const navList = byId("nav-links");
    clear(navList);

    content.nav.forEach(function (item) {
      const listItem = createElement("li");
      const link = createElement("a", { text: item.label });
      configureLink(link, item.href);
      if (item.current) {
        link.setAttribute("aria-current", "page");
      }
      listItem.appendChild(link);
      navList.appendChild(listItem);
    });

    renderThemeControl(content);
  }

  function renderHero(content) {
    setText("hero-kicker", content.hero.kicker);
    setText("hero-title", content.hero.title);
    setText("hero-description", content.hero.description);
    setText("hero-cta", content.hero.cta);
    setAttribute("hero-image", "alt", content.hero.imageAlt);
  }

  function renderCards(content) {
    setText("options-kicker", content.options.kicker);
    setText("options-title", content.options.title);
    setText("options-description", content.options.description);

    const cards = byId("booking-cards");
    clear(cards);

    content.options.items.forEach(function (item) {
      const card = createElement("a", {
        className: "booking-card",
        attributes: { "aria-label": item.ariaLabel },
      });
      const top = createElement("div", { className: "booking-card__top" });
      const title = createElement("h3", { text: item.title });
      const icon = createElement("span", { className: "booking-card__icon" });
      const text = createElement("p", { text: item.description });
      const times = createElement("ul", { className: "booking-card__times" });
      const action = createElement("span", { className: "booking-card__link" });

      configureLink(card, BOOKING_URL);
      icon.appendChild(createIcon(item.icon));
      top.appendChild(title);
      top.appendChild(icon);
      card.appendChild(top);
      card.appendChild(text);

      item.times.forEach(function (time) {
        const listItem = createElement("li");
        listItem.appendChild(createElement("span", { className: "booking-card__period", text: time.label }));
        listItem.appendChild(createElement("span", { className: "booking-card__time", text: time.value }));
        times.appendChild(listItem);
      });

      action.textContent = content.options.action;
      action.appendChild(createIcon("arrow"));
      card.appendChild(times);
      card.appendChild(action);
      cards.appendChild(card);
    });
  }

  function renderNote(content) {
    setText("note-title", content.note.title);
    setText("note-body", content.note.body);
  }

  function renderFooterList(listId, items) {
    const list = byId(listId);
    clear(list);

    items.forEach(function (item) {
      const listItem = createElement("li");
      const link = createElement("a", { text: item.label });
      configureLink(link, item.href);
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
  }

  function renderSocialLinks(items) {
    const container = byId("social-links");
    clear(container);

    items.forEach(function (item) {
      const link = createElement("a", { attributes: { "aria-label": item.label } });
      configureLink(link, item.href);
      link.appendChild(createIcon(item.icon));
      container.appendChild(link);
    });
  }

  function renderFooter(content) {
    setAttribute("footer-brand-link", "aria-label", content.labels.siteHome);
    setAttribute("footer-logo", "alt", content.labels.logoAlt);
    setText("footer-blurb", content.footer.blurb);
    setText("footer-services-title", content.footer.servicesTitle);
    setText("footer-valley-title", content.footer.valleyTitle);
    setText("footer-policies-title", content.footer.policiesTitle);
    setText("footer-contact-title", content.footer.contactTitle);
    setText("footer-copyright", content.footer.copyright);

    renderFooterList("footer-services-list", content.footer.services);
    renderFooterList("footer-valley-list", content.footer.valley);
    renderFooterList("footer-policies-list", content.footer.policies);
    renderSocialLinks(content.footer.social);

    const email = byId("footer-email");
    email.textContent = content.footer.email;
    configureLink(email, "mailto:" + content.footer.email);

    const phone = byId("footer-phone");
    phone.textContent = content.footer.phone;
    configureLink(phone, "tel:" + content.footer.phone.replace(/[^+\d]/g, ""));
  }

  function render(content) {
    state.content = content;
    document.documentElement.lang = content.lang;
    document.documentElement.dir = content.dir;

    setMetadata(content);
    renderHeader(content);
    renderHero(content);
    renderCards(content);
    renderNote(content);
    renderFooter(content);
    setText("load-status", "");
  }

  async function loadTranslation(language) {
    if (translationCache.has(language)) {
      return translationCache.get(language);
    }

    const response = await fetch(LANGUAGE_PATHS[language], { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load translation");
    }

    const content = await response.json();
    translationCache.set(language, content);
    return content;
  }

  async function switchLanguage() {
    const nextLanguage = state.language === "ar" ? "en" : "ar";

    try {
      const content = await loadTranslation(nextLanguage);
      state.language = nextLanguage;
      saveSetting(STORAGE_KEYS.language, nextLanguage);
      setMenuOpen(false);
      render(content);
    } catch (error) {
      if (state.content) {
        setText("load-status", state.content.labels.contentError);
      }
    }
  }

  function setMenuOpen(isOpen) {
    const header = byId("top");
    const toggle = byId("nav-toggle");

    header.setAttribute("data-nav-open", String(isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (state.content) {
      toggle.setAttribute("aria-label", isOpen ? state.content.labels.closeMenu : state.content.labels.openMenu);
    }
  }

  function bindEvents() {
    byId("theme-toggle").addEventListener("click", function () {
      applyTheme(state.theme === "dark" ? "light" : "dark");
      renderThemeControl(state.content);
    });

    byId("lang-toggle").addEventListener("click", switchLanguage);

    byId("nav-toggle").addEventListener("click", function () {
      const isOpen = byId("top").getAttribute("data-nav-open") === "true";
      setMenuOpen(!isOpen);
    });

    byId("nav-links").addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) {
        setMenuOpen(false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    applyTheme(state.theme);
    bindEvents();

    try {
      const content = await loadTranslation(state.language);
      render(content);
    } catch (error) {
      setText("load-status", "");
    }
  });
})();
