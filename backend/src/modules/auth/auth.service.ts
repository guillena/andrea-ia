import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Login ────────────────────────────────────────────────
  async login(email: string, password: string) {
    this.logger.log(`Attempting login for email: "${email}" (length: ${email.length}), password length: ${password.length}, password exactly: "${password}"`);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        user.status === 'pending'
          ? 'Tu cuenta está pendiente de activación. Revisá tu email.'
          : 'Tu cuenta está deshabilitada. Contactá a tu administrador.',
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    this.logger.log(`Login exitoso: ${user.email} (${user.role})`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  // ── Refresh token ────────────────────────────────────────
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, companyId: true, status: true },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Token inválido');
      }

      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  // ── Forgot password ──────────────────────────────────────
  async forgotPassword(email: string) {
    // Siempre responder igual (no revelar si el email existe)
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      // TODO: Generar token y enviar email de recuperación con SendGrid
      this.logger.log(`Password reset solicitado para: ${email}`);
    }
    return { message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.' };
  }

  // ── Reset password ───────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    // TODO: Validar token de reset y actualizar contraseña
    throw new BadRequestException('Funcionalidad en desarrollo');
  }

  // ── Helpers ───────────────────────────────────────────────
  private generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        lastLoginAt: true,
        company: { select: { name: true, plan: true, status: true } },
      },
    });
  }
}
