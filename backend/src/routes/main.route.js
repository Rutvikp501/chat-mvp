import express from "express";
const router = express.Router();

import authRoutes from "./auth.route.js";
import messageRoutes from "./message.route.js";
import roomRoutes from "./rooms.route.js";
import callRoutes from "./calls.route.js";

// ✅ Basic check route (after API)
router.get('/', (req, res) => {
  res.send('Main Route is working ✅');
});
router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);
router.use("/rooms", roomRoutes);
router.use("/calls", callRoutes);

export default router;

