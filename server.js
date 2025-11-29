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
// const trackingRoutes = require('./routes/tracking');
const trackingRoutesNew = require('./routes/trackingNew');
const { MongoClient ,ServerApiVersion} = require('mongodb');
const {  connectDB, getDB } = require('./mongo-config');

const app = express();
const port = process.env.PORT || 4005;
app.use(express.json());
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cors());




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

const getAllHostName = async (collectionName) => {
  const db = getDB();
  
  try {
    return await db.collection(collectionName).find({}).toArray();
  } catch (err) {
    console.error('MongoDB Error:', err);
    return [];
  }
};
 

const getAffiliateUrlByHostNameFindActive = async (hostname, collectionName) => {
  const db = getDB();
  
  try {
    const result = await db.collection(collectionName)
                          .findOne({ 
                            hostname: hostname, 
                            status: "active"  // <-- only active hosts
                          });
    return result ? result.affiliateUrl : '';
  } catch (error) {
    console.error('MongoDB Error:', error);
    return '';
  }
};


const getAffiliateUrlByHostNameFind = async (hostname, collectionName) => {
  const db = getDB();
  
  try {
    const result = await db.collection(collectionName)
                          .findOne({ hostname: hostname });
    return result ? result.affiliateUrl : 'https://api.dicountshop.com/';
  } catch (error) {
    console.error('MongoDB Error:', error);
    return '';
  }
};


// ===============================
// 🔥 Dynamic GET API (single route)
// ===============================
app.get('/api/get', async (req, res) => {
  try {
    const { collection } = req.query;

    // Validate collection name
    if (!collection) {
      return res.status(400).json({ success: false, error: "collection query required" });
    }

    // Allowed collections (SECURITY)
    const allowedCollections = [
      "Payloads",
      "theviewpalm",
      "fareastflora",
      "xcite"
    ];

    if (!allowedCollections.includes(collection)) {
      return res.status(400).json({ success: false, error: "Invalid collection name" });
    }

    const db = getDB();
    const payloadCollection = db.collection(collection);

    // Fetch all data – sorted by latest
    const data = await payloadCollection.find({})
      .sort({ timestamp: -1 })
      .toArray();

    res.json({ success: true, collection, count: data.length, data });

  } catch (error) {
    console.error("Dynamic GET Error:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


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


app.post("/api/datascript", async (req, res) => {
  const { url, referrer, coo, origin } = req.body;

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
  console.log("Request Data:", req.body);

  if (!url || !unique_id) {
    console.log("Missing Data Error:", { url, unique_id });
    return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
    const affiliateUrl = await getAffiliateUrlByHostNameFindActive(origin, 'AffiliateUrlsN');
    console.log("Affiliate URL:", affiliateUrl);

    if (!affiliateUrl) {
      console.log("No affiliate URL found, using fallback");
      return res.json({ success: true, affiliate_url: "https://valid-fallback-url.com" });
    }

    const finalUrl = affiliateUrl + `&unique_id=${unique_id}`;
    console.log("Response Data:", { success: true, affiliate_url: affiliateUrl });
    res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (error) {
    console.error("Error in API:", error.message);
    res.status(500).json({ success: false, error: ' furono server error' });
  }
});


app.post('/api/track-user-withoutUni', async (req, res) => {
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

app.post('/api/track-user-withData', async (req, res) => {
  const { url, referrer, unique_id, origin, payload } = req.body;

  console.log("Request Data:", req.body);

  if (!url || !unique_id) {
    return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
    const db = getDB();

// =============================
    // 2️⃣ Store for www.xcite.com
    // =============================
    if ((origin.includes("www.xcite.com")) && payload) {
      const payloadCollection = db.collection('xcite');

      await payloadCollection.insertOne({
        timestamp: new Date(),
        origin,
        payload,
        unique_id,
        url,
        referrer,
      });

      console.log(`✅ Stored xcite payload`);
    }



    // =============================
    // 3️⃣ Send Affiliate URL
    // =============================
    const affiliateUrl = await getAffiliateUrlByHostNameFindActive(origin, 'AffiliateUrlsN');
    console.log("Affiliate URL:", affiliateUrl);

    if (!affiliateUrl) {
      return res.json({ success: true, affiliate_url: "vijjuRockNew354" });
    }

    res.json({ success: true, affiliate_url: affiliateUrl });

  } catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});




app.post('/api/track-data', async (req, res) => {
  const { origin,pid, referrer,url, ua,t } = req.body;

  // Log the incoming data
  console.log("Request Data:", req.body);

  if (!url) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
     
      const affiliateUrl = await getAffiliateUrlByHostNameFind(origin,'AffiliateUrls');
      console.log("Affiliate URL:", affiliateUrl);

      if (!affiliateUrl) {
          return res.json({ success: true, track_url: "vijjuRocker" }); // No matching URL
      }

      res.json({ success: true, track_url: affiliateUrl });
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
// app.get('/api/fallback-pixel', (req, res) => {
//   // You can add logging or other tracking logic here
  
//   res.sendStatus(204); // No content, as it's a tracking pixel
// });


app.get('/api/fallback-pixel', async (req, res) => {
    try {
       
     

        // 👉 Return 1×1 transparent GIF
        const gif = Buffer.from(
            'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
            'base64'
        );

        res.set('Content-Type', 'image/gif');
        res.set('Content-Length', gif.length);
        return res.status(200).send(gif);

    } catch (error) {
        console.error("Fallback pixel error:", error);

        // Even on error, return 204 to avoid breaking script
        return res.status(204).send();
    }
});



app.use(express.static(path.join(__dirname, "public")));
//app.use('/api', trackingRoutes);
app.use('/api', trackingRoutesNew);

// Serve the manage tracking URLs page
app.get('/api/manage-tracking-urls', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manageTracking.html'));
});

// Serve the manage tracking URLs page
app.get('/api/affiliateUrls', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manageTrackingNew.html'));
});


connectDB()
  .then(async () => {
    const allHostNames = await getAllHostName('AffiliateUrlsN');
    console.log("All Host Names => ", allHostNames);
    const affiliateUrl = await getAffiliateUrlByHostNameFind("abc",'AffiliateUrlsN');
      console.log("Affiliate URL:======>>>", affiliateUrl);

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });