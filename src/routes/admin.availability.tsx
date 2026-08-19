import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X, UserCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/availability")({
  head: () => ({
    meta: [
      { title: "Faculty Availability — ClassSync" },
      { name: "description", content: "Manage faculty availability matrices and teaching constraints." },
    ],
  }),
  component: AdminAvailabilityPage,
});

function AdminAvailabilityPage() {
  const store = useStore();
  const { faculty, settings } = store;
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculty[0]?.id ?? "");

  const currentFaculty = faculty.find((f) => f.id === selectedFacultyId) ?? faculty[0];

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
    toast.success(`Updated ${currentFaculty.name}'s availability for ${day} period ${periodIdx + 1}`);
  };

  const markAll = (available: boolean) => {
    if (!currentFaculty) return;
    const updatedMap: Record<string, boolean[]> = {};
    for (const d of settings.workingDays) {
      updatedMap[d] = Array(settings.periods.length).fill(available);
    }
    const updatedFaculty = faculty.map((f) =>
      f.id === currentFaculty.id ? { ...f, availability: updatedMap } : f,
    );
    store.update({ faculty: updatedFaculty });
    toast.success(`Marked all slots as ${available ? "available" : "unavailable"}`);
  };

  return (
    <DashboardShell
      role="admin"
      title="Faculty Availability Management"
      description="Define when faculty members are available to teach before generating the timetable."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Select Faculty:</span>
          <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {faculty.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name} ({f.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => markAll(true)}>
            Mark All Available
          </Button>
          <Button size="sm" variant="outline" onClick={() => markAll(false)}>
            Mark All Busy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                {currentFaculty?.name} · {currentFaculty?.department}
              </CardTitle>
              <CardDescription>
                Max workload: {currentFaculty?.maxClassesPerDay} classes per day · {currentFaculty?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
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

