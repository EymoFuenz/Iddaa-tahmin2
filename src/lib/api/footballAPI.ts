/**
 * Football API Service
 * Integration with API-Football (RapidAPI)
 * Handles all team, match, and statistics data fetching
 */

import axios, { AxiosInstance } from 'axios';
import { Team, Match, FootballAPITeam, FootballAPIMatch } from '@/types';

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const API_BASE_URL = 'https://api-football-v3.p.rapidapi.com';
const SUPER_LIG_ID = 203; // Süper Lig league ID in API-Football
const SUPER_LIG_SEASON = 2024;

interface APIResponse<T> {
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

class FootballAPIService {
  private apiClient: AxiosInstance;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_DELAY = 4000; // 4 seconds between requests
  private readonly CACHE_TTL = 600000; // Cache for 10 minutes
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 3000; // Start with 3 seconds
  private requestQueue: Promise<any> = Promise.resolve();

  constructor() {
    if (!API_KEY) {
      console.error('❌ CRITICAL: VITE_FOOTBALL_API_KEY not found in .env!');
    } else {
      console.log(`✓ API Key loaded: ${API_KEY.substring(0, 8)}...`);
    }

    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v3.p.rapidapi.com',
      },
      timeout: 30000,
    });
  }

  /**
   * Wait before making next request to avoid rate limiting
   */
  private async waitForRateLimit(): Promise<void> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
      const waitTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;
      console.log(`Waiting ${waitTime}ms before next API request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Enqueue request to ensure sequential execution
   */
  private async enqueueRequest<T>(
    endpoint: string,
    params: any,
    retryCount: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue
        .then(() => this.executeRequest<T>(endpoint, params, retryCount))
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Make API request with retry logic for rate limiting
   */
  private async executeRequest<T>(
    endpoint: string,
    params: any,
    retryCount: number = 0
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`✓ Cache hit for ${endpoint}`);
      return cached.data;
    }

    try {
      await this.waitForRateLimit();
      const response = await this.apiClient.get<T>(endpoint, { params });
      
      // Cache successful response
      this.requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      
      console.log(`✓ API request successful: ${endpoint}`);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;

      // Handle rate limiting (429)
      if (status === 429 && retryCount < this.MAX_RETRIES) {
        const waitTime = this.RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`⚠ Rate limited (429). Retry ${retryCount + 1}/${this.MAX_RETRIES} in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.executeRequest<T>(endpoint, params, retryCount + 1);
      }

      // Handle authentication errors (401/403)
      if (status === 401 || status === 403) {
        console.error(`❌ AUTH ERROR (${status}): Check API key in .env`);
      }

      // Handle not found (404)
      if (status === 404) {
        console.error(`❌ 404 NOT FOUND: ${endpoint} - Endpoint/params invalid`);
      }

      console.error(`✗ API error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Public method to make API requests (uses queue)
   */
  private async makeRequest<T>(endpoint: string, params: any): Promise<T> {
    return this.enqueueRequest<T>(endpoint, params);
  }

  /**
   * Get all active teams in Süper Lig
   */
  async getSuperLigTeams(): Promise<Team[]> {
    try {
      const response = await this.makeRequest<APIResponse<FootballAPITeam>>(`/teams`, {
        league: SUPER_LIG_ID,
        season: SUPER_LIG_SEASON,
      });

      return response.response.map((teamData: FootballAPITeam) => ({
        id: teamData.team.id,
        name: teamData.team.name,
        logo: teamData.team.logo || '',
        code: teamData.team.code || '',
        founded: teamData.team.founded || 0,
        country: teamData.team.country || 'Turkey',
      }));
    } catch (error) {
      console.error('Error fetching Super Lig teams:', error);
      throw error;
    }
  }

  /**
   * Get last N matches for a team
   * Tries with Süper Lig parameters first, then without if that fails
   */
  async getTeamMatches(teamId: number, limit: number = 10): Promise<Match[]> {
    try {
      // First try with Süper Lig parameters
      try {
        const response = await this.makeRequest<APIResponse<FootballAPIMatch>>(`/fixtures`, {
          team: teamId,
          league: SUPER_LIG_ID,
          season: SUPER_LIG_SEASON,
          last: limit,
        });

        if (response.response && response.response.length > 0) {
          return this.formatMatches(response.response, teamId);
        }
      } catch (leagueError) {
        console.warn(`Süper Lig params failed for team ${teamId}, trying without league filter...`, leagueError);
      }

      // If Süper Lig search fails, try without league/season parameters
      const response = await this.makeRequest<APIResponse<FootballAPIMatch>>(`/fixtures`, {
        team: teamId,
        last: limit,
      });

      if (!response.response || response.response.length === 0) {
        throw new Error(`No matches found for team ID ${teamId}`);
      }

      return this.formatMatches(response.response, teamId);
    } catch (error) {
      console.error(`Error fetching matches for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Helper function to format matches
   */
  private formatMatches(matchData: FootballAPIMatch[], teamId: number): Match[] {
    return matchData.map((data: FootballAPIMatch) => ({
      id: data.fixture.id,
      homeTeam: {
        id: data.teams.home.id,
        name: data.teams.home.name,
        logo: data.teams.home.logo,
        code: '',
        founded: 0,
        country: data.teams.home.country || 'Turkey',
      },
      awayTeam: {
        id: data.teams.away.id,
        name: data.teams.away.name,
        logo: data.teams.away.logo,
        code: '',
        founded: 0,
        country: data.teams.away.country || 'Turkey',
      },
      date: data.fixture.date,
      status: this.normalizeStatus(data.fixture.status),
      homeGoals: data.goals.home,
      awayGoals: data.goals.away,
      league: data.league.name || 'Unknown',
      season: data.league.season,
      round: parseInt(data.league.round?.replace(/\D/g, '') || '0'),
      venue: data.venue?.name || '',
    }));
  }

  /**
   * Get fixture statistics
   */
  async getMatchStatistics(fixtureId: number): Promise<{ home: any; away: any }> {
    try {
      const response = await this.makeRequest<APIResponse<any>>(`/fixtures/statistics`, {
        fixture: fixtureId,
      });

      const stats = response.response;

      return {
        home: stats[0] || {},
        away: stats[1] || {},
      };
    } catch (error) {
      console.error(`Error fetching statistics for fixture ${fixtureId}:`, error);
      return { home: {}, away: {} };
    }
  }

  /**
   * Get upcoming matches for Süper Lig
   */
  async getUpcomingMatches(days: number = 7): Promise<Match[]> {
    try {
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + days);

      const response = await this.makeRequest<APIResponse<FootballAPIMatch>>(`/fixtures`, {
        league: SUPER_LIG_ID,
        season: SUPER_LIG_SEASON,
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      });

      return response.response.map((matchData: FootballAPIMatch) => ({
        id: matchData.fixture.id,
        homeTeam: {
          id: matchData.teams.home.id,
          name: matchData.teams.home.name,
          logo: matchData.teams.home.logo,
          code: '',
          founded: 0,
          country: 'Turkey',
        },
        awayTeam: {
          id: matchData.teams.away.id,
          name: matchData.teams.away.name,
          logo: matchData.teams.away.logo,
          code: '',
          founded: 0,
          country: 'Turkey',
        },
        date: matchData.fixture.date,
        status: 'scheduled',
        homeGoals: matchData.goals.home || 0,
        awayGoals: matchData.goals.away || 0,
        league: 'Süper Lig',
        season: matchData.league.season,
        round: parseInt(matchData.league.round?.replace(/\D/g, '') || '0'),
        venue: matchData.venue?.name || '',
      }));
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      throw error;
    }
  }

  /**
   * Get league standings
   */
  async getLeagueStandings(): Promise<any> {
    try {
      const response = await this.makeRequest<APIResponse<any>>(`/standings`, {
        league: SUPER_LIG_ID,
        season: SUPER_LIG_SEASON,
      });

      return response.response[0]?.standings[0] || [];
    } catch (error) {
      console.error('Error fetching league standings:', error);
      throw error;
    }
  }

  /**
   * Get head-to-head matches between two teams
   */
  async getHeadToHead(teamId1: number, teamId2: number, limit: number = 5): Promise<Match[]> {
    try {
      const response = await this.makeRequest<APIResponse<FootballAPIMatch>>(`/fixtures/headtohead`, {
        h2h: `${teamId1}-${teamId2}`,
        last: limit,
      });

      return response.response.map((matchData: FootballAPIMatch) => ({
        id: matchData.fixture.id,
        homeTeam: {
          id: matchData.teams.home.id,
          name: matchData.teams.home.name,
          logo: matchData.teams.home.logo,
          code: '',
          founded: 0,
          country: 'Turkey',
        },
        awayTeam: {
          id: matchData.teams.away.id,
          name: matchData.teams.away.name,
          logo: matchData.teams.away.logo,
          code: '',
          founded: 0,
          country: 'Turkey',
        },
        date: matchData.fixture.date,
        status: this.normalizeStatus(matchData.fixture.status),
        homeGoals: matchData.goals.home,
        awayGoals: matchData.goals.away,
        league: matchData.teams.home.id === teamId1 ? 'Süper Lig' : 'Other',
        season: matchData.league.season,
        round: 0,
        venue: matchData.venue?.name || '',
      }));
    } catch (error) {
      console.error(`Error fetching head-to-head for teams ${teamId1} vs ${teamId2}:`, error);
      return [];
    }
  }

  /**
   * Normalize match status
   */
  private normalizeStatus(status: string): 'scheduled' | 'live' | 'finished' {
    const liveStatuses = ['1H', '2H', 'ET', 'BT', 'P'];
    const finishedStatuses = ['FT', 'AET', 'PEN'];

    if (liveStatuses.includes(status)) return 'live';
    if (finishedStatuses.includes(status)) return 'finished';
    return 'scheduled';
  }
}

export const footballAPI = new FootballAPIService();
