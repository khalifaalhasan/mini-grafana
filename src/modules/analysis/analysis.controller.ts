import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { AnalysisService } from './analysis.service';
import { RcaRequestDto } from './dto/rca-request.dto';
import { RcaResponseDto } from './dto/rca-response.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * POST /analysis/rca
   * Menganalisis log error dengan LLM lokal (Ollama) dan menyimpan hasilnya ke database.
   */
  @Post('rca')
  async analyzeRca(@Body() dto: RcaRequestDto): Promise<RcaResponseDto> {
    const result = await this.analysisService.analyzeLog(dto);
    await this.analysisService.saveResult(result);
    return result;
  }

  /**
   * POST /analysis/rca/stream
   * Menganalisis log error secara streaming (SSE - Server-Sent Events).
   */
  @Post('rca/stream')
  @Sse('rca/stream')
  analyzeRcaStream(@Body() dto: RcaRequestDto): Observable<MessageEvent> {
    return this.analysisService.analyzeLogStream(dto).pipe(
      map((chunk) => ({
        data: chunk,
      })),
    );
  }

  /**
   * GET /analysis/history
   * Mengambil riwayat hasil Root Cause Analysis dari database PostgreSQL.
   *
   * @param limit - Jumlah maksimal riwayat yang diambil (optional, default: 20)
   */
  @Get('history')
  getHistory(@Query('limit') limit?: string): Promise<RcaResponseDto[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const finalLimit = isNaN(parsedLimit) ? 20 : parsedLimit;
    return this.analysisService.getHistory(finalLimit);
  }
}
