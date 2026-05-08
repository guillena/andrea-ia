import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JobPositionsModule } from './modules/job-positions/job-positions.module';
import { CampaignsModule }    from './modules/campaigns/campaigns.module';
import { CandidatesModule }   from './modules/candidates/candidates.module';
import { DashboardModule }    from './modules/dashboard/dashboard.module';
import { UsersModule }        from './modules/users/users.module';

import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RolesGuard } from './common/guards/roles.guard';

// ── Módulos de dominio ────────────────────────────────────
import { AuthModule }       from './modules/auth/auth.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';

@Module({
  imports: [
    // ── Config global ──────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // ── Prisma (global) ────────────────────────────────────
    PrismaModule,

    // ── Redis / BullMQ ─────────────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('redis.url'),
      }),
    }),

    // ── Rate limiting ──────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },
      { name: 'medium', ttl: 10000, limit: 50  },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),

    // ── Módulos de dominio ─────────────────────────────────
    AuthModule,
    EvaluationModule,
    JobPositionsModule,
    CampaignsModule,
    CandidatesModule,
    DashboardModule,
    UsersModule,
  ],
  providers: [
    // Filtro global de excepciones
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Rate limiting global
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // RBAC guard global
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
