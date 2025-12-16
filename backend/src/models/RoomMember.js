import mongoose from "mongoose";

const RoomMemberSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
}, { timestamps: true });

RoomMemberSchema.index({ room: 1, user: 1 }, { unique: true });
const RoomMember = mongoose.model('RoomMember', RoomMemberSchema);
export default RoomMember;