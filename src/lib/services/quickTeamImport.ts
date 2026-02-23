/**
 * Quick Team Import Service
 * Automatically fetches team data with recent matches from API-Football
 * Simplifies the team addition process - no manual match entry needed
 */

import { footballAPI } from '@/lib/api/footballAPI';
import { Team, RecentMatch, Match } from '@/types';
import { addTeam, updateTeam } from '@/lib/firebase';

/**
 * Convert API Football match to RecentMatch format
 */
function convertMatchToRecentMatch(match: Match, teamId: number): RecentMatch {
  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
  const goals = isHome ? match.homeGoals : match.awayGoals;
  const conceded = isHome ? match.awayGoals : match.homeGoals;
  
  let result: 'W' | 'D' | 'L';
  if (goals > conceded) result = 'W';
  else if (goals === conceded) result = 'D';
  else result = 'L';

  return {
    date: match.date.split('T')[0],
    opponent,
    result,
    score: isHome ? `${match.homeGoals}-${match.awayGoals}` : `${match.awayGoals}-${match.homeGoals}`,
    homeAway: isHome ? 'H' : 'A',
  };
}

/**
 * Quick import team with auto-fetched recent matches
 */
export async function quickImportTeam(
  teamData: {
    apiId: number;
    name: string;
    code: string;
    logo: string;
    founded: number;
    country: string;
    marketValue?: number;
  },
  matchCount: number = 10
): Promise<string> {
  try {
    // Validate API ID
    if (!teamData.apiId || teamData.apiId <= 0) {
      throw new Error(`Geçersiz Takım ID: ${teamData.apiId}`);
    }

    console.log(`Adding team: ${teamData.name} (ID: ${teamData.apiId})`);

    // Try to fetch matches, but don't fail if API doesn't work
    let recentMatches: RecentMatch[] = [];
    try {
      console.log(`Attempting to fetch ${matchCount} recent matches...`);
      const matches = await footballAPI.getTeamMatches(teamData.apiId, matchCount);
      
      if (matches && matches.length > 0) {
        recentMatches = matches.map(match => 
          convertMatchToRecentMatch(match, teamData.apiId)
        );
        console.log(`✓ Successfully fetched ${recentMatches.length} matches`);
      }
    } catch (apiError) {
      console.warn(`⚠ Could not fetch matches (API may be down):`, apiError instanceof Error ? apiError.message : apiError);
      console.warn('Proceeding without recent matches...');
    }

    // Create team with or without matches
    const completeTeam: Omit<Team, 'id'> = {
      ...teamData,
      recentMatches: recentMatches.length > 0 ? recentMatches : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Adding team to Firebase...');
    const docId = await addTeam(completeTeam);
    console.log(`✓ Team added: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Team import error:', error);
    throw error;
  }
}

/**
 * Fetch and update recent matches for existing team
 */
export async function updateTeamMatches(
  firebaseTeamId: string,
  apiTeamId: number,
  matchCount: number = 10
): Promise<void> {
  try {
    const matches = await footballAPI.getTeamMatches(apiTeamId, matchCount);
    const recentMatches = matches.map(m => convertMatchToRecentMatch(m, apiTeamId));
    
    await updateTeam(firebaseTeamId, {
      recentMatches: recentMatches.length > 0 ? recentMatches : [],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating team matches:', error);
    throw error;
  }
}

/**
 * Bulk add teams with their matches
 */
export async function bulkImportTeams(
  teams: Array<{
    apiId: number;
    name: string;
    code: string;
    logo: string;
    founded: number;
    country: string;
    marketValue?: number;
  }>
): Promise<Array<{ teamName: string; status: 'success' | 'error'; docId?: string; error?: string }>> {
  const results: Array<{ teamName: string; status: 'success' | 'error'; docId?: string; error?: string }> = [];

  for (const team of teams) {
    try {
      const docId = await quickImportTeam(team, 10);
      results.push({
        teamName: team.name,
        status: 'success',
        docId,
      });
    } catch (error) {
      results.push({
        teamName: team.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
    }
  }

  return results;
}

