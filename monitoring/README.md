# Monitoring Docker Compose (Terpisah)

Konfigurasi Docker Compose terpisah untuk menjalankan stack observabilitas (**Grafana & Loki**) agar bisa dengan mudah dijalankan di server terpisah maupun tidak membebani mesin lokal.

## Cara Menjalankan Monitoring Stack:
```bash
cd monitoring
docker compose up -d
```

## Akses Service:
- **Grafana**: `http://localhost:3001` (User: `admin`, Password: `admin`)
- **Loki**: `http://localhost:3100`

> **Catatan Jaringan (Shared Network)**:  
> Komponen ini terhubung ke dalam jaringan Docker bersama ber-name `minigrafana-net`. Sehingga di production, container lain (seperti NestJS backend) bisa memanggil langsung melalui host `http://minigrafana-loki:3100`.
