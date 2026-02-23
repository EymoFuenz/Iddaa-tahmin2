/**
 * Match Prediction Engine
 * Ev sahibi evde / deplasman deplasmanda skorlarına göre skor ve oran tahmini
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

/** Evde: atılan / yenilen gol ortalaması. Deplasmanda: atılan / yenilen gol ortalaması. (homeForm/awayForm zaten takıma göre filtrelenmiş) */
function getVenueStats(form: TeamFormData, _teamId: number): { atHome: { avgScored: number; avgConceded: number; n: number }; away: { avgScored: number; avgConceded: number; n: number } } {
  const homeMatches = form.homeForm || [];
  const awayMatches = form.awayForm || [];
  const atHome = { avgScored: 0, avgConceded: 0, n: homeMatches.length };
  const away = { avgScored: 0, avgConceded: 0, n: awayMatches.length };
  homeMatches.forEach(m => {
    atHome.avgScored += m.homeGoals;
    atHome.avgConceded += m.awayGoals;
  });
  awayMatches.forEach(m => {
    away.avgScored += m.awayGoals;
    away.avgConceded += m.homeGoals;
  });
  if (atHome.n > 0) {
    atHome.avgScored /= atHome.n;
    atHome.avgConceded /= atHome.n;
  }
  if (away.n > 0) {
    away.avgScored /= away.n;
    away.avgConceded /= away.n;
  }
  return { atHome, away };
}

/** İki takım arasındaki maçları döndürür (ev sahibi = homeId, deplasman = awayId veya tersi). */
function getHeadToHeadMatches(allMatches: Match[], homeId: number, awayId: number): Match[] {
  const h = Number(homeId);
  const a = Number(awayId);
  return allMatches.filter(m => {
    const mHome = Number((m as any).homeTeam?.id ?? m.homeTeam?.id);
    const mAway = Number((m as any).awayTeam?.id ?? m.awayTeam?.id);
    return (mHome === h && mAway === a) || (mHome === a && mAway === h);
  });
}

