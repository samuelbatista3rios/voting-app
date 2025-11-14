const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req,res,next)=>{
const auth = req.headers.authorization;
if(!auth) return res.status(401).json({ message: 'Não autorizado' });
const token = auth.split(' ')[1];
try{
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
req.user = await User.findById(decoded.id).select('-password');
next();
}catch(e){
return res.status(401).json({ message: 'Token inválido' });
}
};


exports.adminOnly = (req,res,next)=>{
if(req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
next();
};