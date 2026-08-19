import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Mail, User, Building, Clock, BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/store/app-store";

export const Route = createFileRoute("/faculty/profile")({
  head: () => ({
    meta: [
      { title: "Faculty Profile — ClassSync" },
      { name: "description", content: "Faculty profile and contact information." },
    ],
  }),
  component: FacultyProfilePage,
});

function FacultyProfilePage() {
  const { user, faculty, subjects, settings } = useStore();

  const currentFaculty = useMemo(
    () => faculty.find((f) => f.id === user?.facultyId) ?? faculty[0],
    [faculty, user],
  );

  const mySubjects = useMemo(() => {
    if (!currentFaculty) return [];
    return subjects.filter((s) => s.facultyId === currentFaculty.id);
  }, [subjects, currentFaculty]);

  return (
    <DashboardShell
      role="faculty"
      title="Faculty Profile"
      description="Personal and departmental information registered in the academic system."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Academic faculty credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <User className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-semibold">{currentFaculty?.name ?? user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Building className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department / Institution</p>
                <p className="text-sm font-semibold">
                  {currentFaculty?.department ?? "Computer Science"} · {settings.collegeName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Mail className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm font-semibold">{currentFaculty?.email ?? user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Clock className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Workload Limit</p>
                <p className="text-sm font-semibold">
                  Maximum {currentFaculty?.maxClassesPerDay ?? 4} periods/day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Subjects</CardTitle>
            <CardDescription>Courses assigned for this academic term</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mySubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects assigned.</p>
            ) : (
              mySubjects.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <BookOpen className="size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Code: {s.code} · {s.type === "lab" ? "Lab" : "Theory"} · {s.classesPerWeek} classes/wk
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

