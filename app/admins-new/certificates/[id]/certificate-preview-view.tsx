"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Download, FileText, Calendar, Award, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CertificatePreviewData } from "../actions";
import { MintOfficialCertificate } from "@/components/certificate/mint-official/mint-official-certificate";

type Props = { data: CertificatePreviewData };

function formatDisplayDate(isoOrDisplay: string): string {
  const t = Date.parse(isoOrDisplay);
  if (Number.isNaN(t)) return isoOrDisplay;
  return new Date(t).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CertificatePreviewView({ data }: Props) {
  const [downloading, setDownloading] = useState(false);

  const verificationUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    if (data.type === "ECOSYSTEM") {
      return `${origin}/eco-certificate/${data.certificateId}`;
    }
    return `${origin}/certificate/${data.applicationId}?startup=${encodeURIComponent(data.startupName)}&level=${encodeURIComponent(data.level)}&issued=${encodeURIComponent(data.issued)}`;
  }, [
    data.applicationId,
    data.certificateId,
    data.startupName,
    data.level,
    data.issued,
    data.type,
  ]);

  const issuePretty = formatDisplayDate(data.issued);
  const expiryPretty =
    data.expiry === "N/A" ? "See registry" : formatDisplayDate(data.expiry);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/certificates/${data.applicationId}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const prefix =
        data.type === "ECOSYSTEM"
          ? "ecosystem-certificate"
          : "startup-certificate";
      a.href = url;
      a.download = `${prefix}-${data.startupName.replace(/\s+/g, "-")}-${data.shortId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 200);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Certificate details</span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Hash className="h-3.5 w-3" />
              ID
            </p>
            <p className="font-mono font-medium">{data.shortId}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Award className="h-3.5 w-3" />
              Level
            </p>
            <p className="font-medium">{data.levelDisplay}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3" />
              Issued
            </p>
            <p className="font-medium">{issuePretty}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3" />
              Valid until
            </p>
            <p className="font-medium">{expiryPretty}</p>
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
        </CardContent>
      </Card>

      <div className="mx-auto max-w-4xl">
        <MintOfficialCertificate
          variant={data.type === "ECOSYSTEM" ? "ECOSYSTEM" : "STARTUP"}
          recipientName={data.startupName}
          subtitle={data.levelDisplay.toUpperCase()}
          issueDate={issuePretty}
          expiryDate={expiryPretty}
          certificateRef={data.shortId}
          verificationUrl={verificationUrl}
          density="comfortable"
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        View full certificate in{" "}
        <Link
          href="/admins-new/certifications"
          className="underline hover:no-underline"
        >
          Certifications
        </Link>
      </p>
    </div>
  );
}
