# Atomic Task List — Mini-Grafana
> Derived from [prd.md](./prd.md)  
> Status: 🔴 Not Started | 🟡 In Progress | 🟢 Done | ⏭️ Skipped

---

## Phase 0 — Infrastructure & Environment

### 0.1 Docker & Services

- [ ] **T-001** Buat `docker-compose.yml` di root project dengan service: `loki`, `grafana`, `postgresql`
- [ ] **T-002** Tambahkan Loki config file (`loki-config.yml`) sebagai volume mount di docker-compose
- [ ] **T-003** Jalankan `docker-compose up -d` dan verifikasi Loki berjalan di `http://localhost:3100/ready`
- [ ] **T-004** Verifikasi PostgreSQL berjalan dan bisa diakses di port `5432`

### 0.2 Environment Variables

- [ ] **T-005** Tambahkan `LOKI_URL=http://localhost:3100` ke file `.env`
- [ ] **T-006** Tambahkan `OLLAMA_URL=http://localhost:11434` ke file `.env`
- [ ] **T-007** Tambahkan `OLLAMA_DEFAULT_MODEL=llama3` ke file `.env`
- [ ] **T-008** Tambahkan `DATABASE_URL=postgresql://...` ke file `.env`
- [ ] **T-009** Buat file `.env.example` sebagai template (tanpa nilai sensitif)

### 0.3 Ollama Setup

- [ ] **T-010** Install Ollama di mesin lokal (bila belum ada)
- [ ] **T-011** Pull model default: `ollama pull llama3` (atau model pilihan)
- [ ] **T-012** Verifikasi Ollama berjalan di `http://localhost:11434/api/tags`

---

## Phase 1 — Backend: Global Setup

### 1.1 NestJS App Config

- [x] **T-013** Register `LoggerModule.forRoot()` dari `nestjs-pino` di `AppModule` (global logger)
- [x] **T-014** Tambahkan `ValidationPipe` global di `main.ts` (`useGlobalPipes`)
- [x] **T-015** Tambahkan CORS config di `main.ts` (`app.enableCors()`) agar frontend React bisa akses
- [x] **T-016** Baca `PORT` dari `.env` di `main.ts` (saat ini hardcoded `3000`)

### 1.2 Database (Drizzle ORM)

- [x] **T-017** Hapus tabel `usersTable` placeholder di `schema.ts`
- [x] **T-018** Buat schema tabel `rca_results` di `src/lib/db/schema.ts` dengan kolom: `id`, `log_id`, `log_message`, `log_labels` (jsonb), `log_timestamp`, `model_used`, `root_cause`, `impact`, `recommendation`, `raw_response`, `created_at`
- [x] **T-019** Verifikasi koneksi database di `src/lib/db/drizzle.ts` menggunakan `DATABASE_URL` dari env
- [x] **T-020** Buat `DrizzleModule` yang meng-export koneksi db sebagai provider global atau per-module
- [x] **T-021** Jalankan `drizzle-kit push` atau buat migration untuk tabel `rca_results`
- [x] **T-022** Verifikasi tabel `rca_results` terbuat di PostgreSQL (`\dt` via psql atau GUI)

---

## Phase 2 — Backend: Loki Module

### 2.1 DTO

- [x] **T-023** ✅ Buat `dto/loki-query.dto.ts` dengan interface `LokiQueryParams` *(selesai)*
- [x] **T-024** ✅ Buat `dto/loki-response.dto.ts` dengan interface `LokiStream`, `LokiQueryRangeResponse`, dsb. *(selesai)*
- [x] **T-025** Buat `dto/loki-labels.dto.ts` dengan interface `LokiLabelsResponse` dan `LokiLabelValuesResponse`

### 2.2 Service

- [x] **T-026** ✅ Implementasi `queryRange()` di `loki.service.ts` menggunakan `HttpService` *(selesai)*
- [x] **T-027** Tambahkan method `getLabels(): Promise<string[]>` — hit `GET /loki/api/v1/labels`
- [x] **T-028** Tambahkan method `getLabelValues(labelName: string): Promise<string[]>` — hit `GET /loki/api/v1/label/{name}/values`

