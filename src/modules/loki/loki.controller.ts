import { Controller, Get, Param, Query } from '@nestjs/common';
import { LokiService } from './loki.service';
import { LokiQueryDto } from './dto/loki-query.dto';
import { LokiQueryRangeResponse } from './dto/loki-response.dto';

@Controller('loki')
export class LokiController {
  constructor(private readonly lokiService: LokiService) {}

  /**
   * GET /loki/logs
   * Query log entries dari Loki menggunakan LogQL.
   *
   * @example GET /loki/logs?query={app="myapp"}&limit=50&direction=backward
   */
  @Get('logs')
  queryLogs(@Query() query: LokiQueryDto): Promise<LokiQueryRangeResponse> {
    return this.lokiService.queryRange(query);
  }

  /**
   * GET /loki/labels
   * Ambil semua label keys yang tersedia di Loki.
   */
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
  @Get('label/:name/values')
  getLabelValues(@Param('name') name: string): Promise<string[]> {
    return this.lokiService.getLabelValues(name);
  }
}
