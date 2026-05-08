import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AzureOpenAIService } from '../../services/azure-openai.service';

@Processor('analysis')
export class AnalysisProcessor {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private prisma: PrismaService,
    private openai: AzureOpenAIService,
  ) {}

  @Process('analyze-session')
  async handleAnalysis(job: Job<{ sessionId: string; candidateId: string }>) {
    const { sessionId, candidateId } = job.data;
    this.logger.log(`Iniciando análisis para sesión: ${sessionId}`);

    try {
      // Marcar como processing
      await this.prisma.evaluationSession.update({
        where: { id: sessionId },
        data: { analysisStatus: 'processing' },
      });

      // Cargar datos necesarios
      const [session, candidate] = await Promise.all([
        this.prisma.evaluationSession.findUnique({
          where: { id: sessionId },
          include: {
            turns: { orderBy: { turnNumber: 'asc' } },
          },
        }),
        this.prisma.candidate.findUnique({
          where: { id: candidateId },
          include: {
            campaign: {
              include: {
                jobPosition: true,
                company: { select: { name: true } },
              },
            },
          },
        }),
      ]);

      const competencies = (candidate.campaign.jobPosition?.competencies as any[]) || [];

      // Ejecutar análisis con GPT-4o
      const analysis = await this.openai.analyzeInterview({
        transcript: session.turns.map((t) => ({
          speaker: t.speaker as 'agent' | 'candidate',
          text: t.contentText,
        })),
        position: candidate.campaign.jobPosition?.name || candidate.campaign.name,
        company: candidate.campaign.company.name,
        competencies,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
      });

      // Guardar score
      const score = await this.prisma.score.create({
        data: {
          sessionId,
          cognitiveScore: analysis.cognitive_score,
          behavioralScore: analysis.behavioral_score,
          communicationScore: analysis.communication_score,
          consistencyScore: analysis.consistency_score,
          globalScore: analysis.global_score,
          recommendation: analysis.recommendation,
          riskFlags: analysis.risk_flags,
          strengths: analysis.top_strengths,
          dimensionDetails: {
            cognitive: {
              summary: analysis.cognitive_summary,
              strengths: analysis.cognitive_strengths,
              risks: analysis.cognitive_risks,
              evidence: analysis.cognitive_evidence,
            },
            behavioral: {
              summary: analysis.behavioral_summary,
              strengths: analysis.behavioral_strengths,
              risks: analysis.behavioral_risks,
              evidence: analysis.behavioral_evidence,
            },
            communication: {
              summary: analysis.communication_summary,
              strengths: analysis.communication_strengths,
              risks: analysis.communication_risks,
              evidence: analysis.communication_evidence,
            },
            consistency: {
              notes: analysis.consistency_notes,
              contradictions: analysis.contradictions_detected,
            },
          },
          rawAnalysis: analysis as any,
          modelVersion: 'gpt-4o',
        },
      });

      // Guardar reporte
      await this.prisma.report.create({
        data: {
          sessionId,
          scoreId: score.id,
          executiveSummary: analysis.executive_summary,
        },
      });

      // Marcar como completado
      await this.prisma.evaluationSession.update({
        where: { id: sessionId },
        data: { analysisStatus: 'completed' },
      });

      this.logger.log(`Análisis completado para sesión: ${sessionId}. Score global: ${analysis.global_score}`);

      // TODO: Enviar notificación al reclutador por email (SendGrid)

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
