import Room from'../models/Room.js';
import RoomMember from'../models/RoomMember.js';
import Message from'../models/Message.js';
// List rooms for current user
export const listRooms =  async (req, res) => {
  const userId = req.user.id;
  const rooms = await RoomMember
    .find({ user: userId })
    .populate('room')
    .lean();

  res.json(rooms.map(rm => rm.room));
};

// Create direct room
export const createDirectRoom = async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.body;

  // find existing direct room with exactly these two members
  let room = await Room.findOne({ type: 'direct', /* ...*/ });
  // For brevity, you’d implement a query using Room + RoomMember

  if (!room) {
    room = await Room.create({ type: 'direct', createdBy: userId });
    await RoomMember.create([
      { room: room._id, user: userId, role: 'owner' },
      { room: room._id, user: otherUserId, role: 'member' },
    ]);
  }

  res.status(201).json(room);
}

// Create group
export const createGroupRoom =  async (req, res) => {
  const userId = req.user.id;
  const { name, memberIds = [] } = req.body;

  const room = await Room.create({ type: 'group', name, createdBy: userId });
  const allMembers = Array.from(new Set([...memberIds, userId]));

  await RoomMember.create(
    allMembers.map(id => ({
      room: room._id,
      user: id,
      role: id === userId ? 'owner' : 'member',
    }))
  );

  res.status(201).json(room);
};

// Rename group
export const renameGroupRoom =  async (req, res) => {
  const { roomId } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  const membership = await RoomMember.findOne({ room: roomId, user: userId });
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const room = await Room.findByIdAndUpdate(roomId, { name }, { new: true });
  res.json(room);
};

// Add members to group
export const addMembersToGroup =async (req, res) => {
  const { roomId } = req.params;
  const { userIdToAdd } = req.body;
  const userId = req.user.id;

  const membership = await RoomMember.findOne({ room: roomId, user: userId });
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const member = await RoomMember.create({
    room: roomId,
    user: userIdToAdd,
    role: 'member',
  });

  res.status(201).json(member);
};

// Messages with pagination (basic)
export const paginationMessages = async (req, res) => {
  const { roomId } = req.params;
  const { cursor, limit = 30 } = req.query;
  const userId = req.user.id;

  const membership = await RoomMember.findOne({ room: roomId, user: userId });
  if (!membership) return res.status(403).json({ error: 'Not in room' });

  const query = { room: roomId };
  if (cursor) query._id = { $lt: cursor };

  const messages = await Message
    .find(query)
    .sort({ _id: -1 })
    .limit(Number(limit) + 1)
    .lean();

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  res.json({
    messages: messages.reverse(),
    nextCursor: hasMore ? messages[0]._id : null,
  });
};

