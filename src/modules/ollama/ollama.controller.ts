import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OllamaService } from './ollama.service';

@ApiTags('Ollama')
@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * GET /ollama/models
   * Ambil daftar semua model yang tersedia di Ollama lokal.
   *
   * @example GET /ollama/models
   */
  @ApiOperation({
    summary: 'Daftar model LLM di Ollama',
    description:
      'Mengambil daftar nama model LLM yang terpasang di instance Ollama lokal.',
  })
  @Get('models')
  getModels(): Promise<string[]> {
    return this.ollamaService.listModels();
  }
}
