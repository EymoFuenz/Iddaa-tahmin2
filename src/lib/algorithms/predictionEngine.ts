/**
 * Match Prediction Engine
 * Calculates match predictions based on team form, statistics, market value, and head-to-head data
 */

import { Match, TeamFormData, FormRating, MatchPrediction, PredictionFactor, BettingOdds, BettingProbabilities } from '@/types';
import { calculateFormRating } from './formCalculator';

interface PredictionInput {
  homeTeamForm: TeamFormData;
  awayTeamForm: TeamFormData;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamMarketValue?: number;
  awayTeamMarketValue?: number;
  headToHeadMatches?: Match[];
}

/**
 * Main prediction function - orchestrates all prediction calculations
 */
export function predictMatch(input: PredictionInput): MatchPrediction {
  const homeFormRating = calculateFormRating(input.homeTeamForm, input.homeTeamId, input.homeTeamName);
  const awayFormRating = calculateFormRating(input.awayTeamForm, input.awayTeamId, input.awayTeamName);

  // Apply market value adjustment
  const marketValueAdjustment = calculateMarketValueAdjustment(
    input.homeTeamMarketValue || 0,
    input.awayTeamMarketValue || 0
  );

  // Calculate individual probabilities
  const resultProb = calculateResultProbability(homeFormRating, awayFormRating, marketValueAdjustment);
  const over05Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 0.5);
  const over15Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 1.5);
  const over25Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 2.5);
  const over35Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 3.5);
  const bttsProbability = calculateBTTSProbability(homeFormRating, awayFormRating);
  const bttsAndOver25 = bttsProbability * over25Prob;
  
  // Determine likely scoreline
  const predictedScore = predictScore(homeFormRating, awayFormRating, over25Prob);
  
  // Calculate odds
  const odds = calculateOdds(resultProb);
  const bettingOdds = calculateBettingOdds(resultProb, over05Prob, over15Prob, over25Prob, over35Prob, bttsProbability, bttsAndOver25);
  
  // Betting probabilities
  const bettingProbabilities: BettingProbabilities = {
    homeWin: Math.round(resultProb.homeWinProb * 100),
    draw: Math.round(resultProb.drawProb * 100),
    awayWin: Math.round(resultProb.awayWinProb * 100),
    over05: Math.round(over05Prob * 100),
    over15: Math.round(over15Prob * 100),
    over25: Math.round(over25Prob * 100),
    over35: Math.round(over35Prob * 100),
    btts: Math.round(bttsProbability * 100),
    bttsAndOver25: Math.round(bttsAndOver25 * 100),
    bothTeamsWin: 0, // Will be calculated
    over1Under3: Math.round((over15Prob - over35Prob) * 100),
  };

  // Determine predicted result
  const predictedResult = resultProb.homeWinProb > resultProb.awayWinProb
    ? 'Home Win'
    : resultProb.homeWinProb < resultProb.awayWinProb
    ? 'Away Win'
    : 'Draw';

  // Calculate confidence
  const maxProb = Math.max(resultProb.homeWinProb, resultProb.awayWinProb, resultProb.drawProb);
  const confidence = Math.round(maxProb * 100);

  // Generate analysis factors
  const factors = generateAnalysisFactors(homeFormRating, awayFormRating);

  // Generate analysis text
  const analysisText = generateAnalysisText(
    input.homeTeamName,
    input.awayTeamName,
    homeFormRating,
    awayFormRating,
    predictedResult,
    factors,
    input.homeTeamMarketValue,
    input.awayTeamMarketValue
  );

  return {
    match: `${input.homeTeamName} vs ${input.awayTeamName}`,
    homeTeam: input.homeTeamName,
    awayTeam: input.awayTeamName,
    predictedResult,
    confidence,
    over25Probability: Math.round(over25Prob * 100),
    btts: bttsProbability > 0.5,
    bttsProbability: Math.round(bttsProbability * 100),
    predictedScore,
    homeWinOdds: odds.home,
    drawOdds: odds.draw,
    awayWinOdds: odds.away,
    bettingOdds,
    bettingProbabilities,
    analysisText,
    factors,
  };
}

/**
 * Calculate market value adjustment factor
 * Higher market value = better team = higher win probability
 */
function calculateMarketValueAdjustment(homeValue: number, awayValue: number): number {
  if (homeValue === 0 && awayValue === 0) return 0;
  
  const totalValue = homeValue + awayValue;
  if (totalValue === 0) return 0;
  
  // Adjustment factor ranges from -0.15 to 0.15
  const homeShare = homeValue / totalValue;
  const adjustment = (homeShare - 0.5) * 0.3; // 0.5 means equal, -0.15 to 0.15 range
  
  return adjustment;
}

/**
 * Calculate win/draw/loss probabilities with market value
 */
