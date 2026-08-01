import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { AnalysisService } from './analysis.service';
import { RcaRequestDto } from './dto/rca-request.dto';
import { RcaResponseDto } from './dto/rca-response.dto';

@ApiTags('Analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * POST /analysis/rca
   * Menganalisis log error dengan LLM lokal (Ollama) dan menyimpan hasilnya ke database.
   */
  @ApiOperation({
    summary: 'Analisis Root Cause log error',
    description:
      'Menganalisis pesan log error dan labelnya menggunakan LLM Ollama lokal serta menyimpan hasilnya ke PostgreSQL.',
  })
  @ApiBody({ type: RcaRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Hasil RCA terstruktur dalam JSON.',
    type: RcaResponseDto,
  })
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
  @ApiOperation({
    summary: 'Streaming RCA via Server-Sent Events (SSE)',
    description:
      'Menganalisis log error dan memancarkan respon per-chunk dari LLM Ollama secara realtime menggunakan protokol SSE.',
  })
  @ApiBody({ type: RcaRequestDto })
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
  @ApiOperation({
    summary: 'Riwayat analisis Root Cause',
    description:
      'Mengambil riwayat analisis log yang telah tersimpan di database PostgreSQL, diurutkan dari yang terbaru.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: '20',
    description: 'Jumlah riwayat maksimal yang ditampilkan',
  })
  @Get('history')
  getHistory(@Query('limit') limit?: string): Promise<RcaResponseDto[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const finalLimit = isNaN(parsedLimit) ? 20 : parsedLimit;
    return this.analysisService.getHistory(finalLimit);
  }
}
