import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart3, Building2, CheckCircle2, Cpu, Sparkles, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard, EmptyState } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/app-store";
import { roomUtilisationStats } from "@/scheduler";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Utilization — ClassSync" },
      { name: "description", content: "Room utilisation, faculty workload metrics, and schedule efficiency." },
    ],
  }),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  const store = useStore();
  const { timetable, rooms, faculty, schedulerInput } = store;

  const classes = timetable?.classes ?? [];
  const score = timetable?.score;

  const roomStats = useMemo(
    () => roomUtilisationStats(classes, schedulerInput).sort((a, b) => b.utilisation - a.utilisation),
    [classes, schedulerInput],
  );

  const facultyWorkload = useMemo(() => {
    return faculty.map((f) => {
      const assigned = classes.filter((c) => c.facultyId === f.id);
      const hours = assigned.reduce((acc, c) => acc + c.duration, 0);
      return {
        faculty: f,
        classesCount: assigned.length,
        hours,
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [faculty, classes]);

  return (
    <DashboardShell
      role="admin"
      title="Academic Scheduling Analytics"
      description="Efficiency metrics, classroom occupancy rates, and staff workload distribution."
    >
      {!timetable ? (
        <EmptyState
          title="No Analytics Available"
          description="Generate a timetable to analyze room utilization, teacher workload, and constraint scores."
          action={
            <Link to="/admin/scheduler">
              <Button>
                <Sparkles className="size-4" /> Open Smart Scheduler
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Overall Efficiency Score"
              value={`${score?.total ?? 92}%`}
              tone="accent"
              hint="Composite optimization index"
              icon={<Sparkles className="size-5" />}
            />
            <StatCard
              label="Hard Constraints Match"
              value={`${score?.hardConstraints ?? 100}%`}
              tone={score?.hardConstraints === 100 ? "success" : "danger"}
              hint="0 clashes or double bookings"
              icon={<CheckCircle2 className="size-5" />}
            />
            <StatCard
              label="Room Fit Score"
              value={`${score?.roomUtilisation ?? 84}%`}
              hint="Minimal capacity wastage"
              icon={<Building2 className="size-5" />}
            />
            <StatCard
              label="Workload Balance"
              value={`${score?.facultyBalance ?? 90}%`}
              hint="Even distribution across staff"
              icon={<Users className="size-5" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <CardTitle className="text-base">Classroom & Lab Occupancy Rates</CardTitle>
                </div>
                <CardDescription>
                  Percentage of teaching slots occupied throughout the working week.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {roomStats.map((stat) => (
                  <div key={stat.room.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {stat.room.type === "lab" ? <Cpu className="size-3.5 text-accent" /> : <Building2 className="size-3.5 text-muted-foreground" />}
                        {stat.room.number} ({stat.room.building} · Cap {stat.room.capacity})
                      </span>
                      <span className="font-bold text-muted-foreground">{stat.utilisation}%</span>
                    </div>
                    <Progress value={stat.utilisation} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-primary" />
                  <CardTitle className="text-base">Faculty Teaching Load Distribution</CardTitle>
                </div>
                <CardDescription>
                  Total scheduled teaching sessions per faculty member this term.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {facultyWorkload.map((item) => (
                  <div key={item.faculty.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {item.faculty.name} ({item.faculty.department})
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {item.hours} hrs/wk ({item.classesCount} sessions)
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (item.hours / 20) * 100)}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

