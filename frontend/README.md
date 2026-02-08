# 🖥️ Frontend — Next.js Dashboard

İTÜ OBS ders kayıt otomasyonunun web arayüzü. Backend API ile REST + WebSocket üzerinden iletişim kurar.

## 📦 Kurulum

```bash
# Bun ile (önerilen — ~4 saniye)
bun install

# veya npm ile
npm install
```

## 🚀 Çalıştırma

```bash
bun run dev       # → http://localhost:3000
# veya
npm run dev
```

### Production Build

```bash
bun run build
bun start
```

## 🛠️ Teknoloji Yığını

| Teknoloji    | Versiyon | Amaç                                    |
| ------------ | -------- | --------------------------------------- |
| Next.js      | 16.x     | React framework (App Router, Turbopack) |
| React        | 19.x     | UI kütüphanesi                          |
| TypeScript   | 5.x      | Tip güvenliği                           |
| Tailwind CSS | v4       | Utility-first CSS                       |
| shadcn/ui    | —        | Radix tabanlı UI bileşenleri            |
| motion       | v12      | Animasyonlar (framer-motion fork)       |
| Lucide React | —        | İkon kütüphanesi                        |
| next-themes  | —        | Karanlık/aydınlık tema                  |
| Sonner       | —        | Toast bildirimleri                      |
| Bun          | 1.3+     | Paket yöneticisi ve runtime             |

## 📂 Yapı

```
src/
├── app/
│   ├── layout.tsx           # Root layout (fonts, tema, toaster)
│   ├── page.tsx             # Ana sayfa → Dashboard
│   └── globals.css          # Tailwind + CSS değişkenleri
├── components/
│   ├── ui/                  # shadcn/ui bileşenleri (12 adet)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   └── tooltip.tsx
│   ├── dashboard.tsx         # 🎛️ Ana orkestratör bileşeni
│   ├── crn-manager.tsx       # 📚 CRN ekleme/bırakma yöneticisi
│   ├── token-input.tsx       # 🔑 JWT token girişi
│   ├── calibration-card.tsx  # 📊 Kalibrasyon metrikleri
│   ├── countdown-timer.tsx   # ⏱️ Animasyonlu geri sayım
│   ├── live-logs.tsx         # 📋 Terminal tarzı log viewer
│   ├── settings-panel.tsx    # ⚙️ Kayıt ayarları
│   ├── connection-status.tsx # 🟢 WebSocket durum göstergesi
│   ├── theme-toggle.tsx      # 🌙 Tema değiştirici
│   └── providers.tsx         # ThemeProvider wrapper
├── hooks/
│   └── use-websocket.ts      # WebSocket hook (auto-reconnect)
└── lib/
    ├── api.ts                # Typed API client + WebSocket factory
    └── utils.ts              # cn() yardımcı fonksiyonu
```

## 🧩 Bileşenler

### Dashboard (`dashboard.tsx`)

Ana orkestratör. Tüm state yönetimi burada yapılır:

- Token, ECRN listesi, SCRN listesi, ayarlar
- Backend'e auto-save (500ms debounce)
- Kalibrasyon, kayıt başlatma/iptal
- WebSocket üzerinden gerçek zamanlı veri akışı

### CRN Manager (`crn-manager.tsx`)

Çift modlu CRN yönetim bileşeni:

- **`mode="add"`** — Eklenecek dersler (ECRN), yeşil tema
- **`mode="drop"`** — Bırakılacak dersler (SCRN), turuncu tema
- CRN bazlı durum badge'leri (8 farklı durum rengi)
- Animasyonlu ekleme/çıkarma (motion AnimatePresence)

### Token Input (`token-input.tsx`)

- JWT token girişi (show/hide toggle)
- Token test butonu (backend üzerinden OBS'ye doğrulama)
- Geçerlilik badge'leri (valid/invalid/untested)

### Calibration Card (`calibration-card.tsx`)

- Sunucu offset (ms)
- RTT tek yön / tam (ms)
- NTP karşılaştırması
- Hassasiyet göstergesi

### Countdown Timer (`countdown-timer.tsx`)

- Faz farkındalıklı stil (idle → kalibre → bekleme → kayıt → bitti)
- Animasyonlu sayı geçişleri

### Live Logs (`live-logs.tsx`)

- Terminal benzeri görünüm
- Otomatik scroll
- Renk kodlu log seviyeleri (info/warning/error)
- Temizleme butonu

### Settings Panel (`settings-panel.tsx`)

- Açılır/kapanır panel
- Kayıt saati, max deneme, retry aralık, gecikme buffer

## 🌐 API Bağlantısı

Frontend, `NEXT_PUBLIC_API_URL` ortam değişkeni ile backend adresini belirler.

| Değişken              | Varsayılan              | Açıklama           |
| --------------------- | ----------------------- | ------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API adresi |

### WebSocket

- Otomatik bağlantı kurma (sayfa yüklendiğinde)
- Bağlantı koptuğunda 3 saniye sonra otomatik yeniden bağlanma
- Ping/pong keep-alive
- Son 200 log tutma (bellek yönetimi)

## 🎨 Tema

- `next-themes` ile karanlık/aydınlık mod
- Varsayılan: karanlık tema
- CSS değişkenleri ile shadcn/ui tema entegrasyonu
- Hydration mismatch koruması (`mounted` state pattern)
