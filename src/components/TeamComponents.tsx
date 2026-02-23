/**
 * Team Components
 */

import { Team, FormRating } from '@/types';
import { Card, FormBar, RatingBar } from './Layout';

/**
 * Team Card (Simple)
 */
interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  stats?: any;
}

export function TeamCard({ team, onClick, stats }: TeamCardProps) {
  return (
    <Card onClick={onClick} className="text-center hover:ring-2 hover:ring-primary/50">
      <img src={team.logo} alt={team.name} className="mx-auto mb-4 h-16 w-16" />
      <h3 className="mb-2 font-bold text-foreground">{team.name}</h3>
      {stats && (
        <div className="text-xs text-muted-foreground">
          <p>Puan: <span className="font-bold text-foreground">{stats.points}</span></p>
          <p>Konum: <span className="font-bold text-foreground">#{stats.position}</span></p>
        </div>
      )}
    </Card>
  );
}

/**
 * Team Details - Form Analytics
 */
interface TeamFormDisplayProps {
  teamName: string;
  teamLogo: string;
  formRating: FormRating;
}

export function TeamFormDisplay({ teamName, teamLogo, formRating }: TeamFormDisplayProps) {
  return (
    <Card>
      <div className="mb-6 flex items-center gap-4 border-b border-border pb-4">
        <img src={teamLogo} alt={teamName} className="h-12 w-12 rounded-lg" />
        <div>
          <h3 className="text-lg font-bold text-foreground">{teamName}</h3>
          <p className="text-xs text-muted-foreground">Form Analitikleri</p>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-4 gap-4 border-b border-border pb-6">
        <div className="text-center">
          <p className="mb-2 text-xs text-muted-foreground">Form</p>
          <p className="text-3xl font-bold text-primary">{formRating.formIndex.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="mb-2 text-xs text-muted-foreground">Atak</p>
          <p className="text-3xl font-bold text-orange-400">{formRating.attackStrength.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Defans</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formRating.defenseRating.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Momentum</p>
          <p className={`text-3xl font-bold ${formRating.momentum > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'}`}>
            {formRating.momentum > 0 ? '+' : ''}{formRating.momentum.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Rating Bars */}
      <div className="space-y-4 mb-6 pb-6 border-b border-border">
        <RatingBar label="Form İndeksi" value={formRating.formIndex} />
        <RatingBar label="Atak Gücü" value={formRating.attackStrength} color="bg-orange-500" />
        <RatingBar label="Defans Gücü" value={formRating.defenseRating} color="bg-green-500" />
        <RatingBar label="Ana Avantajı (0-20)" value={formRating.homeAdvantage} max={20} color="bg-purple-500" />
      </div>

      {/* Form String */}
      <FormBar form={formRating.form} title="Son 5 Maç Formu" />
    </Card>
  );
}

/**
 * Team Comparison
 */
interface TeamComparisonProps {
  homeTeam: { name: string; logo: string; form: FormRating };
  awayTeam: { name: string; logo: string; form: FormRating };
}

export function TeamComparison({ homeTeam, awayTeam }: TeamComparisonProps) {
  const metrics = [
    {
      name: 'Form',
      home: homeTeam.form.formIndex,
      away: awayTeam.form.formIndex,
      icon: '📊',
    },
    {
      name: 'Atak Gücü',
      home: homeTeam.form.attackStrength,
      away: awayTeam.form.attackStrength,
      icon: '⚡',
    },
    {
      name: 'Defans Gücü',
      home: homeTeam.form.defenseRating,
      away: awayTeam.form.defenseRating,
      icon: '🛡️',
    },
  ];

  return (
    <Card>
      <h3 className="text-lg font-bold text-foreground mb-6">Takım Karşılaştırması</h3>

      <div className="space-y-6">
        {metrics.map((metric) => {
          const homeBetter = metric.home >= metric.away;
          const maxValue = Math.max(metric.home, metric.away);

          return (
            <div key={metric.name}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <span>{metric.icon}</span>
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-5 h-5 rounded" />
                  <p className="text-sm font-medium text-foreground flex-1">{homeTeam.name}</p>
                  <p className={`text-sm font-bold ${homeBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {metric.home.toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center mb-3">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all"
                    style={{ width: `${(metric.home / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${(metric.away / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div />
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <p className={`text-sm font-bold ${!homeBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {metric.away.toFixed(0)}
                  </p>
                  <p className="text-sm font-medium text-foreground flex-1 text-right">{awayTeam.name}</p>
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-5 h-5 rounded" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * League Standing Row
 */
interface StandingRowProps {
  position: number;
  team: Team;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  onClick?: () => void;
}

export function StandingRow({
  position,
  team,
  points,
  played,
  wins,
  draws,
  losses,
  goalsFor,
  goalsAgainst,
  onClick,
}: StandingRowProps) {
  const goalDiff = goalsFor - goalsAgainst;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition hover:bg-muted cursor-pointer"
    >
      <div className="w-8 text-center font-bold text-muted-foreground">{position}</div>
      <img src={team.logo} alt={team.name} className="w-8 h-8 rounded" />
      <div className="flex-1">
        <p className="font-medium text-foreground">{team.name}</p>
        <p className="text-xs text-muted-foreground">{played} M</p>
      </div>

      <div className="text-center">
        <p className="font-bold text-foreground">{points}</p>
        <p className="text-xs text-muted-foreground">Puan</p>
      </div>

      <div className="text-center">
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{wins}W</p>
        <p className="text-xs text-yellow-400">{draws}D {losses}L</p>
      </div>

      <div className="text-center">
        <p className="text-foreground font-medium">{goalsFor}</p>
        <p className="text-muted-foreground">-</p>
        <p className="text-foreground font-medium">{goalsAgainst}</p>
      </div>

      <div className="text-center">
        <p className={`font-bold ${goalDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-400'}`}>
          {goalDiff > 0 ? '+' : ''}{goalDiff}
        </p>
        <p className="text-xs text-muted-foreground">Avg</p>
      </div>
    </div>
  );
}
