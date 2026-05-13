import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAI } from 'openai';
import { SystemLogService } from './system-log.service';

// ── Tipos del motor de scoring ─────────────────────────────

export interface ScoringOutput {
  cognitive_score: number;
  cognitive_summary: string;
  cognitive_strengths: string[];
  cognitive_risks: string[];
  cognitive_evidence: string[];
  behavioral_score: number;
  behavioral_summary: string;
  behavioral_strengths: string[];
  behavioral_risks: string[];
  behavioral_evidence: string[];
  communication_score: number;
  communication_summary: string;
  communication_strengths: string[];
  communication_risks: string[];
  communication_evidence: string[];
  consistency_score: number;
  consistency_notes: string;
  contradictions_detected: string[];
  global_score: number;
  recommendation: 'recommended' | 'review' | 'not_recommended';
  executive_summary: string;
  top_strengths: string[];
  top_risks: string[];
  risk_flags: string[];
}

export interface ConversationTurnInput {
  speaker: 'agent' | 'candidate';
  text: string;
}

@Injectable()
export class AzureOpenAIService {
  private readonly logger = new Logger(AzureOpenAIService.name);
  private readonly client: AzureOpenAI;

  constructor(
    private config: ConfigService,
    private systemLog: SystemLogService,
  ) {
    this.client = new AzureOpenAI({
      apiKey: this.config.get<string>('azure.openai.key'),
      endpoint: this.config.get<string>('azure.openai.endpoint'),
      apiVersion: this.config.get<string>('azure.openai.apiVersion'),
    });
  }

  // ── Orquestador de entrevista (turno a turno) ─────────────
  async getNextAgentTurn(params: {
    position: string;
    company: string;
    competencies: Array<{ name: string; dimension: string }>;
    conversationHistory: ConversationTurnInput[];
    turnNumber: number;
    totalTurns: number;
    candidateName: string;
  }): Promise<string> {
    const { position, company, competencies, conversationHistory, turnNumber, totalTurns, candidateName } = params;

    const competenciesText = competencies
      .map((c) => `- ${c.name} (${c.dimension})`)
      .join('\n');

    const systemPrompt = `Eres ANDREA, una evaluadora laboral profesional conduciendo una entrevista estructurada.
Estás evaluando a ${candidateName} para el puesto de ${position} en ${company}.

COMPETENCIAS A EVALUAR:
${competenciesText}

REGLAS ESTRICTAS:
- Hacé UNA sola pregunta a la vez, clara y concisa.
- NUNCA repitas una pregunta que ya hiciste en el historial. Avanzá siempre hacia una competencia nueva o un aspecto diferente.
- Si el candidato ya respondió una pregunta (aunque sea brevemente), dala por respondida y pasá a la siguiente.
- Solo repreguntá si la respuesta fue totalmente incomprensible o en blanco — y solo UNA vez sobre el mismo punto.
- NO emitas juicios ("muy bien", "incorrecto"). Respondé de forma neutra ("Entendido.", "Gracias.").
- NO preguntes sobre salud, religión, política, orientación sexual, estado civil, embarazo.
- Mantené un tono cálido, profesional y empático.
- Turno ${turnNumber} de ${totalTurns} estimados. ${turnNumber >= totalTurns - 1 ? 'Es el momento de ir cerrando la entrevista.' : ''}
- Si es el último turno, agradecé al candidato y cerrá la entrevista calidamente.

Generá SOLO tu próxima respuesta como ANDREA (sin prefijo "ANDREA:").`;

    // Construir el array de mensajes con roles user/assistant reales
    // El turn 0 es siempre el intro del agente (bienvenida), lo omitimos del chat
    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Excluir el turn 0 (intro) — empezar desde el primer intercambio real
    const relevantTurns = conversationHistory.filter((t) => t.text !== '[Inicio de entrevista]');

    for (const turn of relevantTurns) {
      if (turn.speaker === 'agent') {
        chatMessages.push({ role: 'assistant', content: turn.text });
      } else {
        // speaker === 'candidate'
        chatMessages.push({ role: 'user', content: turn.text });
      }
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.get<string>('azure.openai.deploymentGpt4oMini'),
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 250,
      });

