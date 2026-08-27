import React from 'react';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Award,
  Globe,
  ShieldAlert,
  BadgeCheck,
  Clock,
  Fingerprint,
  Cpu,
  Lock,
  Verified,
  Building2,
  TrendingUp,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  Scan,
  Hash,
  FileCheck,
  Database,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import db from "@/lib/db/index";
import { headers } from 'next/headers';

async function getVerificationDataById(appId: string) {
  let cert = await db.certificate.findFirst({
    where: {
      OR: [
        { applicationId: appId },
        { ecoApplicationId: appId }
      ]
    },
    include: {
      startup: { include: { application: true } },
      ecoApplication: { include: { builder: true } }
    }
  });

  if (!cert) return null;

  if (cert.ecoApplication?.builder) {
    return {
      name: cert.ecoApplication.builder.name,
      type: cert.ecoApplication.builder.type,
      location: cert.ecoApplication.builder.location || "Ethiopia",
      status: cert.status,
      issueDate: cert.issuedAt.toLocaleDateString(),
      expiryDate: cert.ecoApplication.builder.certified ? 'Active Audit' : 'Expired',
      certificateId: cert.certificateNumber,
      level: "National Ecosystem Builder",
      variant: "ECOSYSTEM",
      description: cert.ecoApplication.builder.description,
      website: cert.ecoApplication.builder.website,
      blockchainHash: cert.blockchainHash || null,
      lastAudit: cert.lastAuditDate?.toLocaleDateString() || cert.issuedAt.toLocaleDateString(),
      fileUrl: cert.filePath
    };
  } else if (cert.startup) {
    return {
      name: cert.startup.name,
      type: cert.startup.application?.industry || "Technology",
      location: "Ethiopia",
      status: cert.status,
      issueDate: cert.issuedAt.toLocaleDateString(),
      expiryDate: cert.startup.expiresAt?.toLocaleDateString() || 'N/A',
      certificateId: cert.certificateNumber,
      level: cert.startup.level || "National Startup",
      variant: "STARTUP",
      description: cert.startup.description,
      website: cert.startup.website,
      blockchainHash: cert.blockchainHash || null,
      lastAudit: cert.lastAuditDate?.toLocaleDateString() || cert.issuedAt.toLocaleDateString(),
      fileUrl: cert.filePath
    };
  }

  return null;
}

