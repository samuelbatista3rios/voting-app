// backend/src/routes/vote.js
const express = require('express');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Criterion = require('../models/Criterion');
const { protect } = require('../middlewares/auth');
const router = express.Router();

// POST /api/vote
// body: { candidateNumber, answers: [{ criterionId, value }] }
router.post('/', protect, async (req, res) => {
  try {
    const { candidateNumber, answers } = req.body;
    if (!candidateNumber) return res.status(400).json({ message: 'Número do candidato é obrigatório' });
    if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ message: 'Responda pelo menos um critério' });

    const candidate = await Candidate.findOne({ number: candidateNumber });
    if (!candidate) return res.status(404).json({ message: 'Candidato não encontrado' });

    // Fetch criteria referenced to validate ranges/options
    const criterionIds = answers.map(a => a.criterionId);
    const criteria = await Criterion.find({ _id: { $in: criterionIds } });

    // Map criteria by id for easy lookup
    const criteriaMap = {};
    criteria.forEach(c => { criteriaMap[c._id.toString()] = c; });

    // Validate each answer
    for (const ans of answers) {
      const cid = String(ans.criterionId);
      const crit = criteriaMap[cid];
      if (!crit) return res.status(400).json({ message: `Critério inválido: ${cid}` });

      if (crit.type === 'numeric') {
        const num = Number(ans.value);
        if (Number.isNaN(num)) return res.status(400).json({ message: `Valor inválido para ${crit.label}` });
        const min = (crit.numericMin !== undefined && crit.numericMin !== null) ? crit.numericMin : 1;
        const max = (crit.numericMax !== undefined && crit.numericMax !== null) ? crit.numericMax : 5;
        if (num < min || num > max) return res.status(400).json({ message: `${crit.label} deve estar entre ${min} e ${max}` });
      } else {
        // named type: ensure value is one of options
        const val = String(ans.value);
        if (!Array.isArray(crit.options) || !crit.options.includes(val)) {
          return res.status(400).json({ message: `Opção inválida para ${crit.label}` });
        }
      }
    }

    // Map answers to schema format
    const mapped = answers.map(a => ({ criterion: a.criterionId, value: a.value }));

    // create vote (schema has unique index judge+candidate to prevent duplicate)
    const vote = new Vote({ judge: req.user._id, candidate: candidate._id, answers: mapped });
    await vote.save();

    return res.json({ message: 'Voto registrado' });
  } catch (e) {
    // handle duplicate key (unique index) - judge already voted this candidate
    if (e.code === 11000) return res.status(400).json({ message: 'Você já avaliou esse candidato' });
    console.error('Erro /api/vote:', e);
    return res.status(500).json({ message: 'Erro ao registrar voto' });
  }
});

module.exports = router;
