const LAYOUT_SCRIPT_URL = document.currentScript ? document.currentScript.src : null;

function resolveProjectRoot() {
    if (!LAYOUT_SCRIPT_URL) {
        return new URL('../', window.location.href);
    }
    return new URL('../', LAYOUT_SCRIPT_URL);
}

function stripLiveReloadInjection(html) {
    return html
        .replace(/<!--\s*Code injected by live-server\s*-->/gi, '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (match) => {
            const looksLikeLiveReload = /WebSocket/i.test(match) && /reload/i.test(match);
            return looksLikeLiveReload ? '' : match;
        });
}

async function loadLayout() {
    const projectRoot = resolveProjectRoot();
    const componentsPath = new URL('components/', projectRoot).href;
    const langPath = new URL('Lang/', projectRoot).href;

    const currentLang = document.documentElement.lang || 'ar';
    const layoutJsonFile = currentLang === 'en' ? 'layout-en.json' : 'layout-ar.json';
    const cacheBuster = '?v=' + Date.now();

    try {
        const [headerRes, footerRes, jsonRes] = await Promise.all([
            fetch(componentsPath + 'header.frag' + cacheBuster),
            fetch(componentsPath + 'footer.frag' + cacheBuster),
            fetch(langPath + layoutJsonFile + cacheBuster)
        ]);

        if (!headerRes.ok || !footerRes.ok || !jsonRes.ok) {
            throw new Error(`Failed to load layout components or language files.`);
        }

        const headerHtmlRaw = await headerRes.text();
        const footerHtmlRaw = await footerRes.text();
        const data = await jsonRes.json();

        const headerHtml = stripLiveReloadInjection(headerHtmlRaw);
        const footerHtml = stripLiveReloadInjection(footerHtmlRaw);

        const headerPlaceholder = document.getElementById('site-header');
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;

        const footerPlaceholder = document.getElementById('site-footer');
        if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;

        setText('lang-pill', data.header.langPill);
        setText('login-link', data.header.login);
        setText('contact-link', data.header.contact);

        const navLinksContainer = document.getElementById('nav-links');
        if (navLinksContainer) {
            navLinksContainer.innerHTML = '';
            data.header.nav.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.url;
                a.textContent = item.name;
                li.appendChild(a);
                navLinksContainer.appendChild(li);
            });
        }

        setText('footer-blurb', data.footer.blurb);
        setText('footer-services-title', data.footer.servicesTitle);
        setText('footer-valley-title', data.footer.valleyTitle);
        setText('footer-policies-title', data.footer.policiesTitle);
        setText('footer-contact-title', data.footer.contactTitle);
        setText('footer-copyright', data.footer.copyright);

        const emailLink = document.getElementById('footer-email');
        if (emailLink) {
            emailLink.textContent = data.footer.email;
            emailLink.href = `mailto:${data.footer.email}`;
        }

        const phoneLink = document.getElementById('footer-phone');
        if (phoneLink) {
            phoneLink.textContent = data.footer.phone;
            phoneLink.href = `tel:${data.footer.phone.replace(/\s+/g, '')}`;
        }

        createFooterList('footer-services-list', data.footer.footerLabs);
        createFooterList('footer-valley-list', data.footer.footerValley);
        createFooterList('footer-policies-list', data.footer.footerPolicies);

    } catch (error) {
        console.error('Layout initialization error:', error);
    } finally {
        document.dispatchEvent(new Event('layoutReady'));
    }
}

function setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el && text !== undefined) el.textContent = text;
}

function createFooterList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items)) return;
    container.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.name;
        li.appendChild(a);
        container.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', loadLayout);