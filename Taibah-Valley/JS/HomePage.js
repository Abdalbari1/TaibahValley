/**
 * Taibah Valley — site behavior.
 * Loads bilingual content from Lang/content.json and renders it with safe
 * DOM APIs (textContent / attribute setters) — never innerHTML on fetched data.
 */
(function () {
  "use strict";

  const ICONS = {
    chain: '<path d="M165.66,90.34a8,8,0,0,1,0,11.32l-64,64a8,8,0,0,1-11.32-11.32l64-64A8,8,0,0,1,165.66,90.34ZM215.6,40.4a56,56,0,0,0-79.2,0L106.34,70.46a8,8,0,0,0,11.32,11.31l30.06-30a40,40,0,0,1,56.57,56.56l-30.07,30.06a8,8,0,0,0,11.31,11.32L215.6,119.6A56,56,0,0,0,215.6,40.4ZM138.34,174.22l-30.06,30.06a40,40,0,0,1-56.56-56.57l30.05-30.05a8,8,0,0,0-11.32-11.32L40.4,136.4a56,56,0,0,0,79.2,79.2l30.06-30.07a8,8,0,0,0-11.32-11.31Z"/>',
    iot: '<path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM77.65,77.66a8,8,0,0,1,0,11.31,56,56,0,0,0,0,79.2,8,8,0,1,1-11.32,11.31,72,72,0,0,1,0-101.82A8,8,0,0,1,77.65,77.66Zm112,-11.32a72,72,0,0,1,0,101.82,8,8,0,1,1-11.31-11.31,56,56,0,0,0,0-79.2,8,8,0,0,1,11.31-11.31ZM43.72,43.72a8,8,0,0,1,0,11.32,104,104,0,0,0,0,145.92,8,8,0,1,1-11.44,11.2,120,120,0,0,1,0-168.32A8,8,0,0,1,43.72,43.72Zm180,-.08a120,120,0,0,1,0,168.32,8,8,0,1,1-11.44-11.2,104,104,0,0,0,0-145.92,8,8,0,0,1,11.44-11.2Z"/>',
    hub: '<path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.5C39.74,56.83,78.26,17.15,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"/>',
    xr: '<path d="M247.44,173.75a.68.68,0,0,0,0-.14L231.05,89.44c0-.06,0-.12,0-.18A60.08,60.08,0,0,0,172,40H84A60.08,60.08,0,0,0,25,89.26c0,.06,0,.12,0,.18L8.59,173.61a.68.68,0,0,0,0,.14,36,36,0,0,0,60.55,31.32l.09-.09L109.19,160h37.62l40,44.98.09.09a36,36,0,0,0,60.54-31.32ZM104,112H88v16a8,8,0,0,1-16,0V112H56a8,8,0,0,1,0-16H72V80a8,8,0,0,1,16,0V96h16a8,8,0,0,1,0,16Zm40-8a12,12,0,1,1,12,12A12,12,0,0,1,144,104Zm44,28a12,12,0,1,1,12-12A12,12,0,0,1,188,132Z"/>',
  };

  const HERO_IMAGE = "../Images/----mrrvkhhg-q65o.webp";
  const ABOUT_IMAGE = "../Images/--mrrvn1bu-v842.jpg";

  const THEME_KEY = "tv-theme";
  const LANG_KEY = "tv-lang";

  /** Allowlisted icon lookup — never render SVG markup that didn't come from ICONS. */
  function iconSvg(name) {
    const path = ICONS[name];
    if (!path) return "";
    return (
      '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">' +
      path +
      "</svg>"
    );
  }

  function el(tag, opts) {
    const node = document.createElement(tag);
    if (!opts) return node;
    if (opts.className) node.className = opts.className;
    if (opts.text !== undefined) node.textContent = opts.text;
    if (opts.attrs) {
      for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
    }
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* storage may be unavailable (private mode) — theme just won't persist */
    }
  }

  function getStoredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    return "dark";
  }

  function getStoredLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "ar") return saved;
    } catch (e) {}
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("ar") ? "ar" : "en";
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  function render(content, lang) {
    const t = content[lang];
    if (!t) return;

    const root = document.documentElement;
    root.lang = t.lang;
    root.dir = t.dir;

    document.title = t.meta.title;
    setMeta("description", t.meta.description);
    setMeta("keywords", t.meta.keywords);
    setMeta("og:title", t.meta.title, "property");
    setMeta("og:description", t.meta.description, "property");
    setMeta("og:locale", lang === "ar" ? "ar_SA" : "en_US", "property");

    // Nav
    const navList = document.getElementById("nav-links");
    clear(navList);
    t.nav.forEach((label) => {
      const li = el("li");
      const a = el("a", { text: label, attrs: { href: "#" } });
      li.appendChild(a);
      navList.appendChild(li);
    });

    document.getElementById("lang-pill").textContent = t.langPill;
    document.getElementById("lang-pill-footer").textContent = t.langPill;
    document.getElementById("contact-btn").textContent = t.contact;

    // Hero
    document.getElementById("hero-title").textContent = t.hero.title;
    document.getElementById("hero-sub").textContent = t.hero.sub;
    document.getElementById("hero-cta1").textContent = t.hero.cta1;
    document.getElementById("hero-cta2").textContent = t.hero.cta2;
    const heroMedia = document.getElementById("hero-media");
    heroMedia.style.backgroundImage = "url('" + HERO_IMAGE + "')";
    heroMedia.setAttribute("role", "img");
    heroMedia.setAttribute("aria-label", t.hero.imageAlt);

    // About
    document.getElementById("about-kicker").textContent = t.about.kicker;
    document.getElementById("about-title").textContent = t.about.title;
    document.getElementById("about-body").textContent = t.about.body;
    const aboutImg = document.getElementById("about-img");
    aboutImg.src = ABOUT_IMAGE;
    aboutImg.alt = t.about.imageAlt;

    const statsList = document.getElementById("stats-list");
    clear(statsList);
    t.about.stats.forEach((st) => {
      const li = el("li");
      li.appendChild(el("span", { className: "stat-value", text: st.value }));
      li.appendChild(el("span", { className: "stat-label", text: st.label }));
      statsList.appendChild(li);
    });

    // Services
    document.getElementById("services-title").textContent = t.services.title;
    document.getElementById("services-all").textContent = t.services.allLink;
    const labsGrid = document.getElementById("labs-grid");
    clear(labsGrid);
    t.services.labs.forEach((lab) => {
      const card = el("article", { className: "lab-card" });
      const iconWrap = el("div", { className: "lab-icon" });
      iconWrap.innerHTML = iconSvg(lab.icon); // safe: only allowlisted static markup from ICONS
      card.appendChild(iconWrap);
      const body = el("div", { className: "lab-body" });
      body.appendChild(el("h3", { text: lab.name }));
      body.appendChild(el("p", { text: lab.desc }));
      const link = el("button", {
        className: "section-link",
        text: t.services.learnMore + " →",
        attrs: { type: "button" },
      });
      body.appendChild(link);
      card.appendChild(body);
      labsGrid.appendChild(card);
    });

    // Partners
    document.getElementById("partners-title").textContent = t.partners.title;
    const partnersGrid = document.getElementById("partners-grid");
    clear(partnersGrid);
    t.partners.list.forEach((name) => {
      const li = el("li", { className: "partner-tile", text: name });
      partnersGrid.appendChild(li);
    });

    // News
    document.getElementById("news-title").textContent = t.news.title;
    document.getElementById("news-all").textContent = t.news.allLink;
    const newsGrid = document.getElementById("news-grid");
    clear(newsGrid);
    t.news.items.forEach((n) => {
      const card = el("button", { className: "news-card", attrs: { type: "button" } });
      const media = el("div", { className: "news-media" });
      card.appendChild(media);
      card.appendChild(
        el("span", { className: "news-meta", text: n.date + " · " + n.cat })
      );
      card.appendChild(el("span", { className: "news-title", text: n.title }));
      newsGrid.appendChild(card);
    });

    // Footer
    document.getElementById("footer-blurb").textContent = t.footer.blurb;
    document.getElementById("footer-services-title").textContent = t.footer.servicesTitle;
    document.getElementById("footer-valley-title").textContent = t.footer.valleyTitle;
    document.getElementById("footer-contact-title").textContent = t.footer.contactTitle;

    const fServices = document.getElementById("footer-services-list");
    clear(fServices);
    t.footer.footerLabs.forEach((label) => {
      const li = el("li");
      li.appendChild(el("a", { text: label, attrs: { href: "#" } }));
      fServices.appendChild(li);
    });

    const fValley = document.getElementById("footer-valley-list");
    clear(fValley);
    t.footer.footerValley.forEach((label) => {
      const li = el("li");
      li.appendChild(el("a", { text: label, attrs: { href: "#" } }));
      fValley.appendChild(li);
    });

    const emailLink = document.getElementById("footer-email");
    emailLink.textContent = t.footer.email;
    emailLink.href = "mailto:" + encodeURIComponent(t.footer.email);

    const phoneLink = document.getElementById("footer-phone");
    phoneLink.textContent = t.footer.phone;
    phoneLink.href = "tel:" + t.footer.phone.replace(/[^+\d]/g, "");

    document.getElementById("footer-copyright").textContent = t.footer.copyright;

    // Structured data (JSON-LD) for SEO — rebuilt from trusted static fields only.
    updateStructuredData(t);
  }

  function setMeta(name, value, attr) {
    const selectorAttr = attr || "name";
    let node = document.querySelector('meta[' + selectorAttr + '="' + name + '"]');
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(selectorAttr, name);
      document.head.appendChild(node);
    }
    node.setAttribute("content", value);
  }

  function updateStructuredData(t) {
    let script = document.getElementById("ld-json");
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "ld-json";
      document.head.appendChild(script);
    }
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: t.lang === "ar" ? "وادي طيبة" : "Taibah Valley",
      url: "https://www.taibahvalley.com.sa/",
      logo: "../Images/logo-white.png",
      email: t.footer.email,
      telephone: t.footer.phone,
      description: t.meta.description,
    };
    script.textContent = JSON.stringify(data);
  }

  async function loadContent() {
    const status = document.getElementById("load-status");
    try {
      const res = await fetch("../Lang/content.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const content = await res.json();
      if (status) status.remove();
      return content;
    } catch (err) {
      if (status) {
        status.textContent =
          "Could not load site content. If you opened this file directly, please serve it over http:// (e.g. `npx serve`) so Lang/content.json can be fetched.";
      }
      return null;
    }
  }

  function initTheme() {
    applyTheme(getStoredTheme());
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initLangToggles(content, state) {
    const toggle = () => {
      state.lang = state.lang === "ar" ? "en" : "ar";
      setStoredLang(state.lang);
      render(content, state.lang);
    };
    document.getElementById("lang-toggle").addEventListener("click", toggle);
    document.getElementById("lang-toggle-footer").addEventListener("click", toggle);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    const content = await loadContent();
    if (!content) return;
    const state = { lang: getStoredLang() };
    render(content, state.lang);
    initLangToggles(content, state);
  });
})();