      return response.choices[0]?.message?.content?.trim() || 'Entendido. ¿Podrías contarme un poco más sobre eso?';
    } catch (error: any) {
      // Registrar el error técnico en SystemLog para el administrador
      await this.systemLog.logError(
        'AzureOpenAI',
        `Error en generación de turno: ${error.message}`,
        { 
          turnNumber, 
          candidateName,
          errorResponse: error.response?.data || error.message,
          contentFilterTriggered: error.status === 400 || error.message.includes('content management policy')
        }
      );

      // Si el error es por filtro de contenido o similar, devolvemos un fallback para no romper la entrevista
      if (error.status === 400 || error.message.includes('content management policy')) {
        this.logger.warn('La respuesta fue filtrada por Azure Content Safety. Usando fallback.');
        return 'Entendido, gracias por compartir eso. Para continuar, ¿podrías darme otro ejemplo de una situación similar en tu experiencia profesional?';
      }

      // En otros casos, re-lanzamos o devolvemos un fallback genérico
      return 'Interesante. Contame un poco más sobre cómo manejaste eso o qué aprendiste de esa experiencia.';
    }
  }

  // ── Análisis completo post-sesión ─────────────────────────
  async analyzeInterview(params: {
    transcript: ConversationTurnInput[];
    position: string;
    company: string;
    competencies: Array<{ name: string; dimension: string; weight: number }>;
    candidateName: string;
  }): Promise<ScoringOutput> {
    const { transcript, position, company, competencies, candidateName } = params;

    const transcriptText = transcript
      .map((t) => `${t.speaker === 'agent' ? 'ANDREA' : candidateName}: ${t.text}`)
      .join('\n\n');

    const competenciesText = competencies
      .map((c) => `- ${c.name} (${c.dimension}, peso: ${c.weight})`)
      .join('\n');

    const systemPrompt = `Eres un evaluador experto en selección laboral. Analizás la transcripción de una entrevista de evaluación laboral.

IMPORTANTE:
- NO emitas diagnósticos clínicos ni psicológicos.
- Evaluá ÚNICAMENTE competencias laborales observables en el discurso.
- Fundamentá cada score con evidencias CONCRETAS de la transcripción (citas textuales).
- Sé objetivo, neutral, libre de sesgos culturales o demográficos.
- Los scores deben ser coherentes entre sí.

PUESTO EVALUADO: ${position} en ${company}
CANDIDATO: ${candidateName}

COMPETENCIAS A EVALUAR:
${competenciesText}

TRANSCRIPCIÓN COMPLETA:
${transcriptText}

Respondé SOLO con un JSON válido siguiendo exactamente esta estructura:`;

    const jsonSchema = {
      cognitive_score: 'number 0-100',
      cognitive_summary: 'string 2-3 oraciones',
      cognitive_strengths: ['string'],
      cognitive_risks: ['string'],
      cognitive_evidence: ['cita textual del candidato'],
      behavioral_score: 'number 0-100',
      behavioral_summary: 'string 2-3 oraciones',
      behavioral_strengths: ['string'],
      behavioral_risks: ['string'],
      behavioral_evidence: ['cita textual del candidato'],
      communication_score: 'number 0-100',
      communication_summary: 'string 2-3 oraciones',
      communication_strengths: ['string'],
      communication_risks: ['string'],
      communication_evidence: ['cita textual del candidato'],
      consistency_score: 'number 0-100',
      consistency_notes: 'string',
      contradictions_detected: ['string o array vacío'],
      global_score: 'number 0-100 (promedio ponderado)',
      recommendation: 'recommended | review | not_recommended',
      executive_summary: 'string 3-4 oraciones ejecutivas',
      top_strengths: ['string', 'string', 'string'],
      top_risks: ['string', 'string'],
      risk_flags: ['evasive_answers | contradictions | low_comprehension | poor_communication | no_concrete_examples | incoherence'],
    };

    const response = await this.client.chat.completions.create({
      model: this.config.get<string>('azure.openai.deploymentGpt4o'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(jsonSchema) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(raw) as ScoringOutput;
      // Calcular global_score si el modelo no lo calculó correctamente
      parsed.global_score =
        parsed.global_score ||
        Math.round(
          parsed.cognitive_score * 0.35 +
          parsed.behavioral_score * 0.35 +
          parsed.communication_score * 0.2 +
          parsed.consistency_score * 0.1,
        );
      // Determinar recommendation en base al global_score si difiere
      if (parsed.global_score >= 70) parsed.recommendation = 'recommended';
      else if (parsed.global_score >= 40) parsed.recommendation = 'review';
      else parsed.recommendation = 'not_recommended';

      return parsed;
    } catch (e) {
      this.logger.error('Error parseando respuesta LLM', raw);
      throw new Error('Error al analizar la entrevista');
    }
  }
}
