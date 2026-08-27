'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    Download, 
    Shield, 
    CheckCircle, 
    XCircle,
    Loader2
} from "lucide-react";
import { verifyCertificateOnBlockchain } from '@/lib/actions/blockchain';

interface CertificateViewerProps {
    certificateUrl: string;
    blockchainHash?: string | null;
}

export function CertificateViewer({ 
    certificateUrl, 
    blockchainHash 
}: CertificateViewerProps) {
    const [verificationStatus, setVerificationStatus] = useState<
        'unverified' | 'verifying' | 'verified' | 'failed'
    >('unverified');

    const handleVerification = async () => {
        if (!blockchainHash) return;

        setVerificationStatus('verifying');
        try {
            const result = await verifyCertificateOnBlockchain(blockchainHash);
            setVerificationStatus(result.isValid ? 'verified' : 'failed');
        } catch (error) {
            setVerificationStatus('failed');
            console.error('Verification error:', error);
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = certificateUrl;
        // The certificate URL is pointing to a generated PDF in the public folder
        link.download = certificateUrl.endsWith('.pdf') ? certificateUrl.split('/').pop() || 'certificate.pdf' : 'verified-certificate.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="p-6 space-y-4">
            <div className="aspect-video relative">
                <img
                    src={certificateUrl}
                    alt="Certificate"
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="flex justify-between items-center">
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>

                    {blockchainHash && (
                        <Button
                            variant="outline"
                            onClick={handleVerification}
                            disabled={verificationStatus === 'verifying'}
                        >
                            {verificationStatus === 'unverified' && (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Verify on Blockchain
                                </>
                            )}
                            {verificationStatus === 'verifying' && (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            )}
                            {verificationStatus === 'verified' && (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Verified
                                </>
                            )}
                            {verificationStatus === 'failed' && (
                                <>
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Verification Failed
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {blockchainHash && (
                <div className="text-sm text-muted-foreground break-all">
                    <div className="font-semibold">Blockchain Hash:</div>
                    <div>{blockchainHash}</div>
                </div>
            )}
        </Card>
    );
}
