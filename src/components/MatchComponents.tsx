/**
 * Match Components
 */

import { Match, MatchPrediction } from '@/types';
import { formatMatchDate, getStatusVariant, getStatusLabel } from '@/utils/index';
import { Badge, Card } from './Layout';
import { BettingPredictions } from './BettingPredictions';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Match Card (for listing)
 */
interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  return (
    <Card onClick={onClick} className="hover:ring-2 hover:ring-primary/50">
      <div className="mb-4 flex items-center justify-between">
        <Badge variant={getStatusVariant(match.status)}>{getStatusLabel(match.status)}</Badge>
        <p className="text-xs text-muted-foreground">{formatMatchDate(match.date)}</p>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 text-center">
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="mx-auto mb-2 h-10 w-10" />
          <p className="text-sm font-semibold text-foreground">{match.homeTeam.name}</p>
        </div>
        <div className="text-center">
          {isFinished || isLive ? (
            <div>
              <p className="text-4xl font-bold text-foreground">
                {match.homeGoals} – {match.awayGoals}
              </p>
              {isLive && <p className="mt-1 text-xs font-bold text-destructive">CANLI</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">vs</p>
          )}
        </div>
        <div className="flex-1 text-center">
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="mx-auto mb-2 h-10 w-10" />
          <p className="text-sm font-semibold text-foreground">{match.awayTeam.name}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Match Comparison
 */
interface MatchComparisonProps {
  match: Match;
}

export function MatchComparison({ match }: MatchComparisonProps) {
  return (
    <Card>
      <h3 className="mb-6 text-lg font-bold text-foreground">Maç Karşılaştırması</h3>
      <div className="mb-8 flex flex-1 items-center justify-between">
        <div className="flex-1 text-center">
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="mx-auto mb-2 h-16 w-16" />
          <h4 className="font-bold text-foreground">{match.homeTeam.name}</h4>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">{match.homeGoals}</p>
          <p className="mt-1 text-xs text-muted-foreground">-</p>
          <p className="text-4xl font-bold text-primary">{match.awayGoals}</p>
        </div>
        <div className="flex-1 text-center">
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="mx-auto mb-2 h-16 w-16" />
          <h4 className="font-bold text-foreground">{match.awayTeam.name}</h4>
        </div>
      </div>
      <div className="border-t border-border pt-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
          <div>
            <p className="mb-1 text-xs">Stadyum</p>
            <p className="text-xs font-medium text-foreground">{match.venue || 'N/A'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs">Tur</p>
            <p className="text-xs font-medium text-foreground">Hafta {match.round}</p>
          </div>
          <div>
            <p className="mb-1 text-xs">Sezon</p>
            <p className="text-xs font-medium text-foreground">{match.season}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Prediction Card
 */
interface PredictionCardProps {
  prediction: MatchPrediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const confidenceColor =
    prediction.confidence >= 70
      ? 'text-emerald-600 dark:text-emerald-400'
      : prediction.confidence >= 55
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-destructive';

  return (
    <Card className="border-2 border-primary/30">
      <div className="mb-6">
        <h3 className="mb-2 text-xl font-bold text-foreground">{prediction.match}</h3>
        <div className="flex items-center gap-3">
          <Badge variant="info">{prediction.predictedResult}</Badge>
          <p className={`text-2xl font-bold ${confidenceColor}`}>
            {Number.isFinite(prediction.confidence) ? prediction.confidence : 50}%
          </p>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4 border-b border-border pb-6">
        <div className="text-center">
          <p className="mb-1 text-xs text-muted-foreground">Tahmin Skoru</p>
          <p className="text-2xl font-bold text-foreground">{prediction.predictedScore}</p>
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs text-muted-foreground">2.5+ Üstü</p>
          <p className="text-2xl font-bold text-foreground">
            {Number.isFinite(prediction.over25Probability) ? prediction.over25Probability : 50}%
          </p>
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs text-muted-foreground">Her İki Gol</p>
          <Badge variant={prediction.btts ? 'success' : 'danger'} size="sm">
            {prediction.btts ? 'EVET' : 'HAYIR'}
          </Badge>
        </div>
      </div>
      {prediction.factors.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Analiz Faktörleri</h4>
          <div className="space-y-2">
            {prediction.factors.slice(0, 3).map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="mt-1 shrink-0">
                  {factor.impact > 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{factor.name}</p>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {prediction.analysisText && (
        <div className="mb-6 border-t border-border pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{prediction.analysisText}</p>
        </div>
      )}
      {prediction.bettingProbabilities && (
        <div className="border-t border-border pt-4">
          <BettingPredictions
            probabilities={prediction.bettingProbabilities}
            homeTeam={prediction.homeTeam}
            awayTeam={prediction.awayTeam}
          />
        </div>
      )}
    </Card>
  );
}

/**
 * Odds Display
 */
interface OddsDisplayProps {
  bettingOdds?: any;
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  homeName: string;
  awayName: string;
}

export function OddsDisplay({ bettingOdds, homeOdds, drawOdds, awayOdds, homeName, awayName }: OddsDisplayProps) {
  const odds = bettingOdds || { homeWin: homeOdds, draw: drawOdds, awayWin: awayOdds };
  
  return (
    <Card>
      <h3 className="mb-4 text-lg font-bold text-foreground">Bahis Oranları</h3>
      <div className="grid grid-cols-3 gap-4">
        <button className="rounded-lg bg-muted p-4 text-center transition hover:bg-muted/80">
          <p className="mb-1 text-xs text-muted-foreground">{homeName}</p>
          <p className="text-2xl font-bold text-foreground">{(odds.homeWin || homeOdds || 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">1</p>
        </button>
        <button className="rounded-lg bg-muted p-4 text-center transition hover:bg-muted/80">
          <p className="mb-1 text-xs text-muted-foreground">Beraberlik</p>
          <p className="text-2xl font-bold text-foreground">{(odds.draw || drawOdds || 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">X</p>
        </button>
        <button className="rounded-lg bg-muted p-4 text-center transition hover:bg-muted/80">
          <p className="mb-1 text-xs text-muted-foreground">{awayName}</p>
          <p className="text-2xl font-bold text-foreground">{(odds.awayWin || awayOdds || 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">2</p>
        </button>
      </div>
      {bettingOdds && (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Ek Bahisler</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-muted p-2">
              <span className="text-muted-foreground">Over 2.5</span>
              <span className="font-bold text-foreground">{bettingOdds.over25?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-2">
              <span className="text-muted-foreground">Her İki Gol</span>
              <span className="font-bold text-foreground">{bettingOdds.btts?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-2">
              <span className="text-muted-foreground">Over 1.5</span>
              <span className="font-bold text-foreground">{bettingOdds.over15?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-2">
              <span className="text-muted-foreground">BTTS + Over 2.5</span>
              <span className="font-bold text-foreground">{bettingOdds.bttsAndOver25?.toFixed(2) || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
