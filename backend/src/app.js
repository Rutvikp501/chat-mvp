import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import mainRoute from "./routes/main.route.js";
import { ENV } from "./config/env.js";
const app = express();

const __dirname = path.resolve();


app.use(express.json({ limit: "5mb" })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
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
