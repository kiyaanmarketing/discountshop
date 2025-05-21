const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { DynamoDBClient, ScanCommand} = require('@aws-sdk/client-dynamodb');
const { GetCommand,UpdateCommand,PutCommand,DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("../aws-config");

//const filePath = path.join(__dirname, '../trackingUrls.json');

const { getDB } = require('../mongo-config');


const collectionName = 'AffiliateUrls';

router.get('/tracking-urls_new', async (req, res) => {
  try {
    const db = getDB();
    const urls = await db.collection(collectionName).find().toArray();
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ message: 'Error fetching tracking URLs', error });
  }
});

// ✅ Add or update a URL
router.post('/add-url-new', async (req, res) => {
  const { hostname, affiliateUrl } = req.body;

  try {
    const db = getDB();
    const existing = await db.collection(collectionName).findOne({ hostname });

    if (existing) {
      await db.collection(collectionName).updateOne(
        { hostname },
        { $set: { affiliateUrl } }
      );
    } else {
      await db.collection(collectionName).insertOne({ hostname, affiliateUrl });
    }

    res.json({ message: 'URL added/updated successfully' });
  } catch (error) {
    console.error('Error adding URL:', error);
    res.status(500).json({ message: 'Error adding/updating URL', error });
  }
});

// ✅ Edit hostname or URL
router.post('/edit-url-new', async (req, res) => {
  const { editHostname, newHostname, newUrl } = req.body;

  try {
    const db = getDB();
    const existing = await db.collection(collectionName).findOne({ hostname: editHostname });

    if (!existing) {
      return res.status(404).json({ message: 'Original hostname not found' });
    }

    if (editHostname === newHostname && existing.affiliateUrl === newUrl) {
      return res.status(400).json({ message: 'No changes made' });
    }

    // If hostname changed, check for duplicate
    if (editHostname !== newHostname) {
      const duplicate = await db.collection(collectionName).findOne({ hostname: newHostname });
      if (duplicate) {
        return res.status(400).json({ message: 'New hostname already exists' });
      }

      await db.collection(collectionName).insertOne({
        hostname: newHostname,
        affiliateUrl: newUrl || existing.affiliateUrl
      });

      await db.collection(collectionName).deleteOne({ hostname: editHostname });

      return res.json({ message: 'Hostname and URL updated successfully' });
    }

    // Just update the URL
    await db.collection(collectionName).updateOne(
      { hostname: editHostname },
      { $set: { affiliateUrl: newUrl } }
    );

    res.json({ message: 'URL updated successfully' });
  } catch (error) {
    console.error('Error updating URL:', error);
    res.status(500).json({ message: 'Error updating URL', error });
  }
});




// ✅ Delete by hostname
router.delete('/delete-url-new/:hostname', async (req, res) => {
  const { hostname } = req.params;

  try {
    const db = getDB();
    await db.collection(collectionName).deleteOne({ hostname });
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ message: 'Error deleting URL', error });
  }
});




module.exports = router;
