import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  generateRSAKeyPair,
  exportPublicKey,
  storePrivateKey,
  loadPrivateKey,
} from "../Utils/cryptoUtils.js";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  privateKey: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      // Step 1: Generate key pair
      const { publicKey, privateKey } = await generateRSAKeyPair();

      // Step 2: Export public key as base64 string
      const exportedPublicKey = await exportPublicKey(publicKey);

      // Step 3: Include publicKey in signup payload
      const payload = { ...data, publicKey: exportedPublicKey };

      // Step 4: Send signup request
      const res = await axiosInstance.post("/auth/signup", payload);
      const user = res.data;

      // Step 5: Store private key in IndexedDB
      await storePrivateKey(user._id, privateKey);
      console.log("called storing private key")
      // Step 6: Save user and connect socket
      useAuthStore.setState({
        authUser: user,
        privateKey: privateKey ,
      });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const user = res.data;

      // Step 1: Try to load user's private key from IndexedDB
      // const {privateKey}=get();
      const privateKey = await loadPrivateKey(user._id);
      // await storePrivateKey(user._id, privateKey);
      // console.log(privateKey)
      if (!privateKey) {
        toast.error("Private key not found. You won't be able to decrypt past messages.");
      }
      // Step 2: Save user and connect socket
       useAuthStore.setState({
        authUser: user,
        privateKey: privateKey ,
      });
      console.log(privateKey)
      get().connectSocket();
      toast.success("Logged in successfully");

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null});
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
  setPrivateKey: (key) => set({ privateKey: key }),
}));
