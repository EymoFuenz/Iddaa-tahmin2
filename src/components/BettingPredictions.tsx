/**
 * Betting Predictions Component
 * Displays various betting predictions with percentages
 */

import { BettingProbabilities } from '@/types';
import { Card } from './Layout';
import { TrendingUp } from 'lucide-react';

interface BettingPredictionsProps {
  probabilities: BettingProbabilities;
  homeTeam: string;
  awayTeam: string;
}

function safePercent(value: number | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
}

export function BettingPredictions({ probabilities, homeTeam, awayTeam }: BettingPredictionsProps) {
  const bets = [
    {
      title: '1X2 (Sonuç )',
      items: [
        { label: `${homeTeam} Kazanır`, value: safePercent(probabilities.homeWin), color: 'text-blue-400' },
        { label: 'Beraberlik', value: safePercent(probabilities.draw), color: 'text-gray-400' },
        { label: `${awayTeam} Kazanır`, value: safePercent(probabilities.awayWin), color: 'text-red-400' },
      ],
    },
    {
      title: 'Toplam Gol',
      items: [
        { label: 'Over 0.5', value: safePercent(probabilities.over05), color: 'text-green-400' },
        { label: 'Over 1.5', value: safePercent(probabilities.over15), color: 'text-green-400' },
        { label: 'Over 2.5', value: safePercent(probabilities.over25), color: 'text-blue-400' },
        { label: 'Over 3.5', value: safePercent(probabilities.over35), color: 'text-yellow-400' },
      ],
    },
    {
      title: 'Özel Tahmini',
      items: [
        { label: 'Her İki Takım Gol Atsa', value: safePercent(probabilities.btts), color: 'text-purple-400' },
        { label: 'Her İki Takım Gol + Over 2.5', value: safePercent(probabilities.bttsAndOver25), color: 'text-pink-400' },
        { label: '1-3 Gol Arası', value: safePercent(probabilities.over1Under3), color: 'text-cyan-400' },
      ],
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-sky-400" />
        <h3 className="text-lg font-bold text-white">İddia Tahminleri</h3>
      </div>

      <div className="space-y-6">
        {bets.map((betGroup, idx) => (
          <div key={idx}>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              {betGroup.title}
            </h4>
            <div className="space-y-2">
              {betGroup.items.map((item, itemIdx) => (
                <div key={itemIdx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.value >= 70
                          ? 'bg-green-500'
                          : item.value >= 50
                          ? 'bg-blue-500'
                          : item.value >= 30
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2 font-semibold">Yüzdelik Rehberi:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">%70+ (Yüksek)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400">%50-70 (Orta)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">%30-50 (Düşük)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400">&lt;%30 (Çok Düşük)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BettingPredictions;
