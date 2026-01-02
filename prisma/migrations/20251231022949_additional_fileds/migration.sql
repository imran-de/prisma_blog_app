-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT DEFAULT 'User',
ADD COLUMN     "status" TEXT DEFAULT 'Active';
