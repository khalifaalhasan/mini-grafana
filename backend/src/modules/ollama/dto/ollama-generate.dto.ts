/**
 * Request payload untuk POST /api/generate pada Ollama REST API.
 */
export interface OllamaGenerateDto {
  /** Nama model yang digunakan, contoh: "llama3:8b" */
  model: string;
  /** System instruction prompt */
  system?: string;
  /** User prompt */
  prompt: string;
  /** Format response yang diinginkan, contoh: "json" */
  format?: 'json' | string;
  /** Mengaktifkan atau menonaktifkan streaming response */
  stream?: boolean;
  /** Durasi model tetap aktif di memori (VRAM), contoh: 0 untuk unload langsung */
  keep_alive?: number | string;
  /** Konfigurasi parameter model seperti temperature */
  options?: {
    temperature?: number;
    [key: string]: any;
  };
}
