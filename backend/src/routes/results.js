// backend/src/routes/results.js
const express = require('express');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Criterion = require('../models/Criterion');
const router = express.Router();

/**
 * Helper: safe number conversion
 */
const toNumberSafe = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * GET /api/results/top
 * Returns an object like { top3: [...], results: [...] }
 * - top3: array of top 3 candidates with aggregated metrics
 * - results: full list sorted by average desc
 */
router.get('/top', async (req, res) => {
  try {
    // load votes and populate candidate and criterion references if possible
    // We'll populate candidate and answers.criterion if you store refs
    const votes = await Vote.find().populate('candidate').populate('answers.criterion').lean();

    // gather all candidates
    const candidatesMap = {}; // candidateId -> { candidate, votes: [], totals... }
    votes.forEach(v => {
      if (!v.candidate) return; // vote for a deleted candidate? ignore
      const cid = String(v.candidate._id);
      if (!candidatesMap[cid]) {
        candidatesMap[cid] = { candidate: v.candidate, votes: [], scoreSum: 0, weightSum: 0, votesCount: 0 };
      }
      candidatesMap[cid].votes.push(v);
    });

    // For each candidate, compute weighted average across votes and criteria
    const results = [];

    Object.values(candidatesMap).forEach(entry => {
      let totalWeighted = 0;
      let totalWeight = 0;
      let countedVotes = 0;

      // For each vote of this candidate compute vote's weighted average (skipping invalid answers)
      entry.votes.forEach(vote => {
        let voteWeighted = 0;
        let voteWeightSum = 0;
        // ensure answers exists
        if (!Array.isArray(vote.answers)) return;

        vote.answers.forEach(a => {
          // a.criterion should be populated (document) or null
          const crit = a.criterion;
          if (!crit) {
            // missing criterion (deleted) — skip this answer
            console.warn(`Vote ${vote._id} references missing criterion ${a.criterion}; answer ignored.`);
            return;
          }

          // determine value numeric or named
          let val = a.value;
          if (crit.type === 'numeric') {
            val = toNumberSafe(a.value);
          } else {
            // for named type, try to convert option to an index-based score if you had defined mapping;
            // fallback: treat named options as 0 or 1 — here we skip named for averaging unless you define mapping
            // to keep consistent, skip named answers for numeric average
            return;
          }

          const weight = (crit.weight !== undefined && crit.weight !== null) ? Number(crit.weight) : 1;
          voteWeighted += val * weight;
          voteWeightSum += weight;
        }); // end vote.answers.forEach

        if (voteWeightSum > 0) {
          const voteAvg = voteWeighted / voteWeightSum;
          totalWeighted += voteAvg;
          totalWeight += 1; // count this vote as 1 vote in candidate average (we averaged per-vote)
          countedVotes += 1;
        } else {
          // vote had no valid numeric answers (e.g. all referenced deleted or only named options) — ignore
        }
      }); // end entry.votes.forEach

      if (countedVotes > 0) {
        const candidateAverage = totalWeighted / totalWeight; // average of per-vote averages
        results.push({
          candidate: entry.candidate,
          average: candidateAverage,
          votes: countedVotes
        });
      } else {
        // no valid votes for candidate: push with average 0 and votes 0
        results.push({
          candidate: entry.candidate,
          average: 0,
          votes: 0
        });
      }
    });

    // sort results by average desc
    results.sort((a,b) => b.average - a.average);

    const top3 = results.slice(0,3);
    res.json({ top3, results });
  } catch (e) {
    console.error('Erro GET /api/results/top', e);
    res.status(500).json({ message: 'Erro ao calcular resultados' });
  }
});

module.exports = router;
