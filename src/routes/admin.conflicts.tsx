import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Wand2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState, StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store/app-store";
import { autoFixConflict, detectConflicts, findAlternativeSlots } from "@/scheduler";
import { periodLabel } from "@/lib/schedule-utils";
import type { Conflict, ScheduledClass } from "@/types";

export const Route = createFileRoute("/admin/conflicts")({
  head: () => ({
    meta: [
      { title: "Conflict Detection — ClassSync" },
      { name: "description", content: "Detect and resolve faculty, room and section scheduling clashes." },
      { property: "og:title", content: "Conflict Detection — ClassSync" },
      { property: "og:description", content: "Hard-constraint violation report with auto-fix." },
    ],
  }),
  component: ConflictsPage,
});

const TYPE_LABEL: Record<Conflict["type"], string> = {
  "faculty-clash": "Faculty Clash",
  "room-clash": "Room Clash",
  "section-clash": "Section Clash",
  capacity: "Capacity Exceeded",
  "lab-mismatch": "Lab Requirement",
  availability: "Faculty Unavailable",
};

function ConflictsPage() {
  const store = useStore();
  const { timetable, schedulerInput, settings, subjects, sections, rooms, faculty } = store;
  const [manual, setManual] = useState<ScheduledClass | null>(null);

  const conflicts = useMemo(
    () => (timetable ? detectConflicts(timetable.classes, schedulerInput) : []),
    [timetable, schedulerInput],
  );
  const alternatives = useMemo(
    () =>
      manual && timetable
        ? findAlternativeSlots(manual, timetable.classes, schedulerInput, { limit: 8 })
        : [],
    [manual, timetable, schedulerInput],
  );

  if (!timetable) {
    return (
      <DashboardShell role="admin" title="Conflict Detection">
        <EmptyState
          title="Nothing to analyse yet"
          description="Generate a timetable first — conflicts are then computed live against every hard constraint."
          action={
            <Link to="/admin/scheduler">
              <Button>Open Smart Scheduler</Button>
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  const byType = (t: Conflict["type"][]) => conflicts.filter((c) => t.includes(c.type)).length;

  const fixOne = (conflict: Conflict) => {
    const res = autoFixConflict(conflict, timetable.classes, schedulerInput);
    if (res.fixed) {
      store.updateClasses(res.classes);
      store.logActivity(`Conflict auto-fixed: ${TYPE_LABEL[conflict.type]} — ${res.message}`);
      toast.success(`Conflict resolved. ${res.message}`);
    } else toast.error(res.message);
  };

  const fixAll = () => {
    let classes = timetable.classes;
    let fixed = 0;
    for (let i = 0; i < 25; i++) {
      const list = detectConflicts(classes, schedulerInput);
      if (!list.length) break;
      const res = autoFixConflict(list[0]!, classes, schedulerInput);
      if (!res.fixed) break;
      classes = res.classes;
      fixed += 1;
    }
    store.updateClasses(classes);
    const remaining = detectConflicts(classes, schedulerInput).length;
    store.logActivity(`Auto-fix run: ${fixed} conflict(s) resolved, ${remaining} remaining`);
    if (fixed) toast.success(`${fixed} conflict(s) resolved. ${remaining} remaining.`);
    else toast.error("No conflict could be resolved automatically.");
  };

  const applyMove = (alt: { day: string; period: number; roomId: string }) => {
    if (!manual) return;
    store.updateClasses(
      timetable.classes.map((c) =>
        c.id === manual.id
          ? { ...c, day: alt.day as ScheduledClass["day"], period: alt.period, roomId: alt.roomId }
          : c,
      ),
    );
    store.logActivity(`Conflict resolved manually · moved to ${alt.day} period ${alt.period + 1}`);
    setManual(null);
    toast.success("Class rescheduled.");
  };

  return (
    <DashboardShell
      role="admin"
      title="Conflict Detection"
      description="Live hard-constraint validation of the current timetable"
      actions={
        conflicts.length > 0 ? (
          <Button onClick={fixAll}>
            <Wand2 className="size-4" /> Auto-Fix All
          </Button>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Conflicts"
          value={conflicts.length}
          tone={conflicts.length ? "danger" : "success"}
        />
        <StatCard label="Faculty Clashes" value={byType(["faculty-clash", "availability"])} />
        <StatCard label="Room Clashes" value={byType(["room-clash"])} />
        <StatCard label="Capacity / Lab" value={byType(["capacity", "lab-mismatch"])} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Conflict report</CardTitle>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-success/40 bg-success/10 px-4 py-6">
              <CheckCircle2 className="size-5 text-success" />
              <div>
                <p className="font-semibold">No conflicts detected</p>
                <p className="text-sm text-muted-foreground">
                  Every hard constraint is satisfied: no faculty, room or section overlaps, all
                  rooms fit their sections, and labs are in lab rooms.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((c) => {
                const involved = timetable.classes.filter((cl) => c.classIds.includes(cl.id));
                return (
                  <div key={c.id} className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Badge variant="destructive">{TYPE_LABEL[c.type]}</Badge>
                        <p className="mt-2 text-sm font-medium">{c.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.day} · {periodLabel(settings, c.period)}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {involved.map((cl) => (
                            <li key={cl.id}>
                              {subjects.find((s) => s.id === cl.subjectId)?.name} ·{" "}
                              {sections.find((s) => s.id === cl.sectionId)?.name} ·{" "}
                              {faculty.find((f) => f.id === cl.facultyId)?.name} · Room{" "}
                              {rooms.find((r) => r.id === cl.roomId)?.number}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => fixOne(c)}>
                          Auto-Fix
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setManual(involved[involved.length - 1] ?? null)}
                        >
                          Manual Fix
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!manual} onOpenChange={(o) => !o && setManual(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual resolution</DialogTitle>
            <DialogDescription>
              Choose a conflict-free slot for{" "}
              {manual ? subjects.find((s) => s.id === manual.subjectId)?.name : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {alternatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alternative slot available.</p>
            ) : (
              alternatives.map((a) => (
                <div
                  key={`${a.day}-${a.period}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="text-sm">
                    {a.day} · {periodLabel(settings, a.period)} · Room{" "}
                    {rooms.find((r) => r.id === a.roomId)?.number}
                  </span>
                  <Button size="sm" onClick={() => applyMove(a)}>
                    Apply
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
