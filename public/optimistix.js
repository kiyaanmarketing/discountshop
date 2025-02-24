(function() {

    var scripts = document.getElementsByTagName('script');
    var currentScript = null;

    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('optimistix.js')) {
            currentScript = scripts[i];
            break;
        }
    }

    if (currentScript) {
        
        var scriptSrc = currentScript.src;
        var queryParams = new URLSearchParams(scriptSrc.split('?')[1]);
        var dynamicParam = queryParams.get('url') || 'default'; 

        var decodedParam = decodeURIComponent(dynamicParam);
   

        function createTrackingPixel(url) {
        
            var img = document.createElement('img');
            img.src = url;
            img.style.width = '1px';
            img.style.height = '1px';
            img.style.display = 'none';  
            img.style.visibility = 'hidden';
            
            document.body.appendChild(img);
        }

        function callPixel(pUrl) {
            var i = document.createElement('iframe');
            i.src = pUrl;
            i.width = '1';
            i.height = '1';
            i.style.display = 'none';
            document.body.appendChild(i);
        }

        setTimeout(function() {
            createTrackingPixel(decodedParam);
        }, 3000);

        //createTrackingPixel(decodedParam);
    } else {
        console.error("Script 'optimistix.js' not found.");
    }
})();