### 2.3 Controller

- [x] **T-029** Tambahkan endpoint `GET /loki/logs` di `LokiController` — menerima query params dan memanggil `queryRange()`
- [x] **T-030** Tambahkan `@Query()` DTO validation untuk endpoint `/loki/logs` (gunakan `class-validator`)
- [x] **T-031** Tambahkan endpoint `GET /loki/labels` di `LokiController` — memanggil `getLabels()`
- [x] **T-032** Tambahkan endpoint `GET /loki/label/:name/values` di `LokiController` — memanggil `getLabelValues()`

### 2.4 Module

- [x] **T-033** ✅ Tambahkan `HttpModule` dan `LoggerModule` ke `LokiModule` imports *(selesai)*

---

## Phase 3 — Backend: Ollama Module

### 3.1 DTO

- [x] **T-034** Buat `dto/ollama-generate.dto.ts` dengan interface untuk request body ke Ollama (`model`, `prompt`, `stream`, dsb.)
- [x] **T-035** Buat `dto/ollama-response.dto.ts` dengan interface untuk response Ollama (streaming & non-streaming)

### 3.2 Service

- [x] **T-036** Setup `OllamaService` dengan inject `HttpService` dan `PinoLogger`
- [x] **T-037** Tambahkan method `generate(model: string, prompt: string): Promise<string>` — hit `POST /api/generate` Ollama (non-streaming)
- [x] **T-038** Tambahkan method `generateStream(model: string, prompt: string): Observable<string>` — hit `POST /api/generate` dengan `stream: true`
- [x] **T-039** Tambahkan method `listModels(): Promise<string[]>` — hit `GET /api/tags` Ollama

### 3.3 Controller

- [x] **T-040** Tambahkan endpoint `GET /ollama/models` — memanggil `listModels()`

### 3.4 Module

- [x] **T-041** Tambahkan `HttpModule` dan `LoggerModule` ke `OllamaModule` imports

---

## Phase 4 — Backend: Analysis Module

### 4.1 Buat Module Skeleton

- [x] **T-042** Generate `AnalysisModule` dengan `nest g module modules/analysis`
- [x] **T-043** Generate `AnalysisService` dengan `nest g service modules/analysis`
- [x] **T-044** Generate `AnalysisController` dengan `nest g controller modules/analysis`
- [x] **T-045** Daftarkan `AnalysisModule` di `AppModule`

### 4.2 DTO

- [x] **T-046** Buat `dto/rca-request.dto.ts` dengan field: `logMessage`, `logLabels`, `logTimestamp`, `model` (optional)
- [x] **T-047** Buat `dto/rca-response.dto.ts` dengan field: `rootCause`, `impact`, `recommendation`, `rawResponse`, `modelUsed`

### 4.3 Prompt Engineering

- [x] **T-048** Buat file `analysis.prompt.ts` (atau `constants/`) berisi template prompt untuk RCA
- [x] **T-049** Prompt harus menghasilkan output terstruktur JSON dengan key: `root_cause`, `impact`, `recommendation`

### 4.4 Service

- [x] **T-050** Inject `OllamaService` dan `DrizzleModule`/db ke `AnalysisService`
- [x] **T-051** Implementasi method `analyzeLog(dto: RcaRequestDto): Promise<RcaResponseDto>` — build prompt → kirim ke Ollama → parse JSON response
- [x] **T-052** Implementasi method `analyzeLogStream(dto: RcaRequestDto): Observable<string>` — streaming via `generateStream()`
- [x] **T-053** Implementasi method `saveResult(result: RcaResponseDto): Promise<void>` — simpan ke tabel `rca_results` via Drizzle
- [x] **T-054** Implementasi method `getHistory(limit?: number): Promise<RcaResponseDto[]>` — ambil dari tabel `rca_results`

### 4.5 Controller

- [x] **T-055** Tambahkan endpoint `POST /analysis/rca` — memanggil `analyzeLog()` dan `saveResult()`
- [x] **T-056** Tambahkan endpoint `POST /analysis/rca/stream` — memanggil `analyzeLogStream()` sebagai SSE (`@Sse()`)
- [x] **T-057** Tambahkan endpoint `GET /analysis/history` — memanggil `getHistory()`
- [x] **T-058** Tambahkan `@Body()` validation via `class-validator` pada endpoint POST

