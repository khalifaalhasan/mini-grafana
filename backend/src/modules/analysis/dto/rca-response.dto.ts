import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO untuk hasil Root Cause Analysis (RCA) yang dikembalikan oleh API.
 * Digunakan juga untuk item pada endpoint riwayat analisis (/analysis/history).
 */
export class RcaResponseDto {
  /** UUID dari hasil analisis yang tersimpan di database */
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID unik hasil analisis',
  })
  id?: string;

  /** Identifier log dari Loki */
  @ApiPropertyOptional({
    example: 'log-1722510000',
    description: 'ID referensi log Loki',
  })
  logId?: string;

  /** Pesan log yang dianalisis */
  @ApiPropertyOptional({
    example: 'NullPointerException at com.example.service.UserService.getUser',
    description: 'Pesan log error mentah',
  })
  logMessage?: string;

  /** Label-label log dari Loki */
  @ApiPropertyOptional({
    example: { app: 'user-service', env: 'production' },
    description: 'Key-value label dari Loki',
  })
  logLabels?: Record<string, string>;

  /** Waktu log terjadi */
  @ApiPropertyOptional({
    example: '2026-08-01T12:00:00.000Z',
    description: 'Waktu kejadian error',
  })
  logTimestamp?: string | Date;

  /** Analisis akar masalah (root cause) */
  @ApiProperty({
    example: 'Objek user bernilai null karena ID tidak ditemukan di cache.',
    description: 'Penjelasan akar masalah dalam Bahasa Indonesia.',
  })
  rootCause: string;

  /** Analisis dampak error (impact) */
  @ApiProperty({
    example:
      'Proses autentikasi gagal sehingga pengguna tidak bisa masuk ke dasbor.',
    description: 'Dampak error terhadap sistem/pengguna.',
  })
  impact: string;

  /** Rekomendasi perbaikan (recommendation / remediation) */
  @ApiProperty({
    example:
      'Tambahkan null-check sebelum memanggil metode get pada objek UserService.',
    description: 'Saran tindakan perbaikan yang dapat dilakukan developer.',
  })
  recommendation: string;

  /** Raw response mentah dari LLM */
  @ApiProperty({
    example: '{"root_cause": "...", "impact": "...", "recommendation": "..."}',
    description: 'Keluaran mentah dari LLM Ollama',
  })
  rawResponse: string;

  /** Model Ollama yang digunakan dalam analisis */
  @ApiProperty({
    example: 'llama3:8b',
    description: 'Nama model Ollama lokal yang menghasilkan analisis',
  })
  modelUsed: string;

  /** Waktu analisis dibuat dan disimpan di database */
  @ApiPropertyOptional({
    example: '2026-08-01T12:01:00.000Z',
    description: 'Waktu record RCA dicatat di database',
  })
  createdAt?: string | Date;
}
