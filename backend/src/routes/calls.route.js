import express from "express";
const router = express.Router();

// 1-1 call start
router.post("/", (req, res) => {
  const { receiverId, type } = req.body;

  if (!receiverId) {
    return res.status(400).json({ error: "receiverId missing" });
  }

  const fakeCall = {
    _id: Date.now().toString(),
    receiverId,
    type,
    room: null,
    status: "ringing",
    createdAt: new Date(),
  };

  res.json(fakeCall);
});

// group call start
router.post("/group", (req, res) => {
  const { roomId, type } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: "roomId missing" });
  }

  res.json({
    _id: Date.now().toString(),
    roomId,
    type,
    status: "ringing",
    createdAt: new Date(),
  });
});

// update call status
router.patch("/:id", (req, res) => {
  res.json({ success: true });
});

export default router;
