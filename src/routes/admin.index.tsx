import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Cpu,
  DoorOpen,
  GraduationCap,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard, EmptyState } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/store/app-store";
import { detectConflicts, roomUtilisationStats } from "@/scheduler";
import { periodLabel, sortByPeriod, todayName } from "@/lib/schedule-utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ClassSync" },
      { name: "description", content: "Overview of faculty, rooms, conflicts and today's classes." },
      { property: "og:title", content: "Admin Dashboard — ClassSync" },
      { property: "og:description", content: "Scheduling control centre for your campus." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const store = useStore();
  const { faculty, sections, rooms, timetable, activities, schedulerInput, settings } = store;

  const classrooms = rooms.filter((r) => r.type !== "lab");
  const labs = rooms.filter((r) => r.type === "lab");
  const classes = timetable?.classes ?? [];
  const conflicts = useMemo(
    () => (classes.length ? detectConflicts(classes, schedulerInput) : []),
    [classes, schedulerInput],
  );
  const today = todayName();
  const todaysClasses = classes.filter((c) => c.day === today).sort(sortByPeriod);
  const utilisation = useMemo(
    () => roomUtilisationStats(classes, schedulerInput).sort((a, b) => b.utilisation - a.utilisation),
    [classes, schedulerInput],
  );
  const busyNow = new Set(todaysClasses.map((c) => c.roomId)).size;

  return (
    <DashboardShell
      role="admin"
      title="Admin Dashboard"
      description={`${settings.collegeName} · ${settings.academicYear}`}
      actions={
        <Link to="/admin/scheduler">
          <Button>
            <Sparkles className="size-4" /> Generate Smart Timetable
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Faculty" value={faculty.length} icon={<Users className="size-5" />} />
        <StatCard label="Total Sections" value={sections.length} icon={<GraduationCap className="size-5" />} />
        <StatCard label="Total Classrooms" value={classrooms.length} icon={<Building2 className="size-5" />} />
        <StatCard label="Total Labs" value={labs.length} tone="accent" icon={<Cpu className="size-5" />} />
        <StatCard
          label="Current Conflicts"
          value={conflicts.length}
          tone={conflicts.length ? "danger" : "success"}
          hint={timetable ? (conflicts.length ? "Needs attention" : "Schedule is valid") : "No timetable yet"}
          icon={<TriangleAlert className="size-5" />}
        />
        <StatCard
          label="Available Rooms Today"
          value={Math.max(0, rooms.length - busyNow)}
          hint={`${busyNow} of ${rooms.length} in use on ${today}`}
          tone="success"
          icon={<DoorOpen className="size-5" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Today's Classes · {today}</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysClasses.length === 0 ? (
              <EmptyState
                title="No classes scheduled today"
                description="Generate a timetable from the Smart Scheduler to populate today's schedule."
                action={
                  <Link to="/admin/scheduler">
                    <Button size="sm">Open Smart Scheduler</Button>
                  </Link>
                }
              />
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {todaysClasses.map((c) => {
                  const subject = store.subjects.find((s) => s.id === c.subjectId);
                  const fac = faculty.find((f) => f.id === c.facultyId);
                  const room = rooms.find((r) => r.id === c.roomId);
                  const section = sections.find((s) => s.id === c.sectionId);
                  return (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{subject?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {section?.name} · {fac?.name} · Room {room?.number}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {periodLabel(settings, c.period)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Utilisation appears after a timetable is generated.
              </p>
            ) : (
              utilisation.slice(0, 7).map((u) => (
                <div key={u.room.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{u.room.number}</span>
                    <span className="text-muted-foreground">{u.utilisation}%</span>
                  </div>
                  <Progress value={u.utilisation} className="mt-1 h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timetable generated yet.</p>
            ) : (
              <div className="space-y-2">
                {classes
                  .filter((c) => c.day !== today)
                  .slice(0, 6)
                  .map((c) => {
                    const subject = store.subjects.find((s) => s.id === c.subjectId);
                    const section = sections.find((s) => s.id === c.sectionId);
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">
                          {subject?.name} · {section?.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {c.day} {periodLabel(settings, c.period)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{a.message}</span>
                  <span className="shrink-0 text-xs text-muted-foreground/70">
                    {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
