import express from "express";
import multer from "multer";
import path from "path";
import db from "../config/db.js";

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Uploads to 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });
const router = express.Router();

// Handle the image upload route
router.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Get buildId from the request body
  const { buildId } = req.body;

  if (!buildId) {
    return res.status(400).send("Build ID is required");
  }

  // Save the URL of the uploaded image (relative to the root)
  const imageUrl = `/uploads/${req.file.filename}`;

  // Database query to update the build with the image URL
  const query = `UPDATE builds SET image_url = $1 WHERE id = $2`;
  const values = [imageUrl, buildId];

  db.query(query, values)
    .then(() => {
      // Send the success response after the database update
      res.json({ imageUrl });
    })
    .catch((err) => {
      // Send an error response in case of any DB issues
      res.status(500).json({ error: "Database update failed", details: err });
    });
});

export default router;
