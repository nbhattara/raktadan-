-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `bloodGroup` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `district` ENUM('morang', 'Jhapa', 'Ilam', 'Taplejung', 'Panchthar', 'Terhathum', 'Sankhuwasabha', 'Bhojpur', 'Dhankuta', 'Khotang', 'Solukhumbu', 'Okhaldhunga', 'Udayapur', 'Saptari', 'Siraha', 'Dhanusa', 'Mahottari', 'Sarlahi', 'Rautahat', 'Bara', 'Parsa', 'Chitwan', 'Makwanpur', 'Ramechhap', 'Sindhuli', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Nuwakot', 'Rasuwa', 'Sindhupalchok', 'Dolakha', 'Mahagadhi', 'Baglung', 'Mustang', 'Myagdi', 'Parbat', 'Kaski', 'Lamjung', 'Gorkha', 'Manang', 'Syangja', 'Tanahu', 'Kapilvastu', 'Rupandehi', 'Nawalparasi', 'Palpa', 'Arghakhanchi', 'Gulmi', 'Pyuthan', 'Rolpa', 'Rukum', 'Salyan', 'Dang', 'Banke', 'Bardiya', 'Kailali', 'Kanchanpur', 'Doti', 'Dadeldhura', 'Baitadi', 'Darchula', 'Sudurpaschim') NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `isDonor` BOOLEAN NOT NULL DEFAULT true,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `lastDonation` DATETIME(3) NULL,
    `medicalConditions` JSON NOT NULL,
    `emergencyContact` JSON NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'HOSPITAL') NOT NULL DEFAULT 'USER',
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerificationToken` VARCHAR(191) NULL,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `fcmToken` VARCHAR(191) NULL,
    `profilePhotoUrl` VARCHAR(191) NULL,
    `memberSince` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalDonations` INTEGER NOT NULL DEFAULT 0,
    `badges` JSON NOT NULL,
    `coordinates` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_records` (
    `id` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `donationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `donationType` ENUM('WHOLE_BLOOD', 'PLATELETS', 'PLASMA') NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `organization` VARCHAR(191) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedBy` VARCHAR(191) NULL,
    `verifiedDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `units` INTEGER NOT NULL DEFAULT 1,
    `recipientInfo` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_requests` (
    `id` VARCHAR(191) NOT NULL,
    `patientName` VARCHAR(191) NOT NULL,
    `patientAge` INTEGER NOT NULL,
    `patientGender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `bloodGroup` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NOT NULL,
    `unitsRequired` INTEGER NOT NULL,
    `urgency` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `hospitalName` VARCHAR(191) NOT NULL,
    `hospitalAddress` VARCHAR(191) NOT NULL,
    `hospitalCity` VARCHAR(191) NOT NULL,
    `hospitalState` VARCHAR(191) NOT NULL,
    `hospitalPincode` VARCHAR(191) NOT NULL,
    `hospitalPhone` VARCHAR(191) NOT NULL,
    `doctorName` VARCHAR(191) NOT NULL,
    `doctorPhone` VARCHAR(191) NOT NULL,
    `medicalReason` VARCHAR(191) NOT NULL,
    `requiredBy` DATETIME(3) NOT NULL,
    `contactPerson` VARCHAR(191) NOT NULL,
    `contactPersonPhone` VARCHAR(191) NOT NULL,
    `additionalNotes` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `donorsResponded` JSON NOT NULL,
    `unitsFulfilled` INTEGER NOT NULL DEFAULT 0,
    `requestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ambulance_services` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `alternatePhoneNumber` VARCHAR(191) NULL,
    `district` ENUM('morang', 'Jhapa', 'Ilam', 'Taplejung', 'Panchthar', 'Terhathum', 'Sankhuwasabha', 'Bhojpur', 'Dhankuta', 'Khotang', 'Solukhumbu', 'Okhaldhunga', 'Udayapur', 'Saptari', 'Siraha', 'Dhanusa', 'Mahottari', 'Sarlahi', 'Rautahat', 'Bara', 'Parsa', 'Chitwan', 'Makwanpur', 'Ramechhap', 'Sindhuli', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Nuwakot', 'Rasuwa', 'Sindhupalchok', 'Dolakha', 'Mahagadhi', 'Baglung', 'Mustang', 'Myagdi', 'Parbat', 'Kaski', 'Lamjung', 'Gorkha', 'Manang', 'Syangja', 'Tanahu', 'Kapilvastu', 'Rupandehi', 'Nawalparasi', 'Palpa', 'Arghakhanchi', 'Gulmi', 'Pyuthan', 'Rolpa', 'Rukum', 'Salyan', 'Dang', 'Banke', 'Bardiya', 'Kailali', 'Kanchanpur', 'Doti', 'Dadeldhura', 'Baitadi', 'Darchula', 'Sudurpaschim') NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `serviceArea` JSON NOT NULL,
    `is24Hours` BOOLEAN NOT NULL DEFAULT false,
    `serviceType` ENUM('GOVERNMENT', 'PRIVATE', 'NGO', 'HOSPITAL_BASED') NOT NULL DEFAULT 'PRIVATE',
    `vehicleType` ENUM('BASIC', 'ADVANCED', 'ICU', 'NEONATAL') NOT NULL DEFAULT 'BASIC',
    `facilities` JSON NOT NULL,
    `averageResponseTime` INTEGER NULL,
    `serviceCharges` JSON NOT NULL,
    `operatingHours` JSON NOT NULL,
    `specialServices` JSON NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedBy` VARCHAR(191) NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0.0,
    `totalRatings` INTEGER NOT NULL DEFAULT 0,
    `coordinates` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_camps` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `organizer` VARCHAR(191) NOT NULL,
    `organizerPhone` VARCHAR(191) NOT NULL,
    `organizerEmail` VARCHAR(191) NOT NULL,
    `venue` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `targetDonations` INTEGER NOT NULL,
    `currentDonations` INTEGER NOT NULL DEFAULT 0,
    `bloodGroupsNeeded` JSON NOT NULL,
    `requirements` JSON NOT NULL,
    `facilities` JSON NOT NULL,
    `status` ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    `coordinates` JSON NULL,
    `images` JSON NOT NULL,
    `contactPerson` VARCHAR(191) NOT NULL,
    `contactPersonPhone` VARCHAR(191) NOT NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `registrationRequired` BOOLEAN NOT NULL DEFAULT false,
    `maxParticipants` INTEGER NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `type` ENUM('DONATION_IMPACT', 'BULK_NOTIFICATION', 'SYSTEM_UPDATE', 'BADGE_EARNED', 'APPOINTMENT_REMINDER', 'EMERGENCY_REQUEST', 'DONATION_REMINDER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NULL,
    `senderType` ENUM('SYSTEM', 'USER', 'ADMIN', 'HOSPITAL') NOT NULL DEFAULT 'SYSTEM',
    `donationId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CampRegistrations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CampRegistrations_AB_unique`(`A`, `B`),
    INDEX `_CampRegistrations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `donation_records` ADD CONSTRAINT `donation_records_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_requests` ADD CONSTRAINT `blood_requests_requestedBy_fkey` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_camps` ADD CONSTRAINT `donation_camps_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CampRegistrations` ADD CONSTRAINT `_CampRegistrations_A_fkey` FOREIGN KEY (`A`) REFERENCES `donation_camps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CampRegistrations` ADD CONSTRAINT `_CampRegistrations_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
