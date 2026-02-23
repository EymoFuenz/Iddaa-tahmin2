# ⚽ Süper Lig Match Analytics & Prediction Platform

Türkiye Süper Liginin en gelişmiş maç analiz ve tahmin platformu. Gerçek verilerle desteklenen form analizi, istatistiksel tahminler ve AdvancedAnalytics dashboard sunuyor.

## 🎯 Özellikler

- ✅ **Gerçek Veri Entegrasyonu**: Football API üzerinden canlı Süper Lig verileri
- ✅ **Akıllı Form Analizi**: Ağırlıklı skorlama algoritması ile takım formu hesaplaması  
- ✅ **Maç Tahminleri**: İstatistiksel modeller ile sonuç tahminleri
- ✅ **Kapsamlı İstatistikler**: Atak gücü, defans değerlendirmesi, momentum göstergesi
- ✅ **Responsive Dashboard**: Mobil optimized, karanlık tema varsayılan
- ✅ **Bahis Oranları**: Tahmine dayalı oran hesaplamaları
- ✅ **Caching Sistemi**: Redis destekli hızlı veri erişimi
- ✅ **Zamanlanmış Görevler**: Otomatik veri güncelleme

## 🏗️ Proje Mimarisi

```
.
├── src/
│   ├── components/          # React komponenileri
│   │   ├── Layout.tsx       # Header, spinner, badge vb.
│   │   ├── MatchComponents.tsx
│   │   └── TeamComponents.tsx
│   ├── pages/               # Sayfa bileşenleri
│   │   ├── HomePage.tsx
│   │   ├── TeamsPage.tsx
│   │   └── PredictionsPage.tsx
│   ├── lib/                 # Çekirdek kütüphaneler
│   │   ├── api/
│   │   │   └── footballAPI.ts
│   │   ├── algorithms/
│   │   │   ├── formCalculator.ts
│   │   │   └── predictionEngine.ts
│   │   └── index.ts         # Zustand store
│   ├── hooks/               # Custom React hooks
│   │   └── index.ts
│   ├── utils/               # Yardımcı fonksiyonlar
│   │   └── index.ts
│   ├── types/               # TypeScript tip tanımları
│   │   └── index.ts
│   ├── styles/              # Global CSS
│   │   └── index.css
│   ├── backend/             # Express.js backend
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Başlangıç

### Ön Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

1. **Repoyu klonla**
```bash
git clone <repository-url>
cd super-lig-analytics
```

2. **Bağımlılıkları yükle**
```bash
npm install
```

3. **.env dosyasını oluştur**
```bash
cp .env.example .env
```

4. **API anahtarı ekle**
```env
VITE_FOOTBALL_API_KEY=your_api_football_key_here
FOOTBALL_API_KEY=your_api_football_key_here
```

### Geliştirme Modu

**Frontend **
```bash
npm run dev
# http://localhost:5173 açılır
```

**Backend**
```bash
npm run backend:dev
# http://localhost:3000 açılır
```

### Production Build

```bash
npm run build
npm run backend:build
```

## 📊 Form Hesaplama Algoritması

### Puanlama Sistemi

```typescript
Win = 3 puan
Draw = 1 puan
Loss = 0 puan

