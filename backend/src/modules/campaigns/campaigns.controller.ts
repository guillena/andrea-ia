import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Campañas')
@Controller('campaigns')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CampaignsController {
  constructor(private service: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar campañas de la empresa' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(companyId, page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva campaña' })
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.service.create(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de campaña' })
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar campaña (nombre, estado, etc.)' })
  update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.service.update(id, companyId, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estadísticas de la campaña' })
  getStats(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.getStats(id, companyId);
  }
}
