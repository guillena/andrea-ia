import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { PdfService } from './pdf.service';
import { CreateCandidateDto, CandidateDecisionDto } from './dto/candidate.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Candidatos')
@Controller('candidates')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CandidatesController {
  constructor(
    private service: CandidatesService,
    private pdfService: PdfService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar candidatos (con filtros opcionales)' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(companyId, { campaignId, status, page, limit });
  }

  @Post()
  @ApiOperation({ summary: 'Crear candidato y generar link de evaluación' })
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCandidateDto,
  ) {
    return this.service.create(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de candidato' })
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Patch(':id/decision')
  @ApiOperation({ summary: 'Registrar decisión del reclutador' })
  recordDecision(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CandidateDecisionDto,
  ) {
    return this.service.recordDecision(id, companyId, userId, dto);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Ver reporte de un candidato' })
  getReport(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.getReport(id, companyId);
  }

  @Get(':id/report/pdf')
  @ApiOperation({ summary: 'Descargar reporte PDF de un candidato' })
  async downloadReportPdf(
    @Param('id') id: string, 
    @CurrentUser('companyId') companyId: string,
    @Res() res: Response
  ) {
    const candidate = await this.service.getReport(id, companyId);
    if (!candidate || !candidate.session) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Reporte no encontrado' });
    }

    const data = {
      candidate,
      session: candidate.session,
      jobPosition: candidate.campaign?.jobPosition || { name: candidate.campaign?.name || 'Puesto no especificado' },
      score: candidate.session?.score,
      report: candidate.session?.report
    };

    const stream = await this.pdfService.generateCandidateReport(data);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Reporte_ANDREA_${candidate.firstName}_${candidate.lastName}.pdf"`,
    });
    
    stream.pipe(res);
  }

  @Get(':id/transcript')
  @ApiOperation({ summary: 'Ver transcripción de la entrevista' })
  getTranscript(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.getTranscript(id, companyId);
  }

  @Post(':id/reanalyze')
  @ApiOperation({ summary: 'Re-ejecutar análisis de una evaluación completada' })
  reanalyze(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.reanalyze(id, companyId);
  }
}
