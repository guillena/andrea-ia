import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCandidateDto, CandidateDecisionDto } from './dto/candidate.dto';
import { EmailService } from '../../services/email.service';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  async findAll(
    companyId: string,
    filters: { campaignId?: string; status?: string; page?: number; limit?: number },
  ) {
    const { campaignId, status } = filters;
    const p = parseInt(String(filters.page || 1), 10) || 1;
    const l = parseInt(String(filters.limit || 20), 10) || 20;
    const skip = (p - 1) * l;

    const where: any = { companyId };
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        include: {
          campaign: { select: { name: true, jobPosition: { select: { name: true } } } },
          session: {
            select: {
              status: true, analysisStatus: true,
              score: { select: { globalScore: true, recommendation: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: l,
      }),
      this.prisma.candidate.count({ where }),
    ]);
    return { data, meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } };
  }

  async findOne(id: string, companyId: string) {
    const c = await this.prisma.candidate.findFirst({
      where: { id, companyId },
      include: {
        campaign: { include: { jobPosition: true } },
        session: { include: { score: true, report: true, turns: { orderBy: { turnNumber: 'asc' } } } },
        consent: true,
      },
    });
    if (!c) throw new NotFoundException('Candidato no encontrado');
    return c;
  }

  async create(companyId: string, userId: string, dto: CreateCandidateDto) {
    const campaign = await this.prisma.evaluationCampaign.findFirst({
      where: { id: dto.campaignId, companyId, status: 'active' },
      include: {
        jobPosition: { select: { name: true } },
        company: { select: { name: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaña no encontrada o no activa');

    const existing = await this.prisma.candidate.findFirst({
      where: { email: dto.email, campaignId: dto.campaignId },
    });
    if (existing) throw new ConflictException('Este email ya fue invitado a esta campaña');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const evalToken = crypto
      .createHmac('sha256', this.config.get<string>('eval.tokenSecret'))
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (campaign.linkExpiryDays || 7));

    const candidate = await this.prisma.candidate.create({
      data: {
        companyId, campaignId: dto.campaignId,
        firstName: dto.firstName, lastName: dto.lastName,
        email: dto.email, phone: dto.phone,
        evalToken, tokenExpiresAt: expiresAt,
        createdById: userId,
      },
    });

    const appUrl = this.config.get<string>('app.frontendUrl');
    const evalLink = `${appUrl}/eval/${evalToken}`;

    // Enviar email al candidato
    await this.email.sendEvalLink({
      to: dto.email,
      candidateName: dto.firstName,
      companyName: campaign.company.name,
      positionName: campaign.jobPosition?.name || campaign.name,
      evalLink,
      expiryDays: campaign.linkExpiryDays || 7,
    });

    this.logger.log(`Candidato creado: ${candidate.email}`);
    return { candidate, evalLink };
  }

  async recordDecision(id: string, companyId: string, userId: string, dto: CandidateDecisionDto) {
    const c = await this.prisma.candidate.findFirst({ where: { id, companyId } });
    if (!c) throw new NotFoundException('Candidato no encontrado');
    return this.prisma.candidate.update({
      where: { id },
      data: {
        recruiterDecision: dto.decision,
        decisionNotes: dto.notes,
        decisionAt: new Date(),
        decisionById: userId,
      },
    });
  }

  async getReport(candidateId: string, companyId: string) {
    const c = await this.prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
      include: {
        session: { include: { score: true, report: true } },
        campaign: { include: { jobPosition: { select: { name: true } } } },
      },
    });
    if (!c) throw new NotFoundException('Candidato no encontrado');
    return c;
  }

  async getTranscript(candidateId: string, companyId: string) {
    const c = await this.prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
      include: { session: { include: { turns: { orderBy: { turnNumber: 'asc' } } } } },
    });
    if (!c) throw new NotFoundException('Candidato no encontrado');
    return c.session?.turns || [];
  }
}
