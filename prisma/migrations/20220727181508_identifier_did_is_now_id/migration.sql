/*
  Warnings:

  - The primary key for the `Identifier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `did` on the `Identifier` table. All the data in the column will be lost.
  - Added the required column `id` to the `Identifier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Identifier" DROP CONSTRAINT "Identifier_pkey",
DROP COLUMN "did",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Identifier_pkey" PRIMARY KEY ("id");
