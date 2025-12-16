import mongoose from "mongoose";

const RoomMessageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  metadata: { type: Object },
}, { timestamps: true });


const RoomMessage = mongoose.model("RoomMessage", RoomMessageSchema);

export default RoomMessage;