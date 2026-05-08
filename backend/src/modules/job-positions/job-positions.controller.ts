import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JobPositionsService } from './job-positions.service';
import { UpdateCompetenciesDto } from './dto/job-position.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Puestos')
@Controller('job-positions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class JobPositionsController {
  constructor(private service: JobPositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar puestos de la empresa' })
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener puesto con sus competencias activas' })
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Patch(':id/competencies')
  @Roles(UserRole.super_admin, UserRole.admin_empresa)
  @ApiOperation({ summary: 'Actualizar competencias del puesto (Admin Empresa)' })
  updateCompetencies(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateCompetenciesDto,
  ) {
    return this.service.updateCompetencies(id, companyId, dto);
  }
}
