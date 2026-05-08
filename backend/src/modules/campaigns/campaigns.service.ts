import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, page = 1, limit = 20) {
    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    const skip = (p - 1) * l;
    const [data, total] = await Promise.all([
      this.prisma.evaluationCampaign.findMany({
        where: { companyId },
        include: {
          jobPosition: { select: { id: true, name: true, competencies: true } },
          createdBy: { select: { firstName: true, lastName: true } },
          _count: { select: { candidates: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.evaluationCampaign.count({ where: { companyId } }),
    ]);
    return { data, meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } };
  }

  async findOne(id: string, companyId: string) {
    const c = await this.prisma.evaluationCampaign.findFirst({
      where: { id, companyId },
      include: {
        jobPosition: { select: { id: true, name: true, competencies: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!c) throw new NotFoundException('Campaña no encontrada');
    return c;
  }

  async create(companyId: string, userId: string, dto: CreateCampaignDto) {
    return this.prisma.evaluationCampaign.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        jobPositionId: dto.jobPositionId,
        linkExpiryDays: dto.linkExpiryDays ?? 7,
        createdById: userId,
      },
      include: {
        jobPosition: { select: { id: true, name: true, competencies: true } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateCampaignDto) {
    await this.findOne(id, companyId);
    return this.prisma.evaluationCampaign.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status as any,
        linkExpiryDays: dto.linkExpiryDays,
      },
    });
  }

  async getStats(id: string, companyId: string) {
    await this.findOne(id, companyId);
    const [total, completed, pending, expired] = await Promise.all([
      this.prisma.candidate.count({ where: { campaignId: id } }),
      this.prisma.candidate.count({ where: { campaignId: id, status: 'completed' } }),
      this.prisma.candidate.count({ where: { campaignId: id, status: 'pending' } }),
      this.prisma.candidate.count({ where: { campaignId: id, status: 'expired' } }),
    ]);

    // Promedio de scores de candidatos completados
    const scores = await this.prisma.score.findMany({
      where: {
        session: { candidate: { campaignId: id } },
      },
      select: { globalScore: true },
    });
    const avgScore = scores.length
      ? Math.round(scores.reduce((s, sc) => s + sc.globalScore, 0) / scores.length)
      : null;

    return { total, completed, pending, expired, avgScore };
  }
}
