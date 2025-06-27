import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, RefreshCw, Share2 } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleShareApp = () => {
    const shareData = {
      title: "Secure Chat App",
      text: "Join me on this secure chat app!",
      url: window.location.origin,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-64 border-r border-base-300 flex flex-col bg-base-100 transition-all duration-300">
      {/* Header */}
      <div className="border-b border-base-300 px-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold hidden lg:block text-base-content text-md">
              Contacts
            </span>
          </div>
          <button
            onClick={getUsers}
            title="Refresh"
            className="btn btn-xs btn-ghost btn-circle tooltip tooltip-left"
            data-tip="Refresh Users"
          >
            <RefreshCw className="w-4 h-4 text-base-content" />
          </button>
        </div>

        {/* Online Filter */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="text-base-content text-xs">Show online only</span>
          </label>
          <span className="text-xs text-base-content/60">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto flex-1 px-2 py-2 space-y-1">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md
                transition-all duration-200 hover:bg-base-200 text-sm
                ${isSelected ? "bg-gradient-to-r from-primary/20 to-transparent ring-1 ring-primary" : ""}`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-10 h-10 object-cover rounded-full border border-base-300"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left overflow-hidden">
                <span className="font-medium text-base-content truncate text-md">
                  {user.fullName}
                </span>
                <span
                  className={`text-xs ${
                    isOnline ? "text-green-400" : "text-base-content/50"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/60 py-4 text-sm">No users found</div>
        )}
      </div>

      {/* Share App Button */}
      <div className="border-t border-base-300 p-3">
        <button
          onClick={handleShareApp}
          className="btn btn-sm btn-outline btn-primary w-full gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden lg:inline text-sm">Share App</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
