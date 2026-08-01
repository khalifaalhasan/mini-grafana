import { Injectable, Inject } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { desc } from 'drizzle-orm';
import { DB_TOKEN } from '../../lib/db/drizzle.module';
import type { Db } from '../../lib/db/drizzle';
import { rcaResults } from '../../lib/db/schema';
import { OllamaService } from '../ollama/ollama.service';
import { RcaRequestDto } from './dto/rca-request.dto';
import { RcaResponseDto } from './dto/rca-response.dto';
import { buildOllamaRcaPayload } from './constants/analysis.prompt';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectPinoLogger(AnalysisService.name)
    private readonly logger: PinoLogger,
    private readonly ollamaService: OllamaService,
    @Inject(DB_TOKEN)
    private readonly db: Db,
  ) {}

  /**
   * Melakukan Root Cause Analysis pada log error secara non-streaming.
   * Membangun prompt → memanggil Ollama → parsing response JSON.
   */
  async analyzeLog(dto: RcaRequestDto): Promise<RcaResponseDto> {
    const modelToUse =
      dto.model ?? process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3';

    this.logger.debug(
      `Analyzing log with model=${modelToUse} logId=${dto.logId ?? 'auto'}`,
    );

    const payload = buildOllamaRcaPayload(modelToUse, {
      logMessage: dto.logMessage,
      logLabels: dto.logLabels,
      logTimestamp: dto.logTimestamp,
    });

    const rawResponse = await this.ollamaService.generate(payload);

    let parsed: {
      root_cause?: string;
      impact?: string;
      recommendation?: string;
    } = {};

    try {
      parsed = JSON.parse(rawResponse);
    } catch (err) {
      this.logger.warn(
        `Ollama output is not valid JSON, trying cleanup: ${rawResponse}`,
      );
      // Fallback pembersihan jika LLM tetap mengembalikan markdown ticks
      const cleanJson = rawResponse.replace(/```json|```/g, '').trim();
      try {
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        this.logger.error(`Failed to parse Ollama JSON response: ${e}`);
        parsed = {
          root_cause: 'Gagal memparsing JSON dari respons model.',
          impact: 'Respons mentah tidak mengikuti struktur yang diminta.',
          recommendation: 'Periksa rawResponse untuk analisis manual.',
        };
      }
    }

    const logId = dto.logId ?? `log-${Date.now()}`;

    const result: RcaResponseDto = {
      logId,
      logMessage: dto.logMessage,
      logLabels: dto.logLabels,
      logTimestamp: dto.logTimestamp,
      rootCause: parsed.root_cause ?? 'Penyebab tidak diketahui',
      impact: parsed.impact ?? 'Dampak tidak diketahui',
      recommendation: parsed.recommendation ?? 'Rekomendasi tidak tersedia',
      rawResponse,
      modelUsed: modelToUse,
    };

    return result;
  }

  /**
   * Melakukan Root Cause Analysis pada log error secara streaming (chunk-by-chunk).
   * Mengembalikan Observable<string> dari Ollama generateStream().
   */
  analyzeLogStream(dto: RcaRequestDto): Observable<string> {
    const modelToUse =
      dto.model ?? process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3';

    this.logger.debug(`Streaming RCA log with model=${modelToUse}`);

    const payload = buildOllamaRcaPayload(modelToUse, {
      logMessage: dto.logMessage,
      logLabels: dto.logLabels,
      logTimestamp: dto.logTimestamp,
    });

    return this.ollamaService.generateStream(payload);
  }

  /**
   * Menyimpan hasil analisis Root Cause Analysis ke database (tabel rca_results).
   */
  async saveResult(result: RcaResponseDto): Promise<void> {
    let timestampDate: Date;
    if (result.logTimestamp instanceof Date) {
      timestampDate = result.logTimestamp;
    } else if (typeof result.logTimestamp === 'string') {
      const parsedDate = new Date(result.logTimestamp);
      timestampDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    } else {
      timestampDate = new Date();
    }

    await this.db.insert(rcaResults).values({
      logId: result.logId ?? `log-${Date.now()}`,
      logMessage: result.logMessage ?? '',
      logLabels: result.logLabels ?? {},
      logTimestamp: timestampDate,
      modelUsed: result.modelUsed,
      rootCause: result.rootCause,
      impact: result.impact,
      recommendation: result.recommendation,
      rawResponse: result.rawResponse,
    });

    this.logger.debug(`Saved RCA result to database for logId=${result.logId}`);
  }

  /**
   * Mengambil riwayat hasil Root Cause Analysis dari tabel rca_results,
   * diurutkan berdasarkan waktu pembuatan terbaru (descending).
   *
   * @param limit - Jumlah maksimal riwayat yang diambil (default: 20)
   */
  async getHistory(limit = 20): Promise<RcaResponseDto[]> {
    const records = await this.db
      .select()
      .from(rcaResults)
      .orderBy(desc(rcaResults.createdAt))
      .limit(limit);

    return records.map((record) => ({
      id: record.id,
      logId: record.logId,
      logMessage: record.logMessage,
      logLabels: record.logLabels,
      logTimestamp: record.logTimestamp,
      rootCause: record.rootCause,
      impact: record.impact,
      recommendation: record.recommendation,
      rawResponse: record.rawResponse,
      modelUsed: record.modelUsed,
      createdAt: record.createdAt,
    }));
  }
}
