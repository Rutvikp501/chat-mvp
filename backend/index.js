import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import http from 'http';
import { socketServer } from './src/config/socket.js';

dotenv.config();

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io
socketServer(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
