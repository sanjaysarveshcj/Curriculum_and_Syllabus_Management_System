const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const dotenv = require("dotenv");

dotenv.config();

const mongoURI = process.env.MONGO_URI;

// Establish a single connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Wait for DB to be open to create GridFSBucket
let gridFSBucket;
db.once("open", () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads",
  });
  console.log("✅ GridFSBucket initialized");
});

// GridFS Storage for Multer
const getStorage = () => {
  return new GridFsStorage({
    url: mongoURI,
    file: (req, file) => ({
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    }),
  });
};

module.exports = {
  getStorage,
  getGridFSBucket: () => gridFSBucket,
};
