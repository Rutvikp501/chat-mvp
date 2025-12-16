import express from "express";
import { signup, login, logout, updateProfile, getUserById } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
import { securityStack ,requestLogger} from '../middleware/security.js';
// Apply security to ALL routes
// router.use(requestLogger);
router.use(...securityStack);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));
// GET /api/users/:id
router.get("/user/:id", protectRoute, getUserById);

export default router;
