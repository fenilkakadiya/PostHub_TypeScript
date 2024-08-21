/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `number` VARCHAR(191) NOT NULL,
    ADD COLUMN `otp` VARCHAR(191) NOT NULL,
    ADD COLUMN `uuid` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_uuid_key` ON `users`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `users_number_key` ON `users`(`number`);