---

## Phase 5 — Frontend: Project Setup

### 5.1 Inisialisasi React + Vite

- [ ] **T-059** Buat project React + Vite + TypeScript di folder `client/` di root project: `npm create vite@latest client -- --template react-ts`
- [ ] **T-060** Install dependencies frontend: `axios`, `react-router-dom`, `date-fns`
- [ ] **T-061** Install UI library pilihan (contoh: `lucide-react` untuk icons)
- [ ] **T-062** Buat `client/.env` dengan `VITE_API_URL=http://localhost:3000`

### 5.2 Struktur Folder Frontend

- [ ] **T-063** Buat struktur folder: `src/api/`, `src/components/`, `src/pages/`, `src/hooks/`, `src/types/`
- [ ] **T-064** Buat `src/api/client.ts` — setup Axios instance dengan `baseURL` dari `VITE_API_URL`
- [ ] **T-065** Buat `src/api/loki.api.ts` — fungsi `fetchLogs()`, `fetchLabels()`, `fetchLabelValues()`
- [ ] **T-066** Buat `src/api/analysis.api.ts` — fungsi `triggerRca()`, `fetchHistory()`
- [ ] **T-067** Buat `src/api/ollama.api.ts` — fungsi `fetchModels()`
- [ ] **T-068** Buat `src/types/loki.types.ts` — mirror dari backend DTO (LokiStream, dsb.)
- [ ] **T-069** Buat `src/types/analysis.types.ts` — mirror dari backend DTO (RcaResponse, dsb.)

### 5.3 Routing

- [ ] **T-070** Setup `react-router-dom` di `App.tsx` dengan routes: `/` (Dashboard), `/logs` (Log Explorer), `/history` (RCA History)
- [ ] **T-071** Buat komponen `Navbar` dengan navigasi ke semua halaman

---

## Phase 6 — Frontend: Log Explorer

- [ ] **T-072** Buat halaman `LogExplorerPage` di `src/pages/`
- [ ] **T-073** Buat komponen `TimeRangeSelector` — dropdown preset (1j, 6j, 24j, 7h) + custom date picker
- [ ] **T-074** Buat komponen `LabelFilter` — dropdown multi-select untuk label Loki (fetch dari `/loki/labels`)
- [ ] **T-075** Buat komponen `LogList` — render list log entries dari API response
- [ ] **T-076** Buat komponen `LogItem` — satu baris log dengan: timestamp, severity badge, log message (truncated)
- [ ] **T-077** Severity badge diberi warna: ERROR=merah, WARN=kuning, INFO=biru, DEBUG=abu
- [ ] **T-078** Buat komponen `LogDetailPanel` — side panel/modal yang tampil saat log diklik (full message, stack trace, all labels)
- [ ] **T-079** Tambahkan tombol **"Analyze"** di `LogDetailPanel` yang trigger RCA
- [ ] **T-080** Implementasi pemanggilan `fetchLogs()` di `LogExplorerPage` dengan params dari filter yang dipilih
- [ ] **T-081** Tampilkan loading state saat data sedang di-fetch
- [ ] **T-082** Tampilkan empty state jika tidak ada log ditemukan
- [ ] **T-083** Tampilkan error state jika request gagal

---

## Phase 7 — Frontend: RCA Panel

- [ ] **T-084** Buat komponen `RcaPanel` — tampil di dalam `LogDetailPanel` setelah tombol "Analyze" diklik
- [ ] **T-085** `RcaPanel` menampilkan loading/spinner saat RCA sedang diproses
- [ ] **T-086** Implementasi **streaming** di `RcaPanel` via `EventSource` (SSE) ke endpoint `POST /analysis/rca/stream`
- [ ] **T-087** Tampilkan hasil RCA dalam 3 section terpisah: **Penyebab**, **Dampak**, **Rekomendasi**
- [ ] **T-088** Buat komponen `ModelSelector` — dropdown pilih model Ollama (fetch dari `/ollama/models`)
- [ ] **T-089** Pasang `ModelSelector` di atas tombol "Analyze" di `LogDetailPanel`
- [ ] **T-090** Tampilkan error state jika RCA gagal (misal Ollama tidak running)

