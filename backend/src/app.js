import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import mainRoute from "./routes/main.route.js";
import { ENV } from "./config/env.js";
// import { requestLogger, securityStack } from "./middleware/security.js";
const app = express();

const __dirname = path.resolve();



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.set("trust proxy", 1);
// app.use(requestLogger);
// app.use(securityStack);
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());
app.use("/api/", mainRoute);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
export default app;
