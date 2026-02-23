/**
 * Predictions Page
 * 2 takım seç → Analiz et → Tahmin (kim kazanır, kaç gol). Veritabanına kayıt yok.
 */

import { useState } from 'react';
import { useTeams, useAnalyzeMatch } from '@/hooks';
import { Header, ErrorMessage } from '@/components/Layout';
import { PredictionCard } from '@/components/MatchComponents';
import { Zap, Search, Trophy, Target } from 'lucide-react';

export function PredictionsPage() {
  const { teams, loading: teamsLoading } = useTeams();
  const [homeTeamId, setHomeTeamId] = useState<number | undefined>();
  const [awayTeamId, setAwayTeamId] = useState<number | undefined>();
  const { analyze, prediction, analyzing, error } = useAnalyzeMatch(homeTeamId, awayTeamId);

  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);
  const canAnalyze = homeTeamId && awayTeamId && homeTeamId !== awayTeamId;

  const resultLabel =
    prediction?.predictedResult === 'Home Win'
      ? `${prediction.homeTeam} kazanır`
      : prediction?.predictedResult === 'Away Win'
        ? `${prediction.awayTeam} kazanır`
        : 'Beraberlik';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="container py-8 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-8 h-8 text-sky-400" />
          <h1 className="text-3xl font-bold text-white">Maç Tahmini</h1>
        </div>
        <p className="text-slate-400 mb-8">
          İki takım seçin, &quot;Analiz et&quot; butonuna basın. Tahmin sadece ekranda gösterilir, kaydedilmez.
        </p>

        {/* Takım seçimi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl bg-slate-800/80 border border-slate-600/50 p-6">
            <label className="block text-sm font-bold text-white mb-3">Ev Sahibi</label>
            <select
              value={homeTeamId ?? ''}
              onChange={e => setHomeTeamId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="form-select w-full"
              disabled={teamsLoading}
            >
              <option value="">Takım seçin</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {homeTeam && (
              <div className="mt-4 flex items-center gap-3">
                <img src={homeTeam.logo} alt="" className="w-10 h-10 rounded object-contain bg-white/5" />
                <span className="font-medium text-white">{homeTeam.name}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-800/80 border border-slate-600/50 p-6">
            <label className="block text-sm font-bold text-white mb-3">Deplasman</label>
            <select
              value={awayTeamId ?? ''}
              onChange={e => setAwayTeamId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="form-select w-full"
              disabled={teamsLoading}
            >
              <option value="">Takım seçin</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {awayTeam && (
              <div className="mt-4 flex items-center gap-3">
                <img src={awayTeam.logo} alt="" className="w-10 h-10 rounded object-contain bg-white/5" />
                <span className="font-medium text-white">{awayTeam.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Analiz et butonu */}
        <div className="mb-8">
          <button
            onClick={analyze}
            disabled={!canAnalyze || analyzing}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition"
          >
            {analyzing ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Hesaplanıyor...</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Analiz et
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Tahmin sonucu */}
        {prediction && (
          <div className="space-y-6">
            {/* Özet: Kim kazanır + Skor */}
            <div className="rounded-2xl bg-slate-800/80 border border-slate-600/50 p-8">
              <h2 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Tahmin
              </h2>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-sky-400" />
                  <div>
                    <p className="text-sm text-slate-400">Sonuç</p>
                    <p className="text-2xl font-bold text-white">{resultLabel}</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-600" />
                <div>
                  <p className="text-sm text-slate-400">Tahmini skor</p>
                  <p className="text-3xl font-bold text-sky-400">{prediction.predictedScore}</p>
                </div>
                <div className="h-12 w-px bg-slate-600" />
                <div>
                  <p className="text-sm text-slate-400">Güven</p>
                  <p className="text-2xl font-bold text-white">{prediction.confidence}%</p>
                </div>
              </div>
              {prediction.analysisText && (
                <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-600/50 pt-6">
                  {prediction.analysisText}
                </p>
              )}
            </div>

            {/* Detaylı kart (mevcut PredictionCard) */}
            <PredictionCard prediction={prediction} />
          </div>
        )}

        {!prediction && !analyzing && canAnalyze && (
          <p className="text-slate-500 text-center py-8">
            Tahmin görmek için &quot;Analiz et&quot; butonuna basın.
          </p>
        )}
      </main>
    </div>
  );
}

export default PredictionsPage;
