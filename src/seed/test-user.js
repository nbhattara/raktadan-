const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test admin user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        name: 'Test Admin',
        email: 'test@example.com',
        password: hashedPassword,
        phone: '9841234567',
        role: 'SUPER_ADMIN',
        isActive: true,
        isEmailVerified: true
      },
      create: {
        id: 'cmlcgdxpn0000142ijnfoyasf', // Fixed ID for foreign key references
        name: 'Test Admin',
        email: 'test@example.com',
        password: hashedPassword,
        phone: '9841234567',
        role: 'SUPER_ADMIN',
        isActive: true,
        isEmailVerified: true
      }
    });
    
    console.log('✅ Test user created successfully:');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: password123`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestUser();
}

module.exports = createTestUser;
