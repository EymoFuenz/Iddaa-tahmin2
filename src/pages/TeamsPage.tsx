/**
 * Teams Page
 * Yıl sekmeli Süper Lig takımları, Firebase'den veri; güncelleme tetikleme ile API çekimi
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeasons, useSeasonData, useFetchSeason } from '@/hooks';
import { Header, LoadingSpinner, ErrorMessage } from '@/components/Layout';
import { TeamCard } from '@/components/TeamComponents';
import { AddTeamForm } from '@/components/AddTeamForm';
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

  const effectiveSeason = selectedSeason ?? (seasons[0] ?? undefined);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="container py-8 px-4 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="relative rounded-2xl bg-gradient-to-r from-sky-600/90 via-blue-600/90 to-indigo-600/90 p-8 mb-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnoiLz48L2g+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Süper Lig Takımları
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </h1>
                <p className="text-sky-100/90 mt-1">
                  Sezon bazlı takım listesi · Veriler Firebase'de saklanır
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowUpdatePanel(!showUpdatePanel)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition border border-white/20"
              >
                <RefreshCw className={`w-5 h-5 ${fetchLoading ? 'animate-spin' : ''}`} />
                Verileri Güncelle
              </button>
              <button
                onClick={() => setShowAddTeamForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-white font-medium transition"
              >
                <Plus className="w-5 h-5" />
                Takım Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Güncelle paneli */}
        {showUpdatePanel && (
          <div className="mb-8 p-6 rounded-2xl bg-slate-800/80 border border-slate-600/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-sky-400" />
              <h2 className="text-xl font-bold text-white">Yıl Seçerek Veri Çek</h2>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Hangi sezonun Süper Lig takımlarını ve maçlarını API'den çekip Firebase'e kaydetmek istiyorsunuz?
              İlk girişte veya güncellemek istediğinizde buradan tetikleyin.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  min={MIN_YEAR}
                  max={CURRENT_YEAR + 1}
                  value={updateYear}
                  onChange={e => setUpdateYear(parseInt(e.target.value, 10) || CURRENT_YEAR)}
                  className="w-28 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white font-semibold text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <span className="text-slate-400 text-sm">yılı</span>
              </div>
              <button
                onClick={handleFetchSeason}
                disabled={fetchLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium transition"
              >
                {fetchLoading ? 'Çekiliyor...' : 'Bu yılın verilerini çek'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {fetchError && (
              <div className="mt-4">
                <ErrorMessage message={fetchError} />
              </div>
            )}
          </div>
        )}

        {seasonsError && (
          <div className="mb-6">
            <ErrorMessage message={seasonsError} />
          </div>
        )}

        {/* Sezon yoksa davet */}
        {!seasonsLoading && seasons.length === 0 && !showUpdatePanel && (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-600/50 p-10 text-center">
            <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Henüz sezon verisi yok</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Süper Lig takımlarını ve maçlarını görmek için önce &quot;Verileri Güncelle&quot; butonuna tıklayıp
              bir yıl seçerek API'den veri çekin. Veriler Firebase'e kaydedilir.
            </p>
            <button
              onClick={() => setShowUpdatePanel(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Verileri Güncelle
            </button>
          </div>
        )}

        {/* Yıl sekmeleri */}
        {seasons.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {seasons.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedSeason(year)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                    effectiveSeason === year
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {year}–{String(year + 1).slice(-2)}
                </button>
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
                {/* Özet */}
                {fetchedAt && (
                  <p className="text-slate-400 text-sm mb-6">
                    Son güncelleme: {new Date(fetchedAt).toLocaleDateString('tr-TR')} ·{' '}
                    {displayMatchesCount} maç
                  </p>
                )}

                {/* Takım kartları grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayTeams
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(team => (
                      <Link
                        key={team.id}
                        to={`/teams/${effectiveSeason}/${team.id}`}
                        className="block"
                      >
                        <TeamCard team={team} />
                      </Link>
                    ))}
                </div>
                {displayTeams.length === 0 && effectiveSeason && (
                  <p className="text-slate-400 text-center py-12">
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
