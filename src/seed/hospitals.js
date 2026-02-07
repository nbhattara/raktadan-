const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const sampleHospitals = [
  {
    name: "Tribhuvan University Teaching Hospital",
    email: "info@tuthhospital.org",
    phone: "01-4473000",
    address: "Maharajgunj, Kathmandu",
    district: "Kathmandu",
    city: "Kathmandu",
    state: "Bagmati",
    pincode: "44600",
    type: "GOVERNMENT",
    licenseNumber: "HOSP-001-NEP",
    capacity: 700,
    bloodBankAvailable: true,
    emergencyServices: true,
    coordinates: { lat: 27.7172, lng: 85.3240 },
    isActive: true,
    isVerified: true,
    adminId: "cmlcgdxpn0000142ijnfoyasf" // Use our test user ID
  },
  {
    name: "Grande International Hospital",
    email: "info@grandehospital.com",
    phone: "01-5154399",
    alternatePhone: "01-5154400",
    address: "Dhapakhel, Lalitpur",
    district: "Lalitpur",
    city: "Lalitpur",
    state: "Bagmati",
    pincode: "44700",
    coordinates: { lat: 27.6783, lng: 85.3311 },
    services: ["Emergency", "Blood Bank", "ICU", "Cardiology", "Neurology"],
    facilities: ["24/7 Emergency", "Blood Bank", "ICU", "NICU", "Cath Lab", "MRI"],
    emergencyServices: true,
    hasBloodBank: true,
    bloodBankCapacity: 300,
    currentBloodStock: {
      "A_POSITIVE": 28,
      "A_NEGATIVE": 7,
      "B_POSITIVE": 22,
      "B_NEGATIVE": 6,
      "AB_POSITIVE": 10,
      "AB_NEGATIVE": 3,
      "O_POSITIVE": 35,
      "O_NEGATIVE": 12
    },
    operatingHours: {
      "emergency": "24/7",
      "opd": "8:00 AM - 8:00 PM",
      "bloodBank": "8:00 AM - 6:00 PM"
    },
    website: "https://grandehospital.com",
    type: "PRIVATE",
    rating: 4.3,
    verified: true,
    approved: true,
    licenseNumber: "HOSP-002-NEP"
  },
  {
    name: "BPKIHS - Dharan",
    email: "info@bpkihs.edu",
    phone: "026-525151",
    alternatePhone: "026-525152",
    address: "Ghopa, Dharan",
    district: "Sunsari",
    city: "Dharan",
    state: "Koshi",
    pincode: "56600",
    coordinates: { lat: 26.7944, lng: 87.2819 },
    services: ["Emergency", "Blood Bank", "ICU", "Surgery", "Pediatrics"],
    facilities: ["24/7 Emergency", "Blood Bank", "ICU", "NICU", "Surgery Theater", "Dental"],
    emergencyServices: true,
    hasBloodBank: true,
    bloodBankCapacity: 400,
    currentBloodStock: {
      "A_POSITIVE": 35,
      "A_NEGATIVE": 10,
      "B_POSITIVE": 30,
      "B_NEGATIVE": 8,
      "AB_POSITIVE": 12,
      "AB_NEGATIVE": 4,
      "O_POSITIVE": 48,
      "O_NEGATIVE": 15
    },
    operatingHours: {
      "emergency": "24/7",
      "opd": "9:00 AM - 5:00 PM",
      "bloodBank": "8:00 AM - 7:00 PM"
    },
    website: "https://bpkihs.edu",
    type: "GOVERNMENT",
    rating: 4.4,
    verified: true,
    approved: true,
    licenseNumber: "HOSP-003-NEP"
  },
  {
    name: "Manipal Hospital, Pokhara",
    email: "info@manipalhospital.com.np",
    phone: "061-525111",
    alternatePhone: "061-525112",
    address: "Lakeside, Pokhara",
    district: "Kaski",
    city: "Pokhara",
    state: "Gandaki",
    pincode: "33700",
    coordinates: { lat: 28.2096, lng: 83.9856 },
    services: ["Emergency", "Blood Bank", "ICU", "Cardiology", "Orthopedics"],
    facilities: ["24/7 Emergency", "Blood Bank", "ICU", "NICU", "Cath Lab", "CT Scan"],
    emergencyServices: true,
    hasBloodBank: true,
    bloodBankCapacity: 350,
    currentBloodStock: {
      "A_POSITIVE": 32,
      "A_NEGATIVE": 9,
      "B_POSITIVE": 26,
      "B_NEGATIVE": 7,
      "AB_POSITIVE": 11,
      "AB_NEGATIVE": 4,
      "O_POSITIVE": 42,
      "O_NEGATIVE": 13
    },
    operatingHours: {
      "emergency": "24/7",
      "opd": "8:00 AM - 8:00 PM",
      "bloodBank": "8:00 AM - 6:00 PM"
    },
    website: "https://manipalhospital.com.np",
    type: "PRIVATE",
    rating: 4.2,
    verified: true,
    approved: true,
    licenseNumber: "HOSP-004-NEP"
  },
  {
    name: "Narayani Hospital, Birgunj",
    email: "info@narayanihospital.com",
    phone: "051-525011",
    alternatePhone: "051-525012",
    address: "Gadhimai, Birgunj",
    district: "Parsa",
    city: "Birgunj",
    state: "Madhesh",
    pincode: "44300",
    coordinates: { lat: 27.0176, lng: 84.8589 },
    services: ["Emergency", "Blood Bank", "ICU", "Surgery", "Medicine"],
    facilities: ["24/7 Emergency", "Blood Bank", "ICU", "Surgery Theater", "Laboratory"],
    emergencyServices: true,
    hasBloodBank: true,
    bloodBankCapacity: 250,
    currentBloodStock: {
      "A_POSITIVE": 25,
      "A_NEGATIVE": 6,
      "B_POSITIVE": 20,
      "B_NEGATIVE": 5,
      "AB_POSITIVE": 8,
      "AB_NEGATIVE": 2,
      "O_POSITIVE": 30,
      "O_NEGATIVE": 10
    },
    operatingHours: {
      "emergency": "24/7",
      "opd": "8:00 AM - 6:00 PM",
      "bloodBank": "8:00 AM - 5:00 PM"
    },
    website: "https://narayanihospital.com",
    type: "GOVERNMENT",
    rating: 3.8,
    verified: true,
    approved: true,
    licenseNumber: "HOSP-005-NEP"
  }
];

async function seedHospitals() {
  try {
    console.log('Seeding hospitals...');
    
    for (const hospital of sampleHospitals) {
      await prisma.hospital.upsert({
        where: { email: hospital.email },
        update: hospital,
        create: {
          ...hospital,
          id: `hospital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
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
