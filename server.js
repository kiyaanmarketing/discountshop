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
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cors());

const jsonFilePath = path.join(__dirname, 'trackingUrls.json')


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



// Route to clear session
app.get("/clear-session", (req, res) => {
  req.session.iframeExecuted = false;
  res.sendStatus(200);
});

// Function to read trackingUrls from JSON file
const readTrackingUrls = () => {
  const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
  return JSON.parse(fileContent);
};


app.post('/api/track-user', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  if (!unique_id || !url) {
    return res.status(400).json({ message: 'unique_id and URL are required' });
  }

  const trackingUrls = readTrackingUrls();

  trackingUrls[unique_id] = {
    url,
    referrer,
    origin
  };


  fs.writeFile(jsonFilePath, JSON.stringify(trackingUrls, null, 2), async (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    try {
     
      const response = await axios.post('https://adclickboost.com/api/alldata', req.body);
      return res.status(200).json({
        message: 'URL updated successfully',
        externalApiResponse: response.data
      });
    } catch (error) {
      console.error('Error sending data to external API:', error);
      return res.status(500).json({ message: 'Failed to send data to external API' });
    }
  });
});



app.get('/api/fallback-pixel', (req, res) => {
   
  res.sendStatus(204); 
});

app.use(express.static(path.join(__dirname, "public")));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