/** H2H maçlarından ev/deplasman beklenen gol (bu karşılaşma için). Ev sahibi attığı ort, deplasman attığı ort. */
function headToHeadExpectedGoals(h2h: Match[], homeId: number, _awayId: number): { homeExpected: number; awayExpected: number; n: number } {
  if (!h2h.length) return { homeExpected: 0, awayExpected: 0, n: 0 };
  let homeSum = 0, awaySum = 0;
  const h = Number(homeId);
  h2h.forEach(m => {
    const mHome = Number((m as any).homeTeam?.id ?? m.homeTeam?.id);
    const isHomeAtHome = mHome === h;
    homeSum += isHomeAtHome ? m.homeGoals : m.awayGoals;
    awaySum += isHomeAtHome ? m.awayGoals : m.homeGoals;
  });
  const n = h2h.length;
  return { homeExpected: homeSum / n, awayExpected: awaySum / n, n };
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

  // Ev sahibi evde / deplasman deplasmanda istatistikleri
  const homeVenue = getVenueStats(input.homeTeamForm, input.homeTeamId);
  const awayVenue = getVenueStats(input.awayTeamForm, input.awayTeamId);

  // Sezon içi karşılıklı maçlar (head-to-head) – 2024 vb. aynı sezonda skorlar
  const h2hMatches = input.headToHeadMatches?.length
    ? getHeadToHeadMatches(input.headToHeadMatches, input.homeTeamId, input.awayTeamId)
    : [];
  const h2hGoals = headToHeadExpectedGoals(h2hMatches, input.homeTeamId, input.awayTeamId);

  // 1X2 olasılıkları: ev/deplasman verisi + form + H2H
  const resultProb = calculateResultProbability(
    homeFormRating,
    awayFormRating,
    marketValueAdjustment,
    homeVenue,
    awayVenue,
    h2hGoals
  );
  const over05Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 0.5, homeVenue, awayVenue);
  const over15Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 1.5, homeVenue, awayVenue);
  const over25Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 2.5, homeVenue, awayVenue);
  const over35Prob = calculateOverXProbability(input.homeTeamForm, input.awayTeamForm, 3.5, homeVenue, awayVenue);
  const bttsProbability = calculateBTTSProbability(homeFormRating, awayFormRating);
  const bttsAndOver25 = bttsProbability * over25Prob;

  // Skor tahmini: ev/deplasman ortalamaları + isteğe H2H blend + Poisson
  const predictedScore = predictScoreFromVenue(
    homeVenue,
    awayVenue,
    input.homeTeamForm,
    input.awayTeamForm,
    input.homeTeamId,
    input.awayTeamId,
    homeFormRating,
    awayFormRating,
    over25Prob,
    resultProb,
    h2hGoals
  );
  
  // Sonuç skordan türet: 0-0 veya eşit skor = Beraberlik, ev > deplasman = Ev, aksi = Deplasman
  const [homeGoalsStr, awayGoalsStr] = predictedScore.split('-');
  const homeG = parseInt(homeGoalsStr, 10) || 0;
  const awayG = parseInt(awayGoalsStr, 10) || 0;
  const predictedResult: 'Home Win' | 'Draw' | 'Away Win' =
    homeG > awayG ? 'Home Win' : homeG < awayG ? 'Away Win' : 'Draw';

  // Güven: seçilen sonuca ait olasılık (tutarlı olsun)
  const resultProbForOutcome =
    predictedResult === 'Home Win' ? resultProb.homeWinProb
    : predictedResult === 'Away Win' ? resultProb.awayWinProb
    : resultProb.drawProb;
  const confidence = Math.max(0, Math.min(100, Math.round((Number.isFinite(resultProbForOutcome) ? resultProbForOutcome : 1/3) * 100)));
  
  // Calculate odds
  const odds = calculateOdds(resultProb);
  const bettingOdds = calculateBettingOdds(resultProb, over05Prob, over15Prob, over25Prob, over35Prob, bttsProbability, bttsAndOver25);
  
  const p = (x: number) => Math.round((Number.isFinite(x) ? x : 0.5) * 100);
  const over05 = p(over05Prob);
  const over15 = p(over15Prob);
  const over25 = p(over25Prob);
  const over35 = p(over35Prob);
  const bttsVal = p(bttsProbability);
  const bttsOver25 = Math.max(0, Math.min(100, p(bttsAndOver25)));
  const over1Under3 = Math.max(0, Math.min(100, p(over15Prob - over35Prob)));

  const bettingProbabilities: BettingProbabilities = {
    homeWin: Math.round((Number.isFinite(resultProb.homeWinProb) ? resultProb.homeWinProb : 1/3) * 100),
    draw: Math.round((Number.isFinite(resultProb.drawProb) ? resultProb.drawProb : 1/3) * 100),
    awayWin: Math.round((Number.isFinite(resultProb.awayWinProb) ? resultProb.awayWinProb : 1/3) * 100),
    over05,
    over15,
    over25,
    over35,
    btts: bttsVal,
    bttsAndOver25: bttsOver25,
    bothTeamsWin: 0,
    over1Under3,
  };

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
    over25Probability: over25,
    btts: bttsProbability > 0.5,
    bttsProbability: bttsVal,
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
 * 1X2 olasılıkları: önce ev/deplasman verisiyle veriye dayalı dağıtım, yoksa form + piyasa.
 */
