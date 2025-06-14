import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col bg-base-100 transition-all duration-300">
      {/* Header */}
      <div className="border-b border-base-300 px-4 py-5">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary" />
          <span className="font-semibold hidden lg:block text-base-content">Contacts</span>
        </div>

        {/* Toggle Online Filter */}
        <div className="mt-4 hidden lg:flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-base-content">Show online only</span>
          </label>
          <span className="text-xs text-base-content/60">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* Contact List */}
      <div className="overflow-y-auto flex-1 px-2 py-3 space-y-1">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full flex items-center gap-3 p-2 rounded-lg
                transition-all duration-200 hover:bg-base-200
                ${isSelected ? "bg-gradient-to-r from-primary/20 to-transparent ring-1 ring-primary" : ""}
              `}
            >
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-12 h-12 object-cover rounded-full border border-base-300"
                />
                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                    rounded-full ring-2 ring-base-100"
                  />
                )}
              </div>

              {/* Name & Status (only on large screens) */}
              <div className="hidden lg:flex flex-col text-left overflow-hidden">
                <span className="font-medium text-base-content truncate">{user.fullName}</span>
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
          <div className="text-center text-base-content/60 py-6">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
