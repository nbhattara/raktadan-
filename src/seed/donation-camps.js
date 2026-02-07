const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const sampleCamps = [
  {
    title: "Blood Donation Camp - Kathmandu",
    description: "Join us for a community blood donation camp organized by Nepal Red Cross Society. All blood groups are welcome.",
    organizer: "Nepal Red Cross Society",
    organizerPhone: "01-4270120",
    organizerEmail: "info@redcross.org.np",
    venue: "City Hall, Kathmandu",
    address: "Bhrikuti Mandap, Kathmandu",
    city: "Kathmandu",
    state: "Bagmati",
    pincode: "44600",
    startDate: "2026-02-15T09:00:00.000Z",
    endDate: "2026-02-15T17:00:00.000Z",
    startTime: "09:00",
    endTime: "17:00",
    targetDonations: 100,
    bloodGroupsNeeded: ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    requirements: ["Age 18-65", "Weight above 50kg", "Healthy condition"],
    facilities: ["Medical check-up", "Refreshments", "Certificate"],
    images: ["https://example.com/camp1.jpg", "https://example.com/camp2.jpg"],
    contactPerson: "Ramesh Sharma",
    contactPersonPhone: "9841234567",
    status: "UPCOMING",
    createdBy: "cmlcgdxpn0000142ijnfoyasf"
  },
  {
    title: "Emergency Blood Drive - Pokhara",
    description: "Emergency blood donation drive to meet the critical shortage of O-negative blood group in Pokhara hospitals.",
    organizer: "Manipal Hospital",
    organizerPhone: "061-525111",
    organizerEmail: "info@manipalhospital.com",
    venue: "Manipal Hospital Campus",
    address: "Lakeside, Pokhara",
    city: "Pokhara",
    state: "Gandaki",
    pincode: "33700",
    startDate: "2026-02-20T08:00:00.000Z",
    endDate: "2026-02-20T18:00:00.000Z",
    startTime: "08:00",
    endTime: "18:00",
    targetDonations: 75,
    bloodGroupsNeeded: ["O_NEGATIVE", "O_POSITIVE", "A_NEGATIVE"],
    requirements: ["Emergency need", "O-negative priority", "Healthy condition"],
    facilities: ["Emergency medical team", "Priority processing", "Refreshments"],
    images: ["https://example.com/emergency1.jpg"],
    contactPerson: "Dr. Anita Gurung",
    contactPersonPhone: "9845678901",
    status: "UPCOMING",
    createdBy: "cmlcgdxpn0000142ijnfoyasf"
  },
  {
    title: "Corporate Blood Donation Camp",
    description: "Special blood donation camp for corporate employees and their families. Free health check-up included.",
    organizer: "Grande International Hospital",
    organizerPhone: "01-5154399",
    organizerEmail: "info@grandehospital.com",
    venue: "Grande Hospital Premises",
    address: "Dhapakhel, Lalitpur",
    city: "Lalitpur",
    state: "Bagmati",
    pincode: "44700",
    startDate: "2026-02-25T10:00:00.000Z",
    endDate: "2026-02-25T16:00:00.000Z",
    startTime: "10:00",
    endTime: "16:00",
    targetDonations: 50,
    bloodGroupsNeeded: ["A_POSITIVE", "B_POSITIVE", "O_POSITIVE"],
    requirements: ["Corporate ID", "Age 18-65", "Healthy condition"],
    facilities: ["Free health check-up", "Corporate gifts", "Refreshments"],
    images: ["https://example.com/corporate1.jpg", "https://example.com/corporate2.jpg"],
    contactPerson: "Sita Karki",
    contactPersonPhone: "9842345678",
    status: "UPCOMING",
    createdBy: "cmlcgdxpn0000142ijnfoyasf"
  }
];

async function seedDonationCamps() {
  try {
    console.log('Seeding donation camps...');
    
    for (const camp of sampleCamps) {
      await prisma.donationCamp.create({
        data: camp
      });
    }
    
    console.log('Donation camps seeded successfully!');
  } catch (error) {
    console.error('Error seeding donation camps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDonationCamps();
}

module.exports = seedDonationCamps;
