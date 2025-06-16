/*
  Warnings:

  - You are about to drop the column `address` on the `Client` table. All the data in the column will be lost.
  - Added the required column `city` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `houseNumber` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pesel` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "houseNumber" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "pesel" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL;
