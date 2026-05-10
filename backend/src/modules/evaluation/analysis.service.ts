import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AzureOpenAIService } from '../../services/azure-openai.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private prisma: PrismaService,
    private openai: AzureOpenAIService,
  ) {}

  /**
   * Ejecuta el análisis completo de una sesión y persiste Score + Report.
   * Puede llamarse desde el BullQueue o directamente de forma síncrona.
   */
  async runAnalysis(sessionId: string, candidateId: string): Promise<void> {
    this.logger.log(`Iniciando análisis para sesión: ${sessionId}`);

    // Marcar como processing
    await this.prisma.evaluationSession.update({
      where: { id: sessionId },
      data: { analysisStatus: 'processing' },
    });

    // Cargar datos necesarios
    const [session, candidate] = await Promise.all([
      this.prisma.evaluationSession.findUnique({
        where: { id: sessionId },
        include: { turns: { orderBy: { turnNumber: 'asc' } } },
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

    if (!session || !candidate) {
      throw new Error(`Sesión o candidato no encontrado: ${sessionId} / ${candidateId}`);
    }

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

    // Evitar duplicar Score si ya existe (puede pasar en retry)
    const existingScore = await this.prisma.score.findUnique({ where: { sessionId } });
    if (existingScore) {
      this.logger.warn(`Score ya existe para sesión ${sessionId}, omitiendo creación.`);
      await this.prisma.evaluationSession.update({
        where: { id: sessionId },
        data: { analysisStatus: 'completed' },
      });
      return;
    }

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

    // Evitar duplicar Report
    const existingReport = await this.prisma.report.findUnique({ where: { sessionId } });
    if (!existingReport) {
      await this.prisma.report.create({
        data: {
          sessionId,
          scoreId: score.id,
          executiveSummary: analysis.executive_summary,
        },
      });
    }

    // Marcar como completado
    await this.prisma.evaluationSession.update({
      where: { id: sessionId },
      data: { analysisStatus: 'completed' },
    });

    this.logger.log(
      `Análisis completado para sesión: ${sessionId}. Score global: ${analysis.global_score}`,
    );
  }
}
