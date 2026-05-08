import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(UserRole.super_admin, UserRole.admin_empresa)
  @ApiOperation({ summary: 'Listar usuarios de la empresa' })
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Post()
  @Roles(UserRole.super_admin, UserRole.admin_empresa)
  @ApiOperation({ summary: 'Crear usuario en la empresa' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateUserDto) {
    return this.service.create(companyId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.super_admin, UserRole.admin_empresa)
  @ApiOperation({ summary: 'Editar usuario (rol, estado)' })
  update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(id, companyId, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Cambiar contraseña propia' })
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(userId, dto);
  }
}
