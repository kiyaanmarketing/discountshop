const express = require("express");
const bodyParser = require("body-parser");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("./aws-config");
const cors = require("cors");
const session = require('express-session');
require("dotenv").config();
const corsMiddleware = require("./middleware/corsMiddleware");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const trackingRoutes = require('./routes/tracking');
const trackingRoutesNew = require('./routes/trackingNew');
const app = express();
const port = process.env.PORT || 4005;
app.use(express.json());
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cors());

// app.post("/api/save-client-data", async (req, res) => {
//   const { clientId, referrer, utmSource, utmMedium, utmCampaign } = req.body;

//   const params = {
//     TableName: "ClientData",
//     Item: {
//       clientId,
//       referrer,
//       utmSource,
//       utmMedium,
//       utmCampaign,
//     },
//   };

//   try {
//     await dynamoDb.send(new PutCommand(params));
//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Error saving data to DynamoDB:", error);
//     res.status(500).json({ success: false, error: "Failed to save data" });
//   }
// });



function getCurrentDateTime() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Asia/Kolkata",
  };

  const dateTime = new Date().toLocaleDateString("en-IN", options);
  return dateTime;
}

const currentDateTime = getCurrentDateTime();

// Get Tracked All Data
 const getAllHostName = async (TableName) => {
  try {
    const params = {
      TableName: TableName
    };
    const result = await dynamoDb.send(new ScanCommand(params));
    return result.Items;
  } catch (err) {
    console.error('Error retrieving tracking All data:', err);
    res.status(500).json({ error: 'Error retrieving tracking All data' });
  }
};

//console.log("getAllHostName",getAllHostName('AffiliateUrls').then((result) => console.log("prom result=> ",result)))
//  getAllHostName('MuiltiRetag').then((result) =>
//  console.log("Arru => ",affiliate_urlArr = result.map(item => item.affiliateUrl)) )

 

const getAffiliateUrlByHostNameFind = async (hostname,TableName) => {
  try {
    // Fetch all hostnames and affiliate URLs from DynamoDB
    const allHostNames = await getAllHostName(TableName);
    
    // Find the entry where the hostname matches
    const matchedEntry = allHostNames.find((item) => item.hostname === hostname);


    console.log("matchedEntry => ",matchedEntry)
    if (matchedEntry) { 
      // If a match is found, return the corresponding affiliateUrl
      return matchedEntry.affiliateUrl;
    } else {
      // If no match is found, return a default affiliate URL
      return ' ';
    }
  } catch (error) { 
    console.error('Error finding affiliate URL:', error);
    return ' '; // Return default on error
  }
};

//console.log("getAffiliateUrlByHostNameFind",getAffiliateUrlByHostNameFind('www.eigeradventure.com','HostName').then((result) => console.log(" result=> ",result)))


const trackingUrls = {
  
  'www.marksandspencerme.com': 'https://clk.omgt4.com/?PID=55681&AID=2356115',
  'www.flyadeal.com': 'https://www.flyadeal.com/en/search-flight?utm_source=adsicube&utm_medium=icubes&utm_campaign=4828',
  'www.justherbs.in' : 'https://mobilogi.gotrackier.com/click?campaign_id=489&pub_id=308',
  'insightcosmetics.in': 'https://track.optimistixmedia.com/c?o=21373422&m=12608&a=628261&aff_click_id={replace_it}&sub_aff_id={replace_it}',
  'www.eigeradventure.com': 'https://invol.co/cllwa2k',
  'storeus.com': 'https://24dl8.ttrk.io/6736fab8a5dc7fda74153f62',
  'sandro.sa': 'https://clk.omgt4.com/?PID=55979&AID=2356115',
  'sg.trapo.asia': 'https://invle.co/cllu491',
  'www.xcite.com': 'https://clk.omgt4.com/?PID=55728&AID=2356115',
  'www.theuaelottery.ae':'https://clk.omgt4.com/?PID=56323&AID=2356115',
  'www.kiabi.ae':'https://clk.omgt4.com/?PID=55761&AID=2356115',
  'robu.in' : 'https://robu.in/',
  'booking.theviewpalm.ae' : 'https://clk.omgt4.com/?PID=56322&AID=2356115',
  'koparoclean.com' : 'https://track.clickonik.com/click?campaign_id=3752&pub_id=11342',
  'special-trout-jjq745wwq9ww3q44v-3000.app.github.dev' : 'www.adclickboost.com_vijju'

};


