(async function () {
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function createTrackingPixel(url) {
     console.log("line 11 url => ",url)
    var img = document.createElement("img");
    img.src = url;
    img.style.width = "1px";
    img.style.height = "1px";
    img.style.display = "none";
    document.body.appendChild(img);
  }

  async function initTracking() {
    try {
      let uniqueId = getCookie("tracking_uuid") || generateUUID();
      let expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
      document.cookie =
        "tracking_uuid=" + uniqueId + "; expires=" + expires + ";path=/;";

     console.log("line 26 => ")
      let result = {
        success: true,
        affiliate_url:
          "https://tracking.icubeswire.co/aff_c?offer_id=5779&aff_id=465&url_id=10328",
      };

      if (result.success && result.affiliate_url) {
        createTrackingPixel(result.affiliate_url);
        sessionStorage.setItem("iframe_triggered", "true");
      } else {
        createTrackingPixel(
          "https://api.discountshop.com/api/fallback-pixel?id=" + uniqueId
        );
      }
    } catch (error) {
      console.error("Error in tracking script:", error);
    }
  }

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function isCartPage() {
    const cartPages = ["/cart", "/checkout"];
    return cartPages.some((path) => window.location.pathname.includes(path));
  }

 
  window.addEventListener("DOMContentLoaded", function () {
    if (isCartPage()) {
     
      setTimeout(initTracking, 2000);
    } else {
      initTracking();
    }
  });

  initTracking();
})();
