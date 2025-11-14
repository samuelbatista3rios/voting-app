// backend/src/routes/me.js
const express = require('express');
const User = require('../models/User');
const { protect } = require('../middlewares/auth'); // ajusta se o path for diferente
const router = express.Router();

// GET /api/me
// retorna info do usuário logado (sem senha)
router.get('/me', protect, async (req, res) => {
  try {
    // protect deve popular req.user com algo tipo { id: '...', _id: '...' }
    const userId = (req.user && (req.user.id || req.user._id || req.user._id?.toString())) || null;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json(user);
  } catch (err) {
    console.error('Erro GET /api/me', err);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

module.exports = router;
