import apiClient from './client';
import type { OllamaModel } from '@/types/analysis.types';

interface OllamaTagsResponse {
  models: OllamaModel[];
}

/**
 * Ambil daftar model Ollama yang tersedia via backend proxy
 */
export async function fetchModels(): Promise<OllamaModel[]> {
  const { data } = await apiClient.get<OllamaTagsResponse>('/ollama/models');
  return data.models ?? [];
}

/**
 * Ambil hanya nama model sebagai string array
 */
export async function fetchModelNames(): Promise<string[]> {
  const models = await fetchModels();
  return models.map((m) => m.name);
}
