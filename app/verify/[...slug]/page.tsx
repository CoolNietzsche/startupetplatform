import { notFound } from 'next/navigation';
import { ShieldCheck, AlertCircle, XCircle, CheckCircle2, FileText, Calendar, MapPin, Award, Stamp, Globe, ShieldAlert, BadgeCheck, Fingerprint, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import db from "@/lib/db";

async function getSimpleCertificate(code: string) {
  return db.certificate.findUnique({
    where: { certificateNumber: code },
    include: {
      startup: true,
      application: {
        select: { startupName: true },
      },
    },
  });
}

async function getVerificationData(type: string, id: string) {
  if (type === 'ecosystem') {
    const cert = await db.certificate.findFirst({
      where: { certificateNumber: id },
      include: {
        ecoApplication: {
          include: {
            builder: true
          }
        }
      }
    });

    if (!cert || !cert.ecoApplication?.builder) return null;

    return {
      name: cert.ecoApplication.builder.name,
      type: cert.ecoApplication.builder.type,
      location: cert.ecoApplication.builder.location,
      status: cert.status,
      issueDate: cert.issuedAt.toLocaleDateString(),
      expiryDate: cert.ecoApplication.builder.certified ? 'Active Audit' : 'Expired',
      certificateId: cert.certificateNumber,
      level: "National Ecosystem Builder",
      variant: "ECOSYSTEM"
    };
  } else {
    const cert = await db.certificate.findFirst({
      where: { certificateNumber: id },
      include: {
        startup: {
          include: {
            application: true
          }
        }
      }
    });

    if (!cert || !cert.startup) return null;

    return {
      name: cert.startup.name,
      type: cert.startup.application.industry || "Technology",
      location: "Ethiopia",
      status: cert.status,
      issueDate: cert.issuedAt.toLocaleDateString(),
      expiryDate: cert.startup.expiresAt?.toLocaleDateString() || 'N/A',
      certificateId: cert.certificateNumber,
      level: cert.startup.level || "National Startup",
      variant: "STARTUP"
    };
  }
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  if (slug.length === 1) {
    const [code] = slug;
    const certificate = await getSimpleCertificate(code);

    if (!certificate) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle>Invalid verification code</CardTitle>
              <CardDescription>
                No certificate matches the provided code.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }

    const isValid = certificate.status === "ACTIVE";
    const startupName =
      certificate.startup?.name ?? certificate.application?.startupName ?? "N/A";

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isValid ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <CardTitle>
              {isValid ? "Certificate Verified" : "Certificate Invalid"}
            </CardTitle>
            <CardDescription>
              {isValid
                ? "This certificate is active and valid."
                : "This certificate is expired or revoked."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Number</span>
              <span className="text-sm font-mono">
                {certificate.certificateNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Startup</span>
              <span className="text-sm">{startupName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Type</span>
              <Badge variant="outline">{certificate.type}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Issued</span>
              <span className="text-sm">
                {certificate.issuedAt.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status</span>
              <Badge
                variant={
                  isValid
                    ? "success"
                    : "destructive"
                }
              >
                {certificate.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (slug.length === 2) {
    const [type, id] = slug;
    const data = await getVerificationData(type, id);

    if (!data) {
      return (
        <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-red-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Asset Not Verified</h1>
            <p className="text-sm text-slate-500 mb-8 font-medium italic">"This certificate signature does not match any entry in the National Innovation Registry. Please report fraudulent documents to MInT Support."</p>
            <Button asChild className="w-full h-14 bg-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">
              <Link href="/">Return to Registry</Link>
            </Button>
          </div>
        </div>
      );
    }

    const isValid = data.status === 'ACTIVE';
    const isPaused = data.status === 'PAUSED';
    const isExpired = data.status === 'EXPIRED';
    const isRevoked = data.status === 'REVOKED';

    return (
      <div className="min-h-screen bg-[#FDFDFB] flex flex-col items-center py-16 px-6">
        <div className="max-w-xl w-full">

          <div className="text-center mb-10 space-y-2">
            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 ${isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                isPaused ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-red-50 border-red-200 text-red-700'
              }`}>
              {isValid ? <BadgeCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              <span className="text-xs font-black uppercase tracking-[0.2em]">Verification Status: {data.status}</span>
            </div>
            <h2 className="text-2xl font-black text-brand-deep-dark uppercase tracking-tighter">National Digital Asset Registry</h2>
          </div>

          <div className={`bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_hsl(var(--deep-dark)_/_0.15)] border border-slate-100 overflow-hidden relative ${isRevoked ? 'grayscale opacity-80' : ''}`}>

            <div className={`absolute top-0 left-0 w-2 h-full ${isValid ? 'bg-emerald-500' : isPaused ? 'bg-amber-500' : 'bg-red-500'
              }`} />

            <div className="p-12 space-y-12">

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated Entity</div>
                  <div className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{data.name}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-slate-50 text-brand-mint-teal font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg border border-slate-100">
                    <Award className="h-3 w-3 mr-1.5" /> {data.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg border border-slate-100">
                    <Globe className="h-3 w-3 mr-1.5" /> {data.type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-y border-slate-50 py-10">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Initial Registry Date
                  </div>
                  <div className="text-lg font-black text-slate-900">{data.issueDate}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Expiration Threshold
                  </div>
                  <div className={`text-lg font-black ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>{data.expiryDate}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Official Registry Sequence</div>
                    <div className="text-lg font-black text-brand-mint-teal font-mono tracking-tighter">{data.certificateId}</div>
                  </div>
                  <div className="relative">
                    <div className={`p-4 rounded-full border-4 border-white shadow-xl ${isValid ? 'bg-emerald-500' : isPaused ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                      <Fingerprint className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {isValid ? (
                  <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 text-center">
                    <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold italic">
                      &ldquo;Verified. This entity is currently active in the National Ecosystem Builder & Startup program.&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100/50 text-center">
                    <p className="text-[11px] text-red-800 leading-relaxed font-semibold italic">
                      &ldquo;Alert: Operational status is suspended or revoked. Incentives and legal benefits are currently inactive.&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-brand-deep-dark p-4 text-center">
              <div className="text-[8px] font-black uppercase tracking-[0.6em] text-white/50">MInT Sovereign Verification System &bull; {new Date().getFullYear()}</div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button variant="link" className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-brand-mint-teal" asChild>
              <Link href="/">Back to National Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  notFound();
}
