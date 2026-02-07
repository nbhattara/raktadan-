const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

async function seedDistricts() {
  try {
    console.log('Seeding districts...');
    
    // All 77 districts of Nepal
    const districts = config.NEPAL_DISTRICTS;
    
    for (const districtName of districts) {
      try {
        await prisma.districtData.upsert({
          where: { name: districtName },
          update: {
            name: districtName
          },
          create: {
            name: districtName,
            isActive: true
          }
        });
        console.log(`✅ District added: ${districtName}`);
      } catch (error) {
        console.error(`❌ Error adding district ${districtName}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully seeded ${districts.length} districts`);
  } catch (error) {
    console.error('Error seeding districts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDistricts();
}

module.exports = seedDistricts;
