/*
  Warnings:

  - A unique constraint covering the columns `[id,teamId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,teamId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Project_id_teamId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Project_id_teamId_key" ON "Project"("id", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_teamId_key" ON "Project"("name", "teamId");
