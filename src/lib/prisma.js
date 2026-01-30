const { PrismaClient } = require('@prisma/client');

class PrismaClientSingleton {
  constructor() {
    if (!PrismaClientSingleton.instance) {
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
      PrismaClientSingleton.instance = this.prisma;
    }
    return PrismaClientSingleton.instance;
  }
}

const prisma = new PrismaClientSingleton();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
