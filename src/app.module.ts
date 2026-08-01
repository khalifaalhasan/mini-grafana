import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './lib/db/drizzle.module';
import { LokiModule } from './modules/loki/loki.module';
import { OllamaModule } from './modules/ollama/ollama.module';
import { AnalysisModule } from './modules/analysis/analysis.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    DrizzleModule,
    LokiModule,
    OllamaModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
