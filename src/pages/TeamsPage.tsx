import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeasons, useSeasonData, useFetchSeason } from '@/hooks';
import { Header, LoadingSpinner, ErrorMessage } from '@/components/Layout';
import { TeamCard } from '@/components/TeamComponents';
import { AddTeamForm } from '@/components/AddTeamForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  RefreshCw,
  Calendar,
  ChevronRight,
  Download,
  Plus,
  Sparkles,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2015;

export function TeamsPage() {
  const { seasons, loading: seasonsLoading, error: seasonsError, refetch: refetchSeasons } = useSeasons();
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const { teams, matches, fetchedAt, loading: dataLoading, error: dataError } = useSeasonData(
    selectedSeason ?? (seasons.length > 0 ? seasons[0] : undefined)
  );
  const { fetchSeason, loading: fetchLoading, error: fetchError } = useFetchSeason();

  const [updateYear, setUpdateYear] = useState(CURRENT_YEAR);
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);

  const effectiveSeason = selectedSeason ?? seasons[0] ?? undefined;
  const displayTeams = effectiveSeason ? teams : [];
  const displayMatchesCount = effectiveSeason ? matches.length : 0;

  const handleFetchSeason = async () => {
    const year = Math.min(Math.max(updateYear, MIN_YEAR), CURRENT_YEAR + 1);
    setUpdateYear(year);
    await fetchSeason(year, () => {
      refetchSeasons();
      setSelectedSeason(year);
      setShowUpdatePanel(false);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="site-container py-8">
        <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur">
                  <Users className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                    Süper Lig Takımları
                    <Sparkles className="h-7 w-7 text-amber-200" />
                  </h1>
                  <p className="mt-1 text-primary-foreground/90">
                    Sezon bazlı takım listesi · Veriler Firebase'de saklanır
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  className="gap-2 bg-white/15 text-primary-foreground hover:bg-white/25 border-0"
                  onClick={() => setShowUpdatePanel(!showUpdatePanel)}
                >
                  <RefreshCw className={`h-5 w-5 ${fetchLoading ? 'animate-spin' : ''}`} />
                  Verileri Güncelle
                </Button>
                <Button
                  className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() => setShowAddTeamForm(true)}
                >
                  <Plus className="h-5 w-5" />
                  Takım Ekle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showUpdatePanel && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="h-6 w-6 text-primary" />
                <CardTitle>Yıl Seçerek Veri Çek</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Hangi sezonun Süper Lig takımlarını ve maçlarını API'den çekip Firebase'e kaydetmek istiyorsunuz?
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="number"
                  min={MIN_YEAR}
                  max={CURRENT_YEAR + 1}
                  value={updateYear}
                  onChange={e => setUpdateYear(parseInt(e.target.value, 10) || CURRENT_YEAR)}
                  className="w-28 text-center font-semibold"
                />
                <span className="text-sm text-muted-foreground">yılı</span>
              </div>
              <Button onClick={handleFetchSeason} disabled={fetchLoading} className="gap-2">
                {fetchLoading ? 'Çekiliyor...' : 'Bu yılın verilerini çek'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
            {fetchError && (
              <CardContent className="pt-0">
                <ErrorMessage message={fetchError} />
              </CardContent>
            )}
          </Card>
        )}

        {seasonsError && (
          <div className="mb-6">
            <ErrorMessage message={seasonsError} />
          </div>
        )}

        {!seasonsLoading && seasons.length === 0 && !showUpdatePanel && (
          <Card className="py-10 text-center">
            <CardContent>
              <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">Henüz sezon verisi yok</h3>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Süper Lig takımlarını ve maçlarını görmek için önce &quot;Verileri Güncelle&quot; butonuna tıklayıp
                bir yıl seçerek API'den veri çekin.
              </p>
              <Button onClick={() => setShowUpdatePanel(true)} className="gap-2">
                <RefreshCw className="h-5 w-5" />
                Verileri Güncelle
              </Button>
            </CardContent>
          </Card>
        )}

        {seasons.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {seasons.map(year => (
                <Button
                  key={year}
                  variant={effectiveSeason === year ? 'default' : 'outline'}
                  onClick={() => setSelectedSeason(year)}
                  className={effectiveSeason === year ? 'shadow-lg shadow-primary/25' : ''}
                >
                  {year}–{String(year + 1).slice(-2)}
                </Button>
              ))}
            </div>

            {dataError && (
              <div className="mb-6">
                <ErrorMessage message={dataError} />
              </div>
            )}

            {dataLoading ? (
              <LoadingSpinner />
            ) : (
              <div>
                {fetchedAt && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    Son güncelleme: {new Date(fetchedAt).toLocaleDateString('tr-TR')} · {displayMatchesCount} maç
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {displayTeams
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(team => (
                      <Link key={team.id} to={`/teams/${effectiveSeason}/${team.id}`} className="block">
                        <TeamCard team={team} />
                      </Link>
                    ))}
                </div>
                {displayTeams.length === 0 && effectiveSeason && (
                  <p className="py-12 text-center text-muted-foreground">
                    Bu sezona ait takım verisi bulunamadı. Verileri güncelleyip tekrar deneyin.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {showAddTeamForm && (
          <AddTeamForm
            onAddTeam={() => {
              setShowAddTeamForm(false);
              refetchSeasons();
            }}
            onClose={() => setShowAddTeamForm(false)}
          />
        )}
      </main>
    </div>
  );
}

export default TeamsPage;