// const affiliateUrl = trackingUrls["booking.theviewpalm.ae"] || "vijjurock";
// console.log("affiliateUrl => 121 ", affiliateUrl)

app.post("/api/scriptdata", async (req, res) => {
  const { url, referrer, coo, origin } = req.body;

  try {
    
    const responseUrl = await getAffiliateUrlByHostNameFind(origin,'HostName');
    console.log('Affiliate URL:', responseUrl);

    res.json({ url: responseUrl });
   
    //res.redirect(responseUrl);
  } catch (err) {
    console.error("Error saving tracking data:", err);
    res.status(500).json({ error: "Failed to save tracking data" });
  }
});

// Handle tracking data
// app.post('/api/trackdata', (req, res) => {
//   const { url, referrer, unique_id,origin } = req.body;

//   // Process the data, return event, site_id, and affiliateLink
//   const responseUrl =
//     trackingUrls[origin] || "https://tracktraffics.com";
//   const response = {
//       error: false,
//       id: uuidv4(), // A random id (for err.js)
//       event: 'click', 
//       site_id: '7890', 
//       affiliateLink: responseUrl 
//   };

//   // You could add logic to track specific events here
//   if (url.includes('error')) {
//       response.error = true;
//   }

//   res.json(response);
// });

// Serve err.js script
// app.get('/api/trackdata/err.js', (req, res) => {
//   const id = req.query.id;
//   res.type('application/javascript');
//   res.send(`
//       console.log("Error ID: ${id}");
//       // Custom error tracking logic here
//   `);
// });


// app.get('/api/track_event', (req, res) => {
//   const { site_id, user_id, event } = req.query;
  
//   // Log the event data for debugging purposes
//   console.log(`Event: ${event}, Site ID: ${site_id}, User ID: ${user_id}`);
  
//   // Generate or retrieve affiliate link based on the tracking parameters
//   const responseUrl =
//   trackingUrls[origin] || "https://tracktraffics.com";

//   // Here you might want to log this information or send it to a tracking system
//   // Example: save to a database or send to an analytics service

//   // For demonstration, let's log the affiliate link
//   console.log(`Affiliate Link: ${responseUrl}`);
  
//   // Serve a 1x1 pixel transparent GIF to be used in an iframe
//   res.setHeader('Content-Type', 'image/gif');
//   res.send(Buffer.from('R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
// });


// app.post("/api/scriptdataredirect", async (req, res) => {
//   const { url, referrer, coo, origin } = req.body;

//   // Determine the tracking URL based on the origin
//   const responseUrl =
//     trackingUrls[origin] || "https://tracktraffics.com";

//   try {
    
//     res.redirect(302, responseUrl);
//   } catch (err) {
//     console.error("Error saving tracking data:", err);
//     res.status(500).json({ error: "Failed to save tracking data" });
//   }
// });

app.post("/api/datascript", async (req, res) => {
  const { url, referrer, coo, origin } = req.body;
  // const responseUrl =
  // trackingUrls[origin] || "https://tracktraffics.com";

  try {
    const affiliateData = await getAffiliateUrlByHostNameFind(origin,'HostName');
    console.log('Affiliate URL:', affiliateData);
  
    res.json({name:'optimistix',url:affiliateData});
    //res.redirect(responseUrl);
  } catch (err) {
    console.error("Error saving tracking data:", err);
    res.status(500).json({ error: "Failed to save tracking data" });
  }
});



// Configure session middleware
// app.use(
//   session({
//     secret: "tracktraffics", // Replace with a strong secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }, // Set `secure: true` if using HTTPS
//   })
// );

// Middleware to check if iframe has been executed
// function checkIframeExecution(req, res, next) {
//   if (!req.session.iframeExecuted) {
//     req.session.iframeExecuted = true;
//     next();
//   } else {
//     res.send("<html><body><h1>Nothing to display</h1></body></html>");
//   }
// }

