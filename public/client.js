// client.js
const socket = io();

// DOM refs
const totalUsersEl = document.getElementById('totalUsers');
const popularRoomEl = document.getElementById('popularRoom');
const popularRoomCountEl = document.getElementById('popularRoomCount');
const rankingListEl = document.getElementById('rankingList');
const alertsEl = document.getElementById('alerts');
const roomForm = document.getElementById('roomForm');
const roomInput = document.getElementById('roomInput');
const joinedInfo = document.getElementById('joinedInfo');

// Chart.js setup (linha do total de usuários)
const ctx = document.getElementById('usersChart').getContext('2d');
const chartData = {
  labels: [],
  datasets: [{
    label: 'Usuários Online',
    data: []
  }]
};
const usersChart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: {
        display: true,
        ticks: { autoSkip: true, maxTicksLimit: 8 }
      },
      y: { beginAtZero: true, precision: 0 }
    },
    plugins: {
      legend: { display: false }
    }
  }
});

// Handler de envio de sala
roomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const roomName = roomInput.value.trim();
  if (!roomName) return;
  socket.emit('join-room', roomName);
  roomInput.value = '';
});

socket.on('joined-room', (roomName) => {
  joinedInfo.textContent = `Você está na sala: ${roomName}`;
});

socket.on('error-message', (msg) => {
  addAlert('danger', msg);
});

// Recebe estatísticas a cada 1s
socket.on('stats', ({ totalUsers, mostPopularRoom, ranking, timestamp }) => {
  totalUsersEl.textContent = totalUsers;

  const roomName = mostPopularRoom?.name ?? '—';
  const roomCount = mostPopularRoom?.count ?? 0;
  popularRoomEl.textContent = roomName || '—';
  popularRoomCountEl.textContent = `${roomCount} usuário(s)`;

  // Ranking
  rankingListEl.innerHTML = '';
  if (ranking && ranking.length > 0) {
    ranking.forEach((r, i) => {
      const li = document.createElement('li');
      li.textContent = `#${i+1} • ${r.name} — ${r.count} usuário(s)`;
      rankingListEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma sala ativa ainda.';
    rankingListEl.appendChild(li);
  }

  // Atualiza gráfico (guarda últimos 60 pontos)
  const timeLabel = new Date(timestamp).toLocaleTimeString();
  chartData.labels.push(timeLabel);
  chartData.datasets[0].data.push(totalUsers);
  if (chartData.labels.length > 60) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
  }
  usersChart.update();

  // Alerta visual se alguma sala > 5 usuários (personalizável)
  const threshold = 5;
  const over = (ranking || []).filter(r => r.count > threshold);
  if (over.length > 0) {
    addAlert('warn', `Atenção: ${over.map(r => `${r.name} (${r.count})`).join(', ')} ultrapassou ${threshold} usuário(s).`);
  }
});

function addAlert(type, text) {
  const div = document.createElement('div');
  div.className = `alert ${type}`;
  div.textContent = text;
  alertsEl.prepend(div);
  // Remove após 6s
  setTimeout(() => div.remove(), 6000);
}
