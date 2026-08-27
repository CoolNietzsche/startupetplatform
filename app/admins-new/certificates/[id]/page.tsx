import { notFound } from "next/navigation";
import Link from "next/link";
import { getCertificatePreview } from "../actions";
import { CertificatePreviewView } from "./certificate-preview-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export default async function CertificatePreviewPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getCertificatePreview(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/admins-new/certifications"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Certifications
            </Link>
          </Button>
        </div>

        <CertificatePreviewView data={result.data} />
      </div>
    </div>
  );
}
