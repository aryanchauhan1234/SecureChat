import express from "express";
import { getPublicKey } from "../controllers/keyController.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

// GET receiver's public key
router.get("/:receiverId", protectRoute, getPublicKey);

export default router;
