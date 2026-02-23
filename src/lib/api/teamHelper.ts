/**
 * API Football Test Helper
 * Tools to help debug API issues
 */

import { footballAPI } from '@/lib/api/footballAPI';

/**
 * Test if an API team ID is valid
 */
export async function testTeamId(teamId: number): Promise<{
  valid: boolean;
  teamName?: string;
  message: string;
}> {
  try {
    if (!teamId || teamId <= 0) {
      return {
        valid: false,
        message: `Geçersiz ID: ${teamId}. Lütfen pozitif bir sayı girin.`,
      };
    }

    // Try to fetch matches
    const matches = await footballAPI.getTeamMatches(teamId, 1);

    if (matches.length === 0) {
      return {
        valid: false,
        message: `Takım ID ${teamId} bulunamadı veya hiç maçı yok. Lütfen geçerli bir ID girin.`,
      };
    }

    // Get team name from first match
    const teamName = matches[0].homeTeam.id === teamId 
      ? matches[0].homeTeam.name 
      : matches[0].awayTeam.name;

    return {
      valid: true,
      teamName,
      message: `✓ Takım bulundu: ${teamName}`,
    };
  } catch (error) {
    let message = 'Bilinmeyen hata';

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        message = `Takım bulunamadı: ID ${teamId} geçerli değil.`;
      } else if (error.message.includes('429')) {
        message = 'API çok fazla istek aldı. Lütfen 1 dakika bekleyip tekrar deneyin.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        message = 'API anahtarı geçersiz. Lütfen .env dosyasını kontrol edin.';
      } else {
        message = error.message;
      }
    }

    return {
      valid: false,
      message: `✗ Hata: ${message}`,
    };
  }
}

/**
 * Get popular team IDs for quick reference
 */
export const POPULAR_TEAMS = [
  { name: 'Galatasaray', id: 100, league: 'Türkiye - Süper Lig' },
  { name: 'Fenerbahçe', id: 53, league: 'Türkiye - Süper Lig' },
  { name: 'Beşiktaş', id: 81, league: 'Türkiye - Süper Lig' },
  { name: 'Trabzonspor', id: 179, league: 'Türkiye - Süper Lig' },
  { name: 'Liverpool', id: 39, league: 'İngiltere - Premier League' },
  { name: 'Manchester United', id: 33, league: 'İngiltere - Premier League' },
  { name: 'Barcelona', id: 529, league: 'İspanya - La Liga' },
  { name: 'Real Madrid', id: 541, league: 'İspanya - La Liga' },
  { name: 'Bayern Munich', id: 157, league: 'Almanya - Bundesliga' },
  { name: 'PSG', id: 85, league: 'Fransa - Ligue 1' },
];
