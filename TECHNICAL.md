# 🔧 Teknik Dokümantasyon

## Form Hesaplama Detayları

### formCalculator.ts

Form analizinin merkezidir. Her takım için 4 ana metrik hesaplar:

#### 1. calculateFormIndex() - Form İndeksi (0-100)
```typescript
// Girdi: TeamFormData
// Çıktı: number (0-100)

Hesaplama:
├─ Puanlar (35%)
│  └─ WDL oranından 3-1-0 puanı
├─ Gol Atma (20%)
│  └─ Ortalama gol sayısı
├─ Gol Yeme (15%)
│  └─ Ortalama karşı gol (ters yüz)
├─ Şutlar (10%)
│  └─ Kaleye doğru şutlar
├─ Ana Sahibi (10%)
│  └─ Ev maçlarında başarı
├─ Son Form (5%)
│  └─ Son 5 maçın trendi
└─ Tutarlılık (5%)
   └─ Standart sapma
```

#### 2. calculateAttackStrength() - Atak Gücü (0-100)
```typescript
score = (avgGoals * 0.6) + (avgShots * 0.4)
// Gol nuspası %60, şut doğruluğu %40
```

#### 3. calculateDefenseRating() - Defans Değerlendirmesi (0-100)
```typescript
// Düşük katılmış gol = iyi defans
rating = (1 - (goalsConceded / 3)) * 100
// 0 gol = 100, 3+ gol = 0
```

#### 4. calculateMomentum() - Momentum (-100 to 100)
```typescript
// Son 5 maç vs Eski 5 maç karşılaştırması
momentum = (recentPoints - olderPoints) * 50

// > +20: İyiye gidiş
// +5 to +20: İyi
// -5 to +5: Sabit
// -20 to -5: Kötüye gidiş
// < -20: Belirgin düşüş
```

## Tahmin Motoru Detayları

### predictionEngine.ts

Maç tahminlerini oluşturur:

#### predictMatch() - Ana Tahmin Fonksiyonu

```
İnput: PredictionInput
├─ homeTeamForm: TeamFormData
├─ awayTeamForm: TeamFormData
└─ homeTeamId, awayTeamId, names...

Hesaplama:
├─ calculateResultProbability()
│  ├─ Form Farkı x0.4
│  ├─ Momentum Farkı x0.3
│  ├─ Ana Sahibi Avantajı x0.2
│  └─ Normalize: home + draw + away = 1.0
│
├─ calculateOver25Probability()
│  └─ Poisson Dağılımı: P(G >= 3)
│
├─ calculateBTTSProbability()
│  └─ Her iki takımın atak vs rakip defans
│
├─ predictScore()
│  └─ Beklenen goller → Olası skor
│
└─ calculateOdds()
   └─ 1/probability * margin (1.05)
```

#### Probability Calculations

**Win/Draw/Loss Probability:**
```typescript
homeWinProb = 0.5 + (formDiff/200) + (momentumDiff/200) + (homeAdv*0.15)
drawProb = 0.25 (base, adjusted for form similarity)
awayWinProb = 1 - homeWinProb - drawProb
```

**Over 2.5 Goals:**
```typescript
expectedGoals = homeAvgGoals + awayAvgGoals
// Poisson approximation
P(G >= 3) = 1 - P(G=0) - P(G=1) - P(G=2)
```

**BTTS (Both Teams to Score):**
```typescript
btts = (homeAttack * awayDefense) + (awayAttack * homeDefense)
// Range: 0.2 - 0.8
```

## API Yapısı

### Football API Integration

```typescript
footballAPI.getSuperLigTeams()
├─ Params: league=203, season=2024
└─ Returns: Team[]

footballAPI.getTeamMatches(teamId, limit=10)
├─ Params: team, league, season, last
└─ Returns: Match[]

footballAPI.getUpcomingMatches(days=7)
├─ Params: league, season, from, to
└─ Returns: Match[]

footballAPI.getLeagueStandings()
├─ Params: league, season
└─ Returns: Standing[]

footballAPI.getHeadToHead(teamId1, teamId2, limit=5)
├─ Params: h2h="{teamId1}-{teamId2}", last
└─ Returns: Match[]
```

### Backend Endpoints

```
POST /api/predict
├─ Body: { home_team_id, away_team_id }
└─ Returns: MatchPrediction

GET /api/teams
└─ Returns: Team[]

GET /api/team/:id/form
└─ Returns: FormRating

GET /api/standings
└─ Returns: Standing[]
```

## Hook Yapısı

