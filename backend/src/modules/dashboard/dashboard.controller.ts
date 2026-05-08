import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'KPIs y candidatos recientes de la empresa' })
  async getDashboard(@CurrentUser('companyId') companyId: string) {
    const [total, completed, pending, expired, started, recentCandidates] = await Promise.all([
      this.prisma.candidate.count({ where: { companyId } }),
      this.prisma.candidate.count({ where: { companyId, status: 'completed' } }),
      this.prisma.candidate.count({ where: { companyId, status: 'pending' } }),
      this.prisma.candidate.count({ where: { companyId, status: 'expired' } }),
      this.prisma.candidate.count({ where: { companyId, status: 'started' } }),
      this.prisma.candidate.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          campaign: { select: { name: true, jobPosition: { select: { name: true } } } },
          session: {
            select: {
              analysisStatus: true,
              score: { select: { globalScore: true, recommendation: true } },
            },
          },
        },
      }),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      kpis: { total, completed, pending, expired, started, completionRate },
      recentCandidates,
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas avanzadas (Admin+)' })
  async getMetrics(@CurrentUser('companyId') companyId: string) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [dailyCompletions, avgDuration, scoreDistribution] = await Promise.all([
      // Completiones por día (últimos 30 días)
      this.prisma.$queryRaw`
        SELECT DATE(completed_at) as date, COUNT(*)::int as count
        FROM evaluation_sessions es
        JOIN candidates c ON c.id = es.candidate_id
        WHERE c.company_id = ${companyId}
          AND es.completed_at >= ${last30Days}
          AND es.status = 'completed'
        GROUP BY DATE(completed_at)
        ORDER BY date
      `,
      // Duración promedio en minutos
      this.prisma.evaluationSession.aggregate({
        where: {
          status: 'completed',
          candidate: { companyId },
        },
        _avg: { durationSeconds: true },
      }),
      // Distribución de scores
      this.prisma.score.findMany({
        where: { session: { candidate: { companyId } } },
        select: { globalScore: true, recommendation: true },
      }),
    ]);

    const avgDurationMinutes = avgDuration._avg.durationSeconds
      ? Math.round(avgDuration._avg.durationSeconds / 60)
      : null;

    const dist = { recommended: 0, review: 0, not_recommended: 0 };
    (scoreDistribution as any[]).forEach((s) => { dist[s.recommendation]++; });

    return { dailyCompletions, avgDurationMinutes, scoreDistribution: dist };
  }
}