function calculateResultProbability(
  homeFormRating: FormRating,
  awayFormRating: FormRating,
  marketValueAdjustment: number = 0
): { homeWinProb: number; drawProb: number; awayWinProb: number } {
  // Factors:
  // 1. Form index difference (0.4 weight)
  // 2. Momentum (0.3 weight)
  // 3. Home advantage (0.2 weight)
  // 4. Market value (0.1 weight)

  const formDifference = homeFormRating.formIndex - awayFormRating.formIndex;
  const momentumDifference = homeFormRating.momentum - awayFormRating.momentum;
  const homeAdvantageFactor = homeFormRating.homeAdvantage / 20; // Normalize to 0-1

  // Calculate base probabilities
  let homeWinProb = 0.5 + (formDifference / 200) + (momentumDifference / 200) + (homeAdvantageFactor * 0.15) + marketValueAdjustment;
  let awayWinProb = 0.5 - (formDifference / 200) - (momentumDifference / 200) - (homeAdvantageFactor * 0.15) - marketValueAdjustment;

  // Allow for draws
  const drawProb = calculateDrawProbability(homeFormRating, awayFormRating);

  // Normalize
  const total = homeWinProb + awayWinProb + drawProb;

  return {
    homeWinProb: Math.max(0, Math.min(1, homeWinProb / total)),
    drawProb: Math.max(0, Math.min(1, drawProb / total)),
    awayWinProb: Math.max(0, Math.min(1, awayWinProb / total)),
  };
}

/**
 * Calculate draw probability
 */
function calculateDrawProbability(homeForm: FormRating, awayForm: FormRating): number {
  // Teams that are very similar in form are more likely to draw
  const formDifference = Math.abs(homeForm.formIndex - awayForm.formIndex);
  const defensiveDifference = Math.abs(homeForm.defenseRating - awayForm.defenseRating);

  // If form is similar and both teams are defensive, higher draw chance
  let drawProb = 0.25; // Base draw probability
  
  if (formDifference < 10) drawProb += 0.05;
  if (defensiveDifference > 10) drawProb -= 0.05;

  return Math.max(0.1, Math.min(0.4, drawProb));
}

/**
 * Calculate Over X goals probability (use Poisson distribution)
 */
