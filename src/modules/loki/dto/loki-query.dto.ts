export interface LokiQueryParams {
  /** LogQL query string, e.g. '{app="myapp"}' */
  query: string;
  /** Start time as Unix nanoseconds or RFC3339 string */
  start?: string | number;
  /** End time as Unix nanoseconds or RFC3339 string */
  end?: string | number;
  /** Step interval for metric queries, e.g. '5m' or '300' (seconds) */
  step?: string | number;
  /** Maximum number of entries to return (default: 100) */
  limit?: number;
  /** Log entry direction: 'forward' | 'backward' (default: 'backward') */
  direction?: 'forward' | 'backward';
}
