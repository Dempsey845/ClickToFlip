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
import fs from "fs";
import multer from "multer";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// __dirname resolution in ES modules
const __dirname = new URL(".", import.meta.url).pathname;

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer file upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middlewares
app.use(cors(corsOptions)); // Dynamic origins
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// API routes
app.use("/api", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/builds", buildRoutes);
app.use("/api/upload", uploadRoutes);

// Health check or default route
app.get("/", (req, res) => {
  res.send(`API running in ${isProduction ? "production" : "development"}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
