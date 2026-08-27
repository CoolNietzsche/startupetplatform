import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMentorDashboardData } from "./actions";

export const dynamic = "force-dynamic";

export default async function MentorPortalDashboard() {
  const { user, mentorAssignments } = await getMentorDashboardData();

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">
          Mentor <span className="text-amber-600 italic">Dashboard</span>
        </h1>
        <p className="text-slate-500 font-bold text-sm tracking-tight">
          Welcome back, {user?.firstName || "Mentor"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">My Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {mentorAssignments.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments yet.</p>
            ) : (
              <div className="space-y-3">
                {mentorAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">{assignment.mentorName}</div>
                    <div className="text-xs text-slate-500">Hub: {assignment.hub?.name}</div>
                    <div className="text-xs text-slate-500">Focus: {assignment.focusArea || "General"}</div>
                    <div className="text-xs text-slate-500">Status: {assignment.status}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">My Startups</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.mentorStartups && user.mentorStartups.length > 0 ? (
              <div className="space-y-3">
                {user.mentorStartups.map((startup) => (
                  <div key={startup.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">{startup.name}</div>
                    <div className="text-xs text-slate-500">Level: {startup.level}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No startups assigned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
