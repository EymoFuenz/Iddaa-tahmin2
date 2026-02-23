import { useState } from 'react';
import { useTeams, useAnalyzeMatch } from '@/hooks';
import { Header, ErrorMessage } from '@/components/Layout';
import { PredictionCard } from '@/components/MatchComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="site-container py-8">
        <div className="mb-8 flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Maç Tahmini</h1>
        </div>
        <p className="mb-8 text-muted-foreground">
          İki takım seçin, &quot;Analiz et&quot; butonuna basın. Tahmin sadece ekranda gösterilir, kaydedilmez.
        </p>

        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ev Sahibi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={homeTeamId ?? ''}
                onChange={e => setHomeTeamId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                disabled={teamsLoading}
              >
                <option value="">Takım seçin</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              {homeTeam && (
                <div className="flex items-center gap-3">
                  <img
                    src={homeTeam.logo}
                    alt=""
                    className="h-10 w-10 rounded object-contain bg-muted"
                  />
                  <span className="font-medium text-foreground">{homeTeam.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deplasman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={awayTeamId ?? ''}
                onChange={e => setAwayTeamId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                disabled={teamsLoading}
              >
                <option value="">Takım seçin</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              {awayTeam && (
                <div className="flex items-center gap-3">
                  <img
                    src={awayTeam.logo}
                    alt=""
                    className="h-10 w-10 rounded object-contain bg-muted"
                  />
                  <span className="font-medium text-foreground">{awayTeam.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Button
            size="lg"
            onClick={analyze}
            disabled={!canAnalyze || analyzing}
            className="gap-2"
          >
            {analyzing ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Hesaplanıyor...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Analiz et
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {prediction && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Tahmin
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sonuç</p>
                      <p className="text-2xl font-bold text-foreground">{resultLabel}</p>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tahmini skor</p>
                    <p className="text-3xl font-bold text-primary">{prediction.predictedScore}</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="text-sm text-muted-foreground">Güven</p>
                    <p className="text-2xl font-bold text-foreground">{prediction.confidence}%</p>
                  </div>
                </div>
                {prediction.analysisText && (
                  <p className="border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
                    {prediction.analysisText}
                  </p>
                )}
              </CardContent>
            </Card>

            <PredictionCard prediction={prediction} />
          </div>
        )}

        {!prediction && !analyzing && canAnalyze && (
          <p className="py-8 text-center text-muted-foreground">
            Tahmin görmek için &quot;Analiz et&quot; butonuna basın.
          </p>
        )}
      </main>
    </div>
  );
}

export default PredictionsPage;
