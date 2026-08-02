// Mirror dari backend DTO: rca-response.dto.ts & rca-request.dto.ts

export interface RcaRequestDto {
  logMessage: string;
  logLabels?: Record<string, string>;
  logTimestamp?: string;
  model?: string;
}

export interface RcaResponse {
  rootCause: string;
  impact: string;
  recommendation: string;
  rawResponse?: string;
  modelUsed: string;
}

export interface RcaHistoryItem {
  id: string;
  logId?: string;
  logMessage: string;
  logLabels?: Record<string, string>;
  logTimestamp?: string;
  modelUsed: string;
  rootCause: string;
  impact: string;
  recommendation: string;
  rawResponse?: string;
  createdAt: string;
}

export interface OllamaModel {
  name: string;
  modified_at?: string;
  size?: number;
}
