// Mirror dari backend DTO: loki-response.dto.ts

/** [timestamp_ns, log_line] */
export type LokiStreamValue = [string, string];

export interface LokiStream {
  stream: Record<string, string>;
  values: LokiStreamValue[];
}

export interface LokiQueryRangeResponse {
  status: string;
  data: {
    resultType: string;
    result: LokiStream[];
    stats?: Record<string, unknown>;
  };
}

export interface LokiLabelsResponse {
  status: string;
  data: string[];
}

export interface LokiLabelValuesResponse {
  status: string;
  data: string[];
}

// Flattened log entry untuk digunakan di UI
export interface LogEntry {
  id: string; // generated dari stream labels + timestamp
  timestamp: Date;
  timestampNs: string;
  message: string;
  labels: Record<string, string>;
  level: LogLevel;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'unknown';

export interface LokiQueryParams {
  query: string;
  start?: string;
  end?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}