function calculateOverXProbability(homeTeamForm: TeamFormData, awayTeamForm: TeamFormData, threshold: number): number {
  if (!homeTeamForm.lastMatches || !awayTeamForm.lastMatches) return 0.5;

  const homeAvgGoals = homeTeamForm.goalsScored / homeTeamForm.lastMatches.length;
  const awayAvgGoals = awayTeamForm.goalsScored / awayTeamForm.lastMatches.length;

  // Expected total goals
  const expectedTotalGoals = homeAvgGoals + awayAvgGoals;
  const lambda = expectedTotalGoals;

  // Poisson: P(G > threshold) = 1 - P(G <= threshold)
  let cumulativeProbability = 0;
  for (let i = 0; i <= Math.floor(threshold); i++) {
    cumulativeProbability += (Math.pow(lambda, i) / factorial(i)) * Math.exp(-lambda);
  }

  return Math.max(0, Math.min(1, 1 - cumulativeProbability));
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Calculate Both Teams To Score probability
 */
function calculateBTTSProbability(
  homeForm: FormRating,
  awayForm: FormRating
): number {
  const homeAttack = homeForm.attackStrength / 100;
  const awayAttack = awayForm.attackStrength / 100;
  const homeDefense = (100 - homeForm.defenseRating) / 100;
  const awayDefense = (100 - awayForm.defenseRating) / 100;

  // Probability both teams score is correlated with:
  // - Both teams having good attack
  // - Both teams having weak defense
  const bttsProb = (homeAttack * awayDefense) + (awayAttack * homeDefense);

  return Math.max(0.2, Math.min(0.8, bttsProb));
}

/**
 * Predict the most likely scoreline
 */
function predictScore(homeForm: FormRating, awayForm: FormRating, over25Prob: number): string {
  const homeAttack = homeForm.attackStrength / 100;
  const awayAttack = awayForm.attackStrength / 100;
  const homeDefense = (100 - homeForm.defenseRating) / 100;
  const awayDefense = (100 - awayForm.defenseRating) / 100;

  // Use Poisson distribution to estimate most likely goals
  const homeExpectedGoals = homeAttack * 2.5 - awayDefense * 0.8;
  const awayExpectedGoals = awayAttack * 2.5 - homeDefense * 0.8;

  // Round to nearest integer or most likely value
  let homeGoals = Math.round(Math.max(0, homeExpectedGoals));
  let awayGoals = Math.round(Math.max(0, awayExpectedGoals));

  // Adjust for over/under
  if (over25Prob < 0.4 && homeGoals + awayGoals > 2) {
    // Under likely, reduce one goal
    if (homeGoals > 0 && awayGoals > 0) {
      homeGoals = Math.max(0, homeGoals - 1);
    } else if (homeGoals > 0) {
      homeGoals = Math.max(0, homeGoals - 1);
    }
  } else if (over25Prob > 0.65 && homeGoals + awayGoals < 3) {
    // Over likely, add one goal
    homeGoals += 1;
  }

  return `${homeGoals}-${awayGoals}`;
}

/**
 * Calculate betting odds from probabilities
 * Simplified: uses 1/probability with margin
 */
function calculateOdds(resultProb: { homeWinProb: number; drawProb: number; awayWinProb: number }) {
  const margin = 1.05; // 5% margin
  
  return {
    home: margin / resultProb.homeWinProb,
    draw: margin / resultProb.drawProb,
    away: margin / resultProb.awayWinProb,
  };
}

/**
 * Calculate comprehensive betting odds for various markets
 */
function calculateBettingOdds(
  resultProb: { homeWinProb: number; drawProb: number; awayWinProb: number },
  over05Prob: number,
  over15Prob: number,
  over25Prob: number,
  over35Prob: number,
  bttsProbability: number,
  bttsAndOver25: number
): BettingOdds {
  const margin = 1.08; // 8% margin for various markets
  
  return {
    homeWin: margin / resultProb.homeWinProb,
    draw: margin / resultProb.drawProb,
    awayWin: margin / resultProb.awayWinProb,
    over05: margin / (over05Prob || 0.9),
    over15: margin / (over15Prob || 0.8),
    over25: margin / (over25Prob || 0.5),
    over35: margin / (over35Prob || 0.2),
    btts: margin / (bttsProbability || 0.5),
    bttsAndOver25: margin / (bttsAndOver25 || 0.3),
  };
}

/**
 * Generate factors explaining the prediction
 */
function generateAnalysisFactors(
  homeForm: FormRating,
  awayForm: FormRating
): PredictionFactor[] {
  const factors: PredictionFactor[] = [];

  // Form factor
  const formDiff = homeForm.formIndex - awayForm.formIndex;
  if (Math.abs(formDiff) > 10) {
    const leader = formDiff > 0 ? homeForm.teamName : awayForm.teamName;
    factors.push({
      name: 'Form',
      impact: Math.abs(formDiff) / 100,
      description: `${leader} in significantly better form (${Math.abs(formDiff).toFixed(1)} point difference)`,
    });
  }

  // Attack vs Defense
  const homeAttackVsAwayDefense = homeForm.attackStrength - awayForm.defenseRating;
  if (homeAttackVsAwayDefense > 15) {
    factors.push({
      name: 'Attack-Defense Mismatch',
      impact: 0.15,
      description: `${homeForm.teamName}'s attack is significantly stronger than ${awayForm.teamName}'s defense`,
    });
  }

  // Momentum
  if (homeForm.momentum > 20) {
    factors.push({
      name: 'Momentum',
      impact: 0.1,
      description: `${homeForm.teamName} showing positive momentum (winning streak)`,
    });
  }

  if (awayForm.momentum < -20) {
    factors.push({
      name: 'Form Decline',
      impact: 0.1,
      description: `${awayForm.teamName} experiencing declining form`,
    });
  }

  // Home advantage
  if (homeForm.homeAdvantage > 12) {
    factors.push({
      name: 'Home Advantage',
      impact: 0.08,
      description: `${homeForm.teamName} has strong home record`,
    });
  }

  // Expected goals
  const homeGoals = homeForm.attackStrength * 2.5 / 100;
  const awayGoals = awayForm.attackStrength * 2.5 / 100;
  const totalExpected = homeGoals + awayGoals;

  if (totalExpected > 2.5) {
    factors.push({
      name: 'High Scoring Expected',
      impact: 0.12,
      description: `Expected total goals: ${totalExpected.toFixed(1)} (Over 2.5 favored)`,
    });
  }

  return factors;
}

/**
 * Generate readable analysis text
 */
function generateAnalysisText(
  homeName: string,
  awayName: string,
  homeForm: FormRating,
  awayForm: FormRating,
  result: string,
  factors: PredictionFactor[],
  homeMarketValue?: number,
  awayMarketValue?: number
): string {
  let text = `${homeName} are predicted to ${result === 'Home Win' ? 'win' : result === 'Draw' ? 'draw with' : 'lose to'} ${awayName}. `;

  if (homeForm.formIndex > awayForm.formIndex) {
    text += `${homeName} are in superior form with a form index of ${homeForm.formIndex.toFixed(0)} vs ${awayForm.formIndex.toFixed(0)}. `;
  } else if (awayForm.formIndex > homeForm.formIndex) {
    text += `${awayName} are in better form despite ${result === 'Home Win' ? 'home advantage' : 'away disadvantage'}. `;
  }

  // Market value analysis
  if (homeMarketValue && awayMarketValue) {
    const valueDiff = homeMarketValue - awayMarketValue;
    if (Math.abs(valueDiff) > 50) {
      const richer = valueDiff > 0 ? homeName : awayName;
      text += `${richer} have significantly higher market value (€${Math.max(homeMarketValue, awayMarketValue).toFixed(0)}M vs €${Math.min(homeMarketValue, awayMarketValue).toFixed(0)}M). `;
    }
  }

  if (homeForm.momentum > 10) {
    text += `${homeName} are on a positive trajectory with recent wins. `;
  } else if (awayForm.momentum > 10) {
    text += `${awayName} are on a positive trajectory with recent wins. `;
  }

  if (factors.length > 0) {
    text += `Key factors: ${factors.slice(0, 2).map(f => f.description.toLowerCase()).join('; ')}.`;
  }

  return text;
}
