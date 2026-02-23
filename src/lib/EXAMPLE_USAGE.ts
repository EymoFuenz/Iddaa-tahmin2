/**
 * Example: Form Calculation & Prediction Engine
 * 
 * This file demonstrates how to use the form calculation
 * and prediction engines with real data
 */

import { calculateFormRating } from '@/lib/algorithms/formCalculator';
import { predictMatch } from '@/lib/algorithms/predictionEngine';
import { TeamFormData, Match } from '@/types';

// ============================================================
// EXAMPLE 1: Real Match Data
// ============================================================

/**
 * Mock match data for Fenerbahçe vs Galatasaray
 * In real app, this would come from Football API
 */
const fenerbahceMatches: Match[] = [
  {
    id: 1001,
    homeTeam: { id: 52, name: 'Fenerbahçe', logo: '', code: 'FB', founded: 1907, country: 'Turkey' },
    awayTeam: { id: 101, name: 'Gaziantep FK', logo: '', code: 'GZT', founded: 1969, country: 'Turkey' },
    date: '2024-02-20T19:00:00Z',
    status: 'finished',
    homeGoals: 3,
    awayGoals: 1,
    league: 'Süper Lig',
    season: 2024,
    round: 23,
    venue: 'Ülker Stadı'
  },
  {
    id: 1002,
    homeTeam: { id: 167, name: 'Besiktas', logo: '', code: 'BJK', founded: 1903, country: 'Turkey' },
    awayTeam: { id: 52, name: 'Fenerbahçe', logo: '', code: 'FB', founded: 1907, country: 'Turkey' },
    date: '2024-02-17T19:00:00Z',
    status: 'finished',
    homeGoals: 1,
    awayGoals: 2,
    league: 'Süper Lig',
    season: 2024,
    round: 22,
    venue: 'Vodafone Park'
  },
  {
    id: 1003,
    homeTeam: { id: 52, name: 'Fenerbahçe', logo: '', code: 'FB', founded: 1907, country: 'Turkey' },
    awayTeam: { id: 89, name: 'Konyaspor', logo: '', code: 'KNY', founded: 1922, country: 'Turkey' },
    date: '2024-02-13T19:00:00Z',
    status: 'finished',
    homeGoals: 2,
    awayGoals: 0,
    league: 'Süper Lig',
    season: 2024,
    round: 21,
    venue: 'Ülker Stadı'
  },
  {
    id: 1004,
    homeTeam: { id: 52, name: 'Fenerbahçe', logo: '', code: 'FB', founded: 1907, country: 'Turkey' },
    awayTeam: { id: 56, name: 'Bursa', logo: '', code: 'BUR', founded: 1963, country: 'Turkey' },
    date: '2024-02-10T19:00:00Z',
    status: 'finished',
    homeGoals: 4,
    awayGoals: 1,
    league: 'Süper Lig',
    season: 2024,
    round: 20,
    venue: 'Ülker Stadı'
  },
  {
    id: 1005,
    homeTeam: { id: 89, name: 'Konyaspor', logo: '', code: 'KNY', founded: 1922, country: 'Turkey' },
    awayTeam: { id: 52, name: 'Fenerbahçe', logo: '', code: 'FB', founded: 1907, country: 'Turkey' },
    date: '2024-02-03T19:00:00Z',
    status: 'finished',
    homeGoals: 1,
    awayGoals: 2,
    league: 'Süper Lig',
    season: 2024,
    round: 19,
    venue: 'Konya Stadı'
  },
];

