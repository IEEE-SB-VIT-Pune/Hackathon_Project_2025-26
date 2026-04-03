import Evaluation from '../models/evaluation.model.js';
import log from '../utils/logger.js';

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr, mu) {
  if (arr.length <= 1) return 1; // avoid division by zero
  const variance =
    arr.reduce((s, x) => s + Math.pow(x - mu, 2), 0) / arr.length;
  // If variance is 0 (all scores are exactly the same), return 1 so we don't divide by 0
  return variance === 0 ? 1 : Math.sqrt(variance);
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * Normalizes all evaluations for a specific judge in a specific hackathon.
 * It will compute the mean and standard deviation of their raw scores,
 * and then calculate a Z-score mapped to a 0-100 scale for each evaluation.
 * If true, it saves the changes to the database and keeps history.
 */
export const normalizeJudgeEvaluations = async (judgeId, hackathonId) => {
  try {
    const evaluations = await Evaluation.find({ judgeId, hackathonId });

    if (evaluations.length === 0) return;

    // 1. Calculate the mean and stdDev for this judge
    const rawScores = evaluations.map(e => e.rawScoreTotal || 0);
    const mu = mean(rawScores);
    const sigma = stdDev(rawScores, mu) || 1;

    log.info('SCORING', `Normalizing for Judge ${judgeId} - Mu: ${mu.toFixed(2)}, Sigma: ${sigma.toFixed(2)}`);

    // 2. Normalize every evaluation and update totalScore
    for (const evaluation of evaluations) {
      let z = (evaluation.rawScoreTotal - mu) / sigma;
      z = clamp(z, -2, 2); // clamp z-score between -2 and 2

      // Map Z-score mathematically (Mean 50, Spread 15)
      let normRawScore = 50 + z * 15;
      normRawScore = clamp(normRawScore, 0, 100);
      normRawScore = Number(normRawScore.toFixed(2));

      // Calculate checkbox Score 
      let checkboxScore = 0;
      if (evaluation.browniePoints && evaluation.browniePoints.length > 0) {
        checkboxScore = evaluation.browniePoints.reduce((sum, bp) => sum + (bp.weight || 0), 0);
      }

      // Check if scores changed. If so, push to history
      const prevNorm = evaluation.normRawScore || 0;
      const prevTotal = evaluation.totalScore || 0;
      
      const newTotalScore = Number((0.60 * normRawScore + 0.30 * checkboxScore + 0.10 * (evaluation.aiScore || 0)).toFixed(2));

      if (Math.abs(prevNorm - normRawScore) > 0.01 || Math.abs(prevTotal - newTotalScore) > 0.01) {
        // We only push to history if there is an actual change
        evaluation.scoreHistory.push({
          evaluatedAt: new Date(),
          rawScoreTotal: evaluation.rawScoreTotal,
          normRawScore: prevNorm,
          checkboxScore: evaluation.checkboxScore || 0,
          aiScore: evaluation.aiScore || 0,
          totalScore: prevTotal
        });

        evaluation.normRawScore = normRawScore;
        evaluation.checkboxScore = checkboxScore;
        evaluation.totalScore = newTotalScore;

        await evaluation.save();
      }
    }
  } catch (error) {
    log.error('SCORING', 'Error normalizing judge evaluations', error);
  }
};

/**
 * Calculates raw criteria scores and brownie points for a single evaluation.
 * Does NOT normalize (that must be called separately).
 */
export const calculateRawEvaluationScores = (criteriaScores, browniePoints, aiScore = 0) => {
  let rawScoreTotal = 0;
  if (criteriaScores && criteriaScores.length > 0) {
    rawScoreTotal = criteriaScores.reduce((sum, c) => sum + ((c.score || 0) * (c.weight || 1)), 0);
  }

  let checkboxScore = 0;
  if (browniePoints && browniePoints.length > 0) {
    checkboxScore = browniePoints.reduce((sum, bp) => sum + (bp.weight || 1), 0);
  }

  return {
    rawScoreTotal,
    checkboxScore,
    aiScore
  };
};
