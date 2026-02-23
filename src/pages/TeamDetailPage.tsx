import { useParams, Link } from 'react-router-dom';
import { useTeamSeasonData } from '@/hooks';
import { Header, LoadingSpinner, ErrorMessage } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Target,
  Shield,
  TrendingDown,
} from 'lucide-react';
import { Match } from '@/types';

function getTeamResult(m: Match, teamId: number): 'W' | 'D' | 'L' {
  const isHome = Number(m.homeTeam?.id) === teamId;
  const our = isHome ? m.homeGoals : m.awayGoals;
  const other = isHome ? m.awayGoals : m.homeGoals;
  if (our > other) return 'W';
  if (our < other) return 'L';
  return 'D';
}

function getOpponent(m: Match, teamId: number) {
  return Number(m.homeTeam?.id) === teamId ? m.awayTeam : m.homeTeam;
}

function getScore(m: Match, teamId: number): string {
  const isHome = Number(m.homeTeam?.id) === teamId;
  return isHome ? `${m.homeGoals} - ${m.awayGoals}` : `${m.awayGoals} - ${m.homeGoals}`;
}

export function TeamDetailPage() {
  const { season, teamId } = useParams<{ season: string; teamId: string }>();
  const seasonNum = season ? parseInt(season, 10) : undefined;
  const teamIdNum = teamId ? parseInt(teamId, 10) : undefined;
  const { data, loading, error } = useTeamSeasonData(seasonNum, teamIdNum);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="site-container py-8">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="site-container py-8">
          <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link to="/teams">
              <ArrowLeft className="h-4 w-4" /> Takımlara dön
            </Link>
          </Button>
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
    (sum, m) => sum + (Number(m.homeTeam?.id) === team.id ? m.homeGoals : m.awayGoals),
    0
  );
  const goalsAgainst = matches.reduce(
    (sum, m) => sum + (Number(m.homeTeam?.id) === team.id ? m.awayGoals : m.homeGoals),
    0
  );
  const points = wins * 3 + draws;
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="site-container py-8">
        <Button variant="ghost" asChild className="mb-6 gap-2">
          <Link to="/teams">
            <ArrowLeft className="h-4 w-4" /> Takımlara dön
          </Link>
        </Button>

        <Card className="mb-8">
          <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:text-left">
            <img
              src={team.logo}
              alt={team.name}
              className="h-24 w-24 rounded-xl bg-muted object-contain"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{team.name}</h1>
              <p className="mt-1 text-muted-foreground">
                Süper Lig {season}–{String(Number(season) + 1).slice(-2)} sezonu
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Trophy, value: points, label: 'Puan', color: 'text-amber-500' },
            { icon: Target, value: wins, label: 'Galibiyet', color: 'text-emerald-500' },
            { icon: Shield, value: draws, label: 'Beraberlik', color: 'text-amber-400' },
            { icon: TrendingDown, value: losses, label: 'Mağlubiyet', color: 'text-destructive' },
          ].map(({ icon: Icon, value, label, color }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <Icon className={`mx-auto mb-2 h-6 w-6 ${color}`} />
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-4 sm:justify-start">
          <span className="rounded-lg bg-primary/15 px-4 py-2 text-sm font-medium text-primary">
            Atılan: {goalsFor}
          </span>
          <span className="rounded-lg bg-destructive/15 px-4 py-2 text-sm font-medium text-destructive">
            Yenilen: {goalsAgainst}
          </span>
          <span className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            Averaj: {goalsFor - goalsAgainst >= 0 ? '+' : ''}{goalsFor - goalsAgainst}
          </span>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Maçlar ({sortedMatches.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {sortedMatches.length === 0 ? (
                <li className="py-8 text-center text-muted-foreground">
                  Bu sezona ait maç kaydı yok.
                </li>
              ) : (
                sortedMatches.map(m => {
                  const result = getTeamResult(m, team.id);
                  const opponent = getOpponent(m, team.id);
                  const score = getScore(m, team.id);
                  const isHome = Number(m.homeTeam?.id) === team.id;
                  return (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-muted/50"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          result === 'W'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : result === 'D'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}
                      </span>
                      <span className="w-20 shrink-0 text-sm text-muted-foreground">
                        {new Date(m.date).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {isHome ? 'Ev' : 'Dış'}
                      </span>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <img
                          src={opponent.logo}
                          alt=""
                          className="h-6 w-6 shrink-0 object-contain"
                        />
                        <span className="truncate font-medium text-foreground">{opponent.name}</span>
                      </div>
                      <span className="shrink-0 font-mono font-semibold text-primary">{score}</span>
                    </li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default TeamDetailPage;
