import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/common/StatCard";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { useStore } from "@/store/app-store";
import { coversPeriod } from "@/lib/schedule-utils";

export const Route = createFileRoute("/faculty/timetable")({
  head: () => ({
    meta: [
      { title: "My Timetable — Faculty — ClassSync" },
      { name: "description", content: "Personal weekly teaching timetable." },
    ],
  }),
  component: FacultyTimetablePage,
});

function FacultyTimetablePage() {
  const store = useStore();
  const { user, timetable, settings, faculty } = store;

  const currentFaculty = useMemo(
    () => faculty.find((f) => f.id === user?.facultyId) ?? faculty[0],
    [faculty, user],
  );

  const facultyClasses = useMemo(() => {
    if (!timetable || !currentFaculty) return [];
    return timetable.classes.filter((c) => c.facultyId === currentFaculty.id);
  }, [timetable, currentFaculty]);

  const columns = settings.workingDays.map((d) => ({ id: d, label: d }));

  const getClasses = (day: string, period: number) =>
    facultyClasses.filter((c) => c.day === day && coversPeriod(c, period));

  return (
    <DashboardShell
      role="faculty"
      title="My Timetable"
      description={`Weekly teaching schedule for ${currentFaculty?.name ?? user?.name}`}
    >
      {!timetable ? (
        <EmptyState
          title="No Timetable Generated"
          description="The institutional timetable has not been published or generated yet."
        />
      ) : (
        <div className="space-y-4">
          <TimetableGrid columns={columns} getClasses={getClasses} />
        </div>
      )}
    </DashboardShell>
  );
}

