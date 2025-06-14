import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ciphertext: {
      type: String,
      required: true, // AES-encrypted message content
    },
    encryptedAesKeyForReceiver: {
      type: String,
      required: true, // RSA-encrypted AES key using receiver's public key
    },
    encryptedAesKeyForSender: {
      type: String,
      required: true, // RSA-encrypted AES key using sender's public key
    },
    iv: {
      type: String,
      required: true, // AES IV (base64)
    },
    image: {
      type: String, // Optional encrypted image (base64)
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
