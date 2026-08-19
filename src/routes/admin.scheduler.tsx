import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStore } from "@/store/app-store";
import { buildSlots, detectConflicts, generateSchedule } from "@/scheduler";

export const Route = createFileRoute("/admin/scheduler")({
  head: () => ({
    meta: [
      { title: "Smart Scheduler — ClassSync" },
      {
        name: "description",
        content: "Run the constraint-based scheduling engine and generate a conflict-free timetable.",
      },
      { property: "og:title", content: "Smart Scheduler — ClassSync" },
      { property: "og:description", content: "Constraint-based timetable generation." },
    ],
  }),
  component: SchedulerPage,
});

const STEPS = [
  "Loading academic data",
  "Checking faculty availability",
  "Checking classroom capacity",
  "Allocating labs",
  "Applying hard constraints",
  "Generating schedule",
  "Detecting conflicts",
  "Optimising soft constraints",
  "Finalising timetable",
];

function SchedulerPage() {
  const store = useStore();
  const { faculty, sections, subjects, rooms, settings, schedulerInput, timetable } = store;
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<{ conflicts: number; placed: number; unplaced: number } | null>(
    null,
  );

  const classrooms = rooms.filter((r) => r.type !== "lab");
  const labs = rooms.filter((r) => r.type === "lab");
  const slots = useMemo(() => buildSlots(settings).length, [settings]);
  const requiredSessions = useMemo(
    () =>
      sections.reduce(
        (total, sec) =>
          total +
          sec.subjectIds.reduce(
            (t, id) => t + (subjects.find((s) => s.id === id)?.classesPerWeek ?? 0),
            0,
          ),
        0,
      ),
    [sections, subjects],
  );

  const run = () => {
    setRunning(true);
    setResult(null);
    setStep(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < STEPS.length) {
        setStep(i);
        setTimeout(tick, 180);
      } else {
        const tt = generateSchedule(schedulerInput);
        const conflicts = detectConflicts(tt.classes, schedulerInput);
        store.setTimetable(tt);
        store.logActivity(
          `Timetable generated · ${tt.classes.length} classes · score ${tt.score.total}%`,
        );
        store.notify({
          role: "admin",
          title: "Timetable generated",
          message: `${tt.classes.length} classes scheduled with ${conflicts.length} hard conflicts.`,
          link: "/admin/timetable",
        });
        setResult({
          conflicts: conflicts.length,
          placed: tt.classes.length,
          unplaced: tt.unplaced.reduce((a, u) => a + u.count, 0),
        });
        setRunning(false);
        setStep(STEPS.length);
        if (conflicts.length === 0 && tt.unplaced.length === 0)
          toast.success("Timetable generated successfully with 0 hard conflicts.");
        else toast.warning("Timetable generated — review the reported issues.");
      }
    };
    setTimeout(tick, 200);
  };

  const summary = [
    ["Department", "CSE / ECE"],
    ["Semester", "4"],
    ["Sections", String(sections.length)],
    ["Faculty", String(faculty.length)],
    ["Subjects", String(subjects.length)],
    ["Classrooms", String(classrooms.length)],
    ["Labs", String(labs.length)],
    ["Working days", settings.workingDays.join(", ")],
    ["Time slots / week", String(slots)],
    ["Sessions required", String(requiredSessions)],
  ];

  return (
    <DashboardShell
      role="admin"
      title="Smart Scheduler"
      description="Constraint-based timetable generation engine"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resource summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              {summary.map(([k, v]) => (
                <div key={k} className="rounded-md border border-border px-3 py-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <p className="mb-2 text-xs text-muted-foreground">
                Period timings: {settings.periods.map((p) => p.label).join(" · ")}
              </p>
              <Button size="lg" onClick={run} disabled={running} className="w-full sm:w-auto">
                {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {running ? "Generating…" : "GENERATE SMART TIMETABLE"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STEPS.map((s, i) => {
              const done = step > i;
              const active = step === i && running;
              return (
                <div key={s} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : active ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <span className="size-4 rounded-full border border-border" />
                  )}
                  <span className={done || active ? "text-foreground" : "text-muted-foreground"}>
                    {s}
                  </span>
                </div>
              );
            })}
            {running && <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3 h-2" />}
          </CardContent>
        </Card>
      </div>

      {result && timetable && (
        <div className="mt-6 space-y-4">
          {result.conflicts === 0 && result.unplaced === 0 ? (
            <Alert className="border-success/40 bg-success/10">
              <CheckCircle2 className="size-4 text-success" />
              <AlertTitle>Schedule generated successfully</AlertTitle>
              <AlertDescription>
                {result.placed} classes placed · 0 hard conflicts · efficiency score{" "}
                {timetable.score.total}%.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <TriangleAlert className="size-4" />
              <AlertTitle>Unable to satisfy all constraints.</AlertTitle>
              <AlertDescription>
                <p>
                  {result.placed} classes placed, {result.unplaced} sessions could not be scheduled
                  and {result.conflicts} conflicts remain.
                </p>
                <ul className="mt-2 list-disc pl-4 text-xs">
                  {timetable.unplaced.map((u) => {
                    const sec = sections.find((s) => s.id === u.sectionId)?.name;
                    const sub = subjects.find((s) => s.id === u.subjectId);
                    return (
                      <li key={`${u.sectionId}-${u.subjectId}`}>
                        {sub?.name} for {sec}: {u.count} session(s) unplaced. Suggested fix: widen{" "}
                        {sub ? "faculty availability" : "resources"}, add a suitable{" "}
                        {sub?.type === "lab" ? "laboratory" : "classroom"} with capacity ≥ section
                        size, or reduce classes/week.
                      </li>
                    );
                  })}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/timetable">
              <Button>View timetable</Button>
            </Link>
            <Link to="/admin/conflicts">
              <Button variant="outline">Check conflicts</Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="outline">Open analytics</Button>
            </Link>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