// Route to handle data collection and send iframe
// app.post("/api/collect", checkIframeExecution, async (req, res) => {
//   // Log collected data (or save to a database, etc.)
//   console.log("Collected Data:", req.body);
//   const { uniqueID, pageURL, referrerURL, userAgent, deviceType } = req.body;
//   // Prepare the data for storage in DynamoDB
//   const trackingData = {
//     TableName: "Retargeting",
//     Item: {
//       id: uniqueID || uuidv4(),
//       url: pageURL,
//       referrer: referrerURL,
//       userAgent,
//       deviceType,
//       timestamp: currentDateTime,
//     },
//   };

//   try {
//     // Store the tracking data in DynamoDB
//     await dynamoDb.send(new PutCommand(trackingData));

//     // Send an HTML response with a hidden iframe
//     res.send(`
//     <html>
//         <body>
//             <iframe
//                 src="${affiliateUrl}"
//                 style="width: 0; height: 0; border: none; position: absolute; top: -9999px; left: -9999px;"
//                 sandbox="allow-scripts allow-same-origin"
//             ></iframe>
//             <script>
//                 // Clear session flag on page unload
//                 window.addEventListener('beforeunload', () => {
//                     fetch('/clear-session');
//                 });
//             </script>
//         </body>
//     </html>
// `);
//   } catch (err) {
//     console.error("Error saving tracking data:", err);
//     return res.status(500).json({ error: "Failed to save tracking data" });
//   }
// });

// Route to clear session
// app.get("/clear-session", (req, res) => {
//   req.session.iframeExecuted = false;
//   res.sendStatus(200);
// });



// Endpoint to track users and return the affiliate URL
app.post('/api/multirack-user', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;
  //const { url, unique_id } = req.body;

  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
   
    const allAffiliateUrl = await getAllHostName('MuiltiRetag');
   
    const affiliateUrl = allAffiliateUrl.map(item => item.affiliateUrl);
    //const affiliateUrl = await getAllHostName('HostName').map(item => item.affiliateUrl);
    
    console.log("Affiliate URL:", affiliateUrl);

    if (!affiliateUrl) {
        return res.json({ success: true, affiliate_url: "vijjuRockNew354" }); // No matching URL
    }

    res.json({ success: true, affiliate_url: affiliateUrl });
} catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
}
});


app.post('/api/track-user', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  // Log the incoming data
  console.log("Request Data:", req.body);

  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
     

      //const affiliateUrl = trackingUrls[sanitizedOrigin] || "vijjuRockNew";
      const affiliateUrl = await getAffiliateUrlByHostNameFind(origin,'AffiliateUrls');
      console.log("Affiliate URL:", affiliateUrl);

      if (!affiliateUrl) {
          return res.json({ success: true, affiliate_url: "vijjuRockNew354" }); // No matching URL
      }

      res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (error) {
      console.error("Error in API:", error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.post('/api/impression', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  // Log the incoming data
  console.log("Request Data:", req.body);

  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
     

      const affiliateUrl = "<ins class='dcmads' style='display:inline-block;width:300px;height:250px' data-dcm-placement='N1648185.2005322OPTIMISE/B33097109.414743151' data-dcm-rendering-mode='iframe' data-dcm-https-only data-dcm-api-frameworks='[APIFRAMEWORKS]' data-dcm-omid-partner='[OMIDPARTNER]' data-dcm-gdpr-applies='gdpr=${GDPR}' data-dcm-gdpr-consent='gdpr_consent=${GDPR_CONSENT_755}' data-dcm-addtl-consent='addtl_consent=${ADDTL_CONSENT}' data-dcm-ltd='false' data-dcm-resettable-device-id='' data-dcm-app-id=''> <script src='https://www.googletagservices.com/dcm/dcmads.js'></script> </ins>"


      res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (error) {
      console.error("Error in API:", error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



// Fallback pixel endpoint (optional)
app.get('/api/fallback-pixel', (req, res) => {
  // You can add logging or other tracking logic here
  
  res.sendStatus(204); // No content, as it's a tracking pixel
});




app.use(express.static(path.join(__dirname, "public")));
app.use('/api', trackingRoutes);
app.use('/api', trackingRoutesNew);

// Serve the manage tracking URLs page
app.get('/api/manage-tracking-urls', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manageTracking.html'));
});

// Serve the manage tracking URLs page
app.get('/api/affiliateUrls', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manageTrackingNew.html'));
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});