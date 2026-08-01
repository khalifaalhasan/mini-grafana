import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { LokiQueryParams } from './dto/loki-query.dto';
import { LokiQueryRangeResponse } from './dto/loki-response.dto';

@Injectable()
export class LokiService {
  constructor(
    @InjectPinoLogger(LokiService.name)
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
  ) {}


  /**
   * Base URL of the Loki instance, read from the LOKI_URL environment variable.
   * Falls back to 'http://localhost:3100' when not set.
   */
  private readonly lokiBaseUrl: string =
    process.env.LOKI_URL ?? 'http://localhost:3100';


  /**
   * Queries Loki's `/loki/api/v1/query_range` endpoint and returns log streams
   * (or metric matrix data) that match the given LogQL expression.
   *
   * @param params - Query parameters forwarded to the Loki API.
   * @returns The parsed JSON response from Loki.
   * @throws Will throw an error if the HTTP request fails or Loki returns a
   *         non-success status.
   */
  async queryRange(params: LokiQueryParams): Promise<LokiQueryRangeResponse> {
    const endpoint = `${this.lokiBaseUrl}/loki/api/v1/query_range`;

    this.logger.debug(`GET ${endpoint} query=${params.query}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<LokiQueryRangeResponse>(endpoint, {
          params: this.buildParams(params),
          headers: { Accept: 'application/json' },
        }),
      );

      if (data.status !== 'success') {
        this.logger.warn(
          `Loki query failed – errorType: ${data.errorType}, error: ${data.error}`,
        );
        throw new Error(
          `Loki query error [${data.errorType}]: ${data.error ?? 'unknown'}`,
        );
      }

      this.logger.debug(
        `Loki returned resultType="${data.data.resultType}" with ${data.data.result.length} result(s)`,
      );

      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status ?? 'N/A';
        const body = err.response?.data ?? err.message;
        this.logger.error(`Loki HTTP error ${status}: ${JSON.stringify(body)}`);
        throw new Error(`Loki HTTP ${status}: ${JSON.stringify(body)}`);
      }
      throw err;
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Converts LokiQueryParams into a plain object for Axios `params`,
   * omitting undefined/null/empty values so they are not sent as empty strings.
   */
  private buildParams(
    params: LokiQueryParams,
  ): Record<string, string | number> {
    const result: Record<string, string | number> = {
      query: params.query,
    };

    if (params.start !== undefined && params.start !== '')
      result.start = params.start;
    if (params.end !== undefined && params.end !== '')
      result.end = params.end;
    if (params.step !== undefined && params.step !== '')
      result.step = params.step;
    if (params.limit !== undefined) result.limit = params.limit;
    if (params.direction !== undefined) result.direction = params.direction;

    return result;
  }
}
