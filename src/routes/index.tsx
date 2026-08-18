import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DemoButton,
  FeatureGrid,
  PipelineFlow,
  SiteFooter,
  SiteHeader,
} from "@/components/marketing/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClassSync — Smart Classroom & Timetable Scheduler" },
      {
        name: "description",
        content:
          "Automatically generate optimised, conflict-free college timetables with smart classroom allocation, faculty availability and intelligent rescheduling.",
      },
      { property: "og:title", content: "Smart Scheduling for Smarter Campuses" },
      {
        property: "og:description",
        content:
          "Constraint-aware timetable generation, conflict detection and intelligent rescheduling for colleges.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
              Smart India Hackathon Prototype
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Smart Scheduling for Smarter Campuses
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              ClassSync automatically creates optimised academic schedules for every section while
              avoiding faculty, classroom and section conflicts — respecting room capacity, lab
              requirements and real faculty availability.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" variant="secondary">
                  Get Started <ArrowRight className="size-4" />
                </Button>
              </Link>
              <DemoButton />
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-primary-foreground/80 sm:grid-cols-2">
              {[
                "Zero hard-constraint violations",
                "Smallest suitable room allocation",
                "Two-period lab blocks",
                "Live conflict resolution",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur">
            <div className="rounded-lg bg-card p-4 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Generated timetable · CSE-A
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-[11px]">
                {["Time", "Mon", "Tue", "Wed"].map((h) => (
                  <div key={h} className="rounded bg-muted px-2 py-1 font-semibold">
                    {h}
                  </div>
                ))}
                {[
                  ["09:00", "DBMS", "Maths", "OS"],
                  ["10:00", "Maths", "DBMS", "Python"],
                  ["11:00", "Python Lab", "OS", "DBMS"],
                  ["12:45", "DS", "Python", "Maths"],
                ].map((row) => (
                  <>
                    <div key={row[0]} className="rounded bg-muted/60 px-2 py-2 text-muted-foreground">
                      {row[0]}
                    </div>
                    {row.slice(1).map((cell, i) => (
                      <div
                        key={`${row[0]}-${i}`}
                        className="rounded border border-primary/20 bg-primary/8 px-2 py-2 font-medium"
                      >
                        {cell}
                      </div>
                    ))}
                  </>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-md bg-success/12 px-3 py-2 text-xs font-semibold text-success">
                <span>0 hard conflicts</span>
                <span>Efficiency 92%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Built for real academic constraints</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every module in ClassSync is functional — the scheduler, conflict engine and rescheduler
          run on your data, not on static screenshots.
        </p>
        <div className="mt-8">
          <FeatureGrid />
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Data → Constraints → Smart Scheduler → Conflict Check → Optimisation → Final Timetable
          </p>
          <div className="mt-8">
            <PipelineFlow />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to run the demo?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Sign in as Admin, Faculty or Student with demo credentials and generate a full college
          timetable in seconds.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <DemoButton>Open Admin Demo</DemoButton>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
