/**
 * Backend Server
 * Express.js API server with caching and scheduled data refresh
 */

import express, { Express, Request, Response } from 'express';
// @ts-ignore - No type definitions available
import cors from 'cors';
import NodeCache from 'node-cache';
// @ts-ignore - No type definitions available
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Routes
 */

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all teams (cached)
app.get('/api/teams', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'super-lig-teams';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Fetch from football API in production
    // For now, return mock data
    const teams = {
      data: [],
      cached_at: new Date().toISOString(),
    };

    cache.set(cacheKey, teams);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get matches
app.get('/api/matches', async (req: Request, res: Response) => {
  try {
    const { team_id, limit = 10 } = req.query;
    const cacheKey = `matches-${team_id || 'all'}-${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Fetch from football API
    const matches = {
      data: [],
      cached_at: new Date().toISOString(),
    };

    cache.set(cacheKey, matches);
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get team form/statistics
app.get('/api/team/:id/form', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `team-form-${id}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Calculate form from matches
    const form = {
      teamId: id,
      formIndex: 75,
      attackStrength: 68,
      defenseRating: 72,
      momentum: 15,
      homeAdvantage: 12,
      winProbability: 65,
      form: 'WWDLW',
    };

    cache.set(cacheKey, form);
    res.json(form);
  } catch (error) {
    console.error('Error fetching team form:', error);
    res.status(500).json({ error: 'Failed to fetch team form' });
  }
});

// Predict match
app.post('/api/predict', async (req: Request, res: Response) => {
  try {
    const { home_team_id, away_team_id } = req.body;

    if (!home_team_id || !away_team_id) {
      return res.status(400).json({ error: 'Missing team IDs' });
    }

    // Get form data for both teams
    // Calculate prediction using algorithm

    const prediction = {
      match: `Team ${home_team_id} vs Team ${away_team_id}`,
      predicted_result: 'Home Win',
      confidence: 68,
      over25_probability: 72,
      btts_probability: 64,
      predicted_score: '2-1',
      factors: [],
    };

    res.json(prediction);
  } catch (error) {
    console.error('Error predicting match:', error);
    res.status(500).json({ error: 'Failed to predict match' });
  }
});

// Get standings
app.get('/api/standings', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'standings';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Fetch from football API
    const standings = {
      data: [],
      cached_at: new Date().toISOString(),
    };

    cache.set(cacheKey, standings);
    res.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

/**
 * Scheduled Tasks (Cron Jobs)
 */

// Update data every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled data refresh...');
  try {
    // Fetch latest data from Football API
    // Update cache
    cache.flushAll();
    console.log('Data refresh completed');
  } catch (error) {
    console.error('Error during scheduled refresh:', error);
  }
});

// Clear cache daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Clearing cache at midnight');
  cache.flushAll();
});

/**
 * Error handling middleware
 */
app.use((err: any, _req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚽ Super Lig Analytics API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base URL: http://localhost:${PORT}`);
});
