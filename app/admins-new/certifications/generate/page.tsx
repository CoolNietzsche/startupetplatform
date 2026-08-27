"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as QRCode from "qrcode";
import {
  ArrowLeft,
  Award,
  Calendar,
  Upload,
  Eye,
  Download,
  Building2,
  FileText,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { issueStartupCertificate, getApprovedApplications } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

function GenerateCertificateContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");

  const [formData, setFormData] = useState({
    startupName: searchParams.get("name") || "",
    certificateLevel: searchParams.get("level") || "",
    startDate: "",
    endDate: "",
    companyLogo: null as File | null,
    ministryLogo: null as File | null,
    certificateType: (searchParams.get("type") as "STARTUP" | "ECOSYSTEM") || "STARTUP",
  });

  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(
    null,
  );
  const [ministryLogoPreview, setMinistryLogoPreview] = useState<string | null>(
    "/Mint_Logo.png",
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const ministryLogoInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAppData = async () => {
      // If we already have the name and level from URL, we can skip fetching
      // but let's fetch anyway to ensure we have the most up-to-date data
      // OR only fetch if they are missing
      if (appId && (!formData.startupName || !formData.certificateLevel)) {
        const result = await getApprovedApplications();
        if (result.success && result.data) {
          const app = (result.data as any[]).find((a) => a.id === appId);
          if (app) {
            setFormData((prev) => ({
              ...prev,
              startupName: prev.startupName || app.startupName,
              certificateLevel: prev.certificateLevel || app.level,
              certificateType: app.entityType === 'ecosystem' ? 'ECOSYSTEM' : 'STARTUP',
            }));
          }
        }
      }
    };
    fetchAppData();
  }, [appId, formData.startupName, formData.certificateLevel]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    field: "companyLogo" | "ministryLogo",
    file: File | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "companyLogo") {
          setCompanyLogoPreview(reader.result as string);
        } else {
          setMinistryLogoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (field === "companyLogo") {
        setCompanyLogoPreview(null);
      } else {
        setMinistryLogoPreview("/Mint_Logo.png");
      }
    }
  };

  const handlePreview = async () => {
    // Generate QR code for certificate verification
    const certificateUrl = `${window.location.origin}/certificate/${appId || "preview"}?startup=${encodeURIComponent(formData.startupName)}&level=${formData.certificateLevel}&issued=${formData.startDate}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(certificateUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }

    setShowPreview(true);
  };

  const handleGeneratePDF = async () => {
    try {
      const certificateUrl = `${window.location.origin}/certificate/${appId || "preview"}?startup=${encodeURIComponent(formData.startupName)}&level=${formData.certificateLevel}&issued=${formData.startDate}`;

      let qrCodeDataUrl: string | undefined;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(certificateUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }

      // Convert ministry logo to data URL if it's a relative path
      let ministryLogoUrl = ministryLogoPreview || undefined;
      if (ministryLogoUrl && ministryLogoUrl.startsWith("/")) {
        try {
          const response = await fetch(ministryLogoUrl);
          const blob = await response.blob();
          ministryLogoUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Failed to convert ministry logo to data URL:", error);
        }
      }

      const companyLogoUrl = companyLogoPreview || undefined;

      const response = await fetch("/api/certificates/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupName: formData.startupName,
          certificateLevel: formData.certificateLevel,
          startDate: formData.startDate,
          endDate: formData.endDate,
          appId: appId || "preview",
          qrCodeDataUrl,
          ministryLogoUrl,
          companyLogoUrl,
          certificateType: formData.certificateType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${formData.startupName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleIssueCertificate = async () => {
    if (!appId) return;

    try {
      setLoading(true);
      setIsConfirmModalOpen(false);

      // Build the same PDF as "Download PDF" (with QR + logos) so we save the exact certificate
      const certificateUrl = `${window.location.origin}/certificate/${appId}?startup=${encodeURIComponent(formData.startupName)}&level=${formData.certificateLevel}&issued=${formData.startDate}`;
      let qrCodeDataUrl: string | undefined;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(certificateUrl, {
          width: 120,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
      } catch (e) {
        console.error("Failed to generate QR for issuance:", e);
      }

      let ministryLogoUrl: string | undefined = ministryLogoPreview || undefined;
      if (ministryLogoUrl && ministryLogoUrl.startsWith("/")) {
        try {
          const res = await fetch(ministryLogoUrl);
          const blob = await res.blob();
          ministryLogoUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error("Failed to load ministry logo:", e);
        }
      }
      const companyLogoUrl = companyLogoPreview || undefined;

      const pdfRes = await fetch("/api/certificates/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: formData.startupName,
          certificateLevel: formData.certificateLevel,
          startDate: formData.startDate,
          endDate: formData.endDate,
          appId,
          qrCodeDataUrl,
          ministryLogoUrl,
          companyLogoUrl,
          certificateType: formData.certificateType,
        }),
      });
      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate PDF");
      }
      const pdfBlob = await pdfRes.blob();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
          resolve(base64 || "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const result = await issueStartupCertificate({
        appId,
        startupName: formData.startupName,
        level: formData.certificateLevel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pdfBase64,
        qrCodeDataUrl,
      });

      if (result.success) {
        toast.success("Certificate issued successfully!");
        router.push("/admins-new/certifications");
      } else {
        toast.error(`Failed to issue certificate: ${result.message}`);
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.startupName.trim() !== "" &&
    formData.certificateLevel.trim() !== "" &&
    formData.startDate.trim() !== "" &&
    formData.endDate.trim() !== "";

  const actionsDisabled = !isFormValid;

  const levelText =
    formData.certificateType === "ECOSYSTEM"
      ? "Certified Ecosystem Builder"
      : formData.certificateLevel === "level-1"
        ? "Level 1 Certification"
        : formData.certificateLevel === "level-2"
          ? "Level 2 Certification"
          : "Level 3 Certification";

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admins-new/certifications/issue">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Certificate Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure certificate details and generate a professional digital
            certificate
          </p>
        </div>
        <Badge
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1 text-sm bg-white shadow-sm"
        >
          <FileText className="h-4 w-4 text-blue-600" />
          {appId ? `Application: ${appId}` : "New Certificate"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Forms */}
        <div className="space-y-6 lg:col-span-4 xl:col-span-4">
          <Card className="shadow-sm border-gray-200/60">
            <CardHeader className="bg-white/50 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-amber-600" />
                Certificate Information
              </CardTitle>
              <CardDescription>
                Fill in the details for the certificate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="startupName"
                  className="font-semibold text-gray-700"
                >
                  Organization Name *
                </Label>
                <Input
                  id="startupName"
                  placeholder="Enter startup name"
                  value={formData.startupName}
                  onChange={(e) =>
                    handleInputChange("startupName", e.target.value)
                  }
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="certificateLevel"
                  className="font-semibold text-gray-700"
                >
                  Certificate Level *
                </Label>
                <Select
                  value={formData.certificateLevel}
                  onValueChange={(value) =>
                    handleInputChange("certificateLevel", value)
                  }
                >
                  <SelectTrigger id="certificateLevel" className="bg-white">
                    <SelectValue placeholder="Select certificate level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level-1">
                      Level 1 Certification
                    </SelectItem>
                    <SelectItem value="level-2">
                      Level 2 Certification
                    </SelectItem>
                    <SelectItem value="level-3">
                      Level 3 Certification
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="flex items-center gap-1.5 font-semibold text-gray-700"
                  >
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endDate"
                    className="flex items-center gap-1.5 font-semibold text-gray-700"
                  >
                    <Calendar className="h-4 w-4 text-gray-500" />
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200/60">
            <CardHeader className="bg-white/50 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Logo Attachments
              </CardTitle>
              <CardDescription>
                Upload logos for the certificate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-3">
                <Label
                  htmlFor="ministryLogo"
                  className="font-semibold text-gray-700"
                >
                  Issuer Logo (e.g. Ministry)
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => ministryLogoInputRef.current?.click()}
                    className="w-full bg-white border-dashed border-2 hover:bg-gray-50"
                  >
                    <Upload className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="truncate max-w-[200px]">
                      {formData.ministryLogo
                        ? formData.ministryLogo.name
                        : "Using default public logo"}
                    </span>
                  </Button>
                  <input
                    ref={ministryLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(
                        "ministryLogo",
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </div>
                {ministryLogoPreview && (
                  <div className="mt-3 flex justify-center rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                    <img
                      src={ministryLogoPreview}
                      alt="Ministry logo preview"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Label
                  htmlFor="companyLogo"
                  className="font-semibold text-gray-700"
                >
                  Recipient Logo (Startup)
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => companyLogoInputRef.current?.click()}
                    className="w-full bg-white border-dashed border-2 hover:bg-gray-50"
                  >
                    <Upload className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="truncate max-w-[200px]">
                      {formData.companyLogo
                        ? formData.companyLogo.name
                        : "Upload recipient logo"}
                    </span>
                  </Button>
                  <input
                    ref={companyLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(
                        "companyLogo",
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </div>
                {companyLogoPreview && (
                  <div className="mt-3 flex justify-center rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                    <img
                      src={companyLogoPreview}
                      alt="Company logo preview"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview Wrapper */}
        <div className="space-y-6 lg:col-span-8 xl:col-span-8 flex flex-col items-center">
          <Card className="lg:sticky lg:top-6 shadow-md border-gray-200/60 overflow-hidden w-full max-w-[1000px]">
            <CardHeader className="bg-white/80 backdrop-blur-sm border-b pb-4 z-10 relative">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-emerald-600" />
                Live Certificate Preview
              </CardTitle>
              <CardDescription>
                {showPreview && isFormValid
                  ? "Here is how the generated certificate will look"
                  : "Fill all required fields to see the certificate"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 md:p-8 bg-gray-100/50 flex flex-col items-center justify-center gap-6">
              {showPreview && isFormValid ? (
                /* Perfectly Scalable Container */
                <div
                  className="w-full max-w-[1000px] aspect-[1.414/1] relative bg-white shadow-2xl shadow-gray-900/10 mx-auto font-serif text-gray-900"
                  style={{ containerType: "inline-size" }}
                >
                  {/* Outer ornate border area mapped via Container Query Width (cqw) */}
                  <div className="absolute inset-0 border-[1cqw] border-[#C5A059] p-[1cqw] bg-[#FDFBF7]">
                    {/* Corner Ornaments */}
                    <div className="absolute top-0 left-0 w-[4cqw] h-[4cqw] border-t-[0.5cqw] border-l-[0.5cqw] border-[#8B6914] -ml-[0.5cqw] -mt-[0.5cqw]" />
                    <div className="absolute top-0 right-0 w-[4cqw] h-[4cqw] border-t-[0.5cqw] border-r-[0.5cqw] border-[#8B6914] -mr-[0.5cqw] -mt-[0.5cqw]" />
                    <div className="absolute bottom-0 left-0 w-[4cqw] h-[4cqw] border-b-[0.5cqw] border-l-[0.5cqw] border-[#8B6914] -ml-[0.5cqw] -mb-[0.5cqw]" />
                    <div className="absolute bottom-0 right-0 w-[4cqw] h-[4cqw] border-b-[0.5cqw] border-r-[0.5cqw] border-[#8B6914] -mr-[0.5cqw] -mb-[0.5cqw]" />

                    {/* Inner border & background */}
                    <div className="relative w-full h-full border-[0.25cqw] border-[#D4AF37] p-[4cqw] flex flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-[#FDFBF7] to-[#F9F3E5]">
                      {/* Huge Background Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <Award className="w-[60cqw] h-[60cqw] text-[#8B6914]" />
                      </div>

                      {/* Top Section: Logos */}
                      <div className="relative z-10 flex items-start justify-between w-full">
                        <div className="h-[10cqw] w-[16cqw] flex items-start justify-start">
                          {ministryLogoPreview && (
                            <img
                              src={ministryLogoPreview}
                              alt="Ministry logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>

                        <div className="flex flex-col items-center justify-center text-center mt-[1cqw]">
                          <h4 className="text-[#8B6914] font-bold tracking-[0.2em] uppercase text-[1.5cqw] leading-none">
                            Ministry of Innovation & Technology
                          </h4>
                          <div className="w-[8cqw] h-[0.25cqw] bg-[#D4AF37] my-[1cqw] rounded-full"></div>
                        </div>

                        <div className="h-[10cqw] w-[16cqw] flex items-start justify-end">
                          {companyLogoPreview && (
                            <img
                              src={companyLogoPreview}
                              alt="Company logo"
                              className="max-h-full max-w-full object-contain drop-shadow-sm"
                            />
                          )}
                        </div>
                      </div>

                      {/* Middle Section: Copy & Name */}
                      <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center -mt-[3cqw]">
                        <h1
                          className="text-[7.5cqw] text-[#1a1a1a] font-bold uppercase tracking-[0.15em] mb-[3cqw] drop-shadow-sm leading-none"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {formData.certificateType === "ECOSYSTEM" ? "ECOSYSTEM BUILDER" : "STARTUP"} CERTIFICATE
                        </h1>
                        <h2 className="text-[3cqw] text-[#8B6914] font-medium tracking-[0.3em] uppercase mb-[5cqw] leading-none">
                          {formData.certificateType === "ECOSYSTEM" ? "Official Accreditation" : "Of Recognition"}
                        </h2>

                        <p className="text-gray-600 italic text-[2.25cqw] mb-[3cqw] font-serif leading-none">
                          This is proudly presented to
                        </p>

                        {/* Recipient Name */}
                        <div className="relative inline-block px-[6cqw] pb-[1cqw] mb-[4cqw]">
                          <h3 className="text-[6cqw] font-bold text-gray-900 z-10 relative capitalize leading-none">
                            {formData.startupName}
                          </h3>
                          {/* Underline decorative */}
                          <div className="absolute bottom-0 left-0 w-full h-[0.25cqw] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>
                        </div>

                        <p className="text-gray-700 max-w-[75%] mx-auto leading-relaxed text-[2.25cqw]">
                          in recognition of successfully fulfilling the
                          requirements and is officially awarded the designation
                          of
                        </p>
                        <p className="text-[3cqw] font-bold text-[#8B6914] mt-[2cqw] tracking-wide leading-none">
                          {levelText}
                        </p>
                      </div>

                      {/* Bottom Section: Footer, Signatures, Seal */}
                      <div className="relative z-10 flex items-end justify-between w-full pb-[2cqw] px-[4cqw]">
                        {/* Issue Date & Expiry */}
                        <div className="flex flex-col items-center w-[20cqw]">
                          <span className="text-gray-800 font-semibold mb-[1cqw] text-[2cqw] leading-none">
                            {formData.startDate}
                          </span>
                          <div className="w-full border-t border-gray-400"></div>
                          <span className="text-[1.3cqw] text-gray-500 mt-[1cqw] uppercase tracking-wider font-sans font-semibold leading-none">
                            Issue Date
                          </span>
                          <span className="text-[1.2cqw] text-gray-400 mt-[0.5cqw] font-sans leading-none">
                            Valid till: {formData.endDate}
                          </span>
                        </div>

                        {/* QR Code */}
                        <div className="absolute right-0 bottom-[8cqw] flex flex-col items-center">
                          {qrCodeDataUrl && (
                            <>
                              <img
                                src={qrCodeDataUrl}
                                alt="Certificate Verification QR Code"
                                className="w-[12cqw] h-[12cqw] bg-white p-[0.5cqw] rounded shadow-sm"
                              />
                              <span className="text-[1cqw] text-gray-500 mt-[1cqw] text-center leading-none">
                                Scan to verify
                              </span>
                            </>
                          )}
                        </div>

                        {/* Authorized Signature */}
                        <div className="flex flex-col items-center w-[20cqw]">
                          {/* Fake signature appearance */}
                          <div className="h-[5cqw] w-full flex items-end justify-center mb-[0.5cqw]">
                            <span
                              className="text-[3cqw] text-slate-800 opacity-80 leading-none"
                              style={{
                                fontFamily: "'Brush Script MT', cursive, serif",
                              }}
                            >
                              Authorized
                            </span>
                          </div>
                          <div className="w-full border-t border-gray-400"></div>
                          <span className="text-[1.3cqw] text-gray-500 mt-[1cqw] uppercase tracking-wider font-sans font-semibold leading-none">
                            Authorized Signature
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="flex min-h-[500px] w-full items-center justify-center rounded-lg bg-white p-8 text-center border-2 border-dashed border-gray-200">
                  <div className="space-y-4 max-w-sm">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        No Preview Generated
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Fill in all the required fields on the left and click
                        &apos;Preview&apos; to see the digital certificate layout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full max-w-[1000px] border-t border-gray-200 pt-4 space-y-3">
                <div className="text-base font-bold text-gray-900">
                  Certificate Actions
                </div>
                <div className="text-sm text-gray-500">
                  Preview or download the finalized digital certificate
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={actionsDisabled}
                    className="flex-1 bg-white"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={actionsDisabled}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Downlaod PDF
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={actionsDisabled || loading}
                  >
                    {loading ? "Processing..." : "Issue Certificate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Award className="h-6 w-6 text-green-600" />
              Confirm Certification Issuance
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700 pt-2 border-l-4 border-amber-500 pl-4 bg-amber-50 py-3">
              Now let&apos;s integrate certification management by allowing
              certificate downloads, verifying that each certificate was
              correctly issued, tracking the status of the related application,
              and ensuring that certificates are generated based on the most
              recent EcoApplication data in /admins-new/ecosystem/. Are you sure
              you want to issue a certificate for this application? Make sure
              all requirements are fulfilled.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center gap-6">
            <div className="w-full border-t border-b py-4 bg-gray-50/50">
              <div className="flex justify-center flex-col items-center scale-75 origin-top mb-[-120px]">
                {/* Re-using the same preview component logic */}
                <div
                  className="w-[1000px] aspect-[1.414/1] relative bg-white shadow-2xl font-serif text-gray-900 border"
                  style={{ containerType: "inline-size" }}
                >
                  <div className="absolute inset-0 border-[1cqw] border-[#C5A059] p-[1cqw] bg-[#FDFBF7]">
                    <div className="relative w-full h-full border-[0.25cqw] border-[#D4AF37] p-[4cqw] flex flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_center,_white,_#FDFBF7,_#F9F3E5)]">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <Award className="w-[60cqw] h-[60cqw] text-[#8B6914]" />
                      </div>
                      <div className="relative z-10 flex items-start justify-between w-full">
                        <div className="h-[10cqw] w-[16cqw] flex items-start justify-start">
                          {ministryLogoPreview && (
                            <img
                              src={ministryLogoPreview}
                              alt="Ministry logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                        <div className="flex flex-col items-center text-center mt-[1cqw]">
                          <h4 className="text-[#8B6914] font-bold tracking-[0.2em] uppercase text-[1.5cqw]">
                            Ministry of Innovation & Technology
                          </h4>
                          <div className="w-[8cqw] h-[0.25cqw] bg-[#D4AF37] my-[1cqw] rounded-full"></div>
                        </div>
                        <div className="h-[10cqw] w-[16cqw] flex items-start justify-end">
                          {companyLogoPreview && (
                            <img
                              src={companyLogoPreview}
                              alt="Company logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                      <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center">
                        <h1 className="text-[7.5cqw] text-[#1a1a1a] font-bold uppercase tracking-[0.15em] mb-[3cqw]">
                          {formData.certificateType === "ECOSYSTEM" ? "ECOSYSTEM BUILDER" : "STARTUP"} CERTIFICATE
                        </h1>
                        <h2 className="text-[3cqw] text-[#8B6914] font-medium tracking-[0.3em] uppercase mb-[5cqw]">
                          {formData.certificateType === "ECOSYSTEM" ? "Official Accreditation" : "Of Recognition"}
                        </h2>
                        <div className="relative inline-block px-[6cqw] pb-[1cqw] mb-[4cqw]">
                          <h3 className="text-[6cqw] font-bold text-gray-900 z-10 relative capitalize">
                            {formData.startupName}
                          </h3>
                          <div className="absolute bottom-0 left-0 w-full h-[0.25cqw] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>
                        </div>
                        <p className="text-[3cqw] font-bold text-[#8B6914] mt-[2cqw]">
                          {levelText}
                        </p>
                      </div>
                      <div className="relative z-10 flex items-end justify-between w-full pb-[2cqw] px-[4cqw]">
                        <div className="flex flex-col items-center w-[20cqw]">
                          <span className="text-gray-800 font-semibold text-[2cqw]">
                            {formData.startDate}
                          </span>
                          <div className="w-full border-t border-gray-400 mt-[1cqw]"></div>
                          <span className="text-[1.3cqw] text-gray-500 mt-[1cqw] uppercase font-bold">
                            Issue Date
                          </span>
                        </div>
                        <div className="flex flex-col items-center w-[20cqw]">
                          <div className="h-[5cqw] w-full flex items-end justify-center">
                            <span
                              className="text-[3cqw] text-slate-800 opacity-80"
                              style={{
                                fontFamily: "'Brush Script MT', cursive, serif",
                              }}
                            >
                              Authorized
                            </span>
                          </div>
                          <div className="w-full border-t border-gray-400 mt-[1cqw]"></div>
                          <span className="text-[1.3cqw] text-gray-500 mt-[1cqw] uppercase font-bold">
                            Authorized Signature
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Entity Verified
                    </p>
                    <p className="text-xs text-emerald-700">
                      {formData.startupName} is approved for {levelText}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Security Check
                    </p>
                    <p className="text-xs text-blue-700">
                      Digital signature and QR verification ready
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
              onClick={handleIssueCertificate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Issuing...
                </>
              ) : (
                "Yes, Issue Certificate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GenerateCertificatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading certificate generator...</div>}>
      <GenerateCertificateContent />
    </Suspense>
  );
}
