import { XIcon, PhoneIcon, VideoIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore"; // <-- NEW

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const { initiateDirectCall } = useCallStore(); // <-- NEW

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  // Close chat on Escape
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
          <p className="text-slate-400 text-sm">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* 📞 AUDIO CALL BUTTON */}
        <button
          onClick={() => initiateDirectCall(selectedUser, "audio")}
          title="Audio Call"
        >
          <PhoneIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
        </button>

        {/* 🎥 VIDEO CALL BUTTON */}
        <button
          onClick={() => initiateDirectCall(selectedUser, "video")}
          title="Video Call"
        >
          <VideoIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
        </button>

        {/* ❌ Close Button */}
        <button onClick={() => setSelectedUser(null)} title="Close">
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
