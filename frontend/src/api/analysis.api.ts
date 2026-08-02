import apiClient from './client';
import type { RcaRequestDto, RcaResponse, RcaHistoryItem } from '@/types/analysis.types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

/**
 * Trigger RCA untuk satu log entry (non-streaming)
 */
export async function triggerRca(dto: RcaRequestDto): Promise<RcaResponse> {
  const { data } = await apiClient.post<RcaResponse>('/analysis/rca', dto);
  return data;
}

/**
 * Trigger RCA via Server-Sent Events (streaming)
 * Mengembalikan EventSource — caller bertanggung jawab menutupnya.
 *
 * Cara pakai:
 *   const es = triggerRcaStream(dto, (chunk) => console.log(chunk));
 *   // saat selesai:
 *   es.close();
 */
export function triggerRcaStream(
  dto: RcaRequestDto,
  onChunk: (chunk: string) => void,
  onDone?: () => void,
  onError?: (err: Event) => void,
): EventSource {
  // SSE dengan body tidak bisa via GET, tapi backend pakai POST /analysis/rca/stream
  // Karena EventSource hanya support GET, kita encode dto sebagai query param (atau gunakan fetch + ReadableStream)
  const params = new URLSearchParams({
    logMessage: dto.logMessage,
    ...(dto.model ? { model: dto.model } : {}),
    ...(dto.logTimestamp ? { logTimestamp: dto.logTimestamp } : {}),
    ...(dto.logLabels
      ? { logLabels: JSON.stringify(dto.logLabels) }
      : {}),
  });

  const url = `${API_BASE_URL}/analysis/rca/stream?${params.toString()}`;
  const es = new EventSource(url);

  es.onmessage = (event) => {
    onChunk(event.data);
  };

  es.addEventListener('done', () => {
    es.close();
    onDone?.();
  });

  es.onerror = (event) => {
    onError?.(event);
    es.close();
  };

  return es;
}

/**
 * Ambil riwayat hasil RCA dari database
 */
export async function fetchHistory(limit = 50): Promise<RcaHistoryItem[]> {
  const { data } = await apiClient.get<RcaHistoryItem[]>('/analysis/history', {
    params: { limit },
  });
  return data;
}
