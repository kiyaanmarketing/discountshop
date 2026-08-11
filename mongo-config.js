const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("MongoDB Atlas se connect hogaya!",process.env.DB_NAME);

       // ================================
    // 🔥 TTL Index Auto Create
    // ================================

    // theviewpalm ke liye 24hr TTL
    await db.collection("xcite").createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 86400 }
    );
    console.log("TTL Index created for xcite (24 hours)");

    // click_logs: delete 6h after insert — see expireAt on each inserted doc
    await db.collection("click_logs").createIndex(
      { expireAt: 1 },
      { expireAfterSeconds: 0 }
    );
    console.log("TTL Index created for click_logs (6h after insert)");

  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    console.error("⚠️ getDB() called before initialization!");
  }
  return db;
}

/**
 * Click-log expiry: now + 6 hours. Used as the `expireAt` value so the
 * shared click_logs TTL index deletes docs a few hours after insert instead
 * of holding a full day — keeps this shared collection well under the
 * Atlas free-tier storage quota.
 */
function clickLogExpiry() {
  return new Date(Date.now() + 6 * 60 * 60 * 1000);
}

module.exports = { connectDB, getDB, clickLogExpiry };