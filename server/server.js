import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Bind Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Socket connection event map
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Register user with their personal room for notifications
  socket.on('join_user', ({ userId }) => {
    socket.join(userId);
    console.log(`[Socket] User ${userId} joined room`);
  });

  // Join messaging room
  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`[Socket] Socket ${socket.id} joined ChatRoom ${roomId}`);
  });

  // Message dispatcher
  socket.on('send_message', (msg) => {
    console.log(`[Socket] Chat Message in ${msg.chatRoom} from ${msg.senderName}`);
    // Broadcast message to room members
    io.to(msg.chatRoom).emit('receive_message', msg);
  });

  // Notifications dispatcher
  socket.on('send_notification', ({ recipientId, notification }) => {
    io.to(recipientId).emit('receive_notification', notification);
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Launch Server listener
server.listen(PORT, () => {
  console.log(`[Server] RideShareX Engine running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
