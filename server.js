// server.js
// Painel em Tempo Real com Socket.IO
// Requisitos: Node.js, Express e Socket.IO

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// Serve o frontend estático
app.use(express.static(path.join(__dirname, 'public')));

// --- Estado do servidor ---
// Mapeia socket.id -> nome da sala que o cliente escolheu (se houver)
const socketRoom = new Map();

// Função utilitária: retorna objeto { roomName: count } apenas para rooms "reais"
function getRoomsPopulation() {
  const rooms = io.sockets.adapter.rooms; // Map
  const sids = io.sockets.adapter.sids;   // Map de socket.id -> Set(rooms)

  const populations = {};
  // Rooms "reais" são aquelas que NÃO são o id de um socket individual
  for (const [roomName, clientsSet] of rooms) {
    if (!sids.has(roomName)) {
      populations[roomName] = clientsSet.size;
    }
  }
  return populations;
}

function getRanking() {
  const populations = getRoomsPopulation();
  const ranking = Object.entries(populations)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  return ranking;
}

function getMostPopularRoom() {
  const ranking = getRanking();
  if (ranking.length === 0) return { name: null, count: 0 };
  return ranking[0];
}

function getTotalConnected() {
  return io.of("/").sockets.size;
}

// Emite estatísticas a cada 1 segundo
setInterval(() => {
  const totalUsers = getTotalConnected();
  const mostPopularRoom = getMostPopularRoom();
  const ranking = getRanking();

  io.emit('stats', {
    totalUsers,
    mostPopularRoom,
    ranking,
    timestamp: Date.now()
  });
}, 1000);

// Lida com conexões de clientes
io.on('connection', (socket) => {
  // Coloca cada cliente inicialmente numa sala "lobby" (opcional, mas útil para ranking)
  const defaultRoom = 'lobby';
  socket.join(defaultRoom);
  socketRoom.set(socket.id, defaultRoom);

  socket.on('join-room', (roomName) => {
    try {
      // Sair da sala anterior
      const current = socketRoom.get(socket.id);
      if (current && current !== roomName) {
        socket.leave(current);
      }
      // Entrar na nova sala
      socket.join(roomName);
      socketRoom.set(socket.id, roomName);
      socket.emit('joined-room', roomName);
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      socket.emit('error-message', 'Não foi possível entrar na sala.');
    }
  });

  socket.on('disconnect', () => {
    socketRoom.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
