/*
  Warnings:

  - You are about to drop the column `secretKey` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "secretKey",
DROP COLUMN "value";
