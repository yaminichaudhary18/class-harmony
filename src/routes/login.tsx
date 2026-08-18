import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarRange, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoCredentials } from "@/data/demoData";
import { useStore } from "@/store/app-store";
import type { Role } from "@/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ClassSync Smart Scheduler" },
      {
        name: "description",
        content: "Sign in as admin, faculty or student to access the ClassSync timetable workspace.",
      },
      { property: "og:title", content: "Login — ClassSync" },
      { property: "og:description", content: "Role based access to the smart timetable system." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  role: z.enum(["admin", "faculty", "student"]),
});

function LoginPage() {
  const { setUser, logActivity } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const signIn = (r: Role, e: string, p: string) => {
    const match = demoCredentials.find(
      (c) => c.role === r && c.email.toLowerCase() === e.toLowerCase() && c.password === p,
    );
    if (!match) {
      toast.error("Invalid demo credentials for the selected role.");
      return;
    }
    setUser({
      role: match.role,
      name: match.name,
      email: match.email,
      ...(match.facultyId ? { facultyId: match.facultyId } : {}),
      ...(match.sectionId ? { sectionId: match.sectionId } : {}),
    });
    logActivity(`${match.name} signed in as ${match.role}`);
    toast.success(`Welcome, ${match.name}`);
    navigate({ to: r === "admin" ? "/admin" : r === "faculty" ? "/faculty" : "/student" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, role });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn(parsed.data.role, parsed.data.email, parsed.data.password);
    }, 400);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-gradient hidden flex-col justify-between p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-white/15">
            <CalendarRange className="size-5" />
          </div>
          <span className="font-extrabold">ClassSync</span>
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold">Smart Scheduling for Smarter Campuses</h2>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/80">
            Generate conflict-free timetables, detect clashes automatically and reschedule classes
            intelligently — all from one workspace.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">Smart India Hackathon Prototype</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Access your role-based scheduling dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                  />
                  {errors['email'] && <p className="text-xs text-destructive">{errors['email']}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {errors['password'] && <p className="text-xs text-destructive">{errors['password']}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="size-4" />
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo accounts
                </p>
                <div className="mt-3 space-y-2">
                  {demoCredentials.map((c) => (
                    <div
                      key={c.role}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-card px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold capitalize">{c.role}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {c.email} · {c.password}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRole(c.role);
                          setEmail(c.email);
                          setPassword(c.password);
                          signIn(c.role, c.email, c.password);
                        }}
                      >
                        Use account
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground">
                  ← Back to home
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
