import { useUpcomingMatches } from '@/hooks';
import { Header, LoadingSpinner, EmptyState, ErrorMessage } from '@/components/Layout';
import { MatchCard } from '@/components/MatchComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

function HomePage() {
  const { matches, loading, error } = useUpcomingMatches();

  const todayMatches = matches.filter(m => {
    const matchDate = new Date(m.date);
    const today = new Date();
    return matchDate.toDateString() === today.toDateString();
  });

  const upcomingMatches = matches
    .filter(m => {
      const matchDate = new Date(m.date);
      const today = new Date();
      return matchDate.toDateString() !== today.toDateString();
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="site-container py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl sm:text-3xl">Süper Lig Maç Tahminleri</CardTitle>
                  <CardDescription className="mt-1 text-primary-foreground/90">
                    Form analizi ve istatistiksel modelleme ile tahminler
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="max-w-2xl text-sm text-primary-foreground/90">
                Takım formunu analiz edin, tahminleri görün ve bilinçli kararlar alın.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Bugünün Maçları</h2>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : todayMatches.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {todayMatches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MatchCard
                    match={match}
                    onClick={() => console.log('View match details:', match)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="Bugün maç yok"
              description="Bugün için programlanmış maç bulunmuyor."
            />
          )}
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold text-foreground">Yaklaşan Maçlar</h2>
          {upcomingMatches.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {upcomingMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => console.log('View match details:', match)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Maç yok" description="Yaklaşan maç bulunmuyor." />
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
