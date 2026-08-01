# Konfigurasi CI/CD & GitHub Secrets — Mini-Grafana Monorepo

Dokumen ini menjelaskan daftar variabel rahasia (*Repository Secrets* & *Repository Variables*) yang wajib dikonfigurasi di GitHub agar alur **Continuous Deployment (CD)** untuk Backend (`deploy-backend.yml`), Frontend (`deploy-frontend.yml`), Monitoring (`deploy-monitoring.yml`), dan Ollama (`deploy-ollama.yml`) dapat berjalan dengan sukses di server masing-masing.

---

## 1. Daftar GitHub Repository Secrets (`Settings` > `Secrets and variables` > `Actions` > `Secrets`)

### 1.1 Kredensial Server & SSH
| Nama Secret | Deskripsi | Contoh Nilai |
|---|---|---|
| `SERVER_HOST` | Alamat IP publik atau domain server production | `103.123.45.67` atau `api.minigrafana.com` |
| `SERVER_PORT` | Port SSH di server | `22` |
| `SERVER_USER` | Username SSH di server yang memiliki akses Docker & Git | `ubuntu` atau `deploy` |
| `SSH_PRIVATE_KEY` | Private key SSH (`~/.ssh/id_rsa` / `id_ed25519`) untuk autentikasi | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `DEPLOY_PATH_BACKEND` | (Opsional / via Secret atau Variable) Direktori Backend di server | `/var/www/mini-grafana` |
| `DEPLOY_PATH_FRONTEND` | (Opsional) Direktori Frontend di server | `/var/www/mini-grafana-frontend` |
| `DEPLOY_PATH_MONITORING` | (Opsional) Direktori Monitoring (Loki+Alloy) di server | `/var/www/mini-grafana-monitoring` |
| `DEPLOY_PATH_OLLAMA` | (Opsional) Direktori Ollama di server | `/var/www/mini-grafana-ollama` |

### 1.2 Konfigurasi Lingkungan Produksi (Single Secrets Multi-line)
| Nama Secret | Penggunaan | Deskripsi & Contoh Format |
|---|---|---|
| `ENV_PROD_BACKEND` | Workflow Backend (`deploy-backend.yml`) | Isi lengkap file `.env` produksi untuk aplikasi NestJS & koneksi PostgreSQL |
| `ENV_FRONTEND` | Workflow Frontend (`deploy-frontend.yml`) | Isi file `.env` untuk Frontend React / Vite (`VITE_API_BASE_URL`) |
| `ENV_MONITORING` | Workflow Monitoring (`deploy-monitoring.yml`) | Isi file `.env` untuk port & konfigurasi Loki + Grafana Alloy |
| `ENV_OLLAMA` | Workflow Ollama (`deploy-ollama.yml`) | Isi file `.env` untuk port, origin, & keep_alive Ollama |

#### Contoh Isi Secret `ENV_PROD` (Backend):
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.minigrafana.com

## DB
DATABASE_URL=postgres://minigrafana:minigrafanapassword@minigrafana-postgres:5432/db_mini_grafana
POSTGRES_USER=minigrafana
POSTGRES_PASSWORD=minigrafanapassword
POSTGRES_DB=db_mini_grafana

## SERVICES
LOKI_URL=http://minigrafana-loki:3100
OLLAMA_URL=http://minigrafana-ollama:11434
OLLAMA_DEFAULT_MODEL=llama3:8b
GHCR_IMAGE=khalifaalhasan/mini-grafana-backend
```

#### Contoh Isi Secret `ENV_FRONTEND` (Frontend):
```env
VITE_API_BASE_URL=https://api.minigrafana.com
```

#### Contoh Isi Secret `ENV_MONITORING` (Monitoring):
```env
LOKI_PORT=3100
ALLOY_UI_PORT=12345
ALLOY_HTTP_PORT=3101
```

#### Contoh Isi Secret `ENV_OLLAMA` (Ollama):
```env
OLLAMA_PORT=11434
OLLAMA_ORIGINS=*
OLLAMA_KEEP_ALIVE=24h
```

---

## 2. Daftar GitHub Repository Variables (`Settings` > `Secrets and variables` > `Actions` > `Variables`)

| Nama Variable | Deskripsi | Contoh Nilai |
|---|---|---|
| `DEPLOY_PATH` | Direktori target proyek Backend di server | `/var/www/mini-grafana` |
| `DEPLOY_PATH_FRONTEND` | Direktori target Frontend di server | `/var/www/mini-grafana-frontend` |
| `DEPLOY_PATH_MONITORING` | Direktori target Monitoring stack di server | `/var/www/mini-grafana-monitoring` |
| `DEPLOY_PATH_OLLAMA` | Direktori target Ollama stack di server | `/var/www/mini-grafana-ollama` |

---

## 3. Alasan Pemisahan CI/CD & Deploy Path

1. **Efisiensi Server & Keterasingan Stack**: Seringkali Frontend (CDN/Static), Ollama (GPU/CPU-heavy), dan Monitoring (Loki storage) dipasang di server terpisah atau folder berbeda dari aplikasi Backend NestJS.
2. **Kontrol Independen**: Mengubah antarmuka UI Frontend atau konfigurasi Alloy tidak akan memicu restart pada aplikasi Backend atau menjalankan migrasi database.
