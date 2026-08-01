import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosError } from 'axios';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { OllamaGenerateDto } from './dto/ollama-generate.dto';
import {
  OllamaGenerateResponseDto,
  OllamaTagsResponseDto,
} from './dto/ollama-response.dto';

@Injectable()
export class OllamaService {
  constructor(
    @InjectPinoLogger(OllamaService.name)
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Base URL Ollama instance dari environment variable OLLAMA_URL.
   * Default fallback: http://localhost:11434
   */
  private readonly ollamaBaseUrl: string =
    process.env.OLLAMA_URL ?? 'http://localhost:11434';

  /**
   * Mengirim request non-streaming ke POST /api/generate Ollama.
   *
   * @param payload - Request body ke Ollama API.
   * @returns Teks response hasil generate LLM.
   */
  async generate(payload: OllamaGenerateDto): Promise<string> {
    const endpoint = `${this.ollamaBaseUrl}/api/generate`;

    this.logger.debug(
      `POST ${endpoint} model=${payload.model} format=${payload.format ?? 'default'}`,
    );

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<OllamaGenerateResponseDto>(
          endpoint,
          { ...payload, stream: false },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );

      this.logger.debug(`Ollama generation finished for model=${payload.model}`);
      return data.response;
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status ?? 'N/A';
        const body = err.response?.data ?? err.message;
        this.logger.error(`Ollama HTTP error ${status}: ${JSON.stringify(body)}`);
        throw new Error(`Ollama HTTP ${status}: ${JSON.stringify(body)}`);
      }
      throw err;
    }
  }

  /**
   * Mengirim request streaming ke POST /api/generate Ollama.
   * Mengembalikan Observable<string> yang memancarkan setiap chunk response.
   */
  generateStream(payload: OllamaGenerateDto): Observable<string> {
    const endpoint = `${this.ollamaBaseUrl}/api/generate`;

    this.logger.debug(
      `STREAM POST ${endpoint} model=${payload.model} format=${payload.format ?? 'default'}`,
    );

    return new Observable<string>((subscriber) => {
      this.httpService
        .post(
          endpoint,
          { ...payload, stream: true },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'stream',
          },
        )
        .subscribe({
          next: (response) => {
            const stream = response.data;
            let buffer = '';

            stream.on('data', (chunk: Buffer) => {
              buffer += chunk.toString('utf8');
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                  const parsed = JSON.parse(
                    trimmed,
                  ) as OllamaGenerateResponseDto;
                  if (parsed.response) {
                    subscriber.next(parsed.response);
                  }
                  if (parsed.done) {
                    subscriber.complete();
                  }
                } catch (e) {
                  this.logger.warn(`Failed to parse streaming JSON chunk: ${e}`);
                }
              }
            });

            stream.on('end', () => {
              if (buffer.trim()) {
                try {
                  const parsed = JSON.parse(
                    buffer.trim(),
                  ) as OllamaGenerateResponseDto;
                  if (parsed.response) {
                    subscriber.next(parsed.response);
                  }
                } catch (e) {
                  this.logger.warn(`Failed to parse trailing buffer: ${e}`);
                }
              }
              subscriber.complete();
            });

            stream.on('error', (err: any) => {
              this.logger.error(`Stream error: ${err.message}`);
              subscriber.error(err);
            });
          },
          error: (err) => {
            let errorMsg = err.message;
            if (err instanceof AxiosError) {
              const status = err.response?.status ?? 'N/A';
              const body = err.response?.data ?? err.message;
              errorMsg = `Ollama HTTP ${status}: ${JSON.stringify(body)}`;
            }
            this.logger.error(`Ollama stream error: ${errorMsg}`);
            subscriber.error(new Error(errorMsg));
          },
        });
    });
  }

  /**
   * Mengambil daftar model yang tersedia di Ollama.
   * Hits GET /api/tags.
   */
  async listModels(): Promise<string[]> {
    const endpoint = `${this.ollamaBaseUrl}/api/tags`;

    this.logger.debug(`GET ${endpoint}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<OllamaTagsResponseDto>(endpoint, {
          headers: { Accept: 'application/json' },
        }),
      );

      const modelNames = data.models.map((m) => m.name);
      this.logger.debug(
        `Ollama returned ${modelNames.length} model(s): ${modelNames.join(', ')}`,
      );
      return modelNames;
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status ?? 'N/A';
        const body = err.response?.data ?? err.message;
        this.logger.error(`Ollama HTTP error ${status}: ${JSON.stringify(body)}`);
        throw new Error(`Ollama HTTP ${status}: ${JSON.stringify(body)}`);
      }
      throw err;
    }
  }
}
