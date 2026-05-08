import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, lastLoginAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(companyId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ya existe un usuario con ese email');

    const password = dto.temporaryPassword || 'Temp1234!';
    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        companyId, email: dto.email,
        firstName: dto.firstName, lastName: dto.lastName,
        role: dto.role, status: 'active',
        passwordHash,
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, status: true,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, companyId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: dto.status as any,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new ForbiddenException('Contraseña actual incorrecta');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { success: true };
  }
}
