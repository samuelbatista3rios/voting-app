const mongoose = require('mongoose');
const candidateSchema = new mongoose.Schema({
number: { type: Number, required: true, unique: true },
name: { type: String, default: '' },
meta: { type: Object }
}, { timestamps: true });


module.exports = mongoose.model('Candidate', candidateSchema);