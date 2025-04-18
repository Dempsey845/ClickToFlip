import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import cors from "cors";
import passport from "./config/passport.js";
import sessionMiddleware from "./middleware/session.js";
import corsOptions from "./middleware/corsOptions.js";
import authRoutes from "./routes/authRoutes.js";

config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRoutes);

app.get("/", (req, res) => res.send("API running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
