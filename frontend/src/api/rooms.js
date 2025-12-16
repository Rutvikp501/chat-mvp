
import axios from './axios.js';

export async function fetchRooms() {
  const res = await axios.get('/rooms');
  return res.data;
}

export async function createGroup(name, memberIds) {
  const res = await axios.post('/rooms/group', { name, memberIds });
  return res.data;
}

export async function getRoomMessages(roomId, cursor) {
  const res = await axios.get(`/rooms/${roomId}/messages`, {
    params: { cursor },
  });
  return res.data;
}
