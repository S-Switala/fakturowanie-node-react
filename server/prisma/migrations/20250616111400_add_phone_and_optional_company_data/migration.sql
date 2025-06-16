-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "companyName" DROP NOT NULL,
ALTER COLUMN "nip" DROP NOT NULL;
