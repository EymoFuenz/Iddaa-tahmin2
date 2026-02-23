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
        { label: `${homeTeam} Kazanır`, value: safePercent(probabilities.homeWin), color: 'text-primary' },
        { label: 'Beraberlik', value: safePercent(probabilities.draw), color: 'text-muted-foreground' },
        { label: `${awayTeam} Kazanır`, value: safePercent(probabilities.awayWin), color: 'text-destructive' },
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
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">İddia Tahminleri</h3>
      </div>

      <div className="space-y-6">
        {bets.map((betGroup, idx) => (
          <div key={idx}>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {betGroup.title}
            </h4>
            <div className="space-y-2">
              {betGroup.items.map((item, itemIdx) => (
                <div key={itemIdx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.value >= 70
                          ? 'bg-emerald-500'
                          : item.value >= 50
                            ? 'bg-primary'
                            : item.value >= 30
                              ? 'bg-amber-500'
                              : 'bg-destructive'
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

      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Yüzdelik Rehberi:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">%70+ (Yüksek)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">%50-70 (Orta)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">%30-50 (Düşük)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">&lt;%30 (Çok Düşük)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BettingPredictions;
