import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchesService } from './searches.service';
import { CreateSearchDto, UpdateSearchDto } from './dto/search.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Searches')
@Controller('searches')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SearchesController {
  constructor(private service: SearchesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar búsquedas de la empresa' })
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
  @ApiOperation({ summary: 'Crear nueva búsqueda' })
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSearchDto,
  ) {
    return this.service.create(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de búsqueda' })
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar búsqueda (nombre, estado, etc.)' })
  update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateSearchDto,
  ) {
    return this.service.update(id, companyId, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estadísticas de la búsqueda' })
  getStats(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.getStats(id, companyId);
  }
}
