import React from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  PlusCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { PROGRAMS } from '../../data';

interface ProgramsSectionProps {
  builderId: string;
}

export default function ProgramsSection({ builderId }: ProgramsSectionProps) {
  // Filter programs run by this ecosystem builder
  const builderPrograms = PROGRAMS.filter(program => program.organizer === builderId);
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Upcoming': return 'secondary';
      case 'Completed': return 'outline';
      default: return 'default';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Programs & Events</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Program
        </Button>
      </div>
      
      {builderPrograms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No programs found for this ecosystem builder</p>
            <Button className="mt-4" variant="outline">Create First Program</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {builderPrograms.map(program => (
            <Card key={program.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <CardTitle>{program.name}</CardTitle>
                  <Badge variant={getStatusVariant(program.status)}>
                    {program.status}
                  </Badge>
                </div>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Timeline</div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      Start: {formatDate(program.startDate)}
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      End: {formatDate(program.endDate)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Details</div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Participants: {program.participants}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Application deadline: {formatDate(program.applicationDeadline)}
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-end">
                    <Button variant="outline" size="sm">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Separator className="my-6" />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upcoming Events</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <Badge variant="outline" className="mb-2">Workshop</Badge>
              <h4 className="font-semibold mb-1">Startup Financial Modeling</h4>
              <p className="text-sm text-muted-foreground mb-4">Learn how to create robust financial projections for your startup</p>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                June 15, 2025
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Badge variant="outline" className="mb-2">Networking</Badge>
              <h4 className="font-semibold mb-1">Founder&apos;s Meetup</h4>
              <p className="text-sm text-muted-foreground mb-4">Connect with other founders and share experiences</p>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                June 22, 2025
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Badge variant="outline" className="mb-2">Pitch Event</Badge>
              <h4 className="font-semibold mb-1">Demo Day</h4>
              <p className="text-sm text-muted-foreground mb-4">Showcase your startup to investors and partners</p>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                July 5, 2025
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
