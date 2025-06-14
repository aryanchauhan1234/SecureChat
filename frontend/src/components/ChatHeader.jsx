import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-4 border-b border-base-300 bg-base-100/60 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-4">
          {/* Avatar with online dot */}
          <div className="avatar relative">
            <div className="w-11 h-11 rounded-full ring-2 ring-primary ring-offset-2">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
          </div>

          {/* Name and Status */}
          <div>
            <h3 className="text-lg font-semibold text-base-content">{selectedUser.fullName}</h3>
            <p
              className={`text-sm ${
                isOnline ? "text-green-400" : "text-base-content/60"
              } transition-colors`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="text-base-content hover:text-error p-2 rounded-full transition-all hover:bg-base-200"
          title="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
