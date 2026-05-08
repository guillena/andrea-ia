import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
  private readonly client: OpenAI;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('azure.openai.key'),
      baseURL: `${this.config.get<string>('azure.openai.endpoint')}/openai/deployments`,
      defaultQuery: { 'api-version': this.config.get<string>('azure.openai.apiVersion') },
      defaultHeaders: { 'api-key': this.config.get<string>('azure.openai.key') },
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

    const historyText = conversationHistory
      .map((t) => `${t.speaker === 'agent' ? 'ANDREA' : candidateName}: ${t.text}`)
      .join('\n\n');

    const systemPrompt = `Eres ANDREA, una evaluadora laboral profesional conduciendo una entrevista estructurada.
Estás evaluando a ${candidateName} para el puesto de ${position} en ${company}.

COMPETENCIAS A EVALUAR:
${competenciesText}

REGLAS:
- Hacé UNA sola pregunta a la vez, clara y concisa.
- Si la respuesta fue vaga o incompleta, repreguntá UNA vez solicitando un ejemplo concreto.
- NO emitas juicios ("muy bien", "incorrecto"). Respondé de forma neutra ("Entendido.", "Gracias.").
- NO preguntes sobre salud, religión, política, orientación sexual, estado civil, embarazo.
- Mantené un tono cálido, profesional y empático.
- Turno ${turnNumber} de ${totalTurns} estimados. ${turnNumber >= totalTurns - 1 ? 'Es el momento de ir cerrando la entrevista.' : ''}
- Si es el último turno, agradecé al candidato y cerrá la entrevista calidamente.

HISTORIAL:
${historyText || '[Inicio de entrevista]'}

Generá SOLO tu próxima respuesta como ANDREA (sin prefijo "ANDREA:").`;

    const response = await this.client.chat.completions.create({
      model: this.config.get<string>('azure.openai.deploymentGpt4oMini'),
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content?.trim() || 'Continuemos. ¿Podés contarme más al respecto?';
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
