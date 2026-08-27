import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Building, 
  ArrowRight 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { SUPPORTED_STARTUPS } from '../../data';

interface StartupsListProps {
  builderId: string;
}

export default function StartupsList({ builderId }: StartupsListProps) {
  // Filter startups supported by this specific ecosystem builder
  const supportedStartups = SUPPORTED_STARTUPS.filter(
    startup => startup.builders.includes(builderId)
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Supported Startups</h2>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          View All Programs
        </Button>
      </div>
      
      {supportedStartups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No startups found for this ecosystem builder</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supportedStartups.map(startup => (
            <Card key={startup.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {startup.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{startup.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                      <span className="mr-2">{startup.industry}</span>
                      <Badge variant="outline" className="text-xs">{startup.stage}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {startup.description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-muted-foreground">
                    Founded: {startup.year}
                  </div>
                  <Link href={`/admins-new/startups/${startup.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
