# Product Requirements Document (PRD)
## Mini-Grafana — Local Log Monitoring & Root Cause Analysis Dashboard

| | |
|---|---|
| **Status** | 🟡 Draft |
| **Version** | 0.1.0 |
| **Author** | — |
| **Reviewer** | — |
| **Last Updated** | 2026-08-01 |
| **Target Launch** | — |

---

## 1. Executive Summary

Mini-Grafana adalah sistem dasbor pemantauan log error berbasis *observability tool* yang berjalan secara lokal (*on-premise*), terpisah dari aplikasi utama yang dipantau. Sistem ini mengintegrasikan **Grafana Loki** sebagai sumber log terstruktur, **React (Vite)** sebagai antarmuka pengguna, dan **Local LLM via Ollama** yang diorkestrasikan oleh backend **NestJS** untuk melakukan analisis akar masalah (*root cause analysis*) secara otomatis — tanpa bergantung pada layanan cloud eksternal.

---

## 2. Problem Statement

### 2.1 Latar Belakang
Tim engineering sering menghadapi kesulitan dalam mendiagnosis error di sistem produksi. Proses investigasi manual melalui log yang tersebar dan tidak terstruktur membutuhkan waktu yang lama dan keahlian khusus. Tools observability enterprise (Datadog, New Relic) mahal dan mengirim data ke cloud eksternal, yang menjadi hambatan untuk proyek dengan kebutuhan data privacy atau sumber daya terbatas.

### 2.2 Pain Points
| # | Pain Point | Dampak |
|---|---|---|
| P1 | Proses debug log error membutuhkan waktu lama | Developer tidak produktif saat incident |
| P2 | Log error tidak mudah dibaca/dipahami secara cepat | MTTR (Mean Time to Resolve) tinggi |
| P3 | Tidak ada tools gratis, lokal, dan terintegrasi | Ketergantungan pada cloud berbayar |
| P4 | Root cause harus dianalisis manual per-developer | Konsistensi analisis rendah |

### 2.3 Hipotesis
Dengan menyediakan dasbor log yang terpusat dan analisis root cause otomatis menggunakan LLM lokal, tim dapat mengurangi MTTR secara signifikan tanpa biaya cloud.

---

## 3. Goals & Non-Goals

### Goals ✅
- Menampilkan log error dari Grafana Loki dalam antarmuka yang mudah dibaca
- Mengeksekusi analisis root cause otomatis menggunakan Local LLM (Ollama) per-log atau per-batch
- Berjalan sepenuhnya lokal (*on-premise*), tidak ada data yang keluar ke internet
- Backend NestJS sebagai layer proxy, transformasi, dan orkestrasi LLM
- Sistem dapat digunakan sebagai alat bantu skripsi / penelitian observability

### Non-Goals ❌
- Bukan pengganti Grafana penuh (tidak ada alerting, metric dashboard, dsb.)
- Tidak mendukung multi-cluster / multi-tenant Loki
- Tidak ada fitur autentikasi/login (scope: single user lokal)
- Tidak memproses metric (Prometheus) — hanya log
- Tidak di-deploy ke cloud

---

## 4. User Stories

### Primary User: Developer / DevOps Engineer

| ID | User Story | Priority |
|---|---|---|
| US-01 | Sebagai developer, saya ingin melihat daftar log error terbaru dari sistem saya, agar saya tahu masalah apa yang sedang terjadi | 🔴 P0 |
| US-02 | Sebagai developer, saya ingin memfilter log berdasarkan waktu, label, dan severity, agar saya bisa fokus pada masalah yang relevan | 🔴 P0 |
| US-03 | Sebagai developer, saya ingin sistem secara otomatis menganalisis root cause dari sebuah error log, agar saya tidak perlu debug manual dari awal | 🔴 P0 |
| US-04 | Sebagai developer, saya ingin melihat hasil analisis LLM dalam format yang terstruktur (penyebab, solusi, rekomendasi), agar mudah dipahami | 🔴 P0 |
| US-05 | Sebagai developer, saya ingin melihat detail lengkap satu log entry (stack trace, context), agar saya bisa verifikasi hasil analisis LLM | 🟠 P1 |
| US-06 | Sebagai developer, saya ingin melakukan query log secara manual menggunakan LogQL, agar saya bisa eksplorasi log lebih lanjut | 🟠 P1 |
| US-07 | Sebagai developer, saya ingin menyimpan hasil analisis root cause, agar bisa dijadikan referensi di kemudian hari | 🟡 P2 |

---

## 5. Features & Requirements

