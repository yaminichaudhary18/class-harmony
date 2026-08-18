import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CalendarRange,
  FlaskConical,
  Gauge,
  Menu,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/app-store";
import { demoCredentials } from "@/data/demoData";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <CalendarRange className="size-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight">ClassSync</span>
        </Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/login">
            <Button>
              Get Started <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <CalendarRange className="size-4" />
            </div>
            <span className="font-extrabold">ClassSync</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Smart Classroom &amp; Timetable Scheduler — a Smart India Hackathon prototype for
            constraint-aware academic scheduling.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/features" className="hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-foreground">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">SIH Prototype</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Problem Statement: Smart Classroom and Timetable Scheduler. Built with React,
            TypeScript and a custom constraint-based scheduling engine.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ClassSync · SIH Prototype · Not affiliated with any institution
      </div>
    </footer>
  );
}

export const featureList = [
  {
    icon: Sparkles,
    title: "Smart Timetable Generation",
    text: "A constraint solver builds the full weekly schedule for every section — never random placement.",
  },
  {
    icon: ShieldCheck,
    title: "Conflict Detection",
    text: "Faculty, room and section clashes, capacity violations and lab mismatches are detected instantly.",
  },
  {
    icon: Building2,
    title: "Smart Classroom Allocation",
    text: "Always assigns the smallest suitable free room so large halls are never wasted.",
  },
  {
    icon: UserCheck,
    title: "Faculty Availability",
    text: "Weekly availability grids and per-day teaching limits are treated as hard constraints.",
  },
  {
    icon: FlaskConical,
    title: "Lab Scheduling",
    text: "Lab subjects are allocated to equipped laboratories in two consecutive periods.",
  },
  {
    icon: RefreshCcw,
    title: "Intelligent Rescheduling",
    text: "When a faculty member is unavailable, alternative conflict-free slots are proposed instantly.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {featureList.map((f) => (
        <Card key={f.title} className="h-full shadow-none transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const pipelineSteps = [
  { title: "Academic Data", text: "Faculty, sections, subjects, classrooms and labs." },
  { title: "Constraints", text: "Hard rules plus configurable soft optimisation preferences." },
  { title: "Smart Scheduler", text: "Slot-by-slot constraint propagation with scored restarts." },
  { title: "Conflict Check", text: "Every placement re-validated against all hard constraints." },
  { title: "Optimisation", text: "Workload balance, room fit and subject spread are scored." },
  { title: "Final Timetable", text: "Published to admin, faculty and student dashboards." },
];

export function PipelineFlow() {
  return (
    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
      {pipelineSteps.map((s, i) => (
        <div key={s.title} className="surface-card p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p className="text-sm font-semibold">{s.title}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

export function DemoButton({ children }: { children?: ReactNode }) {
  const { setUser } = useStore();
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => {
        const admin = demoCredentials[0]!;
        setUser({ role: "admin", name: admin.name, email: admin.email });
        navigate({ to: "/admin" });
      }}
    >
      <Gauge className="size-4" /> {children ?? "View Demo"}
    </Button>
  );
}
