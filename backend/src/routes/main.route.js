import express from "express";
const router = express.Router();

import authRoutes from "./auth.route.js";
import messageRoutes from "./message.route.js";


// ✅ Basic check route (after API)
router.get('/', (req, res) => {
  res.send('Main Route is working ✅');
});
router.use("/auth", authRoutes);
router.use("/messages", messageRoutes);

export default router;

