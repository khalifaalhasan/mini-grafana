# Monitoring Docker Compose (Loki + Grafana Alloy)

Konfigurasi Docker Compose terpisah untuk menjalankan stack observabilitas backend (**Grafana Loki** sebagai storage log dan **Grafana Alloy** sebagai agen/kolektor log) agar bisa di-deploy dengan mudah di server terpisah maupun tidak membebani laptop lokal.

> **Kenapa tidak ada Grafana UI?**  
> Karena antarmuka dasbor visual akan ditangani oleh aplikasi **Mini-Grafana** kita (React + Vite) yang langsung mengambil data dari Loki dan melakukan Root Cause Analysis dengan LLM.

## Cara Menjalankan Monitoring Stack:
```bash
cd monitoring
docker compose up -d
```

## Akses Service:
- **Loki API**: `http://localhost:3100` (`http://minigrafana-loki:3100` di dalam jaringan Docker)
- **Grafana Alloy UI**: `http://localhost:12345` (Web UI untuk melihat status collector Alloy)
- **Alloy HTTP Push Receiver**: `http://localhost:3101`

## File Konfigurasi:
- `loki-config.yml` — Konfigurasi server penyimpanan log Loki.
- `config.alloy` — Konfigurasi agen Grafana Alloy untuk mengumpulkan dan mengirim log ke Loki.
