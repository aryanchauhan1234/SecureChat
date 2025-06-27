
import ChatInvite from "../models/chatInvites.model.js";

// 1. Send a chat invite
export const sendInvite = async (req, res) => {
  const senderId = req.user.id; // assuming auth middleware sets req.user
  const { receiverId } = req.body;

  if (senderId === receiverId) {
    return res.status(400).json({ error: "You can't invite yourself." });
  }

  try {
    const invite = await ChatInvite.findOneAndUpdate(
      { senderId, receiverId },
      { status: "pending" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(invite);
  } catch (error) {
    console.error("Error sending invite:", error);
    res.status(500).json({ error: "Failed to send invite." });
  }
};

// 2. Check invite status between two users
export const checkInviteStatus = async (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.userId;

  try {
    const invite = await ChatInvite.findOne({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    });

    if (!invite) return res.json({ status: "none" });

   res.json({
  status: invite.status, // 'pending', 'accepted', 'rejected'
  sentBy: invite.senderId.toString(), // return sender ID
});
  } catch (error) {
    console.error("Error checking invite status:", error);
    res.status(500).json({ error: "Failed to check invite status." });
  }
};

// 3. Accept or reject a chat invite
export const respondToInvite = async (req, res) => {
  const receiverId = req.user.id;
  const { senderId, decision } = req.body; // 'accepted' or 'rejected'

  if (!["accepted", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision value." });
  }

  try {
    const invite = await ChatInvite.findOneAndUpdate(
      { senderId, receiverId },
      { status: decision },
      { new: true }
    );

    if (!invite) {
      return res.status(404).json({ error: "Invite not found." });
    }

    res.json(invite);
  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({ error: "Failed to respond to invite." });
  }
};
