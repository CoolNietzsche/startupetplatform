"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Search,
  FileText,
  Download,
  CheckCircle,
  QrCode,
  Copy,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { toast } from "sonner";
import { getCertifications, getCertificationStats } from "./actions";
import { setApplicationCertified } from "../applications/application-actions";
import { RevokeCertificateModal } from "../applications/components/RevokeCertificateModal";

// Types for certification data
interface Certification {
  id: string;
  certificateId: string;
  applicationId?: string | null;
  organization: string;
  type: string;
  category: string;
  issued: string;
  expiry: string;
  level: string;
  status: string;
  fileUrl?: string;
}

interface Stats {
  total: number;
  startups: number;
  ecosystemBuilders: number;
  investors: number;
  level1: number;
  level2: number;
  level3: number;
}

export default function CertificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    startups: 0,
    ecosystemBuilders: 0,
    investors: 0,
    level1: 0,
    level2: 0,
    level3: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [qrCert, setQrCert] = useState<Certification | null>(null);
  const [appToRevoke, setAppToRevoke] = useState<{ id: string, name: string } | null>(null);

  const handleDownload = async (cert: Certification) => {
    setDownloadingId(cert.id);
    try {
      const response = await fetch(`/api/certificates/${cert.certificateId}/download`);
      if (!response.ok) {
        const errText = await response.text();
        console.error("Download failed:", response.status, errText);
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert.organization.replace(/\s+/g, "-")}-${cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a short delay so the browser has time to start the download
      setTimeout(() => window.URL.revokeObjectURL(url), 200);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Could not download certificate. It may not have been generated yet.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [certsRes, statsRes] = await Promise.all([
          getCertifications(),
          getCertificationStats(),
        ]);

        if (certsRes.success && certsRes.data) {
          setCertifications(certsRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Error fetching certification data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter certifications based on search and filters
  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      !searchQuery ||
      cert.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      levelFilter === "all" ||
      cert.level.replace(/\s+/g, "-").toLowerCase() === levelFilter;
    const matchesType =
      typeFilter === "all" ||
      cert.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesLevel && matchesType;
  });

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground">
            View and manage certificates issued to startups and ecosystem
            builders
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admins-new/certifications/issue">
              <Award className="mr-2 h-4 w-4" />
              Issue Certificate
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startups</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.startups}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ecosystem</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.ecosystemBuilders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.investors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level 1</CardTitle>
            <Badge variant="outline">1</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.level1}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level 2</CardTitle>
            <Badge variant="outline">2</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.level2}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level 3</CardTitle>
            <Badge variant="outline">3</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.level3}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter controls */}
      <div className="flex gap-4 mb-6">
        <div className="relative w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certificates..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="level-1">Level 1</SelectItem>
            <SelectItem value="level-2">Level 2</SelectItem>
            <SelectItem value="level-3">Level 3</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="startup">Startups</SelectItem>
            <SelectItem value="venture capital">Venture Capital</SelectItem>
            <SelectItem value="angel investor">Angel Investors</SelectItem>
            <SelectItem value="accelerator">Accelerators</SelectItem>
            <SelectItem value="co-working space">Co-working Spaces</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Certifications table */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Certifications</CardTitle>
          <CardDescription>
            All certifications issued by the Ministry of Innovation & Technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left pb-3 font-medium">
                  <div className="flex items-center">
                    ID
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="text-left pb-3 font-medium">
                  <div className="flex items-center">
                    Organization
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="text-left pb-3 font-medium">Type</th>
                <th className="text-left pb-3 font-medium">Category</th>
                <th className="text-left pb-3 font-medium">
                  <div className="flex items-center">
                    Issued Date
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="text-left pb-3 font-medium">Expiry Date</th>
                <th className="text-left pb-3 font-medium">Level</th>
                <th className="text-left pb-3 font-medium">Status</th>
                <th className="text-right pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground italic"
                  >
                    Loading certifications...
                  </td>
                </tr>
              ) : filteredCertifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground italic"
                  >
                    No certifications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCertifications.map((cert) => (
                  <tr key={cert.id} className="border-b">
                    <td className="py-3 text-xs font-medium">{cert.id}</td>
                    <td className="py-3 font-medium">{cert.organization}</td>
                    <td className="py-3">{cert.type}</td>
                    <td className="py-3">{cert.category}</td>
                    <td className="py-3">{cert.issued}</td>
                    <td className="py-3">{cert.expiry}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="font-medium">
                        {cert.level}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="success" className="font-normal">
                        {cert.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(e) => {
                              e.preventDefault();
                              setQrCert(cert);
                            }}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleDownload(cert);
                            }}
                          >
                            {downloadingId === cert.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="mr-2 h-4 w-4" />
                            )}
                            {downloadingId === cert.id
                              ? "Downloading..."
                              : "Download Certificate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Calendar className="mr-2 h-4 w-4" />
                            Renew Certificate
                          </DropdownMenuItem>
                          
                          {cert.type === "Startup" && cert.applicationId && (
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-700"
                              onSelect={() => setAppToRevoke({ id: cert.applicationId!, name: cert.organization })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Revoke Certificate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">{filteredCertifications.length}</span>{" "}
            of <span className="font-medium">{certifications.length}</span>{" "}
            certificates
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={!!qrCert} onOpenChange={(open) => !open && setQrCert(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Certificate QR Code
            </DialogTitle>
          </DialogHeader>
          {qrCert && (
            <div className="flex flex-col items-center gap-4 py-2">
              <p className="text-sm text-muted-foreground text-center">
                {qrCert.organization} · {qrCert.level}
              </p>
              <div className="bg-white p-3 rounded-lg border">
                <QRCodeSVG
                  value={
                    typeof window !== "undefined"
                      ? qrCert.applicationId
                        ? `${window.location.origin}/certificate/${qrCert.applicationId}?startup=${encodeURIComponent(qrCert.organization)}&level=${encodeURIComponent(qrCert.level)}&issued=${qrCert.issued}`
                        : `${window.location.origin}/admins-new/certificates/${qrCert.certificateId}`
                      : ""
                  }
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan to verify certificate
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RevokeCertificateModal
        isOpen={!!appToRevoke}
        onClose={() => setAppToRevoke(null)}
        application={appToRevoke}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
