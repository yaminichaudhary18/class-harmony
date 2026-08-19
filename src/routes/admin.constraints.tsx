import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, Sliders, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/app-store";
import type { SoftConstraintFlags } from "@/types";

export const Route = createFileRoute("/admin/constraints")({
  head: () => ({
    meta: [
      { title: "Constraints Configuration — ClassSync" },
      { name: "description", content: "Configure hard and soft timetable generation rules." },
    ],
  }),
  component: AdminConstraintsPage,
});

const CONSTRAINT_INFO: {
  key: keyof SoftConstraintFlags;
  title: string;
  desc: string;
  weight: string;
}[] = [
  {
    key: "spreadSubjectAcrossDays",
    title: "Spread Subjects Across Days",
    desc: "Distribute sessions for the same subject evenly through the week rather than stacking them on a single day.",
    weight: "High impact on student retention",
  },
  {
    key: "minimiseRoomWastage",
    title: "Minimise Room Capacity Wastage",
    desc: "Select the tightest fitting available classroom to preserve large seminar halls for larger sections.",
    weight: "Optimizes room utilisation score",
  },
  {
    key: "avoidFacultyConsecutive",
    title: "Prevent Consecutive Faculty Lectures",
    desc: "Avoid scheduling back-to-back lecture sessions for the same professor to allow preparation time.",
    weight: "Improves faculty workload balance",
  },
  {
    key: "avoidStudentConsecutive",
    title: "Prevent Student Fatigue Gaps",
    desc: "Avoid excessively long unbroken lecture blocks for students without buffer intervals.",
    weight: "Improves student distribution score",
  },
  {
    key: "balanceFacultyWorkload",
    title: "Balance Weekly Faculty Workload",
    desc: "Equitably distribute teaching hours across the department teaching staff.",
    weight: "Enforces faculty max daily caps",
  },
  {
    key: "avoidEdgePeriods",
    title: "Avoid Unfavourable Edge Periods",
    desc: "Discourage scheduling intensive core subjects in early morning (first period) or late evening (last period).",
    weight: "Soft timing penalty",
  },
];

function AdminConstraintsPage() {
  const store = useStore();
  const { settings } = store;

  const toggleConstraint = (key: keyof SoftConstraintFlags, val: boolean) => {
    const updated = {
      ...settings,
      softConstraints: {
        ...settings.softConstraints,
        [key]: val,
      },
    };
    store.update({ settings: updated });
    toast.success(`Constraint "${key}" updated.`);
  };

  return (
    <DashboardShell
      role="admin"
      title="Constraints & Scheduling Rules"
      description="Configure optimization weights and constraint satisfaction criteria for the smart scheduler."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-success" />
              <CardTitle className="text-base">Non-Negotiable Hard Constraints</CardTitle>
            </div>
            <CardDescription>
              Hard constraints are strictly enforced by the backtracking engine. A schedule with any hard conflict is flagged as invalid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "No Faculty Double Booking (1 teacher per slot)",
                "No Room Double Booking (1 class per room per slot)",
                "No Section Double Booking (1 section per slot)",
                "Strict Lab Equipment & Room Type Compatibility",
                "Room Capacity >= Section Student Count",
                "Faculty Day-Wise Availability Enforcement",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 rounded-md border border-border/60 bg-muted/30 p-2.5 text-xs font-medium">
                  <CheckCircle2 className="size-4 text-success shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="size-5 text-primary" />
              <CardTitle className="text-base">Optimizable Soft Constraints</CardTitle>
            </div>
            <CardDescription>
              Toggled soft rules apply penalty costs during pseudo-random restarts to score and rank optimal timetable variations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONSTRAINT_INFO.map((c) => {
              const active = settings.softConstraints[c.key];
              return (
                <div
                  key={c.key}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors"
                >
                  <div className="max-w-2xl space-y-1">
                    <Label htmlFor={c.key} className="text-sm font-semibold cursor-pointer">
                      {c.title}
                    </Label>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                    <p className="text-[11px] font-medium text-primary">{c.weight}</p>
                  </div>
                  <Switch
                    id={c.key}
                    checked={active}
                    onCheckedChange={(v) => toggleConstraint(c.key, v)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

