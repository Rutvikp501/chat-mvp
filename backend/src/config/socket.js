import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import RoomMember from "../models/RoomMember.js";
import Message from "../models/Message.js";

const userSocketMap = {}; // { userId: socketId }
let ioInstance = null;

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function socketServer(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    path: "/socket.io",
  });

  ioInstance.use(socketAuthMiddleware);

  ioInstance.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`⚡ User connected: ${socket.user.fullName}`);

    // Save socket
    userSocketMap[userId] = socket.id;
    socket.join(`user:${userId}`);

    ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));

    // -----------------------------------------------------
    // MESSAGE EVENTS
    // -----------------------------------------------------
    socket.on("message:send", async ({ roomId, content }) => {
      const membership = await RoomMember.findOne({ room: roomId, user: userId });
      if (!membership) return;

      const msg = await Message.create({
        room: roomId,
        sender: userId,
        content,
      });

      ioInstance.to(`room:${roomId}`).emit("message:new", {
        id: msg._id,
        roomId,
        senderId: userId,
        content,
        createdAt: msg.createdAt,
      });
    });

    // -----------------------------------------------------
    // CALL SIGNALING (1-1 CALLING)
    // -----------------------------------------------------

    // 1️⃣ Caller sends offer
    socket.on("call:offer", ({ calleeId, sdp }) => {
      console.log("📡 OFFER from:", userId, " → to:", calleeId);

      ioInstance.to(`user:${calleeId}`).emit("call:incoming", {
        from: userId,
        sdp,
      });
    });

    // 2️⃣ Receiver accepts and sends answer
    socket.on("call:answer", ({ callerId, sdp }) => {
      console.log("📡 ANSWER from:", userId, " → to:", callerId);

      ioInstance.to(`user:${callerId}`).emit("call:answered", {
        from: userId,
        sdp,
      });
    });

    // 3️⃣ ICE CANDIDATE exchange
    socket.on("call:candidate", ({ peerId, candidate }) => {
      ioInstance.to(`user:${peerId}`).emit("call:candidate", {
        from: userId,
        candidate,
      });
    });

    // 4️⃣ End call
    socket.on("call:end", ({ toUserId }) => {
      if (!toUserId) return;
      ioInstance.to(`user:${toUserId}`).emit("call:ended", {
        from: userId,
      });
    });

    // -----------------------------------------------------
    // DISCONNECT
    // -----------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.user.fullName}`);
      delete userSocketMap[userId];
      ioInstance.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return ioInstance;
}

export { ioInstance as io };
