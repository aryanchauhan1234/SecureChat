import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// import mongoose from "mongoose";
// import Message from "../models/message.model.js";

// import Message from "../models/message.model.js";

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userToChatId },
        { sender: userToChatId, receiver: myId },
      ],
    }).sort({ createdAt: 1 }); // optional: oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    console.log("❌ Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    const {
      ciphertext,
      iv,
      encryptedAesKeyForReceiver,
      encryptedAesKeyForSender,
      image,
    } = req.body;

    // 1. Save message in DB
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      ciphertext,
      iv,
      encryptedAesKeyForReceiver,
      encryptedAesKeyForSender,
      image: image || "",
    });

    const messagePayload = {
      _id: newMessage._id,
      senderId,
      receiverId,
      ciphertext,
      iv,
      encryptedAesKeyForReceiver,
      encryptedAesKeyForSender,
      image: newMessage.image,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    };

    // 2. Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messagePayload);
    }

    // 3. Emit to sender (useful for multi-device or local display)
    // const senderSocketId = getReceiverSocketId(senderId);
    // if (senderSocketId) {
    //   io.to(senderSocketId).emit("newMessage", messagePayload);
    // }

    // 4. Respond
    res.status(201).json(messagePayload);
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};




