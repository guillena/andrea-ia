import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemLogService {
  private readonly logger = new Logger(SystemLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registra un evento técnico en la base de datos para monitoreo administrativo.
   */
  async log(params: {
    level: 'error' | 'warn' | 'info';
    source: 'AzureOpenAI' | 'AzureSpeech' | 'System';
    message: string;
    details?: any;
    sessionId?: string;
  }) {
    try {
      // Log por consola (estándar)
      if (params.level === 'error') this.logger.error(params.message);
      else if (params.level === 'warn') this.logger.warn(params.message);
      else this.logger.log(params.message);

      // Persistencia en base de datos
      await this.prisma.systemLog.create({
        data: {
          level: params.level,
          source: params.source,
          message: params.message,
          details: params.details || {},
          sessionId: params.sessionId,
        },
      });
    } catch (e) {
      this.logger.error('Fallo crítico al intentar persistir SystemLog en la DB', e);
    }
  }

  async logError(source: 'AzureOpenAI' | 'AzureSpeech' | 'System', message: string, details?: any, sessionId?: string) {
    return this.log({ level: 'error', source, message, details, sessionId });
  }

  async logWarn(source: 'AzureOpenAI' | 'AzureSpeech' | 'System', message: string, details?: any, sessionId?: string) {
    return this.log({ level: 'warn', source, message, details, sessionId });
  }

  async logInfo(source: 'AzureOpenAI' | 'AzureSpeech' | 'System', message: string, details?: any, sessionId?: string) {
    return this.log({ level: 'info', source, message, details, sessionId });
  }
}
