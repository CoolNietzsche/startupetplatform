import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHubDashboardData } from "./actions";

export const dynamic = "force-dynamic";

export default async function HubPortalDashboard() {
  const { hub } = await getHubDashboardData();

  if (!hub) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border border-slate-200 shadow-lg bg-white p-8 text-center">
          <CardTitle className="text-xl font-black text-slate-900 mb-2">No Hub Assigned</CardTitle>
          <p className="text-slate-500">You are not currently managing any hub.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">
          {hub.name}
        </h1>
        <p className="text-slate-500 font-bold text-sm tracking-tight">Hub Management Portal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Startups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-slate-900">{hub.startups.length}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-slate-900">{hub.incubationPrograms.length}</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-slate-900">{hub.mentorAssignments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Incubation Programs</CardTitle>
          </CardHeader>
          <CardContent>
            {hub.incubationPrograms.length === 0 ? (
              <p className="text-sm text-slate-500">No programs yet.</p>
            ) : (
              <div className="space-y-3">
                {hub.incubationPrograms.map((prog) => (
                  <div key={prog.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">{prog.name}</div>
                    <div className="text-xs text-slate-500 mt-1">Status: {prog.status}</div>
                    <div className="text-xs text-slate-500">Mentors: {prog.mentorAssignments.length} | Progress entries: {prog.progress.length}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Mentor Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {hub.mentorAssignments.length === 0 ? (
              <p className="text-sm text-slate-500">No mentor assignments yet.</p>
            ) : (
              <div className="space-y-3">
                {hub.mentorAssignments.map((mentor) => (
                  <div key={mentor.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">{mentor.mentorName}</div>
                    <div className="text-xs text-slate-500">{mentor.focusArea && `Focus: ${mentor.focusArea}`}</div>
                    <div className="text-xs text-slate-500">Status: {mentor.status}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
