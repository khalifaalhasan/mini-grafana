import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';

export class RcaRequestDto {
  /**
   * Optional identifier dari log entry Loki (contoh: timestamp ns atau hash).
   * Jika tidak ada, akan digenerate otomatis.
   */
  @IsOptional()
  @IsString()
  logId?: string;

  /**
   * Pesan log mentah (raw log message) yang akan dianalisis.
   */
  @IsString()
  @IsNotEmpty()
  logMessage: string;

  /**
   * Stream labels dari log Loki dalam format key-value object.
   * Contoh: { app: "payment-service", env: "production", level: "error" }
   */
  @IsObject()
  @IsNotEmpty()
  logLabels: Record<string, string>;

  /**
   * Waktu log terjadi (RFC3339 / ISO timestamp string).
   */
  @IsString()
  @IsNotEmpty()
  logTimestamp: string;

  /**
   * Model Ollama yang ingin digunakan (opsional, fallback ke default model di env).
   * Contoh: "llama3", "mistral"
   */
  @IsOptional()
  @IsString()
  model?: string;
}
