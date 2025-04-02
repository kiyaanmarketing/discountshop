const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { DynamoDBClient, ScanCommand} = require('@aws-sdk/client-dynamodb');
const { GetCommand,UpdateCommand,PutCommand,DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = require("../aws-config");

//const filePath = path.join(__dirname, '../trackingUrls.json');

const UrlsTable = 'AffiliateUrls';

router.get('/tracking-urls_new', async (req, res) => {
  const params = { TableName: UrlsTable };

  try {
    

    // Use ScanCommand to perform a scan operation
    const command = new ScanCommand(params);
    const data = await dynamoDb.send(command);

   
    res.json(data.Items);
  } catch (error) {
    console.error("Error fetching tracking URLs:", error);
    res.status(500).json({ message: 'Error fetching tracking URLs', error });
  }
});



router.post('/add-url-new', async (req, res) => {
  const { hostname, affiliateUrl } = req.body;

  const params = {
    TableName: UrlsTable,
    Item: { hostname, affiliateUrl },
  };

  try {
    
    const result = await dynamoDb.send(new PutCommand(params));
    console.log("URL added/updated successfully:", result);
    res.json({ message: 'URL added/updated successfully' });
  } catch (error) {
    console.error("Error adding URL:", error); // Log the error for debugging
    res.status(500).json({ message: 'Error adding/updating URL', error });
  }
});






router.post('/edit-url-new', async (req, res) => {
  const { editHostname, newHostname, newUrl } = req.body;


  try {
    // Fetch existing record to verify conditions
    const existingParams = {
      TableName: UrlsTable,
      Key: { hostname: editHostname },
    };
    const existingItem = await dynamoDb.send(new GetCommand(existingParams));

    if (!existingItem.Item) {
      return res.status(404).json({ message: 'Hostname not found' });
    }

    const { affiliateUrl } = existingItem.Item;

    // No changes made
    if (editHostname === newHostname && affiliateUrl === newUrl) {
      return res.status(400).json({ message: 'No changes made' });
    }

    // Update the URL only
    if (editHostname === newHostname && affiliateUrl !== newUrl) {
      const updateParams = {
        TableName: UrlsTable,
        Key: { newHostname },
        UpdateExpression: 'SET affiliateUrl = :url',
        ExpressionAttributeValues: { ':url': newUrl },
      };
      await dynamoDb.send(new UpdateCommand(updateParams));
      return res.json({ message: 'URL updated successfully' });
    }

    // Rename the hostname and update URL if necessary
    if (editHostname !== newHostname) {
      // Check if the new hostname already exists
      const checkParams = {
        TableName: UrlsTable,
        Key: { newHostname },
      };
      const checkItem = await dynamoDb.send(new GetCommand(checkParams));
      if (checkItem.Item) {
        return res.status(400).json({ message: 'New hostname already exists' });
      }

      // Add the new hostname and delete the old one
      const addParams = {
        TableName: UrlsTable,
        Item: { newHostname, affiliateUrl: newUrl || affiliateUrl },
      };
      await dynamoDb.send(new PutCommand(addParams));

      const deleteParams = {
        TableName: UrlsTable,
        Key: { newHostname: editHostname },
      };
      await dynamoDb.send(new DeleteCommand(deleteParams));

      return res.json({ message: 'Hostname and URL updated successfully' });
    }
  } catch (error) {
    console.error('Error updating URL:', error);
    return res.status(500).json({ message: 'Error updating URL', error: error.message });
  }
});




router.delete('/delete-url-new/:hostname', async (req, res) => {
  const hostname = req.params.hostname;
  
  const params = {
    TableName: UrlsTable,
    Key: { hostname }, // Partition key for the item
  };

  try {
    console.log("DeleteCommand Params:", params);
    const result = await dynamoDb.send(new DeleteCommand(params));
    console.log("URL deleted successfully:", result);
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({ message: 'Error deleting URL', error: error.message });
  }
});




module.exports = router;
