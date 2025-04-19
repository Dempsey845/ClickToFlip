import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import sessionMiddleware from "./middleware/session.js";
import corsOptions from "./middleware/corsOptions.js";
import authRoutes from "./routes/authRoutes.js";
import componentRoutes from "./routes/componentRoutes.js";
import buildRoutes from "./routes/buildRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import fs from "fs"; // File system to check folder
import multer from "multer";

// Dynamically resolve __dirname using import.meta.url in ES modules
const __dirname = new URL(".", import.meta.url).pathname;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use dynamically resolved uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensuring unique filenames
  },
});

const upload = multer({ storage });

config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from 'uploads' folder
app.use("/uploads", express.static(uploadDir)); // Serving uploaded files from the 'uploads' folder

app.use("/api", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/builds", buildRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => res.send("API running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
