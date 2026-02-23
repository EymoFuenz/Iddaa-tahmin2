/**
 * Form Calculation Engine
 * Weighted scoring algorithm for team performance analysis
 * 
 * Scoring System:
 * - Win = 3 points
 * - Draw = 1 point  
 * - Loss = 0 points
 * - +0.5 per goal scored (max 3 goals for calculation)
 * - -0.5 per goal conceded (max 3 goals)
 * - +0.2 per 3 shots on target
 * - Home advantage: +0.1 to 0.15 bonus
 */

import { Match, TeamFormData, FormRating } from '@/types';

interface FormMetrics {
  points: number;
  goalScoring: number;
  goalConceding: number;
  shotsOnTarget: number;
  homeAdvantage: number;
  recentForm: number;
  consistency: number;
}

/**
 * Calculate weighted form index (0-100)
 * Takes into account multiple factors with different weights
 */
export function calculateFormIndex(formData: TeamFormData): number {
  if (!formData.lastMatches || formData.lastMatches.length === 0) {
    return 0;
  }

  const metrics = calculateFormMetrics(formData);
  
  // Weighted scoring (weights sum to 1.0)
  const weights = {
    points: 0.35,        // Most important: wins/draws/losses
    goalScoring: 0.20,   // Attack quality
    goalConceding: 0.15, // Defense quality
    shotsOnTarget: 0.10, // Shot accuracy
    homeAdvantage: 0.10, // Home games performance
    recentForm: 0.05,    // Momentum
    consistency: 0.05,   // Stability
  };

  const weightedScore =
    (metrics.points * weights.points) +
    (metrics.goalScoring * weights.goalScoring) +
    (metrics.goalConceding * weights.goalConceding) +
    (metrics.shotsOnTarget * weights.shotsOnTarget) +
    (metrics.homeAdvantage * weights.homeAdvantage) +
    (metrics.recentForm * weights.recentForm) +
    (metrics.consistency * weights.consistency);

  // Normalize to 0-100
  return Math.min(100, Math.max(0, weightedScore * 100));
}

/**
 * Calculate individual performance metrics
 */
function calculateFormMetrics(formData: TeamFormData): FormMetrics {
  const matches = formData.lastMatches || [];
  
  if (matches.length === 0) {
    return {
      points: 0,
      goalScoring: 0,
      goalConceding: 0,
      shotsOnTarget: 0,
      homeAdvantage: 0,
      recentForm: 0,
      consistency: 0,
    };
  }

  // Points calculation (3 for win, 1 for draw, 0 for loss)
  const pointsPerMatch = calculatePointsPerMatch(formData.wins, formData.draws, formData.losses, matches.length);
  const points = Math.min(1.0, pointsPerMatch / 3);

  // Goal scoring (0.5 per goal, max 3 goals per match)
  const avgGoalsFor = formData.goalsScored / matches.length;
  const goalScoring = Math.min(1.0, (avgGoalsFor * 0.5) / 1.5);

  // Goal conceding (negative impact, reversed)
  const avgGoalsAgainst = formData.goalsConceded / matches.length;
  const goalConceding = Math.max(0, 1.0 - (avgGoalsAgainst * 0.5) / 1.5);

  // Shots on target (0.2 per 3 shots)
  const avgShotsOnTarget = formData.shotsOnTarget / matches.length;
  const shotsOnTarget = Math.min(1.0, (avgShotsOnTarget * 0.2) / 3);

  // Home advantage (from home matches)
  const homeMatches = formData.homeForm || [];
  const homeAdvantage = homeMatches.length > 0 
    ? calculatePointsPerMatch(
        homeMatches.filter(m => getHomeGoals(m) > getAwayGoals(m)).length,
        homeMatches.filter(m => getHomeGoals(m) === getAwayGoals(m)).length,
        homeMatches.filter(m => getHomeGoals(m) < getAwayGoals(m)).length,
        homeMatches.length
      ) / 3
    : points;

  // Recent form (weight last 5 games more heavily)
  const recentMatches = matches.slice(0, Math.min(5, matches.length));
  const recentPoints = calculatePointsPerMatch(
    recentMatches.filter(m => getMatchResult(m, formData.teamId) === 'win').length,
    recentMatches.filter(m => getMatchResult(m, formData.teamId) === 'draw').length,
    recentMatches.filter(m => getMatchResult(m, formData.teamId) === 'loss').length,
    recentMatches.length
  );
  const recentForm = Math.min(1.0, recentPoints / 3);

  // Consistency (standard deviation of points per match)
  const matchPoints = matches.map(m => {
    const result = getMatchResult(m, formData.teamId);
    return result === 'win' ? 3 : result === 'draw' ? 1 : 0;
  }) as number[];
  const avgPoints = matchPoints.reduce((a, b) => (a as number) + (b as number), 0) / matches.length;
  const variance = matchPoints.reduce((sum, p) => (sum as number) + Math.pow((p as number) - avgPoints, 2), 0) / matches.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 1.0 - (stdDev / 1.5));

  return {
    points,
    goalScoring,
    goalConceding,
    shotsOnTarget,
    homeAdvantage,
    recentForm,
    consistency,
  };
}

/**
 * Calculate points per match average
 */
