import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    publicKey: {
      type: String, // Store as base64-encoded string
      default: "",  // Initially empty, will be set after key generation
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
