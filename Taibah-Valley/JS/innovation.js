/**
 * Innovation Hub page behavior.
 * Content is rendered from the selected language JSON using safe DOM APIs.
 */
(function () {
  "use strict";

  const LANGUAGE_PATHS = {
    ar: "../Lang/innovation_ar.json",
    en: "../Lang/innovation_en.json",
  };

  const STORAGE_KEYS = {
    language: "tv-lang",
    theme: "tv-theme",
  };

  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const translationCache = new Map();

  const ICONS = {
    training: [
      { tag: "path", d: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" },
      { tag: "path", d: "M4 5.5v16" },
      { tag: "path", d: "M8 7h8" },
      { tag: "path", d: "M8 11h8" },
    ],
    consulting: [
      { tag: "path", d: "M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.7-.8L4 20l1.4-3.8A7.1 7.1 0 0 1 4 11.5a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z" },
      { tag: "path", d: "M8.5 11.5h.01" },
      { tag: "path", d: "M12 11.5h.01" },
      { tag: "path", d: "M15.5 11.5h.01" },
    ],
    events: [
      { tag: "rect", x: "3.5", y: "5.5", width: "17", height: "15", rx: "2" },
      { tag: "path", d: "M7.5 3v5" },
      { tag: "path", d: "M16.5 3v5" },
      { tag: "path", d: "M3.5 10h17" },
      { tag: "path", d: "M8 14h.01" },
      { tag: "path", d: "M12 14h.01" },
      { tag: "path", d: "M16 14h.01" },
    ],
    workspace: [
      { tag: "rect", x: "3", y: "3", width: "7", height: "7", rx: "1" },
      { tag: "rect", x: "14", y: "3", width: "7", height: "7", rx: "1" },
      { tag: "rect", x: "3", y: "14", width: "7", height: "7", rx: "1" },
      { tag: "rect", x: "14", y: "14", width: "7", height: "7", rx: "1" },
    ],
    incubator: [
      { tag: "path", d: "M14 4c2.8-.3 4.7.4 6 1.8-1.4 1.3-3.2 2.2-5.5 2.4" },
      { tag: "path", d: "M9.7 14.3 4 20l-1-5 5.7-5.7A7.4 7.4 0 0 1 15 7c1.6.2 2.8 1.4 3 3a7.4 7.4 0 0 1-2.3 6.3Z" },
      { tag: "path", d: "M9 15 4 10l1.5-1.5" },
      { tag: "path", d: "M14 20l-5-5" },
    ],
    meetup: [
      { tag: "circle", cx: "9", cy: "8", r: "3" },
      { tag: "path", d: "M3.5 20c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5" },
      { tag: "path", d: "M16 5.5a2.8 2.8 0 0 1 0 5.4" },
      { tag: "path", d: "M17 15.2c2 .3 3.3 1.8 3.7 4.8" },
    ],
    competitions: [
      { tag: "circle", cx: "12", cy: "8", r: "4.5" },
      { tag: "path", d: "m8.8 11.2-1.1 8.3L12 17l4.3 2.5-1.1-8.3" },
      { tag: "path", d: "m12 5.8.7 1.4 1.6.2-1.2 1.1.3 1.6-1.4-.7-1.4.7.3-1.6-1.2-1.1 1.6-.2Z" },
    ],
    funding: [
      { tag: "path", d: "M4 20V10" },
      { tag: "path", d: "M10 20V4" },
      { tag: "path", d: "M16 20v-7" },
      { tag: "path", d: "M22 20H2" },
      { tag: "path", d: "m15 7 3-3 3 3" },
    ],
    admin: [
      { tag: "path", d: "M4 7h7" },
      { tag: "path", d: "M15 7h5" },
      { tag: "circle", cx: "13", cy: "7", r: "2" },
      { tag: "path", d: "M4 17h3" },
      { tag: "path", d: "M11 17h9" },
      { tag: "circle", cx: "9", cy: "17", r: "2" },
    ],
    booking: [
      { tag: "rect", x: "4", y: "5", width: "16", height: "15", rx: "2" },
      { tag: "path", d: "M8 3v4" },
      { tag: "path", d: "M16 3v4" },
      { tag: "path", d: "M4 10h16" },
      { tag: "path", d: "m8.5 15 2 2 4.5-4.5" },
    ],
    experts: [
      { tag: "circle", cx: "12", cy: "8", r: "3.3" },
      { tag: "path", d: "M5.5 20c.6-3.7 2.7-5.6 6.5-5.6s5.9 1.9 6.5 5.6" },
      { tag: "path", d: "M19.5 7.5v4" },
      { tag: "path", d: "M17.5 9.5h4" },
    ],
    talent: [
      { tag: "path", d: "m12 3 1.9 4.2 4.6.5-3.4 3.1 1 4.5-4.1-2.4-4.1 2.4 1-4.5-3.4-3.1 4.6-.5Z" },
      { tag: "path", d: "M7.5 17.8v2.7h9v-2.7" },
    ],
    patent: [
      { tag: "path", d: "M9 19h6" },
      { tag: "path", d: "M10 22h4" },
      { tag: "path", d: "M8.3 15.6A7 7 0 1 1 15.7 15.6c-.9.8-1.7 1.8-1.7 3.1h-4c0-1.3-.8-2.3-1.7-3.1Z" },
      { tag: "path", d: "M12 5.5v4" },
    ],
    idea: [
      { tag: "path", d: "M9 18h6" },
      { tag: "path", d: "M10 21h4" },
      { tag: "path", d: "M8.2 15.5A6.5 6.5 0 1 1 15.8 15.5c-1 .8-1.8 1.8-1.8 3H10c0-1.2-.8-2.2-1.8-3Z" },
      { tag: "path", d: "M12 3v1.5" },
      { tag: "path", d: "m5.6 5.6 1.1 1.1" },
      { tag: "path", d: "m18.4 5.6-1.1 1.1" },
    ],
    guidance: [
      { tag: "path", d: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" },
      { tag: "path", d: "M4 5.5v16" },
      { tag: "path", d: "m9 12 2 2 4-4" },
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
  };

  const state = {
    content: null,
    isMenuOpen: false,
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
    const shapes = ICONS[name] || ICONS.idea;

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
      const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
      if (allowedProtocols.indexOf(parsed.protocol) !== -1 || parsed.origin === window.location.origin) {
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
    return (navigator.language || "en").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }

  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      /* Private browsing can make storage unavailable. */
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

    const label = state.theme === "dark" ? content.labels.toggleLight : content.labels.toggleDark;
    setAttribute("theme-toggle", "aria-label", label);
    setAttribute("theme-toggle", "aria-checked", String(state.theme === "dark"));
  }

  function updateMenuState() {
    const header = byId("top");
    const menuButton = byId("menu-toggle");

    if (header) {
      header.classList.toggle("is-menu-open", state.isMenuOpen);
    }

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", String(state.isMenuOpen));
      if (state.content) {
        menuButton.setAttribute(
          "aria-label",
          state.isMenuOpen ? state.content.labels.closeMenu : state.content.labels.openMenu
        );
      }
    }
  }

  function closeMenu() {
    state.isMenuOpen = false;
    updateMenuState();
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
    let node = document.querySelector('meta[' + attr + '="' + name + '"]');

    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attr, name);
      document.head.appendChild(node);
    }

    node.setAttribute("content", value || "");
  }

  function updateStructuredData(content) {
    let script = byId("innovation-ld-json");

    if (!script) {
      script = document.createElement("script");
      script.id = "innovation-ld-json";
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
    setText("lang-pill", content.labels.langPill);
    setText("lang-pill-footer", content.labels.langPill);
    setAttribute("lang-toggle", "aria-label", content.labels.switchLanguage);
    setAttribute("lang-toggle-footer", "aria-label", content.labels.switchLanguage);
    setText("login-btn", content.actions.login);
    setText("contact-btn", content.actions.contact);
    setText("mobile-login-btn", content.actions.login);
    setText("mobile-contact-btn", content.actions.contact);

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
    updateMenuState();
  }

  function renderHero(content) {
    setText("hero-kicker", content.hero.kicker);
    setText("hero-title", content.hero.title);
    setText("hero-lead", content.hero.lead);

    const audience = byId("hero-audience-list");
    clear(audience);
    content.hero.audience.forEach(function (item) {
      audience.appendChild(createElement("li", { text: item }));
    });

    const primary = byId("hero-primary-cta");
    primary.textContent = content.hero.primaryCta.label;
    configureLink(primary, content.hero.primaryCta.href);

    const secondary = byId("hero-secondary-cta");
    secondary.textContent = content.hero.secondaryCta.label;
    configureLink(secondary, content.hero.secondaryCta.href);
  }

  function renderOverview(content) {
    setText("overview-kicker", content.overview.kicker);
    setText("overview-title", content.overview.title);
    setText("overview-body", content.overview.body);
    setText("overview-note", content.overview.note);

    const email = byId("overview-email");
    email.textContent = content.overview.email;
    configureLink(email, "mailto:" + content.overview.email);
  }

  function renderServices(content) {
    setText("services-kicker", content.services.kicker);
    setText("services-title", content.services.title);
    setText("services-intro", content.services.intro);

    const grid = byId("services-grid");
    clear(grid);

    content.services.items.forEach(function (item) {
      const listItem = createElement("li");
      const card = createElement("article", { className: "innovation-service-card" });
      const top = createElement("div", { className: "innovation-service-card__top" });
      const number = createElement("span", {
        className: "innovation-service-card__number",
        text: item.number,
      });
      const icon = createElement("span", { className: "innovation-icon" });
      icon.appendChild(createIcon(item.icon));
      top.appendChild(number);
      top.appendChild(icon);
      card.appendChild(top);
      card.appendChild(createElement("h3", { text: item.title }));
      card.appendChild(createElement("p", { text: item.description }));
      listItem.appendChild(card);
      grid.appendChild(listItem);
    });
  }

  function renderPlatforms(content) {
    setText("platforms-kicker", content.platforms.kicker);
    setText("platforms-title", content.platforms.title);
    setText("platforms-intro", content.platforms.intro);

    const board = byId("platform-board");
    clear(board);

    content.platforms.groups.forEach(function (group) {
      const column = createElement("ul", { className: "innovation-platform-column" });

      group.forEach(function (item) {
        const listItem = createElement("li");
        const link = createElement("a", { className: "innovation-platform-link" });
        const icon = createElement("span", { className: "innovation-platform-link__icon" });
        const title = createElement("span", {
          className: "innovation-platform-link__title",
          text: item.title,
        });
        const arrow = createElement("span", { className: "innovation-platform-link__arrow" });

        icon.appendChild(createIcon(item.icon));
        arrow.appendChild(createIcon("arrow"));
        configureLink(link, item.href);
        link.appendChild(icon);
        link.appendChild(title);
        link.appendChild(arrow);
        listItem.appendChild(link);
        column.appendChild(listItem);
      });

      board.appendChild(column);
    });
  }

  function renderManifesto(content) {
    setText("manifesto-kicker", content.manifesto.kicker);
    setText("manifesto-title", content.manifesto.title);
    setText("manifesto-quote", content.manifesto.quote);
    setText("manifesto-body", content.manifesto.body);

    const link = byId("manifesto-cta");
    link.textContent = content.manifesto.cta.label;
    configureLink(link, content.manifesto.cta.href);
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
    setText("footer-contact-title", content.footer.contactTitle);
    setText("footer-copyright", content.footer.copyright);

    renderFooterList("footer-services-list", content.footer.services);
    renderFooterList("footer-valley-list", content.footer.valley);
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
    renderOverview(content);
    renderServices(content);
    renderPlatforms(content);
    renderManifesto(content);
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
      closeMenu();
      render(content);
    } catch (error) {
      if (state.content) {
        setText("load-status", state.content.labels.contentError);
      }
    }
  }

  function scrollToContact() {
    const contact = byId("footer-contact");
    if (contact) {
      contact.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    closeMenu();
  }

  function bindEvents() {
    byId("theme-toggle").addEventListener("click", function () {
      applyTheme(state.theme === "dark" ? "light" : "dark");
      renderThemeControl(state.content);
    });

    byId("lang-toggle").addEventListener("click", switchLanguage);
    byId("lang-toggle-footer").addEventListener("click", switchLanguage);

    byId("menu-toggle").addEventListener("click", function () {
      state.isMenuOpen = !state.isMenuOpen;
      updateMenuState();
    });

    byId("contact-btn").addEventListener("click", scrollToContact);
    byId("mobile-contact-btn").addEventListener("click", scrollToContact);
    byId("mobile-login-btn").addEventListener("click", closeMenu);
    byId("login-btn").addEventListener("click", function () {
      const platforms = byId("platforms");
      if (platforms) {
        platforms.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    byId("primary-navigation").addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.isMenuOpen) {
        closeMenu();
        byId("menu-toggle").focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 640 && state.isMenuOpen) {
        closeMenu();
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
