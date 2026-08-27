import { generateCertificate } from "@/lib/actions/certificate";
import { CertificateViewer } from "@/components/certificate/certificate-viewer";
import db from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function CertificatePage({ params }: PageProps) {
    const application = await db.application.findUnique({
        where: { id: params.id },
        include: {
            certificate: true,
        },
    });

    if (!application) {
        notFound();
    }

    if (application.status !== 'COMMITTEE_REVIEW_SUBMITTED' && application.status !== 'CERTIFIED') {
        return (
            <div className="p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Certificates are only available for accepted applications.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Generate certificate if it doesn't exist
    if (!application.certificate) {
        const { filePath, blockchainHash } = await generateCertificate(
            application.id,
            true // Enable blockchain verification
        );

        return (
            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Certificate of Registration</h1>
                    <CertificateViewer 
                        certificateUrl={filePath}
                        blockchainHash={blockchainHash}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Certificate of Registration</h1>
                <CertificateViewer 
                    certificateUrl={application.certificate.filePath}
                    blockchainHash={application.certificate.blockchainHash}
                />
            </div>
        </div>
    );
}
