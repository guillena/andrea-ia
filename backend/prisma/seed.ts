import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Competencias predefinidas por puesto (MVP)
// Cada empresa recibirá una copia propia de estas al darse de alta
// ─────────────────────────────────────────────────────────────

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

async function main() {
  console.log('🌱 Iniciando seed de ANDREA...');

  // ── Super Admin ────────────────────────────────────────────
  const bcrypt = await import('bcrypt');
  const superAdminPassword = await bcrypt.hash('Admin123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@andrea.app' },
    update: {},
    create: {
      email: 'admin@andrea.app',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'active',
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // ── Empresa piloto ─────────────────────────────────────────
  const pilotCompany = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Empresa Piloto S.A.',
      country: 'AR',
      taxId: '30-12345678-9',
      plan: 'pilot',
      status: 'active',
      maxEvaluations: 500,
    },
  });
  console.log(`✅ Empresa piloto: ${pilotCompany.name}`);

  // ── Puestos base para la empresa piloto ───────────────────
  for (const pos of BASE_POSITIONS) {
    await prisma.jobPosition.upsert({
      where: {
        companyId_basePositionKey: {
          companyId: pilotCompany.id,
          basePositionKey: pos.basePositionKey,
        },
      },
      update: { competencies: pos.competencies as any },
      create: {
        companyId: pilotCompany.id,
        basePositionKey: pos.basePositionKey,
        name: pos.name,
        description: pos.description,
        competencies: pos.competencies as any,
        isActive: true,
      },
    });
    console.log(`  📋 Puesto sincronizado: ${pos.name}`);
  }

  // ── Admin de empresa piloto ────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@empresapiloto.com' },
    update: {},
    create: {
      email: 'admin@empresapiloto.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Piloto',
      role: 'admin_empresa',
      status: 'active',
      companyId: pilotCompany.id,
    },
  });
  console.log(`✅ Admin empresa piloto: ${companyAdmin.email}`);

  console.log('\n🎉 Seed completado exitosamente.');
  console.log('\n📌 Credenciales de acceso:');
  console.log('   Super Admin: admin@andrea.app / Admin123!');
  console.log('   Admin Empresa: admin@empresapiloto.com / Admin123!');
  console.log('\n⚠️  Cambiar contraseñas en producción.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
