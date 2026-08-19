import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Send } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/app-store";
import { periodLabel } from "@/lib/schedule-utils";
import { findAlternativeSlots } from "@/scheduler";

export const Route = createFileRoute("/faculty/reschedule")({
  head: () => ({
    meta: [
      { title: "Reschedule Request — Faculty — ClassSync" },
      { name: "description", content: "Submit a request to reschedule a lecture or lab." },
    ],
  }),
  component: FacultyReschedulePage,
});

function FacultyReschedulePage() {
  const store = useStore();
  const { user, timetable, subjects, sections, rooms, settings, faculty, requests, schedulerInput } = store;

  const currentFaculty = useMemo(
    () => faculty.find((f) => f.id === user?.facultyId) ?? faculty[0],
    [faculty, user],
  );

  const myClasses = useMemo(() => {
    if (!timetable || !currentFaculty) return [];
    return timetable.classes.filter((c) => c.facultyId === currentFaculty.id);
  }, [timetable, currentFaculty]);

  const [selectedClassId, setSelectedClassId] = useState<string>(myClasses[0]?.id ?? "");
  const [reason, setReason] = useState("");

  const selectedClass = myClasses.find((c) => c.id === selectedClassId);

  const alternatives = useMemo(() => {
    if (!selectedClass || !timetable) return [];
    return findAlternativeSlots(selectedClass, timetable.classes, schedulerInput, { limit: 5 });
  }, [selectedClass, timetable, schedulerInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !reason.trim()) {
      toast.error("Please select a class and provide a reason.");
      return;
    }
    const newReq = {
      id: `req-${Date.now()}`,
      facultyId: currentFaculty?.id ?? "f1",
      classId: selectedClassId,
      reason: reason.trim(),
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };
    store.update({ requests: [newReq, ...requests] });
    store.notify({
      role: "admin",
      title: "New Reschedule Request",
      message: `${currentFaculty?.name} requested to reschedule a class: "${reason.trim()}".`,
      link: "/admin/rescheduling",
    });
    store.logActivity(`Reschedule request submitted by ${currentFaculty?.name}`);
    toast.success("Reschedule request submitted to the academic administrator.");
    setReason("");
  };

  const myRequests = requests.filter((r) => r.facultyId === currentFaculty?.id);

  return (
    <DashboardShell
      role="faculty"
      title="Class Rescheduling Request"
      description="Request to move a lecture or lab to an alternative conflict-free slot."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submit Reschedule Request</CardTitle>
            <CardDescription>
              Select the class you wish to reschedule. The scheduler will check alternative slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="classSelect">Select Class</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="classSelect">
                    <SelectValue placeholder="Choose a scheduled class" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map((c) => {
                      const sub = subjects.find((s) => s.id === c.subjectId);
                      const sec = sections.find((s) => s.id === c.sectionId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {sub?.name} · {sec?.name} ({c.day} {periodLabel(settings, c.period)})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedClass && (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-xs">
                  <p className="font-medium text-foreground">Available Conflict-Free Slots:</p>
                  {alternatives.length === 0 ? (
                    <p className="mt-1 text-muted-foreground">No automatic slots detected.</p>
                  ) : (
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {alternatives.map((alt) => {
                        const rm = rooms.find((r) => r.id === alt.roomId);
                        return (
                          <li key={`${alt.day}-${alt.period}`}>
                            ✓ {alt.day} {periodLabel(settings, alt.period)} (Room {rm?.number})
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason for Rescheduling</Label>
                <Input
                  id="reason"
                  placeholder="e.g. Conference attendance, medical leave, lab maintenance"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={160}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="size-4" /> Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Track status of your submitted reschedule requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <CalendarClock className="size-8 opacity-40" />
                <p className="mt-2 text-sm">No reschedule requests submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((r) => (
                  <div key={r.id} className="rounded-md border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.reason}</span>
                      <Badge
                        variant={
                          r.status === "approved"
                            ? "default"
                            : r.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted on {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

