
// models/ChatInvite.js
import mongoose from "mongoose";

const chatInviteSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

chatInviteSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const ChatInvite = mongoose.models.ChatInvite || mongoose.model("ChatInvite", chatInviteSchema);
export default ChatInvite;
