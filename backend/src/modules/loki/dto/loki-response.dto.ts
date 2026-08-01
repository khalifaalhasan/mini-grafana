export interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

export interface LokiMatrixSample {
  metric: Record<string, string>;
  values: [number, string][];
}

export type LokiResultType = 'streams' | 'matrix' | 'vector';

export interface LokiQueryRangeResult {
  resultType: LokiResultType;
  result: LokiStream[] | LokiMatrixSample[];
  stats?: Record<string, unknown>;
}

export interface LokiQueryRangeResponse {
  status: 'success' | 'error';
  data: LokiQueryRangeResult;
  errorType?: string;
  error?: string;
}