function calculateResultProbability(
  homeFormRating: FormRating,
  awayFormRating: FormRating,
  marketValueAdjustment: number = 0,
  homeVenue?: ReturnType<typeof getVenueStats>,
  awayVenue?: ReturnType<typeof getVenueStats>,
  h2h?: { homeExpected: number; awayExpected: number; n: number }
): { homeWinProb: number; drawProb: number; awayWinProb: number } {
  const formDifference = homeFormRating.formIndex - awayFormRating.formIndex;
  const momentumDifference = homeFormRating.momentum - awayFormRating.momentum;
  const homeAdvantageFactor = homeFormRating.homeAdvantage / 20;

  let homeWinProb = 0.33 + (formDifference / 150) + (momentumDifference / 150) + (homeAdvantageFactor * 0.12) + marketValueAdjustment;
  let awayWinProb = 0.33 - (formDifference / 150) - (momentumDifference / 150) - (homeAdvantageFactor * 0.12) - marketValueAdjustment;

  // Veri varsa: ev sahibi evde gol averajı vs deplasman deplasmanda gol averajı → 1X2 dağılımı
  if (homeVenue && awayVenue && homeVenue.atHome.n >= 1 && awayVenue.away.n >= 1) {
    const homeStrengthAtHome = homeVenue.atHome.avgScored - homeVenue.atHome.avgConceded;
    const awayStrengthAway = awayVenue.away.avgScored - awayVenue.away.avgConceded;
    const venueDiff = homeStrengthAtHome - awayStrengthAway;
    // venueDiff > 0 → ev daha güçlü; olasılıkları bu farka göre dağıt (sabit %23 değil)
    const strengthWeight = Math.max(-0.35, Math.min(0.35, venueDiff * 0.12));
    homeWinProb = 0.33 + strengthWeight;
    awayWinProb = 0.33 - strengthWeight;
  }

  // H2H varsa hafif kaydır: karşılıklı maçlarda kim daha çok attı?
  if (h2h && h2h.n >= 1) {
    const h2hDiff = (h2h.homeExpected - h2h.awayExpected) * 0.06;
    homeWinProb += h2hDiff;
    awayWinProb -= h2hDiff;
  }

  const drawProb = Math.max(0.2, Math.min(0.4, 0.34 - Math.abs(homeWinProb - awayWinProb) * 0.3));
  const total = homeWinProb + awayWinProb + drawProb;
  return {
    homeWinProb: Math.max(0.08, Math.min(0.75, homeWinProb / total)),
    drawProb: Math.max(0.12, Math.min(0.45, drawProb / total)),
    awayWinProb: Math.max(0.08, Math.min(0.75, awayWinProb / total)),
  };
}

/**
 * Over X gol olasılığı. Ev/deplasman verisi varsa ev sahibi evde + deplasman deplasmanda gol ortalaması kullanılır.
 */
function calculateOverXProbability(
  homeTeamForm: TeamFormData,
  awayTeamForm: TeamFormData,
  threshold: number,
  homeVenue?: ReturnType<typeof getVenueStats>,
  awayVenue?: ReturnType<typeof getVenueStats>
): number {
  let expectedTotal: number;
  const homeLen = homeTeamForm.lastMatches?.length ?? 0;
  const awayLen = awayTeamForm.lastMatches?.length ?? 0;

  if (homeVenue && awayVenue && homeVenue.atHome.n >= 1 && awayVenue.away.n >= 1) {
    expectedTotal = homeVenue.atHome.avgScored + awayVenue.away.avgScored;
  } else if (homeLen > 0 && awayLen > 0) {
    expectedTotal = (homeTeamForm.goalsScored / homeLen) + (awayTeamForm.goalsScored / awayLen);
  } else {
    return 0.5;
  }

  const lambda = Math.max(0.1, Math.min(5, expectedTotal));
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

/** Süper Lig sezon ortalaması: takım başına gol (maç başına ~2.7–2.9 toplam) */
const LEAGUE_AVG_GOALS = 1.38;
/** Ev sahibi avantajı: beklenen gole çarpan */
const HOME_ADVANTAGE_MULTIPLIER = 1.08;

/** Poisson P(X = k) = λ^k * e^(-λ) / k! */
function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) / factorial(k)) * Math.exp(-lambda);
}

/**
 * Beklenen gol (λ_home, λ_away) ile tüm makul skorların olasılığını hesaplayıp
 * en olası skoru döndürür. Böylece 1-0 sapması olmaz, veriye göre 0-0, 1-1, 2-1 vb. çıkar.
 */
function mostLikelyScoreFromPoisson(lambdaHome: number, lambdaAway: number): { home: number; away: number } {
  lambdaHome = Math.max(0.05, Math.min(4.5, lambdaHome));
  lambdaAway = Math.max(0.05, Math.min(4.5, lambdaAway));
  let bestProb = 0;
  let bestHome = 0;
  let bestAway = 0;
  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = poissonPmf(h, lambdaHome) * poissonPmf(a, lambdaAway);
      if (p > bestProb) {
        bestProb = p;
        bestHome = h;
        bestAway = a;
      }
    }
  }
  return { home: bestHome, away: bestAway };
}

