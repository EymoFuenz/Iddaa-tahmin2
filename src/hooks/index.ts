/**
 * Custom Hooks
 */

import { useState, useEffect } from 'react';
import { footballAPI } from '@/lib/api/footballAPI';
import { Team, Match, TeamFormData, MatchPrediction } from '@/types';
import { predictMatch } from '@/lib/algorithms/predictionEngine';
import {
  getTeams as getFirestoreTeams,
  getSeasonsList,
  getSeasonData,
  saveSeasonData,
  getTeamSeasonData,
  getUserProfile,
  setUserProfile,
  type UserProfile,
} from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { teamSeasonDataToFormData } from '@/lib/utils/seasonForm';

/**
 * Hook to fetch teams from both API (Süper Lig) and Firestore (custom teams)
 * Combines teams from both sources
 */
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Fetch Süper Lig teams from API
        const apiTeams = await footballAPI.getSuperLigTeams();
        
        // Fetch custom teams from Firestore
        let firestoreTeams: Team[] = [];
        try {
          firestoreTeams = await getFirestoreTeams();
        } catch (err) {
          console.warn('Could not fetch Firestore teams:', err);
        }

        // Combine teams, avoiding duplicates (by ID)
        const allTeams = [...apiTeams];
        const apiTeamIds = new Set(apiTeams.map(t => t.id));
        
        firestoreTeams.forEach(team => {
          if (!apiTeamIds.has(team.id)) {
            allTeams.push(team);
          }
        });

        // Sort by name
        allTeams.sort((a, b) => a.name.localeCompare(b.name));
        
        setTeams(allTeams);
        setError(null);
      } catch (err) {
        setError('Failed to fetch teams');
        console.error(err);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return { teams, loading, error };
}

/**
 * Firebase'de kayıtlı sezon listesi (yıl bazlı tab için). Sayfa açılışında API isteği atılmaz.
 */
