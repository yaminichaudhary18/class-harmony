import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/marketing/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ClassSync SIH Prototype" },
      {
        name: "description",
        content:
          "About the ClassSync Smart Classroom and Timetable Scheduler prototype built for the Smart India Hackathon.",
      },
      { property: "og:title", content: "About ClassSync" },
      {
        property: "og:description",
        content: "Problem statement, solution approach and technology behind the prototype.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="text-3xl font-extrabold">About the project</h1>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-bold">Problem statement</h2>
          <p className="text-sm text-muted-foreground">
            Colleges build timetables manually across dozens of sections, faculty members and
            rooms. The process takes weeks, is error prone, and a single change — such as a faculty
            member becoming unavailable — forces large parts of the schedule to be reworked by
            hand.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-bold">Our solution</h2>
          <p className="text-sm text-muted-foreground">
            ClassSync models scheduling as a constraint satisfaction problem. It builds every legal
            time slot, filters out slots violating hard constraints, allocates the smallest
            suitable room, and scores candidate placements against configurable soft constraints.
            Multiple scored restarts are compared and the best valid schedule is returned. If a
            fully valid schedule is impossible, the system reports exactly which requirements
            conflict instead of silently producing an invalid timetable.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-bold">Technology</h2>
          <p className="text-sm text-muted-foreground">
            React, TypeScript, Tailwind CSS and a dedicated scheduling engine module
            (<code className="rounded bg-muted px-1">src/scheduler</code>) kept fully separate from
            the UI, so a real backend and database can be connected later without rewriting the
            algorithm.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-bold">Demo credentials</h2>
          <div className="surface-card divide-y divide-border text-sm">
            {[
              ["Admin", "admin@college.edu", "admin123"],
              ["Faculty", "anil.sharma@college.edu", "faculty123"],
              ["Student", "student.csea@college.edu", "student123"],
            ].map(([role, email, pass]) => (
              <div key={role} className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3">
                <span className="w-20 font-semibold">{role}</span>
                <span className="text-muted-foreground">{email}</span>
                <span className="text-muted-foreground">{pass}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
