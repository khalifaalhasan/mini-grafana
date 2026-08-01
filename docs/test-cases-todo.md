# Test Cases TODO List — Mini-Grafana Backend & API

Dokumen ini berisi daftar skenario pengujian (*test cases*) yang wajib dijalankan untuk memverifikasi fungsionalitas, keandalan, serta penanganan error (*error handling*) pada seluruh modul backend Mini-Grafana.

---

## 1. Modul Loki (`LokiModule`)

### 1.1 Endpoint `GET /loki/logs`
- [ ] **TC-LOKI-01**: Berhasil mengambil rentang log dengan query LogQL valid (`?query={app="payment"}&limit=20`) dan status `200 OK`.
- [ ] **TC-LOKI-02**: Mengembalikan daftar stream log yang terurut dengan benar sesuai parameter `direction=backward`.
- [ ] **TC-LOKI-03**: Menangani query LogQL dengan karakter spesial atau string kosong tanpa *crash* (`400 Bad Request` dari Loki diteruskan dengan rapi).
- [ ] **TC-LOKI-04**: Mengembalikan pesan error yang jelas jika server Grafana Loki mati atau tidak dapat dijangkau (*connection refused*).

### 1.2 Endpoint `GET /loki/labels` & `GET /loki/label/:name/values`
- [ ] **TC-LOKI-05**: `GET /loki/labels` mengembalikan array string berisi daftar nama label yang tersedia di Loki (contoh: `["app", "env", "level"]`).
- [ ] **TC-LOKI-06**: `GET /loki/label/:name/values` berhasil mengembalikan nilai dari label yang ada (`/loki/label/app/values` -> `["payment", "user"]`).
- [ ] **TC-LOKI-07**: `GET /loki/label/:name/values` mengembalikan array kosong `[]` jika label name tidak ditemukan.

---

## 2. Modul Ollama (`OllamaModule`)

### 2.1 Endpoint `GET /ollama/models`
- [ ] **TC-OLLAMA-01**: `GET /ollama/models` mengembalikan array string nama model yang terpasang di Ollama lokal (`["llama3:8b", "mistral:7b"]`).
- [ ] **TC-OLLAMA-02**: Menangani kondisi ketika Ollama daemon lokal tidak aktif/offline dengan error yang informatif.

### 2.2 Service Generation & Streaming (`OllamaService`)
- [ ] **TC-OLLAMA-03**: Method `generate()` dengan payload `format: 'json'` menghasilkan string JSON yang 100% valid secara deterministik (`temperature: 0`).
- [ ] **TC-OLLAMA-04**: Method `generateStream()` memancarkan data token secara berurutan dalam bentuk `Observable<string>` tanpa terputus.

---

## 3. Modul Analysis & RCA (`AnalysisModule`)

### 3.1 Endpoint `POST /analysis/rca`
- [ ] **TC-RCA-01**: Berhasil memproses request dengan DTO valid dan menghasilkan response bertipe `RcaResponseDto` (`201 Created`).
- [ ] **TC-RCA-02**: Memastikan struktur JSON output dari LLM memuat tepat 3 key: `root_cause`, `impact`, `recommendation` dalam Bahasa Indonesia yang profesional.
- [ ] **TC-RCA-03**: Memastikan hasil RCA otomatis tersimpan ke dalam database PostgreSQL pada tabel `rca_results` via Drizzle ORM.
- [ ] **TC-RCA-04**: Jika LLM mengembalikan format markdown bertanda ```json, sistem melakukan *safety regex fallback* dan berhasil mengurai JSON tanpa error.

### 3.2 Endpoint `POST /analysis/rca/stream` (SSE)
- [ ] **TC-RCA-05**: Endpoint streaming SSE (`POST /analysis/rca/stream`) mengembalikan response dengan header `Content-Type: text/event-stream`.
- [ ] **TC-RCA-06**: Setiap chunk teks analisis dipancarkan sebagai `MessageEvent` yang dapat dibaca secara realtime oleh *frontend client*.

### 3.3 Endpoint `GET /analysis/history`
- [ ] **TC-RCA-07**: `GET /analysis/history` mengembalikan riwayat analisis RCA dari database PostgreSQL diurutkan berdasarkan `createdAt DESC`.
- [ ] **TC-RCA-08**: Parameter opsional `?limit=5` membatasi jumlah record yang dikembalikan menjadi maksimal 5 item.
- [ ] **TC-RCA-09**: Jika belum ada riwayat analisis di database, endpoint mengembalikan array kosong `[]` dengan status `200 OK`.

### 3.4 Validasi DTO (`RcaRequestDto` via `class-validator`)
- [ ] **TC-VAL-01**: Gagal (`400 Bad Request`) apabila `logMessage` kosong atau tidak ada.
- [ ] **TC-VAL-02**: Gagal (`400 Bad Request`) apabila `logLabels` bukan berupa object atau kosong.
- [ ] **TC-VAL-03**: Gagal (`400 Bad Request`) apabila ada properti asing (*non-whitelisted property*) dalam request body.
- [ ] **TC-VAL-04**: Menggunakan default model yang terkonfigurasi di `OLLAMA_DEFAULT_MODEL` jika field `model` pada DTO tidak dikirim.

---

## 4. Dokumentasi API (Swagger OpenAPI)

- [ ] **TC-SWAGGER-01**: Endpoint `http://localhost:3000/api/docs` dapat diakses melalui browser dan menampilkan antarmuka Swagger UI.
- [ ] **TC-SWAGGER-02**: Setiap endpoint (`loki`, `ollama`, `analysis`) terstruktur rapi sesuai tag, deskripsi, contoh request, dan skema response DTO.
- [ ] **TC-SWAGGER-03**: Endpoint `http://localhost:3000/api/docs-json` menghasilkan skema OpenAPI 3.0 valid yang dapat diimpor ke Postman/Insomnia.
