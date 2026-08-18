import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid, SiteFooter, SiteHeader } from "@/components/marketing/site";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ClassSync Smart Scheduler" },
      {
        name: "description",
        content:
          "Constraint-aware generation, conflict detection, smart room allocation, lab scheduling and intelligent rescheduling.",
      },
      { property: "og:title", content: "Features — ClassSync Smart Scheduler" },
      {
        property: "og:description",
        content: "Everything ClassSync automates for college timetable planning.",
      },
    ],
  }),
  component: FeaturesPage,
});

const differentiators = [
  ["Constraint-Aware Scheduling", "Placements are validated against every hard rule before they are accepted."],
  ["Smart Classroom Utilisation", "The smallest suitable free room is chosen for each section."],
  ["Faculty Availability", "Weekly availability grids and per-day caps are respected."],
  ["Conflict Detection", "Clashes, capacity issues and lab mismatches are surfaced automatically."],
  ["Intelligent Rescheduling", "Alternatives are found without regenerating the whole timetable."],
  ["Optimisation Score", "Schedule quality is measured from the actual generated data."],
  ["Centralised Scheduling", "Admin, faculty and students share one synchronised timetable."],
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl font-extrabold">Features</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A complete scheduling workspace for colleges — every capability is backed by working
          logic in the prototype.
        </p>
        <div className="mt-8">
          <FeatureGrid />
        </div>

        <h2 className="mt-14 text-2xl font-bold">What makes ClassSync different</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {differentiators.map(([title, text]) => (
            <div key={title} className="surface-card p-5">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
