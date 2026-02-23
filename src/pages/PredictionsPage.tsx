/**
 * Predictions Page
 * Match prediction interface and display
 */

import { useState } from 'react';
import { useTeams, useMatchPrediction } from '@/hooks';
import { Header, LoadingSpinner, EmptyState } from '@/components/Layout';
import { PredictionCard, OddsDisplay } from '@/components/MatchComponents';
import { TeamComparison } from '@/components/TeamComponents';
import { Zap } from 'lucide-react';

export function PredictionsPage() {
  const { teams, loading: teamsLoading } = useTeams();
  const [homeTeamId, setHomeTeamId] = useState<number | undefined>();
  const [awayTeamId, setAwayTeamId] = useState<number | undefined>();
  const { prediction, loading: predictionLoading } = useMatchPrediction(homeTeamId, awayTeamId);

  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-8 h-8 text-sky-400" />
          <h1 className="text-3xl font-bold text-white">Maç Tahminleri</h1>
        </div>

        {/* Team Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Home Team Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-bold text-white mb-4">Ev Sahibi Takım</label>
            <select
              value={homeTeamId || ''}
              onChange={(e) => setHomeTeamId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="form-select w-full"
              disabled={teamsLoading}
            >
              <option value="">Takım Seçin</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {homeTeam && (
              <div className="mt-4 flex items-center gap-3">
                <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 rounded" />
                <p className="font-semibold text-white">{homeTeam.name}</p>
              </div>
            )}
          </div>

          {/* Away Team Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-bold text-white mb-4">Deplasman Takımı</label>
            <select
              value={awayTeamId || ''}
              onChange={(e) => setAwayTeamId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="form-select w-full"
              disabled={teamsLoading}
            >
              <option value="">Takım Seçin</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {awayTeam && (
              <div className="mt-4 flex items-center gap-3">
                <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 rounded" />
                <p className="font-semibold text-white">{awayTeam.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Results */}
        {teamsLoading || predictionLoading ? (
          <LoadingSpinner />
        ) : !homeTeamId || !awayTeamId ? (
          <EmptyState
            icon={<Zap className="w-12 h-12" />}
            title="Tahmin almak için takım seçin"
            description="Ev sahibi ve deplasman takımlarını seçerek detaylı maç tahminini görün."
          />
        ) : prediction ? (
          <div className="space-y-8">
            {/* Main Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PredictionCard prediction={prediction} />
              </div>

              {/* Odds */}
              <div>
                <OddsDisplay
                  bettingOdds={prediction.bettingOdds}
                  homeOdds={prediction.homeWinOdds}
                  drawOdds={prediction.drawOdds}
                  awayOdds={prediction.awayWinOdds}
                  homeName={prediction.homeTeam}
                  awayName={prediction.awayTeam}
                />
              </div>
            </div>

            {/* Team Comparison */}
            {homeTeam && awayTeam && (
              <TeamComparison
                homeTeam={{
                  name: homeTeam.name,
                  logo: homeTeam.logo,
                  form: {
                    teamId: homeTeam.id,
                    teamName: homeTeam.name,
                    formIndex: 75,
                    attackStrength: 68,
                    defenseRating: 72,
                    momentum: 15,
                    homeAdvantage: 12,
                    winProbability: 65,
                    form: 'WWDLW',
                  },
                }}
                awayTeam={{
                  name: awayTeam.name,
                  logo: awayTeam.logo,
                  form: {
                    teamId: awayTeam.id,
                    teamName: awayTeam.name,
                    formIndex: 68,
                    attackStrength: 62,
                    defenseRating: 65,
                    momentum: -10,
                    homeAdvantage: 8,
                    winProbability: 35,
                    form: 'WLDLW',
                  },
                }}
              />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default PredictionsPage;
