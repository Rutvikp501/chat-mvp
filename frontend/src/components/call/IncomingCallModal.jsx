import { useEffect } from "react";
import { useCallStore } from "../../store/useCallStore";

const ringtone = new Audio("/sounds/ringtone.mp3");
ringtone.loop = true; // ringtone should loop

function IncomingCallModal() {
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useCallStore();

  // play ringtone on mount
  useEffect(() => {
    if (!incomingCall) return;

    const tryPlay = async () => {
      try {
        await ringtone.play();
      } catch (err) {
        console.warn("Autoplay blocked — waiting for user gesture");
      }
    };

    tryPlay();

    return () => {
      ringtone.pause();
      ringtone.currentTime = 0;
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const { callerInfo, type } = incomingCall;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-slate-800 px-8 py-6 rounded-xl text-center shadow-lg w-80">

        {/* Profile */}
        <img
          src={callerInfo?.profilePic || "/avatar.png"}
          className="w-24 h-24 rounded-full mx-auto mb-3"
          alt="Caller"
        />

        <h2 className="text-xl text-white font-semibold">
          {callerInfo?.fullName || "Unknown Caller"}
        </h2>

        <p className="text-slate-400 mt-1">
          {type === "video" ? "Video Call" : "Audio Call"}
        </p>

        {/* Buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={acceptIncomingCall}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Accept
          </button>

          <button
            onClick={declineIncomingCall}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
