document.addEventListener("DOMContentLoaded", () => {
    const THEME_KEY = "tv-theme";
    const LANG_KEY = "tv-lang";

    // أيقونات البطاقات الخاصة بصفحة الانضمام
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

    // --- جلب البيانات وتحديث الواجهة (للصفحة الحالية فقط) ---
    async function loadTranslations(lang) {
        try {
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

        const metaTitle = document.getElementById("meta-title");
        if (metaTitle) metaTitle.textContent = data.meta.title;

        const metaDesc = document.getElementById("meta-desc");
        if (metaDesc) metaDesc.setAttribute("content", data.meta.description);

        // --- تحديث محتوى (الانضمام إلينا) فقط ---
        const joinTitle = document.getElementById("join-title");
        if (joinTitle) joinTitle.textContent = data.join.title;

        const joinSub = document.getElementById("join-sub");
        if (joinSub) joinSub.textContent = data.join.sub;

        const choicesContainer = document.getElementById("choices-container");
        if (choicesContainer) {
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
        }
    }

    // --- التطبيق الأولي عند تحميل الصفحة ---
    applyTheme(getStoredTheme());
    loadTranslations(getStoredLang()).then(updateDOM);


    // =========================================================================
    // الأحداث المرتبطة بأزرار الهيدر (تنتظر إشارة layout.js لضمان وجود العناصر)
    // =========================================================================
    document.addEventListener("layoutReady", () => {

        // 1. زر تغيير المظهر
        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                const current = document.documentElement.getAttribute("data-theme");
                applyTheme(current === "dark" ? "light" : "dark");
            });
        }

        // 2. زر تغيير اللغة
        const langToggle = document.getElementById("lang-toggle");
        if (langToggle) {
            langToggle.addEventListener("click", async() => {
                const nextLang = getStoredLang() === "ar" ? "en" : "ar";
                localStorage.setItem(LANG_KEY, nextLang);

                // تحديث محتوى صفحة "انضم إلينا"
                const data = await loadTranslations(nextLang);
                updateDOM(data);

                // إعادة تشغيل دالة جلب الهيدر والفوتر لتحديث لغتهما
                if (typeof loadLayout === 'function') {
                    loadLayout();
                } else {
                    location.reload(); // إعادة تحميل الصفحة كحل بديل لضمان تحديث كل شيء
                }
            });
        }

        // 3. (Hamburger Menu)
        const navToggle = document.getElementById("nav-toggle");
        const siteHeader = document.querySelector(".site-header");

        if (navToggle && siteHeader) {
            navToggle.addEventListener("click", () => {
                const isExpanded = navToggle.getAttribute("aria-expanded") === "true";

                // عكس حالة الزر
                navToggle.setAttribute("aria-expanded", !isExpanded);

                if (!isExpanded) {
                    siteHeader.setAttribute("data-nav-open", "true");
                } else {
                    siteHeader.removeAttribute("data-nav-open");
                }
            });
        }
    });
});