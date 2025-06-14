import User from "../models/user.model.js";

export const getPublicKey = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const user = await User.findById(receiverId);
    if (!user || !user.publicKey) {
      return res.status(404).json({ error: "User or public key not found" });
    }

    res.status(200).json({ publicKey: user.publicKey });
  } catch (error) {
    console.error("Error fetching public key:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
