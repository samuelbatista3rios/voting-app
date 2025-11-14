// backend/src/routes/admin.js
const express = require("express");
const Criterion = require("../models/Criterion");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const { protect, adminOnly } = require("../middlewares/auth");
const router = express.Router();

router.use(protect, adminOnly);

// CRITERIA
router.post("/criterion", async (req, res) => {
  try {
    const c = new Criterion(req.body);
    await c.save();
    res.json(c);
  } catch (e) {
    console.error("Erro POST /admin/criterion", e);
    res.status(500).json({ message: "Erro ao criar critério" });
  }
});

router.get("/criteria", async (req, res) => {
  try {
    const list = await Criterion.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error("Erro GET /admin/criteria", e);
    res.status(500).json({ message: "Erro ao buscar critérios" });
  }
});

// DELETE criterion (plural)
router.delete("/criteria/:id", async (req, res) => {
  try {
    await Criterion.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Critério removido com sucesso" });
  } catch (err) {
    console.error("Erro DELETE /admin/criteria/:id", err);
    res.status(500).json({ message: "Erro ao excluir critério" });
  }
});

// DELETE criterion (singular alias) -> para compatibilidade com frontend
router.delete("/criterion/:id", async (req, res) => {
  try {
    await Criterion.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Critério removido com sucesso" });
  } catch (err) {
    console.error("Erro DELETE /admin/criterion/:id", err);
    res.status(500).json({ message: "Erro ao excluir critério" });
  }
});

// CANDIDATES
router.post("/candidate", async (req, res) => {
  try {
    const { number, name } = req.body;
    if (number === undefined || number === null || number === "") {
      return res
        .status(400)
        .json({ message: "Número do candidato é obrigatório" });
    }

    const parsedNumber = Number(number);
    if (Number.isNaN(parsedNumber)) {
      return res.status(400).json({ message: "Número do candidato inválido" });
    }

    const candidate = new Candidate({ number: parsedNumber, name: name || "" });
    await candidate.save();
    res.json(candidate);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: "Número de candidato já existe" });
    }
    console.error("Erro POST /admin/candidate", e);
    res.status(500).json({ message: "Erro ao criar candidato" });
  }
});

router.get("/candidates", async (req, res) => {
  try {
    const list = await Candidate.find().sort({ number: 1 });
    res.json(list);
  } catch (e) {
    console.error("Erro GET /admin/candidates", e);
    res.status(500).json({ message: "Erro ao buscar candidatos" });
  }
});

// DELETE candidate (plural)
router.delete("/candidates/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidato removido com sucesso" });
  } catch (err) {
    console.error("Erro DELETE /admin/candidates/:id", err);
    res.status(500).json({ message: "Erro ao excluir candidato" });
  }
});

// DELETE candidate (singular alias) -> compatibilidade com frontend
router.delete("/candidate/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidato removido com sucesso" });
  } catch (err) {
    console.error("Erro DELETE /admin/candidate/:id", err);
    res.status(500).json({ message: "Erro ao excluir candidato" });
  }
});

// JUDGES (USERS with role 'judge')
router.post("/judge", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email e password são obrigatórios" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email já cadastrado" });

    const u = new User({ name: name || "", email, password, role: "judge" });
    await u.save();
    res.json({ id: u._id, name: u.name, email: u.email });
  } catch (e) {
    console.error("Erro POST /admin/judge", e);
    res.status(500).json({ message: "Erro ao criar jurado" });
  }
});

// list judges
router.get("/judges", async (req, res) => {
  try {
    const judges = await User.find({ role: "judge" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(judges);
  } catch (e) {
    console.error("Erro GET /admin/judges", e);
    res.status(500).json({ message: "Erro ao listar jurados" });
  }
});

// delete judge
router.delete("/judge/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ message: "Jurado não encontrado" });
    if (u.role === "admin")
      return res.status(403).json({ message: "Não é permitido remover admin" });
    await User.deleteOne({ _id: id });
    res.json({ message: "Jurado removido" });
  } catch (e) {
    console.error("Erro DELETE /admin/judge/:id", e);
    res.status(500).json({ message: "Erro ao remover jurado" });
  }
});

module.exports = router;