---

## Phase 8 — Frontend: Dashboard Overview

- [ ] **T-091** Buat halaman `DashboardPage` di `src/pages/`
- [ ] **T-092** Buat komponen `HealthStatus` — tampilkan status koneksi Loki dan Ollama (hit `/loki/labels` & `/ollama/models` untuk health check)
- [ ] **T-093** Buat komponen `ErrorCountCard` — tampilkan total error count dari Loki dalam time range tertentu
- [ ] **T-094** Buat komponen `ErrorTrendChart` — line chart error count per waktu (gunakan library: `recharts` atau `chart.js`)
- [ ] **T-095** Install chart library pilihan: `npm install recharts`
- [ ] **T-096** Buat komponen `RecentRcaList` — tampilkan 5 hasil RCA terakhir dari `/analysis/history`

---

## Phase 9 — Frontend: RCA History

- [ ] **T-097** Buat halaman `HistoryPage` di `src/pages/`
- [ ] **T-098** Buat komponen `HistoryTable` — tabel semua hasil RCA tersimpan (timestamp, log snippet, model, root cause preview)
- [ ] **T-099** Klik row di `HistoryTable` → tampilkan modal detail lengkap hasil RCA
- [ ] **T-100** Tambahkan search/filter sederhana di `HistoryTable` (filter by date atau keyword)

---

## Phase 10 — Integration & Polish

### 10.1 End-to-End Testing Flow

- [ ] **T-101** Test manual flow: buka Log Explorer → pilih filter → lihat log → klik log → klik Analyze → tunggu RCA streaming → verifikasi hasil
- [ ] **T-102** Test manual flow: buka Dashboard → verifikasi health status Loki & Ollama muncul
- [ ] **T-103** Test manual flow: buka History → verifikasi hasil RCA tersimpan tampil

### 10.2 Error Handling

- [ ] **T-104** Pastikan semua API error di backend return format konsisten `{ statusCode, message, error }`
- [ ] **T-105** Pastikan frontend menampilkan toast/notification saat request gagal
- [ ] **T-106** Tangani kasus Loki tidak bisa diakses di `LokiService` (sudah ada, verifikasi)
- [ ] **T-107** Tangani kasus Ollama tidak bisa diakses di `OllamaService`

### 10.3 UI Polish

- [ ] **T-108** Pastikan UI responsive (minimal layar 1280px)
- [ ] **T-109** Tambahkan dark mode atau tema konsisten ke seluruh halaman
- [ ] **T-110** Pastikan semua loading state ada dan tidak ada blank screen saat fetch

### 10.4 Dokumentasi

- [ ] **T-111** Update `README.md` root project dengan: cara setup, cara run backend, cara run frontend
- [ ] **T-112** Tambahkan section "Prerequisites" di README: Docker, Ollama, Node 18+
- [ ] **T-113** Dokumentasikan semua endpoint API di `docs/api.md` (method, path, params, response example)

---

## Checklist Summary

| Phase | Total Tasks | Done |
|---|---|---|
| Phase 0 — Infrastructure | 12 | 0 |
| Phase 1 — Backend Global | 4 | 0 |
| Phase 2 — Loki Module | 11 | 4 ✅ |
| Phase 3 — Ollama Module | 8 | 0 |
| Phase 4 — Analysis Module | 17 | 0 |
| Phase 5 — Frontend Setup | 13 | 0 |
| Phase 6 — Log Explorer | 12 | 0 |
| Phase 7 — RCA Panel | 7 | 0 |
| Phase 8 — Dashboard | 6 | 0 |
| Phase 9 — RCA History | 4 | 0 |
| Phase 10 — Integration | 13 | 0 |
| **Total** | **107** | **4** |

---

> 💡 **Urutan eksekusi yang disarankan:** Phase 0 → 1 → 2 → 3 → 4 (backend selesai dulu, bisa ditest via Postman/curl) → 5 → 6 → 7 → 8 → 9 → 10