### 5.1 Feature: Log Explorer
**Deskripsi:** Antarmuka utama untuk menelusuri log error dari Loki.

| Requirement ID | Requirement | Priority |
|---|---|---|
| F1-01 | Menampilkan daftar log entries dari Loki (query `query_range`) | P0 |
| F1-02 | Filter berdasarkan time range (preset: 1j, 6j, 24j, 7h; custom) | P0 |
| F1-03 | Filter berdasarkan label Loki (e.g., `app`, `env`, `level`) | P0 |
| F1-04 | Pagination / infinite scroll pada daftar log | P1 |
| F1-05 | Highlight severity level (ERROR, WARN, INFO) dengan warna berbeda | P1 |
| F1-06 | Klik log entry → tampil detail panel (stack trace, full message) | P1 |
| F1-07 | Manual LogQL query input | P2 |

### 5.2 Feature: Root Cause Analysis (RCA)
**Deskripsi:** Analisis otomatis menggunakan Local LLM (Ollama) terhadap log error yang dipilih.

| Requirement ID | Requirement | Priority |
|---|---|---|
| F2-01 | Tombol "Analyze" pada setiap log entry untuk trigger RCA | P0 |
| F2-02 | Backend mengirim log context ke Ollama dan mengembalikan hasil analisis | P0 |
| F2-03 | Hasil RCA menampilkan: **Penyebab**, **Dampak**, **Rekomendasi Solusi** | P0 |
| F2-04 | Streaming response dari Ollama (tidak perlu tunggu full response) | P1 |
| F2-05 | Pilihan model Ollama yang digunakan (dropdown) | P1 |
| F2-06 | Tombol "Analyze Batch" untuk analisis multiple logs sekaligus | P2 |
| F2-07 | Simpan hasil RCA ke database lokal (PostgreSQL via Drizzle ORM) | P2 |

### 5.3 Feature: Dashboard Overview
**Deskripsi:** Halaman ringkasan statistik error.

| Requirement ID | Requirement | Priority |
|---|---|---|
| F3-01 | Total error count per time range | P1 |
| F3-02 | Error trend chart (line/bar) berdasarkan waktu | P1 |
| F3-03 | Top error messages (most frequent) | P2 |
| F3-04 | Status koneksi Loki & Ollama (health check indicator) | P1 |

---

## 6. Technical Architecture

### 6.1 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│              React (Vite) + TypeScript                  │
│         [Log Explorer] [RCA Panel] [Dashboard]          │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP REST / SSE (streaming)
┌───────────────────────▼─────────────────────────────────┐
│                    BACKEND LAYER                        │
│                  NestJS (TypeScript)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ LokiModule  │  │ OllamaModule │  │ StorageModule │  │
│  │ (HTTP proxy)│  │ (LLM bridge) │  │ (PostgreSQL)  │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
└─────────┼────────────────┼──────────────────┼──────────┘
          │                │                  │
    ┌─────▼──────┐  ┌──────▼───────┐  ┌───────▼───────┐
    │ Grafana    │  │    Ollama    │  │  PostgreSQL   │
    │   Loki     │  │ (Local LLM) │  │  (Drizzle ORM)│
    └────────────┘  └─────────────┘  └───────────────┘
```

### 6.2 Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | React + Vite + TypeScript | SPA, komunikasi via REST |
| Backend | NestJS + TypeScript | REST API, proxy, orkestrasi |
| HTTP Client | `@nestjs/axios` + Axios | Komunikasi ke Loki & Ollama |
| Logger | `nestjs-pino` + Pino | Structured logging |
| Database | PostgreSQL | Simpan hasil RCA |
| ORM | Drizzle ORM | Type-safe DB queries |
| Log Source | Grafana Loki | Sumber log terstruktur |
| LLM Runtime | Ollama (Local) | Inferensi LLM on-premise |
| Config | `dotenv` | Environment variables |

### 6.3 Module Struktur NestJS

```
src/
├── modules/
│   ├── loki/               # Ambil & query log dari Loki
│   │   ├── dto/
│   │   ├── loki.controller.ts
│   │   ├── loki.service.ts
│   │   └── loki.module.ts
│   ├── ollama/             # Bridge ke Ollama LLM
│   │   ├── dto/
│   │   ├── ollama.controller.ts
│   │   ├── ollama.service.ts
│   │   └── ollama.module.ts
│   └── analysis/           # Orkestrasi RCA (Loki + Ollama)
│       ├── analysis.controller.ts
│       ├── analysis.service.ts
│       └── analysis.module.ts
└── lib/
    └── db/                 # Drizzle ORM schema & connection
