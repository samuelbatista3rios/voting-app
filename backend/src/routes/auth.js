const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


const signToken = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });


// register (only admin can create via admin route) - we allow simple signup for judges here
router.post('/login', async (req,res)=>{
const { email, password } = req.body;
const user = await User.findOne({ email });
if(!user) return res.status(401).json({ message: 'Credenciais inválidas' });
const ok = await user.comparePassword(password);
if(!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
const token = signToken(user);
res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});


module.exports = router;