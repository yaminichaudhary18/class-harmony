import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Check, RefreshCcw, Sparkles, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
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
import type { ScheduledClass } from "@/types";

export const Route = createFileRoute("/admin/rescheduling")({
  head: () => ({
    meta: [
      { title: "Intelligent Rescheduling — ClassSync" },
      { name: "description", content: "Conflict-aware class rescheduling and faculty request approval." },
    ],
  }),
  component: AdminReschedulingPage,
});

function AdminReschedulingPage() {
  const store = useStore();
  const { timetable, sections, subjects, faculty, rooms, settings, requests, schedulerInput } = store;

  const classes = timetable?.classes ?? [];
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id ?? "");

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const alternatives = useMemo(() => {
    if (!selectedClass || !timetable) return [];
    return findAlternativeSlots(selectedClass, timetable.classes, schedulerInput, { limit: 8 });
  }, [selectedClass, timetable, schedulerInput]);

  const applyMove = (alt: { day: string; period: number; roomId: string }, reqId?: string) => {
    if (!selectedClass || !timetable) return;
    const updated = timetable.classes.map((c) =>
      c.id === selectedClass.id
        ? { ...c, day: alt.day as ScheduledClass["day"], period: alt.period, roomId: alt.roomId }
        : c,
    );
    store.updateClasses(updated);

    if (reqId) {
      store.update({
        requests: requests.map((r) => (r.id === reqId ? { ...r, status: "approved" as const } : r)),
      });
    }

    const sub = subjects.find((s) => s.id === selectedClass.subjectId);
    store.logActivity(`Rescheduled ${sub?.name} to ${alt.day} ${periodLabel(settings, alt.period)}`);
    toast.success(`Class successfully moved to ${alt.day} ${periodLabel(settings, alt.period)}.`);
  };

  const handleReject = (reqId: string) => {
    store.update({
      requests: requests.map((r) => (r.id === reqId ? { ...r, status: "rejected" as const } : r)),
    });
    toast.info("Reschedule request rejected.");
  };

  return (
    <DashboardShell
      role="admin"
      title="Intelligent Rescheduling"
      description="Find alternative conflict-free slots to reschedule lectures and process faculty shift requests."
    >
      {!timetable ? (
        <EmptyState
          title="No Timetable Available"
          description="Generate a timetable to enable constraint-aware slot suggestions and class rescheduling."
          action={
            <Link to="/admin/scheduler">
              <Button>
                <Sparkles className="size-4" /> Open Smart Scheduler
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCcw className="size-4 text-primary" />
                  <CardTitle className="text-base">Move Class to Conflict-Free Slot</CardTitle>
                </div>
                <CardDescription>
                  Select any class to search for mathematically verified open slots with room, teacher, and section availability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scheduled class to relocate" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {classes.map((c) => {
                        const sub = subjects.find((s) => s.id === c.subjectId);
                        const sec = sections.find((s) => s.id === c.sectionId);
                        const fac = faculty.find((f) => f.id === c.facultyId);
                        return (
                          <SelectItem key={c.id} value={c.id}>
                            {sub?.name} · {sec?.name} · {fac?.name} ({c.day} {periodLabel(settings, c.period)})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClass && (
                  <div className="space-y-3">
                    <div className="rounded-md border border-border p-3 text-xs space-y-1">
                      <p className="font-semibold text-foreground">Current Allocation:</p>
                      <p className="text-muted-foreground">
                        {subjects.find((s) => s.id === selectedClass.subjectId)?.name} ·{" "}
                        {sections.find((s) => s.id === selectedClass.sectionId)?.name} ·{" "}
                        {faculty.find((f) => f.id === selectedClass.facultyId)?.name}
                      </p>
                      <p className="text-muted-foreground">
                        Time: {selectedClass.day} {periodLabel(settings, selectedClass.period)} · Room:{" "}
                        {rooms.find((r) => r.id === selectedClass.roomId)?.number}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Suggested Conflict-Free Alternative Slots ({alternatives.length})
                      </p>
                      {alternatives.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No conflict-free slots found for this class without violating teacher or room constraints.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {alternatives.map((alt) => {
                            const rm = rooms.find((r) => r.id === alt.roomId);
                            return (
                              <div
                                key={`${alt.day}-${alt.period}`}
                                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-2.5 text-xs"
                              >
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {alt.day} · {periodLabel(settings, alt.period)}
                                  </p>
                                  <p className="text-muted-foreground">
                                    Room {rm?.number} ({rm?.building}) · Capacity {rm?.capacity}
                                  </p>
                                </div>
                                <Button size="sm" onClick={() => applyMove(alt)}>
                                  Move Here
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-primary" />
                  <CardTitle className="text-base">Pending Faculty Reschedule Requests</CardTitle>
                </div>
                <CardDescription>
                  Review and act on faculty-submitted class shift requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <CalendarClock className="size-8 opacity-40" />
                    <p className="mt-2 text-sm">No pending reschedule requests.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {requests.map((r) => {
                      const fac = faculty.find((f) => f.id === r.facultyId);
                      const targetClass = classes.find((c) => c.id === r.classId);
                      const sub = targetClass ? subjects.find((s) => s.id === targetClass.subjectId) : null;
                      return (
                        <div key={r.id} className="rounded-md border border-border p-3 text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">{fac?.name}</p>
                              <p className="text-muted-foreground">
                                Subject: {sub?.name ?? "Class"} {targetClass ? `(${targetClass.day} ${periodLabel(settings, targetClass.period)})` : ""}
                              </p>
                            </div>
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
                          <p className="rounded bg-muted/40 p-2 text-muted-foreground italic">
                            "{r.reason}"
                          </p>
                          {r.status === "pending" && (
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(r.id)}
                              >
                                <X className="size-3.5" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (targetClass) {
                                    setSelectedClassId(targetClass.id);
                                    const alts = findAlternativeSlots(targetClass, classes, schedulerInput, { limit: 1 });
                                    if (alts.length > 0) {
                                      applyMove(alts[0]!, r.id);
                                    } else {
                                      toast.warning("Select an alternative slot manually from the left panel.");
                                    }
                                  }
                                }}
                              >
                                <Check className="size-3.5" /> Auto-Approve & Move
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

