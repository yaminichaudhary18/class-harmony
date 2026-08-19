import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/app-store";
import { periodLabel } from "@/lib/schedule-utils";

export const Route = createFileRoute("/faculty/classes")({
  head: () => ({
    meta: [
      { title: "My Classes — Faculty — ClassSync" },
      { name: "description", content: "List of all teaching periods and sections." },
    ],
  }),
  component: FacultyClassesPage,
});

function FacultyClassesPage() {
  const store = useStore();
  const { user, timetable, subjects, sections, rooms, settings, faculty } = store;

  const currentFaculty = useMemo(
    () => faculty.find((f) => f.id === user?.facultyId) ?? faculty[0],
    [faculty, user],
  );

  const myClasses = useMemo(() => {
    if (!timetable || !currentFaculty) return [];
    return timetable.classes.filter((c) => c.facultyId === currentFaculty.id);
  }, [timetable, currentFaculty]);

  return (
    <DashboardShell
      role="faculty"
      title="My Classes & Teaching Assignments"
      description={`Overview of all scheduled weekly lecture and lab sessions for ${currentFaculty?.name ?? user?.name}`}
    >
      {!timetable || myClasses.length === 0 ? (
        <EmptyState
          title="No Scheduled Classes"
          description="You do not have any classes scheduled in the current timetable."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Period / Timing</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myClasses.map((c) => {
                  const sub = subjects.find((s) => s.id === c.subjectId);
                  const sec = sections.find((s) => s.id === c.sectionId);
                  const rm = rooms.find((r) => r.id === c.roomId);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold">{c.day}</TableCell>
                      <TableCell>{periodLabel(settings, c.period)}</TableCell>
                      <TableCell className="font-medium">
                        {sub?.name} ({sub?.code})
                      </TableCell>
                      <TableCell>{sec?.name}</TableCell>
                      <TableCell>
                        Room {rm?.number} ({rm?.building})
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub?.type === "lab" ? "default" : "secondary"}>
                          {sub?.type === "lab" ? "Lab" : "Theory"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}

