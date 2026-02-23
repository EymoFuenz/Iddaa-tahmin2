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
    <Card onClick={onClick} className="text-center hover:ring-2 ring-sky-500 ring-opacity-50">
      <img src={team.logo} alt={team.name} className="w-16 h-16 mx-auto mb-4" />
      <h3 className="font-bold text-white mb-2">{team.name}</h3>
      
      {stats && (
        <div className="text-xs text-gray-400">
          <p>Puan: <span className="text-white font-bold">{stats.points}</span></p>
          <p>Konum: <span className="text-white font-bold">#{stats.position}</span></p>
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
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
        <img src={teamLogo} alt={teamName} className="w-12 h-12 rounded-lg" />
        <div>
          <h3 className="text-lg font-bold text-white">{teamName}</h3>
          <p className="text-xs text-gray-400">Form Analitikleri</p>
        </div>
      </div>

      {/* Main Ratings */}
      <div className="grid grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Form</p>
          <p className="text-3xl font-bold text-sky-400">{formRating.formIndex.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Atak</p>
          <p className="text-3xl font-bold text-orange-400">{formRating.attackStrength.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Defans</p>
          <p className="text-3xl font-bold text-green-400">{formRating.defenseRating.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Momentum</p>
          <p className={`text-3xl font-bold ${formRating.momentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formRating.momentum > 0 ? '+' : ''}{formRating.momentum.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Rating Bars */}
      <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
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
      <h3 className="text-lg font-bold text-white mb-6">Takım Karşılaştırması</h3>

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
                  <p className="text-sm font-medium text-white flex-1">{homeTeam.name}</p>
                  <p className={`text-sm font-bold ${homeBetter ? 'text-green-400' : 'text-gray-400'}`}>
                    {metric.home.toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center mb-3">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all"
                    style={{ width: `${(metric.home / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${(metric.away / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div />
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <p className={`text-sm font-bold ${!homeBetter ? 'text-green-400' : 'text-gray-400'}`}>
                    {metric.away.toFixed(0)}
                  </p>
                  <p className="text-sm font-medium text-white flex-1 text-right">{awayTeam.name}</p>
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
      className="flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg cursor-pointer transition"
    >
      <div className="w-8 text-center font-bold text-gray-400">{position}</div>
      <img src={team.logo} alt={team.name} className="w-8 h-8 rounded" />
      <div className="flex-1">
        <p className="font-medium text-white">{team.name}</p>
        <p className="text-xs text-gray-400">{played} M</p>
      </div>

      <div className="text-center">
        <p className="font-bold text-white">{points}</p>
        <p className="text-xs text-gray-400">Puan</p>
      </div>

      <div className="text-center">
        <p className="text-xs text-green-400 font-medium">{wins}W</p>
        <p className="text-xs text-yellow-400">{draws}D {losses}L</p>
      </div>

      <div className="text-center">
        <p className="text-white font-medium">{goalsFor}</p>
        <p className="text-gray-400">-</p>
        <p className="text-white font-medium">{goalsAgainst}</p>
      </div>

      <div className="text-center">
        <p className={`font-bold ${goalDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {goalDiff > 0 ? '+' : ''}{goalDiff}
        </p>
        <p className="text-xs text-gray-400">Avg</p>
      </div>
    </div>
  );
}
