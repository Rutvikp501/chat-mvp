import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { addMembersToGroup, createDirectRoom, createGroupRoom, listRooms, paginationMessages, renameGroupRoom } from '../controllers/rooms.controller.js';
const router = express.Router();

// List rooms for current user
router.get('/', protectRoute,listRooms);

// Create direct room
router.post('/direct', protectRoute,createDirectRoom);

// Create group
router.post('/group', protectRoute, createGroupRoom);

// Rename group
router.patch('/:roomId', protectRoute,renameGroupRoom);

// Add member
router.post('/:roomId/members', protectRoute,addMembersToGroup );

// Messages with pagination (basic)
router.get('/:roomId/messages', protectRoute, paginationMessages);

export default router;