Bonus:
+ 0.5 per goal scored (max 3 goals)
- 0.5 per goal conceded (max 3 goals)
+ 0.2 per 3 shots on target
+ home advantage bonus
```

### Ağırlıklı Skorlar

- **Puanlar**: 35% (Kazanç/Beraberlik/Kayıp)
- **Gol Atma**: 20% (Atak gücü)
- **Gol Yeme**: 15% (Defans gücü)
- **Şut (Kalenize)**: 10% (Teknik)
- **Ana Sahibi Avantajı**: 10% (Ev maçları)
- **Son Form**: 5% (Momentum)
- **Tutarlılık**: 5% (İstikrar)

**Form İndeksi = 0-100**

## 🎮 Tahmin Motoru

### Giriş Parametreleri

1. **Ev Sahibi Takım Verisi**
   - Son 10 maç
   - Ev/Deplasman formu
   - Gol atma/yeme istatistikleri

2. **Deplasman Takımı Verisi**
   - Son 10 maç
   - Ev/Deplasman formu
   - İstatistikler

### Çıkış

```json
{
  "match": "Fenerbahçe vs Galatasaray",
  "homeTeam": "Fenerbahçe",
  "awayTeam": "Galatasaray",
  "predictedResult": "Home Win",
  "confidence": 68,
  "predictedScore": "2-1",
  "over25Probability": 72,
  "bttsProbability": 64,
  "homeWinOdds": 2.15,
  "drawOdds": 3.40,
  "awayWinOdds": 3.20,
  "factors": [
    {
      "name": "Form",
      "impact": 0.15,
      "description": "Fenerbahçe significantly better form"
    }
  ],
  "analysisText": "..."
}
```

### Tahmin Faktörleri

1. **Form Farkı** - Takımların form ihdeksi karşılaştırması
2. **Atak vs Defans** - Ev sahibi saldırı vs deplasman savunması
3. **Momentum** - Son 5 maçtan trend
4. **Ana Sahibi Avantajı** - Ev maçlarında başarı oranı
5. **Beklenen Goller** - Atak gücü ve defans güçü analizi

## 🔌 API Endpoints

### Frontend API (`/api`)

```typescript
GET  /api/health              // Sağlık kontrolü
GET  /api/teams               // Tüm takımlar
GET  /api/matches             // Maçlar (query: team_id, limit)
GET  /api/team/:id/form       // Takım formu
POST /api/predict             // Maç tahmini
GET  /api/standings           // Puan durumu
```

### Football API Entegrasyonu

- **Base URL**: `https://api-football-v3.p.rapidapi.com`
- **Endpoints**:
  - `/teams` - Süper Lig takımları
  - `/fixtures` - Maçlar
  - `/standings` - Puan durumu
  - `/fixtures/statistics` - Maç istatistikleri

## 💾 Caching Stratejisi

```typescript
// Node-Cache (In-Memory)
TTL: 3600 saniye (1 saat)

Cache Keys:
- super-lig-teams
- matches-{team_id}-{limit}
- team-form-{id}
- standings

// Otomatik temizleme
- Her 6 saatte bir veri güncelleme
- Gece yarısında tüm cache temizleme
```

## 🔐 Güvenlik

- ✅ API anahtarları backend'de saklanır
- ✅ CORS konfigürasyonu
- ✅ Rate limiting (uygulanacak)
- ✅ Input validasyonu
- ✅ Environment variables kullanımı

## 📱 Responsive Tasarım

- ✅ Mobile first approach
- ✅ TailwindCSS breakpoints
- ✅ Touch-friendly UI
- ✅ Tablet optimized

## 🎨 Stil Sistemi

- **Dark Theme**: Gri + Sky Blue (0ea5e9)
- **Komponenler**:
  - `card` - Ana kart stili
  - `btn-primary` - Birincil buton
  - `badge-success/danger/warning/info`
  - `form-input` - Form elemanları
  - Grid sistemleri (grid-2, grid-3, grid-4)

## 📦 TypeScript Tipler

[src/types/index.ts](src/types/index.ts) dosyasında:
- `Team`, `Match`, `TeamStats`
- `TeamFormData`, `FormRating`
- `MatchPrediction`, `PredictionFactor`
- `FootballAPI*` - API response tipleri

## 🚀 Deployment

### Vercel (Frontend)  
```bash
npm run build
# Vercel'e deploy et
```

### Railway/Render (Backend)
```bash
npm run backend:build  
# Railway/Render'a deploy et
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run backend:build
EXPOSE 3000
CMD ["npm", "run", "backend"]
```

## 📈 Gelecek Özellikler

- [ ] Makine öğrenmesi modeli entegrasyonu
- [ ] Tahmin doğruluğu takibi
- [ ] ROI hesaplayıcı
- [ ] Canlı maç göstergeleri
- [ ] Telegram bildirimleri
- [ ] Premium tahminler
- [ ] Abonelik modeli
- [ ] Tarihsel tahmin veritabanı

## 🤝 Katkıda Bulunma

1. Fork et
2. Feature branch oluştur (`git checkout -b feature/amazing`)
3. Commit et (`git commit -m 'Add amazing feature'`)
4. Push et (`git push origin feature/amazing`)
5. Pull Request aç

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📧 İletişim

- Issues: GitHub Issues
- Email: contact@example.com

---

**Made with ⚽ passion for Turkish Football** 🇹🇷
