import { Controller, Get } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * GET /ollama/models
   * Ambil daftar semua model yang tersedia di Ollama lokal.
   *
   * @example GET /ollama/models
   */
  @Get('models')
  getModels(): Promise<string[]> {
    return this.ollamaService.listModels();
  }
}
