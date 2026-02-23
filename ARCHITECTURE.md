# 📐 System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Şu yer da destek)         Mobile Browser (Sonraki) │
└─────────────────┬───────────────────────────────────┬────────────┘
                  │                                   │
          HTTP/HTTPS                           HTTP/HTTPS
                  │                                   │
┌─────────────────▼───────────────────────────────────▼────────────┐
│                    FRONTEND LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Vite + React + TypeScript                                      │
│  ├─ Components (UI Library)                                     │
│  ├─ Pages (Router)                                              │
│  ├─ Hooks (Data Fetching)                                       │
│  ├─ Services (API Client)                                       │
│  └─ State Management (Zustand)                                  │
└─────────────────┬─────────────────────────────────────────────────┘
                  │
          HTTP/REST API
                  │
┌─────────────────▼─────────────────────────────────────────────────┐
│                    BACKEND LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  Express.js + Node.js                                           │
│  ├─ Routes & Controllers                                        │
│  ├─ Services & Business Logic                                   │
│  ├─ Middleware (Auth, CORS, Error)                              │
│  └─ Caching System (Node-Cache)                                 │
└─────────────────┬─────────────────────────────────────────────────┘
                  │
        Internal Calls + External API
                  │
┌─────────────────┴─────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  Football API (RapidAPI)                                        │
│  ├─ Teams Data                                                  │
│  ├─ Matches & Statistics                                        │
│  └─ League Standings                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Structure

```
src/
├── components/
│   ├── Layout.tsx              # Reusable UI components
│   │   ├─ Header
│   │   ├─ LoadingSpinner
│   │   ├─ Card
│   │   ├─ Badge
│   │   └─ StatsCard
│   ├── MatchComponents.tsx      # Match-related components
│   │   ├─ MatchCard
│   │   ├─ PredictionCard
│   │   └─ OddsDisplay
│   └── TeamComponents.tsx       # Team-related components
│       ├─ TeamCard
│       ├─ TeamFormDisplay
│       └─ StandingRow
│
├── pages/                       # Page components
│   ├── HomePage.tsx            # Today's matches
│   ├── TeamsPage.tsx           # Teams listing & standings
│   └── PredictionsPage.tsx     # Prediction interface
│
├── hooks/                       # Custom React hooks
│   └── index.ts
│       ├─ useTeams()
│       ├─ useTeamMatches()
│       ├─ useMatchPrediction()
│       └─ useTeamForm()
│
├── lib/                         # Core libraries
│   ├── api/
│   │   └── footballAPI.ts       # Football API client
│   ├── algorithms/
│   │   ├── formCalculator.ts   # Form calculation engine
│   │   └── predictionEngine.ts # Match prediction engine
│   └── index.ts                 # Zustand store
│
├── services/                    # Service layer
│   └── (API integration)
│
├── utils/                       # Utility functions
│   └── index.ts                 # Date, formatting, helpers
│
└── types/                       # TypeScript types
    └── index.ts                 # All type definitions
```

### Data Flow

```
User Interaction
       │
       ▼
React Component
       │
       ▼
Custom Hook (useMatchPrediction)
       │
       ├─ useTeamMatches (home)
       ├─ useTeamMatches (away)
       └─ useTeams
       │
       ▼
API Client (footballAPI)
       │
       ▼
Football API (RapidAPI)
       │
       ▼
Data Processing
       │
       ├─ formCalculator.ts
       └─ predictionEngine.ts
       │
       ▼
UI Update (Zustand + Re-render)
       │
       ▼
User sees prediction
```

## API Architecture

### Request Flow

```
1. Frontend sends request to Backend
   GET /api/predict?home=1&away=2

2. Backend receives request
   ├─ Validate input
   ├─ Check cache
   └─ If not cached:
      ├─ Fetch home team form
      ├─ Fetch away team form
      ├─ Calculate prediction (formCalculator + predictionEngine)
      └─ Cache result

3. Return response
   {
     "predictedResult": "Home Win",
     "confidence": 68,
     ...
   }
```

### Cache Layer

