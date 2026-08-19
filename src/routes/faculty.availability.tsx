import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/availability")({
  head: () => ({
    meta: [
      { title: "My Availability — Faculty — ClassSync" },
      { name: "description", content: "Set your weekly teaching availability." },
    ],
  }),
  component: FacultyAvailabilityPage,
});

function FacultyAvailabilityPage() {
  const store = useStore();
  const { user, faculty, settings } = store;

  const currentFaculty = useMemo(
    () => faculty.find((f) => f.id === user?.facultyId) ?? faculty[0],
    [faculty, user],
  );

  const toggleSlot = (day: string, periodIdx: number) => {
    if (!currentFaculty) return;
    const currentAvail = currentFaculty.availability[day] ?? Array(settings.periods.length).fill(true);
    const updatedDay = [...currentAvail];
    updatedDay[periodIdx] = !updatedDay[periodIdx];

    const updatedFaculty = faculty.map((f) =>
      f.id === currentFaculty.id
        ? { ...f, availability: { ...f.availability, [day]: updatedDay } }
        : f,
    );

    store.update({ faculty: updatedFaculty });
    toast.success(`Availability updated for ${day} period ${periodIdx + 1}`);
  };

  return (
    <DashboardShell
      role="faculty"
      title="My Availability"
      description="Click on any slot to toggle between available (green) and unavailable (red)."
    >
      <Card>
        <CardHeader>
          <CardTitle>Weekly Teaching Availability Matrix</CardTitle>
          <CardDescription>
            The scheduling engine respects these constraints when automatically generating timetables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="border-b border-r border-border px-3 py-2 text-left text-xs font-semibold">
                    Time / Period
                  </th>
                  {settings.workingDays.map((day) => (
                    <th
                      key={day}
                      className="border-b border-r border-border px-3 py-2 text-center text-xs font-semibold"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settings.periods.map((period) => (
                  <tr key={period.index}>
                    <td className="border-b border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                      {period.label}
                      {period.isBreak && " (Break)"}
                    </td>
                    {settings.workingDays.map((day) => {
                      if (period.isBreak) {
                        return (
                          <td
                            key={day}
                            className="border-b border-r border-border bg-muted/40 p-2 text-center text-xs text-muted-foreground"
                          >
                            Break
                          </td>
                        );
                      }
                      const isAvail =
                        currentFaculty?.availability[day]?.[period.index] !== false;
                      return (
                        <td
                          key={day}
                          className="border-b border-r border-border p-1.5 text-center align-middle"
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => toggleSlot(day, period.index)}
                            className={cn(
                              "h-8 w-full font-medium transition-colors",
                              isAvail
                                ? "border-success/40 bg-success/15 text-success hover:bg-success/25"
                                : "border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25",
                            )}
                          >
                            {isAvail ? (
                              <span className="flex items-center justify-center gap-1 text-xs">
                                <Check className="size-3.5" /> Free
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1 text-xs">
                                <X className="size-3.5" /> Busy
                              </span>
                            )}
                          </Button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