export default async function PrimaryVerificationRoute({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: { startup?: string, level?: string, issued?: string }
}) {
  const { id } = await params;
  const data = await getVerificationDataById(id);
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const shareUrl = `${protocol}://${host}/certificate/${id}`;

  // PREVIEW MODE UI
  if (!data) {
    if (id === 'preview' || searchParams.startup) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center py-12 px-4">
          <div className="max-w-xl w-full">
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Preview Mode</h2>
              <p className="text-slate-500">Certificate preview - Not yet committed to blockchain</p>
            </div>

            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200 mb-4">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Preview - Unsigned</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                      {searchParams.startup || "Preview Organization"}
                    </h1>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <Badge className="bg-blue-50 text-blue-700 font-semibold px-3 py-1">
                        {searchParams.level || "Pending Classification"}
                      </Badge>
                      <Badge className="bg-amber-50 text-amber-700 font-semibold px-3 py-1">
                        Draft Certificate
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Database className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status: Unsealed</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          This certificate is in preview mode and has not been cryptographically signed
                          or committed to the blockchain ledger.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
                  <p className="text-center text-xs text-slate-500">
                    MInT Verification Protocol • {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // NOT FOUND UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />

              <div className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-red-500 to-rose-500 rounded-full p-4 shadow-xl">
                    <XCircle className="h-10 w-10 text-white" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3">Certificate Not Found</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  This certificate does not exist in the National Innovation Registry.
                  Please verify the certificate number and try again.
                </p>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 rounded-xl font-semibold shadow-lg">
                    <Link href="/">Return to Registry</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full rounded-xl">
                    <Link href="/landing#contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isValid = data.status === 'ACTIVE';
  const isPaused = data.status === 'PAUSED';
  const isExpired = data.status === 'EXPIRED';
  const isRevoked = data.status === 'REVOKED';

  const statusConfig = {
    ACTIVE: {
      bg: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
      message: 'Fully verified and active in the national innovation ecosystem',
      gradient: 'from-emerald-50 to-emerald-100/30'
    },
    PAUSED: {
      bg: 'from-amber-500 to-amber-600',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: ShieldAlert,
      message: 'Temporarily suspended. Under administrative review.',
      gradient: 'from-amber-50 to-amber-100/30'
    },
    EXPIRED: {
      bg: 'from-red-500 to-red-600',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      message: 'Certification has expired. Renewal required for active status.',
      gradient: 'from-red-50 to-red-100/30'
    },
    REVOKED: {
      bg: 'from-slate-500 to-slate-600',
      text: 'text-slate-700',
      border: 'border-slate-200',
      badge: 'bg-slate-50 border-slate-200 text-slate-800',
      icon: ShieldAlert,
      message: 'Certification revoked. All benefits and privileges are terminated.',
      gradient: 'from-slate-50 to-slate-100/30'
    }
  };

  const currentStatus = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-6 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Main Certificate Card */}
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {/* Decorative background blur */}
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

          <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transition-all duration-300 ${isRevoked ? 'opacity-75' : ''}`}>

            {/* Main Content */}
            <div className="p-6 md:p-10">
              
              {/* Internal System Title Section */}
              <div className="text-center mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100/50 mb-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    MInT Sovereign Verification System
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  Digital Asset Registry
                </h1>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                   <div className="h-px w-6 bg-slate-200" />
                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400/80">Blockchain-Verified Credentials</p>
                   <div className="h-px w-6 bg-slate-200" />
                </div>
              </div>

              {/* Status Badge and Blockchain Verified */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed border-slate-100">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm ${currentStatus.badge}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {data.status}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <Verified className="h-3 w-3 text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                    Live Audit
                  </span>
                </div>
              </div>

              {/* Entity Information */}
              <div className="mb-6">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">
                  Registered Entity
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-[1.1] mb-2 font-sans">
                  {data.name}
                </h2>
                {data.description && (
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    {data.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors px-2.5 py-1 text-[10px] uppercase font-black tracking-widest">
                  <Building2 className="h-3 w-3 mr-1.5" />
                  {data.level}
                </Badge>
                <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors px-2.5 py-1 text-[10px] uppercase font-black tracking-widest">
                  <Globe className="h-3 w-3 mr-1.5" />
                  {data.type}
                </Badge>
              </div>

              {/* Key Information Grid */}
              <div className="grid md:grid-cols-2 gap-4 border-y border-slate-100 py-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                      Issue Date
                    </div>
                    <div className="text-sm font-bold text-slate-900 leading-none">
                      {data.issueDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Clock className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                      Expiry Protocal
                    </div>
                    <div className={`text-sm font-bold leading-none ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                      {data.expiryDate}
                    </div>
                  </div>
                </div>

                {data.lastAudit && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <FileCheck className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                        Historical Audit
                      </div>
                      <div className="text-sm font-bold text-slate-900 leading-none">
                        {data.lastAudit}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate ID & Blockchain Hash */}
              <div className="space-y-3 mb-6">
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/60 shadow-inner">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Official Certificate Number
                      </div>
                      <div className="text-base font-mono font-black text-emerald-700 tracking-tighter">
                        {data.certificateId}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 ${isValid ? 'text-emerald-500' : 'text-red-500'}`}>
                      <Fingerprint className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {data.blockchainHash && (
                  <div className="bg-slate-50/30 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Database className="h-3 w-3 text-slate-400" />
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Blockchain Hash Sequence
                       </span>
                    </div>
                    <code className="text-[8px] font-mono text-slate-400 select-all truncate max-w-[200px]">
                      {data.blockchainHash.substring(0, 32)}...
                    </code>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className={`p-4 rounded-xl bg-gradient-to-r ${currentStatus.gradient} border ${currentStatus.border} mb-6`}>
                <div className="flex items-start gap-3">
                  <StatusIcon className={`h-4 w-4 ${currentStatus.text} flex-shrink-0 mt-0.5`} />
                  <div>
                    <h4 className={`text-[9px] font-black uppercase tracking-widest ${currentStatus.text} mb-1 opacity-70`}>Operational Report</h4>
                    <p className={`text-[11px] font-semibold leading-relaxed ${currentStatus.text}`}>
                      {currentStatus.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-black/5 transition-all">
                  <a href={`/api/certificates/${id}/download`} download={`CERT-${data.certificateId}.pdf`}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Snapshot Registry
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                  <a href={`mailto:?subject=Certificate Verification: ${data.name}&body=Verify this certificate at: ${shareUrl}`}>
                    <Share2 className="h-3.5 w-3.5 mr-2" />
                    Dispatch Proof
                  </a>
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 px-6 py-3">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px]">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Sovereign Verification Network</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest">
                   <span>Registry v2.4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            ← System Exit
          </Link>
        </div>
      </div>
    </div>
  );
}