```
                Client Request
                      │
                      ▼
         ┌────────────────────┐
         │  Backend Receives  │
         └────────────────────┘
                  │
                  ▼
         ┌─────────────────────┐
         │ Check Cache (Redis) │
         └─────────────────────┘
              /         \
           HIT /         \ MISS
            /              \
          Fast             Need to
          Return           Calculate
            │                │
            │                ▼
            │      Fetch Data from API
            │                │
            │                ▼
            │      Process & Calculate
            │                │
            │                ▼
            │      Store in Cache
            │                │
            ▼                ▼
         Return Response
```

## Algorithm Flow

### Form Calculation

```
Input: Last 10 matches of a team
       │
       ├─ Extract: WDL, Goals F/A, Shots
       │
       ├─ Calculate Metrics:
       │  ├─ Points (0-3 per match)
       │  ├─ Attack Strength (goals + accuracy)
       │  ├─ Defense Rating (goals conceded)
       │  ├─ Momentum (recent vs older form)
       │  ├─ Home Advantage (home matches)
       │  └─ Consistency (std dev)
       │
       ├─ Apply Weights:
       │  ├─ 35% Points
       │  ├─ 20% Attack
       │  ├─ 15% Defense
       │  ├─ 10% Shots
       │  ├─ 10% Home
       │  ├─ 5% Recent
       │  └─ 5% Consistency
       │
       └─ Output:
          FormRating {
            formIndex: 0-100,
            attackStrength: 0-100,
            defenseRating: 0-100,
            momentum: -100 to 100,
            homeAdvantage: 0-20,
            form: "WWDLW"
          }
```

### Prediction Calculate

```
Input: Home FormRating + Away FormRating
       │
       ├─ Calculate Result Probability
       │  ├─ Form Difference (40%)
       │  ├─ Momentum (30%)
       │  ├─ Home Advantage (20%)
       │  └─ Normalize: home + draw + away = 100%
       │
       ├─ Calculate Over/Under 2.5
       │  ├─ Expected Goals (home + away avg)
       │  └─ Poisson Approximation
       │
       ├─ Calculate BTTS
       │  ├─ Home Attack vs Away Defense
       │  └─ Away Attack vs Home Defense
       │
       ├─ Predict Score
       │  ├─ Expected home goals
       │  ├─ Expected away goals
       │  └─ Adjust based on O/U
       │
       └─ Output:
          MatchPrediction {
            predictedResult: "Home Win" | "Draw" | "Away Win",
            confidence: 0-100,
            predictedScore: "2-1",
            over25Probability: 0-100,
            btts: true|false,
            homeWinOdds: 2.15,
            drawOdds: 3.40,
            awayWinOdds: 3.20,
            factors: [...],
            analysisText: "..."
          }
```

## State Management

### Zustand Store

```typescript
useAppStore
├─ teams: Team[]
│  ├─ action: setTeams()
│  └─ used by: TeamsPage, PredictionsPage
│
├─ currentMatch: Match | null
│  ├─ action: setCurrentMatch()
│  └─ used by: MatchDetail page
│
├─ predictions: MatchPrediction[]
│  ├─ action: setPredictions()
│  └─ used by: PredictionsPage, History
│
└─ loading: boolean
   ├─ action: setLoading()
   └─ used by: Components for UI state
```

**Not in Store (Hook/Local):**
- Team form data (useTeamForm hook)
- Match data (useTeamMatches hook)
- UI state (useState)

**Why?**
- Form data is computed per team (not global)
- Reduces re-renders
- Easier to manage team-specific data

## Deployment Architecture

### Development

```
┌──────────────┐         ┌──────────────┐
│ Frontend Dev │         │ Backend Dev  │
│ :5173        │ ◄─────► │ :3000        │
└──────────────┘         └──────────────┘
       │                        │
       └────────┬───────────────┘
                │
         Football API
```

### Production (Vercel + Railway)

