import apiClient from './client';
import type {
  LokiQueryRangeResponse,
  LokiLabelsResponse,
  LokiLabelValuesResponse,
  LokiQueryParams,
  LogEntry,
  LogLevel,
} from '@/types/loki.types';

/**
 * Query log dari Loki via backend proxy
 */
export async function fetchLogs(
  params: LokiQueryParams,
): Promise<LokiQueryRangeResponse> {
  const { data } = await apiClient.get<LokiQueryRangeResponse>('/loki/logs', {
    params,
  });
  return data;
}

/**
 * Ambil semua label keys dari Loki
 */
export async function fetchLabels(): Promise<string[]> {
  const { data } = await apiClient.get<LokiLabelsResponse>('/loki/labels');
  return data.data ?? [];
}

/**
 * Ambil values dari satu label Loki
 */
export async function fetchLabelValues(labelName: string): Promise<string[]> {
  const { data } = await apiClient.get<LokiLabelValuesResponse>(
    `/loki/label/${labelName}/values`,
  );
  return data.data ?? [];
}

/**
 * Helper: flatten LokiQueryRangeResponse menjadi array LogEntry yang flat
 * untuk digunakan lebih mudah di UI
 */
export function flattenLokiResponse(
  response: LokiQueryRangeResponse,
): LogEntry[] {
  const entries: LogEntry[] = [];

  for (const stream of response.data.result) {
    for (const value of stream.values) {
      const [timestampNs, message] = value;
      const labels = stream.stream;

      const level = detectLogLevel(labels, message);
      const id = `${timestampNs}-${Object.values(labels).join('-')}`;

      entries.push({
        id,
        timestamp: new Date(Number(BigInt(timestampNs) / 1_000_000n)),
        timestampNs,
        message,
        labels,
        level,
      });
    }
  }

  // Sort descending (terbaru dulu)
  return entries.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
}

function detectLogLevel(
  labels: Record<string, string>,
  message: string,
): LogLevel {
  const levelLabel =
    labels['level'] ?? labels['severity'] ?? labels['loglevel'] ?? '';
  const normalized = levelLabel.toLowerCase();

  if (normalized.includes('error') || normalized.includes('err')) return 'error';
  if (normalized.includes('warn')) return 'warn';
  if (normalized.includes('info')) return 'info';
  if (normalized.includes('debug')) return 'debug';

  // Fallback: cari di message
  const msgLower = message.toLowerCase();
  if (msgLower.includes('error') || msgLower.includes('exception'))
    return 'error';
  if (msgLower.includes('warn')) return 'warn';
  if (msgLower.includes('info')) return 'info';
  if (msgLower.includes('debug')) return 'debug';

  return 'unknown';
}
