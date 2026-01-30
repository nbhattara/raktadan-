const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class DonorCardGenerator {
  static async generateDonorCard(donorData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // Pipe the PDF to a file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Set up the document
        this.setupDocument(doc);

        // Add header
        this.addHeader(doc);

        // Add donor information
        this.addDonorInfo(doc, donorData);

        // Add QR code placeholder
        this.addQRCodePlaceholder(doc);

        // Add footer
        this.addFooter(doc);

        // Finalize the PDF
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static setupDocument(doc) {
    // Set font
    doc.font('Helvetica');

    // Add background color
    doc.rect(0, 0, doc.page.width, doc.page.height, {
      color: '#f8f9fa',
      fill: true
    });

    // Add border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40, {
      color: '#e74c3c',
      fill: false,
      lineWidth: 2
    });
  }

  static addHeader(doc) {
    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fill('#e74c3c')
       .text('रक्तदान दाता कार्ड', { align: 'center' });

    doc.fontSize(16)
       .font('Helvetica')
       .fill('#2c3e50')
       .text('Blood Donor Card', { align: 'center' });

    // Add decorative line
    doc.moveTo(100, 80)
       .lineTo(doc.page.width - 100, 80)
       .lineWidth(2)
       .stroke('#e74c3c');

    doc.moveDown();
  }

  static addDonorInfo(doc, donorData) {
    const leftMargin = 80;
    const rightMargin = 350;
    let yPosition = 120;

    // Donor Photo Placeholder
    doc.rect(leftMargin, yPosition, 100, 120, {
      color: '#ecf0f1',
      fill: true,
      lineWidth: 1,
      stroke: '#bdc3c7'
    });

    doc.fontSize(10)
       .fill('#7f8c8d')
       .text('Photo', leftMargin + 35, yPosition + 55, { align: 'center' });

    // Donor Information
    yPosition += 20;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('Donor Information', rightMargin, yPosition);

    yPosition += 25;
    doc.fontSize(12)
       .font('Helvetica')
       .fill('#34495e');

    const donorInfo = [
      `Name: ${donorData.name || 'N/A'}`,
      `Blood Group: ${donorData.bloodGroup || 'N/A'}`,
      `Age: ${donorData.age || 'N/A'}`,
      `Gender: ${donorData.gender || 'N/A'}`,
      `Phone: ${donorData.phone || 'N/A'}`,
      `District: ${donorData.district || 'N/A'}`,
      `Member Since: ${donorData.memberSince ? new Date(donorData.memberSince).toLocaleDateString() : 'N/A'}`
    ];

    donorInfo.forEach(info => {
      doc.text(info, rightMargin, yPosition);
      yPosition += 18;
    });

    // Total Donations Badge
    if (donorData.totalDonations > 0) {
      yPosition += 10;
      doc.rect(rightMargin - 10, yPosition - 5, 150, 30, {
        color: '#e74c3c',
        fill: true,
        radius: 5
      });

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fill('white')
         .text(`Total Donations: ${donorData.totalDonations}`, rightMargin, yPosition + 8);
    }

    // Badges
    if (donorData.badges && donorData.badges.length > 0) {
      yPosition += 50;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fill('#2c3e50')
         .text('Achievements', rightMargin, yPosition);

      yPosition += 20;
      donorData.badges.forEach((badge, index) => {
        if (index < 3) { // Show max 3 badges
          doc.fontSize(10)
             .font('Helvetica')
             .fill('#27ae60')
             .text(`• ${badge}`, rightMargin + 10, yPosition);
          yPosition += 15;
        }
      });
    }
  }

  static addQRCodePlaceholder(doc) {
    const qrSize = 80;
    const qrX = doc.page.width - 150;
    const qrY = 400;

    // QR Code Placeholder
    doc.rect(qrX, qrY, qrSize, qrSize, {
      color: '#ecf0f1',
      fill: true,
      lineWidth: 1,
      stroke: '#bdc3c7'
    });

    doc.fontSize(8)
       .fill('#7f8c8d')
       .text('QR Code', qrX + 25, qrY + 35, { align: 'center' });

    // Verification text
    doc.fontSize(10)
       .font('Helvetica')
       .fill('#7f8c8d')
       .text('Scan to verify donor', qrX, qrY + qrSize + 10, { align: 'center' });
  }

  static addFooter(doc) {
    const footerY = doc.page.height - 100;

    // Important Information
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('Important Information:', 80, footerY);

    doc.fontSize(9)
       .font('Helvetica')
       .fill('#34495e');

    const importantInfo = [
      '• This card certifies that the holder is a registered blood donor',
      '• Please donate blood only if you are healthy and meet eligibility criteria',
      '• Minimum donation interval: 90 days',
      '• For emergencies, contact: 1155 (Nepal Health Emergency)',
      '• This card is property of Raktadan Blood Donation Platform'
    ];

    let infoY = footerY + 20;
    importantInfo.forEach(info => {
      doc.text(info, 80, infoY);
      infoY += 12;
    });

    // Contact Information
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fill('#2c3e50')
       .text('Contact Information:', 350, footerY);

    doc.fontSize(9)
       .font('Helvetica')
       .fill('#34495e');

    const contactInfo = [
      'Email: info@raktadan.com',
      'Website: www.raktadan.com',
      'Helpline: +977-1-XXXXXXX',
      '24/7 Emergency: 1155'
    ];

    let contactY = footerY + 20;
    contactInfo.forEach(info => {
      doc.text(info, 350, contactY);
      contactY += 12;
    });

    // Footer line and date
    doc.moveTo(80, doc.page.height - 40)
       .lineTo(doc.page.width - 80, doc.page.height - 40)
       .lineWidth(1)
       .stroke('#95a5a6');

    doc.fontSize(8)
       .font('Helvetica')
       .fill('#7f8c8d')
       .text(`Generated on: ${new Date().toLocaleDateString()} | Valid until: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 
             doc.page.width / 2, doc.page.height - 25, { align: 'center' });
  }

  static async generateDonorCardBuffer(donorData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        // Set up the document
        this.setupDocument(doc);
        this.addHeader(doc);
        this.addDonorInfo(doc, donorData);
        this.addQRCodePlaceholder(doc);
        this.addFooter(doc);

        doc.end();

        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = DonorCardGenerator;
