/*
  Warnings:

  - The values [PROJECT_OWNER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('READ_DEALS', 'WRITE_DEALS', 'DELETE_DEALS', 'READ_USERS', 'WRITE_USERS', 'DELETE_USERS', 'READ_TRANSACTIONS', 'WRITE_TRANSACTIONS', 'READ_INVESTMENTS', 'WRITE_INVESTMENTS', 'MANAGE_ROLES', 'MANAGE_PARTNERS', 'VIEW_ANALYTICS', 'SYSTEM_SETTINGS');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('INVESTOR', 'PARTNER', 'ADMIN', 'DEAL_MANAGER', 'FINANCIAL_OFFICER', 'PORTFOLIO_ADVISOR');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'INVESTOR';
COMMIT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "partnerId" TEXT;

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "totalDeals" INTEGER NOT NULL DEFAULT 0,
    "completedDeals" INTEGER NOT NULL DEFAULT 0,
    "totalFunding" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "averageReturn" DECIMAL(5,2),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "partnerId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "PermissionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_investor_assignments" (
    "id" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_investor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_userId_key" ON "partners"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_reviews_partnerId_investorId_projectId_key" ON "partner_reviews"("partnerId", "investorId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_permission_key" ON "user_permissions"("userId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "user_investor_assignments_advisorId_investorId_key" ON "user_investor_assignments"("advisorId", "investorId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_reviews" ADD CONSTRAINT "partner_reviews_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_reviews" ADD CONSTRAINT "partner_reviews_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_reviews" ADD CONSTRAINT "partner_reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_investor_assignments" ADD CONSTRAINT "user_investor_assignments_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_investor_assignments" ADD CONSTRAINT "user_investor_assignments_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
