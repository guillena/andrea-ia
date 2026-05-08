import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, CandidateDecisionDto } from './dto/candidate.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Candidatos')
@Controller('candidates')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CandidatesController {
  constructor(private service: CandidatesService) {}

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

  @Get(':id/transcript')
  @ApiOperation({ summary: 'Ver transcripción de la entrevista' })
  getTranscript(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.getTranscript(id, companyId);
  }
}
