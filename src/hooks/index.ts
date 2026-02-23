/**
 * Custom Hooks
 */

import { useState, useEffect } from 'react';
import { footballAPI } from '@/lib/api/footballAPI';
import { Team, Match, TeamFormData, MatchPrediction } from '@/types';
import { predictMatch } from '@/lib/algorithms/predictionEngine';
import { getTeams as getFirestoreTeams } from '@/lib/firebase';

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
 * Hook to fetch team matches
 */
export function useTeamMatches(teamId?: number) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await footballAPI.getTeamMatches(teamId, 10);
        setMatches(data);
      } catch (err) {
        setError('Failed to fetch matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
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
 * Hook to predict match
 */
export function useMatchPrediction(homeTeamId?: number, awayTeamId?: number) {
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formData: homeFormData } = useTeamForm(homeTeamId);
  const { formData: awayFormData } = useTeamForm(awayTeamId);
  const { teams } = useTeams();

  useEffect(() => {
    if (
      !homeTeamId ||
      !awayTeamId ||
      !homeFormData ||
      !awayFormData ||
      teams.length === 0
    ) {
      setPrediction(null);
      setLoading(false);
      return;
    }

    try {
      const homeTeam = teams.find(t => t.id === homeTeamId);
      const awayTeam = teams.find(t => t.id === awayTeamId);

      if (!homeTeam || !awayTeam) {
        setError('Teams not found');
        setLoading(false);
        return;
      }

      const pred = predictMatch({
        homeTeamForm: homeFormData,
        awayTeamForm: awayFormData,
        homeTeamId,
        awayTeamId,
        homeTeamName: homeTeam.name,
        awayTeamName: awayTeam.name,
      });

      setPrediction(pred);
      setError(null);
    } catch (err) {
      setError('Failed to predict match');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [homeTeamId, awayTeamId, homeFormData, awayFormData, teams]);

  return { prediction, loading, error };
}
