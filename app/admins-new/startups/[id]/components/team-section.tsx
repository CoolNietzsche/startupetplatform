import React from 'react';
import { 
  User, 
  Mail, 
  Calendar,
  Linkedin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type TeamSectionProps = {
  startup: any; // In a real app, we would define a proper type
};

export function TeamSection({ startup }: TeamSectionProps) {
  return (
    <div className="space-y-6">
      {/* Founders section */}
      <Card>
        <CardHeader>
          <CardTitle>Founders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {startup.founders && startup.founders.map((founder: any, index: number) => (
            <div key={index} className={index > 0 ? "pt-6 border-t" : ""}>
              <div className="flex items-start">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {founder.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{founder.name}</h3>
                    <Badge variant="outline">{founder.role}</Badge>
                  </div>
                  
                  {founder.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {founder.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    {founder.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                        <a href={`mailto:${founder.email}`} className="hover:underline">
                          {founder.email}
                        </a>
                      </div>
                    )}
                    
                    {founder.linkedin && (
                      <div className="flex items-center text-sm">
                        <Linkedin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <a 
                          href={`https://${founder.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Team members section */}
      {startup.team && startup.team.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {startup.team.map((member: any, index: number) => (
                <div key={index} className="flex items-center p-3 rounded-md border">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                  
                  {member.joined && (
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {member.joined}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Organization Structure */}
            <div className="mt-6 border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Organization Structure</h3>
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 rounded-md p-2 px-4 text-center mb-2 w-40">
                  <div className="text-xs text-muted-foreground">CEO</div>
                  <div className="text-sm font-medium">{startup.founders[0].name}</div>
                </div>
                
                <div className="h-6 border-l"></div>
                
                <div className="grid grid-cols-3 gap-2 w-full">
                  {[
                    { title: "Technology", department: "Engineering", count: Math.round(startup.employees * 0.4) },
                    { title: "Operations", department: "Operations", count: Math.round(startup.employees * 0.3) },
                    { title: "Business", department: "Sales & Marketing", count: Math.round(startup.employees * 0.3) }
                  ].map((dept, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="h-6 border-l"></div>
                      <div className="bg-primary/5 rounded-md p-2 text-center w-full">
                        <div className="text-xs text-muted-foreground">{dept.department}</div>
                        <div className="text-sm font-medium">{dept.count} employees</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                View All Team Members
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