function calculatePointsPerMatch(wins: number, draws: number, losses: number, totalMatches: number): number {
  if (totalMatches === 0) return 0;
  const totalPoints = (wins * 3) + (draws * 1) + (losses * 0);
  return totalPoints / totalMatches;
}

/**
 * Calculate attack strength rating (0-100)
 */
export function calculateAttackStrength(formData: TeamFormData): number {
  if (!formData.lastMatches || formData.lastMatches.length === 0) return 0;

  const avgGoals = formData.goalsScored / formData.lastMatches.length;
  const avgShots = formData.shotsOnTarget / formData.lastMatches.length;

  // Goals contribute 60%, shots on target 40%
  const score = (avgGoals * 0.6) + (avgShots * 0.4);
  return Math.min(100, score * 20);
}

/**
 * Calculate defense rating (0-100)
 */
export function calculateDefenseRating(formData: TeamFormData): number {
  if (!formData.lastMatches || formData.lastMatches.length === 0) return 0;

  const avgGoalsConceded = formData.goalsConceded / formData.lastMatches.length;
  
  // Lower goals conceded = better defense
  // 0 goals = 100, 3+ goals = 0
  return Math.max(0, Math.min(100, (1 - (avgGoalsConceded / 3)) * 100));
}

/**
 * Calculate momentum indicator (-100 to 100)
 * Positive = improving form, Negative = declining form
 */
export function calculateMomentum(formData: TeamFormData): number {
  if (!formData.lastMatches || formData.lastMatches.length < 5) return 0;

  const recentMatches = formData.lastMatches.slice(0, 5);
  const olderMatches = formData.lastMatches.slice(5, 10);

  if (olderMatches.length === 0) return 0;

  const recentPoints = calculatePointsPerMatch(
    recentMatches.filter(m => getMatchResult(m, formData.teamId) === 'win').length,
    recentMatches.filter(m => getMatchResult(m, formData.teamId) === 'draw').length,
    recentMatches.filter(m => getMatchResult(m, formData.teamId) === 'loss').length,
    recentMatches.length
  );

  const olderPoints = calculatePointsPerMatch(
    olderMatches.filter(m => getMatchResult(m, formData.teamId) === 'win').length,
    olderMatches.filter(m => getMatchResult(m, formData.teamId) === 'draw').length,
    olderMatches.filter(m => getMatchResult(m, formData.teamId) === 'loss').length,
    olderMatches.length
  );

  const difference = recentPoints - olderPoints;
  return Math.max(-100, Math.min(100, difference * 50));
}

/**
 * Calculate home advantage bonus (0-20)
 */
export function calculateHomeAdvantage(formData: TeamFormData): number {
  const homeMatches = formData.homeForm || [];
  
  if (homeMatches.length === 0) return 10;

  const homeWins = homeMatches.filter(m => getHomeGoals(m) > getAwayGoals(m)).length;
  const homeDraws = homeMatches.filter(m => getHomeGoals(m) === getAwayGoals(m)).length;
  const homePoints = calculatePointsPerMatch(homeWins, homeDraws, homeMatches.length - homeWins - homeDraws, homeMatches.length);

  // Range from 0 to 20
  return (homePoints / 3) * 20;
}

/**
 * Generate form string (e.g., "WWDLW")
 */
export function generateFormString(formData: TeamFormData, maxGames: number = 5): string {
  const matches = formData.lastMatches || [];
  const recentMatches = matches.slice(0, Math.min(maxGames, matches.length));
  
  return recentMatches
    .map(m => {
      const result = getMatchResult(m, formData.teamId);
      return result.charAt(0).toUpperCase();
    })
    .join('');
}

/**
 * Helper function to determine match result
 */
function getMatchResult(match: Match, teamId: number): 'win' | 'draw' | 'loss' {
  const isHome = match.homeTeam.id === teamId;
  const homeGoals = match.homeGoals;
  const awayGoals = match.awayGoals;

  if (homeGoals === awayGoals) return 'draw';
  
  if (isHome) {
    return homeGoals > awayGoals ? 'win' : 'loss';
  } else {
    return awayGoals > homeGoals ? 'win' : 'loss';
  }
}

/**
 * Get home team goals
 */
function getHomeGoals(match: Match): number {
  return match.homeGoals;
}

/**
 * Get away team goals
 */
function getAwayGoals(match: Match): number {
  return match.awayGoals;
}

/**
 * Calculate comprehensive form rating
 */
export function calculateFormRating(formData: TeamFormData, teamId: number, teamName: string): FormRating {
  const formIndex = calculateFormIndex(formData);
  const attackStrength = calculateAttackStrength(formData);
  const defenseRating = calculateDefenseRating(formData);
  const momentum = calculateMomentum(formData);
  const homeAdvantage = calculateHomeAdvantage(formData);
  const winProbability = (formIndex * 0.5) + (momentum > 0 ? momentum * 0.25 : momentum * 0.15) + 10;
  const form = generateFormString(formData);

  return {
    teamId,
    teamName,
    formIndex,
    attackStrength,
    defenseRating,
    momentum,
    homeAdvantage,
    winProbability: Math.min(100, Math.max(0, winProbability)),
    form,
  };
}
