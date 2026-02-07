const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const sampleAmbulances = [
  {
    name: "Nepal Red Cross Society Ambulance",
    phoneNumber: "01-4270120",
    alternatePhoneNumber: "01-4270121",
    district: "Kathmandu",
    city: "Kathmandu",
    serviceArea: ["Kathmandu Valley", "Lalitpur", "Bhaktapur"],
    is24Hours: true,
    serviceType: "NGO",
    vehicleType: "BASIC",
    facilities: ["Basic Life Support", "Oxygen", "Stretcher"],
    serviceCharges: { baseFee: 500, perKm: 25 },
    operatingHours: { from: "00:00", to: "23:59", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    specialServices: ["Emergency Response", "Medical Transport"],
    isActive: true,
    verified: true
  },
  {
    name: "KMC Hospital Ambulance Service",
    phoneNumber: "01-5000000",
    alternatePhoneNumber: "01-5000001",
    district: "Kathmandu",
    city: "Kathmandu",
    serviceArea: ["Kathmandu", "Lalitpur"],
    is24Hours: true,
    serviceType: "HOSPITAL_BASED",
    vehicleType: "ADVANCED",
    facilities: ["Advanced Life Support", "Cardiac Monitor", "Ventilator", "Defibrillator"],
    serviceCharges: { baseFee: 1500, perKm: 50 },
    operatingHours: { from: "00:00", to: "23:59", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    specialServices: ["Emergency Response", "Medical Transport"],
    isActive: true,
    verified: true
  },
  {
    name: "Patan Hospital Ambulance",
    phoneNumber: "01-5522205",
    alternatePhoneNumber: "01-5522206",
    district: "Lalitpur",
    city: "Lalitpur",
    serviceArea: ["Lalitpur", "Kathmandu"],
    is24Hours: true,
    serviceType: "HOSPITAL_BASED",
    vehicleType: "ADVANCED",
    facilities: ["Advanced Life Support", "Cardiac Monitor", "Ventilator"],
    serviceCharges: { baseFee: 1200, perKm: 45 },
    operatingHours: { from: "00:00", to: "23:59", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    specialServices: ["Emergency Response", "Medical Transport"],
    isActive: true,
    verified: true
  },
  {
    name: "BPKIHS Ambulance Service",
    phoneNumber: "026-525555",
    alternatePhoneNumber: "026-525556",
    district: "Jhapa",
    city: "Dharan",
    serviceArea: ["Sunsari", "Morang", "Jhapa"],
    is24Hours: true,
    serviceType: "HOSPITAL_BASED",
    vehicleType: "ICU",
    facilities: ["ICU on Wheels", "Full Life Support", "Critical Care Equipment", "Ventilator"],
    serviceCharges: { baseFee: 2000, perKm: 60 },
    operatingHours: { from: "00:00", to: "23:59", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    specialServices: ["Emergency Response", "Medical Transport"],
    isActive: true,
    verified: true
  },
  {
    name: "Manipal Hospital Ambulance",
    phoneNumber: "061-525555",
    alternatePhoneNumber: "061-525556",
    district: "Kaski",
    city: "Pokhara",
    serviceArea: ["Kaski", "Syangja", "Tanahu"],
    is24Hours: true,
    serviceType: "HOSPITAL_BASED",
    vehicleType: "ADVANCED",
    facilities: ["Advanced Life Support", "Cardiac Monitor", "Ventilator", "Defibrillator"],
    serviceCharges: { baseFee: 1300, perKm: 48 },
    operatingHours: { from: "00:00", to: "23:59", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    specialServices: ["Emergency Response", "Medical Transport"],
    isActive: true,
    verified: true
  }
];

async function seedAmbulances() {
  try {
    console.log('Seeding ambulances...');
    
    for (const ambulance of sampleAmbulances) {
      await prisma.ambulanceService.create({
        data: ambulance
      });
    }
    
    console.log('Ambulances seeded successfully!');
  } catch (error) {
    console.error('Error seeding ambulances:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedAmbulances();
}

module.exports = seedAmbulances;
