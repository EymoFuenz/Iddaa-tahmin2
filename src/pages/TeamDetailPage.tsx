/**
 * Team Detail Page
 * Takım detayı: maç listesi ve istatistikler (Firebase teamSeasonData)
 */

import { useParams, Link } from 'react-router-dom';
import { useTeamSeasonData } from '@/hooks';
import { Header, LoadingSpinner, ErrorMessage } from '@/components/Layout';
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Target,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Match } from '@/types';

function getTeamResult(m: Match, teamId: number): 'W' | 'D' | 'L' {
  const isHome = m.homeTeam.id === teamId;
  const our = isHome ? m.homeGoals : m.awayGoals;
  const other = isHome ? m.awayGoals : m.homeGoals;
  if (our > other) return 'W';
  if (our < other) return 'L';
  return 'D';
}

function getOpponent(m: Match, teamId: number) {
  return m.homeTeam.id === teamId ? m.awayTeam : m.homeTeam;
}

function getScore(m: Match, teamId: number): string {
  const isHome = m.homeTeam.id === teamId;
  return isHome ? `${m.homeGoals} - ${m.awayGoals}` : `${m.awayGoals} - ${m.homeGoals}`;
}

export function TeamDetailPage() {
  const { season, teamId } = useParams<{ season: string; teamId: string }>();
  const seasonNum = season ? parseInt(season, 10) : undefined;
  const teamIdNum = teamId ? parseInt(teamId, 10) : undefined;
  const { data, loading, error } = useTeamSeasonData(seasonNum, teamIdNum);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <main className="container py-8 px-4 max-w-4xl mx-auto">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <main className="container py-8 px-4 max-w-4xl mx-auto">
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Takımlara dön
          </Link>
          <ErrorMessage message={error || 'Takım bulunamadı.'} />
        </main>
      </div>
    );
  }

  const { team, matches } = data;
  const wins = matches.filter(m => getTeamResult(m, team.id) === 'W').length;
  const draws = matches.filter(m => getTeamResult(m, team.id) === 'D').length;
  const losses = matches.filter(m => getTeamResult(m, team.id) === 'L').length;
  const goalsFor = matches.reduce(
    (sum, m) => sum + (m.homeTeam.id === team.id ? m.homeGoals : m.awayGoals),
    0
  );
  const goalsAgainst = matches.reduce(
    (sum, m) => sum + (m.homeTeam.id === team.id ? m.awayGoals : m.homeGoals),
    0
  );
  const points = wins * 3 + draws;
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="container py-8 px-4 max-w-4xl mx-auto">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Takımlara dön
        </Link>

        {/* Takım başlık */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-600/50 p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <img
            src={team.logo}
            alt={team.name}
            className="w-24 h-24 rounded-xl bg-white/5 object-contain"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{team.name}</h1>
            <p className="text-slate-400 mt-1">
              Süper Lig {season}–{String(Number(season) + 1).slice(-2)} sezonu
            </p>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-slate-800/60 border border-slate-600/40 p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{points}</p>
            <p className="text-xs text-slate-400">Puan</p>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-slate-600/40 p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{wins}</p>
            <p className="text-xs text-slate-400">Galibiyet</p>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-slate-600/40 p-4 text-center">
            <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{draws}</p>
            <p className="text-xs text-slate-400">Beraberlik</p>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-slate-600/40 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{losses}</p>
            <p className="text-xs text-slate-400">Mağlubiyet</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-8 justify-center sm:justify-start">
          <span className="px-4 py-2 rounded-lg bg-sky-500/20 text-sky-300 text-sm font-medium">
            Atılan: {goalsFor}
          </span>
          <span className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm font-medium">
            Yenilen: {goalsAgainst}
          </span>
          <span className="px-4 py-2 rounded-lg bg-slate-600/50 text-slate-300 text-sm font-medium">
            Averaj: {goalsFor - goalsAgainst >= 0 ? '+' : ''}{goalsFor - goalsAgainst}
          </span>
        </div>

        {/* Maç listesi */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-600/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-600/50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Maçlar ({sortedMatches.length})</h2>
          </div>
          <ul className="divide-y divide-slate-600/50">
            {sortedMatches.length === 0 ? (
              <li className="px-4 py-8 text-center text-slate-400">Bu sezona ait maç kaydı yok.</li>
            ) : (
              sortedMatches.map(m => {
                const result = getTeamResult(m, team.id);
                const opponent = getOpponent(m, team.id);
                const score = getScore(m, team.id);
                const isHome = m.homeTeam.id === team.id;
                return (
                  <li
                    key={m.id}
                    className="px-4 py-3 flex flex-wrap items-center gap-3 hover:bg-slate-700/30 transition"
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        result === 'W'
                          ? 'bg-green-500/20 text-green-400'
                          : result === 'D'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}
                    </span>
                    <span className="text-slate-500 text-sm w-20 shrink-0">
                      {new Date(m.date).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </span>
                    <span className="text-slate-400 text-sm shrink-0">
                      {isHome ? 'Ev' : 'Dış'}
                    </span>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={opponent.logo}
                        alt=""
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span className="text-white font-medium truncate">{opponent.name}</span>
                    </div>
                    <span className="text-sky-300 font-mono font-semibold shrink-0">{score}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default TeamDetailPage;
