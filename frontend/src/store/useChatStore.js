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
  loadPrivateKey,
} from "../Utils/cryptoUtils.js";
export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  
  
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
            isSender, // ✅ Add this flag
          };
        } catch (err) {
          return {
            ...msg,
            text: "[Failed to decrypt]",
            isSender: msg.sender === authUser._id, // fallback
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

    // ✅ Decrypt locally and only push if YOU are the sender
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



// import {
//   decryptAESKey,
//   decryptMessage,
// } from "../Utils/cryptoUtils"; // adjust path as needed

subscribeToMessages: () => {
  const { selectedUser, messages } = get();
  const { socket, authUser, privateKey } = useAuthStore.getState();

  if (!selectedUser || !socket || !authUser || !privateKey) return;

  socket.off("newMessage"); // remove previous listener to avoid duplicate firing

  socket.on("newMessage", async (newMessage) => {
    const isRelevant =
      newMessage.senderId === selectedUser._id ||
      newMessage.receiverId === selectedUser._id;

    if (!isRelevant) return;

    // 💡 Avoid duplicate (sender already added it after send)
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
        isSender, // 👈 added for ChatContainer
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
