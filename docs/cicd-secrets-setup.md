# Konfigurasi CI/CD & GitHub Secrets — Mini-Grafana Backend

Dokumen ini menjelaskan daftar variabel rahasia (*Repository Secrets*) yang wajib dikonfigurasi di GitHub agar alur **Continuous Deployment (CD) & Automatic Database Migration** (`.github/workflows/deploy.yml`) dapat berjalan dengan sukses.

---

## 1. Daftar GitHub Repository Secrets (`Settings` > `Secrets and variables` > `Actions`)

### 1.1 Kredensial Server & SSH
| Nama Secret | Deskripsi | Contoh Nilai |
|---|---|---|
| `SERVER_HOST` | Alamat IP publik atau domain server production | `103.123.45.67` atau `api.minigrafana.com` |
| `SERVER_PORT` | Port SSH di server | `22` |
| `SERVER_USER` | Username SSH di server yang memiliki akses Docker & Git | `ubuntu` atau `deploy` |
| `SSH_PRIVATE_KEY` | Private key SSH (`~/.ssh/id_rsa` / `id_ed25519`) untuk autentikasi | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `SSH_PASSPHRASE` | (Opsional) Passphrase jika private key dienkripsi | `rahasia123` |

### 1.2 Lingkungan Aplikasi & Database
| Nama Secret | Deskripsi | Contoh Nilai |
|---|---|---|
| `PORT` | Port aplikasi NestJS di server | `3000` |
| `CORS_ORIGIN` | Allowed origin untuk CORS frontend | `https://app.minigrafana.com` |
| `DATABASE_URL` | Connection string Drizzle ORM ke PostgreSQL | `postgres://minigrafana:pass123@minigrafana-postgres:5432/db_mini_grafana` |
| `POSTGRES_USER` | Username database PostgreSQL | `minigrafana` |
| `POSTGRES_PASSWORD` | Password database PostgreSQL | `pass123` |
| `POSTGRES_DB` | Nama database PostgreSQL | `db_mini_grafana` |
| `LOKI_URL` | URL internal container Loki di jaringan Docker | `http://minigrafana-loki:3100` |
| `OLLAMA_URL` | URL internal container Ollama di jaringan Docker | `http://minigrafana-ollama:11434` |
| `OLLAMA_DEFAULT_MODEL` | Model LLM default yang digunakan untuk analisis RCA | `llama3:8b` |

---

## 2. Cara Kerja Alur Migrasi Database Otomatis di CD

Pada step ke-4 di file `.github/workflows/deploy.yml`:
```bash
docker run --rm --network minigrafana-net --env-file .env mini-grafana-backend:latest bun run db:migrate
```

1. Setelah Image Docker terbaru berhasil dibangun (`docker build`), GitHub Actions akan meluncurkan kontainer sementara yang terhubung ke jaringan `minigrafana-net`.
2. Kontainer menjalankan perintah `bun run db:migrate` (`drizzle-kit migrate`) menggunakan variabel lingkungan di `.env` yang dibuat dari rahasia GitHub (`DATABASE_URL`).
3. Seluruh skema tabel baru atau perubahan struktur tabel di database PostgreSQL (`rca_results`, dll.) akan diaplikasikan **sebelum** aplikasi utama direstart.
4. Jika migrasi gagal, proses deployment otomatis berhenti sehingga sistem produksi tetap aman dan tidak mengalami konsistensi data yang rusak.
