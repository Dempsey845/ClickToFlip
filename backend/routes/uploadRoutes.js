import express from "express";
import multer from "multer";
import path from "path";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config(); // Load .env

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";

let upload;

if (isProduction) {
  // Firebase Storage setup
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  // Only initialize Firebase if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  // Use memory storage for Firebase
  upload = multer({ storage: multer.memoryStorage() });
} else {
  // Disk storage for local development
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  upload = multer({ storage });
}

router.post("/image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const { buildId, oldImageUrl } = req.body;
  if (!buildId) return res.status(400).send("Build ID is required");

  try {
    if (isProduction) {
      const bucket = admin.storage().bucket();

      // Delete the old image from Firebase Storage if provided
      if (oldImageUrl) {
        console.log("old image: ", oldImageUrl);

        const urlParts = oldImageUrl.split("/uploads/");
        const filenameWithParams = urlParts[1]?.split("?")[0];

        if (!filenameWithParams) {
          console.error("Failed to extract filename from URL");
          return res.status(400).send("Invalid old image URL format");
        }

        const oldImageFilename = `uploads/${filenameWithParams}`;
        console.log("old filename: ", oldImageFilename);

        const oldImageFile = bucket.file(oldImageFilename);
        await oldImageFile.delete();
        console.log("Old image deleted successfully.");
      }

      // Upload the new image
      const filename = `uploads/${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(filename);

      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on("finish", async () => {
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2030",
        });

        const query = `UPDATE builds SET image_url = $1 WHERE id = $2`;
        const values = [url, buildId];

        await db.query(query, values);
        res.json({ imageUrl: url });
      });

      stream.on("error", (err) => {
        res.status(500).json({
          error: "Firebase upload failed",
          details: err.message,
        });
      });

      stream.end(req.file.buffer);
    } else {
      // Local storage
      const imageUrl = `/uploads/${req.file.filename}`;
      const query = `UPDATE builds SET image_url = $1 WHERE id = $2`;
      const values = [imageUrl, buildId];

      db.query(query, values)
        .then(() => res.json({ imageUrl }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: "Database update failed", details: err.message })
        );
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error processing the image", details: err.message });
  }
});

export default router;
