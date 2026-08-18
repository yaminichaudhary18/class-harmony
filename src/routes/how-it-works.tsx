import { createFileRoute } from "@tanstack/react-router";
import { PipelineFlow, SiteFooter, SiteHeader } from "@/components/marketing/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — ClassSync Smart Scheduler" },
      {
        name: "description",
        content:
          "From academic data and constraints to a scored, conflict-free timetable: the ClassSync scheduling pipeline explained.",
      },
      { property: "og:title", content: "How ClassSync builds a timetable" },
      {
        property: "og:description",
        content: "Data, constraints, scheduling, conflict checks and optimisation.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const hardConstraints = [
  "A faculty member cannot teach two classes at the same time",
  "A classroom cannot host two classes at the same time",
  "A section cannot attend two classes at the same time",
  "Room capacity must be greater than or equal to the section size",
  "Lab subjects must be assigned to suitable laboratories",
  "Faculty unavailable slots can never be used",
  "A section cannot repeat a subject in the same time slot",
  "Required weekly class counts must be satisfied",
];

const softConstraints = [
  "Avoid excessive consecutive classes for faculty",
  "Avoid excessive consecutive classes for students",
  "Spread the same subject across different days",
  "Balance faculty workload across the week",
  "Avoid room wastage — prefer the smallest suitable room",
  "Avoid very early and very late periods where possible",
];

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl font-extrabold">How It Works</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          ClassSync runs a constraint-based scheduling pipeline. Nothing is placed randomly — each
          candidate slot is validated and scored before assignment.
        </p>
        <div className="mt-8">
          <PipelineFlow />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-6">
            <h2 className="text-lg font-bold">Hard constraints</h2>
            <p className="text-xs text-muted-foreground">Never violated.</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {hardConstraints.map((c) => (
                <li key={c} className="rounded-md bg-muted/60 px-3 py-2">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-lg font-bold">Soft constraints</h2>
            <p className="text-xs text-muted-foreground">
              Optimised whenever possible, and toggleable by the admin.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {softConstraints.map((c) => (
                <li key={c} className="rounded-md bg-muted/60 px-3 py-2">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
