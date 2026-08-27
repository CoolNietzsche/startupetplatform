-- Add user linkage for ecosystem builder applications

ALTER TABLE "user"."EcosystemBuilder"
ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "EcosystemBuilder_userId_key" ON "user"."EcosystemBuilder"("userId");

ALTER TABLE "user"."EcosystemBuilder"
ADD CONSTRAINT "EcosystemBuilder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
