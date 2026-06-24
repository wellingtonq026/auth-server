const express = require('express');
const app = express();
app.use(express.json());

// ── Lista de usuários ──
const USUARIOS = {
  "joao": "senha123",
  "will": "moura",
};

// ── Sessões ativas: { usuario: { token, lastSeen } } ──
const SESSOES = {};
const TIMEOUT_MS = 60000; // 60s sem heartbeat = sessão expirada

function gerarToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sessaoAtiva(usuario) {
  const s = SESSOES[usuario];
  if (!s) return false;
  return (Date.now() - s.lastSeen) < TIMEOUT_MS;
}

// ── CORS ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Login ──
app.post('/auth', (req, res) => {
  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) return res.json({ ok: false, erro: 'Dados inválidos' });

  const senhaCorreta = USUARIOS[usuario.toLowerCase().trim()];
  if (!senhaCorreta || senhaCorreta !== senha.trim()) {
    return res.json({ ok: false, erro: 'Credenciais inválidas' });
  }

  // Verifica se já tem sessão ativa em outro lugar
  if (sessaoAtiva(usuario)) {
    return res.json({ ok: false, erro: 'Usuário já está logado em outro dispositivo.' });
  }

  // Cria sessão
  const token = gerarToken();
  SESSOES[usuario] = { token, lastSeen: Date.now() };
  return res.json({ ok: true, token });
});

// ── Heartbeat (app manda a cada 30s para manter sessão viva) ──
app.post('/heartbeat', (req, res) => {
  const { usuario, token } = req.body || {};
  if (!usuario || !token) return res.json({ ok: false });

  const s = SESSOES[usuario];
  if (!s || s.token !== token) return res.json({ ok: false, erro: 'Sessão inválida' });

  s.lastSeen = Date.now();
  return res.json({ ok: true });
});

// ── Logout ──
app.post('/logout', (req, res) => {
  const { usuario, token } = req.body || {};
  if (!usuario || !token) return res.json({ ok: false });

  const s = SESSOES[usuario];
  if (s && s.token === token) delete SESSOES[usuario];
  return res.json({ ok: true });
});

// ── Health check ──
app.get('/', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
