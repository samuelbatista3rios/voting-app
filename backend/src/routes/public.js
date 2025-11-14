// backend/src/routes/public.js
const express = require('express');
const Criterion = require('../models/Criterion');
const router = express.Router();

// rota pública para obter critérios
router.get('/criteria', async (req, res) => {
  try {
    const criteria = await Criterion.find().lean();
    res.json(criteria);
  } catch (err) {
    console.error('Erro public/criteria:', err);
    res.status(500).json({ message: 'Erro ao buscar critérios' });
  }
});

module.exports = router;
