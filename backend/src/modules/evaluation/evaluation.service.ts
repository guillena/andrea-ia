import {
  Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AzureSpeechService } from '../../services/azure-speech.service';
import { AzureOpenAIService } from '../../services/azure-openai.service';
import { StorageService } from '../../services/storage.service';

const MAX_TURNS = 12; // máximo de turns del candidato por sesión

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private prisma: PrismaService,
    private speech: AzureSpeechService,
    private openai: AzureOpenAIService,
    private storage: StorageService,
    private config: ConfigService,
    @InjectQueue('analysis') private analysisQueue: Queue,
  ) {}

  // ── GET /eval/:token — Validar token y retornar datos ─────
  async getSessionByToken(token: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { evalToken: token },
      include: {
        campaign: {
          include: {
            jobPosition: { select: { name: true, competencies: true } },
          },
        },
        company: { select: { name: true } },
      },
    });

    if (!candidate) throw new NotFoundException('Link de evaluación inválido');

    if (candidate.status === 'completed') {
      return { status: 'completed' };
    }

    if (candidate.status === 'expired' || new Date() > candidate.tokenExpiresAt) {
      // Marcar como expirado si no lo está
      if (candidate.status !== 'expired') {
        await this.prisma.candidate.update({
          where: { id: candidate.id },
          data: { status: 'expired' },
        });
      }
      return { status: 'expired' };
    }

    return {
      status: candidate.status,
      candidateFirstName: candidate.firstName,
      companyName: candidate.company.name,
      positionName: candidate.campaign.jobPosition?.name || candidate.campaign.name,
    };
  }

  // ── POST /eval/:token/consent ─────────────────────────────
  async recordConsent(token: string, payload: { accepted: boolean; userAgent: string; ipAddress?: string }) {
    const candidate = await this.findValidCandidate(token);

    // Evitar consentimiento duplicado
    const existing = await this.prisma.consent.findUnique({
      where: { candidateId: candidate.id },
    });
    if (existing) return { success: true };

    await this.prisma.consent.create({
      data: {
        candidateId: candidate.id,
        accepted: payload.accepted,
        acceptedAt: new Date(),
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        consentVersion: 'v1',
        consentTextHash: crypto
          .createHash('sha256')
          .update('ANDREA_CONSENT_V1')
          .digest('hex'),
      },
    });

    return { success: true };
  }

  // ── POST /eval/:token/start — Iniciar sesión ──────────────
  async startSession(token: string) {
    const candidate = await this.findValidCandidate(token);

    // Verificar consentimiento
    const consent = await this.prisma.consent.findUnique({
      where: { candidateId: candidate.id },
    });
    if (!consent?.accepted) {
      throw new ForbiddenException('El candidato no ha aceptado el consentimiento');
    }

    // Obtener o crear sesión
    let session = await this.prisma.evaluationSession.findUnique({
      where: { candidateId: candidate.id },
    });

    if (!session) {
      session = await this.prisma.evaluationSession.create({
        data: {
          candidateId: candidate.id,
          status: 'in_progress',
          startedAt: new Date(),
        },
      });
    }

    // Actualizar estado del candidato
    await this.prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: 'started' },
    });

    // Generar audio de bienvenida
    const campaign = await this.prisma.evaluationCampaign.findUnique({
      where: { id: candidate.campaignId },
      include: {
        jobPosition: { select: { name: true } },
        company: { select: { name: true } },
      },
    });

    const introText = `Hola, ${candidate.firstName}. Bienvenido o bienvenida a esta evaluación. 
Soy ANDREA, una asistente de inteligencia artificial. 
Esta entrevista toma entre 10 y 15 minutos y está diseñada para ayudar al equipo de ${campaign.company.name} a conocerte mejor para la posición de ${campaign.jobPosition?.name || campaign.name}. 
No hay respuestas correctas o incorrectas. Solo te pido que respondas con honestidad y naturalidad. 
Cuando termines de hablar, hacé click en el botón para indicarme que terminaste. 
¿Empezamos?`;

    const introAudioBuffer = await this.speech.synthesizeSpeech(introText);
    const introAudioUrl = await this.storage.uploadAgentAudio(introAudioBuffer, session.id, 0);

    // Guardar turno del agente (intro)
    await this.prisma.conversationTurn.create({
      data: {
        sessionId: session.id,
        turnNumber: 0,
        speaker: 'agent',
        contentText: introText,
        audioUrl: introAudioUrl,
      },
    });

    this.logger.log(`Sesión iniciada: ${session.id} para candidato ${candidate.id}`);

    return {
      sessionId: session.id,
      introAudioUrl,
    };
  }

  // ── POST /eval/:token/turn — Procesar turno del candidato ──
  async processTurn(
    token: string,
    sessionId: string,
    audioBuffer: Buffer,
  ) {
    const candidate = await this.findValidCandidate(token);

    const session = await this.prisma.evaluationSession.findUnique({
      where: { id: sessionId, candidateId: candidate.id },
    });
    if (!session || session.status !== 'in_progress') {
      throw new BadRequestException('Sesión inválida o ya finalizada');
    }

    const currentTurnCount = session.turnCount;
    const candidateTurnNumber = currentTurnCount + 1;

    // 1. STT — transcribir audio del candidato
    const { text: transcript, confidence } = await this.speech.transcribeBuffer(audioBuffer);

    // 2. Guardar audio del candidato en storage
    const candidateAudioUrl = await this.storage.uploadAudio(audioBuffer, sessionId, 'candidate');

    // 3. Guardar turno del candidato
    await this.prisma.conversationTurn.create({
      data: {
        sessionId,
        turnNumber: candidateTurnNumber,
        speaker: 'candidate',
        contentText: transcript || '[Sin respuesta detectada]',
        audioUrl: candidateAudioUrl,
        rawSttText: transcript,
        sttConfidence: confidence,
      },
    });

    // 4. Actualizar contador de turns
    await this.prisma.evaluationSession.update({
      where: { id: sessionId },
      data: { turnCount: candidateTurnNumber },
    });

    // 5. ¿Es el último turn?
    const isFinal = candidateTurnNumber >= MAX_TURNS;

    let nextAudioUrl: string;

    if (isFinal) {
      // Generar despedida
      const closingText = `Genial, ${candidate.firstName}. Eso es todo por hoy. Muchas gracias por tu tiempo y por ser tan claro o clara con tus respuestas. El equipo estará en contacto con vos próximamente. ¡Mucho éxito!`;
      const closingBuffer = await this.speech.synthesizeSpeech(closingText);
      nextAudioUrl = await this.storage.uploadAgentAudio(closingBuffer, sessionId, candidateTurnNumber + 1);

      await this.prisma.conversationTurn.create({
        data: {
          sessionId,
          turnNumber: candidateTurnNumber + 1,
          speaker: 'agent',
          contentText: closingText,
          audioUrl: nextAudioUrl,
        },
      });

      // Finalizar sesión
      await this.finalizeSession(sessionId, candidate.id);
    } else {
      // 6. LLM — generar siguiente pregunta del agente
      const campaign = await this.prisma.evaluationCampaign.findUnique({
        where: { id: candidate.campaignId },
        include: {
          jobPosition: { select: { name: true, competencies: true } },
          company: { select: { name: true } },
        },
      });

      const allTurns = await this.prisma.conversationTurn.findMany({
        where: { sessionId },
        orderBy: { turnNumber: 'asc' },
      });

      const competencies = (campaign.jobPosition?.competencies as any[]) || [];

      const nextQuestion = await this.openai.getNextAgentTurn({
        position: campaign.jobPosition?.name || campaign.name,
        company: campaign.company.name,
        competencies,
        conversationHistory: allTurns.map((t) => ({
          speaker: t.speaker as 'agent' | 'candidate',
          text: t.contentText,
        })),
        turnNumber: candidateTurnNumber,
        totalTurns: MAX_TURNS,
        candidateName: candidate.firstName,
      });

      // 7. TTS — sintetizar respuesta del agente
      const agentAudioBuffer = await this.speech.synthesizeSpeech(nextQuestion);
      nextAudioUrl = await this.storage.uploadAgentAudio(agentAudioBuffer, sessionId, candidateTurnNumber + 1);

      // 8. Guardar turno del agente
      await this.prisma.conversationTurn.create({
        data: {
          sessionId,
          turnNumber: candidateTurnNumber + 1,
          speaker: 'agent',
          contentText: nextQuestion,
          audioUrl: nextAudioUrl,
        },
      });
    }

    return {
      transcript,
      nextAudioUrl,
      isFinal,
    };
  }

  // ── POST /eval/:token/end — Finalizar sesión ───────────────
  async endSession(token: string, sessionId: string) {
    const candidate = await this.findValidCandidate(token);
    await this.finalizeSession(sessionId, candidate.id);
    return { message: 'Evaluación completada', processEta: 120 };
  }

  // ── Finalización y encolado de análisis ───────────────────
  private async finalizeSession(sessionId: string, candidateId: string) {
    const now = new Date();

    const session = await this.prisma.evaluationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status === 'completed') return;

    const durationSeconds = session.startedAt
      ? Math.round((now.getTime() - session.startedAt.getTime()) / 1000)
      : null;

    await this.prisma.evaluationSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: now,
        durationSeconds,
        analysisStatus: 'pending',
      },
    });

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'completed' },
    });

    // Encolar job de análisis asíncrono
    await this.analysisQueue.add(
      'analyze-session',
      { sessionId, candidateId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );

    this.logger.log(`Sesión finalizada y encolada para análisis: ${sessionId}`);
  }

  // ── Helper: buscar candidato válido por token ─────────────
  private async findValidCandidate(token: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { evalToken: token },
    });

    if (!candidate) throw new NotFoundException('Token inválido');
    if (new Date() > candidate.tokenExpiresAt) {
      throw new BadRequestException('El link de evaluación ha expirado');
    }
    if (candidate.status === 'completed') {
      throw new BadRequestException('Esta evaluación ya fue completada');
    }
    if (candidate.status === 'cancelled' || candidate.status === 'expired') {
      throw new BadRequestException('Esta evaluación no está disponible');
    }

    return candidate;
  }
}
