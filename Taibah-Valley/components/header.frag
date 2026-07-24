<header class="site-header booking-header" id="top">
    <a class="logo" id="brand-link" href="HomePage.html" aria-label="">
        <img id="brand-logo" src="../Images/logo-white.png" alt="" width="160" height="40">
    </a>

    <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="">
        <svg class="icon-menu" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
        <svg class="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
    </button>

    <nav id="primary-navigation" aria-label="">
        <!-- الـ id هنا هو ما يبحث عنه layout.js لتعبئة روابط القائمة الـ 9 -->
        <ul class="nav-links" id="nav-links"></ul>
    </nav>

    <div class="nav-actions">
        <button class="theme-toggle" id="theme-toggle" type="button" aria-label="">
            <span class="knob" aria-hidden="true">
                <svg class="icon-moon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#341a52" stroke-width="2.4" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"></path></svg>
                <svg class="icon-sun" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#341a52" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"></path></svg>
            </span>
        </button>

        <!-- زر اللغة ويحتوي على span يحمل id="lang-pill" -->
        <button class="pill-btn" id="lang-toggle" type="button" aria-label="">
            <span id="lang-pill"></span>
        </button>

        <!-- زر تسجيل الدخول -->
        <a class="btn-primary" id="login-link" href="#"></a>

        <!-- زر تواصل معنا -->
        <a class="pill-btn" id="contact-link" href="#footer-contact"></a>
    </div>
</header>