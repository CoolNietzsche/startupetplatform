import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CertificateNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Certificate not found</h1>
      <p className="text-muted-foreground text-center max-w-sm">
        This certificate may have been removed or the link is invalid. Check
        the ID and try again.
      </p>
      <Button asChild>
        <Link href="/admins-new/certifications">Back to Certifications</Link>
      </Button>
    </div>
  );
}
