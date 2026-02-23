/**
 * teamSeasonData (Firebase) → TeamFormData dönüşümü
 * Takımın sezondaki maçlarına göre ev/deplasman formu ve istatistikler
 */

import { Match, TeamFormData, TeamSeasonData } from '@/types';

/** Firebase'den gelen id bazen string olabiliyor; sayıya çevirip karşılaştırıyoruz. */
function idEq(a: number | string | undefined, b: number): boolean {
  if (a == null) return false;
  return Number(a) === Number(b);
}

function teamGoalsInMatch(m: Match, teamId: number): number {
  return idEq(m.homeTeam?.id, teamId) ? m.homeGoals : m.awayGoals;
}

function opponentGoalsInMatch(m: Match, teamId: number): number {
  return idEq(m.homeTeam?.id, teamId) ? m.awayGoals : m.homeGoals;
}

function result(m: Match, teamId: number): 'win' | 'draw' | 'loss' {
  const our = teamGoalsInMatch(m, teamId);
  const other = opponentGoalsInMatch(m, teamId);
  if (our > other) return 'win';
  if (our < other) return 'loss';
  return 'draw';
}

/**
 * TeamSeasonData'daki maçlardan TeamFormData üretir.
 * Ev maçları homeForm, deplasman maçları awayForm; atılan/yenilen gol ve galibiyet/beraberlik/mağlubiyet hesaplanır.
 */
export function teamSeasonDataToFormData(data: TeamSeasonData): TeamFormData {
  const { teamId, matches } = data;
  const homeForm = matches.filter(m => idEq(m.homeTeam?.id, teamId));
  const awayForm = matches.filter(m => idEq(m.awayTeam?.id, teamId));
  const lastMatches = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let goalsScored = 0;
  let goalsConceded = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  matches.forEach(m => {
    goalsScored += teamGoalsInMatch(m, teamId);
    goalsConceded += opponentGoalsInMatch(m, teamId);
    const r = result(m, teamId);
    if (r === 'win') wins += 1;
    else if (r === 'draw') draws += 1;
    else losses += 1;
  });

  const n = matches.length;
  const shotsOnTarget = n > 0 ? Math.round((goalsScored / n) * 2.5 * 10) / 10 : 0;

  return {
    teamId,
    lastMatches,
    homeForm,
    awayForm,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    shotsOnTarget,
    possession: 50,
    corners: 0,
  };
}
