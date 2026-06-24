const express = require('express');
const app = express();
app.use(express.json());

// ── Lista de usuários autorizados ──
// Formato: { "usuario": "senha" }
// Para adicionar/remover alunos, edite aqui e faça commit no GitHub
const USUARIOS = {
  "joao": "senha123",
  "maria": "betfair2025",
  "pedro": "under99"
};

// ── CORS: permite só a extensão do Chrome chamar ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Endpoint de autenticação ──
app.post('/auth', (req, res) => {
  const { usuario, senha } = req.body || {};

  if (!usuario || !senha) {
    return res.json({ ok: false, erro: 'Dados inválidos' });
  }

  const senhaCorreta = USUARIOS[usuario.toLowerCase().trim()];
  const ok = senhaCorreta !== undefined && senhaCorreta === senha.trim();

  // Retorna só ok — nunca expõe a lista ou detalhes
  return res.json({ ok });
});

// ── Health check ──
app.get('/', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
