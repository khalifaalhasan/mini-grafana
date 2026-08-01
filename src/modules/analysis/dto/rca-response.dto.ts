/**
 * DTO untuk hasil Root Cause Analysis (RCA) yang dikembalikan oleh API.
 * Digunakan juga untuk item pada endpoint riwayat analisis (/analysis/history).
 */
export interface RcaResponseDto {
  /** UUID dari hasil analisis yang tersimpan di database */
  id?: string;
  /** Identifier log dari Loki */
  logId?: string;
  /** Pesan log yang dianalisis */
  logMessage?: string;
  /** Label-label log dari Loki */
  logLabels?: Record<string, string>;
  /** Waktu log terjadi */
  logTimestamp?: string | Date;
  /** Analisis akar masalah (root cause) */
  rootCause: string;
  /** Analisis dampak error (impact) */
  impact: string;
  /** Rekomendasi perbaikan (recommendation / remediation) */
  recommendation: string;
  /** Raw response mentah dari LLM */
  rawResponse: string;
  /** Model Ollama yang digunakan dalam analisis */
  modelUsed: string;
  /** Waktu analisis dibuat dan disimpan di database */
  createdAt?: string | Date;
}
