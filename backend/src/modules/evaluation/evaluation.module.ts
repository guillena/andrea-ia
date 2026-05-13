import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { AnalysisProcessor } from './analysis.processor';
import { AnalysisService } from './analysis.service';
import { AzureSpeechService } from '../../services/azure-speech.service';
import { AzureOpenAIService } from '../../services/azure-openai.service';
import { StorageService } from '../../services/storage.service';
import { SystemLogService } from '../../services/system-log.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'analysis' }),
  ],
  providers: [
    EvaluationService,
    AnalysisService,
    AnalysisProcessor,
    AzureSpeechService,
    AzureOpenAIService,
    StorageService,
    SystemLogService,
  ],
  controllers: [EvaluationController],
  exports: [EvaluationService, AnalysisService],
})
export class EvaluationModule {}
