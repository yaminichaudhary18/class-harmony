import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, CalendarDays, Clock, GraduationCap, Table2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard, EmptyState } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/app-store";
import { periodLabel, sortByPeriod, todayName } from "@/lib/schedule-utils";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — ClassSync" },
      { name: "description", content: "Student class schedule and daily timetable overview." },
    ],
  }),
  component: StudentDashboardPage,
});

function StudentDashboardPage() {
  const store = useStore();
  const { user, timetable, sections, subjects, rooms, faculty, settings } = store;

  const currentSection = useMemo(
    () => sections.find((s) => s.id === user?.sectionId) ?? sections[0],
    [sections, user],
  );

  const sectionSubjects = useMemo(() => {
    if (!currentSection) return [];
    return subjects.filter((s) => currentSection.subjectIds.includes(s.id));
  }, [subjects, currentSection]);

  const sectionClasses = useMemo(() => {
    if (!timetable || !currentSection) return [];
    return timetable.classes.filter((c) => c.sectionId === currentSection.id);
  }, [timetable, currentSection]);

  const today = todayName();
  const todaysClasses = useMemo(
    () => sectionClasses.filter((c) => c.day === today).sort(sortByPeriod),
    [sectionClasses, today],
  );

  return (
    <DashboardShell
      role="student"
      title={`Welcome, ${user?.name ?? "Student"}`}
      description={`${currentSection?.name ?? "Section"} · ${currentSection?.course ?? "Engineering"} · ${settings.collegeName}`}
      actions={
        <Link to="/student/timetable">
          <Button>
            <Table2 className="size-4" /> View Section Timetable
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My Section"
          value={currentSection?.name ?? "—"}
          hint={`Semester ${currentSection?.semester ?? 4}`}
          icon={<GraduationCap className="size-5" />}
        />
        <StatCard
          label="Total Subjects"
          value={sectionSubjects.length}
          icon={<BookOpen className="size-5" />}
        />
        <StatCard
          label="Classes Today"
          value={todaysClasses.length}
          tone={todaysClasses.length > 0 ? "accent" : "default"}
          icon={<Clock className="size-5" />}
        />
        <StatCard
          label="Weekly Classes"
          value={sectionClasses.length}
          icon={<CalendarDays className="size-5" />}
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
                title="No classes scheduled for today"
                description={
                  timetable
                    ? "No classes scheduled for your section on this day."
                    : "The timetable has not been generated yet."
                }
              />
            ) : (
              <div className="space-y-2">
                {todaysClasses.map((c) => {
                  const subject = subjects.find((s) => s.id === c.subjectId);
                  const fac = faculty.find((f) => f.id === c.facultyId);
                  const room = rooms.find((r) => r.id === c.roomId);
                  return (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{subject?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Instructor: {fac?.name} · Room: {room?.number} ({room?.building})
                        </p>
                      </div>
                      <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {periodLabel(settings, c.period)}
                        {c.duration === 2 ? " (2 hrs)" : ""}
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
            <CardTitle className="text-base">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sectionSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects found for this section.</p>
            ) : (
              sectionSubjects.map((s) => {
                const fac = faculty.find((f) => f.id === s.facultyId);
                return (
                  <div key={s.id} className="rounded-md border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.code}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fac?.name} · {s.type === "lab" ? "Lab" : "Theory"} · {s.classesPerWeek} hrs/wk
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

