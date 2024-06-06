const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const router = express.Router();

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Set a unique filename
  },
});

const upload = multer({ storage: storage });

require("dotenv").config();
// Define a Mongoose model for storing image paths
const Image = mongoose.model("Image", {
  path: {
    type: String,
    required: true,
    unique: true,
  },
});

// Route for handling file upload
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const filepath1 = filePath.replace("public", "");
    // Check if the image path already exists in the database
    const existingImage = await Image.findOne({ path: filepath1 });

    if (existingImage) {
      // If the image path already exists, return the existing path
      res.json({ filePath: existingImage.path });
    } else {
      // If the image path does not exist, save it to the database
      const newImage = new Image({ path: filepath1 });
      await newImage.save();
      res.json({ filepath1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all images from the database
router.get("/getImages", async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", (req, res) => {
  res.redirect("/user");
});

module.exports = router;