/** Beklenen golü makul bandda tut; 0-0’ı aşırı öne çıkarmamak için minimum. */
const MIN_EXPECTED_GOALS = 0.55;

/**
 * Skor: ev sahibi evde attığı × (deplasmanın deplasmanda yediği / lig ort.); deplasman için tersi.
 * Sezon içi karşılıklı maç (H2H) varsa buna göre hafif blend. Poisson ile en olası skor.
 */
function predictScoreFromVenue(
  homeVenue: ReturnType<typeof getVenueStats>,
  awayVenue: ReturnType<typeof getVenueStats>,
  homeTeamForm: TeamFormData,
  awayTeamForm: TeamFormData,
  _homeTeamId: number,
  _awayTeamId: number,
  homeForm: FormRating,
  awayForm: FormRating,
  _over25Prob: number,
  _resultProb: { homeWinProb: number; drawProb: number; awayWinProb: number },
  h2h?: { homeExpected: number; awayExpected: number; n: number }
): string {
  const homeAtHome = homeVenue.atHome;
  const awayAway = awayVenue.away;
  const homeN = homeTeamForm.lastMatches?.length ?? 0;
  const awayN = awayTeamForm.lastMatches?.length ?? 0;

  let homeExpected: number;
  let awayExpected: number;

  if (homeAtHome.n >= 1 && awayAway.n >= 1) {
    homeExpected = homeAtHome.avgScored * (awayAway.avgConceded / LEAGUE_AVG_GOALS);
    awayExpected = awayAway.avgScored * (homeAtHome.avgConceded / LEAGUE_AVG_GOALS);
    homeExpected *= HOME_ADVANTAGE_MULTIPLIER;
  } else if (homeN > 0 && awayN > 0) {
    // Veri var ama ev/deplasman ayrımı yok: genel maç başı gol ortalaması kullan
    homeExpected = (homeTeamForm.goalsScored / homeN) * (awayTeamForm.goalsConceded / awayN) / LEAGUE_AVG_GOALS;
    awayExpected = (awayTeamForm.goalsScored / awayN) * (homeTeamForm.goalsConceded / homeN) / LEAGUE_AVG_GOALS;
    homeExpected *= HOME_ADVANTAGE_MULTIPLIER;
  } else {
    const homeAttack = homeForm.attackStrength / 100;
    const awayAttack = awayForm.attackStrength / 100;
    const homeDefense = (100 - homeForm.defenseRating) / 100;
    const awayDefense = (100 - awayForm.defenseRating) / 100;
    homeExpected = Math.max(MIN_EXPECTED_GOALS, homeAttack * 2.4 - awayDefense * 0.8);
    awayExpected = Math.max(MIN_EXPECTED_GOALS, awayAttack * 2.4 - homeDefense * 0.8);
    const formDiff = (homeForm.formIndex - awayForm.formIndex) / 80;
    homeExpected = Math.max(MIN_EXPECTED_GOALS, homeExpected + formDiff);
    awayExpected = Math.max(MIN_EXPECTED_GOALS, awayExpected - formDiff);
    homeExpected *= HOME_ADVANTAGE_MULTIPLIER;
  }

  // Sezon içi karşılıklı maç varsa beklenen gole blend (70% venue/genel, 30% H2H)
  if (h2h && h2h.n >= 1) {
    homeExpected = homeExpected * 0.7 + Math.max(MIN_EXPECTED_GOALS, h2h.homeExpected) * 0.3;
    awayExpected = awayExpected * 0.7 + Math.max(MIN_EXPECTED_GOALS, h2h.awayExpected) * 0.3;
  }

  homeExpected = Math.max(MIN_EXPECTED_GOALS, Math.min(4.2, homeExpected));
  awayExpected = Math.max(MIN_EXPECTED_GOALS, Math.min(4.2, awayExpected));
  const { home, away } = mostLikelyScoreFromPoisson(homeExpected, awayExpected);
  return `${home}-${away}`;
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
