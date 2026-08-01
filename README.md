# mini-grafana

> **Local Log Monitoring & Root Cause Analysis Dashboard**
>
> Sistem observability lokal (*on-premise*) yang mengambil log error dari Grafana Loki, menampilkannya di antarmuka React (Vite), dan mengeksekusi analisis akar masalah (root cause analysis) secara otomatis menggunakan Local LLM via Ollama.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | NestJS + TypeScript |
| HTTP Client | `@nestjs/axios` + Axios |
| Logger | `nestjs-pino` + Pino |
| Database | PostgreSQL (Drizzle ORM) |
| Log Source | Grafana Loki |
| LLM Runtime | Ollama (Local) |
| Frontend | React + Vite + TypeScript *(coming soon)* |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/) / [Podman](https://podman.io/)
- [Ollama](https://ollama.com/) — untuk Local LLM

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/khalifaalhasan/mini-grafana.git
cd mini-grafana
bun install
```

### 2. Konfigurasi Environment

Salin file env template dan sesuaikan nilainya:

```bash
cp .env.example .env
```

Isi nilai berikut di `.env`:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgres://minigrafana:password@localhost:5432/db_mini_grafana
POSTGRES_USER=minigrafana
POSTGRES_PASSWORD=password
POSTGRES_DB=db_mini_grafana

# Loki
LOKI_URL=http://localhost:3100

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3
```

### 3. Jalankan Database (PostgreSQL)

```bash
docker compose up -d
# atau dengan Podman:
podman compose up -d
```

### 4. Jalankan Migration Database

```bash
bunx drizzle-kit migrate
```

### 5. Jalankan Backend

```bash
# development (watch mode)
bun run start:dev

# production
bun run start:prod
```

Backend berjalan di: `http://localhost:3000`

---

## API Endpoints

### Loki

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/loki/logs` | Query log dari Loki (`query_range`) |
| `GET` | `/loki/labels` | Ambil label keys |
| `GET` | `/loki/label/:name/values` | Ambil values dari satu label |

**Query params `/loki/logs`:**

```
query     : string   (LogQL, required)
start     : string   (RFC3339 / unix nanoseconds)
end       : string   (RFC3339 / unix nanoseconds)
limit     : number   (default: 100)
direction : 'forward' | 'backward'
```

### Analysis (RCA)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/analysis/rca` | Trigger Root Cause Analysis |
| `POST` | `/analysis/rca/stream` | Streaming RCA via SSE |
| `GET` | `/analysis/history` | Riwayat hasil RCA |
| `GET` | `/ollama/models` | Daftar model Ollama tersedia |

---

## Struktur Project

```
src/
├── lib/
│   └── db/
│       ├── drizzle.ts          # Koneksi database
│       ├── drizzle.module.ts   # NestJS provider (DB_TOKEN)
│       └── schema.ts           # Drizzle schema (rca_results)
├── modules/
│   ├── loki/                   # Proxy ke Grafana Loki
│   │   ├── dto/
│   │   ├── loki.controller.ts
│   │   ├── loki.service.ts
│   │   └── loki.module.ts
│   ├── ollama/                 # Bridge ke Ollama LLM
│   │   ├── dto/
│   │   ├── ollama.controller.ts
│   │   ├── ollama.service.ts
│   │   └── ollama.module.ts
│   └── analysis/               # Orkestrasi RCA
│       ├── dto/
│       ├── analysis.controller.ts
│       ├── analysis.service.ts
│       └── analysis.module.ts
├── app.module.ts
└── main.ts
docs/
├── prd.md                      # Product Requirements Document
└── tasks.md                    # Atomic task list
```

---

## Database Schema

Tabel `rca_results`:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `log_id` | `text` | Identifier log entry dari Loki |
| `log_message` | `text` | Raw log message |
| `log_labels` | `jsonb` | Loki stream labels |
| `log_timestamp` | `timestamptz` | Waktu log |
| `model_used` | `text` | Nama model Ollama |
| `root_cause` | `text` | Hasil analisis: penyebab |
| `impact` | `text` | Hasil analisis: dampak |
| `recommendation` | `text` | Hasil analisis: solusi |
| `raw_response` | `text` | Full LLM response |
| `created_at` | `timestamptz` | Auto: waktu analisis |

---

## Development Notes

- Gunakan **Bun** sebagai package manager (bukan npm/yarn)
- Log menggunakan **Pino** — output `pino-pretty` di development, raw JSON di production
- Drizzle ORM v1 RC — schema di-import langsung per-service, bukan di drizzle instance
- CORS default ke `http://localhost:5173` (Vite dev server)

---

## License

Private — Skripsi / Penelitian
