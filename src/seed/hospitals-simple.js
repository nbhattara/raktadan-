const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleHospitals = [
  {
    name: "Tribhuvan University Teaching Hospital",
    email: "info@tuthhospital.org",
    phone: "01-4473000",
    address: "Maharajgunj, Kathmandu",
    city: "Kathmandu",
    state: "Bagmati",
    district: "Kathmandu",
    pincode: "44600",
    type: "GOVERNMENT",
    licenseNumber: "HOSP-001-NEP",
    capacity: 700,
    bloodBankAvailable: true,
    emergencyServices: true,
    coordinates: { lat: 27.7172, lng: 85.3240 },
    isActive: true,
    isVerified: true,
    adminId: "cmlcgdxpn0000142ijnfoyasf"
  },
  {
    name: "Grande International Hospital",
    email: "info@grandehospital.com",
    phone: "01-5154399",
    address: "Dhapakhel, Lalitpur",
    city: "Lalitpur",
    state: "Bagmati",
    district: "Lalitpur",
    pincode: "44700",
    type: "PRIVATE",
    licenseNumber: "HOSP-002-NEP",
    capacity: 300,
    bloodBankAvailable: true,
    emergencyServices: true,
    coordinates: { lat: 27.6783, lng: 85.3311 },
    isActive: true,
    isVerified: true,
    adminId: "cmlcgdxpn0000142ijnfoyasf"
  },
  {
    name: "BPKIHS - Dharan",
    email: "info@bpkihs.edu",
    phone: "026-525151",
    address: "Ghopa, Dharan",
    city: "Dharan",
    state: "Koshi",
    district: "Jhapa",
    pincode: "56600",
    type: "GOVERNMENT",
    licenseNumber: "HOSP-003-NEP",
    capacity: 500,
    bloodBankAvailable: true,
    emergencyServices: true,
    coordinates: { lat: 26.7944, lng: 87.2819 },
    isActive: true,
    isVerified: true,
    adminId: "cmlcgdxpn0000142ijnfoyasf"
  },
  {
    name: "Manipal Hospital, Pokhara",
    email: "info@manipalhospital.com.np",
    phone: "061-525111",
    address: "Lakeside, Pokhara",
    city: "Pokhara",
    state: "Gandaki",
    district: "Kaski",
    pincode: "33700",
    type: "PRIVATE",
    licenseNumber: "HOSP-004-NEP",
    capacity: 400,
    bloodBankAvailable: true,
    emergencyServices: true,
    coordinates: { lat: 28.2096, lng: 83.9856 },
    isActive: true,
    isVerified: true,
    adminId: "cmlcgdxpn0000142ijnfoyasf"
  },
  {
    name: "Narayani Hospital, Birgunj",
    email: "info@narayanihospital.com",
    phone: "051-525011",
    address: "Gadhimai, Birgunj",
    city: "Birgunj",
    state: "Madhesh",
    district: "Parsa",
    pincode: "44300",
    type: "GOVERNMENT",
    licenseNumber: "HOSP-005-NEP",
    capacity: 350,
    bloodBankAvailable: true,
    emergencyServices: true,
    coordinates: { lat: 27.0176, lng: 84.8589 },
    isActive: true,
    isVerified: true,
    adminId: "cmlcgdxpn0000142ijnfoyasf"
  }
];

async function seedHospitals() {
  try {
    console.log('Seeding hospitals...');
    
    for (const hospital of sampleHospitals) {
      await prisma.hospital.upsert({
        where: { email: hospital.email },
        update: hospital,
        create: hospital
      });
    }
    
    console.log('Hospitals seeded successfully!');
  } catch (error) {
    console.error('Error seeding hospitals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedHospitals();
}

module.exports = seedHospitals;
