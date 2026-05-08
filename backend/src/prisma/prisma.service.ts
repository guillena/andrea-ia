import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Limpia tablas en orden correcto para tests */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase no permitido en producción');
    }
    const tables = [
      'audit_logs', 'reports', 'scores', 'conversation_turns',
      'evaluation_sessions', 'consents', 'candidates',
      'evaluation_campaigns', 'job_positions', 'users', 'companies',
    ];
    for (const t of tables) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`);
    }
  }
}
