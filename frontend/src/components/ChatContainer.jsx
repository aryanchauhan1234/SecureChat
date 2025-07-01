import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    inviteStatus,
    checkInviteStatus,
    sendInvite,
    respondToInvite,
    subscribeToMessages,
    unsubscribeFromMessages,
    setInviteStatus,
    inviteSentBy,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    checkInviteStatus();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!socket || !selectedUser?._id) return;

    socket.on("inviteAccepted", ({ receiverId }) => {
      if (receiverId === selectedUser._id) {
        setInviteStatus("accepted");
      }
    });

    return () => {
      socket.off("inviteAccepted");
    };
  }, [socket, selectedUser?._id]);

  useEffect(() => {
    if (inviteStatus === "accepted" && selectedUser?._id) {
      getMessages();
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [inviteStatus, selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 🔄 Show spinner loader on delay / fetch
  if (
    inviteStatus === "accepted" &&
    (isMessagesLoading )
  ) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-base-200">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading messages...
            </p>
          </div>
        </div>
        <MessageInput />
      </div>
    );
  }

  // 🚫 Invite not sent
  if (inviteStatus === "none") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center bg-base-100 dark:bg-base-200">
        <p className="mb-4 text-lg font-medium">You haven't invited this user yet.</p>
        <div className="flex gap-4">
          <button onClick={sendInvite} className="btn btn-primary">Send Chat Invite</button>
          <button onClick={checkInviteStatus} className="btn btn-outline btn-primary">Check Invite Status</button>
        </div>
      </div>
    );
  }

  // ⏳ Invite pending
  if (inviteStatus === "pending") {
    const isReceiver = inviteSentBy && inviteSentBy !== authUser._id;

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center bg-base-100 dark:bg-base-200 p-6">
        {isReceiver ? (
          <>
            <p className="mb-4 text-lg font-medium">This user invited you to chat.</p>
            <div className="flex gap-4">
              <button onClick={() => respondToInvite("accepted")} className="btn btn-success">Accept</button>
              <button onClick={() => respondToInvite("rejected")} className="btn btn-error">Reject</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg text-warning mb-4">Waiting for user to accept your chat invite...</p>
            <button onClick={checkInviteStatus} className="btn btn-outline btn-primary">Refresh Status</button>
          </>
        )}
      </div>
    );
  }

  // ❌ Invite rejected
  if (inviteStatus === "rejected") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-base-100 dark:bg-base-200">
        <p className="text-lg text-error">This user has rejected your chat invite.</p>
      </div>
    );
  }

  // 💬 Main chat UI
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

              <div className="chat-header mb-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <time>{formatMessageTime(message.createdAt)}</time>
              </div>

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
