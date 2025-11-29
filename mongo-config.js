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


module.exports = { connectDB, getDB };