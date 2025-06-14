import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages();
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-white dark:bg-base-200 transition-colors duration-300">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 sm:px-8 sm:py-6">
        {messages.map((message, index) => {
          const isSender = message.isSender ?? (message.senderId === authUser._id);
          const isLast = index === messages.length - 1;

          return (
            <div
              key={message._id}
              ref={isLast ? messageEndRef : null}
              className={`chat ${isSender ? "chat-end" : "chat-start"} items-end`}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-1">
                  <img
                    src={
                      isSender
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser?.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              {/* Timestamp */}
              <div className="chat-header mb-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <time>{formatMessageTime(message.createdAt)}</time>
              </div>

              {/* Message Bubble */}
              <div
                className={`chat-bubble max-w-xs sm:max-w-sm whitespace-pre-wrap ${
                  isSender
                    ? "bg-gradient-to-tr from-indigo-500 to-blue-500 text-white"
                    : "bg-gray-200 dark:bg-neutral text-black dark:text-white"
                } shadow-md rounded-2xl px-4 py-2`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded-md mb-2 max-w-[180px] sm:max-w-[240px]"
                  />
                )}
                <p>
                  {message.text || (
                    <span className="text-xs italic text-red-400">
                      [Message could not be displayed]
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
