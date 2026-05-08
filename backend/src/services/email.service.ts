import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly fromName: string;
  private readonly enabled: boolean;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('sendgrid.apiKey');
    this.from = this.config.get<string>('sendgrid.from');
    this.fromName = this.config.get<string>('sendgrid.fromName');
    this.enabled = !!key && key !== 'your_sendgrid_api_key';
    if (this.enabled) {
      sgMail.setApiKey(key);
    } else {
      this.logger.warn('SendGrid no configurado — los emails se omitirán (modo dev)');
    }
  }

  // ── Enviar link de evaluación al candidato ────────────────
  async sendEvalLink(params: {
    to: string;
    candidateName: string;
    companyName: string;
    positionName: string;
    evalLink: string;
    expiryDays: number;
  }) {
    const { to, candidateName, companyName, positionName, evalLink, expiryDays } = params;
    const subject = `${companyName} te invita a una evaluación para el puesto de ${positionName}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Heebo', 'Roboto', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .logo { font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 8px; }
    .logo span { color: #4f46e5; }
    h1 { font-size: 20px; color: #2c3e50; margin: 24px 0 12px; }
    p { color: #64748b; line-height: 1.7; font-size: 15px; }
    .btn { display: inline-block; background: #b9d3fd; color: #2c3e50; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none; margin: 24px 0; }
    .info-box { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 13px; color: #64748b; margin: 16px 0; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; line-height: 1.6; }
  </style>
</head>
<body>
<div class="container">
  <div class="logo">ANDR<span>EA</span></div>
  <h1>Hola, ${candidateName}! 👋</h1>
  <p>
    <strong>${companyName}</strong> te invita a completar una evaluación para la posición de 
    <strong>${positionName}</strong>.
  </p>
  <p>
    La evaluación es una conversación por voz con nuestro asistente de inteligencia artificial ANDREA.
    Tarda entre <strong>10 y 15 minutos</strong> y podés hacerla desde tu computadora o celular.
  </p>
  <div style="text-align: center;">
    <a href="${evalLink}" class="btn">Comenzar evaluación →</a>
  </div>
  <div class="info-box">
    🔒 <strong>Privacidad:</strong> Tu información es confidencial y se usa exclusivamente para este proceso.<br>
    ⏰ <strong>Validez del link:</strong> ${expiryDays} días desde hoy.<br>
    🎙️ <strong>Necesitás:</strong> Micrófono y un lugar tranquilo.
  </div>
  <p>Si tenés algún problema técnico, respondé este email.</p>
  <div class="footer">
    Este email fue enviado por ANDREA en nombre de ${companyName}.<br>
    La herramienta de evaluación no reemplaza la decisión humana del empleador.
  </div>
</div>
</body>
</html>`;

    await this.send({ to, subject, html, text: `Ingresá a tu evaluación en: ${evalLink}` });
  }

  // ── Notificar al reclutador que hay reporte listo ─────────
  async sendReportReady(params: {
    to: string;
    recruiterName: string;
    candidateName: string;
    positionName: string;
    globalScore: number;
    recommendation: string;
    reportUrl: string;
  }) {
    const { to, recruiterName, candidateName, positionName, globalScore, recommendation, reportUrl } = params;

    const recLabel: Record<string, string> = {
      recommended:     '🟢 Recomendado',
      review:          '🟡 Revisar',
      not_recommended: '🔴 No recomendado',
    };

    const subject = `Evaluación de ${candidateName} completada — ${recLabel[recommendation] || recommendation}`;
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 32px;">
  <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">ANDR<span style="color:#4f46e5">EA</span></div>
  <h2 style="color: #2c3e50; margin: 20px 0 8px;">Reporte listo</h2>
  <p style="color: #64748b;">Hola ${recruiterName},</p>
  <p style="color: #64748b;"><strong>${candidateName}</strong> completó su evaluación para <strong>${positionName}</strong>.</p>
  <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
    <div style="font-size: 40px; font-weight: 700; color: #4f46e5;">${Math.round(globalScore)}</div>
    <div style="font-size: 13px; color: #64748b;">Score global / 100</div>
    <div style="margin-top: 8px; font-weight: 600;">${recLabel[recommendation] || recommendation}</div>
  </div>
  <a href="${reportUrl}" style="display: inline-block; background: #b9d3fd; color: #2c3e50; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">Ver reporte completo →</a>
</div>`;

    await this.send({ to, subject, html, text: `Ver reporte: ${reportUrl}` });
  }

  // ── Helper genérico ────────────────────────────────────────
  private async send(msg: { to: string; subject: string; html: string; text: string }) {
    if (!this.enabled) {
      this.logger.log(`[DEV] Email omitido → ${msg.to}: ${msg.subject}`);
      return;
    }
    try {
      await sgMail.send({
        to: msg.to,
        from: { email: this.from, name: this.fromName },
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
      this.logger.log(`Email enviado → ${msg.to}`);
    } catch (err) {
      this.logger.error(`Error enviando email → ${msg.to}`, err);
    }
  }
}