export function useSeasons() {
  const [seasons, setSeasons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getSeasonsList();
      setSeasons(list);
    } catch (err) {
      setError('Sezonlar yüklenemedi');
      console.error(err);
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { seasons, loading, error, refetch };
}

/**
 * Seçilen sezona ait takım + maç verisi (Firebase'den). API isteği yok.
 */
export function useSeasonData(season: number | undefined) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (season == null) {
      setTeams([]);
      setMatches([]);
      setFetchedAt(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSeasonData(season)
      .then(data => {
        if (cancelled) return;
        if (data) {
          setTeams(data.teams);
          setMatches(data.matches);
          setFetchedAt(data.fetchedAt);
        } else {
          setTeams([]);
          setMatches([]);
          setFetchedAt(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError('Sezon verisi yüklenemedi');
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [season]);

  return { teams, matches, fetchedAt, loading, error };
}

/**
 * Belirtilen yıl için API'den Süper Lig takımları + maçları çekip Firebase'e kaydeder.
 */
export function useFetchSeason() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeason = async (
    year: number,
    onSuccess?: (teams: Team[], matches: Match[]) => void
  ) => {
    setError(null);
    setLoading(true);
    try {
      const [teams, matches] = await Promise.all([
        footballAPI.getSuperLigTeams(year),
        footballAPI.getLeagueFixtures(year),
      ]);
      await saveSeasonData(year, { teams, matches });
      onSuccess?.(teams, matches);
    } catch (err) {
      setError('Veri çekilemedi. API anahtarını ve yılı kontrol edin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { fetchSeason, loading, error };
}

/**
 * Takım detay sayfası: sezon + takım verisi (Firebase teamSeasonData)
 */
export function useTeamSeasonData(season: number | undefined, teamId: number | undefined) {
  const [data, setData] = useState<{
    team: Team;
    matches: Match[];
    fetchedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (season == null || teamId == null) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getTeamSeasonData(season, teamId),
      getSeasonData(season),
    ]).then(([teamSeason, seasonData]) => {
      if (cancelled) return;
      if (teamSeason) {
        setData({
          team: teamSeason.team,
          matches: teamSeason.matches,
          fetchedAt: teamSeason.fetchedAt,
        });
        return;
      }
      if (seasonData) {
        const team = seasonData.teams.find(t => t.id === teamId);
        const teamMatches = (seasonData.matches ?? []).filter(
          m => m.homeTeam.id === teamId || m.awayTeam.id === teamId
        );
        if (team) {
          setData({
            team,
            matches: teamMatches,
            fetchedAt: seasonData.fetchedAt ?? '',
          });
          return;
        }
      }
      setData(null);
    })
      .catch(err => {
        if (!cancelled) setError('Takım verisi yüklenemedi');
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [season, teamId]);

  return { data, loading, error };
}

/**
 * Hook to fetch team matches
 */
export function useTeamMatches(teamId?: number) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setMatches([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await footballAPI.getTeamMatches(teamId, 10);
        if (!cancelled) setMatches(data ?? []);
      } catch (err) {
        if (!cancelled) {
          setMatches([]);
          setError('Maçlar yüklenemedi');
        }
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMatches();
    return () => { cancelled = true; };
  }, [teamId]);

  return { matches, loading, error };
}

/**
 * Hook to fetch upcoming matches
 */
export function useUpcomingMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const data = await footballAPI.getUpcomingMatches(7);
      setMatches(data);
    } catch (err) {
      setError('Failed to fetch upcoming matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return { matches, loading, error, refetch: fetchMatches };
}

/**
 * Hook to fetch league standings
 */
export function useLeagueStandings() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const data = await footballAPI.getLeagueStandings();
        setStandings(data);
      } catch (err) {
        setError('Failed to fetch standings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  return { standings, loading, error };
}

/**
 * Hook to fetch team form data
 */
export function useTeamForm(teamId?: number) {
  const [formData, setFormData] = useState<TeamFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const { matches } = useTeamMatches(teamId);

  useEffect(() => {
    if (!matches || matches.length === 0 || !teamId) {
      setFormData(null);
      return;
    }

    // Process matches to extract form data
    const homeMatches = matches.filter(m => m.homeTeam.id === teamId);
    const awayMatches = matches.filter(m => m.awayTeam.id === teamId);

    const wins = matches.filter(m => {
      const isHome = m.homeTeam.id === teamId;
      return isHome ? m.homeGoals > m.awayGoals : m.awayGoals > m.homeGoals;
    }).length;

    const draws = matches.filter(m => m.homeGoals === m.awayGoals).length;
    const losses = matches.length - wins - draws;

    const goalsScored = matches.reduce((sum, m) => {
      return sum + (m.homeTeam.id === teamId ? m.homeGoals : m.awayGoals);
    }, 0);

    const goalsConceded = matches.reduce((sum, m) => {
      return sum + (m.homeTeam.id === teamId ? m.awayGoals : m.homeGoals);
    }, 0);

    // Estimate shots on target (based on goals, typically 2-3 per goal)
    const shotsOnTarget = goalsScored * 2.5;
    const possession = 50; // Would need API data for actual possession

    setFormData({
      teamId,
      lastMatches: matches,
      homeForm: homeMatches,
      awayForm: awayMatches,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      shotsOnTarget,
      possession,
      corners: 0, // Would need API data
    });

    setLoading(false);
  }, [matches, teamId]);

  return { formData, loading };
}

/**
 * Hook to predict match (otomatik değil, sadece analyze() çağrılınca tahmin yapar; DB'ye kaydetmez)
 */
export function useAnalyzeMatch(homeTeamId?: number, awayTeamId?: number) {
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { formData: homeFormData } = useTeamForm(homeTeamId);
  const { formData: awayFormData } = useTeamForm(awayTeamId);
  const { teams } = useTeams();

  const minimalFormData = (teamId: number, _teamName: string): TeamFormData => ({
    teamId,
    lastMatches: [],
    homeForm: [],
    awayForm: [],
    wins: 0,
    draws: 0,
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0,
    shotsOnTarget: 0,
    possession: 50,
    corners: 0,
  });

  const analyze = async () => {
    if (!homeTeamId || !awayTeamId || teams.length === 0) {
      setError('Lütfen ev sahibi ve deplasman takımı seçin.');
      return;
    }
    const homeTeam = teams.find(t => t.id === homeTeamId);
    const awayTeam = teams.find(t => t.id === awayTeamId);
    if (!homeTeam || !awayTeam) {
      setError('Takımlar bulunamadı.');
      return;
    }
    if (homeTeamId === awayTeamId) {
      setError('Farklı iki takım seçin.');
      return;
    }

    setError(null);
    setPrediction(null);
    setAnalyzing(true);

    try {
      const seasons = await getSeasonsList();
      const season = seasons.length > 0 ? seasons[0] : undefined;

      let homeForm: TeamFormData;
      let awayForm: TeamFormData;
      let headToHeadMatches: Match[] = [];

      if (season) {
        const [homeSeasonData, awaySeasonData, seasonData] = await Promise.all([
          getTeamSeasonData(season, homeTeamId),
          getTeamSeasonData(season, awayTeamId),
          getSeasonData(season),
        ]);
        if (homeSeasonData && awaySeasonData && homeSeasonData.matches.length > 0 && awaySeasonData.matches.length > 0) {
          homeForm = teamSeasonDataToFormData(homeSeasonData);
          awayForm = teamSeasonDataToFormData(awaySeasonData);
        } else {
          homeForm = homeFormData ?? minimalFormData(homeTeamId, homeTeam.name);
          awayForm = awayFormData ?? minimalFormData(awayTeamId, awayTeam.name);
        }
        // Aynı sezonda iki takımın karşılıklı maçları (2024 vb.)
        if (seasonData?.matches?.length) {
          headToHeadMatches = seasonData.matches.filter(
            m => (Number(m.homeTeam?.id) === homeTeamId && Number(m.awayTeam?.id) === awayTeamId) ||
                 (Number(m.homeTeam?.id) === awayTeamId && Number(m.awayTeam?.id) === homeTeamId)
          );
        }
      } else {
        homeForm = homeFormData ?? minimalFormData(homeTeamId, homeTeam.name);
        awayForm = awayFormData ?? minimalFormData(awayTeamId, awayTeam.name);
      }

      const pred = predictMatch({
        homeTeamForm: homeForm,
        awayTeamForm: awayForm,
        homeTeamId,
        awayTeamId,
        homeTeamName: homeTeam.name,
        awayTeamName: awayTeam.name,
        homeTeamMarketValue: homeTeam.marketValue,
        awayTeamMarketValue: awayTeam.marketValue,
        headToHeadMatches: headToHeadMatches.length > 0 ? headToHeadMatches : undefined,
      });
      setPrediction(pred);
    } catch (err) {
      setError('Tahmin hesaplanamadı.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyze, prediction, analyzing, error };
}

/** Kullanıcı profil verisi (Firestore users/{uid}: displayName, photoBase64) */
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getUserProfile(user.uid).then(p => {
      if (!cancelled) setProfile(p);
    }).catch(() => {
      if (!cancelled) setProfile(null);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.uid]);

  const updateProfile = async (data: { displayName?: string; photoBase64?: string | null }) => {
    if (!user?.uid) return;
    await setUserProfile(user.uid, data);
    await refetch();
  };

  return { profile, loading, updateProfile, refetch };
}

/** @deprecated Otomatik tahmin için; yeni akışta useAnalyzeMatch kullanın */
export function useMatchPrediction(homeTeamId?: number, awayTeamId?: number) {
  const { prediction, analyzing, error } = useAnalyzeMatch(homeTeamId, awayTeamId);
  return { prediction, loading: analyzing, error };
}
