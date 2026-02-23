/**
 * Match Components
 */

import { Match, MatchPrediction } from '@/types';
import { formatMatchDate, getStatusColor, getStatusLabel } from '@/utils/index';
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
    <Card onClick={onClick} className="hover:ring-2 ring-sky-500 ring-opacity-50">
      <div className="flex items-center justify-between mb-4">
        <div className={`badge ${getStatusColor(match.status)}`}>
          {getStatusLabel(match.status)}
        </div>
        <p className="text-xs text-gray-400">{formatMatchDate(match.date)}</p>
      </div>

      <div className="flex items-center justify-between gap-6">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 mx-auto mb-2" />
          <p className="font-semibold text-gray-200 text-sm">{match.homeTeam.name}</p>
        </div>

        {/* Score */}
        <div className="text-center">
          {isFinished || isLive ? (
            <div>
              <p className="text-4xl font-bold text-white">
                {match.homeGoals} - {match.awayGoals}
              </p>
              {isLive && <p className="text-xs text-red-400 font-bold mt-1">CANLI</p>}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">vs</p>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 mx-auto mb-2" />
          <p className="font-semibold text-gray-200 text-sm">{match.awayTeam.name}</p>
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
      <h3 className="text-lg font-bold text-white mb-6">Maç Karşılaştırması</h3>

      {/* Team Information */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-16 h-16 mx-auto mb-2" />
          <h4 className="font-bold text-white">{match.homeTeam.name}</h4>
        </div>

        <div className="text-center">
          <p className="text-4xl font-bold text-sky-400">{match.homeGoals}</p>
          <p className="text-xs text-gray-400 mt-1">-</p>
          <p className="text-4xl font-bold text-sky-400">{match.awayGoals}</p>
        </div>

        <div className="text-center flex-1">
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-16 h-16 mx-auto mb-2" />
          <h4 className="font-bold text-white">{match.awayTeam.name}</h4>
        </div>
      </div>

      {/* Venue and Details */}
      <div className="border-t border-gray-700 pt-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-400">
          <div>
            <p className="text-xs mb-1">Stadyum</p>
            <p className="text-white text-xs font-medium">{match.venue || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs mb-1">Tur</p>
            <p className="text-white text-xs font-medium">Hafta {match.round}</p>
          </div>
          <div>
            <p className="text-xs mb-1">Sezon</p>
            <p className="text-white text-xs font-medium">{match.season}</p>
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
  const confidenceColor = prediction.confidence >= 70
    ? 'text-green-400'
    : prediction.confidence >= 55
    ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <Card className="border-sky-500 border-opacity-30 border-2">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{prediction.match}</h3>
        <div className="flex items-center gap-3">
          <Badge variant="info">{prediction.predictedResult}</Badge>
          <p className={`text-2xl font-bold ${confidenceColor}`}>
            {Number.isFinite(prediction.confidence) ? prediction.confidence : 50}%
          </p>
        </div>
      </div>

      {/* Main Predictions */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Tahmin Skoru</p>
          <p className="text-2xl font-bold text-white">{prediction.predictedScore}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">2.5+ Üstü</p>
          <p className="text-2xl font-bold text-white">
            {Number.isFinite(prediction.over25Probability) ? prediction.over25Probability : 50}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Her İki Gol</p>
          <Badge variant={prediction.btts ? 'success' : 'danger'} size="sm">
            {prediction.btts ? 'EVET' : 'HAYIR'}
          </Badge>
        </div>
      </div>

      {/* Analysis Factors */}
      {prediction.factors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Analiz Faktörleri</h4>
          <div className="space-y-2">
            {prediction.factors.slice(0, 3).map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="flex-shrink-0 mt-1">
                  {factor.impact > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-300">{factor.name}</p>
                  <p className="text-xs text-gray-400">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Text */}
      {prediction.analysisText && (
        <div className="pt-4 border-t border-gray-700 mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">{prediction.analysisText}</p>
        </div>
      )}

      {/* Betting Predictions */}
      {prediction.bettingProbabilities && (
        <div className="pt-4 border-t border-gray-700">
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
      <h3 className="text-lg font-bold text-white mb-4">Bahis Oranları</h3>
      <div className="grid grid-cols-3 gap-4">
        <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-center">
          <p className="text-xs text-gray-400 mb-1">{homeName}</p>
          <p className="text-2xl font-bold text-white">{(odds.homeWin || homeOdds || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">1</p>
        </button>
        <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-center">
          <p className="text-xs text-gray-400 mb-1">Beraberlik</p>
          <p className="text-2xl font-bold text-white">{(odds.draw || drawOdds || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">X</p>
        </button>
        <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-center">
          <p className="text-xs text-gray-400 mb-1">{awayName}</p>
          <p className="text-2xl font-bold text-white">{(odds.awayWin || awayOdds || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">2</p>
        </button>
      </div>

      {/* Additional Markets */}
      {bettingOdds && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Ek Bahisler</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-400">Over 2.5</span>
              <span className="text-white font-bold">{bettingOdds.over25?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-400">Her İki Gol</span>
              <span className="text-white font-bold">{bettingOdds.btts?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-400">Over 1.5</span>
              <span className="text-white font-bold">{bettingOdds.over15?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-400">BTTS + Over 2.5</span>
              <span className="text-white font-bold">{bettingOdds.bttsAndOver25?.toFixed(2) || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
