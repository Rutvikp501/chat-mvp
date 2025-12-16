import { PhoneOffIcon, VideoIcon, PhoneIcon } from "lucide-react";
import { useCallStore } from "../../store/useCallStore";

export default function OutgoingCallBanner() {
  const { outgoingCall, cancelOutgoingCall } = useCallStore();

  if (!outgoingCall) return null;

  const { receiver, type, room } = outgoingCall;

  const name =
    receiver?.fullName ||
    room?.name ||
    "Unknown";

  const icon =
    type === "video" ? <VideoIcon className="w-5 h-5" /> : <PhoneIcon className="w-5 h-5" />;

  return (
    <div className="w-full bg-slate-800 border-b border-slate-700 px-4 py-3 flex justify-between items-center animate-fadeIn z-20">
      <div className="flex items-center space-x-3 text-slate-200">
        {icon}
        <span className="font-medium">Calling {name}...</span>
      </div>

      <button
        onClick={cancelOutgoingCall}
        className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition"
        title="Cancel Call"
      >
        <PhoneOffIcon className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
