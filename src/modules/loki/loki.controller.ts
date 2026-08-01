import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LokiService } from './loki.service';
import { LokiQueryDto } from './dto/loki-query.dto';
import { LokiQueryRangeResponse } from './dto/loki-response.dto';

@ApiTags('Loki')
@Controller('loki')
export class LokiController {
  constructor(private readonly lokiService: LokiService) {}

  /**
   * GET /loki/logs
   * Query log entries dari Loki menggunakan LogQL.
   *
   * @example GET /loki/logs?query={app="myapp"}&limit=50&direction=backward
   */
  @ApiOperation({
    summary: 'Query rentang log dari Loki',
    description:
      'Mengambil log berdasarkan LogQL query dalam format range dari Grafana Loki.',
  })
  @Get('logs')
  queryLogs(@Query() query: LokiQueryDto): Promise<LokiQueryRangeResponse> {
    return this.lokiService.queryRange(query);
  }

  /**
   * GET /loki/labels
   * Ambil semua label keys yang tersedia di Loki.
   */
  @ApiOperation({
    summary: 'Daftar semua label key dari Loki',
    description: 'Mengembalikan array nama label yang tersedia di Loki.',
  })
  @Get('labels')
  getLabels(): Promise<string[]> {
    return this.lokiService.getLabels();
  }

  /**
   * GET /loki/label/:name/values
   * Ambil semua values dari satu label key.
   *
   * @example GET /loki/label/app/values
   */
  @ApiOperation({
    summary: 'Daftar nilai untuk label tertentu',
    description:
      'Mengembalikan array seluruh nilai (value) untuk label key yang dipilih.',
  })
  @ApiParam({ name: 'name', example: 'app', description: 'Nama label key' })
  @Get('label/:name/values')
  getLabelValues(@Param('name') name: string): Promise<string[]> {
    return this.lokiService.getLabelValues(name);
  }
}
