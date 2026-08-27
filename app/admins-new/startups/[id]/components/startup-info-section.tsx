import React from 'react';
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type StartupInfoProps = {
  startup: any; // In a real app, we would define a proper type
};

export function StartupInfoSection({ startup }: StartupInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <Avatar className="h-24 w-24 bg-primary/10">
            <AvatarFallback className="text-lg font-medium">
              {startup.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Website */}
          {startup.website && (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Website</div>
                <a 
                  href={`https://${startup.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {startup.website}
                </a>
              </div>
            </div>
          )}
          
          {/* Email */}
          {startup.email && (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <a 
                  href={`mailto:${startup.email}`}
                  className="text-sm hover:underline"
                >
                  {startup.email}
                </a>
              </div>
            </div>
          )}
          
          {/* Phone */}
          {startup.phone && (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <a 
                  href={`tel:${startup.phone}`}
                  className="text-sm hover:underline"
                >
                  {startup.phone}
                </a>
              </div>
            </div>
          )}
          
          {/* Location */}
          {startup.location && (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="text-sm">{startup.address || startup.location}</div>
              </div>
            </div>
          )}
          
          {/* Founded */}
          {startup.founded && (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Founded</div>
                <div className="text-sm">{startup.founded}</div>
              </div>
            </div>
          )}
          
          {/* Team Size */}
          {startup.employees && (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Team Size</div>
                <div className="text-sm">{startup.employees} employees</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Stage Badge */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-sm text-muted-foreground">Development Stage</span>
          <Badge variant="outline" className="font-normal">
            {startup.stage}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
