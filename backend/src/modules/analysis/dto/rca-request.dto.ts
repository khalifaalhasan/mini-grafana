import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RcaRequestDto {
  /**
   * Optional identifier dari log entry Loki (contoh: timestamp ns atau hash).
   * Jika tidak ada, akan digenerate otomatis.
   */
  @ApiPropertyOptional({
    example: 'log-1722510000-01',
    description: 'Identifier opsional dari log Loki',
  })
  @IsOptional()
  @IsString()
  logId?: string;

  /**
   * Pesan log mentah (raw log message) yang akan dianalisis.
   */
  @ApiProperty({
    example:
      'ERROR [UserService] NullPointerException: Cannot invoke method getUser() on null object',
    description: 'Pesan log error mentah dari Loki',
  })
  @IsString()
  @IsNotEmpty()
  logMessage: string;

  /**
   * Stream labels dari log Loki dalam format key-value object.
   * Contoh: { app: "payment-service", env: "production", level: "error" }
   */
  @ApiProperty({
    example: { app: 'payment-service', env: 'production', level: 'error' },
    description: 'Label metadata log dari Grafana Loki',
  })
  @IsObject()
  @IsNotEmpty()
  logLabels: Record<string, string>;

  /**
   * Waktu log terjadi (RFC3339 / ISO timestamp string).
   */
  @ApiProperty({
    example: '2026-08-01T12:00:00.000Z',
    description: 'Timestamp terjadinya log dalam format ISO string / RFC3339',
  })
  @IsString()
  @IsNotEmpty()
  logTimestamp: string;

  /**
   * Model Ollama yang ingin digunakan (opsional, fallback ke default model di env).
   * Contoh: "llama3", "mistral"
   */
  @ApiPropertyOptional({
    example: 'llama3:8b',
    description:
      'Model Ollama lokal yang digunakan untuk analisis (opsional, default: llama3)',
  })
  @IsOptional()
  @IsString()
  model?: string;
}