const galatasarayMatches: Match[] = [
  {
    id: 2001,
    homeTeam: { id: 83, name: 'Galatasaray', logo: '', code: 'GS', founded: 1905, country: 'Turkey' },
    awayTeam: { id: 101, name: 'Gaziantep FK', logo: '', code: 'GZT', founded: 1969, country: 'Turkey' },
    date: '2024-02-22T19:00:00Z',
    status: 'finished',
    homeGoals: 2,
    awayGoals: 2,
    league: 'Süper Lig',
    season: 2024,
    round: 24,
    venue: 'Ali Sami Yen'
  },
  {
    id: 2002,
    homeTeam: { id: 56, name: 'Bursa', logo: '', code: 'BUR', founded: 1963, country: 'Turkey' },
    awayTeam: { id: 83, name: 'Galatasaray', logo: '', code: 'GS', founded: 1905, country: 'Turkey' },
    date: '2024-02-18T19:00:00Z',
    status: 'finished',
    homeGoals: 0,
    awayGoals: 3,
    league: 'Süper Lig',
    season: 2024,
    round: 23,
    venue: 'Bursa Stadı'
  },
  {
    id: 2003,
    homeTeam: { id: 83, name: 'Galatasaray', logo: '', code: 'GS', founded: 1905, country: 'Turkey' },
    awayTeam: { id: 52, name: 'Fenerbahçe', logo: '', code: 'FB', founded: 1907, country: 'Turkey' },
    date: '2024-02-14T19:00:00Z',
    status: 'finished',
    homeGoals: 1,
    awayGoals: 1,
    league: 'Süper Lig',
    season: 2024,
    round: 21,
    venue: 'Ali Sami Yen'
  },
  {
    id: 2004,
    homeTeam: { id: 89, name: 'Konyaspor', logo: '', code: 'KNY', founded: 1922, country: 'Turkey' },
    awayTeam: { id: 83, name: 'Galatasaray', logo: '', code: 'GS', founded: 1905, country: 'Turkey' },
    date: '2024-02-11T19:00:00Z',
    status: 'finished',
    homeGoals: 0,
    awayGoals: 2,
    league: 'Süper Lig',
    season: 2024,
    round: 20,
    venue: 'Konya Stadı'
  },
  {
    id: 2005,
    homeTeam: { id: 83, name: 'Galatasaray', logo: '', code: 'GS', founded: 1905, country: 'Turkey' },
    awayTeam: { id: 167, name: 'Besiktas', logo: '', code: 'BJK', founded: 1903, country: 'Turkey' },
    date: '2024-02-04T19:00:00Z',
    status: 'finished',
    homeGoals: 3,
    awayGoals: 2,
    league: 'Süper Lig',
    season: 2024,
    round: 19,
    venue: 'Ali Sami Yen'
  },
];

// ============================================================
// EXAMPLE 2: Process Fenerbahçe's Form Data
// ============================================================

const fenerbahceFormData: TeamFormData = {
  teamId: 52,
  lastMatches: fenerbahceMatches,
  homeForm: fenerbahceMatches.filter(m => m.homeTeam.id === 52),
  awayForm: fenerbahceMatches.filter(m => m.awayTeam.id === 52),
  wins: 4,        // 3-1, 2-0, 4-1, 2-1 wins = 4
  draws: 0,
  losses: 1,      // 1-2 loss = 1
  goalsScored: 14,  // 3+2+4+2+2+1 = 14
  goalsConceded: 4, // 1+1+0+1+1 = 4
  shotsOnTarget: 30,
  possession: 55,
  corners: 25
};

const galatasarayFormData: TeamFormData = {
  teamId: 83,
  lastMatches: galatasarayMatches,
  homeForm: galatasarayMatches.filter(m => m.homeTeam.id === 83),
  awayForm: galatasarayMatches.filter(m => m.awayTeam.id === 83),
  wins: 3,        // 3-2, 3-0, 2-0 wins = 3
  draws: 1,       // 2-2 draw = 1
  losses: 1,      // 0-3 loss = 1
  goalsScored: 12, // 2+3+1+2+3+1 = 12
  goalsConceded: 6, // 2+0+1+0+2 = 6
  shotsOnTarget: 28,
  possession: 52,
  corners: 22
};

// ============================================================
// EXAMPLE 3: Calculate Form Ratings
// ============================================================

function exampleFormCalculation() {
  console.log('\n=== FORM CALCULATION EXAMPLE ===\n');

  const fenerbahceForm = calculateFormRating(
    fenerbahceFormData,
    52,
    'Fenerbahçe'
  );

  const galatasarayForm = calculateFormRating(
    galatasarayFormData,
    83,
    'Galatasaray'
  );

  console.log('Fenerbahçe Form Rating:');
  console.log({
    formIndex: fenerbahceForm.formIndex.toFixed(2),
    attackStrength: fenerbahceForm.attackStrength.toFixed(2),
    defenseRating: fenerbahceForm.defenseRating.toFixed(2),
    momentum: fenerbahceForm.momentum.toFixed(2),
    homeAdvantage: fenerbahceForm.homeAdvantage.toFixed(2),
    form: fenerbahceForm.form
  });

  console.log('\nGalatasaray Form Rating:');
  console.log({
    formIndex: galatasarayForm.formIndex.toFixed(2),
    attackStrength: galatasarayForm.attackStrength.toFixed(2),
    defenseRating: galatasarayForm.defenseRating.toFixed(2),
    momentum: galatasarayForm.momentum.toFixed(2),
    homeAdvantage: galatasarayForm.homeAdvantage.toFixed(2),
    form: galatasarayForm.form
  });

  return { fenerbahceForm, galatasarayForm };
}

