import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {
  generateAESKey,
  encryptAESKey,
  encryptMessage,
  decryptAESKey,
  decryptMessage,
  importPrivateKey,
  importPublicKey,
} from "../Utils/cryptoUtils.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  inviteStatus: "none",
  inviteSentBy: null,

  checkInviteStatus: async () => {
    try {
      const { selectedUser } = get();
      const res = await axiosInstance.get(`/chat/invite/status/${selectedUser._id}`);
      set({
        inviteStatus: res.data.status,
        inviteSentBy: res.data.sentBy,
      });
    } catch (err) {
      console.error("Failed to check invite status:", err);
    }
  },

  sendInvite: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      await axiosInstance.post("/chat/invite", { receiverId: selectedUser._id });
      set({ inviteStatus: "pending" });
    } catch (err) {
      console.error("Failed to send invite:", err);
      toast.error(err?.response?.data?.error || "Failed to send invite");
    }
  },

  respondToInvite: async (decision) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      await axiosInstance.post("/chat/invite/respond", {
        senderId: selectedUser._id,
        decision,
      });
      set({ inviteStatus: decision });
    } catch (err) {
      console.error("Failed to respond to invite:", err);
      toast.error(err?.response?.data?.error || "Failed to respond");
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async () => {
    const { authUser, privateKey } = useAuthStore.getState();
    const { selectedUser } = get();

    if (!authUser || !privateKey || !selectedUser) return;

    try {
      const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
      const rawMessages = res.data;

      const decryptedMessages = await Promise.all(
        rawMessages.map(async (msg) => {
          try {
            const isSender = msg.sender === authUser._id;

            const encryptedKeyBase64 = isSender
              ? msg.encryptedAesKeyForSender
              : msg.encryptedAesKeyForReceiver;

            const encryptedKeyBuffer = Uint8Array.from(
              atob(encryptedKeyBase64),
              (c) => c.charCodeAt(0)
            );

            const aesKey = await decryptAESKey(encryptedKeyBuffer, privateKey);
            const decryptedText = await decryptMessage(msg.ciphertext, msg.iv, aesKey);

            return {
              ...msg,
              text: decryptedText,
              isSender,
            };
          } catch (err) {
            return {
              ...msg,
              text: "[Failed to decrypt]",
              isSender: msg.sender === authUser._id,
            };
          }
        })
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      console.error("❌ Failed to fetch or decrypt messages:", error);
      toast.error("Failed to load messages");
    }
  },

  sendMessage: async (plainMessage) => {
    const { authUser, privateKey } = useAuthStore.getState();
    const { selectedUser, messages } = get();

    try {
      const receiverPublicKey = await importPublicKey(selectedUser.publicKey);
      const senderPublicKey = await importPublicKey(authUser.publicKey);

      const aesKey = await generateAESKey();
      const { ciphertext, iv } = await encryptMessage(plainMessage.text, aesKey);

      const encryptedKeyForReceiver = await encryptAESKey(aesKey, receiverPublicKey);
      const encryptedKeyForSender = await encryptAESKey(aesKey, senderPublicKey);

      const payload = {
        ciphertext,
        iv,
        encryptedAesKeyForReceiver: btoa(String.fromCharCode(...new Uint8Array(encryptedKeyForReceiver))),
        encryptedAesKeyForSender: btoa(String.fromCharCode(...new Uint8Array(encryptedKeyForSender))),
        image: plainMessage.image || null,
      };

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);

      const aesKeyLocal = await decryptAESKey(
        Uint8Array.from(
          atob(res.data.encryptedAesKeyForSender),
          (c) => c.charCodeAt(0)
        ),
        privateKey
      );

      const decryptedText = await decryptMessage(
        res.data.ciphertext,
        res.data.iv,
        aesKeyLocal
      );

      set((state) => ({
        messages: [
          ...state.messages,
          {
            ...res.data,
            text: decryptedText,
            isSender: true,
          },
        ],
      }));
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages } = get();
    const { socket, authUser, privateKey } = useAuthStore.getState();

    if (!selectedUser || !socket || !authUser || !privateKey) return;

    socket.off("newMessage");

    socket.on("newMessage", async (newMessage) => {
      const isRelevant =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (!isRelevant) return;

      const alreadyExists = messages.some((msg) => msg._id === newMessage._id);
      if (alreadyExists) return;

      try {
        const isSender = newMessage.senderId === authUser._id;

        const encryptedKeyBase64 = isSender
          ? newMessage.encryptedAesKeyForSender
          : newMessage.encryptedAesKeyForReceiver;

        const encryptedKeyBuffer = Uint8Array.from(
          atob(encryptedKeyBase64),
          (c) => c.charCodeAt(0)
        );

        const aesKey = await decryptAESKey(encryptedKeyBuffer, privateKey);
        const decryptedText = await decryptMessage(
          newMessage.ciphertext,
          newMessage.iv,
          aesKey
        );

        const decryptedMessage = {
          ...newMessage,
          text: decryptedText,
          isSender,
        };

        set((state) => ({
          messages: [...state.messages, decryptedMessage],
        }));
      } catch (err) {
        console.error("❌ Failed to decrypt live message:", err);
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...newMessage,
              text: "[Decryption failed]",
              isSender: newMessage.senderId === authUser._id,
            },
          ],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
