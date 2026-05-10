import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('analysis')
export class AnalysisProcessor {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private analysisService: AnalysisService,
    private prisma: PrismaService,
  ) {}

  @Process('analyze-session')
  async handleAnalysis(job: Job<{ sessionId: string; candidateId: string }>) {
    const { sessionId, candidateId } = job.data;
    this.logger.log(`[Queue] Procesando análisis para sesión: ${sessionId}`);

    try {
      await this.analysisService.runAnalysis(sessionId, candidateId);
    } catch (error) {
      this.logger.error(`Error en análisis de sesión ${sessionId}:`, error);

      await this.prisma.evaluationSession.update({
        where: { id: sessionId },
        data: {
          analysisStatus: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      throw error; // Bull reintentará automáticamente
    }
  }
}
