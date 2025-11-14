// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const resultsRoutes = require('./routes/results');
const User = require('./models/User');
const publicRoutes = require('./routes/public');
const meRoutes = require('./routes/me');

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));
app.use(express.json()); // aceita JSON no body

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas que exigem autenticação/role (o próprio router faz o protect/adminOnly)
app.use('/api/admin', adminRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', meRoutes);

// Health check simples
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler de erros básico
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;

// Função para criar um admin inicial a partir de variáveis de ambiente (opcional)
const seedAdminIfNeeded = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    if (!adminEmail || !adminPassword) {
      console.log('ADMIN_EMAIL ou ADMIN_PASSWORD não configurados — pulando seed do admin.');
      return;
    }

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin já existe:', adminEmail);
      return;
    }

    const u = new User({ name: adminName, email: adminEmail, password: adminPassword, role: 'admin' });
    await u.save();
    console.log('Admin seed criado:', adminEmail);
  } catch (e) {
    console.error('Erro ao criar admin seed:', e);
  }
};

// Conecta ao DB e sobe o servidor
connectDB()
  .then(async () => {
    // seed admin (opcional)
    await seedAdminIfNeeded();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro conectando ao MongoDB:', err);
    process.exit(1);
  });
