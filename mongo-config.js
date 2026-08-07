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

    // click_logs: delete at the next midnight IST (calendar-day reset,
    // not a rolling 24h window) — see expireAt on each inserted doc
    await db.collection("click_logs").createIndex(
      { expireAt: 1 },
      { expireAfterSeconds: 0 }
    );
    console.log("TTL Index created for click_logs (midnight IST reset)");

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
 * Next midnight IST (Asia/Kolkata, UTC+5:30) as a UTC Date.
 * Used as the `expireAt` value so a MongoDB TTL index deletes the doc
 * exactly when the calendar day rolls over in India, not N hours later.
 */
function nextMidnightIST() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const nextMidnightISTAsUTC = Date.UTC(
    nowIST.getUTCFullYear(),
    nowIST.getUTCMonth(),
    nowIST.getUTCDate() + 1,
    0, 0, 0, 0
  );
  return new Date(nextMidnightISTAsUTC - IST_OFFSET_MS);
}

module.exports = { connectDB, getDB, nextMidnightIST };