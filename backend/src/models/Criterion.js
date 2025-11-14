const mongoose = require('mongoose');
const criterionSchema = new mongoose.Schema({
label: { type: String, required: true },
type: { type: String, enum: ['numeric','named'], default: 'numeric' },
// if numeric: provide min/max
numericMin: { type: Number },
numericMax: { type: Number },
// if named: provide options
options: [{ type: String }],
weight: { type: Number, default: 1 }
}, { timestamps: true });


module.exports = mongoose.model('Criterion', criterionSchema);