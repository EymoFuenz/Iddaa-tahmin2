/**
 * Home Page
 * Displays today's/upcoming matches and featured predictions
 */

import { useUpcomingMatches } from '@/hooks';
import { Header, LoadingSpinner, EmptyState, ErrorMessage } from '@/components/Layout';
import { MatchCard } from '@/components/MatchComponents';
import { Calendar, Zap } from 'lucide-react';

function HomePage() {
  const { matches, loading, error } = useUpcomingMatches();

  const todayMatches = matches.filter(m => {
    const matchDate = new Date(m.date);
    const today = new Date();
    return matchDate.toDateString() === today.toDateString();
  });

  const upcomingMatches = matches.filter(m => {
    const matchDate = new Date(m.date);
    const today = new Date();
    return matchDate.toDateString() !== today.toDateString();
  }).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-800 rounded-lg p-8 mb-12 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <Zap className="w-8 h-8 text-yellow-300" />
            <h2 className="text-3xl font-bold text-white">Süper Lig Maç Tahminleri</h2>
          </div>
          <p className="text-gray-100 max-w-2xl">
            Gelişmiş form analizi ve istatistiksel modellemele ile en doğru maç tahminlerini alın.
            Takım formunuzu analiz edin, tahminleri görün ve bilinçli kararlar alın.
          </p>
        </div>

        {/* Today's Matches */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-sky-400" />
            <h3 className="text-2xl font-bold text-white">Bugünün Maçları</h3>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : todayMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => console.log('View match details:', match)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-12 h-12" />}
              title="Bugün maç yok"
              description="Bugün için programlanmış maç bulunmuyor."
            />
          )}
        </section>

        {/* Upcoming Matches */}
        <section>
          <h3 className="text-2xl font-bold text-white mb-6">Yaklaşan Maçlar</h3>

          {upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => console.log('View match details:', match)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Maç yok"
              description="Yaklaşan maç bulunmuyor."
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