```

---

## 7. API Design (Backend → Frontend)

### 7.1 Loki Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/loki/logs` | Query log dari Loki (`query_range`) |
| `GET` | `/loki/labels` | Ambil label keys dari Loki |
| `GET` | `/loki/label/:name/values` | Ambil values dari satu label |

**Query Params `/loki/logs`:**
```
query     : string  (LogQL, required)
start     : string  (RFC3339 / unix ns)
end       : string  (RFC3339 / unix ns)
limit     : number  (default: 100)
direction : 'forward' | 'backward'
```

### 7.2 Ollama / Analysis Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/analysis/rca` | Trigger RCA untuk 1 log entry |
| `POST` | `/analysis/rca/stream` | Streaming RCA (SSE) |
| `GET`  | `/analysis/models` | Daftar model Ollama tersedia |
| `GET`  | `/analysis/history` | Riwayat hasil RCA tersimpan |

---

## 8. Data Model

### 8.1 RCA Result (PostgreSQL)

```ts
// Drizzle ORM schema
rca_results {
  id          : uuid (PK)
  log_id      : string       // identifier log entry dari Loki
  log_message : text         // raw log message
  log_labels  : jsonb        // Loki stream labels
  log_timestamp: timestamp
  model_used  : string       // nama model Ollama
  root_cause  : text         // hasil analisis: penyebab
  impact      : text         // hasil analisis: dampak
  recommendation : text      // hasil analisis: solusi
  raw_response : text        // full LLM response
  created_at  : timestamp
}
```

---

## 9. Environment Variables

```env
# Loki
LOKI_URL=http://localhost:3100

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mini_grafana

# App
PORT=3000
NODE_ENV=development
```

---

## 10. Success Metrics

| Metric | Target | Cara Ukur |
|---|---|---|
| MTTR (Mean Time to Resolve) | Berkurang ≥30% dibanding manual | Survey / perbandingan waktu |
| Akurasi RCA LLM | ≥70% root cause relevan | Manual review hasil analisis |
| Waktu response RCA | ≤10 detik (model kecil) | Benchmark Ollama |
| Uptime sistem | ≥99% (lokal, no-downtime) | Monitoring manual |
| Log query latency | ≤500ms untuk 100 entries | Performance test |

---

## 11. Milestones & Timeline

| Milestone | Deliverable | Target |
|---|---|---|
| M1 — Backend Foundation | NestJS setup, Loki service, Ollama service | — |
| M2 — API Layer | LokiController, OllamaController, AnalysisController | — |
| M3 — Frontend Base | React + Vite setup, Log Explorer page | — |
| M4 — RCA Integration | RCA flow end-to-end, streaming response | — |
| M5 — Dashboard | Overview stats, health check, error trends | — |
| M6 — Storage | Drizzle ORM, simpan & tampil riwayat RCA | — |
| M7 — Polish & Testing | UI/UX polish, integration testing, dokumentasi | — |

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigasi |
|---|---|---|---|
| Kualitas output LLM tidak konsisten | Tinggi | Tinggi | Gunakan prompt engineering yang terstruktur + few-shot examples |
| Ollama lambat di hardware terbatas | Tinggi | Medium | Pilih model ringan (Phi-3 mini, Gemma 2B); tampilkan streaming |
| Loki tidak terpasang di environment target | Medium | Tinggi | Sediakan docker-compose untuk setup lokal Loki |
| Scope creep skripsi | Medium | Medium | Batasi pada 3 fitur inti: Log Explorer, RCA, Dashboard |

---

## 13. Open Questions

> ⚠️ Pertanyaan berikut perlu dijawab sebelum development lanjut:

- [ ] Model Ollama mana yang akan digunakan sebagai default? (llama3, mistral, phi3, dsb.)
- [ ] Apakah perlu autentikasi sederhana (misal: API key env) atau benar-benar open?
- [ ] Format log di aplikasi utama — apakah sudah JSON structured atau masih plaintext?
- [ ] Label Loki apa yang sudah terdefinisi di sumber log? (contoh: `app`, `env`, `level`)
- [ ] Apakah hasil RCA perlu diekspor ke format tertentu (PDF, CSV) untuk keperluan skripsi?
- [ ] Target hardware minimum untuk menjalankan Ollama (RAM, GPU)?

---

## 14. References

- [Grafana Loki API Docs](https://grafana.com/docs/loki/latest/api/)
- [Ollama REST API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [nestjs-pino](https://github.com/iamolegga/nestjs-pino)

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
