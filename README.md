# Painel em Tempo Real com Socket.IO

Atende aos requisitos da **Atividade Prática 03**:

- **Backend (Node.js + Express + Socket.IO)**
  - Conta usuários conectados.
  - Mantém e calcula **room** mais populosa.
  - Emite estatísticas **a cada 1 segundo** via `setInterval`.

- **Frontend (HTML/CSS/JS)**
  - Exibe usuários online em tempo real.
  - Mostra sala mais populosa e **ranking de salas** (extra).
  - **Gráfico em tempo real** (extra) com Chart.js.
  - **Alertas visuais** quando uma sala ultrapassa 5 usuários (configurável).

## Como rodar localmente

```bash
npm install
npm start
# abra http://localhost:3000
```

Abra várias abas e/ou janelas e entre em salas diferentes para testar o ranking.

## Estrutura
```
realtime-dashboard/
├─ package.json
├─ server.js
└─ public/
   ├─ index.html
   ├─ styles.css
   └─ client.js
```

## Observações

- Por padrão, todo cliente entra na sala **lobby** ao conectar (pode alterar em `server.js`).
- Para entrar em outra sala, use o formulário **"Trocar de Sala"** no topo da página.
- O servidor emite o objeto `stats` com `{ totalUsers, mostPopularRoom, ranking, timestamp }`.
- O gráfico guarda os últimos **60 pontos** (1 minuto).
```