### useTeams()
```typescript
const { teams, loading, error } = useTeams()
// Takımları bir kez getir, cache'le
```

### useTeamMatches(teamId)
```typescript
const { matches, loading, error } = useTeamMatches(teamId)
// Takımın son 10 maçını getir
// teamId değiştiğinde otomatik güncelle
```

### useTeamForm(teamId)
```typescript
const { formData, loading } = useTeamForm(teamId)
// Maçlardan form datasını hesapla
```

### useMatchPrediction(homeTeamId, awayTeamId)
```typescript
const { prediction, loading, error } = useMatchPrediction(id1, id2)
// Form verisi + prediction engine
// Kompleks hesaplamaları handle et
```

## State Management (Zustand)

```typescript
const useAppStore = create<AppStore>((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
  
  currentMatch: null,
  setCurrentMatch: (match) => set({ currentMatch: match }),
  
  predictions: [],
  setPredictions: (predictions) => set({ predictions }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
}))
```

Kullanım:
```typescript
const teams = useAppStore((state) => state.teams)
const setTeams = useAppStore((state) => state.setTeams)
```

## Caching Strategy

### In-Memory Cache (Node-Cache)

```typescript
const cache = new NodeCache({ stdTTL: 3600 }) // 1 hour

// Kullanım
const cached = cache.get('teams-list')
cache.set('teams-list', teams)
cache.flushAll() // Temizle
```

### Cron Jobs

```typescript
// Her 6 saatte veri yenile
cron.schedule('0 */6 * * *', refreshData)

// Gece yarısında cache temizle
cron.schedule('0 0 * * *', cache.flushAll)
```

## Performance Optimizations

1. **API Response Caching** - Tekrarlayan istekleri 1 saat cache'le
2. **Lazy Loading** - Sayfa component'leri dinamik import
3. **Memoization** - Heavy calculation'ları memoize et
4. **Pagination** - Büyük listeler pagination kullan (gelecek)
5. **Virtual Scrolling** - Çok fazla item için (gelecek)

## Error Handling

```typescript
try {
  // API Call
} catch (error) {
  // Type checking
  if (isAxiosError(error)) {
    // Handle API error
  } else if (error instanceof TypeError) {
    // Handle type error
  }
  // Fallback
  return defaultValue
}
```

## Testing (Planlanan)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Database Schema (Gelecek)

```sql
-- Teams
CREATE TABLE teams (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  logo VARCHAR,
  code VARCHAR(10),
  country VARCHAR(50),
  founded INT
)

-- Matches
CREATE TABLE matches (
  id INT PRIMARY KEY,
  home_team_id INT,
  away_team_id INT,
  home_goals INT,
  away_goals INT,
  date TIMESTAMP,
  status VARCHAR(20),
  league_id INT,
  season INT
)

-- Team Form (Cache)
CREATE TABLE team_form (
  team_id INT PRIMARY KEY,
  form_index DECIMAL,
  attack_strength DECIMAL,
  defense_rating DECIMAL,
  momentum DECIMAL,
  updated_at TIMESTAMP
)

-- Predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY,
  home_team_id INT,
  away_team_id INT,
  predicted_result VARCHAR,
  confidence INT,
  predicted_score VARCHAR,
  actual_result VARCHAR,
  actual_score VARCHAR,
  roi DECIMAL,
  created_at TIMESTAMP
)
```

## Scaling Recommendations

### Horizontal Scaling

1. **Load Balancer** - NGINX/HAProxy
2. **Multiple Backend Instances** - Auto-scaling
3. **Distributed Cache** - Redis (shared between instances)
4. **Database** - PostgreSQL with replication

### Vertical Scaling

1. **Memory** - Caching boyutu artır
2. **CPU** - Heavy calculations için worker threads
3. **Disk** - Database file size

### Database Optimization

```sql
-- Indexes
CREATE INDEX idx_match_team ON matches(home_team_id, away_team_id)
CREATE INDEX idx_team_form_date ON team_form(updated_at)

-- Partitioning (large tables)
PARTITION BY season
```

## Monitoring & Logging

```typescript
// Winston Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## Environment Variables

```env
# API & Endpoints
VITE_API_BASE_URL=http://localhost:3000/api
FOOTBALL_API_KEY=your_key
FOOTBALL_API_BASE_URL=https://api-football-v3.p.rapidapi.com

# Server
NODE_ENV=production
PORT=3000

# Cache
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://user:pass@localhost/superlig

# Season
SUPER_LIG_SEASON=2024
```
