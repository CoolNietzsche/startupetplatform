"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Building2,
  Briefcase,
  MapPin,
  Users,
  Mail,
  Phone,
  Globe,
  Calendar,
  ExternalLink,
  Layers
} from "lucide-react";

interface OrganizationProfileProps {
  application: {
    type: string;
    address?: string | null;
    location?: string;
    city?: string | null;
    region: string;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    website?: string | null;
    established?: number | null;
    capacity?: number | null;
    [key: string]: any;
  };
}

export function OrganizationProfile({ application }: OrganizationProfileProps) {
  if (!application) return null;

  const DetailItem = ({ icon: Icon, label, value, isLink = false }: any) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 transition-all hover:shadow-md hover:bg-white hover:border-primary/20 group">
      <div className="flex items-center gap-2 text-brand-mint-teal group-hover:text-primary transition-colors">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {isLink && value && value !== 'Not provided' ? (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-slate-900 hover:text-primary truncate flex items-center gap-1.5"
        >
          {value.replace(/^https?:\/\//, '')}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
      ) : (
        <p className={`text-sm font-bold ${value === 'Not provided' ? 'text-slate-400' : 'text-slate-900'} leading-snug`}>
          {value || 'Not provided'}
        </p>
      )}
    </div>
  );

  return (
    <Card className="overflow-hidden border-none shadow-2xl bg-white">
      <CardHeader className="border-b bg-slate-50/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-mint-teal rounded-xl shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight text-brand-mint-teal">Organization Profile</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem
            icon={Briefcase}
            label="Organization Type"
            value={application.type}
          />
          <DetailItem
            icon={MapPin}
            label="Address & City"
            value={`${application.address || application.location || ''}${application.city ? `, ${application.city}` : ''}` || 'Not provided'}
          />
          <DetailItem
            icon={Globe}
            label="Region"
            value={application.region}
          />
          <DetailItem
            icon={Users}
            label="Contact Name"
            value={application.contactName}
          />
          <DetailItem
            icon={Mail}
            label="Email Address"
            value={application.contactEmail}
          />
          <DetailItem
            icon={Phone}
            label="Phone Number"
            value={application.contactPhone}
          />
          <DetailItem
            icon={ExternalLink}
            label="Website"
            value={application.website || 'Not provided'}
            isLink
          />
          <DetailItem
            icon={Calendar}
            label="Established"
            value={application.established?.toString()}
          />
          <DetailItem
            icon={Layers}
            label="Capacity"
            value={application.capacity?.toString()}
          />
        </div>
      </CardContent>
    </Card>
  );
}
