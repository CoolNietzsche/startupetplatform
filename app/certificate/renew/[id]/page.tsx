import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

async function requestCertificateRenewal(certificateId: string) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.certificate.findUnique({
    where: { id: certificateId },
  });
  if (!existing) throw new Error("Certificate not found");

  const renewed = await db.certificate.create({
    data: {
      applicationId: existing.applicationId,
      ecoApplicationId: existing.ecoApplicationId,
      type: existing.type,
      filePath: existing.filePath,
      isRenewed: true,
      status: "ACTIVE",
      issuedById: session.user.id,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CERTIFICATE_ISSUED",
    resource: "certificate",
    details: { originalId: certificateId, renewedId: renewed.id },
  });

  revalidatePath(`/certificate/renew/${certificateId}`);
}

export default async function CertificateRenewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certificate = await db.certificate.findUnique({
    where: { id },
  });

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Certificate not found</CardTitle>
            <CardDescription>
              The certificate you are looking for does not exist.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isStillValid: boolean =
    certificate.status === "ACTIVE" &&
    certificate.expiresAt !== null &&
    certificate.expiresAt > new Date();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Certificate Renewal</CardTitle>
          <CardDescription>
            Review your certificate details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Number</span>
            <span className="text-sm font-mono">{certificate.certificateNumber ?? "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Type</span>
            <Badge variant="outline">{certificate.type}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status</span>
            <Badge
              variant={
                certificate.status === "ACTIVE"
                  ? "success"
                  : certificate.status === "EXPIRED" || certificate.status === "REVOKED"
                    ? "destructive"
                    : "warning"
              }
            >
              {certificate.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Issued</span>
            <span className="text-sm">
              {certificate.issuedAt.toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Expires</span>
            <span className="text-sm">
              {certificate.expiresAt
                ? certificate.expiresAt.toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          {isStillValid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              Certificate is still valid
            </div>
          )}
        </CardContent>
        <CardFooter>
          <form
            action={requestCertificateRenewal.bind(null, certificate.id)}
            className="w-full"
          >
            <Button type="submit" className="w-full" disabled={isStillValid}>
              Request Renewal
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
