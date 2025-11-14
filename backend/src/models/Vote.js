const mongoose = require('mongoose');
const voteSchema = new mongoose.Schema({
judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
answers: [{
criterion: { type: mongoose.Schema.Types.ObjectId, ref: 'Criterion' },
value: { type: mongoose.Schema.Types.Mixed }
}],
createdAt: { type: Date, default: Date.now }
});


voteSchema.index({ judge: 1, candidate: 1 }, { unique: true }); // one vote per judge per candidate


module.exports = mongoose.model('Vote', voteSchema);