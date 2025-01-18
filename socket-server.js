import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const users = {};
const drawings = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('addUser', (user) => {
    users[user.userId] = { ...user, socketId: socket.id, drawings: [] };
    io.emit('updateUsers', Object.values(users));
  });

  socket.on('addDrawing', (drawing) => {
    drawings.push(drawing);
    io.emit('newDrawing', drawing);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userId = Object.keys(users).find((id) => users[id].socketId === socket.id);
    if (userId) delete users[userId];
    io.emit('updateUsers', Object.values(users));
  });
});

const PORT = 5175;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});