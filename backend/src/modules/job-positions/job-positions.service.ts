import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCompetenciesDto } from './dto/job-position.dto';

@Injectable()
export class JobPositionsService {
  constructor(private prisma: PrismaService) {}

  // ── Listar puestos de la empresa ──────────────────────────
  async findAll(companyId: string) {
    return this.prisma.jobPosition.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ── Obtener un puesto con sus competencias ────────────────
  async findOne(id: string, companyId: string) {
    const pos = await this.prisma.jobPosition.findFirst({
      where: { id, companyId },
    });
    if (!pos) throw new NotFoundException('Puesto no encontrado');
    return pos;
  }

  // ── Actualizar competencias del puesto (Admin Empresa) ────
  async updateCompetencies(id: string, companyId: string, dto: UpdateCompetenciesDto) {
    const pos = await this.prisma.jobPosition.findFirst({
      where: { id, companyId },
    });
    if (!pos) throw new NotFoundException('Puesto no encontrado');

    return this.prisma.jobPosition.update({
      where: { id },
      data: { competencies: dto.competencies as any },
    });
  }

  // ── Crea las 4 posiciones base para una nueva empresa ─────
  async seedForCompany(companyId: string) {
    const BASE_POSITIONS = [
      {
        basePositionKey: 'customer_support',
        name: 'Customer Support',
        description: 'Atención al cliente, soporte técnico o call center',
        competencies: [
          { id: 'cs-1', name: 'Orientación al cliente', dimension: 'conductual', weight: 1.2, isActive: true },
          { id: 'cs-2', name: 'Tolerancia a la presión y frustración', dimension: 'conductual', weight: 1.1, isActive: true },
          { id: 'cs-3', name: 'Comunicación clara y empática', dimension: 'comunicacion', weight: 1.2, isActive: true },
          { id: 'cs-4', name: 'Resolución de problemas simples', dimension: 'cognitiva', weight: 1.0, isActive: true },
          { id: 'cs-5', name: 'Escucha activa', dimension: 'comunicacion', weight: 1.1, isActive: true },
        ],
      },
      {
        basePositionKey: 'ventas',
        name: 'Ventas',
        description: 'Representante de ventas, asesor comercial, ejecutivo de cuenta',
        competencies: [
          { id: 'vt-1', name: 'Orientación a resultados', dimension: 'conductual', weight: 1.2, isActive: true },
          { id: 'vt-2', name: 'Persuasión y comunicación efectiva', dimension: 'comunicacion', weight: 1.2, isActive: true },
          { id: 'vt-3', name: 'Adaptabilidad ante el rechazo', dimension: 'conductual', weight: 1.1, isActive: true },
          { id: 'vt-4', name: 'Razonamiento comercial básico', dimension: 'cognitiva', weight: 1.0, isActive: true },
          { id: 'vt-5', name: 'Autoconfianza declarativa', dimension: 'conductual', weight: 1.0, isActive: true },
        ],
      },
      {
        basePositionKey: 'backoffice',
        name: 'Backoffice',
        description: 'Administrativo, operador de datos, soporte interno',
        competencies: [
          { id: 'bo-1', name: 'Responsabilidad y orden', dimension: 'conductual', weight: 1.2, isActive: true },
          { id: 'bo-2', name: 'Atención al detalle', dimension: 'cognitiva', weight: 1.2, isActive: true },
          { id: 'bo-3', name: 'Comprensión de instrucciones', dimension: 'cognitiva', weight: 1.1, isActive: true },
          { id: 'bo-4', name: 'Comunicación escrita y verbal clara', dimension: 'comunicacion', weight: 1.0, isActive: true },
          { id: 'bo-5', name: 'Honestidad laboral declarativa', dimension: 'conductual', weight: 1.1, isActive: true },
        ],
      },
      {
        basePositionKey: 'operaciones_logisticas',
        name: 'Operaciones Logísticas',
        description: 'Operador logístico, repartidor, almacenista, conductor',
        competencies: [
          { id: 'ol-1', name: 'Responsabilidad y puntualidad', dimension: 'conductual', weight: 1.3, isActive: true },
          { id: 'ol-2', name: 'Adaptabilidad a cambios de ruta o tarea', dimension: 'conductual', weight: 1.1, isActive: true },
          { id: 'ol-3', name: 'Comprensión de instrucciones operativas', dimension: 'cognitiva', weight: 1.1, isActive: true },
          { id: 'ol-4', name: 'Trabajo bajo presión', dimension: 'conductual', weight: 1.2, isActive: true },
          { id: 'ol-5', name: 'Comunicación funcional', dimension: 'comunicacion', weight: 1.0, isActive: true },
        ],
      },
    ];

    await this.prisma.jobPosition.createMany({
      data: BASE_POSITIONS.map((p) => ({ ...p, companyId })),
      skipDuplicates: true,
    });
  }
}
