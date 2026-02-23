# 🚀 Quick Start Guide

## ⚡ 5 Minutes Setup

### 1. Install & Configure
```bash
# Clone & install
git clone <repo>
cd super-lig-analytics
npm install

# Setup environment
cp .env.example .env

# Edit .env with your API key
# Get key from: https://rapidapi.com/api-sports/api/api-football
```

### 2. Start Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Visit: http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
npm run backend:dev
# API runs on: http://localhost:3000
```

## 🎯 Key Files to Understand

1. **src/types/index.ts** - All TypeScript types
2. **src/lib/algorithms/formCalculator.ts** - Form calculation logic
3. **src/lib/algorithms/predictionEngine.ts** - Prediction algorithm
4. **src/lib/api/footballAPI.ts** - Football API client
5. **src/hooks/index.ts** - React hooks for data fetching

## 📊 Example: How to Add a Feature

### Add a New Prediction Factor

**Step 1:** Update types
```typescript
// src/types/index.ts
export interface PredictionFactor {
  name: string;
  impact: number;
  description: string;
  // ADD:
  importance: 'high' | 'medium' | 'low';
}
```

**Step 2:** Implement logic
```typescript
// src/lib/algorithms/predictionEngine.ts
function generateAnalysisFactors(...) {
  // ... existing code ...
  
  // ADD:
  if (homeForm.attackStrength > 80) {
    factors.push({
      name: 'Elite Attack',
      impact: 0.25,
      description: 'Exceptional attacking form',
      importance: 'high'
    });
  }
}
```

**Step 3:** Update UI
```typescript
// src/components/MatchComponents.tsx
{prediction.factors.map((factor) => (
  <div key={factor.name}>
    <span className={`importance-${factor.importance}`}>
      {factor.name}
    </span>
    {/* ... */}
  </div>
))}
```

## 🔌 API Integration Example

### Using the Prediction Hook

```typescript
import { useMatchPrediction } from '@/hooks';

function MyComponent() {
  const [homeTeamId, setHomeTeamId] = useState(1);
  const [awayTeamId, setAwayTeamId] = useState(2);
  
  const { prediction, loading, error } = useMatchPrediction(
    homeTeamId,
    awayTeamId
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h3>{prediction.match}</h3>
      <p>Expected Result: {prediction.predictedResult}</p>
      <p>Confidence: {prediction.confidence}%</p>
      <p>Score Prediction: {prediction.predictedScore}</p>
    </div>
  );
}
```

### Using the Football API Directly

```typescript
import { footballAPI } from '@/lib/api/footballAPI';

// Get all teams
const teams = await footballAPI.getSuperLigTeams();

// Get team's last 10 matches
const matches = await footballAPI.getTeamMatches(1, 10);

// Get standings
const standings = await footballAPI.getLeagueStandings();

// Get head-to-head
const h2h = await footballAPI.getHeadToHead(1, 2, 5);
```

## 🎨 Component Examples

### Using Layout Components

```typescript
import { 
  Header, 
  Card, 
  Badge, 
  FormBar, 
  RatingBar 
} from '@/components/Layout';

function Example() {
  return (
    <div>
      <Header />
      
      <Card>
        <Badge variant="success">Hot Form</Badge>
        <FormBar form="WWDLW" title="Last 5 Matches" />
        <RatingBar label="Form Index" value={75} />
        <RatingBar label="Attack" value={68} color="bg-orange-500" />
      </Card>
    </div>
  );
}
```

### Team Comparison

```typescript
import { TeamComparison } from '@/components/TeamComponents';

<TeamComparison
  homeTeam={{
    name: 'Fenerbahçe',
    logo: 'https://...',
    form: {
      teamId: 1,
      teamName: 'Fenerbahçe',
      formIndex: 80,
      attackStrength: 85,
      defenseRating: 75,
      momentum: 25,
      homeAdvantage: 15,
      winProbability: 75,
      form: 'WWWWD'
    }
  }}
  awayTeam={{
    // ... similar structure
  }}
/>
```

## 🔧 Customization Guide

### Change Prediction Algorithm Weights

```typescript
// src/lib/algorithms/formCalculator.ts
const weights = {
  points: 0.40,        // Increase priority
  goalScoring: 0.20,
  goalConceding: 0.15,
  shotsOnTarget: 0.10,
  homeAdvantage: 0.10,
  recentForm: 0.03,    // Decrease
  consistency: 0.02
};
```

### Adjust Form Calculation

```typescript
// Change win/draw/loss points
// Base: Win=3, Draw=1, Loss=0

// To make draws more valuable:
const totalPoints = (wins * 3) + (draws * 2) + (losses * 0);
```

### Modify Caching TTL

```typescript
// .env
CACHE_TTL=7200  # Change from 3600 (1 hour) to 7200 (2 hours)
```

## 🧪 Testing Examples

### Test Form Calculator

```typescript
import { calculateFormIndex, calculateAttackStrength } from '@/lib/algorithms/formCalculator';

const testFormData = {
  teamId: 1,
  lastMatches: [...],
  wins: 7,
  draws: 2,
  losses: 1,
  goalsScored: 25,
  goalsConceded: 8,
  shotsOnTarget: 30,
  possession: 55,
  corners: 45
};

const formIndex = calculateFormIndex(testFormData);
console.log('Form Index:', formIndex); // Should be 0-100
```

### Test Prediction Engine

```typescript
import { predictMatch } from '@/lib/algorithms/predictionEngine';

const prediction = predictMatch({
  homeTeamForm: homeData,
  awayTeamForm: awayData,
  homeTeamId: 1,
  awayTeamId: 2,
  homeTeamName: 'Team A',
  awayTeamName: 'Team B'
});

console.log('Prediction:', prediction);
// {
//   match: "Team A vs Team B",
//   predictedResult: "Home Win",
//   confidence: 68,
//   over25Probability: 72,
//   ...
// }
```

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
# Clear Vite cache
rm -rf dist .vite

# Reinstall dependencies
rm -rf node_modules
npm install

# Start dev server
npm run dev
```

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Check environment variables
echo $FOOTBALL_API_KEY

# Check port availability
netstat -ano | findstr :3000
```

### Build Errors
```bash
# Clear everything
npm run clean  # if configured
rm -rf dist node_modules
npm install

# Type check
npm run type-check

# Build
npm run build
```

## 📈 Next Steps

1. **Customize Prediction Weights** - Tune algorithm for better accuracy
2. **Add Team Logos** - Use team.logo from API
3. **Implement Caching** - Set up Redis for production
4. **Add Authentication** - Secure API endpoints
5. **Database Integration** - Store predictions and users
6. **Mobile App** - React Native version
7. **Live Updates** - WebSocket for live match data

## 🔗 Useful Links

- **Documentation**: README.md, TECHNICAL.md, ARCHITECTURE.md
- **Football API**: https://rapidapi.com/api-sports/api/api-football
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com

## 💬 Getting Help

- Check error messages carefully
- Review TECHNICAL.md for algorithm details
- Look at existing components for patterns
- Check GitHub issues (if available)

---

**Happy coding! ⚽**