```
┌──────────────────────────────────────────┐
│         Vercel CDN                       │
│  super-lig-analytics.vercel.app          │
│  ├─ Frontend (React SPA)                 │
│  └─ Static Assets                        │
└────────────┬─────────────────────────────┘
             │
        HTTPS Request
             │
┌────────────▼─────────────────────────────┐
│ Railway / Render                         │
│ super-lig-api.up.railway.app            │
│ ├─ Express API                           │
│ ├─ Node-Cache                            │
│ └─ Cron JobsSchedule                     │
└────────────┬─────────────────────────────┘
             │
        HTTP Request
             │
┌────────────▼─────────────────────────────┐
│ Football API (RapidAPI)                  │
└──────────────────────────────────────────┘
```

### Containerized Deployment (Docker)

```
┌─────────────────────────────────────────┐
│         Docker Registry                 │
│   your-registry/super-lig:latest        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Kubernetes Cluster                 │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Pod 1: API                       │  │
│  │  Port: 3000                      │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Pod 2: API                       │  │
│  │  Port: 3000                      │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Pod 3: API                       │  │
│  │  Port: 3000                      │  │
│  └──────────────────────────────────┘  │
│         (3 replicas)                    │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Load Balancer Service            │  │
│  │ Port: 80 → Pod:3000              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Security Layers

```
User
  │
  ▼ (HTTPS)
┌──────────────────────┐
│ CORS Middleware      │  ◄─ Origin validation
└──────────────────────┘
  │
  ▼
┌──────────────────────┐
│ Auth Middleware      │  ◄─ Rate limiting (future)
└──────────────────────┘
  │
  ▼
┌──────────────────────┐
│ Input Validation     │  ◄─ Sanitize inputs
└──────────────────────┘
  │
  ▼
┌──────────────────────┐
│ Business Logic       │
└──────────────────────┘
  │
  ▼
┌──────────────────────┐
│ Error Handler        │  ◄─ Safe error responses
└──────────────────────┘
  │
  ▼
Response
```

## Performance Optimization

### Frontend

```
Asset Loading
  │
  ├─ Bundle Split
  │  └─ index.js (main app)
  │  └─ teams.js (lazy loaded)
  │  └─ predictions.js (lazy loaded)
  │
  ├─ Image Optimization
  │  ├─ WebP format
  │  └─ Lazy loading
  │
  └─ Caching
     ├─ Browser cache (service worker)
     └─ API response cache
```

### Backend

```
Request Handling
  │
  ├─ Check Cache → Return if hit
  │
  ├─ Fetch Data
  │  ├─ Parallel requests (Promise.all)
  │  └─ Timeout handling
  │
  ├─ Calculate Result
  │  └─ Heavy operations (prediction engine)
  │
  ├─ Cache Result
  │  └─ TTL: 1 hour (configurable)
  │
  └─ Return Response (JSON gzip)
```

## Monitoring & Observability

```
                    Data Flow
                       │
   ┌───────────────────┼────────────────────┐
   │                   │                    │
   ▼                   ▼                    ▼
 Logs              Metrics            Traces
   │                   │                    │
   ├─ Winston        ├─ Prometheus        └─ Jaeger
   ├─ Sentry         └─ Datadog
   └─ DataDog
   
   │
   └─► Centralized
       Dashboard
```

---

**Each layer is independent and can be scaled/updated separately.**

## 🚀 Quick Team Import System Architecture (v2.0)

### High-Level Flow
- **Time**: 10 minutes → 30 seconds ⚡
- **Process**: Select team → Click import → Auto-fetch 10 matches from API
- **Integration**: Firestore + React hooks combine API and custom teams

### New Module
- **File**: `src/lib/services/quickTeamImport.ts`
- **Functions**:
  - `quickImportTeam()` - Import single team with matches
  - `batchImportTeams()` - Import multiple teams in parallel
  - `fetchTeamRecentMatches()` - Update team's recent matches

### Modified Components
- **AddTeamForm**: Simplified UI (dropdown + import button)
- **useTeams Hook**: Combines API teams + Firestore custom teams
- **Firestore Rules**: Updated for proper access control

See `QUICK_IMPORT_GUIDE.md` for usage instructions.
