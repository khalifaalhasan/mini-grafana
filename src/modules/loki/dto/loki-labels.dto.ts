/**
 * Response dari GET /loki/api/v1/labels
 * Mengembalikan daftar semua label keys yang tersedia di Loki.
 */
export interface LokiLabelsResponse {
  status: 'success' | 'error';
  data: string[];
}

/**
 * Response dari GET /loki/api/v1/label/{name}/values
 * Mengembalikan daftar values untuk satu label key tertentu.
 */
export interface LokiLabelValuesResponse {
  status: 'success' | 'error';
  data: string[];
}