// ============================================================
// EXAMPLE 4: Predict Match
// ============================================================

function exampleMatchPrediction() {
  console.log('\n=== MATCH PREDICTION EXAMPLE ===\n');

  const prediction = predictMatch({
    homeTeamForm: fenerbahceFormData,
    awayTeamForm: galatasarayFormData,
    homeTeamId: 52,
    awayTeamId: 83,
    homeTeamName: 'Fenerbahçe',
    awayTeamName: 'Galatasaray'
  });

  console.log('Match:', prediction.match);
  console.log('Predicted Result:', prediction.predictedResult);
  console.log('Confidence:', prediction.confidence + '%');
  console.log('Predicted Score:', prediction.predictedScore);
  console.log('Over 2.5 Probability:', prediction.over25Probability + '%');
  console.log('Both Teams to Score:', prediction.btts ? 'YES' : 'NO');
  console.log('BTTS Probability:', prediction.bttsProbability + '%');
  console.log('\nOdds:');
  console.log('  Home Win:', prediction.homeWinOdds.toFixed(2));
  console.log('  Draw:', prediction.drawOdds.toFixed(2));
  console.log('  Away Win:', prediction.awayWinOdds.toFixed(2));
  console.log('\nAnalysis:', prediction.analysisText);
  console.log('\nFactors:');
  prediction.factors.forEach(f => {
    console.log(`  - ${f.name}: ${f.description}`);
  });

  return prediction;
}

// ============================================================
// EXAMPLE 5: Complete Analysis
// ============================================================

function completeAnalysis() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  FENERBAHÇE vs GALATASARAY - COMPLETE ANALYSIS        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Calculate forms
  const { fenerbahceForm, galatasarayForm } = exampleFormCalculation();

  // Get prediction
  const prediction = exampleMatchPrediction();

  // Analysis summary
  console.log('\n=== ANALYSIS SUMMARY ===\n');

  const formDiff = fenerbahceForm.formIndex - galatasarayForm.formIndex;
  const attackDiff = fenerbahceForm.attackStrength - galatasarayForm.attackStrength;
  const defenseDiff = fenerbahceForm.defenseRating - galatasarayForm.defenseRating;

  console.log('Form Comparison:');
  console.log(`  Fenerbahçe: ${fenerbahceForm.formIndex.toFixed(0)}`);
  console.log(`  Galatasaray: ${galatasarayForm.formIndex.toFixed(0)}`);
  console.log(`  Difference: ${formDiff > 0 ? '+' : ''}${formDiff.toFixed(1)} (Fenerbahçe better)`);

  console.log('\nAttack Comparison:');
  console.log(`  Fenerbahçe: ${fenerbahceForm.attackStrength.toFixed(0)}`);
  console.log(`  Galatasaray: ${galatasarayForm.attackStrength.toFixed(0)}`);
  console.log(`  Difference: ${attackDiff > 0 ? '+' : ''}${attackDiff.toFixed(1)}`);

  console.log('\nDefense Comparison:');
  console.log(`  Fenerbahçe: ${fenerbahceForm.defenseRating.toFixed(0)}`);
  console.log(`  Galatasaray: ${galatasarayForm.defenseRating.toFixed(0)}`);
  console.log(`  Difference: ${defenseDiff > 0 ? '+' : ''}${defenseDiff.toFixed(1)}`);

  console.log('\nKey Insight:');
  if (prediction.predictedResult === 'Home Win') {
    console.log('  ✓ Fenerbahçe is STRONG HOME team with better form and attack.');
  } else if (prediction.predictedResult === 'Away Win') {
    console.log('  ✓ Galatasaray expected to overpower despite away status.');
  } else {
    console.log('  ≈ Teams are well-matched, draw is likely outcome.');
  }

  console.log('\nRecommendation:');
  if (prediction.confidence >= 70) {
    console.log(`  HIGH CONFIDENCE: Bet on ${prediction.predictedResult}`);
  } else if (prediction.confidence >= 55) {
    console.log(`  MODERATE CONFIDENCE: Consider betting on ${prediction.predictedResult}`);
  } else {
    console.log('  LOW CONFIDENCE: Too uncertain for confident bet');
  }
}

// ============================================================
// Export for use in other modules
// ============================================================

export {
  fenerbahceMatches,
  galatasarayMatches,
  fenerbahceFormData,
  galatasarayFormData,
  exampleFormCalculation,
  exampleMatchPrediction,
  completeAnalysis
};

// ============================================================
// Run example (uncomment to test)
// ============================================================

// if (import.meta.hot) {
//   completeAnalysis();
// }
