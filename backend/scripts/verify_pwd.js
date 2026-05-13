const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'maria@maria.com' }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const isValid = await bcrypt.compare('Temp1234!', user.passwordHash);
  console.log('Password Temp1234! is valid:', isValid);
  console.log('Password hash:', user.passwordHash);
}

main().catch(console.error).finally(() => prisma.$disconnect());
