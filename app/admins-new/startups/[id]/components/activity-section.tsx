import React from 'react';
import { 
  Activity, 
  Calendar, 
  MessageSquare,
  Award,
  ClipboardCheck,
  FileEdit,
  Clock,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type ActivitySectionProps = {
  startup: any; // In a real app, we would define a proper type
};

export function ActivitySection({ startup }: ActivitySectionProps) {
  // Get appropriate icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Certification":
        return <Award className="h-5 w-5 text-amber-500" />;
      case "Assessment":
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case "Application":
        return <FileEdit className="h-5 w-5 text-green-500" />;
      case "Meeting":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "Communication":
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case "Update":
        return <Activity className="h-5 w-5 text-cyan-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Mock recent notes if not available in the data
  const recentNotes = [
    {
      date: '2024-11-12',
      authorName: 'Kebede Abebe',
      authorRole: 'Certification Specialist',
      content: 'Completed final review of FARIS Technology application. Recommended Level 2 certification based on strong technical assessment and business impact in the Ethiopian market.'
    },
    {
      date: '2024-10-28',
      authorName: 'Tigist Haile',
      authorRole: 'Technical Reviewer',
      content: 'Technical assessment completed. Product demonstrates significant innovation in cloud infrastructure optimization for Ethiopian businesses. Security protocols meet international standards.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {!startup.activity || startup.activity.length === 0 ? (
            <div className="text-center p-6">
              <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-medium mb-1">No Activity Recorded</h3>
              <p className="text-sm text-muted-foreground">
                No activity has been recorded for this startup yet.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-gray-200">
              {startup.activity.map((activity: any, index: number) => (
                <div key={index} className="relative mb-6 last:mb-0">
                  {/* Timeline dot */}
                  <div className="absolute -left-[25px] flex items-center justify-center h-10 w-10 rounded-full bg-gray-50 border border-gray-200">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="ml-4">
                    <div className="flex items-center mb-1">
                      <Badge variant="outline" className="mr-2">{activity.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View Full History
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentNotes.map((note, index) => (
              <div key={index} className={index > 0 ? "pt-4 border-t" : ""}>
                <div className="flex items-start">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {note.authorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{note.authorName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {note.authorRole}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.date)}
                      </span>
                    </div>
                    
                    <p className="text-sm mt-2">
                      {note.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Note Form */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Add Assessment Note</h3>
            <textarea 
              className="w-full p-3 border rounded-md text-sm h-24" 
              placeholder="Enter your assessment notes here..."
            />
            <div className="flex justify-end mt-3">
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Certification Timeline */}
      {startup.status === "Certified" && (
        <Card>
          <CardHeader>
            <CardTitle>Certification Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ol className="relative border-l border-gray-200 pl-6">
                <li className="mb-6">
                  <div className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-green-100 border border-white">
                    <CheckIcon className="h-3 w-3 text-green-600" />
                  </div>
                  <h3 className="flex items-center text-sm font-semibold">
                    Certification Issued
                    <span className="bg-green-100 text-green-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">
                      Current
                    </span>
                  </h3>
                  <time className="block text-xs font-normal text-gray-500 mb-1">
                    {startup.certification?.issued || "N/A"}
                  </time>
                  <p className="text-xs text-gray-600">
                    {startup.certification?.level} certification issued valid for 3 years
                  </p>
                </li>
                <li className="mb-6">
                  <div className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 border border-white">
                    <ClipboardCheck className="h-3 w-3 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold">Final Assessment</h3>
                  <time className="block text-xs font-normal text-gray-500 mb-1">
                    October 28, 2024
                  </time>
                  <p className="text-xs text-gray-600">
                    Technical and business assessment completed with score 87/100
                  </p>
                </li>
                <li className="mb-6">
                  <div className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 border border-white">
                    <FileEdit className="h-3 w-3 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold">Application Submitted</h3>
                  <time className="block text-xs font-normal text-gray-500 mb-1">
                    October 15, 2024
                  </time>
                  <p className="text-xs text-gray-600">
                    Formal application submitted with all required documentation
                  </p>
                </li>
                {startup.certification && (
                  <li>
                    <div className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 border border-white">
                      <Calendar className="h-3 w-3 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-semibold">Certification Expiry</h3>
                    <time className="block text-xs font-normal text-gray-500 mb-1">
                      {startup.certification.expiry}
                    </time>
                    <p className="text-xs text-gray-600">
                      Certification requires renewal before expiry date
                    </p>
                  </li>
                )}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Small check icon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
