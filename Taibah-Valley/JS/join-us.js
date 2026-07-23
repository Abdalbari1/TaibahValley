document.addEventListener("DOMContentLoaded", () => {
    const THEME_KEY = "tv-theme";
    const LANG_KEY = "tv-lang";

    // أيقونات البطاقات
    const icons = {
        trainee: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
        job: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
    };

    // --- إعدادات المظهر واللغة ---
    function getStoredTheme() { return localStorage.getItem(THEME_KEY) || "dark"; }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function getStoredLang() { return localStorage.getItem(LANG_KEY) || "ar"; }

    // --- جلب البيانات وتحديث الواجهة ---
    async function loadTranslations(lang) {
        try {
            // تأكد من أن مسار مجلد Lang يطابق هيكل ملفاتك (مثلا إذا كان المجلد في الجذر استخدم المسار الصحيح)
            const res = await fetch(`../Lang/join-us-${lang}.json`);
            if (!res.ok) throw new Error("Translation file not found.");
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    function updateDOM(data) {
        if (!data) return;

        // إعدادات المتصفح الأساسية
        document.documentElement.lang = data.lang;
        document.documentElement.dir = data.dir;
        document.getElementById("meta-title").textContent = data.meta.title;
        document.getElementById("meta-desc").setAttribute("content", data.meta.description);

        // 1. الشريط العلوي (الهيدر)
        document.getElementById("menu-label").textContent = data.header.menuLabel;

        // بناء روابط الهيدر الـ 9
        const navList = document.getElementById("nav-links");
        navList.innerHTML = "";
        data.header.nav.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="#">${item}</a>`;
            navList.appendChild(li);
        });

        document.getElementById("lang-toggle").textContent = data.header.langPill;
        document.getElementById("login-btn").textContent = data.header.login;
        document.getElementById("contact-btn").textContent = data.header.contact;

        // 2. المحتوى الرئيسي (الانضمام إلينا)
        document.getElementById("join-title").textContent = data.join.title;
        document.getElementById("join-sub").textContent = data.join.sub;

        const choicesContainer = document.getElementById("choices-container");
        choicesContainer.innerHTML = "";
        data.join.choices.forEach((choice, idx) => {
            const iconKey = idx === 0 ? "trainee" : "job";
            const card = document.createElement("article");
            card.className = "choice-card";
            card.innerHTML = `
        <div class="card-icon" aria-hidden="true">${icons[iconKey]}</div>
        <h2 class="card-title">${choice.name}</h2>
        <p class="card-desc">${choice.desc}</p>
        <a href="${choice.link}" class="card-btn">${choice.btnText}</a>
      `;
            choicesContainer.appendChild(card);
        });

        // 3. الشريط السفلي (الفوتر)
        // document.getElementById("footer-blurb").textContent = data.footer.blurb;
        // document.getElementById("footer-services-title").textContent = data.footer.servicesTitle;
        // document.getElementById("footer-valley-title").textContent = data.footer.valleyTitle;
        // document.getElementById("footer-policies-title").textContent = data.footer.policiesTitle;
        // document.getElementById("footer-contact-title").textContent = data.footer.contactTitle;

        // const buildList = (items, targetId) => {
        //     const target = document.getElementById(targetId);
        //     target.innerHTML = "";
        //     items.forEach(i => {
        //         const li = document.createElement("li");
        //         li.innerHTML = `<a href="#">${i}</a>`;
        //         target.appendChild(li);
        //     });
        // };

        // buildList(data.footer.footerLabs, "footer-services-list");
        // buildList(data.footer.footerValley, "footer-valley-list");

        // const emailEl = document.getElementById("footer-email");
        // emailEl.textContent = data.footer.email;
        // emailEl.href = `mailto:${data.footer.email}`;

        // const phoneEl = document.getElementById("footer-phone");
        // phoneEl.textContent = data.footer.phone;
        // phoneEl.href = `tel:${data.footer.phone.replace(/\s+/g, '')}`;

        // document.getElementById("footer-copyright").textContent = data.footer.copyright;

        // -------------------------
        // const fServices = document.getElementById("footer-services-list");
        // clear(fServices);
        // data.footer.footerLabs.forEach((label) => {
        //     const li = el("li");
        //     li.appendChild(el("a", { text: label, attrs: { href: "#" } }));
        //     fServices.appendChild(li);
        // });

        // const fValley = document.getElementById("footer-valley-list");
        // clear(fValley);
        // data.footer.footerValley.forEach((label) => {
        //     const li = el("li");
        //     li.appendChild(el("a", { text: label, attrs: { href: "#" } }));
        //     fValley.appendChild(li);
        // });

        // const fPolicies = document.getElementById("footer-policies-list");
        // clear(fPolicies);
        // data.footer.footerPolicies.forEach((label) => {
        //     const li = el("li");
        //     li.appendChild(el("a", { text: label, attrs: { href: "#" } }));
        //     fPolicies.appendChild(li);
        // });

        // const emailLink = document.getElementById("footer-email");
        // emailLink.textContent = data.footer.email;
        // emailLink.href = "mailto:" + encodeURIComponent(data.footer.email);

        // const phoneLink = document.getElementById("footer-phone");
        // phoneLink.textContent = data.footer.phone;
        // phoneLink.href = "tel:" + data.footer.phone.replace(/[^+\d]/g, "");

        // document.getElementById("footer-copyright").textContent = data.footer.copyright;


        // 3. الشريط السفلي (الفوتر) - متوافق مع الهيكل الجديد
        const blurbEl = document.getElementById("footer-blurb");
        if (blurbEl) blurbEl.textContent = data.footer.blurb;

        const sTitleEl = document.getElementById("footer-services-title");
        if (sTitleEl) sTitleEl.textContent = data.footer.servicesTitle;

        const vTitleEl = document.getElementById("footer-valley-title");
        if (vTitleEl) vTitleEl.textContent = data.footer.valleyTitle;

        const pTitleEl = document.getElementById("footer-policies-title");
        if (pTitleEl) pTitleEl.textContent = data.footer.policiesTitle;

        const cTitleEl = document.getElementById("footer-contact-title");
        if (cTitleEl) cTitleEl.textContent = data.footer.contactTitle;

        const buildList = (items, targetId) => {
            const target = document.getElementById(targetId);
            if (!target) return;
            target.innerHTML = "";
            items.forEach(i => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="#">${i}</a>`;
                target.appendChild(li);
            });
        };

        buildList(data.footer.footerLabs, "footer-services-list");
        buildList(data.footer.footerValley, "footer-valley-list");
        buildList(data.footer.footerPolicies, "footer-policies-list");

        const emailEl = document.getElementById("footer-email");
        if (emailEl) {
            emailEl.textContent = data.footer.email;
            emailEl.href = `mailto:${data.footer.email}`;
        }

        const phoneEl = document.getElementById("footer-phone");
        if (phoneEl) {
            phoneEl.textContent = data.footer.phone;
            phoneEl.href = `tel:${data.footer.phone.replace(/\s+/g, '')}`;
        }

        const copyrightEl = document.getElementById("footer-copyright");
        if (copyrightEl) {
            copyrightEl.textContent = data.footer.copyright;
        }
    }

    // --- الأحداث (Event Listeners) ---

    // زر تغيير المظهر
    applyTheme(getStoredTheme());
    document.getElementById("theme-toggle").addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
    });

    // زر تغيير اللغة
    document.getElementById("lang-toggle").addEventListener("click", async() => {
        const nextLang = getStoredLang() === "ar" ? "en" : "ar";
        localStorage.setItem(LANG_KEY, nextLang);
        const data = await loadTranslations(nextLang);
        updateDOM(data);
    });

    // قائمة الجوال (Hamburger Menu)
    const navToggle = document.getElementById("nav-toggle");
    const siteHeader = document.getElementById("site-header");

    navToggle.addEventListener("click", () => {
        const isExpanded = navToggle.getAttribute("aria-expanded") === "true";

        // عكس حالة الزر
        navToggle.setAttribute("aria-expanded", !isExpanded);

        // تفعيل الـ CSS الخاص بملف styles_2.css لفتح القائمة والأزرار
        if (!isExpanded) {
            siteHeader.setAttribute("data-nav-open", "true");
        } else {
            siteHeader.removeAttribute("data-nav-open");
        }
    });

    // التحميل الأولي
    loadTranslations(getStoredLang()).then(updateDOM);
});