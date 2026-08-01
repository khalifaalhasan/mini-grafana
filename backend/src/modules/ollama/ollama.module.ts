import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'nestjs-pino';
import { OllamaService } from './ollama.service';
import { OllamaController } from './ollama.controller';

@Module({
  imports: [
    HttpModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
  ],
  providers: [OllamaService],
  controllers: [OllamaController],
  exports: [OllamaService],
})
export class OllamaModule {}
