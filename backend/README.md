# 🔧 Backend — FastAPI Kayıt Motoru

İTÜ OBS ders kayıt otomasyonunun API backend'i. Kayıt motorunu REST + WebSocket üzerinden kontrol eder.

## 📦 Kurulum

```bash
pip install -r requirements.txt
```

### Bağımlılıklar

| Paket                       | Amaç                              |
| --------------------------- | --------------------------------- |
| `fastapi>=0.115.0`          | REST + WebSocket API framework    |
| `uvicorn[standard]>=0.32.0` | ASGI sunucu                       |
| `pydantic>=2.0.0`           | Veri validasyonu ve serialization |
| `requests>=2.31.0`          | OBS API HTTP istekleri            |
| `websockets>=13.0`          | WebSocket desteği                 |

## 🚀 Çalıştırma

```bash
python main.py
# veya
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Sunucu `http://localhost:8000` adresinde başlar. API dokümantasyonu: `http://localhost:8000/docs`

## 📡 API Endpoints

### REST

| Metot  | Yol                    | Açıklama                                |
| ------ | ---------------------- | --------------------------------------- |
| `GET`  | `/api/health`          | Sağlık kontrolü                         |
| `GET`  | `/api/config`          | Mevcut konfigürasyonu oku               |
| `POST` | `/api/config`          | Token, CRN listeleri ve ayarları kaydet |
| `POST` | `/api/test-token`      | JWT token geçerliliğini test et         |
| `POST` | `/api/calibrate`       | Sunucu offset + RTT kalibrasyonu        |
| `POST` | `/api/register/start`  | Kayıt sürecini başlat                   |
| `POST` | `/api/register/cancel` | Çalışan kaydı iptal et                  |
| `GET`  | `/api/register/status` | Kayıt durumunu sorgula                  |

### WebSocket

| Yol      | Açıklama                    |
| -------- | --------------------------- |
| `WS /ws` | Gerçek zamanlı event stream |

#### WebSocket Event Tipleri

| Tip           | Veri                                      | Açıklama                                                      |
| ------------- | ----------------------------------------- | ------------------------------------------------------------- |
| `log`         | `{message, level}`                        | Log mesajı (info/warning/error)                               |
| `state`       | `{phase}`                                 | Durum değişikliği (idle/calibrating/waiting/registering/done) |
| `countdown`   | `{remaining}`                             | Geri sayım (saniye)                                           |
| `crn_update`  | `{results}`                               | CRN bazlı durum güncellemesi                                  |
| `calibration` | `{server_offset_ms, rtt_one_way_ms, ...}` | Kalibrasyon sonucu                                            |
| `done`        | `{results}`                               | Kayıt tamamlandı                                              |

## 🏗️ Modüller

### `main.py` — API Katmanı

- `AppState`: Global uygulama durumu (token, CRN listeleri, ayarlar, engine referansı)
- REST endpoint'leri + WebSocket bağlantı yönetimi
- `poll_engine_events()`: Engine event kuyruğunu okuyup WS'e broadcast
- CORS: `localhost:3000` için açık

### `engine.py` — Kayıt Motoru

- `RegistrationEngine`: Tek kullanımlık kayıt motoru sınıfı
- `calibrate()`: Sunucu saati ölçümü (Date header geçişi) + RTT + NTP
- `_kayit_yap()`: Ana kayıt döngüsü (retry + status tracking)
- `_build_request()`: `{"ECRN": [...], "SCRN": [...]}` payload'ı ile PreparedRequest
- `run()`: Orkestratör (kalibre → ısınma → bekleme → kayıt)
- Queue-based event emitter (thread-safe)

### `models.py` — Veri Modelleri

- `ConfigRequest` / `ConfigResponse`: Konfigürasyon CRUD
- `CRNStatus`: 8 durum enum'u (pending, success, already, full, conflict, upgrade, debounce, error)
- `CalibrationResult`: Kalibrasyon metrikleri
- `RegistrationState`: Anlık kayıt durumu
- `TokenTestResult`: Token test sonucu

## 🔧 Konfigürasyon Parametreleri

| Parametre        | Varsayılan | Açıklama                                    |
| ---------------- | ---------- | ------------------------------------------- |
| `token`          | —          | JWT Bearer token (zorunlu)                  |
| `ecrn_list`      | `[]`       | Eklenecek CRN'ler                           |
| `scrn_list`      | `[]`       | Bırakılacak CRN'ler                         |
| `kayit_saati`    | `14:00:00` | Hedef kayıt saati (HH:MM:SS)                |
| `max_deneme`     | `60`       | Maksimum retry sayısı (1-300)               |
| `retry_aralik`   | `3.0`      | Retry aralığı / debounce süresi (1.0-10.0s) |
| `gecikme_buffer` | `0.005`    | Güvenlik tamponu (0.0-0.1s)                 |

## 🔄 OBS API Response Kodları

| Kod             | Anlamı                            |
| --------------- | --------------------------------- |
| `statusCode: 0` | Başarılı                          |
| `VAL02`         | Kayıt dönemi henüz açılmadı       |
| `VAL03`         | Ders zaten alınmış                |
| `VAL06`         | Kontenjan dolu                    |
| `VAL09`         | Ders çakışması                    |
| `VAL16`         | Debounce (istek işlenmedi)        |
| `VAL22`         | Yükseltmeye alınan ders çakışması |
