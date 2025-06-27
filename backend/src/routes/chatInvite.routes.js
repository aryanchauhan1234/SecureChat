
import express from "express";
import {
  sendInvite,
  checkInviteStatus,
  respondToInvite,
} from "../controllers/chatInviteController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST: Send a new invite
router.post("/invite", protectRoute, sendInvite);

// GET: Check invite status between users
router.get("/invite/status/:userId", protectRoute, checkInviteStatus);

// POST: Respond to invite (accept/reject)
router.post("/invite/respond", protectRoute, respondToInvite);

export default router;
