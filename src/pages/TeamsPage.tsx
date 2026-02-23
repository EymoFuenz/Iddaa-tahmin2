/**
 * Teams Page
 * Display all teams with their form and statistics
 */

import { useState } from 'react';
import { useTeams, useLeagueStandings, useTeamForm } from '@/hooks';
import { Header, LoadingSpinner, ErrorMessage } from '@/components/Layout';
import { TeamFormDisplay, StandingRow } from '@/components/TeamComponents';
import { AddTeamForm } from '@/components/AddTeamForm';
import { Users, TrendingUp, Plus } from 'lucide-react';

export function TeamsPage() {
  const { teams, loading: teamsLoading, error: teamsError } = useTeams();
  const { standings, loading: standingsLoading, error: standingsError } = useLeagueStandings();
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>();
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const { formData } = useTeamForm(selectedTeamId);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  const handleAddTeam = async () => {
    // Form handles everything, just close it
    setShowAddTeamForm(false);
    // Refresh teams list
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-sky-400" />
            <h1 className="text-3xl font-bold text-white">Süper Lig Takımları</h1>
          </div>
          <button
            onClick={() => setShowAddTeamForm(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition"
          >
            <Plus size={20} /> Yeni Takım Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teams Grid */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">Takım Listesi</h2>
            
            {teamsLoading ? (
              <LoadingSpinner />
            ) : teamsError ? (
              <ErrorMessage message={teamsError} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {teams.map(team => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedTeamId === team.id
                        ? 'bg-sky-600 ring-2 ring-sky-400'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <img src={team.logo} alt={team.name} className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium text-white">{team.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam && formData ? (
              <TeamFormDisplay
                teamName={selectedTeam.name}
                teamLogo={selectedTeam.logo}
                formRating={{
                  teamId: selectedTeam.id,
                  teamName: selectedTeam.name,
                  formIndex: 75,
                  attackStrength: 68,
                  defenseRating: 72,
                  momentum: 15,
                  homeAdvantage: 12,
                  winProbability: 65,
                  form: 'WWDLW',
                }}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <p className="text-gray-400">Detayları görmek için bir takım seçin</p>
              </div>
            )}
          </div>
        </div>

        {/* League Standings */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-bold text-white">Puan Durumu</h2>
          </div>

          {standingsLoading ? (
            <LoadingSpinner />
          ) : standingsError ? (
            <ErrorMessage message={standingsError} />
          ) : (
            <div className="space-y-2">
              {standings.map((standing: any, idx: number) => {
                const team = teams.find(t => t.id === standing.team.id);
                return team ? (
                  <StandingRow
                    key={standing.team.id}
                    position={idx + 1}
                    team={team}
                    points={standing.points}
                    played={standing.all.played}
                    wins={standing.all.win}
                    draws={standing.all.draw}
                    losses={standing.all.lose}
                    goalsFor={standing.all.goals.for}
                    goalsAgainst={standing.all.goals.against}
                    onClick={() => setSelectedTeamId(team.id)}
                  />
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Add Team Modal */}
        {showAddTeamForm && (
          <AddTeamForm
            onAddTeam={handleAddTeam}
            onClose={() => setShowAddTeamForm(false)}
          />
        )}
      </main>
    </div>
  );
}

export default TeamsPage;
