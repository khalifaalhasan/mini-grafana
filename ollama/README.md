# Ollama Docker Compose (Terpisah)

Konfigurasi Docker Compose terpisah khusus untuk menjalankan **Ollama** lokal tanpa mengganggu ekosistem observabilitas utama (`postgresql`, `loki`, `grafana`) di root project.

## Cara Menjalankan Ollama via Docker:
```bash
cd ollama
docker compose up -d
```

## Pull Model Default (`llama3` / `llama3:8b`):
```bash
docker exec -it minigrafana-ollama ollama pull llama3
```
