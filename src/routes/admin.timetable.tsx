import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Pencil, RefreshCcw, Save, Send } from "lucide-react";
import { DashboardShell, StatusBadge } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { useStore } from "@/store/app-store";
import { detectConflicts, findAlternativeSlots, generateSchedule } from "@/scheduler";
import { coversPeriod, downloadFile, periodLabel, toCsv } from "@/lib/schedule-utils";
import type { ScheduledClass } from "@/types";

export const Route = createFileRoute("/admin/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable — ClassSync" },
      { name: "description", content: "View, edit, export and publish the generated timetable." },
      { property: "og:title", content: "Timetable — ClassSync" },
      { property: "og:description", content: "Weekly institutional timetable grid." },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const store = useStore();
  const { timetable, sections, subjects, faculty, rooms, settings, schedulerInput } = store;
  const [view, setView] = useState<"section" | "day">("section");
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? "");
  const [day, setDay] = useState(settings.workingDays[0] ?? "Mon");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [editing, setEditing] = useState<ScheduledClass | null>(null);

  const classes = useMemo(() => {
    let list = timetable?.classes ?? [];
    if (facultyFilter !== "all") list = list.filter((c) => c.facultyId === facultyFilter);
    if (roomFilter !== "all") list = list.filter((c) => c.roomId === roomFilter);
    return list;
  }, [timetable, facultyFilter, roomFilter]);

  const conflicts = useMemo(
    () => (timetable ? detectConflicts(timetable.classes, schedulerInput) : []),
    [timetable, schedulerInput],
  );

  const alternatives = useMemo(
    () =>
      editing && timetable
        ? findAlternativeSlots(editing, timetable.classes, schedulerInput, { limit: 8 })
        : [],
    [editing, timetable, schedulerInput],
  );

  if (!timetable) {
    return (
      <DashboardShell role="admin" title="Timetable">
        <EmptyState
          title="No timetable generated yet"
          description="Run the Smart Scheduler to build a conflict-free weekly timetable for every section."
          action={
            <Link to="/admin/scheduler">
              <Button>Open Smart Scheduler</Button>
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  const columns =
    view === "section"
      ? settings.workingDays.map((d) => ({ id: d, label: d }))
      : sections.map((s) => ({ id: s.id, label: s.name }));

  const getClasses = (columnId: string, period: number) =>
    classes.filter((c) => {
      if (!coversPeriod(c, period)) return false;
      return view === "section"
        ? c.day === columnId && c.sectionId === sectionId
        : c.day === day && c.sectionId === columnId;
    });

  const regenerate = () => {
    const tt = generateSchedule(schedulerInput, 8);
    store.setTimetable(tt);
    store.logActivity(`Timetable regenerated · score ${tt.score.total}%`);
    toast.success(`Regenerated. Efficiency score ${tt.score.total}%.`);
  };

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ["Day", "Period", "Time", "Section", "Subject", "Faculty", "Room"],
    ];
    for (const c of timetable.classes) {
      rows.push([
        c.day,
        c.period + 1,
        periodLabel(settings, c.period),
        sections.find((s) => s.id === c.sectionId)?.name ?? "",
        subjects.find((s) => s.id === c.subjectId)?.name ?? "",
        faculty.find((f) => f.id === c.facultyId)?.name ?? "",
        rooms.find((r) => r.id === c.roomId)?.number ?? "",
      ]);
    }
    downloadFile("timetable.csv", toCsv(rows), "text/csv;charset=utf-8");
    toast.success("Timetable exported to Excel/CSV.");
  };

  const applyMove = (alt: { day: string; period: number; roomId: string }) => {
    if (!editing) return;
    const updated = timetable.classes.map((c) =>
      c.id === editing.id
        ? { ...c, day: alt.day as ScheduledClass["day"], period: alt.period, roomId: alt.roomId }
        : c,
    );
    store.updateClasses(updated);
    store.logActivity(
      `Class moved manually to ${alt.day} ${periodLabel(settings, alt.period)}`,
    );
    setEditing(null);
    toast.success("Class moved successfully.");
  };

  return (
    <DashboardShell
      role="admin"
      title="Timetable"
      description={`Generated ${new Date(timetable.generatedAt).toLocaleString()} · score ${timetable.score.total}%`}
      actions={
        timetable.published ? (
          <StatusBadge tone="ok">Published</StatusBadge>
        ) : (
          <StatusBadge tone="warn">Draft</StatusBadge>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={view} onValueChange={(v) => setView(v as "section" | "day")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="section">Section view (week)</SelectItem>
            <SelectItem value="day">Day view (all sections)</SelectItem>
          </SelectContent>
        </Select>

        {view === "section" ? (
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={day} onValueChange={(v) => setDay(v as typeof day)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settings.workingDays.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All faculty</SelectItem>
            {faculty.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground">
          {conflicts.length === 0 ? "0 hard conflicts" : `${conflicts.length} conflicts`}
        </span>
      </div>

      <TimetableGrid columns={columns} getClasses={getClasses} onCellClick={(c) => setEditing(c)} />

      <p className="mt-2 text-xs text-muted-foreground">
        Tip: click any class to open the manual editor and move it to another conflict-free slot.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            store.setTimetable({ ...timetable });
            store.logActivity("Timetable saved");
            toast.success("Timetable saved.");
          }}
        >
          <Save className="size-4" /> Save Timetable
        </Button>
        <Button variant="outline" onClick={regenerate}>
          <RefreshCcw className="size-4" /> Regenerate
        </Button>
        <Button variant="outline" onClick={() => toast.info("Click any class cell to edit it.")}>
          <Pencil className="size-4" /> Edit
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="size-4" /> Export PDF
        </Button>
        <Button variant="outline" onClick={exportCsv}>
          <FileSpreadsheet className="size-4" /> Export Excel
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            store.setTimetable({ ...timetable, published: true });
            store.notify({
              role: "faculty",
              title: "Timetable published",
              message: "The new weekly timetable is now available.",
              link: "/faculty/timetable",
            });
            store.notify({
              role: "student",
              title: "Timetable published",
              message: "Your class schedule has been updated.",
              link: "/student/timetable",
            });
            store.logActivity("Timetable published to faculty and students");
            toast.success("Timetable published to faculty and students.");
          }}
        >
          <Send className="size-4" /> Publish
        </Button>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Move class</DialogTitle>
            <DialogDescription>
              {editing
                ? `${subjects.find((s) => s.id === editing.subjectId)?.name} · ${
                    sections.find((s) => s.id === editing.sectionId)?.name
                  } · currently ${editing.day} ${periodLabel(settings, editing.period)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {alternatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No conflict-free alternative slot is available for this class.
              </p>
            ) : (
              alternatives.map((alt) => (
                <div
                  key={`${alt.day}-${alt.period}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {alt.day} · {periodLabel(settings, alt.period)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Room {rooms.find((r) => r.id === alt.roomId)?.number} · conflict free
                    </p>
                  </div>
                  <Button size="sm" onClick={() => applyMove(alt)}>
                    Move here
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
