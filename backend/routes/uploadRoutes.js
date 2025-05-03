import express from "express";
import multer from "multer";
import path from "path";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // Load .env

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";

let upload;

if (isProduction) {
  // Use memory storage for Firebase
  upload = multer({ storage: multer.memoryStorage() });

  // Firebase Admin setup
  import("firebase-admin").then((admin) => {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    router.post("/image", upload.single("image"), async (req, res) => {
      if (!req.file) return res.status(400).send("No file uploaded");

      const { buildId } = req.body;
      if (!buildId) return res.status(400).send("Build ID is required");

      try {
        const bucket = admin.storage().bucket();
        const filename = `uploads/${uuidv4()}-${req.file.originalname}`;
        const file = bucket.file(filename);

        const stream = file.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        stream.end(req.file.buffer);

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
          res
            .status(500)
            .json({ error: "Firebase upload failed", details: err });
        });
      } catch (err) {
        res.status(500).json({ error: "Firebase error", details: err });
      }
    });
  });
} else {
  // Use disk storage for local development
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  upload = multer({ storage });

  router.post("/image", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");

    const { buildId } = req.body;
    if (!buildId) return res.status(400).send("Build ID is required");

    const imageUrl = `/uploads/${req.file.filename}`;
    const query = `UPDATE builds SET image_url = $1 WHERE id = $2`;
    const values = [imageUrl, buildId];

    db.query(query, values)
      .then(() => res.json({ imageUrl }))
      .catch((err) =>
        res.status(500).json({ error: "Database update failed", details: err })
      );
  });
}

export default router;
