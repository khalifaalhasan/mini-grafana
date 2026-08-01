import { Module } from '@nestjs/common';
import { OllamaModule } from '../ollama/ollama.module';
import { DrizzleModule } from '../../lib/db/drizzle.module';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [OllamaModule, DrizzleModule],
  providers: [AnalysisService],
  controllers: [AnalysisController],
})
export class AnalysisModule {}
