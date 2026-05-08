import {
  Controller, Get, Post, Body, Param, Req, UploadedFile,
  UseInterceptors, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { EvaluationService } from './evaluation.service';

@ApiTags('Evaluación (Candidato — Público)')
@Controller('eval')
export class EvaluationController {
  constructor(private evalService: EvaluationService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Validar token y obtener datos de la evaluación' })
  getSession(@Param('token') token: string) {
    return this.evalService.getSessionByToken(token);
  }

  @Post(':token/consent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar aceptación del consentimiento informado' })
  recordConsent(
    @Param('token') token: string,
    @Body() body: { accepted: boolean; userAgent: string },
    @Req() req: Request,
  ) {
    return this.evalService.recordConsent(token, {
      ...body,
      ipAddress: req.ip,
    });
  }

  @Post(':token/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de evaluación — genera audio de bienvenida' })
  async startSession(@Param('token') token: string) {
    try {
      return await this.evalService.startSession(token);
    } catch (e) {
      require('fs').writeFileSync('error_log.txt', e.stack || e.message);
      throw e;
    }
  }

  @Post(':token/turn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar audio del candidato y recibir siguiente turno del agente' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async processTurn(
    @Param('token') token: string,
    @Body('sessionId') sessionId: string,
    @UploadedFile() audio: Express.Multer.File,
  ) {
    return this.evalService.processTurn(token, sessionId, audio.buffer);
  }

  @Post(':token/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar sesión de evaluación manualmente' })
  endSession(
    @Param('token') token: string,
    @Body('sessionId') sessionId: string,
  ) {
    return this.evalService.endSession(token, sessionId);
  }
}
