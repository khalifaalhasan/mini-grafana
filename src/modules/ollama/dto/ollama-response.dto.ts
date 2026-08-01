/**
 * Response dari POST /api/generate pada Ollama REST API.
 */
export interface OllamaGenerateResponseDto {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Item model dari response GET /api/tags pada Ollama REST API.
 */
export interface OllamaModelTag {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
}

/**
 * Response dari GET /api/tags pada Ollama REST API.
 */
export interface OllamaTagsResponseDto {
  models: OllamaModelTag[];
}
