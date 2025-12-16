import { useCallStore } from "../../store/useCallStore";
import { useWebRTCAudio } from "../../hooks/useWebRTCAudio";

function IncomingCallModal() {
  const { incomingCall, acceptCall, declineCall } = useCallStore();
  const { unlockAudio } = useWebRTCAudio();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center text-white">
      <div className="bg-gray-900 p-6 rounded-lg flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          Incoming Audio Call
        </h2>

        <div className="flex gap-4">
          <button
            onClick={() => {
              unlockAudio();   // 🔥 THIS IS THE FIX
              acceptCall();
            }}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Accept
          </button>

          <button
            onClick={declineCall}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
