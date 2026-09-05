const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

function authSocket(io) {
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie || '';
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    if (!token) {
      return next(new Error('unauthorized'));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.user = { id: payload.id, username: payload.username, role: payload.role };
      return next();
    } catch (err) {
      return next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Authenticated client connected: ${socket.user.username} (${socket.user.role})`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = authSocket;
