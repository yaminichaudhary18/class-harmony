import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Mail, User, GraduationCap, Building } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/store/app-store";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — ClassSync" },
      { name: "description", content: "Student academic profile." },
    ],
  }),
  component: StudentProfilePage,
});

function StudentProfilePage() {
  const { user, sections, subjects, settings } = useStore();

  const currentSection = useMemo(
    () => sections.find((s) => s.id === user?.sectionId) ?? sections[0],
    [sections, user],
  );

  const sectionSubjects = useMemo(() => {
    if (!currentSection) return [];
    return subjects.filter((s) => currentSection.subjectIds.includes(s.id));
  }, [subjects, currentSection]);

  return (
    <DashboardShell
      role="student"
      title="Student Profile"
      description="Enrolled programme, batch information, and registered courses."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Academic Profile</CardTitle>
            <CardDescription>Student identity and enrollment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <User className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="text-sm font-semibold">{user?.name ?? "Student"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <GraduationCap className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Class Section / Batch</p>
                <p className="text-sm font-semibold">
                  Section {currentSection?.name} (Semester {currentSection?.semester})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Building className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Degree Programme / College</p>
                <p className="text-sm font-semibold">
                  {currentSection?.course} · {settings.collegeName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Mail className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Institutional Email</p>
                <p className="text-sm font-semibold">{user?.email ?? "student@college.edu"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses ({sectionSubjects.length})</CardTitle>
            <CardDescription>Current curriculum subject registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {sectionSubjects.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-2.5 text-xs">
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-muted-foreground">{s.code} · {s.type === "lab" ? "Lab" : "Theory"}</p>
                </div>
                <span className="font-medium text-muted-foreground">{s.credits} Credits</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

