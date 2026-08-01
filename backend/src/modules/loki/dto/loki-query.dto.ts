import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumberString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Interface dipakai internal di LokiService */
export interface LokiQueryParams {
  /** LogQL query string, e.g. '{app="myapp"}' */
  query: string;
  /** Start time as Unix nanoseconds or RFC3339 string */
  start?: string | number;
  /** End time as Unix nanoseconds or RFC3339 string */
  end?: string | number;
  /** Step interval for metric queries, e.g. '5m' or '300' (seconds) */
  step?: string | number;
  /** Maximum number of entries to return (default: 100) */
  limit?: number;
  /** Log entry direction: 'forward' | 'backward' (default: 'backward') */
  direction?: 'forward' | 'backward';
}

/** Class DTO untuk validasi @Query() di controller */
export class LokiQueryDto implements LokiQueryParams {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsString()
  step?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['forward', 'backward'])
  direction?: 'forward' | 'backward';
}
